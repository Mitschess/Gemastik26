import { Request, Response, NextFunction } from 'express';
import { storageService } from '../services/storage';

export async function requireTeacher(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'] as string | undefined;
    if (!userId) {
        return res.status(401).json({ error: 'Login guru diperlukan' });
    }

    const users = await storageService.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (!user || user.role !== 'teacher') {
        return res.status(403).json({ error: 'Hanya guru yang dapat mengakses fitur AI' });
    }

    (req as Request & { teacher: typeof user }).teacher = user;
    return next();
}
