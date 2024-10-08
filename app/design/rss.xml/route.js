import { load } from "outstatic/server";
import { NextResponse } from 'next/server';

export const dynamic = "force-static";
const SITE_URL = 'https://praveenjuge.com';
const AUTHOR_NAME = 'Praveen Juge';
const AUTHOR_EMAIL = 'hi@praveenjuge.com';
const FEED_ICON = `${SITE_URL}/favicon.ico`;
const FEED_SELF_LINK = `${SITE_URL}/design/rss.xml`;
const FEED_SUBTITLE = 'Praveen Juge is a designer and developer for everything on the web.';

const allDesigns = await (await load())
	.find({ collection: "design" }, ["title", "publishedAt", "slug"])
	.sort({ publishedAt: -1 })
	.toArray();
	
export async function GET() {
	const feed = `<feed xmlns="http://www.w3.org/2005/Atom">
			<id>${SITE_URL}/</id>
			<title>${AUTHOR_NAME}</title>
			<updated>${new Date().toISOString()}</updated>
			<author>
				<name>${AUTHOR_NAME}</name>
				<email>${AUTHOR_EMAIL}</email>
				<uri>${SITE_URL}/</uri>
			</author>
			<link rel="alternate" href="${SITE_URL}/"/>
			<link rel="self" href="${FEED_SELF_LINK}"/>
			<subtitle>${FEED_SUBTITLE}</subtitle>
			<icon>${FEED_ICON}</icon>
			<rights>${AUTHOR_NAME}</rights>
			<category term="Design"/>
			<category term="Technology"/>
			<contributor>
				<name>${AUTHOR_NAME}</name>
				<email>${AUTHOR_EMAIL}</email>
				<uri>${SITE_URL}/</uri>
			</contributor>
			${allDesigns
				.map(
					(entry) => `
					<entry>
						<title type="html"><![CDATA[ ${entry.title} ]]></title>
						<id>${SITE_URL}/design/${entry.slug}</id>
						<link href="${SITE_URL}/design/${entry.slug}"/>
						<updated>${new Date(entry.publishedAt).toISOString()}</updated>
						<author>
							<name>${AUTHOR_NAME}</name>
							<email>${AUTHOR_EMAIL}</email>
							<uri>${SITE_URL}/</uri>
						</author>
					</entry>`
				)
				.join('')}
		</feed>`;

	return new NextResponse(feed, {
		headers: {
			'Content-Type': 'application/atom+xml',
		},
	});
}