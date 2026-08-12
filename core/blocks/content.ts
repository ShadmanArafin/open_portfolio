import type {
  BrandItem,
  CMSState,
  CapabilityGroupItem,
  CaseStudyItem,
  EducationItem,
  ExperienceItem,
  ProcessStepItem,
  ProjectItem,
  RecommendationItem,
} from '@/cms/types/cms';

/**
 * The site's own records, as a block sees them.
 *
 * The half of "your stuff lives in collections; your pages arrange it" that did
 * not exist. Every block until now took literal props — a headline somebody
 * typed, cards they filled in by hand — so a person could build a page but
 * could not put their own projects, clients or experience on it. Ten
 * collections sat in the admin, reachable from nowhere.
 *
 * Passed down from the renderer rather than fetched inside a block, for the
 * same reason `headingLevel` is: `Render` is a synchronous component and the
 * test harness drives it through `renderToStaticMarkup`. A block that awaited
 * its own content would be an async Server Component, which is a different
 * thing that cannot be rendered that way. `getPublishedContent()` is React-
 * cached, so a route reading it again to pass it down costs nothing.
 *
 * Deliberately narrow. Blocks get the records they might place and not the
 * whole `CMSState` — no settings, no SEO, no media library, and above all no
 * `messages`, because the contact inbox has no business being one careless prop
 * spread away from the public page.
 */
export interface BlockContent {
  projects: ProjectItem[];
  caseStudies: CaseStudyItem[];
  brands: BrandItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  processSteps: ProcessStepItem[];
  capabilityGroups: CapabilityGroupItem[];
  recommendations: RecommendationItem[];
}

/** What a block sees when nobody passed it anything. Never null — see below. */
export const EMPTY_BLOCK_CONTENT: BlockContent = {
  projects: [],
  caseStudies: [],
  brands: [],
  experience: [],
  education: [],
  processSteps: [],
  capabilityGroups: [],
  recommendations: [],
};

function byOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Applies the rules every collection view would otherwise repeat.
 *
 * Hidden records are dropped and the rest are put in the author's order, once,
 * here — rather than in six blocks that would each have to remember. A block
 * that forgot would publish something its owner had explicitly hidden, which is
 * the kind of mistake nobody reports because the person who notices is a
 * stranger.
 *
 * `projects` and `caseStudies` filter on `status` rather than `visible`,
 * matching `getPublishedProjects()`. That difference is the collections' and
 * not this function's to fix.
 */
export function blockContentFrom(state: CMSState | undefined): BlockContent {
  if (!state) return EMPTY_BLOCK_CONTENT;

  const visible = <T extends { visible: boolean; sortOrder: number }>(items: T[] | undefined) =>
    byOrder((items ?? []).filter((item) => item.visible !== false));

  return {
    projects: byOrder((state.projects ?? []).filter((p) => p.status === 'published')),
    caseStudies: byOrder((state.caseStudies ?? []).filter((c) => c.status === 'published')),
    brands: visible(state.brands),
    experience: visible(state.experience),
    education: visible(state.education),
    processSteps: visible(state.processSteps),
    capabilityGroups: visible(state.capabilityGroups),
    recommendations: visible(state.recommendations),
  };
}
