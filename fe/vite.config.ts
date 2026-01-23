import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/songs': 'http://localhost:8080',
      '/upload': 'http://localhost:8080',
      '/contact': 'http://localhost:8080',
      '/stream': 'http://localhost:8080',
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
