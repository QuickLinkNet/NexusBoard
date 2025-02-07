import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';

// ES Module Workaround für __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Server Konfiguration
const SERVER = 'u2915078@h2915078.stratoserver.net';
const TARGET_PATH = '/kunden/pages/b1/f3/d0015521/home/htdocs/x';
const SSH_KEY_PATH = join(homedir(), '.ssh', 'id_rsa'); // Standard SSH Key Pfad

async function deployFrontend() {
    try {
        console.log('🚀 Starte Frontend Deployment...\n');

        // 1. Build erstellen
        console.log('📦 Erstelle Production Build...');
        execSync('npm run build', { stdio: 'inherit' });

        // SSH Optionen für alle Befehle
        const sshOptions = `-i "${SSH_KEY_PATH}"`;

        // 2. Nur index.html und assets/ Ordner löschen
        console.log('\n🗑️  Entferne alte Frontend-Dateien...');
        execSync(`ssh ${sshOptions} ${SERVER} "cd ${TARGET_PATH} && rm -f index.html && rm -rf assets"`, {
            stdio: 'inherit'
        });

        // 3. Dateien hochladen
        console.log('\n📤 Kopiere Frontend-Dateien...');
        execSync(`scp ${sshOptions} -r dist/* ${SERVER}:${TARGET_PATH}/`, {
            stdio: 'inherit'
        });

        // 4. Berechtigungen setzen (nur für neue Dateien)
        console.log('\n🔒 Setze Berechtigungen...');
        execSync(`ssh ${sshOptions} ${SERVER} "chmod 644 ${TARGET_PATH}/index.html && chmod -R 644 ${TARGET_PATH}/assets/* && find ${TARGET_PATH}/assets -type d -exec chmod 755 {} +"`, {
            stdio: 'inherit'
        });

        // 5. Erfolgsmeldung
        console.log('\n✅ Frontend Deployment erfolgreich abgeschlossen!');
        console.log(`\n🌐 Frontend ist nun verfügbar unter: https://x.crm-standortfabrik.de/`);

    } catch (error) {
        if (error.message.includes('Permission denied')) {
            console.error('\n❌ SSH Authentifizierung fehlgeschlagen!');
            console.log('\nBitte stellen Sie sicher, dass:');
            console.log('1. Ein SSH-Key existiert (~/.ssh/id_rsa)');
            console.log('2. Der öffentliche Key auf dem Server hinterlegt ist');
            console.log('\nSSH-Key erstellen:');
            console.log('  ssh-keygen -t rsa -b 4096');
            console.log('\nKey auf Server kopieren:');
            console.log(`  ssh-copy-id ${SERVER}`);
        } else {
            console.error('\n❌ Deployment fehlgeschlagen:', error.message);
        }
        process.exit(1);
    }
}

deployFrontend();
