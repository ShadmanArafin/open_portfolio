import { expect, test } from '@playwright/test';

/**
 * The instance from a visitor's point of view, plus the guards from a
 * stranger's. Deliberately free of any seed-data assumptions: a fresh install
 * redirects `/` to `/setup`, a claimed one renders the site — both are fine,
 * so the test accepts either and pins only what must never change.
 */

test('health answers with a version and no error text', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(typeof body.version).toBe('string');
  expect(body).not.toHaveProperty('detail');
  expect(body).not.toHaveProperty('error');
  expect(res.headers()['cache-control'] || '').toContain('no-store');
});

test('owner-only APIs refuse strangers', async ({ request }) => {
  for (const path of ['/api/admin/backup', '/api/admin/storage', '/api/admin/messages']) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(401);
  }
});

test('security headers ride the public site', async ({ request }) => {
  const res = await request.get('/');
  const csp = res.headers()['content-security-policy'] || '';
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(res.headers()['strict-transport-security'] || '').toContain('max-age=');
  expect(res.headers()['x-request-id'] || '').not.toBe('');
});

test('the public site renders without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  // Fresh installs land on /setup (claim), claimed ones on the site itself.
  await expect(page).toHaveURL(/\/(setup)?$/);
  expect(errors).toEqual([]);
});

test('a page with a form logs nothing red in the console', async ({ page }) => {
  // Console errors, not only uncaught exceptions: a failed request is logged
  // as one. The spam-protection key lookup answered 404 whenever Turnstile was
  // off — most sites — and every visitor's console showed it.
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const response = await page.goto('/contact', { waitUntil: 'networkidle' });
  if (response?.status() === 404) return; // a site without the contact page
  expect(errors).toEqual([]);
});
