import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/'
      }
    ],
    sitemap: `https://praveenjuge.com/sitemap.xml`,
    host: 'https://praveenjuge.com'
  };
}
