import 'server-only';
import { headers } from 'next/headers';
import { getStorageAdapter } from '@/core/storage/registry';
import { readSession, type SessionRecord } from './session';

/**
 * The authorization boundary.
 *
 * Every server action and every route handler that changes anything must call
 * this itself. Middleware and layout checks are user experience, not security:
 * a Server Action is a publicly callable HTTP endpoint, reachable regardless of
 * which layout happened to render the button that normally invokes it. Relying
 * on a layout guard is the single most common way an App Router application
 * ends up with an unprotected mutation.
 */

export class UnauthorizedError extends Error {
  constructor(message = 'You need to be signed in to do that.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Rejects cross-site requests.
 *
 * SameSite=Lax already blocks most of this, but it is a browser behaviour we do
 * not control and cannot verify, so the origin is checked server-side too.
 */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const site = h.get('sec-fetch-site');

  // Browsers that send Sec-Fetch-Site give the clearest answer available.
  if (site && site !== 'same-origin' && site !== 'none') {
    throw new UnauthorizedError('That request came from another site.');
  }

  const origin = h.get('origin');
  if (!origin) return; // Same-origin GETs and non-browser clients omit it.

  const host = h.get('host');
  try {
    if (new URL(origin).host !== host) {
      throw new UnauthorizedError('That request came from another site.');
    }
  } catch {
    throw new UnauthorizedError('That request had an unreadable origin.');
  }
}

/** Throws unless the caller holds a valid session for this instance's owner. */
export async function requireOwner(): Promise<SessionRecord> {
  await assertSameOrigin();
  const session = await readSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

/** Non-throwing form, for rendering decisions rather than authorization. */
export async function getOwnerSession(): Promise<SessionRecord | null> {
  return readSession();
}

export type InstanceState = 'unclaimed' | 'claimed';

/** Whether anybody has taken ownership of this deployment yet. */
export async function getInstanceState(): Promise<InstanceState> {
  const owner = await getStorageAdapter().readOwner();
  return owner ? 'claimed' : 'unclaimed';
}
