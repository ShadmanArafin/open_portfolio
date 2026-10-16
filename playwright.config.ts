import { defineConfig } from '@playwright/test';

/**
 * End-to-end smoke: the running instance answers, guards hold, and the
 * security headers ride every response.
 *
 * Reuses an already-running server when BASE_URL points at one (local `npm
 * run smoke` flow); otherwise boots the production build on 3106 itself, so
 * CI needs no extra steps beyond `npm ci && npm run build`.
 */
const PORT = 3106;
const baseURL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  reporter: [['list']],
  use: { baseURL },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run start -- -p ${PORT}`,
        url: `http://127.0.0.1:${PORT}/api/health`,
        reuseExistingServer: true,
        timeout: 90_000,
      },
});
