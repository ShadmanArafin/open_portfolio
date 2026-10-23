/**
 * The Content-Security-Policy, in one place for `next.config.ts` (every
 * response) and the proxy (which adjusts it per request).
 *
 * See `next.config.ts` for what the policy buys and why it is a baseline.
 */
const directives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com https://challenges.cloudflare.com https://cal.com https://calendly.com https://instagram.com https://www.instagram.com https://behance.net https://www.behance.net https://*.substack.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

/** The policy as served over https: plain-http subresources are upgraded. */
export const contentSecurityPolicy = [...directives, 'upgrade-insecure-requests'].join('; ');

/**
 * The policy for a request that really arrived over plain http, without
 * `upgrade-insecure-requests`.
 *
 * On a plain-http install (a LAN box, a first try on a VPS before TLS) that
 * directive rewrote the site's own same-origin addresses to https, which
 * nothing answers — so the admin's preview frame, and any same-origin
 * subresource it upgraded, failed to load. Over https it stays.
 */
export const plainHttpContentSecurityPolicy = directives.join('; ');

/**
 * Whether the visitor's connection was https: the URL the server saw, or the
 * scheme a TLS-terminating proxy reports. This only chooses whether to ask the
 * browser to upgrade; it grants nothing, so a spoofed header can only cost the
 * person who sent it an upgrade on their own page.
 */
export function arrivedOverHttps(url: URL, forwardedProto: string | null): boolean {
  const proto = forwardedProto?.split(',')[0]?.trim().toLowerCase();
  return proto ? proto === 'https' : url.protocol === 'https:';
}
