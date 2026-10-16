import { describe, expect, it } from 'vitest';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import config from '../../../tailwind.config.js';

const themeColors = (config as { theme?: { extend?: { colors?: Record<string, unknown> } } }).theme
  ?.extend?.colors as Record<string, unknown> | undefined;

/**
 * The CSS-build assertion test (issue #9): the gate before Tailwind 4.
 *
 * Tailwind 4 stops reading `tailwind.config.js` — silently. Every token-backed
 * utility this site is built on (`bg-bg`, `text-text-primary`, …) would
 * compile to nothing, with no build error anywhere. So this test compiles the
 * real config and asserts the utilities exist in the output. It fails the day
 * the config stops being read, which is exactly the day the bump becomes
 * unsafe to attempt, not the day after it ships.
 */
describe('css build', () => {
  it('emits the token-backed utilities the site is built on', async () => {
    const fixture =
      '<div class="bg-bg text-text-primary bg-surface-primary text-accent border-border"></div>';
    const result = await postcss([tailwindcss({ ...config, content: [{ raw: fixture }] })]).process(
      '@tailwind utilities;',
      { from: undefined }
    );
    for (const utility of [
      '.bg-bg',
      '.text-text-primary',
      '.bg-surface-primary',
      '.border-border',
    ]) {
      expect(
        result.css,
        `${utility} must survive the build — the theme tokens depend on it`
      ).toContain(utility);
    }
  });

  it('keeps the config this test compiles', async () => {
    // If this import ever resolves to nothing (config moved, renamed, or
    // converted to CSS-first), the suite must say so here — not ship pages
    // with half their classes missing.
    expect((themeColors?.bg as string) ?? '').toBe('var(--bg-primary)');
    expect(
      ((themeColors?.text as Record<string, string> | undefined)?.primary as string) ?? ''
    ).toBe('var(--text-primary)');
  });
});
