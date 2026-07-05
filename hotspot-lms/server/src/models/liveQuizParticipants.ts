import { v4 as uuidv4 } from 'uuid';

export interface LiveQuizAnswerLog {
    questionId: string;      // ref ke LiveQuizSessionQuestion.questionId
    choiceIndex: number | null; // null = tidak menjawab / kena timeout
    correct: boolean;
    timeTakenMs: number;     // waktu sejak soal ditampilkan sampai jawab
    answeredAt: string;
}

export interface LiveQuizParticipant {
    id: string;
    liveQuizId: string;
    studentId: string;
    studentName: string;
    joinedAt: string;

    answers: LiveQuizAnswerLog[];
    correctCount: number;
    wrongCount: number;

    finished: boolean;
    finishedAt: string | null;

    // Progres soal PER MURID (self-paced): begitu murid menjawab, dia langsung
    // maju ke soal berikutnya tanpa menunggu waktu habis. timePerQuestionSec dari
    // settings tetap berlaku sebagai batas maksimum kalau murid tidak menjawab.
    qIndex: number;             // index soal yang sedang dikerjakan murid ini, -1 = belum mulai
    qStartedAt: string | null;  // kapan soal qIndex ditampilkan ke murid ini

    // Dipakai HANYA untuk menentukan ranking/top-3 di server.
    // Jangan pernah dikirim/ditampilkan sebagai "poin" ke murid (sesuai requirement).
    rankingScore: number;
}

export function createLiveQuizParticipant(data: Partial<LiveQuizParticipant>): LiveQuizParticipant {
    return {
        id: data.id ?? uuidv4(),
        liveQuizId: data.liveQuizId ?? '',
        studentId: data.studentId ?? '',
        studentName: data.studentName ?? '',
        joinedAt: data.joinedAt ?? new Date().toISOString(),
        answers: data.answers ?? [],
        correctCount: data.correctCount ?? 0,
        wrongCount: data.wrongCount ?? 0,
        finished: data.finished ?? false,
        finishedAt: data.finishedAt ?? null,
        qIndex: data.qIndex ?? -1,
        qStartedAt: data.qStartedAt ?? null,
        rankingScore: data.rankingScore ?? 0
    };
}