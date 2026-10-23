'use client';

import { useState } from 'react';
import { DEFAULT_THEME_ID, THEME_PRESETS } from '@/core/theme/presets';
import { applyThemeChoice, listThemeOverrides } from '@/core/theme/overrides';
import { GOOGLE_FONTS_LIST } from '@/utils/googleFonts';
import type { AppearanceSettings } from '@/cms/types/cms';
import { updateAppearanceAction } from '../_actions/settings';
import { ConflictNotice } from '../_components/conflict-notice';
import { useSaveShortcut, useUnsavedChanges } from '../_components/unsaved-changes';
import { UnsavedNote } from '../_components/unsaved-note';

const COLOR_FIELDS: { field: keyof AppearanceSettings; label: string; fallback: string }[] = [
  { field: 'accentDark', label: 'Accent — dark mode', fallback: '#35F2B3' },
  { field: 'accentLight', label: 'Accent — light mode', fallback: '#00B97D' },
  { field: 'backgroundDark', label: 'Background — dark mode', fallback: '#0D0F0F' },
  { field: 'backgroundLight', label: 'Background — light mode', fallback: '#F3F3EF' },
  { field: 'strokeDark', label: 'Border — dark mode', fallback: '#1B1B1B' },
  { field: 'strokeLight', label: 'Border — light mode', fallback: '#DADADA' },
];

const QUICK_PRESETS: { name: string; accentDark: string; accentLight: string; bgDark: string }[] = [
  { name: 'Emerald Mint', accentDark: '#35F2B3', accentLight: '#00B97D', bgDark: '#0D0F0F' },
  { name: 'Electric Blue', accentDark: '#3B82F6', accentLight: '#2563EB', bgDark: '#0B0F17' },
  { name: 'Magenta Rose', accentDark: '#EC4899', accentLight: '#DB2777', bgDark: '#110C13' },
  { name: 'Amber Gold', accentDark: '#F59E0B', accentLight: '#D97706', bgDark: '#12100B' },
];

const FONT_OPTIONS = GOOGLE_FONTS_LIST.map((font) => ({
  value: font.name,
  label: `${font.name} (${font.category})`,
}));

/** The label font may be left unset, which keeps the system monospace stack. */
const MONO_FONT_OPTIONS = [{ value: '', label: 'System monospace (default)' }, ...FONT_OPTIONS];

const secondary =
  'rounded-full border border-border px-4 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';
const field = 'w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary';

/**
 * Theme, colour tokens and fonts.
 *
 * Choosing a theme clears the overrides (see `core/theme/overrides.ts`), and
 * the clear is confirmed first when there is anything to lose: switching with
 * nine custom values and no warning is how an afternoon of tuning vanishes.
 * Everything else is local state and one Save, so the draft gets one write
 * instead of one per keystroke.
 */
export function AppearanceForm({
  initial,
  token: initialToken,
}: {
  initial: AppearanceSettings;
  token?: string;
}) {
  const [appearance, setAppearance] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [token, setToken] = useState(initialToken);
  const { dirty, markSaved } = useUnsavedChanges(appearance);
  const [themeToChoose, setThemeToChoose] = useState<{ id: string; kept: number } | null>(null);

  const set = (field: string, value: string) =>
    setAppearance((current) => ({ ...current, [field]: value }));

  const chooseTheme = (themeId: string) => {
    const current = appearance.themeId ?? DEFAULT_THEME_ID;
    if (themeId !== current) {
      const kept = listThemeOverrides(appearance).length;
      if (kept > 0) {
        setThemeToChoose({ id: themeId, kept });
        return;
      }
    }
    setAppearance((a) => applyThemeChoice(a, themeId));
  };

  const currentTheme = appearance.themeId ?? DEFAULT_THEME_ID;

  const save = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    setConflict(false);
    try {
      const result = await updateAppearanceAction(
        {
          themeId: appearance.themeId ?? DEFAULT_THEME_ID,
          accentDark: appearance.accentDark ?? '',
          accentLight: appearance.accentLight ?? '',
          backgroundDark: appearance.backgroundDark ?? '',
          backgroundLight: appearance.backgroundLight ?? '',
          strokeDark: appearance.strokeDark ?? '',
          strokeLight: appearance.strokeLight ?? '',
          displayFontFamily: appearance.displayFontFamily ?? '',
          bodyFontFamily: appearance.bodyFontFamily ?? '',
          monoFontFamily: appearance.monoFontFamily ?? '',
        },
        token
      );
      if (result.ok) {
        markSaved(appearance);
        if (result.token) setToken(result.token);
        setNote('Saved to your draft.');
      } else {
        setConflict(Boolean(result.conflict));
        setError(result.error ?? 'The save did not go through.');
      }
    } catch {
      setError('The save did not go through. Reload and try again.');
    } finally {
      setBusy(false);
    }
  };

  useSaveShortcut(() => void save(), !busy);
  return (
    <div className="grid gap-6">
      <section aria-label="Theme" className="grid gap-4 rounded-2xl border border-border p-4">
        <div>
          <h2 className="m-0 text-xl">Theme</h2>
          <p className="m-0 mt-1 text-sm text-text-secondary">
            A starting point for colours, spacing and type. Pick one and then change anything you
            like below — your changes always win over the theme.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {THEME_PRESETS.map((preset) => {
            const selected = preset.id === currentTheme;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => chooseTheme(preset.id)}
                aria-pressed={selected}
                className={`grid gap-2 rounded-2xl border p-3 text-left ${
                  selected ? 'border-accent' : 'border-border'
                }`}
              >
                <span className="flex gap-1">
                  {[
                    preset.colours.backgroundLight,
                    preset.colours.accentLight,
                    preset.colours.backgroundDark,
                    preset.colours.accentDark,
                  ].map((colour, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className="h-6 w-6 rounded"
                      style={{ background: colour, border: '1px solid var(--color-border)' }}
                    />
                  ))}
                </span>
                <span className="font-semibold">{preset.name}</span>
                <span className="text-sm text-text-secondary">{preset.description}</span>
                {selected ? <span className="text-xs text-accent">In use</span> : null}
              </button>
            );
          })}
        </div>

        {themeToChoose ? (
          <div className="grid gap-3 rounded-2xl border border-border bg-surface-secondary p-3">
            <p className="m-0 text-sm">
              Switching clears your {themeToChoose.kept} custom colour/font choice
              {themeToChoose.kept === 1 ? '' : 's'}.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setAppearance((a) => applyThemeChoice(a, themeToChoose.id));
                  setThemeToChoose(null);
                }}
                className="rounded-full bg-danger px-4 text-sm font-semibold text-bg"
                style={{ minHeight: 44 }}
              >
                Switch theme
              </button>
              <button
                type="button"
                onClick={() => setThemeToChoose(null)}
                className={secondary}
                style={{ minHeight: 44 }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section
        aria-label="Colour tokens"
        className="grid gap-4 rounded-2xl border border-border p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-xl">Colour tokens</h2>
          <span className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-text-muted">Presets</span>
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  set('accentDark', preset.accentDark);
                  set('accentLight', preset.accentLight);
                  set('backgroundDark', preset.bgDark);
                }}
                // A 20px swatch with a 44px hit area: the colour stays the size
                // a colour chip should be, the target is the size a thumb needs.
                className="flex h-11 w-11 items-center justify-center rounded-full"
                title={preset.name}
                aria-label={`Apply ${preset.name} preset`}
              >
                <span
                  aria-hidden
                  className="h-5 w-5 rounded-full border border-border"
                  style={{ backgroundColor: preset.accentDark }}
                />
              </button>
            ))}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {COLOR_FIELDS.map(({ field: key, label, fallback }) => {
            const value = (appearance[key] as string | undefined) ?? '';
            return (
              <div key={key} className="grid gap-2 rounded-xl border border-border p-3">
                <span className="text-sm text-text-muted">{label}</span>
                <span className="flex items-center gap-3">
                  <input
                    type="color"
                    value={value || fallback}
                    onChange={(event) => set(key, event.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-border bg-transparent"
                    aria-label={`${label} colour picker`}
                  />
                  <input
                    type="text"
                    value={value}
                    placeholder={fallback}
                    aria-label={`${label} value`}
                    onChange={(event) => set(key, event.target.value)}
                    className={`${field} flex-grow`}
                    style={{ minHeight: 44 }}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-label="Typography" className="grid gap-4 rounded-2xl border border-border p-4">
        <h2 className="m-0 text-xl">Typography</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Heading font</span>
            <select
              value={appearance.displayFontFamily || 'Instrument Serif'}
              onChange={(event) => set('displayFontFamily', event.target.value)}
              className={field}
              style={{ minHeight: 44 }}
            >
              {FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Body font</span>
            <select
              value={appearance.bodyFontFamily || 'Geist'}
              onChange={(event) => set('bodyFontFamily', event.target.value)}
              className={field}
              style={{ minHeight: 44 }}
            >
              {FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Label font</span>
            <select
              value={appearance.monoFontFamily ?? ''}
              onChange={(event) => set('monoFontFamily', event.target.value)}
              className={field}
              style={{ minHeight: 44 }}
            >
              {MONO_FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="text-text-secondary">
              Used for the small caps labels — section eyebrows, numbers and metadata.
            </span>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="rounded-full bg-text-primary px-4 text-sm font-semibold text-bg disabled:opacity-50"
          style={{ minHeight: 44 }}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        <UnsavedNote dirty={dirty} />
        {note ? (
          <p role="status" className="m-0 text-sm text-text-secondary">
            {note}
          </p>
        ) : null}
        {error ? (
          conflict ? (
            <ConflictNotice message={error} />
          ) : (
            <p role="alert" className="m-0 text-sm text-danger">
              {error}
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}
