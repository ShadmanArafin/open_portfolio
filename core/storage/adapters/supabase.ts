import 'server-only';
import type { MediaAdapter, MediaRecord, StorageAdapter } from '../contract';
import { AdapterConfigError } from '../contract';
import {
  getSql,
  health,
  makeKvAdapter,
  makeMessagesAdapter,
  makeSubscribersAdapter,
  provisionSchema,
  readOwner,
  readSnapshot,
  readSnapshotMeta,
  writeOwner,
  writeSnapshot,
} from './_shared/postgres';
import { migrateSnapshotMessages } from './_shared/migrate-messages';

/**
 * Supabase: Postgres for content, Supabase Storage for media.
 *
 * Storage is driven over its REST endpoint rather than through
 * `@supabase/supabase-js`. The SDK is a large dependency for four HTTP calls,
 * and every one of those calls is a plain fetch with a bearer token.
 *
 * The service-role key is used, which bypasses row-level security. That is
 * correct here — this code only ever runs on the server, and the browser is
 * never given a key of any kind. `import 'server-only'` makes a mistake there
 * a build failure rather than a breach.
 */

const BUCKET = 'opb-media';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new AdapterConfigError(
      `Supabase is selected but ${name} is not set. Add it in your project settings and redeploy.`
    );
  }
  return value;
}

function connectionString(): string {
  // A pooled connection string is strongly preferred on serverless: direct
  // connections run out long before traffic does.
  const url = process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new AdapterConfigError(
      'Supabase is selected but no database URL is set. Add SUPABASE_DB_URL (the ' +
        'connection string from Project Settings, Database, Connection pooling).'
    );
  }
  return url;
}

function sql() {
  return getSql(connectionString());
}

function storageUrl(key: string): string {
  const base = requireEnv('SUPABASE_URL').replace(/\/$/, '');
  return `${base}/storage/v1/object/${BUCKET}/${encodeURI(key)}`;
}

function authHeaders(): Record<string, string> {
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  return { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };
}

const media: MediaAdapter = {
  async put(key, data, mimeType): Promise<MediaRecord> {
    const res = await fetch(storageUrl(key), {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': mimeType,
        // Re-uploading the same key replaces it, which is what a caller
        // overwriting an asset expects.
        'x-upsert': 'true',
      },
      body: data as unknown as BodyInit,
    });

    if (!res.ok) {
      throw new Error(`Supabase Storage rejected the upload (${res.status}): ${await res.text()}`);
    }

    return {
      key,
      url: publicUrl(key),
      mimeType,
      sizeBytes: data.byteLength,
      uploadedAt: new Date().toISOString(),
    };
  },

  async resolveUrl(key) {
    // A HEAD rather than a signed-URL request: the bucket is public, so the
    // only question is whether the object is there.
    const res = await fetch(storageUrl(key), { method: 'HEAD', headers: authHeaders() });
    return res.ok ? publicUrl(key) : null;
  },

  async remove(key) {
    const res = await fetch(storageUrl(key), { method: 'DELETE', headers: authHeaders() });
    // Already gone means the caller's intent is satisfied. See `tolerated` —
    // Supabase reports that as HTTP 400 with a 404 in the body.
    if (!res.ok && !(await tolerated(res, 404))) {
      throw new Error(`Supabase Storage could not delete ${key} (${res.status}).`);
    }
  },

  async list() {
    const base = requireEnv('SUPABASE_URL').replace(/\/$/, '');
    const res = await fetch(`${base}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: '', limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!res.ok) return [];

    const items = (await res.json()) as {
      name: string;
      updated_at?: string;
      metadata?: { size?: number; mimetype?: string };
    }[];

    return items.map((item) => ({
      key: item.name,
      url: publicUrl(item.name),
      mimeType: item.metadata?.mimetype ?? 'application/octet-stream',
      sizeBytes: item.metadata?.size ?? 0,
      uploadedAt: item.updated_at ?? new Date().toISOString(),
    }));
  },
};

function publicUrl(key: string): string {
  const base = requireEnv('SUPABASE_URL').replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${BUCKET}/${encodeURI(key)}`;
}

/**
 * Whether a failed Storage response really means `expected`.
 *
 * **Supabase Storage does not put its semantic status in the HTTP status.** A
 * duplicate bucket and a missing object both come back as **HTTP 400**, with
 * the real code inside the JSON body:
 *
 *   creating a bucket twice → 400 `{"statusCode":"409","code":"BucketAlreadyExists"}`
 *   deleting a missing key  → 400 `{"statusCode":"404","code":"NoSuchKey"}`
 *
 * Two separate call sites here checked `res.status !== 409` and
 * `res.status !== 404`, so neither ever matched and both threw on the case they
 * were written to tolerate. The bucket one was the serious one: `provision()`
 * runs once per process, so on a serverless host it runs on every cold start —
 * a Supabase site worked on its first boot and then failed on every one after
 * it, the whole adapter rejecting rather than just uploads.
 *
 * Both survived because the Supabase conformance suite had never been run
 * against a live service. A local `supabase start` found both within a minute.
 * Centralised because a third call site would otherwise make the same
 * assumption, and the assumption is invisible until something is actually
 * running.
 */
async function tolerated(res: Response, expected: 404 | 409): Promise<boolean> {
  if (res.status === expected) return true;
  const body = await res.text();
  return new RegExp(`"statusCode"\\s*:\\s*"?${expected}"?`).test(body);
}

/** Creates the media bucket. Safe to call repeatedly. */
async function ensureBucket(): Promise<void> {
  const base = requireEnv('SUPABASE_URL').replace(/\/$/, '');
  const res = await fetch(`${base}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });

  if (res.ok || (await tolerated(res, 409))) return;
  throw new Error(`Could not create the ${BUCKET} bucket (${res.status}).`);
}

export const supabaseAdapter: StorageAdapter = {
  id: 'supabase',
  displayName: 'Supabase',
  docsUrl: 'https://github.com/ShadmanArafin/open_portfolio_builder#choose-your-backend',

  capabilities: {
    durable: true,
    // Supabase Auth exists, but this project mints its own sessions so that
    // every backend behaves identically. Marked 'none' because nothing here
    // delegates identity to it.
    auth: 'none',
    fileStorage: 'presigned',
    maxUploadBytes: 50 * 1024 * 1024,
    fullTextSearch: true,
    realtime: true,
    transactions: true,
    worksOnEphemeralHosts: true,
  },

  health: () => health(sql(), 'Supabase Postgres'),

  async provision() {
    await provisionSchema(sql());
    await ensureBucket();
    await migrateSnapshotMessages({
      readSnapshot: (channel) => supabaseAdapter.readSnapshot(channel),
      writeSnapshot: (channel, state) => supabaseAdapter.writeSnapshot(channel, state),
      listMessages: () => supabaseAdapter.messages.list(),
      appendMessage: (message) => supabaseAdapter.messages.append(message),
    });
  },

  readSnapshot: (channel) => readSnapshot(sql(), channel),
  readSnapshotMeta: (channel) => readSnapshotMeta(sql(), channel),
  writeSnapshot: (channel, state, expected) => writeSnapshot(sql(), channel, state, expected),
  readOwner: () => readOwner(sql()),
  writeOwner: (owner) => writeOwner(sql(), owner),

  kv: makeKvAdapter(sql),
  media,
  messages: makeMessagesAdapter(sql),
  subscribers: makeSubscribersAdapter(sql),
};
