import { ImportedPackage } from '../../models/contentPackage';

export interface UploadedPackageFile {
    originalname: string;
    path: string;
    mimetype: string;
}

export interface PackageImporter {
    readonly format: string;
    supports(file: UploadedPackageFile): boolean;
    import(file: UploadedPackageFile): Promise<ImportedPackage>;
}
