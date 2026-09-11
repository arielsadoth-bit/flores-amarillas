import { defineConfig } from 'vite';
import vinext from 'vinext';
import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
export default defineConfig({
  plugins: [vinext(), sites()],
  css: { postcss: { plugins: [tailwindcss()] } },
});
