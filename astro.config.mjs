// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { satteri, satteriHeadingIdsPlugin } from "@astrojs/markdown-satteri";
import { headingAnchors, imageCaptions } from "./src/markdown.mjs";

// Single design pages are noindex (see src/pages/design/[...slug].astro), so
// leave them out of the sitemap too. The /design/ archive stays in.
const isDesignPage = (page) => /^\/design\/[^/]+\/?$/.test(new URL(page).pathname);

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
  integrations: [sitemap({ filter: (page) => !isDesignPage(page) })],
  markdown: {
    shikiConfig: { theme: "github-light" },
    processor: satteri({
      // Heading ids first, so the anchors can link to them.
      hastPlugins: [satteriHeadingIdsPlugin(), headingAnchors, imageCaptions],
    }),
  },
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
