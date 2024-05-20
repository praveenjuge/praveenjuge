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
    <section className="mx-auto max-w-xl p-4">
      <h2 className="font-bold">Designs</h2>

      <div className="my-6 grid gap-6">
        {allDesigns.map((item, id) => (
          <Link
            key={id}
            target="_blank"
            className="block"
            href={item.coverImage ?? ''}
          >
            <Image
              width={612}
              height={459}
              priority={id === 0}
              loading={id > 10 ? 'lazy' : 'eager'}
              alt={item.coverImage ?? ''}
              src={item.coverImage ?? ''}
              className="size-full rounded bg-gray-200 bg-cover bg-center"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
