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
exports.PackageImportService = void 0;
const fs_1 = __importDefault(require("fs"));
const EdulanImporter_1 = require("./importers/EdulanImporter");
const FutureImporters_1 = require("./importers/FutureImporters");
const storage_1 = require("./storage");
class PackageImportService {
    constructor() {
        this.importers = [new EdulanImporter_1.EdulanImporter(storage_1.storageService.getPackagesPath()), new FutureImporters_1.KolibriImporter(), new FutureImporters_1.ScormImporter(), new FutureImporters_1.H5PImporter()];
    }
    import(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const importer = this.importers.find(candidate => candidate.supports(file));
                if (!importer)
                    throw new Error('Format paket tidak didukung. Saat ini hanya .edulan yang dapat diimpor.');
                const imported = yield importer.import(file);
                yield storage_1.storageService.saveImportedPackage(imported.collection, imported.items);
                return imported;
            }
            finally {
                if (fs_1.default.existsSync(file.path))
                    fs_1.default.unlinkSync(file.path);
            }
        });
    }
}
exports.PackageImportService = PackageImportService;
