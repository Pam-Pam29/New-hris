import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// HR Platform with separate root directory
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    define: {
        'process.env.PLATFORM': JSON.stringify('HR')
    },
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
    build: {
        rollupOptions: {
            input: './hr-platform/index.html'
        }
    },
    server: {
        port: 3001,
        host: true,
        open: '/',
        fs: {
            strict: false
        }
    },
    root: './hr-platform',
    publicDir: '../public'
});
