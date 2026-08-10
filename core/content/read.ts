import 'server-only';
import { cache } from 'react';
import type { CMSState } from '@/cms/types/cms';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { getStorageAdapter } from '@/core/storage/registry';

/**
 * The single server-side read of published content.
 *
 * Every page goes through this one function rather than reaching for content
 * directly, so there is exactly one place to change as storage evolves. React's
 * `cache` deduplicates within a request, so a page rendering six sections still
 * performs one read.
 *
 * A backend that is unreachable falls back to the seed rather than throwing.
 * A portfolio that renders demo content is recoverable; a portfolio that
 * returns a 500 because a free-tier database is asleep is not.
 */
export const getPublishedContent = cache(async (): Promise<CMSState> => {
  try {
    const stored = await getStorageAdapter().readSnapshot('published');
    if (stored) return stored;
  } catch (err) {
    console.error('[content] Could not read published content; serving the seed.', err);
  }
  return INITIAL_CMS_STATE;
});

/** Published projects in display order. */
export async function getPublishedProjects() {
  const content = await getPublishedContent();
  return [...content.projects]
    .filter((p) => p.status === 'published')
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProjectBySlug(slug: string) {
  const content = await getPublishedContent();
  return content.projects.find((p) => p.slug === slug && p.status !== 'archived') ?? null;
}

export async function getPublishedCaseStudies() {
  const content = await getPublishedContent();
  return [...content.caseStudies]
    .filter((c) => c.status === 'published')
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCaseStudyBySlug(slug: string) {
  const content = await getPublishedContent();
  return content.caseStudies.find((c) => c.slug === slug && c.status !== 'archived') ?? null;
}
