import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDocumentSlugs, load } from 'outstatic/server';

export default async function Design({ params }: { params: { slug: string } }) {
  const design = await (await load())
    .find({ collection: 'design', slug: params.slug }, ['slug', 'coverImage'])
    .first();

  if (!design) notFound();

  return (
    <article
      itemScope
      itemType="http://schema.org/BlogPosting"
      className="mx-auto max-w-3xl p-4"
    >
      <Link href="/design" className="flex font-medium text-rose-900">
        ← All Designs
      </Link>
      <Link
        target="_blank"
        className="my-10 block"
        href={design.coverImage ?? ''}
      >
        <Image
          priority
          width={700}
          height={1000}
          alt={design.coverImage ?? ''}
          src={design.coverImage ?? ''}
          className="size-full rounded bg-slate-200"
        />
      </Link>
    </article>
  );
}

export async function generateStaticParams() {
  return getDocumentSlugs('design').map((slug) => ({ slug }));
}
