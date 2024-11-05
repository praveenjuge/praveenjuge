import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { rssSchema } from "@astrojs/rss";

const blog = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/blog" }),
  schema: rssSchema,
});

const design = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/design" }),
  schema: ({ image }) => rssSchema.extend({ coverImage: image() }),
});

export const collections = { blog, design };
