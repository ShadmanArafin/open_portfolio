import 'server-only';
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
 * PocketBase: database and object store in one self-hosted binary.
 *
 * One process, one SQLite file, an admin dashboard, and file storage that
 * serves publicly — the closest thing to "Supabase without an account". It
 * runs on a VPS, a home server or a Raspberry Pi next to this app, and the
 * only configuration is a URL plus the admin login created on first boot.
 *
 * Two honest constraints, both documented where they bite:
 *
 * - Conditional writes are serialised in this process (the same per-path queue
 *   the filesystem adapter uses), not in the database: PocketBase has no
 *   compare-and-swap, so two application instances racing a conditional write
 *   could both land where Postgres would refuse one. Run one app container
 *   against PocketBase, or run Postgres.
 * - Media is public by design (`viewRule: ""` on `opb_media` only, so `<img>`
 *   tags resolve without a session). Everything else is superuser-only.
 */

function baseUrl(): string {
  const url = process.env.POCKETBASE_URL?.replace(/\/$/, '');
  if (!url) {
    throw new AdapterConfigError(
      'PocketBase is selected but POCKETBASE_URL is not set. Add the URL of your ' +
        'PocketBase instance (for example http://127.0.0.1:8090).'
    );
  }
  return url;
}

function adminIdentity(): { email: string; password: string } {
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new AdapterConfigError(
      'PocketBase is selected but POCKETBASE_ADMIN_EMAIL or POCKETBASE_ADMIN_PASSWORD ' +
        'is not set. Use the admin login created when PocketBase first booted.'
    );
  }
  return { email, password };
}

let cachedToken: string | null = null;

/** Test seam: drops the memoised superuser token. */
export function __resetPocketBaseToken(): void {
  cachedToken = null;
}

async function superuserToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const { email, password } = adminIdentity();
  const res = await fetch(`${baseUrl()}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
  });
  if (!res.ok) {
    throw new AdapterConfigError(
      'PocketBase rejected the admin credentials. Check POCKETBASE_ADMIN_EMAIL and ' +
        'POCKETBASE_ADMIN_PASSWORD.'
    );
  }
  cachedToken = ((await res.json()) as { token: string }).token;
  return cachedToken as string;
}

class PocketBaseError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'PocketBaseError';
  }
}

async function pb<T>(
  method: string,
  path: string,
  body?: unknown,
  init?: { multipart?: FormData }
): Promise<T> {
  const attempt = async (token: string): Promise<Response> => {
    const headers: Record<string, string> = { Authorization: token };
    if (!init?.multipart) headers['Content-Type'] = 'application/json';
    return fetch(`${baseUrl()}${path}`, {
      method,
      headers,
      body: init?.multipart ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
  };

  let res = await attempt(await superuserToken());
  if (res.status === 401) {
    // The token expired or was revoked. One retry with a fresh login, then the
    // error stands — looping would turn a wrong password into a hammering.
    cachedToken = null;
    res = await attempt(await superuserToken());
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new PocketBaseError(
      `PocketBase ${method} ${path} failed (${res.status}): ${detail.slice(0, 200)}`,
      res.status
    );
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

interface ListResponse<T> {
  items: T[];
  totalItems: number;
}

/** Every item, 500 at a time. Portfolios are hundreds of rows, not millions. */
async function all<T>(
  collection: string,
  query: { filter?: string; sort?: string; perPage?: number } = {}
): Promise<T[]> {
  const out: T[] = [];
  const perPage = query.perPage ?? 500;
  let page = 1;
  for (;;) {
    const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (query.filter) params.set('filter', query.filter);
    if (query.sort) params.set('sort', query.sort);
    const res = await pb<ListResponse<T>>(
      'GET',
      `/api/collections/${collection}/records?${params.toString()}`
    );
    out.push(...res.items);
    if (res.items.length === 0 || out.length >= res.totalItems) break;
    page += 1;
  }
  return out;
}

async function first<T>(collection: string, filter: string): Promise<(T & { id: string }) | null> {
  const res = await pb<ListResponse<T & { id: string }>>(
    'GET',
    `/api/collections/${collection}/records?filter=${encodeURIComponent(filter)}&perPage=1`
  );
  return res.items[0] ?? null;
}

/**
 * Serialises operations per target.
 *
 * PocketBase has no compare-and-swap, so a conditional write is
 * read-compare-write — and two of those interleaved both read the same
 * revision and both land, where Postgres refuses the loser. Queuing by target
 * makes the interleaving impossible inside this process, which is every
 * process that matters in the supported deployment (one app container). The
 * same queue the filesystem adapter uses, for the same reason.
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

interface CollectionSpec {
  name: string;
  fields: Record<string, unknown>[];
  /** Collections whose records browsers fetch directly (media files). */
  publicView?: boolean;
}

const TEXT = { type: 'text', required: false };
/**
 * Never `required`: PocketBase calls `{}`, `[]` and `null` blank and refuses
 * them, and an empty object is a value the contract stores like any other.
 */
const JSON_FIELD = { type: 'json', required: false, maxSize: 0 };
const NUM = { type: 'number', required: false, onlyInt: false };
/**
 * PocketBase no longer adds `created`/`updated` by itself to collections made
 * through the API — the dashboard does, the endpoint does not. Without them
 * there is nothing to sort an inbox by, so every collection declares them.
 */
const AUTODATE = [
  { name: 'created', type: 'autodate', onCreate: true },
  { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
];

const COLLECTIONS: CollectionSpec[] = [
  {
    name: 'opb_content',
    fields: [
      { name: 'channel', ...TEXT, required: true },
      { name: 'data', ...JSON_FIELD },
      { name: 'revision', ...NUM, required: true },
      ...AUTODATE,
    ],
  },
  {
    name: 'opb_owner',
    fields: [
      { name: 'email', ...TEXT, required: true },
      { name: 'passphraseHash', ...TEXT, required: true },
      { name: 'createdAt', ...TEXT, required: true },
      { name: 'sessionEpoch', ...NUM, required: true },
      ...AUTODATE,
    ],
  },
  {
    name: 'opb_kv',
    fields: [
      { name: 'ns', ...TEXT, required: true },
      { name: 'key', ...TEXT, required: true },
      { name: 'value', ...JSON_FIELD },
      // Milliseconds since the epoch, or null for "keep until deleted". A
      // number rather than a date field, so expiry is one unambiguous
      // comparison with no format to disagree about.
      { name: 'expiresAt', ...NUM },
      ...AUTODATE,
    ],
  },
  {
    name: 'opb_messages',
    fields: [
      { name: 'messageId', ...TEXT, required: true },
      // Arrival order, as the sender's clock said — not the database's. Two
      // enquiries can land in the same millisecond, and sorting those by
      // `created` is a coin toss; sorting by `receivedAt` is the inbox order.
      { name: 'receivedAt', ...TEXT, required: true },
      { name: 'data', ...JSON_FIELD },
      ...AUTODATE,
    ],
  },
  {
    name: 'opb_subscribers',
    fields: [
      { name: 'subscriberId', ...TEXT, required: true },
      { name: 'requestedAt', ...TEXT, required: true },
      { name: 'data', ...JSON_FIELD },
      ...AUTODATE,
    ],
  },
  {
    name: 'opb_passkeys',
    fields: [
      { name: 'credentialId', ...TEXT, required: true },
      { name: 'data', ...JSON_FIELD },
      ...AUTODATE,
    ],
  },
  {
    name: 'opb_records',
    fields: [
      { name: 'collection', ...TEXT, required: true },
      { name: 'itemId', ...TEXT, required: true },
      { name: 'data', ...JSON_FIELD },
      { name: 'revision', ...NUM, required: true },
      { name: 'updatedAt', ...TEXT, required: true },
      ...AUTODATE,
    ],
  },
  {
    name: 'opb_singletons',
    fields: [
      { name: 'collection', ...TEXT, required: true },
      { name: 'data', ...JSON_FIELD },
      ...AUTODATE,
    ],
  },
  {
    name: 'opb_media',
    publicView: true,
    fields: [
      { name: 'mediaKey', ...TEXT, required: true },
      {
        name: 'file',
        type: 'file',
        required: true,
        maxSelect: 1,
        maxSize: 25 * 1024 * 1024,
        mimeTypes: [] as string[],
      },
      { name: 'mimeType', ...TEXT },
      { name: 'sizeBytes', ...NUM },
      ...AUTODATE,
    ],
  },
];

function escapeFilterValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Filter expressions must contain no spaces (`ns="x"&&key="y"`, never
 * `ns = "x" && key = "y"`). PocketBase silently ignores a filter it cannot
 * parse and returns unfiltered rows — no error, wrong data, green-looking
 * tests. Every template below is written compact for this reason; do not
 * "tidy" the spacing.
 */

async function ensureCollections(): Promise<void> {
  // The collections index lives at /api/collections itself, not under
  // /records — it is metadata about the schema, not rows in a table.
  const existing = await pb<{
    items: { id: string; name: string; fields?: { type: string; required?: boolean }[] }[];
  }>('GET', '/api/collections?perPage=500');
  const byName = new Map(existing.items.map((c) => [c.name, c]));
  for (const spec of COLLECTIONS) {
    const current = byName.get(spec.name);
    if (current) {
      // Sites provisioned before JSON fields became optional still refuse an
      // empty object; relax those fields in place and leave the rest alone.
      const fields = current.fields ?? [];
      if (fields.some((field) => field.type === 'json' && field.required)) {
        await pb('PATCH', `/api/collections/${current.id}`, {
          fields: fields.map((field) =>
            field.type === 'json' ? { ...field, required: false } : field
          ),
        });
      }
      continue;
    }
    // Omitted rules are superuser-only; media opens reads so `<img>` tags
    // resolve without a session. Listing stays locked: enumeration is a
    // server-side operation, and the admin lists with the superuser token.
    await pb('POST', '/api/collections', {
      name: spec.name,
      type: 'base',
      fields: spec.fields,
      ...(spec.publicView ? { viewRule: '' } : {}),
    });
  }
}

async function removeRecord(collection: string, id: string): Promise<void> {
  try {
    await pb('DELETE', `/api/collections/${collection}/records/${encodeURIComponent(id)}`);
  } catch (err) {
    if (err instanceof PocketBaseError && err.status === 404) return;
    throw err;
  }
}

interface StoredSnapshot {
  id: string;
  channel: string;
  data: CMSState;
  revision: number;
}

async function readStored(channel: Channel): Promise<StoredSnapshot | null> {
  return first<StoredSnapshot>('opb_content', `channel="${escapeFilterValue(channel)}"`);
}

const snapshots = {
  async read(channel: Channel): Promise<CMSState | null> {
    return (await readStored(channel))?.data ?? null;
  },

  async readMeta(channel: Channel): Promise<SnapshotRead | null> {
    const row = await readStored(channel);
    return row ? { state: row.data, revision: row.revision } : null;
  },

  async write(channel: Channel, state: CMSState, expectedRevision?: number): Promise<number> {
    return runQueued(`content:${channel}`, async () => {
      const current = await readStored(channel);
      const currentRevision = current?.revision ?? 0;

      if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
        throw new RevisionConflictError(expectedRevision, currentRevision);
      }

      const revision = currentRevision + 1;
      if (current) {
        await pb('PATCH', `/api/collections/opb_content/records/${current.id}`, {
          data: state,
          revision,
        });
      } else {
        await pb('POST', '/api/collections/opb_content/records', {
          channel,
          data: state,
          revision,
        });
      }
      return revision;
    });
  },
};

interface OwnerRow {
  id: string;
  email: string;
  passphraseHash: string;
  createdAt: string;
  sessionEpoch: number;
}

async function readOwnerRow(): Promise<OwnerRow | null> {
  const rows = await all<OwnerRow>('opb_owner', { perPage: 1 });
  return rows[0] ?? null;
}

interface KvRow {
  id: string;
  ns: string;
  key: string;
  value: unknown;
  expiresAt: number | null;
}

function kvLive(row: KvRow | null): row is KvRow & { value: unknown } {
  if (!row) return false;
  const exp = row.expiresAt;
  // PocketBase returns 0 for a number field that was never set — and coerces
  // an explicit null to 0 on write. Both read as "keep until deleted", which
  // is what the field's absence means everywhere else in this file.
  if (exp === null || exp === undefined || exp === 0) return true;
  return exp > Date.now();
}

const kv: KvAdapter = {
  async get<T>(ns: KvNamespace, key: string): Promise<T | null> {
    const row = await first<KvRow>(
      'opb_kv',
      `ns="${escapeFilterValue(ns)}"&&key="${escapeFilterValue(key)}"`
    );
    if (!kvLive(row)) return null;
    return row.value as T;
  },

  async set<T>(ns: KvNamespace, key: string, value: T, ttlSeconds?: number) {
    await runQueued(`kv:${ns}:${key}`, async () => {
      const existing = await first<KvRow>(
        'opb_kv',
        `ns="${escapeFilterValue(ns)}"&&key="${escapeFilterValue(key)}"`
      );
      // No `expiresAt` key at all for "keep until deleted": PocketBase coerces
      // an explicit null on a number field to 0, which reads as long-expired.
      // Omitting it leaves the field empty, which reads back as missing.
      const record: Record<string, unknown> = { ns, key, value: value as unknown };
      if (ttlSeconds !== undefined) record.expiresAt = Date.now() + ttlSeconds * 1000;
      if (existing) {
        await pb('PATCH', `/api/collections/opb_kv/records/${existing.id}`, record);
        return;
      }
      try {
        await pb('POST', '/api/collections/opb_kv/records', record);
      } catch (err) {
        // Lost a create race with another writer in another process: the row
        // exists now, so patch it rather than failing the caller.
        const retry = await first<KvRow>(
          'opb_kv',
          `ns="${escapeFilterValue(ns)}"&&key="${escapeFilterValue(key)}"`
        );
        if (retry) {
          await pb('PATCH', `/api/collections/opb_kv/records/${retry.id}`, record);
        } else {
          throw err;
        }
      }
      // Drop expired rows while here, bounded: kv is counters and codes, never
      // content, so a best-effort sweep cannot lose anything. Compared in JS,
      // not in the filter: PocketBase answers comparisons against a missing
      // field as true, so `expiresAt<=now` matches permanent rows too — and a
      // sweep built on it deletes the row it just wrote. Found empirically;
      // the compact-filter comment above still stands.
      const candidates = await all<KvRow>('opb_kv');
      const now = Date.now();
      const stale = candidates.filter((row) => {
        const exp = row.expiresAt;
        return exp !== null && exp !== undefined && exp !== 0 && exp <= now;
      });
      await Promise.all(stale.slice(0, 50).map((row) => removeRecord('opb_kv', row.id)));
    });
  },

  async del(ns: KvNamespace, key: string) {
    const row = await first<KvRow>(
      'opb_kv',
      `ns="${escapeFilterValue(ns)}"&&key="${escapeFilterValue(key)}"`
    );
    if (row) await removeRecord('opb_kv', row.id);
  },

  async incr(ns: KvNamespace, key: string, ttlSeconds: number) {
    return runQueued(`kv:${ns}:${key}`, async () => {
      const row = await first<KvRow>(
        'opb_kv',
        `ns="${escapeFilterValue(ns)}"&&key="${escapeFilterValue(key)}"`
      );
      // A live row keeps its original window: refreshing the TTL on every hit
      // would let a steady stream hold a rate-limit counter open forever.
      const usable = row && kvLive(row) ? row : null;
      if (usable) {
        const next = (usable.value as number) + 1;
        await pb('PATCH', `/api/collections/opb_kv/records/${usable.id}`, { value: next });
        return next;
      }
      const record = {
        ns,
        key,
        value: 1,
        expiresAt: Date.now() + ttlSeconds * 1000,
      };
      if (row) {
        await pb('PATCH', `/api/collections/opb_kv/records/${row.id}`, record);
      } else {
        await pb('POST', '/api/collections/opb_kv/records', record);
      }
      return 1;
    });
  },

  async clear(ns: KvNamespace) {
    const rows = await all<KvRow>('opb_kv', { filter: `ns="${escapeFilterValue(ns)}"` });
    await Promise.all(rows.map((row) => removeRecord('opb_kv', row.id)));
  },
};

const messages: MessagesAdapter = {
  async append(message) {
    await pb('POST', '/api/collections/opb_messages/records', {
      messageId: message.id,
      receivedAt: message.receivedAt,
      data: message,
    });
  },

  async list(options?: MessageListOptions) {
    // Sorted by the sender's clock, not the database's (see the schema
    // comment). A limit is one page, not the start of a walk: paging through
    // would return the whole inbox wearing a limit as a disguise.
    if (options?.limit !== undefined) {
      const params = new URLSearchParams({
        page: '1',
        perPage: String(options.limit),
        sort: '-receivedAt',
      });
      const res = await pb<ListResponse<{ data: ContactMessage }>>(
        'GET',
        `/api/collections/opb_messages/records?${params.toString()}`
      );
      return res.items.map((row) => row.data);
    }
    const rows = await all<{ data: ContactMessage }>('opb_messages', { sort: '-receivedAt' });
    return rows.map((row) => row.data);
  },

  async update(id, patch) {
    await runQueued(`message:${id}`, async () => {
      const row = await first<{ data: ContactMessage }>(
        'opb_messages',
        `messageId="${escapeFilterValue(id)}"`
      );
      if (!row) return;
      await pb('PATCH', `/api/collections/opb_messages/records/${row.id}`, {
        data: { ...row.data, ...patch, id },
      });
    });
  },

  async remove(id) {
    const row = await first<{ id: string }>('opb_messages', `messageId="${escapeFilterValue(id)}"`);
    if (row) await removeRecord('opb_messages', row.id);
  },
};

const subscribers: SubscribersAdapter = {
  async append(subscriber) {
    await pb('POST', '/api/collections/opb_subscribers/records', {
      subscriberId: subscriber.id,
      requestedAt: subscriber.requestedAt,
      data: subscriber,
    });
  },

  async list() {
    const rows = await all<{ data: Subscriber }>('opb_subscribers', { sort: '-requestedAt' });
    return rows.map((row) => row.data);
  },

  async update(id, patch) {
    await runQueued(`subscriber:${id}`, async () => {
      const row = await first<{ data: Subscriber }>(
        'opb_subscribers',
        `subscriberId="${escapeFilterValue(id)}"`
      );
      if (!row) return;
      await pb('PATCH', `/api/collections/opb_subscribers/records/${row.id}`, {
        data: { ...row.data, ...patch, id },
      });
    });
  },

  async remove(id) {
    const row = await first<{ id: string }>(
      'opb_subscribers',
      `subscriberId="${escapeFilterValue(id)}"`
    );
    if (row) await removeRecord('opb_subscribers', row.id);
  },
};

const passkeys: PasskeysAdapter = {
  async list() {
    const rows = await all<{ data: PasskeyCredential }>('opb_passkeys', { sort: 'created' });
    return rows.map((row) => row.data).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async get(id) {
    const row = await first<{ data: PasskeyCredential }>(
      'opb_passkeys',
      `credentialId="${escapeFilterValue(id)}"`
    );
    return row?.data ?? null;
  },

  async put(credential) {
    await runQueued(`passkey:${credential.id}`, async () => {
      const row = await first<{ id: string }>(
        'opb_passkeys',
        `credentialId="${escapeFilterValue(credential.id)}"`
      );
      if (row) {
        await pb('PATCH', `/api/collections/opb_passkeys/records/${row.id}`, {
          data: credential,
        });
      } else {
        await pb('POST', '/api/collections/opb_passkeys/records', {
          credentialId: credential.id,
          data: credential,
        });
      }
    });
  },

  async update(id, patch) {
    await runQueued(`passkey:${id}`, async () => {
      const row = await first<{ data: PasskeyCredential }>(
        'opb_passkeys',
        `credentialId="${escapeFilterValue(id)}"`
      );
      if (!row) return;
      const { id: _ignored, ...rest } = patch;
      await pb('PATCH', `/api/collections/opb_passkeys/records/${row.id}`, {
        data: { ...row.data, ...rest, id },
      });
    });
  },

  async remove(id) {
    const row = await first<{ id: string }>(
      'opb_passkeys',
      `credentialId="${escapeFilterValue(id)}"`
    );
    if (row) await removeRecord('opb_passkeys', row.id);
  },
};

const records: RecordsAdapter = {
  async list(collection, options?: RecordListOptions): Promise<RecordPage> {
    assertRecordAddress(collection);
    // Newest first. PocketBase sorts server-side; the ISO timestamp sorts
    // lexicographically, so no second field is needed for order.
    const rows = await all<{
      itemId: string;
      data: unknown;
      revision: number;
      updatedAt: string;
    }>('opb_records', {
      filter: `collection="${escapeFilterValue(collection)}"`,
      sort: '-updatedAt',
    });
    const offset = decodeRecordCursor(options?.cursor);
    const limit = options?.limit ?? 500;
    const page = rows.slice(offset, offset + limit);
    return {
      records: page.map((row): StoredRecord => ({
        id: row.itemId,
        revision: row.revision,
        data: row.data,
        updatedAt: row.updatedAt,
      })),
      nextCursor: offset + limit < rows.length ? encodeRecordCursor(offset + limit) : null,
    };
  },

  async get(collection, id) {
    assertRecordAddress(collection, id);
    const row = await first<{
      itemId: string;
      data: unknown;
      revision: number;
      updatedAt: string;
    }>(
      'opb_records',
      `collection="${escapeFilterValue(collection)}"&&itemId="${escapeFilterValue(id)}"`
    );
    if (!row) return null;
    return { id: row.itemId, revision: row.revision, data: row.data, updatedAt: row.updatedAt };
  },

  async put(collection, id, data, expectedRevision) {
    assertRecordAddress(collection, id);
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
      const existing = await first<{ id: string }>(
        'opb_records',
        `collection="${escapeFilterValue(collection)}"&&itemId="${escapeFilterValue(id)}"`
      );
      const payload = {
        collection,
        itemId: id,
        data,
        revision: stored.revision,
        updatedAt: stored.updatedAt,
      };
      if (existing) {
        await pb('PATCH', `/api/collections/opb_records/records/${existing.id}`, payload);
      } else {
        await pb('POST', '/api/collections/opb_records/records', payload);
      }
      return stored;
    });
  },

  async remove(collection, id) {
    assertRecordAddress(collection, id);
    const row = await first<{ id: string }>(
      'opb_records',
      `collection="${escapeFilterValue(collection)}"&&itemId="${escapeFilterValue(id)}"`
    );
    if (row) await removeRecord('opb_records', row.id);
  },

  async collections() {
    const rows = await all<{ collection: string }>('opb_records', {});
    return [...new Set(rows.map((row) => row.collection))].sort();
  },

  async getSingleton(collection) {
    assertRecordAddress(collection);
    const row = await first<{ data: unknown }>(
      'opb_singletons',
      `collection="${escapeFilterValue(collection)}"`
    );
    return row?.data ?? null;
  },

  async putSingleton(collection, data) {
    assertRecordAddress(collection);
    await runQueued(`singleton:${collection}`, async () => {
      const existing = await first<{ id: string }>(
        'opb_singletons',
        `collection="${escapeFilterValue(collection)}"`
      );
      if (existing) {
        await pb('PATCH', `/api/collections/opb_singletons/records/${existing.id}`, {
          data,
        });
      } else {
        await pb('POST', '/api/collections/opb_singletons/records', { collection, data });
      }
    });
  },
};

function fileUrl(recordId: string, filename: string): string {
  return `${baseUrl()}/api/files/opb_media/${recordId}/${encodeURI(filename)}`;
}

const media: MediaAdapter = {
  async put(key, data, mimeType) {
    const form = new FormData();
    form.append('mediaKey', key);
    form.append('file', new Blob([data as unknown as BlobPart], { type: mimeType }), key);
    form.append('mimeType', mimeType);
    form.append('sizeBytes', String(data.byteLength));
    const record = await pb<{ id: string; file: string }>(
      'POST',
      '/api/collections/opb_media/records',
      undefined,
      { multipart: form }
    );
    return {
      key,
      url: fileUrl(record.id, record.file),
      mimeType,
      sizeBytes: data.byteLength,
      uploadedAt: new Date().toISOString(),
    };
  },

  async resolveUrl(key) {
    const row = await first<{ id: string; file: string }>(
      'opb_media',
      `mediaKey="${escapeFilterValue(key)}"`
    );
    return row ? fileUrl(row.id, row.file) : null;
  },

  async remove(key) {
    const row = await first<{ id: string }>('opb_media', `mediaKey="${escapeFilterValue(key)}"`);
    if (row) await removeRecord('opb_media', row.id);
  },

  async list() {
    const rows = await all<{
      id: string;
      mediaKey: string;
      file: string;
      mimeType: string;
      sizeBytes: number;
    }>('opb_media', { sort: '-created' });
    return rows.map((row): MediaRecord => ({
      key: row.mediaKey,
      url: fileUrl(row.id, row.file),
      mimeType: row.mimeType ?? 'application/octet-stream',
      sizeBytes: row.sizeBytes ?? 0,
      uploadedAt: new Date().toISOString(),
    }));
  },
};

export const pocketbaseAdapter: StorageAdapter = {
  id: 'pocketbase',
  displayName: 'PocketBase',
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
      const res = await fetch(`${baseUrl()}/api/health`);
      if (!res.ok) throw new Error(`PocketBase answered ${res.status}.`);
      await readOwnerRow();
      return {
        ok: true,
        detail: `Connected to PocketBase at ${baseUrl()}`,
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      return {
        ok: false,
        detail: err instanceof Error ? err.message : 'Could not reach PocketBase.',
        latencyMs: Date.now() - started,
      };
    }
  },

  async provision() {
    await ensureCollections();
    await migrateSnapshotMessages({
      readSnapshot: (channel) => pocketbaseAdapter.readSnapshot(channel),
      writeSnapshot: (channel, state) => pocketbaseAdapter.writeSnapshot(channel, state),
      listMessages: () => pocketbaseAdapter.messages.list(),
      appendMessage: (message) => pocketbaseAdapter.messages.append(message),
    });
  },

  async readOwner(): Promise<OwnerRecord | null> {
    const row = await readOwnerRow();
    return row
      ? {
          email: row.email,
          passphraseHash: row.passphraseHash,
          createdAt: row.createdAt,
          sessionEpoch: row.sessionEpoch,
        }
      : null;
  },

  async writeOwner(owner: OwnerRecord) {
    await runQueued('owner', async () => {
      const existing = await readOwnerRow();
      if (existing) {
        await pb('PATCH', `/api/collections/opb_owner/records/${existing.id}`, owner);
      } else {
        await pb('POST', '/api/collections/opb_owner/records', owner);
      }
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
