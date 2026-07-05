import { Request, Response, NextFunction } from 'express';

export function requireTeacher(req: Request, res: Response, next: NextFunction) {
    const role = req.headers['x-user-role'];
    if (role !== 'teacher') {
        return res.status(403).json({ error: 'Hanya guru yang bisa akses AI' });
    }
    next();
}
