import 'server-only';
import { cache } from 'react';
import type { CMSState, CaseStudyItem, ProjectItem } from '@/cms/types/cms';
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

/**
 * Adapts a legacy case study into a work/project item with story blocks.
 *
 * Ensures backward compatibility with existing snapshots and database content
 * where case studies were stored separately from projects.
 */
export function caseStudyToProject(cs: CaseStudyItem): ProjectItem {
  return {
    id: cs.id,
    slug: cs.slug,
    number: cs.number,
    title: cs.title,
    name: cs.title,
    company: cs.industry || '',
    category: cs.category,
    year: cs.year,
    startYear: cs.startYear,
    endYear: cs.endYear,
    shortDescription: cs.shortChallenge,
    description: cs.overview ?? [],
    heroHeadline: cs.title,
    role: cs.role,
    deliverables: cs.disciplines ?? [],
    industry: cs.industry,
    timeline: cs.timeline,
    platform: cs.platform,
    featured: cs.featured,
    sortOrder: cs.sortOrder,
    status: cs.status,
    visualPlaceholder: cs.coverGradient || 'from-emerald-950 via-zinc-900 to-black',
    images: cs.coverImage
      ? [{ id: `${cs.id}-cover`, label: '01 / COVER', alt: cs.title, url: cs.coverImage }]
      : [],
    overview: cs.overview ?? [],
    challenge: cs.challenge || cs.shortChallenge,
    approachSteps: (cs.keyDecisions ?? []).map((d) => ({
      title: d.title,
      description: `${d.rationale}${d.impact ? ` (${d.impact})` : ''}`,
    })),
    keyScreensCount: cs.wireframes?.length ?? 0,
    outcomeNote:
      cs.outcome?.summary ||
      (cs.outcomes?.[0] ? `${cs.outcomes[0].metric} ${cs.outcomes[0].label}` : ''),
    seoTitle: cs.seoTitle,
    seoDescription: cs.seoDescription,
    story: {
      blocks: cs.blocks ?? [],
    },
  };
}

/** Published projects in display order, including any legacy case studies not already in projects. */
export async function getPublishedProjects() {
  const content = await getPublishedContent();
  const projects = [...content.projects]
    .filter((p) => p.status === 'published')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Lossless merge: if stored content has case studies not in projects, include them.
  const knownSlugs = new Set(projects.map((p) => p.slug));
  const legacy = (content.caseStudies ?? [])
    .filter((c) => c.status === 'published' && !knownSlugs.has(c.slug))
    .map(caseStudyToProject);

  return [...projects, ...legacy].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProjectBySlug(slug: string) {
  const content = await getPublishedContent();
  const direct = content.projects.find((p) => p.slug === slug && p.status !== 'archived');
  if (direct) return direct;
  const legacy = content.caseStudies?.find((c) => c.slug === slug && c.status !== 'archived');
  if (legacy) return caseStudyToProject(legacy);
  return null;
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
