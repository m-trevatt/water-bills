import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://medway-water.pages.dev',
  build: {
    assets: 'assets'
  },
  server: {
    port: 4321
  }
});
