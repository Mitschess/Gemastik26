"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLiveQuizParticipant = createLiveQuizParticipant;
const uuid_1 = require("uuid");
function createLiveQuizParticipant(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    return {
        id: (_a = data.id) !== null && _a !== void 0 ? _a : (0, uuid_1.v4)(),
        liveQuizId: (_b = data.liveQuizId) !== null && _b !== void 0 ? _b : '',
        studentId: (_c = data.studentId) !== null && _c !== void 0 ? _c : '',
        studentName: (_d = data.studentName) !== null && _d !== void 0 ? _d : '',
        joinedAt: (_e = data.joinedAt) !== null && _e !== void 0 ? _e : new Date().toISOString(),
        answers: (_f = data.answers) !== null && _f !== void 0 ? _f : [],
        correctCount: (_g = data.correctCount) !== null && _g !== void 0 ? _g : 0,
        wrongCount: (_h = data.wrongCount) !== null && _h !== void 0 ? _h : 0,
        finished: (_j = data.finished) !== null && _j !== void 0 ? _j : false,
        finishedAt: (_k = data.finishedAt) !== null && _k !== void 0 ? _k : null,
        qIndex: (_l = data.qIndex) !== null && _l !== void 0 ? _l : -1,
        qStartedAt: (_m = data.qStartedAt) !== null && _m !== void 0 ? _m : null,
        rankingScore: (_o = data.rankingScore) !== null && _o !== void 0 ? _o : 0
    };
}
