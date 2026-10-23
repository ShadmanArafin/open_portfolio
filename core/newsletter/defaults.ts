import type { NewsletterSettings } from './schema';

/*
 * Apart from `schema.ts` so the public sign-up form, a client component, can
 * read its defaults without shipping zod to every visitor. Type-only import
 * above: it is erased at build time.
 */
export const NEWSLETTER_DEFAULTS: NewsletterSettings = {
  enabled: false,
  pitch: '',
  buttonLabel: 'Subscribe',
  pendingMessage: 'Almost there — check your email and click the link to confirm.',
};
