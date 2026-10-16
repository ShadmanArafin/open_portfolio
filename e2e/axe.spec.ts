import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * The axe matrix, phase two: real pages in a real browser, with stylesheets,
 * so color-contrast runs for real (the static seed in
 * `core/blocks/__tests__/a11y.test.tsx` disables it — static markup has no
 * CSS to compute against).
 *
 * Routes × {dark, light}: the theme is seeded through the same localStorage
 * key the anti-flash script reads, so each run sees the mode a visitor would.
 * Routes that legitimately 404 in seed state (writing is off by default) get
 * the boundary assertion instead: our own not-found page carries exactly one
 * h1, and that is what the test pins rather than Next's error chrome, which
 * is not ours to fix. The matrix grows by adding routes here, not by
 * complicating this file.
 */

const PAGES = ['/', '/work', '/contact', '/writing'];
const MODES = ['dark', 'light'] as const;

for (const mode of MODES) {
  for (const route of PAGES) {
    test(`${route} [${mode}] has no axe violations`, async ({ page }) => {
      await page.addInitScript((value) => {
        try {
          window.localStorage.setItem('opb.theme', value);
        } catch {
          // Private browsing: the default theme stands in.
        }
      }, mode);
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      if (response?.status() === 404) {
        await expect(page.locator('h1')).toHaveCount(1);
        return;
      }
      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)
      ).toEqual([]);
    });
  }
}
