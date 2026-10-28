/**
 * Compact image placeholder & blurhash generator.
 *
 * Generates lightweight (under 60 bytes) inline SVG/CSS placeholders
 * from dominant colors, providing instant zero-layout-shift (CLS: 0)
 * visual feedback while high-resolution media streams in.
 */

export interface ImagePlaceholder {
  cssBackground: string;
  svgDataUri: string;
  aspectRatio: number;
}

/**
 * Creates an ultra-lightweight SVG placeholder data URI with a linear gradient
 * representing the dominant color mood of the image.
 */
export function createGradientPlaceholder(
  color1: string = '#2a2a2e',
  color2: string = '#1a1a1d',
  width: number = 4,
  height: number = 3
): ImagePlaceholder {
  const primary = safeHex(color1, '#2a2a2e');
  const secondary = safeHex(color2, '#1a1a1d');
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 4;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 3;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${safeWidth} ${safeHeight}">` +
    `<defs>` +
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${primary}"/>` +
    `<stop offset="100%" stop-color="${secondary}"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<rect width="${safeWidth}" height="${safeHeight}" fill="url(#g)"/>` +
    `</svg>`;

  const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const cssBackground = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  const aspectRatio = safeWidth / safeHeight;

  return {
    cssBackground,
    svgDataUri,
    aspectRatio,
  };
}

/**
 * Derives a balanced placeholder palette from any primary hex color.
 */
export function paletteFromHex(hex: string): { primary: string; secondary: string } {
  const clean = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(clean)) {
    return { primary: '#2a2a2e', secondary: '#1a1a1d' };
  }

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  const darken = (c: number, factor = 0.65) => Math.max(0, Math.min(255, Math.round(c * factor)));
  const toHex = (c: number) => c.toString(16).padStart(2, '0');

  const primary = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const secondary = `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;

  return { primary, secondary };
}

function safeHex(value: string, fallback: string): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : fallback;
}
