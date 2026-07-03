import { Question, QuestionType } from './question';

export interface QuestionBankItem extends Question {
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    createdAt: string;
}

export function createQuestionBankItem(data: Partial<QuestionBankItem>): QuestionBankItem {
    return {
        id: data.id ?? Date.now().toString(),
        type: (data.type as QuestionType) ?? 'mcq',
        prompt: data.prompt ?? '',
        choices: data.choices ?? [],
        answer: data.answer ?? '',
        points: data.points ?? 1,
        category: data.category ?? 'Umum',
        difficulty: data.difficulty ?? 'medium',
        createdAt: data.createdAt ?? new Date().toISOString()
    };
}
