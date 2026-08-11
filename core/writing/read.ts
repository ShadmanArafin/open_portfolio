import 'server-only';
import { cache } from 'react';
import type { Channel } from '@/core/storage/contract';
import { getContentForChannel } from '@/core/content/read';
import { parsePage } from '@/core/blocks/registry';
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
export async function getPublicWriting(channel: Channel): Promise<WritingEntry[]> {
  const [entries, settings] = await Promise.all([
    getWritingEntries(channel),
    getWritingSettings(channel),
  ]);

  const visible = channel === 'draft' ? entries : entries.filter((entry) => isLive(entry));
  return arrange(visible, settings.order);
}

export interface ResolvedWriting {
  entry: WritingEntry;
  blocks: ParsedBlock[];
}

export async function resolveWriting(
  slug: string,
  channel: Channel
): Promise<ResolvedWriting | null> {
  const entry = (await getPublicWriting(channel)).find((item) => item.slug === slug);
  if (!entry) return null;
  return { entry, blocks: parsePage(entry.blocks) };
}
