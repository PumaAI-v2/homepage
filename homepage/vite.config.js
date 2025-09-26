import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// replace `your-username` and `your-repo` with your actual GitHub info
export default defineConfig({
  plugins: [react()],
  base: '/your-repo/', 
})
