import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built site works both at the GitHub Pages project
  // path (samarth-thosar.github.io/sam-portfolio/) and at the custom-domain
  // root (samarth-thosar.is-a.dev/). The game has no client-side routing.
  base: './',
  plugins: [react()],
  server: {
    host: true,
    open: true,
  },
})
