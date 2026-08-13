import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetUrlBase } from '../reset';

/**
 * Where a reset link points, on a site nobody configured.
 *
 * The one-click deploy asks for OPB_SETUP_TOKEN and nothing else, so a
 * button-deployed site has no OPB_SITE_URL — and reset used to answer 503 for
 * every one of them, leaving "delete the owner row from your database" as the
 * only recovery. These pin the fallback that fixes it, and the ordering that
 * keeps an explicit setting winning.
 *
 * `vi.stubEnv` rather than assigning to `process.env`: Next augments
 * `ProcessEnv` so `NODE_ENV` is readonly, and assigning to it does not compile.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('reset link origin', () => {
  it('prefers an explicit OPB_SITE_URL', () => {
    vi.stubEnv('OPB_SITE_URL', 'https://mine.example.com/');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'ignored.vercel.app');
    expect(resetUrlBase()).toBe('https://mine.example.com');
  });

  it("falls back to Vercel's own production domain", () => {
    vi.stubEnv('OPB_SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'student-site.vercel.app');
    expect(resetUrlBase()).toBe('https://student-site.vercel.app');
  });

  it('does not double the scheme if Vercel ever includes one', () => {
    vi.stubEnv('OPB_SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'https://student-site.vercel.app/');
    expect(resetUrlBase()).toBe('https://student-site.vercel.app');
  });

  it('still refuses to guess when nothing says where the site is', () => {
    // Guessing would mean reading the request, and a reset link built from a
    // caller-supplied host mails the owner a valid token pointing elsewhere.
    vi.stubEnv('OPB_SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
    vi.stubEnv('NODE_ENV', 'production');
    expect(resetUrlBase()).toBeNull();
  });
});
