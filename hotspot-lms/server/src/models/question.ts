export type QuestionType = 'mcq' | 'essay';

export interface Question {
    id: string;
    type: QuestionType;
    prompt: string;
    // for mcq
    choices?: string[];
    answer?: string; // correct answer (optional)
    points?: number;
}

export function createQuestion(data: Partial<Question>): Question {
    return {
        id: data.id ?? Date.now().toString(),
        type: data.type ?? 'essay',
        prompt: data.prompt ?? '',
        choices: data.choices ?? [],
        answer: data.answer,
        points: data.points ?? 1
    };
}
