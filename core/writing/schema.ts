import { z } from 'zod';

/**
 * Writing — the thing most products call a blog.
 *
 * It is one collection with a label the owner chooses, and the reasoning is in
 * `docs/PLAN.md` under Phase 9. Briefly: a blog is a *container* whose defining
 * property is reverse-chronological order, and for a portfolio that ordering is
 * usually wrong. A strong essay from three years ago sinks below last week's
 * throwaway, and an empty blog — or one whose newest post is eighteen months
 * old — actively damages a portfolio, because the format itself implies an
 * obligation the owner has visibly broken.
 *
 * So: dates are optional, order can be manual, and chronological is a setting
 * rather than the shape of the thing. Somebody chasing search traffic can have
 * the blog behaviour; nobody else has to inherit its social contract.
 */

export const writingStatus = z.enum(['draft', 'published', 'scheduled']);

export const writingSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string(),
  /** One or two lines, used in the list and as the meta description. */
  summary: z.string().default(''),

  /**
   * The body, as blocks.
   *
   * Deliberately the same block system as pages rather than a second rich-text
   * format. A piece of writing that wants an image gallery or a pull quote
   * should not need a parallel editor, a parallel renderer and a parallel set
   * of bugs — and every block added later works here for free.
   */
  blocks: z.array(z.unknown()).default([]),

  status: writingStatus,
  /**
   * When it was written. Optional because a portfolio essay is usually
   * evergreen, and stamping a date on it makes it look stale when it is not.
   */
  publishedAt: z.string().optional(),
  /** Set only when `status` is `scheduled`. */
  scheduledFor: z.string().optional(),

  tags: z.array(z.string()).default([]),
  /** Pins a piece above the rest regardless of order. Best work first. */
  featured: z.boolean().default(false),
  /** Position when the collection is ordered by hand. */
  sortOrder: z.number().default(0),

  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    noindex: z.boolean().optional(),
  }),

  updatedAt: z.string(),
  revision: z.number().int().nonnegative(),
});

export type WritingEntry = z.infer<typeof writingSchema>;

/**
 * How the collection is arranged, and what it is called.
 *
 * Both live in settings rather than being decided by the code, because the
 * right answer differs per person and neither one is a preference we should
 * hold on their behalf.
 */
export const writingSettingsSchema = z.object({
  /** "Writing", "Blog", "Journal", "Essays" — the profession packs set this. */
  label: z.string().default('Writing'),
  /** The address the collection lives at. */
  slug: z.string().default('writing'),
  /** Curated puts featured first then manual order; newest is a blog. */
  order: z.enum(['curated', 'newest']).default('curated'),
  /** Whether dates appear on the page at all. */
  showDates: z.boolean().default(false),
  enabled: z.boolean().default(false),
});

export type WritingSettings = z.infer<typeof writingSettingsSchema>;

export const WRITING_DEFAULTS: WritingSettings = {
  label: 'Writing',
  slug: 'writing',
  order: 'curated',
  showDates: false,
  enabled: false,
};

let counter = 0;

export function createWritingEntry(title: string): WritingEntry {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id: `writing_${Date.now().toString(36)}_${++counter}`,
    slug: slug || `untitled-${++counter}`,
    title,
    summary: '',
    blocks: [],
    status: 'draft',
    tags: [],
    featured: false,
    sortOrder: 0,
    seo: {},
    updatedAt: new Date().toISOString(),
    revision: 1,
  };
}

/**
 * Whether an entry should be public right now.
 *
 * Scheduling is a predicate rather than a job. There is no cron on a free
 * serverless plan and nothing to guarantee one runs, so "publish at 9am" as a
 * scheduled task is a promise the host never made. Asking "is it past its time"
 * on every read is a promise that keeps itself — the piece appears within the
 * cache window, on any host, with nothing to configure.
 */
export function isLive(entry: WritingEntry, now: Date = new Date()): boolean {
  if (entry.status === 'published') return true;
  if (entry.status !== 'scheduled' || !entry.scheduledFor) return false;

  const due = Date.parse(entry.scheduledFor);
  return Number.isFinite(due) && due <= now.getTime();
}

/**
 * The collection in the order it should be read.
 *
 * Featured first in both modes: pinning your best work is the whole reason
 * curated exists, and somebody who has chosen newest-first has still said this
 * one matters more.
 */
export function arrange(entries: WritingEntry[], order: WritingSettings['order']): WritingEntry[] {
  const byDate = (a: WritingEntry, b: WritingEntry) =>
    Date.parse(b.publishedAt ?? b.updatedAt) - Date.parse(a.publishedAt ?? a.updatedAt);

  return [...entries].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (order === 'newest') return byDate(a, b);
    return a.sortOrder - b.sortOrder || byDate(a, b);
  });
}
