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
npm test                        # 1216 passing, 11 skipped (24 Oct 2026)
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

`app/` holds routes only — the whole admin included now (`(public)` for
login/reset, `(protected)` for everything else). `core/` holds server-only
domain logic — storage adapters behind one contract, auth, email, content
reads — and files there start with `import 'server-only'` so a leaked
credential is a build failure, except `core/theme/*`, which deliberately runs
in the browser too. `src/` holds the public site's components and views
(`src/components`, `src/views`) and its browser-side CMS; the legacy admin
that used to live in `src/admin` was deleted 2026-10-18
(`docs/ADMIN-REWRITE.md`).

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

| Gap                                            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The newsletter cannot send**                 | By design. It collects, confirms and exports; broadcasting is a different product. It also needs SMTP configured, or sign-ups fail honestly with a 503                                                                                                                                                                                                                                                                                                                                                                                                     |
| **~~No mobile admin layout~~**                 | Done 2026-10-18. The header is one 44px Menu button naming the section you are in, opening the same sections as 44px pills, instead of a 288px stack of links; every admin screen was measured at 375px for overflow and target size (the misses fixed, inline links inside sentences left alone as the WCAG exception), and the admin says when it is offline. What is still open is not mobile-specific: collection saves write the revision they just read rather than the one the screen loaded, so a stale save is not refused. See PROJECT-REVIEW.md |
| **No push notifications**                      | Needs VAPID and a real device. The service worker must carve out `/admin` first — see the Serwist trap below                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **~~The marketing site is deployed by hand~~** | Done. It builds from `main` and both published addresses follow production; verified by pushing and reading the result on the live site                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **No hosted demo, and none planned**           | Decided, not outstanding. `/demo/try` runs the admin and the site client-side from the product's real blocks and themes, and `docker compose -f docker-compose.demo.yml up` runs the full thing with real saving, uploads and email. A hosted instance would add nothing those two do not cover, and every hand-maintained demo in the research was dead or retired                                                                                                                                                                                        |
| **Only three screenshots**                     | `site/public/shots/` has the public site, the page builder and the block outline, all of the real product with the photographer persona. None of them contains an actual photograph — every image slot in the demo content is an empty placeholder                                                                                                                                                                                                                                                                                                         |
| **27 block types**                             | Literal: `hero richText image gallery stats cards ctaBanner contactForm faq video embed socialPost split quote newsletter comments socialRow services download separator`. Record-placing: `collection writingList timeline logoWall testimonials skills steps`                                                                                                                                                                                                                                                                                            |
| **5 storage backends unbuilt**                 | Firebase, Convex, Cloudflare D1+R2, PocketBase, Appwrite. Not advertised in the README. Each needs an emulator — do not ship one you have not run                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Sign-in needs no third party**               | A passphrase, a passkey or an emailed one-time code - all three exist; there is no social sign-in and no account provider to sign into. Recovery is the reset flow                                                                                                                                                                                                                                                                                                                                                                                         |
| **Themes change tokens, not layout**           | Six of them, and they do not rearrange a page. Less true than it was, since a page of record-placing blocks follows the records rather than fixed copy, but a theme still cannot change the arrangement itself                                                                                                                                                                                                                                                                                                                                             |
| **Tailwind 4**                                 | Re-evaluated 2026-10-18, **decided 2026-10-25: stay on 3.** The CSS-build guard compiles the real stylesheet now, and the full port is verified on the `tailwind4-attempt` branch (issue #9: gate green, computed styles identical to the v3 baseline, 18 alpha utilities fixed). The call went against adopting it: v4 requires Safari 16.4+, and a site that stops opening on an older phone is the wrong trade                                                                                                                                          |

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

**A build that only works on a machine with the other thing installed.** The
marketing site imports the product's source, and every one of the four things
that broke its first git deploy passed locally: a missing `zod`, a missing
`@types/react`, the product's Tailwind PostCSS config picked up two directories
away, and a tsconfig glob dragging in the product's test suite. All four
resolved fine here, off a `node_modules` the build machine has no reason to
have. **If one application reads another's source, the question is not "does it
build" but "does it build somewhere that has only its own dependencies".**

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

**React Router paths were relative to the basename — trap retired.** The
legacy admin mounted at `basename="/admin"`, so an absolute `/admin/projects`
resolved to `/admin/admin/projects`; every sidebar link was broken this way
and nothing errored. The App Router rewrite deleted the admin, the links and
the test that read them (2026-10-18, `docs/ADMIN-REWRITE.md`). Admin links are
ordinary Next `<Link href="/admin/…">` paths now.

**Reading the outside world during render.** `recentErrors()`, `navigator`,
`window.screen` — the React Compiler rejects the component and it is genuinely
wrong. Capture into state in an effect.

**Windows and Linux disagree about concurrent renames.** Linux allows a rename
onto a file another rename is touching; Windows returns `EPERM`. The filesystem
adapter serialises writes per path because of this, and the same fix caused
`ENOENT` on Linux before it was made per-path. A test passing on one platform is
not evidence about the other — Docker is right there.

**A build that failed on somebody else's dice (fixed 2026-10-23).** Google
Fonts occasionally answered a `next/font/google` stylesheet request with
extensionless `/l/font?kit=…` URLs instead of `/s/…/*.woff2` — roughly 1–2% of
responses per family (`vercel/next.js#99114`). Turbopack 16.3 could not parse
them ("next/font/google queries have exactly one entry"), and with thirty-five
catalogue families every fresh build rolled thirty-five dice; CI lost a run to
it on PR #25. The catalogue now loads through `next/font/local` from each
family's Fontsource package, so the files arrive with `npm ci` and the build
makes no font request at all — it passes with the network switched off. Do not
move a family back to `next/font/google`.

**Prettier does not read `.gitignore`.** Generated and scratch directories have
to be listed in `.prettierignore` separately, or `format:check` fails on files
that are not part of the project. `.opb` and `.superpowers` are already there.

**A metadata route inside a route group is served at a hashed address.**
`getMetadataRouteSuffix` in `next/dist/lib/metadata/get-metadata-route.js`
hashes the parent path of any `opengraph-image` / `twitter-image` / `icon` file
whose directory contains a `(group)` or `@parallel` segment. So
`app/(site)/writing/[slug]/opengraph-image.tsx` really answered
`/writing/<slug>/opengraph-image-cvh5yn`, while `buildMetadata`, the sitemap and
every page advertised the clean `/writing/<slug>/opengraph-image` — which
returned 404. Measured before the fix: 200 on the suffixed path, 404 on the
clean one, and the page itself perfect in both cases. The file lives outside
the group now (`app/writing/[slug]/opengraph-image.tsx`) and
`core/pages/__tests__/metadata-route-placement.test.ts` fails if one moves back
in. Next's own injected tags know about the suffix, so this only bites routes
whose URL we write by hand — which is every `opengraph-image` here.

---

## Decisions already made — do not silently reverse these

| Decision                                                    | Why                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Astryx, not shadcn**                                      | The plan said rebuild the admin on shadcn. `CLAUDE.md` names Astryx as the admin's design system, and rewriting a working admin in a second library buys nothing a user sees. Stands: nothing replaced the kit — the last component on it was ported to plain Tailwind on 2026-10-18                                                                                                                                |
| **Snapshot-level revisions, not per-record writes**         | Solves lost updates, which is real today. The 400-post problem is not, and designing the record surface now means rebuilding Phase 7 against it later. Moved to Phase 9 with the blog                                                                                                                                                                                                                               |
| **Reorder in an outline, not drag on a canvas**             | Buttons work with a keyboard and on a phone, and can be tested                                                                                                                                                                                                                                                                                                                                                      |
| **Blocks describe their editor as data**                    | `BlockField[]`, one generic form. A per-block editor makes the 30th block a React file too                                                                                                                                                                                                                                                                                                                          |
| **Heading level passed down, not from context**             | Context needs a Client Component, which would ship the whole content surface as JavaScript. It also returned HTTP 500                                                                                                                                                                                                                                                                                               |
| **Feedback via GitHub device flow, not an intake service**  | An intake service means zero GitHub visits — and makes us the publisher of anonymous text, with forgeable attribution. See [IN-ADMIN-COMMUNITY.md](research/IN-ADMIN-COMMUNITY.md)                                                                                                                                                                                                                                  |
| **Unknown blocks quarantined, never dropped**               | Round-tripped verbatim, so an older build cannot destroy a newer build's content                                                                                                                                                                                                                                                                                                                                    |
| **Tailwind 3, not 4 — decided 2026-10-25**                  | PR #7 was a version bump with none of the migration: the PostCSS plugin moves, the `@tailwind` directives go, and `tailwind.config.js` stops being read. All of it is done and verified on the `tailwind4-attempt` branch (issue #9), and the call went against adopting it — v4 requires Safari 16.4+, which decides who can see a site built with this, and the older phones still matter more than the migration |
| **Content checks advise, schemas refuse**                   | A block is added before it is filled in. "Not finished" is advice; "not valid" is refusal                                                                                                                                                                                                                                                                                                                           |
| **Called "Open Portfolio"; "builder" lives in the tagline** | The name matches the repository and the address. The sentence under it still reads "portfolio website builder" because that is the phrase the research found people actually search with, and it is worth more in a description than in a name. `site/lib/site.ts` holds it once — do not write it out anywhere else                                                                                                |
| **`BUNDLE_FORMAT` keeps the old spelling**                  | `open-portfolio-builder` is written into every backup anybody has taken and matched exactly on import. Renaming it to follow the product costs a third entry in `ACCEPTED_BUNDLE_FORMATS` and buys nothing a reader sees                                                                                                                                                                                            |

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

**4. ~~Connect the marketing site to git.~~ Done.** It is live at
<https://getopenportfolio.vercel.app>, builds from `main`, and both published
addresses follow production. It took five builds to get there; the four
settings that were missing are in the section above, and every one of them
passed locally first.

### The four settings a git build needs, and why

Every one of these was found by a build failing on Vercel after passing here,
and they all have the same cause: **this machine has the product installed and
the build machine does not.** `site/` imports the product's source, so anything
that source needs at build time has to exist on the other side too.

| Setting                                                    | Why                                                                                                                                                                                                        |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Directory** `site`                                  | Otherwise Vercel builds the product over the marketing site                                                                                                                                                |
| **Include files outside the Root Directory** on            | The demo imports `../../../core`                                                                                                                                                                           |
| **Install Command** `cd .. && npm ci && cd site && npm ci` | `core/**` resolves its bare imports from the _repository root's_ `node_modules`. A plain root-directory install leaves it without `zod`, and without `@types/react` it cannot type-check `core/primitives` |
| **`site/postcss.config.mjs`**, empty                       | Without it Turbopack walks up and loads the _product's_ PostCSS config, which requires `tailwindcss` — a dependency this application does not have and does not want                                       |

And one that is a `tsconfig` matter rather than a Vercel one: `site/tsconfig.json`
must **not** glob `../core/**` into `include`. The product reaches this program
by being imported, which TypeScript follows on its own; the glob additionally
dragged in the product's whole test suite, which wants `vitest`.

An import-graph walk cleared this application to build in isolation before any
of that was discovered — and it was right about what the _code_ imports. It said
nothing about what the _build_ requires, which is where all four of these lived:
a PostCSS config two directories up, a type package, a resolution root, and a
glob.

**`cd site && npm run deploy` still works** and is the way to push a build
without a commit. It builds, stages `out/` and uploads. Do not upload `out/` by
hand: a pre-built upload has framework detection off, and with it off
`cleanUrls` is not implied, so every deep link 404s while the homepage looks
perfect. `site/vercel.static.json` is what supplies it — along with a
`Content-Type` for `/opengraph-image`, which the export writes as an
extension-less file and Vercel would otherwise serve as
`application/octet-stream`. None of that applies to a git build, where Vercel
detects Next.js and handles both itself.

**Both public addresses are project domains now, so production follows
automatically.** `getopenportfolio.vercel.app` used to be a per-deployment alias
while `opb-site.vercel.app` was a project domain — meaning a deploy moved one and
left the other on the old build, silently: the CLI reports success, the new build
is live, and the address you gave people still serves the previous one. Both are
attached to the project, so `npx vercel alias set` is no longer part of
deploying. If a third address is ever added, attach it as a **project domain**
rather than aliasing a deployment, or the same trap returns.

Vercel Authentication must stay **off** for this project. It defaults to
`all_except_custom_domains`, which silently 302s every alias to an SSO login
while the auto-generated domain keeps working — so the site looks fine on one
address and is unreachable on the one you published.

**There is deliberately no third deployment.** A hosted `OPB_DEMO_MODE`
instance was considered and dropped: `/demo/try` already lets somebody use the
admin and see the published site without an account, and `docker compose -f
docker-compose.demo.yml up` gives the full thing with real saving, uploads and
email. A hosted one would add only convenience, and it would be a thing somebody
has to keep alive — which every hand-maintained demo in the researched corpus
failed to be.

The product itself is not deployed anywhere either, and does not need to be. It
is a template people deploy for themselves; the one thing worth doing once is
pressing the Deploy button end to end to prove that path works, which is a test
rather than infrastructure.

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

---

## Remaining work (Updated 26 October 2026)

All backlog items for the 0.6.0 milestone have been implemented, verified, and shipped:

**1. Cloudflare live media-proxy proof — DONE 2026-10-25.** Verified against
the production build (`.next/standalone/server.js`) with `OPB_ADAPTER=cloudflare`:
instance claim with setup token, owner upload to `/api/admin/media`, anonymous
byte-identical GET through `readBytes` with correct `Cache-Control` and
`X-Content-Type-Options` headers, SVG upload rejected at ingress, missing-key 404,
and D1/R2 state persisted to disk.

**2. Convex backend — DONE 2026-10-26.** Implemented in `core/storage/adapters/convex.ts`
using pure HTTP REST (`/api/query`, `/api/mutation`, `/api/storage/upload`) with zero heavy
external dependencies. Registered in `core/storage/registry.ts`, environment inferred from
`CONVEX_URL` / `CONVEX_DEPLOYMENT`, and fully verified with 66/66 passing conformance tests
in `core/storage/__tests__/convex.test.ts`.

**3. Per-record readers + blog — DONE 2026-10-25.** Pushed as commit `68c9f31`:
per-post mutable draft records in `writing-draft` with individual revisions,
content-addressed immutable bodies in `writing-bodies` (SHA-256), metadata-only
draft and published snapshots, paginated index (`?page=`, `WRITING_PAGE_SIZE = 10`)
wrapped in React `Suspense` for Partial Prerendering, RSS 2.0 with `content:encoded`
rendered via purpose-built block-to-HTML serializer, and backup bundle v2 with
records and bodyKey integrity checks.

**4. Axe full multiplication — DONE 2026-10-26.** Static matrix in
`core/blocks/__tests__/a11y.test.tsx` expanded across all blocks, structural
variants, and all 6 theme presets (`editorial`, `terminal`, `gallery`, `warm`,
`bold`, `minimal`), passing 47/47. Browser matrix in `e2e/axe.spec.ts` expanded
across responsive viewports (`mobile` 390×844 and `desktop` 1440×900) and modes
(`dark`, `light`), plus `/admin/writing` in `e2e/golden-path.spec.ts`, passing 31/31.

**5. Admin rewrite (27 screens, SPA → App Router) — DONE 2026-10-18.**
See [ADMIN-REWRITE.md](ADMIN-REWRITE.md).

**6. Cloudflare Workers REST binding — DONE 2026-10-26.** Implemented in
`core/storage/adapters/cloudflare-rest.ts` using Cloudflare's D1 REST API and
R2 Object REST API with queue-serialised conditional writes. Registered in
`core/storage/registry.ts`, and verified with 67/67 passing conformance tests
in `core/storage/__tests__/cloudflare-rest.test.ts`.

**7. P2 Block & Media items — DONE 2026-10-26:**

- **Dedicated stack-of-links block (`links` block):** Built in `core/blocks/standard.tsx`
  with title, URL, subtitle, badge/tag, highlight styling, and WCAG-compliant
  48px touch targets.
- **Focal-point crop:** Implemented in `core/primitives/index.tsx` (`Media` component),
  `core/blocks/definitions.tsx`, and `core/blocks/standard.tsx` supporting focal point
  keywords (`top`, `center`, `bottom`, `left`, `right`), percentage strings, and
  clamped coordinate objects. Verified with unit tests in
  `core/primitives/__tests__/media.test.tsx`.

Local dev-instance note: an early passkey test overwrote `.opb/state/owner.json`
with a fake. Content in `.opb/content` is untouched — delete
`.opb/state/owner.json` (and any `kv-session*` files) and re-claim at `/setup`.
