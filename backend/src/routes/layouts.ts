import { Request, Response } from 'express';
import { db } from '../config/database';
import { successResponse, errorResponse } from '../utils/responses';

export const layoutRoutes = {
    getOne: (req: Request, res: Response) => {
        const id = req.params.id;
        db.query('SELECT * FROM layouts WHERE id = ?', [id], (err, results) => {
            if (err) return res.status(500).json(errorResponse(err.message));
            if (results.length > 0) {
                res.json(successResponse(results[0]));
            } else {
                res.status(404).json(errorResponse('Layout nicht gefunden'));
            }
        });
    },

    create: (req: Request, res: Response) => {
        const newLayout = { layout: JSON.stringify(req.body) };
        db.query('INSERT INTO layouts SET ?', newLayout, (err, result) => {
            if (err) return res.status(500).json(errorResponse(err.message));
            res.json(successResponse({ id: result.insertId, ...newLayout }));
        });
    },

    update: (req: Request, res: Response) => {
        const id = req.params.id;
        const updatedLayout = JSON.stringify(req.body);
        const query = `
            INSERT INTO layouts (id, layout) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE layout = VALUES(layout);
        `;
        db.query(query, [id, updatedLayout], (err, result) => {
            if (err) return res.status(500).json(errorResponse(err.message));
            const message = result.insertId ? 'Neues Layout angelegt' : 'Layout aktualisiert';
            res.json(successResponse({ affected: result.affectedRows }, message));
        });
    },

    delete: (req: Request, res: Response) => {
        const id = req.params.id;
        db.query('DELETE FROM layouts WHERE id = ?', id, (err, result) => {
            if (err) return res.status(500).json(errorResponse(err.message));
            res.json(successResponse(null, 'Layout gelöscht'));
        });
    }
};