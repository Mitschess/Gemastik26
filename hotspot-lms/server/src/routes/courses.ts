import { Router } from 'express';
import { CourseController } from '../controllers/courseController';

const router = Router();
const ctrl = new CourseController();

router.get('/', (req, res) => ctrl.list(req, res));
router.post('/', (req, res) => ctrl.create(req, res));
router.put('/:id', (req, res) => ctrl.update(req, res));
router.delete('/:id', (req, res) => ctrl.remove(req, res));

export default router;
