export interface Submission {
    id: string;
    studentId: string;
    filePath: string;
    submittedAt: Date;
}

export interface User {
    id: string;
    username: string;
    password: string;
    role: 'student' | 'teacher';
}