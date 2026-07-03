import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MaterialController } from '../controllers/materialController';
import { storageService } from '../services/storage';

const router = Router();
const ctrl = new MaterialController();

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, storageService.getUploadsPath());
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `mat_${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.get('/', (req, res)=>ctrl.list(req, res));
router.post('/', upload.single('file'), (req, res, next) => {
    ctrl.create(req, res).catch(next);
});
router.put('/:id', (req, res)=>ctrl.update(req, res));
router.delete('/:id', (req, res)=>ctrl.remove(req, res));

export default router;
