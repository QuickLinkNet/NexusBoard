import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responses';
import { AuthenticatedRequest } from '../types/api';

const JWT_SECRET = 'secret_key'; // In production, this should be in environment variables

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json(errorResponse('Token fehlt'));
    }

    // Für den einfachen Base64-Token (temporäre Lösung)
    try {
        const decodedToken = Buffer.from(token, 'base64').toString();
        const [username, timestamp] = decodedToken.split(':');

        // Optional: Überprüfe, ob der Token nicht zu alt ist
        const tokenAge = Date.now() - parseInt(timestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 Stunden

        if (tokenAge > maxAge) {
            return res.status(401).json(errorResponse('Token abgelaufen'));
        }

        // Setze den User in der Request
        req.user = {
            id: 1, // Admin ID
            username: username,
            role: 'admin'
        };

        next();
    } catch (err) {
        // Versuche JWT Token (für zukünftige Implementierung)
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
            req.user = decoded;
            next();
        } catch (jwtErr) {
            return res.status(403).json(errorResponse('Ungültiger Token'));
        }
    }
};
