import type { MediaItem } from '@/cms/types/cms';

/**
 * `srcset` for an uploaded image, from the widths recorded at upload.
 *
 * Content stores an image as the URL it had when it was picked, so the copies
 * are looked up by that URL: an index from URL to the smaller widths, plus the
 * original's own width when the browser measured it at upload. Client-safe —
 * the theme's client components and the server-rendered blocks both use it.
 */

export interface ImageVariants {
  widths: number[];
  /** The original's width, when known; lets the browser pick it too. */
  original?: number;
}

export type ImageIndex = Record<string, ImageVariants>;

export function buildImageIndex(media: readonly MediaItem[] | undefined): ImageIndex {
  const index: ImageIndex = {};
  for (const item of media ?? []) {
    if (!item.variants?.length) continue;
    const original = Number(item.dimensions?.split('x')[0]);
    index[item.url] = {
      widths: [...item.variants].sort((a, b) => a - b),
      ...(Number.isFinite(original) && original > 0 ? { original } : {}),
    };
  }
  return index;
}

export function srcSetFor(url: string | undefined | null, index: ImageIndex | undefined) {
  if (!url || !index) return undefined;
  const entry = index[url];
  if (!entry || entry.widths.length === 0) return undefined;
  const candidates = entry.widths.map((width) => `${url}.w${width}.webp ${width}w`);
  if (entry.original) candidates.push(`${url} ${entry.original}w`);
  return candidates.join(', ');
}
