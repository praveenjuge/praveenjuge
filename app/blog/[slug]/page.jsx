import { notFound } from "next/navigation";
import { getDocumentBySlug, getDocumentSlugs } from "outstatic/server";
import markdownToHtml from "../utils";

function getData(slug) {
	const blog = getDocumentBySlug("blog", slug, [
		"title",
		"publishedAt",
		"description",
		"slug",
		"content",
	]);

	if (!blog) notFound();

	return { ...blog, content: markdownToHtml(blog.content) };
}

export async function generateMetadata({params}) {
	const blog = getData(params.slug);

	return {
		title: blog.title,
		description: blog.description,
		openGraph: {
			type: "article",
			siteName: "Praveen Juge",
			url: "./",
			locale: "en_US",
			images: {
				url: `https://mosaicimg.com/use?url=https://praveenjuge.com/blog/${blog.slug}`,
				alt: blog.title,
			},
		},
	};
}

export default function Blog({ params }) {
	const blog = getData(params.slug);
	const formattedDate = new Date(blog.publishedAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: blog.title,
		datePublished: blog.publishedAt,
		dateModified: blog.publishedAt,
		image: `https://mosaicimg.com/use?url=https://praveenjuge.com/blog/${blog.slug}`,
		author: {
			"@type": "Person",
			name: "Praveen Juge",
			url: "https://praveenjuge.com",
		},
		publisher: {
			"@type": "Organization",
			name: "Praveen Juge",
			url: "https://praveenjuge.com",
			logo: "https://praveenjuge.com/images/praveen-juge-photo.jpg",
		},
	};

	const breadJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		name: blog.title,
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://praveenjuge.com",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Blog",
				item: "https://praveenjuge.com/blog",
			},
			{
				"@type": "ListItem",
				position: 3,
				name: blog.title,
				item: `https://praveenjuge.com/blog/${blog.slug}`,
			},
		],
	};

	return (
		<article
			itemScope={true}
			itemType="http://schema.org/BlogPosting"
			className="prose mx-auto max-w-xl p-4"
		>
			<p>
				Written on{" "}
				<time itemProp="datePublished" dateTime={blog.publishedAt}>
					{formattedDate}
				</time>
			</p>
			<h1 className="text-balance tracking-tighter" itemProp="headline">
				{blog.title}
			</h1>
			<meta
				itemProp="image"
				content={`https://mosaicimg.com/use?url=https://praveenjuge.com/blog/${blog.slug}`}
			/>
			<span
				itemScope={true}
				itemProp="author"
				className="sr-only"
				itemType="https://schema.org/Person"
			>
				<a itemProp="url" href="https://praveenjuge.com">
					<span itemProp="name">Praveen Juge</span>
				</a>
			</span>
			<p itemProp="description">{blog.description}</p>
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
			<section dangerouslySetInnerHTML={{ __html: blog.content }} />
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadJsonLd) }}
			/>
		</article>
	);
}

export function generateStaticParams() {
	return getDocumentSlugs("blog").map((slug) => ({ slug }));
}
