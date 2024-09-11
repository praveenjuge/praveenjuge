import Link from "next/link";
import { load } from "outstatic/server";

export const metadata = {
	title: "Blog | Praveen Juge",
};

const allBlogs = await (await load())
	.find({ collection: "blog" }, ["title", "slug"])
	.sort({ publishedAt: -1 })
	.toArray();

export default function Page() {
	return (
		<section className="mx-auto flex max-w-xl flex-col gap-4 p-4 font-medium">
			<h2 className="font-bold">
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
