"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignment = createAssignment;
function createAssignment(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return {
        id: (_a = data.id) !== null && _a !== void 0 ? _a : Date.now().toString(),
        courseId: (_b = data.courseId) !== null && _b !== void 0 ? _b : '',
        title: (_c = data.title) !== null && _c !== void 0 ? _c : 'Untitled Assignment',
        description: (_d = data.description) !== null && _d !== void 0 ? _d : '',
        dueDate: data.dueDate,
        autoCheck: (_e = data.autoCheck) !== null && _e !== void 0 ? _e : false,
        activityType: (_f = data.activityType) !== null && _f !== void 0 ? _f : 'assignment',
        timeLimitMinutes: data.timeLimitMinutes,
        attemptLimit: data.attemptLimit,
        randomizeQuestions: (_g = data.randomizeQuestions) !== null && _g !== void 0 ? _g : false,
        randomizeChoices: (_h = data.randomizeChoices) !== null && _h !== void 0 ? _h : false,
        questions: (_j = data.questions) !== null && _j !== void 0 ? _j : [],
        createdAt: (_k = data.createdAt) !== null && _k !== void 0 ? _k : new Date().toISOString()
    };
}
