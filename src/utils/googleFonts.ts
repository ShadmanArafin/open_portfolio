export interface GoogleFontOption {
  name: string;
  family: string;
  category: 'sans-serif' | 'display' | 'serif' | 'monospace';
  weights: string;
}

import { fontVariableFor } from '@/core/theme/font-names';

/**
 * Fonts offered in Appearance.
 *
 * The files are self-hosted: each entry here has a matching static loader in
 * `core/theme/fonts.ts` (regenerate with `node scripts/gen-fonts.mjs`), so the
 * browser never requests a stylesheet from Google. If you add a font, add its
 * loader too and request only weights it actually ships (e.g. Instrument
 * Serif is 400 only) — the build fails naming an unknown family.
 */
export const GOOGLE_FONTS_LIST: GoogleFontOption[] = [
  // --- Workhorse sans: safe for body text at any length -------------------
  { name: 'Inter', family: 'Inter', category: 'sans-serif', weights: 'wght@300;400;500;600;700' },
  { name: 'Geist', family: 'Geist', category: 'sans-serif', weights: 'wght@300;400;500;600;700' },
  {
    name: 'Figtree',
    family: 'Figtree',
    category: 'sans-serif',
    weights: 'wght@300;400;500;600;700',
  },
  {
    name: 'Plus Jakarta Sans',
    family: 'Plus+Jakarta+Sans',
    category: 'sans-serif',
    weights: 'wght@300;400;500;600;700',
  },
  {
    name: 'Manrope',
    family: 'Manrope',
    category: 'sans-serif',
    weights: 'wght@300;400;500;600;700',
  },
  {
    name: 'DM Sans',
    family: 'DM+Sans',
    category: 'sans-serif',
    weights: 'wght@300;400;500;600;700',
  },
  { name: 'Onest', family: 'Onest', category: 'sans-serif', weights: 'wght@300;400;500;600;700' },
  {
    name: 'Hanken Grotesk',
    family: 'Hanken+Grotesk',
    category: 'sans-serif',
    weights: 'wght@300;400;500;600;700',
  },
  {
    name: 'IBM Plex Sans',
    family: 'IBM+Plex+Sans',
    category: 'sans-serif',
    weights: 'wght@300;400;500;600;700',
  },
  {
    name: 'Raleway',
    family: 'Raleway',
    category: 'sans-serif',
    weights: 'wght@300;400;500;600;700',
  },

  // --- Grotesks with more character: good for headings --------------------
  {
    name: 'Instrument Sans',
    family: 'Instrument+Sans',
    category: 'sans-serif',
    weights: 'wght@400;500;600;700',
  },
  {
    name: 'Schibsted Grotesk',
    family: 'Schibsted+Grotesk',
    category: 'sans-serif',
    weights: 'wght@400;500;600;700',
  },
  {
    name: 'Familjen Grotesk',
    family: 'Familjen+Grotesk',
    category: 'sans-serif',
    weights: 'wght@400;500;600;700',
  },
  {
    name: 'Space Grotesk',
    family: 'Space+Grotesk',
    category: 'display',
    weights: 'wght@300;400;500;600;700',
  },
  {
    name: 'Archivo',
    family: 'Archivo',
    category: 'sans-serif',
    weights: 'wght@300;400;500;600;700',
  },
  { name: 'Chivo', family: 'Chivo', category: 'sans-serif', weights: 'wght@300;400;500;600;700' },
  {
    name: 'Epilogue',
    family: 'Epilogue',
    category: 'sans-serif',
    weights: 'wght@300;400;500;600;700',
  },
  { name: 'Sora', family: 'Sora', category: 'sans-serif', weights: 'wght@300;400;500;600;700' },
  { name: 'Outfit', family: 'Outfit', category: 'sans-serif', weights: 'wght@300;400;500;600;700' },
  { name: 'Gabarito', family: 'Gabarito', category: 'sans-serif', weights: 'wght@400;500;600;700' },

  // --- Display: headlines only, never body --------------------------------
  {
    name: 'Bricolage Grotesque',
    family: 'Bricolage+Grotesque',
    category: 'display',
    weights: 'wght@300;400;500;600;700',
  },
  {
    name: 'Unbounded',
    family: 'Unbounded',
    category: 'display',
    weights: 'wght@300;400;500;600;700',
  },
  { name: 'Anton', family: 'Anton', category: 'display', weights: 'wght@400' },

  // --- Serif: editorial contrast against a sans body ----------------------
  { name: 'Instrument Serif', family: 'Instrument+Serif', category: 'serif', weights: 'wght@400' },
  { name: 'Fraunces', family: 'Fraunces', category: 'serif', weights: 'wght@300;400;500;600;700' },
  {
    name: 'Newsreader',
    family: 'Newsreader',
    category: 'serif',
    weights: 'wght@300;400;500;600;700',
  },
  {
    name: 'Source Serif 4',
    family: 'Source+Serif+4',
    category: 'serif',
    weights: 'wght@300;400;500;600;700',
  },
  {
    name: 'Playfair Display',
    family: 'Playfair+Display',
    category: 'serif',
    weights: 'wght@400;500;600;700',
  },
  { name: 'Lora', family: 'Lora', category: 'serif', weights: 'wght@400;500;600;700' },
  {
    name: 'DM Serif Display',
    family: 'DM+Serif+Display',
    category: 'serif',
    weights: 'wght@400',
  },
  {
    name: 'Libre Baskerville',
    family: 'Libre+Baskerville',
    category: 'serif',
    weights: 'wght@400;700',
  },

  // --- Mono: for the small caps labels ------------------------------------
  {
    name: 'Geist Mono',
    family: 'Geist+Mono',
    category: 'monospace',
    weights: 'wght@300;400;500;600;700',
  },
  {
    name: 'JetBrains Mono',
    family: 'JetBrains+Mono',
    category: 'monospace',
    weights: 'wght@300;400;500;600;700',
  },
  { name: 'Space Mono', family: 'Space+Mono', category: 'monospace', weights: 'wght@400;700' },
  {
    name: 'IBM Plex Mono',
    family: 'IBM+Plex+Mono',
    category: 'monospace',
    weights: 'wght@400;500',
  },
];

/** The stack used when no mono font is chosen - the site's original look. */
export const SYSTEM_MONO_STACK =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

export const loadGoogleFonts = (displayFont: string, bodyFont: string, monoFont?: string) => {
  // Self-hosted since the next/font migration: the files ship with the build
  // and every catalogue family is already on the page as a CSS variable (see
  // core/theme/fonts.ts), so this only swaps which variable each role points
  // at. No stylesheet is injected and no request leaves for Google — the old
  // dynamic <link> is gone with the Munich ruling it risked. Unknown names
  // fall back exactly the way the server layout does.
  const displayName =
    GOOGLE_FONTS_LIST.find((f) => f.name === displayFont)?.name ?? GOOGLE_FONTS_LIST[0].name;
  const bodyName =
    GOOGLE_FONTS_LIST.find((f) => f.name === bodyFont)?.name ?? GOOGLE_FONTS_LIST[0].name;
  const monoName = monoFont
    ? (GOOGLE_FONTS_LIST.find((f) => f.name === monoFont)?.name ?? null)
    : null;

  // Generic fallback matches the font's own category, so a serif heading falls
  // back to a serif rather than a sans while the webfont loads.
  const generic = (name: string) => {
    const config = GOOGLE_FONTS_LIST.find((f) => f.name === name);
    return config?.category === 'serif'
      ? 'serif'
      : config?.category === 'monospace'
        ? 'monospace'
        : 'sans-serif';
  };

  const root = document.documentElement;
  root.style.setProperty(
    '--font-display',
    `${fontVariableFor(displayName)}, '${displayName}', ${generic(displayName)}`
  );
  root.style.setProperty(
    '--font-sans',
    `${fontVariableFor(bodyName)}, '${bodyName}', ${generic(bodyName)}`
  );
  root.style.setProperty(
    '--font-body',
    `${fontVariableFor(bodyName)}, '${bodyName}', ${generic(bodyName)}`
  );
  root.style.setProperty(
    '--font-mono',
    monoName ? `${fontVariableFor(monoName)}, '${monoName}', monospace` : SYSTEM_MONO_STACK
  );
};
