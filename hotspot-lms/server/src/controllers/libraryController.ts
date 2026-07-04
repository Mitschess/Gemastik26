import { Request, Response } from 'express';
import { createLibraryItem, LibraryItemType } from '../models/libraryItem';
import { storageService } from '../services/storage';

const parseTags = (tags: unknown): string[] => {
    if (Array.isArray(tags)) return tags.map(String).map(tag => tag.trim()).filter(Boolean);
    return String(tags ?? '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
};

export class LibraryController {
    async list(_req: Request, res: Response) {
        const list = await storageService.getAllLibraryItems();
        res.json(list);
    }

    async create(req: Request, res: Response) {
        const file = (req as any).file;
        const item = createLibraryItem({
            courseId: req.body.courseId,
            title: req.body.title,
            description: req.body.description,
            type: (req.body.type as LibraryItemType) || (file ? 'file' : 'link'),
            category: req.body.category,
            author: req.body.author,
            publisher: req.body.publisher,
            tags: parseTags(req.body.tags),
            externalUrl: req.body.externalUrl,
            fileName: file ? file.originalname : undefined,
            filePath: file ? file.filename : undefined
        });
        await storageService.saveLibraryItem(item);
        res.status(201).json(item);
    }

    async update(req: Request, res: Response) {
        try {
            await storageService.updateLibraryItem(req.params.id, {
                ...req.body,
                tags: req.body.tags !== undefined ? parseTags(req.body.tags) : undefined
            });
            res.json({ message: 'updated' });
        } catch (e) {
            res.status(404).json({ error: String(e) });
        }
    }

    async remove(req: Request, res: Response) {
        await storageService.deleteLibraryItem(req.params.id);
        res.json({ message: 'deleted' });
    }
}
