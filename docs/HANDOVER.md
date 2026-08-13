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
npm ci                          # ci, not install — see "Traps" below
npm run dev                     # http://localhost:3000
npm test                        # 686 passing, 7 skipped
npm run typecheck && npm run lint && npm run build
```

The skipped tests need containers:

```bash
docker run -d --name opb-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=opb_test \
  -p 55432:5432 postgres:16
docker run -d --name opb-mail -p 1025:1025 -p 8025:8025 axllent/mailpit
# Both the -e and the -p flags matter, in the same way and for the same ten
# minutes. Without POSTGRES_DB the image creates only a database called
# `postgres`, so the connection string below finds nothing and 90 tests fail
# with `database "opb_test" does not exist`. A Mailpit container created
# without -p is "healthy" and unreachable, and the four email tests fail with
# ECONNREFUSED. Both look like code bugs and neither is.

TEST_POSTGRES_URL="postgres://postgres:postgres@localhost:55432/opb_test" \
TEST_MAILPIT_URL="http://localhost:8025" npm test    # 782 passing, 2 skipped
```

Setting `TEST_POSTGRES_URL` without the container running is worse than not
setting it: the Postgres tests stop skipping and start failing, so a stopped
container reads as 90 broken tests.

Two observed flakes, recorded because they will happen to you and not because
they are understood.

The **first run after files change** has twice reported a handful of failures
— 2 once, 3 another time — that no re-run reproduced. Both times the next run
was clean and stayed clean across five or more repeats, including with
`node_modules/.vite` deleted to force a cold transform. Neither time were the
failing test names captured, which is the thing to fix: if it happens to you,
save the whole output before re-running. Transform time on those runs was
30s+, so a timeout under load is the obvious suspicion and nothing more
than that.

The other: the **first** run immediately after `docker start opb-pg` once
showed a single failure, which no subsequent run reproduced — not on a re-run,
and not after `docker restart` either. Most likely the first connection landing
while Postgres was still coming up. If a lone Postgres test fails on a cold
container, run it again before investigating it.

On later sessions the containers already exist — `docker start opb-pg opb-mail`.

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

### Architecture in three sentences

`app/` holds routes only. `core/` holds server-only domain logic — storage
adapters behind one contract, auth, email, content reads — and files there start
with `import 'server-only'` so a leaked credential is a build failure, except
`core/theme/*`, which deliberately runs in the browser too. `src/` still holds
the public site components (`src/views`, `src/components`) and the admin
(`src/admin`).

`site/` is a **separate application** — the marketing site, the help centre and
the developer docs. Its own `package.json`, its own toolchain, deliberately not
an npm workspace member, and excluded from the product's tsconfig, ESLint and
Prettier. It cannot live under the product's `app/` because the Deploy button
clones this repository into the user's GitHub account, which would put
`/alternatives/squarespace` on everybody's portfolio. See
[site/README.md](../site/README.md).

`site/`'s demo imports the product's real blocks, renderer, tokens and field
metadata, so **a change to a block definition changes the demo with no work in
`site/` — and can break it with none either.** It is not covered by the
product's tests, so `cd site && npm run build` after touching `core/blocks/*`.
It has no tests of its own; the build and a walk through `/demo/try` are the
check.

### Environment variables

All optional except where noted. Full list with commentary in
[.env.example](../.env.example); mail can also be configured from the admin.

| Variable                      | Meaning                                                    |
| ----------------------------- | ---------------------------------------------------------- |
| `OPB_SMTP_HOST`               | Presence of this alone selects the SMTP transport          |
| `OPB_SMTP_PORT`               | Defaults to 587                                            |
| `OPB_SMTP_USER` / `_PASSWORD` | Optional — Mailpit needs neither                           |
| `OPB_SMTP_SECURE`             | `1` for implicit TLS on port 465 only                      |
| `OPB_MAIL_FROM`               | Defaults to `no-reply@<your SMTP host>`                    |
| `OPB_SITE_URL`                | **Required for passphrase reset**, and for canonical links |
| `OPB_SETUP_TOKEN`             | Required to claim a site on any public host                |
| `OPB_ALLOW_INSECURE_COOKIES`  | `1` to test a production build over plain HTTP locally     |
| `OPB_DATA_DIR`                | Where the filesystem backend writes. Honour it — see below |

---

## What works, and how it was checked

Everything below was run, not reasoned about.

|                                | Verified by                                                                                                                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy → claim → login         | Fresh install, full HTTP walkthrough                                                                                                                                                                                                            |
| Second claim refused           | Same walkthrough                                                                                                                                                                                                                                |
| Build a page from blocks       | Browser: add block, reorder, edit, publish                                                                                                                                                                                                      |
| **Home page from blocks**      | Browser: outline becomes h1 hero → h2 cards → h3 items                                                                                                                                                                                          |
| Media picker                   | Browser: chose from library, filled `src` and `alt` together                                                                                                                                                                                    |
| Publish reaches visitors       | `curl` of the public HTML after publishing                                                                                                                                                                                                      |
| Draft preview                  | Preview showed the draft title; public showed the published one                                                                                                                                                                                 |
| Contact form → inbox           | HTTP round trip                                                                                                                                                                                                                                 |
| Contact form → email           | Real message delivered to Mailpit with correct headers                                                                                                                                                                                          |
| SMTP configured from the admin | Browser: entered settings, pressed Test, got a real connection                                                                                                                                                                                  |
| Storage conformance            | 21 assertions against real Postgres in Docker, in CI                                                                                                                                                                                            |
| Revisions and conflicts        | Two racing conditional writes; exactly one wins                                                                                                                                                                                                 |
| Docker self-host               | Container destroyed and recreated; owner and content survived                                                                                                                                                                                   |
| Uploads (local filesystem)     | HTTP upload, file on disk, served back                                                                                                                                                                                                          |
| Uploads (Docker + Postgres)    | Upload through the admin, file on the mounted volume, served back at 200                                                                                                                                                                        |
| Newsletter, end to end         | Sign up → Mailpit → confirm → CSV → one-click unsubscribe, on both the filesystem and Postgres                                                                                                                                                  |
| The browser demo               | Driven in a browser: sign in, the wizard, all thirteen screens rendering, editing a headline with the preview following, switching persona (content, theme, vocabulary and sidebar labels change together), light and dark, three device widths |
| Marketing site, 31 pages       | Static export served and walked in a browser: light and dark, 390px and 1280px, one h1, no skipped heading levels, no horizontal scroll                                                                                                         |
| Its own contrast rule          | `npm run check:contrast` in `site/`, wired into its build. Caught a muted grey at 4.04:1 that had already shipped into every eyebrow and table header                                                                                           |

### Supabase Storage: verified, and it was broken

Run against a real `storage-api` for the first time on 13 August 2026, via a
local `supabase start`. **The suite went 47 failed, 1 passed.** Two genuine
bugs, both the same shape:

Supabase Storage does not put its semantic status in the HTTP status. Creating
a bucket that already exists and deleting an object that does not both answer
**HTTP 400**, with the real code inside the JSON body —
`{"statusCode":"409","code":"BucketAlreadyExists"}` and
`{"statusCode":"404","code":"NoSuchKey"}`. Two call sites checked
`res.status !== 409` and `res.status !== 404`; neither could ever match, so
both threw on exactly the case they were written to tolerate.

The bucket one was severe. `provision()` runs once per process, so on a
serverless host it runs on every cold start — a Supabase deployment worked on
its first boot and then failed on **every** one after it, the whole adapter
rejecting rather than just uploads. Now 48/48, plus a claim, an upload and a
public fetch through the running app, with the object confirmed present in
Supabase's own listing.

The lesson worth keeping: 21 assertions that skip silently without credentials
look exactly like 21 that pass.

### Vercel Blob: verified too

Run against the real service on 13 August 2026 with a Hobby-tier token.
**48/48 first time, no bugs.** Then the same end-to-end walk as Supabase:
claim, upload through the admin, and an anonymous fetch that followed the 307
to `*.public.blob.vercel-storage.com` and came back byte-identical, with
nothing written to local disk.

Worth knowing for whoever repeats it: **this needs no deployment and no Neon
account.** The Neon adapter takes any Postgres through `DATABASE_URL`, so the
Docker Postgres proves the database half exactly as well as a hosted one
would. The only thing that requires Vercel is the blob token, which makes this
a twenty-minute job rather than a deployment exercise.
`scripts/verify-blob.sh` does the whole thing from a token in `.env.local`.

The store must be created with **public** access. The adapter uploads with
`access: 'public'` and `/api/media/<key>` 307s the visitor's browser straight
at the blob URL, carrying no token — private blobs would 403 for every visitor
on every published site.

### Both hosted backends are now verified

That was the project's headline gap for its whole life, and it is closed.
Supabase cost two real bugs; Vercel Blob cost none. What is left unverified is
smaller and named in "What is not built" below.

---

## What is not built

Ordered by how much a user would notice.

| Gap                                         | Notes                                                                                                                                                                                                                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The newsletter cannot send**              | By design. It collects, confirms and exports; broadcasting is a different product. It also needs SMTP configured, or sign-ups fail honestly with a 503                                                                                                                                            |
| **No mobile admin layout**                  | It installs and works on a phone; the editing screens were drawn for a desktop. The research sizes this at 10–20 days and calls it retention, not acquisition                                                                                                                                     |
| **No push notifications**                   | Needs VAPID and a real device. The service worker must carve out `/admin` first — see the Serwist trap below                                                                                                                                                                                      |
| **The marketing site does not auto-deploy** | Live at <https://getopenportfolio.vercel.app>, but as a prebuilt static upload — a snapshot of one build, not of `main`. Connect the repo in Vercel with Root Directory `site` and "Include files outside the Root Directory" on; the demo imports the product's real blocks from `../../../core` |
| **No hosted demo**                          | Less pressing than it was: `/demo/try` on the marketing site runs the admin and the site client-side, importing the product's real blocks and themes. A hosted `OPB_DEMO_MODE` instance would add real saving, uploads and email                                                                  |
| **Only three screenshots**                  | `site/public/shots/` has the public site, the page builder and the block outline, all of the real product with the photographer persona. None of them contains an actual photograph — every image slot in the demo content is an empty placeholder                                                |
| **24 block types**                          | Literal: `hero richText image gallery stats cards ctaBanner contactForm faq video split quote newsletter socialRow services download separator`. Record-placing: `collection writingList timeline logoWall testimonials skills steps`                                                             |
| **5 storage backends unbuilt**              | Firebase, Convex, Cloudflare D1+R2, PocketBase, Appwrite. Not advertised in the README. Each needs an emulator — do not ship one you have not run                                                                                                                                                 |
| **Passphrase auth only**                    | No passkeys, no email OTP                                                                                                                                                                                                                                                                         |
| **Themes change tokens, not layout**        | Six of them, and they do not rearrange a page. Less true than it was, since a page of record-placing blocks follows the records rather than fixed copy, but a theme still cannot change the arrangement itself                                                                                    |
| **Tailwind 4**                              | Deferred, not blocked. PR #7 is closed and Dependabot ignores the major line; tracked in issue #9, which lists the missing test first — nothing here asserts the built CSS, so the breakage would produce a green build and an unstyled site                                                      |

---

### Smaller known defects

Real, none blocking, none fixed.

- **The `unread-messages` health check pluralises wrongly** — "2 enquiry
  enquiries unread".
- **`/api/admin/messages` has no rate limiting**, unlike every sibling admin
  route. Owner-only and same-origin, so the risk is low.
- **An inert leftover after a crash.** If a process dies between the message
  migration's append and its snapshot-clear, a copy stays in that channel's
  snapshot and is never revisited, because the guard is destination-based.
  Self-heals on the next publish for `published`, not for `draft`.
- **A database hiccup renders as an empty inbox, not an error.**
  `app/api/admin/messages/route.ts` calls `messages.list()` outside its `try`,
  and `CMSContext` swallows a non-ok response.
- **`transport.test.ts`'s "implicit TLS only for the documented value" asserts
  only the positive case.** It never checks that `'true'` or `'0'` leave TLS
  off, so its title overstates what it proves.

---

## Invariants worth not breaking

Each was arrived at the hard way. Changing one is a decision, not a refactor.

**A mail failure must never lose an enquiry, and must never be silent.** The
contact route stores first and notifies second, and records the send outcome on
the message. This project has twice shipped bugs that were silent _and_
invisible specifically to the one person able to report them — uploaded images
that rendered as a blank pixel only the owner's own browser could resolve, and
before that a contact form that filed enquiries into the sender's own browser.
Do not make a third.

**`sendMail()` never throws.** Every failure is a returned value. A caller that
wraps it in a try/catch and swallows the reason has defeated the point.

**Never derive an authorization decision from a request header.** A
`Host: localhost` check in the claim flow was a real auth bypass. Reset links
come from `OPB_SITE_URL`. Cookies and environment only.

**Enquiries never travel inside published content.** `withoutEnquiries()` in
`core/content/sanitise.ts` strips them at the publish boundary — including out
of nested version snapshots, because the published document is serialised into
the HTML of every public page.

**`getStorageAdapter()` is async and provisions once per process.** Await it.
It was synchronous once, and the change fixed a defect where an upgraded
instance never created its `opb_messages` table.

---

## Adding a storage backend

One file in `core/storage/adapters/`, one line in `core/storage/registry.ts`,
env-var inference in `inferAdapterId()`, and a green run of
`core/storage/conformance.ts`. If it is SQL, reuse
`core/storage/adapters/_shared/postgres.ts` — Supabase, Neon and generic
Postgres all do, which is why the fourth one cost almost nothing.

**The conformance suite is not optional.** It has caught three real concurrency
bugs so far, two of which only appeared on one platform. An adapter without a
green run should not ship.

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
minimum that proves anything. The same shape recurred with `undefined` in a
patch: spreading it over an object removes the key, merging it as jsonb drops it
before it reaches the database and the old value survives — so clearing a spent
confirmation token worked on one backend and silently did not on the other.
Clearing is now an empty string, and the conformance suite asserts it.

**Copy goes stale in a way tests cannot see.** The marketing site's demo runs
the product's own `analyseContent` and `auditContrast` against seeded content,
and doing that immediately falsified two sentences that had been repeated
across the README, the help centre and the homepage. The dashboard does not run
"sixteen checks" — the count varies with the content, and the demo's produced
nineteen. And an unreadable palette is mostly _prevented_ by clamping at token
generation rather than refused at publish, so "set a pale accent and watch it be
refused" does not happen. Both had been true once. **If a sentence states a
number or a behaviour, something should exercise it.**

**A default that is only wrong when configured.** The Postgres adapter and the
media route each carried their own `path.join(process.cwd(), '.opb', 'media')`
and ignored `OPB_DATA_DIR`. With the variable unset — which is every test and
every `npm run dev` — the wrong expression and the right one give the same
answer, so 584 tests passed while `docker compose up`, the documented
one-command install, died on its first write with `EACCES: mkdir '/app/.opb'`.
There is now one `dataRoot()` and a test that sets the variable.

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

**Windows and Linux disagree about concurrent renames.** Linux allows a rename
onto a file another rename is touching; Windows returns `EPERM`. The filesystem
adapter serialises writes per path because of this, and the same fix caused
`ENOENT` on Linux before it was made per-path. A test passing on one platform is
not evidence about the other — Docker is right there.

**Prettier does not read `.gitignore`.** Generated and scratch directories have
to be listed in `.prettierignore` separately, or `format:check` fails on files
that are not part of the project. `.opb` and `.superpowers` are already there.

---

## Decisions already made — do not silently reverse these

| Decision                                                    | Why                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Astryx, not shadcn**                                      | The plan said rebuild the admin on shadcn. `CLAUDE.md` names Astryx as the admin's design system, and rewriting a working admin in a second library buys nothing a user sees                                                                                                                                                                                                            |
| **Snapshot-level revisions, not per-record writes**         | Solves lost updates, which is real today. The 400-post problem is not, and designing the record surface now means rebuilding Phase 7 against it later. Moved to Phase 9 with the blog                                                                                                                                                                                                   |
| **Reorder in an outline, not drag on a canvas**             | Buttons work with a keyboard and on a phone, and can be tested                                                                                                                                                                                                                                                                                                                          |
| **Blocks describe their editor as data**                    | `BlockField[]`, one generic form. A per-block editor makes the 30th block a React file too                                                                                                                                                                                                                                                                                              |
| **Heading level passed down, not from context**             | Context needs a Client Component, which would ship the whole content surface as JavaScript. It also returned HTTP 500                                                                                                                                                                                                                                                                   |
| **Feedback via GitHub device flow, not an intake service**  | An intake service means zero GitHub visits — and makes us the publisher of anonymous text, with forgeable attribution. See [IN-ADMIN-COMMUNITY.md](research/IN-ADMIN-COMMUNITY.md)                                                                                                                                                                                                      |
| **Unknown blocks quarantined, never dropped**               | Round-tripped verbatim, so an older build cannot destroy a newer build's content                                                                                                                                                                                                                                                                                                        |
| **Tailwind 3, not 4 — until the second theme**              | PR #7 is a version bump with none of the migration: the PostCSS plugin moved, the `@tailwind` directives are gone, and `tailwind.config.js` is no longer read, so every `bg-bg` and `text-text-primary` would compile to nothing. v4 also requires Safari 16.4+, which decides who can see a site built with this. PR #7 closed, Dependabot ignores the major line, tracked in issue #9 |
| **Content checks advise, schemas refuse**                   | A block is added before it is filled in. "Not finished" is advice; "not valid" is refusal                                                                                                                                                                                                                                                                                               |
| **Called "Open Portfolio"; "builder" lives in the tagline** | The name matches the repository and the address. The sentence under it still reads "portfolio website builder" because that is the phrase the research found people actually search with, and it is worth more in a description than in a name. `site/lib/site.ts` holds it once — do not write it out anywhere else                                                                    |
| **`BUNDLE_FORMAT` keeps the old spelling**                  | `open-portfolio-builder` is written into every backup anybody has taken and matched exactly on import. Renaming it to follow the product costs a third entry in `ACCEPTED_BUNDLE_FORMATS` and buys nothing a reader sees                                                                                                                                                                |

---

## What to do next, in order

**1. Verify uploads against Vercel Blob and Supabase Storage.** The single
highest-consequence unknown. Twenty minutes.

**2. Tag a first release.** Three shipped features read GitHub Releases and
currently find nothing: the update checker has no baseline, "What's new" is
empty, and duplicate detection cannot say "already fixed in v0.6.0" without
release dates to compare against. It also starts awesome-selfhosted's
four-month clock. See [GOING-PUBLIC.md](research/GOING-PUBLIC.md).

**3. Mobile admin layout.** The research sizes it at 10–20 days and calls it
retention rather than acquisition: people do not choose a portfolio builder for
its phone editor, but they do abandon one they cannot fix a typo in from a
train. It installs to a home screen already; the screens themselves were drawn
for a desktop.

**4. Connect the marketing site to git, and deploy the demo.** The site is
**live at <https://getopenportfolio.vercel.app>**, in the Vercel project
`open_portfolio` — but as a prebuilt static upload, so it is a snapshot of one
build rather than of `main`. To make it follow pushes: connect the repository,
set **Root Directory** to `site`, and turn on **"Include files outside the Root
Directory"** — required, because the demo imports the product's real blocks and
themes from `../../../core`. `SITE_URL` defaults to the live address and should
be set in the environment if a domain is ever bought; note it is read at build
time, so a prebuilt upload needs it set locally.

Until that is connected, deploy with **`cd site && npm run deploy`**. It builds,
stages `out/` and uploads. Do not upload `out/` by hand: a pre-built upload has
framework detection off, and with it off `cleanUrls` is not implied, so every
deep link 404s while the homepage looks perfect. `site/vercel.static.json` is
what supplies it — along with a `Content-Type` for `/opengraph-image`, which the
export writes as an extension-less file and Vercel would otherwise serve as
`application/octet-stream`.

A deploy does **not** move the public address. `getopenportfolio.vercel.app` is
an alias and stays on whatever it last pointed at, so finish with
`npx vercel alias set <the-new-deployment> getopenportfolio.vercel.app`. Skipping
it is silent: the CLI reports success, the new build is live on its own URL, and
the address you gave people still serves the old one.

Vercel Authentication must stay **off** for this project. It defaults to
`all_except_custom_domains`, which silently 302s every alias to an SSO login
while the auto-generated domain keeps working — so the site looks fine on one
address and is unreachable on the one you published.

The demo is a third deployment of the _product_ with `OPB_DEMO_MODE=1`; until
it exists, `/demo` says so rather than offering a button that does nothing.

**5. More screenshots, and some photography.** Three exist — the public site,
the page builder and the block outline — all of the real product with the
photographer persona. The research's shot list is longer: the wizard, the media
picker, the dashboard checks, the inbox, a phone frame. Keep the same persona;
mixing them is the fastest way to make a young product look like a mock-up. The
bigger gap is that not one shot contains an actual photograph, because every
image slot in the demo content is an empty placeholder — which on a
photographer's portfolio is the thing a visitor most wants to see.

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
