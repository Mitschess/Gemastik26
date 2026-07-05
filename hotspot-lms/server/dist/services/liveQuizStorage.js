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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.liveQuizStorage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const liveQuiz_1 = require("../models/liveQuiz");
const liveQuizParticipants_1 = require("../models/liveQuizParticipants");
const dataPath = path_1.default.join(__dirname, '../../data');
const liveQuizDb = path_1.default.join(dataPath, 'liveQuizzes.json');
const liveQuizParticipantDb = path_1.default.join(dataPath, 'liveQuizParticipants.json');
const ensureDir = (dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
const ensureDataPathExists = () => {
    ensureDir(dataPath);
    if (!fs_1.default.existsSync(liveQuizDb)) {
        fs_1.default.writeFileSync(liveQuizDb, JSON.stringify([]));
    }
    if (!fs_1.default.existsSync(liveQuizParticipantDb)) {
        fs_1.default.writeFileSync(liveQuizParticipantDb, JSON.stringify([]));
    }
};
exports.liveQuizStorage = {
    // ---- Live Quiz ----
    getAllLiveQuizzes() {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const raw = fs_1.default.readFileSync(liveQuizDb, 'utf-8');
            try {
                const rawList = JSON.parse(raw);
                // createLiveQuiz mengisi default utk field baru (mis. visibility, code) pada
                // data lama tanpa mengubah field yang sudah ada, supaya data lama tetap kompatibel.
                const normalized = rawList.map(liveQuiz_1.createLiveQuiz);
                if (JSON.stringify(rawList) !== JSON.stringify(normalized)) {
                    fs_1.default.writeFileSync(liveQuizDb, JSON.stringify(normalized, null, 2));
                }
                return normalized;
            }
            catch (_a) {
                return [];
            }
        });
    },
    getLiveQuizById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const list = yield this.getAllLiveQuizzes();
            return (_a = list.find(q => q.id === id)) !== null && _a !== void 0 ? _a : null;
        });
    },
    getLiveQuizByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const list = yield this.getAllLiveQuizzes();
            const normalized = code.trim().toUpperCase();
            return (_a = list.find(q => q.code === normalized)) !== null && _a !== void 0 ? _a : null;
        });
    },
    saveLiveQuiz(quiz) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllLiveQuizzes();
            list.push(quiz);
            fs_1.default.writeFileSync(liveQuizDb, JSON.stringify(list, null, 2));
        });
    },
    updateLiveQuiz(id, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllLiveQuizzes();
            const idx = list.findIndex(q => q.id === id);
            if (idx === -1)
                return null;
            list[idx] = Object.assign(Object.assign({}, list[idx]), patch);
            fs_1.default.writeFileSync(liveQuizDb, JSON.stringify(list, null, 2));
            return list[idx];
        });
    },
    deleteLiveQuiz(id) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllLiveQuizzes();
            const filtered = list.filter(q => q.id !== id);
            if (filtered.length === list.length)
                return false;
            fs_1.default.writeFileSync(liveQuizDb, JSON.stringify(filtered, null, 2));
            // Bersihkan juga peserta milik quiz ini
            const participants = yield this.getAllParticipants();
            const filteredParticipants = participants.filter(p => p.liveQuizId !== id);
            fs_1.default.writeFileSync(liveQuizParticipantDb, JSON.stringify(filteredParticipants, null, 2));
            return true;
        });
    },
    // ---- Participants ----
    getAllParticipants() {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const raw = fs_1.default.readFileSync(liveQuizParticipantDb, 'utf-8');
            try {
                const list = JSON.parse(raw);
                return list.map(liveQuizParticipants_1.createLiveQuizParticipant);
            }
            catch (_a) {
                return [];
            }
        });
    },
    getParticipantsByQuiz(liveQuizId) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.getAllParticipants();
            return list.filter(p => p.liveQuizId === liveQuizId);
        });
    },
    getParticipant(liveQuizId, studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const list = yield this.getParticipantsByQuiz(liveQuizId);
            return (_a = list.find(p => p.studentId === studentId)) !== null && _a !== void 0 ? _a : null;
        });
    },
    saveParticipant(p) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllParticipants();
            list.push(p);
            fs_1.default.writeFileSync(liveQuizParticipantDb, JSON.stringify(list, null, 2));
        });
    },
    updateParticipant(id, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllParticipants();
            const idx = list.findIndex(p => p.id === id);
            if (idx === -1)
                return null;
            list[idx] = Object.assign(Object.assign({}, list[idx]), patch);
            fs_1.default.writeFileSync(liveQuizParticipantDb, JSON.stringify(list, null, 2));
            return list[idx];
        });
    }
};
