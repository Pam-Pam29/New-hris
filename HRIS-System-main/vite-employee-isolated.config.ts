import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Employee Platform isolated configuration
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
    root: '.',
    publicDir: 'public',
    define: {
        'process.env.PLATFORM': JSON.stringify('EMPLOYEE')
    }
});
