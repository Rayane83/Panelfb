import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    https: false,
    host: true
  },
  build: {
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: undefined,
      },
    },
  },
  define: {
    // Définir les variables d'environnement pour le build
    'import.meta.env.VITE_DISCORD_CLIENT_ID': JSON.stringify('1402231031804723210'),
    'import.meta.env.VITE_DISCORD_CLIENT_SECRET': JSON.stringify('LgKUe7k1mwTnj1qlodKcYKnoRPVB6QoG'),
    'import.meta.env.VITE_DISCORD_REDIRECT_URI': JSON.stringify('https://flashbackfa-entreprise.fr/auth/callback'),
    'import.meta.env.VITE_MAIN_GUILD_ID': JSON.stringify('1404608015230832742'),
    'import.meta.env.VITE_DOT_GUILD_ID': JSON.stringify('1404609091372056606')
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
