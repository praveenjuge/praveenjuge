import { Feed } from 'feed';
import { load } from 'outstatic/server';

export const dynamic = 'force-static';
const SITE_URL = 'https://praveenjuge.com/';
const SITE_AUTHOR_NAME = 'Praveen Juge';
const SITE_AUTHOR_EMAIL = 'hi@praveenjuge.com';

export async function GET() {
  const db = await load();

  const allDesigns = await db
    .find({ collection: 'design' }, ['title', 'publishedAt', 'slug'])
    .sort({ publishedAt: -1 })
    .toArray();

  const feed = new Feed({
    title: SITE_AUTHOR_NAME,
    description:
      'Praveen Juge is a designer and developer for everything on the web.',
    id: SITE_URL,
    link: SITE_URL,
    language: 'en',
    favicon: `${SITE_URL}favicon.ico`,
    copyright: SITE_AUTHOR_NAME,
    feedLinks: {
      atom: `${SITE_URL}design/rss.xml`
    },
    author: {
      name: SITE_AUTHOR_NAME,
      email: SITE_AUTHOR_EMAIL,
      link: SITE_URL
    }
  });

  allDesigns.forEach((post) => {
    const url = `${SITE_URL}design/${post.slug}`;
    feed.addItem({
      title: post.title || '',
      id: url,
      link: url,
      date: new Date(post.publishedAt || ''),
      author: [
        {
          name: SITE_AUTHOR_NAME,
          email: SITE_AUTHOR_EMAIL,
          link: SITE_URL
        }
      ]
    });
  });

  feed.addCategory('Design');
  feed.addCategory('Technology');

  feed.addContributor({
    name: SITE_AUTHOR_NAME,
    email: SITE_AUTHOR_EMAIL,
    link: SITE_URL
  });

  return new Response(feed.atom1(), {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
