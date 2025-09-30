import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
    server: {
        port: 3001,
        host: true,
        open: '/',
        fs: {
            strict: false
        }
    },
    define: {
        'process.env.PLATFORM': JSON.stringify('HR')
    }
});
