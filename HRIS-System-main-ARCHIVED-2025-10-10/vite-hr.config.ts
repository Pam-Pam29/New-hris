import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// HR Platform specific Vite configuration
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
            input: {
                main: './index-hr.html'
            }
        }
    },
    server: {
        port: 5173,
        open: '/',
        host: true,
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
