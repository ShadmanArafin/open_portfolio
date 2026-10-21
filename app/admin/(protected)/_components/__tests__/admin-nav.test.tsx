// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import axe from 'axe-core';
import { AdminNav } from '../admin-nav';
import { ADMIN_SECTIONS } from '../sections';

/**
 * The admin's section nav, checked where it can be checked without a browser.
 *
 * The phone strategy is three claims: the 25 sections do not sit in the header
 * as a wall, the control that hides them says so (`aria-expanded`, with a
 * target it can actually hit), and the section you are in is marked. The first
 * is layout — it was measured in a real browser at 375px, see the commit — and
 * the other two are asserted here.
 */
const currentPath = vi.hoisted(() => ({ value: '/admin' }));
vi.mock('next/navigation', () => ({ usePathname: () => currentPath.value }));

function renderNav(pathname = '/admin'): HTMLElement {
  currentPath.value = pathname;
  // Inside a `<header>` because that is where the admin layout puts it — axe's
  // landmark rules want to see the same neighbourhood the product renders.
  document.body.innerHTML = `<header>${renderToStaticMarkup(
    <AdminNav sections={ADMIN_SECTIONS} />
  )}</header>`;
  return document.body;
}

describe('the admin section nav', () => {
  it('links every section, in order, and nothing else', () => {
    const links = [...renderNav().querySelectorAll('nav a')];
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      ADMIN_SECTIONS.map((section) => section.href)
    );
  });

  it('starts collapsed behind a control that says it is collapsed', () => {
    const body = renderNav();
    const button = body.querySelector('button');
    expect(button?.getAttribute('aria-expanded')).toBe('false');
    // aria-controls has to name an element that is actually there, or the
    // attribute is decoration.
    const list = body.querySelector(`#${button?.getAttribute('aria-controls')}`);
    expect(list?.querySelectorAll('ul').length).toBeGreaterThan(1);
    expect(list?.className).toContain('hidden');
  });

  it('marks the section you are in, and only that one', () => {
    const onWriting = [...renderNav('/admin/writing').querySelectorAll('[aria-current="page"]')];
    expect(onWriting.map((element) => element.getAttribute('href'))).toEqual(['/admin/writing']);

    // `/admin` is a prefix of every screen; matching it as one would light up
    // Dashboard everywhere.
    const onDashboard = [...renderNav('/admin').querySelectorAll('[aria-current="page"]')];
    expect(onDashboard.map((element) => element.getAttribute('href'))).toEqual(['/admin']);
  });

  it('gives every link a phone-sized target', () => {
    const links = [...renderNav().querySelectorAll('nav a')];
    expect(links.length).toBe(ADMIN_SECTIONS.length);
    expect(links.every((link) => link.className.includes('min-h-[44px]'))).toBe(true);
  });

  it('points every section at a page that exists', () => {
    const missing = ADMIN_SECTIONS.filter((section) => {
      const relative = section.href === '/admin' ? '' : section.href.slice('/admin'.length);
      return !existsSync(
        path.join(process.cwd(), 'app', 'admin', '(protected)', relative, 'page.tsx')
      );
    }).map((section) => section.href);
    expect(missing).toEqual([]);
  });

  it('has no axe violations', async () => {
    renderNav();
    const results = await axe.run(document.body, {
      // Static markup carries no stylesheets, so contrast is inconclusive here;
      // it is enforced where the colours live (see the blocks a11y seed).
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(
      results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)
    ).toEqual([]);
  });

  it('groups the sections under labels, each group its own named list', () => {
    const lists = [...renderNav().querySelectorAll('#admin-sections ul')];
    const names = lists
      .map((list) => list.getAttribute('aria-labelledby'))
      .filter(Boolean)
      .map((id) => document.getElementById(id!)?.textContent);
    expect(names).toEqual(['Build', 'Profile', 'Audience', 'Look & reach', 'System']);
  });
});
