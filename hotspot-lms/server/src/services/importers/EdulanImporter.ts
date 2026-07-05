import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ImportedPackage, PackageManifest, PackageResourceManifest } from '../../models/contentPackage';
import { LibraryItemType } from '../../models/libraryItem';
import { PackageImporter, UploadedPackageFile } from './PackageImporter';

const VALID_TYPES: LibraryItemType[] = ['lesson', 'document', 'video', 'quiz', 'resource'];

export class EdulanImporter implements PackageImporter {
    readonly format = 'EduLAN Package';

    constructor(private readonly packagesPath: string) {}

    supports(file: UploadedPackageFile): boolean {
        return path.extname(file.originalname).toLowerCase() === '.edulan';
    }

    async import(file: UploadedPackageFile): Promise<ImportedPackage> {
        const zip = new AdmZip(file.path);
        const manifestEntry = zip.getEntry('manifest.json');
        if (!manifestEntry || manifestEntry.isDirectory) {
            throw new Error('Paket EduLAN harus memiliki manifest.json di direktori utama.');
        }

        let manifest: PackageManifest;
        try { manifest = JSON.parse(manifestEntry.getData().toString('utf8')); }
        catch { throw new Error('manifest.json bukan JSON yang valid.'); }
        this.validateManifest(manifest);

        const collectionId = uuidv4();
        const destination = path.join(this.packagesPath, collectionId);
        fs.mkdirSync(destination, { recursive: true });

        try {
            for (const entry of zip.getEntries()) {
                const normalized = path.posix.normalize(entry.entryName.replace(/\\/g, '/'));
                if (normalized.startsWith('../') || path.isAbsolute(normalized)) {
                    throw new Error(`Path paket tidak aman: ${entry.entryName}`);
                }
                const output = path.resolve(destination, normalized);
                const root = path.resolve(destination);
                if (!output.startsWith(root + path.sep) && output !== root) {
                    throw new Error(`Path paket tidak aman: ${entry.entryName}`);
                }
                if (entry.isDirectory) fs.mkdirSync(output, { recursive: true });
                else {
                    fs.mkdirSync(path.dirname(output), { recursive: true });
                    fs.writeFileSync(output, entry.getData());
                }
            }

            const items = manifest.sections.flatMap((section, sectionIndex) =>
                (section.resources || []).map(resource => {
                    this.validateResource(resource, zip);
                    return {
                        id: resource.id || uuidv4(), collectionId,
                        sectionId: section.id || `section-${sectionIndex + 1}`,
                        sectionTitle: section.title, title: resource.title, type: resource.type,
                        filePath: path.posix.join('packages', collectionId, resource.path.replace(/\\/g, '/')),
                        createdAt: new Date().toISOString()
                    };
                })
            );

            if (manifest.thumbnail && !this.findEntry(zip, manifest.thumbnail)) {
                throw new Error(`Thumbnail tidak ditemukan: ${manifest.thumbnail}`);
            }
            return {
                collection: {
                    id: collectionId, title: manifest.title, description: manifest.description || '',
                    thumbnail: manifest.thumbnail ? path.posix.join('packages', collectionId, manifest.thumbnail.replace(/\\/g, '/')) : undefined,
                    version: manifest.version, author: manifest.author || 'Tidak diketahui',
                    format: this.format, resourceCount: items.length, installedAt: new Date().toISOString()
                },
                items
            };
        } catch (error) {
            fs.rmSync(destination, { recursive: true, force: true });
            throw error;
        }
    }

    private validateManifest(value: PackageManifest): void {
        if (!value || typeof value.title !== 'string' || !value.title.trim()) throw new Error('Manifest memerlukan title.');
        if (typeof value.version !== 'string' || !value.version.trim()) throw new Error('Manifest memerlukan version.');
        if (!Array.isArray(value.sections)) throw new Error('Manifest memerlukan array sections.');
        value.sections.forEach(section => {
            if (!section || typeof section.title !== 'string') throw new Error('Setiap section memerlukan title.');
            if (section.resources !== undefined && !Array.isArray(section.resources)) throw new Error('section.resources harus berupa array.');
        });
    }

    private validateResource(resource: PackageResourceManifest, zip: AdmZip): void {
        if (!resource.title || !resource.path) throw new Error('Setiap resource memerlukan title dan path.');
        if (!VALID_TYPES.includes(resource.type)) throw new Error(`Tipe resource tidak didukung: ${resource.type}`);
        const normalized = path.posix.normalize(resource.path.replace(/\\/g, '/'));
        if (normalized.startsWith('../') || path.isAbsolute(normalized)) throw new Error(`Path resource tidak aman: ${resource.path}`);
        if (!this.findEntry(zip, normalized)) throw new Error(`File resource tidak ditemukan: ${resource.path}`);
    }

    private findEntry(zip: AdmZip, requestedPath: string) {
        const normalized = path.posix.normalize(requestedPath.replace(/\\/g, '/'));
        return zip.getEntries().find(entry => path.posix.normalize(entry.entryName.replace(/\\/g, '/')) === normalized);
    }
}
