import { siteNow } from '@/core/content/now';
import 'server-only';
import { cache } from 'react';
import type { Channel } from '@/core/storage/contract';
import { getContentForChannel } from '@/core/content/read';
import { getStorageAdapter } from '@/core/storage/registry';
import { parsePage } from '@/core/blocks/lookup';
import type { ParsedBlock } from '@/core/blocks/schema';
import {
  WRITING_DEFAULTS,
  arrange,
  isLive,
  writingSchema,
  writingSettingsSchema,
  type WritingEntry,
  type WritingSettings,
} from './schema';
import { loadDraftWriting, resolveWritingBlocks, writingScreenToken } from './records';

/** Reading the writing collection, with the same defensiveness as pages. */

export const getWritingSettings = cache(async (channel: Channel): Promise<WritingSettings> => {
  const content = await getContentForChannel(channel);
  const parsed = writingSettingsSchema.safeParse(content.writingSettings);
  return parsed.success ? parsed.data : WRITING_DEFAULTS;
});

export const getWritingEntries = cache(async (channel: Channel): Promise<WritingEntry[]> => {
  const content = await getContentForChannel(channel);
  const out: WritingEntry[] = [];
  for (const raw of content.writing ?? []) {
    const parsed = writingSchema.safeParse(raw);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
});

/**
 * What a visitor should see, in the order the owner chose.
 *
 * In the draft channel everything is visible, including scheduled pieces that
 * are not due — previewing next week's post is the reason to schedule one.
 */
export const getPublicWriting = cache(async (channel: Channel): Promise<WritingEntry[]> => {
  const [entries, settings] = await Promise.all([
    getWritingEntries(channel),
    getWritingSettings(channel),
  ]);

  const now = await siteNow();
  const visible = channel === 'draft' ? entries : entries.filter((entry) => isLive(entry, now));
  return arrange(visible, settings.order);
});

export interface ResolvedWriting {
  entry: WritingEntry;
  blocks: ParsedBlock[];
}

/**
 * The body for one entry, fetched from its record.
 *
 * Calling this separately from `resolveWriting` lets the feed ask for bodies
 * without parsing every listing twice. `null` is a body the snapshot points at
 * but the store no longer has; the caller must not invent an empty article in
 * its place.
 */
export async function resolveWritingBody(
  entry: WritingEntry,
  channel: Channel
): Promise<unknown[] | null> {
  const adapter = await getStorageAdapter();
  return resolveWritingBlocks(adapter.records, entry, channel);
}

export const resolveWriting = cache(
  async (slug: string, channel: Channel): Promise<ResolvedWriting | null> => {
    const entry = (await getPublicWriting(channel)).find((item) => item.slug === slug);
    if (!entry) return null;

    const raw = await resolveWritingBody(entry, channel);
    if (raw === null) {
      console.error(
        `[writing] The published body for "${entry.slug}" is missing, so the piece is not being served.`
      );
      return null;
    }
    return { entry: { ...entry, blocks: raw }, blocks: parsePage(raw) };
  }
);

/**
 * The writing collection with every body filled in.
 *
 * Search and the feed both need the words, not just the listing metadata, and
 * both read a whole channel at once. Kept here so neither has to know that a
 * published body is a record named by a hash. A body that cannot be read leaves
 * the entry with no blocks: its title and summary are still searchable, and one
 * damaged piece does not take the whole index down.
 */
export async function getWritingWithBodies(channel: Channel): Promise<WritingEntry[]> {
  const [entries, adapter] = await Promise.all([getPublicWriting(channel), getStorageAdapter()]);
  return Promise.all(
    entries.map(async (entry) => {
      const blocks = await resolveWritingBlocks(adapter.records, entry, channel);
      return blocks === null ? entry : { ...entry, blocks };
    })
  );
}

export interface WritingAdminState {
  settings: WritingSettings;
  entries: WritingEntry[];
  token: string;
}

/**
 * What the Writing screen edits: records, not the snapshot.
 *
 * The snapshot is still read for the media library and for settings, and as the
 * fallback before the first record save - but post bodies come from the draft
 * records, which is what makes an edit touch one post instead of the whole
 * document.
 */
export async function getWritingAdminState(): Promise<WritingAdminState> {
  const [content, adapter] = await Promise.all([
    getContentForChannel('draft'),
    getStorageAdapter(),
  ]);
  const parsedSettings = writingSettingsSchema.safeParse(content.writingSettings);
  const settings = parsedSettings.success ? parsedSettings.data : WRITING_DEFAULTS;
  const entries = await loadDraftWriting(adapter.records, content.writing ?? []);
  return { settings, entries, token: writingScreenToken(entries, settings) };
}
