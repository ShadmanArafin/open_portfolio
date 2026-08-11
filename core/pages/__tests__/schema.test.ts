import { describe, expect, it } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  HOME_SLUG,
  MAX_SLUG_SEGMENTS,
  RESERVED_TOP_LEVEL,
  checkSlug,
  createHomePage,
  createPage,
  isHomePage,
  normaliseSlug,
  pageSchema,
  segmentsToSlug,
  slugToSegments,
} from '../schema';

const APP_ROOT = join(import.meta.dirname, '..', '..', '..', 'app');

describe('normaliseSlug', () => {
  it('turns a title into an address', () => {
    expect(normaliseSlug('My Photography Work')).toBe('my-photography-work');
  });

  it('keeps accented letters legible instead of dropping them', () => {
    // "caf" would be a quietly wrong answer, and the kind nobody reports.
    expect(normaliseSlug('Café Menu')).toBe('cafe-menu');
  });

  it('collapses punctuation, repeats and stray separators', () => {
    expect(normaliseSlug('  Hello -- World!! ')).toBe('hello-world');
    expect(normaliseSlug('a//b')).toBe('a/b');
    expect(normaliseSlug('/leading/and/trailing/')).toBe('leading/and/trailing');
    expect(normaliseSlug('under_scores')).toBe('under-scores');
  });

  it('is idempotent', () => {
    // The editor normalises on every keystroke; a function that changed its own
    // output would fight the person typing.
    const once = normaliseSlug('Some Odd — Title!');
    expect(normaliseSlug(once)).toBe(once);
  });

  it('returns empty for input with nothing usable in it', () => {
    expect(normaliseSlug('!!!')).toBe('');
    expect(normaliseSlug('   ')).toBe('');
  });
});

describe('checkSlug', () => {
  it('accepts an ordinary address', () => {
    expect(checkSlug('my-work')).toBeNull();
    expect(checkSlug('services/branding')).toBeNull();
  });

  it('refuses an address that a real route already serves', () => {
    // The whole reason this exists: static routes win, so a page here would
    // save, appear in the admin, and never once load.
    const problem = checkSlug('work');
    expect(problem?.blocking).toBe(true);
    expect(problem?.message).toContain('already used by this site');
    expect(problem?.message).toContain('my-work');
  });

  it('refuses a reserved first segment even when nested', () => {
    expect(checkSlug('admin/settings')?.blocking).toBe(true);
  });

  it('allows a reserved word that is not the first segment', () => {
    expect(checkSlug('studio/about')).toBeNull();
  });

  it('suggests the corrected form rather than just refusing', () => {
    expect(checkSlug('My Page')?.message).toContain('"my-page"');
  });

  it('refuses a duplicate', () => {
    expect(checkSlug('about-us', { existingSlugs: ['about-us'] })?.blocking).toBe(true);
  });

  it('refuses an empty address and one that is too deep', () => {
    expect(checkSlug('')?.blocking).toBe(true);
    expect(checkSlug('a/b/c/d')?.message).toContain(`${MAX_SLUG_SEGMENTS} levels`);
  });
});

describe('createPage', () => {
  it('produces a page that validates and is not live yet', () => {
    const page = createPage({ title: 'About Us' });
    expect(pageSchema.safeParse(page).success).toBe(true);
    expect(page.slug).toBe('about-us');
    // A new page must never be published by the act of creating it.
    expect(page.status).toBe('draft');
    expect(page.revision).toBe(1);
    expect(page.blocks).toEqual([]);
  });

  it('still yields a usable address when the title has nothing to work with', () => {
    expect(createPage({ title: '???' }).slug).not.toBe('');
  });
});

describe('slug segments', () => {
  it('round-trips through the shape a catch-all route gives', () => {
    expect(segmentsToSlug(slugToSegments('services/branding'))).toBe('services/branding');
    expect(segmentsToSlug(undefined)).toBe('');
  });
});

/**
 * The reserved list against the routes that actually exist.
 *
 * This is the test that keeps the list honest. Adding `app/(site)/blog` in a
 * later phase without reserving `blog` would silently shadow any page somebody
 * had already made at that address — and nothing else in the system would
 * notice, because both halves are behaving correctly.
 */
describe('reserved slugs match the real routes', () => {
  /** Static path segments, ignoring route groups, dynamic and private folders. */
  function routeSegments(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (!statSync(full).isDirectory()) continue;

      if (entry.startsWith('(')) {
        // A route group contributes nothing to the URL; look inside it.
        out.push(...routeSegments(full));
        continue;
      }
      if (entry.startsWith('[') || entry.startsWith('_') || entry.startsWith('@')) continue;
      out.push(entry);
    }
    return out;
  }

  it('reserves every top-level route directory', () => {
    for (const segment of routeSegments(APP_ROOT)) {
      expect(
        RESERVED_TOP_LEVEL,
        `app/${segment} is a real route, so a page with the slug "${segment}" would never load. ` +
          'Add it to RESERVED_TOP_LEVEL.'
      ).toContain(segment);
    }
  });

  it('reserves the metadata files served from the app root', () => {
    const metadataRoutes: Record<string, string> = {
      'sitemap.ts': 'sitemap.xml',
      'robots.ts': 'robots.txt',
    };
    for (const [file, path] of Object.entries(metadataRoutes)) {
      const exists = readdirSync(APP_ROOT).includes(file);
      if (exists) expect(RESERVED_TOP_LEVEL).toContain(path);
    }
  });

  it('finds routes at all', () => {
    expect(routeSegments(APP_ROOT).length).toBeGreaterThan(3);
  });
});

describe('the home page record', () => {
  it('has no address, and that is allowed only for it', () => {
    const home = createHomePage();
    expect(home.slug).toBe(HOME_SLUG);
    expect(isHomePage(home)).toBe(true);

    // An empty slug is refused for every other page...
    expect(checkSlug('')?.blocking).toBe(true);
    // ...and accepted for this one, which has no address to validate.
    expect(checkSlug('', { isHome: true })).toBeNull();
  });

  it('starts as a draft, so building it does not replace a live site', () => {
    expect(createHomePage().status).toBe('draft');
    expect(createHomePage().blocks).toEqual([]);
  });

  it('validates as a page like any other', () => {
    expect(pageSchema.safeParse({ ...createHomePage(), slug: 'x' }).success).toBe(true);
  });
});
