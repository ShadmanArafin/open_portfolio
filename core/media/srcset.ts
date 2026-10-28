import type { MediaItem } from '@/cms/types/cms';
import type { ExifData } from './exif';

/**
 * `srcset` and public image metadata for uploaded media.
 *
 * The index is client-safe. EXIF is included only after an owner opts into
 * showing the camera badge; raw URLs and EXIF fields are not sent to the
 * browser-wide CMS provider.
 */
export interface ImageVariants {
  widths: number[];
  /** The original's width, when known, lets the browser pick it too. */
  original?: number;
  /** Natural dimensions are used by the masonry layout. */
  aspectRatio?: number;
  /** Average colours for an inline loading gradient. */
  placeholder?: { primary: string; secondary: string };
  /** Only included when the owner explicitly enabled the public badge. */
  exif?: ExifData;
}

export type ImageIndex = Record<string, ImageVariants>;

export function buildImageIndex(media: readonly MediaItem[] | undefined): ImageIndex {
  const index: ImageIndex = {};
  for (const item of media ?? []) {
    if (!item?.url || typeof item.url !== 'string') continue;

    const widths = (item.variants ?? []).filter(
      (width) => Number.isSafeInteger(width) && width > 0
    );
    const dimensions = /^([1-9]\d{1,4})x([1-9]\d{1,4})$/.exec(item.dimensions ?? '');
    const original = dimensions ? Number(dimensions[1]) : NaN;
    const aspectRatio = dimensions ? Number(dimensions[1]) / Number(dimensions[2]) : undefined;
    const placeholder = item.placeholder;
    const safePlaceholder =
      placeholder &&
      /^#[0-9a-f]{6}$/i.test(placeholder.primary) &&
      /^#[0-9a-f]{6}$/i.test(placeholder.secondary)
        ? { primary: placeholder.primary, secondary: placeholder.secondary }
        : undefined;
    const exif = item.showExif === true ? safeExif(item.exif) : undefined;

    if (widths.length === 0 && !Number.isFinite(aspectRatio) && !safePlaceholder && !exif) {
      continue;
    }

    index[item.url] = {
      widths: widths.sort((a, b) => a - b),
      ...(Number.isFinite(original) && original > 0 ? { original } : {}),
      ...(typeof aspectRatio === 'number' && Number.isFinite(aspectRatio) && aspectRatio > 0
        ? { aspectRatio }
        : {}),
      ...(safePlaceholder ? { placeholder: safePlaceholder } : {}),
      ...(exif ? { exif } : {}),
    };
  }
  return index;
}

function safeExif(value: MediaItem['exif']): ExifData | undefined {
  if (!value || typeof value !== 'object' || typeof value.formattedSummary !== 'string') {
    return undefined;
  }
  const clean = (field: unknown, limit: number) =>
    typeof field === 'string'
      ? Array.from(field)
          .filter((ch) => {
            const code = ch.charCodeAt(0);
            return code >= 32 && code !== 127;
          })
          .join('')
          .slice(0, limit)
      : undefined;
  const exif: ExifData = {
    make: clean(value.make, 100),
    model: clean(value.model, 100),
    lensModel: clean(value.lensModel, 120),
    focalLength: clean(value.focalLength, 24),
    aperture: clean(value.aperture, 24),
    shutterSpeed: clean(value.shutterSpeed, 24),
    iso: Number.isSafeInteger(value.iso) && value.iso! > 0 ? value.iso : undefined,
    formattedSummary: clean(value.formattedSummary, 300),
  };
  return exif.formattedSummary ? exif : undefined;
}

export function srcSetFor(url: string | undefined | null, index: ImageIndex | undefined) {
  if (!url || !index) return undefined;
  const entry = index[url];
  if (!entry || entry.widths.length === 0) return undefined;
  const candidates = entry.widths.map((width) => `${url}.w${width}.webp ${width}w`);
  if (entry.original) candidates.push(`${url} ${entry.original}w`);
  return candidates.join(', ');
}
