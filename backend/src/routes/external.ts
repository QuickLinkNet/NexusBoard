import { Request, Response } from 'express';
import axios from 'axios';
import { successResponse, errorResponse } from '../utils/responses';

export const externalRoutes = {
    getCryptoPrices: async (req: Request, res: Response) => {
        try {
            const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,dogecoin&vs_currencies=eur,usd');
            res.json(successResponse(response.data));
        } catch (error) {
            res.status(500).json(errorResponse("Fehler beim Abrufen der Kryptowährungsdaten"));
        }
    },

    sendDiscordMessage: (req: Request, res: Response) => {
        const { channelId, message } = req.body;
        // Implementierung für Discord-Nachricht hier
        res.status(200).json(successResponse(null, 'Nachricht erfolgreich gesendet'));
    }
};