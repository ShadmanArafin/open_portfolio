/*
 * Kept apart from `schema.ts` on purpose: the site's navbar is a client
 * component and needs this predicate, and importing it from the schema module
 * shipped zod and every page schema to every visitor (about 280 KB of
 * JavaScript before compression). This file must stay free of runtime imports.
 */

/**
 * Whether visitors see a page now: published, or scheduled and due. The same
 * rule writing uses (`isLive` in core/writing/schema), so "scheduled" means the
 * same thing everywhere. The site renders on a 60-second cycle, so a page
 * appears within a minute of its moment with nothing running in between.
 */
export function isPageLive(
  page: { status: string; scheduledFor?: string },
  now: Date = new Date()
): boolean {
  if (page.status === 'published') return true;
  if (page.status !== 'scheduled' || !page.scheduledFor) return false;
  const due = Date.parse(page.scheduledFor);
  return Number.isFinite(due) && due <= now.getTime();
}
