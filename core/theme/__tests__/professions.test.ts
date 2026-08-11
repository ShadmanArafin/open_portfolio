import { describe, expect, it } from 'vitest';
import { PROFESSIONS } from '@/cms/data/professions';
import { THEME_PRESETS } from '../presets';

/**
 * Profession packs, against the things they now point at.
 *
 * They used to rename headings and nothing else, which is why the SEO research
 * classified per-profession landing pages as Google's own doorway-page example:
 * six pages backed by six sets of renamed headings against one theme are six
 * copies of one page. Carrying a theme and a writing label is what starts to
 * make them different products rather than different words.
 */

describe.each(PROFESSIONS.map((p) => [p.id, p] as const))('the %s pack', (id, pack) => {
  it('names a theme that exists', () => {
    // A typo here is silent: `getThemePreset` falls back to the default, and
    // every profession quietly starts on the same theme again.
    expect(THEME_PRESETS.map((t) => t.id)).toContain(pack.themeId);
  });

  it('says what this person calls their writing', () => {
    expect(pack.writingLabel.length).toBeGreaterThan(2);
  });

  it('describes itself concretely enough to choose', () => {
    expect(pack.name.length).toBeGreaterThan(2);
    expect(pack.example.length).toBeGreaterThan(5);
  });

  it('renames rather than restructures', () => {
    // Switching packs must be safe at any point, which is only true while a
    // pack cannot move or drop anything somebody has written.
    for (const label of Object.values(pack.sectionLabels)) {
      expect(typeof label).toBe('string');
    }
  });
});

describe('the set', () => {
  it('covers seven distinct audiences', () => {
    expect(PROFESSIONS.length).toBe(7);
    expect(new Set(PROFESSIONS.map((p) => p.id)).size).toBe(7);
  });

  it('does not start every profession on the same theme', () => {
    // The entire point. One theme across all of them is the complaint the
    // market research called our weakest point.
    expect(new Set(PROFESSIONS.map((p) => p.themeId)).size).toBeGreaterThanOrEqual(4);
  });

  it('gives them genuinely different words for writing', () => {
    expect(new Set(PROFESSIONS.map((p) => p.writingLabel)).size).toBeGreaterThanOrEqual(5);
  });
});
