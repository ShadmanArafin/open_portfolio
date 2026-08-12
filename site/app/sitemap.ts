import type { MetadataRoute } from 'next';
import { ALTERNATIVES } from '@/lib/alternatives';
import { getDocs } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

// `output: 'export'` writes these as files at build time; without this Next
// treats them as request-time routes and refuses to export.
export const dynamic = 'force-static';

/**
 * Generated from the routes that exist, not from a list somebody maintains.
 *
 * A hand-written sitemap is a file that silently falls out of step with the
 * directory it describes, and the symptom is a page nobody can find.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = [
    '',
    '/demo',
    '/deploy',
    '/compare',
    '/what-it-costs',
    '/is-this-right-for-you',
    '/help',
    '/docs',
  ];

  return [
    ...fixed.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: 'monthly' as const })),
    ...ALTERNATIVES.map((entry) => ({ url: `${SITE_URL}/alternatives/${entry.slug}` })),
    ...getDocs('help').map((doc) => ({ url: `${SITE_URL}/help/${doc.slug}` })),
    ...getDocs('docs').map((doc) => ({ url: `${SITE_URL}/docs/${doc.slug}` })),
  ];
}
