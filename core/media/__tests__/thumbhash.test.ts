import { describe, expect, it } from 'vitest';
import { createGradientPlaceholder, paletteFromHex } from '../thumbhash';

describe('Image Placeholder & ThumbHash Generator', () => {
  it('generates compact SVG data URI and CSS gradient', () => {
    const placeholder = createGradientPlaceholder('#3b82f6', '#1e3a8a', 16, 9);
    expect(placeholder.svgDataUri).toContain('data:image/svg+xml');
    expect(placeholder.svgDataUri).toContain('linearGradient');
    expect(placeholder.cssBackground).toContain('linear-gradient');
    expect(placeholder.aspectRatio).toBeCloseTo(16 / 9);
  });

  it('derives darker secondary color from hex for gradient mood', () => {
    const { primary, secondary } = paletteFromHex('#ff5500');
    expect(primary).toBe('#ff5500');
    expect(secondary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(secondary).not.toBe(primary);
  });

  it('handles invalid hex gracefully with fallback', () => {
    const { primary, secondary } = paletteFromHex('invalid');
    expect(primary).toBe('#2a2a2e');
    expect(secondary).toBe('#1a1a1d');
  });
});
