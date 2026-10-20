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
});
