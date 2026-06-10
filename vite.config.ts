import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/flow-report/',
    plugins: [
      react(),
      legacy()
    ],
    // The reader Lambda's Function URL CORS config doesn't allow localhost,
    // so local dev proxies the data fetch through the dev server. Set
    // DATA_PROXY_TARGET to the Function URL and VITE_DATA_API_URL=/data-api
    // in .env.local (production builds keep the full URL and no proxy).
    server: env.DATA_PROXY_TARGET ? {
      proxy: {
        '/data-api': {
          target: env.DATA_PROXY_TARGET,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/data-api/, '/'),
        },
      },
    } : undefined,
  }
})
