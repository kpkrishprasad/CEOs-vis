import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: '/CEOs-HATE-This-Simple-Trick/',  // Adjust this if deploying to a subpath, use './' or '/' if at the root
  build: {
    outDir: 'dist',  // Customize the output directory
    rollupOptions: {
      output: {
        // Ensures that assets are placed in a structured way if necessary
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'build/[name].[hash].js',
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',  // This allows you to use '@/somePath' as an alias to '/src/somePath'
    }
  }
});