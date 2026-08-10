> **Archived — this is the original plan, exactly as written before any code was
> touched.** It is kept for reference: the reasoning behind each decision, the
> alternatives weighed, and the estimates made at the time.
>
> **It does not reflect what was built.** Several decisions here were later
> changed or deferred, and the estimates proved optimistic. For the current
> state of every phase, what is verified, and what remains, read
> [PLAN.md](PLAN.md) instead.
>
> One edit was made to this copy: the original owner named in the Context
> section has been removed, because this repository is public and a CI guard
> rejects personal data.

---

# Open Portfolio Builder — Open-Source Rebuild

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

Port `src/components/**` and `src/pages/**` bodies into `themes/default/**`. `'use client'` on the **17 files importing framer-motion**; `useCMS()` → props; `react-router-dom` → `next/link`. Port `src/styles/index.css:23-112` and `tailwind.config.js theme.extend`. Move the anti-flash theme script into `app/layout.tsx` with a CSP nonce. Delete `vite.config.ts`, `index.html`, `src/App.tsx`, `src/main.tsx`, `MainLayout.tsx`.
_Risk: theme hydration mismatch → keep the blocking script verbatim, `suppressHydrationWarning` on `<html>`, never branch on theme to produce markup._

### Phase 2 — Content core + tokens + primitives (2 weeks)

`core/content/schema` (today's [cms.ts](src/cms/types/cms.ts) moved + zod mirror), snapshot split, ports of `dates.ts`, `contentHealth.ts`, `listOps.ts`, `socialPlatforms.ts` (**split the react-icons half out** or it drags the icon library into every server module). Token generator + contrast validator + the 17 primitives + Default theme + the ESLint/CI bans.

### Phase 3 — Adapter contract + `local` + read path (2 weeks)

Contract, conformance suite, `local` adapter, `getPublishedSnapshot()` (React `cache` + `unstable_cache`, tag `content`). Wire `generateStaticParams`/`generateMetadata`/`sitemap.ts`/`robots.ts`/`opengraph-image.tsx` — **SEO works for the first time.**
_Riskiest step: media reference rewrite._ `scripts/migrate-bundle.ts` must be checksum-keyed, idempotent, resumable, `--dry-run` first. Silent data loss is the only unrecoverable failure in this plan.
_`generateStaticParams` must never fail the build_ — try/catch → `[]`, so a paused free-tier DB yields a dynamic site, not a red build.

### Phase 4 — Auth, before any admin UI (2 weeks)

Passkey + OTP + sessions + claim + CSRF + rate limiting + CSP/headers. `requireOwner()` **deny-by-default**. Delete [cmsService.ts:637-685](src/cms/services/cmsService.ts#L637-L685) and `VITE_ADMIN_PASSCODE`.

### Phase 5 — Write path, publish, blocks, pages (3 weeks)

Per-record writes with revision checks; publish (validate → version → bulkPut → `writeSnapshot` → `revalidateTag`); `draftMode()` preview replacing the `?preview=true` iframe. Block schema + registry + validation + migration harness + renderer with the first 6 blocks and the kitchen-sink matrix **from day one**. Catch-all `[[...slug]]` routing. Keep `MAX_VERSIONS = 20` and the snapshot-excludes-history decision ([cmsService.ts:284-298](src/cms/services/cmsService.ts#L284-L298)) — both were right.

### Phase 6 — Adapters #2 and #3, _before_ the admin UI (2 weeks)

Supabase (built-in auth, presigned storage) and Neon+Vercel Blob (SQL, **no** built-in auth, separate blob service) — structurally the most different pair available. If the contract survives both plus `local`, it survives the rest. **Highest-leverage risk reduction in the plan; do not skip it to reach screens faster.**

### Phase 7 — Admin (4–5 weeks)

`npx shadcn init`, AdminShell (sidebar IA ported as _data_ from [AdminSidebar.tsx:72-138](src/admin/components/AdminSidebar.tsx#L72-L138)), **`<MediaPicker>` first** (it unblocks every image field and the fixed-4-slot problem), then the block builder (3-pane, `@dnd-kit` reorder **in the outline not the canvas** — keyboard-operable, touch-friendly, testable), then one record editor end-to-end as the template, then the rest. Progressive disclosure: Essentials → Details → SEO. Collapse the 5 duplicate settings routes into `settings/[panel]`.

### Phase 8 — Remaining 5 adapters + integrations (3 weeks)

Cloudflare D1+R2, Firebase, Appwrite, PocketBase, Convex — each a PR with green conformance + docs page + `.env.example` block. Integration registry: one `IntegrationDefinition` per service (metadata, free-tier limits with a verified-on date, plain-English setup guide, zod schema, mandatory `test()` with non-technical remediation copy, CSP contribution, degradation mode) rendered by **one** generic admin screen. Secrets AES-256-GCM server-side, `import 'server-only'`, CI greps `.next/static/**` for secret values.
_Honest scoping:_ Vercel Marketplace can only auto-provision Marketplace-native products (Supabase, Neon, Upstash, Blob, Resend). Firebase, Appwrite, PocketBase and Cloudflare use the manual path — so adapter choice happens _after_ deploy for those, and the deploy form asks for **at most two fields** (`OWNER_EMAIL`, `SITE_NAME`). Behance's public API is retired and LinkedIn has no profile API — those imports are file-upload/paste flows, not connections.

### Phase 9 — Blog, newsletter capture, themes 2–6, presets, launch (4–5 weeks)

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
