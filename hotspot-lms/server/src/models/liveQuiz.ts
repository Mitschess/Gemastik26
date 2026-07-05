import { v4 as uuidv4 } from 'uuid';

// draft     : guru masih menyusun soal (tambah manual / dari bank soal)
// waiting   : sudah klik "Selesai", murid bisa lihat card & join, masuk waiting room
// countdown : guru klik "Mulai Quiz", hitung mundur sebelum soal pertama muncul
// active    : quiz berjalan, tiap murid mengerjakan soal dengan kecepatannya sendiri (self-paced)
// finished  : semua murid yang join sudah menyelesaikan seluruh soal
export type LiveQuizStatus = 'draft' | 'waiting' | 'countdown' | 'active' | 'finished';

// public  : muncul otomatis sebagai card di dashboard/navbar murid, tinggal klik Join
// private : disembunyikan dari daftar murid, hanya bisa diikuti dengan memasukkan kode join
export type LiveQuizVisibility = 'public' | 'private';

export interface LiveQuizQuestion {
    id: string;
    prompt: string;
    choices: string[];       // urutan ASLI (belum diacak), disimpan sekali saat dibuat
    correctIndex: number;    // index jawaban benar pada choices asli
    sourceQuestionBankId?: string; // terisi jika soal diambil dari bank soal
    points?: number;
}

// Soal versi "siap main" untuk 1 sesi. Diproduksi saat quiz di-start,
// supaya hasil acak (jika shuffleAnswers/shuffleQuestionOrder aktif)
// konsisten untuk semua murid selama sesi itu berlangsung.
export interface LiveQuizSessionQuestion {
    questionId: string;   // ref ke LiveQuizQuestion.id
    prompt: string;
    choices: string[];    // choices versi tampil (sudah diacak jika diaktifkan)
    correctIndex: number; // correctIndex versi tampil
}

export interface LiveQuizSettings {
    timePerQuestionSec: number; // default waktu per soal
    shuffleAnswers: boolean;
    shuffleQuestionOrder: boolean;
}

export interface LiveQuiz {
    id: string;
    teacherId: string;
    teacherName: string;
    title: string;
    status: LiveQuizStatus;
    visibility: LiveQuizVisibility; // public = muncul di dashboard murid, private = wajib pakai kode
    code: string; // kode singkat 6 karakter supaya murid bisa join tanpa lihat daftar

    questions: LiveQuizQuestion[];   // bank soal milik quiz ini (urutan input guru)
    settings: LiveQuizSettings;

    // diisi otomatis saat status berubah ke 'countdown' (lihat liveQuizController.start)
    sessionQuestions: LiveQuizSessionQuestion[];
    currentQuestionIndex: number;        // -1 = belum mulai
    currentQuestionStartedAt: string | null;
    countdownStartedAt: string | null;

    createdAt: string;
    startedAt: string | null;
    finishedAt: string | null;
}

const DEFAULT_COUNTDOWN_SEC = 3;
export const LIVE_QUIZ_COUNTDOWN_SEC = DEFAULT_COUNTDOWN_SEC;

// Kode join 6 karakter (huruf besar + angka, tanpa karakter ambigu seperti 0/O/1/I)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateLiveQuizCode(): string {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return code;
}

export function createLiveQuiz(data: Partial<LiveQuiz>): LiveQuiz {
    return {
        id: data.id ?? uuidv4(),
        teacherId: data.teacherId ?? '',
        teacherName: data.teacherName ?? '',
        title: data.title ?? 'Live Quiz',
        status: data.status ?? 'draft',
        visibility: data.visibility ?? 'public',
        code: data.code ?? generateLiveQuizCode(),
        questions: data.questions ?? [],
        settings: {
            timePerQuestionSec: data.settings?.timePerQuestionSec ?? 20,
            shuffleAnswers: data.settings?.shuffleAnswers ?? false,
            shuffleQuestionOrder: data.settings?.shuffleQuestionOrder ?? false
        },
        sessionQuestions: data.sessionQuestions ?? [],
        currentQuestionIndex: data.currentQuestionIndex ?? -1,
        currentQuestionStartedAt: data.currentQuestionStartedAt ?? null,
        countdownStartedAt: data.countdownStartedAt ?? null,
        createdAt: data.createdAt ?? new Date().toISOString(),
        startedAt: data.startedAt ?? null,
        finishedAt: data.finishedAt ?? null
    };
}

export function createLiveQuizQuestion(data: Partial<LiveQuizQuestion>): LiveQuizQuestion {
    return {
        id: data.id ?? uuidv4(),
        prompt: data.prompt ?? '',
        choices: data.choices ?? [],
        correctIndex: data.correctIndex ?? 0,
        sourceQuestionBankId: data.sourceQuestionBankId,
        points: data.points ?? 1
    };
}
