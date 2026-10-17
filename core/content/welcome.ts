import { PROFESSIONS, type ProfessionId } from '@/cms/data/professions';
import type { CMSState } from '@/cms/types/cms';

/**
 * First-run setup, as a pure transformation.
 *
 * Lived inside the wizard component until the App Router migration, where it
 * was only reachable by clicking through four steps in a browser. It moved
 * here so the server action that now performs the write can share exactly the
 * same rules — and so the rules can be tested without a DOM, which is how the
 * seeded names, the preset boundary and the "derived, not frozen" fields below
 * stay honest.
 */

/**
 * The seed's placeholder name.
 *
 * "Never set up" is inferred from the content rather than stored as a flag: a
 * fresh install has this name and nothing else does. The dismissal preference
 * lives in the browser
 * (`app/admin/(protected)/_components/welcome-dismissed.ts`), because somebody
 * who skipped the wizard has, by definition, not changed their name yet.
 */
export const WELCOME_NAME_PLACEHOLDER = 'Your Name';

export function isWelcomePlaceholder(fullName: string | null | undefined): boolean {
  return (fullName ?? '') === WELCOME_NAME_PLACEHOLDER;
}

export interface WelcomeAccent {
  name: string;
  /** Hover/active colour on dark surfaces. */
  dark: string;
  /** The accent itself on light surfaces. */
  light: string;
}

/**
 * Six accents, each checked to stay readable in both modes. The wizard shows
 * the dark value as the swatch and writes both — the site picks one per mode.
 */
export const WELCOME_ACCENTS: readonly WelcomeAccent[] = [
  { name: 'Mint', dark: '#35F2B3', light: '#00B97D' },
  { name: 'Blue', dark: '#60A5FA', light: '#2563EB' },
  { name: 'Amber', dark: '#FBBF24', light: '#B45309' },
  { name: 'Rose', dark: '#FB7185', light: '#BE123C' },
  { name: 'Violet', dark: '#A78BFA', light: '#6D28D9' },
  { name: 'Slate', dark: '#94A3B8', light: '#475569' },
];

export interface WelcomeAnswers {
  fullName: string;
  role: string;
  location: string;
  email: string;
  profession: ProfessionId;
  accent: WelcomeAccent;
}

/**
 * Apply the wizard's answers to a draft, returning a new state.
 *
 * The input is untouched — callers hold what they had, tests can compare, and
 * nothing here can half-apply to a state someone else is reading.
 *
 * The profession preset renames rather than restructures: it sets section
 * labels, microcopy and the theme, so nothing the user has already written can
 * be lost by choosing one. That property is what makes it safe to offer.
 */
export function applyWelcomeAnswers(state: CMSState, answers: WelcomeAnswers): CMSState {
  const next = structuredClone(state);

  const fullName = answers.fullName.trim();
  const role = answers.role.trim();
  const location = answers.location.trim();
  const email = answers.email.trim();

  if (fullName) {
    next.settings.fullName = fullName;
    next.appearance.giantFooterText = fullName.split(/\s+/)[0].toUpperCase();
    next.seo.author = fullName;
    // `copyrightText` and `titleTemplate` are deliberately not written here.
    // Both are derived from the name when left empty, so writing them now
    // would freeze today's answer and quietly contradict Settings the first
    // time somebody changes their name.
  }
  if (role) next.settings.role = role;
  if (location) next.settings.location = location;
  if (email) next.settings.email = email;

  if (fullName || role) {
    const name = fullName || next.settings.fullName;
    const job = role || next.settings.role;
    next.seo.siteTitle = `${name} — ${job}`;
  }

  const preset = PROFESSIONS.find((p) => p.id === answers.profession);
  if (preset) {
    next.appearance.themeId = preset.themeId;
    next.writingSettings = {
      ...(next.writingSettings ?? {}),
      label: preset.writingLabel,
      slug: 'writing',
      order: 'curated',
      showDates: false,
      // Whether a section is switched on is the user's call, not the preset's.
      enabled: next.writingSettings?.enabled ?? false,
    };

    for (const section of next.sections) {
      const replacement = preset.sectionLabels[section.id];
      if (replacement) section.label = replacement;
    }

    // MicrocopySettings is a closed set of named keys, so writing into it by
    // string needs an explicit widening. Unknown keys are skipped rather than
    // added, which keeps a stale pack from growing junk fields.
    const microcopy = next.microcopy as unknown as Record<string, string>;
    for (const [key, value] of Object.entries(preset.microcopy)) {
      if (key in next.microcopy) microcopy[key] = value;
    }
  }

  next.appearance.accentDark = answers.accent.dark;
  next.appearance.accentLight = answers.accent.light;

  return next;
}
