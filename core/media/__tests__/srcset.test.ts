import { describe, expect, it } from 'vitest';
import { buildImageIndex, srcSetFor } from '@/core/media/srcset';
import type { MediaItem } from '@/cms/types/cms';

const item = (over: Partial<MediaItem>): MediaItem => ({
  id: 'photo.jpg',
  name: 'photo.jpg',
  url: '/api/media/photo.jpg',
  type: 'image',
  sizeBytes: 1,
  uploadedAt: '2026-10-20',
  altText: '',
  usageCount: 0,
  ...over,
});

describe('srcSetFor', () => {
  it('lists each smaller copy, then the original at its measured width', () => {
    const index = buildImageIndex([item({ variants: [1280, 640], dimensions: '4000x3000' })]);
    expect(srcSetFor('/api/media/photo.jpg', index)).toBe(
      '/api/media/photo.jpg.w640.webp 640w, /api/media/photo.jpg.w1280.webp 1280w, /api/media/photo.jpg 4000w'
    );
  });

  it('leaves the original out when its width was never measured', () => {
    const index = buildImageIndex([item({ variants: [640] })]);
    expect(srcSetFor('/api/media/photo.jpg', index)).toBe('/api/media/photo.jpg.w640.webp 640w');
  });

  it('gives nothing for images without copies, unknown URLs, or no index', () => {
    const index = buildImageIndex([item({}), item({ url: '/x', variants: [] })]);
    expect(index).toEqual({});
    expect(srcSetFor('/api/media/photo.jpg', index)).toBeUndefined();
    expect(srcSetFor('/demo/a.svg', index)).toBeUndefined();
    expect(srcSetFor('/api/media/photo.jpg', undefined)).toBeUndefined();
  });

  it('indexes natural dimensions, safe placeholders and opted-in EXIF only', () => {
    const exif = {
      make: 'Camera Co',
      model: 'Model 1',
      formattedSummary: 'Camera Co Model 1 · 50mm',
    };
    const media = item({
      dimensions: '1200x800',
      placeholder: { primary: '#aabbcc', secondary: '#667788' },
      exif,
    });

    const privateIndex = buildImageIndex([media]);
    expect(privateIndex[media.url]).toMatchObject({
      aspectRatio: 1.5,
      placeholder: { primary: '#aabbcc', secondary: '#667788' },
    });
    expect(privateIndex[media.url]?.exif).toBeUndefined();

    const publicIndex = buildImageIndex([{ ...media, showExif: true }]);
    expect(publicIndex[media.url]?.exif?.formattedSummary).toContain('50mm');
  });

  it('ignores invalid dimensions and placeholder colours', () => {
    const media = item({
      dimensions: '999999x0',
      placeholder: { primary: 'url(javascript:alert(1))', secondary: '#badbad' },
    });
    expect(buildImageIndex([media])).toEqual({});
  });
});
