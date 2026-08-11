import 'server-only';
import { getTransporter, resolveTransportWithStored } from './transport';
import { isDemoMode } from '@/core/demo/config';

/**
 * The only place this codebase sends mail.
 *
 * Returns a value for every outcome and throws for none. A notification is
 * strictly less important than the thing it notifies about — an enquiry that
 * is already stored must not be lost because a mail server refused a
 * connection — so callers are given a result to record, not an exception to
 * remember to catch.
 */

/**
 * The longest an email address can be: RFC 5321's 64-character local part, an
 * `@`, and a 255-character domain. Lives here so every endpoint that takes an
 * address from a stranger bounds it the same way — an unbounded one becomes an
 * unbounded row in whatever it is written to.
 */
export const MAX_EMAIL_LENGTH = 320;

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** The enquirer's address, so the owner can just hit reply. */
  replyTo?: string;
}

export type SendResult =
  { ok: true } | { ok: false; reason: 'not-configured' | 'failed'; detail: string };

export async function sendMail(input: MailInput): Promise<SendResult> {
  // Never from a demo. A public contact form that sends mail from a real
  // domain is a spam relay within a day of being noticed, and it is the easiest
  // of the demo restrictions to forget because nothing visibly breaks.
  if (isDemoMode()) {
    return {
      ok: false,
      reason: 'not-configured',
      detail: 'Sending email is switched off in the demo.',
    };
  }

  const transport = await resolveTransportWithStored();
  if (transport.kind === 'none') {
    return { ok: false, reason: 'not-configured', detail: transport.reason };
  }

  try {
    await getTransporter(transport.config).sendMail({
      from: transport.config.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: 'failed',
      detail: err instanceof Error ? err.message : 'The mail server rejected the message.',
    };
  }
}
