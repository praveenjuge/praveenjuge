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
    <article itemScope itemType="http://schema.org/BlogPosting">
      <Link href="/design" className="flex font-medium text-rose-900">
        ← All Designs
      </Link>
      <Link
        target="_blank"
        href={`${design.coverImage}`}
        className="my-10 block"
      >
        <Image
          alt={design.slug}
          src={design.coverImage ?? ''}
          priority
          width={700}
          height={1000}
          className="h-full w-full rounded bg-slate-200 bg-cover ring-1 ring-slate-100"
        />
      </Link>
    </article>
  );
}

export async function generateStaticParams() {
  return getDocumentSlugs('design').map((slug) => ({ slug }));
}
