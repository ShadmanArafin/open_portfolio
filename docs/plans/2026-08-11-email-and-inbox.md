# Email and Durable Inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Notify the owner by email when an enquiry arrives, let them reset a forgotten passphrase, and move the inbox out of the content snapshot so concurrent enquiries stop overwriting each other.

**Architecture:** An SMTP transport resolved from environment variables the same way `core/storage/registry.ts` infers the storage backend, with `sendMail()` that never throws so no mail failure can fail the operation that triggered it. Enquiries move from `CMSState.messages` onto a new `messages` surface on the storage contract — a table on Postgres, one file per message on the local adapter — so appends are atomic by construction. Every send outcome is recorded on the message and surfaced in the admin.

**Tech Stack:** Next.js 16 App Router, TypeScript, nodemailer, Vitest, Docker (Mailpit and Postgres for tests).

**Spec:** [../specs/2026-08-11-email-and-inbox-design.md](../specs/2026-08-11-email-and-inbox-design.md)

## Global Constraints

- Every file under `core/` starts with `import 'server-only';`.
- `sendMail()` never throws and never rejects. No caller may let a mail failure fail its own operation.
- Never derive an authorization decision — including a reset link's origin — from a request header. Use `OPB_SITE_URL`.
- Store `sha256(token)`, never the token itself, for anything that grants access.
- Environment variables win over stored config, always. Documented so a vault is additive later.
- New env vars are `OPB_`-prefixed. Vendor-standard names are only for variables a platform sets for you.
- No raw hex or px in admin UI; Astryx component props first (see `.claude/CLAUDE.md`).
- Every task ends green on `npm run typecheck && npm run lint && npm run format:check && npm run test`.
- Commit with `git commit -s` (DCO). Repo convention: Conventional Commits, body explains _why_.

## File Structure

| File                                                | Responsibility                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| `core/email/transport.ts`                           | Resolve `smtp \| none` from env; build and cache the nodemailer transporter     |
| `core/email/send.ts`                                | `sendMail()` — the only send in the codebase; converts every failure to a value |
| `core/email/templates.ts`                           | The two messages, plain-text first                                              |
| `core/storage/contract.ts`                          | Gains `MessagesAdapter` and `StorageAdapter.messages`                           |
| `core/storage/adapters/local.ts`                    | Messages as one file per message                                                |
| `core/storage/adapters/_shared/postgres.ts`         | Messages as a table; shared by Supabase, Neon, Postgres                         |
| `core/storage/adapters/_shared/migrate-messages.ts` | One-time move out of the snapshot, idempotent                                   |
| `core/storage/conformance.ts`                       | Message assertions, including concurrent append                                 |
| `app/api/admin/messages/route.ts`                   | `GET` the inbox                                                                 |
| `app/api/admin/messages/[id]/route.ts`              | `PATCH` status, `DELETE`                                                        |
| `app/api/auth/reset/request/route.ts`               | Issue a reset token, always answer ok                                           |
| `app/api/auth/reset/confirm/route.ts`               | Consume it once, rotate the passphrase, bump the epoch                          |
| `src/admin/pages/AdminResetPassphrase.tsx`          | The reset screen                                                                |

---

## Task 1: SMTP transport

**Files:**

- Create: `core/email/transport.ts`, `core/email/send.ts`, `core/email/templates.ts`
- Create: `core/email/__tests__/transport.test.ts`, `core/email/__tests__/send.test.ts`
- Modify: `package.json` (add `nodemailer`, `@types/nodemailer`)
- Modify: `.github/workflows/ci.yml` (Mailpit service on the conformance job)
- Modify: `.env.example`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `resolveTransport(env?: NodeJS.ProcessEnv): ResolvedTransport` where `ResolvedTransport = { kind: 'none'; reason: string } | { kind: 'smtp'; config: SmtpConfig }`
  - `SmtpConfig = { host: string; port: number; secure: boolean; user?: string; password?: string; from: string }`
  - `resetTransport(): void` — drops the cached transporter, for tests
  - `sendMail(input: MailInput): Promise<SendResult>`
  - `MailInput = { to: string; subject: string; text: string; html?: string; replyTo?: string }`
  - `SendResult = { ok: true } | { ok: false; reason: 'not-configured' | 'failed'; detail: string }`
  - `enquiryNotification(input): { subject: string; text: string; html: string }`
  - `passphraseReset(input): { subject: string; text: string; html: string }`

- [ ] **Step 1: Install the dependency**

```bash
npm install nodemailer && npm install --save-dev @types/nodemailer
```

- [ ] **Step 2: Write the failing transport test**

Create `core/email/__tests__/transport.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { resolveTransport } from '../transport';

describe('transport resolution', () => {
  it('is not configured when no host is set', () => {
    const result = resolveTransport({} as NodeJS.ProcessEnv);
    expect(result.kind).toBe('none');
  });

  it('selects smtp on the presence of a host alone', () => {
    const result = resolveTransport({ OPB_SMTP_HOST: 'localhost' } as NodeJS.ProcessEnv);
    expect(result.kind).toBe('smtp');
  });

  it('defaults the port to 587 and TLS to off', () => {
    const result = resolveTransport({ OPB_SMTP_HOST: 'localhost' } as NodeJS.ProcessEnv);
    if (result.kind !== 'smtp') throw new Error('expected smtp');
    expect(result.config.port).toBe(587);
    expect(result.config.secure).toBe(false);
  });

  it('turns on implicit TLS only for the documented value', () => {
    const on = resolveTransport({
      OPB_SMTP_HOST: 'h',
      OPB_SMTP_SECURE: '1',
    } as NodeJS.ProcessEnv);
    if (on.kind !== 'smtp') throw new Error('expected smtp');
    expect(on.config.secure).toBe(true);
  });

  it('derives a From address when none is given', () => {
    // Mailpit needs no credentials and no From; a developer should not have to
    // invent one to see their first email.
    const result = resolveTransport({ OPB_SMTP_HOST: 'mail.example.com' } as NodeJS.ProcessEnv);
    if (result.kind !== 'smtp') throw new Error('expected smtp');
    expect(result.config.from).toBe('no-reply@mail.example.com');
  });

  it('prefers an explicit From', () => {
    const result = resolveTransport({
      OPB_SMTP_HOST: 'h',
      OPB_MAIL_FROM: 'me@example.com',
    } as NodeJS.ProcessEnv);
    if (result.kind !== 'smtp') throw new Error('expected smtp');
    expect(result.config.from).toBe('me@example.com');
  });

  it('ignores a port that is not a number', () => {
    const result = resolveTransport({
      OPB_SMTP_HOST: 'h',
      OPB_SMTP_PORT: 'not-a-port',
    } as NodeJS.ProcessEnv);
    if (result.kind !== 'smtp') throw new Error('expected smtp');
    expect(result.config.port).toBe(587);
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run core/email/__tests__/transport.test.ts`
Expected: FAIL — cannot resolve `../transport`.

- [ ] **Step 4: Write `core/email/transport.ts`**

```ts
import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Which mail transport this instance has, decided by environment alone.
 *
 * Mirrors `core/storage/registry.ts`: the presence of a variable selects the
 * backend, so nobody has to choose one in a settings screen before they have a
 * database to store the choice in.
 *
 * `OPB_`-prefixed because no platform sets `SMTP_HOST` for you. The storage
 * adapters accept vendor names — DATABASE_URL, BLOB_READ_WRITE_TOKEN —
 * precisely because the platform writes those.
 *
 * Precedence, fixed now so a vault is additive later rather than a migration:
 * an environment variable wins if present; otherwise stored config, once
 * stored config exists.
 */

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  from: string;
}

export type ResolvedTransport =
  { kind: 'none'; reason: string } | { kind: 'smtp'; config: SmtpConfig };

export function resolveTransport(env: NodeJS.ProcessEnv = process.env): ResolvedTransport {
  const host = env.OPB_SMTP_HOST?.trim();
  if (!host) {
    return {
      kind: 'none',
      reason: 'No mail server is configured, so nothing is sent. Set OPB_SMTP_HOST.',
    };
  }

  const parsedPort = Number(env.OPB_SMTP_PORT);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 587;

  return {
    kind: 'smtp',
    config: {
      host,
      port,
      // Implicit TLS is port 465 only. Everything else negotiates STARTTLS,
      // which nodemailer does on its own.
      secure: env.OPB_SMTP_SECURE === '1',
      user: env.OPB_SMTP_USER?.trim() || undefined,
      password: env.OPB_SMTP_PASSWORD || undefined,
      from: env.OPB_MAIL_FROM?.trim() || `no-reply@${host}`,
    },
  };
}

let cached: { key: string; transporter: Transporter } | null = null;

/** Built once per configuration, so a connection pool is reused. */
export function getTransporter(config: SmtpConfig): Transporter {
  const key = JSON.stringify(config);
  if (cached?.key === key) return cached.transporter;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user ? { user: config.user, pass: config.password ?? '' } : undefined,
    // An SMTP handshake against a wrong host hangs far longer than a person
    // will wait on a contact form.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });

  cached = { key, transporter };
  return transporter;
}

/** Drops the cached transporter. Tests change the environment between cases. */
export function resetTransport(): void {
  cached = null;
}
```

- [ ] **Step 5: Run the transport test — expect PASS**

Run: `npx vitest run core/email/__tests__/transport.test.ts`
Expected: 7 passed.

- [ ] **Step 6: Write `core/email/send.ts`**

```ts
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
```

- [ ] **Step 7: Write `core/email/templates.ts`**

```ts
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
```

- [ ] **Step 8: Write the Mailpit integration test**

Create `core/email/__tests__/send.test.ts`:

```ts
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
```

- [ ] **Step 9: Start Mailpit and run the suite**

```bash
docker run -d --name opb-mail -p 1025:1025 -p 8025:8025 axllent/mailpit
TEST_MAILPIT_URL=http://localhost:8025 npx vitest run core/email
```

Expected: all pass. Without `TEST_MAILPIT_URL`, the integration block skips and the not-configured test still runs.

- [ ] **Step 10: Add Mailpit to CI**

In `.github/workflows/ci.yml`, under `storage-conformance:` `services:`, add alongside `postgres`:

```yaml
mailpit:
  image: axllent/mailpit
  ports:
    - 1025:1025
    - 8025:8025
```

and add to that job's test step `env:`:

```yaml
TEST_MAILPIT_URL: http://localhost:8025
```

- [ ] **Step 11: Document the variables in `.env.example`**

```
# --- Optional: email ---
# Without these nothing is sent: enquiries still reach your admin inbox, but
# nothing tells you they arrived, and there is no passphrase reset.
# Any SMTP server works. For local development:
#   docker run -d -p 1025:1025 -p 8025:8025 axllent/mailpit
#   OPB_SMTP_HOST=localhost, OPB_SMTP_PORT=1025, inbox at http://localhost:8025
# OPB_SMTP_HOST=
# OPB_SMTP_PORT=587
# OPB_SMTP_USER=
# OPB_SMTP_PASSWORD=
# Implicit TLS, port 465 only. Everything else negotiates STARTTLS by itself.
# OPB_SMTP_SECURE=1
# Defaults to no-reply@<your SMTP host>.
# OPB_MAIL_FROM=
```

- [ ] **Step 12: Verify and commit**

```bash
npm run typecheck && npm run lint && npm run format:check && npx vitest run core/email
git add core/email package.json package-lock.json .github/workflows/ci.yml .env.example
git commit -s -m "feat(email): add an SMTP transport that reports failures as values

Configured by environment alone, the way the storage backend already is, so
nobody chooses a mail provider in a settings screen before there is anywhere
to store the choice. Absent configuration is a no-op that says why rather
than a silent nothing.

sendMail never throws. A notification is strictly less important than the
thing it notifies about, so callers get a result to record instead of an
exception to remember to catch.

Tested against Mailpit in Docker rather than a mock: a refused connection
and a Reply-To that has to survive encoding are exactly the failures a mock
cannot have. CI runs it alongside the Postgres conformance job."
```

---

## Task 2: `messages` surface on the contract and the local adapter

**Files:**

- Modify: `core/storage/contract.ts`
- Modify: `core/storage/adapters/local.ts`
- Modify: `core/storage/conformance.ts`

**Interfaces:**

- Consumes: nothing from Task 1.
- Produces:
  - `MessagesAdapter` with `append(message: ContactMessage): Promise<void>`, `list(options?: { limit?: number }): Promise<ContactMessage[]>` (newest first), `update(id: string, patch: Partial<ContactMessage>): Promise<void>`, `remove(id: string): Promise<void>`
  - `StorageAdapter.messages: MessagesAdapter`

- [ ] **Step 1: Write the failing conformance assertions**

In `core/storage/conformance.ts`, add after the `describeMedia(...)` block:

```ts
describe('messages', () => {
  const enquiry = (id: string, receivedAt: string): ContactMessage => ({
    id,
    name: `Sender ${id}`,
    email: `${id}@example.com`,
    company: '',
    projectType: '',
    message: 'Hello.',
    receivedAt,
    status: 'unread',
  });

  it('is empty on a fresh instance', async () => {
    await reset();
    const adapter = await getAdapter();
    await adapter.provision();
    expect((await adapter.messages.list()).length).toBe(0);
  });

  it('round-trips an enquiry', async () => {
    await reset();
    const adapter = await getAdapter();
    await adapter.provision();

    await adapter.messages.append(enquiry('a', '2026-01-01T00:00:00.000Z'));
    const listed = await adapter.messages.list();
    expect(listed.length).toBe(1);
    expect(listed[0].email).toBe('a@example.com');
    expect(listed[0].status).toBe('unread');
  });

  it('lists newest first', async () => {
    await reset();
    const adapter = await getAdapter();
    await adapter.provision();

    await adapter.messages.append(enquiry('older', '2026-01-01T00:00:00.000Z'));
    await adapter.messages.append(enquiry('newer', '2026-06-01T00:00:00.000Z'));

    const listed = await adapter.messages.list();
    expect(listed[0].id).toBe('newer');
    expect(listed[1].id).toBe('older');
  });

  it('honours a limit', async () => {
    await reset();
    const adapter = await getAdapter();
    await adapter.provision();

    for (let i = 0; i < 5; i++) {
      await adapter.messages.append(enquiry(`m${i}`, `2026-01-0${i + 1}T00:00:00.000Z`));
    }
    expect((await adapter.messages.list({ limit: 2 })).length).toBe(2);
  });

  it('loses nothing when fifty arrive at once', async () => {
    await reset();
    const adapter = await getAdapter();
    await adapter.provision();

    // The reason this surface exists. Appending to the content snapshot was
    // a read-modify-write, so two simultaneous enquiries kept one. An inbox
    // may not do that, however acceptable it is for a content document.
    await Promise.all(
      Array.from({ length: 50 }, (_, i) =>
        adapter.messages.append(enquiry(`c${i}`, '2026-01-01T00:00:00.000Z'))
      )
    );

    expect((await adapter.messages.list()).length).toBe(50);
  });

  it('patches a status without touching the rest', async () => {
    await reset();
    const adapter = await getAdapter();
    await adapter.provision();

    await adapter.messages.append(enquiry('a', '2026-01-01T00:00:00.000Z'));
    await adapter.messages.update('a', { status: 'read' });

    const listed = await adapter.messages.list();
    expect(listed[0].status).toBe('read');
    expect(listed[0].email).toBe('a@example.com');
  });

  it('ignores a patch for something that is not there', async () => {
    await reset();
    const adapter = await getAdapter();
    await adapter.provision();
    await adapter.messages.update('never-existed', { status: 'read' });
  });

  it('removes one, and removing it twice is not an error', async () => {
    await reset();
    const adapter = await getAdapter();
    await adapter.provision();

    await adapter.messages.append(enquiry('a', '2026-01-01T00:00:00.000Z'));
    await adapter.messages.remove('a');
    await adapter.messages.remove('a');
    expect((await adapter.messages.list()).length).toBe(0);
  });
});
```

Add the import at the top of `conformance.ts`:

```ts
import type { CMSState, ContactMessage } from '@/cms/types/cms';
```

- [ ] **Step 2: Run and watch it fail**

Run: `npx vitest run core/storage/__tests__/local-adapter.test.ts`
Expected: FAIL — `adapter.messages` is undefined.

- [ ] **Step 3: Add the contract**

In `core/storage/contract.ts`, change the import and add the interface:

```ts
import type { CMSState, ContactMessage } from '@/cms/types/cms';
```

```ts
export interface MessageListOptions {
  /** Newest first, so a limit returns the most recent. */
  limit?: number;
}

/**
 * The contact inbox.
 *
 * Separate from the content snapshot because it has a different writer and a
 * different failure mode. Content is written by one person deliberately;
 * enquiries arrive from strangers concurrently. Appending them to a document
 * meant read-modify-write, and two simultaneous submissions kept one — which
 * `writeSnapshot` is allowed to do and an inbox is not.
 */
export interface MessagesAdapter {
  append(message: ContactMessage): Promise<void>;
  list(options?: MessageListOptions): Promise<ContactMessage[]>;
  /** Shallow merge. Unknown ids are ignored rather than an error. */
  update(id: string, patch: Partial<ContactMessage>): Promise<void>;
  remove(id: string): Promise<void>;
}
```

And add to `StorageAdapter`, below `readonly media: MediaAdapter;`:

```ts
  readonly messages: MessagesAdapter;
```

- [ ] **Step 4: Implement it on the local adapter**

In `core/storage/adapters/local.ts`, add near the other directory constants:

```ts
const MESSAGES_DIR = path.join(ROOT, 'messages');
```

Add the implementation above the exported adapter object:

```ts
/**
 * One file per enquiry.
 *
 * Every append writes a distinct path, so concurrent arrivals cannot collide —
 * which is the whole reason this is not a lock around a shared document.
 */
const messages: MessagesAdapter = {
  async append(message) {
    await mkdir(MESSAGES_DIR, { recursive: true });
    await atomicWrite(messagePath(message.id), JSON.stringify(message, null, 2));
  },

  async list(options) {
    let names: string[];
    try {
      names = await readdir(MESSAGES_DIR);
    } catch {
      return [];
    }

    const loaded = await Promise.all(
      names
        .filter((name) => name.endsWith('.json'))
        .map(async (name) => {
          try {
            return JSON.parse(await readFile(path.join(MESSAGES_DIR, name), 'utf8'));
          } catch {
            return null;
          }
        })
    );

    const all = (loaded.filter(Boolean) as ContactMessage[]).sort((a, b) =>
      b.receivedAt.localeCompare(a.receivedAt)
    );
    return options?.limit ? all.slice(0, options.limit) : all;
  },

  async update(id, patch) {
    let existing: ContactMessage;
    try {
      existing = JSON.parse(await readFile(messagePath(id), 'utf8')) as ContactMessage;
    } catch {
      return; // Gone already is the caller's intent satisfied.
    }
    await atomicWrite(messagePath(id), JSON.stringify({ ...existing, ...patch, id }, null, 2));
  },

  async remove(id) {
    try {
      await unlink(messagePath(id));
    } catch {
      // Already absent.
    }
  },
};
```

Add the path helper beside `safeMediaPath`, and reuse the same escape check:

```ts
/** Rejects any id that would place the file outside the messages folder. */
function messagePath(id: string): string {
  const resolved = path.resolve(MESSAGES_DIR, `${id}.json`);
  if (!resolved.startsWith(MESSAGES_DIR + path.sep)) {
    throw new Error(`Refusing to touch a message path outside the store: ${id}`);
  }
  return resolved;
}
```

Add `messages,` to the exported adapter object, add `MESSAGES_DIR` to `provision()`'s `mkdir` calls, and add `MessagesAdapter` plus `ContactMessage` to the imports.

- [ ] **Step 5: Run the local conformance suite — expect PASS**

Run: `npx vitest run core/storage/__tests__/local-adapter.test.ts`
Expected: all message assertions pass; nothing else regresses.

- [ ] **Step 6: Commit**

```bash
git add core/storage/contract.ts core/storage/adapters/local.ts core/storage/conformance.ts
git commit -s -m "feat(storage): give the contact inbox its own surface

Enquiries were appended by reading the published snapshot, unshifting and
writing it back, so two arriving together kept one. The conformance suite
pins that behaviour as correct — and it is, for a content document written
by one person deliberately. It is not, for an inbox written by strangers
concurrently.

The local adapter writes one file per enquiry, so every append targets a
distinct path and concurrent arrivals cannot collide. That is the reason
this is a surface rather than a lock around a shared document: the race is
the symptom, and two unrelated writers sharing one row is the cause.

Postgres follows in the next commit; the adapters that share the SQL engine
get it for free."
```

---

## Task 3: `messages` on the shared Postgres engine

**Files:**

- Modify: `core/storage/adapters/_shared/postgres.ts`
- Modify: `core/storage/adapters/supabase.ts`, `neon.ts`, `postgres.ts`
- Modify: `core/storage/__tests__/hosted-adapters.test.ts`, `core/storage/__tests__/postgres-engine.test.ts`

**Interfaces:**

- Consumes: `MessagesAdapter` from Task 2.
- Produces: `makeMessagesAdapter(getConnection: () => Sql): MessagesAdapter`

- [ ] **Step 1: Add the table to `provisionSchema`**

In `core/storage/adapters/_shared/postgres.ts`, inside `provisionSchema`, after the `opb_kv` index:

```ts
await sql`
    CREATE TABLE IF NOT EXISTS opb_messages (
      id           text PRIMARY KEY,
      received_at  timestamptz NOT NULL,
      data         jsonb NOT NULL
    )
  `;

await sql`
    CREATE INDEX IF NOT EXISTS opb_messages_received_at_idx
      ON opb_messages (received_at DESC)
  `;
```

- [ ] **Step 2: Add the adapter factory**

At the end of `core/storage/adapters/_shared/postgres.ts`:

```ts
/**
 * The inbox, as a table.
 *
 * `append` is a single INSERT, so it is atomic without a lock and fifty
 * simultaneous enquiries produce fifty rows. `ON CONFLICT DO NOTHING` makes it
 * safe to replay, which is what lets the migration out of the snapshot run on
 * every boot without duplicating anything.
 */
export function makeMessagesAdapter(getConnection: () => Sql): MessagesAdapter {
  return {
    async append(message) {
      const sql = getConnection();
      await sql`
        INSERT INTO opb_messages (id, received_at, data)
        VALUES (${message.id}, ${message.receivedAt}, ${sql.json(message as never)})
        ON CONFLICT (id) DO NOTHING
      `;
    },

    async list(options) {
      const sql = getConnection();
      const limit = options?.limit ?? null;
      const rows = limit
        ? await sql<{ data: ContactMessage }[]>`
            SELECT data FROM opb_messages ORDER BY received_at DESC LIMIT ${limit}
          `
        : await sql<{ data: ContactMessage }[]>`
            SELECT data FROM opb_messages ORDER BY received_at DESC
          `;
      return rows.map((row) => row.data);
    },

    async update(id, patch) {
      const sql = getConnection();
      // `||` is a shallow merge, which is exactly what a patch is. Doing it in
      // the database rather than read-modify-write keeps a concurrent status
      // change from clobbering a concurrent notification result.
      await sql`
        UPDATE opb_messages
           SET data = data || ${sql.json(patch as never)}
         WHERE id = ${id}
      `;
    },

    async remove(id) {
      const sql = getConnection();
      await sql`DELETE FROM opb_messages WHERE id = ${id}`;
    },
  };
}
```

Add `ContactMessage` and `MessagesAdapter` to that file's imports.

- [ ] **Step 3: Wire it into the three SQL adapters**

In each of `core/storage/adapters/supabase.ts`, `neon.ts` and `postgres.ts`, add `makeMessagesAdapter` to the import from `./_shared/postgres` and add to the exported adapter object beside `kv`:

```ts
  messages: makeMessagesAdapter(sql),
```

- [ ] **Step 4: Truncate the new table between tests**

In `core/storage/__tests__/hosted-adapters.test.ts`, change the truncate helper:

```ts
await sql`TRUNCATE opb_content, opb_owner, opb_kv, opb_messages`;
```

Make the same change in `core/storage/__tests__/postgres-engine.test.ts` if it truncates independently.

- [ ] **Step 5: Run against real Postgres**

```bash
docker run -d --name opb-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=opb_test -p 55432:5432 postgres:16
TEST_POSTGRES_URL="postgres://postgres:postgres@localhost:55432/opb_test" npx vitest run core/storage
```

Expected: the same message assertions pass on Postgres, including the fifty-concurrent-appends case.

- [ ] **Step 6: Commit**

```bash
git add core/storage
git commit -s -m "feat(storage): the inbox on Postgres, shared by three adapters

One INSERT per enquiry, so appending is atomic without a lock. Updates use
jsonb's shallow merge in the database rather than read-modify-write, so a
status change and a notification result arriving together cannot clobber
each other.

Supabase, Neon and generic Postgres share the SQL engine, so this is one
implementation for three backends — the same reason the fourth adapter cost
almost nothing."
```

---

## Task 4: Migrate off the snapshot

**Files:**

- Create: `core/storage/adapters/_shared/migrate-messages.ts`
- Modify: `core/storage/adapters/local.ts`, `_shared/postgres.ts` consumers (`supabase.ts`, `neon.ts`, `postgres.ts`)
- Modify: `app/api/admin/publish/route.ts`
- Modify: `core/storage/conformance.ts`

**Interfaces:**

- Consumes: `MessagesAdapter` from Tasks 2 and 3.
- Produces: `migrateSnapshotMessages(deps): Promise<number>` returning how many moved.

- [ ] **Step 1: Write the failing conformance assertion**

Add inside the `describe('messages', ...)` block in `core/storage/conformance.ts`:

```ts
it('moves enquiries out of an old snapshot on provision, once', async () => {
  await reset();
  const adapter = await getAdapter();
  await adapter.provision();

  // What an instance upgraded from a previous version looks like.
  const legacy = makeTestContent('legacy');
  legacy.messages = [enquiry('old-1', '2026-01-01T00:00:00.000Z')];
  await adapter.writeSnapshot('published', legacy);

  await adapter.provision();
  expect((await adapter.messages.list()).length).toBe(1);
  expect((await adapter.readSnapshot('published'))?.messages.length).toBe(0);

  // Idempotent: boot happens on every cold start, and on several at once.
  await adapter.provision();
  await adapter.provision();
  expect((await adapter.messages.list()).length).toBe(1);
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `npx vitest run core/storage/__tests__/local-adapter.test.ts`
Expected: FAIL — the snapshot still holds the message.

- [ ] **Step 3: Write the shared migration**

Create `core/storage/adapters/_shared/migrate-messages.ts`:

```ts
import 'server-only';
import type { CMSState, ContactMessage } from '@/cms/types/cms';

/**
 * Moves enquiries out of the content snapshot and into the messages surface.
 *
 * Runs from `provision()`, which already happens on boot and is already
 * required to be idempotent. Guarded on the destination being empty, and every
 * backend's `append` ignores a duplicate id, so several instances booting at
 * once cannot produce duplicates between them.
 */
export interface MigrationDeps {
  readSnapshot: (channel: 'published' | 'draft') => Promise<CMSState | null>;
  writeSnapshot: (channel: 'published' | 'draft', state: CMSState) => Promise<void>;
  listMessages: () => Promise<ContactMessage[]>;
  appendMessage: (message: ContactMessage) => Promise<void>;
}

export async function migrateSnapshotMessages(deps: MigrationDeps): Promise<number> {
  const existing = await deps.listMessages();
  if (existing.length > 0) return 0;

  let moved = 0;
  for (const channel of ['published', 'draft'] as const) {
    const snapshot = await deps.readSnapshot(channel);
    const carried = snapshot?.messages ?? [];
    if (!snapshot || carried.length === 0) continue;

    for (const message of carried) {
      await deps.appendMessage(message);
      moved += 1;
    }
    await deps.writeSnapshot(channel, { ...snapshot, messages: [] });
  }

  return moved;
}
```

- [ ] **Step 4: Call it from every adapter's `provision()`**

In `core/storage/adapters/local.ts`, at the end of `provision()`:

```ts
await mkdir(MESSAGES_DIR, { recursive: true });
await migrateSnapshotMessages({
  readSnapshot: (channel) => localAdapter.readSnapshot(channel),
  writeSnapshot: (channel, state) => localAdapter.writeSnapshot(channel, state),
  listMessages: () => messages.list(),
  appendMessage: (message) => messages.append(message),
});
```

Do the same in `supabase.ts`, `neon.ts` and `postgres.ts`, after `provisionSchema(sql())` (and after `ensureBucket()` in Supabase's case), referencing that file's own adapter object and its `messages` member.

- [ ] **Step 5: Stop publishing from carrying messages**

In `app/api/admin/publish/route.ts`, replace the merge:

```ts
// Enquiries live on their own surface now. Publishing must not carry them:
// the editor's copy is a stale read, and writing it back would resurrect
// deleted enquiries and lose any that arrived while the tab was open.
const merged: CMSState = { ...content, messages: [] };
```

Update the comment above it, which still describes preserving `existing.messages`, and drop the now-unused `adapter.readSnapshot('published')` read if nothing else uses it.

- [ ] **Step 6: Run both suites — expect PASS**

```bash
npx vitest run core/storage
TEST_POSTGRES_URL="postgres://postgres:postgres@localhost:55432/opb_test" npx vitest run core/storage
```

- [ ] **Step 7: Commit**

```bash
git add core/storage app/api/admin/publish/route.ts
git commit -s -m "feat(storage): move existing enquiries off the content snapshot

Runs from provision(), which already happens on boot and is already required
to be idempotent. Guarded on the destination being empty, and every append
ignores a duplicate id, so several instances booting at once cannot duplicate
between them.

Publishing stops carrying messages. The editor's copy is a stale read, so
writing it back would resurrect deleted enquiries and lose any that arrived
while the tab was open — the bug the old merge existed to prevent, now
prevented by the enquiries not being there at all."
```

---

## Task 5: Serve the inbox from the server

**Files:**

- Create: `app/api/admin/messages/route.ts`, `app/api/admin/messages/[id]/route.ts`
- Modify: `src/cms/services/cmsService.ts`, `src/cms/context/CMSContext.tsx`

**Interfaces:**

- Consumes: `StorageAdapter.messages` from Tasks 2–4.
- Produces:
  - `GET /api/admin/messages` → `{ ok: true, messages: ContactMessage[], emailConfigured: boolean }`
  - `PATCH /api/admin/messages/:id` with `{ status }` → `{ ok: true }`
  - `DELETE /api/admin/messages/:id` → `{ ok: true }`
  - `cmsService.setMessages(messages: ContactMessage[]): void`
  - `cmsService.emailConfigured: boolean`

- [ ] **Step 1: Write the list route**

Create `app/api/admin/messages/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { resolveTransport } from '@/core/email/transport';

export const dynamic = 'force-dynamic';

/**
 * The inbox.
 *
 * Owner-only, and the check lives here rather than in a layout, because a route
 * handler is a public HTTP endpoint no matter what rendered the screen calling
 * it.
 *
 * `emailConfigured` rides along so the admin can say "nothing tells you when an
 * enquiry arrives" without a second round trip, and without the browser ever
 * seeing the mail credentials that answer the question.
 */
export async function GET() {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const messages = await getStorageAdapter().messages.list();
  return NextResponse.json({
    ok: true,
    messages,
    emailConfigured: resolveTransport().kind !== 'none',
  });
}
```

- [ ] **Step 2: Write the mutation route**

Create `app/api/admin/messages/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/core/storage/registry';
import { assertSameOrigin, requireOwner, UnauthorizedError } from '@/core/auth/guard';
import type { ContactMessage } from '@/cms/types/cms';

export const dynamic = 'force-dynamic';

const STATUSES: ContactMessage['status'][] = ['unread', 'read', 'archived', 'spam'];

async function guard(): Promise<NextResponse | null> {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }
  return null;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const rejected = await guard();
  if (rejected) return rejected;

  const body = (await req.json().catch(() => null)) as { status?: string } | null;
  const status = body?.status as ContactMessage['status'] | undefined;
  if (!status || !STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: 'Unknown status.' }, { status: 400 });
  }

  const { id } = await ctx.params;
  await getStorageAdapter().messages.update(id, { status });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const rejected = await guard();
  if (rejected) return rejected;

  const { id } = await ctx.params;
  await getStorageAdapter().messages.remove(id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Teach `cmsService` to hold server-supplied messages**

In `src/cms/services/cmsService.ts`, add:

```ts
  /** Whether this instance can send mail. Answered by the server. */
  public emailConfigured = false;

  /**
   * Replaces the in-memory inbox with what the server holds.
   *
   * Enquiries are not part of the content document any more, but every screen
   * that shows them still reads `state.messages` — the sidebar badge, the
   * command palette, the analytics page, the dashboard's health checks. Putting
   * the server's list back into that field keeps all of them working without a
   * rewrite, and keeps `exportBundle` complete.
   */
  public setMessages(messages: ContactMessage[], emailConfigured: boolean): void {
    this.emailConfigured = emailConfigured;
    const nextPublished = clone(this.publishedState);
    const nextDraft = clone(this.draftState);
    nextPublished.messages = messages;
    nextDraft.messages = messages;
    this.publishedState = nextPublished;
    this.draftState = nextDraft;
    this.notify();
  }
```

Rewrite the two mutators to go through the routes and update in memory:

```ts
  public async updateMessageStatus(
    messageId: string,
    status: ContactMessage['status']
  ): Promise<void> {
    await fetch(`/api/admin/messages/${encodeURIComponent(messageId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => undefined);

    const apply = (state: CMSState) => {
      const msg = state.messages.find((m) => m.id === messageId);
      if (msg) msg.status = status;
    };
    const nextPublished = clone(this.publishedState);
    const nextDraft = clone(this.draftState);
    apply(nextPublished);
    apply(nextDraft);
    this.publishedState = nextPublished;
    this.draftState = nextDraft;
    this.notify();
  }

  public async deleteMessage(messageId: string): Promise<void> {
    await fetch(`/api/admin/messages/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
    }).catch(() => undefined);

    const nextPublished = clone(this.publishedState);
    const nextDraft = clone(this.draftState);
    nextPublished.messages = nextPublished.messages.filter((m) => m.id !== messageId);
    nextDraft.messages = nextDraft.messages.filter((m) => m.id !== messageId);
    this.publishedState = nextPublished;
    this.draftState = nextDraft;
    this.notify();
  }
```

Delete `submitContactMessage` from `cmsService` and from `CMSContext` — the public form posts to `/api/contact` and nothing else calls it.

Delete these two lines, which exist only to keep enquiries out of content history and stop being possible to get wrong once enquiries are not in the content:

- `snapshot.messages = [];` in the version-snapshot path
- `restored.messages = this.draftState.messages;` in the restore path

- [ ] **Step 4: Fetch on admin boot**

In `src/cms/context/CMSContext.tsx`, add an effect that runs once when authenticated:

```ts
// Enquiries live on the server now. Fetch them once the admin is signed in,
// and put them where every existing consumer already looks.
useEffect(() => {
  if (!authStatus) return;
  let cancelled = false;

  void (async () => {
    try {
      const res = await fetch('/api/admin/messages');
      if (!res.ok) return;
      const body = (await res.json()) as {
        ok: boolean;
        messages: ContactMessage[];
        emailConfigured: boolean;
      };
      if (!cancelled && body.ok) {
        cmsService.setMessages(body.messages, body.emailConfigured);
        setEmailConfigured(body.emailConfigured);
      }
    } catch {
      // The inbox stays empty; the dashboard's storage check reports the fault.
    }
  })();

  return () => {
    cancelled = true;
  };
}, [authStatus]);
```

Add the state the effect sets, beside the existing `authStatus`, and import `ContactMessage`:

```ts
const [emailConfigured, setEmailConfigured] = useState(false);
```

Update the context type for the two mutators, which now return promises, and expose the new flag:

```ts
updateMessageStatus: (id: string, status: ContactMessage['status']) => Promise<void>;
deleteMessage: (id: string) => Promise<void>;
/** Whether this instance can send mail. Read by the dashboard's health checks. */
emailConfigured: boolean;
```

Add `emailConfigured` to the provider's value object. Replace the `any` in the two mutator signatures with `ContactMessage['status']`; `src/admin/pages/AdminMessagesInbox.tsx` needs no change because it already passes a literal status.

- [ ] **Step 5: Verify by hand**

```bash
rm -rf .opb && npm run dev
# claim at /setup, submit the public contact form, then open /admin/messages
```

Expected: the enquiry appears; marking it read survives a reload; deleting it survives a reload; `.opb/messages/` holds one file per enquiry.

- [ ] **Step 6: Commit**

```bash
npm run typecheck && npm run lint && npm run format:check && npm run test
git add app/api/admin/messages src/cms
git commit -s -m "feat(admin): read the inbox from the server

Enquiries are no longer in the content document, but the sidebar badge, the
command palette, the analytics page and the dashboard's health checks all
read state.messages. The context fetches the server's list into that field,
so five of the six consumers need no edit and exports stay complete.

Two lines are deleted rather than ported: clearing messages when snapshotting
a version, and restoring them after a rollback. Both existed to keep
enquiries out of content history, which stops being possible to get wrong
once enquiries are not in the content."
```

---

## Task 6: Notify, visibly

**Files:**

- Modify: `src/cms/types/cms.ts`, `app/api/contact/route.ts`
- Modify: `src/cms/utils/contentHealth.ts`, `src/admin/pages/AdminMessagesInbox.tsx`, `src/admin/pages/AdminDashboard.tsx`

**Interfaces:**

- Consumes: `sendMail`, `enquiryNotification` (Task 1); `StorageAdapter.messages` (Tasks 2–4); `cmsService.emailConfigured` (Task 5).
- Produces: `ContactMessage.notifiedAt?: string`, `ContactMessage.notifyError?: string`.

- [ ] **Step 1: Extend the type**

In `src/cms/types/cms.ts`, add to `ContactMessage`:

```ts
  /** Set when a notification was accepted by the mail server. */
  notifiedAt?: string;
  /** Why no notification was sent. Shown in the inbox. */
  notifyError?: string;
```

- [ ] **Step 2: Rewrite the contact route's storage and add the notification**

In `app/api/contact/route.ts`, replace the snapshot read-modify-write with an append, then notify:

```ts
const adapter = getStorageAdapter();
const owner = await adapter.readOwner();
if (!owner) {
  // Nowhere to file this and nobody to tell. Saying so beats accepting the
  // message and dropping it.
  return NextResponse.json(
    { ok: false, error: 'This site is not finished being set up yet.' },
    { status: 503 }
  );
}

await adapter.messages.append(entry);

// Stored first, notified second, and deliberately in that order: a
// misconfigured mail server must lose a notification rather than somebody's
// enquiry. The visitor is told it worked either way, because for them it did.
const published = await adapter.readSnapshot('published');
const siteName = published?.settings?.fullName || published?.seo?.siteTitle || 'your site';
const siteUrl = process.env.OPB_SITE_URL?.replace(/\/$/, '') ?? '';

const mail = enquiryNotification({
  siteName,
  name: entry.name,
  email: entry.email,
  company: entry.company,
  projectType: entry.projectType,
  message: entry.message,
  inboxUrl: `${siteUrl}/admin/messages`,
});

const sent = await sendMail({ to: owner.email, replyTo: entry.email, ...mail });
await adapter.messages.update(
  entry.id,
  sent.ok ? { notifiedAt: new Date().toISOString() } : { notifyError: sent.detail }
);

return NextResponse.json({ ok: true });
```

Add the imports for `sendMail` and `enquiryNotification`.

- [ ] **Step 3: Add the health check**

In `src/cms/utils/contentHealth.ts`, extend the signature and add a check beside the other enquiry checks:

```ts
export function analyseContent(
  state: CMSState,
  countMediaUsage: (id: string) => number,
  options: { emailConfigured?: boolean } = {}
): HealthReport {
```

```ts
const failedNotifications = (state.messages ?? []).filter((m) => m.notifyError).length;

check(options.emailConfigured !== false, () => ({
  id: 'email-not-configured',
  severity: 'warning',
  title: 'Nothing tells you when an enquiry arrives',
  detail:
    'Messages reach your inbox here, but no email is sent, so you only see them by ' +
    'signing in. Set OPB_SMTP_HOST and the related variables to change that.',
  to: '/admin/messages',
  action: 'See enquiries',
}));

check(failedNotifications === 0, () => ({
  id: 'email-failing',
  severity: 'blocking',
  title: `${failedNotifications} enquir${failedNotifications === 1 ? 'y' : 'ies'} could not be emailed to you`,
  detail: 'The enquiries are safe and listed in your inbox, but the notification failed.',
  to: '/admin/messages',
  action: 'See why',
}));
```

In `src/admin/pages/AdminDashboard.tsx`, pass the flag through:

```ts
const report = useMemo(
  () => analyseContent(data, countMediaUsage, { emailConfigured }),
  [data, countMediaUsage, emailConfigured]
);
```

taking `emailConfigured` from the CMS context (expose `cmsService.emailConfigured` there in Task 5's pattern).

- [ ] **Step 4: Show the failure on the message itself**

In `src/admin/pages/AdminMessagesInbox.tsx`, in the detail pane for the selected message, render a warning when `selectedMessage?.notifyError` is set, using Astryx components and tokens — no raw hex, no `<div>`. Run `npx astryx component Callout` and `npx astryx search "inline warning"` to pick the right one.

- [ ] **Step 5: Verify both paths by hand**

```bash
docker run -d --name opb-mail -p 1025:1025 -p 8025:8025 axllent/mailpit
rm -rf .opb
OPB_SMTP_HOST=localhost OPB_SMTP_PORT=1025 OPB_SITE_URL=http://localhost:3000 npm run dev
# claim, then submit the contact form
```

Expected: the enquiry appears at <http://localhost:8025> with the sender in Reply-To.

Then:

```bash
docker stop opb-mail
# submit the form again
```

Expected: the visitor still sees success; the enquiry is in the admin inbox with the SMTP error shown on it; the dashboard raises `email-failing`.

- [ ] **Step 6: Commit**

```bash
git add src/cms/types/cms.ts app/api/contact/route.ts src/cms/utils/contentHealth.ts src/admin
git commit -s -m "feat(email): tell the owner when an enquiry arrives

Stored first and notified second, so a misconfigured mail server loses a
notification rather than somebody's enquiry, and the visitor is told it
worked either way because for them it did.

The send outcome is recorded on the message and shown in the inbox, and a
dashboard check reports both 'no email is configured' and 'the last
notifications failed'. This part is not decoration. The two bugs fixed
before this work were both silent and both invisible specifically to the
one person able to report them — the owner's browser held the image blob,
so their site looked right to them and to nobody else. A notification that
failed quietly would be the third."
```

---

## Task 7: Passphrase reset

**Files:**

- Create: `core/auth/reset.ts`, `app/api/auth/reset/request/route.ts`, `app/api/auth/reset/confirm/route.ts`
- Create: `src/admin/pages/AdminResetPassphrase.tsx`
- Create: `core/auth/__tests__/reset.test.ts`
- Modify: `src/admin/pages/AdminLogin.tsx`, the admin router, `.env.example`, `README.md`, `ADMIN_SETUP.md`, `docs/PLAN.md`

**Interfaces:**

- Consumes: `sendMail`, `passphraseReset` (Task 1); `hashPassphrase`, `verifyPassphrase`, `checkPassphraseStrength`; `createSession(email, epoch)`; `adapter.kv` `otp` namespace.
- Produces: `issueResetToken(email: string): Promise<string | null>`, `consumeResetToken(token: string): Promise<string | null>` returning the email.

- [ ] **Step 1: Write the failing token test**

Create `core/auth/__tests__/reset.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { hashResetToken } from '../reset';

describe('reset tokens', () => {
  it('never stores the token itself', () => {
    const token = 'a'.repeat(64);
    const stored = hashResetToken(token);
    expect(stored.includes(token)).toBe(false);
    expect(stored.length).toBe(64); // sha256, hex
  });

  it('is stable for the same token and different for another', () => {
    expect(hashResetToken('one')).toBe(hashResetToken('one'));
    expect(hashResetToken('one')).not.toBe(hashResetToken('two'));
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run core/auth/__tests__/reset.test.ts`
Expected: FAIL — cannot resolve `../reset`.

- [ ] **Step 3: Write `core/auth/reset.ts`**

```ts
import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { getStorageAdapter } from '@/core/storage/registry';

/**
 * Passphrase reset tokens.
 *
 * Only the SHA-256 is stored, for the same reason sessions store only their
 * hash: a database leak must not be a live-credential leak. The token itself
 * exists in one email and nowhere else.
 *
 * They live in the `otp` kv namespace, which already has a TTL and is already
 * conformance-tested on every backend — so this needs no new storage.
 */

export const RESET_TTL_MINUTES = 30;

export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Returns the token to email, or null when there is nobody to email it to. */
export async function issueResetToken(email: string): Promise<string | null> {
  const adapter = getStorageAdapter();
  const owner = await adapter.readOwner();
  if (!owner || owner.email.toLowerCase() !== email.trim().toLowerCase()) return null;

  const token = randomBytes(32).toString('base64url');
  await adapter.kv.set(
    'otp',
    `reset:${hashResetToken(token)}`,
    { email: owner.email },
    RESET_TTL_MINUTES * 60
  );
  return token;
}

/** Returns the owner's email and burns the token, or null if it is not valid. */
export async function consumeResetToken(token: string): Promise<string | null> {
  const adapter = getStorageAdapter();
  const key = `reset:${hashResetToken(token)}`;
  const stored = await adapter.kv.get<{ email: string }>('otp', key);
  if (!stored) return null;

  // Deleted before the passphrase is changed, so a replay cannot land between
  // the two.
  await adapter.kv.del('otp', key);
  return stored.email;
}

/**
 * Where a reset link points.
 *
 * From configuration and never from the request. A link built from a
 * caller-supplied Host header mails the owner a valid token pointing at
 * somebody else's domain — and this repository has already made the
 * header-derived-authorization mistake once, in the claim flow.
 */
export function resetUrlBase(): string | null {
  const configured = process.env.OPB_SITE_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3000';
  return null;
}
```

- [ ] **Step 4: Run the token test — expect PASS**

Run: `npx vitest run core/auth/__tests__/reset.test.ts`

- [ ] **Step 5: Write the request route**

Create `app/api/auth/reset/request/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { issueResetToken, resetUrlBase, RESET_TTL_MINUTES } from '@/core/auth/reset';
import { getPublishedContent } from '@/core/content/read';
import { sendMail } from '@/core/email/send';
import { passphraseReset } from '@/core/email/templates';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = (body?.email ?? '').trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, error: 'Enter your email.' }, { status: 400 });
  }

  // Two limits. The client key stops one machine grinding through addresses;
  // the address stops many machines flooding one mailbox.
  const byClient = await rateLimit(`reset:${await clientKey()}`, 5, 60 * 60);
  const byEmail = await rateLimit(`reset-email:${email}`, 3, 60 * 60);
  if (!byClient.allowed || !byEmail.allowed) {
    return NextResponse.json({ ok: true });
  }

  const base = resetUrlBase();
  if (!base) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Reset is unavailable because this site has no OPB_SITE_URL set. Add it in your ' +
          'hosting dashboard and redeploy.',
      },
      { status: 503 }
    );
  }

  const token = await issueResetToken(email);
  if (token) {
    const content = await getPublishedContent();
    const mail = passphraseReset({
      siteName: content.settings?.fullName || content.seo?.siteTitle || 'your site',
      resetUrl: `${base}/admin/reset?token=${encodeURIComponent(token)}`,
      expiresMinutes: RESET_TTL_MINUTES,
    });
    await sendMail({ to: email, ...mail });
  }

  // The same answer whether or not that address owns this site. Anything else
  // turns this endpoint into a way to ask "does this person run this site?".
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Write the confirm route**

Create `app/api/auth/reset/confirm/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/core/storage/registry';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { consumeResetToken } from '@/core/auth/reset';
import { checkPassphraseStrength, hashPassphrase } from '@/core/auth/passphrase';
import { createSession } from '@/core/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  const limit = await rateLimit(`reset-confirm:${await clientKey()}`, 10, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts.' }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    token?: string;
    passphrase?: string;
  } | null;
  const token = body?.token ?? '';
  const passphrase = body?.passphrase ?? '';

  const strength = checkPassphraseStrength(passphrase);
  if (!strength.ok) {
    return NextResponse.json({ ok: false, error: strength.reason }, { status: 400 });
  }

  const email = await consumeResetToken(token);
  if (!email) {
    return NextResponse.json(
      { ok: false, error: 'That link has expired or has already been used.' },
      { status: 400 }
    );
  }

  const adapter = getStorageAdapter();
  const owner = await adapter.readOwner();
  if (!owner) {
    return NextResponse.json({ ok: false, error: 'This site has no owner.' }, { status: 400 });
  }

  // Bumping the epoch signs out everywhere. Without it, whoever forced the
  // reset keeps any session they already held, which defeats resetting.
  const epoch = owner.sessionEpoch + 1;
  await adapter.writeOwner({
    ...owner,
    passphraseHash: await hashPassphrase(passphrase),
    sessionEpoch: epoch,
  });

  await createSession(owner.email, epoch);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 7: Add the screen and the link**

Create `src/admin/pages/AdminResetPassphrase.tsx` handling two states — no token in the query, so ask for an email and POST to `/api/auth/reset/request`; a token present, so ask for a new passphrase and POST to `/api/auth/reset/confirm`, then navigate to `/` on success. Build it with Astryx components (`npx astryx component TextInput`, `npx astryx component Button`), no raw `<div>`, no hardcoded values.

Register it in the admin router at path `/reset` — **router-relative**, because the admin runs under `basename="/admin"` and `/admin/reset` would resolve to `/admin/admin/reset`.

Add a "Forgot your passphrase?" link to `src/admin/pages/AdminLogin.tsx` pointing at `/reset`.

- [ ] **Step 8: Verify the whole flow**

```bash
docker start opb-mail
rm -rf .opb
OPB_SMTP_HOST=localhost OPB_SMTP_PORT=1025 OPB_SITE_URL=http://localhost:3000 npm run dev
```

1. Claim the site, sign out.
2. Request a reset for the owner's address → mail appears in Mailpit.
3. Request one for `nobody@example.com` → the response is identical and no mail is sent.
4. Follow the link, set a new passphrase → signed in.
5. Follow the same link again → "expired or already used".
6. In another browser profile, sign in first, then reset from the original → the other profile is signed out.

- [ ] **Step 9: Update the documentation**

- `.env.example` — note that `OPB_SITE_URL` is required for reset, not only for canonical links.
- `README.md` — the "no email" bullet becomes "email is optional; without it there is no notification and no reset", and drop "if you forget your passphrase, delete `.opb/state/owner.json`".
- `ADMIN_SETUP.md` §1 — replace the same instruction with the reset flow.
- `docs/PLAN.md` — phase 8 gains a status block: SMTP, notification and reset done; registry, vault, other providers and OTP still absent.

- [ ] **Step 10: Full verification and commit**

```bash
npm run typecheck && npm run lint && npm run format:check && npm run build
TEST_MAILPIT_URL=http://localhost:8025 \
  TEST_POSTGRES_URL="postgres://postgres:postgres@localhost:55432/opb_test" \
  npm run test
node scripts/check-no-personal-data.mjs
git add -A
git commit -s -m "feat(auth): passphrase reset by email

Closes the recovery path the README apologised for: delete a row from your
own database. Tokens reuse the otp kv namespace, which already has a TTL and
is already conformance-tested on every backend, so this adds no storage.

Only the SHA-256 is stored, for the same reason sessions store only their
hash. Confirming burns the token before changing anything, so a replay
cannot land between the two, and bumps the owner epoch so whoever forced the
reset does not keep a session they already held.

The link's origin comes from OPB_SITE_URL and never from the Host header. A
link built from a caller-supplied host mails the owner a valid token
pointing at somebody else's domain, and this repository has made the
header-derived-authorization mistake once already."
```

---

## Self-review notes

Checked against the spec:

- §1 transport → Task 1. §2 visible failures → Task 6. §3 reset → Task 7. §4 messages surface → Tasks 2–5. §5 testing → Mailpit in Tasks 1 and 6, conformance in Tasks 2–4, CI in Task 1. §6 done-means → the verification steps in Tasks 5–7.
- **Export and import**: covered by Task 5's `setMessages`, which puts the server's list into `state.messages` — the field `exportBundle` already serialises. No separate change needed, and Task 5's manual verification should include an export.
- Types are consistent across tasks: `ContactMessage` gains `notifiedAt`/`notifyError` in Task 6 and is used as `Partial<ContactMessage>` by `MessagesAdapter.update` defined in Task 2, which accepts them without change.
