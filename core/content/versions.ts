import 'server-only';
import type { CMSState, ContentVersion } from '@/cms/types/cms';
import type { StorageAdapter } from '@/core/storage/contract';

/**
 * Version history, one record per publish.
 *
 * History used to live inside the published document: twenty full copies of
 * the site nested in the copy every public page render reads. A site of a
 * few hundred kilobytes carried several megabytes of its own past on each
 * request, and on a backend with a per-document ceiling (Firestore's is 1 MB)
 * the history would eventually stop publishes outright.
 *
 * The `records` surface exists for exactly this — "a 400-post blog cannot
 * live in one JSON document" — so each publish writes one record in the
 * `versions` collection, and only the newest twenty are kept. Content written
 * before this still has its history nested in the document; it is read from
 * there until the next publish moves it across.
 */

export const VERSIONS_COLLECTION = 'versions';
export const MAX_VERSIONS = 20;

function isVersion(value: unknown): value is ContentVersion {
  const v = value as ContentVersion | null;
  return Boolean(v && typeof v.id === 'string' && typeof v.timestamp === 'string' && v.snapshot);
}

function newestFirst(versions: ContentVersion[]): ContentVersion[] {
  return [...versions].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

/** Newest first, records and any not-yet-moved nested history together. */
export async function listVersions(
  adapter: StorageAdapter,
  legacy?: CMSState | null
): Promise<ContentVersion[]> {
  const page = await adapter.records
    .list(VERSIONS_COLLECTION, { limit: 100 })
    .catch(() => ({ records: [] }));
  const byId = new Map<string, ContentVersion>();
  for (const version of legacy?.versions ?? [])
    if (isVersion(version)) byId.set(version.id, version);
  for (const record of page.records)
    if (isVersion(record.data)) byId.set(record.data.id, record.data);
  return newestFirst([...byId.values()]).slice(0, MAX_VERSIONS);
}

export async function findVersion(
  adapter: StorageAdapter,
  id: string,
  legacy?: CMSState | null
): Promise<ContentVersion | null> {
  const record = await adapter.records.get(VERSIONS_COLLECTION, id).catch(() => null);
  if (record && isVersion(record.data)) return record.data;
  return (
    (legacy?.versions ?? []).find((version) => version.id === id && isVersion(version)) ?? null
  );
}

/**
 * Records a publish, moves any nested history across, and prunes to twenty.
 *
 * Called after the publish has landed: a failure here loses one history entry
 * and says so in the log, it never undoes a publish.
 */
export async function recordVersion(
  adapter: StorageAdapter,
  version: ContentVersion,
  legacy: ContentVersion[] = []
): Promise<void> {
  for (const old of legacy) {
    if (!isVersion(old)) continue;
    try {
      if (!(await adapter.records.get(VERSIONS_COLLECTION, old.id))) {
        await adapter.records.put(VERSIONS_COLLECTION, old.id, old);
      }
    } catch (err) {
      // An id from an old format that is not a valid record address: that one
      // entry stays behind rather than blocking the rest.
      console.error('[versions] Could not move an old snapshot.', err);
    }
  }

  await adapter.records.put(VERSIONS_COLLECTION, version.id, version);

  const all = await listVersions(adapter);
  const page = await adapter.records.list(VERSIONS_COLLECTION, { limit: 200 });
  const keep = new Set(all.map((v) => v.id));
  for (const record of page.records) {
    if (!keep.has(record.id)) {
      await adapter.records.remove(VERSIONS_COLLECTION, record.id).catch(() => undefined);
    }
  }
}
