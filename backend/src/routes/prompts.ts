import { Request, Response } from 'express';
import { db } from '../config/database';
import { successResponse, errorResponse } from '../utils/responses';

export const promptRoutes = {
    getAll: (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string, 10) || 9999;
        const offset = parseInt(req.query.offset as string, 10) || 0;

        db.query('SELECT COUNT(*) AS total FROM prompts', (err, totalResults) => {
            if (err) return res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Datenbankfehler'));
            const total = totalResults[0].total;

            db.query('SELECT * FROM prompts LIMIT ? OFFSET ?', [limit, offset], (err, promptsResults) => {
                if (err) return res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Datenbankfehler'));
                res.json(successResponse({ prompts: promptsResults, total }));
            });
        });
    },

    getPending: (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string, 10) || 5;
        db.query('SELECT * FROM prompts WHERE successful_runs < expected_runs LIMIT ?', [limit], (err, results) => {
            if (err) return res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Datenbankfehler'));
            res.json(successResponse(results));
        });
    },

    getOne: (req: Request, res: Response) => {
        const id = req.params.id;
        db.query('SELECT * FROM prompts WHERE id = ?', [id], (err, result) => {
            if (err) return res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Datenbankfehler'));
            if (result.length > 0) {
                res.json(successResponse(result[0]));
            } else {
                res.status(404).json(errorResponse('Prompt nicht gefunden'));
            }
        });
    },

    create: async (req: Request, res: Response) => {
        try {
            const prompts = Array.isArray(req.body) ? req.body : [req.body];

            for (const prompt of prompts) {
                if (!prompt.title || !prompt.prompt) {
                    return res.status(400).json(errorResponse('Title und Prompt sind erforderlich'));
                }
            }

            const results = [];
            for (const prompt of prompts) {
                try {
                    const promptData = {
                        title: prompt.title,
                        prompt: prompt.prompt,
                        keywords: Array.isArray(prompt.keywords) ? prompt.keywords.join(',') : prompt.keywords || '',
                        expected_runs: '10',
                        successful_runs: '0'
                    };

                    const result = await new Promise((resolve, reject) => {
                        db.query(
                          'INSERT INTO prompts (title, prompt, keywords, expected_runs, successful_runs) VALUES (?, ?, ?, ?, ?)',
                          [
                              promptData.title,
                              promptData.prompt,
                              promptData.keywords,
                              promptData.expected_runs,
                              promptData.successful_runs
                          ],
                          (err, result) => {
                              if (err) {
                                  console.error('DB Error:', err);
                                  reject(err);
                              } else {
                                  resolve({
                                      id: result.insertId,
                                      ...promptData
                                  });
                              }
                          }
                        );
                    });

                    results.push(result);
                } catch (err) {
                    console.error('Error inserting prompt:', err);
                    throw err;
                }
            }

            res.status(200).json(successResponse(results, 'Prompts erfolgreich erstellt'));
        } catch (err) {
            console.error('Server Error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
            res.status(500).json(errorResponse(`Fehler beim Einfügen der Prompts: ${errorMessage}`));
        }
    },

    update: (req: Request, res: Response) => {
        const id = req.params.id;
        const updateData = req.body;

        // Hole zuerst den existierenden Prompt
        db.query('SELECT * FROM prompts WHERE id = ?', [id], (err, results) => {
            if (err) {
                return res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Datenbankfehler'));
            }

            if (results.length === 0) {
                return res.status(404).json(errorResponse('Prompt nicht gefunden'));
            }

            const existingPrompt = results[0];

            // Merge existierende Daten mit Update-Daten
            const updatedData = {
                ...existingPrompt,
                ...updateData
            };

            // Führe das Update durch
            db.query(
              'UPDATE prompts SET successful_runs = ? WHERE id = ?',
              [updatedData.successful_runs, id],
              (updateErr, result) => {
                  if (updateErr) {
                      console.error('Update error:', updateErr);
                      return res.status(500).json(errorResponse(updateErr instanceof Error ? updateErr.message : 'Datenbankfehler'));
                  }
                  res.json(successResponse(updatedData, 'Prompt aktualisiert'));
              }
            );
        });
    },

    delete: (req: Request, res: Response) => {
        const id = req.params.id;
        db.query('DELETE FROM prompts WHERE id = ?', [id], (err, result) => {
            if (err) return res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Datenbankfehler'));
            res.json(successResponse(null, 'Prompt gelöscht'));
        });
    },

    incrementSuccess: (req: Request, res: Response) => {
        const id = req.params.id;
        db.query('SELECT successful_runs FROM prompts WHERE id = ?', [id], (err, results) => {
            if (err) return res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Datenbankfehler'));
            if (results.length === 0) return res.status(404).json(errorResponse('Prompt nicht gefunden'));

            const currentSuccessfulRuns = results[0].successful_runs;
            const newSuccessfulRuns = currentSuccessfulRuns + 1;

            db.query('UPDATE prompts SET successful_runs = ? WHERE id = ?', [newSuccessfulRuns, id], (updateErr) => {
                if (updateErr) return res.status(500).json(errorResponse(updateErr instanceof Error ? updateErr.message : 'Datenbankfehler'));
                res.json(successResponse({ id, successful_runs: newSuccessfulRuns }));
            });
        });
    }
};
