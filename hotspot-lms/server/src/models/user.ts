export type UserRole = 'teacher' | 'student';

export interface User {
    id: string;
    username: string;
    password: string; // In a real app, this should be hashed
    name: string;
    role: UserRole;
    studentId?: string; // Only for students
}

export function createUser(data: Partial<User>): User {
    return {
        id: data.id ?? Date.now().toString(),
        username: data.username ?? '',
        password: data.password ?? '',
        name: data.name ?? '',
        role: data.role ?? 'student',
        studentId: data.studentId
    };
}
