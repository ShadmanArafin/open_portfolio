import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { signIn } from './owner';

/**
 * The one journey the product exists for, end to end: claim a fresh site,
 * change something in the editor, publish, and see a stranger get it.
 *
 * Every step of this already has unit tests. What none of them can catch is
 * the seams between the steps — which is how a brand-new install shipped
 * unable to save anything for two days (the first draft row was written by a
 * client that had been deleted). A test that walks the whole path is the
 * cheapest thing that fails on that class of bug.
 *
 * Runs against a fresh store (see playwright.config.ts). Against a store that
 * is already claimed it signs in with the same details instead, so it can be
 * pointed at a long-running local server too.
 */

test.describe.configure({ mode: 'serial' });

test('claim → edit → publish → a visitor sees it', async ({ page, browser, baseURL }) => {
  await signIn(page, baseURL!);
  const name = `E2E Owner ${Date.now().toString(36)}`;

  await page.goto('/admin/settings');
  const field = page.getByLabel('Full name');
  await expect(field).toBeEditable();
  await field.fill(name);
  await expect(page.getByText('Unsaved changes')).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await expect(page.getByText('Saved to your draft.')).toBeVisible();

  // A stranger, with no session: the draft is not theirs to see yet.
  const visitor = await browser.newContext();
  const before = await (await visitor.request.get('/')).text();
  expect(before).not.toContain(name);

  await page.goto('/admin');
  await page.getByRole('button', { name: 'Publish now' }).click();

  // The claim this product makes: publishing is live at once, no rebuild. The
  // dashboard re-renders after a publish (and drops its note with it), so the
  // visitor's copy is what is checked, not the button's words.
  await expect
    .poll(async () => (await visitor.request.get('/')).text(), { timeout: 15_000 })
    .toContain(name);
  await visitor.close();
});

for (const route of [
  '/admin',
  '/admin/settings',
  '/admin/brands',
  '/admin/pages',
  '/admin/writing',
]) {
  test(`${route} has no axe violations`, async ({ page, baseURL }) => {
    await signIn(page, baseURL!);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    await expect(page.locator('h1').first()).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)
    ).toEqual([]);
  });
}
