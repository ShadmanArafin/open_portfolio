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
  SocialLinkItem,
} from '@/cms/types/cms';
// Relative, like every other runtime import in this directory. The `@/`
// alias is a convenience of the product's own build; a relative path resolves
// the same way anywhere, which is what lets the marketing site's demo render
// real blocks instead of a look-alike that drifts.
import { WRITING_DEFAULTS, arrange, isLive, type WritingEntry } from '../writing/schema';

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
  /**
   * Where else to find the owner. Public by definition — they are links the
   * site already prints in its footer — so a block may place them.
   */
  socialLinks: SocialLinkItem[];
  /**
   * Essays, notes, posts — already filtered to what is live and already put in
   * the order the owner chose, so a block only has to decide how many.
   */
  writing: WritingEntry[];
  /**
   * The two decisions from the Writing screen a block cannot make for itself.
   *
   * A narrow exception to "records only, never settings", and worth stating
   * why: whether dates appear at all is a decision the owner already made once,
   * for the whole section, in the place where it belongs. Giving a block its
   * own `showDates` prop would let a page contradict the Writing screen, and
   * the two would disagree silently — with the owner as the last person to
   * notice, because they know what they set.
   */
  writingSettings: { label: string; showDates: boolean };
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
  socialLinks: [],
  writing: [],
  writingSettings: { label: WRITING_DEFAULTS.label, showDates: WRITING_DEFAULTS.showDates },
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

  const settings = { ...WRITING_DEFAULTS, ...(state.writingSettings ?? {}) };

  return {
    projects: byOrder((state.projects ?? []).filter((p) => p.status === 'published')),
    caseStudies: byOrder((state.caseStudies ?? []).filter((c) => c.status === 'published')),
    brands: visible(state.brands),
    experience: visible(state.experience),
    education: visible(state.education),
    processSteps: visible(state.processSteps),
    capabilityGroups: visible(state.capabilityGroups),
    recommendations: visible(state.recommendations),
    socialLinks: visible(state.socialLinks),
    // `isLive` rather than a status check, because writing can be scheduled:
    // "published, or scheduled and the date has passed". The predicate lives
    // with the schema so every reader agrees about what live means.
    writing: arrange(
      (state.writing ?? []).filter((entry) => isLive(entry)),
      settings.order
    ),
    writingSettings: { label: settings.label, showDates: settings.showDates },
  };
}
