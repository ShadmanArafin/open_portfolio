import type { NextConfig } from 'next';

/**
 * The marketing and documentation site.
 *
 * A separate application from the product in the repository root, and not an
 * npm workspace member, so `npm install` for somebody deploying their own
 * portfolio never touches any of this. Deployed as its own Vercel project with
 * the root directory set to `site`.
 *
 * The reason it cannot live in the product's `app/` directory: the Deploy
 * button clones this entire repository into the user's own GitHub account, so
 * anything under `app/` becomes a route on **their** portfolio. Nobody's
 * personal site should serve `/alternatives/squarespace`.
 */
const nextConfig: NextConfig = {
  /**
   * This directory is the whole application.
   *
   * Without it Next walks up, finds the product's lockfile, decides the
   * repository root is the workspace root — and then compiles the *product's*
   * `middleware.ts`, whose `@/core/...` imports do not exist here. It fails
   * with a module-not-found error naming a file this application has never
   * heard of, which is a confusing five minutes.
   */
  turbopack: { root: import.meta.dirname },
  outputFileTracingRoot: import.meta.dirname,

  // Everything here is content we wrote, so every page can be static. No
  // database, no session, nothing per-request.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
