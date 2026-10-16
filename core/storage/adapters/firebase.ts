import 'server-only';
import { cert, deleteApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import type { Bucket } from '@google-cloud/storage';
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
 * Firebase: Firestore for records, Cloud Storage for files.
 *
 * Document IDs are the application keys (`published`, the message id, the
 * credential id) — no secondary lookup for the hot paths, and ordering rides
 * on redundant top-level timestamp fields (`receivedAt`, `requestedAt`) rather
 * than document creation time, whose granularity two arrivals in the same
 * millisecond share. Conditional writes and counters run in Firestore
 * transactions, so unlike the file and PocketBase adapters this one is safe
 * with several app instances against one project.
 *
 * Configuration is a service account (the Admin SDK bypasses security rules,
 * which stay locked — see `emulators/firestore.rules`) plus the bucket name.
 * Against the emulator suite no credentials are needed at all.
 */

function projectId(): string {
  const id =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT;
  if (!id) {
    throw new AdapterConfigError(
      'Firebase is selected but no project is set. Add FIREBASE_PROJECT_ID.'
    );
  }
  return id;
}

function bucketName(): string {
  return process.env.FIREBASE_STORAGE_BUCKET || `${projectId()}.appspot.com`;
}

function serviceAccount(): { clientEmail: string; privateKey: string } | null {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!clientEmail || !rawKey) return null;
  // Hosting dashboards do not preserve newlines in a pasted key; both the
  // escaped and the literal form arrive here, so both are accepted.
  return { clientEmail, privateKey: rawKey.replace(/\\n/g, '\n') };
}

let cachedApp: App | null = null;
const APP_NAME = 'opb-firebase';

/** Test seam: deletes the memoised app so the next call re-resolves config. */
export async function __resetFirebaseApp(): Promise<void> {
  if (cachedApp) {
    const previous = cachedApp;
    cachedApp = null;
    await deleteApp(previous).catch(() => {});
  }
}

function app(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps().find((a) => a.name === APP_NAME);
  // A named lookup, never the default: after a reset the SDK registry may
  // still hold an app whose project no longer matches, and `getApp()` would
  // hand back the wrong one — or throw when only a named app exists.
  if (existing) {
    cachedApp = existing;
    return cachedApp;
  }
  const account = serviceAccount();
  // Without credentials and without an emulator this constructor still
  // succeeds and the first call fails instead — which is the correct order,
  // because the error then names the operation that needed authorising.
  cachedApp = initializeApp(
    {
      projectId: projectId(),
      ...(account ? { credential: cert(account) } : {}),
    },
    APP_NAME
  );
  return cachedApp;
}

function db(): Firestore {
  return getFirestore(app());
}

function bucket(): Bucket {
  return getStorage(app()).bucket(bucketName());
}

/** Document IDs may not contain slashes; nothing else is forbidden. */
function docId(value: string): string {
  return value.replace(/\//g, '_');
}

const snapshots = {
  async read(channel: Channel): Promise<CMSState | null> {
    const snap = await db().collection('opb_content').doc(channel).get();
    return snap.exists ? (snap.data() as { state: CMSState }).state : null;
  },

  async readMeta(channel: Channel): Promise<SnapshotRead | null> {
    const snap = await db().collection('opb_content').doc(channel).get();
    if (!snap.exists) return null;
    const data = snap.data() as { state: CMSState; revision: number };
    return { state: data.state, revision: data.revision };
  },

  async write(channel: Channel, state: CMSState, expectedRevision?: number): Promise<number> {
    const ref = db().collection('opb_content').doc(channel);
    return db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const currentRevision = snap.exists
        ? ((snap.data() as { revision: number }).revision ?? 0)
        : 0;

      if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
        throw new RevisionConflictError(expectedRevision, currentRevision);
      }

      const revision = currentRevision + 1;
      tx.set(ref, { channel, state, revision });
      return revision;
    });
  },
};

interface KvDoc {
  value: unknown;
  /** Absent means "keep until deleted". */
  expiresAt?: number;
}

function kvLive(data: KvDoc | undefined): data is KvDoc {
  if (!data) return false;
  if (data.expiresAt === undefined || data.expiresAt === null) return true;
  return data.expiresAt > Date.now();
}

const kvKey = (ns: KvNamespace, key: string): string => docId(`${ns}__${key}`);

const kv: KvAdapter = {
  async get<T>(ns: KvNamespace, key: string): Promise<T | null> {
    const snap = await db().collection('opb_kv').doc(kvKey(ns, key)).get();
    if (!snap.exists || !kvLive(snap.data() as KvDoc)) return null;
    return (snap.data() as KvDoc).value as T;
  },

  async set<T>(ns: KvNamespace, key: string, value: T, ttlSeconds?: number) {
    const doc: KvDoc = { value: value as unknown };
    if (ttlSeconds !== undefined) doc.expiresAt = Date.now() + ttlSeconds * 1000;
    await db().collection('opb_kv').doc(kvKey(ns, key)).set(doc);
    // Best-effort sweep of expired siblings, bounded: kv is counters and
    // codes, never content. A self-hosted project has no cron, and a counter
    // nobody reads again must not accumulate forever.
    const stale = await db()
      .collection('opb_kv')
      .where('expiresAt', '<=', Date.now())
      .limit(50)
      .get();
    await Promise.all(stale.docs.map((d) => d.ref.delete()));
  },

  async del(ns: KvNamespace, key: string) {
    await db().collection('opb_kv').doc(kvKey(ns, key)).delete();
  },

  async incr(ns: KvNamespace, key: string, ttlSeconds: number): Promise<number> {
    const ref = db().collection('opb_kv').doc(kvKey(ns, key));
    return db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const live = kvLive(snap.exists ? (snap.data() as KvDoc) : undefined);
      // A live row keeps its original window: refreshing the TTL on every hit
      // would let a steady stream hold a rate-limit counter open forever.
      if (live) {
        const next = ((snap.data() as KvDoc).value as number) + 1;
        tx.update(ref, { value: next });
        return next;
      }
      tx.set(ref, { value: 1, expiresAt: Date.now() + ttlSeconds * 1000 } satisfies KvDoc);
      return 1;
    });
  },

  async clear(ns: KvNamespace) {
    // Namespaces are a prefix of the document id, not a field — Firestore has
    // no efficient "all keys in namespace" query otherwise, and listing the
    // whole collection to filter client-side reads everybody's sessions to
    // delete one namespace's.
    const snap = await db()
      .collection('opb_kv')
      .orderBy('__name__')
      .startAt(`${ns}__`)
      .endAt(`${ns}__\uf8ff`)
      .get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
  },
};

const messages: MessagesAdapter = {
  async append(message) {
    await db().collection('opb_messages').doc(docId(message.id)).set({
      messageId: message.id,
      receivedAt: message.receivedAt,
      data: message,
    });
  },

  async list(options?: MessageListOptions) {
    let query = db().collection('opb_messages').orderBy('receivedAt', 'desc');
    if (options?.limit !== undefined) query = query.limit(options.limit);
    const snap = await query.get();
    return snap.docs.map((d) => (d.data() as { data: ContactMessage }).data);
  },

  async update(id, patch) {
    const ref = db().collection('opb_messages').doc(docId(id));
    await db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const existing = (snap.data() as { data: ContactMessage }).data;
      tx.set(ref, {
        messageId: id,
        receivedAt: existing.receivedAt,
        data: { ...existing, ...patch, id },
      });
    });
  },

  async remove(id) {
    await db().collection('opb_messages').doc(docId(id)).delete();
  },
};

const subscribers: SubscribersAdapter = {
  async append(subscriber) {
    await db().collection('opb_subscribers').doc(docId(subscriber.id)).set({
      subscriberId: subscriber.id,
      requestedAt: subscriber.requestedAt,
      data: subscriber,
    });
  },

  async list() {
    const snap = await db().collection('opb_subscribers').orderBy('requestedAt', 'desc').get();
    return snap.docs.map((d) => (d.data() as { data: Subscriber }).data);
  },

  async update(id, patch) {
    const ref = db().collection('opb_subscribers').doc(docId(id));
    await db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const existing = (snap.data() as { data: Subscriber }).data;
      tx.set(ref, {
        subscriberId: id,
        requestedAt: existing.requestedAt,
        data: { ...existing, ...patch, id },
      });
    });
  },

  async remove(id) {
    await db().collection('opb_subscribers').doc(docId(id)).delete();
  },
};

const passkeys: PasskeysAdapter = {
  async list() {
    const snap = await db().collection('opb_passkeys').orderBy('createdAt').get();
    return snap.docs
      .map((d) => (d.data() as { data: import('../contract').PasskeyCredential }).data)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async get(id) {
    const snap = await db().collection('opb_passkeys').doc(docId(id)).get();
    return snap.exists
      ? (snap.data() as { data: import('../contract').PasskeyCredential }).data
      : null;
  },

  async put(credential) {
    await db().collection('opb_passkeys').doc(docId(credential.id)).set({
      credentialId: credential.id,
      createdAt: credential.createdAt,
      data: credential,
    });
  },

  async update(id, patch) {
    const ref = db().collection('opb_passkeys').doc(docId(id));
    await db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const existing = (snap.data() as { data: import('../contract').PasskeyCredential }).data;
      const { id: _ignored, ...rest } = patch;
      tx.set(ref, {
        credentialId: id,
        createdAt: existing.createdAt,
        data: { ...existing, ...rest, id },
      });
    });
  },

  async remove(id) {
    await db().collection('opb_passkeys').doc(docId(id)).delete();
  },
};

const records: RecordsAdapter = {
  async list(collection, options?: RecordListOptions): Promise<RecordPage> {
    assertRecordAddress(collection);
    const limit = options?.limit ?? 500;
    const offset = decodeRecordCursor(options?.cursor);
    // Filtered server-side, paged client-side past the first page: Firestore
    // offsets scan, which is correct and merely metered — fine at blog scale.
    const snap = await db()
      .collection('opb_records')
      .where('collection', '==', collection)
      .orderBy('updatedAt', 'desc')
      .get();
    const all = snap.docs.map((d): StoredRecord => {
      const data = d.data() as {
        recordId: string;
        revision: number;
        data: unknown;
        updatedAt: string;
      };
      return {
        id: data.recordId,
        revision: data.revision,
        data: data.data,
        updatedAt: data.updatedAt,
      };
    });
    const page = all.slice(offset, offset + limit);
    return {
      records: page,
      nextCursor: offset + limit < all.length ? encodeRecordCursor(offset + limit) : null,
    };
  },

  async get(collection, id) {
    assertRecordAddress(collection, id);
    const snap = await db()
      .collection('opb_records')
      .doc(docId(`${collection}__${id}`))
      .get();
    if (!snap.exists) return null;
    const data = snap.data() as {
      collection: string;
      recordId: string;
      revision: number;
      data: unknown;
      updatedAt: string;
    };
    if (data.collection !== collection) return null;
    return {
      id: data.recordId,
      revision: data.revision,
      data: data.data,
      updatedAt: data.updatedAt,
    };
  },

  async put(collection, id, data, expectedRevision) {
    assertRecordAddress(collection, id);
    const ref = db()
      .collection('opb_records')
      .doc(docId(`${collection}__${id}`));
    return db().runTransaction(async (tx): Promise<StoredRecord> => {
      const snap = await tx.get(ref);
      const current = snap.exists ? (snap.data() as { revision: number }) : null;
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
      tx.set(ref, {
        collection,
        recordId: id,
        revision: stored.revision,
        data,
        updatedAt: stored.updatedAt,
      });
      return stored;
    });
  },

  async remove(collection, id) {
    assertRecordAddress(collection, id);
    await db()
      .collection('opb_records')
      .doc(docId(`${collection}__${id}`))
      .delete();
  },

  async collections() {
    const snap = await db().collection('opb_records').get();
    const names = new Set<string>();
    for (const doc of snap.docs) {
      const data = doc.data() as { collection?: unknown };
      if (typeof data.collection === 'string') names.add(data.collection);
    }
    return [...names].sort();
  },

  async getSingleton(collection) {
    assertRecordAddress(collection);
    const snap = await db().collection('opb_singletons').doc(docId(collection)).get();
    return snap.exists ? (snap.data() as { data: unknown }).data : null;
  },

  async putSingleton(collection, data) {
    assertRecordAddress(collection);
    await db().collection('opb_singletons').doc(docId(collection)).set({ data });
  },
};

function publicFileUrl(key: string): string {
  const emulator = process.env.STORAGE_EMULATOR_HOST?.replace(/\/$/, '');
  if (emulator) {
    return `${emulator}/v0/b/${bucketName()}/o/${encodeURIComponent(key)}?alt=media`;
  }
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName()}/o/${encodeURIComponent(key)}?alt=media`;
}

const media: MediaAdapter = {
  async put(key, data, mimeType) {
    await bucket()
      .file(key)
      .save(Buffer.from(data), { metadata: { contentType: mimeType } });
    return {
      key,
      url: publicFileUrl(key),
      mimeType,
      sizeBytes: data.byteLength,
      uploadedAt: new Date().toISOString(),
    };
  },

  async resolveUrl(key) {
    const [exists] = await bucket().file(key).exists();
    return exists ? publicFileUrl(key) : null;
  },

  async remove(key) {
    // Already gone is the outcome the caller wanted.
    await bucket().file(key).delete({ ignoreNotFound: true });
  },

  async list() {
    const [files] = await bucket().getFiles();
    const records = await Promise.all(
      files.map(async (file): Promise<MediaRecord | null> => {
        try {
          const [metadata] = await file.getMetadata();
          const size =
            typeof metadata.size === 'string'
              ? Number(metadata.size)
              : ((metadata.size as number) ?? 0);
          return {
            key: file.name,
            url: publicFileUrl(file.name),
            mimeType: (metadata.contentType as string) ?? 'application/octet-stream',
            sizeBytes: Number.isFinite(size) ? size : 0,
            uploadedAt: (metadata.updated as string) ?? new Date().toISOString(),
          };
        } catch {
          return null;
        }
      })
    );
    return records.filter((r): r is MediaRecord => r !== null);
  },
};

export const firebaseAdapter: StorageAdapter = {
  id: 'firebase',
  displayName: 'Firebase',
  docsUrl: 'https://getopenportfolio.vercel.app/docs/self-hosting',

  capabilities: {
    durable: true,
    auth: 'none',
    fileStorage: 'presigned',
    maxUploadBytes: 25 * 1024 * 1024,
    fullTextSearch: false,
    realtime: true,
    transactions: true,
    worksOnEphemeralHosts: true,
  },

  async health(): Promise<HealthReport> {
    const started = Date.now();
    try {
      // Firestore only, deliberately. The bucket cannot be health-checked
      // cheaply: `exists()` answers false on the emulator even with files in
      // it (verified), and a write probe on every orchestrator poll would be
      // rhythmic egress for no benefit. A dead Firestore already fails
      // everything auth-shaped; a media-only outage surfaces on first upload,
      // which reports the backend's own error rather than a cached guess.
      await db().listCollections();
      return {
        ok: true,
        detail: `Connected to Firebase project ${projectId()}`,
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      return {
        ok: false,
        detail: err instanceof Error ? err.message : 'Could not reach Firebase.',
        latencyMs: Date.now() - started,
      };
    }
  },

  async provision() {
    // Collections and the bucket need no creation: Firestore materialises a
    // collection on its first write, and the default bucket exists with the
    // project. What provision does is the same migration every adapter runs.
    await migrateSnapshotMessages({
      readSnapshot: (channel) => firebaseAdapter.readSnapshot(channel),
      writeSnapshot: (channel, state) => firebaseAdapter.writeSnapshot(channel, state),
      listMessages: () => firebaseAdapter.messages.list(),
      appendMessage: (message) => firebaseAdapter.messages.append(message),
    });
  },

  async readOwner(): Promise<OwnerRecord | null> {
    const snap = await db().collection('opb_owner').doc('singleton').get();
    if (!snap.exists) return null;
    const data = snap.data() as OwnerRecord;
    return {
      email: data.email,
      passphraseHash: data.passphraseHash,
      createdAt: data.createdAt,
      sessionEpoch: data.sessionEpoch,
    };
  },

  async writeOwner(owner: OwnerRecord) {
    await db().collection('opb_owner').doc('singleton').set(owner);
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
