"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuestionBankItem = createQuestionBankItem;
function createQuestionBankItem(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return {
        id: (_a = data.id) !== null && _a !== void 0 ? _a : Date.now().toString(),
        type: (_b = data.type) !== null && _b !== void 0 ? _b : 'mcq',
        prompt: (_c = data.prompt) !== null && _c !== void 0 ? _c : '',
        choices: (_d = data.choices) !== null && _d !== void 0 ? _d : [],
        answer: (_e = data.answer) !== null && _e !== void 0 ? _e : '',
        points: (_f = data.points) !== null && _f !== void 0 ? _f : 1,
        category: (_g = data.category) !== null && _g !== void 0 ? _g : 'Umum',
        difficulty: (_h = data.difficulty) !== null && _h !== void 0 ? _h : 'medium',
        createdAt: (_j = data.createdAt) !== null && _j !== void 0 ? _j : new Date().toISOString()
    };
}
