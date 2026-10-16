import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

vi.mock('@simplewebauthn/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@simplewebauthn/server')>();
  return {
    ...actual,
    generateRegistrationOptions: vi.fn(async () => ({ challenge: 'reg-challenge' })),
    verifyRegistrationResponse: vi.fn(),
    generateAuthenticationOptions: vi.fn(async () => ({ challenge: 'auth-challenge' })),
    verifyAuthenticationResponse: vi.fn(),
  };
});

import { verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server';

/**
 * Passkey ceremonies with the WebAuthn library mocked at the boundary.
 *
 * What is real here: challenge storage and burning, credential persistence,
 * counter/clone logic, rpID derivation, and every failure message. What is
 * mocked: the cryptography itself — fabricating a valid attestation is the
 * library's own test suite's job, not this project's.
 *
 * NOTE: `core/auth/passkey` (and through it, the storage registry) is imported
 * lazily inside each test, never at the top of this file. The local adapter
 * resolves its data directory from the working directory at module load, which
 * only happens after `beforeAll` chdirs into a throwaway folder. A top-level
 * import binds it to the real repository checkout instead — an earlier version
 * of this file did exactly that, writing a test credential and a fake owner
 * into the developer's own `.opb/`. Dynamic imports are the guardrail.
 */
const pk = () => import('@/core/auth/passkey');

async function adapter() {
  return (await import('@/core/storage/adapters/local')).localAdapter;
}

const originalCwd = process.cwd();
let workDir: string;

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-passkey-'));
  process.chdir(workDir);
  delete process.env.OPB_SITE_URL;
});

afterAll(async () => {
  process.chdir(originalCwd);
  await rm(workDir, { recursive: true, force: true });
});

function req(host = 'localhost:3000'): Request {
  return new Request('http://localhost:3000/api/auth/passkey/login/start', {
    headers: { host },
  });
}

describe('relying party', () => {
  it('prefers OPB_SITE_URL when set', async () => {
    const { relyingParty } = await pk();
    process.env.OPB_SITE_URL = 'https://example.com';
    expect(relyingParty(req())).toEqual({
      rpID: 'example.com',
      expectedOrigin: 'https://example.com',
    });
    delete process.env.OPB_SITE_URL;
  });

  it('falls back to the request host', async () => {
    const { relyingParty } = await pk();
    expect(relyingParty(req())).toEqual({
      rpID: 'localhost',
      expectedOrigin: 'http://localhost:3000',
    });
  });
});

describe('login with nothing enrolled', () => {
  it('says plainly so the page can fall back to the passphrase form', async () => {
    // Runs before anything enrolls: the temp dir starts empty.
    const { startPasskeyLogin } = await pk();
    const started = await startPasskeyLogin('localhost');
    expect(started).toEqual({
      ok: false,
      error: 'No passkeys are enrolled yet. Sign in with your passphrase.',
    });
  });
});

describe('registration ceremony', () => {
  it('stores a credential and burns the challenge', async () => {
    const { finishPasskeyRegistration, startPasskeyRegistration } = await pk();
    const email = 'owner@example.com';
    const { challengeId } = await startPasskeyRegistration(email, 'localhost');

    vi.mocked(verifyRegistrationResponse).mockResolvedValueOnce({
      verified: true,
      registrationInfo: {
        credential: {
          id: 'AQID',
          publicKey: new Uint8Array([4, 5, 6]),
          counter: 0,
        },
        credentialBackedUp: false,
      },
    } as never);

    const done = await finishPasskeyRegistration(
      email,
      challengeId,
      { id: 'AQID', response: { transports: ['internal'] } } as never,
      { rpID: 'localhost', expectedOrigin: 'http://localhost:3000' },
      'My key'
    );
    expect(done).toEqual({ ok: true, credentialId: 'AQID' });
    expect(await (await adapter()).passkeys.get('AQID')).toMatchObject({
      deviceName: 'My key',
      counter: 0,
    });

    // Replaying the same challenge fails: it was burned before verification ran.
    const replay = await finishPasskeyRegistration(
      email,
      challengeId,
      { id: 'AQID', response: {} } as never,
      { rpID: 'localhost', expectedOrigin: 'http://localhost:3000' }
    );
    expect(replay.ok).toBe(false);
  });

  it('refuses a challenge bound to another email', async () => {
    const { finishPasskeyRegistration, startPasskeyRegistration } = await pk();
    const { challengeId } = await startPasskeyRegistration('owner@example.com', 'localhost');
    const done = await finishPasskeyRegistration(
      'someone-else@example.com',
      challengeId,
      { id: 'x', response: {} } as never,
      { rpID: 'localhost', expectedOrigin: 'http://localhost:3000' }
    );
    expect(done).toEqual({ ok: false, error: 'That request expired. Start again.' });
  });
});

describe('login ceremony', () => {
  it('signs in, advances the counter, and rejects clones and replays', async () => {
    const { finishPasskeyLogin, PASSKEY_LOGIN_FAILED, startPasskeyLogin } = await pk();
    const store = await adapter();
    await store.writeOwner({
      email: 'owner@example.com',
      passphraseHash: 'scrypt$1$2$3$c2FsdA==$aGFzaA==',
      createdAt: new Date().toISOString(),
      sessionEpoch: 1,
    });

    const started = await startPasskeyLogin('localhost');
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    const { challengeId } = started.start;

    vi.mocked(verifyAuthenticationResponse).mockResolvedValueOnce({
      verified: true,
      authenticationInfo: { newCounter: 1 },
    } as never);

    const done = await finishPasskeyLogin(challengeId, { id: 'AQID', response: {} } as never, {
      rpID: 'localhost',
      expectedOrigin: 'http://localhost:3000',
    });
    expect(done).toEqual({ ok: true, email: 'owner@example.com' });
    expect(await store.passkeys.get('AQID')).toMatchObject({ counter: 1 });

    // A counter that did not advance is a suspected clone: one message, no sign-in.
    const again = await startPasskeyLogin('localhost');
    expect(again.ok).toBe(true);
    if (!again.ok) return;
    vi.mocked(verifyAuthenticationResponse).mockResolvedValueOnce({
      verified: true,
      authenticationInfo: { newCounter: 1 },
    } as never);
    const cloned = await finishPasskeyLogin(
      again.start.challengeId,
      { id: 'AQID', response: {} } as never,
      { rpID: 'localhost', expectedOrigin: 'http://localhost:3000' }
    );
    expect(cloned).toEqual({ ok: false, error: PASSKEY_LOGIN_FAILED });

    // Unknown credential ids read exactly the same as a bad signature.
    const third = await startPasskeyLogin('localhost');
    expect(third.ok).toBe(true);
    if (!third.ok) return;
    const unknown = await finishPasskeyLogin(
      third.start.challengeId,
      { id: 'AAAAAAAAAAAAAAAAAAAAAA', response: {} } as never,
      { rpID: 'localhost', expectedOrigin: 'http://localhost:3000' }
    );
    expect(unknown).toEqual({ ok: false, error: PASSKEY_LOGIN_FAILED });
  });
});
