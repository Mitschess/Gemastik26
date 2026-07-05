import fs from 'fs';
import { ImportedPackage } from '../models/contentPackage';
import { EdulanImporter } from './importers/EdulanImporter';
import { H5PImporter, KolibriImporter, ScormImporter } from './importers/FutureImporters';
import { PackageImporter, UploadedPackageFile } from './importers/PackageImporter';
import { storageService } from './storage';

export class PackageImportService {
    private readonly importers: PackageImporter[];

    constructor() {
        this.importers = [new EdulanImporter(storageService.getPackagesPath()), new KolibriImporter(), new ScormImporter(), new H5PImporter()];
    }

    async import(file: UploadedPackageFile): Promise<ImportedPackage> {
        try {
            const importer = this.importers.find(candidate => candidate.supports(file));
            if (!importer) throw new Error('Format paket tidak didukung. Saat ini hanya .edulan yang dapat diimpor.');
            const imported = await importer.import(file);
            await storageService.saveImportedPackage(imported.collection, imported.items);
            return imported;
        } finally {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
    }
}
