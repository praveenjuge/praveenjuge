import type { Metadata } from 'next';
import Link from 'next/link';
import { load } from 'outstatic/server';

export const metadata: Metadata = {
  title: 'Blog Posts | Praveen Juge'
};

export default async function Page() {
  const allBlogs = await (await load())
    .find({ collection: 'blog' }, ['title', 'slug'])
    .sort({ publishedAt: -1 })
    .toArray();

  return (
    <>
      <h2 className="my-6 text-2xl font-extrabold tracking-tight md:text-3xl">
        <span className="flex shrink-0 gap-2">
          Blog Posts
          <span> - </span>
          <Link href="/blog/rss.xml" className="underline">
            RSS Feed
          </Link>
        </span>
      </h2>

      {allBlogs.map((item, id) => (
        <Link
          key={id}
          href={`/blog/${item.slug}`}
          className="my-4 flex text-lg font-medium text-rose-900 hover:text-black"
        >
          {item.title}
        </Link>
      ))}
    </>
  );
}
