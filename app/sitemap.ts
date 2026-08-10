import type { MetadataRoute } from 'next';
import {
  getPublishedCaseStudies,
  getPublishedContent,
  getPublishedProjects,
} from '@/core/content/read';
import { resolveSiteUrl } from '@/core/content/metadata';

/**
 * A sitemap needs absolute URLs, so it can only be generated once the site
 * knows its own address. Until a domain is set in Settings this returns
 * nothing, which is correct — a sitemap full of localhost URLs is worse than
 * no sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getPublishedContent();
  const siteUrl = resolveSiteUrl(content);
  if (!siteUrl) return [];

  const lastModified = content.lastPublishedAt ? new Date(content.lastPublishedAt) : new Date();

  const staticRoutes = ['', '/work', '/case-studies', '/about', '/contact'].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    priority: path === '' ? 1 : 0.7,
  }));

  const [projects, caseStudies] = await Promise.all([
    getPublishedProjects(),
    getPublishedCaseStudies(),
  ]);

  return [
    ...staticRoutes,
    ...projects.map((p) => ({ url: `${siteUrl}/work/${p.slug}`, lastModified, priority: 0.8 })),
    ...caseStudies.map((c) => ({
      url: `${siteUrl}/case-studies/${c.slug}`,
      lastModified,
      priority: 0.8,
    })),
  ];
}
