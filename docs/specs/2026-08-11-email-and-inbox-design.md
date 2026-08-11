# Enquiry notification, passphrase reset, and a durable inbox

> Design, 2026-08-11. Approved before implementation.
> Phase 8 in [../PLAN.md](../PLAN.md), taken out of order and reduced in scope.

## Why now

The README's list of what does not work opens with email, and it costs the
project twice. An enquiry lands in the admin inbox and nothing tells the owner
it arrived, so a portfolio quietly loses the exact thing it exists to produce.
And a forgotten passphrase has one documented recovery: delete a row from your
own database.

Both are the same missing piece. Neither needs the integrations registry the
plan puts first — that ordering exists to stop twenty-five bespoke admin
screens being written, and one integration configured by environment variable
writes no screens at all.

## Scope

**In:** an SMTP transport, notification on a new enquiry, passphrase reset, a
messages surface on the storage contract, and local tests for all of it.

**Out, deliberately:** the `IntegrationDefinition` registry, the encrypted
vault, a generic integrations screen, HTTP providers (Resend, Brevo), OTP
sign-in, autoreply to the sender, queueing and retry.

The registry is deferred because an abstraction over twenty-five services
designed from zero examples will be wrong in ways only a second consumer
reveals. Build one integration properly, then a simple second one (Turnstile),
then extract.

---

## 1. Transport — `core/email/`

```
core/email/
  transport.ts    resolve from env → 'smtp' | 'none'
  send.ts         sendMail() → SendResult
  templates.ts    the two messages
  __tests__/
```

### Configuration

| Variable            | Meaning                                     |
| ------------------- | ------------------------------------------- |
| `OPB_SMTP_HOST`     | Presence of this selects the SMTP transport |
| `OPB_SMTP_PORT`     | Defaults to 587                             |
| `OPB_SMTP_USER`     | Optional — Mailpit needs no credentials     |
| `OPB_SMTP_PASSWORD` | Optional                                    |
| `OPB_SMTP_SECURE`   | `1` for implicit TLS on 465. Default off    |
| `OPB_MAIL_FROM`     | Envelope and header From                    |

`OPB_`-prefixed because no platform sets `SMTP_HOST` for you. The storage
adapters accept vendor names — `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN` —
precisely because the platform writes those; nothing writes these.

**Precedence rule, fixed now so a vault is additive rather than a migration:**
an environment variable wins if present; otherwise the vault, once one exists.
This is the same rule that already governs storage adapter selection.

With no `OPB_SMTP_HOST`, the transport is `none` and every send is a no-op that
reports why. That mirrors `analytics.ts`: connect nothing and each call costs a
function call.

### Interface

```ts
type SendResult =
  | { ok: true }
  | { ok: false; reason: 'not-configured' | 'failed'; detail: string };

sendMail(input: { to: string; subject: string; text: string; html?: string;
                  replyTo?: string }): Promise<SendResult>;
```

**`sendMail` never throws and never rejects.** Callers decide what a failure
means, and no caller may let a mail failure fail the operation that triggered
it.

A ten-second timeout. An SMTP handshake against a wrong host can hang far
longer than a person will wait on a contact form.

Dependency: **nodemailer**. Package size stopped being an argument when Vercel
raised the function limit to 5GB.

---

## 2. Failures are visible or they do not count

Two optional fields on `ContactMessage`:

```ts
notifiedAt?: string;   // ISO, set when the notification was accepted
notifyError?: string;  // what the server said, when it was not
```

The inbox renders per message: _this one was not emailed, and here is why._

One addition to `contentHealth.ts`, joining the existing sixteen checks that
each link to the screen that fixes them:

- email not configured → "nothing tells you when an enquiry arrives"
- configured but the most recent notifications failed → surface the error

This section is not decoration. The two bugs fixed on 2026-08-11 — uploaded
images rendering as a blank pixel, and before that a contact form filing
enquiries into the sender's own browser — were both silent, and both invisible
specifically to the one person able to report them. A notification system that
failed quietly would be the third instance of the same mistake.

---

## 3. Passphrase reset

```
POST /api/auth/reset/request   { email }                  → always { ok: true }
POST /api/auth/reset/confirm   { token, passphrase }
```

**Request** answers `ok` whether or not the address matches the owner. Rate
limited on the client key _and_ on the email address, so one mailbox cannot be
flooded by rotating source addresses: 5/hour per client, 3/hour per address.

On a match: 32 random bytes as the token, `sha256(token)` stored in the
existing `otp` kv namespace with a 30-minute TTL, and a link mailed to the
owner. Storing the hash rather than the token follows the rule already applied
to sessions — a database leak must not be a live-credential leak.

**Confirm** looks the hash up, deletes it before use so it cannot be replayed,
writes the new passphrase hash, and **increments `sessionEpoch`**. Without that
last step, whoever forced the reset keeps any session they already held, which
defeats the reason for resetting.

### The reset link URL must come from `OPB_SITE_URL`

Never from the `Host` header. A reset link built from a caller-supplied host
mails the owner a link to the attacker's domain carrying a valid token — the
classic host-header password-reset theft.

This repository has already made this mistake once, in the claim flow, where
`Host: localhost` was treated as proof of loopback. The lesson is recorded in
the handoff notes as _never derive an authorization decision from a request
header_, and a reset link is an authorization decision wearing a URL.

If `OPB_SITE_URL` is unset outside development, `reset/request` refuses and
says why rather than guessing.

### Header injection

`clean()` in the contact route already strips control characters from every
field, and its comment anticipates exactly this: control characters are "a
classic way to smuggle headers into a notification email later." That function
becomes load-bearing the moment those values reach a mail header, so the
templates must place user content in the body, and only the sender's validated
address in `Reply-To` — nowhere else.

`Reply-To` set to the enquirer's address means the owner replies by hitting
reply, which is the entire point of the notification.

---

## 4. The inbox becomes a real storage surface

### The problem

Enquiries live inside `CMSState.messages` and are appended by reading the
published snapshot, unshifting, and writing it back. Two submissions arriving
together lose one. The conformance suite pins the underlying behaviour —
"survives concurrent writes with **one of them winning intact**" — which is
correct for a content document and wrong for an inbox.

They also share a row with published content, which publishing rewrites. Two
writers, unrelated purposes, one blob.

### The change

A `messages` surface on `StorageAdapter`, beside `kv` and `media`:

```ts
interface MessagesAdapter {
  append(message: ContactMessage): Promise<void>;
  list(options?: { limit?: number }): Promise<ContactMessage[]>; // newest first
  update(id: string, patch: Partial<ContactMessage>): Promise<void>;
  remove(id: string): Promise<void>;
}
```

**Two implementations, not four.** Supabase, Neon and generic Postgres share
`_shared/postgres.ts` — the reason the fourth adapter cost almost nothing.

- **Postgres:** `opb_messages (id text primary key, received_at timestamptz,
data jsonb)`, indexed on `received_at desc`. Append is an `INSERT`, atomic by
  construction, with `ON CONFLICT (id) DO NOTHING`.
- **Local:** one file per message under `.opb/messages/<id>.json`. Each append
  writes a distinct path, so concurrent appends cannot collide — which is
  precisely why this beats a lock.

### Migration

In `provision()`, which already runs on boot and is already required to be
idempotent: if the snapshot carries messages and the surface is empty, append
each and clear the array. Idempotent under concurrent boots because `id` is the
primary key and the insert ignores conflicts.

`POST /api/admin/publish` stops preserving `existing.messages`.

### The six consumers, and how they stay unchanged

`state.messages` is read in more places than the inbox screen: the sidebar's
unread badge, the command palette's unread count, the analytics page's enquiry
statistics, `contentHealth`'s unanswered-enquiries check, and five points in
`cmsService`.

Rather than rewrite all of them, the CMS context **fetches messages from the
server on admin boot and keeps populating `data.messages` with the result.**
The read shape does not change, so five of the six consumers need no edit at
all. What changes is where the array comes from, and that mutations go through
routes instead of `updateDraft`:

```
GET    /api/admin/messages          list
PATCH  /api/admin/messages/:id      { status }
DELETE /api/admin/messages/:id
```

Two places in `cmsService` get simpler as a side effect and should be deleted
rather than ported: `snapshot.messages = []` when versioning, and
`restored.messages = this.draftState.messages` when restoring — both exist only
to keep enquiries out of content history, which stops being possible to get
wrong once enquiries are not in the content.

**Export and import must still carry messages**, or a backup silently stops
being a backup. `exportBundle` gains a `messages` array read from the surface;
`importBundle` appends them. The bundle format version does not change, because
an older bundle without the key imports as "no messages", which is correct.

### The alternative that was rejected

A kv-based lock around the existing write. `kv.incr` is atomic on every backend
and conformance-tested, so it would genuinely fix the race for much less work.
Rejected because it leaves every enquiry rewriting the entire content blob, and
leaves two unrelated writers on one row. The race is the symptom; the shared
row is the cause.

---

## 5. Testing, entirely local

- **Mailpit in Docker** — `axllent/mailpit`, SMTP on 1025, HTTP API on 8025.
  Send, then assert against `GET /api/v1/messages`: real SMTP, real parsing, no
  mocks and no account. Tests skip when it is absent, the way the hosted
  storage tests already skip without credentials.
- **Conformance gains message assertions**, including concurrent appends losing
  nothing — the mirror of the existing snapshot concurrency test.
- **Unit** — transport resolution, template rendering, token hashing, expiry,
  single use.
- **CI gains a Mailpit service container**, so mail is covered the way Postgres
  already is.

## 6. Done means

1. `npm run test` green with Mailpit and Postgres containers running.
2. An enquiry submitted against a local instance arrives in Mailpit, with the
   sender's address in `Reply-To`.
3. Stopping Mailpit and resubmitting stores the enquiry, records `notifyError`,
   shows it in the inbox and raises the dashboard check — and returns success
   to the visitor, whose message was not lost.
4. A reset request for a non-owner address is indistinguishable from one for
   the owner.
5. A reset link works once, and a second use fails.
6. Resetting invalidates sessions issued before it.
7. Fifty concurrent `append` calls produce fifty stored messages, on both the
   local and the Postgres adapter. This is asserted against the adapter, not
   through the HTTP route — the contact form is rate limited to 5/hour per
   client, so a route-level concurrency test would measure the rate limiter
   rather than the storage.
8. An export taken after the migration contains the messages, and importing it
   into a fresh instance restores them.
9. `npm run typecheck && npm run lint && npm run format:check && npm run build`
   all clean.

## Risks

- **nodemailer is the first runtime dependency added since the storage work.**
  Pinned, and confined behind `send.ts` so replacing it touches one file.
- **The migration in `provision()` moves user data.** Guarded on the target
  being empty, conflict-ignoring on insert, and covered by a conformance test
  that provisions twice over a populated snapshot.
- **SMTP against a real provider is not covered by local tests.** Mailpit
  accepts everything; a real provider enforces SPF, DKIM and rate limits. This
  joins Vercel Blob on the list of things the cloud pass must verify.
