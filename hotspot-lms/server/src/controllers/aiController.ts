import { Request, Response } from 'express';
import { askAI, chatAI, checkOllamaHealth, getModelName } from '../services/ollamaService';

export class AiController {
    async status(_req: Request, res: Response) {
        const online = await checkOllamaHealth();
        res.json({ online, model: getModelName() });
    }

    async analyzeQuestion(req: Request, res: Response) {
        const { prompt, options, answer } = req.body;
        if (!prompt?.trim()) {
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
        const result = await askAI(text);
        res.json({ result });
    }

    async summarize(req: Request, res: Response) {
        const { text } = req.body;
        if (!text?.trim()) {
            return res.status(400).json({ error: 'Teks tidak boleh kosong' });
        }
        const prompt = `
Buat ringkasan 5 poin utama dalam Bahasa Indonesia, maksimal 300 kata:

${text}
        `.trim();
        const result = await askAI(prompt);
        res.json({ result });
    }

    async cleanOcr(req: Request, res: Response) {
        const { text } = req.body;
        if (!text?.trim()) {
            return res.status(400).json({ error: 'Teks tidak boleh kosong' });
        }
        const prompt = `
Perbaiki teks hasil OCR tulisan tangan murid. Koreksi typo, pertahankan makna asli. Jangan tambah informasi baru:

${text}
        `.trim();
        const result = await askAI(prompt);
        res.json({ result });
    }

    async chat(req: Request, res: Response) {
        const { message, history } = req.body;
        if (!message?.trim()) {
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
        const result = await chatAI(messages);
        res.json({ result });
    }
}
