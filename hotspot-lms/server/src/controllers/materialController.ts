import { Request, Response } from 'express';
import { storageService } from '../services/storage';
import { createMaterial } from '../models/material';

export class MaterialController {
    async list(req: Request, res: Response) {
        const list = await storageService.getAllMaterials();
        res.json(list);
    }

    async create(req: Request, res: Response) {
        const { courseId, title, description } = req.body;
        const file = (req as any).file;
        const m = createMaterial({
            courseId,
            title,
            description,
            fileName: file ? file.originalname : undefined,
            filePath: file ? file.filename : undefined
        });
        await storageService.saveMaterial(m);
        res.status(201).json(m);
    }

    async update(req: Request, res: Response) {
        const id = req.params.id;
        try {
            await storageService.updateMaterial(id, req.body);
            res.json({ message: 'updated' });
        } catch (e) { res.status(404).json({ error: String(e) }); }
    }

    async remove(req: Request, res: Response) {
        const id = req.params.id;
        await storageService.deleteMaterial(id);
        res.json({ message: 'deleted' });
    }
}
