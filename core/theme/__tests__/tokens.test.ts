import { describe, expect, it } from 'vitest';
import { contrastRatio, parseHex, THRESHOLD } from '../contrast';
import { buildThemeStylesheet, generateTokens, tokensFor, type ThemeMode } from '../tokens';

/**
 * The generator's job is to be un-break-able by colour choices, so most of what
 * is tested here is hostile input: colours a real person will genuinely pick
 * because they like them, and which would ruin a site that took them literally.
 */

/** Parses a token value, whether it came out as hex or `rgb(... / a)`. */
function rgbOf(value: string) {
  const hex = parseHex(value);
  if (hex) return hex;
  const match = value.match(/rgb\((\d+) (\d+) (\d+)/);
  if (!match) return null;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
}

const HOSTILE: [string, string, string, string][] = [
  ['neon green on near-black', '#00ff00', '#0d0f0f', '#1b1b1b'],
  ['yellow on white', '#ffff00', '#ffffff', '#e5e5e5'],
  ['navy on near-black', '#000080', '#0d0f0f', '#1b1b1b'],
  ['pale pink on white', '#ffd9e8', '#ffffff', '#eeeeee'],
  ['mid grey on mid grey', '#808080', '#7f7f7f', '#888888'],
  ['pure white on white', '#ffffff', '#ffffff', '#ffffff'],
  ['pure black on black', '#000000', '#000000', '#000000'],
];

describe('token generation', () => {
  const modes: ThemeMode[] = ['dark', 'light'];

  it('produces a complete set for both modes', () => {
    for (const mode of modes) {
      const tokens = generateTokens(mode);
      expect(Object.keys(tokens).length > 30).toBe(true);
      // Every entry must be something CSS can use.
      for (const [name, value] of Object.entries(tokens)) {
        expect(`${name}=${rgbOf(value) ? 'ok' : value}`).toBe(`${name}=ok`);
      }
    }
  });

  it('gives light and dark genuinely different backgrounds', () => {
    expect(generateTokens('dark')['--bg-primary']).not.toBe(
      generateTokens('light')['--bg-primary']
    );
  });

  describe('body text stays readable', () => {
    for (const [label, accent, background, stroke] of HOSTILE) {
      it(label, () => {
        for (const mode of modes) {
          const t = generateTokens(mode, { accent, background, stroke });
          const bg = rgbOf(t['--bg-primary'])!;

          for (const role of ['--text-primary', '--text-secondary'] as const) {
            const ratio = contrastRatio(rgbOf(t[role])!, bg);
            expect(`${role} ${ratio >= THRESHOLD.body}`).toBe(`${role} true`);
          }

          // Muted text is held to the large-text bar, which is what it is for.
          const muted = contrastRatio(rgbOf(t['--text-muted'])!, bg);
          expect(muted >= THRESHOLD.large).toBe(true);
        }
      });
    }
  });

  describe('the label on an accent fill is derived, not guessed', () => {
    for (const [label, accent, background, stroke] of HOSTILE) {
      it(label, () => {
        for (const mode of modes) {
          const t = generateTokens(mode, { accent, background, stroke });
          // `--text-on-accent` sits on the raw accent the user chose, so it is
          // checked against that rather than against a derived surface.
          const ratio = contrastRatio(rgbOf(t['--text-on-accent'])!, parseHex(accent)!);
          expect(ratio >= THRESHOLD.large).toBe(true);
        }
      });
    }
  });

  it('keeps a neon accent usable as an interface colour', () => {
    // The failure this prevents: an accent that passes as decoration but is
    // invisible the moment it is used for a link or a focus ring.
    const t = generateTokens('light', { accent: '#00ff00', background: '#ffffff' });
    const ratio = contrastRatio(rgbOf(t['--accent-color'])!, rgbOf(t['--bg-primary'])!);
    expect(ratio >= THRESHOLD.large).toBe(true);
  });

  it('makes recessed bands actually recede', () => {
    // The bug this pins: these were expressed as a negative mix amount, which
    // clamps to zero, so the footer and the sunken surface came out exactly
    // equal to the background and every band boundary disappeared.
    for (const mode of modes) {
      const t = generateTokens(mode);
      for (const role of ['--surface-sunken', '--section-footer'] as const) {
        expect(`${mode} ${role} ${t[role] !== t['--bg-primary']}`).toBe(`${mode} ${role} true`);
      }
    }
  });

  it('stays close to the palette the site was designed in', () => {
    // Not a style preference — these tokens replaced hand-picked hex values,
    // and a change to the mixing that quietly redesigns the site should have to
    // be deliberate enough to update this test.
    const t = generateTokens('dark');
    expect(t['--bg-primary']).toBe('#0d0f0f');
    expect(t['--text-primary']).toBe('#f5f5f2');
    expect(t['--accent-color']).toBe('#35f2b3');
    expect(t['--border-color']).toBe('#1b1b1b');
    // Previously #2b2b2b, hand-picked.
    expect(t['--border-color-hover']).toBe('#2a2a2a');
    // Previously #f5f5f2 on #101212, hand-picked.
    expect(t['--btn-primary-bg']).toBe('#f5f5f2');
  });

  it('does not throw on a colour field somebody typed badly', () => {
    const t = generateTokens('dark', { accent: 'not a colour', background: '#', stroke: '' });
    expect(parseHex(t['--bg-primary']) !== null).toBe(true);
    expect(parseHex(t['--accent-color']) !== null).toBe(true);
  });

  it('follows the background it was given rather than the name of the mode', () => {
    // A light background stored against the dark theme must still get dark text.
    const t = generateTokens('dark', { background: '#ffffff' });
    const ratio = contrastRatio(rgbOf(t['--text-primary'])!, { r: 255, g: 255, b: 255 });
    expect(ratio >= THRESHOLD.body).toBe(true);
  });
});

describe('appearance mapping', () => {
  it('reads the per-mode fields the CMS stores', () => {
    const appearance = {
      accentDark: '#ff0000',
      accentLight: '#0000ff',
      backgroundDark: '#000000',
      backgroundLight: '#ffffff',
    };
    expect(tokensFor('dark', appearance)['--bg-primary']).toBe('#000000');
    expect(tokensFor('light', appearance)['--bg-primary']).toBe('#ffffff');
  });

  it('falls back to the built-in palette when appearance is missing', () => {
    expect(tokensFor('dark', undefined)['--bg-primary']).toBe('#0d0f0f');
  });
});

describe('the server-rendered stylesheet', () => {
  const css = buildThemeStylesheet({ accentDark: '#35f2b3', backgroundDark: '#0d0f0f' });

  it('covers both the attribute and the class selector', () => {
    expect(css.includes(':root[data-theme="dark"]')).toBe(true);
    expect(css.includes(':root[data-theme="light"]')).toBe(true);
    expect(css.includes(':root.dark')).toBe(true);
    expect(css.includes(':root.light')).toBe(true);
  });

  it('declares color-scheme so form controls and scrollbars follow', () => {
    expect(css.includes('color-scheme:dark')).toBe(true);
    expect(css.includes('color-scheme:light')).toBe(true);
  });

  it('cannot break out of the style element it is written into', () => {
    // The values are all generated from parsed colours, so no user input
    // reaches the output verbatim — but assert it, because this string is
    // injected with dangerouslySetInnerHTML.
    const hostile = buildThemeStylesheet({ accentDark: '</style><script>alert(1)</script>' });
    expect(hostile.includes('<')).toBe(false);
    expect(hostile.includes('script')).toBe(false);
  });
});
