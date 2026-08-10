import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { getStorageAdapter } from '@/core/storage/registry';
import { SESSION_COOKIE } from './constants';

/**
 * Server-side sessions.
 *
 * What this replaces: an unsigned `{expiresAt}` object in localStorage that
 * anybody could write by hand to grant themselves admin access, guarded by a
 * passcode compiled into the public JavaScript bundle.
 *
 * The cookie holds an opaque random token and nothing else. What is stored
 * server-side is the SHA-256 of that token, so a leak of the session store is
 * not a leak of usable sessions. There is no JWT: revocation has to be instant
 * and identical across every backend, and a stateless token cannot do that
 * without a revocation list — which is a session store with extra steps.
 */

export { SESSION_COOKIE };

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const ABSOLUTE_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export interface SessionRecord {
  email: string;
  createdAt: number;
  /** Sessions minted before the owner's current epoch are rejected. */
  epoch: number;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Whether to mark the session cookie `Secure`.
 *
 * Not simply `NODE_ENV === 'production'`. Someone self-hosting runs a
 * production build on `localhost` all the time — to check it before deploying,
 * or behind a reverse proxy that terminates TLS — and a `Secure` cookie over
 * plain HTTP is silently discarded by the browser. The symptom is a login form
 * that accepts the passphrase and then does nothing at all, which is close to
 * undebuggable if you do not already know this rule exists.
 *
 * Loopback is exempt because it cannot be intercepted; everything else gets the
 * flag whenever the request arrived over HTTPS or we are in production.
 */
async function shouldUseSecureCookie(): Promise<boolean> {
  const h = await headers();
  const host = (h.get('host') ?? '').toLowerCase();
  const isLoopback = /^(localhost|127\.0\.0\.1|\[::1\]|::1)(:\d+)?$/.test(host);
  if (isLoopback) return false;

  const proto = h.get('x-forwarded-proto') ?? '';
  return process.env.NODE_ENV === 'production' || proto === 'https';
}

export async function createSession(email: string, epoch: number): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const adapter = getStorageAdapter();

  await adapter.kv.set<SessionRecord>(
    'session',
    hashToken(token),
    { email, createdAt: Date.now(), epoch },
    SESSION_TTL_SECONDS
  );

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: await shouldUseSecureCookie(),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function readSession(): Promise<SessionRecord | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const adapter = getStorageAdapter();
  const record = await adapter.kv.get<SessionRecord>('session', hashToken(token));
  if (!record) return null;

  // An absolute lifetime the sliding window cannot extend, so a stolen cookie
  // cannot be kept alive forever by simply continuing to use it.
  if (Date.now() - record.createdAt > ABSOLUTE_TTL_MS) {
    await adapter.kv.del('session', hashToken(token));
    return null;
  }

  const owner = await adapter.readOwner();
  if (!owner || owner.email !== record.email || owner.sessionEpoch !== record.epoch) {
    return null;
  }

  return record;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await getStorageAdapter().kv.del('session', hashToken(token));
  }
  store.delete(SESSION_COOKIE);
}

/** Signs out every device by moving the owner's epoch past all existing sessions. */
export async function revokeAllSessions(): Promise<void> {
  const adapter = getStorageAdapter();
  const owner = await adapter.readOwner();
  if (!owner) return;
  await adapter.writeOwner({ ...owner, sessionEpoch: owner.sessionEpoch + 1 });
  await adapter.kv.clear('session');
}
