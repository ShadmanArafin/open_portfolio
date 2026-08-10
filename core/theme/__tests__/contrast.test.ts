import { describe, expect, it } from 'vitest';
import { checkContrast, contrastRatio, parseHex, readableForeground, toHex } from '../contrast';

describe('parseHex', () => {
  it('reads both shorthand and full form, with or without a hash', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHex('#35F2B3')).toEqual({ r: 53, g: 242, b: 179 });
  });

  it('returns null for anything that is not a colour', () => {
    // The appearance editor lets people type freely, so this is a real input.
    expect(parseHex('rebeccapurple')).toBeNull();
    expect(parseHex('#12345')).toBeNull();
    expect(parseHex('')).toBeNull();
  });
});

describe('contrastRatio', () => {
  it('matches the values WCAG defines at the extremes', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    expect(Math.round(contrastRatio(black, white) * 100) / 100).toBe(21);
    expect(contrastRatio(white, white)).toBe(1);
  });

  it('is symmetrical', () => {
    const a = parseHex('#35F2B3')!;
    const b = parseHex('#0D0F0F')!;
    expect(contrastRatio(a, b)).toBe(contrastRatio(b, a));
  });
});

describe('readableForeground', () => {
  it('picks dark text on a light background and light on a dark one', () => {
    expect(toHex(readableForeground(parseHex('#FFFFFF')!))).toBe('#0d0f0f');
    expect(toHex(readableForeground(parseHex('#0D0F0F')!))).toBe('#ffffff');
  });

  it('puts dark text on the default mint accent', () => {
    // The case that matters: a bright accent needs dark text, and getting it
    // wrong is exactly the mistake a non-designer would ship.
    expect(toHex(readableForeground(parseHex('#35F2B3')!))).toBe('#0d0f0f');
  });

  it('always returns a foreground that passes for large text', () => {
    for (const hex of ['#35F2B3', '#FBBF24', '#BE123C', '#6D28D9', '#94A3B8', '#000000']) {
      const bg = parseHex(hex)!;
      expect(contrastRatio(readableForeground(bg), bg)).toBeGreaterThan(3);
    }
  });
});

describe('checkContrast', () => {
  it('passes a combination that is genuinely readable', () => {
    const result = checkContrast('#FFFFFF', '#0D0F0F');
    expect(result?.passes).toBe(true);
    expect(result?.suggestion).toBeUndefined();
  });

  it('fails a combination that is not, and offers a fix', () => {
    // Mid-grey on white: the classic "looks elegant, cannot be read" choice.
    const result = checkContrast('#999999', '#FFFFFF');
    expect(result?.passes).toBe(false);
    expect(result?.suggestion).toBeTruthy();
  });

  it('offers a suggestion that actually passes', () => {
    // A suggestion that still fails would be worse than none at all.
    const result = checkContrast('#999999', '#FFFFFF');
    const fixed = checkContrast(result!.suggestion!, '#FFFFFF');
    expect(fixed?.passes).toBe(true);
  });

  it('is more permissive for large text than for body text', () => {
    const body = checkContrast('#767676', '#FFFFFF', 'body');
    const large = checkContrast('#767676', '#FFFFFF', 'large');
    expect(large!.required).toBe(3);
    expect(body!.required).toBe(4.5);
    expect(large!.passes).toBe(true);
  });

  it('returns null rather than guessing when the input is not a colour', () => {
    expect(checkContrast('not a colour', '#FFFFFF')).toBeNull();
  });
});
