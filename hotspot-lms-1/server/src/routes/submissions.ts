import { Router } from 'express';
import { SubmissionController } from '../controllers/submissionController';

const router = Router();
const submissionController = new SubmissionController();

router.post('/submit', submissionController.createSubmission);
router.get('/submissions', submissionController.getSubmissions);

export default router;