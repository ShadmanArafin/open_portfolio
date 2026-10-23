'use server';

import { revalidatePath } from 'next/cache';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { RevisionConflictError } from '@/core/storage/contract';
import { conflictMessage } from '@/core/content/changes';
import { screenToken, staleScreenError } from '@/core/content/screen-token';
import { aboutChanges } from '@/core/content/sections';
import type { CMSState, SectionConfig } from '@/cms/types/cms';
import { readDraftForWrite } from '@/core/content/draft';

export interface HomepageResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
  /** The screen's new token, for the next save. See `core/content/screen-token`. */
  token?: string;
}

/**
 * Saving the homepage builder.
 *
 * One write for the whole band list, merge-by-id: a section the content does
 * not have is ignored rather than added, and a section the payload left out is
 * kept rather than deleted, so a stale screen can only ever change the fields
 * it is looking at. Visibility, order and the text fields are all the screen
 * edits; anything else a section carries survives untouched.
 *
 * The about band is mirrored into `settings` only for the fields that actually
 * changed in this save (see `core/content/sections.ts`), so editing the
 * heading on the Settings screen is not undone by saving this one.
 */

const TEXT_FIELDS = [
  'label',
  'anchorId',
  'heading',
  'subheading',
  'description',
  'primaryCtaLabel',
  'primaryCtaUrl',
  'secondaryCtaLabel',
  'secondaryCtaUrl',
] as const;

function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max;
}

interface SectionPatch {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  text: Partial<Record<(typeof TEXT_FIELDS)[number], string>>;
}

function cleanSection(raw: unknown): SectionPatch | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Record<string, unknown>;
  if (!isText(entry.id, 100) || entry.id.length === 0) return null;
  if (!isText(entry.name, 300)) return null;
  if (typeof entry.visible !== 'boolean') return null;
  if (
    typeof entry.order !== 'number' ||
    !Number.isFinite(entry.order) ||
    entry.order < 0 ||
    entry.order > 1000
  ) {
    return null;
  }

  const text: SectionPatch['text'] = {};
  for (const field of TEXT_FIELDS) {
    const value = entry[field];
    if (value === undefined) continue;
    const max = field === 'description' ? 8000 : 400;
    if (!isText(value, max)) return null;
    text[field] = value;
  }

  return { id: entry.id, name: entry.name, visible: entry.visible, order: entry.order, text };
}

export async function updateHomepageAction(
  sections: unknown,
  token?: string
): Promise<HomepageResult> {
  await requireOwner();
  if (!Array.isArray(sections) || sections.length > 60) {
    return { ok: false, error: 'Those sections are not usable.' };
  }

  const patches: SectionPatch[] = [];
  const seen = new Set<string>();
  for (const raw of sections) {
    const patch = cleanSection(raw);
    if (!patch || seen.has(patch.id)) {
      return { ok: false, error: 'Those sections are not usable.' };
    }
    seen.add(patch.id);
    patches.push(patch);
  }

  const adapter = await getStorageAdapter();
  const meta = await readDraftForWrite(adapter);
  const stale = staleScreenError(meta.state as CMSState, 'sections', token);
  if (stale) return { ok: false, conflict: true, error: stale };
  const next = structuredClone(meta.state as CMSState);

  // Compare and mutate against the same pre-save copy.
  const storedAbout = next.sections.find((section) => section.id === 'about');
  const incomingAbout = patches.find((patch) => patch.id === 'about');
  const mirror = aboutChanges(
    storedAbout,
    incomingAbout
      ? ({
          ...(storedAbout ?? {
            id: 'about',
            name: '',
            label: '',
            visible: true,
            order: 0,
            anchorId: '',
          }),
          ...incomingAbout.text,
        } as SectionConfig)
      : undefined
  );

  for (const patch of patches) {
    const target = next.sections.find((section) => section.id === patch.id);
    if (!target) continue;
    target.name = patch.name;
    target.visible = patch.visible;
    target.order = patch.order;
    for (const field of TEXT_FIELDS) {
      const value = patch.text[field];
      if (value !== undefined) (target as unknown as Record<string, unknown>)[field] = value;
    }
  }

  if (mirror.heading !== undefined) next.settings.aboutHeading = mirror.heading;
  if (mirror.paragraphs !== undefined) next.settings.aboutStoryParagraphs = mirror.paragraphs;

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

  revalidatePath('/admin/homepage');
  return { ok: true, token: screenToken(next, 'sections') };
}
