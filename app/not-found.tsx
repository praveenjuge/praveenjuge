import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found (404) | Praveen Juge'
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-2 px-4 py-48 text-center">
      <h1 className="font-bold tracking-tight">Page not found (404)</h1>

      <p className="text-gray-600">
        If you think this is a mistake, please let me know at{' '}
        <a
          rel="noopener"
          target="_blank"
          className="underline"
          href="https://twitter.com/praveenjuge"
        >
          Twitter
        </a>
        .
      </p>
    </div>
  );
}
