"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMaterial = createMaterial;
function createMaterial(data) {
    var _a, _b, _c, _d, _e;
    return {
        id: (_a = data.id) !== null && _a !== void 0 ? _a : Date.now().toString(),
        courseId: (_b = data.courseId) !== null && _b !== void 0 ? _b : '',
        title: (_c = data.title) !== null && _c !== void 0 ? _c : 'Untitled',
        description: (_d = data.description) !== null && _d !== void 0 ? _d : '',
        fileName: data.fileName,
        filePath: data.filePath,
        createdAt: (_e = data.createdAt) !== null && _e !== void 0 ? _e : new Date().toISOString()
    };
}
