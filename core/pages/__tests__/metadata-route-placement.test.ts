import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * A card URL that Next quietly renames.
 *
 * `opengraph-image.tsx` inside a route group does not serve the path it looks
 * like it serves. `getMetadataRouteSuffix` in
 * `next/dist/lib/metadata/get-metadata-route.js` hashes the parent path for any
 * metadata route under a `(group)` or `@parallel` segment, so
 * `app/(site)/writing/[slug]/opengraph-image.tsx` really answered
 * `/writing/<slug>/opengraph-image-cvh5yn` — while `buildMetadata` and the
 * sitemap kept advertising the clean `/writing/<slug>/opengraph-image`, which
 * 404'd. Measured live before the move: 200 on the suffixed path, 404 on the
 * clean one. Server-rendered pages looked perfect either way.
 *
 * Next's own injected tags know about the suffix, so a group-scoped `icon.tsx`
 * is fine. The trap is only for routes we name by hand, which is every
 * `opengraph-image` here: `buildMetadata` builds those URLs itself. Hence the
 * rule — those files live outside groups, and this test says so.
 */

const ROOT = join(import.meta.dirname, '..', '..', '..');
const APP = join(ROOT, 'app');

/** Names Next turns into a URL of their own rather than into page markup. */
const NAMED_BY_HAND = /^(opengraph-image|twitter-image)\.(js|jsx|ts|tsx|png|jpe?g|gif|webp)$/;
const GROUP = /^\(.+\)$/;
const PARALLEL = /^@/;

interface ImageRoute {
  /** Directory segments from `app/` down to the file. */
  segments: string[];
  file: string;
}

function imageRoutes(dir: string, segments: string[] = []): ImageRoute[] {
  const found: ImageRoute[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      found.push(...imageRoutes(join(dir, entry.name), [...segments, entry.name]));
    } else if (NAMED_BY_HAND.test(entry.name)) {
      found.push({ segments, file: entry.name });
    }
  }
  return found;
}

describe('Open Graph image routes we name ourselves', () => {
  it('exist, so the URLs every page advertises have something behind them', () => {
    const routes = imageRoutes(APP);
    // The site-wide card `buildMetadata` falls back to for ordinary pages...
    expect(routes.some((route) => route.segments.length === 0)).toBe(true);
    // ...and the per-entry card, at the path `buildMetadata` builds by hand.
    expect(routes.some((route) => route.segments.join('/') === 'writing/[slug]')).toBe(true);
  });

  it('sit outside route groups, where Next would rename them', () => {
    for (const { segments, file } of imageRoutes(APP)) {
      const enclosing = segments.filter((part) => GROUP.test(part) || PARALLEL.test(part));
      expect(
        enclosing,
        `${relative(ROOT, join(APP, ...segments, file))} sits inside ${enclosing.join(', ')}, ` +
          'so Next serves it under a hashed path while every page advertises the clean one, ' +
          'which then 404s. Move it out of the group — see the header of ' +
          'app/writing/[slug]/opengraph-image.tsx. Nothing on the page looks wrong.'
      ).toEqual([]);
    }
  });
});
