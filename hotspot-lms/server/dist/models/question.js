"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuestion = createQuestion;
function createQuestion(data) {
    var _a, _b, _c, _d, _e;
    return {
        id: (_a = data.id) !== null && _a !== void 0 ? _a : Date.now().toString(),
        type: (_b = data.type) !== null && _b !== void 0 ? _b : 'essay',
        prompt: (_c = data.prompt) !== null && _c !== void 0 ? _c : '',
        choices: (_d = data.choices) !== null && _d !== void 0 ? _d : [],
        answer: data.answer,
        points: (_e = data.points) !== null && _e !== void 0 ? _e : 1
    };
}
