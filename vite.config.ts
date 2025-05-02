import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/order-tracker/',
  plugins: [react()], // Теперь импорт используется
  build: {
    outDir: 'docs'
  }
})