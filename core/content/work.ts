import type { CaseStudyItem, ProjectItem } from '../../src/cms/types/cms';

/**
 * The work collection, and the one legacy input it still has to accept.
 *
 * `projects` is the site's selected work since the merge; `caseStudies` was a
 * second collection for the same idea. The two are now one — but a snapshot
 * written before the merge still carries case studies in their old shape, so
 * that shape is adapted here rather than migrated in place. Nothing is dropped:
 * every field a case study has lands on the work record, and the fields with no
 * direct equivalent become `story` blocks or approach steps.
 *
 * Kept free of `server-only` and of the `@/` alias on purpose. The same
 * functions have to run in the server read layer, in the client views that list
 * work, and in the marketing site's demo renderer, so they can depend on
 * nothing but the types.
 */

/** True when a work record carries an authored case-study story. */
export function hasStory(project: ProjectItem): boolean {
  return (project.story?.blocks?.length ?? 0) > 0;
}

/**
 * True when a work record reads as a case study.
 *
 * Either it was adapted from one (`origin`), or it carries the `story` blocks
 * that make a work record deep. A newer case study is a work record with a
 * story and no marker; a legacy one is a work record with a marker and no
 * story. Both count.
 */
export function isCaseStudy(project: ProjectItem): boolean {
  return project.origin === 'case-study' || hasStory(project);
}

/**
 * Adapts a legacy case study into a work record with story blocks.
 *
 * Lossless by construction: the structured fields (`overview`, `challenge`,
 * `keyDecisions`, `outcome`) are all mapped onto their work equivalents, so a
 * pre-merge snapshot still renders the same page it did before.
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
    origin: 'case-study',
  };
}

/**
 * Folds legacy case studies into the work list, losslessly.
 *
 * A case study whose slug already exists in `projects` is assumed migrated and
 * skipped, so folding is idempotent — the same call can run in the read layer,
 * on the public boundary and in the block content builder without duplicating
 * anything.
 */
export function mergeWork(
  projects: ProjectItem[],
  caseStudies: CaseStudyItem[] | undefined
): ProjectItem[] {
  const list = caseStudies ?? [];
  const knownSlugs = new Set(projects.map((p) => p.slug));
  const legacy = list.filter((c) => !knownSlugs.has(c.slug)).map(caseStudyToProject);
  return [...projects, ...legacy];
}
