/**
 * `next/font/google` loaders only exist under the Next compiler — under the
 * test runner they are not functions at all. The stub returns a loader per
 * family name that echoes a deterministic variable and className, which is
 * everything the catalogue map (`core/theme/fonts.ts`) needs: the tests
 * assert that every preset and picker family resolves, not the bytes of any
 * font file. Real file resolution is proven by `next build`, which downloads
 * each family or fails naming an unknown one.
 */
const loader =
  (family: string) =>
  (options: { variable?: string }): { variable: string; className: string } => ({
    variable: options.variable ?? `var(--font-${family.toLowerCase()})`,
    className: `next-font-${family.toLowerCase()}`,
  });

export const Inter = loader('inter');
export const Geist = loader('geist');
export const Figtree = loader('figtree');
export const Plus_Jakarta_Sans = loader('plus-jakarta-sans');
export const Manrope = loader('manrope');
export const DM_Sans = loader('dm-sans');
export const Onest = loader('onest');
export const Hanken_Grotesk = loader('hanken-grotesk');
export const IBM_Plex_Sans = loader('ibm-plex-sans');
export const Raleway = loader('raleway');
export const Instrument_Sans = loader('instrument-sans');
export const Schibsted_Grotesk = loader('schibsted-grotesk');
export const Familjen_Grotesk = loader('familjen-grotesk');
export const Space_Grotesk = loader('space-grotesk');
export const Archivo = loader('archivo');
export const Chivo = loader('chivo');
export const Epilogue = loader('epilogue');
export const Sora = loader('sora');
export const Outfit = loader('outfit');
export const Gabarito = loader('gabarito');
export const Bricolage_Grotesque = loader('bricolage-grotesque');
export const Unbounded = loader('unbounded');
export const Anton = loader('anton');
export const Instrument_Serif = loader('instrument-serif');
export const Fraunces = loader('fraunces');
export const Newsreader = loader('newsreader');
export const Source_Serif_4 = loader('source-serif-4');
export const Playfair_Display = loader('playfair-display');
export const Lora = loader('lora');
export const DM_Serif_Display = loader('dm-serif-display');
export const Libre_Baskerville = loader('libre-baskerville');
export const Geist_Mono = loader('geist-mono');
export const IBM_Plex_Mono = loader('ibm-plex-mono');
export const JetBrains_Mono = loader('jetbrains-mono');
export const Space_Mono = loader('space-mono');
