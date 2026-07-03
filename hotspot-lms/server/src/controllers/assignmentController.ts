import { Request, Response } from 'express';
import { storageService } from '../services/storage';
import { createAssignment } from '../models/assignment';
import { createQuestion } from '../models/question';

export class AssignmentController {
    async list(req: Request, res: Response) {
        const list = await storageService.getAllAssignments();
        res.json(list);
    }

    async create(req: Request, res: Response) {
        const {
            courseId,
            title,
            description,
            dueDate,
            autoCheck,
            activityType,
            timeLimitMinutes,
            attemptLimit,
            randomizeQuestions,
            randomizeChoices,
            questions
        } = req.body;
        const normalizedQuestions = Array.isArray(questions) ? questions.map((q: any) => createQuestion(q)) : [];
        const a = createAssignment({
            courseId,
            title,
            description,
            dueDate,
            autoCheck: Boolean(autoCheck),
            activityType,
            timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined,
            attemptLimit: attemptLimit ? Number(attemptLimit) : undefined,
            randomizeQuestions: Boolean(randomizeQuestions),
            randomizeChoices: Boolean(randomizeChoices),
            questions: normalizedQuestions
        });
        await storageService.saveAssignment(a);
        res.status(201).json(a);
    }

    async update(req: Request, res: Response) {
        const id = req.params.id;
        try {
            await storageService.updateAssignment(id, req.body);
            res.json({ message: 'updated' });
        } catch (e) { res.status(404).json({ error: String(e) }); }
    }

    async remove(req: Request, res: Response) {
        const id = req.params.id;
        await storageService.deleteAssignment(id);
        res.json({ message: 'deleted' });
    }

    // Questions
    async addQuestion(req: Request, res: Response) {
        const id = req.params.id; // assignment id
        const q = createQuestion(req.body);
        const list = await storageService.getAllAssignments();
        const idx = list.findIndex((a:any)=>a.id===id);
        if (idx === -1) return res.status(404).json({ error: 'assignment not found' });
        list[idx].questions = list[idx].questions || [];
        list[idx].questions.push(q);
        await storageService.updateAssignment(id, { questions: list[idx].questions });
        res.status(201).json(q);
    }

    async removeQuestion(req: Request, res: Response) {
        const id = req.params.id; // assignment id
        const qid = req.params.qid;
        const list = await storageService.getAllAssignments();
        const idx = list.findIndex((a:any)=>a.id===id);
        if (idx === -1) return res.status(404).json({ error: 'assignment not found' });
        list[idx].questions = (list[idx].questions||[]).filter((q:any)=>q.id!==qid);
        await storageService.updateAssignment(id, { questions: list[idx].questions });
        res.json({ message: 'question removed' });
    }
}
