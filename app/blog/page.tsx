import type { Metadata } from "next";
import Link from "next/link";
import { load } from "outstatic/server";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
	title: "Blog | Praveen Juge",
};

const allBlogs = await (await load())
	.find({ collection: "blog" }, ["title", "slug"])
	.sort({ publishedAt: -1 })
	.toArray();

export default function Page() {
	return (
		<section className="mx-auto flex max-w-xl flex-col gap-4 p-4 font-medium text-red-900">
			<h2 className="font-bold text-gray-800">
				Blog <span> — </span>
				<Link href="/blog/rss.xml" className="underline" prefetch={false}>
					RSS Feed
				</Link>
			</h2>

			{allBlogs.map((item) => (
				<Link key={item.slug} href={`/blog/${item.slug}`}>
					{item.title}
				</Link>
			))}
		</section>
	);
}
