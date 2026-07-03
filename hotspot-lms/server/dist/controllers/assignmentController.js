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
exports.AssignmentController = void 0;
const storage_1 = require("../services/storage");
const assignment_1 = require("../models/assignment");
const question_1 = require("../models/question");
class AssignmentController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield storage_1.storageService.getAllAssignments();
            res.json(list);
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { courseId, title, description, dueDate, autoCheck, activityType, timeLimitMinutes, attemptLimit, randomizeQuestions, randomizeChoices, questions } = req.body;
            const normalizedQuestions = Array.isArray(questions) ? questions.map((q) => (0, question_1.createQuestion)(q)) : [];
            const a = (0, assignment_1.createAssignment)({
                courseId,
                title,
                description,
                dueDate,
                autoCheck: Boolean(autoCheck),
                activityType,
                timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined,
                attemptLimit: attemptLimit ? Number(attemptLimit) : undefined,
                randomizeQuestions: Boolean(randomizeQuestions),
                randomizeChoices: Boolean(randomizeChoices),
                questions: normalizedQuestions
            });
            yield storage_1.storageService.saveAssignment(a);
            res.status(201).json(a);
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                yield storage_1.storageService.updateAssignment(id, req.body);
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
            yield storage_1.storageService.deleteAssignment(id);
            res.json({ message: 'deleted' });
        });
    }
    // Questions
    addQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id; // assignment id
            const q = (0, question_1.createQuestion)(req.body);
            const list = yield storage_1.storageService.getAllAssignments();
            const idx = list.findIndex((a) => a.id === id);
            if (idx === -1)
                return res.status(404).json({ error: 'assignment not found' });
            list[idx].questions = list[idx].questions || [];
            list[idx].questions.push(q);
            yield storage_1.storageService.updateAssignment(id, { questions: list[idx].questions });
            res.status(201).json(q);
        });
    }
    removeQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id; // assignment id
            const qid = req.params.qid;
            const list = yield storage_1.storageService.getAllAssignments();
            const idx = list.findIndex((a) => a.id === id);
            if (idx === -1)
                return res.status(404).json({ error: 'assignment not found' });
            list[idx].questions = (list[idx].questions || []).filter((q) => q.id !== qid);
            yield storage_1.storageService.updateAssignment(id, { questions: list[idx].questions });
            res.json({ message: 'question removed' });
        });
    }
}
exports.AssignmentController = AssignmentController;
