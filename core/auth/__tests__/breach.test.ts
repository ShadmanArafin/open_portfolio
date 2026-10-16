import { describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { isBreachedPassphrase } from '@/core/auth/passphrase';

function hibpResponseFor(passphrase: string): string {
  const full = createHash('sha1').update(passphrase).digest('hex').toUpperCase();
  return `${full.slice(5)}:42\nABCDEF1234567890ABCDEF1234567890ABC:1\n`;
}

describe('breach check', () => {
  it('flags a breached passphrase without sending the full hash', async () => {
    const seen: string[] = [];
    const fake = vi.fn(async (url: string) => {
      seen.push(url);
      return new Response(hibpResponseFor('password123456'));
    });
    const result = await isBreachedPassphrase('password123456', fake as never);
    expect(result).toEqual({ breached: true, breachUnknown: false });
    // Only the 5-char prefix travels.
    expect(seen[0]).toMatch(/\/range\/[0-9A-F]{5}$/);
    expect(seen[0]).not.toContain(createHash('sha1').update('password123456').digest('hex'));
  });

  it('passes a clean passphrase', async () => {
    const fake = vi.fn(async () => new Response('ABCDEF1234567890ABCDEF1234567890ABC:1\n'));
    expect(
      await isBreachedPassphrase('a long unique sentence nobody breached', fake as never)
    ).toEqual({ breached: false, breachUnknown: false });
  });

  it('fails open when offline', async () => {
    const fake = vi.fn(async () => {
      throw new Error('no network');
    });
    expect(await isBreachedPassphrase('anything at all here', fake as never)).toEqual({
      breached: false,
      breachUnknown: true,
    });
  });
});
