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
exports.AuthController = void 0;
const storage_1 = require("../services/storage");
const user_1 = require("../models/user");
class AuthController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            const users = yield storage_1.storageService.getAllUsers();
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                res.status(200).json({
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        role: user.role,
                        studentId: user.studentId
                    }
                });
            }
            else {
                res.status(401).json({ error: 'Invalid username or password' });
            }
        });
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // This could be used for initial setup or by teachers
            const { username, password, name, role, studentId } = req.body;
            const users = yield storage_1.storageService.getAllUsers();
            if (users.find(u => u.username === username)) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            const newUser = (0, user_1.createUser)({ username, password, name, role, studentId });
            yield storage_1.storageService.saveUser(newUser);
            res.status(201).json(newUser);
        });
    }
    listUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield storage_1.storageService.getAllUsers();
            res.json(users);
        });
    }
    removeUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield storage_1.storageService.deleteUser(id);
            res.json({ message: 'User deleted' });
        });
    }
}
exports.AuthController = AuthController;
