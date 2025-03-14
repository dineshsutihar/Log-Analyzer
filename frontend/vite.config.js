import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc',
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0", 
    strictPort: true,
    watch: {
      usePolling: true, // Ensures file changes are detected inside Docker
    },
  },
});
