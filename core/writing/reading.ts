import type { ParsedBlock } from '@/core/blocks/schema';

/**
 * What a reader wants to know before and while reading a piece: how long it
 * is, what is in it, and where to go next. All derived from the blocks, so
 * nothing new has to be typed for any of it.
 */

const WORDS_PER_MINUTE = 220;

/** Every string inside a block's props, however deeply nested. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) strings(item, out);
  else if (value && typeof value === 'object')
    for (const item of Object.values(value)) strings(item, out);
  return out;
}

const isUrlish = (text: string) => /^(https?:|\/|#|mailto:|data:)/i.test(text.trim());

export function readingMinutes(blocks: ParsedBlock[]): number {
  let words = 0;
  for (const entry of blocks) {
    if (entry.kind !== 'block' || entry.block.hidden) continue;
    for (const text of strings(entry.block.props)) {
      if (!isUrlish(text)) words += text.split(/\s+/).filter(Boolean).length;
    }
  }
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      // Composed, and marks kept: decomposing turned "é" into "e" plus a mark,
      // and dropping marks would mangle scripts whose vowels are marks.
      .normalize('NFC')
      .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'section'
  );
}

export interface TocEntry {
  anchor: string;
  label: string;
}

/**
 * Gives every visible block with a heading an anchor (keeping any the author
 * set, and never repeating one), and returns the contents list built from them.
 */
export function withContents(blocks: ParsedBlock[]): { blocks: ParsedBlock[]; toc: TocEntry[] } {
  const used = new Set<string>();
  const toc: TocEntry[] = [];
  const out = blocks.map((entry) => {
    if (entry.kind !== 'block' || entry.block.hidden) return entry;
    const heading = (entry.block.props as { heading?: unknown }).heading;
    if (typeof heading !== 'string' || !heading.trim()) return entry;
    let anchor = entry.block.anchor || slugifyHeading(heading);
    for (let n = 2; used.has(anchor); n++) anchor = `${slugifyHeading(heading)}-${n}`;
    used.add(anchor);
    toc.push({ anchor, label: heading.trim() });
    return { ...entry, block: { ...entry.block, anchor } };
  });
  return { blocks: out, toc };
}

/** The pieces either side of this one, in the order the index shows them. */
export function neighbours<T extends { slug: string }>(
  entries: T[],
  slug: string
): { previous: T | null; next: T | null } {
  const index = entries.findIndex((entry) => entry.slug === slug);
  if (index < 0) return { previous: null, next: null };
  return { previous: entries[index - 1] ?? null, next: entries[index + 1] ?? null };
}

/**
 * Up to `limit` other pieces that share a tag with this one, most shared tags
 * first, then in the collection's own order. The previous and next pieces are
 * left out, since they are already linked just above. No shared tag, no strip:
 * "related" filled with whatever is newest would be a list, not a relation.
 */
export function related<T extends { slug: string; tags?: string[] }>(
  entries: T[],
  slug: string,
  limit = 3
): T[] {
  const self = entries.find((entry) => entry.slug === slug);
  const mine = new Set((self?.tags ?? []).map((tag) => tag.toLowerCase()));
  if (mine.size === 0) return [];
  const { previous, next } = neighbours(entries, slug);
  const skip = new Set([slug, previous?.slug, next?.slug]);
  return entries
    .map((entry, order) => ({
      entry,
      order,
      shared: (entry.tags ?? []).filter((tag) => mine.has(tag.toLowerCase())).length,
    }))
    .filter(({ entry, shared }) => shared > 0 && !skip.has(entry.slug))
    .sort((a, b) => b.shared - a.shared || a.order - b.order)
    .slice(0, limit)
    .map(({ entry }) => entry);
}

/** Where a tag's archive lives. Tags match without regard to case. */
export function tagHref(tag: string): string {
  return `/writing/tag/${encodeURIComponent(tag.toLowerCase())}`;
}
