import 'server-only';

/**
 * Smaller copies of an uploaded photo, for phones.
 *
 * A portfolio is mostly pictures, and the pictures people upload come straight
 * off a camera or out of an export dialog: four thousand pixels wide and
 * several megabytes, sent whole to a phone that shows them four hundred pixels
 * wide. `next/image` would fix that by resizing on request, but it needs every
 * storage host declared ahead of time and opens a CPU-cost endpoint (see
 * CVE-2026-64644); resizing once, at upload, needs neither.
 *
 * WebP at three widths, never larger than the original. Formats that do not
 * benefit (GIF animation, SVG, PDF) are left alone. `sharp` is loaded lazily
 * and failure is quiet: a platform where it cannot load still uploads the
 * original exactly as before, it just has no smaller copies.
 */

export const VARIANT_WIDTHS = [640, 1280, 1920] as const;

const RESIZABLE = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface GeneratedVariant {
  width: number;
  data: Uint8Array;
}

/** The storage key of one copy, beside the original: `photo-x1.jpg.w640.webp`. */
export function variantKey(key: string, width: number): string {
  return `${key}.w${width}.webp`;
}

export async function generateVariants(
  bytes: Uint8Array,
  mimeType: string
): Promise<GeneratedVariant[]> {
  if (!RESIZABLE.has(mimeType)) return [];

  let sharp: (typeof import('sharp'))['default'];
  try {
    sharp = (await import('sharp')).default;
  } catch {
    return [];
  }

  try {
    const { width: original } = await sharp(bytes).metadata();
    if (!original) return [];

    const variants: GeneratedVariant[] = [];
    for (const width of VARIANT_WIDTHS) {
      if (width >= original) break;
      const data = await sharp(bytes)
        // EXIF orientation applied before resizing, so a portrait phone photo
        // does not come out on its side.
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();
      variants.push({ width, data: new Uint8Array(data) });
    }
    return variants;
  } catch (err) {
    console.error('[media] Could not make smaller copies; keeping the original only.', err);
    return [];
  }
}

/**
 * Makes and stores the copies, returning the widths that landed. A copy that
 * fails to store is skipped rather than failing the upload: the original is
 * what the owner asked to keep.
 */
export async function storeVariants(
  media: { put(key: string, data: Uint8Array, mimeType: string): Promise<unknown> },
  key: string,
  bytes: Uint8Array,
  mimeType: string
): Promise<number[]> {
  const stored: number[] = [];
  for (const variant of await generateVariants(bytes, mimeType)) {
    try {
      await media.put(variantKey(key, variant.width), variant.data, 'image/webp');
      stored.push(variant.width);
    } catch (err) {
      console.error('[media] A smaller copy could not be stored.', err);
    }
  }
  return stored;
}
