import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',          // escucha en todas las interfaces, no solo localhost
    port: 5173,               // puerto del servidor
    strictPort: true,         // evita que cambie el puerto automáticamente
    allowedHosts: ['.ngrok-free.dev'], // permite cualquier subdominio de ngrok
    cors: true,               // habilita solicitudes externas
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
})
