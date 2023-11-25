import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found (404) | Praveen Juge'
};

export default function NotFound() {
  return (
    <div className="prose prose-slate max-w-none py-40">
      <h1 itemProp="headline" className="mb-0 tracking-tight">
        Page not found (404)
      </h1>

      {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
      <p className="lead">
        The page that you are looking for is not available. If you think this is
        a mistake, please contact me at{' '}
        <a
          href="https://twitter.com/praveenjuge"
          target="_blank"
          rel="noopener"
        >
          Twitter
        </a>
        .
      </p>
    </div>
  );
}
