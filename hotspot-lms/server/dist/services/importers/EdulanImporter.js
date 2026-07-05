"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdulanImporter = void 0;
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const VALID_TYPES = ['lesson', 'document', 'video', 'quiz', 'resource'];
class EdulanImporter {
    constructor(packagesPath) {
        this.packagesPath = packagesPath;
        this.format = 'EduLAN Package';
    }
    supports(file) {
        return path_1.default.extname(file.originalname).toLowerCase() === '.edulan';
    }
    import(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const zip = new adm_zip_1.default(file.path);
            const manifestEntry = zip.getEntry('manifest.json');
            if (!manifestEntry || manifestEntry.isDirectory) {
                throw new Error('Paket EduLAN harus memiliki manifest.json di direktori utama.');
            }
            let manifest;
            try {
                manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
            }
            catch (_a) {
                throw new Error('manifest.json bukan JSON yang valid.');
            }
            this.validateManifest(manifest);
            const collectionId = (0, uuid_1.v4)();
            const destination = path_1.default.join(this.packagesPath, collectionId);
            fs_1.default.mkdirSync(destination, { recursive: true });
            try {
                for (const entry of zip.getEntries()) {
                    const normalized = path_1.default.posix.normalize(entry.entryName.replace(/\\/g, '/'));
                    if (normalized.startsWith('../') || path_1.default.isAbsolute(normalized)) {
                        throw new Error(`Path paket tidak aman: ${entry.entryName}`);
                    }
                    const output = path_1.default.resolve(destination, normalized);
                    const root = path_1.default.resolve(destination);
                    if (!output.startsWith(root + path_1.default.sep) && output !== root) {
                        throw new Error(`Path paket tidak aman: ${entry.entryName}`);
                    }
                    if (entry.isDirectory)
                        fs_1.default.mkdirSync(output, { recursive: true });
                    else {
                        fs_1.default.mkdirSync(path_1.default.dirname(output), { recursive: true });
                        fs_1.default.writeFileSync(output, entry.getData());
                    }
                }
                const items = manifest.sections.flatMap((section, sectionIndex) => (section.resources || []).map(resource => {
                    this.validateResource(resource, zip);
                    return {
                        id: resource.id || (0, uuid_1.v4)(), collectionId,
                        sectionId: section.id || `section-${sectionIndex + 1}`,
                        sectionTitle: section.title, title: resource.title, type: resource.type,
                        filePath: path_1.default.posix.join('packages', collectionId, resource.path.replace(/\\/g, '/')),
                        createdAt: new Date().toISOString()
                    };
                }));
                if (manifest.thumbnail && !this.findEntry(zip, manifest.thumbnail)) {
                    throw new Error(`Thumbnail tidak ditemukan: ${manifest.thumbnail}`);
                }
                return {
                    collection: {
                        id: collectionId, title: manifest.title, description: manifest.description || '',
                        thumbnail: manifest.thumbnail ? path_1.default.posix.join('packages', collectionId, manifest.thumbnail.replace(/\\/g, '/')) : undefined,
                        version: manifest.version, author: manifest.author || 'Tidak diketahui',
                        format: this.format, resourceCount: items.length, installedAt: new Date().toISOString()
                    },
                    items
                };
            }
            catch (error) {
                fs_1.default.rmSync(destination, { recursive: true, force: true });
                throw error;
            }
        });
    }
    validateManifest(value) {
        if (!value || typeof value.title !== 'string' || !value.title.trim())
            throw new Error('Manifest memerlukan title.');
        if (typeof value.version !== 'string' || !value.version.trim())
            throw new Error('Manifest memerlukan version.');
        if (!Array.isArray(value.sections))
            throw new Error('Manifest memerlukan array sections.');
        value.sections.forEach(section => {
            if (!section || typeof section.title !== 'string')
                throw new Error('Setiap section memerlukan title.');
            if (section.resources !== undefined && !Array.isArray(section.resources))
                throw new Error('section.resources harus berupa array.');
        });
    }
    validateResource(resource, zip) {
        if (!resource.title || !resource.path)
            throw new Error('Setiap resource memerlukan title dan path.');
        if (!VALID_TYPES.includes(resource.type))
            throw new Error(`Tipe resource tidak didukung: ${resource.type}`);
        const normalized = path_1.default.posix.normalize(resource.path.replace(/\\/g, '/'));
        if (normalized.startsWith('../') || path_1.default.isAbsolute(normalized))
            throw new Error(`Path resource tidak aman: ${resource.path}`);
        if (!this.findEntry(zip, normalized))
            throw new Error(`File resource tidak ditemukan: ${resource.path}`);
    }
    findEntry(zip, requestedPath) {
        const normalized = path_1.default.posix.normalize(requestedPath.replace(/\\/g, '/'));
        return zip.getEntries().find(entry => path_1.default.posix.normalize(entry.entryName.replace(/\\/g, '/')) === normalized);
    }
}
exports.EdulanImporter = EdulanImporter;
