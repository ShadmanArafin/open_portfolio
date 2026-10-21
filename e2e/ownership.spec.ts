import { expect, test } from '@playwright/test';
import { signIn } from './owner';

/**
 * The ways out, and the pages that only exist to be read by someone else:
 * the whole-site backup carries its pictures there and back, the static copy
 * is a folder of HTML, and /cv, /llms.txt and the structured data answer a
 * stranger.
 */

test.describe.configure({ mode: 'serial' });

// A 1×1 PNG: real bytes, so the upload passes the same checks a photo does.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

test('the full backup carries a picture out and back in', async ({ page, baseURL }) => {
  await signIn(page, baseURL!);
  const origin = { origin: baseURL! };

  const upload = await page.request.post('/api/admin/media', {
    headers: origin,
    multipart: { file: { name: 'dot.png', mimeType: 'image/png', buffer: PNG } },
  });
  expect(upload.status(), await upload.text()).toBe(200);
  const { media } = await upload.json();

  const backup = await page.request.get('/api/admin/backup?format=zip');
  expect(backup.status()).toBe(200);
  expect(backup.headers()['content-type']).toBe('application/zip');
  const archive = await backup.body();
  expect(archive.subarray(0, 2).toString()).toBe('PK');
  expect(archive.includes(`media/${media.key}`)).toBe(true);

  const removed = await page.request.delete(
    `/api/admin/media?key=${encodeURIComponent(media.key)}`,
    { headers: origin }
  );
  expect(removed.status()).toBe(200);
  expect((await page.request.get(media.url)).status()).toBe(404);

  const restore = await page.request.post('/api/admin/backup', {
    headers: { ...origin, 'content-type': 'application/zip' },
    data: archive,
  });
  expect(restore.status(), await restore.text()).toBe(200);
  const result = await restore.json();
  expect(result.restored.filesRestored).toBeGreaterThanOrEqual(1);
  expect(result.restored.filesRefused).toBe(0);

  const back = await page.request.get(media.url);
  expect(back.status()).toBe(200);
  expect(Buffer.compare(await back.body(), PNG)).toBe(0);
});

test('the static copy is the site as plain files', async ({ page, baseURL }) => {
  await signIn(page, baseURL!);
  const response = await page.request.get('/api/admin/export-static', { timeout: 120_000 });
  expect(response.status(), await response.text()).toBe(200);
  const archive = await response.body();
  expect(archive.subarray(0, 2).toString()).toBe('PK');
  for (const name of ['index.html', 'about/index.html', 'cv/index.html', 'robots.txt']) {
    expect(archive.includes(name), name).toBe(true);
  }
  expect(archive.includes('_next/static/')).toBe(true);
});

test('a stranger cannot export the site', async ({ playwright, baseURL }) => {
  const visitor = await playwright.request.newContext({ baseURL });
  expect((await visitor.get('/api/admin/export-static')).status()).toBe(401);
  await visitor.dispose();
});

test('/cv, /llms.txt and the structured data answer a visitor', async ({ page }) => {
  await page.goto('/cv');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: /print/i })).toBeVisible();

  const llms = await page.request.get('/llms.txt');
  expect(llms.status()).toBe(200);
  expect(await llms.text()).toMatch(/^# /);

  await page.goto('/');
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = blocks.map((text) => JSON.parse(text)['@type']);
  expect(types).toContain('WebSite');
});
