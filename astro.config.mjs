// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://praveenjuge.com",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "load",
  },
  build: {
    inlineStylesheets: "always",
  },
  experimental: {
    clientPrerender: true,
  },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
