export interface Submission {
    id: string;
    studentId: string;
    fileName: string;
    submittedAt: Date;
}

export interface User {
    id: string;
    username: string;
    password: string;
    role: 'student' | 'teacher';
}