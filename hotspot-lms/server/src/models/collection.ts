export interface Collection {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    version: string;
    author: string;
    format: string;
    resourceCount: number;
    installedAt: string;
}
