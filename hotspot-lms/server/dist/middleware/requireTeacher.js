"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTeacher = requireTeacher;
function requireTeacher(req, res, next) {
    const role = req.headers['x-user-role'];
    if (role !== 'teacher') {
        return res.status(403).json({ error: 'Hanya guru yang bisa akses AI' });
    }
    next();
}
