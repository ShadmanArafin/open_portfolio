import type { NextConfig } from 'next';

/**
 * Security headers.
 *
 * Set here so they apply on every host, not only Vercel — a self-hoster behind
 * nginx gets the same defaults as someone clicking Deploy.
 *
 * CSP is a baseline, not a strict nonce policy: the root layout ships a
 * blocking inline theme script (no flash of the wrong theme) and Next.js App
 * Router emits its own inline flight scripts. A `script-src 'self'`-only policy
 * would break both. What this policy still buys: no plugins/objects, no
 * framing except same-origin (admin device preview needs it), restricted
 * frame targets for the video facade, the Turnstile challenge widget and the
 * scheduling embeds (Cal.com, Calendly — both host-allowlisted by the embed
 * block, so the CSP names the same two),
 * and `base-uri`/`form-action` locked to self. A per-request nonce policy is
 * the follow-up, not today's change.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com https://challenges.cloudflare.com https://cal.com https://calendly.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // SAMEORIGIN, not DENY: the admin's device preview iframes the site.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  // 2 years, subdomains included. Browsers only honour this over HTTPS, so
  // plain-HTTP dev is unaffected.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /*
   * A self-contained server bundle, for the Docker image.
   *
   * Without this, running outside Vercel means shipping the whole
   * `node_modules` tree — hundreds of megabytes, most of it build tooling that
   * never executes at runtime. `standalone` traces what the server actually
   * imports and copies only that.
   *
   * It also makes "you are not locked to one host" a fact rather than a claim:
   * the same commit runs on Vercel, on a VPS, and on a Raspberry Pi.
   */
  output: 'standalone',

  /*
   * Miniflare ships a platform-native workerd binary (plus READMEs and other
   * non-JS files) that no bundler can trace through: Turbopack fails the
   * build on it. External keeps it a runtime `require()` instead, resolved
   * from `node_modules` — which is why the Dockerfile copies those two
   * packages into the runner image explicitly.
   */
  serverExternalPackages: ['miniflare', '@cloudflare/workerd-*'],

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      /*
       * The admin must never be indexed, and never held by a shared cache.
       *
       * The second half of that sentence was a comment rather than a header:
       * only `X-Robots-Tag` was set, so nothing stopped a CDN or a browser
       * keeping a signed-in page and handing it to whoever asked next.
       *
       * `no-store` covers the HTTP caches. It does **not** constrain Cache
       * Storage, which a service worker writes to directly and which ignores
       * these headers entirely — so this is not a licence to cache the admin in
       * a service worker later. See docs/research/MOBILE-AND-PWA.md.
       */
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
        ],
      },
      // Same for everything the admin talks to.
      {
        source: '/api/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
