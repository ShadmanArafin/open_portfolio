import path from 'node:path';
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
   * Two roots, and they are deliberately different.
   *
   * `turbopack.root` stays at `site/`. Without it Next walks up, finds the
   * product's lockfile, decides the repository root is the workspace root, and
   * compiles the *product's* `middleware.ts` — which fails with a
   * module-not-found error naming a file this application has never heard of.
   *
   * `outputFileTracingRoot` is the repository root, and that is what lets the
   * demo import the product's real theme presets, primitives and block
   * definitions from `../core`. With it left at `site/`, every relative import
   * that climbs out of this directory resolves to nothing — the file is plainly
   * there on disk and the bundler will not look at it.
   *
   * Getting either one wrong produces a confusing five minutes, so they are
   * written down rather than left to be rediscovered.
   */
  turbopack: { root: import.meta.dirname },
  outputFileTracingRoot: path.join(import.meta.dirname, '..'),

  // Everything here is content we wrote, so every page can be static. No
  // database, no session, nothing per-request.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
