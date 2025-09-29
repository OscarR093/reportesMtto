import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',//cambiar a 3002 para produccion
        changeOrigin: true,
        secure: false
      }
    }
  }
})
