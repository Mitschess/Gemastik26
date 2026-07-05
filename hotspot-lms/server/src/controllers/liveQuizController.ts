import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
    LiveQuiz,
    LiveQuizSessionQuestion,
    createLiveQuiz,
    createLiveQuizQuestion,
    LIVE_QUIZ_COUNTDOWN_SEC
} from '../models/liveQuiz';
import { createLiveQuizParticipant, LiveQuizParticipant } from '../models/liveQuizParticipants';
import { liveQuizStorage } from '../services/liveQuizStorage';
import { storageService } from '../services/storage';

// ---------- helpers ----------

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function secondsSince(iso: string | null): number {
    if (!iso) return Infinity;
    return (Date.now() - new Date(iso).getTime()) / 1000;
}

/**
 * Menghitung ulang final ranking peserta: benar terbanyak menang,
 * kalau seri dilihat dari total waktu jawaban yang benar (lebih cepat menang).
 * Nilai ini (rankingScore) TIDAK PERNAH ditampilkan sebagai "poin" ke murid.
 */
function computeRankingScore(p: LiveQuizParticipant): number {
    const totalCorrectTimeMs = p.answers
        .filter(a => a.correct)
        .reduce((sum, a) => sum + a.timeTakenMs, 0);
    // correctCount mendominasi ranking, waktu jadi tie-breaker (semakin kecil semakin baik)
    return p.correctCount * 10_000_000 - totalCorrectTimeMs;
}

function rankParticipants(participants: LiveQuizParticipant[]): LiveQuizParticipant[] {
    return [...participants].sort((a, b) => b.rankingScore - a.rankingScore);
}

/**
 * Inti dari flow live quiz: dipanggil di awal setiap endpoint yang butuh state
 * terkini (get detail, get progress, submit jawaban, dst). Karena backend ini
 * tanpa websocket/timer background, transisi status (countdown -> active,
 * active -> finished) dilakukan "lazy": dihitung dari selisih waktu setiap
 * kali ada request masuk. Client tinggal polling.
 *
 * Progres per-soal sendiri TIDAK lagi disinkronkan lewat quiz (lihat
 * tickParticipant): begitu quiz aktif, tiap murid maju sendiri-sendiri
 * begitu menjawab, tanpa menunggu murid lain / waktu global habis.
 * timePerQuestionSec tetap dipakai sebagai batas maksimum per soal per murid.
 */
async function tickQuizState(quiz: LiveQuiz): Promise<LiveQuiz> {
    let changed = false;
    const patch: Partial<LiveQuiz> = {};

    if (quiz.status === 'countdown') {
        if (secondsSince(quiz.countdownStartedAt) >= LIVE_QUIZ_COUNTDOWN_SEC) {
            patch.status = 'active';
            changed = true;
        }
    }

    let updated = quiz;
    if (changed) {
        updated = (await liveQuizStorage.updateLiveQuiz(quiz.id, patch)) ?? quiz;
    }

    if (updated.status === 'active') {
        updated = await checkAllParticipantsFinished(updated);
    }

    return updated;
}

// Begitu murid menjawab semua soal (atau kena timeout di semua soal), tandai selesai.
// Kalau SEMUA murid yang join sudah selesai, quiz otomatis ditutup jadi 'finished'
// supaya guru bisa langsung lihat hasil akhir tanpa perlu tombol manual.
async function checkAllParticipantsFinished(quiz: LiveQuiz): Promise<LiveQuiz> {
    const participants = await liveQuizStorage.getParticipantsByQuiz(quiz.id);
    if (participants.length === 0) return quiz;
    const allFinished = participants.every(p => p.finished);
    if (!allFinished) return quiz;
    const updated = await liveQuizStorage.updateLiveQuiz(quiz.id, {
        status: 'finished',
        finishedAt: new Date().toISOString()
    });
    return updated ?? quiz;
}

/**
 * Menghitung progres SATU murid secara lazy: kalau waktu untuk soal yang
 * sedang dia kerjakan sudah lewat timePerQuestionSec dan dia belum jawab,
 * anggap dia timeout (jawaban kosong, salah) lalu majukan ke soal berikutnya.
 * Diulang (while) untuk menutup beberapa soal sekaligus kalau murid lama
 * tidak polling. Begitu murid sendiri submit jawaban, dia langsung dimajukan
 * di submitAnswer() tanpa menunggu fungsi ini.
 */
async function tickParticipant(quiz: LiveQuiz, participant: LiveQuizParticipant): Promise<LiveQuizParticipant> {
    if (quiz.status !== 'active' || participant.finished) return participant;

    const total = quiz.sessionQuestions.length;
    const perQ = quiz.settings.timePerQuestionSec;
    let p = participant;
    let changed = false;

    if (p.qIndex < 0) {
        p = { ...p, qIndex: 0, qStartedAt: new Date().toISOString() };
        changed = true;
    }

    while (p.qIndex < total && secondsSince(p.qStartedAt) >= perQ) {
        const q = quiz.sessionQuestions[p.qIndex];
        const alreadyAnswered = p.answers.some(a => a.questionId === q.questionId);
        let answers = p.answers;
        let correctCount = p.correctCount;
        let wrongCount = p.wrongCount;
        if (!alreadyAnswered) {
            answers = [...answers, {
                questionId: q.questionId,
                choiceIndex: null,
                correct: false,
                timeTakenMs: Math.round(perQ * 1000),
                answeredAt: new Date().toISOString()
            }];
            wrongCount += 1;
        }
        p = { ...p, answers, correctCount, wrongCount, qIndex: p.qIndex + 1, qStartedAt: new Date().toISOString() };
        changed = true;
    }

    if (p.qIndex >= total && !p.finished) {
        p = { ...p, finished: true, finishedAt: new Date().toISOString() };
        p.rankingScore = computeRankingScore(p);
        changed = true;
    }

    if (!changed) return participant;
    const saved = await liveQuizStorage.updateParticipant(participant.id, p);
    return saved ?? p;
}

// Sembunyikan correctIndex & isi soal dari murid: konten soal murid sekarang
// dikirim lewat endpoint /progress (per-partisipan, self-paced), bukan dari sini.
function serializeQuizForRole(quiz: LiveQuiz, role: 'teacher' | 'student') {
    if (role === 'teacher' || quiz.status === 'finished') {
        return quiz;
    }
    const { sessionQuestions, ...rest } = quiz;
    const safeSessionQuestions = sessionQuestions.map(q => ({ questionId: q.questionId, prompt: null, choices: [] }));
    return { ...rest, sessionQuestions: safeSessionQuestions };
}

export class LiveQuizController {
    // ---------- SETUP (draft) ----------

    async create(req: Request, res: Response) {
        const { teacherId, teacherName, title, visibility } = req.body;
        if (!teacherId || !title) {
            return res.status(400).json({ error: 'teacherId dan title wajib diisi' });
        }
        if (visibility !== undefined && visibility !== 'public' && visibility !== 'private') {
            return res.status(400).json({ error: 'visibility harus public atau private' });
        }
        const quiz = createLiveQuiz({ teacherId, teacherName, title, visibility });
        await liveQuizStorage.saveLiveQuiz(quiz);
        res.status(201).json(quiz);
    }

    async addQuestion(req: Request, res: Response) {
        const quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        if (quiz.status !== 'draft') {
            return res.status(400).json({ error: 'Soal hanya bisa ditambah saat quiz masih draft' });
        }

        const { prompt, choices, correctIndex, points } = req.body;
        if (!prompt || !Array.isArray(choices) || choices.length < 2) {
            return res.status(400).json({ error: 'prompt dan minimal 2 choices wajib diisi' });
        }
        if (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex >= choices.length) {
            return res.status(400).json({ error: 'correctIndex tidak valid' });
        }

        const question = createLiveQuizQuestion({ prompt, choices, correctIndex, points });
        const updated = await liveQuizStorage.updateLiveQuiz(quiz.id, {
            questions: [...quiz.questions, question]
        });
        res.status(201).json(updated);
    }

    // Guru multi-select soal dari bank soal. Hanya tipe 'mcq' yang diterima,
    // sisanya (misal essay) otomatis difilter di server sebagai lapis aman kedua
    // (client juga harus filter, tapi validasi tetap dilakukan di sini).
    async addQuestionsFromBank(req: Request, res: Response) {
        const quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        if (quiz.status !== 'draft') {
            return res.status(400).json({ error: 'Soal hanya bisa ditambah saat quiz masih draft' });
        }

        const { bankIds } = req.body as { bankIds: string[] };
        if (!Array.isArray(bankIds) || bankIds.length === 0) {
            return res.status(400).json({ error: 'bankIds wajib diisi (array)' });
        }

        const bankItems = await storageService.getAllQuestionBankItems();
        const selected = bankItems.filter((item: any) => bankIds.includes(item.id) && item.type === 'mcq');

        if (selected.length === 0) {
            return res.status(400).json({ error: 'Tidak ada soal pilihan ganda valid yang cocok dengan bankIds' });
        }

        const newQuestions = selected.map((item: any) => {
            const correctIndex = Math.max(0, (item.choices || []).indexOf(item.answer));
            return createLiveQuizQuestion({
                prompt: item.prompt,
                choices: item.choices || [],
                correctIndex,
                points: item.points,
                sourceQuestionBankId: item.id
            });
        });

        const updated = await liveQuizStorage.updateLiveQuiz(quiz.id, {
            questions: [...quiz.questions, ...newQuestions]
        });
        res.status(201).json(updated);
    }

    async updateQuestion(req: Request, res: Response) {
        const quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        if (quiz.status !== 'draft') {
            return res.status(400).json({ error: 'Soal hanya bisa diedit saat quiz masih draft' });
        }

        const idx = quiz.questions.findIndex(q => q.id === req.params.qId);
        if (idx === -1) return res.status(404).json({ error: 'Soal tidak ditemukan' });

        const { prompt, choices, correctIndex, points } = req.body;
        if (prompt !== undefined && !prompt) {
            return res.status(400).json({ error: 'Pertanyaan wajib diisi' });
        }
        if (choices !== undefined && (!Array.isArray(choices) || choices.length < 2)) {
            return res.status(400).json({ error: 'Minimal 2 choices wajib diisi' });
        }
        const effectiveChoices = choices ?? quiz.questions[idx].choices;
        if (correctIndex !== undefined && (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex >= effectiveChoices.length)) {
            return res.status(400).json({ error: 'correctIndex tidak valid' });
        }

        const questions = [...quiz.questions];
        questions[idx] = {
            ...questions[idx],
            ...(prompt !== undefined ? { prompt } : {}),
            ...(choices !== undefined ? { choices } : {}),
            ...(correctIndex !== undefined ? { correctIndex } : {}),
            ...(points !== undefined ? { points } : {}),
            id: questions[idx].id
        };
        const updated = await liveQuizStorage.updateLiveQuiz(quiz.id, { questions });
        res.json(updated);
    }

    async removeQuestion(req: Request, res: Response) {
        const quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        if (quiz.status !== 'draft') {
            return res.status(400).json({ error: 'Soal hanya bisa dihapus saat quiz masih draft' });
        }
        const questions = quiz.questions.filter(q => q.id !== req.params.qId);
        const updated = await liveQuizStorage.updateLiveQuiz(quiz.id, { questions });
        res.json(updated);
    }

    async updateSettings(req: Request, res: Response) {
        const quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        // Diizinkan saat draft (sedang menyusun soal) maupun waiting (di waiting room,
        // sesuai flow: guru atur waktu/acak setelah klik "Selesai" & sebelum "Mulai Quiz").
        if (quiz.status !== 'draft' && quiz.status !== 'waiting') {
            return res.status(400).json({ error: 'Setting hanya bisa diubah sebelum quiz dimulai' });
        }

        const { timePerQuestionSec, shuffleAnswers, shuffleQuestionOrder, visibility } = req.body;
        if (visibility !== undefined && visibility !== 'public' && visibility !== 'private') {
            return res.status(400).json({ error: 'visibility harus public atau private' });
        }
        const updated = await liveQuizStorage.updateLiveQuiz(quiz.id, {
            visibility: visibility ?? quiz.visibility,
            settings: {
                timePerQuestionSec: timePerQuestionSec ?? quiz.settings.timePerQuestionSec,
                shuffleAnswers: shuffleAnswers ?? quiz.settings.shuffleAnswers,
                shuffleQuestionOrder: shuffleQuestionOrder ?? quiz.settings.shuffleQuestionOrder
            }
        });
        res.json(updated);
    }

    // Tombol "Selesai" di pojok kanan bawah -> draft jadi waiting,
    // langsung muncul sebagai card di navbar Live Quiz murid.
    async finishSetup(req: Request, res: Response) {
        const quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        if (quiz.status !== 'draft') {
            return res.status(400).json({ error: 'Quiz sudah tidak dalam status draft' });
        }
        if (quiz.questions.length === 0) {
            return res.status(400).json({ error: 'Tambahkan minimal 1 soal sebelum menyelesaikan setup' });
        }
        const updated = await liveQuizStorage.updateLiveQuiz(quiz.id, { status: 'waiting' });
        res.json(updated);
    }

    // ---------- LIST / DETAIL ----------

    // ?teacherId=...   -> semua quiz milik guru (termasuk draft, untuk dashboard guru)
    // ?availableToJoin=true -> hanya status 'waiting' (untuk card di navbar murid)
    // ?history=true&teacherId=... -> hanya status 'finished' milik guru tsb
    async list(req: Request, res: Response) {
        const { teacherId, availableToJoin, history } = req.query;
        let list = await liveQuizStorage.getAllLiveQuizzes();

        if (availableToJoin === 'true') {
            // Quiz private disembunyikan dari daftar murid: hanya bisa diikuti lewat kode (join-by-code)
            list = list.filter(q => q.status === 'waiting' && q.visibility === 'public');
        } else if (history === 'true') {
            list = list.filter(q => q.status === 'finished' && (!teacherId || q.teacherId === teacherId));
        } else if (teacherId) {
            list = list.filter(q => q.teacherId === teacherId);
        }

        // list ringkas saja (tanpa bocorkan correctIndex ke siapapun di endpoint list)
        const summary = list.map(q => ({
            id: q.id,
            title: q.title,
            teacherId: q.teacherId,
            teacherName: q.teacherName,
            status: q.status,
            visibility: q.visibility,
            totalQuestions: q.questions.length,
            createdAt: q.createdAt,
            startedAt: q.startedAt,
            finishedAt: q.finishedAt
        }));
        res.json(summary);
    }

    async getOne(req: Request, res: Response) {
        let quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        quiz = await tickQuizState(quiz);

        const role = req.query.role === 'teacher' ? 'teacher' : 'student';
        res.json(serializeQuizForRole(quiz, role));
    }

    async remove(req: Request, res: Response) {
        const quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        await liveQuizStorage.deleteLiveQuiz(quiz.id);
        res.json({ message: 'deleted' });
    }

    // ---------- WAITING ROOM ----------

    async join(req: Request, res: Response) {
        let quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        if (quiz.status !== 'waiting') {
            return res.status(400).json({ error: 'Quiz tidak lagi menerima peserta baru' });
        }

        const { studentId, studentName } = req.body;
        if (!studentId || !studentName) {
            return res.status(400).json({ error: 'studentId dan studentName wajib diisi' });
        }

        const existing = await liveQuizStorage.getParticipant(quiz.id, studentId);
        if (existing) return res.json(existing);

        const participant = createLiveQuizParticipant({
            liveQuizId: quiz.id,
            studentId,
            studentName
        });
        await liveQuizStorage.saveParticipant(participant);
        res.status(201).json(participant);
    }

    // Join via kode singkat (dipakai dari dashboard murid, tanpa perlu buka daftar live quiz)
    async joinByCode(req: Request, res: Response) {
        const { code, studentId, studentName } = req.body;
        if (!code || !studentId || !studentName) {
            return res.status(400).json({ error: 'code, studentId, dan studentName wajib diisi' });
        }

        const quiz = await liveQuizStorage.getLiveQuizByCode(code);
        if (!quiz) return res.status(404).json({ error: 'Kode live quiz tidak ditemukan' });
        if (quiz.status !== 'waiting') {
            return res.status(400).json({ error: 'Quiz tidak lagi menerima peserta baru' });
        }

        const existing = await liveQuizStorage.getParticipant(quiz.id, studentId);
        if (existing) return res.json({ liveQuizId: quiz.id, participant: existing });

        const participant = createLiveQuizParticipant({
            liveQuizId: quiz.id,
            studentId,
            studentName
        });
        await liveQuizStorage.saveParticipant(participant);
        res.status(201).json({ liveQuizId: quiz.id, participant });
    }

    // Dipakai baik di waiting room murid maupun dashboard guru
    async listParticipants(req: Request, res: Response) {
        const quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });

        const participants = await liveQuizStorage.getParticipantsByQuiz(quiz.id);
        res.json(participants.map(p => ({
            id: p.id,
            studentId: p.studentId,
            studentName: p.studentName,
            joinedAt: p.joinedAt
        })));
    }

    // ---------- START / COUNTDOWN ----------

    async start(req: Request, res: Response) {
        const quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        if (quiz.status !== 'waiting') {
            return res.status(400).json({ error: 'Quiz hanya bisa dimulai dari status waiting' });
        }

        const order = quiz.settings.shuffleQuestionOrder ? shuffle(quiz.questions) : quiz.questions;

        const sessionQuestions: LiveQuizSessionQuestion[] = order.map(q => {
            let choices = [...q.choices];
            let correctIndex = q.correctIndex;
            if (quiz.settings.shuffleAnswers) {
                const idxMap = shuffle(choices.map((_, i) => i));
                choices = idxMap.map(i => q.choices[i]);
                correctIndex = idxMap.indexOf(q.correctIndex);
            }
            return { questionId: q.id, prompt: q.prompt, choices, correctIndex };
        });

        const updated = await liveQuizStorage.updateLiveQuiz(quiz.id, {
            status: 'countdown',
            sessionQuestions,
            countdownStartedAt: new Date().toISOString(),
            startedAt: new Date().toISOString()
        });
        res.json(updated);
    }

    // ---------- GAMEPLAY ----------

    async submitAnswer(req: Request, res: Response) {
        let quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        quiz = await tickQuizState(quiz);

        if (quiz.status !== 'active') {
            return res.status(400).json({ error: 'Quiz tidak sedang berjalan' });
        }

        const { studentId, questionId, choiceIndex } = req.body;
        let participant = await liveQuizStorage.getParticipant(quiz.id, studentId);
        if (!participant) return res.status(404).json({ error: 'Peserta tidak ditemukan / belum join' });

        // Tutup dulu soal-soal yang sudah kena timeout sebelum request ini masuk
        participant = await tickParticipant(quiz, participant);
        if (participant.finished) {
            return res.status(400).json({ error: 'Kamu sudah menyelesaikan semua soal' });
        }

        const currentQ = quiz.sessionQuestions[participant.qIndex];
        if (!currentQ || currentQ.questionId !== questionId) {
            return res.status(400).json({ error: 'Soal ini bukan soal yang sedang kamu kerjakan' });
        }
        if (participant.answers.some(a => a.questionId === questionId)) {
            return res.status(400).json({ error: 'Kamu sudah menjawab soal ini' });
        }

        const timeTakenMs = Date.now() - new Date(participant.qStartedAt!).getTime();
        const correct = choiceIndex === currentQ.correctIndex;

        const answers = [...participant.answers, {
            questionId,
            choiceIndex: typeof choiceIndex === 'number' ? choiceIndex : null,
            correct,
            timeTakenMs,
            answeredAt: new Date().toISOString()
        }];

        // Begitu dijawab, LANGSUNG majukan murid ini ke soal berikutnya tanpa
        // menunggu waktu habis. timePerQuestionSec cuma berlaku sebagai batas
        // maksimum kalau murid tidak menjawab (ditangani tickParticipant).
        const nextIndex = participant.qIndex + 1;
        const isLastQuestion = nextIndex >= quiz.sessionQuestions.length;

        const patch: Partial<LiveQuizParticipant> = {
            answers,
            correctCount: participant.correctCount + (correct ? 1 : 0),
            wrongCount: participant.wrongCount + (correct ? 0 : 1),
            qIndex: nextIndex,
            qStartedAt: isLastQuestion ? participant.qStartedAt : new Date().toISOString(),
            finished: isLastQuestion,
            finishedAt: isLastQuestion ? new Date().toISOString() : null
        };
        patch.rankingScore = computeRankingScore({ ...participant, ...patch } as LiveQuizParticipant);

        await liveQuizStorage.updateParticipant(participant.id, patch);
        if (isLastQuestion) {
            await checkAllParticipantsFinished(quiz);
        }

        // Tidak mengirim angka poin, hanya status benar/salah untuk feedback instan ke murid
        res.json({ correct, finished: isLastQuestion });
    }

    // Dashboard guru: progress real-time semua murid + highlight top 3.
    // Kalau query ?studentId=... disertakan, response juga berisi soal yang
    // SEDANG dikerjakan murid tsb (self-paced, tidak sinkron dengan murid lain).
    // "Poin" tidak pernah dikirim, hanya correctCount/wrongCount/progressPercent.
    async progress(req: Request, res: Response) {
        let quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        quiz = await tickQuizState(quiz);

        const participants = await liveQuizStorage.getParticipantsByQuiz(quiz.id);
        const ranked = rankParticipants(participants);
        const totalQuestions = quiz.sessionQuestions.length || quiz.questions.length;

        const timeLeftSec = quiz.status === 'countdown'
            ? Math.max(0, Math.round(LIVE_QUIZ_COUNTDOWN_SEC - secondsSince(quiz.countdownStartedAt)))
            : 0;

        const response: any = {
            status: quiz.status,
            totalQuestions,
            timeLeftSec,
            studentsFinishedCount: participants.filter(p => p.finished).length,
            studentsTotal: participants.length,
            students: ranked.map((p, idx) => ({
                studentId: p.studentId,
                studentName: p.studentName,
                correctCount: p.correctCount,
                wrongCount: p.wrongCount,
                progressPercent: totalQuestions === 0 ? 0 : Math.round((p.answers.length / totalQuestions) * 100),
                finished: p.finished,
                isTopThree: idx < 3 && (p.correctCount > 0 || p.wrongCount > 0)
            }))
        };

        const studentId = req.query.studentId as string | undefined;
        if (studentId && quiz.status === 'active') {
            let participant = await liveQuizStorage.getParticipant(quiz.id, studentId);
            if (participant) {
                participant = await tickParticipant(quiz, participant);
                if (participant.finished) {
                    response.myQuestion = null;
                    response.myFinished = true;
                } else {
                    const q = quiz.sessionQuestions[participant.qIndex];
                    const perQ = quiz.settings.timePerQuestionSec;
                    response.myFinished = false;
                    response.myQuestion = {
                        questionId: q.questionId,
                        prompt: q.prompt,
                        choices: q.choices,
                        index: participant.qIndex,
                        timeLeftSec: Math.max(0, Math.round(perQ - secondsSince(participant.qStartedAt)))
                    };
                }
            }
        }

        res.json(response);
    }

    // ---------- HASIL AKHIR & REVIEW ----------

    async results(req: Request, res: Response) {
        let quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
        quiz = await tickQuizState(quiz);

        if (quiz.status !== 'finished') {
            return res.status(400).json({ error: 'Quiz belum selesai' });
        }

        const participants = await liveQuizStorage.getParticipantsByQuiz(quiz.id);
        const ranked = rankParticipants(participants);

        res.json({
            title: quiz.title,
            finishedAt: quiz.finishedAt,
            leaderboard: ranked.map((p, idx) => ({
                rank: idx + 1,
                studentId: p.studentId,
                studentName: p.studentName,
                correctCount: p.correctCount,
                wrongCount: p.wrongCount,
                isTopThree: idx < 3
            }))
        });
    }

    // Review per-soal untuk 1 murid: soal, pilihan dia, dan jawaban benar
    async review(req: Request, res: Response) {
        const quiz = await liveQuizStorage.getLiveQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Live quiz tidak ditemukan' });

        const participant = await liveQuizStorage.getParticipant(quiz.id, req.params.studentId);
        if (!participant) return res.status(404).json({ error: 'Peserta tidak ditemukan' });

        const review = quiz.sessionQuestions.map(sq => {
            const log = participant.answers.find(a => a.questionId === sq.questionId);
            return {
                prompt: sq.prompt,
                choices: sq.choices,
                correctIndex: sq.correctIndex,
                studentChoiceIndex: log?.choiceIndex ?? null,
                correct: log?.correct ?? false
            };
        });

        res.json({ studentName: participant.studentName, review });
    }
}