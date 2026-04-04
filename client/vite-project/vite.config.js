import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',                // Ensures assets are resolved from the root
  build: {
    outDir: 'dist',        // Explicitly set output directory (Vite default is 'dist')
    assetsDir: 'assets',   // Keep assets in a separate folder
  },
});