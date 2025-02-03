# Dashboard Backend

Dieses Backend stellt die Server-Komponente für das Dashboard bereit. Es bietet REST-APIs für Prompt-Management, Metadaten-Generierung und Benutzer-Authentifizierung.

## 🚀 Schnellstart

```bash
# Repository klonen
git clone [repository-url]
cd dashboard-backend

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run start

# Für Produktion bauen
npm run build
```

## 📋 Verfügbare Scripts

- `npm run build` - Kompiliert TypeScript zu JavaScript
- `npm run deploy:strato` - Deployed auf den Strato Server
- `npm run start:strato` - Startet den Server auf Strato neu
- `npm start` - Startet den Server lokal

## 🌐 Deployment

### Strato Server

Das Projekt enthält vorkonfigurierte Deployment-Scripts für Strato Managed Server.

#### Erstmaliges Deployment

1. SSH-Key für den Server einrichten:
   ```bash
   # SSH-Key generieren
   ssh-keygen -t rsa -b 4096
   
   # Key auf Server kopieren
   ssh-copy-id u2915078@h2915078.stratoserver.net
   ```

2. Deployment durchführen:
   ```bash
   npm run build:deploy:strato
   ```

#### Server neu starten

```bash
npm run start:strato
```

### Deployment-Prozess

Der Deployment-Prozess läuft in folgenden Schritten ab:

1. **Vorbereitung**
   - Leeren des Zielverzeichnisses
   - Sicherstellung sauberer Umgebung

2. **Datei-Upload**
   - Kompilierte Dateien
   - Konfigurationsdateien
   - Server-Control-Script

3. **Server-Setup**
   - Setzen von Berechtigungen
   - Installation von Dependencies

4. **Server-Start**
   - Beenden alter Prozesse
   - Starten des neuen Servers
   - Überprüfung des Server-Status

## 📁 Projektstruktur

```
backend/
├── src/                    # Quellcode
│   ├── config/            # Konfigurationsdateien
│   ├── middleware/        # Express Middleware
│   ├── routes/            # API Routen
│   ├── types/             # TypeScript Typdefinitionen
│   └── utils/             # Hilfsfunktionen
├── scripts/               # Deployment Scripts
│   ├── config.js         # Server-Konfiguration
│   ├── deploy-strato.js  # Strato Deployment
│   ├── start-server.js   # Server-Start
│   └── server-control.sh # Server-Steuerung
└── dist/                  # Kompilierte Dateien
```

## 🔧 Konfiguration

### Umgebungsvariablen

Kopiere `.env.example` zu `.env` und passe die Werte an:

```env
# Database Configuration
MYSQL_HOST=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=

# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET=your_jwt_secret
```

### Server-Konfiguration

Die Server-Konfiguration befindet sich in `scripts/config.js`:

```javascript
module.exports = {
    SERVER: 'u2915078@h2915078.stratoserver.net',
    TARGET_PATH: '/kunden/pages/b1/f3/d0015521/home/htdocs/x',
    PORT: 3001
};
```

## 📝 Logs

Server-Logs werden in `server.log` geschrieben. Anzeigen mit:

```bash
# Lokal
tail -f server.log

# Auf Strato
ssh u2915078@h2915078.stratoserver.net "tail -f /kunden/pages/b1/f3/d0015521/home/htdocs/x/server.log"
```

## 🔒 Sicherheit

- Alle API-Endpunkte sind durch JWT-Authentication geschützt
- CORS ist konfiguriert und eingeschränkt
- Passwörter werden mit bcrypt gehasht
- Umgebungsvariablen für sensitive Daten

## 🛠 Entwicklung

### Neue API-Route hinzufügen

1. Route in `src/routes/` erstellen
2. In `server.ts` registrieren
3. TypeScript-Typen in `src/types/` definieren
4. Middleware nach Bedarf in `src/middleware/` hinzufügen

### Deployment anpassen

1. `scripts/config.js` aktualisieren
2. Bei Bedarf `server-control.sh` anpassen
3. Deployment mit `npm run deploy:strato` testen
