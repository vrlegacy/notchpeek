import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://vrlegacy.github.io/notchpeek/
export default defineConfig({
  plugins: [react()],
  base: '/notchpeek/',
})
