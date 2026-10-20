import { describe, expect, it } from 'vitest';
import { normaliseLanguage, siteLanguage } from '@/core/content/language';

describe('site language', () => {
  it('canonicalises real tags', () => {
    expect(normaliseLanguage('bn')).toBe('bn');
    expect(normaliseLanguage(' pt-br ')).toBe('pt-BR');
    expect(normaliseLanguage('ZH-hant-tw')).toBe('zh-Hant-TW');
  });

  it('treats empty as "use the default" and refuses non-tags', () => {
    expect(normaliseLanguage('')).toBe('');
    expect(normaliseLanguage('English please')).toBeNull();
    expect(normaliseLanguage('en"><script>')).toBeNull();
    expect(normaliseLanguage(42)).toBeNull();
  });

  it('falls back to English for content written before the setting existed', () => {
    expect(siteLanguage(undefined)).toBe('en');
    expect(siteLanguage({})).toBe('en');
    expect(siteLanguage({ language: 'not a tag' })).toBe('en');
    expect(siteLanguage({ language: 'es' })).toBe('es');
  });
});
