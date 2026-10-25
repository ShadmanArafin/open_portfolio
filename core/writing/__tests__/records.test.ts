import { describe, expect, it } from 'vitest';
import type { RecordsAdapter, StoredRecord } from '@/core/storage/contract';
import { RevisionConflictError } from '@/core/storage/contract';
import {
  canonicalJson,
  draftMetadata,
  draftRecordData,
  ensureDraftWritingRecords,
  listAllRecords,
  preparePublishedWriting,
  publishedMetadata,
  putDraftWriting,
  readDraftWriting,
  readPublishedBody,
  removeDraftWriting,
  removeDraftWritingRecord,
  replaceDraftWriting,
  resolveWritingBlocks,
  WRITING_BODY_COLLECTION,
  WRITING_DRAFT_COLLECTION,
  writingBodyKey,
  writingContentFingerprint,
  writingRecordId,
  writingScreenToken,
  WritingPublishError,
} from '../records';
import { createWritingEntry, type WritingEntry, type WritingSettings } from '../schema';
import type { CMSState } from '@/cms/types/cms';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';

class MemoryRecordsAdapter implements RecordsAdapter {
  private store = new Map<string, Map<string, StoredRecord>>();
  private singletons = new Map<string, unknown>();

  private getCol(col: string) {
    let map = this.store.get(col);
    if (!map) {
      map = new Map();
      this.store.set(col, map);
    }
    return map;
  }

  async list(collection: string, options?: { limit?: number; cursor?: string | null }) {
    const col = this.getCol(collection);
    const sorted = [...col.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const offset = options?.cursor ? Number(options.cursor) : 0;
    const limit = options?.limit ?? 100;
    const records = sorted.slice(offset, offset + limit);
    const nextOffset = offset + records.length;
    return {
      records,
      nextCursor: nextOffset < sorted.length ? String(nextOffset) : null,
    };
  }

  async get(collection: string, id: string) {
    return this.getCol(collection).get(id) ?? null;
  }

  async put(collection: string, id: string, data: unknown, expectedRevision?: number) {
    const col = this.getCol(collection);
    const existing = col.get(id);
    const currentRev = existing?.revision ?? 0;
    if (expectedRevision !== undefined && expectedRevision !== currentRev) {
      throw new RevisionConflictError(expectedRevision, currentRev);
    }
    const revision = currentRev + 1;
    const stored: StoredRecord = {
      id,
      revision,
      data,
      updatedAt: new Date().toISOString(),
    };
    col.set(id, stored);
    return stored;
  }

  async remove(collection: string, id: string) {
    this.getCol(collection).delete(id);
  }

  async collections() {
    return [...this.store.keys()];
  }

  async getSingleton(collection: string) {
    return this.singletons.get(collection) ?? null;
  }

  async putSingleton(collection: string, data: unknown) {
    this.singletons.set(collection, data);
  }
}

describe('writing records utilities', () => {
  it('formats record IDs safely', () => {
    expect(writingRecordId('writing-123')).toBe('writing-123');
    expect(writingRecordId('post_abc_456')).toBe('post_abc_456');
    // Uppercase or special characters get hashed
    const hashed = writingRecordId('Post With Caps & Spaces');
    expect(hashed).toMatch(/^w-[a-f0-9]{32}$/);
    // Long IDs get hashed
    const longId = 'a'.repeat(70);
    expect(writingRecordId(longId)).toMatch(/^w-[a-f0-9]{32}$/);
  });

  it('computes deterministic canonical JSON and content keys', () => {
    const objA = { b: 2, a: 1, c: [3, 4] };
    const objB = { a: 1, c: [3, 4], b: 2 };
    expect(canonicalJson(objA)).toBe(canonicalJson(objB));
    expect(canonicalJson(undefined)).toBe('null');

    const key1 = writingBodyKey([{ type: 'richText', props: { text: 'Hello' } }]);
    const key2 = writingBodyKey([{ type: 'richText', props: { text: 'Hello' } }]);
    expect(key1).toBe(key2);
    expect(key1).toHaveLength(32);
  });

  it('strips bodyKey for draft records and blocks for metadata', () => {
    const post: WritingEntry = {
      ...createWritingEntry('Title'),
      bodyKey: 'abc',
      blocks: [{ type: 'richText' }],
    };
    const draftData = draftRecordData(post);
    expect((draftData as { bodyKey?: string }).bodyKey).toBeUndefined();
    expect(draftData.blocks).toHaveLength(1);

    const pubMeta = publishedMetadata(post, 'key123');
    expect(pubMeta.bodyKey).toBe('key123');
    expect(pubMeta.blocks).toEqual([]);

    const draftMeta = draftMetadata(post);
    expect((draftMeta as { bodyKey?: string }).bodyKey).toBeUndefined();
    expect(draftMeta.blocks).toEqual([]);
  });

  it('computes fingerprints and screen tokens', () => {
    const postA: WritingEntry = {
      ...createWritingEntry('Title'),
      revision: 1,
      updatedAt: '2026-01-01',
    };
    const postB: WritingEntry = {
      ...postA,
      revision: 2,
      updatedAt: '2026-02-02',
    };
    expect(writingContentFingerprint(postA)).toBe(writingContentFingerprint(postB));

    const settings: WritingSettings = {
      label: 'Blog',
      slug: 'writing',
      order: 'curated',
      showDates: false,
      enabled: true,
    };
    const token1 = writingScreenToken([postA], settings);
    const token2 = writingScreenToken([postA], settings);
    expect(token1).toBe(token2);
    // Screen token tracks revisions
    const token3 = writingScreenToken([postB], settings);
    expect(token1).not.toBe(token3);
  });
});

describe('writing records storage interactions', () => {
  it('reads draft writing and merges with fallback snapshots', async () => {
    const records = new MemoryRecordsAdapter();
    const fallbackEntry: WritingEntry = {
      ...createWritingEntry('Legacy Post'),
      id: 'legacy-1',
      blocks: [{ type: 'richText', props: { text: 'Fallback' } }],
    };

    // Stored draft record
    const storedPost: WritingEntry = {
      ...createWritingEntry('Stored Post'),
      id: 'stored-1',
      blocks: [{ type: 'richText', props: { text: 'Stored' } }],
    };
    await putDraftWriting(records, storedPost, 0);

    const result = await readDraftWriting(records, [fallbackEntry]);
    expect(result.fromRecords).toBe(true);
    expect(result.recordIds.has('stored-1')).toBe(true);
    expect(result.entries.map((e) => e.title)).toContain('Stored Post');
    expect(result.entries.map((e) => e.title)).toContain('Legacy Post');
  });

  it('ensures draft writing records are created for legacy entries', async () => {
    const records = new MemoryRecordsAdapter();
    const legacy: WritingEntry = {
      ...createWritingEntry('Legacy Entry'),
      id: 'legacy-entry',
      blocks: [{ type: 'richText' }],
    };
    const draft: CMSState = {
      ...INITIAL_CMS_STATE,
      writing: [legacy],
    };

    const saved = await ensureDraftWritingRecords(records, draft);
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('legacy-entry');

    const inStorage = await records.get(WRITING_DRAFT_COLLECTION, 'legacy-entry');
    expect(inStorage).not.toBeNull();
  });

  it('resolves writing blocks from draft and published channels', async () => {
    const records = new MemoryRecordsAdapter();
    const blocks = [{ type: 'richText', props: { p: 'Hello' } }];
    const bodyKey = writingBodyKey(blocks);

    // Save body in writing-bodies
    await records.put(WRITING_BODY_COLLECTION, bodyKey, { blocks });

    const post: WritingEntry = {
      ...createWritingEntry('Post'),
      id: 'post-1',
      blocks: [],
      bodyKey,
    };

    // Resolving published channel uses bodyKey
    const publishedBlocks = await resolveWritingBlocks(records, post, 'published');
    expect(publishedBlocks).toEqual(blocks);

    // Draft channel with record uses draft record
    const draftBlocks = [{ type: 'richText', props: { p: 'Draft Edit' } }];
    await putDraftWriting(records, { ...post, blocks: draftBlocks }, 0);
    const resolvedDraft = await resolveWritingBlocks(records, post, 'draft');
    expect(resolvedDraft).toEqual(draftBlocks);
  });

  it('prepares published writing: stores bodies, skips drafts, and throws on missing bodies', async () => {
    const records = new MemoryRecordsAdapter();

    const liveBlocks = [{ type: 'richText', props: { p: 'Live Post' } }];
    const livePost: WritingEntry = {
      ...createWritingEntry('Live Post'),
      id: 'live-1',
      status: 'published',
      blocks: liveBlocks,
    };
    const draftPost: WritingEntry = {
      ...createWritingEntry('Draft Post'),
      id: 'draft-1',
      status: 'draft',
      blocks: [{ type: 'richText' }],
    };

    await putDraftWriting(records, livePost, 0);
    await putDraftWriting(records, draftPost, 0);

    const cmsState: CMSState = {
      ...INITIAL_CMS_STATE,
      writing: [livePost, draftPost],
    };

    const published = await preparePublishedWriting(records, cmsState);
    // Draft is filtered out
    expect(published).toHaveLength(1);
    expect(published[0].id).toBe('live-1');
    expect(published[0].blocks).toEqual([]);
    expect(published[0].bodyKey).toBe(writingBodyKey(liveBlocks));

    // Verify the body was written to WRITING_BODY_COLLECTION
    const bodyRec = await readPublishedBody(records, published[0].bodyKey!);
    expect(bodyRec?.blocks).toEqual(liveBlocks);

    // Throws WritingPublishError if a piece has empty blocks with missing bodyKey in store
    const brokenPost: WritingEntry = {
      ...createWritingEntry('Broken Post'),
      id: 'broken-1',
      status: 'published',
      blocks: [],
      bodyKey: 'nonexistent-body-key-1234567890', // gitleaks:allow
    };

    await expect(
      preparePublishedWriting(records, { ...INITIAL_CMS_STATE, writing: [brokenPost] })
    ).rejects.toThrow(WritingPublishError);
  });

  it('replaces draft writing: hydrates bodies, removes stale records, and throws on missing bodies', async () => {
    const records = new MemoryRecordsAdapter();

    // Existing draft record that should be deleted
    await putDraftWriting(
      records,
      { ...createWritingEntry('Stale Post'), id: 'stale-1', blocks: [] },
      0
    );

    // Body in storage for restored version
    const restoredBlocks = [{ type: 'richText', props: { text: 'Restored' } }];
    const bodyKey = writingBodyKey(restoredBlocks);
    await records.put(WRITING_BODY_COLLECTION, bodyKey, { blocks: restoredBlocks });

    const incoming: WritingEntry[] = [
      {
        ...createWritingEntry('Restored Post'),
        id: 'restored-1',
        blocks: [],
        bodyKey,
      },
    ];

    const replaced = await replaceDraftWriting(records, incoming);
    expect(replaced).toHaveLength(1);
    expect(replaced[0].id).toBe('restored-1');

    // Stale post was deleted
    expect(await records.get(WRITING_DRAFT_COLLECTION, 'stale-1')).toBeNull();

    // Restored post is stored with hydrated blocks
    const stored = await records.get(WRITING_DRAFT_COLLECTION, 'restored-1');
    expect(stored).not.toBeNull();
    expect((stored?.data as { blocks: unknown[] }).blocks).toEqual(restoredBlocks);

    // Throws WritingPublishError if incoming entry body cannot be found
    const missingIncoming: WritingEntry[] = [
      {
        ...createWritingEntry('Missing Body Post'),
        id: 'missing-1',
        blocks: [],
        bodyKey: 'dead-key-123',
      },
    ];
    await expect(replaceDraftWriting(records, missingIncoming)).rejects.toThrow(
      WritingPublishError
    );
  });

  it('removes draft writing and lists all records correctly', async () => {
    const records = new MemoryRecordsAdapter();
    const post = { ...createWritingEntry('Post'), id: 'test-post' };
    await putDraftWriting(records, post, 0);
    expect(await records.get(WRITING_DRAFT_COLLECTION, 'test-post')).not.toBeNull();

    await removeDraftWriting(records, 'test-post');
    expect(await records.get(WRITING_DRAFT_COLLECTION, 'test-post')).toBeNull();

    await putDraftWriting(records, post, 0);
    await removeDraftWritingRecord(records, 'test-post');
    expect(await records.get(WRITING_DRAFT_COLLECTION, 'test-post')).toBeNull();

    const all = await listAllRecords(records, WRITING_DRAFT_COLLECTION);
    expect(all).toEqual([]);
  });
});
