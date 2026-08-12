import 'server-only';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { getStorageAdapter } from '@/core/storage/registry';
import { isStalePending, normaliseEmail, type Subscriber } from './schema';

/**
 * Signing somebody up, and letting them leave.
 *
 * The tokens are the interesting part. They are handed out in a URL and stored
 * only as a SHA-256 hash, for the same reason session tokens are: a leaked
 * database should not give somebody the ability to confirm or unsubscribe other
 * people. SHA-256 rather than scrypt because these are 256 bits of randomness
 * we generated, not a password somebody chose — there is nothing to brute-force
 * and no reason to make verification slow.
 */

const TOKEN_BYTES = 32;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Constant-time, so a token cannot be discovered one character at a time. */
function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export interface SignupResult {
  ok: boolean;
  /** Shown to the person. Deliberately identical whatever actually happened. */
  message: string;
  /** The confirmation link to email. Absent when nothing needs sending. */
  confirmToken?: string;
  /** Goes in the `List-Unsubscribe` header of that same email. */
  unsubscribeToken?: string;
  subscriber?: Subscriber;
}

/**
 * Asks to join the list.
 *
 * **The answer is the same whether or not the address was already on it.** A
 * form that says "you are already subscribed" is a way to test whether an
 * address is on somebody's list, one query at a time, which is not information
 * the person who owns the list intended to publish.
 */
export async function requestSignup(rawEmail: string, source?: string): Promise<SignupResult> {
  const email = normaliseEmail(rawEmail);
  const sameForEveryone = 'Almost there — check your email and click the link to confirm.';

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, message: 'That does not look like an email address.' };
  }

  const adapter = await getStorageAdapter();
  const existing = (await adapter.subscribers.list()).find((s) => s.email === email);

  // Already confirmed: say the same thing and send nothing. Re-sending a
  // confirmation to somebody already on the list is a way to use the form to
  // mail a stranger repeatedly.
  if (existing?.status === 'confirmed') return { ok: true, message: sameForEveryone };

  const token = randomBytes(TOKEN_BYTES).toString('base64url');
  const unsubscribeToken = randomBytes(TOKEN_BYTES).toString('base64url');

  if (existing) {
    // Pending or previously unsubscribed. A new token replaces the old one, so
    // a link from a month ago stops working.
    await adapter.subscribers.update(existing.id, {
      status: 'pending',
      confirmTokenHash: hashToken(token),
      unsubscribeTokenHash: hashToken(unsubscribeToken),
      requestedAt: new Date().toISOString(),
    });
    return {
      ok: true,
      message: sameForEveryone,
      confirmToken: token,
      unsubscribeToken,
      subscriber: existing,
    };
  }

  const subscriber: Subscriber = {
    id: `sub_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`,
    email,
    status: 'pending',
    confirmTokenHash: hashToken(token),
    unsubscribeTokenHash: hashToken(unsubscribeToken),
    requestedAt: new Date().toISOString(),
    source,
  };

  await adapter.subscribers.append(subscriber);
  return { ok: true, message: sameForEveryone, confirmToken: token, unsubscribeToken, subscriber };
}

export async function confirm(token: string): Promise<{ ok: boolean; message: string }> {
  if (!token) return { ok: false, message: 'That link is missing something.' };

  const adapter = await getStorageAdapter();
  const hash = hashToken(token);
  const match = (await adapter.subscribers.list()).find(
    (s) => s.confirmTokenHash && hashesMatch(s.confirmTokenHash, hash)
  );

  if (!match) {
    return { ok: false, message: 'That link has already been used, or it has expired.' };
  }
  if (match.status === 'confirmed') {
    return { ok: true, message: 'You are already on the list. Nothing more to do.' };
  }

  await adapter.subscribers.update(match.id, {
    status: 'confirmed',
    confirmedAt: new Date().toISOString(),
    // Spent. Leaving it usable would make the link a permanent re-subscribe
    // for anybody who ever saw the email — including after they unsubscribe.
    //
    // Emptied rather than set to `undefined`, and that is not a stylistic
    // choice: the file adapter spreads the patch (so `undefined` deletes the
    // key) while Postgres merges it as jsonb (where `JSON.stringify` drops the
    // key entirely, so `undefined` is a no-op and the token survives). An empty
    // string means the same thing on every backend. The lookups above require a
    // truthy hash, so `''` matches nothing.
    confirmTokenHash: '',
  });

  return { ok: true, message: 'Confirmed. You are on the list.' };
}

/**
 * Leaving.
 *
 * One click, no sign-in, no confirmation step, and the record is kept as
 * `unsubscribed` rather than deleted — because deleting it means the next
 * import of an old list quietly adds them back.
 */
export async function unsubscribe(token: string): Promise<{ ok: boolean; message: string }> {
  if (!token) return { ok: false, message: 'That link is missing something.' };

  const adapter = await getStorageAdapter();
  const hash = hashToken(token);
  const match = (await adapter.subscribers.list()).find(
    (s) => s.unsubscribeTokenHash && hashesMatch(s.unsubscribeTokenHash, hash)
  );

  if (!match) return { ok: false, message: 'That link is not one we recognise.' };
  if (match.status === 'unsubscribed') {
    return { ok: true, message: 'You were already unsubscribed. Nothing more to do.' };
  }

  await adapter.subscribers.update(match.id, {
    status: 'unsubscribed',
    unsubscribedAt: new Date().toISOString(),
  });

  return { ok: true, message: 'Done — you will not hear from this site again.' };
}

/**
 * Drops unconfirmed signups that were never completed.
 *
 * Run opportunistically rather than on a schedule, for the same reason
 * scheduling a post is a predicate: there is no cron to rely on.
 */
export async function sweepStalePending(): Promise<number> {
  const adapter = await getStorageAdapter();
  const stale = (await adapter.subscribers.list()).filter((s) => isStalePending(s));
  for (const subscriber of stale) await adapter.subscribers.remove(subscriber.id);
  return stale.length;
}

export async function listSubscribers(): Promise<Subscriber[]> {
  return (await getStorageAdapter()).subscribers.list();
}
