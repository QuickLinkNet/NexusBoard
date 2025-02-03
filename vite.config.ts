import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    include: ['lucide-react']
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
});