import 'server-only';
import { createHash } from 'node:crypto';
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
import { AdapterConfigError, RevisionConflictError } from '../contract';
import { assertRecordAddress, decodeRecordCursor, encodeRecordCursor } from '../contract';
import { migrateSnapshotMessages } from './_shared/migrate-messages';

/**
 * Appwrite: database documents for records, buckets for files.
 *
 * Three Appwrite facts shape every function below:
 *
 * 1. String attributes hold at most 64 KB, and a published snapshot is bigger
 *    than that. Snapshots are therefore sharded across 60 KB chunk documents
 *    with a manifest document recording the chunk count and revision — and the
 *    manifest is written LAST, so a crash mid-write leaves orphans (harmless)
 *    and the previous revision intact (correct). Readers trust the manifest
 *    count, never a listing.
 * 2. There are no transactions and no compare-and-swap, so conditional writes
 *    are serialised in this process (the same per-target queue the filesystem
 *    and PocketBase adapters use). One app container per Appwrite project, or
 *    run Postgres.
 * 3. Attributes and indexes build asynchronously: creating them returns 202
 *    and the collection is unusable until each reports `available`. Provision
 *    polls rather than sleeps, with a bounded wait, so a slow bake fails
 *    loudly instead of racing the first write.
 *
 * Media is public by bucket permission (`read("any")` on `opb-media` only),
 * so `<img>` tags resolve without a session. Every document collection is
 * created with empty permissions — privileged (API key) only.
 */

const DB_ID = 'opb';
const MEDIA_BUCKET = 'opb-media';
/** Attribute ceiling minus headroom; see the file comment. */
const CHUNK_BYTES = 60 * 1024;

function endpoint(): string {
  const url = process.env.APPWRITE_ENDPOINT?.replace(/\/$/, '');
  if (!url) {
    throw new AdapterConfigError(
      'Appwrite is selected but APPWRITE_ENDPOINT is not set. Add the URL of your ' +
        'Appwrite API (for example http://localhost:8081/v1).'
    );
  }
  return url;
}

function projectId(): string {
  const id = process.env.APPWRITE_PROJECT_ID;
  if (!id) {
    throw new AdapterConfigError('Appwrite is selected but APPWRITE_PROJECT_ID is not set.');
  }
  return id;
}

function apiKey(): string {
  const key = process.env.APPWRITE_API_KEY;
  if (!key) {
    throw new AdapterConfigError(
      'Appwrite is selected but APPWRITE_API_KEY is not set. Create one in your ' +
        'project with databases, collections, documents, files and buckets scopes.'
    );
  }
  return key;
}

class AppwriteError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'AppwriteError';
  }
}

async function aw<T>(
  method: string,
  path: string,
  body?: unknown,
  multipart?: FormData
): Promise<T> {
  const headers: Record<string, string> = {
    'X-Appwrite-Project': projectId(),
    'X-Appwrite-Key': apiKey(),
  };
  if (!multipart) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${endpoint()}${path}`, {
    method,
    headers,
    body: multipart ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  if (res.status === 404) {
    const notFound = new AppwriteError(`${method} ${path}: not found`, 404);
    throw notFound;
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new AppwriteError(
      `Appwrite ${method} ${path} failed (${res.status}): ${detail.slice(0, 200)}`,
      res.status
    );
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function ignoreMissing(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    if (err instanceof AppwriteError && err.status === 404) return;
    throw err;
  }
}

/** Deterministic document id: Appwrite caps ids at 36 chars; keys are longer. */
function docId(...parts: string[]): string {
  return createHash('sha256').update(parts.join(':')).digest('hex').slice(0, 32);
}

/**
 * Query strings are JSON objects (`{"method":"equal","attribute":"x",...}`),
 * one per repeated `queries[]` parameter — so values need no manual escaping:
 * `JSON.stringify` in the builder below handles every quote and backslash.
 * The 1.x method-call syntax (`equal("x", "y")`) 400s, and every other
 * spelling — singular `query`, `sort`/`limit`/`offset` URL parameters — is
 * silently ignored and returns unfiltered rows. All of it verified empirically
 * against 2.5.0 (down to reading the query parser in the image); the builder
 * below exists so no call site can drift back into a string template.
 */
const q = {
  equal: (attribute: string, value: string): string =>
    JSON.stringify({ method: 'equal', attribute, values: [value] }),
  order: (attribute: string, direction: 'ASC' | 'DESC'): string =>
    JSON.stringify({
      method: direction === 'ASC' ? 'orderAsc' : 'orderDesc',
      attribute,
    }),
  limit: (n: number): string => JSON.stringify({ method: 'limit', values: [n] }),
  offset: (n: number): string => JSON.stringify({ method: 'offset', values: [n] }),
  notNull: (attribute: string): string => JSON.stringify({ method: 'isNotNull', attribute }),
};

function listParams(queries: string[], limit = 500): string {
  const params = new URLSearchParams();
  for (const query of [...queries, q.limit(limit)]) params.append('queries[]', query);
  return params.toString();
}

interface DocList<T> {
  documents: (T & { $id: string })[];
  total: number;
}

async function listDocs<T>(
  collection: string,
  queries: string[] = []
): Promise<(T & { $id: string })[]> {
  const out: (T & { $id: string })[] = [];
  const pageSize = 500;
  let offset = 0;
  for (;;) {
    const params = new URLSearchParams();
    for (const query of [...queries, q.limit(pageSize), q.offset(offset)]) {
      params.append('queries[]', query);
    }
    const res = await aw<DocList<T>>(
      'GET',
      `/databases/${DB_ID}/collections/${collection}/documents?${params.toString()}`
    );
    out.push(...res.documents);
    if (res.documents.length < pageSize || out.length >= res.total) break;
    offset += pageSize;
  }
  return out;
}

async function getDoc<T>(collection: string, id: string): Promise<(T & { $id: string }) | null> {
  try {
    return await aw<T & { $id: string }>(
      'GET',
      `/databases/${DB_ID}/collections/${collection}/documents/${encodeURIComponent(id)}`
    );
  } catch (err) {
    if (err instanceof AppwriteError && err.status === 404) return null;
    throw err;
  }
}

/**
 * Serialises operations per target (see the file comment: no transactions).
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

interface AttributeSpec {
  key: string;
  kind: 'string' | 'integer' | 'boolean' | 'datetime';
  size?: number;
  required?: boolean;
}

interface IndexSpec {
  key: string;
  attributes: string[];
  orders: ('ASC' | 'DESC')[];
}

interface CollectionSpec {
  id: string;
  attributes: AttributeSpec[];
  indexes?: IndexSpec[];
  publicRead?: boolean;
}

const COLLECTIONS: CollectionSpec[] = [
  {
    id: 'content',
    attributes: [
      { key: 'channel', kind: 'string', size: 64, required: true },
      { key: 'manifest', kind: 'string', size: 65535, required: true },
    ],
  },
  {
    id: 'chunks',
    attributes: [
      { key: 'channel', kind: 'string', size: 64, required: true },
      { key: 'index', kind: 'integer', required: true },
      { key: 'body', kind: 'string', size: 65535, required: true },
    ],
    indexes: [{ key: 'by_channel', attributes: ['channel', 'index'], orders: ['ASC', 'ASC'] }],
  },
  {
    id: 'owner',
    attributes: [
      { key: 'email', kind: 'string', size: 320, required: true },
      { key: 'passphraseHash', kind: 'string', size: 1024, required: true },
      { key: 'createdAt', kind: 'string', size: 64, required: true },
      { key: 'sessionEpoch', kind: 'integer', required: true },
    ],
  },
  {
    id: 'kv',
    attributes: [
      { key: 'ns', kind: 'string', size: 64, required: true },
      { key: 'itemKey', kind: 'string', size: 512, required: true },
      { key: 'value', kind: 'string', size: 65535 },
      { key: 'expiresAt', kind: 'integer' },
    ],
    // Every filtered attribute is indexed, or the clause is silently ignored
    // and the query returns everything: Appwrite answers unindexed filters
    // with unfiltered rows and no error. Verified against 2.5.0 — an index
    // here is load-bearing, not an optimisation.
    indexes: [{ key: 'by_ns_key', attributes: ['ns', 'itemKey'], orders: ['ASC', 'ASC'] }],
  },
  {
    id: 'messages',
    attributes: [
      { key: 'messageId', kind: 'string', size: 256, required: true },
      { key: 'receivedAt', kind: 'string', size: 64, required: true },
      { key: 'data', kind: 'string', size: 65535, required: true },
    ],
    indexes: [
      { key: 'by_received', attributes: ['receivedAt'], orders: ['DESC'] },
      { key: 'by_id', attributes: ['messageId'], orders: ['ASC'] },
    ],
  },
  {
    id: 'subscribers',
    attributes: [
      { key: 'subscriberId', kind: 'string', size: 256, required: true },
      { key: 'requestedAt', kind: 'string', size: 64, required: true },
      { key: 'data', kind: 'string', size: 65535, required: true },
    ],
    indexes: [
      { key: 'by_requested', attributes: ['requestedAt'], orders: ['DESC'] },
      { key: 'by_id', attributes: ['subscriberId'], orders: ['ASC'] },
    ],
  },
  {
    id: 'passkeys',
    attributes: [
      { key: 'credentialId', kind: 'string', size: 512, required: true },
      { key: 'createdAt', kind: 'string', size: 64, required: true },
      { key: 'data', kind: 'string', size: 65535, required: true },
    ],
    indexes: [
      { key: 'by_created', attributes: ['createdAt'], orders: ['ASC'] },
      { key: 'by_id', attributes: ['credentialId'], orders: ['ASC'] },
    ],
  },
  {
    id: 'records',
    attributes: [
      { key: 'collection', kind: 'string', size: 64, required: true },
      { key: 'itemId', kind: 'string', size: 64, required: true },
      { key: 'data', kind: 'string', size: 65535, required: true },
      { key: 'revision', kind: 'integer', required: true },
      { key: 'updatedAt', kind: 'string', size: 64, required: true },
    ],
    indexes: [
      { key: 'by_collection', attributes: ['collection', 'updatedAt'], orders: ['ASC', 'DESC'] },
      { key: 'by_id', attributes: ['collection', 'itemId'], orders: ['ASC', 'ASC'] },
    ],
  },
  {
    id: 'singletons',
    attributes: [
      { key: 'collection', kind: 'string', size: 64, required: true },
      { key: 'data', kind: 'string', size: 65535, required: true },
    ],
  },
];

function attributeCreatePath(collection: string, kind: AttributeSpec['kind']): string {
  // Type-suffixed on create: `.../attributes/string`, not `.../attributes`
  // with the type in the body. The generic path 404s.
  return `/databases/${DB_ID}/collections/${collection}/attributes/${kind}`;
}

function attributePath(collection: string): string {
  // ...but unsuffixed for reads: `.../attributes/{key}`. The suffixed form
  // 404s with an HTML page here, which is why status checks must not reuse
  // the create path. Verified against 2.5.0; do not "simplify" these together.
  return `/databases/${DB_ID}/collections/${collection}/attributes`;
}

async function waitFor(
  label: string,
  check: () => Promise<boolean>,
  timeoutMs = 60_000
): Promise<void> {
  const start = Date.now();
  for (;;) {
    if (await check()) return;
    if (Date.now() - start > timeoutMs) {
      throw new AdapterConfigError(
        `Appwrite did not finish preparing ${label} within a minute. Check the Appwrite console.`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function attributeStatus(collection: string, key: string): Promise<string | null> {
  try {
    const attr = await aw<{ status: string }>('GET', `${attributePath(collection)}/${key}`);
    return attr.status;
  } catch (err) {
    if (err instanceof AppwriteError && err.status === 404) return null;
    throw err;
  }
}

async function attributeReady(collection: string, key: string): Promise<boolean> {
  return (await attributeStatus(collection, key)) === 'available';
}

async function indexStatus(collection: string, key: string): Promise<string | null> {
  try {
    const index = await aw<{ status: string }>(
      'GET',
      `/databases/${DB_ID}/collections/${collection}/indexes/${key}`
    );
    return index.status;
  } catch (err) {
    if (err instanceof AppwriteError && err.status === 404) return null;
    throw err;
  }
}

async function ensureDatabase(): Promise<void> {
  try {
    await aw('GET', `/databases/${DB_ID}`);
  } catch (err) {
    if (err instanceof AppwriteError && err.status === 404) {
      await aw('POST', '/databases', { databaseId: DB_ID, name: 'opb' });
      return;
    }
    throw err;
  }
}

async function ensureBucket(): Promise<void> {
  try {
    await aw('GET', `/storage/buckets/${MEDIA_BUCKET}`);
  } catch (err) {
    if (err instanceof AppwriteError && err.status === 404) {
      // Public reads, privileged writes: the API key writes regardless, and
      // `<img>` tags read without a session — the same split as the Supabase
      // public bucket and the PocketBase public file rule.
      await aw('POST', '/storage/buckets', {
        bucketId: MEDIA_BUCKET,
        name: 'opb-media',
        permissions: ['read("any")'],
        fileSecurity: false,
        maximumFileSize: 25 * 1024 * 1024,
        allowedFileExtensions: [],
      });
      return;
    }
    throw err;
  }
}

async function ensureCollections(): Promise<void> {
  const existing = await aw<{ collections: { $id: string }[] }>(
    'GET',
    `/databases/${DB_ID}/collections?limit=100`
  );
  const names = new Set(existing.collections.map((c) => c.$id));
  const trace = (m: string) => {
    // Opt-in progress lines, to stderr with the rest of the diagnostics.
    if (process.env.OPB_TRACE_PROVISION) console.warn(`[provision] ${m}`);
  };
  for (const spec of COLLECTIONS) {
    trace(`collection ${spec.id}`);
    if (!names.has(spec.id)) {
      // Empty permissions: privileged (API key) only. Media goes through the
      // bucket instead, which is where public reads are granted.
      await aw('POST', `/databases/${DB_ID}/collections`, {
        collectionId: spec.id,
        name: spec.id,
        permissions: [],
        documentSecurity: false,
      });
      trace(`created collection ${spec.id}`);
    }
    for (const attr of spec.attributes) {
      // Check first: a provisioned attribute reports `available` immediately
      // and costs one GET, while a blind POST-then-wait costs the bake every
      // time. Provision runs before every conformance test, so the repeated
      // case — not the first — is the one that has to be cheap.
      trace(`attribute ${spec.id}.${attr.key}: checking`);
      if ((await attributeStatus(spec.id, attr.key)) === 'available') continue;
      trace(`attribute ${spec.id}.${attr.key}: creating`);
      const path = attributeCreatePath(spec.id, attr.kind);
      const body: Record<string, unknown> = { key: attr.key, required: attr.required ?? false };
      if (attr.size !== undefined) {
        body.size = attr.size;
      } else if (attr.kind === 'integer') {
        // size 8 is 64 bits, and millisecond epochs do not fit in 32.
        // Appwrite rejects a sizeless integer outright.
        body.size = 8;
      }
      try {
        await aw('POST', path, body);
      } catch (err) {
        // Already there from a previous provision (409): carry on to the
        // readiness wait, which is the real gate.
        if (!(err instanceof AppwriteError) || err.status !== 409) throw err;
      }
      trace(`attribute ${spec.id}.${attr.key}: waiting`);
      await waitFor(`attribute ${spec.id}.${attr.key}`, () => attributeReady(spec.id, attr.key));
      trace(`attribute ${spec.id}.${attr.key}: ready`);
    }
    for (const index of spec.indexes ?? []) {
      if ((await indexStatus(spec.id, index.key)) === 'available') continue;
      try {
        await aw('POST', `/databases/${DB_ID}/collections/${spec.id}/indexes`, {
          key: index.key,
          type: 'key',
          attributes: index.attributes,
          orders: index.orders,
        });
      } catch (err) {
        if (!(err instanceof AppwriteError) || err.status !== 409) throw err;
      }
      await waitFor(`index ${spec.id}.${index.key}`, async () => {
        return (await indexStatus(spec.id, index.key)) === 'available';
      });
    }
  }
}

const snapshots = {
  async read(channel: Channel): Promise<CMSState | null> {
    return (await snapshots.readMeta(channel))?.state ?? null;
  },

  async readMeta(channel: Channel): Promise<SnapshotRead | null> {
    const manifest = await getDoc<{ channel: string; manifest: string }>(
      'content',
      docId('manifest', channel)
    );
    if (!manifest) return null;
    const { count, revision } = JSON.parse(manifest.manifest) as {
      count: number;
      revision: number;
    };
    const chunks = await listDocs<{ index: number; body: string }>('chunks', [
      q.equal('channel', channel),
      q.order('index', 'ASC'),
    ]);
    const bodies = chunks
      .sort((a, b) => a.index - b.index)
      .slice(0, count)
      .map((c) => c.body);
    if (bodies.length !== count) return null;
    return { state: JSON.parse(bodies.join('')) as CMSState, revision };
  },

  async write(channel: Channel, state: CMSState, expectedRevision?: number): Promise<number> {
    return runQueued(`content:${channel}`, async () => {
      const current = await snapshots.readMeta(channel);
      const currentRevision = current?.revision ?? 0;

      if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
        throw new RevisionConflictError(expectedRevision, currentRevision);
      }

      const revision = currentRevision + 1;
      const serialised = JSON.stringify(state);
      const parts: string[] = [];
      for (let i = 0; i < serialised.length; i += CHUNK_BYTES) {
        parts.push(serialised.slice(i, i + CHUNK_BYTES));
      }
      // Chunks first, manifest last: a crash between them orphans chunks the
      // next write overwrites and leaves the previous revision readable.
      await Promise.all(
        parts.map((body, index) =>
          aw(
            'PUT',
            `/databases/${DB_ID}/collections/chunks/documents/${docId('chunk', channel, String(index))}`,
            {
              data: { channel, index, body },
            }
          )
        )
      );
      await aw(
        'PUT',
        `/databases/${DB_ID}/collections/content/documents/${docId('manifest', channel)}`,
        { data: { channel, manifest: JSON.stringify({ count: parts.length, revision }) } }
      );
      return revision;
    });
  },
};

interface KvDoc {
  value: string;
  expiresAt?: number;
}

function kvLive(data: { value: string; expiresAt?: number } | undefined): boolean {
  if (!data) return false;
  if (data.expiresAt === undefined || data.expiresAt === null) return true;
  return data.expiresAt > Date.now();
}

const kvDocId = (ns: KvNamespace, key: string): string => docId('kv', ns, key);

const kv: KvAdapter = {
  async get<T>(ns: KvNamespace, key: string): Promise<T | null> {
    const doc = await getDoc<KvDoc>('kv', kvDocId(ns, key));
    if (!kvLive(doc ?? undefined)) return null;
    return JSON.parse((doc as KvDoc).value) as T;
  },

  async set<T>(ns: KvNamespace, key: string, value: T, ttlSeconds?: number) {
    await runQueued(`kv:${ns}:${key}`, async () => {
      const record: KvDoc = { value: JSON.stringify(value) };
      if (ttlSeconds !== undefined) record.expiresAt = Date.now() + ttlSeconds * 1000;
      await aw('PUT', `/databases/${DB_ID}/collections/kv/documents/${kvDocId(ns, key)}`, {
        data: { ns, itemKey: key, ...record },
      });
      const stale = await listDocs<KvDoc>('kv', [q.notNull('expiresAt')]);
      const now = Date.now();
      await Promise.all(
        stale
          // Explicit null check first: `null <= now` is true in JavaScript,
          // and the field reads back null (not missing) when it was never
          // set. Without it the sweep deletes every permanent row — including
          // the one this very call just wrote.
          .filter(
            (row) =>
              row.expiresAt !== null &&
              row.expiresAt !== undefined &&
              (row.expiresAt as number) <= now
          )
          .slice(0, 50)
          .map((row) =>
            ignoreMissing(() =>
              aw('DELETE', `/databases/${DB_ID}/collections/kv/documents/${row.$id}`)
            )
          )
      );
    });
  },

  async del(ns: KvNamespace, key: string) {
    await ignoreMissing(() =>
      aw('DELETE', `/databases/${DB_ID}/collections/kv/documents/${kvDocId(ns, key)}`)
    );
  },

  async incr(ns: KvNamespace, key: string, ttlSeconds: number): Promise<number> {
    return runQueued(`kv:${ns}:${key}`, async () => {
      const doc = await getDoc<KvDoc>('kv', kvDocId(ns, key));
      // A live row keeps its original window: refreshing the TTL on every hit
      // would let a steady stream hold a rate-limit counter open forever.
      if (kvLive(doc ?? undefined) && doc) {
        const next = (JSON.parse(doc.value) as number) + 1;
        await aw('PUT', `/databases/${DB_ID}/collections/kv/documents/${kvDocId(ns, key)}`, {
          data: { ns, itemKey: key, value: JSON.stringify(next), expiresAt: doc.expiresAt },
        });
        return next;
      }
      await aw('PUT', `/databases/${DB_ID}/collections/kv/documents/${kvDocId(ns, key)}`, {
        data: { ns, itemKey: key, value: '1', expiresAt: Date.now() + ttlSeconds * 1000 },
      });
      return 1;
    });
  },

  async clear(ns: KvNamespace) {
    const rows = await listDocs<{ ns: string }>('kv', [q.equal('ns', ns)]);
    await Promise.all(
      rows.map((row) =>
        ignoreMissing(() => aw('DELETE', `/databases/${DB_ID}/collections/kv/documents/${row.$id}`))
      )
    );
  },
};

const messages: MessagesAdapter = {
  async append(message) {
    await aw('POST', `/databases/${DB_ID}/collections/messages/documents`, {
      // No explicit id: fifty simultaneous enquiries must not contend on one
      // document, and the id lives in the payload where listing returns it.
      documentId: 'unique()',
      data: {
        messageId: message.id,
        receivedAt: message.receivedAt,
        data: JSON.stringify(message),
      },
    });
  },

  async list(options?: MessageListOptions) {
    // A limit is one page, not the start of a walk: listDocs paginates to the
    // end, which would return the whole inbox wearing a limit as a disguise.
    if (options?.limit !== undefined) {
      const params = new URLSearchParams();
      for (const query of [q.order('receivedAt', 'DESC'), q.limit(options.limit)]) {
        params.append('queries[]', query);
      }
      const res = await aw<DocList<{ data: string }>>(
        'GET',
        `/databases/${DB_ID}/collections/messages/documents?${params.toString()}`
      );
      return res.documents.map((row) => JSON.parse(row.data) as ContactMessage);
    }
    const rows = await listDocs<{ data: string }>('messages', [q.order('receivedAt', 'DESC')]);
    return rows.map((row) => JSON.parse(row.data) as ContactMessage);
  },

  async update(id, patch) {
    await runQueued(`message:${id}`, async () => {
      const rows = await listDocs<{ messageId: string; data: string }>('messages', [
        q.equal('messageId', id),
      ]);
      const row = rows[0];
      if (!row) return;
      const existing = JSON.parse(row.data) as ContactMessage;
      await aw('PATCH', `/databases/${DB_ID}/collections/messages/documents/${row.$id}`, {
        data: { data: JSON.stringify({ ...existing, ...patch, id }) },
      });
    });
  },

  async remove(id) {
    const rows = await listDocs<{ messageId: string }>('messages', [q.equal('messageId', id)]);
    await Promise.all(
      rows.map((row) =>
        ignoreMissing(() =>
          aw('DELETE', `/databases/${DB_ID}/collections/messages/documents/${row.$id}`)
        )
      )
    );
  },
};

const subscribers: SubscribersAdapter = {
  async append(subscriber) {
    await aw('POST', `/databases/${DB_ID}/collections/subscribers/documents`, {
      documentId: 'unique()',
      data: {
        subscriberId: subscriber.id,
        requestedAt: subscriber.requestedAt,
        data: JSON.stringify(subscriber),
      },
    });
  },

  async list() {
    const rows = await listDocs<{ data: string }>('subscribers', [q.order('requestedAt', 'DESC')]);
    return rows.map((row) => JSON.parse(row.data) as Subscriber);
  },

  async update(id, patch) {
    await runQueued(`subscriber:${id}`, async () => {
      const rows = await listDocs<{ subscriberId: string; data: string }>('subscribers', [
        q.equal('subscriberId', id),
      ]);
      const row = rows[0];
      if (!row) return;
      const existing = JSON.parse(row.data) as Subscriber;
      await aw('PATCH', `/databases/${DB_ID}/collections/subscribers/documents/${row.$id}`, {
        data: { data: JSON.stringify({ ...existing, ...patch, id }) },
      });
    });
  },

  async remove(id) {
    const rows = await listDocs<{ subscriberId: string }>('subscribers', [
      q.equal('subscriberId', id),
    ]);
    await Promise.all(
      rows.map((row) =>
        ignoreMissing(() =>
          aw('DELETE', `/databases/${DB_ID}/collections/subscribers/documents/${row.$id}`)
        )
      )
    );
  },
};

const passkeys: PasskeysAdapter = {
  async list() {
    const rows = await listDocs<{ data: string }>('passkeys', [q.order('createdAt', 'ASC')]);
    return rows
      .map((row) => JSON.parse(row.data) as PasskeyCredential)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async get(id) {
    const rows = await listDocs<{ credentialId: string; data: string }>('passkeys', [
      q.equal('credentialId', id),
      q.limit(1),
    ]);
    return rows.length > 0 ? (JSON.parse(rows[0].data) as PasskeyCredential) : null;
  },

  async put(credential) {
    await runQueued(`passkey:${credential.id}`, async () => {
      const rows = await listDocs<{ credentialId: string }>('passkeys', [
        q.equal('credentialId', credential.id),
        q.limit(1),
      ]);
      const payload = {
        credentialId: credential.id,
        createdAt: credential.createdAt,
        data: JSON.stringify(credential),
      };
      if (rows.length > 0) {
        await aw('PATCH', `/databases/${DB_ID}/collections/passkeys/documents/${rows[0].$id}`, {
          data: payload,
        });
      } else {
        await aw('POST', `/databases/${DB_ID}/collections/passkeys/documents`, {
          documentId: 'unique()',
          data: payload,
        });
      }
    });
  },

  async update(id, patch) {
    await runQueued(`passkey:${id}`, async () => {
      const rows = await listDocs<{ credentialId: string; data: string }>('passkeys', [
        q.equal('credentialId', id),
        q.limit(1),
      ]);
      const row = rows[0];
      if (!row) return;
      const { id: _ignored, ...rest } = patch;
      const existing = JSON.parse(row.data) as PasskeyCredential;
      await aw('PATCH', `/databases/${DB_ID}/collections/passkeys/documents/${row.$id}`, {
        data: { data: JSON.stringify({ ...existing, ...rest, id }) },
      });
    });
  },

  async remove(id) {
    const rows = await listDocs<{ credentialId: string }>('passkeys', [
      q.equal('credentialId', id),
    ]);
    await Promise.all(
      rows.map((row) =>
        ignoreMissing(() =>
          aw('DELETE', `/databases/${DB_ID}/collections/passkeys/documents/${row.$id}`)
        )
      )
    );
  },
};

const records: RecordsAdapter = {
  async list(collection, options?: RecordListOptions): Promise<RecordPage> {
    assertRecordAddress(collection);
    const limit = options?.limit ?? 500;
    const offset = decodeRecordCursor(options?.cursor);
    // One extra row tells a full page from the last one without a COUNT.
    const params = new URLSearchParams();
    for (const query of [
      q.equal('collection', collection),
      q.order('updatedAt', 'DESC'),
      q.limit(limit + 1),
      q.offset(offset),
    ]) {
      params.append('queries[]', query);
    }
    const res = await aw<
      DocList<{ itemId: string; data: string; revision: number; updatedAt: string }>
    >('GET', `/databases/${DB_ID}/collections/records/documents?${params.toString()}`);
    const page = res.documents.slice(0, limit);
    return {
      records: page.map((row): StoredRecord => ({
        id: row.itemId,
        revision: row.revision,
        data: JSON.parse(row.data) as unknown,
        updatedAt: row.updatedAt,
      })),
      nextCursor: res.documents.length > limit ? encodeRecordCursor(offset + limit) : null,
    };
  },

  async get(collection, id) {
    assertRecordAddress(collection, id);
    const params = new URLSearchParams();
    for (const query of [q.equal('collection', collection), q.equal('itemId', id), q.limit(1)]) {
      params.append('queries[]', query);
    }
    const res = await aw<
      DocList<{ itemId: string; data: string; revision: number; updatedAt: string }>
    >('GET', `/databases/${DB_ID}/collections/records/documents?${params.toString()}`);
    const row = res.documents[0];
    if (!row) return null;
    return {
      id: row.itemId,
      revision: row.revision,
      data: JSON.parse(row.data) as unknown,
      updatedAt: row.updatedAt,
    };
  },

  async put(collection, id, data, expectedRevision) {
    assertRecordAddress(collection, id);
    const serialised = JSON.stringify(data);
    if (serialised.length > 60000) {
      throw new AdapterConfigError(
        'That record is larger than 60 KB. Split it into more records — Appwrite string attributes hold 64 KB at most.'
      );
    }
    return runQueued(`records:${collection}:${id}`, async () => {
      const current = await records.get(collection, id);
      const currentRevision = current?.revision ?? 0;
      if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
        throw new RevisionConflictError(expectedRevision, currentRevision);
      }
      const stored: StoredRecord = {
        id,
        revision: currentRevision + 1,
        data,
        updatedAt: new Date().toISOString(),
      };
      const payload = {
        collection,
        itemId: id,
        data: serialised,
        revision: stored.revision,
        updatedAt: stored.updatedAt,
      };
      const params = new URLSearchParams();
      for (const query of [q.equal('collection', collection), q.equal('itemId', id), q.limit(1)]) {
        params.append('queries[]', query);
      }
      const found = await aw<DocList<{ $id: string }>>(
        'GET',
        `/databases/${DB_ID}/collections/records/documents?${params.toString()}`
      );
      if (found.documents.length > 0) {
        await aw(
          'PATCH',
          `/databases/${DB_ID}/collections/records/documents/${found.documents[0].$id}`,
          { data: payload }
        );
      } else {
        await aw('POST', `/databases/${DB_ID}/collections/records/documents`, {
          documentId: 'unique()',
          data: payload,
        });
      }
      return stored;
    });
  },

  async remove(collection, id) {
    assertRecordAddress(collection, id);
    const params = new URLSearchParams();
    for (const query of [q.equal('collection', collection), q.equal('itemId', id)]) {
      params.append('queries[]', query);
    }
    const found = await aw<DocList<{ $id: string }>>(
      'GET',
      `/databases/${DB_ID}/collections/records/documents?${params.toString()}`
    );
    await Promise.all(
      found.documents.map((row) =>
        ignoreMissing(() =>
          aw('DELETE', `/databases/${DB_ID}/collections/records/documents/${row.$id}`)
        )
      )
    );
  },

  async collections() {
    // Distinct via the index-backed listing would need an aggregation Appwrite
    // does not offer; collections are few and records pages are cheap.
    const rows = await listDocs<{ collection: string }>('records', []);
    return [...new Set(rows.map((row) => row.collection))].sort();
  },

  async getSingleton(collection) {
    assertRecordAddress(collection);
    const params = new URLSearchParams();
    params.append('queries[]', q.equal('collection', collection));
    params.append('queries[]', q.limit(1));
    const res = await aw<DocList<{ data: string }>>(
      'GET',
      `/databases/${DB_ID}/collections/singletons/documents?${params.toString()}`
    );
    const row = res.documents[0];
    return row ? (JSON.parse(row.data) as unknown) : null;
  },

  async putSingleton(collection, data) {
    assertRecordAddress(collection);
    await runQueued(`singleton:${collection}`, async () => {
      const params = new URLSearchParams();
      params.append('queries[]', q.equal('collection', collection));
      params.append('queries[]', q.limit(1));
      const found = await aw<DocList<{ $id: string }>>(
        'GET',
        `/databases/${DB_ID}/collections/singletons/documents?${params.toString()}`
      );
      if (found.documents.length > 0) {
        await aw(
          'PATCH',
          `/databases/${DB_ID}/collections/singletons/documents/${found.documents[0].$id}`,
          {
            data: { data: JSON.stringify(data) },
          }
        );
      } else {
        await aw('POST', `/databases/${DB_ID}/collections/singletons/documents`, {
          documentId: 'unique()',
          data: { collection, data: JSON.stringify(data) },
        });
      }
    });
  },
};

function fileViewUrl(fileId: string): string {
  return `${endpoint()}/storage/buckets/${MEDIA_BUCKET}/files/${fileId}/view?project=${projectId()}`;
}

const media: MediaAdapter = {
  async put(key, data, mimeType) {
    const form = new FormData();
    form.append('fileId', docId('file', key));
    form.append('file', new Blob([data as unknown as BlobPart], { type: mimeType }), key);
    const record = await aw<{ $id: string }>(
      'POST',
      `/storage/buckets/${MEDIA_BUCKET}/files`,
      undefined,
      form
    );
    return {
      key,
      url: fileViewUrl(record.$id),
      mimeType,
      sizeBytes: data.byteLength,
      uploadedAt: new Date().toISOString(),
    };
  },

  async resolveUrl(key) {
    try {
      await aw('GET', `/storage/buckets/${MEDIA_BUCKET}/files/${docId('file', key)}`);
      return fileViewUrl(docId('file', key));
    } catch (err) {
      if (err instanceof AppwriteError && err.status === 404) return null;
      throw err;
    }
  },

  async remove(key) {
    await ignoreMissing(() =>
      aw('DELETE', `/storage/buckets/${MEDIA_BUCKET}/files/${docId('file', key)}`)
    );
  },

  async list() {
    // File names carry the storage key (uploaded with it), so the listing is
    // one request with no per-file follow-up.
    const res = await aw<{
      files: { $id: string; name: string; mimeType: string; sizeOriginal: number }[];
    }>('GET', `/storage/buckets/${MEDIA_BUCKET}/files?${listParams([], 500)}`);
    return res.files.map((file): MediaRecord => ({
      key: file.name,
      url: fileViewUrl(file.$id),
      mimeType: file.mimeType ?? 'application/octet-stream',
      sizeBytes: file.sizeOriginal ?? 0,
      uploadedAt: new Date().toISOString(),
    }));
  },
};

export const appwriteAdapter: StorageAdapter = {
  id: 'appwrite',
  displayName: 'Appwrite',
  docsUrl: 'https://getopenportfolio.vercel.app/docs/self-hosting',

  capabilities: {
    durable: true,
    auth: 'none',
    fileStorage: 'presigned',
    maxUploadBytes: 25 * 1024 * 1024,
    fullTextSearch: false,
    realtime: true,
    transactions: false,
    worksOnEphemeralHosts: true,
  },

  async health(): Promise<HealthReport> {
    const started = Date.now();
    try {
      // `/v1/health/version` is the only health path that answers anonymously;
      // `/v1/health` demands credentials. The authed database read below is
      // the real check either way.
      const version = await fetch(`${endpoint()}/health/version`);
      if (!version.ok) throw new Error(`Appwrite answered ${version.status}.`);
      await aw('GET', `/databases/${DB_ID}`);
      return {
        ok: true,
        detail: `Connected to Appwrite at ${endpoint()}`,
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      return {
        ok: false,
        detail: err instanceof Error ? err.message : 'Could not reach Appwrite.',
        latencyMs: Date.now() - started,
      };
    }
  },

  async provision() {
    await ensureDatabase();
    await ensureBucket();
    await ensureCollections();
    await migrateSnapshotMessages({
      readSnapshot: (channel) => appwriteAdapter.readSnapshot(channel),
      writeSnapshot: (channel, state) => appwriteAdapter.writeSnapshot(channel, state),
      listMessages: () => appwriteAdapter.messages.list(),
      appendMessage: (message) => appwriteAdapter.messages.append(message),
    });
  },

  async readOwner(): Promise<OwnerRecord | null> {
    const doc = await getDoc<OwnerRecord>('owner', docId('owner', 'singleton'));
    return doc
      ? {
          email: doc.email,
          passphraseHash: doc.passphraseHash,
          createdAt: doc.createdAt,
          sessionEpoch: doc.sessionEpoch,
        }
      : null;
  },

  async writeOwner(owner: OwnerRecord) {
    await runQueued('owner', async () => {
      await aw(
        'PUT',
        `/databases/${DB_ID}/collections/owner/documents/${docId('owner', 'singleton')}`,
        {
          data: owner,
        }
      );
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
