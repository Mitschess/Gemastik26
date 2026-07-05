import { Collection } from './collection';
import { LibraryItem, LibraryItemType } from './libraryItem';

export interface PackageResourceManifest {
    id?: string;
    title: string;
    type: LibraryItemType;
    path: string;
    description?: string;
}

export interface PackageSectionManifest {
    id?: string;
    title: string;
    resources?: PackageResourceManifest[];
}

export interface PackageManifest {
    title: string;
    description?: string;
    author?: string;
    version: string;
    thumbnail?: string;
    sections: PackageSectionManifest[];
}

export interface ImportedPackage {
    collection: Collection;
    items: LibraryItem[];
}
