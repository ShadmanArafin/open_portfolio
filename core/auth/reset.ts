import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { getStorageAdapter } from '@/core/storage/registry';

/**
 * Passphrase reset tokens.
 *
 * Only the SHA-256 is stored, for the same reason sessions store only their
 * hash: a database leak must not be a live-credential leak. The token itself
 * exists in one email and nowhere else.
 *
 * They live in the `otp` kv namespace, which already has a TTL and is already
 * conformance-tested on every backend — so this needs no new storage.
 */

export const RESET_TTL_MINUTES = 30;

export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Returns the token to email, or null when there is nobody to email it to. */
export async function issueResetToken(email: string): Promise<string | null> {
  const adapter = await getStorageAdapter();
  const owner = await adapter.readOwner();
  if (!owner || owner.email.toLowerCase() !== email.trim().toLowerCase()) return null;

  const token = randomBytes(32).toString('base64url');
  await adapter.kv.set(
    'otp',
    `reset:${hashResetToken(token)}`,
    { email: owner.email },
    RESET_TTL_MINUTES * 60
  );
  return token;
}

/** Returns the owner's email and burns the token, or null if it is not valid. */
export async function consumeResetToken(token: string): Promise<string | null> {
  const adapter = await getStorageAdapter();
  const key = `reset:${hashResetToken(token)}`;
  const stored = await adapter.kv.get<{ email: string }>('otp', key);
  if (!stored) return null;

  // Deleted before the passphrase is changed, so a replay cannot land between
  // the two.
  await adapter.kv.del('otp', key);
  return stored.email;
}

/**
 * Where a reset link points.
 *
 * From configuration and never from the request. A link built from a
 * caller-supplied Host header mails the owner a valid token pointing at
 * somebody else's domain — and this repository has already made the
 * header-derived-authorization mistake once, in the claim flow.
 */
export function resetUrlBase(): string | null {
  const configured = process.env.OPB_SITE_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3000';
  return null;
}
