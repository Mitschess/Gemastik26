"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCourse = createCourse;
function createCourse(data) {
    var _a, _b, _c, _d, _e, _f, _g;
    return {
        id: (_a = data.id) !== null && _a !== void 0 ? _a : Date.now().toString(),
        title: (_b = data.title) !== null && _b !== void 0 ? _b : 'Untitled Course',
        description: (_c = data.description) !== null && _c !== void 0 ? _c : '',
        code: (_d = data.code) !== null && _d !== void 0 ? _d : '',
        teacherName: (_e = data.teacherName) !== null && _e !== void 0 ? _e : '',
        archived: (_f = data.archived) !== null && _f !== void 0 ? _f : false,
        createdAt: (_g = data.createdAt) !== null && _g !== void 0 ? _g : new Date().toISOString()
    };
}
