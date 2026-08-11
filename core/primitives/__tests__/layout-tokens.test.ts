import { describe, expect, it } from 'vitest';
import {
  buildLayoutStylesheet,
  generateLayoutTokens,
  LAYOUT_DEFAULTS,
} from '../../theme/layout-tokens';

describe('layout tokens', () => {
  it('emits every family a primitive reads', () => {
    // A primitive referencing a token that is never emitted fails silently:
    // the browser drops the declaration and the element renders unstyled.
    const t = generateLayoutTokens();
    for (const name of [
      '--space-4',
      '--section-y',
      '--gutter',
      '--container-default',
      '--measure',
      '--card-min-3',
      '--radius-md',
      '--text-base',
      '--leading-normal',
      '--tracking-wide',
      '--motion-fast',
      '--ease-standard',
    ]) {
      expect(typeof t[name]).toBe('string');
    }
  });

  it('makes every type step fluid', () => {
    // A fixed font size is how a 72px headline reaches a 390px screen. There
    // must be no way to produce one.
    const t = generateLayoutTokens();
    const steps = Object.entries(t).filter(([k]) => k.startsWith('--text-'));
    expect(steps.length).toBeGreaterThan(5);
    for (const [, value] of steps) {
      expect(value.startsWith('clamp(')).toBe(true);
    }
  });

  it('keeps type steps in ascending order', () => {
    const t = generateLayoutTokens();
    const maxOf = (v: string) => parseFloat(v.split(',')[2]);
    const order = [
      '--text-sm',
      '--text-base',
      '--text-lg',
      '--text-xl',
      '--text-2xl',
      '--text-3xl',
    ];
    for (let i = 1; i < order.length; i++) {
      expect(maxOf(t[order[i]])).toBeGreaterThan(maxOf(t[order[i - 1]]));
    }
  });

  it('never lets a heading grow on a small screen relative to a desktop', () => {
    // The small end of each clamp must not exceed the large end, or the type
    // scale inverts at exactly the width where space is scarcest.
    const t = generateLayoutTokens();
    for (const [, value] of Object.entries(t).filter(([k]) => k.startsWith('--text-'))) {
      const [min, , max] = value.replace('clamp(', '').replace(')', '').split(',');
      expect(parseFloat(min)).toBeLessThanOrEqual(parseFloat(max));
    }
  });

  it('scales spacing with density', () => {
    const compact = generateLayoutTokens({ density: 'compact' });
    const spacious = generateLayoutTokens({ density: 'spacious' });
    expect(parseFloat(compact['--space-4'])).toBeLessThan(parseFloat(spacious['--space-4']));
  });

  it('collapses radius to zero for a sharp theme', () => {
    // A "sharp" theme with rounded cards is not sharp. This is the token that
    // makes a terminal-style theme possible without touching a component.
    const sharp = generateLayoutTokens({ radius: 'sharp' });
    expect(parseFloat(sharp['--radius-md'])).toBe(0);
  });

  it('emits valid CSS on :root only', () => {
    const css = buildLayoutStylesheet();
    expect(css.startsWith(':root{')).toBe(true);
    // These do not vary by mode, so they must not appear in a mode block —
    // duplicating them is how the two drift apart.
    expect(css.includes('[data-theme=')).toBe(false);
  });

  it('defaults to comfortable, soft and the default scale', () => {
    expect(LAYOUT_DEFAULTS).toEqual({
      density: 'comfortable',
      radius: 'soft',
      typeScale: 'default',
    });
  });
});
