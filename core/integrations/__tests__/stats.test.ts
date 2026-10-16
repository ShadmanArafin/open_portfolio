import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * View counts, read live and cached.
 *
 * `fetch` is stubbed throughout: the tests assert shaping and degradation
 * given provider answers, not that any provider answers. Storage isolation
 * follows the otp.test.ts pattern so the no-key paths read a genuinely empty
 * store rather than this checkout.
 */

const originalCwd = process.cwd();
const originalEnv = { ...process.env };
let workDir: string;

const ANALYTICS_VARS = [
  'OPB_ANALYTICS_PROVIDER',
  'OPB_ANALYTICS_HOST',
  'OPB_UMAMI_HOST',
  'OPB_PLAUSIBLE_HOST',
  'OPB_ANALYTICS_WEBSITE_ID',
  'OPB_ANALYTICS_DOMAIN',
  'OPB_ANALYTICS_SCRIPT_SRC',
  'OPB_ANALYTICS_SHARE_URL',
  'OPB_UMAMI_API_KEY',
  'OPB_PLAUSIBLE_API_KEY',
  'NEXT_PUBLIC_ANALYTICS_PROVIDER',
  'NEXT_PUBLIC_ANALYTICS_DOMAIN',
  'NEXT_PUBLIC_ANALYTICS_SRC',
  'NEXT_PUBLIC_ANALYTICS_WEBSITE_ID',
  'NEXT_PUBLIC_ANALYTICS_SHARE_URL',
];

function clearAnalyticsEnv() {
  for (const key of ANALYTICS_VARS) delete process.env[key];
}

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-stats-'));
  process.chdir(workDir);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await rm(workDir, { recursive: true, force: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...originalEnv };
  clearAnalyticsEnv();
});

async function summary() {
  const { resetAudienceSummary, audienceSummary } = await import('../stats');
  resetAudienceSummary();
  return audienceSummary();
}

describe('audienceSummary', () => {
  it('is null with nothing configured', async () => {
    clearAnalyticsEnv();
    expect(await summary()).toBeNull();
  });

  it('is null without an API key even when collection is configured', async () => {
    clearAnalyticsEnv();
    process.env.OPB_ANALYTICS_PROVIDER = 'umami';
    process.env.OPB_ANALYTICS_HOST = 'https://a.example.com';
    process.env.OPB_ANALYTICS_WEBSITE_ID = 'w';
    expect(await summary()).toBeNull();
  });

  it('reads Umami totals and top pages', async () => {
    clearAnalyticsEnv();
    process.env.OPB_ANALYTICS_PROVIDER = 'umami';
    process.env.OPB_ANALYTICS_HOST = 'https://a.example.com';
    process.env.OPB_ANALYTICS_WEBSITE_ID = 'w';
    process.env.OPB_UMAMI_API_KEY = 'k';
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        ok: true,
        json: async () =>
          String(url).includes('/metrics')
            ? [
                { x: '/work', y: 12 },
                { x: '/about', y: 4 },
              ]
            : { pageviews: { value: 40 }, visitors: { value: 25 } },
      }))
    );
    expect(await summary()).toEqual({
      provider: 'umami',
      visitors30d: 25,
      pageviews30d: 40,
      topPages: [
        { path: '/work', views: 12 },
        { path: '/about', views: 4 },
      ],
    });
  });

  it('reads Plausible totals and top pages', async () => {
    clearAnalyticsEnv();
    process.env.OPB_ANALYTICS_PROVIDER = 'plausible';
    process.env.OPB_ANALYTICS_HOST = 'https://p.example.com';
    process.env.OPB_ANALYTICS_DOMAIN = 'example.com';
    process.env.OPB_PLAUSIBLE_API_KEY = 'k';
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: { body?: string }) => {
        const body = JSON.parse(String(init?.body ?? '{}'));
        return {
          ok: true,
          json: async () =>
            Array.isArray(body.dimensions)
              ? { results: [{ dimensions: ['/work'], metrics: [9] }] }
              : { results: [{ metrics: [7, 11] }] },
        };
      })
    );
    expect(await summary()).toEqual({
      provider: 'plausible',
      visitors30d: 7,
      pageviews30d: 11,
      topPages: [{ path: '/work', views: 9 }],
    });
  });

  it('is null when the provider refuses', async () => {
    clearAnalyticsEnv();
    process.env.OPB_ANALYTICS_PROVIDER = 'plausible';
    process.env.OPB_ANALYTICS_HOST = 'https://p.example.com';
    process.env.OPB_ANALYTICS_DOMAIN = 'example.com';
    process.env.OPB_PLAUSIBLE_API_KEY = 'wrong';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 401 }))
    );
    expect(await summary()).toBeNull();
  });

  it('caches for five minutes', async () => {
    clearAnalyticsEnv();
    process.env.OPB_ANALYTICS_PROVIDER = 'umami';
    process.env.OPB_ANALYTICS_HOST = 'https://a.example.com';
    process.env.OPB_ANALYTICS_WEBSITE_ID = 'w';
    process.env.OPB_UMAMI_API_KEY = 'k';
    const spy = vi.fn(async () => ({
      ok: true,
      json: async () => ({ pageviews: { value: 1 }, visitors: { value: 1 } }),
    }));
    vi.stubGlobal('fetch', spy);
    const { resetAudienceSummary, audienceSummary } = await import('../stats');
    resetAudienceSummary();
    await audienceSummary();
    await audienceSummary();
    // One totals call plus one metrics call, then silence: the second read
    // came from the cache.
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
