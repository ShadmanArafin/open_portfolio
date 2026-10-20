import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/core/storage/registry', () => ({
  getStorageAdapter: async () => ({ readOwner: async () => null }),
}));

const { getClaimEligibility } = await import('../claim');

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('claim eligibility', () => {
  it('opens with a setup token of the deployer’s own', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OPB_SETUP_TOKEN', 'a phrase nobody else has read');
    await expect(getClaimEligibility()).resolves.toEqual({ allowed: true, requiresToken: true });
  });

  it('stays closed in production while the token is the example from docker-compose.yml', async () => {
    // Whoever reaches a fresh install first could otherwise type the value
    // printed in this repository and own the site.
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OPB_SETUP_TOKEN', 'change-me-to-a-long-random-phrase');
    const result = await getClaimEligibility();
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('example value');
  });
});
