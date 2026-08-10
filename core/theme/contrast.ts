/**
 * Colour contrast, and how to fix it.
 *
 * The appearance editor lets anyone pick an accent colour, which makes this the
 * one place in the product where a single click can make a site unreadable —
 * and the person doing it is the least likely to notice, because they chose the
 * colour precisely because they like looking at it.
 *
 * So this module does not merely detect bad contrast. It derives a readable
 * foreground automatically, and when a colour genuinely cannot work it offers
 * the nearest shade that does. Offering a fix is what makes people accept the
 * constraint; a bare rejection makes them fight the tool.
 *
 * WCAG 2.1 relative luminance is used rather than APCA: it is what accessibility
 * requirements are actually written against, so a passing score here is a score
 * someone can rely on.
 *
 * Deliberately dependency-free and framework-free, so it can run in the editor,
 * on the server at publish time, and in tests without any setup.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Accepts `#abc`, `#aabbcc`, with or without the hash. */
export function parseHex(hex: string): Rgb | null {
  const value = hex.trim().replace(/^#/, '');

  if (/^[0-9a-f]{3}$/i.test(value)) {
    return {
      r: parseInt(value[0] + value[0], 16),
      g: parseInt(value[1] + value[1], 16),
      b: parseInt(value[2] + value[2], 16),
    };
  }

  if (/^[0-9a-f]{6}$/i.test(value)) {
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  }

  return null;
}

export function toHex({ r, g, b }: Rgb): string {
  const channel = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** WCAG relative luminance. The gamma expansion is what makes it perceptual. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (value: number) => {
    const srgb = value / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio, from 1 (identical) to 21 (black on white). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const lumA = relativeLuminance(a);
  const lumB = relativeLuminance(b);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

export type TextSize = 'body' | 'large';

/** AA: 4.5 for body text, 3.0 for large text and interface components. */
export const THRESHOLD: Record<TextSize, number> = { body: 4.5, large: 3 };

/**
 * The readable foreground for a background — derived, not asked for.
 *
 * Every "what colour should the text be" decision goes through here, so a user
 * choosing a brand colour never has to think about whether the label on their
 * button will be legible.
 */
export function readableForeground(background: Rgb, options?: { dark?: Rgb; light?: Rgb }): Rgb {
  const dark = options?.dark ?? { r: 13, g: 15, b: 15 };
  const light = options?.light ?? { r: 255, g: 255, b: 255 };
  return contrastRatio(background, dark) >= contrastRatio(background, light) ? dark : light;
}

export interface ContrastCheck {
  ratio: number;
  passes: boolean;
  required: number;
  /** The nearest shade of the same hue that would pass, when one exists. */
  suggestion?: string;
}

/**
 * Checks a foreground against a background, and finds a fix if it fails.
 *
 * The suggestion walks the colour toward black or white in small steps rather
 * than jumping to a computed value. Staying close to what the user picked is
 * the point — a suggestion that ignores their choice is one they will ignore
 * back.
 */
export function checkContrast(
  foreground: string,
  background: string,
  size: TextSize = 'body'
): ContrastCheck | null {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return null;

  const required = THRESHOLD[size];
  const ratio = contrastRatio(fg, bg);
  if (ratio >= required) return { ratio, passes: true, required };

  // Move away from the background: darken against a light one, lighten against
  // a dark one.
  const towardsWhite = relativeLuminance(bg) < 0.5;
  const target: Rgb = towardsWhite ? { r: 255, g: 255, b: 255 } : { r: 13, g: 15, b: 15 };

  for (let step = 1; step <= 20; step++) {
    const amount = step / 20;
    // Rounded to a real hex value *before* testing. Checking the float and
    // then rounding can land just under the threshold, which would hand the
    // user a "fix" that still fails — worse than offering nothing.
    const candidateHex = toHex({
      r: fg.r + (target.r - fg.r) * amount,
      g: fg.g + (target.g - fg.g) * amount,
      b: fg.b + (target.b - fg.b) * amount,
    });
    if (contrastRatio(parseHex(candidateHex)!, bg) >= required) {
      return { ratio, passes: false, required, suggestion: candidateHex };
    }
  }

  // Nothing along that path works, which means the background itself is the
  // problem. Saying so is more useful than suggesting an unreachable colour.
  return { ratio, passes: false, required };
}
