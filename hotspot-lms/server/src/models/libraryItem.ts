export type LibraryItemType = 'book' | 'module' | 'article' | 'video' | 'link' | 'file';

export interface LibraryItem {
    id: string;
    courseId?: string;
    title: string;
    description?: string;
    type: LibraryItemType;
    category?: string;
    author?: string;
    publisher?: string;
    tags?: string[];
    externalUrl?: string;
    fileName?: string;
    filePath?: string;
    createdAt: string;
}

export function createLibraryItem(data: Partial<LibraryItem>): LibraryItem {
    return {
        id: data.id ?? Date.now().toString(),
        courseId: data.courseId ?? '',
        title: data.title ?? 'Untitled Library Item',
        description: data.description ?? '',
        type: data.type ?? 'file',
        category: data.category ?? 'Umum',
        author: data.author ?? '',
        publisher: data.publisher ?? '',
        tags: data.tags ?? [],
        externalUrl: data.externalUrl ?? '',
        fileName: data.fileName,
        filePath: data.filePath,
        createdAt: data.createdAt ?? new Date().toISOString()
    };
}
