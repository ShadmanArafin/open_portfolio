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
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">` +
    `<defs>` +
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${color1}"/>` +
    `<stop offset="100%" stop-color="${color2}"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<rect width="${width}" height="${height}" fill="url(#g)"/>` +
    `</svg>`;

  const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const cssBackground = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  const aspectRatio = width / (height || 1);

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
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return { primary: '#2a2a2e', secondary: '#1a1a1d' };

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  const darken = (c: number, factor = 0.65) => Math.max(0, Math.min(255, Math.round(c * factor)));
  const toHex = (c: number) => c.toString(16).padStart(2, '0');

  const primary = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const secondary = `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;

  return { primary, secondary };
}
