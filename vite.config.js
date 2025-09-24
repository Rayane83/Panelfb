import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Since this is a server-side rendered app, we don't need to build anything
    // This configuration prevents Vite from looking for an index.html entry
    lib: {
      entry: './server.js',
      name: 'FlashbackFAEnterprise',
      fileName: 'server'
    },
    rollupOptions: {
      external: ['express', 'express-session', 'axios', '@supabase/supabase-js', 'dotenv', 'ejs', 'body-parser', 'cors'],
      output: {
        globals: {
          express: 'express'
        }
      }
    }
  }
})