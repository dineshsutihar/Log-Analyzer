import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: "0.0.0.0", 
    strictPort: true,
    watch: {
      usePolling: true, 
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-mui-x': ['@mui/x-data-grid', '@mui/x-charts', '@mui/x-date-pickers'],
          'vendor-clerk': ['@clerk/clerk-react'],
          'vendor-markdown': ['react-markdown', 'react-syntax-highlighter'],
        },
      },
    },
  },
});
