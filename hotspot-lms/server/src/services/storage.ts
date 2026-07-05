import fs from 'fs';
import path from 'path';
import { Submission } from '../models/submission';

const storagePath = path.join(__dirname, '../../uploads');
const dataPath = path.join(__dirname, '../../data');
const submissionsDb = path.join(dataPath, 'submissions.json');
const materialsDb = path.join(dataPath, 'materials.json');
const assignmentsDb = path.join(dataPath, 'assignments.json');
const usersDb = path.join(dataPath, 'users.json');
const coursesDb = path.join(dataPath, 'courses.json');
const questionBankDb = path.join(dataPath, 'questionBank.json');
const libraryDb = path.join(dataPath, 'library.json');

const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const ensureDataPathExists = () => {
    ensureDir(dataPath);
    ensureDir(storagePath);
    if (!fs.existsSync(submissionsDb)) {
        fs.writeFileSync(submissionsDb, JSON.stringify([]));
    }
    if (!fs.existsSync(materialsDb)) {
        fs.writeFileSync(materialsDb, JSON.stringify([]));
    }
    if (!fs.existsSync(assignmentsDb)) {
        fs.writeFileSync(assignmentsDb, JSON.stringify([]));
    }
    if (!fs.existsSync(usersDb)) {
        // Default admin user
        fs.writeFileSync(usersDb, JSON.stringify([{
            id: 'admin',
            username: 'admin',
            password: 'admin',
            name: 'Default Teacher',
            role: 'teacher'
        }], null, 2));
    }
    if (!fs.existsSync(coursesDb)) {
        fs.writeFileSync(coursesDb, JSON.stringify([]));
    }
    if (!fs.existsSync(questionBankDb)) {
        fs.writeFileSync(questionBankDb, JSON.stringify([]));
    }
    if (!fs.existsSync(libraryDb)) {
        fs.writeFileSync(libraryDb, JSON.stringify([]));
    }
};

export const saveSubmissionFile = (fileName: string, fileData: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        ensureDir(storagePath);
        const filePath = path.join(storagePath, fileName);
        fs.writeFile(filePath, fileData, (err) => {
            if (err) return reject(err);
            resolve(filePath);
        });
    });
};

export const getSubmissionFile = (fileName: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(storagePath, fileName);
        fs.readFile(filePath, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

export const storageService = {
    // Submissions
    async getAllSubmissions(): Promise<Submission[]> {
        ensureDataPathExists();
        const raw = fs.readFileSync(submissionsDb, 'utf-8');
        try { return JSON.parse(raw) as Submission[]; }
        catch { return []; }
    },

    async saveSubmission(sub: Submission): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllSubmissions();
        list.push(sub);
        fs.writeFileSync(submissionsDb, JSON.stringify(list, null, 2));
    },

    async updateSubmission(id: string, patch: Partial<Submission>): Promise<Submission | null> {
        ensureDataPathExists();
        const list = await this.getAllSubmissions();
        const idx = list.findIndex(s => s.id === id);
        if (idx === -1) return null;
        list[idx] = { ...list[idx], ...patch };
        fs.writeFileSync(submissionsDb, JSON.stringify(list, null, 2));
        return list[idx];
    },

    async deleteSubmission(id: string): Promise<boolean> {
        ensureDataPathExists();
        const list = await this.getAllSubmissions();
        const filtered = list.filter(s => s.id !== id);
        if (filtered.length === list.length) return false;
        fs.writeFileSync(submissionsDb, JSON.stringify(filtered, null, 2));
        return true;
    },

    // Materials
    async getAllMaterials(): Promise<any[]> {
        ensureDataPathExists();
        const raw = fs.readFileSync(materialsDb, 'utf-8');
        try { return JSON.parse(raw); } catch { return []; }
    },
    async saveMaterial(mat: any): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllMaterials();
        list.push(mat);
        fs.writeFileSync(materialsDb, JSON.stringify(list, null, 2));
    },
    async updateMaterial(id: string, patch: Partial<any>): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllMaterials();
        const idx = list.findIndex((m: any) => m.id === id);
        if (idx === -1) throw new Error('Not found');
        list[idx] = { ...list[idx], ...patch };
        fs.writeFileSync(materialsDb, JSON.stringify(list, null, 2));
    },
    async deleteMaterial(id: string): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllMaterials();
        const filtered = list.filter((m: any) => m.id !== id);
        fs.writeFileSync(materialsDb, JSON.stringify(filtered, null, 2));
    },

    // Assignments
    async getAllAssignments(): Promise<any[]> {
        ensureDataPathExists();
        const raw = fs.readFileSync(assignmentsDb, 'utf-8');
        try { return JSON.parse(raw); } catch { return []; }
    },
    async saveAssignment(a: any): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllAssignments();
        list.push(a);
        fs.writeFileSync(assignmentsDb, JSON.stringify(list, null, 2));
    },
    async updateAssignment(id: string, patch: Partial<any>): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllAssignments();
        const idx = list.findIndex((m: any) => m.id === id);
        if (idx === -1) throw new Error('Not found');
        list[idx] = { ...list[idx], ...patch };
        fs.writeFileSync(assignmentsDb, JSON.stringify(list, null, 2));
    },
    async deleteAssignment(id: string): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllAssignments();
        const filtered = list.filter((m: any) => m.id !== id);
        fs.writeFileSync(assignmentsDb, JSON.stringify(filtered, null, 2));
    },

    // Courses
    async getAllCourses(): Promise<any[]> {
        ensureDataPathExists();
        const raw = fs.readFileSync(coursesDb, 'utf-8');
        try { return JSON.parse(raw); } catch { return []; }
    },
    async saveCourse(course: any): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllCourses();
        list.push(course);
        fs.writeFileSync(coursesDb, JSON.stringify(list, null, 2));
    },
    async updateCourse(id: string, patch: Partial<any>): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllCourses();
        const idx = list.findIndex((course: any) => course.id === id);
        if (idx === -1) throw new Error('Not found');
        list[idx] = { ...list[idx], ...patch };
        fs.writeFileSync(coursesDb, JSON.stringify(list, null, 2));
    },
    async deleteCourse(id: string): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllCourses();
        const filtered = list.filter((course: any) => course.id !== id);
        fs.writeFileSync(coursesDb, JSON.stringify(filtered, null, 2));
    },

    // Question Bank
    async getAllQuestionBankItems(): Promise<any[]> {
        ensureDataPathExists();
        const raw = fs.readFileSync(questionBankDb, 'utf-8');
        try { return JSON.parse(raw); } catch { return []; }
    },
    async saveQuestionBankItem(item: any): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllQuestionBankItems();
        list.push(item);
        fs.writeFileSync(questionBankDb, JSON.stringify(list, null, 2));
    },
    async updateQuestionBankItem(id: string, patch: Partial<any>): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllQuestionBankItems();
        const idx = list.findIndex((item: any) => item.id === id);
        if (idx === -1) throw new Error('Not found');
        list[idx] = { ...list[idx], ...patch };
        fs.writeFileSync(questionBankDb, JSON.stringify(list, null, 2));
    },
    async deleteQuestionBankItem(id: string): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllQuestionBankItems();
        const filtered = list.filter((item: any) => item.id !== id);
        fs.writeFileSync(questionBankDb, JSON.stringify(filtered, null, 2));
    },

    // Library
    async getAllLibraryItems(): Promise<any[]> {
        ensureDataPathExists();
        const raw = fs.readFileSync(libraryDb, 'utf-8');
        try { return JSON.parse(raw); } catch { return []; }
    },
    async saveLibraryItem(item: any): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllLibraryItems();
        list.push(item);
        fs.writeFileSync(libraryDb, JSON.stringify(list, null, 2));
    },
    async updateLibraryItem(id: string, patch: Partial<any>): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllLibraryItems();
        const idx = list.findIndex((item: any) => item.id === id);
        if (idx === -1) throw new Error('Not found');
        list[idx] = { ...list[idx], ...patch };
        fs.writeFileSync(libraryDb, JSON.stringify(list, null, 2));
    },
    async deleteLibraryItem(id: string): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllLibraryItems();
        const filtered = list.filter((item: any) => item.id !== id);
        fs.writeFileSync(libraryDb, JSON.stringify(filtered, null, 2));
    },

    getUploadsPath(): string {
        ensureDir(storagePath);
        return storagePath;
    },

    // Users
    async getAllUsers(): Promise<any[]> {
        ensureDataPathExists();
        const raw = fs.readFileSync(usersDb, 'utf-8');
        try { return JSON.parse(raw); } catch { return []; }
    },
    async saveUser(u: any): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllUsers();
        list.push(u);
        fs.writeFileSync(usersDb, JSON.stringify(list, null, 2));
    },
    async deleteUser(id: string): Promise<void> {
        ensureDataPathExists();
        const list = await this.getAllUsers();
        const filtered = list.filter((u: any) => u.id !== id);
        fs.writeFileSync(usersDb, JSON.stringify(filtered, null, 2));
    }
};
