import type { SectionConfig } from '@/cms/types/cms';

/**
 * The homepage bands, as rules rather than as markup.
 *
 * `sections` is one list with two kinds of entry. Orders below the floor are
 * homepage bands — reorderable, renumbered 1..n. Orders at or above it are the
 * intro blocks at the top of the standalone pages (Work, Case studies,
 * Contact): editable, but they belong to their own pages and must not move
 * when the homepage is rearranged. The floor is a real constant here rather
 * than a comment in the editor, because both the screen and the save path
 * depend on agreeing about it.
 */

export const PAGE_HEADER_ORDER_FLOOR = 100;

export function sortSections(sections: SectionConfig[]): SectionConfig[] {
  return [...sections].sort((a, b) => a.order - b.order);
}

/** Splits the list into homepage bands and standalone page headers, both sorted. */
export function splitSections(sections: SectionConfig[]): {
  bands: SectionConfig[];
  headers: SectionConfig[];
} {
  const sorted = sortSections(sections);
  return {
    bands: sorted.filter((section) => section.order < PAGE_HEADER_ORDER_FLOOR),
    headers: sorted.filter((section) => section.order >= PAGE_HEADER_ORDER_FLOOR),
  };
}

/** Swaps one band with its neighbour. Out-of-range moves return the list as-is. */
export function moveBand(bands: SectionConfig[], index: number, by: number): SectionConfig[] {
  const target = index + by;
  if (target < 0 || target >= bands.length) return bands;
  const next = [...bands];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Renumbers the bands 1..n, leaving every other field — and every header — alone. */
export function withBandOrders(bands: SectionConfig[]): SectionConfig[] {
  return bands.map((section, index) => ({ ...section, order: index + 1 }));
}

/**
 * Whether an anchor ID will survive being linked to.
 *
 * Anchor IDs become in-page links (`#work`, `#contact`). Two sections sharing
 * one silently send every link to the first, and characters outside
 * `[a-z0-9-]` never survive a URL intact — so both are checked and reported as
 * advice under the field, rather than refused at save time.
 */
export function anchorProblem(sections: SectionConfig[], anchorId: string): string | null {
  if (!anchorId.trim()) return 'Add an anchor ID — without one this section cannot be linked to.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(anchorId))
    return 'Use lowercase letters, numbers and hyphens only, e.g. "selected-work".';
  if (sections.filter((section) => section.anchorId === anchorId).length > 1)
    return `Another section already uses "#${anchorId}" — links to it will land on the first one.`;
  return null;
}

/**
 * What the About *section* says, compared against what the About *settings*
 * say — the two places the same words are written.
 *
 * The settings screen writes `settings.aboutHeading` / `aboutStoryParagraphs`;
 * editing the about band on this screen used to mirror both into settings on
 * every keystroke. Mirroring unconditionally on a homepage save would mean the
 * section's copy silently overwrites a heading that was just changed in
 * Settings, so the mirror fires only for fields that actually changed here.
 */
export function aboutChanges(
  stored: SectionConfig | undefined,
  incoming: SectionConfig | undefined
): { heading?: string; paragraphs?: string[] } {
  if (!incoming) return {};
  const changes: { heading?: string; paragraphs?: string[] } = {};

  if (!stored || (incoming.heading ?? '') !== (stored.heading ?? '')) {
    changes.heading = incoming.heading ?? '';
  }

  const incomingDescription = incoming.description ?? '';
  const storedDescription = stored?.description ?? '';
  if (!stored || incomingDescription !== storedDescription) {
    changes.paragraphs = incomingDescription
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  return changes;
}
