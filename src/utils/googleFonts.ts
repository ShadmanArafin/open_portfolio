export interface GoogleFontOption {
  name: string;
  family: string;
  category: 'sans-serif' | 'display' | 'serif' | 'monospace';
  weights: string;
}

/**
 * Fonts offered in Appearance.
 *
 * Every entry's family and weight list is verified against the Google Fonts
 * API. That matters because the loader requests the heading, body and label
 * families in ONE stylesheet call — a single unavailable weight makes Google
 * return 400 and none of the three would load. If you add a font, request only
 * weights it actually ships (e.g. Instrument Serif is 400 only).
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
];

/** The stack used when no mono font is chosen - the site's original look. */
export const SYSTEM_MONO_STACK =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

export const loadGoogleFonts = (displayFont: string, bodyFont: string, monoFont?: string) => {
  const displayConfig =
    GOOGLE_FONTS_LIST.find((f) => f.name === displayFont) || GOOGLE_FONTS_LIST[0];
  const bodyConfig = GOOGLE_FONTS_LIST.find((f) => f.name === bodyFont) || GOOGLE_FONTS_LIST[0];
  const monoConfig = monoFont ? GOOGLE_FONTS_LIST.find((f) => f.name === monoFont) : undefined;

  const fontFamiliesToLoad = Array.from(
    new Set(
      [
        displayConfig.family + ':' + displayConfig.weights,
        bodyConfig.family + ':' + bodyConfig.weights,
        monoConfig ? monoConfig.family + ':' + monoConfig.weights : null,
      ].filter(Boolean) as string[]
    )
  );

  const linkId = 'google-fonts-dynamic-loader';
  let linkEl = document.getElementById(linkId) as HTMLLinkElement | null;

  const href = `https://fonts.googleapis.com/css2?${fontFamiliesToLoad.map((f) => `family=${f}`).join('&')}&display=swap`;

  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.id = linkId;
    linkEl.rel = 'stylesheet';
    document.head.appendChild(linkEl);
  }

  if (linkEl.href !== href) {
    linkEl.href = href;
  }

  // Generic fallback matches the font's own category, so a serif heading falls
  // back to a serif rather than a sans while the webfont loads.
  const generic = (config: GoogleFontOption) =>
    config.category === 'serif'
      ? 'serif'
      : config.category === 'monospace'
        ? 'monospace'
        : 'sans-serif';

  const root = document.documentElement;
  root.style.setProperty('--font-display', `'${displayConfig.name}', ${generic(displayConfig)}`);
  root.style.setProperty('--font-sans', `'${bodyConfig.name}', ${generic(bodyConfig)}`);
  root.style.setProperty('--font-body', `'${bodyConfig.name}', ${generic(bodyConfig)}`);
  root.style.setProperty(
    '--font-mono',
    monoConfig ? `'${monoConfig.name}', monospace` : SYSTEM_MONO_STACK
  );
};
