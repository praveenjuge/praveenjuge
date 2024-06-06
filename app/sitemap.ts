import { MetadataRoute } from 'next';
import { getDocumentSlugs } from 'outstatic/server';

export const dynamic = 'force-static';

const domain = 'https://praveenjuge.com';

export type sitemap = {
  url: string;
  lastModified: Date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Blog List
  const blogList = [] as sitemap[];
  getDocumentSlugs('blog').forEach((slug) => {
    blogList.push({
      url: `${domain}/blog/${slug}`,
      lastModified: new Date()
    });
  });

  // Design List
  const designList = [] as sitemap[];
  getDocumentSlugs('design').forEach((slug) => {
    designList.push({
      url: `${domain}/design/${slug}`,
      lastModified: new Date()
    });
  });

  return [
    {
      url: domain,
      lastModified: new Date()
    },
    {
      url: `${domain}/blog`,
      lastModified: new Date()
    },
    {
      url: `${domain}/design`,
      lastModified: new Date()
    },
    ...blogList,
    ...designList
  ];
}
