import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.get('/users', (req, res) => authController.listUsers(req, res));
router.delete('/users/:id', (req, res) => authController.removeUser(req, res));

export default router;