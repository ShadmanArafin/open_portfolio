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

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // The admin must never be indexed, and must never be cached by a CDN.
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
