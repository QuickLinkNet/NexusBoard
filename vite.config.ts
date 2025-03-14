import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// Hole die Backend-URL aus den Umgebungsvariablen
const backendUrl = process.env.VITE_BACKEND_URL || '/apps/nexusboard/api';
const baseUrl = backendUrl.split('/api')[0]; // Extrahiere den Basis-Pfad

export default defineConfig({
  plugins: [react()],
  base: baseUrl, // Setze den korrekten Base-Pfad für das Frontend
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false
  },
  optimizeDeps: {
    include: ['lucide-react']
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
});