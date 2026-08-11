import type { LayoutInputs } from './layout-tokens';

/**
 * Themes, as data.
 *
 * The single strongest complaint in the market research is that every portfolio
 * looks the same — and shipping one theme made this project the worst offender
 * in the field on the axis it most needed to win. This is the answer to that,
 * and it is deliberately cheap: a theme here is a set of token values and
 * nothing else.
 *
 * That is not a shortcut, it is the contract the block system was built for.
 * Blocks own semantics, themes own tokens, neither imports the other, and the
 * ESLint boundary rule stops a block naming a colour or a size. The consequence
 * is that a theme which ships only tokens is a complete theme — and the tenth
 * one costs an entry in this file rather than a reimplementation of thirty
 * blocks.
 *
 * Each preset defines both modes. A theme that only works in dark is not a
 * theme, it is a preference, and the toggle in the corner is not going away.
 */

export interface ThemePreset {
  id: string;
  name: string;
  /** One line, shown under the name in the picker. Say how it feels. */
  description: string;

  colours: {
    accentDark: string;
    accentLight: string;
    backgroundDark: string;
    backgroundLight: string;
    strokeDark: string;
    strokeLight: string;
  };

  layout: LayoutInputs;

  fonts: {
    display: string;
    body: string;
    /** Empty means the system monospace stack. */
    mono: string;
  };
}

/**
 * The fonts each preset asks for, so the document can request exactly those.
 *
 * Kept beside the presets rather than hardcoded in the layout: adding a theme
 * that wants a different typeface should not mean editing the `<head>` too.
 */
export const GOOGLE_FONT_FAMILIES: Record<string, string> = {
  Geist: 'Geist:wght@300;400;500;600;700',
  'Instrument Serif': 'Instrument+Serif:wght@400',
  'Geist Mono': 'Geist+Mono:wght@400;500',
  Inter: 'Inter:wght@400;500;600;700',
  'Space Grotesk': 'Space+Grotesk:wght@400;500;600;700',
  'IBM Plex Mono': 'IBM+Plex+Mono:wght@400;500',
  'DM Serif Display': 'DM+Serif+Display:wght@400',
  'Libre Baskerville': 'Libre+Baskerville:wght@400;700',
  'JetBrains Mono': 'JetBrains+Mono:wght@400;500',
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Serif headlines, generous space, quiet colour. The default.',
    // Exactly the values this project shipped before themes existed. An update
    // that restyles somebody's live site is not an update, it is a surprise —
    // so the default theme is the old default, to the character.
    colours: {
      accentDark: '#35F2B3',
      accentLight: '#00B97D',
      backgroundDark: '#0D0F0F',
      backgroundLight: '#F3F3EF',
      strokeDark: '#1B1B1B',
      strokeLight: '#DADADA',
    },
    layout: { density: 'comfortable', radius: 'soft', typeScale: 'default' },
    fonts: { display: 'Instrument Serif', body: 'Geist', mono: 'Geist Mono' },
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Monospace, tight, high contrast. For people who write code.',
    colours: {
      accentDark: '#7dd3fc',
      accentLight: '#0369a1',
      backgroundDark: '#08080a',
      backgroundLight: '#fafafa',
      strokeDark: '#1f1f24',
      strokeLight: '#e4e4e7',
    },
    layout: { density: 'compact', radius: 'sharp', typeScale: 'compact' },
    fonts: { display: 'IBM Plex Mono', body: 'IBM Plex Mono', mono: 'IBM Plex Mono' },
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Big type, lots of air, almost no colour. Built to sit behind pictures.',
    colours: {
      accentDark: '#e5e5e5',
      accentLight: '#171717',
      backgroundDark: '#000000',
      backgroundLight: '#ffffff',
      strokeDark: '#1c1c1c',
      strokeLight: '#ebebeb',
    },
    layout: { density: 'spacious', radius: 'sharp', typeScale: 'generous' },
    fonts: { display: 'DM Serif Display', body: 'Inter', mono: '' },
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Soft edges, paper tones, a friendly accent. Reads as approachable.',
    colours: {
      accentDark: '#fb923c',
      accentLight: '#b45309',
      backgroundDark: '#1a1614',
      backgroundLight: '#fdfaf5',
      strokeDark: '#332b26',
      strokeLight: '#eae2d6',
    },
    layout: { density: 'comfortable', radius: 'round', typeScale: 'default' },
    fonts: { display: 'Libre Baskerville', body: 'Inter', mono: '' },
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Heavy geometric type and a colour that argues. Hard to ignore.',
    colours: {
      accentDark: '#f472b6',
      accentLight: '#be185d',
      backgroundDark: '#111014',
      backgroundLight: '#ffffff',
      strokeDark: '#2a2830',
      strokeLight: '#e9e7ee',
    },
    layout: { density: 'comfortable', radius: 'round', typeScale: 'generous' },
    fonts: { display: 'Space Grotesk', body: 'Space Grotesk', mono: 'JetBrains Mono' },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'One typeface, one weight, nothing decorative. Gets out of the way.',
    colours: {
      accentDark: '#a1a1aa',
      accentLight: '#3f3f46',
      backgroundDark: '#101012',
      backgroundLight: '#fcfcfc',
      strokeDark: '#232327',
      strokeLight: '#eeeeee',
    },
    layout: { density: 'comfortable', radius: 'sharp', typeScale: 'compact' },
    fonts: { display: 'Inter', body: 'Inter', mono: '' },
  },
];

export const DEFAULT_THEME_ID = 'editorial';

export function getThemePreset(id: string | undefined): ThemePreset {
  return (
    THEME_PRESETS.find((preset) => preset.id === id) ??
    THEME_PRESETS.find((preset) => preset.id === DEFAULT_THEME_ID)!
  );
}

/**
 * The Google Fonts URL for a preset, or null when it needs none.
 *
 * Requesting only what the chosen theme uses rather than every family any theme
 * might: a font file nobody's page renders is a download every visitor pays for.
 */
export function fontHref(preset: ThemePreset): string | null {
  const families = [preset.fonts.display, preset.fonts.body, preset.fonts.mono]
    .filter(Boolean)
    .map((family) => GOOGLE_FONT_FAMILIES[family])
    .filter(Boolean);

  const unique = [...new Set(families)];
  if (unique.length === 0) return null;

  return `https://fonts.googleapis.com/css2?${unique.map((f) => `family=${f}`).join('&')}&display=swap`;
}
