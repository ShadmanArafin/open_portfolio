import 'server-only';

/**
 * The messages this project sends.
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

export interface ConfirmSubscriptionInput {
  siteName: string;
  confirmUrl: string;
  expiresDays: number;
}

/**
 * "Did you mean to sign up?"
 *
 * The only email this project sends to somebody who is not the owner, and the
 * reason double opt-in exists: anybody can type anybody's address into a form.
 * It therefore has to read as a question to a stranger who may not have asked
 * for it, not as a welcome — hence the last paragraph, which is the part that
 * matters most to the person receiving it by mistake.
 */
export function confirmSubscription(input: ConfirmSubscriptionInput) {
  const text = [
    `Somebody — hopefully you — asked to receive updates from ${input.siteName}.`,
    '',
    'Open this link to confirm:',
    input.confirmUrl,
    '',
    `If you do nothing, the request is deleted after ${input.expiresDays} days and`,
    'you will not hear from this address again. Nobody has been added to any',
    'list yet.',
  ].join('\n');

  const html = [
    `<p>Somebody — hopefully you — asked to receive updates from ${escapeHtml(input.siteName)}.</p>`,
    `<p><a href="${escapeHtml(input.confirmUrl)}">Confirm your subscription</a></p>`,
    `<p>If you do nothing, the request is deleted after ${input.expiresDays} days and you will not hear from this address again. Nobody has been added to any list yet.</p>`,
  ].join('');

  return { subject: `Confirm your subscription to ${input.siteName}`, text, html };
}

export interface SignInCodeInput {
  siteName: string;
  code: string;
  expiresMinutes: number;
}

/**
 * A one-time sign-in code for the owner.
 *
 * Goes to exactly one address — the owner's — so unlike the subscription
 * confirmation it needs no stranger-facing apology paragraph. The code is
 * short enough to retype from a phone notification and expires in minutes,
 * which is what makes reply-to guessing worthless.
 */
export function signInCode(input: SignInCodeInput) {
  const text = [
    `Your sign-in code for ${input.siteName} is:`,
    '',
    input.code,
    '',
    `It works once, within ${input.expiresMinutes} minutes. If this was not you,`,
    'nothing has changed and you can ignore this email.',
  ].join('\n');

  const html = [
    `<p>Your sign-in code for ${escapeHtml(input.siteName)} is:</p>`,
    `<p style="font-size: 24px; letter-spacing: 4px;"><strong>${escapeHtml(input.code)}</strong></p>`,
    `<p>It works once, within ${input.expiresMinutes} minutes. If this was not you, nothing has changed and you can ignore this email.</p>`,
  ].join('');

  return { subject: `Your ${input.siteName} sign-in code`, text, html };
}

export interface DigestInput {
  siteName: string;
  /** "October 2026" — the month just ended. */
  month: string;
  views: {
    visitors: number | null;
    pageviews: number | null;
    topPages: { path: string; views: number }[];
  } | null;
  newMessages: number;
  unread: number;
  unpublished: boolean;
  /** Launch-checklist steps still open, with where to do each. */
  todo: { label: string; url: string }[];
  adminUrl: string;
}

/**
 * The monthly note to the owner. Short on purpose: a portfolio is edited a few
 * times a year, and the reason to open it again is one line — someone wrote,
 * people looked, something is half-done — not a report.
 */
export function monthlyDigest(input: DigestInput) {
  const lines: string[] = [];
  if (input.views && (input.views.visitors ?? input.views.pageviews) !== null) {
    const parts = [
      input.views.visitors !== null ? `${input.views.visitors} visitors` : null,
      input.views.pageviews !== null ? `${input.views.pageviews} page views` : null,
    ].filter(Boolean);
    lines.push(`In the last 30 days: ${parts.join(', ')}.`);
    const top = input.views.topPages.slice(0, 3);
    if (top.length)
      lines.push(`Most read: ${top.map((page) => `${page.path} (${page.views})`).join(', ')}.`);
  }
  lines.push(
    input.newMessages === 0
      ? 'No new enquiries this month.'
      : `${input.newMessages} new ${input.newMessages === 1 ? 'enquiry' : 'enquiries'} this month${
          input.unread ? `, ${input.unread} still unread` : ''
        }.`
  );
  if (input.unpublished) lines.push('You have changes saved in your draft that are not live yet.');

  const text = [
    `Your ${input.month} on ${input.siteName}:`,
    '',
    ...lines,
    ...(input.todo.length
      ? [
          '',
          'Still to do before your site is fully launched:',
          ...input.todo.map((step) => `- ${step.label}: ${step.url}`),
        ]
      : []),
    '',
    `Open your admin: ${input.adminUrl}`,
    '',
    'You get this once a month. To stop it, set OPB_DIGEST=off in your hosting settings.',
  ].join('\n');

  const html = [
    `<p>Your ${escapeHtml(input.month)} on ${escapeHtml(input.siteName)}:</p>`,
    `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`,
    input.todo.length
      ? `<p>Still to do before your site is fully launched:</p><ul>${input.todo
          .map((step) => `<li><a href="${escapeHtml(step.url)}">${escapeHtml(step.label)}</a></li>`)
          .join('')}</ul>`
      : '',
    `<p><a href="${escapeHtml(input.adminUrl)}">Open your admin</a></p>`,
    '<p style="color:#666;font-size:12px">You get this once a month. To stop it, set OPB_DIGEST=off in your hosting settings.</p>',
  ].join('');

  const subject =
    input.newMessages > 0
      ? `${input.siteName}: ${input.newMessages} new ${input.newMessages === 1 ? 'enquiry' : 'enquiries'} in ${input.month}`
      : `${input.siteName} in ${input.month}`;
  return { subject, text, html };
}
