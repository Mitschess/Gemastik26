"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIVE_QUIZ_COUNTDOWN_SEC = void 0;
exports.generateLiveQuizCode = generateLiveQuizCode;
exports.createLiveQuiz = createLiveQuiz;
exports.createLiveQuizQuestion = createLiveQuizQuestion;
const uuid_1 = require("uuid");
const DEFAULT_COUNTDOWN_SEC = 3;
exports.LIVE_QUIZ_COUNTDOWN_SEC = DEFAULT_COUNTDOWN_SEC;
// Kode join 6 karakter (huruf besar + angka, tanpa karakter ambigu seperti 0/O/1/I)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateLiveQuizCode() {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return code;
}
function createLiveQuiz(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    return {
        id: (_a = data.id) !== null && _a !== void 0 ? _a : (0, uuid_1.v4)(),
        teacherId: (_b = data.teacherId) !== null && _b !== void 0 ? _b : '',
        teacherName: (_c = data.teacherName) !== null && _c !== void 0 ? _c : '',
        title: (_d = data.title) !== null && _d !== void 0 ? _d : 'Live Quiz',
        status: (_e = data.status) !== null && _e !== void 0 ? _e : 'draft',
        visibility: (_f = data.visibility) !== null && _f !== void 0 ? _f : 'public',
        code: (_g = data.code) !== null && _g !== void 0 ? _g : generateLiveQuizCode(),
        questions: (_h = data.questions) !== null && _h !== void 0 ? _h : [],
        settings: {
            timePerQuestionSec: (_k = (_j = data.settings) === null || _j === void 0 ? void 0 : _j.timePerQuestionSec) !== null && _k !== void 0 ? _k : 20,
            shuffleAnswers: (_m = (_l = data.settings) === null || _l === void 0 ? void 0 : _l.shuffleAnswers) !== null && _m !== void 0 ? _m : false,
            shuffleQuestionOrder: (_p = (_o = data.settings) === null || _o === void 0 ? void 0 : _o.shuffleQuestionOrder) !== null && _p !== void 0 ? _p : false
        },
        sessionQuestions: (_q = data.sessionQuestions) !== null && _q !== void 0 ? _q : [],
        currentQuestionIndex: (_r = data.currentQuestionIndex) !== null && _r !== void 0 ? _r : -1,
        currentQuestionStartedAt: (_s = data.currentQuestionStartedAt) !== null && _s !== void 0 ? _s : null,
        countdownStartedAt: (_t = data.countdownStartedAt) !== null && _t !== void 0 ? _t : null,
        createdAt: (_u = data.createdAt) !== null && _u !== void 0 ? _u : new Date().toISOString(),
        startedAt: (_v = data.startedAt) !== null && _v !== void 0 ? _v : null,
        finishedAt: (_w = data.finishedAt) !== null && _w !== void 0 ? _w : null
    };
}
function createLiveQuizQuestion(data) {
    var _a, _b, _c, _d, _e;
    return {
        id: (_a = data.id) !== null && _a !== void 0 ? _a : (0, uuid_1.v4)(),
        prompt: (_b = data.prompt) !== null && _b !== void 0 ? _b : '',
        choices: (_c = data.choices) !== null && _c !== void 0 ? _c : [],
        correctIndex: (_d = data.correctIndex) !== null && _d !== void 0 ? _d : 0,
        sourceQuestionBankId: data.sourceQuestionBankId,
        points: (_e = data.points) !== null && _e !== void 0 ? _e : 1
    };
}
