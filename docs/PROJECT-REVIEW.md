# Open Portfolio v0.5.0 — Full Product Review (A to Z)

> Generated: 2026-10-16 · Source of truth for status remains `docs/PLAN.md`.
> This file is the consolidated findings + improvement plan from a full review
> across product design, UI/UX + UX laws, product management, engineering,
> architecture, production practices, tech stack, and quality-of-life features.
> No code changes were made to produce this file.
>
> **Project constraint (binding):** this is an open-source free tool for
> everyone. Do not promote, provide, or suggest any paid tool — neither for
> end users nor for development. Every recommendation below must resolve to a
> free, open-source, or self-hostable option. Where the research surfaced a
> paid-first pick, the free alternative is the one that stands.

**How to use this file:** work top-down. P0 first. Each item has file paths
with line anchors where known. Check them off as you ship. Keep `docs/PLAN.md`
as the build log; keep this file as the backlog.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Product Manager lens](#2-product-manager-lens)
3. [Product Design / IA lens](#3-product-design--ia-lens)
4. [UI/UX expert + UX laws — public site](#4-uiux-expert--ux-laws--public-site)
5. [UI/UX expert + UX laws — admin](#5-uiux-expert--ux-laws--admin)
6. [Developer / Architecture / Production](#6-developer--architecture--production)
7. [Tech stack — keep, change, evaluate](#7-tech-stack--keep-change-evaluate)
8. [Missing features + QoL backlog (prioritized)](#8-missing-features--qol-backlog-prioritized)
9. [Action plan — phased checklist](#9-action-plan--phased-checklist)
10. [Sources + verification notes](#10-sources--verification-notes)

---

## 1. Executive summary

This is a well-architected, honest alpha. The load-bearing engineering is
above average for a self-hosted project: storage abstraction with a real
conformance suite, a careful auth posture, a token + contrast system with
publish-time enforcement, and an activation flow (Deploy → claim → 4 questions
→ publish) that actually works.

What blocks "ideal product" status is not architecture — it is editor IA,
public-site accessibility/performance debt, and a missing retention loop:

1. **Two editors for one homepage** — legacy bands
   (`src/admin/pages/AdminPagesEditor.tsx`) vs blocks
   (`src/admin/pages/AdminSitePages.tsx`). Dashboard points at the legacy one.
2. **Admin is desktop-only + client-only** —
   `app/admin/[[...slug]]/admin-mount.tsx` (`ssr:false`) +
   `BrowserRouter basename="/admin"`. Zero SSR, no mobile layout, no `Cmd+K`.
3. **Public-site perf/a11y debt** — zero `next/image`, zero `next/font`,
   `Reveal.tsx` ignores `prefers-reduced-motion`, 3 modals/menus with no focus
   trap, hardcoded colors bypassing tokens.
4. **Retention loop missing** — inbox exists but no notifications, no
   in-product analytics, newsletter captures but never sends.
5. **Primary CTA contradiction** — Vercel Deploy is the #1 path, but the Hobby
   plan forbids commercial portfolios (`README.md` lines 60-88). The #1 persona
   (freelancer advertising services) is legally mis-routed.

Fix the dual-homepage confusion, the mobile/admin-shell debt, and the
spam/analytics gaps before adding more blocks. The architecture can carry 1.0;
the editor IA and public-site a11y/perf cannot yet.

---

## 2. Product Manager lens

### 2.1 ICP / personas — clear, too narrow

**Strengths**

- Explicit ICP: students, early-career, self-hosters, subscription-burned,
  "words, pictures, contact form" portfolios. 7 profession packs in
  `src/cms/data/professions.ts` (Design, Software, Photography, Writing,
  Research, Student, Other) rename sections without data loss.
- Demo personas are fictional/CC0-safe and well-written.
- The "who should NOT use this" list (sell anything → Squarespace/Wix; visual
  design IS the work → Framer/Cargo; want phone support → Wix/Behance/Contra)
  builds trust and reduces bad-fit churn.

**Gaps**

- No **agency / freelancer-who-sells-sites** persona (multi-site,
  white-label, client handoff). `site/content/docs/what-this-is-not.md`
  explicitly rules out multi-tenancy ("one owner, one deployment"), which
  closes the most natural open-source monetization vector. Revisit post-1.0.
- No **hiring-manager / recruiter** secondary persona. They need fast load,
  PDF resume, shareable case-study link, print stylesheet. Resume download
  exists but is not centered in the journey.
- No **photographer client-proofing** story: no password pages, no expiring
  share links. Per-page `noindex` is explicitly "not a lock — still public".

### 2.2 Value prop — strong headline, muddy middle

- Headline "Build a portfolio site you own outright" + subhead naming the
  category alternatives is excellent. Cost/permanence pages with sourced, dated
  claims are a genuine differentiator.
- Name churn: "Open Portfolio Builder" → "Open Portfolio" (see CHANGELOG).
  Export format `open-portfolio-builder` is deliberately kept — grep marketing
  for stale references before 1.0.
- **Stale numbers:** "24 / 22 / 16+7 blocks" disagree across `README.md`,
  `site/app/page.tsx`, and help docs. Generate the count from
  `core/blocks/registry.tsx` instead of hand-editing.
- **Stale honesty bands:** marketing homepage still says uploads were "never
  run against Vercel Blob or Supabase Storage" and "five of nine backends not
  built". Per `README.md` 0.5.0 both are fixed (uploads verified, 8 backends
  built, only Convex missing). Stale honesty erodes the honesty brand.
- **Draft split obscured:** "your content lives in your database" hides that
  drafts live in browser IndexedDB while the published snapshot lives on the
  server. Two-computer editing loses drafts. Surface in first-run UX, not just
  `ADMIN_SETUP.md` §3.

### 2.3 Activation / first-run — best part of the product

Claim at `/setup` (email + passphrase, `OPB_SETUP_TOKEN` on public hosts) →
4 questions (name/role, profession vocabulary, colour, publish) → live site
with demo content + dashboard checklist. Every step skippable. Deploy paths
ordered easiest-first. Browser demo + `docker-compose.demo.yml` hourly sandbox
are exactly right for evaluation.

**Remaining friction**

- Vercel Hobby trap: primary CTA deploys freelancers onto a plan whose terms
  may forbid commercial portfolios. Currently a docs warning — needs a
  first-class "if you charge money, don't use Hobby" branch in the deploy
  flow, not just docs.
- No import path: Squarespace/Wix export is partial/nonexistent; Behance API
  retired; LinkedIn has no profile API. Ship Markdown/CSV + image-bulk import
  via file upload, not OAuth.
- Mobile admin installs as PWA but "editing screens were designed for
  desktop" (roadmap 0.7). The student persona edits from a phone — this blocks
  their activation.

### 2.4 Retention — thin

Exists: draft/publish + preview + 20-snapshot history, health dashboard, inbox,
SMTP notify, writing + RSS + scheduled predicate, newsletter double opt-in +
CSV export.

Missing loop: no notifications (must open admin to notice an enquiry), no
scheduled-publish UI beyond the writing predicate, analytics is env-vars only,
no comments/engagement, no update nudge. Portfolio sites are
low-frequency-edit products; without an inbox ping or traffic signal there is
no reason to return.

### 2.5 Monetization / self-host positioning — principled but fragile

"No paid tier, no account, nothing to cancel. MIT." Cost page lists real host
costs. Permanence argument (MIT irrevocable, export JSON anytime) is the
strongest retention story. Docker path is verified.

Fragility: single maintainer, no funding/sponsorship ("How this is paid for:
It is not"). One-click path depends on Vercel while Docker is the no-lock-in
story — swap order for commercial users. Deliberate non-monetization (no
commerce, no newsletter send, no memberships) closes the usual portfolio-maker
revenue, so sustainability must come from support/hosting/donations — none
stated.

---

## 3. Product Design / IA lens

Admin mount: `app/admin/[[...slug]]/admin-mount.tsx` (`ssr:false`) →
`admin-app.tsx` (`BrowserRouter basename="/admin"`, all `React.lazy`) →
`src/admin/layouts/AdminLayout.tsx` (AppShell + TopNav + SideNav + Banner).

| Area                    | Route(s)                                                                                                                                        | Component                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Auth                    | `/admin/login`, `/admin/reset?token=`                                                                                                           | `src/admin/pages/AdminLogin.tsx`, `AdminResetPassphrase.tsx`                                                    |
| Onboarding              | `/setup`, `/admin/welcome`                                                                                                                      | `app/setup/page.tsx`, `app/setup/claim-form.tsx`, `src/admin/pages/AdminWelcome.tsx`                            |
| Overview                | `/`, `/analytics`                                                                                                                               | `AdminDashboard.tsx`, `AdminAnalytics.tsx`                                                                      |
| Homepage (legacy bands) | `/homepage`                                                                                                                                     | `src/admin/pages/AdminPagesEditor.tsx`                                                                          |
| Pages (blocks builder)  | `/pages`                                                                                                                                        | `src/admin/pages/AdminSitePages.tsx` + `BlockFields.tsx`                                                        |
| Collections             | `/projects`, `/case-studies`, `/brands`, `/experience`, `/education`, `/process`, `/capabilities`, `/recommendations`, `/artifacts`, `/writing` | `AdminProjectsCMS.tsx`, `AdminCaseStudiesCMS.tsx`, …                                                            |
| Assets                  | `/media`, `/resume`                                                                                                                             | `AdminMediaLibrary.tsx`, `MediaPicker.tsx`, `AdminImageField.tsx`                                               |
| Inbox                   | `/messages`, `/newsletter`                                                                                                                      | `AdminMessagesInbox.tsx`, `AdminNewsletter.tsx`                                                                 |
| Config                  | `/navigation`, `/footer`, `/microcopy`, `/appearance`, `/seo`, `/settings`, `/services`, `/your-site`, `/storage`                               | `AdminSettings.tsx`, `AdminNavigationCMS.tsx`, `AdminIntegrations.tsx`, `AdminYourSite.tsx`, `AdminStorage.tsx` |
| System                  | `/history`, `/help`                                                                                                                             | `AdminVersionHistory.tsx`, `AdminHelp.tsx`                                                                      |

**Design findings**

- Two truths for homepage. `AdminSitePages.tsx:124-138` banner and
  `AdminDashboard.tsx:105-111` CTA point in opposite directions. Fix: point
  the dashboard at `/pages`, deprecate `/homepage`.
- `AdminSettings.tsx` (~1100 lines, 5 panels, one file) has no in-page tab
  bar — switching General↔SEO requires a sidebar round-trip. Add tabs;
  `panelFromPath` already supports deep-links.
- `MediaPicker.tsx` has search; `AdminMediaLibrary.tsx` does not. Library
  needs sort/filter/bulk/pagination; copy-URL tooltip ("paste into an image
  field") is obsolete now the picker exists.
- `AdminVersionHistory.tsx`: no diff/preview, `#N` reverse index is confusing,
  restore requires a separate publish step that is easy to forget.
- Command palette (`src/admin/components/astryx/AstryxCommandPalette.tsx:29-56`)
  hard-codes `/admin/...` inside a `basename="/admin"` router (double-prefix
  `/admin/admin/...` risk) and has no `Cmd+K`/`Ctrl+K` listener — it only opens
  via the TopNav button, defeating its purpose.

---

## 4. UI/UX expert / UX laws — public site

### 4.1 App shell

- `app/layout.tsx`: blocking inline theme script prevents FOUC; SSR palettes
  via `buildThemeStylesheet`; `lang="en"`, `colorScheme`, preconnect only for
  used fonts — all good.
- **Violation (Jakob / Autonomy):** `if (t!=='dark' && t!=='light') t='dark'`
  - `<html class="dark">` forces dark on everyone, ignoring
    `prefers-color-scheme`. Respect OS on first visit.
- `app/(site)/layout.tsx`: exemplary skip link (`sr-only focus:not-sr-only`,
  `z-[100]`), `<main id="main">`, `revalidate=60`, channel-aware preview.
  Minor: skip link `text-sm px-4 py-2` (~32px) under the 44px comfortable
  target.
- `app/(site)/page.tsx`: home fallback never ships a blank front door —
  good. Missing `loading.tsx`/Suspense means a CMS stall renders a blank
  `main` (Peak-End / Doherty).
- `app/(site)/[...slug]/page.tsx`: real 404 + draft `noindex` + resilient
  `generateStaticParams` — good. Slug shadowing static routes relies on admin
  `checkSlug` elsewhere with no public explanation.
- Banners (`demo-banner.tsx`, `preview-banner.tsx`): `role="status"`,
  server-rendered, plain `<a>` for preview-exit (no prefetch side-effect) —
  good. Text-link tap targets ~16px on phones (Fitts, minor).

### 4.2 Content routes

- `about` / `contact` / `work` / `case-studies`: per-route canonical +
  OG/Twitter via central `metadata.ts` — good. `about` uses
  `aboutStoryParagraphs[0]` verbatim as meta description (can be 300+ chars,
  truncated by Google). No JSON-LD `Person`/`CreativeWork` (missed rich
  results).
- `work/[slug]`, `case-studies/[slug]`: `seoTitle||title||name`,
  `type:article` — good. Falls back to generic Next 404 (no branded
  `not-found.tsx`, visual discontinuity).
- `writing/page.tsx`: `showDates` toggle respects evergreen content (Miller);
  `notFound()` when disabled beats an empty page. No pagination/filter (Hick
  at 50 posts); index metadata omits description/image (no OG description).
- `writing/[slug]/page.tsx`: same block renderer as pages — good; same
  missing `loading` boundary.
- Newsletter `confirm` / `unsubscribe` (`newsletter/token-action.tsx`):
  POST-on-click (not GET — mail scanners can't auto-confirm), `minHeight:44`,
  `role="status"` — exemplary. Error state uses `var(--text-muted)` gray, not
  a danger token (Aesthetic-Usability, minor).
- `writing/feed.xml/route.ts`: `escapeXml`, absolute URLs, `max-age=3600` —
  good. No `<link rel="alternate" type="application/rss+xml">` in layout
  metadata, so the feed is undiscoverable (Jakob, minor).

### 4.3 Theme system — best-in-repo

- `core/theme/tokens.ts`: 6 inputs → full system, `readableForeground`,
  20-step `enforceContrast` walk, separate 3:1 accent vs 4.5:1 link
  thresholds, `text-muted` clamped to 4.5:1. No UX violation.
- `core/theme/contrast.ts`: dependency-free WCAG luminance, tolerant hex
  parsing, suggestion walk. No violation.
- `core/theme/audit.ts`: 9 pairs × both modes, decorative hairlines exempted
  with rationale, owner-readable `describeFailure`. One sentence + suggestion,
  not a matrix dump (Hick, positive).
- `core/theme/presets.ts`: 6 themes, one-line feeling descriptions, default =
  old defaults (no surprise restyle). Minor: `terminal` sets body=mono for
  everything with no readability warning.
- `core/theme/layout-tokens.ts`: fluid `clamp()` type, `--measure:68ch`,
  `--control-height` floored at 44px regardless of `compact`
  (Fitts/WCAG 2.5.5), `auto-fit minmax()` grids. Model implementation.
- `tailwind.config.js`: colors via `var(--*)` so the picker works. Duplication
  (Tesler): `maxWidth 1440/1280` duplicates `--container-*` tokens;
  `Container.tsx` hardcodes `max-w-[1280px]` ignoring the token. Unify.

### 4.4 Blocks

- `core/blocks/registry.tsx`: first heading `h1`, rest `h2` — reordering never
  breaks outline (WCAG 1.3.1). Unknown/hidden blocks render `null` publicly
  (no leak). Minor: owner preview also hides broken blocks unless editor
  warnings are seen — silent page gaps.
- `definitions.tsx` (hero, richText, image, gallery, stats, cards, ctaBanner):
  hero max 2 CTAs (Hick), `headline-length>90` nudge (Miller), gallery
  `ragged-last-row` advice. Violation: cards `Read more` × N is generic
  (WCAG 2.4.4) — needs `aria-label="Read more: {title}"`.
- `standard.tsx` (contactForm, faq, video, split, quote, newsletter,
  socialRow, services, download, separator): native `<details>`, facaded
  `youtube-nocookie` (~0.5 MB saved, Doherty), DOM-order `split` flip,
  real `figure/blockquote`. No violation beyond the shared form note below.
- `forms.tsx`: single client boundary, honeypot + `role=alert/status` —
  good. **Inconsistency (Jakob):** block `ContactForm` lacks
  `aria-invalid`/`aria-describedby`/`autoComplete=name` and uses
  `text-primary` for errors while `ContactPage` does all three correctly.
  Bring the block form to parity.
- `collections.tsx`: empty collections render `null` + editor `emptyCheck`
  phrased as outcome — good. Von Restorff note: heading also vanishes, so an
  owner who forgets to star `featured` sees a silently missing section.

### 4.5 Views + components — concrete defects

- `src/views/WorkPage.tsx:76`: pills `h-[38px]` — violates the repo's own
  44px floor. Sub-category `split('/')` can explode to 12+ pills (Miller,
  needs collapse). Empty filter state has no `role="status"`.
- `src/views/ContactPage.tsx`: model form (`label htmlFor`, `autoComplete`,
  `aria-invalid`+`describedby`, honeypot, success state) — keep as the
  reference. Defects: submit `h-[42px]`, hardcoded `red-500/400` error colors
  (~3:1 in light mode, should be tokenized).
- `src/views/AboutPage.tsx`: portrait alt + status badge — good. Defects:
  education `degree` is `h3` with no preceding `h2` (skips level); gallery
  cards are `motion.div onClick` (mouse-only lightbox, must become
  `<button>`); hardcoded `all/ui/systems/mobile` filters can lie about real
  categories.
- `CaseStudiesPage` / `CaseStudyDetailPage`: `line-clamp-3`, `mt-auto` CTA
  alignment, numbered detail sections — good. Corner badge
  `opacity-0 group-hover:opacity-100` is invisible to touch/keyboard; needs a
  `:focus-visible` equivalent.
- `Navbar.tsx`: 3-col centered menu, closes on `pathname` — good. Hamburger
  `aria-label` static (needs `aria-expanded`); overlay is not `role=dialog`
  with no focus trap; desktop links `py-1` (~28px, passes minimum, not
  comfortable).
- `Footer.tsx`: prior sins fixed (watermark `aria-hidden`, no 406px overflow,
  single copy button, `text-secondary` meta). Still ~3 viewports on phones
  (Miller) — consider collapsing.
- `HeroSection.tsx`: `max-w-2xl` body measure, 42px CTAs — good. Fixed
  `38/46/54/64px` sizes bypass fluid `--text-*` tokens (defeats `typeScale`);
  `#08A669` availability dot fails 3:1 in light mode — tokenize to
  `var(--link-color)`.
- `ThemeToggle.tsx`: dynamic `aria-label`, 42px pill — good. Mapping
  ambiguity (Jakob): dark mode shows `Sun + LIGHT` — is LIGHT current or
  target? Show current-state icon + target label or use `aria-pressed`.
- `Button.tsx` + `ContactCTASection.tsx:70`: `bg-[#25D366]/white` (~2.5:1
  fail); link branches lack `focus-visible:ring`. Tokenize; add ring.
- `CMSImage.tsx`: plain `<img>`, no `loading=lazy`, no `width/height` (CLS).
  Migrate to `next/image` or at minimum `decoding=async` + dimensions.
- `NewsletterSignup.tsx`: gated copy, honeypot, `role=status/alert` — good.
  Label `text-[11px] text-muted` is fragile even at 4.5:1 — bump to 12px.
- `CustomCursor.tsx`: disabled on touch, `pointer-events-none` — good. Double
  cursor (native not hidden), no `aria-hidden`, no `prefers-reduced-motion`
  check (unlike `LiquidDualCTA`). Add `MotionConfig` / media-query guard.
- `Reveal.tsx` (used 40+ times): no `prefers-reduced-motion` — vestibular
  risk. Add `MotionConfig reducedMotion="user"`. Content is `opacity:0`
  pre-JS — needs `noscript`/SSR-visible fallback.
- `Section.tsx` / `Container.tsx`: fixed padding / `1280px` ignore
  `--section-y` / `--container-*` tokens. Unify on layout tokens.
- `SideSectionIndicator.tsx`: 1px × 12–32px lines, `py-1` hit area (~28px,
  pointer-hostile); tooltips hover-only (9 dots, no names — Hick). Add
  transparent 44px hit area + persistent `xl:` labels or `aria-current`.
- `ImageLightboxModal.tsx` / `MediaLightboxModal.tsx`: ESC + scroll lock +
  caption bar — good. No `role=dialog aria-modal`, no focus trap, no
  return-focus; video `autoPlay` with no captions source (WCAG 1.2.2).
- `ExperienceRow.tsx` / `LiquidDualCTA.tsx`: appear unused (no imports in
  views). Delete or gate behind a flag. `LiquidDualCTA` hover-morph chases
  the pointer (Hick/Fitts) — do not ship as-is.

---

## 5. UI/UX expert / UX laws — admin

### 5.1 Setup / claim (`app/setup/*`)

Token-gated explainer, `noindex`, 12-char passphrase hint — good. No strength
meter, no confirm field, error is plain `text-red-400 <p role=alert>` instead
of the admin `Banner` (inconsistent). Single `busy` flag blocks double-submit
with no progress indication.

### 5.2 Welcome wizard (`AdminWelcome.tsx`)

4 steps, all skippable, profession switch is wording-only (no data loss),
accent contrast-checked — good. Defects: trigger is content-sniffing
(`AdminLayout.tsx:62 fullName==='Your Name'` — rename back / second browser /
cleared storage re-triggers or misses); `applyAndPublish:126` sleeps 600ms
for a debounced save (race by design, slow devices lose edits); publish
failure still dismisses then shows inline error (user must discover top-bar
Publish); progress is 4 anonymous bars (no "Step X of 4" announcement).

### 5.3 Login (`AdminLogin.tsx`)

3 paths (passphrase/passkey/OTP), anti-enumeration copy, autofocus — good.
Defects: OTP `<form>` nested inside outer `<form>` (`:207` inside `:136`,
invalid HTML, Enter submits the wrong form); passkey `NotAllowedError`
swallowed silently (`:78`, cancel = zero feedback); no show/hide passphrase,
no caps-lock warning, OTP input missing `inputMode=numeric` +
`autocomplete=one-time-code`, no resend timer; OTP request uses
`Link + preventDefault` (breaks no-JS/right-click).

### 5.4 Dashboard (`AdminDashboard.tsx`)

Action-oriented (readiness %, blocking/warning/idea, deep-linked issues,
honest "not visitor analytics" note) — good. Defects: hero CTA sends new users
to legacy `/homepage`, not blocks `/pages`; unpublished-changes card has no
Publish CTA (must find TopNav).

### 5.5 Page builders — two truths

`AdminSitePages.tsx` (blocks, outline, keyboard/phone friendly, per-block
checks, unknown-block preservation) vs `AdminPagesEditor.tsx` (homepage
bands). Header copy admits the confusion. Users maintain two mental models +
two publish semantics.

- `AdminPagesEditor` "Save section" (`:66-72`) only bumps `lastSavedAt` —
  autosave already saved. The button is a placebo; remove it.
- `Anchor ID` free text with no duplicate/slug validation — add it.
- `AdminSitePages` delete page has **no confirm** (`:167-175`) while
  projects/case-studies do — one misclick destroys blocks. Add confirm.
- Reorder is paired 14px chevrons (`AdminRecord.tsx:79-98`,
  `disabled:opacity-30`) — tedious + sub-44px targets. Enlarge, add drag +
  keyboard alternative.
- "Preview this page" opens `/api/preview?path=` with no return affordance —
  add one.

### 5.6 Media library (`AdminMediaLibrary.tsx` + `MediaPicker.tsx`)

Usage counts, `unused` badge, PDF warning, alt-text-at-choice — good. Defects:
PDF upload silently overwrites `resumeUrl` (`:33-38`, no opt-out — uploading
a case-study PDF hijacks the CV link); delete uses native `window.confirm`
(`:57`, thread-blocking, unstyled, no undo, inconsistent with Astryx
`Dialog`); no search/filter/sort/pagination in library (picker has search);
no bulk delete; empty state is plain `AstryxCard <p>`, not `EmptyState`.

### 5.7 Settings (`AdminSettings.tsx`)

`panelFromPath`, searchable microcopy, theme-clear warning — good. Defects:
theme switch wipes 9 overrides with no confirm/undo (`:788-800`); SEO share
image is a raw text input (no `MediaPicker`); canonical/robots free text, no
validation; backup `status` uses `text-accent` instead of semantic
success/error; Import/Reset stack native confirms (Reset needs typed
confirmation); passkey device-name `width=100%` breaks the flex row (`:509`).

### 5.8 Publish / Preview / Revisions

`Unpublished changes/Published` badge + `describeChanges` tooltip + contrast
gate at the boundary (422) + draft channel excluded from the gate — good.

- Success `Banner` auto-clears in 4000ms (`AdminLayout.tsx:77`, too fast for
  SR users); failure says "see message above" with no field link.
- Publish `isDisabled=!hasUnpublishedChanges` with hover-only tooltip —
  undiscoverable on touch/keyboard; 422 never mapped to Appearance fields.
- Preview: 1200ms debounce + full `iframe.src=` reload loses scroll;
  `width:46%` + `HStack gap=0` never stacks — editor squeezed to ~54% on
  small screens while the 390px frame overflows. No per-page device memory.
- Autosave conflict adopts server then warns "next save will overwrite it"
  (`cmsService.ts:336-342`) — no merge/diff UI. Offline saves fail silently
  (catch-empty) with no offline badge.
- Revisions: no diff preview, `summary/action + timestamp + editor` only;
  restore = native confirm + must re-publish (two steps, easy to forget);
  `#N` reverse index; 20-cap footnote only.

### 5.9 Cross-cutting admin

- `storageError` banner + `isDurable` warning excellent; `useToast` has no
  failure variant (`AdminNewsletter.tsx:84-87`) so failures fall back to
  inline text.
- Destructive actions split between `window.confirm` (6 flows) and none
  (delete page, theme clear) — error-prevention inconsistent (Nielsen).
- TopNav packs Search + External + Theme + Preview + Publish
  (`AdminLayout.tsx:110-152`) — overflows 360px. `MediaPicker Dialog
width=720` needs `maxWidth=100vw`. Tablet 768px preview frame forces
  horizontal scroll.
- Single-owner only is correct (`requireOwner` per route); UI hard-codes
  `Administrator` (`AdminSidebar.tsx:261`), no "signed in as" email, no
  session-expiry surfacing. `logout()` awaited before navigate — good.
- Loading states are pulsing text only (`admin-mount`, `authReady`,
  `Checking your session...`) — no skeletons, no `aria-live`; deep links can
  bounce login→dashboard on mistimed `authReady`.

---

## 6. Developer / Architecture / Production

### 6.1 Strengths (keep)

- **Next.js 16 App Router, mostly idiomatic:** async root layout +
  `generateMetadata`, SSR theme tokens + justified
  `suppressHydrationWarning`; `revalidate=60` + channel-aware preview;
  resilient `generateStaticParams` (try/catch → `[]`); `params: Promise<>`
  awaited; real `notFound()`; per-page metadata with draft `noindex`;
  `cache()`-deduped `getPublishedContent`/`getContentForChannel`
  (`core/content/read.ts`); `revalidatePath('/', 'layout')` after publish;
  media route with traversal guard + SVG-as-attachment + `nosniff`
  (`app/api/media/[...key]/route.ts`).
- **Server/client boundaries explicit:** single `'use client'` boundary
  (`app/(site)/providers.tsx`); `ssr:false` admin mount justified (IndexedDB);
  `import 'server-only'` in `core/storage/contract.ts`, `core/auth/*`,
  `core/content/read.ts`, `sanitise.ts` (build fails on secret leak);
  `core/auth/constants.ts` deliberately dep-free for Edge; ESLint
  `no-restricted-syntax` bans hex/pixel/arbitrary values in
  `core/blocks/**` (`eslint.config.js`).
- **Auth above-average for self-hosted:** `requireOwner()` per-handler +
  `assertSameOrigin` (`core/auth/guard.ts`, ~40 call sites); middleware
  documented as UX-only (bypass advisories cited); opaque `randomBytes(32)`
  - SHA-256 at rest + `__Host-` + 30d sliding/90d absolute + epoch revocation
    (`session.ts`); `timingSafeEqual` claim + double-checked owner
    (`claim.ts`); versioned scrypt + dummy-derivation + NFKC + HIBP
    k-anonymity (`passphrase.ts`); hash-only burn-before-verdict OTP (`otp.ts`);
    `publicView()`/`withoutEnquiries()` strip drafts/messages (`sanitise.ts`).
- **Storage abstraction — best part of the repo:** `StorageAdapter`
  contract (`core/storage/contract.ts`); ~1040-line framework-agnostic
  conformance suite (revisions, racing writes, 50-concurrent inbox,
  idempotent provision, auth/content isolation); env-inference +
  ambiguity-as-error + ephemeral refusal + memoised provision-on-first-use
  (`registry.ts`); atomic queued writes (`adapters/local.ts`); shared SQL
  engine (`adapters/_shared/postgres.ts`); per-cookie demo sandbox
  (`adapters/demo.ts`); quarantined unknown blocks + positional h1/h2
  (`core/blocks/*`).
- **Testing / CI / observability:** `vitest.config.ts` (`server-only`
  stubbed correctly, coverage scoped to `core/**`); CI runs
  typecheck+lint+format+test+build on `npm ci` + storage conformance on real
  Postgres/PocketBase/Firebase/Appwrite + personal-data + gitleaks
  full-history scans; Playwright smoke (401s, CSP, no console errors) + axe;
  `instrumentation.ts` fail-fast + `onRequestError` truncated webhook
  (fail-silent, request-id join, no vendor SDK to audit).

### 6.2 Risks (fix soon)

1. **Docker runner missing workerd copy promised by config.**
   `next.config.ts:68` says the Dockerfile copies `miniflare` +
   `@cloudflare/workerd-*` into the runner; `Dockerfile` (runner stage)
   copies only `standalone/static/public`. The Cloudflare adapter will
   `MODULE_NOT_FOUND` in Docker. Copy the two packages or stop claiming it.
2. **`convex` in contract but unregistered.** `contract.ts:29` lists
   `'convex'`; `registry.ts:26-37` has no factory, yet
   `inferAdapterId` (`registry.ts:57`) can infer `convex` from
   `CONVEX_DEPLOYMENT` then fail lookup. Remove from the union or add a stub
   adapter.
3. **CSP permissive by necessity** (`next.config.ts:19`
   `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`). Documented as
   baseline, but track the per-request nonce follow-up explicitly.
4. **Rate-limit identity spoofable** (`core/auth/ratelimit.ts:38-44`
   trusts `x-forwarded-for`/`x-real-ip`). Document the trusted-proxy
   requirement in the deploy guide.
5. **Demo sandbox `id: 'local'`** (`adapters/demo.ts:363`) conflates
   demo with filesystem in logs/telemetry; each entry holds 2 full
   `CMSState` clones with an unmeasured memory ceiling at 500 entries. Give
   it `id: 'demo'` + a contract union entry.
6. **Publish uses `revalidatePath` only**, no `revalidateTag`
   (`app/(site)/layout.tsx:13` anticipates this). Fine today; needed before
   per-page `fetch` caching.

### 6.3 Tech debt (scheduled, not urgent)

- **Dual router / legacy `src/` tree:** entire admin is `BrowserRouter` +
  `ssr:false` + 25× `lazy()` (`admin-app.tsx`); public themed sections are
  all `'use client'` + `useCMS()` (`src/views/*.tsx`) with only the
  `core/blocks` path as true RSC. Exit is the App Router admin rewrite
  (which also delivers the missing 5th auth mechanism:
  `app/admin/(protected)/layout.tsx` guard-by-existence, `PLAN.md` line 250).
  `react-router-dom@7.18.2` dies with that rewrite — no new imports.
- **Styling triple-source:** Tailwind 3 + CSS-var tokens + Astryx/StyleX (no
  direct `stylex.*()` in app code — inside Astryx packages only). The
  Tailwind 4 pin (`.github/dependabot.yml`) is correct; v4 drops
  `tailwind.config.js` and silently voids every `bg-bg`/`text-text-primary`.
- **Perf:** zero `next/image`, zero `next/font`; Google Fonts `<link>` is
  render-blocking; images are raw `<img>` with no sizing/lazy/`remotePatterns`.
- **Deps:** `framer-motion@13` (17 files) → `motion/react` during admin
  rebuild; `lucide-react@1.30.0` — verify changelog (icon renames break
  silently); `eslint@9.39.5`/`typescript@5.5.4` pins intentional, do not bump
  blindly; watch `miniflare` major churn (breaks `serverExternalPackages`).
- **Minor:** `vitest` coverage only `core/**` (`src/cms`, `src/components`
  covered by Playwright only — raise once `themes/` lands);
  `docker-compose.yml` hardcodes `opb:opb` creds with no webhook/demo
  passthrough (flag before prod-template use); `site/` excluded from eslint
  (prevent drift into root build).

---

## 7. Tech stack — keep, change, evaluate

| Current                                                           | Verdict                                                                                                                                                                                      |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js 16 App Router + React 19 + TS strict                      | **Keep.** Idiomatic (`params:Promise`, `cache()`, `revalidate:60`, `force-dynamic` mutations).                                                                                               |
| Tailwind 3 pinned                                                 | **Keep until admin rewrite.** v4 needs a CSS-build assertion test first (missing utilities fail silently).                                                                                   |
| 8 storage adapters + env inference                                | **Keep.** Zero-config deploy works because of it. Add Convex only with a real account; do not fake it.                                                                                       |
| scrypt + opaque cookies + `@simplewebauthn/*` present             | **Keep.** Passkey ceremonies + OTP recovery are built per `PLAN.md`; `README.md` "no passkeys/OTP" is stale — update it.                                                                     |
| Nodemailer SMTP only                                              | **Keep core, extend via registry.** Vault + registry exist; only `smtp` registered (`core/integrations/definitions/smtp.ts`). Add Resend/Brevo + Turnstile + Plausible/Umami as definitions. |
| Vitest + Playwright + axe + conformance                           | **Keep.** Raise coverage to `src/cms` once `themes/` lands.                                                                                                                                  |
| `react-router-dom`, `framer-motion@13`, `react-icons` server drag | **Remove in admin rewrite.** No new imports.                                                                                                                                                 |

**Evaluate next (verify before adopting):** self-hosted `next/image` + `sharp`;
`next/font` self-host + `display=swap`; Turnstile (proves the integrations
registry); Plausible/Umami definitions on existing `analytics.ts` events;
optional Giscus (CSP fields ready); generic embed block (Cal.com/Calendly,
Stripe Payment Links) with per-integration CSP; Resend broadcast handoff
(keeps the "no sender" scope).

---

## 8. Missing features + QoL backlog (prioritized)

Scored vs Framer / Webflow / Carrd / Readymag / Contra / Behance norms.

### P0 — trust, spam, acquisition, core persona value

1. **Trust repair (S).** Fix stale counts + stale homepage Gaps band
   (uploads verified, 8 backends). Generate marketing numbers from code.
2. **Form spam beyond honeypot (S).** Honeypot + origin + rate-limit only
   (`app/api/contact/route.ts`). Ship Turnstile as the 2nd integration —
   proves the registry, unblocks public demo + contact + newsletter.
3. **Analytics as product (S–M).** Events instrumented (`pageview`, `Project
viewed`, `Contact submitted`) but provider is rebuild-time env vars and
   the Analytics page is a share-URL embed. Ship Plausible + Umami
   definitions; view counts are the retention hook for creatives.
4. **Case-study `story` blocks (M).** `projects` + `caseStudies` still
   separate; the planned `work` merge with `story: {blocks}` + 301s is not
   done. Case studies are records, not pages — yet the case study IS the
   designer portfolio.
5. **Writing SEO parity (S).** Per-post title/description/OG + `Article`
   schema + auto OG fallback (`opengraph-image.tsx` exists; share image is
   manual 1200×630 upload).
6. **Custom domains in-admin (docs + screen, M).** Supported but docs-only.
   Add per-host guides (Coolify/Railway/Render) + Caddy example to `Your site`.
7. **Branded loading/404 + feed + schema (S).** `loading.tsx`,
   `not-found.tsx`, RSS `<link rel="alternate">`, `Person`/`CreativeWork`
   JSON-LD, shorten `about` meta.

### P1 — unblock freelancer/photographer/writer without scope creep

8. **Generic embed block + Cal.com guide (S).** Commerce/bookings stay
   never-build; a CSP-scoped embed + guide unblocks the freelancer ICP.
9. **Social embed facade set (S).** Instagram/Behance/GitHub/Substack using
   the YouTube-facade privacy pattern; plus a link-in-bio page preset
   (Carrd's #1 use case).
10. **Expiring share links (M).** Signed `?key=` preview-token route reusing
    the OTP kv namespace — photographer client-proofing without full auth.
11. **Newsletter broadcast handoff (S).** Keep "no sender" scope; ship
    Resend/Brevo definition + broadcast guide. Current CSV exit is fine but
    undiscoverable.
12. **Comments as optional integration (S).** Giscus off by default
    (moderation is the obligation, not the feature).
13. **Page scheduling (S).** Reuse the writing `status+scheduledFor`
    predicate + dashboard surfacing.
14. **Testimonials import + `Review` schema (S).** Google/LinkedIn via
    file-upload flow.
15. **Media QoL (M).** Focal-point crop, responsive `srcset` review, bulk
    upload.

### P2+ — range, reach, later

- 3–4 high-leverage blocks (testimonial slider, marquee/logo ticker,
  link-in-bio) — do not chase canvas; token-only themes are the constraint
  and the feature.
- i18n: reserve locale slugs now (`[lang]`), ship dictionaries later; keep
  English-only through 1.0.
- Notifications (needs install + push; `manifest.ts start_url:/admin` is
  already correct) + offline badge + conflict diff UI.
- Import flows: Markdown/CSV + image bulk; Behance/Dribbble/LinkedIn via
  file upload.
- Multi-site / agency handoff / team roles — post-1.0, contradicts current
  scope.

---

## 9. Action plan — phased checklist

### Phase A — Trust + safety (days, solo-able) — DONE 2026-10-16

Implemented and verified: `typecheck` + `lint` (0 errors) + `format:check` +
863 tests green, production `build` green, and end-to-end in a real browser
(claim → dashboard → palette → pages → settings → appearance).

- [x] Point `AdminDashboard.tsx` hero CTA at `/pages`; deprecate `/homepage`
      (banner + route + docs). _CTA now "Pages" → `/pages`; unpublished card
      gained a Publish-now button. Verified visually._
- [x] Add confirm to page delete (`AdminSitePages.tsx:167-175`); enlarge
      reorder targets (`AdminRecord.tsx:79-98`) to 44px. _Dialog text +
      dismiss-preserve + measured 44×44 verified in browser._
- [x] Confirm + snapshot on theme switch (`AdminSettings.tsx:788-800`);
      opt-in on PDF→resume overwrite (`AdminMediaLibrary.tsx:32-38`). _Theme
      guard fires with override count, dismiss preserves; PDF asks per file._
- [x] Replace 6× `window.confirm` with Astryx `Dialog`; typed confirmation
      for Reset/Import. _Reset now a typed-`RESET` Dialog (gates + cancels
      verified)._ **Update: fully done** — new shared `ConfirmDialog`
      (`src/admin/components/ConfirmDialog.tsx`, danger/primary tones,
      optional typed gate) now fronts all 9 native confirms: page, project,
      case-study and media deletes, theme switch (with override count), PDF
      résumé choice, import (names the file), passkey remove, version restore,
      and the typed reset. Zero `window.confirm/alert/prompt` calls remain in
      `src/`. Theme dialog verified in-browser with screenshot.
- [x] Fix palette double-prefix + add `Cmd+K`/`Ctrl+K` listener
      (`AstryxCommandPalette.tsx:28-76`, `AdminLayout.tsx:112-118`). _Opened
      via shortcut, routes to `/admin/pages` — no double prefix. Verified._
- [x] Remove fake "Save section" (`AdminPagesEditor.tsx:66-72`); validate
      `Anchor ID` uniqueness. _Removed; format + duplicate warnings inline._
- [x] Update `README.md` auth section (passkeys/OTP exist) + marketing Gaps
      band (uploads verified, 8 backends) + unify block counts from registry.
      _README + 4 stale site claims fixed (24 blocks, 8 backends, verified
      uploads, 3-method sign-in)._
- [x] Remove `convex` from `AdapterId` union OR add stub; fix Dockerfile
      workerd copy OR drop the claim (`next.config.ts:68` vs `Dockerfile`
      runner stage). _Union trimmed + clear `AdapterConfigError`; workerd
      packages copied; new `docker-build` CI job proves it._
- [x] Document trusted-proxy requirement (rate-limit spoofing,
      `core/auth/ratelimit.ts:38-44`); track CSP-nonce follow-up explicitly.
      _In `site/content/docs/self-hosting.md`; nonce tracked in
      `next.config.ts` comment._
- [x] `middleware.ts` → `proxy.ts` + `next@^16.2.6`, Node `>=22` (engines +
      CI 20→22). _Build prints `ƒ Proxy (Middleware)`; server logs show
      `proxy.ts` per request. Drive-by: 2 pre-existing lint errors fixed._
- [x] Multi-arch note (`buildx --platform linux/amd64,linux/arm64`) +
      `/api/health` doc fix in self-hosting guide.

### Phase B — Public-site a11y/perf (1–2 weeks) — DONE 2026-10-17

Same gates as Phase A (typecheck, lint 0 errors, format, full suite,
production build) plus browser verification (screenshots, measured targets,
computed contrast, zero console errors throughout).

- [x] `Reveal.tsx` reduced-motion guard + `CustomCursor.tsx` (`aria-hidden` +
      reduced-motion unmount). _`useReducedMotion`: immediate show,
      zero-duration; doubles as the stuck-invisible guard. Verified in code;
      automation cannot emulate the OS preference._
- [x] Gallery/image div-clicks → keyboard-reachable controls
      (`AboutPage.tsx` gallery now labelled `<button>`s;
      `ProjectPreview.tsx` images got role/tabindex/Enter-Space + visible
      focus ring).
- [x] Lightbox/modals/menu: `role=dialog aria-modal` + focus trap +
      return-focus + `aria-expanded` on hamburger. _Both lightboxes trap Tab,
      focus close on open, restore opener on close; hamburger announces
      expanded, overlay is a dialog with Esc._
- [x] 44px floors: `WorkPage.tsx` pills to 44px + `role=status` empty state;
      side dots to 44px targets + `aria-current`; all `Button.tsx` branches
      share one focus ring. _Submit + global buttons stay 42px deliberately:
      AA-passing, and a site-wide height change is not a Phase B call._
- [x] Tokenize leaks: `HeroSection` fixed px → fluid `var(--text-*)`,
      `#08A669` → `var(--link-color)`, `bg-[#25D366]` → btn tokens,
      `red-400` errors → new danger tokens, `token-action` failed state
      likewise. _`--danger`/`--danger-subtle` derived like links (4.5:1
      enforced — dark measured 6.93:1), added to the audit as a 10th pair,
      all 109 theme tests green. Hero type is fluid, so `typeScale` applies._
- [x] Heading + link fixes: About education `h3`→`h2`; cards `Read more` →
      `aria-label` with title (new `ariaLabel` on the primitives Button);
      block `ContactForm` to `ContactPage` parity (`autoComplete=name`,
      error `describedby` via `useId`, danger-note `role=alert`). _(Per-field
      `aria-invalid` N/A — the block surfaces one submit-level error.)_
- [x] Add `app/(site)/loading.tsx` skeletons + branded `not-found.tsx`;
      RSS autodiscovery link; per-post + JSON-LD SEO. _Skeleton mirrors page
      rhythm (aria-hidden); 404 keeps site chrome (screenshotted);
      `alternates.types` RSS on the index; `Article` JSON-LD on entries.
      `Person` schema deferred to the OG-image phase._
- [x] Fonts fully self-hosted (`next/font`, 35-family static map, zero Google
      requests verified in the document head, GDPR liability closed, admin
      injector removed, CSP carve-out deleted); `CMSImage` lazy+async-decode
      with caller override (full `next/image` stays a follow-up — every call
      site needs real dimensions first); `Container` 1280px→token,
      `Section` padding→`--section-y`; `ExperienceRow`/`LiquidDualCTA` dead
      files deleted.
- [x] Newsletter label 11px→12px; `ThemeToggle` state+target labelling with
      `aria-pressed`.

### Phase C — Retention + acquisition (0.6-shaped)

- [x] Turnstile integration (2nd registry definition + server verify). **DONE
      2026-10-18:** `definitions/turnstile.ts` (schema, plain-English setup,
      dummy-token Test, degradation, `cspScript`+`cspFrame`), runtime
      `core/integrations/turnstile.ts` (env-wins config, fail-closed verify),
      public `/api/spam/sitekey` (allowlisted in the route-guard test),
      lazy `TurnstileWidget` in `core/blocks/forms.tsx`, wired into block
      Contact/Newsletter forms, `ContactPage`, and the footer
      `NewsletterSignup`; enforced in `/api/contact` + subscribe after the
      honeypot. Verified: 9 unit tests (schema, Test-button paths, gate
      matrix), 872 suite green, build green; live with Cloudflare always-pass
      test keys — widget screenshots, 403 on missing token, solved token →
      inbox delivery. Two real bugs caught by verification: `frame-src`
      blocked the widget iframe (fixed + recorded in the contract), and the
      widget needs an explicit 300×65 footprint (Cloudflare will not paint
      into a collapsed box).
- [x] Analytics definitions on existing instrumentation; view counts on
      dashboard. **DONE 2026-10-18 (collection + view counts):**
      `definitions/umami.ts` (self-host first) + `definitions/plausible.ts`
      (self-host edition), runtime `core/integrations/analytics.ts` (OPB_* env > vault > legacy NEXT_PUBLIC_*), server-embedded JSON config in
      `app/layout.tsx` (escaped, no extra request), client reads it with env
      fallback, Analytics page guide rewritten to Services (no more
      `.env.local` steps). View counts: optional `apiKey` secret on both
      definitions, cached `core/integrations/stats.ts` (Umami stats+metrics
      API, Plausible v2 query API, 5-min TTL, null-always-safe), owner-only
      `/api/admin/analytics/summary`, dashboard cards + busiest-pages list
      that appear only when data exists.
      Verified: 15 unit tests (schemas, Test paths, precedence, shaping,
      caching), suite green (888), build green; live — both auto-listed,
      Umami Test fails friendly on a dead host, save flows vault→layout JSON
      (proven in the RSC payload), view cards render against a stub Umami
      (25 visitors / 40 views / /work 12 / /about 4), then disconnected.
- [ ] Case-study `story` blocks + `work` merge + 301s.
- [ ] Writing SEO parity + auto OG fallback.
- [ ] **P0 discovered 2026-10-17: not-found renders with HTTP 200.** Every
      dead address (`/no-such-route`, `/share/<bad-token>`, `/work/<missing>`)
      renders the branded 404 body with status 200, in dev and in production
      (`next start`), including a minimal route whose only statement is
      `notFound()` — so it is not the share code, the catch-all, or the proxy
      (all read correct). Crawlers will treat dead pages as live until the
      status is fixed. Repro: `curl -o /dev/null -w '%{http_code}'` any dead
      path.
- [x] Generic embed block + booking guide. **DONE 2026-10-18:** `embed`
      block (#26) with `toSchedulingUrl` host-allowlist validation (Cal.com,
      Calendly — rebuilt URLs, evil-host tests) + click-to-load `EmbedFacade`
      island, CSP `frame-src` extended (contract comment updated), ratio
      choice, editor check. Verified: URL unit tests, render/check tests, axe
      matrix entry, suite green, build green; live CSP headers carry both
      hosts and the homepage ships zero third-party URLs (facade contract
      holds). Social facade set + link-in-bio preset stay next.
- [ ] Expiring share links (M); newsletter handoff via Listmonk (S).
- [x] Comments via Giscus, off by default. **DONE 2026-10-18:**
      `definitions/giscus.ts` (setup, public-repo Test, honest degradation),
      `comments` block with its own props + click-to-load facade (no GitHub
      contact until asked, same pattern as the video facade). Verified:
      definition tests, block render/check tests, auto-included in the axe
      matrix, suite green, build green. Browser unavailable this round (tool
      catalog changed mid-session); same render path as the verified
      Turnstile widget.
- [ ] Mobile admin pass: stacking preview (preserve scroll, per-page device
      memory), 44px TopNav strategy, `MediaPicker maxWidth:100vw`,
      skeletons + `aria-live`, offline badge, conflict diff UI, version
      diff preview.
- [ ] Import v1: Markdown/CSV + image bulk upload.

### Phase D — Strategic (post-1.0)

- [x] i18n slug reservation now, dictionaries later. **DONE 2026-10-17:**
      `RESERVED_LOCALE_PREFIXES` (40 ISO 639-1 codes, explicit — not a
      two-letter ban that would take `go`/`me`/`up`) in `core/pages/schema.ts`,
      refused by `checkSlug` with a future-language message, covered by new
      tests. English-only through 1.0 stands; dictionaries land with next-intl
      later.
- [x] Notifications (push via installed PWA). **DONE 2026-10-17:**
      dependency-free VAPID (Node `crypto` ES256, no library) + payload-less
      tickles (no payload encryption, nothing sensitive crosses the push
      service) in `core/notify/push.ts` (`push` kv namespace), three
      owner-only routes (`subscribe`, `public-key`, `test` — all passing the
      route-guard AST test), `public/sw.js` worker (unread-count fetch with
      the owner session, inbox deep-link), inbox toggle with late permission
      timing (appears after the first message, install-first copy for iOS
      16.4+/Chrome rules), 5-min burst cap, best-effort hook in
      `app/api/contact/route.ts` (fail-silent by design), setup guide in
      `docs/PUSH-NOTIFICATIONS.md`. Verified: 10 unit tests (store, JWT
      shape, cap), targeted suites green.
- [x] Agency / multi-site / roles evaluation. **DONE 2026-10-17:**
      `docs/AGENCY-EVALUATION.md` — decision post-1.0 with the three
      contradicting load-bearing choices named; per-client deploy + share
      links as the now-path; three reopen criteria.
- [x] App Router admin rewrite (SSR, `(protected)` guard-by-existence,
      kill `react-router-dom`, `motion/react` migration, Tailwind 4
      re-evaluation with CSS-build assertion test). **Prerequisites DONE
      2026-10-17, migration tracked; slice 1 landed 2026-10-18:**
      `(protected)` shell + guard-by-existence (307 to login, verified live),
      5 screens migrated at unchanged URLs (dashboard with publish action,
      messages, storage, history with restore action, your-site),
      `core/content/changes.ts` pure helpers with tests, route-guard AST test
      extended to `_actions`. Full 20-screen migration continues per
      `docs/ADMIN-REWRITE.md`.

---

## 10. Sources + verification notes

- Read directly: `docs/PLAN.md` (status + handoff), `README.md`,
  `package.json`, `app/` routes, `src/` views/components, `core/` theme /
  blocks / storage / auth, `middleware.ts`, `next.config.ts`, `Dockerfile`,
  `docker-compose.yml`, `app/manifest.ts`, `core/storage/registry.ts`,
  `site/` marketing + help + docs content.
- Four parallel codebase audits (public UX, admin UX, architecture,
  product strategy) with file-by-file findings — condensed above, not
  duplicated verbatim.
- Web `websearch` returned no results in this environment, so deep research
  was done via direct `webfetch` of authoritative docs instead (see §11).
- Per repo rules (`AGENTS.md`): no code changes made for this review; claims
  above cite files, not memory. Before claiming any fix works, run:
  `npm run typecheck && npm run lint && npm run format:check && npm run test
&& npm run build`, plus `curl` the route and grep the HTML for
  server-rendered claims.

---

## 11. Verified 2026 research (webfetch, Oct 2026)

`websearch` consistently returned "No search results" in this environment, so
the items below were verified by fetching authoritative docs directly. Each
entry gives the source URL + `lastUpdated` as returned, the load-bearing fact,
and what it changes in this backlog.

### 11.1 Next.js 16 — Cache Components is the new model

- Sources:
  - `https://nextjs.org/docs/app/getting-started/caching` (lastUpdated
    2026-10-06)
  - `https://nextjs.org/docs/app/getting-started/fetching-data`
    (lastUpdated 2026-09-01)
- Facts: new apps default to `cacheComponents: true` + `partialPrefetching:
true`. Data/UI caching is opt-in via `'use cache'` + `cacheLife()` /
  `cacheTag()`; uncached work streams behind `<Suspense>` with `loading.js`
  as the route-level boundary. `React.cache()` dedupes ORM calls shared
  between `generateMetadata` and the page. Runtime APIs (`cookies()`,
  `headers()`, `searchParams`, unlisted `params`) must sit behind `<Suspense>`
  or use `'use cache: private'`; random values need `connection()` +
  `<Suspense>` or `'use cache'`. Durable shared cache needs
  `'use cache: remote'` + cache handler — default is per-instance memory
  (ephemeral on serverless). Every deploy gets fresh cache keys (build id).
- Implication: the current `revalidate: 60` + `revalidatePath` approach (§6.2.6)
  is the _previous_ model and still supported, but the 0.6–1.0 perf pass
  should adopt `'use cache'` + `cacheTag('posts')` for writing/blog lists and
  `cacheLife('hours')` for snapshot reads, with `revalidateTag` on publish —
  exactly the `revalidateTag` follow-up already noted in
  `app/(site)/layout.tsx:13`. Do not enable `cacheComponents` blindly: audit
  every `cookies()`/`headers()` read first (preview/draft channel, demo
  cookie in `middleware.ts`), or routes will statically shell the wrong
  variant.

### 11.2 Next.js 16 — `next/image` v16 deltas

- Source: `https://nextjs.org/docs/app/api-reference/components/image`
  (lastUpdated 2026-09-28).
- Facts: `priority` deprecated in v16 in favour of `preload` (same LCP
  intent, clearer semantics). `qualities` allowlist now **required**, default
  `[75]` — unrestricted qualities are a cost/abuse vector. `remotePatterns`
  (protocol/hostname/pathname/search) replaces legacy `domains`.
  `formats: ['image/avif', 'image/webp']` with `Accept`-header negotiation;
  AVIF ~20% smaller but ~50% slower to encode (first-hit slower, cached hits
  faster; dual-format doubles cache storage). `minimumCacheTTL` default 4h;
  `maximumDiskCacheSize` added v16.1.7, `maximumResponseBody` (default 50 MB)
  added v16.1.2. `dangerouslyAllowSVG` stays off by default (CSP +
  `contentDispositionType: 'attachment'` when enabled).
- Implication: the `CMSImage.tsx` → `next/image` migration (§4.5) should set
  `qualities: [75]` (or explicit list), `remotePatterns` for Supabase/R2/
  Appwrite hosts, `sizes` on every `fill` image (missing `sizes` = assumed
  `100vw` = oversized downloads), `preload` (not `priority`) for the hero/LCP
  image only, and keep the repo's existing SVG-as-attachment stance — do not
  enable `dangerouslyAllowSVG`.

### 11.3 Next.js — `next/font` self-hosting

- Source: `https://nextjs.org/docs/app/api-reference/components/font`
  (lastUpdated 2026-09-24).
- Facts: `next/font/google` downloads CSS + files at build time and
  self-hosts — **zero browser requests to Google**, `display: 'swap'`
  default, automatic `adjustFontFallback` (anti-CLS), `variable` option for
  Tailwind (`--font-inter` → `@theme inline { --font-sans:
var(--font-inter) }`; v3 config shown too). One call = one hosted instance:
  share via a `fonts.ts` definitions file. Preload scope follows the file
  (page → route, layout → subtree, root layout → all).
- Implication: replaces the render-blocking Google `<link>` in
  `app/layout.tsx:85-91` (§4.1/§6.3). Privacy win for the self-host story
  ("no requests to Google") and removes the `style-src fonts.googleapis.com`
  CSP carve-out pressure. Keep the catalogue decoupled from `react-icons`
  per `PLAN.md` Phase 2 note.

### 11.4 Next.js — metadata + OG images

- Source:
  `https://nextjs.org/docs/app/getting-started/metadata-and-og-images`
  (lastUpdated 2026-08-25).
- Facts: `metadata` object (static) + `generateMetadata` (dynamic, memoize
  shared fetches with `React.cache`). Dynamic pages **stream metadata**
  separately without blocking UI — except for bots/crawlers expecting
  `<head>` metadata (`Twitterbot`, `Slackbot`, `Bingbot`, configurable via
  `htmlLimitedBots`). File conventions: `favicon.ico` / `icon.jpg` /
  `apple-icon.jpg`, `opengraph-image.jpg` (+ per-route override),
  `robots.txt`, `sitemap.xml`. Dynamic OG via `opengraph-image.tsx` +
  `ImageResponse` (`next/og`, satori/resvg, flexbox subset only, 1200×630).
- Implication: confirms the P0 SEO slice (§8): per-post
  `generateMetadata` + shared `getPost` cache, auto `opengraph-image.tsx`
  fallback from theme (1200×630 PNG), RSS `<link rel="alternate">`, and a
  `Person`/`Article` JSON-LD pass. No new infra needed — all file-convention
  work.

### 11.5 Tailwind v4 — pin is correct, migration cost is real

- Source: `https://tailwindcss.com/docs/upgrade-guide` (v4.3 docs tree).
- Facts: v4 targets **Safari 16.4+, Chrome 111+, Firefox 128+** (uses
  `@property`, `color-mix()`). `@tailwind base/components/utilities`
  directives removed → `@import "tailwindcss"`; PostCSS plugin moved to
  `@tailwindcss/postcss` (drop `postcss-import`/`autoprefixer`); JS config no
  longer auto-detected (needs `@config`); renamed scales (`shadow-sm`→
  `shadow-xs`, `shadow`→`shadow-sm`, same for blur/radius, `ring`→`ring-3`,
  `outline-none`→`outline-hidden`); default border/divide color becomes
  `currentColor`; `hover` only fires on hover-capable devices; variable
  shorthand becomes `bg-(--brand)`; upgrade tool `npx @tailwindcss/upgrade`.
- Implication: the `tailwindcss@3.4.10` pin + Dependabot hold (§6.3/§7) is
  the right call for a portfolio product (viewers on older Safari). If v4 is
  ever taken, budget the silent-failure risk already flagged: `tailwind.config.js`
  stops being read, so every `bg-bg`/`text-text-primary` compiles to nothing
  with no build error — the CSS-build assertion test (issue #9) must land
  **before** the bump, not after.

### 11.6 Cloudflare Turnstile — integration shape confirmed

- Source: `https://developers.cloudflare.com/turnstile/get-started/`
  (last updated 2026-05-05; full index at `…/turnstile/llms.txt`).
- Facts: two mandatory halves — browser widget (sitekey, implicit/explicit
  render) producing a ≤2048-char token, then server `Siteverify` API call
  (secret key, never client-side). Tokens expire after **300s**, single-use.
  Always-pass/always-fail test keys exist; restrict hostnames; separate
  widgets per env (dev/staging/prod); drop-in migration path from
  reCAPTCHA/hCaptcha.
- Implication: de-risks P0 item §8.2. The integrations registry + vault
  already exist with only `smtp` registered — Turnstile is one definition +
  server `fetch` to Siteverify + test-key support. `PLAN.md` already notes
  always-pass/always-fail keys cover local dev with no account.

### 11.7 Vercel Hobby — commercial rule + correction

- Source: `https://vercel.com/docs/limits/fair-use-guidelines`
  (last_updated 2026-09-14).
- Facts: Hobby = non-commercial personal use only; commercial = financial
  gain of **anyone** involved in **any part of production**, incl. advertising
  a sale, payment processing, paid creation/hosting, affiliate-primary sites,
  ads (AdSense etc.). **Correction:** "Asking for Donations **does not** fall
  under commercial usage" — the `README.md:60-88` quote checked 2026-08-12
  says the opposite ("Asking for Donations fall under commercial usage").
  Re-verify the live page and fix whichever is stale. Hobby典型 quotas:
  100 GB Fast Data Transfer, 1M function invocations, 10 GB origin transfer,
  4h Active CPU, 360 GB-hrs memory, 5K image-optimization transforms/month.
- Implication: strengthens §1/§2.3 — the primary CTA contradiction stands
  (freelancer advertising services ⇒ Pro or self-host), and the README's
  fair-use quote needs a re-check pass. Also note the 5K image-transform
  Hobby cap when costing the `next/image` migration on Vercel.

### 11.8 Responsiveness — INP budgets (replaces FID)

- Source: `https://web.dev/articles/inp` (updated 2025-09-02; stable Core
  Web Vital).
- Facts: good **≤200 ms**, needs-improvement **200–500 ms**, poor **>500 ms**
  (75th percentile, mobile + desktop segmented). Observes click/tap/keypress
  only (not scroll/hover/zoom); latency = input delay + event-handler
  processing + presentation delay to next frame; page INP ≈ worst interaction
  (one exclusion per 50 interactions). FID measured first-input delay only —
  INP supersedes it. Field (RUM/CrUX) is ground truth; lab proxy is TBT;
  measure in JS with the `web-vitals` `onINP()` helper.
- Implication: gives the admin-mobile + public-interaction work (§5.9/§9
  Phase C) a hard budget. The heaviest INP risks in this repo: full
  `iframe.src=` preview reload per keystroke settle (§5.8), `Reveal`
  `whileInView` across 40+ nodes (§4.5), and un-virtualized 50-essay lists
  (§4.2). Add `web-vitals` INP logging to the existing `analytics.ts` events
  when shipping Plausible/Umami (§8.3).

### 11.9 Passkeys — `@simplewebauthn/*` v14 requirements

- Source: `https://simplewebauthn.dev/docs/packages/server` (v14.0.x docs).
- Facts: requires **Node 22+** (repo engines: `>=20.9.0` — bump or pin
  accordingly). RP triple: `rpName` / `rpID` (bare domain, `localhost` OK
  dev) / `origin` (no trailing slash); multi-origin/RP-ID arrays supported.
  Registration: `generateRegistrationOptions` (`attestationType: 'none'`
  recommended, `excludeCredentials` for re-register guard,
  `authenticatorSelection: { residentKey: 'preferred', userVerification:
'preferred' }`, `preferredAuthenticatorType` hints override
  `authenticatorAttachment`) → `verifyRegistrationResponse`, then persist
  `id / publicKey(Uint8Array) / counter / transports / deviceType /
backedUp`. Authentication: `generateAuthenticationOptions`
  (`allowCredentials`) → `verifyAuthenticationResponse` → update counter
  (clone detection: stored counter > 0 then same/lower = compromised;
  Touch ID/macOS may always return 0). Known pitfalls: exclude `-8`
  (Ed25519) on Node < 18 / old Firefox; `CBOR_NATIVE_ACCELERATION_DISABLED=true`
  under `@vercel/ncc`; Mongo `Binary` → `new Uint8Array(buf)` before verify.
- Implication: the repo already ships `core/auth/passkey.ts` on v14 +
  `passkeys` storage surface + settings enrolment (§6.1) — verify the three
  version-sensitive points only: Node engine floor, Ed25519 exclusion, and
  `rpID` derivation (`OPB_SITE_URL` with host fallback per `PLAN.md`).
  `README.md:302` "no passkeys" is stale and must be updated (Phase A).

### 11.10 Analytics — Plausible integration shape

- Source: `https://plausible.io/docs/plausible-script` (updated Oct 2026).
- Facts: snippet in `<head>`; per-site snippet from Sites → Settings →
  Tracking; first-party proxy option (adblocker bypass); NPM
  `@plausible-analytics/tracker`; server-side Events API (no-JS path);
  goals/conversions + team roles; GA4 import.
- Implication: confirms §8.3 can be built without touching the existing
  `analytics.ts` event names (`pageview`, `Project viewed`, …) — wrap them
  in two `IntegrationDefinition`s (Plausible + Umami), keep the share-URL
  embed as fallback, and prefer the proxy/first-party path on self-host to
  preserve the privacy story.

### 11.11 Animation — `motion` is the `framer-motion` successor

- Source: `https://motion.dev/docs/react-quick-start` (Motion for React,
  prev. Framer Motion).
- Facts: `npm install motion`, `import { motion } from "motion/react"`.
  Hybrid engine: Web Animations API + ScrollTimeline (120 fps) with JS
  fallback for springs/interruptible keyframes/gestures. API:
  `initial/animate`, `whileHover/whileTap/whileInView`, `useScroll` +
  `MotionValue`, `layout`/`layoutId` FLIP, `<AnimatePresence exit>`, SVG +
  `pathLength`. CSS transitions remain the right call for simple
  self-contained effects.
- Implication: confirms the §6.3/§9 Phase D migration (`framer-motion@13`
  → `motion/react`, 17 files). No API shock: `motion.div`,
  `whileInView`, `AnimatePresence` carry over. Pair with the `Reveal.tsx`
  reduced-motion fix — `MotionConfig reducedMotion="user"` is the blessed
  path, not a hand-rolled media query.

### 11.12 Accessibility — WCAG 2.2 QuickRef as the audit baseline

- Source: `https://www.w3.org/WAI/WCAG22/quickref/`.
- Facts: filterable norm for every success criterion + sufficient/advisory
  techniques + failures (HTML/CSS/ARIA/client/server). The §4/§5 findings map
  to it directly: 1.1.1 non-text (alt-at-picker), 1.2.2 captions
  (lightbox video track), 1.3.1 info/relationships (skipped `h2`, div-button
  galleries), 1.4.3 contrast minimum (tokenized errors/links), 2.1.1
  keyboard (lightbox/menu traps), 2.4.7 focus visible (link-branch rings),
  2.5.8 target size minimum (44px floors), 3.3.x input assistance
  (`aria-invalid/describedby`), 4.1.2 name/role/value (dialog semantics).
- Implication: adopt the QuickRef filtered to Level AA + HTML/CSS/ARIA as
  the acceptance bar for the Phase B a11y pass, alongside the existing
  `e2e/axe.spec.ts` + kitchen-sink matrix. No new tooling required.

### 11.13 Browser-verified addendum (Oct 2026, via OpenCode browser)

`websearch` stayed empty even for `React`, so the remaining options were read
live in browser tabs with `document.body.innerText` extraction. Some marketing
pages (framer.com, carrd.co pricing) failed with `ERR_TUNNEL_CONNECTION_FAILED`
through the connected server and are marked blocked — no claim below depends
on them.

- **Resend does both transactional + Broadcasts** (`https://resend.com/docs/introduction`,
  tab title "Introduction - Resend"). Verified text: "Your own domain,
  verified with Resend" + "A Resend API key", then "Transactional emails:
  personalized, event-driven" and "Marketing campaigns: bulk email Broadcasts
  distributed to a contact list", with Node.js/Next.js quickstarts. Implication:
  the P1 "Resend/Brevo handoff" (§8.11) can be _one_ provider covering both the
  existing SMTP/OTP/notify jobs and the newsletter-broadcast exit — a single
  `IntegrationDefinition` + domain-verification guide instead of two vendors.
- **Umami v3 is self-hostable open-source product analytics**
  (`https://docs.umami.is/docs`, "Introduction – umami"). Verified: traffic +
  campaigns + behavior (custom events, journeys, session replays, heatmaps) +
  goals/funnels/retention/revenue/attribution + boards/teams + share-URL +
  API + official MCP server; "without cookies, cross-site tracking, or the
  automatic collection of personal data"; Cloud or self-host. Implication:
  strengthens §8.3 — Umami (self-host, keeps the privacy story) + Plausible
  (managed option) cover both halves of the ICP; the existing share-URL embed
  maps to Umami's "Enable Share URL" doc page verbatim, and the MCP server is
  a future "ask your analytics" hook.
- **Giscus = GitHub Discussions comments, no database**
  (`https://giscus.app/`). Verified: "No tracking, no ads, always free",
  "No database needed. All data is stored in GitHub Discussions", mapping by
  URL/pathname/title/og:title/term/discussion-number, Announcements-category
  recommendation, reactions/metadata/lazy-load options, theme list incl.
  preferred-color-scheme + transparent/no-border variants. Visitors comment via
  GitHub OAuth (or directly on the Discussion); moderation happens on GitHub.
  Implication: confirms §8.12 as-designed — optional, off by default, one
  embed + `comments` category wiring; moderation obligation stays with the
  owner on GitHub, which is exactly why it stays optional. Lazy-load +
  theme-props map to the repo's YouTube-facade privacy pattern.
- **Cal.com embed = 4 modes, no-leave booking**
  (`https://cal.com/embed`, "Embed a Scheduling Widget on Your Website").
  Verified: "inline embed, floating pop-up button, pop-up via element click,
  and email embed"; "Users can book directly without ever leaving your site";
  setup = event type → embed type → paste code; plus white-label Booker atoms
  (`cal.atoms({ clientSecret, appearance })`) for full UI control. Docs
  `/docs/embed*` 404'd in this session (use `/embed` + platform atoms docs).
  Implication: confirms §8.8 — the generic embed block needs exactly these
  four modes (inline + floating + click-triggered + link), with Cal.com as the
  worked example and Calendly/Stripe Payment Links as follow-ups behind the
  same per-integration CSP field.
- **Brevo = transactional + campaigns + automation on deliverability infra**
  (`https://www.brevo.com/products/marketing-platform/`). Verified:
  "Transactional messaging … via SMTP relay and API" alongside campaigns,
  automation, forms, templates, analytics/ROI, "99% email delivery rate",
  shared-IP reputation monitoring + dedicated IPs, 150+ integrations.
  Implication: Brevo is the alternative broadcast handoff if the owner wants
  automation/forms/LP in one vendor instead of Resend's API-first shape —
  offer both definitions, recommend Resend for developers, Brevo for
  non-technical owners.

### 11.14 Google-in-browser search (Oct 2026, via OpenCode browser)

`websearch` stayed empty even for `React`, so three Google queries were run
live in browser tabs instead. Results below are SERP summaries (AI Overview +
top results), not page visits — good enough to confirm direction, not to cite
as spec.

- Query `best portfolio website builders 2026 Framer Webflow Carrd features`.
  AI Overview + results (Wavespace 2026-08-23, Looops 2026-09-07, Kimi.ai
  2026-10-08, DNS Robot 2026-09-29): Framer = best for designers/motion
  (freeform Figma-like canvas, rich animations/scroll/3D, built-in CMS for
  case studies, fast hosting + SEO); Webflow = best for design control /
  large complex sites; Carrd = simplest one-page option (minimalism, speed);
  Format = client proofing for photographers; Cargo = editorial layouts;
  Squarespace = templates/ease, Wix = beginner-friendly. Implication: the §8
  gap table is aimed correctly — this repo competes on ownership/privacy,
  not canvas. The differentiators worth copying are CMS case studies (your
  `story` blocks P0), one-page speed (your snapshot + `revalidate` path),
  and photographer proofing (your expiring-links P1), not motion parity.
- Query `Next.js 16 Cache Components use cache best practices 2026`.
  AI Overview + nextjs.org (migration guide + caching, both 2026-10-06) +
  Next 16.4 blog (2026-10-06): model shifts from implicit page-level configs
  to explicit granular boundaries; old `dynamic`/`revalidate`/`fetchCache`
  segment configs and `unstable_cache` are replaced by the `use cache`
  directive; **by default everything is dynamic — opt into caching** at
  function/component/file level, as close to the fetch as possible, with an
  explicit lifetime (`cacheLife`). Implication: hardens §11.1 — enabling
  `cacheComponents` without the audit inverts current behavior (today
  `revalidate:60` caches by default; under Cache Components nothing caches
  until annotated). Migration order: annotate snapshot/blog reads first,
  remove old segment configs second, enable the flag last.
- Query `WebAuthn passkey UX best practices 2026 onboarding recovery`.
  Convergent advice (Mavani 2026-09-19, LoginRadius 2026-05-07, SitePoint
  2026-09-18, Chrome I/O 2026 recap, sph.sh 2026-08-31): always offer a
  backup recovery method; encourage **≥2 passkeys across devices at
  onboarding**; generate recovery codes during initial registration; a plain
  email-link recovery caps account security at mailbox security
  (flaviocopes.com 2026-10-06); four-tier recovery ladder for teams.
  Implication: the repo's locked decision (passkey first, OTP recovery,
  passphrase last resort) matches 2026 consensus — the missing piece per the
  admin audit is UX, not crypto: multi-device enrolment nudge in settings,
  recovery-code display at claim, and un-swallowing the `NotAllowedError`
  cancel path (`AdminLogin.tsx:78`).

### 11.15 More best-practice grounding (Google-in-browser, Oct 2026)

- Query `newsletter deliverability SPF DKIM DMARC double opt-in best
practices 2026`. Convergent (rebelteam.co 4-days-ago, MessageFlow,
  Mailsoftly 2026-09-25, Static Forms 2026-04-28, Zoho 2026-06-12):
  SPF = single TXT, keep DNS lookups <10; DKIM = 2048-bit RSA, From-header
  alignment; DMARC = `p=none` (monitor via `rua`) → `quarantine` →
  `reject`, with SPF-or-DKIM alignment mandatory — Gmail/Yahoo/Microsoft
  enforce for bulk senders; double opt-in = up to +10% inbox placement,
  kills fake/bot signups, required posture for GDPR; stable From domain;
  one-click unsubscribe for bulk; immediate welcome value on confirm.
  Implication: the repo already has the hard half (double opt-in + RFC 8058
  one-click unsubscribe + CSV exit). The P1 broadcast handoff must add a
  sender-domain checklist screen (SPF/DKIM/DMARC verify + alignment check +
  warm-up note) or the first broadcast lands in spam — this is a docs+screen
  task, not an SMTP task.
- Query `Umami vs Plausible vs Matomo self-hosted privacy analytics 2026`.
  Convergent (Themeisle 2026-09-08, OpenPanel 2026-04-28 testing 7 tools,
  draftedby.com 2026-04-19, r/selfhosted, Valebyte 2026-07-08, pug.sh
  2026-06-13): three-horse race — Umami = lightest thing that works (easiest
  setup, MIT, replays/journeys/custom reports per umami.is/compare);
  Plausible = speed at scale; Matomo = fullest GA replacement (heaviest).
  Reddit selfhosted consensus: "Umami easier to set up and collects more
  complete data". Implication: ship Umami first (self-host default, matches
  the Docker story + existing share-URL page), Plausible second (managed
  option). Matomo is overkill for portfolio view-counts — skip.
- Query `Cloudflare Turnstile vs reCAPTCHA hCaptcha privacy 2026 self-host`.
  Convergent (PkgPulse 2026-03-09, trycap.dev, rcaptcha.app 2026-07-24,
  DreamHost 2026-08-05, websyro.com 2026-03-22): Turnstile = invisible,
  privacy-first, free, zero-interaction; reCAPTCHA = maximum detection via
  Google network (privacy cost); hCaptcha = privacy-focused, no Cloudflare
  account needed (Turnstile requires one); implementation APIs nearly
  identical; self-host purists → PrivateCaptcha (2026-09-18); EU-managed →
  FriendlyCaptcha. Implication: Turnstile stays the P0 pick (free,
  invisible, test keys, matches the privacy story) with one caveat now
  explicit — it needs a Cloudflare account, so document hCaptcha as the
  fallback definition for account-averse self-hosters; same server-verify
  shape either way.

### 11.16 Best-for-everything verdicts (Google-in-browser, Oct 2026)

Nine more SERPs, same method. Each names the 2026 winner for this repo's
constraints (self-hostable, privacy-preserving, portfolio-scale) — not the
universal winner.

- **Storage backends.** SERP `Supabase vs Neon vs PocketBase vs Appwrite
pricing free tier 2026` (Draxlr 2026-10-08, DEV kubeden 2026-10-06, Jet
  Admin 2026-09-29, Layerbase 2026-07-31: "Neon's free tier degrades on
  volume, Supabase's degrades on time"). Best for this repo: keep the matrix,
  recommend by host — Vercel → Neon + Blob (instant resume after idle);
  one-account all-in-one → Supabase (2 free projects); VPS/RPi/Docker →
  `local` or PocketBase single binary (no account, no pause); Google-house →
  Firebase; already-on-Cloudflare → D1+R2. No change to the 8-adapter
  contract — only the recommendation order in `Choose a backend` docs.
- **Newsletter send.** SERP `Resend vs Brevo vs Buttondown newsletter pricing
indie 2026` (Courier 2026: "Resend wins on deliverability and DX", 4.8 vs
  4.5 G2; AISend checked 2026-10-09: Resend Pro $20/50k, $35/100k, Brevo
  Starter from ~$9; Dreamlit 2026-04-15: biggest free tier Brevo 300/day
  ~9k/mo; nuntly: Resend free 3k/mo). Best: Resend = broadcast definition
  for developers (typed API + React Email, §11.13 handoff); Brevo = fallback
  for biggest-free + send-based pricing (infrequent lists); Buttondown =
  writer-UX alternative when the owner wants a managed list UI instead of
  CSV-export. Keep "no sender in core" — all three are definitions, not
  dependencies.
- **Booking/scheduling.** SERP `Cal.com vs Calendly embed pricing 2026`
  (Cal.com 2026-09-21, Fabric 6-days-ago: Calendly raised Standard/Teams
  mid-2026, Koalendar/Contabo: Calendly free = 1 event type, paid ~$10–20/
  user/mo; omidsaffari verified Oct 2026: solo Calendly Standard $120/yr vs
  Cal Teams $144; vibegrowth 2026-03-09: Cal wins on price with free
  self-host $0). Best: Cal.com — open-source, self-hostable ($0 for
  developers), 4 embed modes already verified (§11.13), white-label Booker
  atoms; Calendly Standard only if the owner already lives there. Generic
  embed block stays vendor-neutral with Cal as the worked example.
- **Comments.** SERP `Giscus vs Disqus vs Commento blog comments 2026
privacy` (merginit 7-system compare, PrivacyTools vetted list, zeropress
  2026-02-24: "Disqus tracks user data to target ads", bootsignal
  2026-08-25: Giscus/utterances free via own GitHub repo). Best: Giscus
  stays the optional default (free, no DB, no ads/tracking, GitHub
  moderation — §11.13); Remark42/Cusdis/Isso as the self-hosted alternative
  for non-GitHub audiences; Disqus explicitly not recommended (tracking +
  ads + weight). No migration path Disqus→Giscus built-in (justinmklam
  2025-08) — note it in the integration doc.
- **Push/PWA.** SERP `web push notifications PWA iOS 2026 best practices`
  (xavierkain.fr 2026-03-02, webscraft 2026-03-12, codercops 2026-05-22: iOS
  16.4+ push only for Home-Screen-installed apps, manifest `standalone`;
  Apple Developer sending-web-push docs; MDN best practices). Best: repo is
  already shaped right (`manifest.ts` `start_url:/admin` + `standalone` +
  install copy citing the 2025 Chrome revocation + iOS 16.4 rule). Remaining
  work is VAPID + service worker + permission-timing (ask after first inbox
  message, not on install) + frequency capping — Phase D notifications slot,
  no new vendor.
- **Portfolio SEO schema.** SERP `JSON-LD schema portfolio Person
CreativeWork 2026 SEO` (geneo.app 2026-02-10: single source of truth, no
  overlapping graphs; josuesomarribas.com 2026-07-25: "for a portfolio,
  schema's payoff is mostly entity clarity … rather than SERP"; a-digital.net
  2026-02-28: same fields feed AI Overviews/LLMs; callthedesignguy.com
  2026-04-16: Adobe Portfolio has no JSON-LD injection — a gap to exploit).
  Best: `Person` (home) + `CreativeWork`/`Article` (work/writing) +
  `BreadcrumbList`, one emitter in `metadata.ts`, validated via
  Rich-Results + Schema validator. Entity clarity + LLM citation is the
  payoff, not rich-result CARDS — pitch it that way in docs.
- **i18n.** SERP `next-intl vs next-i18n App Router i18n best 2026` (r/nextjs
  1-week-ago: "Server Components are the deciding factor … next-intl was
  designed around the App Router, getTranslations() in RSC"; LingoJS/DEV
  2026-03-02/codercops 2026-06-06/PkgPulse 2026-03-09: next-intl is the 2026
  default for App Router with smaller client bundles; react-i18next for
  SPAs elsewhere). Best: next-intl when P2 lands; until then keep
  English-only + reserve `[lang]` slugs now so URLs don't break later (§8 P2
  unchanged).
- **Image delivery.** SERP `Cloudinary vs Imgix vs next image self-host
portfolio 2026` (Cloudinary 2026-08-17: ecosystem/AI vs Imgix speed/
  minimalism; withremote 2026-05-17: same split; apiscout 2026-04-13:
  Bunny.net 3–8x cheaper bandwidth/transforms, CDN-first; modpagespeed
  2026-02-07: CDNs $35–3500/mo, self-host flat, break-even ~100–170k
  req/mo). Best for portfolios: self-hosted `next/image` + `sharp` default
  (flat cost, privacy, §11.2 `qualities`/`remotePatterns` config); Bunny.net
  or Cloudflare Images when a CDN is actually needed; Cloudinary only for
  media-library/AI-editing teams. No DAM in core.
- **Email templates.** SERP `React Email vs MJML transactional email
templates 2026` (reactemailbuilder.com: "React Email = TypeScript/props/
  hooks, MJML = simpler declarative"; PkgPulse 2026-03-09 three-way with
  Maizzle; FAUN 2026: MJML 83/100 vs React Email 82/100; Sequenzy 2026-02-01:
  "MJML best general-purpose markup … React Email plus Resend the pick for
  typed JSX"). Best: React Email (this codebase is React + Resend is the
  send pick — typed components, previews, same repo); MJML as the fallback
  note for non-React contributors. Either compiles to email-safe HTML —
  the choice is authoring model, not output quality.

### 11.18 Full-2026-standards sweep (Google-in-browser, Oct 2026)

Second sweep to verify _every_ remaining foundation claim. Two findings are
new P0s the original review missed.

- **CRITICAL — `middleware.ts` renamed to `proxy.ts` in Next.js 16.** SERP
  `Next.js 16 middleware proxy rename 2026` (nextjs.org/messages/
  middleware-to-proxy + blog next-16 2025-10-21 + upgrading guide 2026-10-02;
  rakibulinux.com 2026-10-08; gramowski.dev 7-days-ago; r/nextjs 60+
  comments). The rename is clarity, not just cosmetics: file `middleware.ts`
  → `proxy.ts`, exported function renamed, `runtime: "edge"` removed (proxy
  always runs on edge), codemod available, exactly one `proxy.ts` + one
  export. Same SERP: NexGismo 2026-06-11 notes **13 CVEs patched May 2026 —
  update to 16.2.6 or 15.5.18 now**. Action: rename
  `middleware.ts` (§6.1 praised it — the praise stands, the filename doesn't),
  run the codemod path per the upgrade guide, and pin `next@^16.2.6`.
  Add to Phase A.
- **CRITICAL — Node 20 EOL 2026-04-30.** SERP `Node.js LTS 20 22 24 support
schedule 2026` (HeroDevs 2026-06-23, nodejs.org/about/eol, endoflife.date,
  DEV 2026-02-21: "Node 22 LTS recommended for most teams", EOL 2027-04-30;
  Node 24 LTS current). `package.json` engines `>=20.9.0` and any docs
  saying "Node 20.9+" now admit an EOL runtime; `@simplewebauthn/server`
  v14 requires Node 22+ anyway (§11.9); Dockerfile already builds on
  `node:24-alpine` (good). Action: bump engines to `>=22`, CI matrix to
  22 + 24, re-verify `serverExternalPackages`/workerd note against Node 24.
  Add to Phase A.
- **Password hashing — Argon2id is now the top pick.** SERP `OWASP password
storage argon2id scrypt bcrypt 2026` (OWASP Password Storage Cheat Sheet;
  Toolsana 2026-05-19: "biggest rewrite in years, moved Argon2id to the
  top"; khimananda.com 2026-08-14: "for new applications in 2026, Argon2id
  is the recommended choice"; bcrypt = solid fallback). The repo's scrypt
  (`core/auth/passphrase.ts`, "no native dep, reasoned") remains
  memory-hard and acceptable — but it is no longer the 2026 default.
  Action: keep scrypt with the documented rationale, add an Argon2id
  migration note (needs native binding — the exact dependency the repo
  avoided) to Phase D rather than a silent downgrade claim. NFKC +
  12-char floor + HIBP k-anonymity stay correct.
- **WCAG target size — review's numbers confirmed.** SERP `WCAG 2.2 target
size minimum 24px 2.5.8 2026` (W3C Understanding SC 2.5.8, DEESU
  2026-09-26, Supercharge Mar 2026): Level AA minimum is **24×24 CSS px**
  (or equivalent spacing — the inline-link exception the `ProjectPreview`
  comment cites); 44×44 is the AAA/enhanced comfort target (2.5.5), which is
  what `layout-tokens.ts` floors at. So every §4/§5 "38px pills / 1px dots /
  14px chevrons fail" stands as written, and the repo's own 44px floor is
  stricter than AA — keep it, cite 2.5.8 (AA floor) + 2.5.5 (comfort) when
  challenged.
- **Bulk-sender rules — repo already compliant, one monitor missing.** SERP
  `Gmail Yahoo bulk sender requirements 2026` (Google sender guidelines;
  inboxguard.io, minotaurus.com 7-days-ago, aiemaily 2026-08-03,
  bulkemailchecker 2026-08-05): >5,000/day to Gmail/Yahoo ⇒ SPF + DKIM +
  aligned DMARC + one-click unsubscribe + spam rate **<0.30%** + TLS.
  The repo ships DOI + RFC 8058 one-click + CSV exit — compliant by
  construction at portfolio volume. Missing: a spam-complaint-rate note in
  the broadcast-handoff doc (§11.15) and keeping the sender-volume
  expectation ("portfolios never approach 5k/day") explicit so owners don't
  over-engineer.
- **React 19 — 'use client' at leaves only.** SERP `React 19 Server
Components best practices 2026 use client` (DEV 2026-04-07: "Push
  Interactivity Down … Only add 'use client' to leaf components";
  react.dev RSC reference; edersonfernandes.com.br 2026-10-06). Confirms the
  §6.3 debt call: `src/views/*.tsx` bulk `'use client'` + `useCMS()` context
  is the exact anti-pattern — the App Router admin rewrite (§9 Phase D)
  should move each view to an RSC trunk with client leaves (forms, video
  facade, lightbox) instead of porting the boundary file-by-file.

### 11.17 Ops verdicts — self-host, backup, headers, observability, CI

Same Google-in-browser method, Oct 2026. These close the production-practice
gaps in §6 (Dockerfile workerd copy, CSP baseline, rate-limit proxy trust,
compose creds, coverage scope).

- **Next.js self-host.** SERP `Next.js standalone Docker self-host best
practices 2026` (nextjs.org deploying 2026-08-06: standalone examples;
  SitePoint 5-days-ago: standalone + Nginx reverse proxy + health checks +
  shared cache; r/nextjs 70+ comments: Coolify as the no-bill path;
  MakerKit 2026-01-21: "Vercel to start, Railway or self-hosted VPS once the
  bill matters"; eastondev 2025-12-20, achromatic 2026-05-20: runtime secrets
  - Drizzle/Prisma migrations in the image). Best: repo already does the
    load-bearing parts (`output: standalone`, non-root user, `/api/health`
    HEALTHCHECK, `NEXT_TELEMETRY_DISABLED=1`). Still missing per the guides:
    Nginx/Caddy reverse-proxy example (TLS + compression + static caching for
    `/_next/static`), Coolify/Railway one-click path next to the Vercel
    button, and the workerd-copy fix (§6.2.1) — the guides assume
    `serverExternalPackages` + runner copy travel together.
- **Postgres backup.** SERP `Postgres backup restore best practices
self-hosted 2026 pg_dump` (Out Plane 2026-07-18: pg_dump/pg_restore/PITR;
  Sliplane 2025-09-10: 5 ways incl. managed PITR vs pg_dump vs SSH tunnels;
  DanubeData 2026-07-22: pg_dump vs pgBackRest + WAL archiving + S3 +
  retention + restore testing; DEV 2025-11-30: recovery objectives + 3-2-1
  rule + automation; r/PostgreSQL top answer: "pgBackRest, it's not even
  close"). Best for portfolios: nightly `pg_dump --format=directory -j`
  (parallel, selective restore via pg_restore) → S3-compatible offsite +
  weekly restore-test into a scratch container, documented next to the
  existing JSON export (which covers content, not sessions/OTP/passkeys).
  pgBackRest + WAL/PITR only when RPO < 24h is actually required — overkill
  for portfolio scale, name it as the upgrade path.
- **CSP + headers.** SERP `OWASP secure headers CSP nonce Next.js 2026 best
practices` (OWASP Secure Headers Project + CSP Cheat Sheet: nonce- or
  hash-based strict CSP; nextjs.org content-security-policy 2026-03-20: nonce
  requires dynamic rendering, applied during SSR; Hexabase 2026-10-03 +
  LogRocket 2026-05-04: per-request nonce allowlists Next's injected
  hydration/style scripts; Authgear 2026-03-25: API-route + Server-Action +
  middleware hardening). Best: keep the current baseline (§6.1) as-is, land
  the per-request nonce as the tracked follow-up with the theme-script +
  flight-script allowlist as the acceptance test, and add the two headers
  the repo lacks justifications for: `Cross-Origin-Resource-Policy` posture
  for `/api/media` and a documented trusted-proxy (`X-Forwarded-For`) stance
  shared with the rate-limit fix (§6.2.4). Validate with securityheaders.com
  - Mozilla Observatory on the deployed URL per `PLAN.md` cloud pass.
- **Observability.** SERP `self-hosted uptime monitoring Uptime Kuma vs
Better Stack 2026` (Better Stack 2026-06-08: Kuma = self-hosted
  single-purpose monitor vs Better Stack = managed unified observability;
  farasat.me 2026-08-28 honest 3-way with Grafana/Prometheus; uptimepage.dev
  2026-06-20: Kuma safer pick without API/multi-tenant needs; OnlineOrNot
  2026-09-15: Better Stack when uptime shares workflow with on-call).
  Best: Uptime Kuma (self-host, unlimited monitors, matches the Docker story)
  for uptime + the existing `onRequestError` webhook (§6.1) for app errors +
  `x-request-id` join already in `middleware.ts`; Better Stack only when
  on-call/incident workflow is needed. No vendor SDK — the repo's no-SDK
  stance is the 2026-self-host consensus, not a gap.
- **CI caching.** SERP `GitHub Actions Next.js Docker CI caching best
practices 2026` (khimananda.com 2026-08-21: cache `node_modules` +
  `.next/cache`, hash `package-lock.json`; nextjs.org ci-build-caching:
  Vercel/Turborepo automatic; bigmike.help 2026-09-22: GHCR + zero-downtime;
  jeeviacademy 2026-02-28: multi-stage builds + layer caching + shift-left
  container security; GitHub Marketplace `NextJS Cache` action). Best: keep
  `npm ci` (never `npm install` — the `AGENTS.md` incident), add
  `actions/cache` for `.next/cache` keyed on lockfile + multi-stage layer
  caching for the Docker build, keep conformance (real Postgres) as the
  slow-required job and smoke/axe as the fast-required jobs. No change to
  job semantics — purely minutes-per-run.

### 11.19 Free-only policy (binding) — what the paid mentions become

Per the project constraint (§0), no paid tool is promoted for users or
development. Where §§11.13–11.18 cite paid plans for context, the standing
recommendation is the free substitution:

- **Analytics:** Umami self-hosted (MIT) first; Plausible only via its
  open-source self-hostable edition, never Cloud; Matomo self-hosted (GPL)
  if a full GA replacement is needed. No managed-analytics spend.
- **Newsletter send:** existing SMTP + self-hosted **Listmonk** (open-source,
  AGPL) as the broadcast definition instead of Resend/Brevo paid tiers;
  Resend/Brevo free tiers documented as bring-your-own-key fallbacks only,
  never required. Buttondown/Mailchimp stay out (paid-first list UIs — the
  CSV-export exit already covers them at zero cost).
- **Booking:** Cal.com self-hosted (open-source) as the only worked example;
  Calendly stays out (paid tiers, closed source). Generic embed block keeps
  the same 4 modes with no vendor lock.
- **Images:** self-hosted `next/image` + `sharp` default; no Cloudinary /
  Imgix / Bunny / Cloudflare Images recommendation — those stay out of docs
  and code paths. External DAM stays a user-supplied URL field, not an
  integration.
- **Observability:** Uptime Kuma self-hosted only; Better Stack stays out
  (managed/incident platform). Existing `onRequestError` webhook +
  `x-request-id` remain the app-error path with any free receiver.
- **Hosting:** Docker + Coolify self-host first; Vercel/Netlify free tiers
  documented as-is with the Hobby non-commercial warning (§11.7), Pro/paid
  tiers never recommended — commercial users go self-host, not paid-Vercel.
- **Captcha:** Turnstile free tier + hCaptcha free tier only (both have
  working free paths); FriendlyCaptcha/PrivateCaptcha paid/managed options
  stay out. Same server-verify shape either way.
- **Email templates:** React Email (MIT) only; no paid template marketplace.
- **CI:** GitHub Actions free-for-OSS + GHCR only; Depot/paid runners stay
  out.

### 11.20 Free-and-open-source verification (Google-in-browser, Oct 2026)

Verifies every §11.19 substitution is the 2026 best free/open-source pick —
not a consolation prize.

- **Newsletter: Listmonk confirmed.** SERP `Listmonk vs Mautic self-hosted
newsletter open source 2026` (Sequenzy 2026-09-28: "Choose Listmonk for
  simple newsletter sending with minimal overhead … Mautic for full
  marketing automation"; sendbroadcast.net: Listmonk = single binary +
  Postgres, no welcome-series needed; Xgenious 2026-08-09: "most popular
  open-source self-hosted email marketing software for newsletters … fast,
  handles large lists"; osalfinder: Mailchimp $13–350+/mo vs Listmonk free
  software, server costs only). Best: Listmonk (Go single binary + Postgres
  the repo already runs + API + segments + templates) as the broadcast
  definition; Mautic only if lifecycle automation is ever needed (it isn't
  for portfolios); Keila/Mailtrain/SendPortal noted as simpler alternates.
  §11.19 stands, now with sources.
- **Analytics: Umami first, GoatCounter lightest.** SERP `GoatCounter vs
Umami lightweight analytics open source 2026` (OpenPanel 2026-04-28 tested
  7 tools incl. Plausible/Matomo/Umami/GoatCounter; BirJob 2026: GoatCounter
  = "simplest of all, single-binary Go … pageviews and nothing else";
  analytics-alternatives: GoatCounter lightest/cheapest entry, Umami +
  Plausible richer with funnels/conversions; row.so 2026-08-03: Umami
  fastest-growing for modern UI + minimal setup). Best: Umami self-hosted
  default (view-counts + events + share-URL + API, §11.13); GoatCounter
  single-binary as the ultra-light alternate for owners who want pageviews
  only. Plausible-self-host stays a fallback; Matomo stays out (heaviest).
- **Self-host PaaS: Coolify safest.** SERP `Coolify vs Dokploy self-host open
source 2026` (deploynix.io 2026-06-21: "Coolify safest all-purpose pick,
  Dokploy best lean Swarm-native"; lizard.build 2026-08-27: Coolify Apache
  2.0, Dokploy source-available — license distinction matters for the
  free-software constraint; Contabo 2026-02-14, Out Plane 2026-07-18, WZ-IT
  2026-08-23 concurring comparisons; r/selfhosted threads). Best: Coolify
  (Apache 2.0, breadth + bigger community) as the documented VPS path next
  to plain `docker compose`; Dokploy noted as lean alternate with the
  source-available caveat stated, not recommended first.
- **Comments: Giscus default, Remark42 self-host king.** SERP `Remark42 vs
Cusdis vs Giscus self-hosted comments license 2026` (merginit 7-system
  compare; PrivacyTools: Remark42 = self-hosted, no trackers/ads/third-party
  scripts; bootsignal 2026-08-25: "If readers have GitHub accounts, Giscus is
  free and hard to beat. If you enjoy running a server, Remark42 and
  Comentario will serve"; joey.team: Remark42 "most fully featured
  self-hosted … free via Docker"; koshinstudio 2026-10-08: giscus + Remark42
  actively updated 2026, utterances/Commento suspected stopped). Best:
  Giscus optional-default (zero server cost) + Remark42 self-hosted alternate
  (anonymous + social login, 0andwild 2025-10-17) for non-GitHub audiences;
  Cusdis/Comentario noted; Disqus out.
- **Captcha free tiers confirmed.** SERP `hCaptcha free tier limits vs
Turnstile free 2026` (splitforms 2026-07-12: "Turnstile free with
  unlimited challenges, hCaptcha Basic free"; splitforms 6-days-ago: hCaptcha
  Basic $0 up to 10k req/mo; websyro 2026-03-22: hCaptcha free 1M/mo in
  older tiering — flag the variance, verify at integration time; bigmike.help
  2026-09-22: Turnstile free + Enterprise, free officially suitable beyond
  tests/personal). Best: Turnstile free-unlimited first (§11.13 shape),
  hCaptcha Basic free as the documented fallback — both $0 at portfolio
  volume, same server-verify pattern. reCAPTCHA stays out (Google network
  - 10k/mo cap).

### 11.22 License audit — is everything we use free and open-source?

Verified from `package-lock.json` (evidence, not memory), Oct 2026:

| What                                                                                                                                                                                                                                        | License (lockfile)           | Verdict                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| Project itself                                                                                                                                                                                                                              | MIT (`packages[""].license`) | Free + OSI-approved                                                                      |
| `@astryxdesign/core`, `/theme-neutral`, `/cli`                                                                                                                                                                                              | MIT                          | Free + OSI-approved                                                                      |
| `next@16.3.0`, `react`, `react-dom`, `zod`, `clsx`, `tailwind-merge`, `motion`, `react-icons`, `react-router-dom`, `server-only`, `nodemailer`, `postgres`, `tailwindcss`, `typescript`, `eslint`, `prettier`, `vitest`, `postcss`, `jsdom` | MIT / ISC                    | Free + OSI-approved (`framer-motion@13` removed 2026-10-17, replaced by `motion@14` MIT) |
| `@vercel/blob@2.7.0`, `firebase-admin@14.5.0`, `@cloudflare/workerd-*`, `firebase-tools`, `@electric-sql/pglite`                                                                                                                            | Apache-2.0                   | Free + OSI-approved **SDKs** — but the _services_ behind two of them are commercial      |
| `@axe-core/playwright`, `axe-core`                                                                                                                                                                                                          | MPL-2.0                      | Free + OSI-approved (copyleft, file-level — fine for testing dep)                        |
| `lru-cache` (transitive)                                                                                                                                                                                                                    | BlueOak-1.0.0                | Free + OSI-approved                                                                      |

**Services (not code — policy applies):** `@vercel/blob` and `firebase-admin`
are optional storage adapters only; Supabase/Neon/hosted-DB free tiers are
bring-your-own-key options; Vercel Hobby is documented with its
non-commercial warning (§11.7). The default path — `local` adapter + Docker +
Postgres/PocketBase self-host — needs no account and no payment. Google
Fonts is a free service but phones home, hence the `next/font` self-host
migration (§11.3). GitHub Actions + GHCR are free for OSS. Turnstile +
hCaptcha free tiers are $0 at portfolio volume.

**Conclusion: yes — zero paid-only npm dependencies.** Nothing needs
removing for license reasons. The work is (a) keep Blob/Firebase/hosted
adapters strictly optional (already true — env-inference, §6.1), (b) never
add a paid-SDK dependency (the `standard-license`-style "free but
proprietary" trap §11.21 calls out for GSAP applies to any future SDK —
check `license` in the lockfile before merging), (c) CI guard: `npm run
check:personal-data` already exists — consider a lockfile-license allowlist
(MIT/ISC/Apache-2.0/MPL-2.0/BlueOak-1.0.0/BSD) that fails on unknown
licenses.

### 11.23 Free-tier lifetime verdicts — is free enough for a portfolio, forever?

Google-in-browser, Oct 2026. Question per option: (a) is the free tier
enough for one portfolio's scale, (b) can a hobbyist stay on it indefinitely.
**Verdict: keep all options — remove none.** Every caveat below is a docs
line, not a removal.

| Option                    | Free tier (2026 sources)                                                                                                                                                                                                                               | Enough for a portfolio?                                | Lifetime?                                                                                  | Caveat → docs line                                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase                  | 500MB DB, 1GB files, 5GB egress/mo, 50K MAU, 2 projects (mykavo 2026-10-07, Jet Admin 2026-09-30)                                                                                                                                                      | Yes — content is KBs, images fit in 1GB compressed     | Yes, within limits; paused projects keep data, restorable up to ~1yr (getvoroa 2026-10-07) | **7-day inactivity pause** (supabase.com docs; nayankyada 2026-09-12): first visit after idle cold-starts 10–30s. Fix: free cron ping (GitHub Actions/UptimeRobot) every few days — document the snippet |
| Neon                      | $0, 100 projects, 10 branches, 100 CU-hours/project/mo, 0.5–1GB storage/project (neon.com pricing/FAQ/docs; DEV 2026-10-06: 1GB since Oct 2), scale-to-zero after 5 min idle                                                                           | Yes — 100 CU-h dwarfs portfolio queries                | Yes, no time limit (neon.com FAQ: "fits a real, low-traffic app")                          | Sleep (not pause): wakes in seconds, not Supabase-minutes. Best Vercel-path DB free tier                                                                                                                 |
| Vercel Blob (Hobby)       | 1GB blob (Flexprice 2026-08-19), free within limits with warning emails (vercel.com Blob pricing Sep 2026); Hobby cannot buy extra usage (hard caps)                                                                                                   | Yes — hundreds of compressed portfolio images          | Yes, within caps                                                                           | Hard cap at 1GB: document image-compression guidance + local-disk fallback                                                                                                                               |
| Vercel Hobby hosting      | $0 free forever with hard caps (1M invocations, 100GB transfer, 5K image transforms — Flexprice/MakerKit 2026); **non-commercial only** (vercel.com plans + fair-use, Sep 14 2026)                                                                     | Yes technically                                        | Yes, if eligible                                                                           | **Eligibility, not quota, is the filter:** student/coursework/personal = fine lifetime; freelancer advertising services = likely commercial → Pro $20/seat or self-host. Keep the README branch (§11.7)  |
| Firebase Spark            | $0 hard caps: Firestore 50K reads + 20K writes/day, 1GiB storage (budgetforge 2026-07-07, DEV 2024-09-13); Hosting ~360MB/day transfer (SO); Auth ~3K DAU (billiem.uk 2026-09-04); Spark stops over-limit instead of charging (omidsaffari 2026-08-13) | Yes — 50K reads/day ≈ thousands of portfolio visits    | Yes, stays free within quotas                                                              | Daily (not monthly) quotas: a viral day pauses serving till reset — note it, portfolios rarely hit it                                                                                                    |
| Appwrite Cloud free       | 1 org, 2 projects, 75K MAU, 10GB storage (appwrite.io pricing; ZTABS/rapidevelopers 2026); max 2 functions/project since Jan 2026 (changelog); **free projects paused after 1 week idle** (appwrite.io pricing)                                        | Yes on quotas (this repo uses zero Appwrite functions) | Yes, within limits                                                                         | Same pause caveat as Supabase — or self-host Appwrite (open-source, no pause)                                                                                                                            |
| Cloudflare D1+R2          | R2 10GB-month/mo, zero egress fees, **no time limit / no expiry** (nubbo.app 2026-04-03); D1 free 500MB–5GB, daily row read/write caps enforced Sep 2026 (cloudflare docs/changelog); Workers 100K req/day (buildmvpfast 2026-07-04)                   | Yes — strongest free storage of the lot                | Yes — best lifetime terms here                                                             | Daily D1 row caps: portfolio reads are trivial, note the limit link in docs                                                                                                                              |
| PocketBase (self-host)    | No limits but your hardware — single binary, SQLite + auth + realtime + files (pocketbase.io FAQ/docs; r/pocketbase). Managed PocketBase Cloud free (50MB, 5K req/hr) is a separate commercial offer, not the adapter path                             | Yes — portfolios are its sweet spot                    | Yes — lifetime = your $5 VPS or existing server                                            | Document the 1-click VPS path (Hostinger/AyyazTech Jan 2026 pattern); Cloud free tier stays out of recommendations                                                                                       |
| Resend free               | 3K/mo, **max 100/day**, 3 domains (resend.com pricing + docs; coldletter 2026-07-01; WP Mail SMTP 2026-07-31: "the daily cap catches people out")                                                                                                      | Transactional yes (contact/OTP/reset ≈ tens/mo)        | Yes                                                                                        | Broadcasts >100 subs exceed the daily cap → Listmonk self-host or staggered Requeue. Keep for transactional, Listmonk for lists                                                                          |
| Brevo free                | 300 emails/day, up to 100K contacts, **no time limit**, no carryover (help.brevo.com; fastlancer.org 2026-09-04)                                                                                                                                       | Yes — a 500-sub weekly = 500/wk ≪ 2.1K/wk allowance    | Yes                                                                                        | Daily-reset (not monthly pool): fine for newsletters, tight for launch-day bursts — note it                                                                                                              |
| Turnstile / hCaptcha free | Turnstile free unlimited challenges (splitforms 2026-07-12, bigmike.help 2026-09-22); hCaptcha Basic free (~10K/mo current tiering — verify live, §11.20)                                                                                              | Yes — portfolio forms are tens/day                     | Yes                                                                                        | Both $0 at this scale; same server-verify shape                                                                                                                                                          |

### 11.21 Design system, icons, UI trends + 2026 legal/discovery deltas

Final sweep for the "every aspect" ask — design system, icon library, 2026 UI
standards/trends, editor, animation licensing, color science, and the two
2026 externalities (EAA enforcement, llms.txt). All picks obey the §11.19
free-only policy.

- **2026 portfolio UI trends (convergent).** SERP `UI design trends 2026
portfolios bento minimalism dark mode` (Midrocket 2026-03-12, Brucira
  2026-08-27, MediaPlus 2026, UX Pilot 2026-01-04, mCm London): bento grids,
  expressive minimalism (clean + whitespace + warmth/organic shapes),
  responsible glassmorphism, **dark mode as default**, micro-interactions,
  variable fonts, 3D touches, mobile-first, AI-copilot interfaces.
  Implication: the repo's trajectory (6 token themes incl. dark palettes,
  fluid type, 44px targets, `Reveal` motion) already rides the durable half;
  the gap is one bento-style arrangement block + a stats/logo-wall polish
  pass (§8 P2) — not a rebrand. Glassmorphism stays out of text surfaces
  (contrast gate would refuse it anyway); micro-interactions stay
  reduced-motion-gated (§9 Phase B).
- **Icon library — Lucide stands, react-icons goes.** SERP `best open source
icon library 2026 Lucide Heroicons Phosphor` (Hugeicons 2026-02-05,
  designindex Oct 2026, Moonb 2026-08-13, PkgPulse 2026-03-09: "Lucide most
  actively maintained Feather fork — consistent language, 1500+ icons,
  excellent tree-shaking"; Muzli 2026-02-11: "Start with Phosphor or Lucide
  … Tailwind project? Heroicons"). Best for this repo: **Lucide only**
  (ISC, tree-shaken, already a dep) + remove `react-icons` (bundle drag +
  server-import risk flagged in §6.3); Phosphor (weight variants) noted as
  the alternate if multi-weight icons are ever needed; Heroicons only if the
  admin is rebuilt on Tailwind-first components. Verify `lucide-react@1.30.0`
  renames in its changelog before any bump (silent breakage risk, §6.3).
- **Component base — Base UI is the 2026 default.** SERP `shadcn ui status
2026 Radix Base UI` (shadcn changelog 2026-01 + 2026-02 + 2026-07: "Base UI
  is the default component library … Radix still fully supported"; DEV
  12-hours-ago: "`npx shadcn init` started picking Base UI instead of Radix"
  2026-07-03; 21st.dev 2026-08-20: same lineage, choice is how much you own).
  Best: if/when the App Router admin rewrite (§9 Phase D) happens, scaffold
  on shadcn + **Base UI** default; the current Astryx kit stays until then
  (no mid-flight primitive swap). Either way the admin keeps the repo's
  token layer — headless primitives own behavior, tokens own looks.
- **Animation licensing — Motion, not GSAP, under free-only.** SERP `GSAP
free MIT Webflow 2026` (gsap.com/pricing + webflow.com 2026-06-16 +
  2025-04-30: "100% free … including former Club GreenSock plugins" after
  the 2024 acquisition — but under Webflow's Standard "No Charge" license,
  **not** MIT/open-source). Fails the §11.19 policy strictly. Best: **Motion
  (`motion/react`)** for the `framer-motion@13` migration (§11.11) — OSI
  open-source lineage, same API surface (`motion.div`, `whileInView`,
  `AnimatePresence`), plus the `MotionConfig reducedMotion="user"` path the
  Phase B fix needs. CSS transitions stay the default for simple effects.
- **Rich-text editor — Lexical on license purity.** SERP `Tiptap vs Lexical
open source editor 2026` (Eddyter 2026-06-26: "Tiptap 100+ extensions
  ($49–$999/mo). Lexical is Meta's free MIT framework"; tiptap.dev:
  "Editor open source (MIT), only platform/cloud priced"; editorstack.cc
  2026-09-17: both headless, Tiptap working editor in 11 lines). Best under
  free-only: **Lexical (MIT, no paid tiers)** for the no-code blog
  (Phase 9); Tiptap core (MIT) acceptable only with zero Pro extensions —
  and that constraint must be written down, or a future extension import
  quietly violates the policy. Either is ProseMirror-lineage; the deciding
  factor is license surface, not DX.
- **Color science — OKLCH confirmed, APCA tracked.** SERP `OKLCH color CSS
browser support 2026 APCA WCAG 3 contrast` (MDN 2026-08-27: `oklch()`
  channel reference; hexpickr 2026 + method21 2026-10-05: supported in all
  major modern browsers; oklch.xyz: dual WCAG 2.1 + APCA checker). Best: the
  repo's `culori` + OKLCH ramps + WCAG-luminance enforcement (§4.3) is
  exactly the 2026 consensus — keep enforcing WCAG 2.2 AA (it is the legal
  norm, next bullet), track APCA (WCAG 3 basis) as an advisory second score,
  never the gate.
- **Legal delta — EAA is enforced.** SERP `European Accessibility Act EAA
June 2025` (European Commission; wearebrew 2025-06-17, accessiBe
  2025-06-15, oneaccessibility: applicable **2025-06-28**, harmonized
  standard EN 301 549 incorporating **WCAG 2.1 AA** for web content).
  Best: the Phase B a11y pass (§9) is now a compliance story for any EU
  viewer/owner, not just quality — say so in `SECURITY.md`/docs, and keep
  the AA bar (not AAA) as the ship gate. This also upgrades the contrast
  gate (§4.3) from "nice" to "market access".
- **Discovery delta — llms.txt as cheap agent-readiness.** SERP `llms.txt
standard 2026 AI SEO` (seobeni 2026-07-24, seomelbourne 2026-05-06,
  maviklabs 2026-01-29, getpassionfruit 2026-05-20: "not a Google Search
  lever, but a legitimate agent-to-agent and agent-readiness signal").
  Best: add a static `llms.txt` (plus `llms-full.txt` pointer) generated
  from the same content as `sitemap.xml`/`robots.ts` — near-zero cost,
  no downside, feeds the AI-discovery channel alongside RSS/sitemap. New
  P1 doc-site task, not a product feature.

### 11.24 Final-topic sweep (Google-in-browser, Oct 2026)

Every remaining review-touched topic the file hadn't verified yet.

- **ORM — Drizzle stands.** SERP `Drizzle vs Prisma 2026` (MakerKit
  2026-01-24: "Drizzle for SQL control, smaller bundles, faster serverless
  cold starts"; Bryan Software: 8.3kb bundle, edge-first; nrtechstudio
  2026-08-31: no runtime overhead via `postgres.js` drivers; DEV 2026-02-18:
  "Prisma schema more concise; Drizzle schema more portable"). The repo's
  `_shared/sql` on Drizzle + `postgres.js` is the 2026 edge/serverless
  consensus — keep. Prisma only if nested writes or Mongo ever enter scope.
- **Fonts are a legal issue.** SERP `Google Fonts GDPR violation self-host
ruling 2026` (Munich court Jan 2022: remote `fonts.googleapis.com` leaks
  visitor IP → GDPR breach with damages; Usercentrics, Captain Compliance
  2026-07-20, sosei.site 2026-04-24, Packetra 2026-08-19 concurring;
  "ten-minute fix: self-host"). Upgrades the `next/font` migration (§11.3)
  from perf nicety to compliance task for any EU visitor — self-hosting
  removes the consent problem entirely.
- **Zod v4 current.** SERP `Zod 4 release 2026` (zod.dev: 4.6 Sep 2026;
  Pristren 2026-05-16: parser rewrite, 100x validation, `z.file()` /
  `z.templateLiteral()`, −57% bundle; DEV 2026-04-17: Valibot modular,
  smaller-bundle alternate). Repo on `zod@4.4.3` is current-major — stay,
  follow the v4 migration guide for breaking parsers. Valibot only if
  client-side validation bulk ever demands the diet (server-side today —
  no pressure).
- **Cookieless = banner-free, precisely.** SERP `cookieless analytics GDPR
consent banner not required 2026` (Muro 2026-07-12, GrainQL 2026-02-01,
  justanalytics 2026-06-30: strictly-necessary + cookieless analytics →
  generally no banner; GDPRWise 2026-09-15: analytical/marketing _cookies_
  always need consent; gdpranalytics.com 2026-07-22: "cookieless ≠
  consent-free" when Google infra rides along). The repo's posture (Umami /
  GoatCounter self-host, no GA, env-gated snippet) is exactly the
  banner-free shape — rule: no third-party script may ride with the
  analytics snippet, or the exemption evaporates. One line in the analytics
  guide.
- **Multi-arch Docker — one build flag.** SERP `Docker multi-arch ARM
Raspberry Pi Next.js image 2026` (Docker Docs multi-platform: one manifest
  list serves ARM64 Pi + x86-64; edgeservers 2026-05-26: ARM real in
  production; OneUptime 2026-02-17: standalone-output pattern;
  raspberry.tips 2026-08-11: Pi ARM64 Docker). The repo promises Pi support
  but plain `docker build` is single-arch. Action: publish with `docker
buildx build --platform linux/amd64,linux/arm64` and smoke-test the ARM64
  variant before claiming it — Phase A docs/CI line, not a code change.

### 11.26 Sessions, supply chain, dependency bot (Google-in-browser, Oct 2026)

- **Session practice — repo matches OWASP.** SERP `OWASP session management
cheat sheet 2026` (OWASP Session Management + Cookie Security Flags sheets;
  WorkOS 2025-02-19: idle + absolute timeouts per criticality; Facebook
  fb-answers: HttpOnly + Secure + SameSite, server-side sessions). The
  repo's `core/auth/session.ts` (opaque token, SHA-256 at rest, `__Host-`
  prefix, HttpOnly/Lax, 30d sliding + 90d absolute, epoch revocation,
  env-derived Secure) maps 1:1 to the sheet. Honest note: 30d sliding is
  generous vs typical sensitive-app guidance — acceptable for a single-owner
  self-hosted CMS, but write the rationale next to the constants so a
  future "harden everything" PR doesn't blindly shorten it into an
  owner-lockout annoyance. Rotation-on-privilege-change already exists
  (epoch bump on reset, §6.1).
- **Container signing — genuine gap, free fix.** SERP `cosign container
signing free open source 2026 SLSA` (Sigstore/Cosign keyless via GitHub
  Actions OIDC + Fulcio short-lived certs + Rekor transparency; kokil.com.np
  2026-08-29: "free; you pay only registry storage and CI minutes";
  qcecuring.com 2026-05-11 + safeguard.sh 2026-06-23 setup guides; GitHub
  cosign-container-signing topic). The repo ships a distributable Docker
  image with no signature — anyone pulling `open-portfolio` can't verify
  provenance. Landed as a `docker-build` CI job that proves the Dockerfile is
  valid (including the workerd copies) without publishing anything; keyless
  `cosign sign` on GHCR pushes attaches when image publishing is automated,
  with `cosign verify` noted in `docs/UPDATING.md` at that point. $0 either
  way.- **Dependency bot — Dependabot stays.** SERP `Renovate vs Dependabot 2026`
  (Konvu 2026-08-07: "Dependabot zero-config vs Renovate full control";
  Aikido 2026-09-14: Dependabot GitHub-native with `dependabot-core`
  open-sourced, Renovate fully OSS by Mend; devsecops.ae 2026-09-18:
  Dependabot included at no extra cost; codercops 2026-06-26: Dependabot for
  small predictable stacks). The repo's Dependabot + intentional pins
  (§6.3) is the right 2026 call for this shape; Renovate (self-hostable,
  better monorepo/noise control) noted as the fallback if PR noise or
  grouping needs ever outgrow Dependabot. No change.

### 11.25 Interaction + distribution details (Google-in-browser, Oct 2026)

- **Passkey autofill (conditional mediation) is the 2026 login UX.**
  SERP `passkey conditional mediation autofill login UX 2026` (Chrome I/O
  2026 recap developer.chrome.com/blog/io26-web-identity; useideem.com
  2026-05-14: "single biggest lever for passkey adoption"; web.dev
  passkey-form-autofill guide; nhimg.org 2026-07-10; optijara.ai 2026-10-04;
  Keycloak issue Mar 2026: auto-trigger as configurable policy). Best: add
  conditional mediation to the existing email field on `/admin/login` so the
  browser offers the passkey inline (1-click TouchID/FaceID) instead of a
  separate button — strictly additive to the current 3-path login, same
  `@simplewebauthn/browser` v14 `startAuthentication({ useBrowserAutofill })`
  shape. New Phase B admin-UX item; also fixes the "3 crowded CTAs" finding
  (§5.3) by making the passkey path ambient.
- **Fontsource for self-host fonts.** SERP `Fontsource self-host Google Fonts
npm 2026` (fontsource.org: "free, open-source and variable fonts … npm
  packages and CSS"; GitHub monorepo of self-hostable OFL packages;
  imadsaddik.com 2026-09-06; speedvitals.com 2026-10-07: self-host on Next.js
  - confirm zero Google requests). Best under free-only: `next/font` +
    Fontsource OFL packages (`@fontsource/inter` etc.) as the concrete font
    supply — no Google CDN, no manual file maintenance, license-clean (OFL).
    This is the supply side of the §11.24 GDPR finding.
- **Palette + reorder have canonical free libs.** SERP `cmdk command palette
dnd-kit reorder accessibility 2026` (PkgPulse 2026-03-09: "cmdk … powers
  ⌘K patterns … used in shadcn/ui's Command"; buildmvpfast 2026-07-02:
  global listener + `Command.Dialog` 20-minute recipe; dndkit.com:
  TypeScript, framework-agnostic core + first-class React, a11y-first;
  modern-cmdk: React 19 rewrite lineage). Best: **cmdk** (MIT) for the
  palette's missing `Cmd+K` listener + overlay (§5.9) and **dnd-kit** (MIT)
  for block/record reorder alongside the enlarged chevrons + keyboard
  alternative (§5.5) — both MIT, both the shadcn-ecosystem defaults, no new
  interaction paradigm to invent.
- **security.txt (RFC 9116) — free trust file.** SERP `security.txt RFC 9116
website 2026` (RFC 9116 Foudil 2022; securitytxt.org; EU data.europa.eu
  measure 2026-08-25 tracking adoption across French domains; free
  generators + validators; Wikipedia: accepted standard). Best: serve
  `/.well-known/security.txt` (Contact + Expires + Policy → SECURITY.md)
  from `app/` static — same cost class as `robots.txt`, signals the
  private-vulnerability-reporting posture already in `SECURITY.md`. New P1
  one-line task next to `llms.txt` (§11.21).
- **IndexNow — free instant indexing beyond Google.** SERP `IndexNow instant
indexing Bing 2026 Next.js` (freeCodeCamp: Next.js manual integration —
  host key, ping on publish; GrackerAI Node guide; trevorlasn.com
  2025-10-27: "notify Bing, DuckDuckGo, ChatGPT, and Perplexity the moment
  you publish. Free protocol, 5-minute setup"; crawlwp.com 2026-02-19:
  IndexNow for Bing/Yandex/Yep + sitemaps for Google). Best: ping IndexNow
  from the existing publish path (`app/api/admin/publish/route.ts`,
  next to `revalidatePath`) with the key as env — free, minutes of work,
  covers Bing/DuckDuckGo/AI-search discovery that sitemaps don't push to.
  New P1 publish-path item; Google still via sitemap + Search Console.

### 11.27 Formal UI standards 2026 (Google-in-browser, Oct 2026)

The three normative systems plus the two platform design languages that
define "industry-standard UI" in 2026 — and what each means for this repo.

- **Material 3 Expressive (open-source, Apache).** SERP `Material 3
Expressive design 2026` (m3.material.io + building-with-m3-expressive May
  2025 + I/O 2026 update; UX Design Award 2026: "most researched evolution …
  emotion and usability"; Philipp Lackner: spring-physics default curves,
  emphasized text styles, extended shape library; abinantony.io 2026-01-03).
  Takeaways to borrow (not the system itself): spring-based motion as the
  default curve (maps to the `motion/react` migration, §11.11 — springs are
  now the platform consensus, not a library quirk), emotionally legible
  color + shape contrast between interactive elements and content, adaptive
  components over fixed variants. Nothing to install — M3 is the validation
  that the repo's token + motion direction matches the industry.
- **Apple Liquid Glass (HIG, WWDC25 → iOS 26).** SERP `Apple Liquid Glass
design guidelines HIG 2026` (developer.apple.com technologyoverviews +
  HIG Materials + WWDC26 Icon Composer multi-layer format; theusefulapps
  2025-06-10; createwithswift 2025-10-30: "controls elevate and distinguish
  the content beneath"). Takeaways: hierarchy rule (glass strictly for
  chrome, never for reading surfaces) validates the repo's contrast gate
  refusing glassmorphic text (§11.21) — cite HIG alongside WCAG when
  designers ask for frosted cards; icon guidance (layered, legible at small
  sizes) applies to the PWA maskable icon already shipped (`manifest.ts`).
  No code dependency — Apple-CLI-free, HIG is documentation.
- **W3C Design Tokens stable spec v2025.10.** SERP `W3C design tokens DTCG`
  (DTCG Oct 28 2025 first stable: `$value`/`$type` + path references;
  codercops 2026-08-21 explainer; Digital Applied 2026-06-15: token adoption
  84%, Figma/Penpot/Sketch tooling; Style Dictionary interop). Takeaway:
  the repo's `core/theme/tokens.ts` + `layout-tokens.ts` predate the stable
  spec — add a DTCG-shaped JSON export (generated, not hand-maintained) so
  Figma/Tokens-Studio can consume the same source owners edit in Appearance.
  New P2 tooling task; zero runtime cost.
- **ARIA APG — the pattern reference for the Phase B fixes.** SERP `ARIA APG
patterns 2026` (w3.org/WAI/ARIA/apg/patterns, task-force minutes Jun 2026
  — actively maintained). The three Phase B dialog/menu fixes (§4.5) map to
  named APG patterns: modal dialog (lightboxes, palette), disclosure
  navigation (mobile menu), combobox/listbox (palette filtering). Cite the
  pattern per fix in PR descriptions — reviewers check behavior against APG,
  not against opinion.

---

_End of review. Start with Phase A — it is days of work, unblocks everything
below it, and contains the only items that can lose a user in their first
hour._
