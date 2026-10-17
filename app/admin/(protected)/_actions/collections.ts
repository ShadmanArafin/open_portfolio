'use server';

import { revalidatePath } from 'next/cache';
import { requireOwner } from '@/core/auth/guard';
import { normaliseSlug } from '@/core/pages/schema';
import { RevisionConflictError } from '@/core/storage/contract';
import { getStorageAdapter } from '@/core/storage/registry';
import type {
  CaseStudyBlock,
  CaseStudyItem,
  CMSState,
  ProjectApproachStep,
  ProjectImageItem,
  ProjectItem,
  PublishStatus,
} from '@/cms/types/cms';

export interface ProjectsResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
  /** The stored list, so the editor can show what was actually saved. */
  projects?: ProjectItem[];
}

export interface CaseStudiesResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
  caseStudies?: CaseStudyItem[];
}

/**
 * Saving a collection.
 *
 * The payload is the whole list, because that is what the screen is: records
 * in an order, each one a small form, every one of those a local edit until
 * Save. The write is revision-checked and flag-for-flag — the server never
 * takes a field on faith, and the field set below is written down next to the
 * interface it mirrors. Missing text reads as empty so a snapshot written
 * before a field existed keeps saving; a wrong *type* is rejected, because
 * that is how a broken client gets caught rather than stored.
 *
 * Both cleaners preserve every field the public site reads and drop anything
 * the interfaces do not name, so an injection through an extra key has
 * nowhere to land. `sortOrder` is reassigned from the array order — the list
 * as displayed is the list as stored.
 */

const MAX_RECORDS = 50;
const MAX_BLOCKS = 120;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const STATUSES = new Set(['draft', 'published', 'archived']);

function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max;
}

/** Required text. Absent reads as empty (old snapshots); wrong types are null. */
function text(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return '';
  return isText(value, max) ? value : null;
}

/** Optional text. Absent or empty stays absent; wrong types are null. */
function optionalText(value: unknown, max: number): string | undefined | null {
  if (value === undefined || value === null || value === '') return undefined;
  return isText(value, max) ? value : null;
}

function textList(
  value: unknown,
  maxItems: number,
  maxLength: number,
  fallback: string[] = []
): string[] | null {
  if (value === undefined || value === null) return fallback;
  if (!Array.isArray(value) || value.length > maxItems) return null;
  const out: string[] = [];
  for (const item of value) {
    if (!isText(item, maxLength)) return null;
    out.push(item);
  }
  return out;
}

function flag(value: unknown, fallback: boolean): boolean | null {
  if (value === undefined || value === null) return fallback;
  return typeof value === 'boolean' ? value : null;
}

function count(value: unknown, fallback: number): number | null {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1_000_000) {
    return null;
  }
  return value;
}

function object(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

/** A plain object that any record can be confused for. */
function isRecord(value: unknown): boolean {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/* ------------------------------------------------------------------ projects */

function cleanProjectImage(raw: unknown): ProjectImageItem | null {
  const entry = object(raw);
  if (!entry) return null;
  const id = text(entry.id, 100);
  if (!id || !ID_PATTERN.test(id)) return null;
  const label = text(entry.label, 200);
  const alt = text(entry.alt, 500);
  if (label === null || alt === null) return null;

  const image: ProjectImageItem = { id, label, alt };
  const url = optionalText(entry.url, 1000);
  if (url === null) return null;
  if (url !== undefined) image.url = url;
  const gradient = optionalText(entry.placeholderGradient, 200);
  if (gradient === null) return null;
  if (gradient !== undefined) image.placeholderGradient = gradient;
  return image;
}

function cleanProject(raw: unknown): ProjectItem | null {
  const entry = object(raw);
  if (!entry) return null;

  const id = text(entry.id, 100);
  if (!id || !ID_PATTERN.test(id)) return null;
  const slugRaw = text(entry.slug, 200);
  if (slugRaw === null) return null;
  const slug = normaliseSlug(slugRaw);
  if (slug.length === 0) return null;

  const status = entry.status;
  if (typeof status !== 'string' || !STATUSES.has(status)) return null;

  const number = text(entry.number, 20);
  const title = text(entry.title, 300);
  const name = text(entry.name, 300);
  const company = text(entry.company, 200);
  const category = text(entry.category, 200);
  const year = text(entry.year, 40);
  const shortDescription = text(entry.shortDescription, 2000);
  const heroHeadline = text(entry.heroHeadline, 500);
  const role = text(entry.role, 200);
  const industry = text(entry.industry, 200);
  const timeline = text(entry.timeline, 100);
  const platform = text(entry.platform, 200);
  const visualPlaceholder = text(entry.visualPlaceholder, 200);
  const challenge = text(entry.challenge, 5000);
  const outcomeNote = text(entry.outcomeNote, 2000);
  if (
    number === null ||
    title === null ||
    name === null ||
    company === null ||
    category === null ||
    year === null ||
    shortDescription === null ||
    heroHeadline === null ||
    role === null ||
    industry === null ||
    timeline === null ||
    platform === null ||
    visualPlaceholder === null ||
    challenge === null ||
    outcomeNote === null
  ) {
    return null;
  }

  const featured = flag(entry.featured, false);
  const keyScreensCount = count(entry.keyScreensCount, 0);
  const description = textList(entry.description, 60, 5000);
  const deliverables = textList(entry.deliverables, 100, 300);
  const overview = textList(entry.overview, 60, 5000);
  if (featured === null || keyScreensCount === null) return null;
  if (description === null || deliverables === null || overview === null) return null;

  if (!Array.isArray(entry.approachSteps) && entry.approachSteps !== undefined) return null;
  const approachSteps: ProjectApproachStep[] = [];
  for (const step of (entry.approachSteps as unknown[] | undefined) ?? []) {
    const s = object(step);
    if (!s) return null;
    const title = text(s.title, 300);
    const description = text(s.description, 2000);
    if (title === null || description === null) return null;
    approachSteps.push({ title, description });
  }
  if (approachSteps.length > 50) return null;

  if (!Array.isArray(entry.images) && entry.images !== undefined) return null;
  const images: ProjectImageItem[] = [];
  for (const img of (entry.images as unknown[] | undefined) ?? []) {
    const image = cleanProjectImage(img);
    if (!image) return null;
    images.push(image);
  }
  if (images.length > 20) return null;

  const project: ProjectItem = {
    id,
    slug,
    number,
    title,
    name,
    company,
    category,
    year,
    shortDescription,
    description,
    heroHeadline,
    role,
    deliverables,
    industry,
    timeline,
    platform,
    featured,
    // The list as displayed is the list as stored; the array order wins.
    sortOrder: 0,
    status: status as PublishStatus,
    visualPlaceholder,
    images,
    overview,
    challenge,
    approachSteps,
    keyScreensCount,
    outcomeNote,
  };

  const companyUrl = optionalText(entry.companyUrl, 500);
  if (companyUrl === null) return null;
  if (companyUrl !== undefined) project.companyUrl = companyUrl;
  const liveUrl = optionalText(entry.liveUrl, 500);
  if (liveUrl === null) return null;
  if (liveUrl !== undefined) project.liveUrl = liveUrl;
  const siteUrl = optionalText(entry.siteUrl, 500);
  if (siteUrl === null) return null;
  if (siteUrl !== undefined) project.siteUrl = siteUrl;
  const startYear = optionalText(entry.startYear, 10);
  if (startYear === null) return null;
  if (startYear !== undefined) project.startYear = startYear;
  const endYear = optionalText(entry.endYear, 10);
  if (endYear === null) return null;
  if (endYear !== undefined) project.endYear = endYear;
  const seoTitle = optionalText(entry.seoTitle, 300);
  if (seoTitle === null) return null;
  if (seoTitle !== undefined) project.seoTitle = seoTitle;
  const seoDescription = optionalText(entry.seoDescription, 2000);
  if (seoDescription === null) return null;
  if (seoDescription !== undefined) project.seoDescription = seoDescription;

  return project;
}

/* --------------------------------------------------------------- case studies */

function cleanResearch(raw: unknown): CaseStudyItem['userResearch'] | null {
  const entry = object(raw ?? {});
  if (!entry) return null;
  const title = text(entry.title, 300);
  const summary = text(entry.summary, 3000);
  const keyInsights = textList(entry.keyInsights, 100, 500);
  if (title === null || summary === null || keyInsights === null) return null;
  return { title, summary, keyInsights };
}

function cleanFlows(raw: unknown): CaseStudyItem['userFlows'] | null {
  const entry = object(raw ?? {});
  if (!entry) return null;
  const title = text(entry.title, 300);
  const description = text(entry.description, 3000);
  const steps = textList(entry.steps, 50, 300);
  if (title === null || description === null || steps === null) return null;
  return { title, description, steps };
}

function cleanWireframe(raw: unknown): CaseStudyItem['wireframes'][number] | null {
  const entry = object(raw);
  if (!entry) return null;
  const id = text(entry.id, 100);
  if (!id || !ID_PATTERN.test(id)) return null;
  const title = text(entry.title, 300);
  const description = text(entry.description, 2000);
  const gradient = text(entry.gradient, 200);
  if (title === null || description === null || gradient === null) return null;
  const wireframe: CaseStudyItem['wireframes'][number] = { id, title, description, gradient };
  const image = optionalText(entry.image, 1000);
  if (image === null) return null;
  if (image !== undefined) wireframe.image = image;
  return wireframe;
}

function cleanDecision(raw: unknown): CaseStudyItem['keyDecisions'][number] | null {
  const entry = object(raw);
  if (!entry) return null;
  const number = text(entry.number, 20);
  const title = text(entry.title, 300);
  const rationale = text(entry.rationale, 3000);
  const impact = text(entry.impact, 300);
  if (number === null || title === null || rationale === null || impact === null) return null;
  return { number, title, rationale, impact };
}

function cleanSolution(raw: unknown): CaseStudyItem['finalSolution'] | null {
  const entry = object(raw ?? {});
  if (!entry) return null;
  const title = text(entry.title, 300);
  const description = text(entry.description, 3000);
  const highlights = textList(entry.highlights, 50, 300);
  if (title === null || description === null || highlights === null) return null;
  return { title, description, highlights };
}

function cleanTokens(raw: unknown): CaseStudyItem['designSystemTokens'] | null {
  const entry = object(raw ?? {});
  if (!entry) return null;
  const typography = text(entry.typography, 1000);
  const spacingScale = text(entry.spacingScale, 1000);
  if (typography === null || spacingScale === null) return null;
  if (!Array.isArray(entry.colors) && entry.colors !== undefined) return null;
  const colors: { name: string; hex: string }[] = [];
  for (const color of (entry.colors as unknown[] | undefined) ?? []) {
    const c = object(color);
    if (!c) return null;
    const name = text(c.name, 100);
    const hex = text(c.hex, 20);
    if (name === null || hex === null) return null;
    colors.push({ name, hex });
  }
  if (colors.length > 40) return null;
  return { colors, typography, spacingScale };
}

function cleanOutcome(raw: unknown): CaseStudyItem['outcome'] | null {
  const entry = object(raw ?? {});
  if (!entry) return null;
  const summary = text(entry.summary, 3000);
  const metrics = textList(entry.metrics, 50, 300);
  if (summary === null || metrics === null) return null;
  return { summary, metrics };
}

/** Story blocks are not edited yet; they round-trip with the same trust as a page's. */
function cleanStoryBlock(raw: unknown): CaseStudyBlock | null {
  const entry = object(raw);
  if (!entry) return null;
  const id = text(entry.id, 100);
  const type = text(entry.type, 100);
  const order = count(entry.order, 0);
  if (!id || !type || order === null) return null;
  if (!isRecord(entry.content)) return null;
  return {
    id,
    type: type as CaseStudyBlock['type'],
    content: entry.content as Record<string, unknown>,
    order,
  };
}

function cleanCaseStudy(raw: unknown): CaseStudyItem | null {
  const entry = object(raw);
  if (!entry) return null;

  const id = text(entry.id, 100);
  if (!id || !ID_PATTERN.test(id)) return null;
  const slugRaw = text(entry.slug, 200);
  if (slugRaw === null) return null;
  const slug = normaliseSlug(slugRaw);
  if (slug.length === 0) return null;

  const status = entry.status;
  if (typeof status !== 'string' || !STATUSES.has(status)) return null;

  const number = text(entry.number, 20);
  const title = text(entry.title, 300);
  const category = text(entry.category, 200);
  const year = text(entry.year, 40);
  const shortChallenge = text(entry.shortChallenge, 3000);
  const role = text(entry.role, 200);
  const timeline = text(entry.timeline, 100);
  const platform = text(entry.platform, 200);
  const industry = text(entry.industry, 200);
  const challenge = text(entry.challenge, 5000);
  if (
    number === null ||
    title === null ||
    category === null ||
    year === null ||
    shortChallenge === null ||
    role === null ||
    timeline === null ||
    platform === null ||
    industry === null ||
    challenge === null
  ) {
    return null;
  }

  const featured = flag(entry.featured, false);
  const disciplines = textList(entry.disciplines, 50, 200);
  const overview = textList(entry.overview, 60, 5000);
  if (featured === null || disciplines === null || overview === null) return null;

  const userResearch = cleanResearch(entry.userResearch);
  const userFlows = cleanFlows(entry.userFlows);
  const finalSolution = cleanSolution(entry.finalSolution);
  const designSystemTokens = cleanTokens(entry.designSystemTokens);
  const outcome = cleanOutcome(entry.outcome);
  if (!userResearch || !userFlows || !finalSolution || !designSystemTokens || !outcome) return null;

  if (!Array.isArray(entry.wireframes) && entry.wireframes !== undefined) return null;
  const wireframes: CaseStudyItem['wireframes'] = [];
  for (const rawFrame of (entry.wireframes as unknown[] | undefined) ?? []) {
    const frame = cleanWireframe(rawFrame);
    if (!frame) return null;
    wireframes.push(frame);
  }
  if (wireframes.length > 40) return null;

  if (!Array.isArray(entry.keyDecisions) && entry.keyDecisions !== undefined) return null;
  const keyDecisions: CaseStudyItem['keyDecisions'] = [];
  for (const rawDecision of (entry.keyDecisions as unknown[] | undefined) ?? []) {
    const decision = cleanDecision(rawDecision);
    if (!decision) return null;
    keyDecisions.push(decision);
  }
  if (keyDecisions.length > 40) return null;

  if (!Array.isArray(entry.outcomes) && entry.outcomes !== undefined) return null;
  const outcomes: CaseStudyItem['outcomes'] = [];
  for (const rawOutcome of (entry.outcomes as unknown[] | undefined) ?? []) {
    const o = object(rawOutcome);
    if (!o) return null;
    const metric = text(o.metric, 50);
    const label = text(o.label, 300);
    if (metric === null || label === null) return null;
    outcomes.push({ metric, label });
  }
  if (outcomes.length > 30) return null;

  const blocks: CaseStudyBlock[] = [];
  if (entry.blocks !== undefined) {
    if (!Array.isArray(entry.blocks) || entry.blocks.length > MAX_BLOCKS) return null;
    for (const rawBlock of entry.blocks) {
      const block = cleanStoryBlock(rawBlock);
      if (!block) return null;
      blocks.push(block);
    }
  }

  const study: CaseStudyItem = {
    id,
    slug,
    number,
    title,
    category,
    year,
    shortChallenge,
    disciplines,
    featured,
    role,
    timeline,
    platform,
    industry,
    overview,
    challenge,
    userResearch,
    userFlows,
    wireframes,
    keyDecisions,
    finalSolution,
    designSystemTokens,
    outcome,
    outcomes,
    sortOrder: 0,
    status: status as PublishStatus,
  };

  const coverImage = optionalText(entry.coverImage, 1000);
  if (coverImage === null) return null;
  if (coverImage !== undefined) study.coverImage = coverImage;
  const coverGradient = optionalText(entry.coverGradient, 200);
  if (coverGradient === null) return null;
  if (coverGradient !== undefined) study.coverGradient = coverGradient;
  const startYear = optionalText(entry.startYear, 10);
  if (startYear === null) return null;
  if (startYear !== undefined) study.startYear = startYear;
  const endYear = optionalText(entry.endYear, 10);
  if (endYear === null) return null;
  if (endYear !== undefined) study.endYear = endYear;
  const seoTitle = optionalText(entry.seoTitle, 300);
  if (seoTitle === null) return null;
  if (seoTitle !== undefined) study.seoTitle = seoTitle;
  const seoDescription = optionalText(entry.seoDescription, 2000);
  if (seoDescription === null) return null;
  if (seoDescription !== undefined) study.seoDescription = seoDescription;
  if (blocks.length > 0) study.blocks = blocks;

  return study;
}

/* -------------------------------------------------------------------- saving */

async function writeList(
  mutate: (draft: CMSState) => void
): Promise<'ok' | 'conflict' | 'missing'> {
  const adapter = await getStorageAdapter();
  const meta = await adapter.readSnapshotMeta('draft');
  if (!meta) return 'missing';

  const next = structuredClone(meta.state as CMSState);
  mutate(next);

  try {
    await adapter.writeSnapshot('draft', next, meta.revision);
    return 'ok';
  } catch (err) {
    if (err instanceof RevisionConflictError) return 'conflict';
    throw err;
  }
}

const CONFLICT_MESSAGE = 'This changed somewhere else. Reload and try again.';
const NO_DRAFT_MESSAGE = 'There is no draft to change yet.';

function sharedAddressError(kind: string): string {
  return `Two ${kind} share the same web address. Give each one its own.`;
}

export async function updateProjectsAction(projects: unknown): Promise<ProjectsResult> {
  await requireOwner();
  if (!Array.isArray(projects) || projects.length > MAX_RECORDS) {
    return { ok: false, error: 'Those projects are not usable.' };
  }

  const clean: ProjectItem[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  for (const raw of projects) {
    const project = cleanProject(raw);
    if (!project) return { ok: false, error: 'Those projects are not usable.' };
    if (seenIds.has(project.id) || seenSlugs.has(project.slug)) {
      return {
        ok: false,
        error: seenSlugs.has(project.slug)
          ? sharedAddressError('projects')
          : 'Those projects are not usable.',
      };
    }
    seenIds.add(project.id);
    seenSlugs.add(project.slug);
    clean.push(project);
  }

  const stamped = clean.map((project, index) => ({ ...project, sortOrder: index + 1 }));
  const outcome = await writeList((draft) => {
    draft.projects = stamped;
  });
  if (outcome === 'missing') return { ok: false, error: NO_DRAFT_MESSAGE };
  if (outcome === 'conflict') return { ok: false, conflict: true, error: CONFLICT_MESSAGE };

  revalidatePath('/admin/projects');
  return { ok: true, projects: stamped };
}

export async function updateCaseStudiesAction(caseStudies: unknown): Promise<CaseStudiesResult> {
  await requireOwner();
  if (!Array.isArray(caseStudies) || caseStudies.length > MAX_RECORDS) {
    return { ok: false, error: 'Those case studies are not usable.' };
  }

  const clean: CaseStudyItem[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  for (const raw of caseStudies) {
    const study = cleanCaseStudy(raw);
    if (!study) return { ok: false, error: 'Those case studies are not usable.' };
    if (seenIds.has(study.id) || seenSlugs.has(study.slug)) {
      return {
        ok: false,
        error: seenSlugs.has(study.slug)
          ? sharedAddressError('case studies')
          : 'Those case studies are not usable.',
      };
    }
    seenIds.add(study.id);
    seenSlugs.add(study.slug);
    clean.push(study);
  }

  const stamped = clean.map((study, index) => ({ ...study, sortOrder: index + 1 }));
  const outcome = await writeList((draft) => {
    draft.caseStudies = stamped;
  });
  if (outcome === 'missing') return { ok: false, error: NO_DRAFT_MESSAGE };
  if (outcome === 'conflict') return { ok: false, conflict: true, error: CONFLICT_MESSAGE };

  revalidatePath('/admin/case-studies');
  return { ok: true, caseStudies: stamped };
}
