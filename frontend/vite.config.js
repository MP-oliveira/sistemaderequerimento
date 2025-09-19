import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://sistemaderequerimento-backend-kvrxc4vq3.vercel.app',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Garantir que os arquivos PWA sejam incluídos no build
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'manifest.json' || assetInfo.name === 'sw.js') {
            return '[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
