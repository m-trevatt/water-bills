import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: 'static',
  site: 'https://medway-water.pages.dev',

  build: {
    assets: 'assets'
  },

  server: {
    port: 4321
  },

  adapter: cloudflare()
});