import 'server-only';
import { cache } from 'react';
import type { CMSState } from '@/cms/types/cms';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { getStorageAdapter } from '@/core/storage/registry';
import type { Channel } from '@/core/storage/contract';

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
    const stored = await (await getStorageAdapter()).readSnapshot('published');
    if (stored) return stored;
  } catch (err) {
    console.error('[content] Could not read published content; serving the seed.', err);
  }
  return INITIAL_CMS_STATE;
});

/**
 * Content for a channel, with the draft falling back to what is live.
 *
 * The fallback is the point. A site that has never saved a draft has no draft
 * snapshot, and previewing it should show the site as it stands rather than an
 * empty one — "preview" means "what it would look like", and with no unsaved
 * changes the honest answer is the published site.
 */
export const getContentForChannel = cache(async (channel: Channel): Promise<CMSState> => {
  if (channel === 'published') return getPublishedContent();

  try {
    const stored = await (await getStorageAdapter()).readSnapshot('draft');
    if (stored) return stored;
  } catch (err) {
    console.error('[content] Could not read the draft; falling back to what is published.', err);
  }
  return getPublishedContent();
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
