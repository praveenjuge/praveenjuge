import { load } from 'outstatic/server';
import Rss from 'rss';

export const dynamic = 'force-static';
const SITE_URL = 'https://praveenjuge.com/';

export async function GET() {
  const db = await load();

  const allBlogs = await db
    .find({ collection: 'blog' }, [
      'title',
      'publishedAt',
      'description',
      'slug'
    ])
    .sort({ publishedAt: -1 })
    .toArray();

  const feed = new Rss({
    title: 'Blog Posts | Praveen Juge',
    description:
      'Praveen Juge is a designer and developer for everything on the web.',
    image_url: 'https://praveenjuge.com/favicon.ico',
    feed_url: 'https://praveenjuge.com/blog/index.xml',
    site_url: SITE_URL,
    language: 'en-us'
  });

  allBlogs.forEach((post) => {
    feed.item({
      title: post.title || '',
      description: post.description || '',
      url: `${SITE_URL}blog/${post.slug}`,
      guid: `${SITE_URL}blog/${post.slug}`,
      date: post.publishedAt || ''
    });
  });

  return new Response(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
