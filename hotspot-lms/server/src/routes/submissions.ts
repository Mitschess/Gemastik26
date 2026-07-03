import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SubmissionController } from '../controllers/submissionController';
import { storageService } from '../services/storage';

const router = Router();
const ctrl = new SubmissionController();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, storageService.getUploadsPath());
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        // Allow common file types
        const allowed = [
            '.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg',
            '.gif', '.zip', '.rar', '.pptx', '.ppt', '.xlsx', '.xls', '.csv'
        ];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'));
        }
    }
});

router.post('/submit', upload.single('file'), (req, res) => ctrl.createSubmission(req, res));
router.get('/submissions', (req, res) => ctrl.getSubmissions(req, res));
router.put('/:id/grade', (req, res) => ctrl.gradeSubmission(req, res));
router.delete('/:id', (req, res) => ctrl.deleteSubmission(req, res));

export default router;