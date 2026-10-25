import 'server-only';
import type { CMSState, ContactMessage } from '@/cms/types/cms';
import type { Subscriber } from '@/core/newsletter/schema';
import type {
  Channel,
  HealthReport,
  KvNamespace,
  MediaRecord,
  MessageListOptions,
  OwnerRecord,
  PasskeyCredential,
  RecordListOptions,
  RecordPage,
  SnapshotRead,
  StorageAdapter,
  StoredRecord,
} from '../contract';
import { AdapterConfigError, RevisionConflictError } from '../contract';
import { assertRecordAddress, decodeRecordCursor, encodeRecordCursor } from '../contract';
import { migrateSnapshotMessages } from './_shared/migrate-messages';

/**
 * Cloudflare Workers REST Adapter.
 *
 * Connects directly to Cloudflare's hosted cloud services over standard HTTP REST:
 * - Cloudflare D1 REST API for relational tables and records
 * - Cloudflare R2 REST API for media storage
 *
 * Configured via:
 * - `CLOUDFLARE_ACCOUNT_ID`
 * - `CLOUDFLARE_API_TOKEN`
 * - `D1_DATABASE_ID`
 * - `R2_BUCKET_NAME` (defaults to 'opb-media')
 */

function accountId(): string {
  const id = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!id) {
    throw new AdapterConfigError(
      'Cloudflare REST adapter is selected but CLOUDFLARE_ACCOUNT_ID is not set.'
    );
  }
  return id;
}

function apiToken(): string {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new AdapterConfigError(
      'Cloudflare REST adapter is selected but CLOUDFLARE_API_TOKEN is not set.'
    );
  }
  return token;
}

function databaseId(): string {
  const id = process.env.D1_DATABASE_ID;
  if (!id) {
    throw new AdapterConfigError(
      'Cloudflare REST adapter is selected but D1_DATABASE_ID is not set.'
    );
  }
  return id;
}

function bucketName(): string {
  return process.env.R2_BUCKET_NAME || 'opb-media';
}

export class CloudflareRestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors?: unknown[]
  ) {
    super(message);
    this.name = 'CloudflareRestError';
  }
}

let customFetch: typeof fetch | null = null;

/** Test seam: override fetch for unit / mock conformance tests. */
export function __setCloudflareRestFetch(fn: typeof fetch | null): void {
  customFetch = fn;
}

async function doFetch(url: string, init?: RequestInit): Promise<Response> {
  const fetcher = customFetch ?? fetch;
  return fetcher(url, init);
}

interface D1QueryResult<T> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

interface D1ApiResponse<T> {
  result: D1QueryResult<T>[];
  success: boolean;
  errors: { code: number; message: string }[];
  messages: string[];
}

async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId()}/d1/database/${databaseId()}/query`;
  const token = apiToken();

  const res = await doFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new CloudflareRestError(`D1 query failed (${res.status}): ${errorText}`, res.status);
  }

  const json = (await res.json()) as D1ApiResponse<T>;
  if (!json.success || !json.result?.[0]?.success) {
    const firstErr = json.errors?.[0]?.message || 'D1 query unsuccessful';
    throw new CloudflareRestError(firstErr, 400, json.errors);
  }

  return json.result[0].results ?? [];
}

async function d1Run(sql: string, params: unknown[] = []): Promise<void> {
  await d1Query(sql, params);
}

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
  `CREATE TABLE IF NOT EXISTS opb_media (
    key TEXT PRIMARY KEY,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    updated_at TEXT NOT NULL
  )`,
];

export const cloudflareRestAdapter: StorageAdapter = {
  id: 'cloudflare-rest',
  displayName: 'Cloudflare (REST)',
  docsUrl: 'https://developers.cloudflare.com/d1/',
  capabilities: {
    durable: true,
    auth: 'none',
    fileStorage: 'proxy',
    maxUploadBytes: 100 * 1024 * 1024,
    fullTextSearch: false,
    realtime: false,
    transactions: false,
    worksOnEphemeralHosts: true,
  },

  async readOwner(): Promise<OwnerRecord | null> {
    const rows = await d1Query<{
      email: string;
      passphrase_hash: string;
      created_at: string;
      session_epoch: number;
    }>('SELECT email, passphrase_hash, created_at, session_epoch FROM opb_owner WHERE id = 1');
    if (!rows[0]) return null;
    return {
      email: rows[0].email,
      passphraseHash: rows[0].passphrase_hash,
      createdAt: rows[0].created_at,
      sessionEpoch: rows[0].session_epoch,
    };
  },

  async writeOwner(owner: OwnerRecord): Promise<void> {
    await runQueued('owner', async () => {
      await d1Run(
        `INSERT INTO opb_owner (id, email, passphrase_hash, created_at, session_epoch)
         VALUES (1, ?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           email = excluded.email,
           passphrase_hash = excluded.passphrase_hash,
           created_at = excluded.created_at,
           session_epoch = excluded.session_epoch`,
        [owner.email, owner.passphraseHash, owner.createdAt, owner.sessionEpoch]
      );
    });
  },

  kv: {
    async get<T>(ns: KvNamespace, key: string): Promise<T | null> {
      const now = Date.now();
      const rows = await d1Query<{ value: string; expires_at: number | null }>(
        `SELECT value, expires_at FROM opb_kv
         WHERE ns = ? AND key = ? AND (expires_at IS NULL OR expires_at > ?)`,
        [ns, key, now]
      );
      if (!rows[0]) return null;
      try {
        return JSON.parse(rows[0].value) as T;
      } catch {
        return null;
      }
    },

    async set<T>(ns: KvNamespace, key: string, value: T, ttlSeconds?: number): Promise<void> {
      const expiresAt = typeof ttlSeconds === 'number' ? Date.now() + ttlSeconds * 1000 : null;
      await d1Run(
        `INSERT INTO opb_kv (ns, key, value, expires_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (ns, key) DO UPDATE SET
           value = excluded.value,
           expires_at = excluded.expires_at`,
        [ns, key, JSON.stringify(value), expiresAt]
      );
    },

    async del(ns: KvNamespace, key: string): Promise<void> {
      await d1Run('DELETE FROM opb_kv WHERE ns = ? AND key = ?', [ns, key]);
    },

    async incr(ns: KvNamespace, key: string, ttlSeconds: number): Promise<number> {
      return runQueued(`kv:${ns}:${key}`, async () => {
        const now = Date.now();
        const expiresAt = now + ttlSeconds * 1000;
        const current = await this.get<number>(ns, key);
        const next = (current ?? 0) + 1;
        await d1Run(
          `INSERT INTO opb_kv (ns, key, value, expires_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT (ns, key) DO UPDATE SET
             value = excluded.value,
             expires_at = excluded.expires_at`,
          [ns, key, JSON.stringify(next), expiresAt]
        );
        return next;
      });
    },

    async clear(ns: KvNamespace): Promise<void> {
      await d1Run('DELETE FROM opb_kv WHERE ns = ?', [ns]);
    },
  },

  async health(): Promise<HealthReport> {
    const started = Date.now();
    try {
      await d1Query('SELECT 1');
      return {
        ok: true,
        detail: 'Cloudflare D1/R2 REST connected',
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      return {
        ok: false,
        detail: err instanceof Error ? err.message : String(err),
        latencyMs: Date.now() - started,
      };
    }
  },

  async provision(): Promise<void> {
    for (const sql of SCHEMA) {
      await d1Run(sql);
    }
    await migrateSnapshotMessages({
      readSnapshot: (ch) => this.readSnapshot(ch),
      writeSnapshot: (ch, st) => this.writeSnapshot(ch, st),
      listMessages: () => this.messages.list(),
      appendMessage: (m) => this.messages.append(m),
    });
  },

  async readSnapshot(channel: Channel): Promise<CMSState | null> {
    const res = await this.readSnapshotMeta(channel);
    return res?.state ?? null;
  },

  async readSnapshotMeta(channel: Channel): Promise<SnapshotRead | null> {
    const rows = await d1Query<{ data: string; revision: number }>(
      'SELECT data, revision FROM opb_content WHERE channel = ?',
      [channel]
    );
    if (!rows[0]) return null;
    try {
      return {
        state: JSON.parse(rows[0].data),
        revision: rows[0].revision,
      };
    } catch {
      return null;
    }
  },

  async writeSnapshot(
    channel: Channel,
    state: CMSState,
    expectedRevision?: number
  ): Promise<number> {
    return runQueued(`content:${channel}`, async () => {
      const current = await this.readSnapshotMeta(channel);
      const currentRev = current?.revision ?? 0;

      if (expectedRevision !== undefined && expectedRevision !== currentRev) {
        throw new RevisionConflictError(expectedRevision, currentRev);
      }

      const nextRev = currentRev + 1;

      await d1Run(
        `INSERT INTO opb_content (channel, data, revision)
         VALUES (?, ?, ?)
         ON CONFLICT (channel) DO UPDATE SET
           data = excluded.data,
           revision = excluded.revision`,
        [channel, JSON.stringify(state), nextRev]
      );

      return nextRev;
    });
  },

  media: {
    async resolveUrl(key: string): Promise<string | null> {
      const meta = await d1Query<{ key: string }>('SELECT key FROM opb_media WHERE key = ?', [key]);
      if (!meta[0]) return null;
      return `/api/media/${encodeURIComponent(key)}`;
    },

    async list(): Promise<MediaRecord[]> {
      const rows = await d1Query<{
        key: string;
        mime_type: string;
        size_bytes: number;
        updated_at: string;
      }>('SELECT key, mime_type, size_bytes, updated_at FROM opb_media ORDER BY updated_at DESC');
      return rows.map((r) => ({
        key: r.key,
        url: `/api/media/${encodeURIComponent(r.key)}`,
        mimeType: r.mime_type,
        sizeBytes: r.size_bytes,
        uploadedAt: r.updated_at,
      }));
    },

    async put(key: string, data: Uint8Array, mimeType: string): Promise<MediaRecord> {
      const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId()}/r2/buckets/${bucketName()}/objects/${encodeURIComponent(key)}`;
      const token = apiToken();

      const res = await doFetch(r2Url, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
          Authorization: `Bearer ${token}`,
        },
        body: Buffer.from(data),
      });

      if (!res.ok) {
        throw new CloudflareRestError(`R2 PUT object failed: ${res.statusText}`, res.status);
      }

      const now = new Date().toISOString();
      await d1Run(
        `INSERT INTO opb_media (key, mime_type, size_bytes, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (key) DO UPDATE SET
           mime_type = excluded.mime_type,
           size_bytes = excluded.size_bytes,
           updated_at = excluded.updated_at`,
        [key, mimeType, data.byteLength, now]
      );

      return {
        key,
        url: `/api/media/${encodeURIComponent(key)}`,
        mimeType,
        sizeBytes: data.byteLength,
        uploadedAt: now,
      };
    },

    async remove(key: string): Promise<void> {
      const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId()}/r2/buckets/${bucketName()}/objects/${encodeURIComponent(key)}`;
      const token = apiToken();

      await doFetch(r2Url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});

      await d1Run('DELETE FROM opb_media WHERE key = ?', [key]);
    },

    async readBytes(
      key: string
    ): Promise<{ data: Uint8Array<ArrayBuffer>; mimeType: string; sizeBytes: number } | null> {
      const rows = await d1Query<{ mime_type: string }>(
        'SELECT mime_type FROM opb_media WHERE key = ?',
        [key]
      );
      if (!rows[0]) return null;

      const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId()}/r2/buckets/${bucketName()}/objects/${encodeURIComponent(key)}`;
      const token = apiToken();

      const res = await doFetch(r2Url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return null;
      const buffer = await res.arrayBuffer();

      return {
        data: new Uint8Array(buffer) as Uint8Array<ArrayBuffer>,
        mimeType: rows[0].mime_type,
        sizeBytes: buffer.byteLength,
      };
    },
  },

  messages: {
    async append(message: ContactMessage): Promise<void> {
      const receivedAt =
        message.receivedAt ||
        (message as { createdAt?: string }).createdAt ||
        new Date().toISOString();
      await d1Run(
        `INSERT INTO opb_messages (id, received_at, data)
         VALUES (?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           received_at = excluded.received_at,
           data = excluded.data`,
        [message.id, receivedAt, JSON.stringify(message)]
      );
    },

    async list(options?: MessageListOptions): Promise<ContactMessage[]> {
      const limit = options?.limit ?? 100;
      const rows = await d1Query<{ data: string }>(
        'SELECT data FROM opb_messages ORDER BY received_at DESC LIMIT ?',
        [limit]
      );

      return rows.map((r) => JSON.parse(r.data) as ContactMessage);
    },

    async update(id: string, patch: Partial<ContactMessage>): Promise<void> {
      await runQueued(`message:${id}`, async () => {
        const rows = await d1Query<{ data: string }>('SELECT data FROM opb_messages WHERE id = ?', [
          id,
        ]);
        if (!rows[0]) return;
        const existing = JSON.parse(rows[0].data) as ContactMessage;
        const updated = { ...existing, ...patch, id };
        await d1Run('UPDATE opb_messages SET data = ? WHERE id = ?', [JSON.stringify(updated), id]);
      });
    },

    async remove(id: string): Promise<void> {
      await d1Run('DELETE FROM opb_messages WHERE id = ?', [id]);
    },
  },

  subscribers: {
    async append(subscriber: Subscriber): Promise<void> {
      const requestedAt =
        (subscriber as { requestedAt?: string }).requestedAt || new Date().toISOString();
      await d1Run(
        `INSERT INTO opb_subscribers (id, requested_at, data)
         VALUES (?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           requested_at = excluded.requested_at,
           data = excluded.data`,
        [subscriber.id, requestedAt, JSON.stringify(subscriber)]
      );
    },

    async list(): Promise<Subscriber[]> {
      const rows = await d1Query<{ data: string }>(
        'SELECT data FROM opb_subscribers ORDER BY requested_at DESC'
      );

      return rows.map((r) => JSON.parse(r.data) as Subscriber);
    },

    async update(id: string, patch: Partial<Subscriber>): Promise<void> {
      await runQueued(`subscriber:${id}`, async () => {
        const rows = await d1Query<{ data: string }>(
          'SELECT data FROM opb_subscribers WHERE id = ?',
          [id]
        );
        if (!rows[0]) return;
        const existing = JSON.parse(rows[0].data) as Subscriber;
        const updated = { ...existing, ...patch, id };
        await d1Run('UPDATE opb_subscribers SET data = ? WHERE id = ?', [
          JSON.stringify(updated),
          id,
        ]);
      });
    },

    async remove(id: string): Promise<void> {
      await d1Run('DELETE FROM opb_subscribers WHERE id = ?', [id]);
    },
  },

  passkeys: {
    async list(): Promise<PasskeyCredential[]> {
      const rows = await d1Query<{ data: string }>(
        'SELECT data FROM opb_passkeys ORDER BY created_at ASC'
      );

      return rows.map((r) => JSON.parse(r.data) as PasskeyCredential);
    },

    async get(id: string): Promise<PasskeyCredential | null> {
      const rows = await d1Query<{ data: string }>('SELECT data FROM opb_passkeys WHERE id = ?', [
        id,
      ]);
      if (!rows[0]) return null;
      return JSON.parse(rows[0].data) as PasskeyCredential;
    },

    async put(credential: PasskeyCredential): Promise<void> {
      await runQueued(`passkey:${credential.id}`, async () => {
        await d1Run(
          `INSERT INTO opb_passkeys (id, created_at, data)
           VALUES (?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET
             created_at = excluded.created_at,
             data = excluded.data`,
          [credential.id, credential.createdAt, JSON.stringify(credential)]
        );
      });
    },

    async update(id: string, patch: Partial<PasskeyCredential>): Promise<void> {
      await runQueued(`passkey:${id}`, async () => {
        const existing = await this.get(id);
        if (!existing) return;
        const updated = { ...existing, ...patch, id };
        await d1Run('UPDATE opb_passkeys SET data = ? WHERE id = ?', [JSON.stringify(updated), id]);
      });
    },

    async remove(id: string): Promise<void> {
      await d1Run('DELETE FROM opb_passkeys WHERE id = ?', [id]);
    },
  },

  records: {
    async list(collection: string, options?: RecordListOptions): Promise<RecordPage> {
      assertRecordAddress(collection);
      const offset = decodeRecordCursor(options?.cursor);
      const limit = options?.limit ?? 50;

      const rows = await d1Query<{
        id: string;
        revision: number;
        data: string;
        updated_at: string;
      }>(
        'SELECT id, revision, data, updated_at FROM opb_records WHERE collection = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?',
        [collection, limit, offset]
      );

      const records: StoredRecord[] = rows.map((r) => ({
        id: r.id,
        revision: r.revision,
        data: JSON.parse(r.data),
        updatedAt: r.updated_at,
      }));

      const countRows = await d1Query<{ count: number }>(
        'SELECT COUNT(*) as count FROM opb_records WHERE collection = ?',
        [collection]
      );
      const total = countRows[0]?.count ?? records.length;
      const nextOffset = offset + records.length;
      const nextCursor = nextOffset < total ? encodeRecordCursor(nextOffset) : null;

      return { records, nextCursor };
    },

    async get(collection: string, id: string): Promise<StoredRecord | null> {
      assertRecordAddress(collection, id);
      const rows = await d1Query<{
        id: string;
        revision: number;
        data: string;
        updated_at: string;
      }>('SELECT id, revision, data, updated_at FROM opb_records WHERE collection = ? AND id = ?', [
        collection,
        id,
      ]);

      if (!rows[0]) return null;
      return {
        id: rows[0].id,
        revision: rows[0].revision,
        data: JSON.parse(rows[0].data),
        updatedAt: rows[0].updated_at,
      };
    },

    async put(
      collection: string,
      id: string,
      data: unknown,
      expectedRevision?: number
    ): Promise<StoredRecord> {
      assertRecordAddress(collection, id);
      return runQueued(`records:${collection}:${id}`, async () => {
        const existing = await this.get(collection, id);
        const currentRev = existing?.revision ?? 0;

        if (expectedRevision !== undefined && expectedRevision !== currentRev) {
          throw new RevisionConflictError(expectedRevision, currentRev);
        }

        const nextRev = currentRev + 1;
        const now = new Date().toISOString();

        await d1Run(
          `INSERT INTO opb_records (collection, id, data, revision, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT (collection, id) DO UPDATE SET
             data = excluded.data,
             revision = excluded.revision,
             updated_at = excluded.updated_at`,
          [collection, id, JSON.stringify(data), nextRev, now]
        );

        return {
          id,
          revision: nextRev,
          data,
          updatedAt: now,
        };
      });
    },

    async remove(collection: string, id: string): Promise<void> {
      assertRecordAddress(collection, id);
      await d1Run('DELETE FROM opb_records WHERE collection = ? AND id = ?', [collection, id]);
    },

    async collections(): Promise<string[]> {
      const rows = await d1Query<{ collection: string }>(
        'SELECT DISTINCT collection FROM opb_records ORDER BY collection ASC'
      );
      return rows.map((r) => r.collection);
    },

    async getSingleton(collection: string): Promise<unknown | null> {
      assertRecordAddress(collection);
      const rows = await d1Query<{ data: string }>(
        'SELECT data FROM opb_singletons WHERE collection = ?',
        [collection]
      );
      if (!rows[0]) return null;
      try {
        return JSON.parse(rows[0].data);
      } catch {
        return null;
      }
    },

    async putSingleton(collection: string, data: unknown): Promise<void> {
      assertRecordAddress(collection);
      await d1Run(
        `INSERT INTO opb_singletons (collection, data)
         VALUES (?, ?)
         ON CONFLICT (collection) DO UPDATE SET
           data = excluded.data`,
        [collection, JSON.stringify(data)]
      );
    },
  },
};
