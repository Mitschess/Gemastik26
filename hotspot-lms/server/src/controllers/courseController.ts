import { Request, Response } from 'express';
import { createCourse } from '../models/course';
import { storageService } from '../services/storage';

export class CourseController {
    async list(_req: Request, res: Response) {
        const list = await storageService.getAllCourses();
        res.json(list);
    }

    async create(req: Request, res: Response) {
        const course = createCourse(req.body);
        await storageService.saveCourse(course);
        res.status(201).json(course);
    }

    async update(req: Request, res: Response) {
        try {
            await storageService.updateCourse(req.params.id, req.body);
            res.json({ message: 'updated' });
        } catch (e) {
            res.status(404).json({ error: String(e) });
        }
    }

    async remove(req: Request, res: Response) {
        await storageService.deleteCourse(req.params.id);
        res.json({ message: 'deleted' });
    }
}
