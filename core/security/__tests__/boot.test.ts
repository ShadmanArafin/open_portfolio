import { describe, expect, it } from 'vitest';
import { checkBootConfig } from '@/core/security/boot';

const prodBase = {
  NODE_ENV: 'production',
  OPB_SETUP_TOKEN: 'token',
  OPB_SECRET_KEY: 'secret',
  OPB_POSTGRES_URL: 'postgres://u:p@h/db',
};

describe('boot config', () => {
  it('is silent for a well-configured production boot', () => {
    expect(checkBootConfig({ ...prodBase })).toEqual({ errors: [], warnings: [] });
  });

  it('ignores everything in development', () => {
    expect(checkBootConfig({ NODE_ENV: 'development' })).toEqual({ errors: [], warnings: [] });
  });

  it('fails fast for local-on-ephemeral', () => {
    const { errors } = checkBootConfig({ ...prodBase, VERCEL: '1', OPB_POSTGRES_URL: undefined });
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('discards the filesystem');
  });

  it('fails fast for explicit local on ephemeral even with a db present', () => {
    const { errors } = checkBootConfig({ ...prodBase, VERCEL: '1', OPB_ADAPTER: 'local' });
    expect(errors.length).toBe(1);
  });

  it('warns on missing setup token and vault key', () => {
    const { errors, warnings } = checkBootConfig({
      NODE_ENV: 'production',
      OPB_POSTGRES_URL: 'postgres://u:p@h/db',
    });
    expect(errors).toEqual([]);
    expect(warnings.length).toBe(2);
  });

  it('warns, without failing, when the documented example values are still in place', () => {
    // Fatal would take a live site down on update; the claim and the vault
    // refuse on their own instead.
    const { errors, warnings } = checkBootConfig({
      ...prodBase,
      OPB_SETUP_TOKEN: 'change-me-to-a-long-random-phrase',
      OPB_SECRET_KEY: 'change-me-to-a-different-long-random-phrase',
    });
    expect(errors).toEqual([]);
    expect(warnings).toHaveLength(2);
    expect(warnings.join(' ')).toContain('example value');
  });
});
