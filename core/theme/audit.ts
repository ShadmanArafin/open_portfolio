import { checkContrast, type TextSize } from './contrast';
import { tokensFor, type AppearanceColours, type ThemeMode } from './tokens';

/**
 * Audits a generated palette for pairs a reader could not actually read.
 *
 * The token generator already derives every on-colour and walks anything that
 * would fail toward the readable extreme, so in normal use this finds nothing.
 * It exists for the cases the generator cannot fix: a background and an accent
 * so close together that no shade of one is legible on the other. Something has
 * to notice that before it reaches a visitor, and the person who chose the
 * colours is the least likely to — they picked them because they like them.
 *
 * Separate from `contentHealth` so the same answer is available at the publish
 * boundary, in the appearance editor, and in a test, without any of them
 * importing a report format they do not need.
 */

/** The pairs worth checking. Everything else derives from one of these. */
const PAIRS: { fg: string; bg: string; label: string; size: TextSize }[] = [
  { fg: '--text-primary', bg: '--bg-primary', label: 'Body text', size: 'body' },
  { fg: '--text-secondary', bg: '--bg-primary', label: 'Secondary text', size: 'body' },
  { fg: '--text-muted', bg: '--bg-primary', label: 'Muted text', size: 'body' },
  { fg: '--link-color', bg: '--bg-primary', label: 'Links', size: 'body' },
  { fg: '--text-primary', bg: '--surface-primary', label: 'Text on cards', size: 'body' },
  {
    fg: '--text-on-accent',
    bg: '--accent-color',
    label: 'Text on the accent colour',
    size: 'body',
  },
  { fg: '--btn-primary-text', bg: '--btn-primary-bg', label: 'Button labels', size: 'body' },
  // The focus ring is an interface component under WCAG 1.4.11, so 3:1 rather
  // than 4.5:1 — and it genuinely has to be visible or keyboard users are lost.
  { fg: '--focus-ring', bg: '--bg-primary', label: 'The keyboard focus ring', size: 'large' },
  // Ordinary borders are deliberately *not* checked. 1.4.11 covers components
  // needed to identify a control or its state, not decorative hairlines between
  // sections. The shipped default sits at 1.12:1 by design; demanding 3:1 there
  // would block every install from publishing and make every site look like a
  // wireframe.
];

export interface ContrastFailure {
  mode: ThemeMode;
  /** Human-readable, because this reaches the owner rather than a developer. */
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  /** The nearest shade that would pass, when one exists. */
  suggestion?: string;
}

export interface ContrastAudit {
  failures: ContrastFailure[];
  /** True when every checked pair is readable in both light and dark. */
  passes: boolean;
}

export function auditContrast(appearance: AppearanceColours | undefined): ContrastAudit {
  const failures: ContrastFailure[] = [];

  // Both modes. A palette can be perfect in dark and unreadable in light, and
  // the owner may never look at the one they do not use themselves.
  for (const mode of ['dark', 'light'] as const) {
    const tokens = tokensFor(mode, appearance);

    for (const pair of PAIRS) {
      const fg = tokens[pair.fg];
      const bg = tokens[pair.bg];
      if (!fg || !bg) continue;

      const result = checkContrast(fg, bg, pair.size);
      // A colour the parser cannot read is not a contrast failure. It is
      // reported by whatever validates the field, not by this.
      if (!result || result.passes) continue;

      failures.push({
        mode,
        label: pair.label,
        foreground: fg,
        background: bg,
        ratio: result.ratio,
        required: result.required,
        suggestion: result.suggestion,
      });
    }
  }

  return { failures, passes: failures.length === 0 };
}

/** One sentence an owner can act on, for the worst failure found. */
export function describeFailure(failure: ContrastFailure): string {
  const ratio = failure.ratio.toFixed(1);
  const where = `${failure.label} in ${failure.mode} mode`;
  const base = `${where} sits at ${ratio}:1 against its background, below the ${failure.required}:1 needed to stay readable.`;
  return failure.suggestion
    ? `${base} Try ${failure.suggestion} instead.`
    : `${base} The background itself is too close to the text — change that rather than the text.`;
}
