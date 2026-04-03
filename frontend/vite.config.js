import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  proxy: {
    '/api': 'http://localhost:8000',
    secure: false,
    changeOrigin: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});