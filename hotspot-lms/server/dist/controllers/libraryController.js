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
exports.LibraryController = void 0;
const libraryItem_1 = require("../models/libraryItem");
const storage_1 = require("../services/storage");
const parseTags = (tags) => {
    if (Array.isArray(tags))
        return tags.map(String).map(tag => tag.trim()).filter(Boolean);
    return String(tags !== null && tags !== void 0 ? tags : '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
};
class LibraryController {
    list(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield storage_1.storageService.getAllLibraryItems();
            res.json(list);
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = req.file;
            const item = (0, libraryItem_1.createLibraryItem)({
                courseId: req.body.courseId,
                title: req.body.title,
                description: req.body.description,
                type: req.body.type || (file ? 'file' : 'link'),
                category: req.body.category,
                author: req.body.author,
                publisher: req.body.publisher,
                tags: parseTags(req.body.tags),
                externalUrl: req.body.externalUrl,
                fileName: file ? file.originalname : undefined,
                filePath: file ? file.filename : undefined
            });
            yield storage_1.storageService.saveLibraryItem(item);
            res.status(201).json(item);
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield storage_1.storageService.updateLibraryItem(req.params.id, Object.assign(Object.assign({}, req.body), { tags: req.body.tags !== undefined ? parseTags(req.body.tags) : undefined }));
                res.json({ message: 'updated' });
            }
            catch (e) {
                res.status(404).json({ error: String(e) });
            }
        });
    }
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield storage_1.storageService.deleteLibraryItem(req.params.id);
            res.json({ message: 'deleted' });
        });
    }
}
exports.LibraryController = LibraryController;
