import type { MetadataRoute } from 'next';
import { getPublishedContent } from '@/core/content/read';
import { resolveSiteUrl } from '@/core/content/metadata';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getPublishedContent();
  const siteUrl = resolveSiteUrl(content);

  // The `robots` field is free text in the admin; honour an explicit noindex
  // rather than quietly publishing a site somebody marked as private.
  const disallowAll = /noindex/i.test(content.seo.robots || '');

  return {
    rules: disallowAll
      ? { userAgent: '*', disallow: '/' }
      : { userAgent: '*', allow: '/', disallow: ['/admin', '/admin/'] },
    sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined,
  };
}
