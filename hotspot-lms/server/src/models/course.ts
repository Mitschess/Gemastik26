export interface Course {
    id: string;
    title: string;
    description?: string;
    code?: string;
    teacherName?: string;
    archived?: boolean;
    createdAt: string;
}

export function createCourse(data: Partial<Course>): Course {
    return {
        id: data.id ?? Date.now().toString(),
        title: data.title ?? 'Untitled Course',
        description: data.description ?? '',
        code: data.code ?? '',
        teacherName: data.teacherName ?? '',
        archived: data.archived ?? false,
        createdAt: data.createdAt ?? new Date().toISOString()
    };
}
