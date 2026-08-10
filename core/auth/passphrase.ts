import 'server-only';
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

/**
 * Passphrase hashing with scrypt from Node's standard library.
 *
 * scrypt rather than bcrypt or Argon2 specifically to avoid a native
 * dependency: this project is deployed by people who will never debug a failed
 * node-gyp build, and a compile error during `npm install` is a worse outcome
 * than the modest margin Argon2id would buy over correctly-parameterised
 * scrypt.
 *
 * Parameters are stored alongside each hash, so they can be raised later
 * without invalidating existing passphrases.
 */
const PARAMS = { N: 2 ** 16, r: 8, p: 1, maxmem: 128 * 2 ** 16 * 8 * 2 };
const KEY_LENGTH = 64;

export async function hashPassphrase(passphrase: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(passphrase.normalize('NFKC'), salt, KEY_LENGTH, PARAMS);
  return [
    'scrypt',
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString('base64'),
    derived.toString('base64'),
  ].join('$');
}

/**
 * Always does the full derivation, even against a malformed stored hash, so the
 * time taken cannot distinguish "no such account" from "wrong passphrase".
 */
export async function verifyPassphrase(passphrase: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    await scrypt(passphrase, randomBytes(16), KEY_LENGTH, PARAMS);
    return false;
  }

  const [, n, r, p, saltB64, hashB64] = parts;
  const params = {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 128 * Number(n) * Number(r) * 2,
  };
  const expected = Buffer.from(hashB64, 'base64');

  let derived: Buffer;
  try {
    derived = await scrypt(
      passphrase.normalize('NFKC'),
      Buffer.from(saltB64, 'base64'),
      expected.length,
      params
    );
  } catch {
    return false;
  }

  // Length must match before timingSafeEqual, which throws on a mismatch.
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

/**
 * The bar a passphrase has to clear.
 *
 * Length only, deliberately. Composition rules ("one number, one symbol") push
 * people towards `Password1!` and are no longer recommended by NIST; a longer
 * passphrase is both stronger and easier to remember.
 */
export function checkPassphraseStrength(passphrase: string): { ok: boolean; reason?: string } {
  const value = passphrase.normalize('NFKC');
  if (value.length < 12) {
    return { ok: false, reason: 'Use at least 12 characters. A short sentence works well.' };
  }
  if (value.length > 512) {
    return { ok: false, reason: 'That is longer than 512 characters.' };
  }
  if (/^(.)\1+$/.test(value)) {
    return { ok: false, reason: 'That is the same character repeated.' };
  }
  return { ok: true };
}
