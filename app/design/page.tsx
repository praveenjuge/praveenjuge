import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { load } from 'outstatic/server';

export const metadata: Metadata = {
  title: 'Designs | Praveen Juge'
};

export default async function Page() {
  const allDesigns = await (await load())
    .find({ collection: 'design' }, ['coverImage', 'slug'])
    .sort({ publishedAt: -1 })
    .toArray();

  return (
    <>
      <h2 className="my-6 text-2xl font-extrabold tracking-tight md:text-3xl">
        Design
      </h2>

      {allDesigns.map((item, id) => (
        <Link
          key={id}
          target="_blank"
          className="my-10 block"
          href={`${item.coverImage}`}
        >
          <Image
            width={700}
            height={1000}
            alt={item.slug}
            src={item.coverImage ?? ''}
            className="h-full w-full rounded bg-slate-200 bg-cover ring-1 ring-slate-100"
          />
        </Link>
      ))}
    </>
  );
}
