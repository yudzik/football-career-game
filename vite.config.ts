import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves this as a project page under /football-career-game/, so asset URLs
// need that prefix — but only there. The Capacitor build (webDir: dist) loads index.html
// straight out of the native app bundle and needs root-relative paths, so this only kicks
// in when the Pages workflow explicitly sets GH_PAGES=true; plain `npm run build` stays at '/'.
export default defineConfig({
  base: process.env.GH_PAGES === 'true' ? '/football-career-game/' : '/',
  plugins: [react(), tailwindcss()],
});
