import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Fail loudly if 5173 is taken instead of silently moving to 5174+ --
    // the API's CORS allowlist (server/.env CLIENT_ORIGIN) is pinned to
    // 5173, so a silent port bump breaks every request with a CORS error
    // that has nothing to do with the code.
    port: 5173,
    strictPort: true,
  },
})
