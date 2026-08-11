import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The vault, and the properties that make it worth having.
 *
 * Encryption code that is never tested is decoration: it looks like security in
 * a review and can be silently broken for a year. The interesting cases are not
 * "does a round trip work" but "what happens when it goes wrong" — a rotated
 * key, a tampered value, a missing secret, an untouched password field.
 */

const store = new Map<string, unknown>();
vi.mock('@/core/storage/registry', () => ({
  getStorageAdapter: async () => ({
    kv: {
      get: async (ns: string, key: string) => store.get(`${ns}:${key}`) ?? null,
      set: async (ns: string, key: string, value: unknown) => void store.set(`${ns}:${key}`, value),
      del: async (ns: string, key: string) => void store.delete(`${ns}:${key}`),
    },
  }),
}));

const { clearConfig, decrypt, encrypt, hintFor, readConfig, vaultAvailable, writeConfig } =
  await import('../vault');

const env = (secret: string) => ({ OPB_SECRET_KEY: secret }) as unknown as NodeJS.ProcessEnv;
const ENV = env('a-server-secret-that-is-long-enough');

beforeEach(() => {
  store.clear();
  process.env.OPB_SECRET_KEY = ENV.OPB_SECRET_KEY;
});

describe('encryption', () => {
  it('round-trips a secret', () => {
    expect(decrypt(encrypt('hunter2', ENV), ENV)).toBe('hunter2');
  });

  it('produces a different ciphertext every time', () => {
    // A fresh IV per encryption. Reusing one under GCM is not a weakening, it
    // is a break — and identical ciphertexts are how you find out too late.
    expect(encrypt('same', ENV)).not.toBe(encrypt('same', ENV));
  });

  it('refuses a value encrypted under a different key', () => {
    const other = env('a-completely-different-server-secret');
    expect(decrypt(encrypt('hunter2', ENV), other)).toBeNull();
  });

  it('refuses a tampered value rather than returning something else', () => {
    // The whole reason for GCM over CBC: altering the ciphertext must fail,
    // not decrypt to attacker-influenced bytes.
    const sealed = encrypt('hunter2', ENV);
    const [prefix, iv, tag, body] = sealed.split('.');
    const flipped = Buffer.from(body, 'base64');
    flipped[0] ^= 0x01;
    expect(decrypt([prefix, iv, tag, flipped.toString('base64')].join('.'), ENV)).toBeNull();
  });

  it('refuses nonsense without throwing', () => {
    expect(decrypt('not-a-sealed-value', ENV)).toBeNull();
    expect(decrypt('', ENV)).toBeNull();
    expect(decrypt('v1.a.b', ENV)).toBeNull();
  });

  it('says so when the instance has no secret at all', () => {
    const none = {} as unknown as NodeJS.ProcessEnv;
    expect(vaultAvailable(none)).toBe(false);
    expect(() => encrypt('x', none)).toThrow(/encryption key/i);
  });
});

describe('config storage', () => {
  it('stores secrets encrypted and reads them back in the clear', async () => {
    await writeConfig('smtp', { host: 'mail.example.com', password: 'hunter2' }, ['password']);

    const raw = store.get('config:smtp') as Record<string, string>;
    expect(raw.host).toBe('mail.example.com');
    expect(raw.password).not.toBe('hunter2');
    expect(raw.password.startsWith('v1.')).toBe(true);

    expect(await readConfig('smtp', ['password'])).toMatchObject({ password: 'hunter2' });
  });

  it('treats an empty secret as "leave it alone", not "delete it"', async () => {
    await writeConfig('smtp', { host: 'one', password: 'hunter2' }, ['password']);
    // The admin cannot show a password, so an untouched field arrives empty.
    // Treating that as a deletion would wipe the setting every time somebody
    // changed the port number.
    await writeConfig('smtp', { host: 'two', password: '' }, ['password']);

    const config = await readConfig('smtp', ['password']);
    expect(config).toMatchObject({ host: 'two', password: 'hunter2' });
  });

  it('returns null for an integration nobody has configured', async () => {
    expect(await readConfig('nothing', [])).toBeNull();
  });

  it('forgets everything on clear', async () => {
    await writeConfig('smtp', { host: 'one' }, []);
    await clearConfig('smtp');
    expect(await readConfig('smtp', [])).toBeNull();
  });

  it('reads a value it can no longer decrypt as empty rather than failing', async () => {
    await writeConfig('smtp', { host: 'one', password: 'hunter2' }, ['password']);
    // The operator rotated OPB_SECRET_KEY. The host is still useful; the
    // password is gone. Losing the screen entirely would be worse.
    process.env.OPB_SECRET_KEY = 'a-new-secret-after-rotation';

    const config = await readConfig('smtp', ['password']);
    expect(config).toMatchObject({ host: 'one', password: '' });
  });
});

describe('what the browser is told', () => {
  it('says a secret is set and shows only its tail', () => {
    expect(hintFor('')).toEqual({ isSet: false });

    const hint = hintFor('super-secret-key-abcd');
    expect(hint.isSet).toBe(true);
    expect(hint.hint).toBe('••••abcd');
    expect(hint.hint).not.toContain('super');
  });

  it('does not leak a short secret by showing all of it', () => {
    expect(hintFor('abc').hint).toBe('••••');
  });
});
