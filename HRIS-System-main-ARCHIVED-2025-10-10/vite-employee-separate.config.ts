import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Employee Platform with separate root directory
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    define: {
        'process.env.PLATFORM': JSON.stringify('EMPLOYEE')
    },
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
    build: {
        rollupOptions: {
            input: './employee-platform/index.html'
        }
    },
    server: {
        port: 3002,
        host: true,
        open: '/',
        fs: {
            strict: false
        }
    },
    root: './employee-platform',
    publicDir: '../public'
});
