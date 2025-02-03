import { Request, Response } from 'express';
import { db } from '../config/database';
import { successResponse, errorResponse } from '../utils/responses';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-stringify';
import { AuthenticatedRequest } from '../types/api';

interface Prompt {
    id: string;
    title: string;
    prompt: string;
    keywords: string;
}

interface ImageMetadata {
    filename: string;
    title: string;
    keywords: string;
    category: string;
    releases: string;
}

export const metaRoutes = {
    generateMetadata: async (req: AuthenticatedRequest, res: Response) => {
        // Überprüfe ob der Benutzer authentifiziert ist
        if (!req.user) {
            return res.status(401).json(errorResponse('Nicht autorisiert'));
        }

        const { imagesPath, outputPath } = req.body;

        if (!imagesPath || !outputPath) {
            return res.status(400).json(errorResponse('Bild- und Ausgabepfad sind erforderlich'));
        }

        try {
            // Stelle sicher, dass die Ordner existieren
            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }

            // Hole alle Prompts aus der Datenbank
            const prompts = await new Promise<Prompt[]>((resolve, reject) => {
                db.query('SELECT * FROM prompts', (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Erstelle ein Dictionary für schnelleren Zugriff
            const promptDict = prompts.reduce((acc, prompt) => {
                acc[prompt.prompt.replace(/ /g, '_')] = prompt;
                return acc;
            }, {} as Record<string, Prompt>);

            // Lese die Bilder aus dem Ordner
            if (!fs.existsSync(imagesPath)) {
                return res.status(400).json(errorResponse('Der angegebene Bilderpfad existiert nicht'));
            }

            const images = fs.readdirSync(imagesPath).filter(file =>
              file.startsWith('quicklink_') || file.startsWith('drunkenmunkey1986_86250_')
            );

            // Erstelle die Metadaten für jedes Bild
            const metadata: ImageMetadata[] = [];

            for (const image of images) {
                let promptParts: string[];
                if (image.startsWith('quicklink_')) {
                    promptParts = image.split('_').slice(1, -2);
                } else {
                    promptParts = image.split('_').slice(2, -2);
                }

                const prompt = promptParts.join(' ');

                // Suche nach dem passenden Prompt in der Datenbank
                for (const item of Object.values(promptDict)) {
                    if (item.prompt.includes(prompt)) {
                        metadata.push({
                            filename: image,
                            title: item.title,
                            keywords: item.keywords.split(',').join(' '),
                            category: "8",
                            releases: ""
                        });
                        break;
                    }
                }
            }

            // Generiere CSV
            const csvOutput = path.join(outputPath, 'metadata.csv');
            const jsonOutput = path.join(outputPath, 'metadata.json');

            // Schreibe CSV
            await new Promise<void>((resolve, reject) => {
                csv.stringify(metadata, {
                    header: true,
                    columns: ['filename', 'title', 'keywords', 'category', 'releases']
                }, (err, output) => {
                    if (err) reject(err);
                    fs.writeFileSync(csvOutput, output);
                    resolve();
                });
            });

            // Schreibe JSON
            fs.writeFileSync(jsonOutput, JSON.stringify(metadata, null, 2));

            res.json(successResponse({
                message: 'Metadaten erfolgreich generiert',
                filesProcessed: images.length,
                metadataGenerated: metadata.length,
                outputFiles: {
                    csv: csvOutput,
                    json: jsonOutput
                }
            }));

        } catch (error) {
            console.error('Error generating metadata:', error);
            res.status(500).json(errorResponse(error instanceof Error ? error.message : 'Unknown error'));
        }
    }
};
