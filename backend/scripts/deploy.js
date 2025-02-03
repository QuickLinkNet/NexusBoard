const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Konfiguration für Windows und ASUS NAS
const config = {
  nasPath: '\\\\192.168.2.49\\Web\\vhosts\\my-dashboard\\backend',
  sourcePath: path.join(__dirname, '..'),
};

async function deploy() {
  try {
    console.log('Starte Deployment...');

    console.log('Kopiere Dateien auf die NAS...');

    // Erstelle Zielverzeichnis falls es nicht existiert
    execSync(`mkdir "${config.nasPath}" 2>nul || echo Verzeichnis existiert bereits`, { stdio: 'inherit' });

    // Kopiere die notwendigen Dateien
    const filesToCopy = [
      'package.json',
      'package-lock.json',
      '.env'  // Kopiere auch die .env-Datei
    ];

    for (const file of filesToCopy) {
      if (fs.existsSync(path.join(config.sourcePath, file))) {
        console.log(`Kopiere ${file}...`);
        execSync(`copy /Y "${path.join(config.sourcePath, file)}" "${config.nasPath}"`, { stdio: 'inherit' });
      } else {
        console.warn(`Warnung: ${file} existiert nicht und wird übersprungen`);
      }
    }

    // Kopiere den Inhalt des dist Ordners direkt ins Zielverzeichnis
    console.log('Kopiere kompilierte Dateien...');
    execSync(`xcopy "${path.join(config.sourcePath, 'dist\\*')}" "${config.nasPath}" /Y /E /I /S`, { stdio: 'inherit' });

    // Führe die NAS-Befehle aus
    console.log('\nFühre Befehle auf der NAS aus...');

    // Verbinde zur NAS via SSH und führe die Befehle aus
    const nasCommands = [
      'cd /volume1/Web/vhosts/my-dashboard/backend',
      'rm -rf node_modules package-lock.json',
      'npm cache clean --force',
      'npm install --production',
      'export PATH=$PATH:/volume1/.@plugins/AppCentral/nodejs/bin', // Setze Node.js PATH
      'pm2 delete server || true', // || true verhindert Fehler wenn der Server nicht existiert
      'pm2 start server.js'
    ].join(' && ');

    // Führe die Befehle auf der NAS aus
    execSync(`ssh admin@192.168.2.49 "${nasCommands}"`, {
      stdio: 'inherit',
      shell: true
    });

    console.log('\nDeployment erfolgreich abgeschlossen!');
  } catch (error) {
    console.error('Deployment fehlgeschlagen:', error.message);
    process.exit(1);
  }
}

deploy();
