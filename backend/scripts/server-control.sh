#!/bin/bash

echo "🔄 Server-Neustart wird vorbereitet..."

# Beende laufende Server-Prozesse
echo "⏹️  Beende laufende Prozesse..."
pkill -f "node server.js" || true

# Warte kurz
sleep 2

# Starte den Server
echo "▶️  Starte Server..."
PORT=3001 nohup node server.js > server.log 2>&1 &

# Warte und prüfe ob der Server läuft
sleep 3
if ! ps aux | grep "[n]ode server.js" > /dev/null; then
    echo "❌ Server konnte nicht gestartet werden. Server-Log:"
    tail -n 20 server.log
    exit 1
fi

echo "✅ Server erfolgreich gestartet!"
