import type { Metadata } from 'next';
import Link from 'next/link';
import { load } from 'outstatic/server';

export const metadata: Metadata = {
  title: 'Blog | Praveen Juge'
};

export default async function Page() {
  const allBlogs = await (await load())
    .find({ collection: 'blog' }, ['title', 'slug'])
    .sort({ publishedAt: -1 })
    .toArray();

  return (
    <section className="mx-auto flex max-w-2xl flex-col space-y-4 p-4 font-medium">
      <h2 className="font-bold">
        Blog <span> — </span>
        <Link href="/blog/rss.xml" className="underline" prefetch={false}>
          RSS Feed
        </Link>
      </h2>

      {allBlogs.map((item, id) => (
        <Link
          key={id}
          href={`/blog/${item.slug}`}
          className="text-red-900 hover:text-black"
        >
          {item.title}
        </Link>
      ))}
    </section>
  );
}
