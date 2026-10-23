import { sanitizeHref } from '@/core/security/urls';
import type { SocialLinkItem } from '@/cms/types/cms';

/**
 * The owner's profiles elsewhere, as `<link rel="me">` targets.
 *
 * Mastodon's verifier fetches the page and reads the HTML the server sent —
 * it runs no JavaScript and does not care which layout or block shows the
 * links — so the reliable place for the claim is the document head, on every
 * page. Absolute http(s) only: a same-site path or a `mailto:` is not a
 * profile anybody can link back from.
 */
export function profileLinks(links: SocialLinkItem[] | undefined): string[] {
  const seen = new Set<string>();
  for (const link of links ?? []) {
    if (link.visible === false) continue;
    const href = sanitizeHref(link.url);
    if (href && /^https?:\/\//i.test(href)) seen.add(href);
  }
  return [...seen];
}

/**
 * `@you@mastodon.social` from a Mastodon profile link, for the
 * `fediverse:creator` meta tag: Mastodon then credits the owner, with a link
 * to their profile, under every preview of a page from this site.
 *
 * Only links marked as Mastodon count. `https://host/@name` is also how
 * Medium, TikTok, YouTube and Threads address people, and crediting a
 * fediverse account that does not exist is worse than crediting none.
 */
export function fediverseCreator(links: SocialLinkItem[] | undefined): string | null {
  for (const link of links ?? []) {
    if (link.visible === false || link.iconType !== 'mastodon') continue;
    const href = sanitizeHref(link.url);
    if (!href) continue;
    try {
      const url = new URL(href);
      const match = /^\/@([A-Za-z0-9_]{1,30})\/?$/.exec(url.pathname);
      if (url.protocol === 'https:' && match) return `@${match[1]}@${url.hostname}`;
    } catch {
      // Not a URL; the next link may be.
    }
  }
  return null;
}
