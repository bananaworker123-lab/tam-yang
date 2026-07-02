import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@homework-tracker/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@homework-tracker/shared-auth': path.resolve(__dirname, '../../packages/shared-auth/src/index.ts'),
      '@homework-tracker/shared-errors': path.resolve(__dirname, '../../packages/shared-errors/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
