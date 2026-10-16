import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Bot protection, without solving anything.
 *
 * `fetch` is stubbed because the tests assert what this code decides given
 * Cloudflare's answers, not that Cloudflare answers. Storage isolation
 * follows the otp.test.ts pattern (throwaway folder, lazy imports) so the
 * unconfigured path reads a genuinely empty store rather than this checkout.
 */
const helper = () => import('@/core/integrations/turnstile');
const definition = () => import('../definitions/turnstile');

const originalCwd = process.cwd();
const originalEnv = { ...process.env };
let workDir: string;

function clearTurnstileEnv() {
  delete process.env.OPB_TURNSTILE_SITE_KEY;
  delete process.env.OPB_TURNSTILE_SECRET_KEY;
}

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-turnstile-'));
  process.chdir(workDir);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await rm(workDir, { recursive: true, force: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...originalEnv };
  clearTurnstileEnv();
});

function stubSiteverify(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => body,
    }))
  );
}

describe('turnstile settings', () => {
  it('accepts a site key and a secret, nothing else', async () => {
    const { turnstileSchema: schema } = await definition();
    expect(schema.safeParse({ siteKey: '0x4AAAA', secret: 's3cret' }).success).toBe(true);
    expect(schema.safeParse({ siteKey: '', secret: 's3cret' }).success).toBe(false);
    expect(schema.safeParse({ siteKey: '0x4AAAA', secret: '' }).success).toBe(false);
    expect(schema.safeParse({}).success).toBe(false);
  });
});

describe('the Test button', () => {
  it('passes when Cloudflare answers anything but invalid-secret', async () => {
    stubSiteverify({ success: false, 'error-codes': ['invalid-input-response'] });
    const { getIntegration } = await import('../registry');
    const def = getIntegration('turnstile');
    expect(def).toBeDefined();
    const result = await def!.test({ siteKey: '0x4AAAA', secret: 's3cret' } as never);
    expect(result.ok).toBe(true);
  });

  it('fails plainly when the secret is rejected', async () => {
    stubSiteverify({ success: false, 'error-codes': ['invalid-input-secret'] });
    const { getIntegration } = await import('../registry');
    const result = await getIntegration('turnstile')!.test({
      siteKey: '0x4AAAA',
      secret: 'wrong',
    } as never);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/secret/i);
  });

  it('fails plainly when Cloudflare cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down');
      })
    );
    const { getIntegration } = await import('../registry');
    const result = await getIntegration('turnstile')!.test({
      siteKey: '0x4AAAA',
      secret: 's3cret',
    } as never);
    expect(result.ok).toBe(false);
  });
});

describe('verifyTurnstileToken', () => {
  it('passes everything through when nothing is configured', async () => {
    clearTurnstileEnv();
    const { verifyTurnstileToken } = await helper();
    expect(await verifyTurnstileToken(undefined)).toEqual({ ok: true });
    expect(await verifyTurnstileToken('')).toEqual({ ok: true });
    expect(await verifyTurnstileToken('whatever')).toEqual({ ok: true });
  });

  it('refuses a missing token once configured', async () => {
    process.env.OPB_TURNSTILE_SITE_KEY = '0x4AAAA';
    process.env.OPB_TURNSTILE_SECRET_KEY = 's3cret';
    const { verifyTurnstileToken } = await helper();
    const result = await verifyTurnstileToken(undefined);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/human check/i);
  });

  it('accepts a token Cloudflare confirms', async () => {
    process.env.OPB_TURNSTILE_SITE_KEY = '0x4AAAA';
    process.env.OPB_TURNSTILE_SECRET_KEY = 's3cret';
    stubSiteverify({ success: true, 'error-codes': [] });
    const { verifyTurnstileToken } = await helper();
    expect(await verifyTurnstileToken('GoodToken')).toEqual({ ok: true });
  });

  it('rejects a token Cloudflare denies', async () => {
    process.env.OPB_TURNSTILE_SITE_KEY = '0x4AAAA';
    process.env.OPB_TURNSTILE_SECRET_KEY = 's3cret';
    stubSiteverify({ success: false, 'error-codes': ['timeout-or-duplicate'] });
    const { verifyTurnstileToken } = await helper();
    const result = await verifyTurnstileToken('stale-token');
    expect(result.ok).toBe(false);
  });
});
