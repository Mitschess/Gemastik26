"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLibraryItem = createLibraryItem;
function createLibraryItem(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return {
        id: (_a = data.id) !== null && _a !== void 0 ? _a : Date.now().toString(),
        courseId: (_b = data.courseId) !== null && _b !== void 0 ? _b : '',
        title: (_c = data.title) !== null && _c !== void 0 ? _c : 'Untitled Library Item',
        description: (_d = data.description) !== null && _d !== void 0 ? _d : '',
        type: (_e = data.type) !== null && _e !== void 0 ? _e : 'file',
        category: (_f = data.category) !== null && _f !== void 0 ? _f : 'Umum',
        author: (_g = data.author) !== null && _g !== void 0 ? _g : '',
        publisher: (_h = data.publisher) !== null && _h !== void 0 ? _h : '',
        tags: (_j = data.tags) !== null && _j !== void 0 ? _j : [],
        externalUrl: (_k = data.externalUrl) !== null && _k !== void 0 ? _k : '',
        fileName: data.fileName,
        filePath: data.filePath,
        createdAt: (_l = data.createdAt) !== null && _l !== void 0 ? _l : new Date().toISOString()
    };
}
