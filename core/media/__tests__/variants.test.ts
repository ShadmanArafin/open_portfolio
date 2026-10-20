import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { generateVariants, storeVariants, variantKey } from '@/core/media/variants';

/** A real JPEG, so the test exercises the real decoder rather than a mock. */
async function photo(width: number, height: number): Promise<Uint8Array> {
  const data = await sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 120, b: 40 } },
  })
    .jpeg()
    .toBuffer();
  return new Uint8Array(data);
}

describe('upload variants', () => {
  it('makes WebP copies at each width below the original, never larger', async () => {
    const variants = await generateVariants(await photo(1500, 1000), 'image/jpeg');
    expect(variants.map((v) => v.width)).toEqual([640, 1280]);
    for (const variant of variants) {
      const meta = await sharp(variant.data).metadata();
      expect(meta.format).toBe('webp');
      expect(meta.width).toBe(variant.width);
    }
  });

  it('leaves small images, GIFs, SVGs and PDFs alone', async () => {
    expect(await generateVariants(await photo(500, 400), 'image/jpeg')).toEqual([]);
    expect(await generateVariants(new Uint8Array([1, 2, 3]), 'image/gif')).toEqual([]);
    expect(await generateVariants(new Uint8Array([1, 2, 3]), 'image/svg+xml')).toEqual([]);
    expect(await generateVariants(new Uint8Array([1, 2, 3]), 'application/pdf')).toEqual([]);
  });

  it('does not fail the upload on a file the decoder rejects', async () => {
    expect(await generateVariants(new Uint8Array([0xff, 0xd8, 0, 0]), 'image/jpeg')).toEqual([]);
  });

  it('stores each copy beside the original and reports what landed', async () => {
    const put: string[] = [];
    const widths = await storeVariants(
      { put: async (key: string) => void put.push(key) },
      'photo-1.jpg',
      await photo(2000, 1000),
      'image/jpeg'
    );
    expect(widths).toEqual([640, 1280, 1920]);
    expect(put).toEqual([640, 1280, 1920].map((w) => variantKey('photo-1.jpg', w)));
  });
});
