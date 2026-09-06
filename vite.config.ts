import path from 'path';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login/index.html'),
        curriculum: resolve(__dirname, 'curriculum/index.html'),
        results: resolve(__dirname, 'results/index.html'),
        guide: resolve(__dirname, 'guide/index.html'),
        about: resolve(__dirname, 'about/index.html'),
      }
    }
  }
});
