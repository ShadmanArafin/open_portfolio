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
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

for (const mode of MODES) {
  for (const viewport of VIEWPORTS) {
    for (const route of PAGES) {
      test(`${route} [${mode} · ${viewport.name}] has no axe violations`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.addInitScript((value) => {
          try {
            window.localStorage.setItem('opb.theme', value);
          } catch {
            // Private browsing: the default theme stands in.
          }
        }, mode);
        // Entrance animations fade text in from opacity 0, and axe measures
        // contrast on whatever is painted at that instant — so without this the
        // matrix failed a different page on every run, all of them mid-fade.
        // `Reveal` honours reduced motion, which leaves the settled page.
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
        if (response?.status() === 404) {
          await expect(page.locator('h1')).toHaveCount(1);
          return;
        }
        // Sections that fade in when scrolled to are invisible until then, and
        // axe would measure their contrast at opacity 0. Scroll the page the way
        // a visitor does, then give the last fade time to finish.
        await page.evaluate(async () => {
          for (let y = 0; y <= document.body.scrollHeight; y += 400) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 60));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(1200);
        const results = await new AxeBuilder({ page }).analyze();
        expect(
          results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)
        ).toEqual([]);
      });
    }
  }
}
