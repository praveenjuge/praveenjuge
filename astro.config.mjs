// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { satteri, satteriHeadingIdsPlugin } from "@astrojs/markdown-satteri";
import { headingAnchors, imageCaptions, responsiveImages } from "./src/markdown.mjs";
import geist from "./src/fonts/geist.json" with { type: "json" };

// Single design pages are noindex (see src/pages/design/[...slug].astro), so
// leave them out of the sitemap too. The /design/ archive stays in.
const isDesignPage = (page) => /^\/design\/[^/]+\/?$/.test(new URL(page).pathname);

// Geist, cut down by scripts/fonts/subset.py to what the site draws. Each
// style has a core file, listed first, and an extended one the browser only
// fetches for characters in its unicode-range; Layout.astro preloads the
// upright core. All four stay in one family so the generated fallback face
// comes after them, not between core and extended.
const subsetGeist = {
  name: "subset-geist",
  // Part of Astro's cache key, so a rerun of the script is picked up.
  config: { faces: geist.faces },
  resolveFont: () => ({
    fonts: geist.faces.map((face) => ({
      src: [
        {
          url: fileURLToPath(new URL(`./src/fonts/${face.file}`, import.meta.url)),
          format: "woff2",
        },
      ],
      weight: face.weight,
      style: face.style,
      unicodeRange: face.unicodeRange,
    })),
  }),
};

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
      name: "Geist",
      provider: subsetGeist,
      cssVariable: "--font-geist",
    },
  ],
  vite: { plugins: [tailwindcss()] },
});
