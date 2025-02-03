const { execSync } = require('child_process');
const { SERVER, TARGET_PATH } = require('./config');

async function startServer() {
    try {
        console.log('🔄 Starte Server neu...');
        execSync(`ssh ${SERVER} "cd ${TARGET_PATH} && ./server-control.sh"`, { stdio: 'inherit' });
        console.log('✅ Server erfolgreich gestartet!');
    } catch (error) {
        console.error('❌ Server-Start fehlgeschlagen:', error.message);
        process.exit(1);
    }
}

startServer();
