import type { MetadataRoute } from "next";
import { getDocumentSlugs } from "outstatic/server";

export const dynamic = "force-static";

const domain = "https://praveenjuge.com";

export type sitemap = {
	url: string;
	lastModified: Date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Blog List
	const blogList = [] as sitemap[];
	const blogSlugs = getDocumentSlugs("blog");
	for (const slug of blogSlugs) {
		blogList.push({
			url: `${domain}/blog/${slug}`,
			lastModified: new Date(),
		});
	}

	// Design List
	const designList = [] as sitemap[];
	const designSlugs = getDocumentSlugs("design");
	for (const slug of designSlugs) {
		designList.push({
			url: `${domain}/design/${slug}`,
			lastModified: new Date(),
		});
	}

	return [
		{
			url: domain,
			lastModified: new Date(),
		},
		{
			url: `${domain}/blog`,
			lastModified: new Date(),
		},
		{
			url: `${domain}/design`,
			lastModified: new Date(),
		},
		...blogList,
		...designList,
	];
}
