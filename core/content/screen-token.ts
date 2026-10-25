import 'server-only';
import { createHash } from 'node:crypto';
import type { CMSState } from '@/cms/types/cms';

/**
 * Refusing a save made from a screen that is out of date.
 *
 * Every editing screen loads part of the draft, keeps edits local, and writes
 * that part back on Save. The write itself is revision-checked, but against
 * the revision the *action* just read — so it only ever caught a millisecond
 * race. A screen left open in one tab while the same list was saved from
 * another tab (or a phone) would overwrite that save wholesale, silently.
 *
 * The fix is a token: a fingerprint of exactly the part of the draft a screen
 * edits, handed to the screen when it renders and sent back with the save. If
 * the stored part no longer matches, somebody else changed it and nothing is
 * written. Fingerprinting the *part* rather than using the document revision
 * is deliberate: saving Brands in one tab must not make an open Projects
 * screen in another refuse to save — they cannot overwrite each other.
 */

const SITE_FIELDS = [
  'fullName',
  'role',
  'location',
  'email',
  'whatsappNumber',
  'whatsappFormatted',
  'whatsappUrl',
  'availabilityStatus',
  'aboutHeading',
  'aboutStoryParagraphs',
  'language',
] as const;

const APPEARANCE_FIELDS = [
  'themeId',
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

function pick(source: object | undefined, fields: readonly string[]): Record<string, unknown> {
  const record = (source ?? {}) as Record<string, unknown>;
  return Object.fromEntries(fields.map((field) => [field, record[field] ?? null]));
}

/** Each screen's part of the draft, and the words for it in a refusal. */
const SLICES = {
  projects: { label: 'your projects', read: (s: CMSState) => s.projects },
  caseStudies: { label: 'your case studies', read: (s: CMSState) => s.caseStudies },
  brands: { label: 'your brands', read: (s: CMSState) => s.brands },
  experience: { label: 'your experience', read: (s: CMSState) => s.experience },
  education: { label: 'your education', read: (s: CMSState) => s.education },
  processSteps: { label: 'your process', read: (s: CMSState) => s.processSteps },
  capabilityGroups: { label: 'your capabilities', read: (s: CMSState) => s.capabilityGroups },
  recommendations: { label: 'your recommendations', read: (s: CMSState) => s.recommendations },
  artifacts: { label: 'your artifacts', read: (s: CMSState) => s.artifacts },
  navLinks: { label: 'the menu', read: (s: CMSState) => s.navLinks },
  pages: { label: 'your pages', read: (s: CMSState) => s.pages ?? [] },
  writing: {
    label: 'your writing',
    read: (s: CMSState) => ({ entries: s.writing ?? [], settings: s.writingSettings ?? null }),
  },
  sections: { label: 'the home page sections', read: (s: CMSState) => s.sections },
  site: { label: 'these settings', read: (s: CMSState) => pick(s.settings, SITE_FIELDS) },
  appearance: {
    label: 'the appearance',
    read: (s: CMSState) => pick(s.appearance, APPEARANCE_FIELDS),
  },
  seo: { label: 'the search settings', read: (s: CMSState) => s.seo },
  microcopy: { label: 'the interface wording', read: (s: CMSState) => s.microcopy },
  footer: {
    label: 'the footer text',
    read: (s: CMSState) => ({
      copyrightText: s.settings?.copyrightText ?? null,
      giantFooterText: s.appearance?.giantFooterText ?? null,
    }),
  },
  socialLinks: { label: 'your social links', read: (s: CMSState) => s.socialLinks },
  newsletter: { label: 'the sign-up form', read: (s: CMSState) => s.newsletter ?? null },
} satisfies Record<string, { label: string; read: (state: CMSState) => unknown }>;

export type ScreenSlice = keyof typeof SLICES;

/**
 * JSON with object keys sorted. The token handed back after a save is taken
 * from the object just written, and the next save compares it with a fresh
 * read — and Postgres `jsonb` does not keep key order. Plain `JSON.stringify`
 * would make the second save from the same screen look stale.
 */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.keys(v as Record<string, unknown>)
            .sort()
            .map((k) => [k, (v as Record<string, unknown>)[k]])
        )
      : v
  );
}

export function screenToken(state: CMSState, slice: ScreenSlice): string {
  const value = SLICES[slice].read(state) ?? null;
  return createHash('sha256').update(canonical(value)).digest('hex').slice(0, 32);
}

/**
 * The refusal, or `null` when the save may go ahead.
 *
 * A save that carries no token is let through as it always was — an older
 * tab open across an update keeps working rather than refusing every save.
 */
export function staleTokenError(label: string, actual: string, expected: unknown): string | null {
  if (typeof expected !== 'string' || expected === '') return null;
  if (actual === expected) return null;
  return (
    `Someone changed ${label} somewhere else — another tab or another device — ` +
    `after this screen was opened, so nothing was written. Reload to see the current version, ` +
    `then make your change again.`
  );
}

export function staleScreenError(
  state: CMSState,
  slice: ScreenSlice,
  expected: unknown
): string | null {
  return staleTokenError(SLICES[slice].label, screenToken(state, slice), expected);
}
