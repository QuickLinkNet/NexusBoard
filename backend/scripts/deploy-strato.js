const { execSync } = require('child_process');
const { SERVER, TARGET_PATH } = require('./config');

function execRemote(command) {
    return execSync(`ssh ${SERVER} "cd ${TARGET_PATH} && ${command}"`, { stdio: 'inherit' });
}

async function deploy() {
    try {
        console.log('🚀 Starte Deployment...\n');

        // 1. Vorbereitung
        console.log('📁 Leere Zielordner...');
        execRemote('rm -rf *');

        // 2. Datei-Upload
        console.log('📤 Kopiere Dateien...');
        const filesToCopy = [
            { source: 'dist/*', type: 'folder' },
            { source: 'package*.json', type: 'file' },
            { source: '.htaccess', type: 'file' },
            { source: 'index.html', type: 'file' },
            { source: 'scripts/server-control.sh', type: 'file' }
        ];

        for (const file of filesToCopy) {
            execSync(`scp -r ${file.source} ${SERVER}:${TARGET_PATH}`, { stdio: 'inherit' });
        }

        // 3. Server-Setup
        console.log('\n🔧 Konfiguriere Server...');
        execRemote('chmod +x server-control.sh');

        // 4. Dependencies
        console.log('📦 Installiere Dependencies...');
        execRemote('npm install --production');

        // 5. Server-Start
        console.log('\n🚀 Starte Server...');
        execRemote('./server-control.sh');

        // 6. Erfolgsmeldung
        console.log('\n✅ Deployment erfolgreich abgeschlossen!');
        console.log('\nNützliche Befehle:');
        console.log('📋 Server-Log anzeigen:');
        console.log(`   ssh ${SERVER} "tail -f ${TARGET_PATH}/server.log"`);

    } catch (error) {
        console.error('\n❌ Deployment fehlgeschlagen:', error.message);
        process.exit(1);
    }
}

deploy();
