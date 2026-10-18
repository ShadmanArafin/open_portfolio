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
 * them), never at the group root. A behavioural test would need to boot the
 * built server; this fails loudly the moment the boundary is hoisted back
 * above a gate, which is the regression to worry about (see
 * `scripts/smoke.mjs` for the HTTP-level check).
 *
 * Do not "fix" this test by deleting it. If a group-wide skeleton is ever
 * reintroduced, its status semantics need rethinking first.
 */

const ROOT = join(import.meta.dirname, '..', '..', '..');
const has = (...parts: string[]) => existsSync(join(ROOT, ...parts));

describe('not-found status on the public site', () => {
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
