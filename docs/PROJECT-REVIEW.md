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
11. [Verified 2026 research](#11-verified-2026-research-webfetch-oct-2026)
12. [Second pass — 2026-10-20 (Phase E)](#12-second-pass--2026-10-20)

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

_(Updated 2026-10-18: the App Router rewrite landed end to end and these files
are deleted — `docs/ADMIN-REWRITE.md`. The mapping is kept as the audit that
motivated the rework.)_

Admin mount: `app/admin/[...slug]/admin-mount.tsx` (`ssr:false`) →
`admin-app.tsx` (`BrowserRouter basename="/admin"`, all `React.lazy`) →
`src/admin/layouts/AdminLayout.tsx` (AppShell + TopNav + SideNav + Banner).
(Migrated screens under `app/admin/(protected)/` win over the catch-all; the
group was optional `[[...slug]]` until admin slice 1.)

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

- **Dual router / legacy `src/` tree:** the admin half is **resolved**
  (2026-10-18): the App Router rewrite migrated all twenty-nine screens by
  twelve slices, and the kill criteria deleted the `BrowserRouter` mount and
  `src/admin/**`; `react-router-dom` left the manifest. The rewrite also
  delivered the missing 5th auth mechanism —
  `app/admin/(protected)/layout.tsx` guard-by-existence (`PLAN.md` line 250).
  The public half still stands: themed sections are all `'use client'` +
  `useCMS()` (`src/views/*.tsx`) with only the `core/blocks` path as true RSC.
  See `docs/ADMIN-REWRITE.md`.
- **Styling, two sources:** Tailwind 3 + CSS-var tokens. It was three —
  Astryx/StyleX sat under the legacy admin — until 2026-10-18, when the last
  component on that kit was ported to plain Tailwind and `@astryxdesign/*`
  plus the orphaned `@stylexjs/stylex` left `package.json`. The Tailwind 4
  re-evaluation landed the same day: the port is complete and verified on the
  `tailwind4-attempt` branch, and the call was made on 2026-10-18 (recorded
  2026-10-25): **stay on Tailwind 3**. v4's floor is Safari 16.4+, Chrome 111+
  and Firefox 128+; a portfolio that stops opening on an older phone to gain
  build-tool ergonomics is the wrong trade for this product. The branch stays
  as the evidence, unmerged (#9, §7, §11.5).
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

| Current                                                           | Verdict                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js 16 App Router + React 19 + TS strict                      | **Keep.** Idiomatic (`params:Promise`, `cache()`, `revalidate:60`, `force-dynamic` mutations).                                                                                                                                                                                                                               |
| Tailwind 3 pinned                                                 | **Keep — decided 2026-10-18.** Re-evaluated 2026-10-18 (issue #9): the CSS-build guard and a verified port live on the `tailwind4-attempt` branch. The call went against adopting it — v4 requires Safari 16.4+/Chrome 111+/Firefox 128+, and this site has to open on older phones. The branch stays as evidence, unmerged. |
| 8 storage adapters + env inference                                | **Keep.** Zero-config deploy works because of it. Add Convex only with a real account; do not fake it.                                                                                                                                                                                                                       |
| scrypt + opaque cookies + `@simplewebauthn/*` present             | **Keep.** Passkey ceremonies + OTP recovery are built per `PLAN.md`; `README.md` "no passkeys/OTP" is stale — update it.                                                                                                                                                                                                     |
| Nodemailer SMTP only                                              | **Keep core, extend via registry.** Vault + registry exist; only `smtp` registered (`core/integrations/definitions/smtp.ts`). Add Resend/Brevo + Turnstile + Plausible/Umami as definitions.                                                                                                                                 |
| Vitest + Playwright + axe + conformance                           | **Keep.** Raise coverage to `src/cms` once `themes/` lands.                                                                                                                                                                                                                                                                  |
| `react-router-dom`, `framer-motion@13`, `react-icons` server drag | **First two done 2026-10-18:** `react-router-dom` left with the legacy admin (kill criteria); `framer-motion` became `motion` earlier. `react-icons` stays — and stays client-side (`core/blocks/standard.tsx:856`).                                                                                                         |

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
      `Person` schema deferred to the OG-image phase._ **The group-level
      skeleton was later moved below the existence gates — it was the cause
      of the 404-status P0 below.**
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
      (self-host edition), runtime `core/integrations/analytics.ts` (OPB*\* env > vault > legacy NEXT_PUBLIC*\*), server-embedded JSON config in
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
- [x] Case-study `story` blocks + `work` merge + 301s. **DONE 2026-10-18:**
      `ProjectItem` extended with optional `story: { blocks: unknown[] }`;
      `cleanProject` cleans story blocks using `cleanBlock` from `@/core/blocks/clean`
      with `MAX_BLOCKS` guard; `ProjectsBuilder` integrates `BlocksEditor`
      under 'Case-study story' with media support; `ProjectDetailPage` renders the universal
      `BlockList` when story blocks are present and falls back to standard
      overview/challenge/approach/screens/outcome when empty; `next.config.ts`
      seeds permanent 301 redirects from `/case-studies` -> `/work` and
      `/case-studies/:slug` -> `/work/:slug`; `core/content/read.ts` provides
      lossless backward compatibility via `caseStudyToProject` mapping;
      seeded demo case studies mapped into `initialProjects` with rich story blocks.
      **Same day, the second half — the merge was server-only at first.**
      `/work` and the `collection` block read `data.projects` /
      `content.projects` directly, so a legacy case study answered at
      `/work/<slug>` and sat in the sitemap while being absent from the list
      and from every block meant to show it. `ProjectItem.origin: 'case-study'`
      now marks an adapted record (a pre-merge snapshot carries no `story`
      blocks to recognise it by), the pure helpers moved to
      `core/content/work.ts`, and `publicView` + `blockContentFrom` fold the
      legacy list in at the two points where a client or a block sees content.
      `BlockContent.caseStudies` is gone; `collection` links `/work/<slug>` and
      offers only the two meanings that remain (`both` stays in the schema so
      stored props still parse); the homepage band reads the merged list;
      `updateCaseStudiesAction` refuses a case study whose slug a project
      already uses instead of letting `mergeWork` drop it silently. Copy that
      still pointed at the deleted routes — the navigation route picker, the
      case-studies editor hints, the content-health cover check, the seeded
      band CTA — was corrected.
      Verified (with item 5, same tree): live `/case-studies` → 308 `/work` and
      `/case-studies/rethinking-onboarding` → 308 `/work/rethinking-onboarding`;
      `/work` server-renders all seven records including the three legacy case
      studies; the sitemap carries seven `/work` URLs and no `/case-studies`;
      1002 passed | 11 skipped (1013) over 69 files; lint 0 errors / 76
      warnings; typecheck, format check and build green.
- [x] Writing SEO parity + auto OG fallback. **DONE 2026-10-18:** a writing
      entry unfurls with a card of its own now — a per-piece card at
      `app/writing/[slug]/opengraph-image.tsx` (title, summary, date, author and
      role, site) beside
      `app/opengraph-image.tsx` for everything else (name, role, availability,
      location, tagline), both 1200×630. `buildMetadata` falls back
      path-aware (`/writing/…` → its own card, otherwise the site-wide one), a
      per-piece image beats the SEO screen's `ogImage` beats the card, and
      `metadataBase` is always set so a relative path still resolves on an
      install with no domain. The Article JSON-LD was missing everything that
      attaches a headline to anything — `mainEntityOfPage`, `image`,
      `author.url`, `publisher`, `dateModified` — all of which need an absolute
      address and so are emitted only once a domain is set.
      **A real bug, found by measuring:** a metadata route inside a route group
      is served at a hashed path. `getMetadataRouteSuffix` in
      `next/dist/lib/metadata/get-metadata-route.js` hashes the parent path of
      any metadata route under a `(group)`/`@parallel` segment, so the file at
      `app/(site)/writing/[slug]/opengraph-image.tsx` really answered
      `/writing/<slug>/opengraph-image-cvh5yn` while every page, the sitemap and
      the JSON-LD advertised the clean path — which 404'd. Measured side by side
      on a live build: 200 on the suffixed path, 404 on the clean one, page
      itself perfect either way. The file now lives at
      `app/writing/[slug]/opengraph-image.tsx`, outside the group, and
      `core/pages/__tests__/metadata-route-placement.test.ts` fails if anyone
      moves it back. An unknown slug answers 404 rather than a generic card.
      Verified live against a temporarily seeded published piece (the store was
      backed up first and restored byte-identical, SHA-256 compared): `og:image`
      absolute and pointing at the per-piece route, `og:type=article`,
      `twitter:card=summary_large_image`, Article JSON-LD carrying
      `mainEntityOfPage` / `image` / `datePublished` / `dateModified` /
      `publisher` once a domain is set, both cards 200 `image/png`, unknown slug 404. Regression tests: `core/content/__tests__/og-fallback.test.ts` (five)
      plus the placement guard.
- [x] **P0 discovered 2026-10-17, FIXED 2026-10-18: not-found rendered with
      HTTP 200.** Every dead address (`/no-such-route`, `/share/<bad-token>`,
      `/work/<missing>`) rendered the branded 404 body with status 200, in dev
      and in production, including a minimal route whose only statement was
      `notFound()`. **Cause:** `app/(site)/loading.tsx` — a `loading.tsx`
      boundary streams a 200 shell the moment its segment is entered, so the
      status was already spent before any page ran; `notFound()` (or a throw
      from `generateMetadata` — also tested) could only change the body. Not
      the share code, the catch-all, or the proxy, all of which were correct.
      **Fix:** the skeleton moved below each segment's existence gate —
      `[...slug]/layout.tsx` (new), and the same for `work/[slug]`,
      `case-studies/[slug]`, `writing/[slug]`, each with the skeleton beside
      it; `share/[token]` keeps its page-level check with no skeleton above.
      **Verified:** dev matrix — 5 dead paths all 404 with branded body +
      noindex, `notFound()` still guarding the same addresses; live pages and
      home 200; production re-verified after rebuild. Regression guards:
      `core/pages/__tests__/not-found-boundaries.test.ts` (structural) +
      a dead-address check in `scripts/smoke.mjs` (HTTP).
- [x] Generic embed block + booking guide. **DONE 2026-10-18:** `embed`
      block (#26) with `toSchedulingUrl` host-allowlist validation (Cal.com,
      Calendly — rebuilt URLs, evil-host tests) + click-to-load `EmbedFacade`
      island, CSP `frame-src` extended (contract comment updated), ratio
      choice, editor check. Verified: URL unit tests, render/check tests, axe
      matrix entry, suite green, build green; live CSP headers carry both
      hosts and the homepage ships zero third-party URLs (facade contract
      holds). The social facade set and link-in-bio preset this item left open
      were done in their own row below: `socialPost` reuses this block's
      `EmbedFacade`, which now takes its copy from the caller.
- [x] Expiring share links (M). **DONE 2026-10-18:** one private URL per page.
      `core/sharing/tokens.ts` mints a 192-bit token, stores only its SHA-256
      under the `share` kv namespace with a TTL, and resolves it by
      constant-time compare; `/api/admin/share` is owner-only in all three
      directions; `/share/[token]` renders the page's **draft** with `noindex`
      and a banner that says what it is; the Pages screen carries the panel
      that mints, lists and revokes. It had been written but only ever checked
      by unit test, so it was verified live this round — **both expiry layers
      separately**, because an expiry that is written and never enforced is the
      classic silent bug here. Measured: mint → `/share/<token>` 200, noindex,
      92 KB of draft; a wrong token 404; revoke → the same link 404 and the kv
      row gone; backdating the record's own `expiresAt` → 404 **and** the row
      swept; backdating the kv envelope instead → the row reads as absent and
      the admin answers `active: false` rather than a stale date. The nine unit
      tests in `core/sharing/__tests__/tokens.test.ts` already covered
      mint/resolve/revoke.
- [x] Newsletter broadcast handoff via Listmonk (S). **DONE 2026-10-18:**
      `definitions/listmonk.ts` puts the recommendation on the Services screen
      where the other services live — AGPLv3, single binary, `verifiedOn`
      2026-10-18 (licence, install path and v6.2.0 of 26 Jun 2026 read off
      listmonk.app that day). **No API key field on purpose:** nothing in the
      product calls Listmonk, and a credential stored for a caller that does
      not exist is a liability with no payoff. The Test button therefore checks
      the one thing worth checking while self-hosting — is it answering, is
      that the right port, is its database up. Statuses are the ones a real
      instance returned (measured against a public demo, not assumed):
      `{ data: … }` on success, `{ message: … }` on refusal, refusal as **403,
      not 401**. The CSV exit is now a handoff rather than a footnote: a
      "Sending it out" section on the Newsletter screen says the screen never
      sends, names Listmonk first with its connected/not state read through the
      same projection the Services screen uses, keeps Buttondown/Mailchimp as
      the "already paying for one" case, and states the obligations — confirmed
      addresses only, keep the unsubscribe link, send the first one to
      yourself. Resend/Brevo stay documented as bring-your-own-key fallbacks;
      no paid tier is promoted anywhere. Nine new tests cover the definition
      and every answer the Test button can give.
- [x] Comments via Giscus, off by default. **DONE 2026-10-18:**
      `definitions/giscus.ts` (setup, public-repo Test, honest degradation),
      `comments` block with its own props + click-to-load facade (no GitHub
      contact until asked, same pattern as the video facade). Verified:
      definition tests, block render/check tests, auto-included in the axe
      matrix, suite green, build green. Browser unavailable this round (tool
      catalog changed mid-session); same render path as the verified
      Turnstile widget.
- [x] Mobile admin pass. **DONE 2026-10-18 - all four parts: the section nav
      (what the item called the "44px TopNav strategy"), the 375px target
      sweep, the offline badge, and the conflict/version diff preview.** The
      header used to be a wrapped list of 25 links: at 375px it measured
      **288px tall** - the
      first screen — and every link was a 20px line of text. It is now a 44px
      Menu button that names the section you are in and opens the same 25
      links as **44px pills**; from `sm` up it stays the wrapped list, with
      28px rows (WCAG 2.2 asks 24px) and `aria-current="page"` on the current
      section. Each link carries a pending dot (`useLinkStatus`) because the
      admin is `force-dynamic` and a tap on a slow connection otherwise shows
      nothing until the server answers — **no `loading.tsx` was added**, since
      a loading boundary streams a 200 shell and that is exactly the
      not-found-returns-200 bug fixed further up this list. `aria-live` was
      not missing either: every async message in the admin is already a
      `role="status"`/`role="alert"`.
      **Measured** with Playwright at 375×812 against the production build:
      header 288 → 113px, button and every one of the 25 links exactly 44px,
      one `aria-current`, zero horizontal overflow, no console errors;
      desktop two rows as before (129px vs 120px). Test:
      `app/admin/(protected)/_components/__tests__/admin-nav.test.tsx` (six —
      every href in order, collapsed by default with a live `aria-controls`,
      `aria-current` only on the current section, the 44px class on every
      link, every href resolving to a real `page.tsx`, axe clean).
      The "stacking preview (preserve scroll, per-page device memory)" this
      item also carried is **superseded**: the preview is a full tab now
      (`window.open('/api/preview?path=…')`, owner-gated draft mode), not an
      iframe beside the editor, so there is no stack to size or scroll to keep.
      **The media sub-item is resolved by measurement, not by porting a legacy
      rule.** A Playwright sweep of all 25 admin screens at 375px found
      **zero horizontal overflow on every one of them** — Media included —
      zero console errors, and no real sub-24px target left. Two were real and
      are fixed in the same pass: the Appearance colour presets were 20px
      buttons (now a 20px swatch inside a 44px hit area) and Help's two
      standalone links were 20px (now `py-1` → 28px). Every remaining flag is
      an exception, checked one at a time: inline links inside a sentence
      (dashboard health rows, "Set it up under Services"), checkboxes inside
      `min-h-[44px]` labels, and `sr-only` file inputs behind 44px buttons.
      There is no picker overlay to width-cap: the admin has no `<dialog>`,
      `role="dialog"` or fixed overlay anywhere.
      **The offline badge is in** (`_components/offline-notice.tsx`): a
      `useSyncExternalStore` chip in the header reading `navigator.onLine` and
      the browser's `online`/`offline` events. External state, so the first
      paint has an answer rather than an effect catching up; the server
      snapshot is "online" so it cannot flash for everyone on load. Every write
      on these screens is a server action, which makes this the one failure the
      server cannot report — nothing reached it. Verified in a real browser by
      driving the disconnect the way a browser drives it (`navigator.onLine`
      overridden, `offline` event dispatched): the chip appears with
      `role="status"` and leaves again on `online`. Unit test covers both
      transitions.
      **The version diff preview is in** (History). Each row now says what
      pressing Restore would do, in the words the publish button already uses
      — `changedParts` was split out of `describeChanges` so the two cannot
      drift — and a snapshot that matches the draft says so instead of
      inviting a restore that changes nothing. Verified live against the
      production build by editing the store under the running server (backed
      up first, restored after, hashes compared): as-is the row reads
      "Restoring would change: site settings, pages, … media (-1)"; with the
      snapshot cloned over the draft it reads "Matches your draft — restoring
      would change nothing". Unit test proves the sentence `describeChanges`
      builds is exactly these parts, in both directions.
      **The conflict diff is in.** Every refusal now answers the three questions
      in one sentence - whether anything was written ("nothing was written"),
      the two revision numbers, and the diff there actually is to show.
      `conflictMessage` builds it on the same `changedParts` as the publish
      summary and the History preview, and the form islands render it with a
      44px **"Reload this screen"** control (`_components/conflict-notice.tsx`),
      because reloading is the only honest next step - there is no merge here
      and no dialog. Both user-reachable conflicts were verified live against
      the production build by moving the store's revision behind the loaded
      page's back (both files backed up first, both restored after, hashes
      compared, nothing else written): History's Restore answered "**You had
      version 97; the site is on 98.** … Restoring would change: site settings,
      pages, … media (-1)"; the dashboard's Publish answered "**You had version
      5; the site is on 6.** … Publishing would change: … media (+1)" - each
      with the Reload control at 44px. Unit tests cover the sentence's three
      shapes (parts, no parts, no fresh state).
- [x] Collection writes refuse a stale save. **DONE 2026-10-20 as Phase E1, see §12.8.** **Found 2026-10-18 finishing the
      mobile pass, deliberately not started there.** The collection/settings
      editors write the revision they _just read_ (`writeList`, `writeDraft`),
      not the revision the screen loaded, so a stale save is not refused - the
      edited list is replaced wholesale under a fresh revision, and a change
      another tab made to that same list is lost silently. A conflict there
      needs a true millisecond race to reach, which is why no user has met one
      yet; the refusal message path is shared with restore and publish, both of
      which were verified live. Closing it means sending the screen's loaded
      revision - or a fingerprint of the list it loaded - with the save and
      refusing a stale write, which is what `core/storage/contract.ts` already
      promises ("a number that has to match… turns a lost update into a
      question the user can answer"). It touches every builder and action, and
      a half-threaded revision is worse than an honest note.
- [x] An emptied Text block keeps its fields. **FOUND AND FIXED 2026-10-18.**
      Clearing the Text field writes `[]` — the editor writes what is in the
      box — and `richText`'s props said
      `paragraphs: z.array(z.string()).min(1)`, so the block came back from
      `parsePage` **quarantined**: the editor showed "This block cannot be
      shown here" instead of the fields, and the only way out of an emptied
      block was to delete the block and start again. The one state a person
      reaches by deleting text was the one state the editor could not show.
      Both blocks carrying a `paragraphs` field had it (`richText` and
      `split`). Fixed by making empty a state rather than a refusal: the
      schemas accept an empty list, an `empty` check says "This block is
      empty. Write something, or delete it." beside the block in the outline,
      and `richText` renders _nothing_ for an empty block instead of an empty
      band, so a half-written page carries no gap where the text will go. It
      also rescues documents already stored in the invalid state: a page saved
      with an emptied Text block opens again, with its fields.
      Verified: `definitions.test.ts` parses both emptied blocks through the
      real registry and asserts the warning fires; `render.test.tsx` asserts an
      emptied Text block renders the empty string; 344 block tests green. Live
      in the editor against the production build — a new piece, a Text block,
      typed and cleared: the text field stayed, the heading field stayed, zero
      "cannot be shown here" notices, the warning shown, no console errors, and
      the store byte-identical because nothing was saved.
- [x] Import v1, the Markdown half. **DONE 2026-10-18:** `core/writing/markdown.ts`
      reads the subset an exported post actually contains — front matter
      (title, date, summary, tags, and the `slug`/`permalink` aliases), a
      leading `#` as the title when there is none, headings into block
      headings, paragraphs, lists into bullet paragraphs, quotes into the real
      `quote` block with an em-dash attribution, links keeping their address
      after the text — and reports what it could not carry (images, bold and
      italics, code, tables, HTML) rather than dropping it silently. 20 tests,
      one of which runs every block it builds through the renderer's own
      validation, so an import cannot arrive pre-quarantined.
      The screen is deliberately not a second screen:
      `writing/markdown-import.tsx` reads the files in the browser with the
      same module the tests run, previews each piece and its warnings, settles
      slug clashes with the same `-2` rule the screen already uses, and
      appends to the Writing screen's own list — which keeps the contract
      under Save ("until Save, everything on this page is local") and means no
      second write path to keep in step with `updateWritingAction`. Image
      bulk upload already existed (Media and Artifacts both take multiple
      files). `MAX_WRITING_ENTRIES` moved from the action into the schema,
      because the save and the import now both have to agree about the
      200-piece limit; the cap, and the room left under it, is shown in the
      panel before anything is added.
      Verified: 20 reader tests + 4 jsdom tests of the panel (preview, clash,
      refusal on a full site); suite green (1046), typecheck, lint and
      format:check green, production build green; live against the built
      server with a real `.md` upload — the preview read "4 blocks · dated
      2024-03-01" with the list and link warnings, "Add 1 piece" put it in the
      list, Save stored it, reload showed `/writing/on-slow-mornings` again,
      zero console errors, and the store was restored byte-identical
      afterwards.
- [x] Social embed facade set + a link-in-bio page preset. **DONE 2026-10-18:**
      A `socialPost` block for the three hosts whose embed address can be
      _rebuilt_ from the link rather than passed through, following the video
      and booking facades: Instagram posts, reels and TV
      (`/p|reel|tv/<code>` -> `/<kind>/<code>/embed`), Behance projects
      (`/gallery/<id>/...` -> `/embed/project/<id>?ilo0=1`) and Substack
      publications (`<pub>.substack.com` -> `/embed`, the subscribe box). The
      Behance and Substack addresses were **fetched while writing this**, not
      remembered: Behance's own oEmbed endpoint returned that exact iframe for
      a gallery link, and a live publication answered at `/embed` with its
      subscribe form. `EmbedFacade` now takes its blurb and button text from
      the caller, so the booking block reads exactly as it did and each
      provider gets its own promise ("Show the post", "Show the subscribe
      box").
      **GitHub is not in the set, and the block says why in the editor rather
      than leaving a blank space:** it publishes no embeddable page for a
      repository, so the other two options were framing something that refuses
      to be framed or shipping a script this site has promised not to ship. The
      check message points at linking from a card or from the work collection
      instead.
      The link-in-bio half is a _page preset_, not a new block type:
      `createLinkInBioPage` returns a draft `links` page built from three
      blocks that already exist (picture-and-text, cards, social row), and
      Pages gains "Add a links page" beside "Add page". A dedicated
      stack-of-links block stays on the P2 list.
      Verified: `toSocialEmbed` cases for the three hosts, for the lookalikes
      (`instagram.com.evil.example`, `behance.net.evil.example`, …), for
      profiles and galleries that are not posts or projects, and for
      non-http schemes; a jsdom test that mounts the block, asserts no
      Instagram address is in the DOM at all, presses the real button, and
      then reads the iframe's rebuilt `src` and its `title`; a registry test
      that parses the preset's blocks, so a starting point cannot arrive
      pre-quarantined; 427 block and page tests green, full suite green
      (1075 passed | 11 skipped), typecheck, lint (0 errors, the 76-warning
      baseline) and format:check green, production build green.
      A live pass against the built server, because a facade is a promise about
      what a browser does: Pages → "Add a links page" made a page carrying its
      three blocks, Save stored it, the Social post block took the link, and
      Publish now made `/links` public. The **server-rendered** HTML carries
      the facade's blurb and its `aria-label`ed button, and an `<iframe>` is
      absent from it. A browser on `/links` made **no request to Instagram**
      before the press; after it, the frame was the rebuilt address, titled
      from the field, with **zero CSP refusals** in the console and 43 requests
      to Instagram — all of them the frame's own making. The store was restored
      byte-identical afterwards.
      _Nuance for whoever checks this next: the rebuilt address does appear in
      the page's hydration payload as a string, and the site's own social row
      links to instagram.com as ordinary links. Neither is a request, and the
      request is the thing the facade promises to withhold — so that is what
      was measured, rather than a grep for the hostname._
- [x] Import v1, the CSV half. **DONE 2026-10-23** as the per-screen fixed
      templates proposed below, on seven screens (see §12.8 E5 and Phase F).
      Originally: **Open, and it needs a decision before code:**
      what a spreadsheet is imported _into_. Markdown had one obvious target;
      a CSV has ten — every collection with a repeating shape (work, brands,
      experience, education, artifacts, recommendations, capabilities). A
      per-screen import with a fixed, documented column template is the honest
      v1 (it needs no mapping screen and can be described where it lives);
      a target-and-column-mapping screen is the v2 if the fixed templates turn
      out to be too rigid. Worth doing on whichever screen hurts first rather
      than all ten at once.
- [x] Import v1: image bulk upload. **Already shipped** — Media and Artifacts
      both take multiple files; kept here only so the item is not half-lost.
- [x] Phase C entries in `CHANGELOG.md`. **DONE 2026-10-18:** the named changes
      are written up in the Unreleased section under **You can now** -
      Turnstile, the analytics view counts, the `embed` block, Giscus, the
      per-piece preview cards, expiring share links, the mobile admin pass, the
      offline/conflict/restore-preview trio and the Listmonk handoff - with
      **Changed** rows for the `work` merge and the design-system removal, and
      **Fixed** rows for the 200-OK dead addresses and the hashed
      `opengraph-image` path. Each row carries the _cause_, because that is the
      part a reader cannot reconstruct from the diff. The sweep also caught the
      release notes' own stale claim: every block count in the README, these
      notes, the handover ledger and the marketing site said twenty-four, and
      the registry has had two more since (`embed`, `comments`). It is
      twenty-six everywhere now - and the handover rows for mobile, sign-in and
      the test count had gone stale the same way, so those were corrected on
      the same measurement rule.

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
      re-evaluation with CSS-build assertion test). **DONE 2026-10-18:** all
      twenty-nine screens migrated at unchanged URLs across twelve slices,
      then the kill criteria landed — the catch-all mount and `src/admin/**`
      deleted, `react-router-dom` removed from the manifest, the ESLint
      tripwire retired, and the two still-used modules relocated into
      `app/admin/(protected)/_components/`. Verified: 29 screens 200, unknown
      `/admin/*` answers 404 authenticated and 307 to login signed out, 984
      tests / lint / build green, state files byte-identical. Full record with
      per-slice evidence: `docs/ADMIN-REWRITE.md`. The last sequencing item —
      the Tailwind 4 re-evaluation — landed the same day: the CSS-build guard
      now compiles the real stylesheet, the port is verified on the
      `tailwind4-attempt` branch, and the call itself was made on 2026-10-18
      (recorded 2026-10-25): stay on Tailwind 3 (§7, §11.5).

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
- Implication, re-checked against a live port (2026-10-18, issue #9): the
  silent-failure risk is now guarded — `css-build.test.ts` compiles the real
  stylesheet through the real pipeline, and the port is verified end to end on
  the `tailwind4-attempt` branch (full gate green, computed styles identical to
  the v3 baseline). Two deltas the port surfaced: one source file read
  `var(--color-border)`, an Astryx-owned name v4 would have started emitting
  with our value (fixed — it now reads `var(--border-color)`), and 18
  custom-token alpha utilities (`bg-bg/90`, `selection:bg-accent/20`, …) that
  v3 emitted as nothing now render. The §7 product call was made on 2026-10-18
  (recorded 2026-10-25): **stay on Tailwind 3**. The port works, but v4's Safari
  16.4+ floor decides who can see a site built on this, and the older phones
  this product still has to open on are worth more than the migration.

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

| What                                                                                                                                                                                                                    | License (lockfile)           | Verdict                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project itself                                                                                                                                                                                                          | MIT (`packages[""].license`) | Free + OSI-approved                                                                                                                                                          |
| `next@16.3.0`, `react`, `react-dom`, `zod`, `clsx`, `tailwind-merge`, `motion`, `react-icons`, `server-only`, `nodemailer`, `postgres`, `tailwindcss`, `typescript`, `eslint`, `prettier`, `vitest`, `postcss`, `jsdom` | MIT / ISC                    | Free + OSI-approved (`framer-motion@13` removed 2026-10-17; `react-router-dom` removed 2026-10-18; `@astryxdesign/*` and its orphaned `@stylexjs/stylex` removed 2026-10-18) |
| `@vercel/blob@2.7.0`, `firebase-admin@14.5.0`, `@cloudflare/workerd-*`, `firebase-tools`, `@electric-sql/pglite`                                                                                                        | Apache-2.0                   | Free + OSI-approved **SDKs** — but the _services_ behind two of them are commercial                                                                                          |
| `@axe-core/playwright`, `axe-core`                                                                                                                                                                                      | MPL-2.0                      | Free + OSI-approved (copyleft, file-level — fine for testing dep)                                                                                                            |
| `lru-cache` (transitive)                                                                                                                                                                                                | BlueOak-1.0.0                | Free + OSI-approved                                                                                                                                                          |

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
  _(2026-10-18: the rewrite landed without shadcn — plain Tailwind plus the
  local `_components` kit, and the last Astryx island has now left with the kit
  itself. Re-evaluate Base UI when the next primitive is needed.)_
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

---

## 12. Second pass — 2026-10-20

A second A-to-Z pass after the 2026-10-18 admin rewrite. This section does not
repeat anything above: it lists only what is still wrong or missing in the
current tree, each with the file that shows it. The free-only rule at the top of
this file still binds every recommendation here.

### 12.1 Verdict

The engineering is strong, and the admin is now a coherent server-first app.
Five gaps remain:

1. **What the public site ships contradicts the server-first story.** Every
   public page hydrates the whole published document, plus a client data layer
   that never runs.
2. **The rewrite made editing less safe.** Edits stay local until Save, and
   nothing stops you from navigating away from unsaved work. Cmd/Ctrl+K went
   with Astryx. Collection saves still overwrite blindly.
3. **The ownership promise breaks at the exit.** Backups hold no media bytes,
   and there is no static export.
4. **Production hardening that a public self-hosted OSS product is expected to
   have is missing.** There is no published image. E2E and axe tests do not run
   in CI. Placeholder secrets are accepted.
5. **The public site does little for writers and recruiters.** There are no tag
   archives, no table of contents, no reading time, no search, no print or CV
   view, and no way to set the site language.

### 12.2 Developer / architecture

| #   | Finding                                                                                                                                                                                                                                                           | Evidence                                                                        | Fix                                                                                                                                                                                                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Every public page serialises the whole published document.** `publicView` keeps every published page, the full blocks of every writing entry, and every project story. A writer with 200 posts ships all 200 bodies on `/contact`.                              | `app/(site)/layout.tsx:28` → `core/content/sanitise.ts:54-77` → `SiteProviders` | Move the themed `src/views/*` and `src/components/*` (all `'use client'` + `useCMS`) to RSC that read on the server. Until then, pass a per-route slice (settings, nav, footer, appearance).                                                                |
| D2  | **A dead client data layer ships to every visitor.** Only the public site mounts `CMSProvider`, and it always passes `initialData`. So `cmsService` (931 lines), the `localStore` IndexedDB layer (337 lines) and the 22 KB demo seed are imported but never run. | `src/cms/context/CMSContext.tsx:5,81-147`                                       | Delete the IndexedDB, auth and publish branches. Leave a thin read-only context. Move the types `core/backup/bundle.ts` imports to a types-only module.                                                                                                     |
| D3  | **Caching is still `revalidate = 60` + `revalidatePath`.** The layout's comment says it is waiting for server-side publish, which now exists.                                                                                                                     | `app/(site)/layout.tsx:10-16`, `_actions/publish.ts:117`                        | Use Next 16 Cache Components: `'use cache'` + `cacheTag` on the published read, and `updateTag` from the publish action. Scheduled writing needs a `cacheLife` that matches the next `scheduledFor`. Check the API in `node_modules/next/dist/docs/` first. |
| D4  | **Collection saves do not refuse stale writes.** This is the open Phase C item above.                                                                                                                                                                             | `_actions/collections.ts`                                                       | Pass the loaded revision through `CollectionEditor.save` into every action. Refuse a stale save with `conflictMessage` + `ConflictNotice`.                                                                                                                  |
| D5  | **JSON-LD is not escaped.** A title containing `</script>` breaks out of the tag, and Markdown import makes third-party titles a real input.                                                                                                                      | `app/(site)/writing/[slug]/page.tsx:96`                                         | Use one helper: `JSON.stringify(x).replace(/</g, '\\u003c')`, as the Next.js JSON-LD guide says.                                                                                                                                                            |
| D6  | **Placeholder secrets are accepted.** `docker-compose.yml` ships `change-me-…` values for `OPB_SETUP_TOKEN` and `OPB_SECRET_KEY`. Anyone can claim a fresh install with a phrase that is published on GitHub, and the vault key is public.                        | `docker-compose.yml`, `core/security/boot.ts`, `core/auth/claim.ts:34,78`       | In production, refuse known placeholders and anything under 24 characters (fail fast in `instrumentation.ts`).                                                                                                                                              |
| D7  | **The Playwright smoke test and axe check exist, but CI never runs them.** There is also no golden-path test (claim → edit → publish → a visitor sees the change).                                                                                                | `.github/workflows/ci.yml`, `e2e/`                                              | Add an e2e job after the build, with one golden-path spec and one admin axe pass.                                                                                                                                                                           |
| D8  | **No published image and no release pipeline.** Nobody can `docker pull`.                                                                                                                                                                                         | `Dockerfile`, workflows                                                         | Add a tag-driven release workflow: multi-arch buildx → GHCR, plus GitHub artifact attestations (Sigstore keyless, free) and an SBOM.                                                                                                                        |
| D9  | **No CodeQL, no OpenSSF Scorecard, no audit gate.** All three are free for public repos.                                                                                                                                                                          | workflows                                                                       | Turn on CodeQL default setup, add the Scorecard action, and pin actions by SHA.                                                                                                                                                                             |
| D10 | **The published document nests 20 full snapshots.** Every render reads all of it.                                                                                                                                                                                 | `_actions/publish.ts:20,70-77`                                                  | Store versions as separate kv rows and keep only an index in the document.                                                                                                                                                                                  |
| D11 | **Test coverage is scoped to `core/**`.** The admin has 3 test files, and `src/` has effectively none.                                                                                                                                                            | `vitest.config.ts`                                                              | Widen the scope as D1 moves views to RSC. Add action-level tests for the `requireOwner` and revision paths.                                                                                                                                                 |
| D12 | **The front door still has two sources of truth.** The legacy `/admin/homepage` sections editor sits beside the home page built as a page.                                                                                                                        | `app/admin/(protected)/homepage/*`, `_actions/homepage.ts`                      | Add a one-click "Convert theme layout to blocks", then retire sections editing after a deprecation release.                                                                                                                                                 |

Minor: the dashboard breaks the house rules in two places. A `<p className="mt-1 …">` has no `m-0`, and the
empty-state `<h1>` has no eyebrow (`app/admin/(protected)/page.tsx:51,78`).
`README.md:225` says edits "save as you type", but every screen now has an
explicit Save.

### 12.3 UI/UX + UX laws — admin

- **Unsaved changes can be lost (error prevention).** Builders keep edits local
  until Save, and `grep beforeunload app` finds nothing. Add a shared dirty
  guard: `beforeunload` plus an intercept on nav links, and an "Unsaved
  changes" chip beside Save.
- **The Cmd/Ctrl+K palette is gone.** Phase A added it, and the Astryx deletion
  took it with it. Rebuild it as a plain-Tailwind client island over
  `ADMIN_SECTIONS` plus record titles (Hick's and Fitts' laws).
- **Cmd/Ctrl+S on every builder**, and an **Undo** toast after a delete.
- **The nav is 25 flat links (Hick's and Miller's laws).** Group them:
  - _Build_: Pages, Writing, Work, Media
  - _Profile_: Experience, Education, Brands, Recommendations, Capabilities,
    Process, Artifacts
  - _Audience_: Messages, Newsletter, Analytics
  - _Look & reach_: Appearance, Navigation, SEO
  - _System_: Settings, Services, Storage, Your site, History, Help

  Drop **Case studies** now that work is merged, or label it as legacy.

- **The live side-by-side preview is gone.** This is the biggest
  perceived-quality gap against Framer and Carrd. Add an optional split view:
  an iframe of `/api/preview?path=` that reloads after Save, with a device-width
  toggle. Same-origin framing is already allowed.
- **Block fields need progressive disclosure.** Show the essentials, and put the
  rest under "More options".
- **The dashboard needs a launch checklist with progress (Zeigarnik effect).**
  It should hide itself at 100%.

### 12.4 UI/UX — public site

- **The site language is hard-coded** to `lang="en"` (`app/layout.tsx:116`). A
  non-English portfolio fails WCAG 3.1.1. Add `settings.language` (BCP-47) with
  an optional per-page override.
- **Footer social links lack `rel="me"`** (`src/components/Footer.tsx:150`). The
  socials block has it (`core/blocks/standard.tsx:1070`). Also emit
  `<link rel="me">` in `<head>`, because Mastodon's verifier reads only the
  server HTML. Optionally add `fediverse:creator`.
- **Writing:** add reading time, a table of contents built from block headings,
  previous/next links, a related strip, and tag archives. `tags` already exists
  in `core/writing/schema.ts:56`, but nothing renders it.
- **Recruiter path:** add a print stylesheet (there is none) and a `/cv` page
  built from experience, education and capabilities.
- **Search:** a server-side route over the published document. No third party
  needed.
- **Motion:** prefer CSS View Transitions for route changes over more `motion`
  JavaScript (six public components import it today).
- **Images:** `next/image` is still unused. Record dimensions at upload, then
  either use narrow per-adapter `remotePatterns`, or generate widths plus
  AVIF/WebP at upload with `sharp`. Note CVE-2026-64644: permissive
  `remotePatterns` let an attacker exhaust CPU on `/_next/image`.

### 12.5 Product

- **Make the exit complete.** Backups carry a media manifest, not the bytes
  (`core/backup/bundle.ts:13-17`), so a move from Vercel Blob to a VPS loses
  every image. Add:
  - a streamed `.zip` with the JSON and the media, plus the matching restore
  - a **static HTML export**, so the site survives even if this project dies
- **Acquisition wedge.** Bento.me shut down on 2026-02-13 after Linktree bought
  it. Ship link-list and CSV importers (the CSV half of Import v1 is still
  open). Add "moving off X" pages beside `alternatives/[brand]` on the
  marketing site.
- **Retention.** Send the owner a monthly digest by email, using their own SMTP:
  views, top pages, new enquiries, and what is left unfinished.
- **Page scheduling** (P1 item 13) is still open. Reuse the writing predicate.
- **Optional AI assist, off by default and free only:**
  - alt-text suggestions in the browser via transformers.js (WASM or WebGPU, no
    key)
  - copy and SEO-description suggestions through an OpenAI-compatible endpoint
    the owner supplies, such as a local Ollama, registered as an integration
    definition

  Never promote a paid model.

- **Sustainability.** Link GitHub Sponsors or Open Collective, keep a public
  roadmap, and label good-first-issues.

### 12.6 SEO / discoverability

- Add `ProfilePage` / `Person` JSON-LD on home and about: Person as `mainEntity`,
  with `sameAs` from the social links. Add `WebSite` on home, and
  `BreadcrumbList` on detail pages. Reuse the D5 helper.
- Generate an optional `/llms.txt` from published pages and writing. Present it
  as an agent-access convention, not a ranking signal.

### 12.7 Tech stack (deltas only)

- **Adopt:**
  - Cache Components (`'use cache'`, `cacheTag`, `updateTag`)
  - GHCR with attestations
  - CodeQL and Scorecard
  - `schema-dts` types for JSON-LD (dev-only, MIT)
- **Passkeys:**
  - Add conditional-mediation autofill on the login field, behind a
    `PublicKeyCredential.isConditionalMediationAvailable()` check.
  - Then add conditional create after a passphrase sign-in.
- **Evaluate only:** Puck (MIT core, JSON output), if a canvas editor is ever
  wanted. Its AI layer is hosted, which the free-only rule excludes. A live
  split preview is the cheaper win.
- **Drop:** `react-icons` from the public bundle once D1 lands.

### 12.8 Phase E — checklist

**E1 — Safety and correctness (days)**

- [x] D5 JSON-LD escape helper, with a `</script>` regression test.
      `core/content/json-ld.ts`; the writing page's Article block goes through it.
- [x] D6 refuse placeholder secrets in production. **Narrowed on purpose:**
      only the documented example values (`change-me…` and the README's two
      phrases, `core/security/secrets.ts`), not a length rule. A short phrase
      somebody invented is still theirs, and an update must not lock a working
      site out. The claim is refused under the example token; the vault refuses
      to _encrypt_ under the example key but still decrypts, so a live site
      keeps sending mail; boot warns about both instead of failing.
- [x] Unsaved-changes guard + Cmd/Ctrl+S. `_components/unsaved-changes.tsx`
      (dirty = differs from last load/save as JSON; `beforeunload` plus a
      capture-phase intercept on in-admin links; Cmd/Ctrl+S), wired into
      `CollectionEditor` (ten screens) and the eight custom forms.
- [x] D4 stale-save refusal — closes the open Phase C item above. Per-screen
      fingerprints, not the document revision (`core/content/screen-token.ts`):
      saving Brands in one tab must not refuse an open Projects screen in
      another. Keys are sorted before hashing because Postgres `jsonb` reorders
      them, which would otherwise make the second save from the same screen
      look stale. An untokened save (an old tab open across the update) still
      goes through.
- [x] `settings.language` → `<html lang>`, BCP-47, canonicalised on save.
- [x] `rel="me"` on footer social links and as `<link rel="me">` in `<head>`;
      the footer now drops unsafe stored links like the socials block does.
- [x] README "save as you type" claim, and the dashboard house-rule fixes (plus
      `m-0` on every admin `<p>` that lacked it).
- [x] **Found while verifying, and fixed: a brand-new site could not save.**
      Nothing wrote the first draft row since the legacy client was deleted, so
      every editor and the welcome wizard answered "There is no draft to change
      yet" after claiming. `core/content/draft.ts` starts a missing draft from
      the published site or the built-in content and creates it create-only
      (expected revision 0, asserted by the conformance suite).

  Verified 2026-10-20: typecheck, lint (0 errors, the 79-warning baseline),
  format check and 1105 tests green; new tests for each item. Live in Chromium
  against `next dev` on a freshly claimed local install: the chip appears on the
  first edit, a link to Experience raised the leave question and stayed when
  declined, Ctrl+S saved, a second save from the same screen went through, two
  tabs on Brands — the second save was refused with "nothing was written",
  while an Experience save after a Brands save in another tab was not; a bad
  language code was refused, `pt-br` saved and published as `lang="pt-BR"`,
  four `<link rel="me">` in the served HTML, zero console errors. The production
  `next build` could not run in this sandbox (Turbopack cannot fetch Google
  Fonts through its proxy); CI builds it.

**E2 — Production pipeline (days)**

- [x] D7 e2e + axe in CI, with a golden-path spec. New `e2e` job in `ci.yml`
      (production build, Chromium, traces kept on failure).
      `e2e/golden-path.spec.ts` claims a fresh store, edits Settings, checks a
      session-less visitor does not see the draft, publishes, and polls until
      the visitor does; then axe on four admin screens. The Playwright server
      now boots on a temporary empty store with its own setup token.
      **Proved it catches what it is for:** with the E1 first-draft fix
      reverted, it fails at "Saved to your draft."; with it, all 17 browser
      tests pass (run here against `next dev`, since the production build
      cannot fetch fonts in this sandbox).
- [x] D8 GHCR multi-arch release + attestations + SBOM. `release.yml` on a `v*`
      tag: amd64 + arm64, `:<version>`, `:<major>.<minor>`, `:latest`, a
      BuildKit SBOM and max-mode provenance, plus a Sigstore-signed GitHub
      attestation pushed to the registry. README and the self-hosting doc
      show `docker run ghcr.io/…` and `gh attestation verify`. **Not exercised
      yet** — it runs on the first tag. The package may need setting to public
      once in GitHub's package settings.
- [x] D9 CodeQL + Scorecard + SHA-pinned actions. `codeql.yml` scans the
      TypeScript and the workflows (security-extended); `scorecard.yml`
      publishes the OpenSSF score; every `uses:` in every workflow is pinned
      to a commit with its tag in a comment, which the existing Dependabot
      `github-actions` entry keeps current. `actionlint` 1.7.7 is clean on all
      six workflows.

**E3 — Public performance (1–2 weeks)**

- [x] D2 delete the dead client data layer. `cmsService` (931 lines), the
      IndexedDB `localStore` (337), its types and `loadGoogleFonts` are gone;
      `CMSProvider` is a read-only context with `initialData` required, and the
      structural test now asserts it has no effect and no browser storage.
      **Found on the way:** a previewed theme change painted the published
      colours — the root layout read published appearance, and the client fix
      for previews keyed off a `?preview=true` nothing sets. The root layout is
      channel-aware now; measured `--accent-color` in an owner preview: old
      code `#35f2b3` (published), new `#c0ffee` (draft), public unchanged.
- [x] D1 per-route data. `clientView` (`core/content/sanitise.ts`) ships no
      writing, no page blocks, no project stories and only the media items with
      smaller copies; its size no longer grows with the amount of writing
      (unit-tested at 2 vs 200 posts). Project stories render on the server and
      reach the client view as a slot, which also takes the block registry out
      of the browser bundle. Measured on the seed (dev): `/contact`
      99.4→95.8 KB, `/` 157.6→153.9 KB, `/work` 131.6→127.9 KB; a story page
      grows a little because it now carries its own story as markup instead of
      every page carrying every story. The full move of the themed views to
      RSC stays open — the payload problem it was for is solved without it.
- [x] D3 Cache Components + `updateTag` — **DONE 2026-10-23 in Phase F**
      (below). Originally **deferred, with the premise
      corrected.** Publishing was never waiting 60 s: it calls
      `revalidatePath('/', 'layout')`, and the golden-path e2e proves a visitor
      sees a publish at once. The 60 s only bounds scheduled writing. Adopting
      Cache Components means removing 55 route-segment configs, moving the
      `Date.now()` in the scheduling predicate behind a cache boundary, and
      making every `generateStaticParams` return at least one param (they
      deliberately return `[]` when storage is down) — a migration for its own
      branch, now that the production build runs here.
- [x] Image dimensions + responsive variants. Uploads of JPEG/PNG/WebP wider
      than 640px get WebP copies at 640/1280/1920 beside the original
      (`core/media/variants.ts`, `sharp`, fail-soft), recorded as
      `MediaItem.variants`; the image, gallery and picture-beside-text blocks
      and the theme's `CMSImage` emit `srcset`/`sizes` from them
      (`core/media/srcset.ts`). Chosen over `next/image` because it needs no
      per-backend `remotePatterns` and opens no resize endpoint
      (CVE-2026-64644). Verified live: a 2400px upload stored three WebP
      copies, each served `200 image/webp`. Layout shift was already handled:
      block images reserve their box with `aspect-ratio`.
- [x] D10 versions out of the published document. One record per publish in
      the `versions` collection (`core/content/versions.ts`), newest twenty
      kept, nested history moved across on the next publish and readable until
      then. Verified live: two publishes → two record files, `published.json`
      and `draft.json` with zero nested versions, History listing both with
      their diffs, Restore loading the older one back.

**Also fixed in E3, found by running the browser suite against a production
build for the first time** (the production build turned out to work here once
a half-written `.next` cache was cleared):

- The axe matrix was flaky — it measured text mid-fade. It now reduces motion
  and scrolls the page before measuring, and passes repeatably.
- **Muted text failed contrast on cards and bands** (4.39–4.43:1): secondary,
  muted and link colours were derived against the page background only. They
  are now derived against every surface they sit on, and the publish audit
  checks muted text and links on the raised surface.
- **`text-accent` failed as small text in light mode (2.83:1):** it now maps to
  the link colour (4.5:1 everywhere); fills and rings keep the accent.
- **Label-in-name (WCAG 2.5.3):** four links whose `aria-label` hid their
  visible words. The experience rows now link only the company name with a
  stretched hit area.
- `/api/spam/sitekey` answered 404 when Turnstile was off — a red console error
  on every page with a form; it answers 200 with `siteKey: null` now, and a new
  smoke test fails on console errors.
- The WhatsApp icon was hard-coded white on a button that is white in dark mode.

Verified: typecheck, lint (0 errors; warnings 79 → 76), format, 1120 unit
tests, production build, and the full browser suite (18 tests) green twice in a
row against `next start`.

**E4 — Editor quality of life (1–2 weeks)**

- [x] Cmd/Ctrl+K palette. `_components/command-palette.tsx`: a native
      `<dialog>` (browser focus trap, Esc, inert page) holding the ARIA
      combobox pattern; searches the sections and the owner's own pages,
      writing and projects, every word in any order. A record result opens its
      editor on that record via `?open=<id>` (`requested-record.ts`), which the
      collection, Pages and Writing editors honour, scrolling to it.
- [x] Grouped nav. Five labelled groups (Build, Profile, Audience, Look &
      reach, System), each its own named list; Case studies shows only on
      sites that still hold legacy case studies.
- [x] Live split preview. "Preview beside" on a page docks the real page —
      `/api/preview`, owner-only draft mode — beside the editor on screens
      ≥1280px, with phone/tablet/full widths, reloading after each Save.
      **Found while verifying:** `/api/preview` and `/api/preview/end`
      redirected to `url.origin`, the server's own idea of its host
      (`localhost` under `next start`, the container name behind a proxy), so
      the owner landed on a different host; both send a relative `Location`
      now (`303 location: /about`, measured). **Known limit:** on a plain-http
      install the site's `upgrade-insecure-requests` upgrades the frame's
      navigation to https and the panel cannot load; the new-tab preview still
      works. Verified with that one directive dropped from a throwaway build:
      the panel showed the draft home page and its Preview banner.
- [x] Undo after delete — one level, in the collection, Pages and Writing
      editors (deletes are local until Save, so undo is putting it back).
- [x] Launch checklist (`core/content/launch.ts`): seven milestones with a
      count and a progress bar, each undone one a link to its screen; it hides
      itself when all are done. Seed projects do not count as the owner's work.
      **Found while verifying:** on a brand-new install the dashboard said
      "Nothing is stored yet" and showed nothing — no draft row exists until the
      first save. It reads the same built-in fallback as the editors now.
- [x] D12 convert the theme layout to blocks. `homePageFromSections` turns
      the theme's home sections into blocks — same words, order and hidden
      state, the About band from its settings — so "Build my home page from
      what it shows now" starts from the current home, not from blank. The
      seeded result parses with nothing quarantined and renders one `h1`.

  Verified: typecheck, lint (0 errors, 76 warnings), format, 1134 unit tests,
  production build, browser suite 18/18 twice; and a live pass against
  `next start`: the checklist at 0 of 7 on a fresh claim, the five group
  labels with no Case studies link, Ctrl+K → "northwind" → Enter landing on
  `/admin/projects?open=project-northwind` with that record open, delete →
  "Deleted “Northwind”" → Undo restoring 5 of 5 with no unsaved chip, and the
  home starter producing its blocks, saving, and previewing.

**E5 — Ownership and growth (2–3 weeks)**

- [x] Full `.zip` backup and restore, with media. `?format=zip` carries
      `backup.json`, `versions.json` and `media/*` (a `MISSING.txt` names any
      file the store could not read). Restore puts back only files the store
      lacks, each checked by its bytes like an upload. The zip writer is
      ~150 lines on `node:zlib` (`core/backup/zip.ts`), with no dependency.
      **Found while verifying:** every entry was dated month 0 of 1980, which
      `unzip` printed as `1980-00-00`; entries now carry the write time.
      Restore now also revalidates the public pages, which before showed the
      old site for up to a minute.
- [x] Static HTML export (`core/export/static-site.ts`,
      `/api/admin/export-static`). It crawls the published site with no
      session and saves each page as `path/index.html`, plus every asset the
      pages and stylesheets reference. The origin comes from
      `OPB_INTERNAL_URL` or `127.0.0.1:$PORT`, never from a header.
      **Found while verifying:** the build's stylesheets load fonts by
      relative path (`url(../media/…)`), so the first copy had no fonts.
      References in CSS now resolve against the stylesheet.
- [x] Owner monthly digest (`core/notify/digest.ts`, `/api/cron/digest`,
      `vercel.json`). At most one per calendar month. It needs
      `CRON_SECRET`/`OPB_CRON_SECRET` (compared in constant time) and is off
      with `OPB_DIGEST=off`.
- [x] Page scheduling. Pages gain `status: 'scheduled'` and `scheduledFor`
      behind one `isPageLive()`, which the router, nav, sitemap, client view
      and preview banner all use. Times are entered in local time and stored
      as ISO (`DateTimeField`, which writing now uses too).
- [x] CSV import (`core/import/csv.ts`, `csv-templates.ts`). Experience,
      Education and Recommendations each have a fixed template. Columns match
      in any order and any case. Unknown columns and unusable rows are named
      back. Semicolon files and BOMs are read. Rows become unsaved records, so
      the screen's Save and token check apply.
- [x] ProfilePage / Person / WebSite / Breadcrumb JSON-LD
      (`core/content/structured-data.ts`), all through the escaping helper.
      They are emitted only when the site knows its address, because the
      `@id`s must be absolute.
- [x] `/llms.txt`. It is built from the same indexable content as the sitemap,
      returns 404 when robots says noindex, and is read per request so a
      publish shows at once.
- [x] Writing: table of contents (from 3 headings; anchors are unique across
      repeated headings and keep non-Latin letters), reading time at 220 wpm,
      tag archives (404 for an empty tag), previous/next. Blocks start at
      `h2` under the title's `h1`.
- [x] Print stylesheet + `/cv`. **Found while verifying:** in a dark theme the
      print tokens lost to the theme's later `<style>`, which printed white
      headings on white paper. They are `!important` now.

  Verified: typecheck, lint (0 errors), format, 1172 unit tests, production
  build, browser suite 22/22 twice (it gains `e2e/ownership.spec.ts`: a picture
  out and back through the zip, the static copy's files, 401 for a stranger,
  `/cv`, `/llms.txt`, WebSite JSON-LD). Live checks against two fresh
  `next start` stores:
  - CSV with a quoted comma, a row missing its role and an unknown column:
    2 added, both problems named.
  - A future scheduled page 404s; a past one serves.
  - Repeated headings get `#why-this` and `#why-this-2`; a tag archive
    matches across case.
  - A 38 KB JPEG zipped from store A restored onto store B byte-identical.
  - The static copy, served by `python -m http.server`, loads six pages with
    no failed requests and navigates.
  - The digest endpoint returns 503 without a secret, 401 with a wrong one,
    and `no-mail` without SMTP.

**E6 — Optional AI assist, free only and off by default**

- [x] ~~In-browser alt-text suggestions~~ — **changed on implementation**: alt
      text goes through the same owner-supplied endpoint, using a vision model
      (`llava` or `qwen2.5vl` on Ollama). transformers.js would have added
      onnxruntime to every install for a feature most leave off, downloaded a
      few hundred MB of model into the owner's browser, and needed the admin's
      CSP opened to a model host and a script CDN. The admin is the most
      privileged page, so widening it was the deciding cost. The suggestion
      uses the 640px WebP copy when one exists, and only pictures in the media
      library (`/api/media/<key>`) can be described, so the endpoint cannot be
      pointed at arbitrary URLs.
- [x] Copy assist through an endpoint the owner supplies. The `ai-assist`
      integration definition stores the address, the writing model, an
      optional picture model and an optional key; the key is encrypted and
      never sent to the browser. Its Test lists `/models` and names any
      missing model. The buttons are "Suggest a description" (page SEO),
      "Suggest a summary" (writing) and "Suggest alt text" (image picker), and
      they render only when the integration is connected. An answer is shown,
      applied only on "Use it", and kept only by the screen's Save. Prompts
      and answer cleaning are pure (`core/ai/prompts.ts`): they strip
      preambles, quotes, Markdown and `<think>`, and cut on a sentence or word
      within the limit. `/api/admin/assist` is owner-only and rate-limited
      (60 an hour).

  Verified: unit tests for the prompts, the cleaning, the integration's Test,
  the server call (URL, key, body) and the button (hidden when off, applied
  only on "Use it"). A live pass against a fake OpenAI-compatible server on
  `next start`: no buttons before connecting; Test passes; the key is absent
  from the integrations payload and present on the model requests; a
  description is suggested, shown, and applied with the "Unsaved changes"
  chip; the alt request carried the picture; a foreign image URL got 422 and
  a stranger 401.

**Phase F — the remainder (2026-10-23)**

After E1–E6, everything the review had named and no phase held:

- [x] CSV import on Work, Brands, Capabilities and Artifacts too. Projects
      get unique slugs from their titles. Picture cells must be https or
      site-relative, so `javascript:` is refused (unit-tested).
- [x] Site search (`/search`, `core/content/search.ts`). Server-rendered and
      noindex; every word must match, ignoring case and accents; a title
      match ranks highest. The form works without JavaScript and is on the
      404 page and, past five pieces, on the writing index.
- [x] Writing "Related" strip (shared tags, neighbours excluded).
- [x] `fediverse:creator` from a Mastodon profile link only, since Medium,
      TikTok, YouTube and Threads use `/@name` too.
- [x] `schema-dts` (dev only; Apache-2.0, not MIT as §12.7 said) types the
      JSON-LD.
- [x] Passkeys:
  - Autofill on the email field (conditional mediation), with its own
    rate-limit bucket. With no passkeys enrolled it answers a quiet 200.
  - Conditional create after a passphrase sign-in, only while none is
    enrolled, capped at 4 s.
- [x] Block fields: shape, columns, "how many" and display toggles fold under
      "More options".
- [x] Preview on plain-http installs. The proxy drops
      `upgrade-insecure-requests` for requests that arrived over http
      (`x-forwarded-proto` respected). Measured: one CSP header, without the
      directive over http and with it under `x-forwarded-proto: https`. The
      preview frame now loads.
- [x] Themed views to RSC. The home sections, the footer, and the About,
      Work and project pages are server components; the remaining
      interactions are islands. The client content copy drops every list the
      server renders.
- [x] `motion` removed in favour of CSS scroll-driven animations and
      keyframes, all off under reduced motion. Checked: at 1280 and 375 px
      every revealed element is fully visible once scrolled into view.
- [x] react-icons out of the client bundle; icons render on the server.
- [x] `src/__tests__/client-bundle.test.ts` walks every public client
      component's imports and fails on zod, nodemailer, sharp, server-only,
      react-icons or an animation library. Proven by reverting the nav import:
      the test failed and named the chain.
- [x] View Transitions: page crossfade, plus a project card → hero morph.
- [x] D11 coverage covers `src/` and `app/`. New action tests cover the owner
      check and stale-save refusal against a real local store.
- [x] D3 Cache Components:
  - Published content is cached under a tag. `updateTag` from actions;
    `revalidateTag(…, { expire: 0 })` from the publish and restore routes.
  - The draft channel and owner screens read fresh.
  - "Now" is a cached value refreshed each minute.
  - Request-time pages are `instant = false`; the address-reading islands
    sit in Suspense.
- [x] A "Moving off Bento" page on the marketing site. Its one claim is
      sourced as third-party and dated.
- [x] Sustainability: a commented `FUNDING.yml` (empty until the owner has an
      account, so no broken button) and current good-first-issue entries in
      CONTRIBUTING. Labelling issues on GitHub is left to the owner.

**Measured** (same browser script, per public page, gzipped JavaScript):
295 KB → 168 KB, about −43%. Raw: 1,035 → 554 KB.

**Found and fixed on the way:**

- Hero headline:
  - `text-[var(--text-4xl)]` compiled to a colour, so the headline was never
    sized.
  - It held a `div` inside an `h1`.
- Analytics:
  - `Button` dropped `onClick` on its link variants, so "Live site clicked"
    was never recorded.
- Hidden by `motion.div`, now real buttons:
  - Lightbox backdrops were clickable divs.
  - Project images had a click handler with no picture to open.
- Content and caching:
  - The navbar shipped zod and the page schemas to every visitor
    (~280 KB raw).
  - The seed's timestamps were "now", so a cached copy differed from a fresh
    one. Together with cached reads on the write path, this refused a fresh
    install's first save; caught by the golden path on its second run.

**Verified:**

- Typecheck, lint (0 errors, 76 warnings), format, 1,215 unit tests.
- Production build; browser suite 22/22 four times in a row.
- Live, on `next start`:
  - CSV on Work, search, block options, the preview frame over http;
  - every island (gallery filter and lightbox, Work filter, copy-email and
    toast, mobile menu, view-transition navigation), with no console errors;
  - nothing animated under reduced motion;
  - publish and restore visible at once, including in the sitemap, llms.txt
    and feed;
  - a scheduled page live 81 s after scheduling for 50 s out, with no
    publish;
  - health and the claim check stay live;
  - saving an analytics integration reflected on the next page.

**Phase G — CI hardening (2026-10-23)**

Getting PR #25 green turned up three gaps; all are closed.

- [x] PocketBase conformance, red on `main` too. JSON fields were provisioned
      `required`, and PocketBase calls `{}` blank, so `records.put(c, id, {})`
      failed. They are optional now, and `provision()` relaxes them in place
      on existing sites. v0.23+ refuses an anonymous list with 403, not 401;
      the test accepts either and checks that the body leaks nothing.
      Reproduced and fixed against a local PocketBase v0.40.5, on a fresh
      install and on one with the old schema.
- [x] CodeQL `js/remote-property-injection` × 4 in the settings and homepage
      actions. The written key now always comes from a constant list
      (`copyKnown`, `TEXT_FIELDS`).
- [x] Lint: 0 problems. The 76 warnings recorded above are fixed, none
      silenced (`00dc7ce`).
- [x] Fonts bundled from Fontsource through `next/font/local`. The random
      build failure in `docs/HANDOVER.md` ("A build that failed on somebody
      else's dice") is gone with its cause: a clean build passes with the
      network off.
- [x] A `site` CI job. The marketing site's demo imports `core/`, and PR #25
      moved four block helpers it used; only Vercel noticed. The job installs
      both trees as Vercel does, then typechecks and builds `site/`.

**How each item is verified:**

- Every item: the AGENTS.md gate (`npm ci`, typecheck, lint, format check, test,
  build).
- D1–D3: compare the HTML and RSC payload size before and after with `curl`, and
  check that no writing bodies appear on `/contact`.
- D5 and D6: unit tests.
- D7: a green CI job.
- Backup `.zip`: a round trip between two adapters, with image hashes compared.

### 12.9 Sources (fetched 2026-10-20)

- Next.js JSON-LD guide (escape `<` as `<`):
  <https://nextjs.org/docs/app/guides/json-ld>
- Cache Components / `updateTag` (secondary; verify against the bundled docs):
  <https://noqta.tn/en/tutorials/nextjs-16-cache-components-use-cache-guide-2026>
- CVE-2026-64644, `/_next/image` CPU exhaustion:
  <https://corgea.com/advisories/vulnerabilities/CVE-2026-64644>
- Bento.me shutdown:
  <https://alternativeto.net/news/2025/12/bento-to-shut-down-in-2026-as-linktree-takes-over-and-offers-migration-path/>
- Google ProfilePage structured data:
  <https://developers.google.com/search/docs/appearance/structured-data/profile-page>
- llms.txt adoption: <https://www.rankability.com/llms-report/>
- Mastodon `rel="me"` verification (server HTML only):
  <https://forum.ghost.org/t/verifying-mastodon-account-with-rel-me/34227>
- Passkey conditional UI support:
  <https://mojoauth.com/blog/conditional-ui-browser-support-passkey-autofill>
- Puck (MIT core, hosted AI layer): <https://puckeditor.com/blog/puck-ai>
- Portfolio-builder AI trends:
  <https://website-builders.cybernews.com/best-portfolio-website-builders/>
- Container signing and provenance:
  <https://oneuptime.com/blog/post/2026-01-25-cosign-container-image-signing/markdown>
