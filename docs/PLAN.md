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
> Last updated: 2026-08-11 · Version 0.5.0 · CI green on `main`; email and the
> durable inbox are on `feat/email-and-inbox`, reviewed and not yet merged.

## Status at a glance

| Phase                       | State              | What it means                                                                |
| --------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| 0 — Repo publishable        | **Done, verified** | MIT, no personal data, CI, guards                                            |
| 1 — Next.js + SEO           | **Done, verified** | Server-rendered, real metadata, sitemap, 404                                 |
| 2 — Tokens + primitives     | **Partially done** | Tokens done and server-rendered. Primitives remain                           |
| 3 — Storage contract        | **Done, verified** | Contract, local adapter, registry, server read                               |
| 4 — Auth                    | **Done, verified** | Passphrase + sessions. **Passkeys/OTP not built**                            |
| 5 — Write path              | **Partially done** | Publish and contact work. **Blocks and pages missing**                       |
| 6 — Hosted adapters         | **Done, verified** | Supabase, Neon, Postgres. **Uploads unverified**                             |
| 7 — shadcn admin            | **Not started**    | Admin still Astryx + React Router                                            |
| 8 — Adapters + integrations | **Partially done** | SMTP, notification, reset done. **5 backends, registry, vault, OTP missing** |
| 9 — Blog, themes, presets   | **Barely started** | Only profession vocabulary packs                                             |

**Where to start:** Phase 5's block system. The design tokens it and the themes
both sit on now exist, so neither has to be built twice — and the primitives
that are still missing from Phase 2 need blocks to have somewhere to live.

**What works today:** a stranger can deploy this, claim it, answer four
questions and have a live portfolio they can edit without touching code. An
enquiry now emails them, and a forgotten passphrase is recoverable.

**What does not:** no blog, no themes beyond the one, no block builder, the
admin is the old component kit, and email covers only transactional SMTP —
no alternate providers, no integrations registry or secrets vault, no OTP.

**Known bug, unfixed and pre-existing:** `/admin/welcome`'s Skip link is inert.
It navigates without setting `fullName`, so `AdminLayout`'s guard bounces
straight back to it. That is the first screen every new deployer meets. Found
twice during the email work — once blind, once root-caused — and left alone
both times because it was outside the branch.

---

## Finishing locally, before any cloud account

Almost all of the remaining work can be built and genuinely verified on one
machine with Docker. That is worth knowing before paying for anything: the list
of things that truly need a hosted service is short, and none of them block
development.

### What Docker covers

| Remaining work                                | Local equivalent                                                    |
| --------------------------------------------- | ------------------------------------------------------------------- |
| Phase 2 primitives, ESLint bans, publish gate | Nothing external needed                                             |
| Phase 5 blocks, pages, `draftMode()` preview  | Nothing external needed                                             |
| Phase 7 shadcn admin, MediaPicker, builder    | Nothing external needed                                             |
| Phase 9 blog, newsletter capture, themes      | Nothing external needed                                             |
| Postgres / Supabase / Neon **database** half  | `postgres:16` — already wired, takes the suite from 98 to 160 tests |
| Supabase **Storage** half                     | `supabase start` runs the real `storage-api` container              |
| Email send path                               | `axllent/mailpit` — already wired                                   |
| PocketBase, Appwrite adapters                 | Both ship official Docker images                                    |
| Cloudflare D1 + R2 adapter                    | `wrangler dev --local` (Miniflare) emulates both                    |
| Firebase adapter                              | The Firebase Emulator Suite                                         |
| Convex adapter                                | `convex dev` runs a local backend                                   |
| Turnstile (spam)                              | Cloudflare publishes always-pass and always-fail test keys          |
| Umami (analytics)                             | Self-hosts in Docker                                                |

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
2. **Phase 5 blocks and pages** — the largest single piece, and what Phases 7
   and 9 both sit on. The primitives from Phase 2 land here.
3. **Phase 7 admin on shadcn** — `MediaPicker` first; it unblocks every image
   field.
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

- **Authoring path — normalised records.** Admin reads/writes one record at a time with pagination and optimistic concurrency (`revision`). Makes a 400-post blog and per-record autosave possible.
- **Public path — one denormalised snapshot.** Publish rebuilds a single JSON blob under one key. Every public render is **one** adapter read, identical on all 8 backends, trivially cacheable. Snapshot excludes full post bodies (posts paginate separately) so it stays bounded.

### Adapter contract (`/adapters/contract.ts`)

Key departures from today's `ContentStore`:

- **Media returns a URL, never a Blob.** `getMedia(): Promise<Blob>` ([storage/types.ts:28](src/cms/services/storage/types.ts#L28)) forces `hydrateMediaBlobs()` to download _every_ asset at boot. Replaced by `resolveUrl(key) → string`. The `idb:` protocol and the whole object-URL registry ([mediaUrls.ts](src/cms/utils/mediaUrls.ts)) are deleted.
- **Adapters declare `capabilities`** (`durable`, `auth`, `fileStorage`, `fullTextSearch`, `realtime`, `transactions`, `listQueries`). Admin screens **hide** unsupported features rather than breaking.
- **Adapter config lives in env vars only, never in the database** — config is what tells you how to reach the database. Resolves the chicken-and-egg completely.
- Surfaces: `readSnapshot/writeSnapshot`, `list/get/put/remove/bulkPut`, `getSingleton/putSingleton`, `media`, `kv` (sessions/OTP/rate-limits/locks — deliberately _not_ content, so auth state is never exportable), optional `auth`, optional `transaction`.

**Eight public adapter IDs, three engines.** Supabase/Neon/Cloudflare/PocketBase share `_shared/sql` (Drizzle, 3 dialects); Cloudflare-R2/Supabase-Storage/Appwrite share `_shared/s3`; Firebase, Convex and Local are bespoke. Each still exports its own id, display name, docs URL and capabilities, so the user-facing promise holds without eight divergent codebases.

**Every adapter must pass `/adapters/_conformance/suite.ts`** (~60 assertions: round-trip, slug uniqueness, revision conflict, cursor stability, snapshot etag, upload→resolveUrl→remove, kv TTL). No green run, no ship. _This is what makes eight adapters survivable._

**`local` vs demo.** IndexedDB cannot be a server adapter. Split honestly: `local` = JSON + files under `.opb/` (real server adapter, default for `npm run dev` and VPS/Docker; the registry refuses it in production on ephemeral hosts). `demo-idb` = client-only, behind `NEXT_PUBLIC_OPB_DEMO=1`, for the public demo site only.

### Auth

Adapter auth is an identity **verifier**, never the session mechanism — so all 8 backends share one session model and one `requireOwner()`.

- **Passkey (WebAuthn) registered at claim time** is the primary factor. No email provider, no DNS, no deliverability, phishing-resistant. Email OTP is recovery once mail is configured; a recovery passphrase (Argon2id) is the last resort. `/admin/login` only offers methods actually available on this instance.
- Session = opaque 256-bit token in an `httpOnly; Secure; SameSite=Lax` cookie; stored server-side as `session:<sha256(token)>` so a DB leak is not a session leak. 30-day sliding / 90-day absolute. Not a JWT — instant revocation, identical on every backend.
- **Claim flow:** `OPB_SETUP_TOKEN` (auto-generated by the Deploy template) → else a 15-minute boot window with a one-time code written to the platform's function log (visible only to the deployer). Claim is atomic under a `kv` lock re-checking `owners.count === 0`. After claim, `/setup` is permanently 404.

### Five mechanisms so an unprotected `/admin` is impossible

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
> - The ~17 primitives (`Band`, `Measure`, `Grid`, `Heading`, `Prose`, `Card`,
>   `Media`, `Button`, ...) that blocks may compose from. These need Phase 5's
>   block system to have somewhere to live.
> - An ESLint rule banning colour/size utilities and arbitrary values inside
>   `core/blocks/**` and `themes/**`. Without it the block/theme contract leaks.
>   Neither directory exists yet, so the rule has nothing to guard.
> - The publish-time gate: block publishing when body text fails 4.5:1.
>   `checkContrast` is ready; it needs wiring into `contentHealth.ts`.
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
> **Remaining — the largest single piece left in the project:**
>
> - The block schema, registry, validation, per-block migrations and renderer.
> - The `frame` presentation vocabulary (enums only; no px, no colours).
> - Arbitrary pages and the `[[...slug]]` catch-all route.
> - `draftMode()` preview. The admin still iframes `?preview=true`.
> - Per-record writes with revision checks. Publishing is whole-document.
> - The kitchen-sink CI matrix (every block x variant x theme x breakpoint).
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

> ### NOT STARTED
>
> The admin is still **Astryx + React Router**, mounted client-side inside
> `app/admin/[[...slug]]`. Everything in this phase remains:
>
> - `npx shadcn init`, then the AdminShell. Port the sidebar IA from
>   `src/admin/components/AdminSidebar.tsx` as _data_, not as markup.
> - **Build `<MediaPicker>` first.** It unblocks every image field and the
>   fixed-4-slot problem. Today there is no way to reuse an uploaded image
>   without hand-copying an `idb:` string.
> - The block builder (three panes; `@dnd-kit` reorder **in the outline, not on
>   the canvas** — keyboard-operable, touch-friendly, testable).
> - Progressive disclosure on record editors, and collapse the five duplicate
>   settings routes into `settings/[panel]`.
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

> ### PARTIALLY DONE — SMTP, notification and reset shipped; adapters, registry, vault and OTP do not exist
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

### Phase 9 — Blog, newsletter capture, themes 2–6, presets, launch (4–5 weeks)

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

- **Conformance:** `npm run test:adapters` green for all 8 (local in every CI run; hosted ones nightly with test credentials).
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

### Get running

```bash
git clone https://github.com/ShadmanArafin/open_portfolio_builder.git
cd open_portfolio_builder
npm install
npm run dev          # http://localhost:3000, then claim the site at /setup
```

No account, no keys, no database. The local filesystem adapter is the default
and stores everything under `.opb/`. Delete that folder to reset to a fresh
install. `npm run dev` needs no `OPB_SETUP_TOKEN`; a production build does.

Verify before you change anything:

```bash
npm run typecheck && npm run lint && npm run format:check && npm run test && npm run build
```

To exercise the SQL backends against a real database:

```bash
docker run -d --name opb-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=opb_test -p 55432:5432 postgres:16
TEST_POSTGRES_URL="postgres://postgres:postgres@localhost:55432/opb_test" npx vitest run
```

That takes the suite from 21 tests to 59.

### Things that will bite you

**Test with `npm ci`, not `npm install`.** A populated `node_modules` lets npm
reuse what is already there and hides peer-dependency conflicts. This exact
mistake merged a broken dependency bump into `main`. Delete `node_modules`,
run `npm ci`, then check.

**ESLint is pinned to 9 and TypeScript to 5.5, on purpose.** ESLint 10 has no
compatible `eslint-plugin-jsx-a11y`, and TypeScript 7 falls outside
`typescript-eslint`'s peer range. Do not bump either until upstream catches up.
Dependabot will keep proposing it.

**Tailwind is pinned to 3.4, on purpose.** PR #7 (Tailwind 4) is open and held
until the token work lands — see Phase 2.

**Never derive an authorization decision from a request header.** A
`Host: localhost` check in the claim flow was a real auth bypass, caught by
review. Environment variables and cookies only.

**Admin paths are router-relative.** The admin runs under
`basename="/admin"`, so `to="/admin/login"` resolves to `/admin/admin/login`.
Write `to="/login"`.

**Windows and Linux disagree about concurrent renames.** Linux allows a rename
onto a file another rename is touching; Windows returns `EPERM`. The local
adapter serialises writes per path because of this. If a test passes on one
platform, that is not evidence it passes on the other — Docker is right there.

**`format:check` and line endings.** `.gitattributes` normalises to LF. If you
see a diff touching every file, your checkout is CRLF and something is wrong
with your git config, not with the code.

### Architecture in three sentences

`app/` holds routes only. `core/` holds server-only domain logic — storage
adapters behind one contract, auth, content reads — and every file there starts
with `import 'server-only'` so a leaked credential is a build failure. `src/`
still holds the public site components (`src/views`, `src/components`) and the
old admin (`src/admin`), which is the part Phase 7 replaces.

### Adding a storage backend

One file in `core/storage/adapters/`, one line in `core/storage/registry.ts`,
env-var inference in `inferAdapterId()`, and a green run of
`core/storage/conformance.ts`. If it is SQL, reuse
`core/storage/adapters/_shared/postgres.ts` — Supabase, Neon and generic
Postgres all do, which is why the fourth one cost almost nothing.

**The conformance suite is not optional.** It has already caught two real
concurrency bugs that only appeared on one platform. An adapter without a green
run should not ship.

### Deliberate deviations from the plan below

These are decisions, not oversights, and the reasoning is in each phase block:

- **Passphrase auth instead of passkeys.** Session machinery supports adding them.
- **`src/pages` renamed `src/views`.** Next reserves `pages`.
- **The admin still runs React Router** inside one Next route, on purpose, so
  the framework migration could land without also rewriting twenty screens.
- **`work`/`timeline` collection merges not done.** Still four collections.
- **Content core still lives in `src/cms/`,** not `core/content/`.
- **Tailwind 4 deferred** until tokens exist.

### Verifying your work

Claims in this repository are expected to be backed by something you ran. The
patterns used throughout:

- Server rendering: `curl` the route and grep the raw HTML for the content and
  the meta tags. If it is only in the DOM after hydration, it is not
  server-rendered.
- Auth: check the failure cases, not the success case. Wrong passphrase, wrong
  email, no session, cross-site origin.
- Storage: run the conformance suite against a real database in Docker.
- Anything visual: load it in a browser and check the console is clean.
