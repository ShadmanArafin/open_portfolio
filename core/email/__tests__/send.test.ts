import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { resetTransport } from '../transport';
import { sendMail } from '../send';
import { enquiryNotification } from '../templates';

/**
 * Against a real SMTP server, because the interesting failures — a refused
 * connection, a rejected recipient, a header that did not survive encoding —
 * are exactly the ones a mock cannot have.
 *
 *   docker run -d --name opb-mail -p 1025:1025 -p 8025:8025 axllent/mailpit
 *   TEST_MAILPIT_URL=http://localhost:8025 npx vitest run core/email
 *
 * Skipped when it is absent, the way the hosted storage tests skip without
 * credentials.
 */

const MAILPIT = process.env.TEST_MAILPIT_URL;

interface MailpitMessage {
  ID: string;
  From: { Address: string };
  To: { Address: string }[];
  Subject: string;
  ReplyTo: { Address: string }[];
}

async function inbox(): Promise<MailpitMessage[]> {
  const res = await fetch(`${MAILPIT}/api/v1/messages`);
  const body = (await res.json()) as { messages: MailpitMessage[] };
  return body.messages;
}

async function bodyOf(id: string): Promise<string> {
  const res = await fetch(`${MAILPIT}/api/v1/message/${id}`);
  const body = (await res.json()) as { Text: string };
  return body.Text;
}

const describeMail = MAILPIT ? describe : describe.skip;

describeMail('sending mail', () => {
  const previous = { ...process.env };

  beforeAll(() => {
    process.env.OPB_SMTP_HOST = 'localhost';
    process.env.OPB_SMTP_PORT = '1025';
    process.env.OPB_MAIL_FROM = 'site@example.com';
    resetTransport();
  });

  afterAll(() => {
    process.env = previous;
    resetTransport();
  });

  beforeEach(async () => {
    await fetch(`${MAILPIT}/api/v1/messages`, { method: 'DELETE' });
  });

  it('delivers a message', async () => {
    const result = await sendMail({
      to: 'owner@example.com',
      subject: 'Hello',
      text: 'A body.',
    });
    expect(result.ok).toBe(true);

    const messages = await inbox();
    expect(messages.length).toBe(1);
    expect(messages[0].Subject).toBe('Hello');
    expect(messages[0].To[0].Address).toBe('owner@example.com');
  });

  it('sets Reply-To so the owner can answer by replying', async () => {
    await sendMail({
      to: 'owner@example.com',
      subject: 'Enquiry',
      text: 'A body.',
      replyTo: 'visitor@example.com',
    });

    const messages = await inbox();
    expect(messages[0].ReplyTo[0].Address).toBe('visitor@example.com');
  });

  it('carries the whole enquiry in the plain-text body', async () => {
    const mail = enquiryNotification({
      siteName: 'My Portfolio',
      name: 'Dana',
      email: 'dana@example.com',
      company: 'Northwind',
      projectType: 'Website',
      message: 'Line one.\nLine two.',
      inboxUrl: 'https://example.com/admin/messages',
    });
    await sendMail({ to: 'owner@example.com', ...mail });

    const messages = await inbox();
    const text = await bodyOf(messages[0].ID);
    expect(text.includes('Dana')).toBe(true);
    expect(text.includes('Northwind')).toBe(true);
    expect(text.includes('Line two.')).toBe(true);
  });

  it('reports a refused connection as a value, not an exception', async () => {
    process.env.OPB_SMTP_PORT = '1';
    resetTransport();

    const result = await sendMail({ to: 'owner@example.com', subject: 'x', text: 'y' });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('unreachable');
    expect(result.reason).toBe('failed');

    process.env.OPB_SMTP_PORT = '1025';
    resetTransport();
  });
});

describe('sending mail without configuration', () => {
  it('reports not-configured rather than failing silently', async () => {
    const previous = process.env.OPB_SMTP_HOST;
    delete process.env.OPB_SMTP_HOST;
    resetTransport();

    const result = await sendMail({ to: 'owner@example.com', subject: 'x', text: 'y' });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('unreachable');
    expect(result.reason).toBe('not-configured');

    if (previous) process.env.OPB_SMTP_HOST = previous;
    resetTransport();
  });
});
