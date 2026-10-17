import { describe, expect, it } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { WRITING_DEFAULTS } from '@/core/writing/schema';
import {
  applyWelcomeAnswers,
  isWelcomePlaceholder,
  WELCOME_ACCENTS,
  WELCOME_NAME_PLACEHOLDER,
  type WelcomeAnswers,
} from '../welcome';

const state = () => structuredClone(INITIAL_CMS_STATE);

const answers = (overrides: Partial<WelcomeAnswers> = {}): WelcomeAnswers => ({
  fullName: 'Jane Doe',
  role: 'Product Designer',
  location: 'Remote',
  email: 'jane@example.com',
  profession: 'designer',
  accent: WELCOME_ACCENTS[1],
  ...overrides,
});

describe('first-run answers', () => {
  it('recognises the seed placeholder and nothing else', () => {
    expect(isWelcomePlaceholder(WELCOME_NAME_PLACEHOLDER)).toBe(true);
    expect(isWelcomePlaceholder('Jane Doe')).toBe(false);
    expect(isWelcomePlaceholder(undefined)).toBe(false);
    expect(isWelcomePlaceholder('')).toBe(false);
  });

  it('writes the answers and their derived fields, leaving the input untouched', () => {
    const before = state();
    const snapshot = structuredClone(before);

    const after = applyWelcomeAnswers(before, answers());

    expect(before).toEqual(snapshot);
    expect(after.settings.fullName).toBe('Jane Doe');
    expect(after.settings.role).toBe('Product Designer');
    expect(after.settings.location).toBe('Remote');
    expect(after.settings.email).toBe('jane@example.com');
    // First name, shouted, for the giant footer — and the author byline.
    expect(after.appearance.giantFooterText).toBe('JANE');
    expect(after.seo.author).toBe('Jane Doe');
    expect(after.seo.siteTitle).toBe('Jane Doe — Product Designer');
    expect(after.appearance.accentDark).toBe(WELCOME_ACCENTS[1].dark);
    expect(after.appearance.accentLight).toBe(WELCOME_ACCENTS[1].light);
  });

  it('never freezes fields that are meant to stay derived', () => {
    const before = state();
    const originalCopyright = before.settings.copyrightText;
    const originalTemplate = before.seo.titleTemplate;

    const after = applyWelcomeAnswers(before, answers());

    // Writing these now would contradict Settings the first time the name
    // changes. They must be exactly as they were.
    expect(after.settings.copyrightText).toBe(originalCopyright);
    expect(after.seo.titleTemplate).toBe(originalTemplate);
  });

  it('leaves fields the person did not answer alone', () => {
    const after = applyWelcomeAnswers(
      state(),
      answers({ role: '', location: '', email: '', fullName: 'Jane Doe' })
    );

    const original = state();
    expect(after.settings.location).toBe(original.settings.location);
    expect(after.settings.email).toBe(original.settings.email);
    // Name given, role not: the title keeps the existing role rather than
    // composing a dangling em-dash.
    expect(after.seo.siteTitle).toBe(`Jane Doe — ${original.settings.role}`);
  });

  it('applies the profession preset by renaming only', () => {
    const after = applyWelcomeAnswers(state(), answers({ profession: 'photographer' }));

    expect(after.appearance.themeId).toBe('gallery');
    expect(after.writingSettings?.label).toBe('Journal');
    expect(after.writingSettings?.slug).toBe('writing');
    expect(after.writingSettings?.order).toBe('curated');
    expect(after.writingSettings?.showDates).toBe(false);

    const work = after.sections.find((s) => s.id === 'work');
    expect(work?.label).toBe('Portfolio');

    // Microcopy overrides land only on keys the closed set already has.
    expect(after.microcopy.readCaseStudy).toBe('BEHIND THE SHOOT');
    expect(Object.keys(after.microcopy)).toEqual(Object.keys(state().microcopy));
  });

  it('does not switch writing on just because a preset names it', () => {
    const off = state();
    off.writingSettings = { ...WRITING_DEFAULTS, enabled: false };
    expect(applyWelcomeAnswers(off, answers()).writingSettings?.enabled).toBe(false);

    const on = state();
    on.writingSettings = { ...WRITING_DEFAULTS, enabled: true };
    expect(applyWelcomeAnswers(on, answers()).writingSettings?.enabled).toBe(true);
  });

  it('keeps every collection untouched', () => {
    const after = applyWelcomeAnswers(state(), answers());
    const before = state();

    expect(after.projects).toEqual(before.projects);
    expect(after.caseStudies).toEqual(before.caseStudies);
    expect(after.pages).toEqual(before.pages);
    expect(after.media).toEqual(before.media);
  });
});
