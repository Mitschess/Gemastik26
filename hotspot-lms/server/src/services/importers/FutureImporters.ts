import { ImportedPackage } from '../../models/contentPackage';
import { PackageImporter, UploadedPackageFile } from './PackageImporter';

abstract class FutureImporter implements PackageImporter {
    abstract readonly format: string;
    supports(_file: UploadedPackageFile): boolean { return false; }
    async import(_file: UploadedPackageFile): Promise<ImportedPackage> { throw new Error(`${this.format} belum didukung.`); }
}

export class KolibriImporter extends FutureImporter { readonly format = 'Kolibri Channel'; }
export class ScormImporter extends FutureImporter { readonly format = 'SCORM Package'; }
export class H5PImporter extends FutureImporter { readonly format = 'H5P Package'; }
