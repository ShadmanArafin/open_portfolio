/**
 * The half of the token system that is not colour.
 *
 * Spacing, measure, radius and type do not change between light and dark, so
 * they are emitted once rather than duplicated into both mode blocks. Keeping
 * them in their own file also keeps the colour generator readable — it has
 * enough to reason about.
 *
 * Every value here exists so a block never has to name a pixel. That is the
 * whole mechanism behind "there is no path from the UI to 20px purple Comic
 * Sans": the presentation vocabulary a block can reach is a closed set of
 * tokens, and this file is where that set is defined.
 */

export type Density = 'compact' | 'comfortable' | 'spacious';
export type Radius = 'sharp' | 'soft' | 'round';
export type TypeScale = 'compact' | 'default' | 'generous';

export interface LayoutInputs {
  density: Density;
  radius: Radius;
  typeScale: TypeScale;
}

export const LAYOUT_DEFAULTS: LayoutInputs = {
  density: 'comfortable',
  radius: 'soft',
  typeScale: 'default',
};

/** Multiplier on the 4px base step. */
const DENSITY_FACTOR: Record<Density, number> = {
  compact: 0.8,
  comfortable: 1,
  spacious: 1.25,
};

const RADIUS_BASE: Record<Radius, number> = { sharp: 0, soft: 12, round: 24 };

/**
 * Ratio between adjacent type steps.
 *
 * Modest ratios on purpose. A 1.5 scale looks dramatic in a specimen and turns
 * a real page into headings shouting at each other.
 */
const SCALE_RATIO: Record<TypeScale, number> = {
  compact: 1.15,
  default: 1.2,
  generous: 1.27,
};

/**
 * Fluid type, always.
 *
 * Every size is a `clamp()` between a phone value and a desktop value, so no
 * arrangement a non-designer can produce results in a 72px headline on a 390px
 * screen. There is deliberately no way to set a fixed font size.
 */
function typeStep(step: number, ratio: number): string {
  const base = 16;
  const desktop = base * Math.pow(ratio, step);
  // The small end compresses as sizes grow: a display heading has to shrink far
  // more than body text between a phone and a desktop.
  const compression = 1 - Math.min(0.42, Math.max(0, step) * 0.075);
  const mobile = step <= 0 ? desktop : desktop * compression;

  const min = round(mobile / base);
  const max = round(desktop / base);
  // The viewport term is derived so the value reaches `max` at 1280px and
  // `min` at 390px, rather than being guessed.
  const slope = round(((max - min) * 16 * 100) / (1280 - 390));
  const intercept = round(min - (slope * 390) / 1600);

  return `clamp(${min}rem, ${intercept}rem + ${slope}vw, ${max}rem)`;
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function generateLayoutTokens(inputs: Partial<LayoutInputs> = {}): Record<string, string> {
  const { density, radius, typeScale } = { ...LAYOUT_DEFAULTS, ...inputs };
  const step = 4 * DENSITY_FACTOR[density];
  const r = RADIUS_BASE[radius];
  const ratio = SCALE_RATIO[typeScale];

  const space: Record<string, string> = {};
  for (const n of [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32]) {
    space[`--space-${n}`] = `${round(step * n)}px`;
  }

  return {
    ...space,

    // Section rhythm. Fluid, because fixed vertical padding that looks
    // considered on a desktop wastes a third of a phone screen.
    '--section-y': 'clamp(3.5rem, 2rem + 7vw, 8rem)',
    '--section-y-tight': 'clamp(2rem, 1.25rem + 4vw, 4.5rem)',
    '--section-y-loose': 'clamp(5rem, 3rem + 10vw, 11rem)',
    '--gutter': 'clamp(1.25rem, 0.75rem + 2.5vw, 3rem)',

    // Container widths.
    '--container-narrow': '48rem',
    '--container-default': '72rem',
    '--container-wide': '90rem',

    // Line length. Prose is clamped to this so pasting three pages of text
    // cannot produce 200-character lines.
    '--measure': '68ch',
    '--measure-narrow': '46ch',

    // Minimum card widths, consumed by Grid's auto-fit. A `columns` value is a
    // maximum, not a promise: the grid drops to fewer when there is no room.
    '--card-min-2': '22rem',
    '--card-min-3': '17rem',
    '--card-min-4': '13rem',

    '--radius-sm': `${round(r * 0.5)}px`,
    '--radius-md': `${r}px`,
    '--radius-lg': `${round(r * 1.5)}px`,
    '--radius-full': '9999px',

    '--text-2xs': typeStep(-2, ratio),
    '--text-xs': typeStep(-1.5, ratio),
    '--text-sm': typeStep(-1, ratio),
    '--text-base': typeStep(0, ratio),
    '--text-lg': typeStep(1, ratio),
    '--text-xl': typeStep(2, ratio),
    '--text-2xl': typeStep(3, ratio),
    '--text-3xl': typeStep(4, ratio),
    '--text-4xl': typeStep(5, ratio),
    '--text-5xl': typeStep(6, ratio),

    '--leading-tight': '1.12',
    '--leading-snug': '1.28',
    '--leading-normal': '1.55',
    '--leading-relaxed': '1.72',

    '--tracking-tight': '-0.02em',
    '--tracking-normal': '0',
    '--tracking-wide': '0.08em',

    '--motion-fast': '150ms',
    '--motion-base': '250ms',
    '--motion-slow': '400ms',
    '--ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
  };
}

/** Emitted once on `:root` — none of these change between light and dark. */
export function buildLayoutStylesheet(inputs: Partial<LayoutInputs> = {}): string {
  const tokens = generateLayoutTokens(inputs);
  const body = Object.entries(tokens)
    .map(([name, value]) => `${name}:${value}`)
    .join(';');
  return `:root{${body}}`;
}
