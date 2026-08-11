import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Admin links, against the router they run inside.
 *
 * The admin is a React Router app mounted at `basename="/admin"`, which means a
 * path handed to `<Link>` is resolved *relative to that basename*. Writing
 * `/admin/projects` therefore produces `/admin/admin/projects`.
 *
 * Every link in the sidebar was doing this, and every one of them was broken.
 * Nothing failed: the markup is valid, the URLs look right in the source, and
 * the page they lead to renders a redirect rather than an error. It took
 * loading the admin in a browser and reading the hrefs to see it — which is
 * exactly why it is worth a test that reads them instead.
 *
 * The same mistake makes selection state permanently false: `location.pathname`
 * inside a basename router has the prefix stripped, so it can never match a
 * string that includes it.
 */

const ROOT = join(import.meta.dirname, '..', '..', '..');

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), 'utf8');
}

describe('the admin sidebar', () => {
  const source = read(join('src', 'admin', 'components', 'AdminSidebar.tsx'));

  it('declares its paths relative to the router basename', () => {
    const absolute = [...source.matchAll(/path: '(\/admin[^']*)'/g)].map((m) => m[1]);
    expect(
      absolute,
      'These resolve to /admin/admin/… inside basename="/admin". Drop the prefix.'
    ).toEqual([]);
  });

  it('still has paths to check', () => {
    // Guards against the assertion above passing because the shape changed.
    expect([...source.matchAll(/path: '\/[^']*'/g)].length).toBeGreaterThan(10);
  });
});

describe('admin screens that link with the router', () => {
  const files = [
    join('src', 'admin', 'pages', 'AdminDashboard.tsx'),
    join('src', 'admin', 'components', 'AdminSidebar.tsx'),
  ];

  it.each(files)('%s passes no /admin-prefixed path to a router Link', (file) => {
    const source = read(file);

    // Only `as={Link}` / `<Link` usages matter. A plain anchor with
    // href="/admin/reset" is a full navigation and entirely correct — the two
    // look identical in a grep, which is half of why this bug survived.
    const routerLinks = [...source.matchAll(/as=\{Link as never\}[\s\S]{0,200}?href="([^"]+)"/g)];
    const offenders = routerLinks.map((m) => m[1]).filter((href) => href.startsWith('/admin'));

    expect(offenders).toEqual([]);
  });
});
