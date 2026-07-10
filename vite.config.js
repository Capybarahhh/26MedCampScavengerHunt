import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site under /<repo-name>/; local dev stays at /.
  base: process.env.GITHUB_ACTIONS ? '/26MedCampScavengerHunt/' : '/',
});
