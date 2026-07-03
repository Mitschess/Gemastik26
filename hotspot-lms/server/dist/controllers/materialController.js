"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialController = void 0;
const storage_1 = require("../services/storage");
const material_1 = require("../models/material");
class MaterialController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield storage_1.storageService.getAllMaterials();
            res.json(list);
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { courseId, title, description } = req.body;
            const file = req.file;
            const m = (0, material_1.createMaterial)({
                courseId,
                title,
                description,
                fileName: file ? file.originalname : undefined,
                filePath: file ? file.filename : undefined
            });
            yield storage_1.storageService.saveMaterial(m);
            res.status(201).json(m);
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                yield storage_1.storageService.updateMaterial(id, req.body);
                res.json({ message: 'updated' });
            }
            catch (e) {
                res.status(404).json({ error: String(e) });
            }
        });
    }
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield storage_1.storageService.deleteMaterial(id);
            res.json({ message: 'deleted' });
        });
    }
}
exports.MaterialController = MaterialController;
