import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE_DESCRIPTION, AUTHOR_NAME, AUTHOR_EMAIL, AUTHOR_URL } from '../../consts';

const posts: CollectionEntry<"design">[] = (await getCollection("design")).sort(
	(a: CollectionEntry<"design">, b: CollectionEntry<"design">) =>
		b.data.publishedAt?.valueOf() - a.data.publishedAt?.valueOf(),
);

export async function GET() {
	const feed = `<feed xmlns="http://www.w3.org/2005/Atom">
		<id>${AUTHOR_URL}/</id>
		<title>${AUTHOR_NAME}</title>
		<updated>${new Date().toISOString()}</updated>
		<author>
			<name>${AUTHOR_NAME}</name>
			<email>${AUTHOR_EMAIL}</email>
			<uri>${AUTHOR_URL}/</uri>
		</author>
		<link rel="alternate" href="${AUTHOR_URL}/"/>
		<link rel="self" href="${AUTHOR_URL}/design/rss.xml"/>
		<subtitle>${SITE_DESCRIPTION}</subtitle>
		<icon>${AUTHOR_URL}/favicon.ico</icon>
		<rights>${AUTHOR_NAME}</rights>
		<category term="Design"/>
		<category term="Technology"/>
		<contributor>
			<name>${AUTHOR_NAME}</name>
			<email>${AUTHOR_EMAIL}</email>
			<uri>${AUTHOR_URL}/</uri>
		</contributor>
		${posts.map((entry) => `
			<entry>
				<title type="html"><![CDATA[ ${entry.data.title || "Empty Title"} ]]></title>
				<id>${AUTHOR_URL}/design/${entry.id}</id>
				<link href="${AUTHOR_URL}/design/${entry.id}"/>
				<updated>${new Date(entry.data.publishedAt).toISOString()}</updated>
				<author>
					<name>${AUTHOR_NAME}</name>
					<email>${AUTHOR_EMAIL}</email>
					<uri>${AUTHOR_URL}/</uri>
				</author>
			</entry>`
	).join('')}
	</feed>`;

	return new Response(feed, {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}