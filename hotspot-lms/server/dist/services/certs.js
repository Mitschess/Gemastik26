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
exports.ensureCerts = ensureCerts;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const selfsigned_1 = __importDefault(require("selfsigned"));
const os_1 = __importDefault(require("os"));
const CERT_DIR = path_1.default.join(__dirname, '../../certs');
const KEY_PATH = path_1.default.join(CERT_DIR, 'key.pem');
const CERT_PATH = path_1.default.join(CERT_DIR, 'cert.pem');
function getLocalIPs() {
    const ips = ['127.0.0.1'];
    for (const nets of Object.values(os_1.default.networkInterfaces())) {
        if (!nets)
            continue;
        for (const net of nets) {
            if (net.family === 'IPv4' && !net.internal)
                ips.push(net.address);
        }
    }
    return ips;
}
function ensureCerts() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(CERT_DIR))
            fs_1.default.mkdirSync(CERT_DIR, { recursive: true });
        if (fs_1.default.existsSync(KEY_PATH) && fs_1.default.existsSync(CERT_PATH)) {
            return {
                key: fs_1.default.readFileSync(KEY_PATH),
                cert: fs_1.default.readFileSync(CERT_PATH)
            };
        }
        const altNames = [
            { type: 2, value: 'localhost' },
            { type: 2, value: 'edulan.local' }
        ];
        getLocalIPs().forEach(ip => altNames.push({ type: 7, ip }));
        const notAfter = new Date();
        notAfter.setFullYear(notAfter.getFullYear() + 2);
        const pems = yield selfsigned_1.default.generate([{ name: 'commonName', value: 'EduLAN Local' }], {
            notAfterDate: notAfter,
            keySize: 2048,
            algorithm: 'sha256',
            extensions: [{ name: 'subjectAltName', altNames }]
        });
        fs_1.default.writeFileSync(KEY_PATH, pems.private);
        fs_1.default.writeFileSync(CERT_PATH, pems.cert);
        console.log('🔐 Sertifikat HTTPS lokal dibuat di server/certs/');
        return { key: Buffer.from(pems.private), cert: Buffer.from(pems.cert) };
    });
}
