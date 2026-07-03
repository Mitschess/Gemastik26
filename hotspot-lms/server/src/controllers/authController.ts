import { Request, Response } from 'express';
import { storageService } from '../services/storage';
import { createUser } from '../models/user';

export class AuthController {
    async login(req: Request, res: Response) {
        const { username, password } = req.body;
        const users = await storageService.getAllUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    studentId: user.studentId
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    }

    async register(req: Request, res: Response) {
        // This could be used for initial setup or by teachers
        const { username, password, name, role, studentId } = req.body;

        const users = await storageService.getAllUsers();
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const newUser = createUser({ username, password, name, role, studentId });
        await storageService.saveUser(newUser);
        res.status(201).json(newUser);
    }

    async listUsers(req: Request, res: Response) {
        const users = await storageService.getAllUsers();
        res.json(users);
    }

    async removeUser(req: Request, res: Response) {
        const id = req.params.id;
        await storageService.deleteUser(id);
        res.json({ message: 'User deleted' });
    }
}