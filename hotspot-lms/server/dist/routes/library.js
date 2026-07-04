"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const libraryController_1 = require("../controllers/libraryController");
const storage_1 = require("../services/storage");
const router = (0, express_1.Router)();
const ctrl = new libraryController_1.LibraryController();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, storage_1.storageService.getUploadsPath()),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `lib_${(0, uuid_1.v4)()}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
});
router.get('/', (req, res) => ctrl.list(req, res));
router.post('/', upload.single('file'), (req, res, next) => {
    ctrl.create(req, res).catch(next);
});
router.put('/:id', (req, res) => ctrl.update(req, res));
router.delete('/:id', (req, res) => ctrl.remove(req, res));
exports.default = router;
