import { Question } from './question';

export interface Assignment {
    id: string;
    courseId?: string;
    title: string;
    description?: string;
    dueDate?: string; // ISO
    autoCheck?: boolean;
    activityType?: 'assignment' | 'quiz';
    timeLimitMinutes?: number;
    attemptLimit?: number;
    randomizeQuestions?: boolean;
    randomizeChoices?: boolean;
    questions?: Question[];
    createdAt: string;
}

export function createAssignment(data: Partial<Assignment>): Assignment {
    return {
        id: data.id ?? Date.now().toString(),
        courseId: data.courseId ?? '',
        title: data.title ?? 'Untitled Assignment',
        description: data.description ?? '',
        dueDate: data.dueDate,
        autoCheck: data.autoCheck ?? false,
        activityType: data.activityType ?? 'assignment',
        timeLimitMinutes: data.timeLimitMinutes,
        attemptLimit: data.attemptLimit,
        randomizeQuestions: data.randomizeQuestions ?? false,
        randomizeChoices: data.randomizeChoices ?? false,
        questions: data.questions ?? [],
        createdAt: data.createdAt ?? new Date().toISOString()
    };
}
