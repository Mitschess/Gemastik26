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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const ollamaService_1 = require("../services/ollamaService");
class AiController {
    status(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const online = yield (0, ollamaService_1.checkOllamaHealth)();
            res.json({ online, model: (0, ollamaService_1.getModelName)() });
        });
    }
    analyzeQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { prompt, options, answer } = req.body;
            if (!(prompt === null || prompt === void 0 ? void 0 : prompt.trim())) {
                return res.status(400).json({ error: 'Soal tidak boleh kosong' });
            }
            const text = `
Kamu asisten guru sekolah. Analisis soal berikut dalam Bahasa Indonesia:
1. Tingkat kesulitan (mudah/sedang/sulit)
2. Topik/kompetensi
3. Kunci jawaban
4. Saran perbaikan redaksi soal

Soal: ${prompt}
${options ? `Pilihan: ${options}` : ''}
${answer ? `Kunci: ${answer}` : ''}
        `.trim();
            const result = yield (0, ollamaService_1.askAI)(text);
            res.json({ result });
        });
    }
    summarize(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { text } = req.body;
            if (!(text === null || text === void 0 ? void 0 : text.trim())) {
                return res.status(400).json({ error: 'Teks tidak boleh kosong' });
            }
            const prompt = `
Buat ringkasan 5 poin utama dalam Bahasa Indonesia, maksimal 300 kata:

${text}
        `.trim();
            const result = yield (0, ollamaService_1.askAI)(prompt);
            res.json({ result });
        });
    }
    cleanOcr(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { text } = req.body;
            if (!(text === null || text === void 0 ? void 0 : text.trim())) {
                return res.status(400).json({ error: 'Teks tidak boleh kosong' });
            }
            const prompt = `
Perbaiki teks hasil OCR tulisan tangan murid. Koreksi typo, pertahankan makna asli. Jangan tambah informasi baru:

${text}
        `.trim();
            const result = yield (0, ollamaService_1.askAI)(prompt);
            res.json({ result });
        });
    }
    chat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { message, history } = req.body;
            if (!(message === null || message === void 0 ? void 0 : message.trim())) {
                return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
            }
            const messages = [
                {
                    role: 'system',
                    content: 'Kamu asisten AI guru sekolah bernama EduLAN AI. Bantu guru menganalisis soal, merangkum dokumen, dan mengevaluasi pekerjaan murid. Jawab dalam Bahasa Indonesia, singkat dan jelas.'
                },
                ...(Array.isArray(history) ? history : []),
                { role: 'user', content: message.trim() }
            ];
            const result = yield (0, ollamaService_1.chatAI)(messages);
            res.json({ result });
        });
    }
}
exports.AiController = AiController;
