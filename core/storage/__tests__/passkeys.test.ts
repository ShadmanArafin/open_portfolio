import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { PasskeyCredential, StorageAdapter } from '../contract';

/**
 * Passkey credential storage, on every backend that ships.
 *
 * Storage only — the registration/authentication ceremonies are the next
 * slice. What is pinned here: a credential enrolled anywhere is readable
 * everywhere on that backend, counter updates merge rather than replace,
 * unknown ids are ignored, and none of it ever enters a content backup.
 */

function credential(id: string, counter = 0): PasskeyCredential {
  return {
    id,
    publicKey: Buffer.from(`cose-key-for-${id}`).toString('base64'),
    counter,
    transports: ['internal', 'hybrid'],
    deviceName: `Device ${id}`,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    backedUp: false,
  };
}

/** Registered synchronously; the adapter loads lazily inside each test. */
function passkeySuite(name: string, load: () => Promise<StorageAdapter>): void {
  describe(`${name}: passkeys`, () => {
    it('round-trips put/get/list in enrolment order', async () => {
      const adapter = await load();
      await adapter.provision();
      const a = credential('cred-a');
      const b = credential('cred-b');
      await adapter.passkeys.put(a);
      await adapter.passkeys.put(b);
      expect(await adapter.passkeys.get('cred-a')).toEqual(a);
      expect((await adapter.passkeys.list()).map((c) => c.id)).toEqual(['cred-a', 'cred-b']);
    });

    it('re-put replaces rather than duplicates', async () => {
      const adapter = await load();
      await adapter.passkeys.put({ ...credential('cred-a'), counter: 7 });
      expect(await adapter.passkeys.get('cred-a')).toMatchObject({ counter: 7 });
      expect((await adapter.passkeys.list()).filter((c) => c.id === 'cred-a')).toHaveLength(1);
    });

    it('counter updates merge; unknown ids are ignored', async () => {
      const adapter = await load();
      await adapter.passkeys.update('cred-a', {
        counter: 8,
        lastUsedAt: '2026-01-01T00:00:00.000Z',
      });
      expect(await adapter.passkeys.get('cred-a')).toMatchObject({
        counter: 8,
        lastUsedAt: '2026-01-01T00:00:00.000Z',
        deviceName: 'Device cred-a',
      });
      await adapter.passkeys.update('no-such-credential', { counter: 1 });
      await adapter.passkeys.remove('no-such-credential');
    });

    it('removes by id', async () => {
      const adapter = await load();
      await adapter.passkeys.remove('cred-b');
      expect(await adapter.passkeys.get('cred-b')).toBeNull();
      expect((await adapter.passkeys.list()).map((c) => c.id)).toEqual(['cred-a']);
      await adapter.passkeys.remove('cred-a');
      expect(await adapter.passkeys.list()).toEqual([]);
    });

    it('never enters a content backup', async () => {
      const adapter = await load();
      const { buildBackup } = await import('@/core/backup/bundle');
      await adapter.passkeys.put(credential('cred-secret'));
      const bundle = buildBackup({
        adapterId: adapter.id,
        published: await adapter.readSnapshot('published'),
        draft: await adapter.readSnapshot('draft'),
        media: [],
      });
      const wire = JSON.stringify(bundle);
      expect(wire).not.toContain('cred-secret');
      expect(wire).not.toContain(Buffer.from('cose-key-for-cred-secret').toString('base64'));
      await adapter.passkeys.remove('cred-secret');
    });
  });
}

const originalCwd = process.cwd();
let workDir: string;

beforeAll(async () => {
  workDir = await mkdtemp(path.join(tmpdir(), 'opb-passkeys-'));
  process.chdir(workDir);
});

afterAll(async () => {
  process.chdir(originalCwd);
  await rm(workDir, { recursive: true, force: true });
});

describe('passkey storage', () => {
  passkeySuite('local adapter', async () => (await import('../adapters/local')).localAdapter);

  let demoReset = false;
  passkeySuite('demo adapter', async () => {
    const { demoAdapter, __resetDemoSandboxes } = await import('../adapters/demo');
    // Once per suite, not per test: the five tests share one enrolment each
    // building on the last, the way a real enrolment-then-sign-in flow does.
    if (!demoReset) {
      __resetDemoSandboxes();
      demoReset = true;
    }
    return demoAdapter;
  });

  const testUrl = process.env.TEST_POSTGRES_URL;
  if (testUrl) {
    let truncated = false;
    passkeySuite('shared postgres engine', async () => {
      process.env.DATABASE_URL = testUrl;
      const pg = await import('../adapters/_shared/postgres');
      const sql = () => pg.getSql(testUrl);
      await pg.provisionSchema(sql());
      // Once per suite: the tests share one enrolment sequence, and a stale
      // row from a previous run would read as a duplicate.
      if (!truncated) {
        await sql()`TRUNCATE opb_passkeys`;
        truncated = true;
      }
      const messages = pg.makeMessagesAdapter(sql);
      const adapter: StorageAdapter = {
        id: 'postgres',
        displayName: 'passkey probe',
        docsUrl: '',
        capabilities: {
          durable: true,
          auth: 'none',
          fileStorage: 'none',
          maxUploadBytes: 0,
          fullTextSearch: false,
          realtime: false,
          transactions: true,
          worksOnEphemeralHosts: true,
        },
        health: () => pg.health(sql(), 'probe'),
        provision: () => pg.provisionSchema(sql()),
        readSnapshot: (channel) => pg.readSnapshot(sql(), channel),
        readSnapshotMeta: (channel) => pg.readSnapshotMeta(sql(), channel),
        writeSnapshot: (channel, state, expected) =>
          pg.writeSnapshot(sql(), channel, state, expected),
        readOwner: () => pg.readOwner(sql()),
        writeOwner: (owner) => pg.writeOwner(sql(), owner),
        kv: pg.makeKvAdapter(sql),
        media: {
          put: async () => {
            throw new Error('not part of this probe');
          },
          resolveUrl: async () => null,
          remove: async () => {},
          list: async () => [],
        },
        messages,
        subscribers: pg.makeSubscribersAdapter(sql),
        passkeys: pg.makePasskeysAdapter(sql),
        records: pg.makeRecordsAdapter(sql),
      };
      return adapter;
    });
  } else {
    it.skip('shared postgres engine needs TEST_POSTGRES_URL', () => {});
  }
});
