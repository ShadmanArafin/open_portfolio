import 'server-only';
import path from 'node:path';
import { Miniflare } from 'miniflare';
import type { CMSState, ContactMessage } from '@/cms/types/cms';
import type { Subscriber } from '@/core/newsletter/schema';
import type {
  Channel,
  HealthReport,
  KvAdapter,
  KvNamespace,
  MediaAdapter,
  MediaRecord,
  MessageListOptions,
  MessagesAdapter,
  OwnerRecord,
  PasskeyCredential,
  PasskeysAdapter,
  RecordListOptions,
  RecordPage,
  RecordsAdapter,
  SnapshotRead,
  StorageAdapter,
  StoredRecord,
  SubscribersAdapter,
} from '../contract';
import { RevisionConflictError } from '../contract';
import { assertRecordAddress, decodeRecordCursor, encodeRecordCursor } from '../contract';
import { dataRoot } from './_shared/data-dir';
import { migrateSnapshotMessages } from './_shared/migrate-messages';

/**
 * Cloudflare D1 (SQLite engine) for records, R2 for files — running anywhere.
 *
 * This is the D1 and R2 *engines*, embedded via Miniflare and persisted to
 * disk, not a connection to Cloudflare's cloud: it runs on a VPS, in Docker,
 * on a Raspberry Pi, with no account and no API token. Selecting it is
 * explicit (`OPB_ADAPTER=cloudflare`) — the presence of Cloudflare account
 * variables alone never selects a store that keeps its bytes on this machine,
 * because that would silently ignore credentials the operator set.
 *
 * What this buys beyond the filesystem adapter: real SQL with real indexes
 * (the dialect is D1's SQLite, so queries written here run unchanged on D1
 * proper), and the real R2 object API (put/get/delete/list with metadata)
 * rather than files standing in for objects. The Workers-native REST binding
 * — running inside Cloudflare's runtime against their account — is a separate
 * slice that needs an account to verify, and is not this file.
 *
 * Two honest constraints, both documented where they bite:
 *
 * - Conditional writes are serialised in this process (the same per-target
 *   queue the filesystem, PocketBase and Appwrite adapters use): SQLite could
 *   do better, but a single queue is correct everywhere and one mechanism is
 *   easier to reason about than two.
 * - Media resolves to the same-origin proxy (`/api/media/<key>`) and streams
 *   through `readBytes`, because a local R2 namespace has no public URL. The
 *   media route prefers remote URLs, then this, then the disk — in that order.
 */

const ROOT = process.env.OPB_CLOUDFLARE_DIR ?? path.join(dataRoot(), 'cloudflare');
// In-memory engines for tests: same D1 SQLite and R2 semantics with no files,
// so there is nothing to clean up and no file locks to fight at teardown.
// Production always persists — this is test-only.
const IN_MEMORY = process.env.OPB_CLOUDFLARE_MEMORY === '1';

let miniflare: Miniflare | null = null;

async function mf(): Promise<Miniflare> {
  if (!miniflare) {
    miniflare = new Miniflare({
      // Storage bindings need an enclosing worker even when nothing ever
      // fetches it: Miniflare refuses to boot binding-only. The script below
      // is never served; it exists to satisfy the constructor.
      modules: true,
      script: 'export default { fetch() { return new Response("opb"); } };',
      d1Databases: ['OPB_DB'],
      r2Buckets: ['OPB_MEDIA'],
      ...(IN_MEMORY
        ? {}
        : {
            d1Persist: path.join(ROOT, 'd1'),
            r2Persist: path.join(ROOT, 'r2'),
          }),
    });
  }
  return miniflare;
}

/** Test seam: shuts the runtime down so a fresh one boots on next use. */
export async function __resetCloudflare(): Promise<void> {
  if (miniflare) {
    const previous = miniflare;
    miniflare = null;
    await previous.dispose().catch(() => {});
  }
}

/**
 * Test seam: empties every table and the media namespace without rebooting
 * the runtime. Re-instantiating Miniflare per test would reboot workerd fifty
 * times; SQL deletes are cheap and isolates are not.
 */
export async function __wipeCloudflare(): Promise<void> {
  const database = await d1();
  for (const table of [
    'opb_content',
    'opb_owner',
    'opb_kv',
    'opb_messages',
    'opb_subscribers',
    'opb_passkeys',
    'opb_records',
    'opb_singletons',
  ]) {
    await database.prepare(`DELETE FROM ${table}`).run();
  }
  const bucket = await r2();
  const listed = await bucket.list();
  await Promise.all((listed.objects ?? []).map((object) => bucket.delete(object.key)));
}

import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

async function d1(): Promise<D1Database> {
  return (await mf()).getD1Database('OPB_DB') as unknown as D1Database;
}

async function r2(): Promise<R2Bucket> {
  return (await mf()).getR2Bucket('OPB_MEDIA') as unknown as R2Bucket;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS opb_content (
    channel TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS opb_owner (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    email TEXT NOT NULL,
    passphrase_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    session_epoch INTEGER NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS opb_kv (
    ns TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER,
    PRIMARY KEY (ns, key)
  )`,
  `CREATE INDEX IF NOT EXISTS opb_kv_expires_idx ON opb_kv (expires_at)`,
  `CREATE TABLE IF NOT EXISTS opb_messages (
    id TEXT PRIMARY KEY,
    received_at TEXT NOT NULL,
    data TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS opb_messages_received_idx ON opb_messages (received_at DESC)`,
  `CREATE TABLE IF NOT EXISTS opb_subscribers (
    id TEXT PRIMARY KEY,
    requested_at TEXT NOT NULL,
    data TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS opb_subscribers_requested_idx ON opb_subscribers (requested_at DESC)`,
  `CREATE TABLE IF NOT EXISTS opb_passkeys (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    data TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS opb_passkeys_created_idx ON opb_passkeys (created_at ASC)`,
  `CREATE TABLE IF NOT EXISTS opb_records (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    data TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (collection, id)
  )`,
  `CREATE INDEX IF NOT EXISTS opb_records_updated_idx ON opb_records (collection, updated_at DESC)`,
  `CREATE TABLE IF NOT EXISTS opb_singletons (
    collection TEXT PRIMARY KEY,
    data TEXT NOT NULL
  )`,
];

/**
 * Serialises operations per target (see the file comment: one mechanism,
 * correct everywhere).
 */
const writeQueues = new Map<string, Promise<void>>();

function runQueued<T>(target: string, fn: () => Promise<T>): Promise<T> {
  const previous = writeQueues.get(target) ?? Promise.resolve();
  const run = previous.catch(() => {}).then(fn);
  const settled = run.then(
    () => {},
    () => {}
  );
  writeQueues.set(target, settled);
  return run.finally(() => {
    if (writeQueues.get(target) === settled) writeQueues.delete(target);
  });
}

const snapshots = {
  async read(channel: Channel): Promise<CMSState | null> {
    return (await snapshots.readMeta(channel))?.state ?? null;
  },

  async readMeta(channel: Channel): Promise<SnapshotRead | null> {
    const row = await (
      await d1()
    )
      .prepare('SELECT data, revision FROM opb_content WHERE channel = ?1')
      .bind(channel)
      .first<{ data: string; revision: number }>();
    if (!row) return null;
    return { state: JSON.parse(row.data) as CMSState, revision: row.revision };
  },

  async write(channel: Channel, state: CMSState, expectedRevision?: number): Promise<number> {
    return runQueued(`content:${channel}`, async () => {
      const database = await d1();
      const current = await database
        .prepare('SELECT revision FROM opb_content WHERE channel = ?1')
        .bind(channel)
        .first<{ revision: number }>();
      const currentRevision = current?.revision ?? 0;

      if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
        throw new RevisionConflictError(expectedRevision, currentRevision);
      }

      const revision = currentRevision + 1;
      await database
        .prepare(
          `INSERT INTO opb_content (channel, data, revision)
           VALUES (?1, ?2, ?3)
           ON CONFLICT (channel) DO UPDATE SET data = excluded.data, revision = excluded.revision`
        )
        .bind(channel, JSON.stringify(state), revision)
        .run();
      return revision;
    });
  },
};

interface KvRow {
  value: string;
  expires_at: number | null;
}

function kvLive(row: KvRow | null | undefined): boolean {
  if (!row) return false;
  if (row.expires_at === null || row.expires_at === undefined) return true;
  return row.expires_at > Date.now();
}

const kv: KvAdapter = {
  async get<T>(ns: KvNamespace, key: string): Promise<T | null> {
    const row = await (
      await d1()
    )
      .prepare('SELECT value, expires_at FROM opb_kv WHERE ns = ?1 AND key = ?2')
      .bind(ns, key)
      .first<KvRow>();
    if (!kvLive(row)) return null;
    return JSON.parse((row as KvRow).value) as T;
  },

  async set<T>(ns: KvNamespace, key: string, value: T, ttlSeconds?: number) {
    await runQueued(`kv:${ns}:${key}`, async () => {
      const database = await d1();
      await database
        .prepare(
          `INSERT INTO opb_kv (ns, key, value, expires_at)
           VALUES (?1, ?2, ?3, ?4)
           ON CONFLICT (ns, key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at`
        )
        .bind(
          ns,
          key,
          JSON.stringify(value),
          ttlSeconds === undefined ? null : Date.now() + ttlSeconds * 1000
        )
        .run();
      // Best-effort sweep of expired siblings, bounded: kv is counters and
      // codes, never content.
      await database
        .prepare('DELETE FROM opb_kv WHERE expires_at IS NOT NULL AND expires_at <= ?1')
        .bind(Date.now())
        .run();
    });
  },

  async del(ns: KvNamespace, key: string) {
    await (await d1()).prepare('DELETE FROM opb_kv WHERE ns = ?1 AND key = ?2').bind(ns, key).run();
  },

  async incr(ns: KvNamespace, key: string, ttlSeconds: number): Promise<number> {
    return runQueued(`kv:${ns}:${key}`, async () => {
      const database = await d1();
      const row = await database
        .prepare('SELECT value, expires_at FROM opb_kv WHERE ns = ?1 AND key = ?2')
        .bind(ns, key)
        .first<KvRow>();
      // A live row keeps its original window: refreshing the TTL on every hit
      // would let a steady stream hold a rate-limit counter open forever.
      if (kvLive(row)) {
        const next = (JSON.parse((row as KvRow).value) as number) + 1;
        await database
          .prepare('UPDATE opb_kv SET value = ?1 WHERE ns = ?2 AND key = ?3')
          .bind(JSON.stringify(next), ns, key)
          .run();
        return next;
      }
      await database
        .prepare('INSERT INTO opb_kv (ns, key, value, expires_at) VALUES (?1, ?2, ?3, ?4)')
        .bind(ns, key, '1', Date.now() + ttlSeconds * 1000)
        .run();
      return 1;
    });
  },

  async clear(ns: KvNamespace) {
    await (await d1()).prepare('DELETE FROM opb_kv WHERE ns = ?1').bind(ns).run();
  },
};

const messages: MessagesAdapter = {
  async append(message) {
    await (
      await d1()
    )
      .prepare('INSERT INTO opb_messages (id, received_at, data) VALUES (?1, ?2, ?3)')
      .bind(message.id, message.receivedAt, JSON.stringify(message))
      .run();
  },

  async list(options?: MessageListOptions) {
    const database = await d1();
    const rows = options?.limit
      ? await database
          .prepare('SELECT data FROM opb_messages ORDER BY received_at DESC LIMIT ?1')
          .bind(options.limit)
          .all<{ data: string }>()
      : await database
          .prepare('SELECT data FROM opb_messages ORDER BY received_at DESC')
          .all<{ data: string }>();
    return (rows.results ?? []).map((row) => JSON.parse(row.data) as ContactMessage);
  },

  async update(id, patch) {
    await runQueued(`message:${id}`, async () => {
      const database = await d1();
      const row = await database
        .prepare('SELECT data FROM opb_messages WHERE id = ?1')
        .bind(id)
        .first<{ data: string }>();
      if (!row) return;
      const existing = JSON.parse(row.data) as ContactMessage;
      await database
        .prepare('UPDATE opb_messages SET data = ?1 WHERE id = ?2')
        .bind(JSON.stringify({ ...existing, ...patch, id }), id)
        .run();
    });
  },

  async remove(id) {
    await (await d1()).prepare('DELETE FROM opb_messages WHERE id = ?1').bind(id).run();
  },
};

const subscribers: SubscribersAdapter = {
  async append(subscriber) {
    await (
      await d1()
    )
      .prepare('INSERT INTO opb_subscribers (id, requested_at, data) VALUES (?1, ?2, ?3)')
      .bind(subscriber.id, subscriber.requestedAt, JSON.stringify(subscriber))
      .run();
  },

  async list() {
    const rows = await (
      await d1()
    )
      .prepare('SELECT data FROM opb_subscribers ORDER BY requested_at DESC')
      .all<{ data: string }>();
    return (rows.results ?? []).map((row) => JSON.parse(row.data) as Subscriber);
  },

  async update(id, patch) {
    await runQueued(`subscriber:${id}`, async () => {
      const database = await d1();
      const row = await database
        .prepare('SELECT data FROM opb_subscribers WHERE id = ?1')
        .bind(id)
        .first<{ data: string }>();
      if (!row) return;
      const existing = JSON.parse(row.data) as Subscriber;
      await database
        .prepare('UPDATE opb_subscribers SET data = ?1 WHERE id = ?2')
        .bind(JSON.stringify({ ...existing, ...patch, id }), id)
        .run();
    });
  },

  async remove(id) {
    await (await d1()).prepare('DELETE FROM opb_subscribers WHERE id = ?1').bind(id).run();
  },
};

const passkeys: PasskeysAdapter = {
  async list() {
    const rows = await (
      await d1()
    )
      .prepare('SELECT data FROM opb_passkeys ORDER BY created_at ASC')
      .all<{ data: string }>();
    return (rows.results ?? [])
      .map((row) => JSON.parse(row.data) as PasskeyCredential)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async get(id) {
    const row = await (
      await d1()
    )
      .prepare('SELECT data FROM opb_passkeys WHERE id = ?1')
      .bind(id)
      .first<{ data: string }>();
    return row ? (JSON.parse(row.data) as PasskeyCredential) : null;
  },

  async put(credential) {
    await runQueued(`passkey:${credential.id}`, async () => {
      await (
        await d1()
      )
        .prepare(
          `INSERT INTO opb_passkeys (id, created_at, data) VALUES (?1, ?2, ?3)
           ON CONFLICT (id) DO UPDATE SET created_at = excluded.created_at, data = excluded.data`
        )
        .bind(credential.id, credential.createdAt, JSON.stringify(credential))
        .run();
    });
  },

  async update(id, patch) {
    await runQueued(`passkey:${id}`, async () => {
      const database = await d1();
      const row = await database
        .prepare('SELECT data FROM opb_passkeys WHERE id = ?1')
        .bind(id)
        .first<{ data: string }>();
      if (!row) return;
      const { id: _ignored, ...rest } = patch;
      const existing = JSON.parse(row.data) as PasskeyCredential;
      await database
        .prepare('UPDATE opb_passkeys SET data = ?1 WHERE id = ?2')
        .bind(JSON.stringify({ ...existing, ...rest, id }), id)
        .run();
    });
  },

  async remove(id) {
    await (await d1()).prepare('DELETE FROM opb_passkeys WHERE id = ?1').bind(id).run();
  },
};

const records: RecordsAdapter = {
  async list(collection, options?: RecordListOptions): Promise<RecordPage> {
    assertRecordAddress(collection);
    const limit = options?.limit ?? 500;
    const offset = decodeRecordCursor(options?.cursor);
    // One extra row tells a full page from the last one without a COUNT.
    const rows = await (
      await d1()
    )
      .prepare(
        'SELECT id, revision, data, updated_at FROM opb_records WHERE collection = ?1 ORDER BY updated_at DESC LIMIT ?2 OFFSET ?3'
      )
      .bind(collection, limit + 1, offset)
      .all<{ id: string; revision: number; data: string; updated_at: string }>();
    const results = rows.results ?? [];
    const page = results.slice(0, limit);
    return {
      records: page.map((row): StoredRecord => ({
        id: row.id,
        revision: row.revision,
        data: JSON.parse(row.data) as unknown,
        updatedAt: row.updated_at,
      })),
      nextCursor: results.length > limit ? encodeRecordCursor(offset + limit) : null,
    };
  },

  async get(collection, id) {
    assertRecordAddress(collection, id);
    const row = await (
      await d1()
    )
      .prepare(
        'SELECT revision, data, updated_at FROM opb_records WHERE collection = ?1 AND id = ?2'
      )
      .bind(collection, id)
      .first<{ revision: number; data: string; updated_at: string }>();
    if (!row) return null;
    return {
      id,
      revision: row.revision,
      data: JSON.parse(row.data) as unknown,
      updatedAt: row.updated_at,
    };
  },

  async put(collection, id, data, expectedRevision) {
    assertRecordAddress(collection, id);
    return runQueued(`records:${collection}:${id}`, async () => {
      const database = await d1();
      const current = await database
        .prepare('SELECT revision FROM opb_records WHERE collection = ?1 AND id = ?2')
        .bind(collection, id)
        .first<{ revision: number }>();
      const currentRevision = current?.revision ?? 0;
      if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
        throw new RevisionConflictError(expectedRevision, currentRevision);
      }
      const revision = currentRevision + 1;
      const updatedAt = new Date().toISOString();
      await database
        .prepare(
          `INSERT INTO opb_records (collection, id, data, revision, updated_at)
           VALUES (?1, ?2, ?3, ?4, ?5)
           ON CONFLICT (collection, id) DO UPDATE SET
             data = excluded.data, revision = excluded.revision, updated_at = excluded.updated_at`
        )
        .bind(collection, id, JSON.stringify(data), revision, updatedAt)
        .run();
      return { id, revision, data, updatedAt };
    });
  },

  async remove(collection, id) {
    assertRecordAddress(collection, id);
    await (
      await d1()
    )
      .prepare('DELETE FROM opb_records WHERE collection = ?1 AND id = ?2')
      .bind(collection, id)
      .run();
  },

  async collections() {
    const rows = await (
      await d1()
    )
      .prepare('SELECT DISTINCT collection FROM opb_records ORDER BY collection ASC')
      .all<{ collection: string }>();
    return (rows.results ?? []).map((row) => row.collection);
  },

  async getSingleton(collection) {
    assertRecordAddress(collection);
    const row = await (
      await d1()
    )
      .prepare('SELECT data FROM opb_singletons WHERE collection = ?1')
      .bind(collection)
      .first<{ data: string }>();
    return row ? (JSON.parse(row.data) as unknown) : null;
  },

  async putSingleton(collection, data) {
    assertRecordAddress(collection);
    await (
      await d1()
    )
      .prepare(
        `INSERT INTO opb_singletons (collection, data) VALUES (?1, ?2)
         ON CONFLICT (collection) DO UPDATE SET data = excluded.data`
      )
      .bind(collection, JSON.stringify(data))
      .run();
  },
};

const media: MediaAdapter = {
  async put(key, data, mimeType) {
    await (
      await r2()
    ).put(key, data as unknown as ArrayBuffer, {
      httpMetadata: { contentType: mimeType },
      customMetadata: { mimeType, sizeBytes: String(data.byteLength) },
    });
    return {
      key,
      url: `/api/media/${encodeURI(key)}`,
      mimeType,
      sizeBytes: data.byteLength,
      uploadedAt: new Date().toISOString(),
    };
  },

  async resolveUrl(key) {
    const object = await (await r2()).head(key);
    return object ? `/api/media/${encodeURI(key)}` : null;
  },

  async remove(key) {
    await (await r2()).delete(key);
  },

  async list() {
    const listed = await (await r2()).list();
    const records = await Promise.all(
      (listed.objects ?? []).map(async (object): Promise<MediaRecord | null> => {
        try {
          const head = await (await r2()).head(object.key);
          if (!head) return null;
          return {
            key: object.key,
            url: `/api/media/${encodeURI(object.key)}`,
            mimeType:
              head.httpMetadata?.contentType ??
              head.customMetadata?.mimeType ??
              'application/octet-stream',
            sizeBytes: head.size,
            uploadedAt: head.uploaded
              ? new Date(head.uploaded).toISOString()
              : new Date().toISOString(),
          };
        } catch {
          return null;
        }
      })
    );
    return records.filter((r): r is MediaRecord => r !== null);
  },

  async readBytes(key) {
    const object = await (await r2()).get(key);
    if (!object) return null;
    const raw = new Uint8Array(await object.arrayBuffer());
    // A fresh copy: the runtime's buffer carries ArrayBufferLike, which
    // NextResponse will not accept as a body.
    const data = new Uint8Array(raw.byteLength);
    data.set(raw);
    return {
      data,
      mimeType:
        object.httpMetadata?.contentType ??
        object.customMetadata?.mimeType ??
        'application/octet-stream',
      sizeBytes: object.size,
    };
  },
};

export const cloudflareAdapter: StorageAdapter = {
  id: 'cloudflare',
  displayName: 'Cloudflare D1 + R2 (local engine)',
  docsUrl: 'https://getopenportfolio.vercel.app/docs/self-hosting',

  capabilities: {
    durable: true,
    auth: 'none',
    fileStorage: 'proxy',
    maxUploadBytes: 25 * 1024 * 1024,
    fullTextSearch: false,
    realtime: false,
    transactions: true,
    // Persisted to this machine's disk: durable on a VPS, gone on an ephemeral
    // host. Refused there rather than silently losing content.
    worksOnEphemeralHosts: false,
  },

  async health(): Promise<HealthReport> {
    const started = Date.now();
    try {
      await (await d1()).prepare('SELECT 1').first();
      await (await r2()).list({ limit: 1 });
      return {
        ok: true,
        detail: `D1 and R2 engines answering under ${ROOT}`,
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      return {
        ok: false,
        detail: err instanceof Error ? err.message : 'Cloudflare engines are not answering.',
        latencyMs: Date.now() - started,
      };
    }
  },

  async provision() {
    const database = await d1();
    for (const statement of SCHEMA) {
      await database.prepare(statement).run();
    }
    await migrateSnapshotMessages({
      readSnapshot: (channel) => cloudflareAdapter.readSnapshot(channel),
      writeSnapshot: (channel, state) => cloudflareAdapter.writeSnapshot(channel, state),
      listMessages: () => cloudflareAdapter.messages.list(),
      appendMessage: (message) => cloudflareAdapter.messages.append(message),
    });
  },

  async readOwner(): Promise<OwnerRecord | null> {
    const row = await (
      await d1()
    )
      .prepare(
        'SELECT email, passphrase_hash, created_at, session_epoch FROM opb_owner WHERE id = 1'
      )
      .first<{
        email: string;
        passphrase_hash: string;
        created_at: string;
        session_epoch: number;
      }>();
    if (!row) return null;
    return {
      email: row.email,
      passphraseHash: row.passphrase_hash,
      createdAt: row.created_at,
      sessionEpoch: row.session_epoch,
    };
  },

  async writeOwner(owner: OwnerRecord) {
    await runQueued('owner', async () => {
      await (
        await d1()
      )
        .prepare(
          `INSERT INTO opb_owner (id, email, passphrase_hash, created_at, session_epoch)
           VALUES (1, ?1, ?2, ?3, ?4)
           ON CONFLICT (id) DO UPDATE SET
             email = excluded.email,
             passphrase_hash = excluded.passphrase_hash,
             session_epoch = excluded.session_epoch`
        )
        .bind(owner.email, owner.passphraseHash, owner.createdAt, owner.sessionEpoch)
        .run();
    });
  },

  kv,
  media,
  messages,
  subscribers,
  passkeys,
  records,

  readSnapshot: (channel) => snapshots.read(channel),
  readSnapshotMeta: (channel) => snapshots.readMeta(channel),
  writeSnapshot: (channel, state, expected) => snapshots.write(channel, state, expected),
};
