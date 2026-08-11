import 'server-only';
import postgres, { type Sql } from 'postgres';
import type { CMSState, ContactMessage } from '@/cms/types/cms';
import type {
  Channel,
  HealthReport,
  KvAdapter,
  KvNamespace,
  MessagesAdapter,
  OwnerRecord,
} from '../../contract';

/**
 * Content, owner and short-lived state over plain SQL.
 *
 * Shared by every Postgres-backed adapter — Supabase, Neon, and any connection
 * string a self-hoster brings — because they differ only in *where* the
 * database is, not in how it behaves. Writing this once means one schema, one
 * set of queries, and one place a bug can hide instead of several.
 *
 * Media is deliberately not here: each provider has its own object store, and
 * those genuinely do differ.
 */

let cached: Sql | null = null;

export function getSql(connectionString: string): Sql {
  if (cached) return cached;
  cached = postgres(connectionString, {
    // Serverless invocations are short-lived and numerous; a large pool per
    // instance exhausts the database's connection limit long before it helps.
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // transaction-mode poolers (Supabase, Neon) reject prepared statements
  });
  return cached;
}

/** Test seam. */
export function resetSql(): void {
  cached = null;
}

/**
 * Creates the schema.
 *
 * Runs automatically on boot rather than asking the user to paste SQL into a
 * dashboard — someone who has never seen a database should not have to run a
 * migration to put their name on a website. Every statement is
 * `IF NOT EXISTS`, so a second run is free.
 */
export async function provisionSchema(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS opb_content (
      channel     text PRIMARY KEY,
      data        jsonb NOT NULL,
      updated_at  timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS opb_owner (
      id               boolean PRIMARY KEY DEFAULT true,
      email            text NOT NULL,
      passphrase_hash  text NOT NULL,
      created_at       timestamptz NOT NULL,
      session_epoch    integer NOT NULL DEFAULT 1,
      -- Pins the table to a single row. There is exactly one owner, and a
      -- constraint says so more reliably than every caller remembering to.
      CONSTRAINT opb_owner_singleton CHECK (id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS opb_kv (
      ns          text NOT NULL,
      key         text NOT NULL,
      value       jsonb NOT NULL,
      expires_at  timestamptz NOT NULL,
      PRIMARY KEY (ns, key)
    )
  `;

  // Expired rows are swept lazily on write; this makes that sweep cheap.
  await sql`CREATE INDEX IF NOT EXISTS opb_kv_expires_at_idx ON opb_kv (expires_at)`;

  await sql`
    CREATE TABLE IF NOT EXISTS opb_messages (
      id           text PRIMARY KEY,
      received_at  timestamptz NOT NULL,
      data         jsonb NOT NULL
    )
  `;

  // `list` only ever orders newest-first; the index matches that, not the
  // primary key.
  await sql`
    CREATE INDEX IF NOT EXISTS opb_messages_received_at_idx
      ON opb_messages (received_at DESC)
  `;
}

export async function health(sql: Sql, label: string): Promise<HealthReport> {
  const started = Date.now();
  try {
    await sql`SELECT 1`;
    return { ok: true, detail: `Connected to ${label}`, latencyMs: Date.now() - started };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : 'Could not reach the database.',
      latencyMs: Date.now() - started,
    };
  }
}

export async function readSnapshot(sql: Sql, channel: Channel): Promise<CMSState | null> {
  const rows = await sql<{ data: CMSState }[]>`
    SELECT data FROM opb_content WHERE channel = ${channel}
  `;
  return rows[0]?.data ?? null;
}

export async function writeSnapshot(sql: Sql, channel: Channel, state: CMSState): Promise<void> {
  // One statement, so a concurrent write cannot interleave and produce a
  // document that is half one version and half another.
  await sql`
    INSERT INTO opb_content (channel, data, updated_at)
    VALUES (${channel}, ${sql.json(state as never)}, now())
    ON CONFLICT (channel) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;
}

export async function readOwner(sql: Sql): Promise<OwnerRecord | null> {
  const rows = await sql<
    { email: string; passphrase_hash: string; created_at: Date; session_epoch: number }[]
  >`SELECT email, passphrase_hash, created_at, session_epoch FROM opb_owner WHERE id = true`;

  const row = rows[0];
  if (!row) return null;

  return {
    email: row.email,
    passphraseHash: row.passphrase_hash,
    createdAt: new Date(row.created_at).toISOString(),
    sessionEpoch: row.session_epoch,
  };
}

export async function writeOwner(sql: Sql, owner: OwnerRecord): Promise<void> {
  await sql`
    INSERT INTO opb_owner (id, email, passphrase_hash, created_at, session_epoch)
    VALUES (true, ${owner.email}, ${owner.passphraseHash}, ${owner.createdAt}, ${owner.sessionEpoch})
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      passphrase_hash = EXCLUDED.passphrase_hash,
      session_epoch = EXCLUDED.session_epoch
  `;
}

export function makeKvAdapter(getConnection: () => Sql): KvAdapter {
  return {
    async get<T>(ns: KvNamespace, key: string): Promise<T | null> {
      const sql = getConnection();
      // Expiry is filtered in the query rather than after it, so a stale row
      // that has not been swept yet can never be returned as live.
      const rows = await sql<{ value: T }[]>`
        SELECT value FROM opb_kv WHERE ns = ${ns} AND key = ${key} AND expires_at > now()
      `;
      return rows[0]?.value ?? null;
    },

    async set<T>(ns: KvNamespace, key: string, value: T, ttlSeconds: number): Promise<void> {
      const sql = getConnection();
      await sql`
        INSERT INTO opb_kv (ns, key, value, expires_at)
        VALUES (${ns}, ${key}, ${sql.json(value as never)}, now() + ${`${ttlSeconds} seconds`}::interval)
        ON CONFLICT (ns, key) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at
      `;
    },

    async del(ns: KvNamespace, key: string): Promise<void> {
      const sql = getConnection();
      await sql`DELETE FROM opb_kv WHERE ns = ${ns} AND key = ${key}`;
    },

    async incr(ns: KvNamespace, key: string, ttlSeconds: number): Promise<number> {
      const sql = getConnection();
      // Atomic: two simultaneous requests must not both read 4 and both write
      // 5, or a rate limit can be walked past by making requests in parallel.
      // The window is not extended on a hit, so a steady stream of traffic
      // cannot hold a counter open indefinitely.
      const rows = await sql<{ value: number }[]>`
        INSERT INTO opb_kv (ns, key, value, expires_at)
        VALUES (${ns}, ${key}, '1'::jsonb, now() + ${`${ttlSeconds} seconds`}::interval)
        ON CONFLICT (ns, key) DO UPDATE SET
          value = CASE
            WHEN opb_kv.expires_at > now()
              THEN ((opb_kv.value)::text::numeric + 1)::text::jsonb
            ELSE '1'::jsonb
          END,
          expires_at = CASE
            WHEN opb_kv.expires_at > now() THEN opb_kv.expires_at
            ELSE now() + ${`${ttlSeconds} seconds`}::interval
          END
        RETURNING (value)::text::numeric AS value
      `;
      return Number(rows[0]?.value ?? 1);
    },

    async clear(ns: KvNamespace): Promise<void> {
      const sql = getConnection();
      await sql`DELETE FROM opb_kv WHERE ns = ${ns}`;
    },
  };
}

/**
 * The inbox, as a table.
 *
 * `append` is a single INSERT, so it is atomic without a lock and fifty
 * simultaneous enquiries produce fifty rows. `ON CONFLICT DO NOTHING` makes it
 * safe to replay, which is what lets the migration out of the snapshot run on
 * every boot without duplicating anything.
 */
export function makeMessagesAdapter(getConnection: () => Sql): MessagesAdapter {
  return {
    async append(message) {
      const sql = getConnection();
      await sql`
        INSERT INTO opb_messages (id, received_at, data)
        VALUES (${message.id}, ${message.receivedAt}, ${sql.json(message as never)})
        ON CONFLICT (id) DO NOTHING
      `;
    },

    async list(options) {
      const sql = getConnection();
      const limit = options?.limit ?? null;
      const rows = limit
        ? await sql<{ data: ContactMessage }[]>`
            SELECT data FROM opb_messages ORDER BY received_at DESC LIMIT ${limit}
          `
        : await sql<{ data: ContactMessage }[]>`
            SELECT data FROM opb_messages ORDER BY received_at DESC
          `;
      return rows.map((row) => row.data);
    },

    async update(id, patch) {
      const sql = getConnection();
      // `||` is a shallow merge, which is exactly what a patch is. Doing it in
      // the database rather than read-modify-write keeps a concurrent status
      // change from clobbering a concurrent notification result.
      await sql`
        UPDATE opb_messages
           SET data = data || ${sql.json(patch as never)}
         WHERE id = ${id}
      `;
    },

    async remove(id) {
      const sql = getConnection();
      await sql`DELETE FROM opb_messages WHERE id = ${id}`;
    },
  };
}
