import { describe, expect, it } from 'vitest';
import {
  FRAME_DEFAULT,
  resolveFrame,
  SPACING_STYLE,
  SURFACE_STYLE,
  WIDTH_STYLE,
  type BlockFrame,
} from '../frame';

describe('resolveFrame', () => {
  it('fills every field from a partial frame', () => {
    // Stored blocks predate fields added later, so a partial frame is the
    // normal case rather than an error.
    const resolved = resolveFrame({ surface: 'accent' });
    expect(resolved.surface).toBe('accent');
    expect(resolved.width).toBe(FRAME_DEFAULT.width);
    expect(resolved.spacing).toBe(FRAME_DEFAULT.spacing);
    expect(resolved.divider).toBe(FRAME_DEFAULT.divider);
    expect(resolved.align).toBe(FRAME_DEFAULT.align);
  });

  it('survives no frame at all', () => {
    expect(resolveFrame()).toEqual(FRAME_DEFAULT);
  });

  it('does not mutate the default', () => {
    resolveFrame({ surface: 'inverted' });
    expect(FRAME_DEFAULT.surface).toBe('canvas');
  });
});

describe('the frame vocabulary', () => {
  it('pairs every surface with a foreground', () => {
    // This is what makes `surface: 'accent'` safe. A background without its
    // matching text colour is how mint-on-mint happens.
    for (const [name, style] of Object.entries(SURFACE_STYLE)) {
      expect(style.background, name).toBeTruthy();
      expect(style.color, name).toBeTruthy();
      expect(style.background, name).not.toBe(style.color);
    }
  });

  it('resolves every value through a token, never a literal', () => {
    // A hex value or a pixel here would be invisible to the theme, and the
    // block/theme contract leaks the moment one exists.
    const values = [
      ...Object.values(SURFACE_STYLE).flatMap((s) => [s.background, s.color]),
      ...Object.values(WIDTH_STYLE),
      ...Object.values(SPACING_STYLE),
    ];
    for (const value of values) {
      const isToken = value.startsWith('var(--');
      const isNeutral = value === '0' || value === '100%';
      expect(isToken || isNeutral, value).toBe(true);
    }
  });

  it('covers every enum member with a style', () => {
    // A missing entry renders as `undefined` and the element silently loses
    // its width or padding.
    const widths: BlockFrame['width'][] = ['full-bleed', 'wide', 'default', 'narrow'];
    const spacings: BlockFrame['spacing'][] = ['none', 'tight', 'default', 'loose'];
    const surfaces: BlockFrame['surface'][] = ['canvas', 'raised', 'sunken', 'accent', 'inverted'];

    for (const w of widths) expect(WIDTH_STYLE[w]).toBeTruthy();
    for (const s of spacings) expect(SPACING_STYLE[s]).toBeDefined();
    for (const s of surfaces) expect(SURFACE_STYLE[s]).toBeTruthy();
  });

  it('exposes no way to express a colour or a pixel', () => {
    // The whole safety argument rests on this: the frame is enums only, so
    // there is no path from the interface to "20px purple Comic Sans".
    const frame: BlockFrame = FRAME_DEFAULT;
    const keys = Object.keys(frame);
    expect(keys.sort()).toEqual(['align', 'divider', 'spacing', 'surface', 'width']);
  });
});
