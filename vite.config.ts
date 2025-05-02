import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/order-tracker/',
  plugins: [react()],
  build: {
    outDir: 'docs'
  }
})