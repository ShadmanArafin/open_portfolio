import 'server-only';
import { getPublishedContent } from '@/core/content/read';
import { resolveSiteUrl } from '@/core/content/metadata';

/**
 * Where a confirmation link points.
 *
 * From the site's own configuration and never from the request. A link built
 * from a caller-supplied `Host` header mails a stranger a valid token aimed at
 * somebody else's domain, which is a token-theft primitive dressed as a
 * convenience — the same reasoning as `resetUrlBase()` in `core/auth/reset`,
 * and the same mistake this repository has already made once in the claim flow.
 *
 * `null` when nothing is configured, so the caller has to decide what to say
 * rather than mailing a link to `undefined/newsletter/confirm`.
 */
export async function siteOrigin(): Promise<string | null> {
  const configured = resolveSiteUrl(await getPublishedContent());
  if (configured) return configured;
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3000';
  return null;
}
