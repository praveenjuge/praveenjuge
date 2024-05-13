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
    <article className="mx-auto flex max-w-xl flex-col space-y-6 p-4">
      <Link
        href="/design"
        className="font-medium text-red-900 hover:text-black"
      >
        ← All Designs
      </Link>
      <Link target="_blank" href={design.coverImage ?? ''}>
        <Image
          priority
          width={700}
          height={1000}
          alt={design.coverImage ?? ''}
          src={design.coverImage ?? ''}
        />
      </Link>
    </article>
  );
}

export async function generateStaticParams() {
  return getDocumentSlugs('design').map((slug) => ({ slug }));
}
