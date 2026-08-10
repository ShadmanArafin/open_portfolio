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
  const load = async (): Promise<StorageAdapter> => {
    const pg = await import('../adapters/_shared/postgres');
    const sql = () => pg.getSql(TEST_URL);

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
      provision: () => pg.provisionSchema(sql()),
      readSnapshot: (channel) => pg.readSnapshot(sql(), channel),
      writeSnapshot: (channel, state) => pg.writeSnapshot(sql(), channel, state),
      readOwner: () => pg.readOwner(sql()),
      writeOwner: (owner) => pg.writeOwner(sql(), owner),
      kv: pg.makeKvAdapter(sql),
      media: {
        put: async () => {
          throw new Error('not part of the SQL engine');
        },
        resolveUrl: async () => null,
        remove: async () => {},
        list: async () => [],
      },
    };
  };

  runConformanceSuite(
    { describe, it, expect } as never,
    'shared Postgres engine',
    load,
    async () => {
      const { getSql, provisionSchema } = await import('../adapters/_shared/postgres');
      const sql = getSql(TEST_URL);
      await provisionSchema(sql);
      await sql`TRUNCATE opb_content, opb_owner, opb_kv`;
    },
    { skipMedia: true }
  );
} else {
  describe('storage conformance: shared Postgres engine', () => {
    it.skip('set TEST_POSTGRES_URL to run this against a real database', () => {});
  });
}
