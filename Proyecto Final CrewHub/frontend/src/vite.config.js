import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', 
    port: 5173,
    allowedHosts: ['crewhub.es', 'www.crewhub.es', '34.206.221.208'] 
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['crewhub.es', 'www.crewhub.es', '34.206.221.208']
  }
})