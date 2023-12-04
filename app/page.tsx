import profilePic from '@/public/images/praveen-juge-photo.jpg';
import { ArrowUpRight } from '@mynaui/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { load } from 'outstatic/server';

const headingClass =
  'font-extrabold tracking-tight text-2xl md:text-3xl mt-20 mb-6';

export default async function Page() {
  const db = await load();

  const allDesigns = await db
    .find({ collection: 'design' }, ['coverImage', 'slug'])
    .sort({ publishedAt: -1 })
    .limit(11)
    .toArray();

  const allBlogs = await db
    .find({ collection: 'blog' }, ['title', 'slug'])
    .sort({ publishedAt: -1 })
    .toArray();

  return (
    <>
      <h1 className={headingClass + ' ' + '!mt-8'}>What&rsquo;s up nerds?</h1>

      <p className="text-lg">
        <b className="font-semibold">
          I&rsquo;m Praveen Juge, a designer and developer based in Chennai.
        </b>{' '}
        I create beautiful and accessible experiences on the web. I enjoy
        reading my Kindle, listening to Taylor Swift, and my recent obsession,
        playing Assassin&rsquo;s Creed Mirage.
      </p>

      <div className="my-6 grid gap-10 text-lg sm:grid-cols-3">
        <div className="col-span-2">
          <p>
            I specialize in UI design, accessibility, design systems, CSS, and
            have an eye for getting pixel-perfect results. I also work on
            open-source UI projects to help the design community.
          </p>
          <br />

          <p>
            I would love to work with you on anything interesting. Feel free to
            say hello to me at{' '}
            <a
              href="mailto:hello@praveenjuge.com"
              className="underline decoration-2 underline-offset-1"
            >
              hello@praveenjuge.com
            </a>
          </p>
        </div>
        <div className="space-y-2 text-xs font-medium text-slate-800">
          <Image
            src={profilePic}
            className="rounded bg-slate-100"
            alt="Praveen Juge trying his best to look cool."
            priority={true}
          />
          <p>Trying my best to look cool.</p>
        </div>
      </div>

      <h2 className={headingClass}>Projects</h2>

      <a
        href="https://icons.mynaui.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="relative my-4 grid grid-cols-1 gap-4 overflow-hidden rounded border border-slate-200 p-6 transition hover:border-slate-300 md:grid-cols-2"
      >
        <div className="flex flex-col items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              MynaUI Icons
            </h3>
            <p className="mb-6 mt-1 text-slate-600">
              Beautifully crafted open-source icons for your next project.
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded bg-slate-200 px-3.5 py-2.5 text-sm font-medium">
            <span>MynaUI Icons</span>
            <ArrowUpRight className="inline-block h-4 w-4" stroke={2} />
          </span>
        </div>
        <div className="relative h-44">
          <Image
            src="/images/myna-icons-12.png"
            className="relative rounded bg-slate-100 md:absolute md:-right-8"
            alt="MynaUI Icons"
            width={800}
            height={500}
            priority={true}
          />
        </div>
      </a>
      <a
        href="https://mynaui.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="relative my-4 grid grid-cols-1 gap-4 overflow-hidden rounded border border-slate-200 p-6 transition hover:border-slate-300 md:grid-cols-2"
      >
        <div className="flex flex-col items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">MynaUI</h3>
            <p className="mb-6 mt-1 text-slate-600">
              Figma File and HTML Code with Tailwind CSS Design System.
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded bg-slate-200 px-3.5 py-2.5 text-sm font-medium">
            <span>MynaUI</span>
            <ArrowUpRight className="inline-block h-4 w-4" stroke={2} />
          </span>
        </div>
        <div className="relative h-44">
          <Image
            src="/images/4-11-2023.png"
            className="relative rounded bg-slate-100 md:absolute md:-right-8"
            alt="MynaUI Icons"
            width={800}
            height={500}
          />
        </div>
      </a>
      <a
        href="https://copybook.me/"
        target="_blank"
        rel="noopener noreferrer"
        className="relative my-4 grid grid-cols-1 gap-4 overflow-hidden rounded border border-slate-200 p-6 transition hover:border-slate-300 md:grid-cols-2"
      >
        <div className="flex flex-col items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Copy Book</h3>
            <p className="mb-6 mt-1 text-slate-600">
              Copy book is a collection of commonly used texts.
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded bg-slate-200 px-3.5 py-2.5 text-sm font-medium">
            <span>Copy Book</span>
            <ArrowUpRight className="inline-block h-4 w-4" stroke={2} />
          </span>
        </div>
        <div className="relative h-44">
          <Image
            src="/images/2.jpg"
            className="relative rounded bg-slate-100 md:absolute md:-right-8"
            alt="MynaUI Icons"
            width={800}
            height={500}
          />
        </div>
      </a>

      <h2 className={headingClass}>
        <Link href="/design">Design</Link>
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {allDesigns.map((item, id) => (
          <Link key={id} href={`${item.coverImage}`} target="_blank">
            <Image
              alt={item.slug}
              src={item.coverImage ?? ''}
              width={500}
              height={500}
              className="h-full w-full rounded border-0 bg-slate-100 bg-cover object-cover ring-1 ring-slate-300/50 md:h-40 md:max-h-40"
            />
          </Link>
        ))}
        <Link
          href="/design"
          className="flex h-40 flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-slate-200 font-medium transition hover:border-slate-300"
        >
          <ArrowUpRight className="h-6 w-6 text-slate-400" />
          <span>View More</span>
        </Link>
      </div>

      <h2 className={headingClass}>
        <Link href="/blog">Blog</Link>
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
