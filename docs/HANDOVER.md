# Handover

For whoever picks this up next — another machine, another session, another
person. Everything here was checked against the code on **12 August 2026**, not
recalled. Where something is unverified it says so.

Read this, then [PLAN.md](PLAN.md) for the reasoning behind each phase.

---

## What this is

A free, MIT-licensed, self-hosted, no-code portfolio website builder. Somebody
non-technical deploys it, claims it, and edits their whole site from `/admin`
without seeing a config file. Content lives in a backend they choose; the code
lives in their own repository.

It began as one person's personal portfolio with a browser-only CMS, where
publishing changed nothing for visitors and the passcode shipped in the public
JavaScript bundle. None of that remains.

---

## Run it

```bash
npm install
npm run dev                     # http://localhost:3000
npm test                        # 461 passing, 7 skipped
npm run typecheck && npm run lint && npm run build
```

The skipped tests need containers:

```bash
docker run -d --name opb-pg -e POSTGRES_PASSWORD=postgres -p 55432:5432 postgres:16
docker run -d --name opb-mail -p 1025:1025 -p 8025:8025 axllent/mailpit
# The -p flags matter. A Mailpit container created without them is "healthy"
# and unreachable, and the four email tests fail with ECONNREFUSED in a way
# that looks like a code bug for about ten minutes.

TEST_POSTGRES_URL="postgres://postgres:postgres@localhost:55432/opb_test" \
TEST_MAILPIT_URL="http://localhost:8025" npm test    # 539 passing, 2 skipped
```

To exercise it as a stranger would:

```bash
npm run build
PORT=3111 OPB_SETUP_TOKEN=t OPB_ALLOW_INSECURE_COOKIES=1 npm start
```

`OPB_ALLOW_INSECURE_COOKIES=1` is required on `http://localhost` — without it
the session cookie is `Secure`, the browser drops it, and login appears to do
nothing at all. That has cost time twice.

Docker: `docker compose up`. Verified end to end, including destroying the
container and recreating it against the same volume.

---

## What works, and how it was checked

Everything below was run, not reasoned about.

|                                | Verified by                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| Deploy → claim → login         | Fresh install, full HTTP walkthrough                            |
| Second claim refused           | Same walkthrough                                                |
| Build a page from blocks       | Browser: add block, reorder, edit, publish                      |
| **Home page from blocks**      | Browser: outline becomes h1 hero → h2 cards → h3 items          |
| Media picker                   | Browser: chose from library, filled `src` and `alt` together    |
| Publish reaches visitors       | `curl` of the public HTML after publishing                      |
| Draft preview                  | Preview showed the draft title; public showed the published one |
| Contact form → inbox           | HTTP round trip                                                 |
| Contact form → email           | Real message delivered to Mailpit with correct headers          |
| SMTP configured from the admin | Browser: entered settings, pressed Test, got a real connection  |
| Storage conformance            | 21 assertions against real Postgres in Docker, in CI            |
| Revisions and conflicts        | Two racing conditional writes; exactly one wins                 |
| Docker self-host               | Container destroyed and recreated; owner and content survived   |
| Uploads (local filesystem)     | HTTP upload, file on disk, served back                          |

### The one thing that matters and is not verified

**Uploads have never been run against Vercel Blob or Supabase Storage with real
credentials.** The code path is shared with the local backend and the
conformance suite covers the interface, but neither live service has been
touched.

For a portfolio builder this is the highest-consequence gap in the project: the
recommended deployment is Vercel + Neon + Blob, and the core act of a portfolio
is uploading a picture. **Do this before telling anyone to use it.** It needs a
free Vercel account and about twenty minutes.

---

## What is not built

Ordered by how much a user would notice.

| Gap                                  | Notes                                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Newsletter is rules only**         | `core/newsletter` has the schema, consent rules and tests. No endpoint, no form, no admin screen — nothing can store an address yet                           |
| **No mobile admin layout**           | It installs and works on a phone; the editing screens were drawn for a desktop. The research sizes this at 10–20 days and calls it retention, not acquisition |
| **No push notifications**            | Needs VAPID and a real device. The service worker must carve out `/admin` first — see the Serwist trap below                                                  |
| **No marketing site, no docs site**  | `research/LANDING-PAGE.md` is a 1,117-line spec with the copy already written                                                                                 |
| **7 block types of ~29**             | `hero richText image gallery stats cards ctaBanner`                                                                                                           |
| **5 storage backends unbuilt**       | Firebase, Convex, Cloudflare D1+R2, PocketBase, Appwrite. Not advertised in the README. Each needs an emulator — do not ship one you have not run             |
| **Passphrase auth only**             | No passkeys, no email OTP                                                                                                                                     |
| **Themes change tokens, not layout** | Six of them, and they do not rearrange a page. Different structures need more block types                                                                     |
| **Tailwind 4**                       | Deferred, not blocked                                                                                                                                         |

---

## Traps in this codebase

Each of these has already cost real time. They are not hypothetical.

**A change that reports success while doing nothing.** Three of four ESLint
`no-restricted-syntax` rules silently matched nothing, because a selector is a
JavaScript string and `\d` was consumed as an escape. Separately, a scripted
edit to `AdminHelp.tsx` matched nothing because the assertion was omitted, and
left two handlers referenced but undefined. **Always assert that an edit or a
rule actually fired.**

**Local state that hides a broken change.** A Dependabot merge passed against a
populated `node_modules` and failed on a clean `npm ci`. A Postgres migration
passed locally because the table already existed and failed every test on a
fresh CI database. **Test against empty.**

**Passing tests that prove nothing about the product.** 153 tests passed while
every block page returned HTTP 500 — they all checked block data and none
rendered anything. Every substantial bug this project has had was found by
running the thing, not by the suite.

**One implementation is not a contract.** The file-backed storage adapter passed
every revision test while real Postgres failed four. Two implementations is the
minimum that proves anything.

**Service workers ignore HTTP cache headers.** `/admin` sets `no-store`, and
that does not constrain Cache Storage. Serwist's default configuration caches
`GET /api/admin/messages` — the contact inbox, with visitors' names and email
addresses — for 24 hours in an origin-scoped cache that logging out does not
clear. It is also `NetworkOnly` in dev, so this cannot be reproduced with
`next dev`. See [MOBILE-AND-PWA.md](research/MOBILE-AND-PWA.md).

**React Router paths are relative to the basename.** The admin mounts at
`basename="/admin"`, so an absolute `/admin/projects` resolves to
`/admin/admin/projects`. Every sidebar link was broken this way and nothing
errored. A test now reads the hrefs.

**Reading the outside world during render.** `recentErrors()`, `navigator`,
`window.screen` — the React Compiler rejects the component and it is genuinely
wrong. Capture into state in an effect.

---

## Decisions already made — do not silently reverse these

| Decision                                                   | Why                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Astryx, not shadcn**                                     | The plan said rebuild the admin on shadcn. `CLAUDE.md` names Astryx as the admin's design system, and rewriting a working admin in a second library buys nothing a user sees                                                                                                                                                              |
| **Snapshot-level revisions, not per-record writes**        | Solves lost updates, which is real today. The 400-post problem is not, and designing the record surface now means rebuilding Phase 7 against it later. Moved to Phase 9 with the blog                                                                                                                                                     |
| **Reorder in an outline, not drag on a canvas**            | Buttons work with a keyboard and on a phone, and can be tested                                                                                                                                                                                                                                                                            |
| **Blocks describe their editor as data**                   | `BlockField[]`, one generic form. A per-block editor makes the 30th block a React file too                                                                                                                                                                                                                                                |
| **Heading level passed down, not from context**            | Context needs a Client Component, which would ship the whole content surface as JavaScript. It also returned HTTP 500                                                                                                                                                                                                                     |
| **Feedback via GitHub device flow, not an intake service** | An intake service means zero GitHub visits — and makes us the publisher of anonymous text, with forgeable attribution. See [IN-ADMIN-COMMUNITY.md](research/IN-ADMIN-COMMUNITY.md)                                                                                                                                                        |
| **Unknown blocks quarantined, never dropped**              | Round-tripped verbatim, so an older build cannot destroy a newer build's content                                                                                                                                                                                                                                                          |
| **Tailwind 3, not 4 — until the second theme**             | PR #7 is a version bump with none of the migration: the PostCSS plugin moved, the `@tailwind` directives are gone, and `tailwind.config.js` is no longer read, so every `bg-bg` and `text-text-primary` would compile to nothing. v4 also requires Safari 16.4+, which decides who can see a site built with this. Reasoning is on the PR |
| **Content checks advise, schemas refuse**                  | A block is added before it is filled in. "Not finished" is advice; "not valid" is refusal                                                                                                                                                                                                                                                 |

---

## What to do next, in order

**1. Verify uploads against Vercel Blob and Supabase Storage.** The single
highest-consequence unknown. Twenty minutes.

**2. Finish the newsletter.** The rules are written; the endpoint, the form, the confirm and unsubscribe routes and the admin screen are not. It is the smallest complete thing left.

**3. Tag a first release.** Three shipped features read GitHub Releases and
currently find nothing: the update checker has no baseline, "What's new" is
empty, and duplicate detection cannot say "already fixed in v0.6.0" without
release dates to compare against. It also starts awesome-selfhosted's
four-month clock. See [GOING-PUBLIC.md](research/GOING-PUBLIC.md).

**4. Mobile admin layout.** "Every portfolio looks the same" is the best-evidenced
complaint in the market research, and shipping one theme makes us the worst
offender in the field on that axis.

**5. The marketing site.** Every other launch asset points at it. Specified in
[LANDING-PAGE.md](research/LANDING-PAGE.md) as `OPB_DEMO_MODE`, a product
feature rather than an ops task — every hand-maintained sandbox in the
researched corpus is dead or retired.

**6. Then push notifications and the remaining adapters**, both of which need something this machine does not have — a real device, and five emulators.

Open decisions that are the maintainer's, not an engineer's, are listed at the
end of [PLAN.md](PLAN.md).

---

## Verifying your work

Claims in this repository are expected to be backed by something you ran.

- **Server rendering:** `curl` the route and grep the raw HTML. If it only
  appears after hydration, it is not server-rendered.
- **Auth:** check the failure cases. Wrong passphrase, no session, cross-site
  origin, a replayed reset link.
- **Storage:** the conformance suite against real Postgres in Docker.
- **Email:** send to Mailpit and read the headers.
- **Anything visual:** load it in a browser and check the console.
- **Any bug fix:** confirm the new test fails against the unfixed code first. A
  test that never failed proves nothing, and this rule has already caught a fix
  that did not work.

CI runs typecheck, lint, build, the personal-data denylist, gitleaks over full
history, and the storage conformance suite against a real Postgres service
container. It has caught two failures this project would otherwise have shipped.
