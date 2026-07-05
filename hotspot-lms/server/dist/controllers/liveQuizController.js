"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveQuizController = void 0;
const liveQuiz_1 = require("../models/liveQuiz");
const liveQuizParticipants_1 = require("../models/liveQuizParticipants");
const liveQuizStorage_1 = require("../services/liveQuizStorage");
const storage_1 = require("../services/storage");
// ---------- helpers ----------
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function secondsSince(iso) {
    if (!iso)
        return Infinity;
    return (Date.now() - new Date(iso).getTime()) / 1000;
}
/**
 * Menghitung ulang final ranking peserta: benar terbanyak menang,
 * kalau seri dilihat dari total waktu jawaban yang benar (lebih cepat menang).
 * Nilai ini (rankingScore) TIDAK PERNAH ditampilkan sebagai "poin" ke murid.
 */
function computeRankingScore(p) {
    const totalCorrectTimeMs = p.answers
        .filter(a => a.correct)
        .reduce((sum, a) => sum + a.timeTakenMs, 0);
    // correctCount mendominasi ranking, waktu jadi tie-breaker (semakin kecil semakin baik)
    return p.correctCount * 10000000 - totalCorrectTimeMs;
}
function rankParticipants(participants) {
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
function tickQuizState(quiz) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let changed = false;
        const patch = {};
        if (quiz.status === 'countdown') {
            if (secondsSince(quiz.countdownStartedAt) >= liveQuiz_1.LIVE_QUIZ_COUNTDOWN_SEC) {
                patch.status = 'active';
                changed = true;
            }
        }
        let updated = quiz;
        if (changed) {
            updated = (_a = (yield liveQuizStorage_1.liveQuizStorage.updateLiveQuiz(quiz.id, patch))) !== null && _a !== void 0 ? _a : quiz;
        }
        if (updated.status === 'active') {
            updated = yield checkAllParticipantsFinished(updated);
        }
        return updated;
    });
}
// Begitu murid menjawab semua soal (atau kena timeout di semua soal), tandai selesai.
// Kalau SEMUA murid yang join sudah selesai, quiz otomatis ditutup jadi 'finished'
// supaya guru bisa langsung lihat hasil akhir tanpa perlu tombol manual.
function checkAllParticipantsFinished(quiz) {
    return __awaiter(this, void 0, void 0, function* () {
        const participants = yield liveQuizStorage_1.liveQuizStorage.getParticipantsByQuiz(quiz.id);
        if (participants.length === 0)
            return quiz;
        const allFinished = participants.every(p => p.finished);
        if (!allFinished)
            return quiz;
        const updated = yield liveQuizStorage_1.liveQuizStorage.updateLiveQuiz(quiz.id, {
            status: 'finished',
            finishedAt: new Date().toISOString()
        });
        return updated !== null && updated !== void 0 ? updated : quiz;
    });
}
/**
 * Menghitung progres SATU murid secara lazy: kalau waktu untuk soal yang
 * sedang dia kerjakan sudah lewat timePerQuestionSec dan dia belum jawab,
 * anggap dia timeout (jawaban kosong, salah) lalu majukan ke soal berikutnya.
 * Diulang (while) untuk menutup beberapa soal sekaligus kalau murid lama
 * tidak polling. Begitu murid sendiri submit jawaban, dia langsung dimajukan
 * di submitAnswer() tanpa menunggu fungsi ini.
 */
function tickParticipant(quiz, participant) {
    return __awaiter(this, void 0, void 0, function* () {
        if (quiz.status !== 'active' || participant.finished)
            return participant;
        const total = quiz.sessionQuestions.length;
        const perQ = quiz.settings.timePerQuestionSec;
        let p = participant;
        let changed = false;
        if (p.qIndex < 0) {
            p = Object.assign(Object.assign({}, p), { qIndex: 0, qStartedAt: new Date().toISOString() });
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
            p = Object.assign(Object.assign({}, p), { answers, correctCount, wrongCount, qIndex: p.qIndex + 1, qStartedAt: new Date().toISOString() });
            changed = true;
        }
        if (p.qIndex >= total && !p.finished) {
            p = Object.assign(Object.assign({}, p), { finished: true, finishedAt: new Date().toISOString() });
            p.rankingScore = computeRankingScore(p);
            changed = true;
        }
        if (!changed)
            return participant;
        const saved = yield liveQuizStorage_1.liveQuizStorage.updateParticipant(participant.id, p);
        return saved !== null && saved !== void 0 ? saved : p;
    });
}
// Sembunyikan correctIndex & isi soal dari murid: konten soal murid sekarang
// dikirim lewat endpoint /progress (per-partisipan, self-paced), bukan dari sini.
function serializeQuizForRole(quiz, role) {
    if (role === 'teacher' || quiz.status === 'finished') {
        return quiz;
    }
    const { sessionQuestions } = quiz, rest = __rest(quiz, ["sessionQuestions"]);
    const safeSessionQuestions = sessionQuestions.map(q => ({ questionId: q.questionId, prompt: null, choices: [] }));
    return Object.assign(Object.assign({}, rest), { sessionQuestions: safeSessionQuestions });
}
class LiveQuizController {
    // ---------- SETUP (draft) ----------
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { teacherId, teacherName, title, visibility } = req.body;
            if (!teacherId || !title) {
                return res.status(400).json({ error: 'teacherId dan title wajib diisi' });
            }
            if (visibility !== undefined && visibility !== 'public' && visibility !== 'private') {
                return res.status(400).json({ error: 'visibility harus public atau private' });
            }
            const quiz = (0, liveQuiz_1.createLiveQuiz)({ teacherId, teacherName, title, visibility });
            yield liveQuizStorage_1.liveQuizStorage.saveLiveQuiz(quiz);
            res.status(201).json(quiz);
        });
    }
    addQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
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
            const question = (0, liveQuiz_1.createLiveQuizQuestion)({ prompt, choices, correctIndex, points });
            const updated = yield liveQuizStorage_1.liveQuizStorage.updateLiveQuiz(quiz.id, {
                questions: [...quiz.questions, question]
            });
            res.status(201).json(updated);
        });
    }
    // Guru multi-select soal dari bank soal. Hanya tipe 'mcq' yang diterima,
    // sisanya (misal essay) otomatis difilter di server sebagai lapis aman kedua
    // (client juga harus filter, tapi validasi tetap dilakukan di sini).
    addQuestionsFromBank(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            if (quiz.status !== 'draft') {
                return res.status(400).json({ error: 'Soal hanya bisa ditambah saat quiz masih draft' });
            }
            const { bankIds } = req.body;
            if (!Array.isArray(bankIds) || bankIds.length === 0) {
                return res.status(400).json({ error: 'bankIds wajib diisi (array)' });
            }
            const bankItems = yield storage_1.storageService.getAllQuestionBankItems();
            const selected = bankItems.filter((item) => bankIds.includes(item.id) && item.type === 'mcq');
            if (selected.length === 0) {
                return res.status(400).json({ error: 'Tidak ada soal pilihan ganda valid yang cocok dengan bankIds' });
            }
            const newQuestions = selected.map((item) => {
                const correctIndex = Math.max(0, (item.choices || []).indexOf(item.answer));
                return (0, liveQuiz_1.createLiveQuizQuestion)({
                    prompt: item.prompt,
                    choices: item.choices || [],
                    correctIndex,
                    points: item.points,
                    sourceQuestionBankId: item.id
                });
            });
            const updated = yield liveQuizStorage_1.liveQuizStorage.updateLiveQuiz(quiz.id, {
                questions: [...quiz.questions, ...newQuestions]
            });
            res.status(201).json(updated);
        });
    }
    updateQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            if (quiz.status !== 'draft') {
                return res.status(400).json({ error: 'Soal hanya bisa diedit saat quiz masih draft' });
            }
            const idx = quiz.questions.findIndex(q => q.id === req.params.qId);
            if (idx === -1)
                return res.status(404).json({ error: 'Soal tidak ditemukan' });
            const { prompt, choices, correctIndex, points } = req.body;
            if (prompt !== undefined && !prompt) {
                return res.status(400).json({ error: 'Pertanyaan wajib diisi' });
            }
            if (choices !== undefined && (!Array.isArray(choices) || choices.length < 2)) {
                return res.status(400).json({ error: 'Minimal 2 choices wajib diisi' });
            }
            const effectiveChoices = choices !== null && choices !== void 0 ? choices : quiz.questions[idx].choices;
            if (correctIndex !== undefined && (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex >= effectiveChoices.length)) {
                return res.status(400).json({ error: 'correctIndex tidak valid' });
            }
            const questions = [...quiz.questions];
            questions[idx] = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, questions[idx]), (prompt !== undefined ? { prompt } : {})), (choices !== undefined ? { choices } : {})), (correctIndex !== undefined ? { correctIndex } : {})), (points !== undefined ? { points } : {})), { id: questions[idx].id });
            const updated = yield liveQuizStorage_1.liveQuizStorage.updateLiveQuiz(quiz.id, { questions });
            res.json(updated);
        });
    }
    removeQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            if (quiz.status !== 'draft') {
                return res.status(400).json({ error: 'Soal hanya bisa dihapus saat quiz masih draft' });
            }
            const questions = quiz.questions.filter(q => q.id !== req.params.qId);
            const updated = yield liveQuizStorage_1.liveQuizStorage.updateLiveQuiz(quiz.id, { questions });
            res.json(updated);
        });
    }
    updateSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            // Diizinkan saat draft (sedang menyusun soal) maupun waiting (di waiting room,
            // sesuai flow: guru atur waktu/acak setelah klik "Selesai" & sebelum "Mulai Quiz").
            if (quiz.status !== 'draft' && quiz.status !== 'waiting') {
                return res.status(400).json({ error: 'Setting hanya bisa diubah sebelum quiz dimulai' });
            }
            const { timePerQuestionSec, shuffleAnswers, shuffleQuestionOrder, visibility } = req.body;
            if (visibility !== undefined && visibility !== 'public' && visibility !== 'private') {
                return res.status(400).json({ error: 'visibility harus public atau private' });
            }
            const updated = yield liveQuizStorage_1.liveQuizStorage.updateLiveQuiz(quiz.id, {
                visibility: visibility !== null && visibility !== void 0 ? visibility : quiz.visibility,
                settings: {
                    timePerQuestionSec: timePerQuestionSec !== null && timePerQuestionSec !== void 0 ? timePerQuestionSec : quiz.settings.timePerQuestionSec,
                    shuffleAnswers: shuffleAnswers !== null && shuffleAnswers !== void 0 ? shuffleAnswers : quiz.settings.shuffleAnswers,
                    shuffleQuestionOrder: shuffleQuestionOrder !== null && shuffleQuestionOrder !== void 0 ? shuffleQuestionOrder : quiz.settings.shuffleQuestionOrder
                }
            });
            res.json(updated);
        });
    }
    // Tombol "Selesai" di pojok kanan bawah -> draft jadi waiting,
    // langsung muncul sebagai card di navbar Live Quiz murid.
    finishSetup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            if (quiz.status !== 'draft') {
                return res.status(400).json({ error: 'Quiz sudah tidak dalam status draft' });
            }
            if (quiz.questions.length === 0) {
                return res.status(400).json({ error: 'Tambahkan minimal 1 soal sebelum menyelesaikan setup' });
            }
            const updated = yield liveQuizStorage_1.liveQuizStorage.updateLiveQuiz(quiz.id, { status: 'waiting' });
            res.json(updated);
        });
    }
    // ---------- LIST / DETAIL ----------
    // ?teacherId=...   -> semua quiz milik guru (termasuk draft, untuk dashboard guru)
    // ?availableToJoin=true -> hanya status 'waiting' (untuk card di navbar murid)
    // ?history=true&teacherId=... -> hanya status 'finished' milik guru tsb
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { teacherId, availableToJoin, history } = req.query;
            let list = yield liveQuizStorage_1.liveQuizStorage.getAllLiveQuizzes();
            if (availableToJoin === 'true') {
                // Quiz private disembunyikan dari daftar murid: hanya bisa diikuti lewat kode (join-by-code)
                list = list.filter(q => q.status === 'waiting' && q.visibility === 'public');
            }
            else if (history === 'true') {
                list = list.filter(q => q.status === 'finished' && (!teacherId || q.teacherId === teacherId));
            }
            else if (teacherId) {
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
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            quiz = yield tickQuizState(quiz);
            const role = req.query.role === 'teacher' ? 'teacher' : 'student';
            res.json(serializeQuizForRole(quiz, role));
        });
    }
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            yield liveQuizStorage_1.liveQuizStorage.deleteLiveQuiz(quiz.id);
            res.json({ message: 'deleted' });
        });
    }
    // ---------- WAITING ROOM ----------
    join(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            if (quiz.status !== 'waiting') {
                return res.status(400).json({ error: 'Quiz tidak lagi menerima peserta baru' });
            }
            const { studentId, studentName } = req.body;
            if (!studentId || !studentName) {
                return res.status(400).json({ error: 'studentId dan studentName wajib diisi' });
            }
            const existing = yield liveQuizStorage_1.liveQuizStorage.getParticipant(quiz.id, studentId);
            if (existing)
                return res.json(existing);
            const participant = (0, liveQuizParticipants_1.createLiveQuizParticipant)({
                liveQuizId: quiz.id,
                studentId,
                studentName
            });
            yield liveQuizStorage_1.liveQuizStorage.saveParticipant(participant);
            res.status(201).json(participant);
        });
    }
    // Join via kode singkat (dipakai dari dashboard murid, tanpa perlu buka daftar live quiz)
    joinByCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { code, studentId, studentName } = req.body;
            if (!code || !studentId || !studentName) {
                return res.status(400).json({ error: 'code, studentId, dan studentName wajib diisi' });
            }
            const quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizByCode(code);
            if (!quiz)
                return res.status(404).json({ error: 'Kode live quiz tidak ditemukan' });
            if (quiz.status !== 'waiting') {
                return res.status(400).json({ error: 'Quiz tidak lagi menerima peserta baru' });
            }
            const existing = yield liveQuizStorage_1.liveQuizStorage.getParticipant(quiz.id, studentId);
            if (existing)
                return res.json({ liveQuizId: quiz.id, participant: existing });
            const participant = (0, liveQuizParticipants_1.createLiveQuizParticipant)({
                liveQuizId: quiz.id,
                studentId,
                studentName
            });
            yield liveQuizStorage_1.liveQuizStorage.saveParticipant(participant);
            res.status(201).json({ liveQuizId: quiz.id, participant });
        });
    }
    // Dipakai baik di waiting room murid maupun dashboard guru
    listParticipants(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            const participants = yield liveQuizStorage_1.liveQuizStorage.getParticipantsByQuiz(quiz.id);
            res.json(participants.map(p => ({
                id: p.id,
                studentId: p.studentId,
                studentName: p.studentName,
                joinedAt: p.joinedAt
            })));
        });
    }
    // ---------- START / COUNTDOWN ----------
    start(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            if (quiz.status !== 'waiting') {
                return res.status(400).json({ error: 'Quiz hanya bisa dimulai dari status waiting' });
            }
            const order = quiz.settings.shuffleQuestionOrder ? shuffle(quiz.questions) : quiz.questions;
            const sessionQuestions = order.map(q => {
                let choices = [...q.choices];
                let correctIndex = q.correctIndex;
                if (quiz.settings.shuffleAnswers) {
                    const idxMap = shuffle(choices.map((_, i) => i));
                    choices = idxMap.map(i => q.choices[i]);
                    correctIndex = idxMap.indexOf(q.correctIndex);
                }
                return { questionId: q.id, prompt: q.prompt, choices, correctIndex };
            });
            const updated = yield liveQuizStorage_1.liveQuizStorage.updateLiveQuiz(quiz.id, {
                status: 'countdown',
                sessionQuestions,
                countdownStartedAt: new Date().toISOString(),
                startedAt: new Date().toISOString()
            });
            res.json(updated);
        });
    }
    // ---------- GAMEPLAY ----------
    submitAnswer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            quiz = yield tickQuizState(quiz);
            if (quiz.status !== 'active') {
                return res.status(400).json({ error: 'Quiz tidak sedang berjalan' });
            }
            const { studentId, questionId, choiceIndex } = req.body;
            let participant = yield liveQuizStorage_1.liveQuizStorage.getParticipant(quiz.id, studentId);
            if (!participant)
                return res.status(404).json({ error: 'Peserta tidak ditemukan / belum join' });
            // Tutup dulu soal-soal yang sudah kena timeout sebelum request ini masuk
            participant = yield tickParticipant(quiz, participant);
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
            const timeTakenMs = Date.now() - new Date(participant.qStartedAt).getTime();
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
            const patch = {
                answers,
                correctCount: participant.correctCount + (correct ? 1 : 0),
                wrongCount: participant.wrongCount + (correct ? 0 : 1),
                qIndex: nextIndex,
                qStartedAt: isLastQuestion ? participant.qStartedAt : new Date().toISOString(),
                finished: isLastQuestion,
                finishedAt: isLastQuestion ? new Date().toISOString() : null
            };
            patch.rankingScore = computeRankingScore(Object.assign(Object.assign({}, participant), patch));
            yield liveQuizStorage_1.liveQuizStorage.updateParticipant(participant.id, patch);
            if (isLastQuestion) {
                yield checkAllParticipantsFinished(quiz);
            }
            // Tidak mengirim angka poin, hanya status benar/salah untuk feedback instan ke murid
            res.json({ correct, finished: isLastQuestion });
        });
    }
    // Dashboard guru: progress real-time semua murid + highlight top 3.
    // Kalau query ?studentId=... disertakan, response juga berisi soal yang
    // SEDANG dikerjakan murid tsb (self-paced, tidak sinkron dengan murid lain).
    // "Poin" tidak pernah dikirim, hanya correctCount/wrongCount/progressPercent.
    progress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            quiz = yield tickQuizState(quiz);
            const participants = yield liveQuizStorage_1.liveQuizStorage.getParticipantsByQuiz(quiz.id);
            const ranked = rankParticipants(participants);
            const totalQuestions = quiz.sessionQuestions.length || quiz.questions.length;
            const timeLeftSec = quiz.status === 'countdown'
                ? Math.max(0, Math.round(liveQuiz_1.LIVE_QUIZ_COUNTDOWN_SEC - secondsSince(quiz.countdownStartedAt)))
                : 0;
            const response = {
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
            const studentId = req.query.studentId;
            if (studentId && quiz.status === 'active') {
                let participant = yield liveQuizStorage_1.liveQuizStorage.getParticipant(quiz.id, studentId);
                if (participant) {
                    participant = yield tickParticipant(quiz, participant);
                    if (participant.finished) {
                        response.myQuestion = null;
                        response.myFinished = true;
                    }
                    else {
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
        });
    }
    // ---------- HASIL AKHIR & REVIEW ----------
    results(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            quiz = yield tickQuizState(quiz);
            if (quiz.status !== 'finished') {
                return res.status(400).json({ error: 'Quiz belum selesai' });
            }
            const participants = yield liveQuizStorage_1.liveQuizStorage.getParticipantsByQuiz(quiz.id);
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
        });
    }
    // Review per-soal untuk 1 murid: soal, pilihan dia, dan jawaban benar
    review(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield liveQuizStorage_1.liveQuizStorage.getLiveQuizById(req.params.id);
            if (!quiz)
                return res.status(404).json({ error: 'Live quiz tidak ditemukan' });
            const participant = yield liveQuizStorage_1.liveQuizStorage.getParticipant(quiz.id, req.params.studentId);
            if (!participant)
                return res.status(404).json({ error: 'Peserta tidak ditemukan' });
            const review = quiz.sessionQuestions.map(sq => {
                var _a, _b;
                const log = participant.answers.find(a => a.questionId === sq.questionId);
                return {
                    prompt: sq.prompt,
                    choices: sq.choices,
                    correctIndex: sq.correctIndex,
                    studentChoiceIndex: (_a = log === null || log === void 0 ? void 0 : log.choiceIndex) !== null && _a !== void 0 ? _a : null,
                    correct: (_b = log === null || log === void 0 ? void 0 : log.correct) !== null && _b !== void 0 ? _b : false
                };
            });
            res.json({ studentName: participant.studentName, review });
        });
    }
}
exports.LiveQuizController = LiveQuizController;
