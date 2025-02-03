import * as mysql from 'mysql';
import * as dotenv from 'dotenv';

// Lade die Umgebungsvariablen
dotenv.config();

// Stelle sicher, dass alle erforderlichen Umgebungsvariablen vorhanden sind
const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_DATABASE'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Fehlende Umgebungsvariable: ${envVar}`);
    }
}

export const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD || '', // Optional, leerer String wenn nicht gesetzt
    database: process.env.MYSQL_DATABASE
});

db.connect(err => {
    if (err) {
        console.error('Fehler bei der Datenbankverbindung:', err);
        throw err;
    }
    console.log('MySQL verbunden...');
});
