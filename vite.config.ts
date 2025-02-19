import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '', // Leerer Base-Pfad, damit relative Pfade ohne führenden Slash generiert werden
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