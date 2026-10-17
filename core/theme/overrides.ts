import type { AppearanceSettings } from '@/cms/types/cms';

/**
 * Theme overrides, as a rule rather than a habit.
 *
 * Every colour and font field in Appearance is an *override* of the chosen
 * theme. Choosing a theme clears them, deliberately: leaving them behind is
 * how "switch theme" becomes a button that appears to do nothing — the new
 * theme is selected, every value it wanted is shadowed by the old one, and
 * the site looks identical.
 *
 * The rule lived inline in the settings component until the migration; it is
 * here so the screen and its tests share one definition, and so the list of
 * overridable fields is written down once.
 */

export const THEME_OVERRIDE_KEYS = [
  'accentDark',
  'accentLight',
  'backgroundDark',
  'backgroundLight',
  'strokeDark',
  'strokeLight',
  'displayFontFamily',
  'bodyFontFamily',
  'monoFontFamily',
] as const;

export type ThemeOverrideKey = (typeof THEME_OVERRIDE_KEYS)[number];

/** Which override fields currently hold anything — what switching would lose. */
export function listThemeOverrides(
  appearance: Partial<AppearanceSettings> | undefined | null
): ThemeOverrideKey[] {
  if (!appearance) return [];
  return THEME_OVERRIDE_KEYS.filter((key) => Boolean(appearance[key]));
}

/**
 * The appearance after choosing a theme: the theme id, every override cleared.
 *
 * The input is untouched — callers keep what they had, and the confirmation
 * dialog can count what is about to be lost from the same value the clear
 * would have used.
 */
export function applyThemeChoice(
  appearance: AppearanceSettings,
  themeId: string
): AppearanceSettings {
  const next: AppearanceSettings = { ...appearance, themeId };
  for (const key of THEME_OVERRIDE_KEYS) {
    next[key] = '';
  }
  return next;
}
