/**
 * The language a site is written in, for `<html lang>`.
 *
 * Hard-coding `en` made every portfolio written in anything else fail WCAG
 * 3.1.1: a screen reader picks its voice and pronunciation from this attribute,
 * so a Bengali or Spanish site was read aloud as if it were English. One
 * setting fixes that long before the site needs translating.
 */

export const DEFAULT_LANGUAGE = 'en';

/**
 * A BCP-47 tag in its canonical form (`pt-br` → `pt-BR`), `''` for "use the
 * default", or `null` when the value is not a language tag at all.
 */
export function normaliseLanguage(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (trimmed.length > 35) return null;
  try {
    const [canonical] = Intl.getCanonicalLocales(trimmed);
    return canonical ?? null;
  } catch {
    return null;
  }
}

export function siteLanguage(settings: { language?: string } | undefined): string {
  return normaliseLanguage(settings?.language) || DEFAULT_LANGUAGE;
}
