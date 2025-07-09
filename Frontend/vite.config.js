import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    cors: true,
    headers: {
      // Disable CSP for development to avoid inline script issues
      'Content-Security-Policy': ''
    }
  },
  preview: {
    port: 5173,
    host: true
  }
})
