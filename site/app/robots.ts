import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// `output: 'export'` writes these as files at build time; without this Next
// treats them as request-time routes and refuses to export.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
