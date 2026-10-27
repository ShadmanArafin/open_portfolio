import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Dead addresses answer 404, not a 200 wearing a 404's face.
 *
 * This guards a bug that was live site-wide: `app/(site)/loading.tsx` made
 * every route in the group stream a 200 shell the moment its segment was
 * entered, before the page below had run. Every `notFound()` then rendered
 * the branded 404 body — with an HTTP 200. Crawlers and analytics treated
 * dead addresses as live pages. Verified live and in production before the
 * fix: `/no-such-route`, `/share/<bad-token>` and a minimal route whose only
 * statement was `notFound()` all returned 200.
 *
 * A `loading.tsx` boundary can only fail this way *above* the check that
 * decides whether the address exists. So the invariant is structural:
 * skeletons live below each segment's existence gate (`layout.tsx` beside
 * them), never at the group root. Dynamic routes keep `partialPrefetching: false`
 * in `next.config.ts` so Next.js does not stream a 200 shell before the gate
 * runs, and each dynamic route refuses a missing record from `generateMetadata`
 * and its existence gate. A behavioural test would need to boot the built
 * server; this fails loudly the moment any half of the guard is removed,
 * which is the regression to worry about (see `scripts/smoke.mjs` and
 * `e2e/smoke.spec.ts` for the HTTP check).
 *
 * Do not "fix" this test by deleting it. If a group-wide skeleton is ever
 * reintroduced, its status semantics need rethinking first.
 */

const ROOT = join(import.meta.dirname, '..', '..', '..');
const has = (...parts: string[]) => existsSync(join(ROOT, ...parts));

/**
 * The metadata export, up to the next top-level export. Metadata is the only
 * render-phase hook that runs before the body streams on a full page load.
 */
function metadataOf(...parts: string[]) {
  const source = readFileSync(join(ROOT, ...parts), 'utf8');
  const start = source.indexOf('export async function generateMetadata');
  expect(start, `${parts.join('/')} has no generateMetadata`).toBeGreaterThan(-1);
  const block = source.slice(start + 1);
  const end = block.indexOf('\nexport ');
  return end === -1 ? block : block.slice(0, end);
}

describe('not-found status on the public site', () => {
  it('disables partialPrefetching so dynamic routes do not stream a 200 shell', () => {
    const config = readFileSync(join(ROOT, 'next.config.ts'), 'utf8');
    expect(
      config,
      'partialPrefetching: true flushes a 200 App Shell before notFound() can run on dynamic routes - ' +
        'keep partialPrefetching: false in next.config.ts.'
    ).toMatch(/partialPrefetching:\s*false/);
  });

  it.each([
    ['a built page', ['app', '(site)', '[...slug]', 'page.tsx']],
    ['a project', ['app', '(site)', 'work', '[slug]', 'page.tsx']],
    ['a writing entry', ['app', '(site)', 'writing', '[slug]', 'page.tsx']],
    ['a writing tag', ['app', '(site)', 'writing', 'tag', '[tag]', 'page.tsx']],
    ['a share link', ['app', '(site)', 'share', '[token]', 'page.tsx']],
    ['a writing page', ['app', '(site)', 'writing', 'page.tsx']],
  ])('refuses a missing record in %s metadata', (_label, parts) => {
    expect(metadataOf(...parts), 'metadata must call notFound() for a dead address').toContain(
      'notFound()'
    );
  });

  it('has no loading boundary above the existence gates', () => {
    expect(
      has('app', '(site)', 'loading.tsx'),
      'app/(site)/loading.tsx streams a 200 shell above every page, so no notFound() can set 404. ' +
        'Skeletons belong below a gate — see the segments below.'
    ).toBe(false);
  });

  it.each([
    ['a built page', ['app', '(site)', '[...slug]']],
    ['a project', ['app', '(site)', 'work', '[slug]']],
    ['a writing entry', ['app', '(site)', 'writing', '[slug]']],
  ])('keeps the skeleton below the gate for %s', (_label, parts) => {
    const gate = readFileSync(join(ROOT, ...parts, 'layout.tsx'), 'utf8');
    expect(gate, 'the gate layout must refuse missing records itself').toContain('notFound()');
    expect(has(...parts, 'loading.tsx'), 'the skeleton moved below the gate').toBe(true);
  });

  it('leaves the share link page unshielded', () => {
    // No skeleton there at all: its check runs in the page, and nothing may
    // stream before it — a `loading.tsx` would spend the 404 before the token
    // is ever looked at.
    expect(has('app', '(site)', 'share', '[token]', 'loading.tsx')).toBe(false);
  });
});
