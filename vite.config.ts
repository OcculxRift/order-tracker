import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// Функция для копирования дополнительных файлов
function copyFiles() {
  const files = ['_redirects', '404.html']
  files.forEach(file => {
    copyFileSync(
      join(__dirname, file),
      join(__dirname, 'docs', file)
  })
}

export default defineConfig({
  base: '/order-tracker/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      plugins: [{
        name: 'copy-files',
        closeBundle: copyFiles
      }]
    }
  }
})