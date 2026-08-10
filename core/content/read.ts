import { cache } from 'react';
import type { CMSState } from '@/cms/types/cms';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';

/**
 * The single server-side read of published content.
 *
 * Every page goes through this one function rather than reaching for content
 * directly, so there is exactly one place to swap when real storage lands. It
 * is wrapped in React's `cache` so a request that renders six sections still
 * performs one read.
 *
 * Today it returns the built-in seed. That is a deliberate intermediate state:
 * content currently lives in the editor's own browser (IndexedDB), which the
 * server cannot see, so the server-rendered HTML is the seed and the browser
 * swaps in stored content on hydration. Once the storage adapters exist this
 * becomes a real query and the swap disappears.
 */
export const getPublishedContent = cache(async (): Promise<CMSState> => {
  return INITIAL_CMS_STATE;
});

/** Published projects, newest first, excluding drafts and archived work. */
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
