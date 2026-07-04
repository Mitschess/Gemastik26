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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.getSubmissionFile = exports.saveSubmissionFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const storagePath = path_1.default.join(__dirname, '../../uploads');
const dataPath = path_1.default.join(__dirname, '../../data');
const submissionsDb = path_1.default.join(dataPath, 'submissions.json');
const materialsDb = path_1.default.join(dataPath, 'materials.json');
const assignmentsDb = path_1.default.join(dataPath, 'assignments.json');
const usersDb = path_1.default.join(dataPath, 'users.json');
const coursesDb = path_1.default.join(dataPath, 'courses.json');
const questionBankDb = path_1.default.join(dataPath, 'questionBank.json');
const libraryDb = path_1.default.join(dataPath, 'library.json');
const ensureDir = (dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
const ensureDataPathExists = () => {
    ensureDir(dataPath);
    ensureDir(storagePath);
    if (!fs_1.default.existsSync(submissionsDb)) {
        fs_1.default.writeFileSync(submissionsDb, JSON.stringify([]));
    }
    if (!fs_1.default.existsSync(materialsDb)) {
        fs_1.default.writeFileSync(materialsDb, JSON.stringify([]));
    }
    if (!fs_1.default.existsSync(assignmentsDb)) {
        fs_1.default.writeFileSync(assignmentsDb, JSON.stringify([]));
    }
    if (!fs_1.default.existsSync(usersDb)) {
        // Default admin user
        fs_1.default.writeFileSync(usersDb, JSON.stringify([{
                id: 'admin',
                username: 'admin',
                password: 'admin',
                name: 'Default Teacher',
                role: 'teacher'
            }], null, 2));
    }
    if (!fs_1.default.existsSync(coursesDb)) {
        fs_1.default.writeFileSync(coursesDb, JSON.stringify([]));
    }
    if (!fs_1.default.existsSync(questionBankDb)) {
        fs_1.default.writeFileSync(questionBankDb, JSON.stringify([]));
    }
    if (!fs_1.default.existsSync(libraryDb)) {
        fs_1.default.writeFileSync(libraryDb, JSON.stringify([]));
    }
};
const saveSubmissionFile = (fileName, fileData) => {
    return new Promise((resolve, reject) => {
        ensureDir(storagePath);
        const filePath = path_1.default.join(storagePath, fileName);
        fs_1.default.writeFile(filePath, fileData, (err) => {
            if (err)
                return reject(err);
            resolve(filePath);
        });
    });
};
exports.saveSubmissionFile = saveSubmissionFile;
const getSubmissionFile = (fileName) => {
    return new Promise((resolve, reject) => {
        const filePath = path_1.default.join(storagePath, fileName);
        fs_1.default.readFile(filePath, (err, data) => {
            if (err)
                return reject(err);
            resolve(data);
        });
    });
};
exports.getSubmissionFile = getSubmissionFile;
exports.storageService = {
    // Submissions
    getAllSubmissions() {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const raw = fs_1.default.readFileSync(submissionsDb, 'utf-8');
            try {
                return JSON.parse(raw);
            }
            catch (_a) {
                return [];
            }
        });
    },
    saveSubmission(sub) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllSubmissions();
            list.push(sub);
            fs_1.default.writeFileSync(submissionsDb, JSON.stringify(list, null, 2));
        });
    },
    updateSubmission(id, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllSubmissions();
            const idx = list.findIndex(s => s.id === id);
            if (idx === -1)
                return null;
            list[idx] = Object.assign(Object.assign({}, list[idx]), patch);
            fs_1.default.writeFileSync(submissionsDb, JSON.stringify(list, null, 2));
            return list[idx];
        });
    },
    deleteSubmission(id) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllSubmissions();
            const filtered = list.filter(s => s.id !== id);
            if (filtered.length === list.length)
                return false;
            fs_1.default.writeFileSync(submissionsDb, JSON.stringify(filtered, null, 2));
            return true;
        });
    },
    // Materials
    getAllMaterials() {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const raw = fs_1.default.readFileSync(materialsDb, 'utf-8');
            try {
                return JSON.parse(raw);
            }
            catch (_a) {
                return [];
            }
        });
    },
    saveMaterial(mat) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllMaterials();
            list.push(mat);
            fs_1.default.writeFileSync(materialsDb, JSON.stringify(list, null, 2));
        });
    },
    updateMaterial(id, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllMaterials();
            const idx = list.findIndex((m) => m.id === id);
            if (idx === -1)
                throw new Error('Not found');
            list[idx] = Object.assign(Object.assign({}, list[idx]), patch);
            fs_1.default.writeFileSync(materialsDb, JSON.stringify(list, null, 2));
        });
    },
    deleteMaterial(id) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllMaterials();
            const filtered = list.filter((m) => m.id !== id);
            fs_1.default.writeFileSync(materialsDb, JSON.stringify(filtered, null, 2));
        });
    },
    // Assignments
    getAllAssignments() {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const raw = fs_1.default.readFileSync(assignmentsDb, 'utf-8');
            try {
                return JSON.parse(raw);
            }
            catch (_a) {
                return [];
            }
        });
    },
    saveAssignment(a) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllAssignments();
            list.push(a);
            fs_1.default.writeFileSync(assignmentsDb, JSON.stringify(list, null, 2));
        });
    },
    updateAssignment(id, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllAssignments();
            const idx = list.findIndex((m) => m.id === id);
            if (idx === -1)
                throw new Error('Not found');
            list[idx] = Object.assign(Object.assign({}, list[idx]), patch);
            fs_1.default.writeFileSync(assignmentsDb, JSON.stringify(list, null, 2));
        });
    },
    deleteAssignment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllAssignments();
            const filtered = list.filter((m) => m.id !== id);
            fs_1.default.writeFileSync(assignmentsDb, JSON.stringify(filtered, null, 2));
        });
    },
    // Courses
    getAllCourses() {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const raw = fs_1.default.readFileSync(coursesDb, 'utf-8');
            try {
                return JSON.parse(raw);
            }
            catch (_a) {
                return [];
            }
        });
    },
    saveCourse(course) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllCourses();
            list.push(course);
            fs_1.default.writeFileSync(coursesDb, JSON.stringify(list, null, 2));
        });
    },
    updateCourse(id, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllCourses();
            const idx = list.findIndex((course) => course.id === id);
            if (idx === -1)
                throw new Error('Not found');
            list[idx] = Object.assign(Object.assign({}, list[idx]), patch);
            fs_1.default.writeFileSync(coursesDb, JSON.stringify(list, null, 2));
        });
    },
    deleteCourse(id) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllCourses();
            const filtered = list.filter((course) => course.id !== id);
            fs_1.default.writeFileSync(coursesDb, JSON.stringify(filtered, null, 2));
        });
    },
    // Question Bank
    getAllQuestionBankItems() {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const raw = fs_1.default.readFileSync(questionBankDb, 'utf-8');
            try {
                return JSON.parse(raw);
            }
            catch (_a) {
                return [];
            }
        });
    },
    saveQuestionBankItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllQuestionBankItems();
            list.push(item);
            fs_1.default.writeFileSync(questionBankDb, JSON.stringify(list, null, 2));
        });
    },
    updateQuestionBankItem(id, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllQuestionBankItems();
            const idx = list.findIndex((item) => item.id === id);
            if (idx === -1)
                throw new Error('Not found');
            list[idx] = Object.assign(Object.assign({}, list[idx]), patch);
            fs_1.default.writeFileSync(questionBankDb, JSON.stringify(list, null, 2));
        });
    },
    deleteQuestionBankItem(id) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllQuestionBankItems();
            const filtered = list.filter((item) => item.id !== id);
            fs_1.default.writeFileSync(questionBankDb, JSON.stringify(filtered, null, 2));
        });
    },
    // Library
    getAllLibraryItems() {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const raw = fs_1.default.readFileSync(libraryDb, 'utf-8');
            try {
                return JSON.parse(raw);
            }
            catch (_a) {
                return [];
            }
        });
    },
    saveLibraryItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllLibraryItems();
            list.push(item);
            fs_1.default.writeFileSync(libraryDb, JSON.stringify(list, null, 2));
        });
    },
    updateLibraryItem(id, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllLibraryItems();
            const idx = list.findIndex((item) => item.id === id);
            if (idx === -1)
                throw new Error('Not found');
            list[idx] = Object.assign(Object.assign({}, list[idx]), patch);
            fs_1.default.writeFileSync(libraryDb, JSON.stringify(list, null, 2));
        });
    },
    deleteLibraryItem(id) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllLibraryItems();
            const filtered = list.filter((item) => item.id !== id);
            fs_1.default.writeFileSync(libraryDb, JSON.stringify(filtered, null, 2));
        });
    },
    getUploadsPath() {
        ensureDir(storagePath);
        return storagePath;
    },
    // Users
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const raw = fs_1.default.readFileSync(usersDb, 'utf-8');
            try {
                return JSON.parse(raw);
            }
            catch (_a) {
                return [];
            }
        });
    },
    saveUser(u) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllUsers();
            list.push(u);
            fs_1.default.writeFileSync(usersDb, JSON.stringify(list, null, 2));
        });
    },
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            ensureDataPathExists();
            const list = yield this.getAllUsers();
            const filtered = list.filter((u) => u.id !== id);
            fs_1.default.writeFileSync(usersDb, JSON.stringify(filtered, null, 2));
        });
    }
};
