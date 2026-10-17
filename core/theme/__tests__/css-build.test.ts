import { describe, expect, it } from 'vitest';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const stylesheetPath = fileURLToPath(new URL('../../../src/styles/index.css', import.meta.url));

/**
 * The CSS-build assertion test (issue #9): the gate for Tailwind 4.
 *
 * Missing Tailwind utilities do not fail a build — they emit nothing, and a
 * page with half its classes missing looks exactly like a page with no CSS.
 * So this test compiles the real stylesheet through the real pipeline and
 * asserts the token-backed utilities the site is built on come out the other
 * side, still referencing the runtime variables the appearance editor
 * rewrites. It fails the moment that pipeline stops reading its theme — which
 * is the day a Tailwind change becomes unsafe to attempt, not the day after
 * it ships.
 */
describe('css build', () => {
  it('emits the token-backed utilities the site is built on', async () => {
    const result = await postcss([tailwindcss()]).process(readFileSync(stylesheetPath, 'utf8'), {
      from: stylesheetPath,
    });

    for (const utility of [
      '.bg-bg',
      '.text-text-primary',
      '.bg-surface-primary',
      '.border-border',
      '.rounded-pill',
      '.font-display',
    ]) {
      expect(
        result.css,
        `${utility} must survive the build — the theme tokens depend on it`
      ).toContain(utility);
    }

    // The palette and the font stacks are runtime data, so the utilities
    // must stay indirections through the variables in the page — never
    // baked values. `--font-display` is the important one: the theme entry
    // reads back the same variable the font picker writes on :root.
    expect(result.css).toContain('var(--bg-primary)');
    expect(result.css).toContain('var(--text-primary)');
    expect(result.css).toContain('var(--font-display)');
  }, 120_000);
});
