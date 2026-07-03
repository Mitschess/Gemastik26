import { Router } from 'express';
import { AssignmentController } from '../controllers/assignmentController';

const router = Router();
const ctrl = new AssignmentController();

router.get('/', (req, res)=>ctrl.list(req, res));
router.post('/', (req, res)=>ctrl.create(req, res));
router.put('/:id', (req, res)=>ctrl.update(req, res));
router.delete('/:id', (req, res)=>ctrl.remove(req, res));

// questions
router.post('/:id/questions', (req, res)=>ctrl.addQuestion(req, res));
router.delete('/:id/questions/:qid', (req, res)=>ctrl.removeQuestion(req, res));

export default router;
