import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		status: z.enum(['published', 'draft']).optional(),
		publishedAt: z.coerce.date(),
		coverImage: z.string().optional(),
		author: z.object({
			name: z.string().optional(),
			picture: z.string().optional(),
		}).optional(),
	}),
});

const design = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		status: z.enum(['published', 'draft']).optional(),
		publishedAt: z.coerce.date(),
		coverImage: z.string().optional(),
		author: z.object({
			name: z.string().optional(),
			picture: z.string().optional(),
		}).optional(),
	}),
});

export const collections = { blog, design };
