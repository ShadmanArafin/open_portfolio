import 'server-only';
import { getTransporter, resolveTransport } from './transport';

/**
 * The only place this codebase sends mail.
 *
 * Returns a value for every outcome and throws for none. A notification is
 * strictly less important than the thing it notifies about — an enquiry that
 * is already stored must not be lost because a mail server refused a
 * connection — so callers are given a result to record, not an exception to
 * remember to catch.
 */

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
  const transport = resolveTransport();
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
