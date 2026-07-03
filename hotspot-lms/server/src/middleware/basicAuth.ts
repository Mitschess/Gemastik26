import { Request, Response, NextFunction } from 'express';

export function basicAuth(req: Request, res: Response, next: NextFunction) {
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin';

    const header = req.headers['authorization'];
    if (!header) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
        return res.status(401).send('Authentication required');
    }

    const parts = (header as string).split(' ');
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
