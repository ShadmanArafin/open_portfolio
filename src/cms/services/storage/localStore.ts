import { CMSState } from '../../types/cms';
import { ContentStore, StorageQuotaError, isQuotaError } from './types';

const DB_NAME = 'opb_cms';
const DB_VERSION = 1;
const CONTENT_STORE = 'content';
const MEDIA_STORE = 'media';

const KEY_PUBLISHED = 'published';
const KEY_DRAFT = 'draft';

/**
 * Pre-rename database, copied across once on first boot so a site that already
 * has content doesn't come back empty after upgrading. Remove at 1.0.
 */
const LEGACY_DB_NAME = 'arshan_portfolio_cms';

/** Legacy localStorage keys, read once so existing edits aren't lost on upgrade. */
const LEGACY_PUBLISHED = 'arshan_portfolio_cms_published_v1';
const LEGACY_DRAFT = 'arshan_portfolio_cms_draft_v1';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser context.'));
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CONTENT_STORE)) db.createObjectStore(CONTENT_STORE);
      if (!db.objectStoreNames.contains(MEDIA_STORE)) db.createObjectStore(MEDIA_STORE);
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB.'));
    req.onblocked = () => reject(new Error('IndexedDB upgrade blocked by another open tab.'));
  }).then(async (db) => {
    await adoptLegacyDb(db);
    return db;
  });

  // Don't cache a rejected promise — a later attempt should be able to retry.
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
}

function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  return openDB().then(
    (db) =>
      new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).get(key);
        req.onsuccess = () => resolve((req.result as T) ?? null);
        req.onerror = () => reject(req.error);
      })
  );
}

function idbPut(storeName: string, key: string, value: unknown): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted.'));
      })
  );
}

function idbDelete(storeName: string, key: string): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

function idbKeys(storeName: string): Promise<string[]> {
  return openDB().then(
    (db) =>
      new Promise<string[]>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).getAllKeys();
        req.onsuccess = () => resolve((req.result as IDBValidKey[]).map(String));
        req.onerror = () => reject(req.error);
      })
  );
}

function idbClear(storeName: string): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

/**
 * One-time copy across from the pre-rename database.
 *
 * Only runs when the new database has no published content, so it can never
 * overwrite newer edits, and it is deliberately best-effort: a browser that
 * refuses to open the old database should still get a working site, not an
 * error. The old database is left in place — deleting someone's only copy of
 * their content because a copy *appeared* to succeed is not a trade worth making.
 */
async function adoptLegacyDb(db: IDBDatabase): Promise<void> {
  try {
    const alreadyHasContent = await new Promise<boolean>((resolve) => {
      const tx = db.transaction(CONTENT_STORE, 'readonly');
      const req = tx.objectStore(CONTENT_STORE).getKey(KEY_PUBLISHED);
      req.onsuccess = () => resolve(req.result !== undefined);
      req.onerror = () => resolve(true); // on doubt, don't touch anything
    });
    if (alreadyHasContent) return;

    // Opening a database creates it when it does not exist, which would leave
    // an empty database named after the old build on every fresh install.
    // `onupgradeneeded` firing is how we know we just created it — when that
    // happens, abort and delete what we made.
    let created = false;
    const legacy = await new Promise<IDBDatabase | null>((resolve) => {
      const r = indexedDB.open(LEGACY_DB_NAME);
      r.onupgradeneeded = () => {
        created = true;
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.onblocked = () => resolve(null);
    });

    if (created) {
      legacy?.close();
      indexedDB.deleteDatabase(LEGACY_DB_NAME);
      return;
    }
    if (!legacy) return;

    try {
      const stores = Array.from(legacy.objectStoreNames);
      if (!stores.includes(CONTENT_STORE)) return;

      const copyStore = async (name: string) => {
        if (!stores.includes(name)) return;
        const entries = await new Promise<[string, unknown][]>((resolve) => {
          const tx = legacy.transaction(name, 'readonly');
          const store = tx.objectStore(name);
          const keysReq = store.getAllKeys();
          const valsReq = store.getAll();
          tx.oncomplete = () =>
            resolve(
              (keysReq.result as IDBValidKey[]).map((k, i) => [String(k), valsReq.result[i]])
            );
          tx.onerror = () => resolve([]);
        });
        if (!entries.length) return;
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(name, 'readwrite');
          const store = tx.objectStore(name);
          for (const [k, v] of entries) store.put(v, k);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
      };

      await copyStore(CONTENT_STORE);
      await copyStore(MEDIA_STORE);
    } finally {
      legacy.close();
    }
  } catch {
    // Best effort. A failed adoption falls through to the seed content.
  }
}

/** One-time rescue of content written by the previous localStorage-based build. */
function readLegacy(key: string): CMSState | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CMSState;
  } catch {
    return null;
  }
}

function wrapWriteError(err: unknown, what: string): never {
  if (isQuotaError(err)) {
    throw new StorageQuotaError(
      `Browser storage is full — could not save ${what}. Export your content, then remove some large images from the media library.`,
      err
    );
  }
  throw err instanceof Error ? err : new Error(`Failed to save ${what}.`);
}

/**
 * IndexedDB-backed store. Holds the content tree in one object store and
 * uploaded media as real Blobs in another — no base64, no 5MB localStorage
 * ceiling, and images stay binary instead of inflating ~33% as text.
 */
export class IndexedDBStore implements ContentStore {
  readonly name = 'Browser storage (IndexedDB)';
  readonly isDurable = true;

  async loadPublished(): Promise<CMSState | null> {
    const found = await idbGet<CMSState>(CONTENT_STORE, KEY_PUBLISHED);
    return found ?? readLegacy(LEGACY_PUBLISHED);
  }

  async loadDraft(): Promise<CMSState | null> {
    const found = await idbGet<CMSState>(CONTENT_STORE, KEY_DRAFT);
    return found ?? readLegacy(LEGACY_DRAFT);
  }

  async savePublished(state: CMSState): Promise<void> {
    try {
      await idbPut(CONTENT_STORE, KEY_PUBLISHED, state);
    } catch (err) {
      wrapWriteError(err, 'published content');
    }
  }

  async saveDraft(state: CMSState): Promise<void> {
    try {
      await idbPut(CONTENT_STORE, KEY_DRAFT, state);
    } catch (err) {
      wrapWriteError(err, 'your draft');
    }
  }

  async putMedia(id: string, blob: Blob): Promise<void> {
    try {
      await idbPut(MEDIA_STORE, id, blob);
    } catch (err) {
      wrapWriteError(err, 'the uploaded file');
    }
  }

  getMedia(id: string): Promise<Blob | null> {
    return idbGet<Blob>(MEDIA_STORE, id);
  }

  deleteMedia(id: string): Promise<void> {
    return idbDelete(MEDIA_STORE, id);
  }

  listMediaIds(): Promise<string[]> {
    return idbKeys(MEDIA_STORE);
  }

  async clearAll(): Promise<void> {
    await Promise.all([idbClear(CONTENT_STORE), idbClear(MEDIA_STORE)]);
    try {
      localStorage.removeItem(LEGACY_PUBLISHED);
      localStorage.removeItem(LEGACY_DRAFT);
    } catch {
      /* localStorage may be unavailable; the IndexedDB clear above is what matters. */
    }
  }
}

/**
 * Fallback for contexts where IndexedDB is blocked (some private-browsing
 * modes, hardened privacy settings). The admin stays usable for the session
 * and warns that nothing will persist, instead of white-screening on boot.
 */
export class MemoryStore implements ContentStore {
  readonly name = 'In-memory (nothing will be saved)';
  readonly isDurable = false;

  private published: CMSState | null = null;
  private draft: CMSState | null = null;
  private media = new Map<string, Blob>();

  async loadPublished() {
    return this.published;
  }
  async loadDraft() {
    return this.draft;
  }
  async savePublished(state: CMSState) {
    this.published = state;
  }
  async saveDraft(state: CMSState) {
    this.draft = state;
  }
  async putMedia(id: string, blob: Blob) {
    this.media.set(id, blob);
  }
  async getMedia(id: string) {
    return this.media.get(id) ?? null;
  }
  async deleteMedia(id: string) {
    this.media.delete(id);
  }
  async listMediaIds() {
    return [...this.media.keys()];
  }
  async clearAll() {
    this.published = null;
    this.draft = null;
    this.media.clear();
  }
}

/** Probe IndexedDB once at boot and fall back to memory if it's unusable. */
export async function createLocalStore(): Promise<ContentStore> {
  try {
    await openDB();
    return new IndexedDBStore();
  } catch (err) {
    console.warn('[cms] IndexedDB unavailable, falling back to in-memory storage.', err);
    return new MemoryStore();
  }
}
