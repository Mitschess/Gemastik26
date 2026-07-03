"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicAuth = basicAuth;
function basicAuth(req, res, next) {
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin';
    const header = req.headers['authorization'];
    if (!header) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
        return res.status(401).send('Authentication required');
    }
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Basic') {
        return res.status(400).send('Bad Authorization header');
    }
    const decoded = Buffer.from(parts[1], 'base64').toString();
    const [user, pass] = decoded.split(':');
    if (user === adminUser && pass === adminPass) {
        return next();
    }
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Invalid credentials');
}
