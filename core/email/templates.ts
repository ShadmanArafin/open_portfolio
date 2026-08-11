import 'server-only';

/**
 * Both messages this project sends.
 *
 * Plain text is written first and carries everything; the HTML is a courtesy.
 * No tracking pixels, no remote images, no link wrapping — a portfolio's
 * notification email has no business reporting on the person reading it.
 *
 * User-supplied content appears in the body only. The one place it reaches a
 * header is `Reply-To`, and only after the contact route's `clean()` has
 * stripped control characters — which is what stops a newline in a form field
 * from becoming an extra mail header.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface EnquiryInput {
  siteName: string;
  name: string;
  email: string;
  company?: string;
  projectType?: string;
  message: string;
  inboxUrl: string;
}

export function enquiryNotification(input: EnquiryInput) {
  const details = [
    `From: ${input.name} <${input.email}>`,
    input.company ? `Company: ${input.company}` : null,
    input.projectType ? `About: ${input.projectType}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const text = [
    `${input.name} sent you a message through ${input.siteName}.`,
    '',
    details,
    '',
    input.message,
    '',
    `Reply to this email to answer them directly, or open your inbox:`,
    input.inboxUrl,
  ].join('\n');

  const html = [
    `<p>${escapeHtml(input.name)} sent you a message through ${escapeHtml(input.siteName)}.</p>`,
    `<p>${escapeHtml(details).replace(/\n/g, '<br>')}</p>`,
    `<blockquote>${escapeHtml(input.message).replace(/\n/g, '<br>')}</blockquote>`,
    `<p>Reply to this email to answer them directly, or <a href="${escapeHtml(input.inboxUrl)}">open your inbox</a>.</p>`,
  ].join('');

  return { subject: `New enquiry from ${input.name}`, text, html };
}

export interface ResetInput {
  siteName: string;
  resetUrl: string;
  expiresMinutes: number;
}

export function passphraseReset(input: ResetInput) {
  const text = [
    `Somebody asked to reset the passphrase for ${input.siteName}.`,
    '',
    `Open this link within ${input.expiresMinutes} minutes to choose a new one:`,
    input.resetUrl,
    '',
    'It works once. If this was not you, nothing has changed and you can ignore',
    'this email — but somebody knows your address, so a strong passphrase is',
    'worth having.',
  ].join('\n');

  const html = [
    `<p>Somebody asked to reset the passphrase for ${escapeHtml(input.siteName)}.</p>`,
    `<p><a href="${escapeHtml(input.resetUrl)}">Choose a new passphrase</a> — the link works once, within ${input.expiresMinutes} minutes.</p>`,
    `<p>If this was not you, nothing has changed and you can ignore this email.</p>`,
  ].join('');

  return { subject: `Reset your ${input.siteName} passphrase`, text, html };
}
