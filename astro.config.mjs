// @ts-check
import { defineConfig, fontProviders } from "astro/config";
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
    queuedRendering: {
      enabled: true,
    },
  },
  integrations: [sitemap()],
  fonts: [
    {
      name: "Geist",
      provider: fontProviders.google(),
      cssVariable: "--font-geist",
      weights: ["100 900"],
    },
  ],
  vite: { plugins: [tailwindcss()] },
});
