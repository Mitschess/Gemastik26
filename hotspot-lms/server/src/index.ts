import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import os from 'os';
import authRoutes from './routes/auth';
import submissionRoutes from './routes/submissions';
import materialsRoutes from './routes/materials';
import assignmentsRoutes from './routes/assignments';
import coursesRoutes from './routes/courses';
import questionBankRoutes from './routes/questionBank';
import { basicAuth } from './middleware/basicAuth';
import { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/materials', materialsRoutes); // Temporarily removed basicAuth to fix upload hang
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/question-bank', questionBankRoutes);

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Serve uploaded files
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Serve static client pages from /static
const staticPath = path.join(__dirname, '..', 'static');
app.use(express.static(staticPath));

// Root redirects to login page
app.get('/', (_req: Request, res: Response) => res.redirect('/index.html'));

// Network info API — returns teacher's IP addresses for hotspot connectivity
app.get('/api/network-info', (_req: Request, res: Response) => {
    const interfaces = os.networkInterfaces();
    const addresses: { name: string; ip: string; family: string }[] = [];
    for (const [name, nets] of Object.entries(interfaces)) {
        if (!nets) continue;
        for (const net of nets) {
            if (net.family === 'IPv4' && !net.internal) {
                addresses.push({ name, ip: net.address, family: 'IPv4' });
            }
        }
    }
    res.json({
        port: PORT,
        addresses,
        studentUrl: addresses.length > 0 ? `http://${addresses[0].ip}:${PORT}/student.html` : null,
        teacherUrl: addresses.length > 0 ? `http://${addresses[0].ip}:${PORT}/teacher.html` : null
    });
});

// Bind to 0.0.0.0 so students on the hotspot network can reach the server
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`\n🚀 Hotspot LMS Server running on port ${PORT}`);
    console.log(`   Local:   http://localhost:${PORT}`);
    // Print network IPs
    const interfaces = os.networkInterfaces();
    for (const [name, nets] of Object.entries(interfaces)) {
        if (!nets) continue;
        for (const net of nets) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`   Network: http://${net.address}:${PORT}  (${name})`);
            }
        }
    }
    console.log(`\n📱 Students connect to your hotspot, then open the Network URL above.\n`);
});
