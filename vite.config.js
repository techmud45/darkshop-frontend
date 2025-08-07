import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173, // Vite dev server port
    allowedHosts: [
      '127.0.0.1',
      'localhost',
      's2dqyy4dtfikvaeibyez3udfip5ytoqcxs6v4dxgsufmcn25jzr2txad.onion',
    ],

    proxy: {
      // Redirect /api calls to your backend
      '/api': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
