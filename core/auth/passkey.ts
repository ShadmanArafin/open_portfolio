import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/server';
import { getStorageAdapter } from '@/core/storage/registry';
import type { PasskeyCredential } from '@/core/storage/contract';

/**
 * Passkeys (WebAuthn), the primary sign-in method.
 *
 * Storage landed first (`passkeys` on every adapter); this is the ceremony on
 * top of it. Three facts shape the whole file:
 *
 * 1. The relying-party identity comes from configuration, never from the
 *    request alone. `OPB_SITE_URL` is canonical in production; without it the
 *    request's own host is used, which is correct on a laptop and merely
 *    fail-closed behind a strange proxy (verification fails, nobody signs in).
 *    Deriving rpID from a header is safe *here* — it binds a ceremony, it
 *    never authorises one. Do not copy this pattern into anything that does.
 * 2. Challenges are single-use and short-lived (5 minutes, burned before
 *    verification runs, so even a thrown exception cannot leave one replayable).
 *    They live in the `otp` kv namespace: short-lived server state that must
 *    never travel in a content export, which is exactly what that namespace is.
 * 3. Login failures all read identically. Unknown credential id, bad signature,
 *    expired challenge, suspected clone — one message. Anything else turns the
 *    endpoint into an oracle for "is this credential enrolled here?".
 */

const CHALLENGE_TTL_SECONDS = 5 * 60;

export interface RelyingParty {
  rpID: string;
  expectedOrigin: string;
}

export function relyingParty(req: Request): RelyingParty {
  const site = process.env.OPB_SITE_URL?.replace(/\/$/, '');
  if (site) {
    try {
      const url = new URL(site);
      return { rpID: url.hostname, expectedOrigin: url.origin };
    } catch {
      // A malformed OPB_SITE_URL falls through to the request host rather
      // than crashing sign-in; the ceremony fails closed on mismatch.
    }
  }
  const host = req.headers.get('host') ?? 'localhost:3000';
  const hostname = host.split(':')[0] || 'localhost';
  const forwarded = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const proto =
    forwarded || hostname === 'localhost' || hostname === '127.0.0.1' ? 'http' : 'https';
  return { rpID: hostname, expectedOrigin: `${proto}://${host}` };
}

/** Stable, opaque user handle: the email itself must not travel in options. */
function userHandle(email: string): Uint8Array<ArrayBuffer> {
  const digest = createHash('sha256').update(`opb.passkey.v1:${email}`).digest();
  const out = new Uint8Array(digest.byteLength);
  out.set(digest);
  return out;
}

/** Fresh copy: Node Buffers carry ArrayBufferLike, WebAuthn wants ArrayBuffer. */
function bytesFromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const buf = Buffer.from(b64, 'base64');
  const out = new Uint8Array(buf.byteLength);
  out.set(buf);
  return out;
}

interface ChallengeRecord {
  challenge: string;
  email: string;
}

async function storeChallenge(email: string, challenge: string): Promise<string> {
  const challengeId = randomBytes(16).toString('hex');
  const adapter = await getStorageAdapter();
  await adapter.kv.set<ChallengeRecord>(
    'otp',
    `passkey:${challengeId}`,
    { challenge, email },
    CHALLENGE_TTL_SECONDS
  );
  return challengeId;
}

/** Returns the record and burns it. Single-use even when verification throws. */
async function burnChallenge(challengeId: string): Promise<ChallengeRecord | null> {
  if (!/^[0-9a-f]{32}$/.test(challengeId)) return null;
  const adapter = await getStorageAdapter();
  const record = await adapter.kv.get<ChallengeRecord>('otp', `passkey:${challengeId}`);
  await adapter.kv.del('otp', `passkey:${challengeId}`);
  return record;
}

export interface RegistrationStart {
  options: Awaited<ReturnType<typeof generateRegistrationOptions>>;
  challengeId: string;
}

export async function startPasskeyRegistration(
  email: string,
  rpID: string
): Promise<RegistrationStart> {
  const adapter = await getStorageAdapter();
  const existing = await adapter.passkeys.list();
  const options = await generateRegistrationOptions({
    rpName: 'Open Portfolio',
    rpID,
    userID: userHandle(email),
    userName: email,
    attestationType: 'none',
    excludeCredentials: existing.map((c) => ({
      id: c.id,
      transports: c.transports as AuthenticatorTransport[],
    })),
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
  });
  const challengeId = await storeChallenge(email, options.challenge);
  return { options, challengeId };
}

export async function finishPasskeyRegistration(
  email: string,
  challengeId: string,
  response: RegistrationResponseJSON,
  rp: RelyingParty,
  deviceName?: string
): Promise<{ ok: true; credentialId: string } | { ok: false; error: string }> {
  const record = await burnChallenge(challengeId);
  if (!record || record.email !== email) {
    return { ok: false, error: 'That request expired. Start again.' };
  }

  let verification: Awaited<ReturnType<typeof verifyRegistrationResponse>>;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: record.challenge,
      expectedOrigin: rp.expectedOrigin,
      expectedRPID: rp.rpID,
      requireUserVerification: false,
    });
  } catch {
    return { ok: false, error: 'That security key could not be verified.' };
  }
  if (!verification.verified || !verification.registrationInfo) {
    return { ok: false, error: 'That security key could not be verified.' };
  }

  const { credential, credentialBackedUp } = verification.registrationInfo;
  const adapter = await getStorageAdapter();
  const stored: PasskeyCredential = {
    id: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString('base64'),
    counter: credential.counter,
    transports: response.response.transports ?? [],
    deviceName:
      deviceName?.slice(0, 80) || `Security key ${(await adapter.passkeys.list()).length + 1}`,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    backedUp: credentialBackedUp,
  };
  await adapter.passkeys.put(stored);
  return { ok: true, credentialId: stored.id };
}

export interface AuthenticationStart {
  options: Awaited<ReturnType<typeof generateAuthenticationOptions>>;
  challengeId: string;
}

export async function startPasskeyLogin(
  rpID: string
): Promise<{ ok: true; start: AuthenticationStart } | { ok: false; error: string }> {
  const adapter = await getStorageAdapter();
  const enrolled = await adapter.passkeys.list();
  if (enrolled.length === 0) {
    return { ok: false, error: 'No passkeys are enrolled yet. Sign in with your passphrase.' };
  }
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: enrolled.map((c) => ({
      id: c.id,
      transports: c.transports as AuthenticatorTransport[],
    })),
    userVerification: 'preferred',
  });
  const owner = await adapter.readOwner();
  const challengeId = await storeChallenge(owner?.email ?? '', options.challenge);
  return { ok: true, start: { options, challengeId } };
}

/** One message for every failure mode. See the file comment. */
export const PASSKEY_LOGIN_FAILED = 'That passkey did not work. Try again or use your passphrase.';

export async function finishPasskeyLogin(
  challengeId: string,
  response: AuthenticationResponseJSON,
  rp: RelyingParty
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const record = await burnChallenge(challengeId);
  if (!record) return { ok: false, error: PASSKEY_LOGIN_FAILED };

  const adapter = await getStorageAdapter();
  const credential = await adapter.passkeys.get(response.id);
  const owner = await adapter.readOwner();
  if (!credential || !owner) return { ok: false, error: PASSKEY_LOGIN_FAILED };

  let verification: Awaited<ReturnType<typeof verifyAuthenticationResponse>>;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: record.challenge,
      expectedOrigin: rp.expectedOrigin,
      expectedRPID: rp.rpID,
      credential: {
        id: credential.id,
        publicKey: bytesFromBase64(credential.publicKey),
        counter: credential.counter,
      },
      requireUserVerification: false,
    });
  } catch {
    return { ok: false, error: PASSKEY_LOGIN_FAILED };
  }
  if (!verification.verified) return { ok: false, error: PASSKEY_LOGIN_FAILED };

  // Clone detection: a counter that did not advance means the credential may
  // have been copied. Zeroes mean "this authenticator does not count", which
  // is common enough to allow — rejecting it would brick real devices.
  const { newCounter } = verification.authenticationInfo;
  if (credential.counter > 0 && newCounter > 0 && newCounter <= credential.counter) {
    return { ok: false, error: PASSKEY_LOGIN_FAILED };
  }

  await adapter.passkeys.update(credential.id, {
    counter: newCounter,
    lastUsedAt: new Date().toISOString(),
  });
  return { ok: true, email: owner.email };
}
