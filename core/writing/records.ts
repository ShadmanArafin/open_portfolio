import 'server-only';
import { createHash } from 'node:crypto';
import type { CMSState } from '@/cms/types/cms';
import type { RecordsAdapter, StoredRecord } from '@/core/storage/contract';
import {
  writingBodySchema,
  writingSchema,
  type WritingBody,
  type WritingEntry,
  type WritingSettings,
} from './schema';

/**
 * Writing, stored one post at a time.
 *
 * The `records` surface existed for a year before anything read through it.
 * This is the reader. A blog is the access pattern that justifies it: one post
 * is one record, an edit touches one record instead of rewriting every post,
 * and the public snapshot can carry the metadata a listing needs without
 * carrying every word of every essay.
 *
 * Two collections, on purpose:
 *
 * - `writing-draft` is the authoring copy, one mutable record per post. The
 *   admin reads and writes these, with each record's own revision as the
 *   conflict check.
 * - `writing-bodies` is the published copy, content-addressed by a hash of the
 *   blocks. A body never changes once written; publishing a new version writes
 *   a new record and points the snapshot at its key. That makes the switch from
 *   old to new atomic from a reader's point of view (the snapshot is the
 *   switch), and it means a restored version from History still finds the body
 *   it was published with.
 *
 * The hash is part of the storage format: changing `writingBodyKey`'s
 * canonicalisation would orphan every body already written. Treat it like the
 * cursor encoding in `core/storage/contract.ts` - documented, stable, and
 * decoded by the same version that wrote it.
 */

export const WRITING_DRAFT_COLLECTION = 'writing-draft';
export const WRITING_BODY_COLLECTION = 'writing-bodies';

/** Collections a backup is allowed to carry. Anything else is not ours. */
export const WRITING_RECORD_COLLECTIONS = [
  WRITING_DRAFT_COLLECTION,
  WRITING_BODY_COLLECTION,
] as const;

const RECORD_ADDRESS = /^[a-z0-9-_]{1,64}$/;

/**
 * The record id for a post.
 *
 * Most ids the app creates already fit (`writing_...`). Older content was
 * allowed uppercase letters and up to 100 characters, neither of which every
 * backend accepts as a record id, so those get a stable hash instead. The
 * entry's real id stays inside the record data and is what the UI uses.
 */
export function writingRecordId(entryId: string): string {
  if (RECORD_ADDRESS.test(entryId)) return entryId;
  return `w-${createHash('sha256').update(entryId).digest('hex').slice(0, 32)}`;
}

/** JSON with object keys sorted, so two stores agree on what "unchanged" means. */
export function canonicalJson(value: unknown): string {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

/** The content hash naming a published body record. Stable; see the file note. */
export function writingBodyKey(blocks: unknown[]): string {
  return createHash('sha256').update(canonicalJson(blocks)).digest('hex').slice(0, 32);
}

/** What a draft record stores: the whole post, without a published pointer. */
export function draftRecordData(entry: WritingEntry): Omit<WritingEntry, 'bodyKey'> {
  const { bodyKey: _published, ...rest } = entry;
  return rest;
}

/** What the published snapshot keeps: everything a listing needs, no body. */
export function publishedMetadata(entry: WritingEntry, bodyKey: string): WritingEntry {
  return { ...entry, blocks: [], bodyKey };
}

/**
 * What the draft snapshot keeps: the same metadata, with the body in its record.
 *
 * Dropping `bodyKey` matters here. It names the *published* copy, and a draft
 * that has moved on since publication must not claim that body as its own - the
 * preview reads the draft record first, and only a missing record should ever
 * fall through to the last published text.
 */
export function draftMetadata(entry: WritingEntry): WritingEntry {
  const { bodyKey: _published, ...rest } = entry;
  return { ...rest, blocks: [] };
}

/** The fields that make two drafts the same piece, ignoring write bookkeeping. */
export function writingContentFingerprint(entry: WritingEntry): string {
  const { updatedAt: _updated, revision: _revision, bodyKey: _published, ...content } = entry;
  return canonicalJson(content);
}

export interface DraftWriting {
  entries: WritingEntry[];
  /** Which entries have a record already - a legacy entry has none yet. */
  recordIds: Set<string>;
  /** True when the list came from records; false when it came from a snapshot. */
  fromRecords: boolean;
}

function parseDraftRecord(record: StoredRecord): WritingEntry | null {
  const parsed = writingSchema.safeParse(record.data);
  if (!parsed.success) {
    console.error(`[writing] Ignoring a draft record that is not a post: ${record.id}`);
    return null;
  }
  // The record is the authority on revision and time: it is what the next
  // conditional write checks, and what the screen token fingerprints.
  return { ...parsed.data, revision: record.revision, updatedAt: record.updatedAt };
}

/** Every record in a collection, following cursors until the end. */
export async function listAllRecords(
  records: RecordsAdapter,
  collection: string,
  pageSize = 100
): Promise<StoredRecord[]> {
  const all: StoredRecord[] = [];
  let cursor: string | null = null;
  // A page size of 100 and a ceiling of 100 pages is 10,000 records - far past
  // the 200-post product limit, and a guard against a cursor that never ends.
  for (let page = 0; page < 100; page += 1) {
    const result = await records.list(collection, { limit: pageSize, cursor });
    all.push(...result.records);
    if (!result.nextCursor) return all;
    cursor = result.nextCursor;
  }
  console.error(`[writing] Stopped reading ${collection} after 10,000 records.`);
  return all;
}

async function readBodyRecord(
  records: RecordsAdapter,
  bodyKey: string
): Promise<WritingBody | null> {
  const record = await records.get(WRITING_BODY_COLLECTION, bodyKey).catch((err) => {
    console.error('[writing] Could not read a published body.', err);
    return null;
  });
  if (!record) return null;
  const parsed = writingBodySchema.safeParse(record.data);
  if (!parsed.success || writingBodyKey(parsed.data.blocks) !== bodyKey) {
    console.error(`[writing] A published body failed its own content hash: ${bodyKey}`);
    return null;
  }
  return parsed.data;
}

/** Fill a metadata-only legacy entry back in from the body it points at. */
async function hydrate(records: RecordsAdapter, entry: WritingEntry): Promise<WritingEntry> {
  if (entry.blocks.length > 0 || !entry.bodyKey) return entry;
  const body = await readBodyRecord(records, entry.bodyKey);
  return body ? { ...entry, blocks: body.blocks } : entry;
}

/**
 * The draft list the editor should show.
 *
 * Records and snapshot entries are merged rather than one replacing the other.
 * The snapshot fallback covers two moments: before the first save after the
 * split, when records are empty, and a save that stopped part-way, when some
 * pieces have records and the rest only exist in the snapshot. Treating any
 * record as "records won, ignore everything else" would hide those pieces
 * silently - the worst way to lose writing.
 *
 * Fallback entries may be the metadata-only shape, so their bodies are
 * hydrated from the published records rather than shown as 200 blank posts.
 */
export async function readDraftWriting(
  records: RecordsAdapter,
  fallback: WritingEntry[] = []
): Promise<DraftWriting> {
  const stored = await listAllRecords(records, WRITING_DRAFT_COLLECTION);
  const entries: WritingEntry[] = [];
  const recordIds = new Set<string>();
  const knownIds = new Set<string>();

  for (const record of stored) {
    recordIds.add(record.id);
    const entry = parseDraftRecord(record);
    if (!entry) continue;
    entries.push(entry);
    knownIds.add(entry.id);
  }

  for (const raw of fallback) {
    const parsed = writingSchema.safeParse(raw);
    if (!parsed.success) continue;
    if (recordIds.has(writingRecordId(parsed.data.id)) || knownIds.has(parsed.data.id)) continue;
    entries.push(await hydrate(records, parsed.data));
  }

  return { entries, recordIds, fromRecords: stored.length > 0 };
}

/** A wrapper for readers that only need the list. */
export async function loadDraftWriting(
  records: RecordsAdapter,
  fallback: WritingEntry[] = []
): Promise<WritingEntry[]> {
  return (await readDraftWriting(records, fallback)).entries;
}

/**
 * Give every piece in the draft a record, creating the missing ones.
 *
 * Publishing writes a metadata-only draft snapshot so the next publish cannot
 * resurrect a body. That is only safe once every piece has a record; otherwise
 * a draft that never went through the Writing screen would lose its body the
 * moment the snapshot dropped it. Called before publishing, where the migration
 * costs one write per legacy piece and nothing on an already-migrated site.
 */
export async function ensureDraftWritingRecords(
  records: RecordsAdapter,
  draft: CMSState
): Promise<WritingEntry[]> {
  const source = await readDraftWriting(records, draft.writing ?? []);
  const saved: WritingEntry[] = [];
  for (const entry of source.entries) {
    if (entry.bodyKey && entry.blocks.length === 0) {
      throw new WritingPublishError(
        `The body for "${entry.title}" could not be found, so publishing stopped before it could replace it with an empty piece.`
      );
    }
    if (source.recordIds.has(writingRecordId(entry.id))) {
      saved.push(entry);
    } else {
      saved.push(await putDraftWriting(records, entry, 0));
    }
  }
  return saved;
}

/** One body, by the key the snapshot names. Null means missing or corrupt. */
export async function readPublishedBody(
  records: RecordsAdapter,
  bodyKey: string
): Promise<WritingBody | null> {
  return readBodyRecord(records, bodyKey);
}

/**
 * The blocks a reader should render for an entry.
 *
 * Draft preview prefers the draft record; a draft snapshot that only points at
 * a published body falls through to that body. Published reads use the body
 * key. Legacy entries with the body still inline are rendered as they are.
 * `null` is a broken pointer - the caller should 404 rather than show an
 * article with its body silently missing.
 */
export async function resolveWritingBlocks(
  records: RecordsAdapter,
  entry: WritingEntry,
  channel: 'draft' | 'published'
): Promise<unknown[] | null> {
  if (channel === 'draft') {
    const record = await records
      .get(WRITING_DRAFT_COLLECTION, writingRecordId(entry.id))
      .catch((err) => {
        console.error('[writing] Could not read the draft body.', err);
        return null;
      });
    if (record) {
      const parsed = writingSchema.safeParse(record.data);
      if (parsed.success) return parsed.data.blocks;
      console.error(`[writing] A draft record is not a post: ${record.id}`);
    }
  }

  if (entry.bodyKey) {
    const body = await readBodyRecord(records, entry.bodyKey);
    return body ? body.blocks : null;
  }

  return entry.blocks;
}

/**
 * Write one draft record, conditional on the revision the editor saw.
 *
 * The stored `revision` mirrors the record's own revision rather than counting
 * separately, so the editor's "Version N" is the number the next write checks.
 */
export async function putDraftWriting(
  records: RecordsAdapter,
  entry: WritingEntry,
  expectedRevision: number
): Promise<WritingEntry> {
  const data = {
    ...draftRecordData(entry),
    revision: expectedRevision + 1,
    updatedAt: new Date().toISOString(),
  };
  const stored = await records.put(
    WRITING_DRAFT_COLLECTION,
    writingRecordId(entry.id),
    data,
    expectedRevision
  );
  return {
    ...(stored.data as WritingEntry),
    revision: stored.revision,
    updatedAt: stored.updatedAt,
  };
}

export async function removeDraftWriting(records: RecordsAdapter, entryId: string): Promise<void> {
  await records.remove(WRITING_DRAFT_COLLECTION, writingRecordId(entryId));
}

/** Remove by the record id itself, for a list that already knows it. */
export async function removeDraftWritingRecord(
  records: RecordsAdapter,
  recordId: string
): Promise<void> {
  await records.remove(WRITING_DRAFT_COLLECTION, recordId);
}

/**
 * A publish stopped because a piece's body was not where the snapshot said.
 *
 * Its message is safe to show the owner, unlike an adapter error. Kept as a
 * class so a caller can tell the two apart and only pass this one through.
 */
export class WritingPublishError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WritingPublishError';
  }
}

/**
 * Write every published body and return the metadata the snapshot should hold.
 *
 * Called before the snapshot write. A failure here fails the publish: a
 * snapshot pointing at a body that was never stored would take an article down
 * silently, which is worse than a publish that says it did not finish.
 */
export async function preparePublishedWriting(
  records: RecordsAdapter,
  draft: CMSState
): Promise<WritingEntry[]> {
  const source = await readDraftWriting(records, draft.writing ?? []);
  const published: WritingEntry[] = [];

  for (const entry of source.entries) {
    // Drafts stay private. Scheduled pieces are included so they can appear on
    // their own when their moment passes - `isLive` is still the filter.
    if (entry.status === 'draft') continue;

    let blocks = entry.blocks;
    // A metadata-only fallback entry whose body could not be read must not be
    // republished as an empty post. That would destroy the article quietly.
    if (entry.bodyKey && blocks.length === 0) {
      const body = await readBodyRecord(records, entry.bodyKey);
      if (!body) {
        throw new WritingPublishError(
          `The body for "${entry.title}" could not be found, so publishing stopped before it could replace it with an empty piece.`
        );
      }
      blocks = body.blocks;
    }

    const bodyKey = writingBodyKey(blocks);
    const existing = await records.get(WRITING_BODY_COLLECTION, bodyKey);
    if (!existing) {
      await records.put(WRITING_BODY_COLLECTION, bodyKey, { blocks });
    } else {
      // Content-addressed ids are not a security boundary: verify what is
      // stored is actually the body the key names, and repair it if not.
      const parsed = writingBodySchema.safeParse(existing.data);
      if (!parsed.success || writingBodyKey(parsed.data.blocks) !== bodyKey) {
        console.error(
          `[writing] Repairing a published body that did not match its hash: ${bodyKey}`
        );
        await records.put(WRITING_BODY_COLLECTION, bodyKey, { blocks }, existing.revision);
      }
    }

    published.push(publishedMetadata(entry, bodyKey));
  }

  return published;
}

/**
 * Replace the working draft's writing records with the given entries.
 *
 * Used by version restore and legacy v1 backup restore:
 * - Hydrates any metadata-only entries whose bodies live in `writing-bodies`.
 * - Throws `WritingPublishError` if an entry's body cannot be found.
 * - Writes each piece unconditionally into `writing-draft`.
 * - Removes any existing records in `writing-draft` not present in `entries`.
 */
export async function replaceDraftWriting(
  records: RecordsAdapter,
  entries: WritingEntry[]
): Promise<WritingEntry[]> {
  const wanted = new Set<string>();
  const saved: WritingEntry[] = [];

  for (const entry of entries) {
    let blocks = entry.blocks;
    if (entry.bodyKey && blocks.length === 0) {
      const body = await readBodyRecord(records, entry.bodyKey);
      if (!body) {
        throw new WritingPublishError(
          `The body for "${entry.title}" could not be found, so restoring was stopped before it could replace it with an empty piece.`
        );
      }
      blocks = body.blocks;
    }

    const recId = writingRecordId(entry.id);
    wanted.add(recId);

    const fullEntry: WritingEntry = {
      ...entry,
      blocks,
      revision: 1,
      updatedAt: new Date().toISOString(),
    };

    const stored = await records.put(WRITING_DRAFT_COLLECTION, recId, draftRecordData(fullEntry));

    saved.push({
      ...(stored.data as WritingEntry),
      revision: stored.revision,
      updatedAt: stored.updatedAt,
    });
  }

  const existing = await listAllRecords(records, WRITING_DRAFT_COLLECTION);
  for (const record of existing) {
    if (!wanted.has(record.id)) {
      await records.remove(WRITING_DRAFT_COLLECTION, record.id);
    }
  }

  return saved;
}

/**
 * A fingerprint of exactly what the Writing screen edits.
 *
 * Snapshot revisions are too coarse here: the screen now writes records, and a
 * body edit does not move the snapshot until the derived metadata is rewritten.
 * Hashing each record's revision catches a body edit, an addition and a
 * deletion - the three ways a second tab can make this save unsafe.
 */
export function writingScreenToken(entries: WritingEntry[], settings: WritingSettings): string {
  const slice = {
    settings,
    entries: [...entries]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((entry) => ({
        id: entry.id,
        revision: entry.revision,
        updatedAt: entry.updatedAt,
      })),
  };
  return createHash('sha256').update(canonicalJson(slice)).digest('hex').slice(0, 32);
}
