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
Object.defineProperty(exports, "__esModule", { value: true });
exports.H5PImporter = exports.ScormImporter = exports.KolibriImporter = void 0;
class FutureImporter {
    supports(_file) { return false; }
    import(_file) {
        return __awaiter(this, void 0, void 0, function* () { throw new Error(`${this.format} belum didukung.`); });
    }
}
class KolibriImporter extends FutureImporter {
    constructor() {
        super(...arguments);
        this.format = 'Kolibri Channel';
    }
}
exports.KolibriImporter = KolibriImporter;
class ScormImporter extends FutureImporter {
    constructor() {
        super(...arguments);
        this.format = 'SCORM Package';
    }
}
exports.ScormImporter = ScormImporter;
class H5PImporter extends FutureImporter {
    constructor() {
        super(...arguments);
        this.format = 'H5P Package';
    }
}
exports.H5PImporter = H5PImporter;
