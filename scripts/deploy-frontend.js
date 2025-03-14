import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import * as ftp from 'basic-ftp';
import {config} from 'dotenv';
import {execSync} from 'child_process';
import {copyFileSync} from 'fs';

// Lade Umgebungsvariablen
config();

// ES Module Workaround für __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FTP Konfiguration aus Umgebungsvariablen
const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PASSWORD = process.env.FTP_PASSWORD;
const FTP_PATH = process.env.FTP_PATH || '/';

async function deployFrontend() {
    try {
        console.log('🚀 Starte Frontend Deployment...\n');

        // 1. Build erstellen
        console.log('📦 Erstelle Production Build...');
        execSync('npm run build', {stdio: 'inherit'});

        // 2. Kopiere .htaccess in den dist Ordner
        console.log('\n📄 Kopiere Frontend .htaccess in den Build-Ordner...');
        copyFileSync(
            join(__dirname, '../.htaccess'),
            join(__dirname, '../dist/.htaccess')
        );

        // 3. FTP Client initialisieren
        console.log('\n📡 Verbinde mit FTP Server...');
        const client = new ftp.Client();
        client.ftp.verbose = true;

        try {
            await client.access({
                host: FTP_HOST,
                user: FTP_USER,
                password: FTP_PASSWORD,
                secure: false
            });

            console.log('✅ FTP Verbindung hergestellt');

            // 4. Frontend-Verzeichnis leeren und Dateien hochladen
            console.log(`\n📂 Wechsle in Frontend-Verzeichnis: ${FTP_PATH}`);
            await client.ensureDir(FTP_PATH);
            console.log('🗑️  Leere Frontend-Verzeichnis...');
            await client.clearWorkingDir();

            console.log('\n📤 Lade Frontend-Dateien hoch...');
            await client.uploadFromDir(join(__dirname, '../dist'));

            // 5. API-Verzeichnis erstellen und Dateien hochladen
            const apiPath = `${FTP_PATH}/api`;
            console.log(`\n📂 Erstelle und wechsle in API-Verzeichnis: ${apiPath}`);
            await client.ensureDir(apiPath);
            console.log('🗑️  Leere API-Verzeichnis...');
            await client.clearWorkingDir();

            console.log('\n📤 Lade API-Dateien hoch...');
            await client.uploadFromDir(join(__dirname, '../api'));

            console.log('\n✅ Deployment erfolgreich abgeschlossen!');
            console.log('   Folgende Verzeichnisse wurden geleert und neu befüllt:');
            console.log(`   - ${FTP_PATH} (Frontend)`);
            console.log(`   - ${apiPath} (API)`);

        } catch (err) {
            throw new Error(`FTP Error: ${err.message}`);
        } finally {
            client.close();
        }

    } catch (error) {
        console.error('\n❌ Deployment fehlgeschlagen:', error.message);

        if (error.message.includes('FTP')) {
            console.log('\nBitte überprüfen Sie:');
            console.log('1. FTP Zugangsdaten in der .env Datei');
            console.log('2. FTP Server ist erreichbar');
            console.log('3. Zielverzeichnis existiert und hat die korrekten Berechtigungen');
        }

        process.exit(1);
    }
}

deployFrontend();