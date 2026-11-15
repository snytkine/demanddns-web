import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A relative base plus hash-based routing lets the same build work on
// GitHub Pages under any repository name or a custom domain.
export default defineConfig({
  base: './',
  plugins: [react()],
});
