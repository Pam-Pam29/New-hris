import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// HR Platform specific Vite configuration - NEW APPROACH
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
    root: '.',
    publicDir: 'public',
    define: {
        'process.env.PLATFORM': JSON.stringify('HR')
    }
});
