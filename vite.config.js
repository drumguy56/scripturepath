import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// The API (Hono on Bun) runs on PORT (default 3000). In dev, Vite proxies /api to it.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = `http://localhost:${env.PORT || process.env.PORT || 3000}`

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      proxy: {
        '/api': { target: apiTarget, changeOrigin: false },
      },
    },
  }
})
