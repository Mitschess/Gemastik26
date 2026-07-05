"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const ws_1 = require("ws");
const auth_1 = __importDefault(require("./routes/auth"));
const submissions_1 = __importDefault(require("./routes/submissions"));
const materials_1 = __importDefault(require("./routes/materials"));
const assignments_1 = __importDefault(require("./routes/assignments"));
const courses_1 = __importDefault(require("./routes/courses"));
const questionBank_1 = __importDefault(require("./routes/questionBank"));
const library_1 = __importDefault(require("./routes/library"));
const ai_1 = __importDefault(require("./routes/ai"));
const meetSignaling_1 = require("./services/meetSignaling");
const certs_1 = require("./services/certs");
const app = (0, express_1.default)();
const HTTP_PORT = Number(process.env.PORT || 5000);
const HTTPS_PORT = Number(process.env.HTTPS_PORT || 5443);
app.use((0, compression_1.default)());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_1.default);
app.use('/api/submissions', submissions_1.default);
app.use('/api/materials', materials_1.default);
app.use('/api/assignments', assignments_1.default);
app.use('/api/courses', courses_1.default);
app.use('/api/question-bank', questionBank_1.default);
app.use('/api/library', library_1.default);
app.use('/api/ai', ai_1.default);
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
const uploadsPath = path_1.default.join(__dirname, '..', 'uploads');
app.use('/uploads', express_1.default.static(uploadsPath, { maxAge: '1h' }));
const staticPath = path_1.default.join(__dirname, '..', 'static');
app.use(express_1.default.static(staticPath, {
    maxAge: '1d',
    setHeaders(res, filePath) {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));
app.get('/', (_req, res) => res.redirect('/index.html'));
function getNetworkAddresses() {
    const addresses = [];
    for (const [name, nets] of Object.entries(os_1.default.networkInterfaces())) {
        if (!nets)
            continue;
        for (const net of nets) {
            if (net.family === 'IPv4' && !net.internal) {
                addresses.push({ name, ip: net.address, family: 'IPv4' });
            }
        }
    }
    return addresses;
}
function getPrimaryIP() {
    var _a;
    const addresses = getNetworkAddresses();
    const hotspot = addresses.find(a => a.ip.startsWith('192.168.137.'));
    return (hotspot === null || hotspot === void 0 ? void 0 : hotspot.ip) || ((_a = addresses[0]) === null || _a === void 0 ? void 0 : _a.ip) || 'localhost';
}
app.get('/api/network-info', (_req, res) => {
    const addresses = getNetworkAddresses();
    const ip = getPrimaryIP();
    const hotspotOn = addresses.some(a => a.ip.startsWith('192.168.137.'));
    res.json({
        httpPort: HTTP_PORT,
        httpsPort: HTTPS_PORT,
        addresses,
        primaryIp: ip,
        hotspotOn,
        studentUrl: `http://${ip}:${HTTP_PORT}/student.html`,
        teacherUrl: `http://${ip}:${HTTP_PORT}/teacher.html`,
        meetUrl: `https://${ip}:${HTTPS_PORT}/meet.html`,
        connectUrl: `http://${ip}:${HTTP_PORT}/connect.html`,
        note: hotspotOn
            ? 'Hotspot aktif. LMS: http://IP:5000 | Meet+kamera: https://IP:5443'
            : 'Hotspot MATI. Nyalakan hotspot dulu, atau pakai IP Wi-Fi yang tersedia.'
    });
});
function attachWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server, path: '/ws/meet' });
    (0, meetSignaling_1.setupMeetSignaling)(wss);
}
function printUrls(proto, port) {
    console.log(`   ${proto}:  ${proto.toLowerCase()}://localhost:${port}`);
    for (const { ip, name } of getNetworkAddresses()) {
        console.log(`   ${proto} Network: ${proto.toLowerCase()}://${ip}:${port}  (${name})`);
    }
}
// HTTP port 5000 — LMS biasa (seperti kemarin)
const httpServer = http_1.default.createServer(app);
attachWebSocket(httpServer);
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`\n🚀 EduLAN HTTP (LMS) — port ${HTTP_PORT}`);
    printUrls('HTTP', HTTP_PORT);
    const ip = getPrimaryIP();
    const hotspotOn = getNetworkAddresses().some(a => a.ip.startsWith('192.168.137.'));
    if (!hotspotOn) {
        console.log(`\n⚠️  Hotspot BELUM nyala — 192.168.137.1 tidak tersedia`);
        console.log(`   Nyalakan Mobile Hotspot, lalu restart server`);
        console.log(`   Sementara pakai: http://${ip}:${HTTP_PORT}`);
    }
});
// HTTPS port 5443 — Meet + kamera HP
(0, certs_1.ensureCerts)().then(({ key, cert }) => {
    const httpsServer = https_1.default.createServer({ key, cert }, app);
    attachWebSocket(httpsServer);
    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`\n🔒 EduLAN HTTPS (Meet/kamera) — port ${HTTPS_PORT}`);
        printUrls('HTTPS', HTTPS_PORT);
        console.log(`\n📱 HP Meet: https://${getPrimaryIP()}:${HTTPS_PORT}/meet.html\n`);
    });
}).catch(err => {
    console.warn('⚠️ HTTPS tidak jalan:', err);
});
