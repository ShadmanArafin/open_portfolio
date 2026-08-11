import type { CMSState } from '@/cms/types/cms';

/**
 * Is this shaped like site content at all?
 *
 * Cheap and structural on purpose. The point is to reject a request body that
 * is plainly not content — an empty object, a string, someone's JSON error page
 * — before it is written over a working site. It is not a schema check, because
 * a full-document schema would reject a snapshot written by a newer build, and
 * refusing to save somebody's work because one field is unfamiliar is worse
 * than storing it.
 *
 * Shared by publish and draft so the two cannot drift into disagreeing about
 * what counts as content.
 */
export function looksLikeContent(value: unknown): value is CMSState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<CMSState>;
  return (
    typeof v.settings === 'object' &&
    typeof v.seo === 'object' &&
    Array.isArray(v.projects) &&
    Array.isArray(v.sections)
  );
}
