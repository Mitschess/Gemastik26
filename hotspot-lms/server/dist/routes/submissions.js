"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const submissionController_1 = require("../controllers/submissionController");
const storage_1 = require("../services/storage");
const router = (0, express_1.Router)();
const ctrl = new submissionController_1.SubmissionController();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, storage_1.storageService.getUploadsPath());
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${(0, uuid_1.v4)()}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        // Allow common file types
        const allowed = [
            '.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg',
            '.gif', '.zip', '.rar', '.pptx', '.ppt', '.xlsx', '.xls', '.csv'
        ];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('File type not allowed'));
        }
    }
});
router.post('/submit', upload.single('file'), (req, res) => ctrl.createSubmission(req, res));
router.get('/submissions', (req, res) => ctrl.getSubmissions(req, res));
router.put('/:id/grade', (req, res) => ctrl.gradeSubmission(req, res));
router.delete('/:id', (req, res) => ctrl.deleteSubmission(req, res));
exports.default = router;
