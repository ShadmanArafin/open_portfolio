import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { getStorageAdapter } from '@/core/storage/registry';

/**
 * Where third-party credentials live.
 *
 * Three rules, and each of them exists because the obvious alternative is a
 * quiet disaster:
 *
 * **Not in the content snapshot.** That document is serialised into the HTML of
 * every public page and is what "export my site" hands you as a file. An SMTP
 * password in there is published, then emailed to whoever the backup was shared
 * with. Credentials go in the `config` namespace, which nothing public reads.
 *
 * **Encrypted at rest.** A backend leak, a shared database, a support engineer
 * reading a table — none of those should hand over the keys to somebody's mail
 * account. AES-256-GCM, which is authenticated: a tampered ciphertext fails to
 * decrypt rather than decrypting to something attacker-chosen.
 *
 * **Never sent back to the browser.** The admin gets to know a secret is *set*,
 * and its last four characters, and nothing else. An admin screen that
 * round-trips a password so it can show it in a field is one XSS away from
 * handing it over, and it gains nothing: nobody needs to read a key they
 * already pasted in.
 */

const ALGORITHM = 'aes-256-gcm';
const NAMESPACE = 'config' as const;

/** Marks a stored value as encrypted, and which scheme wrote it. */
const PREFIX = 'v1';

export class VaultUnavailableError extends Error {
  constructor() {
    super(
      'This site has no encryption key, so it cannot store service passwords safely. Set OPB_SECRET_KEY (or OPB_SESSION_SECRET) and restart.'
    );
    this.name = 'VaultUnavailableError';
  }
}

/**
 * The encryption key, derived from whatever server secret this install has.
 *
 * Derived rather than used directly so the key is always exactly 32 bytes
 * whatever the operator typed, and so the same secret used for two purposes
 * does not mean the same key twice — the domain string is what separates them.
 */
function key(env: NodeJS.ProcessEnv = process.env): Buffer | null {
  const secret = env.OPB_SECRET_KEY || env.OPB_SESSION_SECRET;
  if (!secret) return null;
  return createHash('sha256').update(`opb.integration.vault.v1:${secret}`).digest();
}

export function vaultAvailable(env: NodeJS.ProcessEnv = process.env): boolean {
  return key(env) !== null;
}

export function encrypt(plaintext: string, env: NodeJS.ProcessEnv = process.env): string {
  const k = key(env);
  if (!k) throw new VaultUnavailableError();

  // A fresh IV per encryption. Reusing one under GCM is not a weakening, it is
  // a break: two messages under the same key and IV leak their XOR.
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, k, iv);
  const enciphered = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    PREFIX,
    iv.toString('base64'),
    tag.toString('base64'),
    enciphered.toString('base64'),
  ].join('.');
}

export function decrypt(stored: string, env: NodeJS.ProcessEnv = process.env): string | null {
  const k = key(env);
  if (!k) return null;

  const [prefix, iv, tag, body] = stored.split('.');
  if (prefix !== PREFIX || !iv || !tag || !body) return null;

  try {
    const decipher = createDecipheriv(ALGORITHM, k, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString(
      'utf8'
    );
  } catch {
    // Wrong key, or the ciphertext was altered. Both mean "cannot read this",
    // and neither is worth distinguishing to a caller — saying which would tell
    // an attacker whether they had guessed the key.
    return null;
  }
}

/** What the admin is allowed to know about a secret it cannot see. */
export interface SecretHint {
  isSet: boolean;
  /** Last four characters, so somebody can tell which key they pasted. */
  hint?: string;
}

export function hintFor(plaintext: string): SecretHint {
  if (!plaintext) return { isSet: false };
  return { isSet: true, hint: plaintext.length <= 4 ? '••••' : `••••${plaintext.slice(-4)}` };
}

/**
 * Reads one integration's settings.
 *
 * Secret fields come back decrypted, so this is a server-only call and the
 * result must never be returned from a route handler as-is.
 */
export async function readConfig(
  id: string,
  secretFields: readonly string[]
): Promise<Record<string, unknown> | null> {
  const stored = await (await getStorageAdapter()).kv.get<Record<string, unknown>>(NAMESPACE, id);
  if (!stored) return null;

  const out: Record<string, unknown> = { ...stored };
  for (const field of secretFields) {
    const value = stored[field];
    if (typeof value === 'string' && value) out[field] = decrypt(value) ?? '';
  }
  return out;
}

/**
 * Writes one integration's settings, encrypting the fields it is told to.
 *
 * A secret arriving as an empty string means "leave what is there" rather than
 * "delete it" — the admin cannot show the current value, so an untouched
 * password field is empty, and treating that as a deletion would wipe the
 * setting every time somebody changed the port number.
 */
export async function writeConfig(
  id: string,
  values: Record<string, unknown>,
  secretFields: readonly string[]
): Promise<void> {
  const adapter = await getStorageAdapter();
  const existing = (await adapter.kv.get<Record<string, unknown>>(NAMESPACE, id)) ?? {};

  const next: Record<string, unknown> = { ...values };
  for (const field of secretFields) {
    const incoming = values[field];
    if (typeof incoming === 'string' && incoming) {
      next[field] = encrypt(incoming);
    } else {
      next[field] = existing[field] ?? '';
    }
  }

  // No TTL. These are settings, not state.
  await adapter.kv.set(NAMESPACE, id, next);
}

export async function clearConfig(id: string): Promise<void> {
  await (await getStorageAdapter()).kv.del(NAMESPACE, id);
}
