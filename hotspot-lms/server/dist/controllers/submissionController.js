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
exports.SubmissionController = void 0;
const storage_1 = require("../services/storage");
const uuid_1 = require("uuid");
const normalizeAnswer = (value) => String(value !== null && value !== void 0 ? value : '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
class SubmissionController {
    createSubmission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentId, studentName, assignmentId, content, answers } = req.body;
                if (!studentId || !assignmentId) {
                    res.status(400).json({ message: 'studentId and assignmentId are required' });
                    return;
                }
                let parsedAnswers = [];
                if (answers) {
                    try {
                        parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers;
                    }
                    catch (e) {
                        console.error('Error parsing answers:', e);
                    }
                }
                const file = req.file;
                const assignments = yield storage_1.storageService.getAllAssignments();
                const assignment = assignments.find((item) => item.id === assignmentId);
                const submission = {
                    id: (0, uuid_1.v4)(),
                    studentId,
                    studentName: studentName || '',
                    assignmentId,
                    courseId: (assignment === null || assignment === void 0 ? void 0 : assignment.courseId) || '',
                    content: content || '',
                    answers: parsedAnswers,
                    fileName: file ? file.originalname : undefined,
                    filePath: file ? file.filename : undefined,
                    submittedAt: new Date(),
                };
                const questionsWithKeys = ((assignment === null || assignment === void 0 ? void 0 : assignment.questions) || []).filter((q) => normalizeAnswer(q.answer));
                if ((assignment === null || assignment === void 0 ? void 0 : assignment.autoCheck) && questionsWithKeys.length > 0) {
                    const answerMap = new Map(parsedAnswers.map((item) => [item.questionId, item.answer]));
                    let correctCount = 0;
                    const earnedPoints = questionsWithKeys.reduce((total, question) => {
                        const studentAnswer = answerMap.get(question.id);
                        const isCorrect = normalizeAnswer(studentAnswer) === normalizeAnswer(question.answer);
                        if (isCorrect)
                            correctCount += 1;
                        return total + (isCorrect ? Number(question.points || 1) : 0);
                    }, 0);
                    const totalPoints = questionsWithKeys.reduce((total, question) => total + Number(question.points || 1), 0);
                    submission.grade = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
                    submission.feedback = `Auto check: ${correctCount} dari ${questionsWithKeys.length} jawaban sesuai kunci.`;
                    submission.gradedAt = new Date().toISOString();
                    submission.autoChecked = true;
                    submission.correctCount = correctCount;
                    submission.totalAutoQuestions = questionsWithKeys.length;
                    submission.earnedPoints = earnedPoints;
                    submission.totalPoints = totalPoints;
                }
                yield storage_1.storageService.saveSubmission(submission);
                res.status(201).json({ message: 'Submission created successfully', submission });
            }
            catch (error) {
                res.status(500).json({ message: 'Error creating submission', error: String(error) });
            }
        });
    }
    getSubmissions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const submissions = yield storage_1.storageService.getAllSubmissions();
                // sort newest first
                submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
                res.status(200).json(submissions);
            }
            catch (error) {
                res.status(500).json({ message: 'Error retrieving submissions', error: String(error) });
            }
        });
    }
    gradeSubmission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { grade, feedback } = req.body;
                if (grade === undefined || grade === null) {
                    res.status(400).json({ message: 'grade is required' });
                    return;
                }
                const numGrade = Number(grade);
                if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
                    res.status(400).json({ message: 'grade must be 0-100' });
                    return;
                }
                const updated = yield storage_1.storageService.updateSubmission(id, {
                    grade: numGrade,
                    feedback: feedback || '',
                    gradedAt: new Date().toISOString()
                });
                if (!updated) {
                    res.status(404).json({ message: 'Submission not found' });
                    return;
                }
                res.json({ message: 'Graded successfully', submission: updated });
            }
            catch (error) {
                res.status(500).json({ message: 'Error grading submission', error: String(error) });
            }
        });
    }
    deleteSubmission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deleted = yield storage_1.storageService.deleteSubmission(id);
                if (!deleted) {
                    res.status(404).json({ message: 'Submission not found' });
                    return;
                }
                res.json({ message: 'Deleted successfully' });
            }
            catch (error) {
                res.status(500).json({ message: 'Error deleting submission', error: String(error) });
            }
        });
    }
}
exports.SubmissionController = SubmissionController;
