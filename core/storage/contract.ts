import 'server-only';
import type { CMSState, ContactMessage } from '@/cms/types/cms';
import type { Subscriber } from '@/core/newsletter/schema';

/**
 * The storage contract every backend implements.
 *
 * This is the seam the whole project hangs off: Supabase, Firebase, Convex,
 * Cloudflare D1+R2, PocketBase, Neon and Appwrite each become one file behind
 * this interface, and nothing above it changes. `import 'server-only'` is load
 * bearing — it makes the build fail rather than let a service-role key reach
 * the browser.
 *
 * Two shapes of access, deliberately:
 *
 *   readSnapshot / writeSnapshot  — the public site's path. One read per page
 *   render, identical on every backend, trivially cacheable.
 *
 *   media                          — assets, addressed by key and resolved to a
 *   URL rather than downloaded. The previous design returned a Blob, which
 *   forced every asset to be fetched at boot just to build an object URL.
 */

export type AdapterId =
  | 'local'
  | 'postgres'
  | 'supabase'
  | 'neon'
  | 'firebase'
  | 'cloudflare'
  | 'cloudflare-rest'
  | 'pocketbase'
  | 'appwrite'
  | 'convex';

export type Channel = 'published' | 'draft';

export interface AdapterCapabilities {
  /** False only for stores that cannot survive a restart. */
  durable: boolean;
  /** Whether the adapter can verify an identity itself. */
  auth: 'builtin' | 'none';
  fileStorage: 'presigned' | 'proxy' | 'none';
  maxUploadBytes: number;
  fullTextSearch: boolean;
  realtime: boolean;
  transactions: boolean;
  /**
   * False for stores that only exist on one machine's disk. The registry
   * refuses to select these in production on hosts with an ephemeral or
   * read-only filesystem, rather than letting a user's content vanish on the
   * next deploy.
   */
  worksOnEphemeralHosts: boolean;
}

export interface MediaRecord {
  key: string;
  /** Absolute or same-origin URL. Never a `blob:` or `idb:` reference. */
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface MediaAdapter {
  put(key: string, data: Uint8Array, mimeType: string): Promise<MediaRecord>;
  /** A URL a browser can load. Signed, if the backend needs it to be. */
  resolveUrl(key: string): Promise<string | null>;
  remove(key: string): Promise<void>;
  list(): Promise<MediaRecord[]>;
  /**
   * Raw bytes for the same-origin proxy (`/api/media/[...key]`), for backends
   * whose files are not on the local disk and have no public URL — R2 behind
   * a private bucket, a bucket on an internal hostname. Optional so the four
   * adapters that resolve to a URL or a disk path never think about it; the
   * media route prefers a remote URL, then this, then the disk.
   */
  readBytes?(
    key: string
  ): Promise<{ data: Uint8Array<ArrayBuffer>; mimeType: string; sizeBytes: number } | null>;
}

export interface MessageListOptions {
  /** Newest first, so a limit returns the most recent. */
  limit?: number;
}

/**
 * The contact inbox.
 *
 * Separate from the content snapshot because it has a different writer and a
 * different failure mode. Content is written by one person deliberately;
 * enquiries arrive from strangers concurrently. Appending them to a document
 * meant read-modify-write, and two simultaneous submissions kept one — which
 * `writeSnapshot` is allowed to do and an inbox is not.
 */
export interface MessagesAdapter {
  append(message: ContactMessage): Promise<void>;
  list(options?: MessageListOptions): Promise<ContactMessage[]>;
  /** Shallow merge. Unknown ids are ignored rather than an error. */
  update(id: string, patch: Partial<ContactMessage>): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface SnapshotRead {
  state: CMSState;
  /**
   * Incremented on every write. A writer passes back the revision it read; a
   * mismatch means somebody else wrote in between.
   *
   * The alternative — last write wins — is silent, and silent is the problem:
   * two browser tabs, or a phone and a laptop, and an afternoon's edits vanish
   * with no error anywhere. A number that has to match is the cheapest thing
   * that turns a lost update into a question the user can answer.
   */
  revision: number;
}

/** Thrown when a conditional write finds the stored revision has moved on. */
export class RevisionConflictError extends Error {
  constructor(
    readonly expected: number,
    readonly current: number
  ) {
    super(
      `This was changed somewhere else while you were working (you had version ${expected}, the site is now on ${current}).`
    );
    this.name = 'RevisionConflictError';
  }
}

/**
 * The mailing list.
 *
 * Its own surface for the same reason the inbox has one: strangers append to it
 * concurrently, while content is written deliberately by one person. Folding it
 * into the content document would mean read-modify-write on every signup, and
 * two people subscribing in the same second would keep one of them.
 *
 * Deliberately small. Finding somebody by address or by token is a scan of the
 * list, because a portfolio's list is hundreds of rows and an index is a cost
 * with no reader.
 */
export interface SubscribersAdapter {
  append(subscriber: Subscriber): Promise<void>;
  list(): Promise<Subscriber[]>;
  /** Shallow merge. An unknown id is ignored rather than an error. */
  update(id: string, patch: Partial<Subscriber>): Promise<void>;
  remove(id: string): Promise<void>;
}

/**
 * A registered WebAuthn credential for the single owner.
 *
 * Storage only — the registration/authentication ceremonies (challenge,
 * attestation/assertion verification) live in `core/auth/passkey.ts` and are
 * the next slice, not this one. What this surface guarantees today: a
 * credential enrolled on one machine is visible to verification on every
 * backend, survives restarts on durable stores, and is never part of a content
 * export or backup (auth state must not travel with content).
 *
 * `publicKey` is the COSE-encoded credential public key as base64. The raw
 * credential ID is `id` (base64url, unique). `counter` is the authenticator's
 * signature counter for clone detection; `transports` hints how to reach the
 * authenticator again.
 */
export interface PasskeyCredential {
  id: string;
  publicKey: string;
  counter: number;
  transports: string[];
  deviceName: string;
  createdAt: string;
  lastUsedAt: string | null;
  backedUp: boolean;
}

export interface PasskeysAdapter {
  list(): Promise<PasskeyCredential[]>;
  get(id: string): Promise<PasskeyCredential | null>;
  /** Insert or replace by id. There is exactly one owner, so no namespacing. */
  put(credential: PasskeyCredential): Promise<void>;
  /** Shallow merge of counter/lastUsedAt/deviceName. Unknown ids are ignored. */
  update(id: string, patch: Partial<PasskeyCredential>): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface HealthReport {
  ok: boolean;
  detail: string;
  latencyMs: number;
}

/**
 * Short-lived server state: sessions, one-time codes, rate-limit counters.
 *
 * Deliberately separate from content. Auth state must never travel in a content
 * export, and a backup restored onto another machine must not carry live
 * sessions with it.
 */
/**
 * `config` is the odd one out: it never expires and it holds secrets.
 *
 * It lives here rather than in the content snapshot for the same reason
 * sessions do — a content export must not carry somebody's SMTP password, and a
 * backup restored onto another machine must not bring live credentials with it.
 */
export type KvNamespace = 'session' | 'otp' | 'ratelimit' | 'config' | 'share' | 'push';

export interface KvAdapter {
  get<T>(ns: KvNamespace, key: string): Promise<T | null>;
  /**
   * Stores a value, optionally with an expiry.
   *
   * Omitting `ttlSeconds` means "keep until deleted". That is what the `config`
   * namespace needs: integration settings are not short-lived state, and giving
   * them a very long TTL instead would mean somebody's mail server quietly
   * stops working on a date nobody chose.
   */
  set<T>(ns: KvNamespace, key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(ns: KvNamespace, key: string): Promise<void>;
  /** Returns the new count. Used for rate limiting. */
  incr(ns: KvNamespace, key: string, ttlSeconds: number): Promise<number>;
  /** Drops every key in a namespace — "sign out everywhere". */
  clear(ns: KvNamespace): Promise<void>;
}

/**
 * One record inside a named collection — the authoring path the snapshot
 * cannot serve. A 400-post blog cannot live in one JSON document, and
 * per-record autosave has nothing conditional to write into. Collections hold
 * records; records carry their own revision, so two editors on two devices get
 * a conflict instead of a silent loss.
 *
 * Collection and record ids are lowercase slugs (`[a-z0-9-_]{1,64}`), enforced
 * by `assertRecordAddress`: the same string becomes a filename, a table key, a
 * document id and a URL segment on different backends, and one shared rule
 * keeps all four safe.
 */
export interface StoredRecord {
  id: string;
  /** Starts at 1 on first write; every conditional write moves it. */
  revision: number;
  data: unknown;
  updatedAt: string;
}

export interface RecordListOptions {
  limit?: number;
  /** Opaque cursor from a previous page; absent starts at the beginning. */
  cursor?: string | null;
}

export interface RecordPage {
  records: StoredRecord[];
  /** Pass back as `cursor` for the next page; null when exhausted. */
  nextCursor: string | null;
}

export interface RecordsAdapter {
  /** Newest `updatedAt` first. Offset-based cursors: stable for admin lists
      and small blogs, documented as lossy under concurrent writes. */
  list(collection: string, options?: RecordListOptions): Promise<RecordPage>;
  get(collection: string, id: string): Promise<StoredRecord | null>;
  /**
   * Writes a record and returns it with its new revision. With
   * `expectedRevision` the write lands only on a match and throws
   * `RevisionConflictError` otherwise; an absent record counts as revision 0.
   */
  put(
    collection: string,
    id: string,
    data: unknown,
    expectedRevision?: number
  ): Promise<StoredRecord>;
  remove(collection: string, id: string): Promise<void>;
  /** Every collection that holds at least one record. For exports. */
  collections(): Promise<string[]>;
  /** A single document per collection (settings, theme overrides). No revision. */
  getSingleton(collection: string): Promise<unknown | null>;
  putSingleton(collection: string, data: unknown): Promise<void>;
}

const RECORD_ADDRESS = /^[a-z0-9-_]{1,64}$/;

/** Throws `AdapterConfigError` with a human message for bad addresses. */
export function assertRecordAddress(collection: string, id?: string): void {
  if (!RECORD_ADDRESS.test(collection)) {
    throw new AdapterConfigError(
      `Collection names look like "posts": lowercase letters, numbers, dashes, up to 64 characters. Got "${collection.slice(0, 80)}".`
    );
  }
  if (id !== undefined && !RECORD_ADDRESS.test(id)) {
    throw new AdapterConfigError(
      `Record ids look like "hello-world": lowercase letters, numbers, dashes, up to 64 characters. Got "${id.slice(0, 80)}".`
    );
  }
}

/**
 * Offset cursors, shared so every backend encodes them identically. Opaque to
 * callers by convention only — the format is documented here so a cursor
 * minted by one version still decodes in the next.
 */
export function encodeRecordCursor(offset: number): string {
  return `o:${offset}`;
}

export function decodeRecordCursor(cursor: string | null | undefined): number {
  if (!cursor) return 0;
  const match = /^o:(\d+)$/.exec(cursor);
  if (!match) return 0;
  return Number(match[1]);
}

/**
 * The person who owns this instance.
 *
 * There is exactly one. Multi-user is a hosted-product concern, and modelling
 * it now would mean carrying permission checks through every screen for a
 * capability nobody self-hosting a portfolio has asked for.
 */
export interface OwnerRecord {
  email: string;
  /** scrypt, stored as `scrypt$N$r$p$salt$hash`. Never the passphrase itself. */
  passphraseHash: string;
  createdAt: string;
  /** Bumped to invalidate every existing session at once. */
  sessionEpoch: number;
}

export interface StorageAdapter {
  readonly id: AdapterId;
  readonly displayName: string;
  readonly docsUrl: string;
  readonly capabilities: AdapterCapabilities;

  /** Null until the instance is claimed. */
  readOwner(): Promise<OwnerRecord | null>;
  writeOwner(owner: OwnerRecord): Promise<void>;

  readonly kv: KvAdapter;

  /** Cheap round trip, surfaced in the admin so a broken backend is visible. */
  health(): Promise<HealthReport>;

  /** Idempotent. Creates whatever tables, buckets or folders are needed. */
  provision(): Promise<void>;

  readSnapshot(channel: Channel): Promise<CMSState | null>;

  /**
   * The snapshot together with its revision, for a caller that intends to write
   * it back. Null when nothing has been stored yet.
   */
  readSnapshotMeta(channel: Channel): Promise<SnapshotRead | null>;

  /**
   * Writes a snapshot and returns its new revision.
   *
   * With `expectedRevision`, the write only lands if the stored revision still
   * matches, and throws `RevisionConflictError` otherwise. Without it, the write
   * is unconditional — correct for publishing, which is a deliberate act on
   * content the user just looked at, and wrong for autosave.
   */
  writeSnapshot(channel: Channel, state: CMSState, expectedRevision?: number): Promise<number>;

  readonly media: MediaAdapter;
  readonly messages: MessagesAdapter;
  readonly subscribers: SubscribersAdapter;
  readonly passkeys: PasskeysAdapter;
  /** Per-record collections + singletons: the authoring path. */
  readonly records: RecordsAdapter;
}

/** Thrown when a backend is named but not usable, with a message for a human. */
export class AdapterConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdapterConfigError';
  }
}
