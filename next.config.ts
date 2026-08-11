import type { NextConfig } from 'next';

/**
 * Security headers.
 *
 * Set here so they apply on every host, not only Vercel — a self-hoster behind
 * nginx gets the same defaults as someone clicking Deploy. CSP is deliberately
 * absent for now: the theme script in the root layout is inline, and adding a
 * policy without a nonce would break it. That lands with the auth work, where
 * middleware can mint a per-request nonce.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // SAMEORIGIN, not DENY: the admin's device preview iframes the site.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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
