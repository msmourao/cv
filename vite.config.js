import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/cv/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
