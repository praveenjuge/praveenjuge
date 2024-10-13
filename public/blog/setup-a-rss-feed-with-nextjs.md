---
author:
  name: 'Praveen Juge'
  picture: 'https://avatars.githubusercontent.com/u/13696888?v=4'
coverImage: ''
title: 'Setup a RSS Feed with NextJS'
status: 'published'
slug: 'setup-a-rss-feed-with-nextjs'
description: ''
publishedAt: '2024-10-13T19:34:36.321Z'
---

I recently moved my RSS feed from using a custom package to a custom route file. Here's a simple guide to help you set up your own RSS feed.

#### Step 1: Create a Route File

First, create a new file at `blog/rss.xml/route.js` and add the following code:

```js
import { load } from "outstatic/server";
import { NextResponse } from 'next/server';
import markdownToHtml from "../utils";

export const dynamic = "force-static";
const SITE_URL = 'https://praveenjuge.com';
const AUTHOR_NAME = 'Praveen Juge';
const AUTHOR_EMAIL = 'hi@praveenjuge.com';
const FEED_ICON = `${SITE_URL}/favicon.ico`;
const FEED_SELF_LINK = `${SITE_URL}/blog/rss.xml`;
const FEED_SUBTITLE = 'Praveen Juge is a designer and developer for everything on the web.';

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
		${allBlogs.map((entry) => `
			<entry>
				<title type="html">
					<![CDATA[ ${entry.title} ]]>
				</title>
				<id>${SITE_URL}/blog/${entry.slug}</id>
				<link href="${SITE_URL}/blog/${entry.slug}"/>
				<updated>${new Date(entry.publishedAt).toISOString()}</updated>
				<summary type="html">
					<![CDATA[ ${entry.description} ]]>
				</summary>
				<content type="html">
					<![CDATA[ ${entry.description + "<br />" + markdownToHtml(entry.content)} ]]>
				</content>
				<author>
					<name>${AUTHOR_NAME}</name>
					<email>${AUTHOR_EMAIL}</email>
					<uri>${SITE_URL}/</uri>
				</author>
			</entry>`
		).join('')}
	</feed>`;

	return new NextResponse(feed, {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
```

#### Step 2: Replace Variables

Make sure to replace the variables like `SITE_URL`, `AUTHOR_NAME`, and `AUTHOR_EMAIL` with your own information. Also, ensure the blog list is imported properly.

#### Step 3: You're Done!

Now, your RSS feed is set up and will be available at `/blog/rss.xml`.

---