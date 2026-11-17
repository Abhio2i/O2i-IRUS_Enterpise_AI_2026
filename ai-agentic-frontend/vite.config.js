import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/sentry-api': {
        target: 'http://147.93.108.99:9090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sentry-api/, ''),
      },
      '/incidents': {
        target: 'http://147.93.108.99:9090',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:9095',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
