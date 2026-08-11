/**
 * The entire presentation vocabulary a block can reach.
 *
 * Enums only. No pixels, no colours, no font names. This is the single
 * mechanism that makes a builder safe for someone who is not a designer: there
 * is no path from the interface to "20px purple Comic Sans", because the
 * interface cannot express it. Everything a user can change is a choice from a
 * short list, and every choice resolves to tokens the theme controls.
 *
 * Adding a field here is a significant decision. Each one multiplies the
 * arrangements that have to look right in six themes at three breakpoints, and
 * anything expressive enough to make a page beautiful is expressive enough to
 * make it unreadable.
 */

export type FrameWidth = 'full-bleed' | 'wide' | 'default' | 'narrow';
export type FrameSpacing = 'none' | 'tight' | 'default' | 'loose';
export type FrameSurface = 'canvas' | 'raised' | 'sunken' | 'accent' | 'inverted';
export type FrameDivider = 'none' | 'top' | 'bottom' | 'both';
export type FrameAlign = 'start' | 'center';

export interface BlockFrame {
  width: FrameWidth;
  spacing: FrameSpacing;
  surface: FrameSurface;
  divider: FrameDivider;
  align: FrameAlign;
  /** Swaps media and text in split layouts. Ignored by blocks without media. */
  flip?: boolean;
}

export const FRAME_DEFAULT: BlockFrame = {
  width: 'default',
  spacing: 'default',
  surface: 'canvas',
  divider: 'none',
  align: 'start',
};

/** Fills in anything a stored block omits, so a partial frame is always safe. */
export function resolveFrame(frame?: Partial<BlockFrame>): BlockFrame {
  return { ...FRAME_DEFAULT, ...frame };
}

/**
 * Surfaces resolve to a background and a matching foreground *together*.
 *
 * Pairing them here is what makes `surface: 'accent'` safe: a block cannot
 * choose a background without also getting the text colour the token layer
 * derived for it, so mint-on-mint is unrepresentable rather than merely
 * discouraged.
 */
export const SURFACE_STYLE: Record<FrameSurface, { background: string; color: string }> = {
  canvas: { background: 'var(--bg-primary)', color: 'var(--text-primary)' },
  raised: { background: 'var(--surface-raised)', color: 'var(--text-primary)' },
  sunken: { background: 'var(--surface-sunken)', color: 'var(--text-primary)' },
  accent: { background: 'var(--accent-color)', color: 'var(--text-on-accent)' },
  inverted: { background: 'var(--text-primary)', color: 'var(--text-inverse)' },
};

export const WIDTH_STYLE: Record<FrameWidth, string> = {
  'full-bleed': '100%',
  wide: 'var(--container-wide)',
  default: 'var(--container-default)',
  narrow: 'var(--container-narrow)',
};

export const SPACING_STYLE: Record<FrameSpacing, string> = {
  none: '0',
  tight: 'var(--section-y-tight)',
  default: 'var(--section-y)',
  loose: 'var(--section-y-loose)',
};
