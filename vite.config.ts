import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  // Mirrors what nginx does in the container: the app talks to its own origin and
  // everything under /api is forwarded to the backend, so dev and production share
  // one setup and CORS is never involved. No path rewriting — the backend serves
  // these paths verbatim.
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
