import 'server-only';
import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import type { CMSState } from '@/cms/types/cms';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { getStorageAdapter } from '@/core/storage/registry';
import type { Channel } from '@/core/storage/contract';
import { caseStudyToProject, mergeWork } from './work';

/**
 * The work merge lives in `./work` so the client views that list work can share
 * it without pulling in `server-only`. Re-exported here because this module is
 * the read layer's public face and callers already reach for it.
 */
export { caseStudyToProject, mergeWork } from './work';

/** The cache tag on published content; a publish or restore expires it. */
export const PUBLISHED_TAG = 'content:published';

async function readPublished(): Promise<CMSState> {
  try {
    const stored = await (await getStorageAdapter()).readSnapshot('published');
    if (stored) return stored;
  } catch (err) {
    console.error('[content] Could not read published content; serving the seed.', err);
  }
  return INITIAL_CMS_STATE;
}

/**
 * Published content, cached across requests (Cache Components).
 *
 * Tagged, so a publish expires it the moment it lands (`updateTag` in the
 * publish action, `revalidateTag` in the publish and restore routes). The
 * one-minute revalidation is only for time: a page or piece scheduled for
 * later goes live on the first read after its moment. `stale` is kept short
 * so a visitor's open tab does not hold an old copy for long either.
 *
 * The seed served while storage is unreachable is cached the same way, so a
 * database that wakes up is seen within the minute. (A shorter life is not an
 * option: under five minutes, a cache counts as dynamic during prerendering.)
 */
async function readPublishedCached(): Promise<CMSState> {
  'use cache';
  cacheTag(PUBLISHED_TAG);
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  return readPublished();
}

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
 *
 * Demo mode is the one uncached case: each visitor's sandbox is chosen by a
 * cookie inside the store, and a shared cache would hand one visitor's edits
 * to everyone.
 */
export const getPublishedContent = cache(async (): Promise<CMSState> => {
  if (process.env.OPB_DEMO_MODE === '1') return readPublished();
  return readPublishedCached();
});

/**
 * Published content read straight from storage, for the owner's screens and
 * routes: they report what is stored, not what visitors are being served.
 */
export const getPublishedContentFresh = cache(readPublished);

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
  // Read fresh, never through the cache: the draft channel is what the editors
  // open and what their saves are checked against, and a cached copy — up to
  // a minute old, or filled at build time from the build machine's storage —
  // made a screen's fingerprint disagree with the store, so its first save
  // was refused as "changed somewhere else".
  return readPublished();
});

/** Published projects in display order, including any legacy case studies not already in projects. */
export async function getPublishedProjects() {
  const content = await getPublishedContent();
  const projects = [...content.projects].filter((p) => p.status === 'published');
  const legacy = (content.caseStudies ?? []).filter((c) => c.status === 'published');
  return mergeWork(projects, legacy).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProjectBySlug(slug: string) {
  const content = await getPublishedContent();
  const direct = content.projects.find((p) => p.slug === slug && p.status !== 'archived');
  if (direct) return direct;
  const legacy = content.caseStudies?.find((c) => c.slug === slug && c.status !== 'archived');
  if (legacy) return caseStudyToProject(legacy);
  return null;
}
