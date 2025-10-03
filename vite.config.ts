/**
 * Vite configuration for Discord SDK integration
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      external: [], // Add any external dependencies if needed
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          discord: [] // Discord SDK would go here when installed
        }
      }
    }
  },
  optimizeDeps: {
    include: [] // Add Discord SDK when available
  }
})