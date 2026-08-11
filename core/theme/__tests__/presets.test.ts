import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME_ID, THEME_PRESETS, fontHref, getThemePreset } from '../presets';
import { flattenAppearance, resolveAppearance } from '../resolve';
import { auditContrast, describeFailure } from '../audit';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';

/**
 * Every theme, against the gate that refuses to publish.
 *
 * This is the test that had to exist before any of these shipped. The publish
 * route runs `auditContrast` and returns 422 on failure, so a theme whose
 * palette fails it is not a theme somebody can use — it is a trap that lets
 * them pick it and then refuses to let them publish, with no obvious connection
 * between the two screens.
 *
 * It also catches the thing colour choices are worst at: looking fine in the
 * mode you happened to design in.
 */

const empty = { ...INITIAL_CMS_STATE.appearance, themeId: undefined } as const;

describe.each(THEME_PRESETS.map((p) => [p.id, p] as const))('the %s theme', (id, preset) => {
  it('passes the contrast gate in both modes', () => {
    const result = auditContrast(flattenAppearance({ ...empty, themeId: id }));
    expect(result.passes, result.failures.map(describeFailure).join('\n')).toBe(true);
  });

  it('describes itself for the picker', () => {
    expect(preset.name.length).toBeGreaterThan(2);
    expect(preset.description.length).toBeGreaterThan(15);
  });

  it('defines both modes', () => {
    // A theme that only works in dark is a preference, and the toggle in the
    // corner is not going away.
    for (const value of Object.values(preset.colours)) {
      expect(value).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('asks only for fonts we know how to load', () => {
    const href = fontHref(preset);
    for (const family of [preset.fonts.display, preset.fonts.body, preset.fonts.mono]) {
      if (!family) continue;
      expect(href, `${family} is not in GOOGLE_FONT_FAMILIES`).toContain(
        family.split(' ')[0].replace(/[^A-Za-z]/g, '')
      );
    }
  });
});

describe('the set as a whole', () => {
  it('offers more than one, which was the entire point', () => {
    expect(THEME_PRESETS.length).toBeGreaterThanOrEqual(6);
  });

  it('has unique ids and names', () => {
    expect(new Set(THEME_PRESETS.map((p) => p.id)).size).toBe(THEME_PRESETS.length);
    expect(new Set(THEME_PRESETS.map((p) => p.name)).size).toBe(THEME_PRESETS.length);
  });

  it('actually differs — no two themes are the same site with a new name', () => {
    const signatures = THEME_PRESETS.map((p) =>
      [p.colours.accentLight, p.layout.density, p.layout.radius, p.fonts.display].join('|')
    );
    expect(new Set(signatures).size).toBe(THEME_PRESETS.length);
  });

  it('falls back to the default rather than throwing on an unknown id', () => {
    // A site whose theme was renamed or removed upstream must still render.
    expect(getThemePreset('a-theme-that-was-deleted').id).toBe(DEFAULT_THEME_ID);
    expect(getThemePreset(undefined).id).toBe(DEFAULT_THEME_ID);
  });
});

describe('overrides', () => {
  it('lets the theme supply everything the owner has not set', () => {
    const resolved = resolveAppearance({ ...empty, themeId: 'terminal' });
    expect(resolved.dark.accent).toBe('#7dd3fc');
    expect(resolved.fonts.display).toBe('IBM Plex Mono');
  });

  it('lets an explicit choice win', () => {
    const resolved = resolveAppearance({ ...empty, themeId: 'terminal', accentDark: '#ff0000' });
    expect(resolved.dark.accent).toBe('#ff0000');
    // ...without disturbing anything else the theme decided.
    expect(resolved.fonts.display).toBe('IBM Plex Mono');
  });

  it('treats blank and whitespace as "not set" rather than as a colour', () => {
    const resolved = resolveAppearance({ ...empty, themeId: 'warm', accentDark: '   ' });
    expect(resolved.dark.accent).toBe('#fb923c');
  });
});
