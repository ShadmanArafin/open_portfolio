import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Email one-time codes. Lazy imports throughout — see the note in
 * `passkey.test.ts` about why a top-level import would bind the local adapter
 * to the real checkout instead of the throwaway folder below.
 */
const otp = () => import('@/core/auth/otp');

const originalCwd = process.cwd();
let workDir: string;

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-otp-'));
  process.chdir(workDir);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await rm(workDir, { recursive: true, force: true });
});

async function claimed(email = 'owner@example.com') {
  const { localAdapter } = await import('@/core/storage/adapters/local');
  await localAdapter.writeOwner({
    email,
    passphraseHash: 'scrypt$1$2$3$c2FsdA==$aGFzaA==',
    createdAt: new Date().toISOString(),
    sessionEpoch: 1,
  });
}

describe('email one-time codes', () => {
  it('issues to the owner and verifies once', async () => {
    await claimed();
    const { issueEmailCode, verifyEmailCode } = await otp();
    const code = await issueEmailCode('owner@example.com');
    expect(code).toMatch(/^[0-9]{6}$/);
    expect(await verifyEmailCode('owner@example.com', code as string)).toBe(true);
    // Single-use: the same code is dead on arrival the second time.
    expect(await verifyEmailCode('owner@example.com', code as string)).toBe(false);
  });

  it('issues nothing for a stranger, and verifies nothing', async () => {
    await claimed();
    const { issueEmailCode, verifyEmailCode } = await otp();
    expect(await issueEmailCode('stranger@example.com')).toBeNull();
    expect(await verifyEmailCode('stranger@example.com', '123456')).toBe(false);
  });

  it('rejects malformed codes without touching storage', async () => {
    await claimed();
    const { issueEmailCode, verifyEmailCode } = await otp();
    const code = (await issueEmailCode('owner@example.com')) as string;
    expect(await verifyEmailCode('owner@example.com', 'not-a-code')).toBe(false);
    expect(await verifyEmailCode('owner@example.com', code)).toBe(true);
  });

  it('locks a code after five wrong guesses', async () => {
    await claimed();
    const { issueEmailCode, verifyEmailCode } = await otp();
    const code = (await issueEmailCode('owner@example.com')) as string;
    const wrong = code === '000000' ? '000001' : '000000';
    for (let i = 0; i < 5; i++) {
      expect(await verifyEmailCode('owner@example.com', wrong)).toBe(false);
    }
    // Even the right code is dead now: the allowance is spent.
    expect(await verifyEmailCode('owner@example.com', code)).toBe(false);
  });
});
