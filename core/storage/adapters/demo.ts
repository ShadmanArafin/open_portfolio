import 'server-only';
import { cookies } from 'next/headers';
import type { CMSState, ContactMessage } from '@/cms/types/cms';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import type { Subscriber } from '@/core/newsletter/schema';
import { hashPassphrase } from '@/core/auth/passphrase';
import {
  DEMO_EMAIL,
  DEMO_PASSPHRASE,
  DEMO_SESSION_COOKIE,
  DEMO_TTL_SECONDS,
} from '@/core/demo/config';
import type {
  AdapterCapabilities,
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

/**
 * A sandbox per visitor, in memory, thrown away after an hour.
 *
 * The alternative — one shared demo everybody edits — is the arrangement every
 * dead sandbox in the research had. It survives about a day: somebody renames
 * the site to something obscene, and from then on the project's most persuasive
 * asset is an argument against using it.
 *
 * Isolating by cookie means the editor can be left completely usable. Nothing
 * has to be read-only, nothing has to be moderated, and the worst anybody can
 * do is vandalise a copy only they can see.
 *
 * In memory on purpose. A demo that persisted would need cleaning up, and
 * cleaning up is the part nobody does.
 */

interface Sandbox {
  subscribers: Subscriber[];
  passkeys: PasskeyCredential[];
  records: Map<string, StoredRecord>;
  singletons: Map<string, unknown>;
  published: { state: CMSState; revision: number } | null;
  draft: { state: CMSState; revision: number } | null;
  owner: OwnerRecord | null;
  messages: ContactMessage[];
  kv: Map<string, { value: unknown; expiresAt: number | null }>;
  touchedAt: number;
}

const sandboxes = new Map<string, Sandbox>();

/**
 * Drops sandboxes nobody has touched.
 *
 * Swept on access rather than on a timer: a serverless instance can be frozen
 * between requests, so a timer is a promise the runtime never made. Bounded
 * too, because the map is the only thing standing between a demo and a memory
 * leak somebody discovers by making a thousand requests.
 */
const MAX_SANDBOXES = 500;

/**
 * Serialises conditional writes per key. JavaScript is single-threaded but
 * not atomic across awaits: two `put`s with the same expected revision would
 * otherwise both read N and both write N+1. Same shape as the filesystem
 * adapter's queue, minus the files.
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

function sweep(): void {
  const cutoff = Date.now() - DEMO_TTL_SECONDS * 1000;
  for (const [id, sandbox] of sandboxes) {
    if (sandbox.touchedAt < cutoff) sandboxes.delete(id);
  }

  if (sandboxes.size <= MAX_SANDBOXES) return;
  const oldest = [...sandboxes.entries()].sort((a, b) => a[1].touchedAt - b[1].touchedAt);
  for (const [id] of oldest.slice(0, sandboxes.size - MAX_SANDBOXES)) sandboxes.delete(id);
}

/**
 * The seed every sandbox starts from, already claimed so nobody has to.
 *
 * The hash comes from `hashPassphrase` rather than being built here. The first
 * version of this reimplemented the format — hex instead of base64, no NFKC
 * normalisation, guessed parameters — and produced a demo nobody could sign
 * into. Reproducing a hash format by hand is how you get exactly that.
 */
async function freshSandbox(): Promise<Sandbox> {
  const hash = await hashPassphrase(DEMO_PASSPHRASE);
  const state = structuredClone(INITIAL_CMS_STATE);
  return {
    published: { state, revision: 1 },
    draft: { state: structuredClone(state), revision: 1 },
    // Pre-claimed: making somebody invent a setup token before they can look at
    // the editor is a wall in front of the thing they came to see.
    owner: {
      email: DEMO_EMAIL,
      passphraseHash: hash,
      createdAt: new Date().toISOString(),
      sessionEpoch: 1,
    },
    messages: [],
    subscribers: [],
    passkeys: [],
    records: new Map(),
    singletons: new Map(),
    kv: new Map(),
    touchedAt: Date.now(),
  };
}

/**
 * This request's sandbox.
 *
 * The cookie is set by middleware, so a visitor who arrives with none still
 * gets a working site — they simply share the anonymous one until their first
 * response lands, which is the read-only public page and harms nobody.
 */
async function current(): Promise<Sandbox> {
  sweep();

  let id = 'anonymous';
  try {
    id = (await cookies()).get(DEMO_SESSION_COOKIE)?.value || 'anonymous';
  } catch {
    // Outside a request — a build, or `generateStaticParams`. One shared
    // sandbox is right there: it is only ever read.
  }

  let sandbox = sandboxes.get(id);
  if (!sandbox) {
    sandbox = await freshSandbox();
    sandboxes.set(id, sandbox);
  }
  sandbox.touchedAt = Date.now();
  return sandbox;
}

const capabilities: AdapterCapabilities = {
  durable: false,
  auth: 'none',
  fileStorage: 'none',
  maxUploadBytes: 0,
  fullTextSearch: false,
  realtime: false,
  transactions: false,
  // Never selectable in production by accident: the registry refuses a
  // non-durable store unless demo mode is explicitly on.
  worksOnEphemeralHosts: false,
};

const media: MediaAdapter = {
  async put(): Promise<MediaRecord> {
    throw new Error('Uploading is switched off in the demo.');
  },
  async resolveUrl() {
    return null;
  },
  async remove() {},
  async list() {
    return [];
  },
};

const messages: MessagesAdapter = {
  async append(message) {
    (await current()).messages.unshift(message);
  },
  async list(options?: MessageListOptions) {
    const all = (await current()).messages;
    return options?.limit ? all.slice(0, options.limit) : all;
  },
  async update(id, patch) {
    const sandbox = await current();
    const index = sandbox.messages.findIndex((m) => m.id === id);
    if (index >= 0) sandbox.messages[index] = { ...sandbox.messages[index], ...patch, id };
  },
  async remove(id) {
    const sandbox = await current();
    sandbox.messages = sandbox.messages.filter((m) => m.id !== id);
  },
};

const subscribers: SubscribersAdapter = {
  async append(subscriber) {
    (await current()).subscribers.unshift(subscriber);
  },
  async list() {
    return (await current()).subscribers;
  },
  async update(id, patch) {
    const sandbox = await current();
    const index = sandbox.subscribers.findIndex((s) => s.id === id);
    if (index >= 0) sandbox.subscribers[index] = { ...sandbox.subscribers[index], ...patch, id };
  },
  async remove(id) {
    const sandbox = await current();
    sandbox.subscribers = sandbox.subscribers.filter((s) => s.id !== id);
  },
};

const records: RecordsAdapter = {
  async list(collection, options?: RecordListOptions): Promise<RecordPage> {
    assertRecordAddress(collection);
    const prefix = `${collection}:`;
    const all: StoredRecord[] = [];
    for (const [key, record] of (await current()).records) {
      if (key.startsWith(prefix)) all.push(record);
    }
    all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const offset = decodeRecordCursor(options?.cursor);
    const limit = options?.limit ?? 500;
    const page = all.slice(offset, offset + limit);
    return {
      records: page,
      nextCursor: offset + limit < all.length ? encodeRecordCursor(offset + limit) : null,
    };
  },

  async get(collection, id) {
    assertRecordAddress(collection, id);
    return (await current()).records.get(`${collection}:${id}`) ?? null;
  },

  async put(collection, id, data, expectedRevision) {
    assertRecordAddress(collection, id);
    return runQueued(`records:${collection}:${id}`, async () => {
      const sandbox = await current();
      const key = `${collection}:${id}`;
      const existing = sandbox.records.get(key);
      const currentRevision = existing?.revision ?? 0;
      if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
        throw new RevisionConflictError(expectedRevision, currentRevision);
      }
      const stored: StoredRecord = {
        id,
        revision: currentRevision + 1,
        data,
        updatedAt: new Date().toISOString(),
      };
      sandbox.records.set(key, stored);
      return stored;
    });
  },

  async remove(collection, id) {
    assertRecordAddress(collection, id);
    (await current()).records.delete(`${collection}:${id}`);
  },

  async collections() {
    const names = new Set<string>();
    for (const key of (await current()).records.keys()) {
      names.add(key.slice(0, key.indexOf(':')));
    }
    return [...names].sort();
  },

  async getSingleton(collection) {
    assertRecordAddress(collection);
    return (await current()).singletons.get(collection) ?? null;
  },

  async putSingleton(collection, data) {
    assertRecordAddress(collection);
    (await current()).singletons.set(collection, data);
  },
};

const passkeys: PasskeysAdapter = {
  async list() {
    return [...(await current()).passkeys].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  async get(id) {
    return (await current()).passkeys.find((c) => c.id === id) ?? null;
  },
  async put(credential) {
    const sandbox = await current();
    const index = sandbox.passkeys.findIndex((c) => c.id === credential.id);
    if (index >= 0) sandbox.passkeys[index] = credential;
    else sandbox.passkeys.push(credential);
  },
  async update(id, patch) {
    const sandbox = await current();
    const index = sandbox.passkeys.findIndex((c) => c.id === id);
    if (index >= 0) {
      const { id: _ignored, ...rest } = patch;
      sandbox.passkeys[index] = { ...sandbox.passkeys[index], ...rest, id };
    }
  },
  async remove(id) {
    const sandbox = await current();
    sandbox.passkeys = sandbox.passkeys.filter((c) => c.id !== id);
  },
};

const kv: KvAdapter = {
  async get<T>(ns: KvNamespace, key: string): Promise<T | null> {
    const entry = (await current()).kv.get(`${ns}:${key}`);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) return null;
    return entry.value as T;
  },
  async set<T>(ns: KvNamespace, key: string, value: T, ttlSeconds?: number) {
    (await current()).kv.set(`${ns}:${key}`, {
      value,
      expiresAt: ttlSeconds === undefined ? null : Date.now() + ttlSeconds * 1000,
    });
  },
  async del(ns: KvNamespace, key: string) {
    (await current()).kv.delete(`${ns}:${key}`);
  },
  async incr(ns: KvNamespace, key: string, ttlSeconds: number) {
    const sandbox = await current();
    const existing = sandbox.kv.get(`${ns}:${key}`);
    const live = existing && (existing.expiresAt === null || existing.expiresAt > Date.now());
    const next = (live ? (existing.value as number) : 0) + 1;
    sandbox.kv.set(`${ns}:${key}`, {
      value: next,
      expiresAt: live ? existing!.expiresAt : Date.now() + ttlSeconds * 1000,
    });
    return next;
  },
  async clear(ns: KvNamespace) {
    const sandbox = await current();
    for (const key of [...sandbox.kv.keys()]) {
      if (key.startsWith(`${ns}:`)) sandbox.kv.delete(key);
    }
  },
};

export const demoAdapter: StorageAdapter = {
  id: 'local',
  displayName: 'Demo (in memory, resets hourly)',
  docsUrl: '',
  capabilities,

  async health(): Promise<HealthReport> {
    return { ok: true, detail: 'In-memory demo sandbox.', latencyMs: 0 };
  },

  async provision() {},

  async readSnapshot(channel: Channel) {
    return (await current())[channel]?.state ?? null;
  },

  async readSnapshotMeta(channel: Channel): Promise<SnapshotRead | null> {
    const stored = (await current())[channel];
    return stored ? { state: stored.state, revision: stored.revision } : null;
  },

  async writeSnapshot(channel: Channel, state: CMSState, expectedRevision?: number) {
    const sandbox = await current();
    const currentRevision = sandbox[channel]?.revision ?? 0;
    if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
      throw new RevisionConflictError(expectedRevision, currentRevision);
    }
    const revision = currentRevision + 1;
    sandbox[channel] = { state, revision };
    return revision;
  },

  async readOwner() {
    return (await current()).owner;
  },

  async writeOwner(owner: OwnerRecord) {
    (await current()).owner = owner;
  },

  kv,
  media,
  messages,
  subscribers,
  passkeys,
  records,
};

/** Test seam. Never called in production. */
export function __resetDemoSandboxes(): void {
  sandboxes.clear();
}

export function __sandboxCount(): number {
  return sandboxes.size;
}
