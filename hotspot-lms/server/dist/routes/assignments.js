"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignmentController_1 = require("../controllers/assignmentController");
const router = (0, express_1.Router)();
const ctrl = new assignmentController_1.AssignmentController();
router.get('/', (req, res) => ctrl.list(req, res));
router.post('/', (req, res) => ctrl.create(req, res));
router.put('/:id', (req, res) => ctrl.update(req, res));
router.delete('/:id', (req, res) => ctrl.remove(req, res));
// questions
router.post('/:id/questions', (req, res) => ctrl.addQuestion(req, res));
router.delete('/:id/questions/:qid', (req, res) => ctrl.removeQuestion(req, res));
exports.default = router;
