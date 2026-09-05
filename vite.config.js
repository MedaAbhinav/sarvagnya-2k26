import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for GitHub Pages deployment:
// https://medaabhinav.github.io/sarvagnya-2k26/
const base = process.env.GITHUB_PAGES === 'true' ? '/sarvagnya-2k26/' : '/'

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':    ['react', 'react-dom', 'react-router-dom'],
          'motion-vendor':   ['framer-motion'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor':       ['react-hook-form', 'react-hot-toast', 'lucide-react'],
        },
      },
    },
  },
})
