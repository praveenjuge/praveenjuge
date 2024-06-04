import type { Metadata } from 'next';
import Link from 'next/link';
import { load } from 'outstatic/server';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Blog | Praveen Juge'
};

export default async function Page() {
  const allBlogs = await (await load())
    .find({ collection: 'blog' }, ['title', 'slug'])
    .sort({ publishedAt: -1 })
    .toArray();

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-4 p-4">
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
          className="font-medium text-red-900"
        >
          {item.title}
        </Link>
      ))}
    </section>
  );
}
