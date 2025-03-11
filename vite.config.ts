import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'app/components'),
      '@routes': path.resolve(__dirname, 'app/routes'),
      '@': path.resolve(__dirname, 'app'),
    },
  },
});