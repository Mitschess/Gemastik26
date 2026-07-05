import fs from 'fs';
import path from 'path';
import selfsigned from 'selfsigned';
import os from 'os';

const CERT_DIR = path.join(__dirname, '../../certs');
const KEY_PATH = path.join(CERT_DIR, 'key.pem');
const CERT_PATH = path.join(CERT_DIR, 'cert.pem');

function getLocalIPs(): string[] {
    const ips: string[] = ['127.0.0.1'];
    for (const nets of Object.values(os.networkInterfaces())) {
        if (!nets) continue;
        for (const net of nets) {
            if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
        }
    }
    return ips;
}

export async function ensureCerts(): Promise<{ key: Buffer; cert: Buffer }> {
    if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });

    if (fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH)) {
        return {
            key: fs.readFileSync(KEY_PATH),
            cert: fs.readFileSync(CERT_PATH)
        };
    }

    const altNames: Array<{ type: 2 | 7; value?: string; ip?: string }> = [
        { type: 2, value: 'localhost' },
        { type: 2, value: 'edulan.local' }
    ];
    getLocalIPs().forEach(ip => altNames.push({ type: 7, ip }));

    const notAfter = new Date();
    notAfter.setFullYear(notAfter.getFullYear() + 2);

    const pems = await selfsigned.generate([{ name: 'commonName', value: 'EduLAN Local' }], {
        notAfterDate: notAfter,
        keySize: 2048,
        algorithm: 'sha256',
        extensions: [{ name: 'subjectAltName', altNames }]
    });

    fs.writeFileSync(KEY_PATH, pems.private);
    fs.writeFileSync(CERT_PATH, pems.cert);
    console.log('🔐 Sertifikat HTTPS lokal dibuat di server/certs/');

    return { key: Buffer.from(pems.private), cert: Buffer.from(pems.cert) };
}
