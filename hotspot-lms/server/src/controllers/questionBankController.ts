import { Request, Response } from 'express';
import { createQuestionBankItem } from '../models/questionBank';
import { storageService } from '../services/storage';

export class QuestionBankController {
    async list(_req: Request, res: Response) {
        const list = await storageService.getAllQuestionBankItems();
        res.json(list);
    }

    async create(req: Request, res: Response) {
        const item = createQuestionBankItem(req.body);
        await storageService.saveQuestionBankItem(item);
        res.status(201).json(item);
    }

    async update(req: Request, res: Response) {
        try {
            await storageService.updateQuestionBankItem(req.params.id, req.body);
            res.json({ message: 'updated' });
        } catch (e) {
            res.status(404).json({ error: String(e) });
        }
    }

    async remove(req: Request, res: Response) {
        await storageService.deleteQuestionBankItem(req.params.id);
        res.json({ message: 'deleted' });
    }
}
