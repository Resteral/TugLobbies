/**
 * Vite configuration for React 18 with Fast Refresh
 * - Adds @vitejs/plugin-react for dev experience and JSX transforms.
 * - Keeps minimal Rollup config and dependency optimization.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    /**
     * React plugin:
     * - Enables Fast Refresh (HMR) in development.
     * - Handles JSX transform and automatic JSX runtime.
     */
    react(),
  ],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});