"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
function createUser(data) {
    var _a, _b, _c, _d, _e;
    return {
        id: (_a = data.id) !== null && _a !== void 0 ? _a : Date.now().toString(),
        username: (_b = data.username) !== null && _b !== void 0 ? _b : '',
        password: (_c = data.password) !== null && _c !== void 0 ? _c : '',
        name: (_d = data.name) !== null && _d !== void 0 ? _d : '',
        role: (_e = data.role) !== null && _e !== void 0 ? _e : 'student',
        studentId: data.studentId
    };
}
