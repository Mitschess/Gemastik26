export interface Answer {
    questionId: string;
    answer: string;
}

export interface Submission {
    id: string;
    studentId: string;
    studentName: string;
    assignmentId: string;
    courseId?: string;
    content: string;
    answers?: Answer[];
    fileName?: string;
    filePath?: string;
    submittedAt: Date;
    grade?: number;
    feedback?: string;
    gradedAt?: string;
    autoChecked?: boolean;
    correctCount?: number;
    totalAutoQuestions?: number;
    earnedPoints?: number;
    totalPoints?: number;
}
