import 'server-only';
import type { AppearanceSettings } from '@/cms/types/cms';
import { getThemePreset, type ThemePreset } from './presets';
import type { LayoutInputs } from './layout-tokens';
import type { ThemeInputs } from './tokens';

/**
 * The concrete values to render with: the chosen theme, with the owner's own
 * changes on top.
 *
 * Non-empty wins, empty defers to the theme. That direction matters — the
 * alternative is copying a theme's values into the site's settings when it is
 * chosen, which works until the theme is improved and every existing site keeps
 * the old numbers forever. This project has already shipped that bug twice, in
 * the page-title template and the footer copyright.
 */

export interface ResolvedAppearance {
  preset: ThemePreset;
  dark: ThemeInputs;
  light: ThemeInputs;
  layout: LayoutInputs;
  fonts: { display: string; body: string; mono: string };
}

const pick = (override: string | undefined, fallback: string): string =>
  override?.trim() ? override.trim() : fallback;

export function resolveAppearance(appearance: AppearanceSettings): ResolvedAppearance {
  const preset = getThemePreset(appearance.themeId);
  const c = preset.colours;

  return {
    preset,
    dark: {
      accent: pick(appearance.accentDark, c.accentDark),
      background: pick(appearance.backgroundDark, c.backgroundDark),
      stroke: pick(appearance.strokeDark, c.strokeDark),
    },
    light: {
      accent: pick(appearance.accentLight, c.accentLight),
      background: pick(appearance.backgroundLight, c.backgroundLight),
      stroke: pick(appearance.strokeLight, c.strokeLight),
    },
    layout: preset.layout,
    fonts: {
      display: pick(appearance.displayFontFamily, preset.fonts.display),
      body: pick(appearance.bodyFontFamily, preset.fonts.body),
      mono: pick(appearance.monoFontFamily, preset.fonts.mono),
    },
  };
}

/**
 * The same shape `buildThemeStylesheet` and the contrast audit already take.
 *
 * Lets both keep working on a plain `AppearanceSettings` while the theme
 * supplies anything the owner has not set — so the publish-time contrast gate
 * checks what will actually render rather than what was stored.
 */
export function flattenAppearance(appearance: AppearanceSettings): AppearanceSettings {
  const resolved = resolveAppearance(appearance);
  return {
    ...appearance,
    accentDark: resolved.dark.accent,
    backgroundDark: resolved.dark.background,
    strokeDark: resolved.dark.stroke,
    accentLight: resolved.light.accent,
    backgroundLight: resolved.light.background,
    strokeLight: resolved.light.stroke,
    displayFontFamily: resolved.fonts.display,
    bodyFontFamily: resolved.fonts.body,
    monoFontFamily: resolved.fonts.mono,
  };
}
