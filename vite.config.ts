import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // The Vite build outputs the SPA into dist/client so it never collides with
    // the compiled backend bundle at dist/server.cjs (server serves dist/client).
    build: {
      outDir: 'dist/client',
      // Use _app instead of default 'assets' to bypass any CDN-cached
      // broken responses for the /assets/ path.
      assetsDir: '_app',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR toggle retained from AI Studio; file watching disabled to prevent
      // flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
