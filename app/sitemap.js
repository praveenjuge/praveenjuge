import { getDocumentSlugs } from "outstatic/server";

const domain = "https://praveenjuge.com";

export default async function sitemap() {
	// Blog List
	const blogList = [];
	const blogSlugs = getDocumentSlugs("blog");
	for (const slug of blogSlugs) {
		blogList.push({
			url: `${domain}/blog/${slug}`,
			lastModified: new Date(),
		});
	}

	// Design List
	const designList = [];
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
