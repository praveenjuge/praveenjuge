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
  // @ts-expect-error Tailwind's Vite plugin is typed against the workspace Vite version.
  vite: { plugins: [tailwindcss()] },
});
