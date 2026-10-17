import { describe, expect, it } from 'vitest';
import type { AppearanceSettings } from '@/cms/types/cms';
import { DEFAULT_THEME_ID } from '../presets';
import { applyThemeChoice, listThemeOverrides, THEME_OVERRIDE_KEYS } from '../overrides';

const appearance = (overrides: Partial<AppearanceSettings> = {}): AppearanceSettings => ({
  themeId: DEFAULT_THEME_ID,
  accentDark: '',
  accentLight: '',
  backgroundDark: '',
  backgroundLight: '',
  strokeDark: '',
  strokeLight: '',
  displayFontFamily: '',
  bodyFontFamily: '',
  monoFontFamily: '',
  giantFooterText: '',
  ...overrides,
});

describe('theme overrides', () => {
  it('lists only the fields that hold something', () => {
    expect(listThemeOverrides({ accentDark: '#35F2B3', bodyFontFamily: 'Geist' })).toEqual([
      'accentDark',
      'bodyFontFamily',
    ]);
    expect(listThemeOverrides({})).toEqual([]);
    expect(listThemeOverrides(undefined)).toEqual([]);
  });

  it('choosing a theme clears every override and keeps everything else', () => {
    const before = appearance({
      accentDark: '#35F2B3',
      accentLight: '#00B97D',
      backgroundDark: '#0D0F0F',
      backgroundLight: '#F3F3EF',
      strokeDark: '#1B1B1B',
      strokeLight: '#DADADA',
      displayFontFamily: 'Instrument Serif',
      bodyFontFamily: 'Geist',
      monoFontFamily: 'IBM Plex Mono',
      giantFooterText: 'JANE',
    });

    const after = applyThemeChoice(before, 'terminal');

    expect(after.themeId).toBe('terminal');
    for (const key of THEME_OVERRIDE_KEYS) {
      expect(after[key]).toBe('');
    }
    // The giant footer word is not an override of the theme.
    expect(after.giantFooterText).toBe('JANE');
    // And the input is untouched: the dialog counted what to lose from it.
    expect(before.accentDark).toBe('#35F2B3');
  });

  it('a switch to the same theme with no overrides is a plain id write', () => {
    const after = applyThemeChoice(appearance(), DEFAULT_THEME_ID);
    expect(after.themeId).toBe(DEFAULT_THEME_ID);
    expect(listThemeOverrides(after)).toEqual([]);
  });
});
