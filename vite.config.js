import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        host: '0.0.0.0', // Memungkinkan akses dari alamat IP apa pun (termasuk localhost dan network)
        port: 5173,      // Port default Vite
        strictPort: true, // Berhenti jika port sudah digunakan, agar tidak membingungkan
        hmr: {
            host: '127.0.0.1',
        },
    },
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
});

