import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match your repo name on GitHub
export default defineConfig({
  plugins: [react()],
  base: '/homepage/',
})
