'use server';

import { revalidatePath } from 'next/cache';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { RevisionConflictError } from '@/core/storage/contract';
import { staleTokenError } from '@/core/content/screen-token';
import { normaliseSlug } from '@/core/pages/schema';
import { cleanBlock, isText } from '@/core/blocks/clean';
import {
  MAX_WRITING_ENTRIES,
  WRITING_DEFAULTS,
  writingSettingsSchema,
} from '@/core/writing/schema';
import type { WritingEntry, WritingSettings } from '@/core/writing/schema';
import type { CMSState } from '@/cms/types/cms';
import { readDraftForWrite } from '@/core/content/draft';
import {
  draftMetadata,
  loadDraftWriting,
  putDraftWriting,
  readDraftWriting,
  removeDraftWritingRecord,
  writingContentFingerprint,
  writingRecordId,
  writingScreenToken,
} from '@/core/writing/records';

export interface WritingResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
  /** The screen's new token, for the next save. See `core/content/screen-token`. */
  token?: string;
  /** The stored result, so the editor can show the new revisions without a reload. */
  settings?: WritingSettings;
  writing?: WritingEntry[];
}

/**
 * Saving the writing screen.
 *
 * The settings at the top and the pieces in the list save together, because
 * that is what the screen is — a write that half landed (settings stored, a
 * reorder not) is a state nobody chose. The list is written whole, like pages.
 *
 * `sortOrder` is trusted rather than reassigned from the array order: the
 * order these pieces read in is the arrangement `arrange()` computes from
 * position and pin, so the array's order is not the reading order. The
 * settings' `slug` is preserved rather than accepted — the public route is
 * fixed at /writing and a client-supplied address would be a field that never
 * takes effect.
 */

const MAX_BLOCKS = 120;
const MAX_TAGS = 20;
const STATUSES = new Set(['draft', 'published', 'scheduled']);
const ORDERS = new Set(['curated', 'newest']);
const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

function cleanSettings(raw: unknown, stored: WritingSettings | undefined): WritingSettings | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const entry = raw as Record<string, unknown>;
  if (typeof entry.enabled !== 'boolean') return null;
  if (!isText(entry.label, 300)) return null;
  if (typeof entry.order !== 'string' || !ORDERS.has(entry.order)) return null;
  if (typeof entry.showDates !== 'boolean') return null;

  return {
    label: entry.label,
    slug: stored?.slug ?? WRITING_DEFAULTS.slug,
    order: entry.order as WritingSettings['order'],
    showDates: entry.showDates,
    enabled: entry.enabled,
  };
}

function cleanSeo(raw: unknown): WritingEntry['seo'] | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Record<string, unknown>;
  const seo: Record<string, unknown> = {};
  if (entry.title !== undefined) {
    if (!isText(entry.title, 300)) return null;
    seo.title = entry.title;
  }
  if (entry.description !== undefined) {
    if (!isText(entry.description, 2000)) return null;
    seo.description = entry.description;
  }
  if (entry.image !== undefined) {
    if (!isText(entry.image, 500)) return null;
    seo.image = entry.image;
  }
  if (entry.noindex !== undefined) {
    if (typeof entry.noindex !== 'boolean') return null;
    seo.noindex = entry.noindex;
  }
  return seo as WritingEntry['seo'];
}

export async function updateWritingAction(
  settings: unknown,
  entries: unknown,
  token?: string
): Promise<WritingResult> {
  await requireOwner();
  if (!Array.isArray(entries) || entries.length > MAX_WRITING_ENTRIES) {
    return { ok: false, error: 'Those pieces are not usable.' };
  }

  interface CleanEntry {
    id: string;
    slug: string;
    title: string;
    summary: string;
    blocks: Record<string, unknown>[];
    status: WritingEntry['status'];
    publishedAt?: string;
    scheduledFor?: string;
    tags: string[];
    featured: boolean;
    sortOrder: number;
    seo: WritingEntry['seo'];
    /** The record revision the editor saw. Absent in an older tab. */
    revision?: number;
  }

  const clean: CleanEntry[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  for (const raw of entries) {
    if (!raw || typeof raw !== 'object')
      return { ok: false, error: 'Those pieces are not usable.' };
    const entry = raw as Record<string, unknown>;
    if (!isText(entry.id, 100) || !ID_PATTERN.test(entry.id) || seenIds.has(entry.id)) {
      return { ok: false, error: 'Those pieces are not usable.' };
    }
    seenIds.add(entry.id);

    if (!isText(entry.title, 300)) return { ok: false, error: 'Those pieces are not usable.' };
    if (!isText(entry.summary, 2000)) return { ok: false, error: 'Those pieces are not usable.' };
    if (!isText(entry.slug, 300)) return { ok: false, error: 'Those pieces are not usable.' };
    const slug = normaliseSlug(entry.slug);
    if (!slug) return { ok: false, error: 'A piece needs a web address.' };
    if (slug.includes('/') || slug.length > 120) {
      return {
        ok: false,
        error: 'A piece lives at a single, short web address. Keep it one word or phrase.',
      };
    }
    if (seenSlugs.has(slug)) {
      return { ok: false, error: 'Two pieces share the same web address. Give each one its own.' };
    }
    seenSlugs.add(slug);

    if (typeof entry.status !== 'string' || !STATUSES.has(entry.status)) {
      return { ok: false, error: 'Those pieces are not usable.' };
    }
    if (!Array.isArray(entry.blocks) || entry.blocks.length > MAX_BLOCKS) {
      return { ok: false, error: 'Those pieces are not usable.' };
    }

    const blocks: Record<string, unknown>[] = [];
    for (const block of entry.blocks) {
      const cleaned = cleanBlock(block);
      if (!cleaned) return { ok: false, error: 'Those pieces are not usable.' };
      blocks.push(cleaned);
    }

    if (entry.publishedAt !== undefined && !isText(entry.publishedAt, 100)) {
      return { ok: false, error: 'Those pieces are not usable.' };
    }
    if (entry.scheduledFor !== undefined && !isText(entry.scheduledFor, 100)) {
      return { ok: false, error: 'Those pieces are not usable.' };
    }

    if (!Array.isArray(entry.tags) || entry.tags.length > MAX_TAGS) {
      return { ok: false, error: 'Those pieces are not usable.' };
    }
    const tags: string[] = [];
    for (const tag of entry.tags) {
      if (!isText(tag, 30)) return { ok: false, error: 'Those pieces are not usable.' };
      tags.push(tag);
    }

    if (typeof entry.featured !== 'boolean') {
      return { ok: false, error: 'Those pieces are not usable.' };
    }
    if (typeof entry.sortOrder !== 'number' || !Number.isFinite(entry.sortOrder)) {
      return { ok: false, error: 'Those pieces are not usable.' };
    }

    if (
      entry.revision !== undefined &&
      (!Number.isInteger(entry.revision) || (entry.revision as number) < 0)
    ) {
      return { ok: false, error: 'Those pieces are not usable.' };
    }

    const seo = cleanSeo(entry.seo ?? {});
    if (!seo) return { ok: false, error: 'Those pieces are not usable.' };

    const item: CleanEntry = {
      id: entry.id,
      slug,
      title: entry.title,
      summary: entry.summary,
      blocks,
      status: entry.status as WritingEntry['status'],
      tags,
      featured: entry.featured,
      sortOrder: entry.sortOrder,
      seo,
    };
    if (entry.publishedAt !== undefined) item.publishedAt = entry.publishedAt;
    if (entry.scheduledFor !== undefined) item.scheduledFor = entry.scheduledFor;
    if (entry.revision !== undefined) item.revision = entry.revision as number;
    clean.push(item);
  }

  const adapter = await getStorageAdapter();
  const meta = await readDraftForWrite(adapter);
  const current = await readDraftWriting(adapter.records, meta.state.writing ?? []);

  const parsedSettings = writingSettingsSchema.safeParse(meta.state.writingSettings);
  const currentSettings: WritingSettings = parsedSettings.success
    ? parsedSettings.data
    : WRITING_DEFAULTS;

  const cleanStoredSettings = cleanSettings(settings, currentSettings);
  if (!cleanStoredSettings) return { ok: false, error: 'Those settings are not usable.' };

  // The token fingerprints the records and the settings, not the snapshot
  // revision: a save changes one record per edited piece, and a snapshot moved
  // by the Publish screen is not a reason to refuse a writing edit.
  const stale = staleTokenError(
    'your writing',
    writingScreenToken(current.entries, currentSettings),
    token
  );
  if (stale) return { ok: false, conflict: true, error: stale };

  const before = new Map(current.entries.map((entry) => [entry.id, entry]));
  const saved: WritingEntry[] = [];

  for (const entry of clean) {
    const existing = before.get(entry.id);
    // Revision and time are the record's, not the screen's. They only exist to
    // make the next conditional write and the token comparable; the fingerprint
    // below ignores both.
    const candidate = {
      ...entry,
      updatedAt: existing?.updatedAt ?? new Date().toISOString(),
      revision: existing?.revision ?? 0,
    } as WritingEntry;

    // Saving the settings alone must not rewrite every piece: that would move
    // every `updatedAt`, reorder newest-first, and churn one record per post
    // for a change that touched none of them.
    if (existing && writingContentFingerprint(existing) === writingContentFingerprint(candidate)) {
      saved.push(existing);
      continue;
    }

    // The revision the editor saw, not the one just read. Without this the
    // conditional write below could only catch a millisecond race; with it, a
    // piece changed in another tab is refused even when the screen's token was
    // missing (an older tab).
    const expectedRevision = existing
      ? typeof entry.revision === 'number'
        ? entry.revision
        : existing.revision
      : 0;

    try {
      saved.push(await putDraftWriting(adapter.records, candidate, expectedRevision));
    } catch (err) {
      if (err instanceof RevisionConflictError) {
        // Records are written one at a time and the storage surface has no
        // transaction across them, so earlier pieces in this save may already
        // have landed. They landed with exactly what this screen submitted, so
        // reloading shows the work rather than losing it - what must not happen
        // is reporting success for the one that did not.
        return {
          ok: false,
          conflict: true,
          error:
            `Someone changed "${entry.title}" somewhere else — another tab or another device — ` +
            `while this screen was open. That piece was not saved. Reload to see the current ` +
            `version before changing it again.`,
        };
      }
      throw err;
    }
  }

  // A piece taken off the list is removed from its record too, or the next read
  // brings it straight back from the collection.
  const wanted = new Set(clean.map((entry) => writingRecordId(entry.id)));
  for (const recordId of current.recordIds) {
    if (wanted.has(recordId)) continue;
    await removeDraftWritingRecord(adapter.records, recordId);
  }

  // The snapshot keeps the metadata listings read (and the settings), never a
  // body. A snapshot revision conflict here is usually another screen saving a
  // different part of the draft, and the records above are the authority on
  // this list - so re-read and retry rather than refusing an edit that landed.
  let stored = saved;
  let conflicted = false;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const latest = await readDraftForWrite(adapter);
    const entries = await loadDraftWriting(adapter.records);
    const next = structuredClone(latest.state) as CMSState;
    next.writing = entries.map((entry) => draftMetadata(entry));
    next.writingSettings = cleanStoredSettings;

    try {
      await adapter.writeSnapshot('draft', next, latest.revision);
      stored = entries;
      conflicted = false;
      break;
    } catch (err) {
      if (!(err instanceof RevisionConflictError)) throw err;
      conflicted = true;
    }
  }

  if (conflicted) {
    return {
      ok: false,
      conflict: true,
      error:
        'Someone else was saving the draft at the same moment and the list could not be brought ' +
        'up to date. Reload to see what is stored, then make your change again.',
    };
  }

  revalidatePath('/admin/writing');
  return {
    ok: true,
    settings: cleanStoredSettings,
    writing: stored,
    token: writingScreenToken(stored, cleanStoredSettings),
  };
}
