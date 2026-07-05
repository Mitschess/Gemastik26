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
exports.requireTeacher = requireTeacher;
const storage_1 = require("../services/storage");
function requireTeacher(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Login guru diperlukan' });
        }
        const users = yield storage_1.storageService.getAllUsers();
        const user = users.find(u => u.id === userId);
        if (!user || user.role !== 'teacher') {
            return res.status(403).json({ error: 'Hanya guru yang dapat mengakses fitur AI' });
        }
        req.teacher = user;
        return next();
    });
}
