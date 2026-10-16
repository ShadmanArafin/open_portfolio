/* Self-hosted catalogue fonts.
 *
 * One static next/font/google loader per family the Appearance picker offers.
 * Static is the whole point: next/font downloads and self-hosts the files at
 * build time, so no visitor request ever reaches Google (remote font CSS leaks
 * visitor IPs). Dynamic choice survives because selection stays data: the
 * layout attaches every variable class, and --font-display/body/mono point at
 * whichever variable the saved appearance names. Unused families cost parsed
 * CSS, not downloads — the browser only fetches a woff2 whose family is
 * actually referenced.
 *
 * preload:false: preloading every catalogue family would turn each page load
 * into a font firehose. adjustFontFallback stays on so the swap does not shift
 * layout. Adding a catalogue font means adding one block here and one entry
 * in GOOGLE_FONTS_LIST — the build fails naming an unknown family, which is
 * the test.
 */
import {
  Inter,
  Geist,
  Figtree,
  Plus_Jakarta_Sans,
  Manrope,
  DM_Sans,
  Onest,
  Hanken_Grotesk,
  IBM_Plex_Sans,
  Raleway,
  Instrument_Sans,
  Schibsted_Grotesk,
  Familjen_Grotesk,
  Space_Grotesk,
  Archivo,
  Chivo,
  Epilogue,
  Sora,
  Outfit,
  Gabarito,
  Bricolage_Grotesque,
  Unbounded,
  Anton,
  Instrument_Serif,
  Fraunces,
  Newsreader,
  Source_Serif_4,
  Playfair_Display,
  Lora,
  DM_Serif_Display,
  Libre_Baskerville,
  Geist_Mono,
  JetBrains_Mono,
  Space_Mono,
  IBM_Plex_Mono,
} from 'next/font/google';

export interface SelfHostedFont {
  variable: string;
  className: string;
  generic: string;
}

const Inter_font = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-inter',
});
const Geist_font = Geist({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-geist',
});
const Figtree_font = Figtree({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-figtree',
});
const Plus_Jakarta_Sans_font = Plus_Jakarta_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-plus-jakarta-sans',
});
const Manrope_font = Manrope({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-manrope',
});
const DM_Sans_font = DM_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-dm-sans',
});
const Onest_font = Onest({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-onest',
});
const Hanken_Grotesk_font = Hanken_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-hanken-grotesk',
});
const IBM_Plex_Sans_font = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-ibm-plex-sans',
});
const Raleway_font = Raleway({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-raleway',
});
const Instrument_Sans_font = Instrument_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-instrument-sans',
});
const Schibsted_Grotesk_font = Schibsted_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-schibsted-grotesk',
});
const Familjen_Grotesk_font = Familjen_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-familjen-grotesk',
});
const Space_Grotesk_font = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-space-grotesk',
});
const Archivo_font = Archivo({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-archivo',
});
const Chivo_font = Chivo({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-chivo',
});
const Epilogue_font = Epilogue({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-epilogue',
});
const Sora_font = Sora({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-sora',
});
const Outfit_font = Outfit({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-outfit',
});
const Gabarito_font = Gabarito({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-gabarito',
});
const Bricolage_Grotesque_font = Bricolage_Grotesque({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-bricolage-grotesque',
});
const Unbounded_font = Unbounded({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-unbounded',
});
const Anton_font = Anton({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-anton',
});
const Instrument_Serif_font = Instrument_Serif({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-instrument-serif',
});
const Fraunces_font = Fraunces({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-fraunces',
});
const Newsreader_font = Newsreader({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-newsreader',
});
const Source_Serif_4_font = Source_Serif_4({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-source-serif-4',
});
const Playfair_Display_font = Playfair_Display({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-playfair-display',
});
const Lora_font = Lora({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-lora',
});
const DM_Serif_Display_font = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-dm-serif-display',
});
const Libre_Baskerville_font = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-libre-baskerville',
});
const Geist_Mono_font = Geist_Mono({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-geist-mono',
});
const JetBrains_Mono_font = JetBrains_Mono({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-jetbrains-mono',
});
const Space_Mono_font = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-space-mono',
});
const IBM_Plex_Mono_font = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
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
