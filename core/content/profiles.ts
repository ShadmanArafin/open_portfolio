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
