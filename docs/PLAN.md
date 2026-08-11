# Implementation plan and status

> **This file is the source of truth for where the project stands.**
> The plan below is unchanged from when it was written. What has been added is a
> status block under every phase heading, and a handoff section at the end.
> Read [Status at a glance](#status-at-a-glance) first, then jump to the phase
> you are picking up.
>
> The unannotated original is archived at [PLAN-ORIGINAL.md](PLAN-ORIGINAL.md)
> if you want the reasoning as it stood before any code was written.
>
> Last updated: 2026-08-11 · Version 0.5.0 · CI green on `main`.
> Read [Handoff notes](#handoff-notes-for-whoever-picks-this-up) first if you
> are starting on a new machine — it carries the running instructions, the
> invariants, and every known bug.

## Status at a glance

| Phase                       | State              | What it means                                                              |
| --------------------------- | ------------------ | -------------------------------------------------------------------------- |
| 0 — Repo publishable        | **Done, verified** | MIT, no personal data, CI, guards                                          |
| 1 — Next.js + SEO           | **Done, verified** | Server-rendered, real metadata, sitemap, 404                               |
| 2 — Tokens + primitives     | **Partially done** | Tokens, gate, primitives done. Tailwind 4 remains                          |
| 3 — Storage contract        | **Done, verified** | Contract, local adapter, registry, server read                             |
| 4 — Auth                    | **Done, verified** | Passphrase + sessions. **Passkeys/OTP not built**                          |
| 5 — Write path              | **Done**           | Publish, contact, blocks, pages, preview, revisions                        |
| 6 — Hosted adapters         | **Done, verified** | Supabase, Neon, Postgres. **Uploads unverified**                           |
| 7 — Admin (Astryx)          | **In progress**    | Page builder and media picker work. **Settings merge, block home remain**  |
| 8 — Adapters + integrations | **Partially done** | Registry, vault, SMTP-from-admin done. **5 backends, OTP missing**         |
| 9 — Blog, themes, presets   | **Barely started** | Only profession vocabulary packs                                           |
| Community + updates         | **Done**           | Reports, dedupe, update workflow, `UPDATING.md`. **Blocked: repo private** |
| Self-hosting (Docker)       | **Done, verified** | `docker compose up`, volume survives container replacement                 |
| 10 — Launch                 | **Researched**     | Four dossiers written. **Nothing built: no site, no demo, no PWA**         |

**Where to start:** make the repository public and tag `v0.5.0`. It takes
minutes, has no dependencies, and is the only thing in this document on a clock
— several discovery channels count months from the day of publication, and five
shipped features are broken until then. After that, the demo, because everything
in the launch plan points at it and it is the one asset that cannot be borrowed
or written.

The product itself is further along than the phase numbers suggest: a person can
sign in, build a page from blocks, choose images from their library, connect a
mail server without touching a config file, test it, preview the result and
publish it — all verified in a browser, end to end.

This supersedes an earlier note here that said to start with blocks on the
grounds that the primitives "need blocks to have somewhere to live". That has it
backwards: primitives are what blocks compose _from_. Build blocks first and
they get written against raw Tailwind, then rewritten once the primitives land —
exactly the build-it-twice this plan warns about elsewhere. The existing
sections in `src/components` are a perfectly good proving ground for `Band`,
`Grid`, `Prose` and the rest, and they need the tokens that now exist.

The publish-time contrast gate is smaller still and `checkContrast` is ready, so
it is a reasonable warm-up.

**What works today:** a stranger can deploy this, claim it, answer four
questions and have a live portfolio they can edit without touching code. An
enquiry now emails them, and a forgotten passphrase is recoverable.

**What does not:** no blog, no themes beyond the one, no block builder, the
admin is the old component kit, and email covers only transactional SMTP —
no alternate providers, no integrations registry or secrets vault, no OTP.

**Fixed:** `/admin/welcome`'s Skip link used to be inert — it navigated without
setting `fullName`, so `AdminLayout`'s guard bounced straight back to it, on the
first screen every new deployer meets. Skipping and finishing now both record
the choice in `localStorage` (`src/admin/welcomeDismissed.ts`), and the guard
honours it. Inferring "never set up" from the content is right for deciding
whether to _offer_ the wizard and wrong for deciding whether to _force_ it.
Verified in a browser against a clean instance.

---

## Finishing locally, before any cloud account

Almost all of the remaining work can be built and genuinely verified on one
machine with Docker. That is worth knowing before paying for anything: the list
of things that truly need a hosted service is short, and none of them block
development.

### What Docker covers

| Remaining work                                | Local equivalent                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| Phase 2 primitives, ESLint bans, publish gate | Nothing external needed                                                     |
| Phase 5 blocks, pages, `draftMode()` preview  | Nothing external needed                                                     |
| Phase 7 admin: MediaPicker, builder polish    | Nothing external needed                                                     |
| Phase 9 blog, newsletter capture, themes      | Nothing external needed                                                     |
| Postgres / Supabase / Neon **database** half  | `postgres:16` — already wired; with Mailpit takes the suite from 342 to 420 |
| Supabase **Storage** half                     | `supabase start` runs the real `storage-api` container                      |
| Email send path                               | `axllent/mailpit` — already wired                                           |
| PocketBase, Appwrite adapters                 | Both ship official Docker images                                            |
| Cloudflare D1 + R2 adapter                    | `wrangler dev --local` (Miniflare) emulates both                            |
| Firebase adapter                              | The Firebase Emulator Suite                                                 |
| Convex adapter                                | `convex dev` runs a local backend                                           |
| Turnstile (spam)                              | Cloudflare publishes always-pass and always-fail test keys                  |
| Umami (analytics)                             | Self-hosts in Docker                                                        |

**All five missing storage adapters can be written and conformance-tested
without a single account.** That was not obvious and it changes the ordering:
Phase 8's adapters are no longer gated on anything.

### What genuinely needs the cloud

Four things, and only four:

1. **Vercel Blob.** Proprietary, no emulator. It is also what the Deploy button
   provisions, so it is the highest-priority cloud check.
2. **Real SMTP deliverability.** Mailpit accepts everything; a real provider
   enforces SPF, DKIM and rate limits.
3. **The Deploy button itself** — Vercel Marketplace auto-provisioning, and the
   claim flow on a genuinely public URL with `OPB_SETUP_TOKEN` set.
4. **Deployed-URL measurements** — Lighthouse budgets, securityheaders.com and
   Mozilla Observatory.

### Suggested order

1. **Phase 2 remainder** — the publish-time contrast gate is small and
   `checkContrast` is ready; then Tailwind 4 (PR #7), now unblocked.
2. ~~**Phase 5 blocks and pages**~~ — done. Blocks, pages, routing, preview and
   revisions all shipped; the record-per-row storage split moved to Phase 9.
3. ~~**Phase 7 `MediaPicker`**~~ — done. The shadcn rebuild is cancelled; see
   Phase 7 for why, and for what is left in it.
4. **Phase 8 adapters** — five files, each against its own local emulator.
5. **Phase 8 integrations registry + vault** — now with two real consumers
   (SMTP and Turnstile) to design the abstraction against, rather than none.
6. **Phase 9** — blog, newsletter, themes, presets.
7. **Only then:** one cloud pass covering all four items above at once.

---

## Context

`d:\Projects\Open Portfolio Builder` began as one person's personal portfolio with a browser-only CMS bolted on. The goal is to turn it into a launchable open-source product that students, designers, developers, photographers, writers and others can deploy themselves, on free tiers, and run entirely from an admin UI with no developer help.

**The current architecture cannot deliver that**, and the reasons are structural, not cosmetic:

- Content lives in the _editor's own browser_ (IndexedDB). Visitors see whatever seed data was compiled into the JS bundle. **Clicking Publish changes nothing for visitors.**
- `submitContactMessage` ([cmsService.ts:421](src/cms/services/cmsService.ts#L421)) writes enquiries to the _visitor's_ IndexedDB. The owner never receives a message. The form has always been a no-op.
- `VITE_ADMIN_PASSCODE` is compiled into the public bundle in plaintext; the session is an unsigned `{expiresAt}` in localStorage ([cmsService.ts:643-685](src/cms/services/cmsService.ts#L643-L685)) that anyone forges in one console line. The only guard is a client-side redirect ([AdminLayout.tsx:34-36](src/admin/layouts/AdminLayout.tsx#L34-L36)).
- No server ⇒ no email, no OTP, no secret-keeping. `SEOSettings` is fully editable and **read by nothing**; every route serves one hardcoded `<title>`. No OG unfurls, near-zero crawlability.
- `uploadMedia` ([cmsService.ts:482](src/cms/services/cmsService.ts#L482)) stores raw `File` objects with no size cap, no byte sniffing, and classifies SVG as first-class — stored XSS the moment a server exists.
- 102 occurrences of the owner's name across 17 files; `public/` holds a personal résumé, two personal photos, 4 client screenshots and **10 third-party trademarked client logos** (Bank Asia, Apex, Mumuso…) that cannot legally ship in an MIT template.
- No LICENSE, no tests, no CI, no ESLint config (`npm run lint` is a broken script — eslint isn't even a dependency), no error boundaries, no 404 page.

**Outcome:** a Next.js application where content lives in a backend the user picks, the admin is genuinely secure, every page is crawlable and shareable, and a non-technical person goes from a Deploy button to a personalised live site without seeing an API key.

---

## Locked decisions

| Decision      | Choice                                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | **Next.js App Router** (latest), React 19, TypeScript strict, **Tailwind v4**, **shadcn/ui** admin                                             |
| Repo shape    | **Single app, modular folders** (`/core`, `/adapters`, `/themes`, `/integrations`), boundaries ESLint-enforced so later extraction is possible |
| Storage       | **8 user-selectable adapters**: Supabase, Firebase, Convex, Cloudflare D1+R2, PocketBase, Neon+Vercel Blob, Appwrite, Local                    |
| Distribution  | **Self-host template** (Deploy button). Data model stays multi-tenant-capable                                                                  |
| Setup         | **Both paths, auto by default** — Vercel Marketplace auto-provisioning (no keys shown) + documented manual path for any host                   |
| Auth          | **Passkey first, email OTP as recovery**                                                                                                       |
| Content model | **Typed collections + block/page builder.** Merge `projects`+`caseStudies` → `work`; `experience`+`education` → `timeline`                     |
| Themes        | **6 built-in themes AND ~95 deep design tokens**                                                                                               |
| Presets       | **7 fully authored** profession presets                                                                                                        |
| Blog          | Full no-code blog (Tiptap), RSS, sitemap, Giscus comments                                                                                      |
| Newsletter    | **Capture at launch** (double opt-in + export); broadcast sending in v1.1                                                                      |
| Integrations  | Analytics+spam, engagement+comments, auto-import, media+monitoring — ~25, one generic admin screen                                             |
| Licence       | **MIT**. English only. Full feature set before public launch                                                                                   |

---

## Architecture

### Folder layout

```
/app                    routes only — thin, no logic
/core                   framework-agnostic domain (server-only)
  /content              schema, blocks, pages, snapshot, publish, seed, health, dates
  /auth                 passkey, otp, sessions, claim, guard, csrf
  /media                refs, upload orchestration, validation
  /security             rateLimit, headers, csp, origin
  /config               env resolution, adapter inference
/adapters               contract + 8 implementations + conformance suite
  /_shared/sql          Drizzle core: pg | sqlite | d1 dialects
  /_shared/s3           S3-shaped media (R2, Supabase Storage, Appwrite)
/themes                 default, editorial, minimal, bold, terminal, photo-grid
/integrations           definitions/ + registry + vault + runtime
/presets                7 folders, each pure data + assets
/components/ui          shadcn primitives
/admin                  shadcn compositions
```

### The load-bearing idea: two read paths

> **STATUS — only one of the two paths exists.** The public snapshot path is
> built and proven. The authoring path is not: the contract has no per-record
> content surface at all — no `list`/`get`/`put`/`remove`/`bulkPut`, no
> `getSingleton`/`putSingleton`. Content is read and written as one whole
> document. (`media` and `messages` have their own list/put/remove, but those
> are separate surfaces, not this one.)
>
> That is fine for a portfolio and **not** fine for what Phase 9 needs: a
> 400-post blog cannot live in one JSON document, and per-record autosave has
> nothing to save into. Build this before the blog, not after.

- **Authoring path — normalised records.** Admin reads/writes one record at a time with pagination and optimistic concurrency (`revision`). Makes a 400-post blog and per-record autosave possible.
- **Public path — one denormalised snapshot.** Publish rebuilds a single JSON blob under one key. Every public render is **one** adapter read, identical on all 8 backends, trivially cacheable. Snapshot excludes full post bodies (posts paginate separately) so it stays bounded.

### Adapter contract (`/adapters/contract.ts`)

Key departures from today's `ContentStore`:

- **Media returns a URL, never a Blob.** `getMedia(): Promise<Blob>` ([storage/types.ts:28](src/cms/services/storage/types.ts#L28)) forces `hydrateMediaBlobs()` to download _every_ asset at boot. Replaced by `resolveUrl(key) → string`. The `idb:` protocol and the whole object-URL registry ([mediaUrls.ts](src/cms/utils/mediaUrls.ts)) are deleted.
- **Adapters declare `capabilities`** (`durable`, `auth`, `fileStorage`, `fullTextSearch`, `realtime`, `transactions`, `listQueries`). Admin screens **hide** unsupported features rather than breaking.
- **Adapter config lives in env vars only, never in the database** — config is what tells you how to reach the database. Resolves the chicken-and-egg completely.
- Surfaces: `readSnapshot/writeSnapshot`, `list/get/put/remove/bulkPut`, `getSingleton/putSingleton`, `media`, `kv` (sessions/OTP/rate-limits/locks — deliberately _not_ content, so auth state is never exportable), optional `auth`, optional `transaction`.
  **As built, the contract has:** `readSnapshot/writeSnapshot`, `readOwner/writeOwner`, `media`, `messages`, `kv`, `health`, `provision`. The per-record and singleton surfaces were never written; `auth` and `transaction` were not needed, because sessions are minted in one place for every backend.

**Eight public adapter IDs, three engines.** Supabase/Neon/Cloudflare/PocketBase share `_shared/sql` (Drizzle, 3 dialects); Cloudflare-R2/Supabase-Storage/Appwrite share `_shared/s3`; Firebase, Convex and Local are bespoke. Each still exports its own id, display name, docs URL and capabilities, so the user-facing promise holds without eight divergent codebases.

**Every adapter must pass `/adapters/_conformance/suite.ts`** (~60 assertions: round-trip, slug uniqueness, revision conflict, cursor stability, snapshot etag, upload→resolveUrl→remove, kv TTL). No green run, no ship. _This is what makes eight adapters survivable._

**`local` vs demo.** IndexedDB cannot be a server adapter. Split honestly: `local` = JSON + files under `.opb/` (real server adapter, default for `npm run dev` and VPS/Docker; the registry refuses it in production on ephemeral hosts). `demo-idb` = client-only, behind `NEXT_PUBLIC_OPB_DEMO=1`, for the public demo site only.

### Auth

Adapter auth is an identity **verifier**, never the session mechanism — so all 8 backends share one session model and one `requireOwner()`.

- **Passkey (WebAuthn) registered at claim time** is the primary factor. No email provider, no DNS, no deliverability, phishing-resistant. Email OTP is recovery once mail is configured; a recovery passphrase (Argon2id) is the last resort. `/admin/login` only offers methods actually available on this instance.
- Session = opaque 256-bit token in an `httpOnly; Secure; SameSite=Lax` cookie; stored server-side as `session:<sha256(token)>` so a DB leak is not a session leak. 30-day sliding / 90-day absolute. Not a JWT — instant revocation, identical on every backend.
- **Claim flow:** `OPB_SETUP_TOKEN` (auto-generated by the Deploy template) → else a 15-minute boot window with a one-time code written to the platform's function log (visible only to the deployer). Claim is atomic under a `kv` lock re-checking `owners.count === 0`. After claim, `/setup` is permanently 404.

### Five mechanisms so an unprotected `/admin` is impossible

> **STATUS — two of these five exist. Measured, not assumed.**
>
> | #   | Mechanism                                      | Built?                                                                                                                                |
> | --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
> | 1   | `app/admin/(protected)/` route group           | **No.** The admin is one client-side catch-all; there is no server route group to guard by existence                                  |
> | 2   | Every handler calls `requireOwner()`           | **Yes** — all three of `api/admin/{media,messages,publish}`. `api/media/[...key]` is deliberately open: it is the public image server |
> | 3   | CI AST guard (`tests/guarded-actions.test.ts`) | **No**                                                                                                                                |
> | 4   | `instrumentation.ts` boot assertion            | **No**                                                                                                                                |
> | 5   | Middleware redirect + `noindex`                | **Yes**                                                                                                                               |
>
> **Mechanism 3 is the one to build next.** Mechanism 2 currently holds by
> diligence rather than by construction — nothing stops the next admin route
> shipping unguarded, which is precisely the failure the AST guard exists to
> make impossible. When it is written, `app/api/media/[...key]` belongs on its
> allowlist.

1. `app/admin/(protected)/layout.tsx` calls `await requireOwner()` — a new page inside the group is guarded by existence.
2. **Every** server action and route handler calls `requireOwner()` independently. Server Actions are publicly-callable HTTP endpoints; layout guards do not protect them. _This is the most common App Router security mistake._
3. **CI AST guard**: `tests/guarded-actions.test.ts` walks `app/admin/_actions/**` and `app/api/{admin,media,preview,revalidate}/**` and fails the build on any exported async function that doesn't call `requireOwner` (or isn't in an explicit allowlist).
4. `instrumentation.ts` refuses to serve in production when `OPB_SESSION_SECRET` is missing or the resolved adapter is `local` on an ephemeral platform.
5. Middleware adds `X-Robots-Tag: noindex` and redirects sessionless requests — **UX and defence-in-depth only, explicitly not the authorization boundary.**

### Content model

**Typed collections + blocks as views over them.** Not "everything is a block": records need URLs, per-record SEO, RSS membership, tags, sort, filter and cross-references; a block is a _placement_. Arrangement stays free because `collection`, `featureItem`, `timeline`, `logoWall`, `testimonials` and `skills` are views with `source`/`filter`/`layout` props. Two sentences the user must learn: **your stuff lives in collections; your pages arrange it.**

Migration map:

| Today                                                                                                                                               | Becomes                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `sections[]` ([HomePage.tsx:23-34](src/pages/HomePage.tsx#L23-L34) fixed registry)                                                                  | Deleted → blocks on a seeded Home page. Lossless field mapping                                                                 |
| `projects` + `caseStudies`                                                                                                                          | **`work`** — optional `story: { blocks }` decides depth. 301 redirects seeded for `/case-studies/:slug`                        |
| `experience` + `education`                                                                                                                          | **`timeline`** with `kind: 'work'\|'education'\|'other'`                                                                       |
| `brands` → `logos` (+`group`), `recommendations` → `testimonials`, `capabilityGroups` → `skills`, `processSteps` → `steps`, `artifacts` → `gallery` | 1:1, derived `number`/`year`                                                                                                   |
| `microcopy` (45 keys)                                                                                                                               | ~2/3 deleted — they were strings lifted out of JSX and now live in block props. ~10 genuinely global keys → `settings.strings` |
| `CaseStudyBlock` 11-variant union (dead)                                                                                                            | Deleted; data maps into the one real block system                                                                              |

**Blocks:** versioned per-block envelope (`{id, type, v, props, frame, hidden, anchor, role}`). `frame` is the _entire_ presentation vocabulary — `width`/`spacing`/`surface`/`divider`/`align`/`flip`, **enums only, no px, no colours**. There is no path from the UI to "20px purple Comic Sans". ~29 block types across identity, work, credentials, conversion, utility. Unknown types are quarantined and round-tripped, never dropped.

**Twelve mechanisms keep non-designer arrangements safe** — no free-form styling; **no nested layout containers** (the #1 source of four-column text on a phone); intrinsic `auto-fit minmax()` grids so `columns: 4` means _at most_ 4; `clamp()` type only; automatic heading hierarchy via context; alt text required at the picker; contrast guaranteed at the token layer; live content-length checks; overflow detection in the preview; prose clamped to `--measure`; and a **kitchen-sink CI matrix** — every block × every variant × 6 themes × light/dark × 390/768/1440, through axe-core. _Adding a block without adding it to the kitchen sink fails CI._

**Blocks × themes contract:** blocks own semantics, themes own tokens, neither imports the other. Blocks may only compose from ~17 closed primitives (`Band`, `Measure`, `Grid`, `Heading`, `Prose`, `Card`, `Media`, `Button`…), enforced by ESLint bans on colour/size utilities and arbitrary values inside `core/blocks/**` and `themes/**`. **A theme that ships only tokens is a complete theme.** There is deliberately no per-block override hook — that is the crack the whole contract leaks through.

**Tokens:** primitive → semantic → component, ~95 tokens generated from ~10 author-facing inputs (brand colour, neutral temperature, radius, density, type scale, fonts…). OKLCH ramps via `culori`; **APCA contrast enforced four ways** — derive `--text-on-accent` rather than ask; live "use #0E9E6B instead" suggestions in the picker; a publish-**blocking** health issue below threshold; and clamping at generation so even a neon accent yields usable subtle/link/border roles. Tokens are **server-rendered into a scoped `<style>`** — today's `useEffect` write to `documentElement` ([CMSContext.tsx:83-104](src/cms/context/CMSContext.tsx#L83-L104)) flashes the default palette on every load.

---

## Phases

Each phase ends with a runnable, deployable app.

### Phase 0 — Make the repo publishable (~1 week)

> ### DONE — verified
>
> Every name occurrence removed, personal media and all ten trademarked client
> logos deleted, history squashed and force-pushed over `main`. MIT LICENSE,
> CONTRIBUTING, CODE_OF_CONDUCT, SECURITY.md, issue/PR templates, Dependabot,
> ESLint 9 flat config (`npm run lint` was previously a script with no eslint
> installed), Prettier, CI.
>
> **Verified:** the `check:personal-data` guard passes and runs in CI; gitleaks
> is clean across full history; 0 personal blobs reachable from any remote ref.
>
> **Fixed on the way:** the footer resume link never went through
> `resolveAssetUrl`, so an uploaded PDF produced a dead `idb:` href. And `xs:`
> was used but never declared as a Tailwind breakpoint, so the full-name
> wordmark was permanently hidden.

Do this **first**. Every hour spent migrating the owner's real content to Next.js is an hour spent moving something that must be deleted.

- Remove all 102 name occurrences; delete `src/data/*.ts` (10 files) and rewrite [initialData.ts](src/cms/data/initialData.ts) as generic demo packs.
- Delete `public/` personal media (résumé, 2 photos, 4 client screenshots) and **all 10 client logos**. _Legal:_ MIT grants rights in our copyright, not in Bank Asia's trademark; nominative fair use covers the owner's own site, not redistribution to thousands of strangers. Replace with fictional CC0 wordmarks. Same for client screenshots (client IP, plausibly NDA'd). Delete the on-disk `dist/` (4 MB of copies).
- **Squash history to one orphan commit** — deleting files in a new commit does not remove the blobs from a repo about to go public.
- Rename storage keys under `opb.*`. Bundle format → `'open-portfolio-builder'` with `ACCEPTED_BUNDLE_FORMATS` compat (validated at [cmsService.ts:588](src/cms/services/cmsService.ts#L588)) and a golden-file test.
- Fix hardcoded identity in [Navbar.tsx:57,58,95](src/components/Navbar.tsx#L57-L58) — the only non-CMS-driven name in the UI.
- LICENSE (MIT), CONTRIBUTING (DCO, not CLA), CODE_OF_CONDUCT, SECURITY.md (GitHub Private Vulnerability Reporting), issue/PR templates.
- ESLint 9 flat config + jsx-a11y + Prettier + `.editorconfig` (fixes the broken `lint` script). Delete dead code: `supabaseClient.ts`, `pdf-lib`, `AdminListRow.tsx`, 5 dead appearance fields, `revokeAllMediaBlobs`.
- CI: typecheck, lint, build, `check:personal-data` (denylist), gitleaks over full history, `knip`.
- Rotate the passcode currently in `.env.local` — it shipped in a client bundle.

### Phase 1 — Next.js scaffold + public site (2–3 weeks)

> ### DONE — verified
>
> Next.js 16 App Router. Per-route `generateMetadata`, Open Graph and Twitter
> tags drawn from the SEO settings that previously nothing read. `sitemap.ts`,
> `robots.ts`, a real 404, an error boundary, a skip link.
>
> **Verified:** all routes return 200, an unknown slug 404s, OG tags are present
> in the raw HTML, zero console errors in a real browser.
>
> **Deviations from plan:** `src/pages` became `src/views` (Next treats a
> `pages` directory as the Pages Router and refuses to build alongside `app`).
> The admin still runs on React Router inside one Next route — transitional,
> see Phase 7. Components were marked `'use client'` in bulk rather than pushed
> down to leaves; that optimisation is outstanding.
>
> **Fixed on the way:** `ThemeContext` read `localStorage` in a `useState`
> initialiser, so a stored light theme disagreed with the server and React
> discarded the server HTML for the entire tree.

Port `src/components/**` and `src/pages/**` bodies into `themes/default/**`. `'use client'` on the **17 files importing framer-motion**; `useCMS()` → props; `react-router-dom` → `next/link`. Port `src/styles/index.css:23-112` and `tailwind.config.js theme.extend`. Move the anti-flash theme script into `app/layout.tsx` with a CSP nonce. Delete `vite.config.ts`, `index.html`, `src/App.tsx`, `src/main.tsx`, `MainLayout.tsx`.
_Risk: theme hydration mismatch → keep the blocking script verbatim, `suppressHydrationWarning` on `<html>`, never branch on theme to produce markup._

### Phase 2 — Content core + tokens + primitives (2 weeks)

> ### TOKENS DONE — primitives and the publish gate remain
>
> **Done:**
>
> - `core/theme/contrast.ts` — WCAG contrast, derived readable foregrounds,
>   nearest-passing-shade suggestions.
> - `core/theme/tokens.ts` — 39 semantic tokens per mode, generated from the six
>   colours the appearance editor already collects. Every on-colour comes from
>   `readableForeground`, and anything that would fail 4.5:1 against its own
>   background is walked toward the readable extreme until it passes, so a neon
>   accent yields a usable site rather than an unreadable one.
> - Server-rendered into a `<style>` in `app/layout.tsx`. The palette is correct
>   at first paint; the `useEffect` that wrote six variables to
>   `documentElement` — and flashed the built-in colours on every load — now
>   runs only inside the draft preview, where the server genuinely does not know
>   the colours yet.
> - The hand-picked palettes are gone from `src/styles/index.css`. One source of
>   truth for every colour.
>
> **Verified:** 26 token tests, including seven hostile colour pairs (neon green
> on black, yellow on white, mid grey on mid grey) that must still produce
> readable body text and a legible label on an accent fill. The generated dark
> palette lands on the hand-picked one it replaced — `--text-primary` `#f5f5f2`,
> `--border-color-hover` `#2a2a2a` against the previous `#2b2b2b` — and a test
> pins that so a change to the mixing cannot quietly redesign the site.
>
> **Two bugs found by writing the tests, both mine:** the contrast walk took its
> direction from a luminance threshold while the foreground came from a contrast
> comparison, and the two disagree in the mid-tones, so a mid-grey background
> produced secondary text that failed at every step. And recession was expressed
> as a negative mix amount, which clamps to zero — the footer and every sunken
> surface came out exactly equal to the background. Sinking is now an absolute
> step toward black, which is the only form that reads as depth in both themes.
>
> **Remaining:**
>
> - ~~The ~17 primitives~~ **Done — 13 of them, plus the layout token half they
>   needed.** `core/primitives/` ships `Band`, `Measure`, `Stack`, `Grid`,
>   `Heading`, `Text`, `Eyebrow`, `Prose`, `Card`, `Divider`, `Media`, `Button`,
>   `Metric` and `Pill`, with `BlockFrame` and the heading-level context.
>
>   Building them surfaced something the plan had not accounted for: **there
>   were no non-colour tokens at all.** `tokens.ts` generated colour and nothing
>   else, so a primitive had no `--space-*`, `--measure`, `--radius-*` or type
>   scale to read. `core/theme/layout-tokens.ts` adds them, emitted once on
>   `:root` rather than duplicated into both mode blocks, since none of them
>   change between light and dark.
>
>   Every type step is a `clamp()`, so there is no way to produce a 72px
>   headline on a 390px screen. `Grid` uses
>   `auto-fit minmax(min(--card-min-N, 100%), 1fr)` and takes no breakpoint
>   props, so `columns: 4` is a maximum rather than a promise and cannot
>   overflow. `Heading` takes its _level_ from position and its _size_ from the
>   author, so reordering blocks cannot produce h1 → h3 → h2. `Media` requires
>   an alt decision — a `decorative` flag, not an optional field.
>
>   23 tests cover the invariants rather than the rendering: every surface pairs
>   a background with a foreground, every frame value resolves through a token
>   and never a literal, every enum member has a style, and the type scale
>   ascends without inverting at its small end.
>
>   Not built: `Overlay`, `Icon`, `Anchor`, `Metric`'s trend variant. They have
>   no consumer until blocks exist, and a primitive with no consumer is a guess.
>
> - An ESLint rule banning colour/size utilities and arbitrary values inside
>   `core/blocks/**` and `themes/**`. Without it the block/theme contract leaks.
>   `core/blocks/` still does not exist, so the rule has nothing to guard — write
>   it in the same change as the first block, not before and not after.
> - ~~The publish-time gate~~ **Done.** `core/theme/audit.ts` checks nine
>   foreground/background pairs in both modes; `contentHealth` reports it as
>   blocking, and `POST /api/admin/publish` refuses with 422 — enforcement at
>   the boundary, because the dashboard is advice and a direct call to the
>   endpoint must not be able to put unreadable text in front of visitors.
>   Scoped to contrast alone: other "blocking" health issues are judgement
>   calls, and refusing all of them would make publishing feel broken.
>
>   **Writing its tests found two real defects in the shipped palette.**
>   `--text-muted` was enforced at 3:1, but it carries captions, dates and meta
>   labels — small text, so 4.5:1 applies. It shipped at 4.22:1 in dark and
>   3.24:1 in light. And `--link-color` reused the accent's 3:1 value, shipping
>   links at 3.02:1 in light mode. Both now derive their own 4.5:1 value, which
>   costs some of the visual step down from secondary text — the right trade,
>   since a hierarchy nobody can read is not a hierarchy.
>
>   **And one defect in the audit itself:** it first held ordinary borders to
>   3:1, which failed the default palette at 1.12:1 and would have blocked every
>   new install from publishing. WCAG 1.4.11 covers components needed to
>   identify a control or its state, not decorative hairlines between sections.
>   Borders are no longer checked; the focus ring still is.
>
> - Fonts are still applied client-side by `loadGoogleFonts`, so the family name
>   is right only after hydration. Server-rendering them means getting the font
>   catalogue onto the server without dragging `react-icons` with it.
> - **Tailwind 4 — PR #7 is open and deliberately held.** It replaces the JS
>   config with CSS-first `@theme`. The tokens now exist, so this is unblocked.
>
> The content core (schema, dates, health, listOps) was **not** moved into
> `core/` — it still lives under `src/cms/`. It works; tidy it when convenient.

`core/content/schema` (today's [cms.ts](src/cms/types/cms.ts) moved + zod mirror), snapshot split, ports of `dates.ts`, `contentHealth.ts`, `listOps.ts`, `socialPlatforms.ts` (**split the react-icons half out** or it drags the icon library into every server module). Token generator + contrast validator + the 17 primitives + Default theme + the ESLint/CI bans.

### Phase 3 — Adapter contract + `local` + read path (2 weeks)

> ### DONE — verified
>
> `core/storage/contract.ts`, the `local` filesystem adapter, the registry that
> infers a backend from environment variables, and `getPublishedContent()`.
>
> **Verified:** a snapshot written to disk is picked up and rendered by the
> server, `<title>` included.
>
> **Deviations:** the `idb:` scheme and `src/cms/utils/mediaUrls.ts` still exist,
> because the admin continues to use IndexedDB for drafts — and, for content
> uploaded before uploads moved server-side, for media too. New uploads no
> longer use it. The bundle migration script the plan describes was never needed
> and does not exist.
>
> **Fixed on the way:** probing for the pre-rename database _created_ an empty
> one named after the original owner on every fresh install.

Contract, conformance suite, `local` adapter, `getPublishedSnapshot()` (React `cache` + `unstable_cache`, tag `content`). Wire `generateStaticParams`/`generateMetadata`/`sitemap.ts`/`robots.ts`/`opengraph-image.tsx` — **SEO works for the first time.**
_Riskiest step: media reference rewrite._ `scripts/migrate-bundle.ts` must be checksum-keyed, idempotent, resumable, `--dry-run` first. Silent data loss is the only unrecoverable failure in this plan.
_`generateStaticParams` must never fail the build_ — try/catch → `[]`, so a paused free-tier DB yields a dynamic site, not a red build.

### Phase 4 — Auth, before any admin UI (2 weeks)

> ### DONE — verified, but **passkeys were not built**
>
> scrypt-hashed passphrases, opaque session tokens in httpOnly cookies (only the
> SHA-256 is stored server-side), a 30-day sliding window inside a 90-day
> absolute limit, an owner epoch for "sign out everywhere", rate limiting,
> same-origin enforcement, and a first-run claim flow gated on
> `OPB_SETUP_TOKEN` in production.
>
> **Verified:** wrong passphrase and wrong email give identical rejections;
> publishing without a session returns 401; a cross-site POST returns 403; a
> second claim attempt is refused.
>
> **Passphrase reset by email now exists** (Phase 8), so a forgotten passphrase
> is no longer "delete a row from your own database". Tokens reuse the `otp` kv
> namespace; only the sha256 is stored, the token is burned before the
> passphrase changes, and `sessionEpoch` is bumped so whoever forced the reset
> does not keep a session they already held.
>
> **DEVIATION FROM A LOCKED DECISION:** the plan chose _passkey first, email OTP
> as recovery_. Neither is implemented — authentication is passphrase-only.
> This was a deliberate scope call rather than an oversight: passphrase auth
> already closes the bundled-secret hole, and WebAuthn plus an email provider is
> a phase of its own. **The session machinery is built to carry them** — add a
> verifier that returns an identity and call `createSession()`. For passkeys,
> `@simplewebauthn/server` and `@simplewebauthn/browser`.
>
> **Fixed on the way:** a **Host-header auth bypass I introduced** — the claim
> flow treated `Host: localhost` as proof the request was loopback, so a
> stranger could have claimed a deployed site without the setup token. Caught by
> an automated security review. The same pattern was in the cookie `Secure`
> decision. Both now derive from environment only.
> **Do not reintroduce header-derived authorization.**

Passkey + OTP + sessions + claim + CSRF + rate limiting + CSP/headers. `requireOwner()` **deny-by-default**. Delete [cmsService.ts:637-685](src/cms/services/cmsService.ts#L637-L685) and `VITE_ADMIN_PASSCODE`.

### Phase 5 — Write path, publish, blocks, pages (3 weeks)

> ### PARTIALLY DONE — publishing works, **blocks and pages do not exist**
>
> **Done and verified:** `POST /api/admin/publish` writes the snapshot
> server-side and calls `revalidatePath`, so publishing genuinely reaches
> visitors. The contact form delivers to the server instead of into the
> sender's own browser. Both verified end to end against Postgres.
>
> **The block system now exists.** `core/blocks/` ships the versioned envelope,
> a registry, defensive parsing, per-block-type migrations, the renderer, and
> seven block types (hero, richText, image, gallery, stats, cards, ctaBanner)
> composed only from primitives. The `frame` vocabulary landed with the
> primitives in Phase 2.
>
> Three decisions in it are load-bearing:
>
> - **Nothing throws.** One malformed block costs that block, not the page. The
>   old content system validated the whole document at once, so a single bad
>   field blanked everything.
> - **Unknown and future blocks are quarantined, not dropped** — round-tripped
>   verbatim, so opening a page written by a newer build and saving it does not
>   silently strip what this build could not read.
> - **Versioning is per block type.** A hero change does not force every other
>   block to bump, and migrations run forward only: a block from a newer version
>   is quarantined rather than guessed at, because reading it optimistically is
>   how a downgrade corrupts data.
>
> **The ESLint boundary rule is in place** and verified by writing a deliberate
> violation of each of its four cases. Worth knowing: three of the four
> originally matched nothing, because an ESLint selector is a JavaScript string
> and `\d` was consumed as an escape before ESLint saw it. A rule that never
> fires proves exactly as much as a test that never fails.
>
> **A test caught a real design flaw before anyone met it:** `image` and
> `gallery` required a non-empty `src`, so adding either from the palette
> quarantined it instantly. A block is added before it is filled in — that is
> the whole interaction — so "not finished yet" belongs in a content check,
> where the answer is advice, not in the schema, where it is refusal.
>
> **Pages and routing now exist too.** `core/pages/` owns the record, the slug
> rules and the channel-aware read; `app/(site)/[...slug]` serves them. A page is
> an address, a title, an ordered list of blocks and its own SEO — and it joins
> the sitemap, the navigation and preview without any further wiring.
>
> Two deviations from the plan, both deliberate:
>
> - **`[...slug]`, not `[[...slug]]`.** An optional catch-all also matches `/`,
>   which collides with the home route and is a build error. Home stays a real
>   route until the theme's sections become blocks.
> - **Slugs are checked against the routes that exist.** Static routes beat a
>   catch-all, so a page whose slug is `work` would save, appear in the admin and
>   never once load. `checkSlug` refuses it and suggests `my-work` instead. A
>   test walks the route directories and fails if the reserved list drifts — so
>   adding `app/(site)/blog` in Phase 9 without reserving `blog` breaks the build
>   rather than shadowing somebody's page a release later.
>
> **Preview is real.** `draftMode()` plus a draft channel: `/api/preview` is
> owner-gated (a preview token in a URL ends up in a browser history and cannot
> be revoked), `/api/admin/draft` writes the draft snapshot, and the previewed
> page carries a banner that says so and offers the way out. Previewing a site
> with no draft falls back to what is live, because with no unsaved changes that
> is the honest answer. The draft save deliberately skips the contrast gate that
> publishing runs — a work in progress may be unreadable; a published site may
> not.
>
> **The route-guard test landed here too**, ahead of schedule, because this slice
> added endpoints. It walks `app/api/**` on the syntax tree and fails the build
> on any exported handler that does not reach `requireOwner()`, with an
> allowlist that demands a written reason and rejects stale entries. Verified by
> adding an unguarded route and watching it fail. Its first run reported two
> _correctly_ guarded routes as unguarded — both extract the check into a local
> helper — so it now follows one level of local indirection: a test that fails
> correct code teaches people to write worse code to appease it.
>
> **Revisions and conflict detection are in**, and this is where the plan was
> deliberately narrowed. The plan asked for per-record writes; what shipped is
> optimistic concurrency on the snapshot — `readSnapshotMeta` returns a revision,
> `writeSnapshot` takes one and refuses if it has moved on, and both saving and
> publishing return 409 with the _other_ version attached rather than a bare
> "someone else changed this".
>
> The reason for narrowing: the two problems per-record writes solve are lost
> updates and documents too big to rewrite. The first is real today — a laptop
> and a phone, two tabs, an afternoon gone silently. The second is not: a
> portfolio has dozens of records. Splitting storage per record would mean
> designing the record surface now and building Phase 7 against it, then
> redesigning both when the blog arrives with the access patterns that actually
> justify it. The record split moves to Phase 9, with the blog.
>
> **Two implementations of one contract is the only reason this was correct.**
> The file-backed adapter passed every revision test while real Postgres failed
> four: `INSERT … ON CONFLICT DO UPDATE … WHERE revision = expected` cannot
> express a conditional update, because guarding the insert leaves no row to
> conflict _with_, so the update branch never runs. It is now a CTE that either
> updates a matching row or inserts when the caller expected nothing. The
> conformance suite also caught the test shim silently dropping the argument —
> which would have made the whole feature look like it worked.
>
> **Remaining in this phase:**
>
> - The kitchen-sink CI matrix. It needs more than one theme and an axe run, so
>   it belongs with Phase 9's themes rather than here. The render tests in
>   `core/blocks/__tests__/render.test.tsx` are its seed.
> - The remaining ~22 block types.
> - Authoring. Until Phase 7 there is no UI to create a page, so the seeded
>   example page is the only one — shipped as a draft, so nothing appears on a
>   stranger's live site that they did not publish.
>
> **Also not done:** the `work` merge (`projects` + `caseStudies`) and the
> `timeline` merge (`experience` + `education`) that the locked decisions chose.
> All four collections still exist separately, so the 301 redirects the plan
> mentions are not needed yet.
>
> **The contact inbox left the content snapshot.** Enquiries were appended by
> reading the published document, unshifting and writing it back, so two
> arriving together lost one — and the conformance suite pinned that as correct,
> which it is for a content document and is not for an inbox. They now have
> their own `messages` surface on the contract: one file per enquiry on the
> local adapter, one row on Postgres. Publishing strips them, including out of
> nested version snapshots, because the published document is serialised into
> the HTML of every public page.
>
> Drafts still live in the browser's IndexedDB; only _published_ content,
> uploaded media and enquiries are server-side. Two people editing from two browsers would not
> see each other's drafts.
>
> **Fixed on the way: uploaded images never reached visitors.** `uploadMedia`
> wrote the bytes to the editor's own IndexedDB and put an `idb:<id>` reference
> in the content. Publishing sent that reference to the server, where it means
> nothing, so `resolveAssetUrl` fell through to its 1x1 transparent GIF —
> silently, with no broken-image icon and no console error, and only for other
> people. The owner's browser still had the blob, so the site looked right to
> the one person who would have noticed. Uploads now go through
> `POST /api/admin/media` into the configured storage adapter, and content
> records `/api/media/<key>`, which stays correct across a change of backend.
> Bytes are accepted on their leading bytes rather than their filename, so an
> HTML page named `.pdf` and an SVG carrying `onload` are both refused.

Per-record writes with revision checks; publish (validate → version → bulkPut → `writeSnapshot` → `revalidateTag`); `draftMode()` preview replacing the `?preview=true` iframe. Block schema + registry + validation + migration harness + renderer with the first 6 blocks and the kitchen-sink matrix **from day one**. Catch-all `[[...slug]]` routing. Keep `MAX_VERSIONS = 20` and the snapshot-excludes-history decision ([cmsService.ts:284-298](src/cms/services/cmsService.ts#L284-L298)) — both were right.

### Phase 6 — Adapters #2 and #3, _before_ the admin UI (2 weeks)

> ### DONE — verified, with one gap
>
> Supabase, Neon + Vercel Blob, **and** a generic Postgres adapter (a bonus that
> covers Railway, Render, Fly, Coolify and self-hosted). One shared SQL engine
> behind all three. A 21-assertion conformance suite that every backend must
> pass.
>
> **Verified:** 59 tests green against a real Postgres in Docker, including the
> atomic rate-limit counter, expiry, namespace isolation, the jsonb round-trip,
> and the rule that auth state never appears inside a content export. The whole
> app — claim, sign in, publish, serve — was run against Postgres end to end.
>
> **GAP:** file uploads to **Supabase Storage and Vercel Blob have still not
> been run against the live services.** The database half of both adapters is
> proven. The object-store half is now genuinely reachable — the admin uploads
> through `POST /api/admin/media` into whichever adapter is configured, verified
> end to end on the local backend — but nobody has yet pointed it at a real
> Supabase project or Blob store. Set the credentials, run
> `npx vitest run core/storage`, and upload one image through the admin before
> recommending either for production use.
>
> **Fixed on the way:** two genuine concurrency bugs in the local adapter, both
> caught by the conformance suite. A fixed `.tmp` filename made concurrent
> writes throw `ENOENT` on Linux; fixing that exposed `EPERM` on Windows. Writes
> are now serialised per path.

Supabase (built-in auth, presigned storage) and Neon+Vercel Blob (SQL, **no** built-in auth, separate blob service) — structurally the most different pair available. If the contract survives both plus `local`, it survives the rest. **Highest-leverage risk reduction in the plan; do not skip it to reach screens faster.**

### Phase 7 — Admin (4–5 weeks)

> ### IN PROGRESS — the page builder works end to end
>
> **The shadcn rebuild is cancelled.** This repo's `CLAUDE.md` names Astryx as
> the admin's design system and instructs every screen to be built from it.
> Rewriting a working Astryx admin in a second component library would be churn
> that contradicts the project's own standing instruction, and it would buy
> nothing a user can see. Phase 7 is therefore "build the missing screens in
> Astryx", not "rebuild the existing ones in shadcn".
>
> **Built:** `/admin/pages` — create a page, set its address with live checking,
> choose draft or published, add blocks from a grouped palette, reorder, hide and
> remove them, edit every field, set per-page SEO, and preview. Verified in a
> browser end to end: sign in → add a block → publish → the page is live at its
> own address with a correct heading outline, while a draft stays 404 to the
> public.
>
> **Reorder is in the outline, not on a canvas** — as planned, and with buttons
> rather than `@dnd-kit`. Buttons work with a keyboard, work on a phone, and can
> be tested; dragging a pixel-perfect canvas is the demo that sells a builder and
> the interaction that excludes anyone not using a mouse.
>
> **Blocks describe their editor as data**, not as a component. `BlockField[]`
> on each definition, one generic form renders all of them. A per-block editor
> component would mean the thirtieth block type is a React file as well as a
> definition, and thirty chances to disagree about what a text field looks like.
> A test walks every field path against the real schema, because a typo in a
> path is invisible: the form renders, typing works, and the value lands
> somewhere the block never reads.
>
> **Three bugs found by loading the admin in a browser**, all pre-existing:
>
> - **Every sidebar link was broken.** They were absolute (`/admin/projects`)
>   inside a router with `basename="/admin"`, so they resolved to
>   `/admin/admin/projects`. Selection highlighting was permanently off for the
>   same reason. Nothing failed — the markup is valid and the destination
>   redirects — which is why it survived. Now covered by a test.
> - **The sign-in screen told people to look in `.env.local`** for a passcode
>   that has not existed since Phase 0 deleted `VITE_ADMIN_PASSCODE`.
> - **Drafts never reached the server.** `saveDraft` wrote to the editor's own
>   browser, so Preview could only ever show the published site — silently, via
>   the fallback. It now posts to `/api/admin/draft` with the revision it last
>   saw.
>
> **`<MediaPicker>` is built.** Every image field now opens the library rather
> than the operating system's file dialog — a file dialog can only ever add
> another copy of a picture that is already there, which was the last piece of
> bookkeeping the builder still asked a non-technical person to do by hand.
>
> **It asks for alt text at the moment of choosing**, with the picture on
> screen, and writes the description and the image together in one action.
> Every accessibility guide says to write alt text and almost nobody does,
> because the box is always somewhere other than where the picture is picked.
> It is still skippable on purpose: a hard requirement there is answered with a
> space bar, and " " is worse than nothing because it silences the warning too.
>
> **Still to do in this phase:**
>
> - Progressive disclosure on record editors, and collapse the five duplicate
>   settings routes into `settings/[panel]`.
> - A Home page built from blocks. The theme's fixed sections still own `/`.
> - The other record editors still use the pre-picker image field.
>
> **The one thing built here:** `src/admin/pages/AdminWelcome.tsx`, the first-run
> wizard, deliberately written in plain Tailwind so it survives the component
> kit being replaced. Do not port it to Astryx.
>
> Removing React Router marks the end of this phase. Note that paths inside
> `src/admin/**` are router-relative because of `basename="/admin"` — an
> absolute `/admin/login` resolves to `/admin/admin/login`.

`npx shadcn init`, AdminShell (sidebar IA ported as _data_ from [AdminSidebar.tsx:72-138](src/admin/components/AdminSidebar.tsx#L72-L138)), **`<MediaPicker>` first** (it unblocks every image field and the fixed-4-slot problem), then the block builder (3-pane, `@dnd-kit` reorder **in the outline not the canvas** — keyboard-operable, touch-friendly, testable), then one record editor end-to-end as the template, then the rest. Progressive disclosure: Essentials → Details → SEO. Collapse the 5 duplicate settings routes into `settings/[panel]`.

### Phase 8 — Remaining 5 adapters + integrations (3 weeks)

> ### PARTIALLY DONE — registry, vault and SMTP-from-the-admin shipped; five adapters and OTP do not exist
>
> **Done and verified, against Mailpit:** an SMTP transport
> (`core/email/transport.ts`, `core/email/send.ts`) that reports a refused
> connection as a value rather than throwing, so a mail failure can never be
> mistaken for a lost enquiry. The contact form emails the owner when a message
> arrives — stored first, notified second, deliberately in that order
> (`app/api/contact/route.ts`). Passphrase reset by email (`core/auth/reset.ts`,
> `app/api/auth/reset/{request,confirm}/route.ts`,
> `src/admin/pages/AdminResetPassphrase.tsx`) closes the recovery path earlier
> phases left open — delete `.opb/state/owner.json` and claim the site again.
> The reset link's origin comes from `OPB_SITE_URL` only, never the `Host`
> header the claim flow was once tricked by; only `sha256(token)` is stored, in
> the existing `otp` kv namespace; the token is burned before the passphrase
> changes so a replay cannot land between the two; and confirming bumps
> `sessionEpoch`, so a forced reset signs out every session the attacker (or
> the owner, on another device) already held.
>
> **Adapters missing:** Firebase, Convex, Cloudflare D1+R2, PocketBase,
> Appwrite. Each is now genuinely one file — the contract, the shared SQL engine
> and the conformance suite all exist. Register it in
> `core/storage/registry.ts`, add inference for its environment variables, and
> ship a green conformance run.
>
> **The integrations registry does not exist at all.** None of the ~25 services
> are wired: no analytics beyond the existing env-var reader in
> `src/utils/analytics.ts`, no Turnstile, no Giscus, no Cal.com, no tip buttons,
> no GitHub or Dribbble import, no Cloudinary, no Sentry.
> **Build the `IntegrationDefinition` registry and one generic admin screen
> before writing any individual integration**, or you will end up with 25
> bespoke screens. That registry is also where a secrets vault belongs —
> encrypted-at-rest storage for API keys does not exist yet, which blocks every
> integration that needs one.
>
> **Still absent: Resend and Brevo as alternative mail providers** — SMTP is the
> only transport built — **and OTP**, a one-time-code sign-in factor distinct
> from passphrase reset.
>
> **Honest scoping note:** Vercel's `stores` deploy parameter can only
> auto-provision Marketplace-native products. Firebase, Appwrite, PocketBase and
> Cloudflare cannot be provisioned at deploy time, so those users pick a backend
> _after_ deploying. Behance's public API is retired and LinkedIn has no profile
> API, so those imports have to be file-upload flows rather than connections.

Cloudflare D1+R2, Firebase, Appwrite, PocketBase, Convex — each a PR with green conformance + docs page + `.env.example` block. Integration registry: one `IntegrationDefinition` per service (metadata, free-tier limits with a verified-on date, plain-English setup guide, zod schema, mandatory `test()` with non-technical remediation copy, CSP contribution, degradation mode) rendered by **one** generic admin screen. Secrets AES-256-GCM server-side, `import 'server-only'`, CI greps `.next/static/**` for secret values.
_Honest scoping:_ Vercel Marketplace can only auto-provision Marketplace-native products (Supabase, Neon, Upstash, Blob, Resend). Firebase, Appwrite, PocketBase and Cloudflare use the manual path — so adapter choice happens _after_ deploy for those, and the deploy form asks for **at most two fields** (`OWNER_EMAIL`, `SITE_NAME`). Behance's public API is retired and LinkedIn has no profile API — those imports are file-upload/paste flows, not connections.

> **The integrations registry and the vault are built**, and SMTP is now
> configurable entirely from `/admin/services` — no environment variable, no
> config file, no redeploy. Verified in a browser end to end: enter a mail
> server, press Test, get "Connected and signed in", save it, and a real contact
> form submission is delivered through it.
>
> **The registry is data, not screens.** One `IntegrationDefinition` per service
> and one generic admin screen, so the twenty-fifth integration is a file and no
> React at all. Four of its fields exist specifically because the audience has no
> developer: `freeTier` carries a `verifiedOn` date, because a free-tier claim
> with no date on it is a rumour; `setup` is numbered plain-English steps rather
> than a link; `degradation` says what breaks without it; and `test()` is
> mandatory, because "saved" is not "works" and finding out which at the moment a
> stranger sends you a message is too late. SMTP's test translates every
> `ECONNREFUSED` into something the owner can act on.
>
> **The vault** encrypts secrets with AES-256-GCM under a key derived from the
> server secret, stores them in a `config` namespace that no content export
> touches, and never sends them back to the browser — the admin learns that a
> password is set and its last four characters, nothing more. Environment
> variables still win over stored settings, and the screen says so rather than
> offering fields that would be silently ignored.
>
> The `kv` contract gained an optional TTL for this: config is settings, not
> state, and giving it a very long expiry instead would mean somebody's mail
> server quietly stopping on a date nobody chose.
>
> **Three bugs found by using the screen rather than testing it:**
>
> - **Chrome autofilled the owner's own admin passphrase into the SMTP password
>   field**, because it had a saved login for this origin. Saving there would
>   have stored the site's passphrase as somebody else's mail credential.
>   Suppressed with `autocomplete="new-password"` — set on the DOM, because
>   Astryx inputs accept `React.HTMLAttributes`, which has no `autoComplete`.
> - **The first version of that fix marked nothing at all**, because the inputs
>   do not exist until a service is expanded and the effect ran before they were
>   there. It is a `MutationObserver` now. Visible only by reading the
>   attributes in a live browser.
> - **A brand-new integration could not be saved**, because a toggle nobody
>   touched sends nothing and the schema requires a boolean. The form now sends
>   every declared field in its declared shape.
>
> **Remaining:** the five adapters (Cloudflare D1+R2, Firebase, Appwrite,
> PocketBase, Convex), more integration definitions, and email OTP. The five
> adapters each need a local emulator to prove against — and this project has
> already learned twice that a file-backed implementation passing a suite says
> nothing about the real one, so they should not ship unverified.

### Self-hosting with Docker (added after the original plan)

> ### DONE, VERIFIED
>
> There was no Dockerfile, which meant "self-hosted" in practice meant "hosted on
> Vercel". `docker compose up` now brings up the app and Postgres together.
>
> `output: 'standalone'` ships what the server actually imports rather than a
> `node_modules` tree full of build tooling — 302MB, non-root, with a health
> check that asks the app over HTTP rather than only checking the process lives.
>
> **`OPB_DATA_DIR` is the load-bearing part.** The local adapter wrote to
> `process.cwd()/.opb`, which inside an image is replaced on every rebuild — a
> deploy would have silently deleted somebody's site.
>
> Verified by destroying the container and recreating it against the same
> volume: a second claim was refused and the original owner could still sign in.
> That is the "an update never touches your content" promise in its most literal
> form.
>
> It also reopened a discovery channel: awesome-selfhosted (312k stars)
> disqualifies software that depends on one cloud provider.

### Community and updates (added after the original plan)

> ### BUILT — blocked on one setting
>
> Not in the original plan, and asked for because every community-driven project
> needs it: report a bug, ask for a feature, see what changed, and know whether
> an update exists — all from the admin.
>
> **How updating works, which was the real question.** Content lives in the
> owner's backend and code lives in their repository; the storage seam from
> Phase 3 means there is no path from one to the other, so an update cannot
> touch what somebody wrote. Database columns a release needs are created
> automatically, because `provision()` already runs once per process and is
> idempotent. Documented for a non-technical audience in `docs/UPDATING.md`.
>
> **The Deploy button copies rather than forks**, so GitHub's "Sync fork" button
> does not exist for anyone who used it — which would have meant no update path
> at all. `.github/workflows/update.yml` fills the gap: it adds the upstream as
> a remote, merges the newest release tag into a branch, and opens a pull
> request. Monthly, on demand, and needing no token from the owner. Conflicts
> are committed and explained in the PR body rather than failing the run,
> because a red cross is not something a non-developer can act on.
>
> **Duplicate detection happens before filing, not after.** The title box
> searches existing issues as it is typed and answers one of three ways: already
> fixed in a version newer than yours (update, there is nothing to report — and
> only this screen can say that, because only it knows which version the site is
> on), already reported (add what you know to the existing thread), or new. The
> fix version is worked out from the first release published after the issue was
> closed, which needs no discipline from the maintainer.
>
> **Reports go as pre-filled issue URLs** rather than through an API. No token to
> ask for, no intake service to run or defend, and the issue is authored by the
> person reporting — which is what makes a thank-you in the release notes
> accurate rather than guessed at. The screen's contribution is the diagnostics,
> shown in full before anything is sent and switchable off. A test builds a site
> whose every text field is a marker and asserts no marker reaches the report:
> the privacy claim is checked rather than promised.
>
> **This all works, and none of it can run yet: the repository is private.**
> Found by using the screen — GitHub answered 422, which the code reported
> verbatim before it was taught to say what that actually means. A private
> repository cannot be searched anonymously, its releases cannot be listed, its
> issue URLs 404 for everyone else, the Deploy button in the README cannot clone
> it, and `update.yml` cannot fetch from it. The query shape itself was verified
> against a public repository and returns correct results.
>
> **Making the repository public is the only thing standing between this and
> working.** Nothing else here needs changing.

### Phase 10 — Launch: site, demo, mobile (added after the original plan)

> ### RESEARCHED, NOTHING BUILT
>
> Four dossiers, ~7,500 lines and ~580 sources, in `docs/research/`. They exist
> because the original plan ended at "1.0" and said nothing about how anybody
> would find this. Read them before building any of it — several findings
> invert the obvious approach.
>
> **The findings that change what we build, not just how we describe it:**
>
> - **The category name is not a query.** Nobody searches "open source portfolio
>   builder". Two audiences use vocabularies that never meet, which is a
>   positioning problem rather than a keyword problem.
> - **Profession pages are blocked, not deferred.** Six vocabulary packs that
>   rename section headings, against one theme, is Google's own doorway-page
>   example. Phase 9's themes and presets gate them.
> - **The industry is retreating from mobile editing.** Webflow retired its
>   legacy Editor on 2026-08-04; Wix cannot edit Editor sites in its app; Adobe
>   Portfolio says outright it does not support it. Nobody is competing here.
> - **Vercel Hobby forbids commercial use**, reportedly including soliciting
>   donations. A freelancer's portfolio is commercial use, and the README
>   currently recommends Hobby as the primary path. **This needs a decision.**
> - **Zero social proof is a solved problem.** Supabase shipped a homepage
>   showing a 6-star repo; Dub's showed 3. Both reframed it as "watch this"
>   rather than hiding it.
>
> **What this phase contains, in dependency order:**
>
> 1. **Go public and tag `v0.5.0`.** No dependencies, and the only item on a
>    clock — see `GOING-PUBLIC.md`. Publishing and announcing are separate
>    events; only the first is time-gated.
> 2. **A live demo.** Both surfaces, seeded with realistic content, resetting on
>    a schedule. "Demo" is a captured word — six of twenty-four projects use it
>    to mean "talk to sales" — so the label matters as much as the thing.
> 3. **The marketing site**, per `LANDING-PAGE.md`.
> 4. **Mobile and PWA**, per `MOBILE-AND-PWA.md`. Two hazards there must not be
>    got wrong: Serwist's default cache stores authenticated admin HTML for 24
>    hours in an origin-scoped cache, and Background Sync does not exist on iOS.
> 5. **Docs for non-technical people.** Ghost's persona-split navigation is the
>    only real answer found to this.
>
> **Not on the critical path:** announcing. The launch is rarely the peak —
> Excalidraw's first Show HN scored 30 points and it now has 129k stars — and a
> submission that lands on an unfinished demo converts worse than the same
> submission a month later.

### Phase 9 — Blog, newsletter capture, themes 2–6, presets, launch (4–5 weeks)

> ### DECIDED — it is "Writing", not a blog, and the label is the user's
>
> A blog is a _container_: dated, reverse-chronological, feed-driven. An article
> is one thing inside it. The question is therefore not what to call it but
> whether the ordering should be chronological — and for a portfolio it usually
> should not.
>
> - **The best piece sinks.** A strong essay from 2022 ends up below a throwaway
>   note from last week, which is the opposite of what a portfolio is for.
> - **A blog creates an obligation people break.** An empty blog, or one whose
>   newest post is eighteen months old, actively damages a portfolio — it reads
>   as abandoned. Three pieces under "Writing" reads as complete; the same three
>   under "Blog" with a year's gap reads as neglect.
> - **Portfolio writing is evergreen.** "How I approach research" does not
>   expire, and dating it prominently makes it look stale when it is not.
>
> **So: one collection, one editor, one route — with the label chosen by the
> owner**, through the same profession vocabulary packs that already rename
> sections. Developer → Blog. Designer → Writing. Photographer → Journal.
> Writer → Essays. Academic → Publications.
>
> It gets: optional dates, a choice between newest-first and manual order so a
> best piece can be pinned, and RSS regardless — it costs nothing and the people
> who want a feed want it badly. No comments by default.
>
> **The honest counter-argument, and why it does not change the answer:** for
> somebody chasing search traffic the blog format genuinely is better — dated,
> frequent, chronological. So chronological stays available as one setting
> rather than the product choosing for everybody. Default curated, because most
> portfolios are not traffic plays.
>
> **Case studies stay separate.** They are project-linked and differently
> shaped — client, role, outcome, images — and folding them into writing would
> lose all of that.
>
> Recorded as a decision rather than left to be re-argued. The evidence half is
> that a blog is a feature we currently lose on against Squarespace, Webflow and
> Ghost (`research/MARKET-RESEARCH.md`); the chronological-is-wrong-for-portfolios
> half is product judgement, not measured.

> ### BARELY STARTED
>
> **Done:** `src/cms/data/professions.ts` — six vocabulary packs (Design,
> Software, Photography, Writing, Student, Other) that rename sections and
> microcopy. They change **wording only, never structure**, so switching is safe
> at any point and nothing a user has written can be lost. Applied by the
> first-run wizard.
>
> **Remaining:** the entire blog (Tiptap, RSS, JSON Feed, sitemap entries,
> Giscus), newsletter capture with double opt-in, all six themes, the full
> preset system (block arrangements and demo content per profession), the docs
> site, and the launch checklist.
>
> Themes depend on Phase 2's tokens. Full presets depend on Phase 5's blocks.
> Neither can start before those land.

Tiptap blog (structured JSON so posts render through token primitives in all 6 themes; markdown import/export so nobody is locked in). **Scheduling is a query predicate**, not a cron job — `status='published' OR (status='scheduled' AND published_at <= now())` applied everywhere, so a post appears within the cache window on any host with zero scheduler. RSS + JSON Feed + sitemap + Giscus. Newsletter capture with double opt-in, hashed tokens, RFC 8058 one-click unsubscribe, CSV/Buttondown export. Themes 2–6 (pure token files by now). 7 fully authored presets. Docs site (Fumadocs, integration pages **generated from the registry** so they can't drift). Security review, a11y pass, Lighthouse budgets, 1.0.

---

## Verification

- **Conformance:** green for all 8. _As built:_ there is no `test:adapters` script — the suite runs under `npm run test`, and the hosted adapters skip unless credentials are present.
- **Kitchen sink:** every block × variant × 6 themes × light/dark × 390/768/1440 — axe-core zero serious/critical, zero horizontal overflow, visual snapshots.
- **Auth:** route-manifest test asserts every `/admin/*` and `/api/admin/*` rejects unauthenticated requests; claim flow tested against 5 named squatter scenarios; OTP expiry/single-use/lockout/concurrent-claim race.
- **Data safety:** export→import round-trip including the legacy golden-file bundle; migration importer `--dry-run` diff on the owner's real export before the real run.
- **E2E (Playwright, every PR):** fresh instance → claim → wizard → publish → name appears on the public site; edit→publish; contact submit lands in the inbox **and** sends the email.
- **Manual:** deploy the template to a clean Vercel account with no prior knowledge and reach a published personalised site without opening a terminal.
- **Budgets:** public route ≤130 KB gz initial JS, LCP ≤2.0s p75, CLS ≤0.05; Lighthouse ≥95 perf / 100 a11y / 100 SEO on mobile, enforced by LHCI.
- **Security gates:** no secret in `.next/static/**` (automated); zero gitleaks findings across full history; polyglot JPEG, SVG with `onload`, 500 MB file and HTML-named-`.pdf` all rejected; clean securityheaders.com and Mozilla Observatory on a default deploy.

## Critical files

- [src/cms/types/cms.ts](src/cms/types/cms.ts) — the domain schema; the most valuable asset in the repo, moves near-verbatim to `core/content/schema/types.ts`
- [src/cms/services/cmsService.ts](src/cms/services/cmsService.ts) — the 691-line singleton being dissolved; contains the auth to delete (637-685), publish/version logic to keep (269-329), bundle format (23-30, 561-616), and the broken contact form (421)
- [src/cms/services/storage/types.ts](src/cms/services/storage/types.ts) — today's `ContentStore`, replaced by `adapters/contract.ts`
- [src/cms/utils/mediaUrls.ts](src/cms/utils/mediaUrls.ts) — the `idb:` scheme to delete before any adapter work
- [src/pages/HomePage.tsx](src/pages/HomePage.tsx) — the fixed `SECTION_COMPONENTS` registry the block registry replaces
- [src/cms/utils/contentHealth.ts](src/cms/utils/contentHealth.ts) — 304 lines of genuinely good product thinking; decomposes into per-block checks + the publish gate + the new Security page
- [src/styles/index.css](src/styles/index.css) — the token indirection the semantic layer replaces
- [src/admin/components/AdminRecord.tsx](src/admin/components/AdminRecord.tsx) — the interaction model to carry into shadcn

## Risks

1. **Media reference rewrite (Phase 3)** — the only unrecoverable failure mode. Idempotent, checksum-keyed, resumable, dry-run first.
2. **Contract surviving adapters #2/#3 (Phase 6)** — getting this wrong invalidates Phases 7–9. This is why adapters come before screens.
3. **Scope.** Everything decided is designed for, but the honest read is ~5 months to launch. The mitigation is that the _architecture_ is complete before the _content_ is: adding the 9th adapter, the 26th integration or the 8th preset must be one file and zero React changes. If the calendar bites, ship presets and adapters as `experimental` rather than cutting the seams that make them cheap.
4. **7 presets × 6 themes × 3 breakpoints = 126 combinations** to review. The kitchen-sink CI matrix does the mechanical half; the taste half is manual.
5. **Free-tier drift.** Every integration's free-tier claim carries a `verifiedOn` date and a monthly CI-opened re-verification issue.

---

## Handoff notes for whoever picks this up

Written for another engineer or AI agent starting fresh on a different machine.
Everything here is something that cost time to learn and is not obvious from the
code.

### Where things stand, exactly

Everything described in this file is on `main`. There is no work in progress and
no unmerged branch — the email and durable-inbox work was reviewed, fixed and
merged before this note was written.

The last substantial change was Phase 8's first slice: SMTP email, enquiry
notification, passphrase reset, and moving the contact inbox out of the
published content snapshot onto its own storage surface. Its design is in
[specs/2026-08-11-email-and-inbox-design.md](specs/2026-08-11-email-and-inbox-design.md)
and the task-by-task plan in
[plans/2026-08-11-email-and-inbox.md](plans/2026-08-11-email-and-inbox.md).
Both are worth reading before touching `core/email/`, `core/storage/` or the
contact route — they record the reasoning, not just the result.

### Get running on a new machine

```bash
git clone https://github.com/ShadmanArafin/open_portfolio_builder.git
cd open_portfolio_builder
npm ci                # ci, not install — see "Things that will bite you"
npm run dev           # http://localhost:3000, then claim the site at /setup
```

No account, no keys, no database. The local filesystem adapter is the default
and stores everything under `.opb/`. Delete that folder to reset to a fresh
install. `npm run dev` needs no `OPB_SETUP_TOKEN`; a production build does.

### The two Docker containers the full test suite needs

Neither is optional if you want the real numbers. Without them a large part of
the suite skips, silently and by design — a skipped test is not a passing one.

```bash
docker run -d --name opb-pg   -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=opb_test \
  -p 55432:5432 postgres:16
docker run -d --name opb-mail -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Mailpit's web inbox is at <http://localhost:8025>. On later sessions just
`docker start opb-pg opb-mail`.

### Verify before you change anything

```bash
npm run typecheck && npm run lint && npm run format:check && npm run build
node scripts/check-no-personal-data.mjs

# Tests, with both containers running:
TEST_POSTGRES_URL="postgres://postgres:postgres@localhost:55432/opb_test" \
TEST_MAILPIT_URL=http://localhost:8025 \
npm run test
```

The numbers you should see, as of this writing:

| Check                     | Expected                                              |
| ------------------------- | ----------------------------------------------------- |
| `typecheck`               | 0 errors                                              |
| `lint`                    | **0 errors**, 64 warnings — the warnings are baseline |
| `format:check`            | clean                                                 |
| `check-no-personal-data`  | clean, listed by git                                  |
| `test` with no containers | 342 passed, 7 skipped                                 |
| `test` with both          | **420 passed, 2 skipped**                             |

The 2 remaining skips are the Supabase and Neon conformance runs, which need
real cloud credentials. Everything else runs locally.

### Running the app with email

```bash
docker start opb-mail
OPB_SMTP_HOST=localhost OPB_SMTP_PORT=1025 OPB_SITE_URL=http://localhost:3000 npm run dev
```

Submit the contact form and the notification appears at
<http://localhost:8025>. Stop the container and submit again: the visitor still
sees success, the enquiry is still in `/admin/messages`, and the SMTP error is
shown on the message and raised on the dashboard. That asymmetry is deliberate
and is the point of the design — see "Invariants worth not breaking".

`OPB_SITE_URL` is **required** for passphrase reset, in development too. Reset
links are built from it and never from the request, because a link built from a
caller-supplied `Host` mails the owner a valid token pointing at somebody else's
domain.

### Environment variables added recently

All optional except where noted. Full list with commentary in `.env.example`.

| Variable                      | Meaning                                                    |
| ----------------------------- | ---------------------------------------------------------- |
| `OPB_SMTP_HOST`               | Presence of this alone selects the SMTP transport          |
| `OPB_SMTP_PORT`               | Defaults to 587                                            |
| `OPB_SMTP_USER` / `_PASSWORD` | Optional — Mailpit needs neither                           |
| `OPB_SMTP_SECURE`             | `1` for implicit TLS on port 465 only                      |
| `OPB_MAIL_FROM`               | Defaults to `no-reply@<your SMTP host>`                    |
| `OPB_SITE_URL`                | **Required for passphrase reset**, and for canonical links |

### Invariants worth not breaking

These were each arrived at the hard way. Changing one is a decision, not a
refactor.

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

**Enquiries never travel inside published content.** They are separate storage
now, and `withoutEnquiries()` in `core/content/sanitise.ts` strips them at the
publish boundary — including out of nested version snapshots, because the
published document is serialised into the HTML of every public page.

**`getStorageAdapter()` is async and provisions once per process.** Await it.
It was synchronous until recently, and the change fixed a defect where an
upgraded instance never created its `opb_messages` table.

### Things that will bite you

**Test with `npm ci`, not `npm install`.** A populated `node_modules` lets npm
reuse what is already there and hides peer-dependency conflicts. This exact
mistake merged a broken dependency bump into `main`. Delete `node_modules`,
run `npm ci`, then check.

**ESLint is pinned to 9 and TypeScript to 5.5, on purpose.** ESLint 10 has no
compatible `eslint-plugin-jsx-a11y`, and TypeScript 7 falls outside
`typescript-eslint`'s peer range. Do not bump either until upstream catches up.
Dependabot will keep proposing it.

**Tailwind is pinned to 3.4.** PR #7 (Tailwind 4) is open and was held until the
design tokens existed. They exist now, so it is unblocked — but it replaces the
JS config with CSS-first `@theme`, and the cascade-layer ordering below is
load-bearing, so treat it as real work rather than a version bump.

**Cascade layer order matters.** `src/styles/layers.css` must be imported before
the Astryx stylesheets. Tailwind 3 emits Preflight unlayered and a layer's rank
is fixed the first time it appears; get it wrong and
`button { background-color: transparent }` silently cancels Astryx button fills.

**Admin paths are router-relative.** The admin runs under `basename="/admin"`,
so `to="/admin/login"` resolves to `/admin/admin/login`. Write `to="/login"`.
Related: Astryx's `Link` is a plain anchor, not router-aware — inside the admin
it needs an `onClick` that calls `preventDefault()` and `navigate()`, or a cold
load will 404 outside the router.

**`middleware.ts` redirects sessionless `/admin/*` requests.** Any new
unauthenticated admin entry point must be exempted there, or the query string is
silently dropped. This is how the emailed reset link broke: it worked from
inside the app and failed on the cold load that is the only real-world path.

**Windows and Linux disagree about concurrent renames.** Linux allows a rename
onto a file another rename is touching; Windows returns `EPERM`. The local
adapter serialises writes per path because of this. If a test passes on one
platform, that is not evidence it passes on the other — Docker is right there.

**`format:check` and line endings.** `.gitattributes` normalises to LF. If you
see a diff touching every file, your checkout is CRLF and something is wrong
with your git config, not with the code.

**Prettier does not read `.gitignore`.** Agent scratch and generated
directories have to be listed in `.prettierignore` separately, or `format:check`
fails on files that are not part of the project.

**Do not run a background agent and foreground work in the same checkout.** Two
processes editing one working tree produced transient `ReferenceError`s from
reading files mid-write, and one agent watched another's commit land underneath
it. Use a worktree or wait.

### Known bugs and deferred items

Nothing here is a blocker; all of it is real and none of it is fixed.

**Cosmetic — the `unread-messages` health check pluralises wrongly**, producing
"2 enquiry enquiries unread".

**Robustness — `/api/admin/messages` has no rate limiting**, unlike every
sibling admin route. Owner-only and same-origin, so the risk is low.

**Robustness — an inert leftover after a crash.** If a process dies between the
message migration's append and its snapshot-clear, a copy stays in that
channel's snapshot and is never revisited, because the guard is
destination-based. Self-heals on the next publish for `published`, not for
`draft`.

**Reporting — a database hiccup renders as an empty inbox, not an error.**
`app/api/admin/messages/route.ts` calls `messages.list()` outside its `try`, and
`CMSContext` swallows a non-ok response. The cause that made this matter is
fixed; the amplifier is not.

**Test gap — `transport.test.ts`'s "implicit TLS only for the documented value"
asserts only the positive case.** It never checks that `'true'` or `'0'` leave
TLS off, so its title currently overstates what it proves.

### What is genuinely unverified

Be careful about claiming otherwise. Only four things need a cloud account, and
none of them block local development — see
[Finishing locally, before any cloud account](#finishing-locally-before-any-cloud-account).

1. **Vercel Blob.** Proprietary, no emulator, and it is what the Deploy button
   provisions — so it is the highest-priority cloud check. The database half of
   Neon is proven; the object-store half has never run.
2. **Supabase Storage against the live service.** The code path is exercised
   locally, but `supabase start` has not been wired into the suite yet.
3. **Real SMTP deliverability.** Mailpit accepts everything; a real provider
   enforces SPF, DKIM and rate limits.
4. **The Deploy button flow**, and anything measured on a public URL —
   Lighthouse budgets, securityheaders.com, Mozilla Observatory.

### Architecture in three sentences

`app/` holds routes only. `core/` holds server-only domain logic — storage
adapters behind one contract, auth, email, content reads — and files there start
with `import 'server-only'` so a leaked credential is a build failure, except
`core/theme/*`, which deliberately runs in the browser too. `src/` still holds
the public site components (`src/views`, `src/components`) and the old admin
(`src/admin`), which is the part Phase 7 replaces.

### Adding a storage backend

One file in `core/storage/adapters/`, one line in `core/storage/registry.ts`,
env-var inference in `inferAdapterId()`, and a green run of
`core/storage/conformance.ts`. If it is SQL, reuse
`core/storage/adapters/_shared/postgres.ts` — Supabase, Neon and generic
Postgres all do, which is why the fourth one cost almost nothing.

**The conformance suite is not optional.** It has caught three real concurrency
bugs so far, two of which only appeared on one platform. An adapter without a
green run should not ship.

### Deliberate deviations from the plan above

These are decisions, not oversights, and the reasoning is in each phase block:

- **Passphrase auth instead of passkeys.** Reset by email now exists; passkeys
  and OTP still do not. The session machinery supports adding them.
- **`src/pages` renamed `src/views`.** Next reserves `pages`.
- **The admin still runs React Router** inside one Next route, on purpose, so
  the framework migration could land without also rewriting twenty screens.
- **`work`/`timeline` collection merges not done.** Still four collections.
- **Content core still lives in `src/cms/`,** not `core/content/`.
- **Tailwind 4 deferred** — no longer blocked, just not done.
- **Folder layout differs from the plan above.** There is no top-level
  `/adapters`, `/themes`, `/integrations` or `/presets`. Storage lives in
  `core/storage/adapters/`, and the theme and integration directories do not
  exist yet, so the ESLint boundary rules the plan specifies have nothing to
  guard.
- **No `demo-idb` adapter.** The client-only demo mode behind
  `NEXT_PUBLIC_OPB_DEMO=1` was specified and never built. Nothing depends on it.
- **The conformance suite is `core/storage/conformance.ts`,** not
  `/adapters/_conformance/suite.ts`, and it is 21 assertions rather than the
  ~60 the plan estimated — because the surfaces it has to cover are narrower
  than the contract that was designed.
- **`messages` is an addition, not a deviation.** The contract grew a surface
  the original did not have, for the reason recorded in Phase 5: an inbox and a
  content document have different writers and different failure modes.
- **The integrations registry was deferred behind its first integration.** SMTP
  was built concretely first, on the reasoning that an abstraction over
  twenty-five services designed from zero examples is wrong in ways only a
  second consumer reveals. Build Turnstile next, then extract the registry from
  the two of them.

### Open decisions — the maintainer's, not an engineer's

These are not blocked on work. They are choices about the product.

| Decision                                | State                                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Make the repository public**          | Audited and clean. Five shipped features are broken until it happens, and three discovery channels count months from that day. See `research/GOING-PUBLIC.md` |
| **Tag a first release**                 | Three features read GitHub Releases and find nothing. Do it after verifying uploads                                                                           |
| **Vercel Hobby's non-commercial terms** | Now quoted and dated in the README, without interpretation. Nothing further is needed unless you want to change the primary recommendation                    |
| **Feedback route**                      | Settled: GitHub device flow. Needs one OAuth App created once, and `OPB_GITHUB_CLIENT_ID` set. Until then the admin falls back to opening a pre-filled tab    |

### Verifying your work

Claims in this repository are expected to be backed by something you ran. The
patterns used throughout:

- **Server rendering:** `curl` the route and grep the raw HTML for the content
  and the meta tags. If it is only in the DOM after hydration, it is not
  server-rendered.
- **Auth:** check the failure cases, not the success case. Wrong passphrase,
  wrong email, no session, cross-site origin, a replayed reset link.
- **Storage:** run the conformance suite against a real database in Docker.
- **Email:** send to Mailpit and read what arrived, including the headers.
- **Anything visual:** load it in a browser and check the console is clean.
- **Any bug fix:** confirm the new test fails against the unfixed code before
  you fix it. A test that never failed proves nothing, and this rule has already
  caught a fix that did not work.
