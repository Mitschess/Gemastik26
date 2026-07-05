import fs from 'fs';
import path from 'path';
import { LiveQuiz, createLiveQuiz } from '../models/liveQuiz';
import { LiveQuizParticipant, createLiveQuizParticipant } from '../models/liveQuizParticipants';

const dataPath = path.join(__dirname, '../../data');
const liveQuizDb = path.join(dataPath, 'liveQuizzes.json');
const liveQuizParticipantDb = path.join(dataPath, 'liveQuizParticipants.json');

const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const ensureDataPathExists = () => {
    ensureDir(dataPath);
    if (!fs.existsSync(liveQuizDb)) {
        fs.writeFileSync(liveQuizDb, JSON.stringify([]));
    }
    if (!fs.existsSync(liveQuizParticipantDb)) {
        fs.writeFileSync(liveQuizParticipantDb, JSON.stringify([]));
    }
};

export const liveQuizStorage = {
    // ---- Live Quiz ----
    async getAllLiveQuizzes(): Promise<LiveQuiz[]> {
        ensureDataPathExists();
        const raw = fs.readFileSync(liveQuizDb, 'utf-8');
        try {
            const rawList = JSON.parse(raw) as Partial<LiveQuiz>[];
            // createLiveQuiz mengisi default utk field baru (mis. visibility, code) pada
            // data lama tanpa mengubah field yang sudah ada, supaya data lama tetap kompatibel.
            const normalized = rawList.map(createLiveQuiz);
            if (JSON.stringify(rawList) !== JSON.stringify(normalized)) {
                fs.writeFileSync(liveQuizDb, JSON.stringify(normalized, null, 2));
            }
            return normalized;
        }
        catch { return []; }
    },

    async getLiveQuizById(id: string): Promise<LiveQuiz | null> {
        const list = await this.getAllLiveQuizzes();
        return list.find(q => q.id === id) ?? null;
    },

    async getLiveQuizByCode(code: string): Promise<LiveQuiz | null> {
        const list = await this.getAllLiveQuizzes();
        const normalized = code.trim().toUpperCase();
        return list.find(q => q.code === normalized) ?? null;
    },

    async saveLiveQuiz(quiz: LiveQuiz): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllLiveQuizzes();
        list.push(quiz);
        fs.writeFileSync(liveQuizDb, JSON.stringify(list, null, 2));
    },

    async updateLiveQuiz(id: string, patch: Partial<LiveQuiz>): Promise<LiveQuiz | null> {
        ensureDataPathExists();
        const list = await this.getAllLiveQuizzes();
        const idx = list.findIndex(q => q.id === id);
        if (idx === -1) return null;
        list[idx] = { ...list[idx], ...patch };
        fs.writeFileSync(liveQuizDb, JSON.stringify(list, null, 2));
        return list[idx];
    },

    async deleteLiveQuiz(id: string): Promise<boolean> {
        ensureDataPathExists();
        const list = await this.getAllLiveQuizzes();
        const filtered = list.filter(q => q.id !== id);
        if (filtered.length === list.length) return false;
        fs.writeFileSync(liveQuizDb, JSON.stringify(filtered, null, 2));

        // Bersihkan juga peserta milik quiz ini
        const participants = await this.getAllParticipants();
        const filteredParticipants = participants.filter(p => p.liveQuizId !== id);
        fs.writeFileSync(liveQuizParticipantDb, JSON.stringify(filteredParticipants, null, 2));
        return true;
    },

    // ---- Participants ----
    async getAllParticipants(): Promise<LiveQuizParticipant[]> {
        ensureDataPathExists();
        const raw = fs.readFileSync(liveQuizParticipantDb, 'utf-8');
        try {
            const list = JSON.parse(raw) as Partial<LiveQuizParticipant>[];
            return list.map(createLiveQuizParticipant);
        }
        catch { return []; }
    },

    async getParticipantsByQuiz(liveQuizId: string): Promise<LiveQuizParticipant[]> {
        const list = await this.getAllParticipants();
        return list.filter(p => p.liveQuizId === liveQuizId);
    },

    async getParticipant(liveQuizId: string, studentId: string): Promise<LiveQuizParticipant | null> {
        const list = await this.getParticipantsByQuiz(liveQuizId);
        return list.find(p => p.studentId === studentId) ?? null;
    },

    async saveParticipant(p: LiveQuizParticipant): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllParticipants();
        list.push(p);
        fs.writeFileSync(liveQuizParticipantDb, JSON.stringify(list, null, 2));
    },

    async updateParticipant(id: string, patch: Partial<LiveQuizParticipant>): Promise<LiveQuizParticipant | null> {
        ensureDataPathExists();
        const list = await this.getAllParticipants();
        const idx = list.findIndex(p => p.id === id);
        if (idx === -1) return null;
        list[idx] = { ...list[idx], ...patch };
        fs.writeFileSync(liveQuizParticipantDb, JSON.stringify(list, null, 2));
        return list[idx];
    }
};