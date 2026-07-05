import http from 'http';
import https from 'https';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { WebSocketServer } from 'ws';
import authRoutes from './routes/auth';
import submissionRoutes from './routes/submissions';
import materialsRoutes from './routes/materials';
import assignmentsRoutes from './routes/assignments';
import coursesRoutes from './routes/courses';
import questionBankRoutes from './routes/questionBank';
import libraryRoutes from './routes/library';
import { basicAuth } from './middleware/basicAuth';
import aiRoutes from './routes/ai';
import { setupMeetSignaling } from './services/meetSignaling';
import { ensureCerts } from './services/certs';
import { Request, Response, NextFunction } from 'express';

const app = express();
const HTTP_PORT = Number(process.env.PORT || 5000);
const HTTPS_PORT = Number(process.env.HTTPS_PORT || 5443);

app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/question-bank', questionBankRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/ai', aiRoutes);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath, { maxAge: '1h' }));

const staticPath = path.join(__dirname, '..', 'static');
app.use(express.static(staticPath, {
    maxAge: '1d',
    setHeaders(res, filePath) {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

app.get('/', (_req: Request, res: Response) => res.redirect('/index.html'));

function getNetworkAddresses() {
    const addresses: { name: string; ip: string; family: string }[] = [];
    for (const [name, nets] of Object.entries(os.networkInterfaces())) {
        if (!nets) continue;
        for (const net of nets) {
            if (net.family === 'IPv4' && !net.internal) {
                addresses.push({ name, ip: net.address, family: 'IPv4' });
            }
        }
    }
    return addresses;
}

function getPrimaryIP() {
    const addresses = getNetworkAddresses();
    const hotspot = addresses.find(a => a.ip.startsWith('192.168.137.'));
    return hotspot?.ip || addresses[0]?.ip || 'localhost';
}

app.get('/api/network-info', (_req: Request, res: Response) => {
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

function attachWebSocket(server: http.Server | https.Server) {
    const wss = new WebSocketServer({ server, path: '/ws/meet' });
    setupMeetSignaling(wss);
}

function printUrls(proto: string, port: number) {
    console.log(`   ${proto}:  ${proto.toLowerCase()}://localhost:${port}`);
    for (const { ip, name } of getNetworkAddresses()) {
        console.log(`   ${proto} Network: ${proto.toLowerCase()}://${ip}:${port}  (${name})`);
    }
}

// HTTP port 5000 — LMS biasa (seperti kemarin)
const httpServer = http.createServer(app);
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
ensureCerts().then(({ key, cert }) => {
    const httpsServer = https.createServer({ key, cert }, app);
    attachWebSocket(httpsServer);

    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`\n🔒 EduLAN HTTPS (Meet/kamera) — port ${HTTPS_PORT}`);
        printUrls('HTTPS', HTTPS_PORT);
        console.log(`\n📱 HP Meet: https://${getPrimaryIP()}:${HTTPS_PORT}/meet.html\n`);
    });
}).catch(err => {
    console.warn('⚠️ HTTPS tidak jalan:', err);
});
