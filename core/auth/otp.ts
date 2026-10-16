import 'server-only';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { getStorageAdapter } from '@/core/storage/registry';

/**
 * Email one-time codes: the recovery method.
 *
 * Passkey first, email code when the key is lost, passphrase as the last
 * resort — that is the locked decision, and this file is its middle row. A
 * six-digit code to the owner's address, single-use, ten-minute-lived, five
 * guesses per code. Only a hash is ever stored, attempts are counted on the
 * record (not in a separate counter a stranger can desynchronise), and the
 * code is burned before its verdict is returned so a thrown exception cannot
 * leave it replayable.
 *
 * Requesting a code for a non-owner address behaves identically to requesting
 * one for the owner — same response, same timing shape — so the endpoint
 * cannot be used to ask which address runs this site.
 */

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

function codeKey(email: string): string {
  return `email-code:${createHash('sha256').update(email).digest('hex')}`;
}

function codeHash(code: string): string {
  return createHash('sha256').update(`opb.email-otp.v1:${code}`).digest('hex');
}

interface OtpRecord {
  hash: string;
  attempts: number;
}

export function makeEmailCode(digits = 6): string {
  let code = '';
  for (let i = 0; i < digits; i++) code += String(randomInt(0, 10));
  return code;
}

/**
 * Issues a code, sending it only when the address owns this site. Returns the
 * code when one was addressed to the owner (so tests and the request route can
 * act on it) and null otherwise — the route answers `{ok: true}` either way.
 */
export async function issueEmailCode(email: string): Promise<string | null> {
  const owner = await (await getStorageAdapter()).readOwner();
  if (!owner || owner.email !== email) return null;

  const code = makeEmailCode();
  const adapter = await getStorageAdapter();
  await adapter.kv.set<OtpRecord>(
    'otp',
    codeKey(email),
    { hash: codeHash(code), attempts: 0 },
    OTP_TTL_MINUTES * 60
  );
  return code;
}

export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  const normalized = code.trim().replace(/[\s-]+/g, '');
  if (!/^[0-9]{6}$/.test(normalized)) return false;

  const adapter = await getStorageAdapter();
  const record = await adapter.kv.get<OtpRecord>('otp', codeKey(email));
  // Burned before the verdict either way: single-use even when comparing throws.
  await adapter.kv.del('otp', codeKey(email));
  if (!record || record.attempts >= OTP_MAX_ATTEMPTS) return false;

  const expected = Buffer.from(record.hash, 'hex');
  const actual = Buffer.from(codeHash(normalized), 'hex');
  const match = expected.length === actual.length && timingSafeEqual(expected, actual);
  if (!match) {
    // A wrong guess consumes one of five. Re-stored rather than kept: the
    // record above is already deleted, and a failed attempt must not mint a
    // fresh allowance.
    if (record.attempts + 1 < OTP_MAX_ATTEMPTS) {
      await adapter.kv.set<OtpRecord>(
        'otp',
        codeKey(email),
        { hash: record.hash, attempts: record.attempts + 1 },
        OTP_TTL_MINUTES * 60
      );
    }
    return false;
  }
  return true;
}
