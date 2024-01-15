import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { load } from 'outstatic/server';

export const metadata: Metadata = {
  title: 'Designs | Praveen Juge'
};

export default async function Page() {
  const allDesigns = await (await load())
    .find({ collection: 'design' }, ['coverImage'])
    .sort({ publishedAt: -1 })
    .toArray();

  return (
    <section className="mx-auto max-w-7xl p-4">
      <h2 className="my-6 text-2xl font-extrabold tracking-tight md:text-3xl">
        Designs
      </h2>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {allDesigns.map((item, id) => (
          <Link
            key={id}
            target="_blank"
            className="block"
            href={item.coverImage ?? ''}
          >
            <Image
              width={700}
              height={800}
              priority={id === 0}
              loading={id > 10 ? 'lazy' : 'eager'}
              alt={item.coverImage ?? ''}
              src={item.coverImage ?? ''}
              className="h-full w-full rounded bg-slate-200 bg-cover bg-center ring-1 ring-slate-100"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
