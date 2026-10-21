import { expect, type Page } from '@playwright/test';

/**
 * Claims the fresh site the test server boots with, or signs in to it when an
 * earlier spec already did — so each spec can run alone or after the others.
 */

const OWNER = {
  email: 'e2e-owner@example.test',
  passphrase: 'quiet harbour lantern violet seventy-two',
};

export async function signIn(page: Page, baseURL: string) {
  const headers = { origin: baseURL, 'content-type': 'application/json' };
  const eligibility = await (await page.request.get('/api/setup/claim')).json();
  const response = eligibility.allowed
    ? await page.request.post('/api/setup/claim', {
        headers,
        data: { ...OWNER, setupToken: process.env.OPB_SETUP_TOKEN },
      })
    : await page.request.post('/api/auth/login', { headers, data: OWNER });
  expect(response.status(), await response.text()).toBe(200);

  // The welcome wizard is its own journey; this one starts after it.
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('opb.welcome.dismissed', '1');
    } catch {
      // A private window: the wizard redirect would show, and fail loudly.
    }
  });
}
