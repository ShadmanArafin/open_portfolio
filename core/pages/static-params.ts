/**
 * `generateStaticParams` under Cache Components must name at least one route,
 * so the build can prerender and check it. A fresh install — or a paused
 * database at build time — has none, and returning nothing used to be how a
 * route said "render everything on demand". This keeps that meaning: one
 * address nothing will ever be saved at (slugs cannot start with `_`), which
 * renders the not-found page at build, and every real address still renders
 * on its first visit.
 */
export const SHELL_SLUG = '__opb-shell';

export function atLeastOne<T>(params: T[], placeholder: T): T[] {
  return params.length > 0 ? params : [placeholder];
}
