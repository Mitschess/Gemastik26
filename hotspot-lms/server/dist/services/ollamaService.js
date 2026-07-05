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
exports.askAI = askAI;
exports.chatAI = chatAI;
exports.checkOllamaHealth = checkOllamaHealth;
exports.getModelName = getModelName;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';
function askAI(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const res = yield fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL,
                prompt,
                stream: false,
                options: { temperature: 0.3, num_predict: 512 }
            })
        });
        if (!res.ok)
            throw new Error(`Ollama error: ${res.status}`);
        const data = (yield res.json());
        return ((_a = data.response) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    });
}
function chatAI(messages) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const res = yield fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL,
                messages,
                stream: false,
                options: { temperature: 0.7, num_predict: 512 }
            })
        });
        if (!res.ok)
            throw new Error(`Ollama error: ${res.status}`);
        const data = (yield res.json());
        return ((_b = (_a = data.message) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.trim()) || '';
    });
}
function checkOllamaHealth() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch(`${OLLAMA_URL}/api/tags`);
            return res.ok;
        }
        catch (_a) {
            return false;
        }
    });
}
function getModelName() {
    return MODEL;
}
