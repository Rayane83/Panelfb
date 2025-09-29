import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    host: true
  },
  define: {
    'import.meta.env.VITE_DISCORD_CLIENT_ID': JSON.stringify('1402231031804723210'),
    'import.meta.env.VITE_DISCORD_CLIENT_SECRET': JSON.stringify('LgKUe7k1mwTnj1qlodKcYKnoRPVB6QoG'),
    'import.meta.env.VITE_DISCORD_REDIRECT_URI': JSON.stringify('https://flashbackfa-entreprise.fr/auth/callback'),
    'import.meta.env.VITE_MAIN_GUILD_ID': JSON.stringify('1404608015230832742'),
    'import.meta.env.VITE_DOT_GUILD_ID': JSON.stringify('1404609091372056606')
  }
})