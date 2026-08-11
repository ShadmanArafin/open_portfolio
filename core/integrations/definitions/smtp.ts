import 'server-only';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { registerIntegration, type TestResult } from '../registry';

/**
 * Sending mail.
 *
 * The first integration, and the one the abstraction was designed against: it
 * has secrets, it has a real failure surface, it can be genuinely tested, and
 * without it two features of the site quietly stop working rather than break
 * visibly. If the registry shape cannot describe this honestly it cannot
 * describe anything.
 */

export const smtpSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().positive().max(65535),
  secure: z.boolean(),
  user: z.string().optional(),
  password: z.string().optional(),
  from: z.string().min(1),
});

export type SmtpSettings = z.infer<typeof smtpSchema>;

/**
 * Turns a connection failure into something the owner can act on.
 *
 * `ECONNREFUSED 587` tells whoever wrote the code exactly what happened, and
 * tells the person who has to fix it nothing at all. Every branch here is a
 * mistake somebody actually makes.
 */
function explain(error: unknown): string {
  const err = error as { code?: string; responseCode?: number; message?: string };
  const code = err?.code ?? '';

  if (code === 'EAUTH' || err?.responseCode === 535) {
    return 'The mail server rejected that username and password. If your provider uses two-factor sign-in, you usually need an "app password" rather than your normal one.';
  }
  if (code === 'ECONNREFUSED') {
    return 'Nothing answered at that address and port. Check the server name, and try port 587 if you are not sure.';
  }
  if (code === 'ETIMEDOUT' || code === 'ESOCKET') {
    return 'The connection timed out. Some hosts block outgoing mail on port 25 — 587 or 465 usually work.';
  }
  if (code === 'ENOTFOUND' || code === 'EDNS') {
    return 'That server name could not be found. Check it for typos.';
  }
  if (code === 'ESOCKETTIMEDOUT') {
    return 'The mail server accepted the connection and then stopped responding.';
  }
  return err?.message
    ? `The mail server said: ${err.message}`
    : 'Could not reach the mail server, and it did not say why.';
}

registerIntegration<SmtpSettings>({
  id: 'smtp',
  name: 'Email (SMTP)',
  category: 'email',
  summary:
    'Sends you a note when somebody uses your contact form, and lets you reset your password.',

  freeTier: {
    summary:
      'Brevo sends 300 emails a day free and does not ask for a card. Most email providers also work — Gmail needs an app password.',
    verifiedOn: '2026-08-11',
  },
  docsUrl: 'https://www.brevo.com/free-smtp-server/',
  setup: [
    'Make a free Brevo account, or use the mail provider you already have.',
    'Find its SMTP settings — a server name, a port, a username and a password.',
    'Paste them in below. If you are unsure about the port, try 587.',
    'Press Test. It will tell you what is wrong if anything is.',
  ],

  fields: [
    { name: 'host', label: 'Server name', kind: 'text', placeholder: 'smtp-relay.brevo.com' },
    {
      name: 'port',
      label: 'Port',
      kind: 'number',
      placeholder: '587',
      help: 'Almost always 587. Use 465 only if your provider says to.',
    },
    {
      name: 'secure',
      label: 'This port needs TLS from the start',
      kind: 'toggle',
      help: 'Leave this off unless you are using port 465.',
    },
    { name: 'user', label: 'Username', kind: 'text', optional: true },
    { name: 'password', label: 'Password', kind: 'password', optional: true },
    {
      name: 'from',
      label: 'Send from',
      kind: 'text',
      placeholder: 'you@yourdomain.com',
      help: 'Most providers will only send from an address you have proved you own.',
    },
  ],
  secretFields: ['password'],

  schema: smtpSchema,

  degradation:
    'Without this, contact form messages still arrive in your inbox here, but nothing tells you they have — and you cannot reset your password by email.',

  configuredByEnv: (env) => Boolean(env.OPB_SMTP_HOST?.trim()),

  async test(config): Promise<TestResult> {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user ? { user: config.user, pass: config.password ?? '' } : undefined,
      // Short, because this runs while somebody watches a spinner. A test that
      // takes thirty seconds to fail gets clicked twice and then abandoned.
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
    });

    try {
      await transporter.verify();
      return { ok: true, message: 'Connected and signed in. Mail from this site will send.' };
    } catch (err) {
      return { ok: false, message: explain(err) };
    } finally {
      transporter.close();
    }
  },
});
