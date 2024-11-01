import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ pattern: '**\/[^_]*.md', base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishedAt: z.coerce.date()
	}),
});

const design = defineCollection({
	loader: glob({ pattern: '**\/[^_]*.md', base: "./src/content/design" }),
	schema: ({ image }) => z.object({
		title: z.string(),
		coverImage: image(),
		publishedAt: z.coerce.date()
	}),
});

export const collections = { blog, design };
