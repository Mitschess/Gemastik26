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
exports.QuestionBankController = void 0;
const questionBank_1 = require("../models/questionBank");
const storage_1 = require("../services/storage");
class QuestionBankController {
    list(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield storage_1.storageService.getAllQuestionBankItems();
            res.json(list);
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = (0, questionBank_1.createQuestionBankItem)(req.body);
            yield storage_1.storageService.saveQuestionBankItem(item);
            res.status(201).json(item);
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield storage_1.storageService.updateQuestionBankItem(req.params.id, req.body);
                res.json({ message: 'updated' });
            }
            catch (e) {
                res.status(404).json({ error: String(e) });
            }
        });
    }
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield storage_1.storageService.deleteQuestionBankItem(req.params.id);
            res.json({ message: 'deleted' });
        });
    }
}
exports.QuestionBankController = QuestionBankController;
