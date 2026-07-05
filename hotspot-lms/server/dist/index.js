"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const auth_1 = __importDefault(require("./routes/auth"));
const submissions_1 = __importDefault(require("./routes/submissions"));
const materials_1 = __importDefault(require("./routes/materials"));
const assignments_1 = __importDefault(require("./routes/assignments"));
const courses_1 = __importDefault(require("./routes/courses"));
const questionBank_1 = __importDefault(require("./routes/questionBank"));
const library_1 = __importDefault(require("./routes/library"));
const liveQuiz_1 = __importDefault(require("./routes/liveQuiz"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/submissions', submissions_1.default);
app.use('/api/materials', materials_1.default); // Temporarily removed basicAuth to fix upload hang
app.use('/api/assignments', assignments_1.default);
app.use('/api/courses', courses_1.default);
app.use('/api/question-bank', questionBank_1.default);
app.use('/api/library', library_1.default);
app.use('/api/live-quiz', liveQuiz_1.default);
// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
// Serve uploaded files
const uploadsPath = path_1.default.join(__dirname, '..', 'uploads');
app.use('/uploads', express_1.default.static(uploadsPath));
// Serve static client pages from /static
const staticPath = path_1.default.join(__dirname, '..', 'static');
app.use(express_1.default.static(staticPath));
// Root redirects to login page
app.get('/', (_req, res) => res.redirect('/index.html'));
// Network info API — returns teacher's IP addresses for hotspot connectivity
app.get('/api/network-info', (_req, res) => {
    const interfaces = os_1.default.networkInterfaces();
    const addresses = [];
    for (const [name, nets] of Object.entries(interfaces)) {
        if (!nets)
            continue;
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
    const interfaces = os_1.default.networkInterfaces();
    for (const [name, nets] of Object.entries(interfaces)) {
        if (!nets)
            continue;
        for (const net of nets) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`   Network: http://${net.address}:${PORT}  (${name})`);
            }
        }
    }
    console.log(`\n📱 Students connect to your hotspot, then open the Network URL above.\n`);
});
