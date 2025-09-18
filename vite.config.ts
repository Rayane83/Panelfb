import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: false,
    host: true
  },
  define: {
    // Expose env variables to the client
    'process.env': {}
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
