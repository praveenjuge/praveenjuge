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

export function generateMetadata({params}) {
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
			className="
			p-4
			mx-auto
			max-w-xl
			leading-7
		text-gray-700
  		[&_p]:my-5


			[&_a]:underline
			[&_a]:font-semibold
		[&_a]:text-gray-900
			[&_strong>a]:font-bold


		[&_strong]:text-gray-900
			[&_strong]:font-semibold
			[&_a_strong]:text-inherit
			[&_blockquote_strong]:text-inherit
			[&_thead_th_strong]:text-inherit


		[&_code]:text-gray-900
			[&_code]:font-semibold
			[&_code]:text-sm
		[&_code]:bg-gray-50
			[&_code]:rounded-md
			[&_code]:py-0.5
			[&_code]:px-1
			[&_code]:border
		[&_code]:border-gray-300
			[&_a_code]:text-inherit
			[&_h1_code]:text-inherit
			[&_h2_code]:text-inherit
			[&_h2_code]:text-sm
			[&_h3_code]:text-inherit
			[&_h3_code]:text-[0.9em]
			[&_h4_code]:text-inherit
			[&_blockquote_code]:text-inherit
			[&_thead_th_code]:text-inherit


			[&_pre]:overflow-x-auto
			[&_pre]:font-normal
			[&_pre]:text-sm
			[&_pre]:my-7
			[&_pre]:rounded-lg
			[&_pre]:p-4
			[&_pre_code]:bg-transparent
			[&_pre_code]:border-0
			[&_pre_code]:rounded-none
			[&_pre_code]:p-0
			[&_pre_code]:font-normal
			[&_pre_code]:text-inherit
			[&_pre_code]:leading-inherit
			[&_pre_code]:before:content-none
			[&_pre_code]:after:content-none


		[&_h2]:text-gray-900
			[&_h2]:font-bold
			[&_h2]:text-2xl
			[&_h2]:mt-12
			[&_h2]:mb-6
			[&_h2]:leading-[1.3333333]
			[&_h2_strong]:font-extrabold
			[&_h2_strong]:text-inherit


		[&_h3]:text-gray-900
			[&_h3]:font-semibold
			[&_h3]:text-xl
			[&_h3]:mt-8
			[&_h3]:mb-4
			[&_h3_strong]:font-bold
			[&_h3_strong]:text-inherit


		[&_h4]:text-gray-900
			[&_h4]:font-semibold
			[&_h4]:mt-6
			[&_h4]:mb-2
			[&_h4]:leading-6
			[&_h4_strong]:font-bold
			[&_h4_strong]:text-inherit


			[&_h2+*]:!mt-0
			[&_h3+*]:!mt-0
			[&_h4+*]:!mt-0


			[&_ol]:list-decimal
			[&_ul]:list-disc
			[&_ol]:my-5
			[&_ol]:pl-6
			[&_ul]:my-5
			[&_ul]:pl-6
			[&_dl]:my-5
			[&_dd]:mt-2
			[&_dd]:pl-6
			[&_dt]:mt-5
			[&_li]:my-2
			[&_ol>li]:marker:font-normal
		[&_ol>li]:marker:text-gray-500
		[&_ul>li]:marker:text-gray-300
		[&_dt]:text-gray-900
			[&_dt]:font-semibold
			[&_ol>li]:pl-[0.375em]
  		[&_ul>li]:pl-[0.375em]
			[&_ul>li>p]:my-3
			[&_ul>li>p:first-child]:my-5
			[&_ol>li>p:first-child]:my-5
			[&_ul_ul]:my-3
			[&_ul_ol]:my-3
			[&_ol_ul]:my-3
			[&_ol_ol]:my-3



			[&_hr]:border-t
		[&_hr]:border-gray-200
			[&_hr]:my-12
			[&_hr+*]:!mt-0


			[&_blockquote]:font-medium
			[&_blockquote]:italic
		[&_blockquote]:text-gray-900
			[&_blockquote]:border-l-4
		[&_blockquote]:border-gray-200
			[&_blockquote]:my-6
			[&_blockquote]:pl-4


			[&_img]:my-8
			[&_picture]:block
			[&_picture]:my-8
			[&_video]:my-8
			[&_figure_*]:my-0
			[&_figure]:my-8
		[&_figcaption]:text-gray-500
			[&_figcaption]:text-sm
			[&_figcaption]:leading-[1.4285714]
			[&_figcaption]:mt-[0.8571429em]
			[&_picture>img]:my-0


			[&_kbd]:font-medium
			[&_kbd]:font-inherit
		[&_kbd]:text-gray-900
			[&_kbd]:shadow-[0_0_0_1px_rgba(17,24,39,0.1),0_3px_0_rgba(17,24,39,0.1)]
			[&_kbd]:text-sm
			[&_kbd]:rounded-md
			[&_kbd]:py-[0.1875em]
			[&_kbd]:px-1.5

			
			[&_table]:w-full
			[&_table]:table-auto
			[&_table]:my-8
			[&_table]:text-sm
			[&_table]:leading-[1.7142857]
			[&_thead]:border-b
		[&_thead]:border-gray-300
		[&_thead_th]:text-gray-900
			[&_thead_th]:font-semibold
			[&_thead_th]:align-bottom
			[&_thead_th]:px-[0.5714286em]
			[&_tbody_tr]:border-b
		[&_tbody_tr]:border-gray-200
			[&_tbody_tr:last-child]:border-b-0
			[&_tbody_td]:align-baseline
			[&_tfoot]:border-t
		[&_tfoot]:border-gray-300
			[&_tfoot_td]:align-top
			[&_th]:text-left
			[&_td]:text-left
			[&_thead_th:first-child]:pl-0
			[&_thead_th:last-child]:pr-0
			[&_tbody_td]:py-[0.5714286em]
			[&_tfoot_td]:py-[0.5714286em]
			[&_tbody_td]:px-[0.5714286em]
			[&_tfoot_td]:py-[0.5714286em]
			[&_tbody_td:first-child]:pl-0
			[&_tfoot_td:first-child]:pl-0
			[&_tbody_td:last-child]:pr-0
			[&_tfoot_td:last-child]:pr-0
			"
		>
			<p className="!mt-0">
				Written on{" "}
				<time itemProp="datePublished" dateTime={blog.publishedAt}>
					{formattedDate}
				</time>
			</p>
			<h1 className="text-balance tracking-tighter text-gray-900 font-extrabold text-4xl mt-0 mb-[0.8888889em]" itemProp="headline">
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
			<section dangerouslySetInnerHTML={{ __html: blog.content }} />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadJsonLd) }}
			/>
		</article>
	);
}

export function generateStaticParams() {
	return getDocumentSlugs("blog").map((slug) => ({ slug }));
}
