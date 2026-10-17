'use server';

import { revalidatePath } from 'next/cache';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { RevisionConflictError } from '@/core/storage/contract';
import { normaliseSlug } from '@/core/pages/schema';
import type { PageRecord } from '@/core/pages/schema';
import type { CMSState } from '@/cms/types/cms';

export interface PagesResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
  /** The stored result, so the editor can show the new revisions without a reload. */
  pages?: PageRecord[];
}

/**
 * Saving the pages builder.
 *
 * The payload is the whole list, because that is what the screen is: a list
 * you reorder, extend and delete from, and every one of those is a local edit
 * until Save. Add, remove and reorder are therefore all just "the list came
 * back different" — one action, one revision-checked write, no half-applied
 * move anywhere.
 *
 * Revisions are the server's numbers: every page in the payload gets its stored
 * revision plus one (one for a page that did not exist), and `updatedAt` is set
 * here rather than trusted, because a client clock is not a record of when the
 * server last wrote.
 */

const MAX_PAGES = 50;
const MAX_BLOCKS = 120;
const STATUSES = new Set(['draft', 'published']);
const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max;
}

function cleanBlock(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const entry = raw as Record<string, unknown>;
  if (!isText(entry.id, 100) || entry.id.length === 0) return null;
  if (!isText(entry.type, 100) || entry.type.length === 0) return null;
  if (typeof entry.v !== 'number' || !Number.isFinite(entry.v) || entry.v < 0) return null;
  if (!entry.props || typeof entry.props !== 'object') return null;

  const clean: Record<string, unknown> = {
    id: entry.id,
    type: entry.type,
    v: entry.v,
    props: entry.props,
  };
  if (entry.frame && typeof entry.frame === 'object' && !Array.isArray(entry.frame)) {
    clean.frame = entry.frame;
  }
  if (typeof entry.hidden === 'boolean') clean.hidden = entry.hidden;
  if (isText(entry.anchor, 200) && entry.anchor.length > 0) clean.anchor = entry.anchor;
  if (isText(entry.role, 100) && entry.role.length > 0) clean.role = entry.role;
  return clean;
}

function cleanSeo(raw: unknown): PageRecord['seo'] | null {
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
  return seo as PageRecord['seo'];
}

function cleanNav(raw: unknown): PageRecord['nav'] | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Record<string, unknown>;
  if (typeof entry.show !== 'boolean') return null;
  const nav: { show: boolean; label?: string; order: number } = {
    show: entry.show,
    order: typeof entry.order === 'number' && Number.isFinite(entry.order) ? entry.order : 0,
  };
  if (entry.label !== undefined) {
    if (!isText(entry.label, 200)) return null;
    nav.label = entry.label;
  }
  return nav;
}

export async function updatePagesAction(pages: unknown): Promise<PagesResult> {
  await requireOwner();
  if (!Array.isArray(pages) || pages.length > MAX_PAGES) {
    return { ok: false, error: 'Those pages are not usable.' };
  }

  interface CleanPage {
    id: string;
    slug: string;
    title: string;
    blocks: Record<string, unknown>[];
    status: 'draft' | 'published';
    seo: PageRecord['seo'];
    nav: PageRecord['nav'];
  }

  const clean: CleanPage[] = [];
  const seen = new Set<string>();
  for (const raw of pages) {
    if (!raw || typeof raw !== 'object') return { ok: false, error: 'Those pages are not usable.' };
    const entry = raw as Record<string, unknown>;
    if (!isText(entry.id, 100) || !ID_PATTERN.test(entry.id) || seen.has(entry.id)) {
      return { ok: false, error: 'Those pages are not usable.' };
    }
    seen.add(entry.id);
    if (!isText(entry.title, 300)) return { ok: false, error: 'Those pages are not usable.' };
    if (!isText(entry.slug, 300)) return { ok: false, error: 'Those pages are not usable.' };
    if (typeof entry.status !== 'string' || !STATUSES.has(entry.status)) {
      return { ok: false, error: 'Those pages are not usable.' };
    }
    if (!Array.isArray(entry.blocks) || entry.blocks.length > MAX_BLOCKS) {
      return { ok: false, error: 'Those pages are not usable.' };
    }

    const blocks: Record<string, unknown>[] = [];
    for (const block of entry.blocks) {
      const cleaned = cleanBlock(block);
      if (!cleaned) return { ok: false, error: 'Those pages are not usable.' };
      blocks.push(cleaned);
    }

    const seo = cleanSeo(entry.seo ?? {});
    if (!seo) return { ok: false, error: 'Those pages are not usable.' };
    const nav = cleanNav(entry.nav ?? { show: false, order: 0 });
    if (!nav) return { ok: false, error: 'Those pages are not usable.' };

    clean.push({
      id: entry.id,
      // Normalised here, always: the field shows advice about an address that
      // will not survive a URL, and this makes sure one never gets stored.
      slug: normaliseSlug(entry.slug),
      title: entry.title,
      blocks,
      status: entry.status as 'draft' | 'published',
      seo,
      nav,
    });
  }

  const adapter = await getStorageAdapter();
  const meta = await adapter.readSnapshotMeta('draft');
  if (!meta) return { ok: false, error: 'There is no draft to change yet.' };
  const next = structuredClone(meta.state as CMSState);
  const stored = next.pages ?? [];
  const now = new Date().toISOString();

  const stamped: PageRecord[] = clean.map((page) => {
    const before = stored.find((existing) => existing.id === page.id);
    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      blocks: page.blocks,
      status: page.status,
      seo: page.seo,
      nav: page.nav,
      updatedAt: now,
      revision: (before?.revision ?? 0) + 1,
    } as PageRecord;
  });

  next.pages = stamped;

  try {
    await adapter.writeSnapshot('draft', next, meta.revision);
  } catch (err) {
    if (err instanceof RevisionConflictError) {
      return {
        ok: false,
        conflict: true,
        error: 'This changed somewhere else. Reload and try again.',
      };
    }
    throw err;
  }

  revalidatePath('/admin/pages');
  return { ok: true, pages: stamped };
}
