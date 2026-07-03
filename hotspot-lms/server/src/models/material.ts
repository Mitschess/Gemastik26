export interface Material {
    id: string;
    courseId?: string;
    title: string;
    description?: string;
    fileName?: string;
    filePath?: string;
    createdAt: string;
}

export function createMaterial(data: Partial<Material>): Material {
    return {
        id: data.id ?? Date.now().toString(),
        courseId: data.courseId ?? '',
        title: data.title ?? 'Untitled',
        description: data.description ?? '',
        fileName: data.fileName,
        filePath: data.filePath,
        createdAt: data.createdAt ?? new Date().toISOString()
    };
}
