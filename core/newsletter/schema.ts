import { z } from 'zod';

/**
 * Collecting email addresses, and nothing more.
 *
 * Capture only: this stores who asked to hear from you and lets you export
 * them. It does not send. Broadcasting is a different product with different
 * obligations — deliverability, bounce handling, list hygiene, an unsubscribe
 * link that works on the first click — and shipping half of it would leave
 * somebody with a list they cannot legally or practically mail.
 *
 * **Double opt-in is not optional.** Anyone can type anyone's address into a
 * form on the internet. Without confirmation a list is a mix of real
 * subscribers and people who never asked, and mailing that list is how a
 * domain's reputation is destroyed. It is also what GDPR means by consent.
 *
 * The tokens are hashed for the same reason session tokens are: a leaked
 * database should not hand somebody the ability to confirm or unsubscribe
 * anybody.
 */

export const subscriberStatus = z.enum(['pending', 'confirmed', 'unsubscribed']);

export const subscriberSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  status: subscriberStatus,
  /** SHA-256 of the confirmation token. Never the token. */
  confirmTokenHash: z.string().optional(),
  /** SHA-256 of the unsubscribe token, kept for the life of the record. */
  unsubscribeTokenHash: z.string().optional(),
  requestedAt: z.string(),
  confirmedAt: z.string().optional(),
  unsubscribedAt: z.string().optional(),
  /** Which page they signed up from. Useful, and not personal. */
  source: z.string().optional(),
});

export type Subscriber = z.infer<typeof subscriberSchema>;

export const newsletterSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  /** Shown above the form. "Occasional notes about what I'm making." */
  pitch: z.string().default(''),
  buttonLabel: z.string().default('Subscribe'),
  /** What they see after asking, before confirming. */
  pendingMessage: z
    .string()
    .default('Almost there — check your email and click the link to confirm.'),
});

export type NewsletterSettings = z.infer<typeof newsletterSettingsSchema>;

export const NEWSLETTER_DEFAULTS: NewsletterSettings = {
  enabled: false,
  pitch: '',
  buttonLabel: 'Subscribe',
  pendingMessage: 'Almost there — check your email and click the link to confirm.',
};

/**
 * A pending subscriber that has never confirmed is not a subscriber.
 *
 * Kept for a week so somebody who finds the email on Friday can still use it,
 * then dropped — an unbounded list of unconfirmed addresses is a list of people
 * who did not consent, sitting in a database, indefinitely.
 */
export const PENDING_TTL_DAYS = 7;

export function isStalePending(subscriber: Subscriber, now: Date = new Date()): boolean {
  if (subscriber.status !== 'pending') return false;
  const asked = Date.parse(subscriber.requestedAt);
  if (!Number.isFinite(asked)) return true;
  return now.getTime() - asked > PENDING_TTL_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * The list, as a CSV.
 *
 * Confirmed subscribers only, because those are the only ones anybody may
 * lawfully mail. The columns match what Buttondown, Mailchimp and every other
 * tool expects on import, so leaving is a file download rather than a project.
 */
export function toCsv(subscribers: Subscriber[]): string {
  const rows = subscribers
    .filter((subscriber) => subscriber.status === 'confirmed')
    .map((subscriber) =>
      [subscriber.email, subscriber.confirmedAt ?? '', subscriber.source ?? '']
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    );

  return ['"email","confirmed_at","source"', ...rows].join('\n');
}

/** Normalised so `A@x.com ` and `a@x.com` cannot both be on the list. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}
