// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { satteri, satteriHeadingIdsPlugin } from "@astrojs/markdown-satteri";
import { headingAnchors, imageCaptions, responsiveImages } from "./src/markdown.mjs";

// Single design pages are noindex (see src/pages/design/[...slug].astro), so
// leave them out of the sitemap too. The /design/ archive stays in.
const isDesignPage = (page) => /^\/design\/[^/]+\/?$/.test(new URL(page).pathname);

export default defineConfig({
  site: "https://praveenjuge.com",
  // No prefetch script: Layout.astro ships static speculation rules, which
  // prerender a page on hover or touch instead of every link on load.
  build: {
    inlineStylesheets: "always",
  },
  image: {
    // Book covers come from Hardcover and get resized at build time.
    remotePatterns: [{ protocol: "https", hostname: "assets.hardcover.app" }],
    // Widths for responsive blog images (src/markdown.mjs): the text column's
    // 56rem bleed at 1x and 2x, and the steps between for phones.
    breakpoints: [640, 960, 1280, 1792],
  },
  integrations: [sitemap({ filter: (page) => !isDesignPage(page) })],
  markdown: {
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
    processor: satteri({
      // Heading ids first, so the anchors can link to them.
      hastPlugins: [
        satteriHeadingIdsPlugin(),
        headingAnchors,
        imageCaptions,
        responsiveImages,
      ],
    }),
  },
  fonts: [
    {
      // Geist Serif isn't on Google Fonts yet, so it's self-hosted from the
      // `geist` npm release. It ships in a single weight with no italics.
      name: "Geist Serif",
      provider: fontProviders.local(),
      cssVariable: "--font-geist-serif",
      fallbacks: ["Times New Roman", "serif"],
      options: {
        variants: [
          {
            src: ["./src/fonts/GeistSerif-Regular.woff2"],
            weight: 400,
            style: "normal",
          },
        ],
      },
    },
  ],
  vite: { plugins: [tailwindcss()] },
});
