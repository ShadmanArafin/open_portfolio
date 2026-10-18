'use server';

import { revalidatePath } from 'next/cache';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { RevisionConflictError } from '@/core/storage/contract';
import { conflictMessage } from '@/core/content/changes';
import { normaliseSlug } from '@/core/pages/schema';
import { cleanBlock, isText } from '@/core/blocks/clean';
import { WRITING_DEFAULTS } from '@/core/writing/schema';
import type { WritingEntry, WritingSettings } from '@/core/writing/schema';
import type { CMSState } from '@/cms/types/cms';

export interface WritingResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
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

const MAX_ENTRIES = 200;
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
  entries: unknown
): Promise<WritingResult> {
  await requireOwner();
  if (!Array.isArray(entries) || entries.length > MAX_ENTRIES) {
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
    clean.push(item);
  }

  const adapter = await getStorageAdapter();
  const meta = await adapter.readSnapshotMeta('draft');
  if (!meta) return { ok: false, error: 'There is no draft to change yet.' };
  const next = structuredClone(meta.state as CMSState);
  const stored = next.writing ?? [];

  const cleanStoredSettings = cleanSettings(settings, next.writingSettings);
  if (!cleanStoredSettings) return { ok: false, error: 'Those settings are not usable.' };

  const now = new Date().toISOString();
  const stamped: WritingEntry[] = clean.map((entry) => {
    const before = stored.find((existing) => existing.id === entry.id);
    return {
      ...entry,
      updatedAt: now,
      revision: (before?.revision ?? 0) + 1,
    } as WritingEntry;
  });

  next.writing = stamped;
  next.writingSettings = cleanStoredSettings;

  try {
    await adapter.writeSnapshot('draft', next, meta.revision);
  } catch (err) {
    if (err instanceof RevisionConflictError) {
      // Raced with another save. Re-read for the diff: what matters is what is
      // stored now, not the read this write was built on.
      const fresh = await adapter.readSnapshotMeta('draft');
      return {
        ok: false,
        conflict: true,
        error: conflictMessage(err, fresh?.state ?? null, next, 'Saving'),
      };
    }
    throw err;
  }

  revalidatePath('/admin/writing');
  return { ok: true, settings: cleanStoredSettings, writing: stamped };
}
