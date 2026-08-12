import { describe, expect, it } from 'vitest';
import { runConformanceSuite } from '../conformance';

/**
 * The hosted adapters against the same suite the local one passes.
 *
 * They are skipped unless real credentials are present, because there is no
 * honest way to test a database that is not there — a mock would only prove the
 * mock works. Set the variables below and these run for real; CI runs them on a
 * schedule with test projects.
 *
 * If you are adding a backend, this is the bar: green here, or it does not ship.
 */

const SUPABASE_READY = Boolean(
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  (process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL)
);

const NEON_READY = Boolean(
  (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL) && process.env.BLOB_READ_WRITE_TOKEN
);

async function truncate(adapter: { provision: () => Promise<void> }) {
  await adapter.provision();
  const { getSql } = await import('../adapters/_shared/postgres');
  const url =
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_URL!;
  const sql = getSql(url);
  await sql`TRUNCATE opb_content, opb_owner, opb_kv, opb_messages, opb_subscribers`;
}

if (SUPABASE_READY) {
  const load = async () => (await import('../adapters/supabase')).supabaseAdapter;
  runConformanceSuite({ describe, it, expect } as never, 'supabase', load, async () =>
    truncate(await load())
  );
} else {
  describe('storage conformance: supabase', () => {
    it.skip('needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_DB_URL', () => {});
  });
}

if (NEON_READY) {
  const load = async () => (await import('../adapters/neon')).neonAdapter;
  runConformanceSuite({ describe, it, expect } as never, 'neon', load, async () =>
    truncate(await load())
  );
} else {
  describe('storage conformance: neon', () => {
    it.skip('needs DATABASE_URL and BLOB_READ_WRITE_TOKEN', () => {});
  });
}
