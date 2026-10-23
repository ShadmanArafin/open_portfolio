/* Self-hosted catalogue fonts.
 *
 * One static next/font/local loader per family the Appearance picker offers,
 * over the latin files of the family's Fontsource package (OFL, installed by
 * `npm ci` like any other dependency). The build reads files from disk and
 * makes no network request, so it works offline and cannot fail because a
 * font host did not answer; no visitor request ever reaches a font host
 * either. Dynamic choice survives because selection stays data: the layout
 * attaches every variable class, and --font-display/body/mono point at
 * whichever variable the saved appearance names. Unused families cost parsed
 * CSS, not downloads — the browser only fetches a woff2 whose family is
 * actually referenced.
 *
 * Variable families ship one file for every weight. preload:false: preloading
 * every catalogue family would turn each page load into a font firehose.
 * adjustFontFallback keeps the swap from shifting layout. Adding a catalogue
 * font means installing its @fontsource(-variable) package, adding one block
 * here and one entry in GOOGLE_FONTS_LIST — the build fails naming a missing
 * file, which is the test.
 */
import localFont from 'next/font/local';

export interface SelfHostedFont {
  variable: string;
  className: string;
  generic: string;
}

const Inter_font = localFont({
  src: '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-inter',
});
const Geist_font = localFont({
  src: '../../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-geist',
});
const Figtree_font = localFont({
  src: '../../node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-figtree',
});
const Plus_Jakarta_Sans_font = localFont({
  src: '../../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-plus-jakarta-sans',
});
const Manrope_font = localFont({
  src: '../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-manrope',
});
const DM_Sans_font = localFont({
  src: '../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-dm-sans',
});
const Onest_font = localFont({
  src: '../../node_modules/@fontsource-variable/onest/files/onest-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-onest',
});
const Hanken_Grotesk_font = localFont({
  src: '../../node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-hanken-grotesk',
});
const IBM_Plex_Sans_font = localFont({
  src: '../../node_modules/@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-ibm-plex-sans',
});
const Raleway_font = localFont({
  src: '../../node_modules/@fontsource-variable/raleway/files/raleway-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-raleway',
});
const Instrument_Sans_font = localFont({
  src: '../../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-instrument-sans',
});
const Schibsted_Grotesk_font = localFont({
  src: '../../node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-schibsted-grotesk',
});
const Familjen_Grotesk_font = localFont({
  src: '../../node_modules/@fontsource-variable/familjen-grotesk/files/familjen-grotesk-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-familjen-grotesk',
});
const Space_Grotesk_font = localFont({
  src: '../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-space-grotesk',
});
const Archivo_font = localFont({
  src: '../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-archivo',
});
const Chivo_font = localFont({
  src: '../../node_modules/@fontsource-variable/chivo/files/chivo-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-chivo',
});
const Epilogue_font = localFont({
  src: '../../node_modules/@fontsource-variable/epilogue/files/epilogue-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-epilogue',
});
const Sora_font = localFont({
  src: '../../node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-sora',
});
const Outfit_font = localFont({
  src: '../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-outfit',
});
const Gabarito_font = localFont({
  src: '../../node_modules/@fontsource-variable/gabarito/files/gabarito-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-gabarito',
});
const Bricolage_Grotesque_font = localFont({
  src: '../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-bricolage-grotesque',
});
const Unbounded_font = localFont({
  src: '../../node_modules/@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-unbounded',
});
const Anton_font = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2',
      weight: '400',
    },
  ],
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-anton',
});
const Instrument_Serif_font = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2',
      weight: '400',
    },
  ],
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
  variable: '--font-instrument-serif',
});
const Fraunces_font = localFont({
  src: '../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
  variable: '--font-fraunces',
});
const Newsreader_font = localFont({
  src: '../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
  variable: '--font-newsreader',
});
const Source_Serif_4_font = localFont({
  src: '../../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
  variable: '--font-source-serif-4',
});
const Playfair_Display_font = localFont({
  src: '../../node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
  variable: '--font-playfair-display',
});
const Lora_font = localFont({
  src: '../../node_modules/@fontsource-variable/lora/files/lora-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
  variable: '--font-lora',
});
const DM_Serif_Display_font = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff2',
      weight: '400',
    },
  ],
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
  variable: '--font-dm-serif-display',
});
const Libre_Baskerville_font = localFont({
  src: '../../node_modules/@fontsource-variable/libre-baskerville/files/libre-baskerville-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
  variable: '--font-libre-baskerville',
});
const Geist_Mono_font = localFont({
  src: '../../node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-geist-mono',
});
const JetBrains_Mono_font = localFont({
  src: '../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-jetbrains-mono',
});
const Space_Mono_font = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource/space-mono/files/space-mono-latin-400-normal.woff2',
      weight: '400',
    },
    {
      path: '../../node_modules/@fontsource/space-mono/files/space-mono-latin-700-normal.woff2',
      weight: '700',
    },
  ],
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-space-mono',
});
const IBM_Plex_Mono_font = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
      weight: '400',
    },
    {
      path: '../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2',
      weight: '500',
    },
  ],
  style: 'normal',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-ibm-plex-mono',
});

export const SELF_HOSTED_FONTS: Record<string, SelfHostedFont> = {
  Inter: { variable: '--font-inter', className: Inter_font.variable, generic: 'sans-serif' },
  Geist: { variable: '--font-geist', className: Geist_font.variable, generic: 'sans-serif' },
  Figtree: { variable: '--font-figtree', className: Figtree_font.variable, generic: 'sans-serif' },
  'Plus Jakarta Sans': {
    variable: '--font-plus-jakarta-sans',
    className: Plus_Jakarta_Sans_font.variable,
    generic: 'sans-serif',
  },
  Manrope: { variable: '--font-manrope', className: Manrope_font.variable, generic: 'sans-serif' },
  'DM Sans': {
    variable: '--font-dm-sans',
    className: DM_Sans_font.variable,
    generic: 'sans-serif',
  },
  Onest: { variable: '--font-onest', className: Onest_font.variable, generic: 'sans-serif' },
  'Hanken Grotesk': {
    variable: '--font-hanken-grotesk',
    className: Hanken_Grotesk_font.variable,
    generic: 'sans-serif',
  },
  'IBM Plex Sans': {
    variable: '--font-ibm-plex-sans',
    className: IBM_Plex_Sans_font.variable,
    generic: 'sans-serif',
  },
  Raleway: { variable: '--font-raleway', className: Raleway_font.variable, generic: 'sans-serif' },
  'Instrument Sans': {
    variable: '--font-instrument-sans',
    className: Instrument_Sans_font.variable,
    generic: 'sans-serif',
  },
  'Schibsted Grotesk': {
    variable: '--font-schibsted-grotesk',
    className: Schibsted_Grotesk_font.variable,
    generic: 'sans-serif',
  },
  'Familjen Grotesk': {
    variable: '--font-familjen-grotesk',
    className: Familjen_Grotesk_font.variable,
    generic: 'sans-serif',
  },
  'Space Grotesk': {
    variable: '--font-space-grotesk',
    className: Space_Grotesk_font.variable,
    generic: 'sans-serif',
  },
  Archivo: { variable: '--font-archivo', className: Archivo_font.variable, generic: 'sans-serif' },
  Chivo: { variable: '--font-chivo', className: Chivo_font.variable, generic: 'sans-serif' },
  Epilogue: {
    variable: '--font-epilogue',
    className: Epilogue_font.variable,
    generic: 'sans-serif',
  },
  Sora: { variable: '--font-sora', className: Sora_font.variable, generic: 'sans-serif' },
  Outfit: { variable: '--font-outfit', className: Outfit_font.variable, generic: 'sans-serif' },
  Gabarito: {
    variable: '--font-gabarito',
    className: Gabarito_font.variable,
    generic: 'sans-serif',
  },
  'Bricolage Grotesque': {
    variable: '--font-bricolage-grotesque',
    className: Bricolage_Grotesque_font.variable,
    generic: 'sans-serif',
  },
  Unbounded: {
    variable: '--font-unbounded',
    className: Unbounded_font.variable,
    generic: 'sans-serif',
  },
  Anton: { variable: '--font-anton', className: Anton_font.variable, generic: 'sans-serif' },
  'Instrument Serif': {
    variable: '--font-instrument-serif',
    className: Instrument_Serif_font.variable,
    generic: 'serif',
  },
  Fraunces: { variable: '--font-fraunces', className: Fraunces_font.variable, generic: 'serif' },
  Newsreader: {
    variable: '--font-newsreader',
    className: Newsreader_font.variable,
    generic: 'serif',
  },
  'Source Serif 4': {
    variable: '--font-source-serif-4',
    className: Source_Serif_4_font.variable,
    generic: 'serif',
  },
  'Playfair Display': {
    variable: '--font-playfair-display',
    className: Playfair_Display_font.variable,
    generic: 'serif',
  },
  Lora: { variable: '--font-lora', className: Lora_font.variable, generic: 'serif' },
  'DM Serif Display': {
    variable: '--font-dm-serif-display',
    className: DM_Serif_Display_font.variable,
    generic: 'serif',
  },
  'Libre Baskerville': {
    variable: '--font-libre-baskerville',
    className: Libre_Baskerville_font.variable,
    generic: 'serif',
  },
  'Geist Mono': {
    variable: '--font-geist-mono',
    className: Geist_Mono_font.variable,
    generic: 'monospace',
  },
  'JetBrains Mono': {
    variable: '--font-jetbrains-mono',
    className: JetBrains_Mono_font.variable,
    generic: 'monospace',
  },
  'Space Mono': {
    variable: '--font-space-mono',
    className: Space_Mono_font.variable,
    generic: 'monospace',
  },
  'IBM Plex Mono': {
    variable: '--font-ibm-plex-mono',
    className: IBM_Plex_Mono_font.variable,
    generic: 'monospace',
  },
};

/** Every variable class, for the root element. CSS only until used. */
export const ALL_FONT_VARIABLES: string = Object.values(SELF_HOSTED_FONTS)
  .map((f) => f.className)
  .join(' ');
