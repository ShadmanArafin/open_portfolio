import type { MetadataRoute } from 'next';
import {
  getPublishedCaseStudies,
  getPublishedContent,
  getPublishedProjects,
} from '@/core/content/read';
import { resolveSiteUrl } from '@/core/content/metadata';
import { getIndexablePages } from '@/core/pages/read';
import { getPublicWriting, getWritingSettings } from '@/core/writing/read';

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

  const [projects, caseStudies, pages, writingSettings, writing] = await Promise.all([
    getPublishedProjects(),
    getPublishedCaseStudies(),
    // Published and not marked noindex. A page the owner deliberately kept out
    // of search results must not be advertised in the sitemap either.
    getIndexablePages(),
    getWritingSettings('published'),
    getPublicWriting('published'),
  ]);

  const writingRoutes = writingSettings.enabled
    ? [
        { url: `${siteUrl}/writing`, lastModified, priority: 0.7 },
        ...writing
          .filter((entry) => !entry.seo.noindex)
          .map((entry) => ({
            url: `${siteUrl}/writing/${entry.slug}`,
            lastModified: new Date(entry.publishedAt ?? entry.updatedAt),
            priority: 0.6,
          })),
      ]
    : [];

  return [
    ...staticRoutes,
    ...writingRoutes,
    ...pages.map((page) => ({
      url: `${siteUrl}/${page.slug}`,
      lastModified: page.updatedAt ? new Date(page.updatedAt) : lastModified,
      priority: 0.6,
    })),
    ...projects.map((p) => ({ url: `${siteUrl}/work/${p.slug}`, lastModified, priority: 0.8 })),
    ...caseStudies.map((c) => ({
      url: `${siteUrl}/case-studies/${c.slug}`,
      lastModified,
      priority: 0.8,
    })),
  ];
}
