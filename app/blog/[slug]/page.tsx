import hljs from 'highlight.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDocumentSlugs, load } from 'outstatic/server';
import { BlogPosting, BreadcrumbList, WithContext } from 'schema-dts';

interface Params {
  params: {
    slug: string;
  };
}

export async function generateMetadata(params: Params): Promise<Metadata> {
  const blog = await getData(params);
  if (!blog) return {};

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      type: 'article'
    }
  };
}

export default async function Blog(params: Params) {
  const blog = await getData(params);
  const formattedDate = new Date(blog.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const jsonLd: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    datePublished: blog.publishedAt,
    dateModified: blog.publishedAt,
    image: `https://praveenjuge.com/blog/${blog.slug}/opengraph-image`,
    author: {
      '@type': 'Person',
      name: 'Praveen Juge',
      url: 'https://praveenjuge.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Praveen Juge',
      url: 'https://praveenjuge.com',
      logo: 'https://praveenjuge.com/images/praveen-juge-photo.jpg'
    }
  };

  const breadJsonLd: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    name: blog.title,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://praveenjuge.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://praveenjuge.com/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blog.title,
        item: `https://praveenjuge.com/blog/${blog.slug}`
      }
    ]
  };

  if (!blog) notFound();

  return (
    <>
      <article
        itemScope
        itemType="http://schema.org/BlogPosting"
        className="prose prose-slate mx-auto max-w-3xl p-4 md:prose-lg prose-h2:tracking-tight prose-h3:tracking-tight prose-pre:bg-slate-950 [&_.hljs-addition]:bg-green-950 
      [&_.hljs-addition]:text-emerald-200 
      [&_.hljs-attr]:text-sky-300 
      [&_.hljs-attribute]:text-sky-300 
      [&_.hljs-built_in]:text-orange-400 
      [&_.hljs-bullet]:text-amber-300
      [&_.hljs-code]:text-slate-400
      [&_.hljs-comment]:text-slate-400
      [&_.hljs-deletion]:bg-rose-950
      [&_.hljs-deletion]:text-red-100
      [&_.hljs-doctag]:text-red-400
      [&_.hljs-emphasis]:italic
      [&_.hljs-emphasis]:text-slate-300
      [&_.hljs-formula]:text-slate-400
      [&_.hljs-keyword]:text-red-400
      [&_.hljs-literal]:text-sky-300
      [&_.hljs-meta]:text-sky-300
      [&_.hljs-meta_.hljs-keyword]:text-red-400
      [&_.hljs-meta_.hljs-string]:text-blue-300
      [&_.hljs-name]:text-green-300
      [&_.hljs-number]:text-sky-300
      [&_.hljs-operator]:text-sky-300
      [&_.hljs-quote]:text-green-300
      [&_.hljs-regexp]:text-blue-300
      [&_.hljs-section]:font-bold
      [&_.hljs-section]:text-blue-600
      [&_.hljs-selector-attr]:text-sky-300
      [&_.hljs-selector-class]:text-sky-300
      [&_.hljs-selector-id]:text-sky-300
      [&_.hljs-selector-pseudo]:text-green-300
      [&_.hljs-selector-tag]:text-green-300
      [&_.hljs-string]:text-blue-300
      [&_.hljs-strong]:font-bold
      [&_.hljs-strong]:text-slate-300
      [&_.hljs-subst]:text-slate-300
      [&_.hljs-symbol]:text-orange-400
      [&_.hljs-template-tag]:text-red-400
      [&_.hljs-template-variable]:text-red-400
      [&_.hljs-title.class_.inherited__]:text-purple-300
      [&_.hljs-title.class_]:text-purple-300
      [&_.hljs-title.function_]:text-purple-300
      [&_.hljs-title]:text-purple-300
      [&_.hljs-type]:text-red-400
      [&_.hljs-variable.language_]:text-red-400
      [&_.hljs-variable]:text-sky-300
      [&_.hljs]:bg-slate-950
      [&_.hljs]:text-slate-200
      [&_code.hljs]:block
      [&_code.hljs]:overflow-x-auto"
      >
        {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
        <p className="lead">
          Written on{' '}
          <time itemProp="datePublished" dateTime={blog.publishedAt}>
            {formattedDate}
          </time>
        </p>
        <meta
          itemProp="image"
          content={`https://praveenjuge.com/blog/${blog.slug}/opengraph-image`}
        />
        <span
          className="sr-only"
          itemProp="author"
          itemScope
          itemType="https://schema.org/Person"
        >
          <a itemProp="url" href="https://praveenjuge.com">
            <span itemProp="name">Praveen Juge</span>
          </a>
        </span>
        <h1 className="tracking-tight" itemProp="headline">
          {blog.title}
        </h1>
        <hr />
        {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
        <p className="lead" itemProp="description">
          {blog.description}
        </p>
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadJsonLd) }}
      />
    </>
  );
}

async function getData({ params }: Params) {
  const db = await load();

  const blog = await db
    .find({ collection: 'blog', slug: params.slug }, [
      'title',
      'publishedAt',
      'description',
      'slug',
      'content',
      'coverImage'
    ])
    .first();

  if (!blog) notFound();

  const content = markdownToHtml(blog.content);

  return { ...blog, content };
}

export async function generateStaticParams() {
  return getDocumentSlugs('blog').map((slug) => ({ slug }));
}

export function markdownToHtml(markdown: string) {
  const marked = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  marked.use({
    renderer: {
      heading(text: string, level: number) {
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

        return `<a class="!no-underline hover:underline" href="#${escapedText}">
                  <h${level} id="${escapedText}">${text}</h${level}>
                </a>`;
      },
      image(href: string, title: string | null, text: string) {
        if (href === null) {
          return text;
        }
        const out =
          '<a target="_blank" rel="noreferrer noopener" href="' +
          href +
          '"><img src="https://praveenjuge.com' +
          href +
          '" alt="' +
          text +
          '" loading="lazy" /></a>';
        return out;
      },
      link(href: string, title: string | null | undefined, text: string) {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">
                ${text}
                </a>`;
      }
    }
  });

  return marked.parse(markdown);
}
