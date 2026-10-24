import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
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

/*
 * The server this boots is a fresh install every run: an empty store in a
 * temporary directory, so the golden path really claims a site rather than
 * inheriting whatever `.opb/` holds. Set here, before workers start, so the
 * spec reads the same setup token the server was given.
 */
process.env.OPB_SETUP_TOKEN ??= 'e2e setup phrase that nobody else has read';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  // One server, one store: specs claim, publish and restore the same site, so
  // parallel files race each other (two claims, or a backup taken mid-publish).
  // Serial costs nothing here - the run is startup-bound - and makes CI honest.
  workers: 1,
  reporter: [['list']],
  // A failure in CI leaves a trace to open, not just a line of text.
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run start -- -p ${PORT}`,
        url: `http://127.0.0.1:${PORT}/api/health`,
        reuseExistingServer: true,
        timeout: 90_000,
        env: {
          OPB_DATA_DIR: mkdtempSync(path.join(tmpdir(), 'opb-e2e-')),
          OPB_SETUP_TOKEN: process.env.OPB_SETUP_TOKEN,
          // Plain http on 127.0.0.1: the documented case for a non-__Host-
          // session cookie (core/auth/constants.ts).
          OPB_ALLOW_INSECURE_COOKIES: '1',
          // A deployed site knows its address; structured data needs it.
          OPB_SITE_URL: baseURL,
        },
      },
});
