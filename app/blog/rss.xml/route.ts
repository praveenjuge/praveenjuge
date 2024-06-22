import { Feed } from "feed";
import { load } from "outstatic/server";
import markdownToHtml from "../utils";

export const dynamic = "force-static";

const SITE_URL = "https://praveenjuge.com/";
const SITE_AUTHOR_NAME = "Praveen Juge";
const SITE_AUTHOR_EMAIL = "hi@praveenjuge.com";
const allBlogs = await (await load())
	.find({ collection: "blog" }, [
		"title",
		"publishedAt",
		"description",
		"content",
		"slug",
	])
	.sort({ publishedAt: -1 })
	.toArray();

export function GET() {
	const feed = new Feed({
		title: SITE_AUTHOR_NAME,
		description:
			"Praveen Juge is a designer and developer for everything on the web.",
		id: SITE_URL,
		link: SITE_URL,
		language: "en",
		favicon: `${SITE_URL}favicon.ico`,
		copyright: SITE_AUTHOR_NAME,
		feedLinks: {
			atom: `${SITE_URL}blog/rss.xml`,
		},
		author: {
			name: SITE_AUTHOR_NAME,
			email: SITE_AUTHOR_EMAIL,
			link: SITE_URL,
		},
	});

	for (const post of allBlogs) {
		const url = `${SITE_URL}blog/${post.slug}`;
		const content = markdownToHtml(post.content) as string;
		feed.addItem({
			title: post.title || "",
			id: url,
			link: url,
			content: `${post.description}<br />${content}`,
			description: post.description || "",
			date: new Date(post.publishedAt || ""),
			image: `https://praveenjuge.com/og/blog/${post.slug}.jpg`,
			author: [
				{
					name: SITE_AUTHOR_NAME,
					email: SITE_AUTHOR_EMAIL,
					link: SITE_URL,
				},
			],
		});
	}

	feed.addCategory("Design");
	feed.addCategory("Technology");

	feed.addContributor({
		name: SITE_AUTHOR_NAME,
		email: SITE_AUTHOR_EMAIL,
		link: SITE_URL,
	});

	return new Response(feed.atom1(), {
		headers: {
			"Content-Type": "application/xml",
		},
	});
}
