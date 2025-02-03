import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { successResponse, errorResponse } from '../utils/responses';
import { AuthenticatedRequest } from '../types/api';

export const authRoutes = {
    register: async (req: Request, res: Response) => {
        const { username, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role || 'user'],
            (err, result) => {
                if (err) return res.status(500).json(errorResponse('Fehler bei der Registrierung: ' + err.message));
                res.status(201).json(successResponse({ id: result.insertId }, 'Benutzer erfolgreich registriert'));
            }
        );
    },

    login: (req: Request, res: Response) => {
        const { username, password } = req.body;
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) return res.status(500).json(errorResponse('Fehler bei der Datenbankabfrage'));
            if (!results.length || !(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).json(errorResponse('Ungültige Anmeldedaten'));
            }

            const user = { id: results[0].id, username: results[0].username, role: results[0].role };
            const token = jwt.sign(user, 'secret_key', { expiresIn: '1h' });
            res.json(successResponse({ token, user }));
        });
    },

    getMe: (req: AuthenticatedRequest, res: Response) => {
        res.json(successResponse(req.user));
    },

    getUsers: (req: AuthenticatedRequest, res: Response) => {
        if (req.user?.role !== 'admin') {
            return res.status(403).json(errorResponse('Zugriff verweigert'));
        }
        db.query('SELECT id, username, email, role FROM users', (err, results) => {
            if (err) return res.status(500).json(errorResponse('Fehler beim Abrufen der Benutzer'));
            res.json(successResponse(results));
        });
    }
};