import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev:   npm run dev  -> http://localhost:5173/careconnect/ui/  (API proxied to Tomcat on 8080)
// Build: npm run build -> writes into the Java WAR (backend/src/main/webapp/ui)
export default defineConfig({
  plugins: [react()],
  base: '/careconnect/ui/',
  build: { outDir: '../backend/src/main/webapp/ui', emptyOutDir: true },
  server: { proxy: { '/careconnect/api': 'http://localhost:8080' } },
});
