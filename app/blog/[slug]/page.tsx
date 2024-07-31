import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDocumentBySlug, getDocumentSlugs } from "outstatic/server";
import type { BlogPosting, BreadcrumbList, WithContext } from "schema-dts";
import markdownToHtml from "../utils";

export const dynamic = "force-static";
export const revalidate = false;

function getData(slug: string) {
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

export async function generateMetadata({
	params,
}: { params: { slug: string } }): Promise<Metadata> {
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

export default function Blog({ params }: { params: { slug: string } }) {
	const blog = getData(params.slug);
	const formattedDate = new Date(blog.publishedAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const jsonLd: WithContext<BlogPosting> = {
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

	const breadJsonLd: WithContext<BreadcrumbList> = {
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
			className="prose mx-auto max-w-xl p-4 [&_code.hljs]:block [&_code.hljs]:overflow-x-auto [&_.hljs-addition]:bg-green-950 [&_.hljs-deletion]:bg-red-950 [&_.hljs]:bg-gray-950 prose-pre:bg-gray-950 [&_.hljs-section]:font-bold [&_.hljs-strong]:font-bold [&_.hljs-addition]:text-emerald-200 [&_.hljs-attr]:text-sky-300 [&_.hljs-attribute]:text-sky-300 [&_.hljs-built_in]:text-orange-400 [&_.hljs-bullet]:text-amber-300 [&_.hljs-code]:text-gray-400 [&_.hljs-comment]:text-gray-400 [&_.hljs-deletion]:text-red-100 [&_.hljs-doctag]:text-red-400 [&_.hljs-emphasis]:text-gray-300 [&_.hljs-formula]:text-gray-400 [&_.hljs-keyword]:text-red-400 [&_.hljs-literal]:text-sky-300 [&_.hljs-meta]:text-sky-300 [&_.hljs-meta_.hljs-keyword]:text-red-400 [&_.hljs-meta_.hljs-string]:text-blue-300 [&_.hljs-name]:text-green-300 [&_.hljs-number]:text-sky-300 [&_.hljs-operator]:text-sky-300 [&_.hljs-quote]:text-green-300 [&_.hljs-regexp]:text-blue-300 [&_.hljs-section]:text-blue-600 [&_.hljs-selector-attr]:text-sky-300 [&_.hljs-selector-class]:text-sky-300 [&_.hljs-selector-id]:text-sky-300 [&_.hljs-selector-pseudo]:text-green-300 [&_.hljs-selector-tag]:text-green-300 [&_.hljs-string]:text-blue-300 [&_.hljs-strong]:text-gray-300 [&_.hljs-subst]:text-gray-300 [&_.hljs-symbol]:text-orange-400 [&_.hljs-template-tag]:text-red-400 [&_.hljs-template-variable]:text-red-400 [&_.hljs-title.class_.inherited__]:text-purple-300 [&_.hljs-title.class_]:text-purple-300 [&_.hljs-title.function_]:text-purple-300 [&_.hljs-title]:text-purple-300 [&_.hljs-type]:text-red-400 [&_.hljs-variable.language_]:text-red-400 [&_.hljs-variable]:text-sky-300 [&_.hljs]:text-gray-200 [&_.hljs-emphasis]:italic"
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
			<div dangerouslySetInnerHTML={{ __html: blog.content }} />
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
