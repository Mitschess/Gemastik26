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
exports.ollamaGenerate = ollamaGenerate;
exports.ollamaStatus = ollamaStatus;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b-instruct';
function ollamaGenerate(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false,
                options: { temperature: 0.4, num_predict: 1024 }
            })
        });
        if (!res.ok) {
            const body = yield res.text();
            throw new Error(`Ollama error (${res.status}): ${body}`);
        }
        const data = yield res.json();
        return (data.response || '').trim();
    });
}
function ollamaStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch(`${OLLAMA_URL}/api/tags`);
            if (!res.ok) {
                return { online: false, model: OLLAMA_MODEL, models: [] };
            }
            const data = yield res.json();
            const models = (data.models || []).map(m => m.name);
            return { online: true, model: OLLAMA_MODEL, models };
        }
        catch (_a) {
            return { online: false, model: OLLAMA_MODEL, models: [] };
        }
    });
}
