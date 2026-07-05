import { Router } from 'express';
import { AiController } from '../controllers/aiController';
import { requireTeacher } from '../middleware/requireTeacher';

const router = Router();
const ctrl = new AiController();

router.use(requireTeacher);

router.get('/status', (req, res, next) => ctrl.status(req, res).catch(next));
router.post('/analyze-question', (req, res, next) => ctrl.analyzeQuestion(req, res).catch(next));
router.post('/summarize', (req, res, next) => ctrl.summarize(req, res).catch(next));
router.post('/clean-ocr', (req, res, next) => ctrl.cleanOcr(req, res).catch(next));
router.post('/chat', (req, res, next) => ctrl.chat(req, res).catch(next));

export default router;
