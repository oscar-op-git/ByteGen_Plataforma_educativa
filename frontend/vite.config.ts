import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Auth.js
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // opcional pero útil con cookies:
        cookieDomainRewrite: 'localhost',
      },
      // si también quieres proxy para tus APIs:
      // '/api': {
      //   target: 'http://localhost:3000',
      //   changeOrigin: true,
      //   secure: false,
      //   cookieDomainRewrite: 'localhost',
      // },
    },
  },
  define: {
    'process.env': {}, // evita "process is not defined"
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
})
