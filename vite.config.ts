import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    // Setze die Base URL für Production
    base: '/'
  },
  optimizeDeps: {
    include: ['lucide-react']
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
});
