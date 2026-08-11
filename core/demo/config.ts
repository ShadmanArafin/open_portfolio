/**
 * Demo mode.
 *
 * The launch research found that a real sandbox is the single most persuasive
 * asset an open-source project has, and that nearly every hand-maintained one
 * is dead or retired — the survivors are the ones that live in the codebase and
 * cost nothing to keep alive. So this is a product feature with a flag, not an
 * environment somebody has to tend.
 *
 * Every visitor gets their own sandbox, seeded from the same content and thrown
 * away after an hour. That is what makes it safe to leave the editor fully
 * usable: there is no shared state to vandalise, so nothing has to be read-only
 * and nobody has to be policed.
 *
 * Abuse is handled by removing surfaces rather than watching them. Outgoing
 * email is the one that matters — a public form that sends mail from your
 * domain becomes a spam relay within a day of being noticed, and it is the
 * easiest of these to forget.
 */

export function isDemoMode(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.OPB_DEMO_MODE === '1';
}

/** How long one visitor's sandbox lives. */
export const DEMO_TTL_SECONDS = 60 * 60;

/** The cookie that tells one visitor's sandbox from another's. */
export const DEMO_SESSION_COOKIE = 'opb_demo';

/**
 * Credentials shown on the sign-in screen in demo mode.
 *
 * Printed on the page rather than pre-filled, because somebody who cannot see
 * what they are signing in with does not believe they are signing in at all.
 */
export const DEMO_EMAIL = 'you@example.com';
export const DEMO_PASSPHRASE = 'try-the-editor';

/**
 * What demo mode switches off, and why.
 *
 * Written down here rather than scattered through the code so the list can be
 * reviewed as a list — which is the only way to notice one is missing.
 */
export const DEMO_RESTRICTIONS = [
  {
    id: 'email',
    label: 'Sending email',
    reason:
      'A public form that sends mail from a real domain becomes a spam relay within a day of being noticed.',
  },
  {
    id: 'uploads',
    label: 'Uploading files',
    reason: 'An open upload endpoint is free file hosting for whoever finds it first.',
  },
  {
    id: 'integrations',
    label: 'Saving service passwords',
    reason: 'There is nowhere safe to put them, and nobody should type a real one into a demo.',
  },
  {
    id: 'export',
    label: 'Exporting a backup',
    reason: 'There is nothing here worth keeping — it is thrown away in an hour anyway.',
  },
] as const;

export type DemoRestriction = (typeof DEMO_RESTRICTIONS)[number]['id'];

export function demoRestrictionMessage(id: DemoRestriction): string {
  const restriction = DEMO_RESTRICTIONS.find((r) => r.id === id);
  return restriction
    ? `${restriction.label} is switched off in the demo. ${restriction.reason}`
    : 'That is switched off in the demo.';
}
