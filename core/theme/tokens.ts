import {
  contrastRatio,
  parseHex,
  readableForeground,
  THRESHOLD,
  toHex,
  type Rgb,
  type TextSize,
} from './contrast';

/**
 * Every colour the site paints, derived from six a user actually picks.
 *
 * The appearance editor asks for an accent, a background and a stroke colour,
 * per mode. Everything else — surfaces, secondary and muted text, hover states,
 * the label colour on an accent-filled button — is computed here. That is the
 * whole point: a person choosing a brand colour is not choosing a design
 * system, and asking them to pick "the text colour that goes on top of the
 * accent" is asking them to fail.
 *
 * Two rules hold for every value produced:
 *
 * 1. **Foregrounds are derived, never requested.** `--text-on-accent` comes
 *    from `readableForeground`, so a yellow accent gets dark text and a navy
 *    one gets light text without anybody deciding.
 * 2. **Text is clamped at generation.** A derived colour that would fail 4.5:1
 *    against the surface it sits on is walked toward the readable extreme until
 *    it passes. A neon accent still yields usable subtle, link and border roles
 *    rather than an unreadable site.
 *
 * Sits alongside `contrast.ts` and shares its constraints: no dependencies, no
 * framework, so the same code runs in the editor, on the server at render time,
 * and in tests.
 */

export type ThemeMode = 'light' | 'dark';

/** What the appearance editor collects for one mode. */
export interface ThemeInputs {
  accent: string;
  background: string;
  stroke: string;
}

export type TokenSet = Record<string, string>;

/** Linear blend, `amount` of `b` into `a`. */
function mix(a: Rgb, b: Rgb, amount: number): Rgb {
  const t = Math.max(0, Math.min(1, amount));
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

/**
 * Darkens by a fixed number of channel steps.
 *
 * Absolute rather than proportional, because a recessed band has to read as
 * recessed in both themes and a fraction cannot do that: a tenth of the way to
 * black is two units on a near-black page and twenty-five on a near-white one.
 * Sinking is always toward black — a footer that gets *lighter* than the page
 * it sits under is the one direction nobody reads as depth.
 */
function shade({ r, g, b }: Rgb, steps: number): Rgb {
  return { r: Math.max(0, r - steps), g: Math.max(0, g - steps), b: Math.max(0, b - steps) };
}

/**
 * Nudges a colour away from a background until it is legible against it.
 *
 * Walks in twenty steps toward the extreme that reads best on that background,
 * and gives up on the extreme itself. Small steps keep the result close to the
 * colour that was asked for, which is what makes the constraint bearable — the
 * user's teal stays recognisably their teal.
 *
 * The direction comes from `readableForeground` rather than from a luminance
 * threshold, because the two disagree in the mid-tones: a mid grey is below
 * 0.5 luminance yet reads better with black on it than white. Walking the wrong
 * way there produces a colour that fails at every step and lands on an extreme
 * that fails too.
 */
function enforceContrast(colour: Rgb, background: Rgb, size: TextSize = 'body'): Rgb {
  const required = THRESHOLD[size];
  if (contrastRatio(colour, background) >= required) return colour;

  const target = readableForeground(background);

  for (let step = 1; step <= 20; step++) {
    const candidate = parseHex(toHex(mix(colour, target, step / 20)))!;
    if (contrastRatio(candidate, background) >= required) return candidate;
  }

  return target;
}

/** `rgb(r g b / a)` — for the translucent fills badges and rings use. */
function alpha({ r, g, b }: Rgb, opacity: number): string {
  const round = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `rgb(${round(r)} ${round(g)} ${round(b)} / ${opacity})`;
}

/** Falls back rather than throwing: a typo in a colour field is not fatal. */
function colour(value: string | undefined, fallback: Rgb): Rgb {
  return (value && parseHex(value)) || fallback;
}

const DEFAULTS: Record<ThemeMode, ThemeInputs> = {
  dark: { accent: '#35f2b3', background: '#0d0f0f', stroke: '#1b1b1b' },
  light: { accent: '#00b97d', background: '#f3f3ef', stroke: '#dadada' },
};

/**
 * The extremes text is derived toward.
 *
 * Slightly off pure white and pure black, because #ffffff on a near-black
 * background is harsher than anything a designer would choose, and the extra
 * contrast buys nothing at 17:1. `enforceContrast` still walks toward the true
 * extremes, where the headroom is what matters.
 */
const INK = { light: { r: 245, g: 245, b: 242 }, dark: { r: 16, g: 18, b: 18 } };

/**
 * The full token set for one mode.
 *
 * Surfaces step away from the background toward its opposite, so the ladder
 * works whether the background is near-black or near-white without branching on
 * the mode. Text steps the other way, from the derived foreground back toward
 * the background, then gets clamped.
 */
export function generateTokens(mode: ThemeMode, inputs: Partial<ThemeInputs> = {}): TokenSet {
  const defaults = DEFAULTS[mode];

  const bg = colour(inputs.background, parseHex(defaults.background)!);
  const accent = colour(inputs.accent, parseHex(defaults.accent)!);
  const stroke = colour(inputs.stroke, parseHex(defaults.stroke)!);

  // The direction everything moves in. Derived from the background actually
  // given, not from the mode's name — someone who sets a light background on
  // the dark theme gets a coherent result rather than an unreadable one.
  const textPrimary = readableForeground(bg, INK);
  const away = textPrimary;

  const textSecondary = enforceContrast(mix(textPrimary, bg, 0.38), bg);
  const textMuted = enforceContrast(mix(textPrimary, bg, 0.55), bg, 'large');

  const surface = mix(bg, away, 0.025);
  const surfaceSecondary = mix(bg, away, 0.055);
  const surfaceRaised = mix(bg, away, 0.08);
  const surfaceSunken = shade(bg, 5);

  const accentOnBg = enforceContrast(accent, bg, 'large');
  const accentHover = mix(accent, away, 0.15);
  const textOnAccent = readableForeground(accent, INK);

  // Inverted button: the primary fill is the text colour, so it reads as the
  // strongest thing on the page in either mode.
  const btnPrimaryBg = textPrimary;

  return {
    '--bg-primary': toHex(bg),
    '--surface-primary': toHex(surface),
    '--surface-secondary': toHex(surfaceSecondary),
    '--surface-raised': toHex(surfaceRaised),
    '--surface-sunken': toHex(surfaceSunken),
    '--surface-overlay': alpha(bg, 0.86),

    '--text-primary': toHex(textPrimary),
    '--text-secondary': toHex(textSecondary),
    '--text-muted': toHex(textMuted),
    '--text-inverse': toHex(readableForeground(textPrimary)),
    '--text-on-accent': toHex(textOnAccent),

    // Borders move in small steps. A hover state that jumps two shades reads
    // as a different component rather than the same one under a cursor.
    '--border-color': toHex(stroke),
    '--border-subtle': toHex(mix(stroke, bg, 0.45)),
    '--border-color-hover': toHex(mix(stroke, away, 0.07)),
    '--border-strong': toHex(mix(stroke, away, 0.12)),

    '--accent-color': toHex(accentOnBg),
    '--accent-hover': toHex(accentHover),
    '--accent-subtle': alpha(accent, 0.12),
    '--accent-muted': toHex(mix(accent, bg, 0.7)),
    '--accent-contrast': toHex(textOnAccent),

    '--badge-bg': alpha(accent, 0.08),
    '--badge-border': alpha(accent, 0.25),

    '--btn-primary-bg': toHex(btnPrimaryBg),
    '--btn-primary-text': toHex(readableForeground(btnPrimaryBg)),
    '--btn-primary-hover': toHex(mix(btnPrimaryBg, bg, 0.12)),
    '--btn-secondary-border': toHex(stroke),
    '--btn-secondary-text': toHex(textPrimary),
    '--btn-secondary-hover': toHex(surfaceSecondary),

    '--focus-ring': toHex(accentOnBg),
    '--selection-bg': alpha(accent, 0.2),
    '--selection-text': toHex(accentOnBg),
    '--link-color': toHex(accentOnBg),

    // Section bands. Small, deliberate steps rather than arbitrary hex values,
    // so a change of background carries the whole page with it.
    '--section-hero': toHex(bg),
    '--section-work': toHex(bg),
    '--section-about': toHex(mix(bg, away, 0.018)),
    '--section-capabilities': toHex(mix(bg, away, 0.01)),
    '--section-experience': toHex(mix(bg, away, 0.03)),
    '--section-contact': toHex(shade(bg, 3)),
    '--section-footer': toHex(shade(bg, 5)),
  };
}

/** The appearance fields this reads. A subset of `AppearanceSettings`. */
export interface AppearanceColours {
  accentDark?: string;
  accentLight?: string;
  backgroundDark?: string;
  backgroundLight?: string;
  strokeDark?: string;
  strokeLight?: string;
}

export function tokensFor(mode: ThemeMode, appearance: AppearanceColours | undefined): TokenSet {
  const a = appearance ?? {};
  return mode === 'dark'
    ? generateTokens('dark', {
        accent: a.accentDark,
        background: a.backgroundDark,
        stroke: a.strokeDark,
      })
    : generateTokens('light', {
        accent: a.accentLight,
        background: a.backgroundLight,
        stroke: a.strokeLight,
      });
}

function declarations(tokens: TokenSet): string {
  return Object.entries(tokens)
    .map(([name, value]) => `${name}:${value}`)
    .join(';');
}

/**
 * Both modes as a stylesheet, for server rendering into a `<style>`.
 *
 * The selectors mirror `src/styles/index.css` exactly, and this is emitted
 * unlayered so it outranks the `@layer base` defaults there whatever the source
 * order turns out to be.
 *
 * Rendering this on the server is the point. The previous approach wrote six
 * variables from a `useEffect`, which meant every visitor was painted the
 * built-in palette first and the site's real one a frame later.
 */
export function buildThemeStylesheet(appearance: AppearanceColours | undefined): string {
  const dark = declarations(tokensFor('dark', appearance));
  const light = declarations(tokensFor('light', appearance));

  return (
    `:root,:root[data-theme="dark"],:root.dark{${dark};color-scheme:dark}` +
    `:root[data-theme="light"],:root.light{${light};color-scheme:light}`
  );
}
