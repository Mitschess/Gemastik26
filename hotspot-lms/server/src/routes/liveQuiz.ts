import { Router } from 'express';
import { LiveQuizController } from '../controllers/liveQuizController';

const router = Router();
const ctrl = new LiveQuizController();

// Setup (draft)
router.post('/', (req, res) => ctrl.create(req, res));
router.post('/:id/questions', (req, res) => ctrl.addQuestion(req, res));
router.post('/:id/questions/from-bank', (req, res) => ctrl.addQuestionsFromBank(req, res));
router.put('/:id/questions/:qId', (req, res) => ctrl.updateQuestion(req, res));
router.delete('/:id/questions/:qId', (req, res) => ctrl.removeQuestion(req, res));
router.put('/:id/settings', (req, res) => ctrl.updateSettings(req, res));
router.post('/:id/finish-setup', (req, res) => ctrl.finishSetup(req, res));

// List & detail
router.get('/', (req, res) => ctrl.list(req, res));
router.get('/:id', (req, res) => ctrl.getOne(req, res));
router.delete('/:id', (req, res) => ctrl.remove(req, res));

// Waiting room
router.post('/join-by-code', (req, res) => ctrl.joinByCode(req, res));
router.post('/:id/join', (req, res) => ctrl.join(req, res));
router.get('/:id/participants', (req, res) => ctrl.listParticipants(req, res));

// Start / gameplay
router.post('/:id/start', (req, res) => ctrl.start(req, res));
router.post('/:id/answer', (req, res) => ctrl.submitAnswer(req, res));
router.get('/:id/progress', (req, res) => ctrl.progress(req, res));

// Hasil & review
router.get('/:id/results', (req, res) => ctrl.results(req, res));
router.get('/:id/review/:studentId', (req, res) => ctrl.review(req, res));

export default router;