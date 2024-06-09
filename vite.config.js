import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  root: 'public',  // This sets the base directory for the project
  build: {
    outDir: '../dist',  // Output directory, relative to the root
  }
});


