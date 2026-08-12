import { describe, expect, it } from 'vitest';
import { runConformanceSuite } from '../conformance';
import type { StorageAdapter } from '../contract';

/**
 * The shared SQL engine against a real Postgres.
 *
 * Supabase and Neon differ only in where the database lives and where uploads
 * go; the SQL underneath is identical and is where the interesting bugs are —
 * the atomic counter, the jsonb round-trip, the single-owner constraint,
 * expiry filtering. Running it against a genuine Postgres verifies the majority
 * of both adapters without needing an account for either.
 *
 * Set TEST_POSTGRES_URL to run it. CI does this with a service container, so
 * every push exercises it even though most contributors will not have a
 * database to hand.
 */
const TEST_URL = process.env.TEST_POSTGRES_URL;

if (TEST_URL) {
  const loadReal = async (): Promise<StorageAdapter> => {
    // The adapter reads its connection string from the same variables a real
    // deployment would, so point one of them at the test database rather than
    // teaching the adapter about a test-only variable.
    process.env.DATABASE_URL = TEST_URL;
    return (await import('../adapters/postgres')).postgresAdapter;
  };

  const load = async (): Promise<StorageAdapter> => {
    const pg = await import('../adapters/_shared/postgres');
    const { migrateSnapshotMessages } = await import('../adapters/_shared/migrate-messages');
    const sql = () => pg.getSql(TEST_URL);
    // Bound once so `provision` and the adapter's own `messages` member are
    // the same object, the way every shipped adapter wires it.
    const messages = pg.makeMessagesAdapter(sql);

    // Media is not part of the SQL engine, so it is stubbed and its tests are
    // skipped rather than pretended.
    return {
      id: 'neon',
      displayName: 'Postgres engine under test',
      docsUrl: '',
      capabilities: {
        durable: true,
        auth: 'none',
        fileStorage: 'none',
        maxUploadBytes: 0,
        fullTextSearch: true,
        realtime: false,
        transactions: true,
        worksOnEphemeralHosts: true,
      },
      health: () => pg.health(sql(), 'test Postgres'),
      provision: async () => {
        await pg.provisionSchema(sql());
        // Not part of the SQL engine's own provisioning, but every shipped
        // adapter runs it from `provision()` and this double stands in for
        // one in the "shared Postgres engine" suite — omitting it here would
        // leave the migration untested against a real database.
        await migrateSnapshotMessages({
          readSnapshot: (channel) => pg.readSnapshot(sql(), channel),
          writeSnapshot: (channel, state) => pg.writeSnapshot(sql(), channel, state),
          listMessages: () => messages.list(),
          appendMessage: (message) => messages.append(message),
        });
      },
      readSnapshot: (channel) => pg.readSnapshot(sql(), channel),
      readSnapshotMeta: (channel) => pg.readSnapshotMeta(sql(), channel),
      writeSnapshot: (channel, state, expected) =>
        pg.writeSnapshot(sql(), channel, state, expected),
      readOwner: () => pg.readOwner(sql()),
      writeOwner: (owner) => pg.writeOwner(sql(), owner),
      kv: pg.makeKvAdapter(sql),
      subscribers: pg.makeSubscribersAdapter(sql),
      media: {
        put: async () => {
          throw new Error('not part of the SQL engine');
        },
        resolveUrl: async () => null,
        remove: async () => {},
        list: async () => [],
      },
      messages,
    };
  };

  // The shipped adapter, media included: it stores uploads on disk, so unlike
  // the hosted pair every part of it can be exercised here.
  runConformanceSuite({ describe, it, expect } as never, 'postgres adapter', loadReal, async () => {
    const { getSql, provisionSchema } = await import('../adapters/_shared/postgres');
    const sql = getSql(TEST_URL);
    await provisionSchema(sql);
    await sql`TRUNCATE opb_content, opb_owner, opb_kv, opb_messages, opb_subscribers`;
    const { rm } = await import('node:fs/promises');
    const path = await import('node:path');
    await rm(path.join(process.cwd(), '.opb', 'media'), { recursive: true, force: true });
  });

  runConformanceSuite(
    { describe, it, expect } as never,
    'shared Postgres engine',
    load,
    async () => {
      const { getSql, provisionSchema } = await import('../adapters/_shared/postgres');
      const sql = getSql(TEST_URL);
      await provisionSchema(sql);
      await sql`TRUNCATE opb_content, opb_owner, opb_kv, opb_messages, opb_subscribers`;
    },
    { skipMedia: true }
  );
} else {
  describe('storage conformance: shared Postgres engine', () => {
    it.skip('set TEST_POSTGRES_URL to run this against a real database', () => {});
  });
}
