import type { NavLinkItem } from '@/cms/types/cms';
import type { PageRecord } from './schema';

/**
 * Getting built pages into the site's navigation.
 *
 * A page nobody can reach is not a page. Without this, creating one would mean
 * also remembering to add a matching link in Settings → Navigation, spelled
 * identically — and forgetting is silent, because the page really does exist at
 * the address the admin shows.
 *
 * Framework-free and pure so it can be tested directly and used from the client
 * navbar, which is where the site's links are actually rendered.
 */

export interface NavOptions {
  /** True in preview, so the owner can see where a draft page will sit. */
  includeDrafts?: boolean;
}

export function navEntriesFromPages(
  pages: readonly PageRecord[] | undefined,
  options: NavOptions = {}
): NavLinkItem[] {
  return (pages ?? [])
    .filter((page) => page.nav.show)
    .filter((page) => page.status === 'published' || options.includeDrafts)
    .map((page) => ({
      id: `page:${page.id}`,
      label: page.nav.label || page.title,
      path: `/${page.slug}`,
      visible: true,
      sortOrder: page.nav.order,
    }));
}

/**
 * Explicit navigation links and page-derived ones, in one ordered list.
 *
 * A hand-written link to the same path wins. Someone who typed the address into
 * Settings meant that label, and having it silently replaced by the page title
 * would look like the site ignoring them.
 */
export function mergeNavLinks(
  navLinks: readonly NavLinkItem[] | undefined,
  pages: readonly PageRecord[] | undefined,
  options: NavOptions = {}
): NavLinkItem[] {
  const explicit = (navLinks ?? []).filter((link) => link.visible !== false);
  const taken = new Set(explicit.map((link) => link.path));

  const derived = navEntriesFromPages(pages, options).filter((link) => !taken.has(link.path));

  return [...explicit, ...derived].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
  );
}
