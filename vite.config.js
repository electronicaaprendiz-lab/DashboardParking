import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Este es el alias que usaremos en el frontend
      '/api-arex': {
        target: 'https://admin-api.arexpark.com', // La URL base de tu API
        changeOrigin: true,
        // Borra la palabra '/api-arex' antes de pasarle la ruta al servidor real
        rewrite: (path) => path.replace(/^\/api-arex/, ''), 
      },
    },
  },
})