export interface Submission {
    id: string;
    studentId: string;
    assignmentId: string;
    content: string;
    submittedAt: Date;
    grade?: number;
    feedback?: string;
}