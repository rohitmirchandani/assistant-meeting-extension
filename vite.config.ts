import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'build', // Set output directory for extension files
    rollupOptions: {
      input: {
        popup: 'index.html', // Chrome extension popup
        background: 'public/background.js', // Background script
      },
    },
  },
});
