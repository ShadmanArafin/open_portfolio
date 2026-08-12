import { z } from 'zod';

/**
 * Pages: the thing blocks are arranged on.
 *
 * A page is a slug, a title, an ordered list of blocks and its own SEO. Nothing
 * more — the arrangement lives in the blocks, and the presentation lives in the
 * theme.
 *
 * The interesting problem here is not the record, it is the slug. A file-system
 * router gives static routes precedence over the catch-all that serves these
 * pages, so a page whose slug collides with a real route is not an error
 * anywhere: it saves, it appears in the admin, and it silently never loads.
 * That is the worst failure mode available — the user is certain they made the
 * page, and they did. So the collision is caught where it is created, in
 * language that says what to do about it.
 */

/**
 * Top-level paths this build already serves.
 *
 * Kept as data rather than discovered at runtime because it has to be
 * enforceable at write time, in the admin, before anything is saved.
 * `core/pages/__tests__/schema.test.ts` walks the route directories and fails
 * if this list drifts — so adding `app/(site)/blog` without reserving `blog`
 * breaks the build rather than shadowing somebody's page a release later.
 */
export const RESERVED_TOP_LEVEL: readonly string[] = [
  // Real routes.
  'about',
  'admin',
  'api',
  'case-studies',
  'contact',
  'newsletter',
  'setup',
  'work',
  'writing',
  // Framework and platform paths that never reach our router.
  '_next',
  '_vercel',
  // Metadata files served from the app root.
  'favicon.ico',
  'opengraph-image',
  'robots.txt',
  'sitemap.xml',
];

/**
 * The home page's slug.
 *
 * An empty string, because the home page has no address of its own — it *is*
 * the address. Giving it a real slug like `home` would put the same content at
 * two URLs, which is the one thing a site's front door must not do.
 *
 * It is the only page allowed an empty slug, and the only page the catch-all
 * route must never serve.
 */
export const HOME_SLUG = '';

export const MAX_SLUG_SEGMENTS = 3;
export const MAX_SLUG_LENGTH = 120;

export const pageSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  /** Keeps a page reachable by link but out of search results and the sitemap. */
  noindex: z.boolean().optional(),
});

export const pageSchema = z.object({
  id: z.string().min(1),
  /**
   * Empty means the home page, and nothing else.
   *
   * This was `min(1)` until the home page needed a record, at which point every
   * home page was silently dropped on read: the schema rejected it, `getPages`
   * skipped it, and the site fell back to the old layout with no error
   * anywhere. `id` still carries the real "is this a record at all" check.
   */
  slug: z.string(),
  title: z.string(),
  /**
   * Raw block envelopes. Deliberately not validated here: the block parser owns
   * that, and it quarantines rather than rejects. Validating blocks at the page
   * level would mean one unreadable block makes the whole page unreadable,
   * which is the failure the block system exists to prevent.
   */
  blocks: z.array(z.unknown()),
  status: z.enum(['draft', 'published']),
  seo: pageSeoSchema,
  nav: z.object({
    show: z.boolean(),
    label: z.string().optional(),
    order: z.number(),
  }),
  updatedAt: z.string(),
  /**
   * Incremented on every write. A save that carries a stale revision is
   * rejected rather than applied, so two tabs cannot quietly overwrite each
   * other.
   */
  revision: z.number().int().nonnegative(),
});

export type PageRecord = z.infer<typeof pageSchema>;

/**
 * Turns anything a person might type into a slug that can be a URL.
 *
 * Lossy on purpose, and always applied — including to slugs typed by hand.
 * Offering a "URL" field that accepts `My Page!` and then 404s is a worse
 * experience than quietly producing `my-page`.
 */
export function normaliseSlug(input: string): string {
  return (
    input
      .normalize('NFKD')
      // NFKD decomposes accented letters, and the a-z0-9-/ filter below drops
      // the leftover combining marks — so "café" becomes "cafe" rather than "caf".
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9\-/]/g, '')
      .replace(/\/+/g, '/')
      .replace(/-+/g, '-')
      .split('/')
      .map((segment) => segment.replace(/^-+|-+$/g, ''))
      .filter(Boolean)
      .join('/')
  );
}

export interface SlugProblem {
  /** Whether the slug can be saved at all. */
  blocking: boolean;
  message: string;
}

/**
 * Everything wrong with a slug, in the order a person would want to hear it.
 *
 * Returns `null` when the slug is fine. The message is the whole point: "that
 * address is already used by this site's Work section — try `my-work` instead"
 * is actionable, and "invalid slug" is not.
 */
export function checkSlug(
  slug: string,
  options: { existingSlugs?: readonly string[]; isHome?: boolean } = {}
): SlugProblem | null {
  // The home page's address is not editable, so there is nothing to check.
  if (options.isHome) return null;

  if (!slug) {
    return { blocking: true, message: 'This page needs a web address.' };
  }

  if (slug !== normaliseSlug(slug)) {
    return {
      blocking: true,
      message: `A web address cannot contain spaces or punctuation. Try "${normaliseSlug(slug)}".`,
    };
  }

  if (slug.length > MAX_SLUG_LENGTH) {
    return {
      blocking: true,
      message: `This web address is too long. Keep it under ${MAX_SLUG_LENGTH} characters.`,
    };
  }

  const segments = slug.split('/');
  if (segments.length > MAX_SLUG_SEGMENTS) {
    return {
      blocking: true,
      message: `Web addresses can be at most ${MAX_SLUG_SEGMENTS} levels deep.`,
    };
  }

  if (RESERVED_TOP_LEVEL.includes(segments[0])) {
    return {
      blocking: true,
      message: `"${segments[0]}" is already used by this site, so a page there would never open. Try something like "my-${segments[0]}".`,
    };
  }

  if (options.existingSlugs?.includes(slug)) {
    return { blocking: true, message: 'Another page already uses this web address.' };
  }

  return null;
}

let counter = 0;

/** A new, empty page. What "Add page" inserts. */
export function createPage(input: { title: string; slug?: string; id?: string }): PageRecord {
  const slug = normaliseSlug(input.slug || input.title) || `page-${++counter}`;
  return {
    id: input.id ?? `page_${slug}_${++counter}`,
    slug,
    title: input.title,
    blocks: [],
    status: 'draft',
    seo: {},
    nav: { show: false, order: 0 },
    updatedAt: new Date().toISOString(),
    revision: 1,
  };
}

/**
 * The home page, as a record like any other.
 *
 * Made lazily rather than seeded, so an existing site is untouched until
 * somebody chooses to build their home page from blocks. Until then the theme's
 * own sections keep rendering, which is what every install already has.
 */
export function createHomePage(): PageRecord {
  return {
    id: 'page_home',
    slug: HOME_SLUG,
    title: 'Home',
    blocks: [],
    status: 'draft',
    seo: {},
    nav: { show: false, order: -1 },
    updatedAt: new Date().toISOString(),
    revision: 1,
  };
}

export function isHomePage(page: { slug: string }): boolean {
  return page.slug === HOME_SLUG;
}

/** `about/team` -> `['about', 'team']`. The shape a catch-all route returns. */
export function slugToSegments(slug: string): string[] {
  return slug.split('/').filter(Boolean);
}

export function segmentsToSlug(segments: string[] | undefined): string {
  return (segments ?? []).filter(Boolean).join('/');
}
