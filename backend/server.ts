import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';

import { authenticateToken } from './src/middleware/auth';
import { successResponse, errorResponse } from './src/utils/responses';
import { promptRoutes } from './src/routes/prompts';
import { layoutRoutes } from './src/routes/layouts';
import { authRoutes } from './src/routes/auth';
import { externalRoutes } from './src/routes/external';
import { metaRoutes } from './src/routes/meta';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Server Log Route (ohne Authentifizierung)
app.get('/api/server-log', (req: Request, res: Response) => {
    try {
        const logPath = path.join(__dirname, 'server.log');
        if (!fs.existsSync(logPath)) {
            return res.status(404).json(errorResponse('Log file not found'));
        }

        const log = fs.readFileSync(logPath, 'utf-8');
        // Sende die letzten 1000 Zeilen
        const lines = log.split('\n').slice(-1000).join('\n');
        res.status(200).json(successResponse(lines));
    } catch (error) {
        res.status(500).json(errorResponse('Error reading log file'));
    }
});

// Layout-Routen
app.get('/api/layout/:id', layoutRoutes.getOne);
app.post('/api/layout', layoutRoutes.create);
app.put('/api/layout/:id', layoutRoutes.update);
app.delete('/api/layout/:id', layoutRoutes.delete);

// Prompt-Routen
app.get('/api/prompts', promptRoutes.getAll);
app.get('/api/prompts/pending', promptRoutes.getPending);
app.get('/api/prompts/:id', promptRoutes.getOne);
app.post('/api/prompts', promptRoutes.create);
app.put('/api/prompts/:id', promptRoutes.update);
app.delete('/api/prompts/:id', promptRoutes.delete);
app.put('/api/prompts/:id/increment-success', promptRoutes.incrementSuccess);

// Meta-Routen
app.post('/api/meta/generate', authenticateToken, metaRoutes.generateMetadata);

// Auth-Routen
app.post('/api/register', authRoutes.register);
app.post('/api/login', authRoutes.login);
app.get('/api/me', authenticateToken, authRoutes.getMe);
app.get('/api/users', authenticateToken, authRoutes.getUsers);

// Externe API-Routen
app.get('/api/crypto-prices', externalRoutes.getCryptoPrices);
app.post('/api/send-discord-message', externalRoutes.sendDiscordMessage);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json(successResponse('Backend verbunden'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
