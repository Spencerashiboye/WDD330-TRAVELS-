import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/',

  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        explore: resolve(__dirname, 'src/explore/index.html'),
        flights: resolve(__dirname, 'src/flights/index.html'),
        compare: resolve(__dirname, 'src/compare/index.html'),
        favorites: resolve(__dirname, 'src/favorites/index.html')
      }
    }
  }
});
