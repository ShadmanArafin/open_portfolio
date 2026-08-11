import 'server-only';
import { mkdir, readFile, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import type { CMSState, ContactMessage } from '@/cms/types/cms';
import type {
  Channel,
  HealthReport,
  KvAdapter,
  KvNamespace,
  MediaAdapter,
  MediaRecord,
  MessagesAdapter,
  OwnerRecord,
  StorageAdapter,
} from '../contract';
import { RevisionConflictError } from '../contract';
import { migrateSnapshotMessages } from './_shared/migrate-messages';

/**
 * Filesystem-backed storage.
 *
 * This is the zero-configuration default: clone, `npm run dev`, and everything
 * works with no account, no keys and no database. It is also a genuinely usable
 * production store on a VPS, a Raspberry Pi or a Docker volume — anywhere the
 * filesystem persists.
 *
 * It is *not* usable on Vercel, Netlify or Workers, where the filesystem is
 * read-only and thrown away between invocations. `worksOnEphemeralHosts: false`
 * is what stops the registry selecting it there and silently losing a user's
 * content on their next deploy.
 */

const ROOT = path.join(process.cwd(), '.opb');
const CONTENT_DIR = path.join(ROOT, 'content');
const MEDIA_DIR = path.join(ROOT, 'media');
const MESSAGES_DIR = path.join(ROOT, 'messages');

/** Rejects `..` and absolute paths so a crafted key cannot escape the folder. */
function safeMediaPath(key: string): string {
  const resolved = path.resolve(MEDIA_DIR, key);
  if (resolved !== MEDIA_DIR && !resolved.startsWith(MEDIA_DIR + path.sep)) {
    throw new Error(`Refusing to touch a media path outside the store: ${key}`);
  }
  return resolved;
}

/** Rejects any id that would place the file outside the messages folder. */
function messagePath(id: string): string {
  const resolved = path.resolve(MESSAGES_DIR, `${id}.json`);
  if (!resolved.startsWith(MESSAGES_DIR + path.sep)) {
    throw new Error(`Refusing to touch a message path outside the store: ${id}`);
  }
  return resolved;
}

const media: MediaAdapter = {
  async put(key, data, mimeType) {
    const target = safeMediaPath(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
    return {
      key,
      url: `/api/media/${encodeURI(key)}`,
      mimeType,
      sizeBytes: data.byteLength,
      uploadedAt: new Date().toISOString(),
    };
  },

  async resolveUrl(key) {
    try {
      await stat(safeMediaPath(key));
      return `/api/media/${encodeURI(key)}`;
    } catch {
      return null;
    }
  },

  async remove(key) {
    try {
      await unlink(safeMediaPath(key));
    } catch {
      // Already gone is the desired end state, not an error.
    }
  },

  async list() {
    try {
      const names = await readdir(MEDIA_DIR);
      const records = await Promise.all(
        names.map(async (name): Promise<MediaRecord | null> => {
          try {
            const info = await stat(path.join(MEDIA_DIR, name));
            if (!info.isFile()) return null;
            return {
              key: name,
              url: `/api/media/${encodeURI(name)}`,
              mimeType: 'application/octet-stream',
              sizeBytes: info.size,
              uploadedAt: info.mtime.toISOString(),
            };
          } catch {
            return null;
          }
        })
      );
      return records.filter((r): r is MediaRecord => r !== null);
    } catch {
      return [];
    }
  },
};

/**
 * Serialises operations per target path.
 *
 * Renaming onto the same destination from two places at once is fine on Linux
 * and fails with EPERM on Windows, where the destination is briefly locked. So
 * rather than racing and hoping, operations against a given file queue behind
 * each other. The observable behaviour for a plain write is unchanged — last
 * writer still wins — but it wins by arriving last rather than by winning a
 * coin toss, and no caller ever sees an error for having written at an
 * inconvenient moment.
 *
 * `messages.update` shares this same queue for its read-merge-write, not only
 * `atomicWrite`'s plain write. A read that happens before a caller ever
 * reaches this queue is invisible to it — which is exactly what let two
 * concurrent updates on the same id both read the same pre-patch row and have
 * whichever wrote last silently discard the other's patch instead of merging
 * with it.
 */
const writeQueues = new Map<string, Promise<void>>();

/** Runs `fn` after every operation already queued for `target` has settled. */
function runQueued<T>(target: string, fn: () => Promise<T>): Promise<T> {
  const previous = writeQueues.get(target) ?? Promise.resolve();
  const run = previous.catch(() => {}).then(fn);
  // Tracked as a void-returning settlement, so both a plain write and a
  // read-merge-write can share one queue regardless of what they return.
  const settled = run.then(
    () => {},
    () => {}
  );

  writeQueues.set(target, settled);
  return run.finally(() => {
    // Drop the entry once this is the last operation, so the map cannot grow
    // without bound over the life of the process.
    if (writeQueues.get(target) === settled) writeQueues.delete(target);
  });
}

/**
 * Writes a file so a reader never sees a partial one.
 *
 * The temp name is unique per write. With a fixed `.tmp`, two writers create
 * the same temp file, the first rename consumes it, and the second fails with
 * ENOENT — a second publish arriving mid-flight would throw rather than simply
 * lose the race.
 *
 * Not queued itself — callers that need queuing go through `runQueued`, which
 * `messages.update` also uses directly for its read, so the two cannot be
 * composed without the outer call deadlocking on its own queue entry.
 */
async function writeAtomically(target: string, contents: string): Promise<void> {
  const temp = `${target}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`;
  try {
    await writeFile(temp, contents, 'utf8');
    await rename(temp, target);
  } catch (err) {
    // Never leave a stray temp file behind on failure.
    await unlink(temp).catch(() => {});
    throw err;
  }
}

function atomicWrite(target: string, contents: string): Promise<void> {
  return runQueued(target, () => writeAtomically(target, contents));
}

/**
 * On-disk shape of a snapshot.
 *
 * Files written before revisions existed are the bare `CMSState`, so a read has
 * to recognise both. Treating an unwrapped file as revision 0 means the first
 * conditional write against it succeeds and everything after is wrapped —
 * upgrade with no migration step and no chance of a user losing a site because
 * the format moved under them.
 */
interface StoredSnapshot {
  revision: number;
  state: CMSState;
}

function isWrapped(value: unknown): value is StoredSnapshot {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as StoredSnapshot).revision === 'number' &&
    typeof (value as StoredSnapshot).state === 'object'
  );
}

async function readStored(channel: Channel): Promise<StoredSnapshot | null> {
  try {
    const raw = JSON.parse(await readFile(channelPath(channel), 'utf8')) as unknown;
    if (isWrapped(raw)) return raw;
    return { revision: 0, state: raw as CMSState };
  } catch {
    // Nothing stored yet is the normal state of a fresh install, not a fault.
    return null;
  }
}

function channelPath(channel: Channel): string {
  return path.join(CONTENT_DIR, `${channel}.json`);
}

const STATE_DIR = path.join(ROOT, 'state');
const OWNER_FILE = path.join(STATE_DIR, 'owner.json');

interface KvEntry<T> {
  value: T;
  expiresAt: number;
}

function kvPath(ns: string): string {
  return path.join(STATE_DIR, `kv-${ns}.json`);
}

async function readKv(ns: string): Promise<Record<string, KvEntry<unknown>>> {
  try {
    return JSON.parse(await readFile(kvPath(ns), 'utf8'));
  } catch {
    return {};
  }
}

async function writeKv(ns: string, data: Record<string, KvEntry<unknown>>): Promise<void> {
  await mkdir(STATE_DIR, { recursive: true });
  // Expired entries are dropped on every write, so the file cannot grow without
  // bound from rate-limit counters that are never read again.
  const now = Date.now();
  const live = Object.fromEntries(Object.entries(data).filter(([, e]) => e.expiresAt > now));
  await writeFile(kvPath(ns), JSON.stringify(live), 'utf8');
}

const kv: KvAdapter = {
  async get<T>(ns: KvNamespace, key: string): Promise<T | null> {
    const entry = (await readKv(ns))[key];
    if (!entry || entry.expiresAt <= Date.now()) return null;
    return entry.value as T;
  },

  async set<T>(ns: KvNamespace, key: string, value: T, ttlSeconds: number) {
    const data = await readKv(ns);
    data[key] = { value, expiresAt: Date.now() + ttlSeconds * 1000 };
    await writeKv(ns, data);
  },

  async del(ns: KvNamespace, key: string) {
    const data = await readKv(ns);
    delete data[key];
    await writeKv(ns, data);
  },

  async incr(ns: KvNamespace, key: string, ttlSeconds: number) {
    const data = await readKv(ns);
    const entry = data[key];
    const current = entry && entry.expiresAt > Date.now() ? (entry.value as number) : 0;
    const next = current + 1;
    data[key] = {
      value: next,
      // Keep the original window: refreshing the TTL on every attempt would let
      // a steady stream of requests hold a counter open indefinitely.
      expiresAt:
        entry && entry.expiresAt > Date.now() ? entry.expiresAt : Date.now() + ttlSeconds * 1000,
    };
    await writeKv(ns, data);
    return next;
  },

  async clear(ns: KvNamespace) {
    await writeKv(ns, {});
  },
};

/**
 * One file per enquiry.
 *
 * Every append writes a distinct path, so concurrent arrivals cannot collide —
 * which is the whole reason this is not a lock around a shared document.
 */
const messages: MessagesAdapter = {
  async append(message) {
    await mkdir(MESSAGES_DIR, { recursive: true });
    await atomicWrite(messagePath(message.id), JSON.stringify(message, null, 2));
  },

  async list(options) {
    let names: string[];
    try {
      names = await readdir(MESSAGES_DIR);
    } catch {
      return [];
    }

    const loaded = await Promise.all(
      names
        .filter((name) => name.endsWith('.json'))
        .map(async (name) => {
          try {
            return JSON.parse(await readFile(path.join(MESSAGES_DIR, name), 'utf8'));
          } catch {
            return null;
          }
        })
    );

    const all = (loaded.filter(Boolean) as ContactMessage[]).sort((a, b) =>
      b.receivedAt.localeCompare(a.receivedAt)
    );
    return options?.limit ? all.slice(0, options.limit) : all;
  },

  async update(id, patch) {
    const target = messagePath(id);
    // The read and the write happen inside the same queued operation, not a
    // read followed by a separately-queued `atomicWrite`. Reading first and
    // queuing the write after is what let two concurrent updates both read
    // the row before either had written, so the later write silently threw
    // away the earlier call's patch instead of merging with it.
    await runQueued(target, async () => {
      let existing: ContactMessage;
      try {
        existing = JSON.parse(await readFile(target, 'utf8')) as ContactMessage;
      } catch {
        return; // Gone already is the caller's intent satisfied.
      }
      await writeAtomically(target, JSON.stringify({ ...existing, ...patch, id }, null, 2));
    });
  },

  async remove(id) {
    try {
      await unlink(messagePath(id));
    } catch {
      // Already absent.
    }
  },
};

export const localAdapter: StorageAdapter = {
  id: 'local',
  displayName: 'Local filesystem',
  docsUrl: 'https://github.com/ShadmanArafin/open_portfolio_builder#choose-your-backend',

  capabilities: {
    durable: true,
    auth: 'none',
    fileStorage: 'proxy',
    maxUploadBytes: 25 * 1024 * 1024,
    fullTextSearch: false,
    realtime: false,
    transactions: false,
    worksOnEphemeralHosts: false,
  },

  async health(): Promise<HealthReport> {
    const started = Date.now();
    try {
      await mkdir(CONTENT_DIR, { recursive: true });
      // Prove the directory is actually writable rather than merely present —
      // a read-only mount looks fine until the first save fails.
      const probe = path.join(CONTENT_DIR, '.write-probe');
      await writeFile(probe, '');
      await unlink(probe);
      return { ok: true, detail: `Reading and writing ${ROOT}`, latencyMs: Date.now() - started };
    } catch (err) {
      return {
        ok: false,
        detail: err instanceof Error ? err.message : 'Filesystem is not writable.',
        latencyMs: Date.now() - started,
      };
    }
  },

  async provision() {
    await mkdir(CONTENT_DIR, { recursive: true });
    await mkdir(MEDIA_DIR, { recursive: true });
    await mkdir(STATE_DIR, { recursive: true });
    await mkdir(MESSAGES_DIR, { recursive: true });
    await migrateSnapshotMessages({
      readSnapshot: (channel) => localAdapter.readSnapshot(channel),
      writeSnapshot: (channel, state) => localAdapter.writeSnapshot(channel, state),
      listMessages: () => messages.list(),
      appendMessage: (message) => messages.append(message),
    });
  },

  async readOwner(): Promise<OwnerRecord | null> {
    try {
      return JSON.parse(await readFile(OWNER_FILE, 'utf8')) as OwnerRecord;
    } catch {
      return null;
    }
  },

  async writeOwner(owner: OwnerRecord) {
    await mkdir(STATE_DIR, { recursive: true });
    await atomicWrite(OWNER_FILE, JSON.stringify(owner, null, 2));
  },

  kv,

  async readSnapshot(channel) {
    return (await readStored(channel))?.state ?? null;
  },

  async readSnapshotMeta(channel) {
    return readStored(channel);
  },

  async writeSnapshot(channel, state, expectedRevision) {
    // The whole read-compare-write runs inside the per-path queue, so it is
    // atomic against every other write in this process — which is all of them:
    // `local` is one machine's disk by definition, and the registry refuses it
    // anywhere that could run two copies.
    return runQueued(channelPath(channel), async () => {
      const current = await readStored(channel);
      const currentRevision = current?.revision ?? 0;

      if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
        throw new RevisionConflictError(expectedRevision, currentRevision);
      }

      const revision = currentRevision + 1;
      await mkdir(CONTENT_DIR, { recursive: true });
      await writeAtomically(
        channelPath(channel),
        JSON.stringify({ revision, state } satisfies StoredSnapshot, null, 2)
      );
      return revision;
    });
  },

  media,
  messages,
};
