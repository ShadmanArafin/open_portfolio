import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Analytics as product, not env vars.
 *
 * `fetch` is stubbed wherever Cloudflare-style reachability is asserted;
 * storage isolation follows the otp.test.ts pattern so vault reads see a
 * genuinely empty store rather than this checkout.
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
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-analytics-'));
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

describe('umami definition', () => {
  it('accepts a host and a website id', async () => {
    const { umamiSchema, umamiScriptSrc } = await import('../definitions/umami');
    expect(umamiSchema.safeParse({ host: 'https://a.example.com', websiteId: 'w' }).success).toBe(
      true
    );
    expect(umamiSchema.safeParse({ host: '', websiteId: 'w' }).success).toBe(false);
    expect(umamiScriptSrc('https://a.example.com/')).toBe('https://a.example.com/script.js');
  });

  it('is registered with a test that distinguishes reachable from not', async () => {
    const { getIntegration } = await import('../registry');
    const def = getIntegration('umami');
    expect(def?.category).toBe('analytics');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true }))
    );
    expect((await def!.test({ host: 'https://a.example.com', websiteId: 'w' } as never)).ok).toBe(
      true
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down');
      })
    );
    expect((await def!.test({ host: 'https://a.example.com', websiteId: 'w' } as never)).ok).toBe(
      false
    );
  });
});

describe('plausible definition', () => {
  it('accepts a host and a domain, and derives the events script', async () => {
    const { plausibleSchema, plausibleScriptSrc } = await import('../definitions/plausible');
    expect(
      plausibleSchema.safeParse({ host: 'https://p.example.com', domain: 'example.com' }).success
    ).toBe(true);
    expect(plausibleScriptSrc('https://p.example.com/')).toBe(
      'https://p.example.com/js/script.tagged-events.js'
    );
  });

  it('is registered', async () => {
    const { getIntegration } = await import('../registry');
    expect(getIntegration('plausible')?.category).toBe('analytics');
  });
});

describe('resolveAnalytics precedence', () => {
  it('is none with nothing configured', async () => {
    clearAnalyticsEnv();
    const { resolveAnalytics } = await import('../analytics');
    expect(await resolveAnalytics()).toMatchObject({ provider: 'none', scriptSrc: '' });
  });

  it('prefers OPB_* env over everything', async () => {
    clearAnalyticsEnv();
    process.env.OPB_ANALYTICS_PROVIDER = 'umami';
    process.env.OPB_ANALYTICS_HOST = 'https://env.example.com';
    process.env.OPB_ANALYTICS_WEBSITE_ID = 'env-id';
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'plausible';
    const { resolveAnalytics } = await import('../analytics');
    expect(await resolveAnalytics()).toMatchObject({
      provider: 'umami',
      scriptSrc: 'https://env.example.com/script.js',
      websiteId: 'env-id',
    });
  });

  it('reads the vault when the env is silent', async () => {
    clearAnalyticsEnv();
    const { writeConfig } = await import('../vault');
    await writeConfig('umami', { host: 'https://vault.example.com', websiteId: 'vid' }, []);
    const { resolveAnalytics } = await import('../analytics');
    expect(await resolveAnalytics()).toMatchObject({
      provider: 'umami',
      websiteId: 'vid',
      scriptSrc: 'https://vault.example.com/script.js',
    });
    await writeConfig('umami', { host: '', websiteId: '' }, []);
  });

  it('falls back to legacy build-time variables', async () => {
    clearAnalyticsEnv();
    const { writeConfig } = await import('../vault');
    await writeConfig('umami', { host: '', websiteId: '' }, []);
    await writeConfig('plausible', { host: '', domain: '' }, []);
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'plausible';
    process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN = 'legacy.example.com';
    process.env.NEXT_PUBLIC_ANALYTICS_SRC = 'https://legacy.example.com/js/script.js';
    const { resolveAnalytics } = await import('../analytics');
    expect(await resolveAnalytics()).toMatchObject({
      provider: 'plausible',
      domain: 'legacy.example.com',
    });
  });

  it('stays none when umami lacks its website id', async () => {
    clearAnalyticsEnv();
    const { writeConfig } = await import('../vault');
    await writeConfig('umami', { host: '', websiteId: '' }, []);
    process.env.OPB_ANALYTICS_PROVIDER = 'umami';
    process.env.OPB_ANALYTICS_HOST = 'https://env.example.com';
    const { resolveAnalytics } = await import('../analytics');
    expect((await resolveAnalytics()).provider).toBe('none');
  });
});
