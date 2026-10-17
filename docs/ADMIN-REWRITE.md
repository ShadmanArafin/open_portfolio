# App Router admin rewrite — plan (Phase D)

> Status: planned, not started. This document is the Phase D deliverable for
> the rewrite item: the sequencing, the guard design and the completed
> prerequisites. The twenty-screen migration itself is post-1.0 work and is
> tracked here, not hidden.

> Update 2026-10-18 — slices 1–5 landed: the `(protected)` shell exists with
> fifteen screens migrated (dashboard, messages, storage, history, your-site,
> analytics, newsletter, welcome, settings, footer, microcopy, appearance,
> seo, pages, homepage), and the signed-out half (login, reset) now serves
> from its own public shell. The rest serve from the legacy mount until
> their slice lands.

## Why

The admin is one client-side React Router app inside a single Next.js route
(`app/admin/[...slug]/admin-mount.tsx` — required catch-all since slice 1, so
the `/admin` root belongs to the migrated dashboard — `ssr: false`) with ~25 lazy
screens. Consequences, all known:

- Zero server rendering: no skeletons from the server, no `aria-live` seeding,
  deep links bounce through login on mistimed `authReady`.
- The fifth auth mechanism (guard-by-existence,
  `app/admin/(protected)/layout.tsx` calling `requireOwner()`) cannot exist
  while there is one catch-all route — the login page lives under the same
  path and must stay public.
- `react-router-dom`, `framer-motion@13` and the Astryx kit travel with the
  old shell. Tailwind 4 cannot be evaluated until the CSS-build guard exists.

## Landed prerequisites (this phase)

1. **`motion/react` migration** — all 16 `framer-motion` imports now come
   from `motion/react` (MIT successor, same API surface); the `framer-motion`
   dependency is removed. Springs become the default curve per the
   Material 3 Expressive read; `MotionConfig reducedMotion="user"` remains
   the reduced-motion path.
2. **CSS-build assertion test** (`core/theme/__tests__/css-build.test.ts`) —
   compiles the real `tailwind.config.js` and asserts the token utilities
   (`bg-bg`, `text-text-primary`, …) survive. Tailwind 4 stops reading the
   JS config silently; this test fails first, before any bump. The pin on
   Tailwind 3 stands until then.
3. **No new router imports** — ESLint `no-restricted-imports` fails any
   `react-router-dom` import outside the nine existing files. The rewrite
   cannot be outgrown while it is being built.

## Sequencing (when it starts)

1. **Route-group split first.** Move `login`/`reset` to top-level admin
   routes, then introduce `app/admin/(protected)/layout.tsx`:
   `await requireOwner()` + `noindex`. New pages land inside the group and
   are guarded by existence — the mechanism the catch-all can never provide.
2. **Screens in dependency order**: inbox → dashboard → settings (forms
   already have server actions nearby) → pages builder → media → the rest.
   Each screen ships as an RSC trunk with client leaves (forms, video
   facade, lightbox), per the React 19 guidance — never a bulk `'use client'`
   port.
3. **Kill criteria**: last `react-router-dom` import deleted, `ssr: false`
   mount deleted, `motion` stays, Tailwind re-evaluated with the CSS-build
   test as the acceptance gate.

### Slice 1 — landed 2026-10-17

Shell + guard (`(protected)/layout.tsx`, 307 to `/admin/login?next=` when
signed out, verified live), migrated screens at unchanged URLs
(specific routes win over the legacy catch-all):

- `/admin` dashboard — readiness/issues/activity/views server-rendered,
  `publishDraftAction` (contrast gate, version cap, revalidate)
- `/admin/messages` — URL-selected reading pane, read/delete server actions,
  push toggle island reused
- `/admin/storage` — adapter status + guides, zero client JS
- `/admin/history` — version list + `restoreVersionAction` (conflict-safe)
- `/admin/your-site` — URL/platform/published state + copy island

### Slice 2 — landed 2026-10-18

- `/admin/analytics` — enquiry stats from the real inbox, provider state
  resolved server-side, audience cards/top-pages only when there is data,
  share-URL iframe as a plain embed
- `/admin/newsletter` — form settings through
  `updateNewsletterSettingsAction` (draft snapshot, conflict-safe), list read
  from `adapter.subscribers` with `removeSubscriberAction`, CSV export as a
  session-authenticated link

Supporting work: pure `core/content/changes.ts` (fingerprint, diff summary,
media usage) with tests — the legacy `CMSService` copies stay until the old
shell dies; the route-guard AST test now walks `_actions` too, so unguarded
server actions fail the build.

Still legacy (next slices): pages builder, media library, collections,
writing, navigation, integrations, help.

### Slice 3 — landed 2026-10-18

- **Public shell** (`app/admin/(public)/layout.tsx`) — centered card on the
  admin tokens, `noindex`, no section navigation. The first admin routes a
  signed-out visitor may see, so they cannot live in the guarded group.
- `/admin/login` — server-rendered page, client leaf with all four ways in
  (passphrase, passkey, emailed OTP, reset link), unchanged endpoints. The
  proxy's `?next=` is now honoured after sign-in, validated to `/admin`
  paths only. The leaf navigates with a full `window.location.assign`: the
  session cookie was just set by the response and a soft transition can be
  served from the router's signed-out cache.
- `/admin/reset` — the two states switched by `?token`, same endpoints.
  Confirm leaves with a full navigation for the same cookie reason.
- `/admin/welcome` — RSC trunk plus the wizard as a client leaf. The answers
  go through `applyWelcomeAction`: the draft is read from storage, the
  transformation is applied by the pure `core/content/welcome.ts` (unit
  tested), written back revision-checked, then published through the same
  `publishDraftAction` the Publish button uses — contrast gate included. A
  failed publish reports "answers saved, publish failed" and does not roll
  back, exactly as the old client-side wizard behaved.
- **First-run gate restored** — the legacy `AdminLayout` used to bounce an
  unconfigured install to `/admin/welcome`; the migrated shell now does the
  same: the server decides "still the placeholder name" from the draft, the
  `WelcomeGate` leaf adds the localStorage dismissal (a browser preference,
  not content), and it stands down on the wizard's own path.

Verified live against the dev server in a real browser (browser tools):
wrong-passphrase error, OTP request state, reset request round-trip, the
gate redirecting an unconfigured install to the wizard, a full wizard run
publishing (published.json: Jane Doe / terminal theme / Blue accent / Blog
label, writing left off), the home page showing the new name, and the gate
staying quiet afterwards. `applyWelcomeAction` is covered by the AST guard
test like every other `_actions` export.

Notes for the next slice: the legacy `admin-app.tsx` still routes
`/login`, `/reset` and `/welcome` for the old shell's internal navigation
(its `AdminLayout` guard navigates to `/welcome` client-side, which renders
the legacy wizard until a reload). They die with the shell.

### Slice 4 — landed 2026-10-18

The settings family, five URLs at unchanged addresses — the last read-write
screens before the builders:

- `/admin/settings` — identity and the About story through
  `updateSiteSettingsAction`; backup on the _server_ bundle rather than the
  legacy browser draft store (export is a plain session-authenticated link to
  `/api/admin/backup`, restore arms on the file's own name, reset types
  `RESET`); `resetContentAction` writes the seed to both snapshots —
  unconditionally, like a restore, because resetting a site that has moved on
  should not lose to a revision check. Passkeys list is server-rendered;
  enroll/remove use the existing endpoints.
- `/admin/footer` — `updateFooterAction` (copyright + oversized word) and
  `updateSocialLinksAction` (the whole card list, platform still a picker,
  handle still accepts a pasted profile URL). Two sequential writes on save:
  both are revision-checked, and a concurrent pair would race itself.
- `/admin/microcopy` — the closed set, searchable client-side, one draft
  write per save instead of one per keystroke. The action only writes keys
  the content already has, so a stale tab cannot add fields.
- `/admin/appearance` — theme choice, six colour tokens, three fonts.
  Choosing a theme clears the overrides, and the confirm appears only when
  something would actually be lost; that rule is now pure
  (`core/theme/overrides.ts`, unit tested) rather than inline. Colour text
  inputs keep "empty means no override" honest: the fallback colour is a
  placeholder, never a value the save would invent.
- `/admin/seo` — `updateSeoAction`, plain draft fields.

Every action calls `requireOwner()` first, validates the patch against a
written-down field set, and writes the draft revision-checked, so the
conflict message matches the newsletter form's. Nothing here can touch the
published snapshot except Publish.

Parked, deliberately: the legacy panel's "editor typeface" preference styles
the old Astryx kit through `AdminFontContext`, which the migrated shell does
not use. Half-porting it would be a dead setting; it moves when the legacy
shell's type system does — or dies with it.

Verified live: curl matrix (anonymous 307s to login, authenticated renders,
server-rendered props), then real-browser round trips for every action —
each edit saved, checked in `draft.json`, reverted through the same form and
checked again — plus the appearance switch both ways (gate when overrides
existed, direct when not), a backup export→restore round trip against the
live endpoint, and the reset typed gate exercised against a fresh export
(seed written to both snapshots, then the export restored back). The
settings-family writes stayed draft-only throughout — `published.json`
unchanged until the reset test wrote it deliberately — and the route-guard
AST test covers all seven new actions.

### Slice 5 — landed 2026-10-18

The builders, two URLs at unchanged addresses:

- `/admin/homepage` — one island for the whole band list. Reordering,
  visibility and the text fields are local edits until Save, and the save is
  one revision-checked write of the entire list, merged by id on the server:
  a section the payload omits is kept and one it invents is ignored, so a
  stale screen can only ever change the fields it is looking at. The legacy
  editor wrote the draft on every keystroke; a single Save means one revision
  instead of hundreds, and a mis-tap of "move down" is no longer instantly
  live. The floor separating reorderable homepage bands from the standalone
  page headers (Work, Case studies, Contact) is now a shared constant rather
  than a comment (`core/content/sections.ts`, unit tested), and the about
  band mirrors into `settings` only for the fields that changed in that save
  — mirroring unconditionally would let the section's copy silently overwrite
  a heading just edited on the Settings screen.
- `/admin/pages` — the block builder over the same registry the public site
  renders from: labels, fields, defaults and check messages are read from the
  block definitions, so a new block type appears in both places the day it
  lands. The payload is the whole page list — add, remove and reorder are all
  "the list came back different" — validated field by field with slug
  normalisation re-run server-side; revisions and `updatedAt` are stamped by
  the server (stored revision + 1, one for a page that did not exist) and
  returned, so version badges move without a reload. Every block shares one
  generic form (`pages/block-fields.tsx`); the media field lists the draft's
  library and uploads straight to `/api/admin/media`. Share preview reuses
  the existing one-link-per-page tokens and stays disabled until the page
  exists server-side. Preview is not re-implemented: the button opens the
  existing owner-gated `/api/preview?path=…`.

Still legacy (next slices): media library, collections, writing, navigation,
integrations, help.

Verified live (browser tools plus the authenticated backup endpoint): anon
307s for both routes; the about heading edited, mirrored into
`settings.aboutHeading`, and reverted; a band moved down and back (orders
renumbered 1..n, page headers untouched); a page title edited and reverted; a
block field edited and reverted; a palette block added and removed through
the armed control; a share link created, fetched by an anonymous visitor and
revoked; a page added (revision 1) and deleted; slug normalisation seen live
("Spaced Value" → "spaced-value"); "Build my home page" as a local-only step
a reload discarded; the Preview button following its 303 to a
draft-rendered `/example`. `published.json` byte-identical throughout.

## Explicitly not in the rewrite

- Multi-tenancy, roles, white-labeling — see `docs/AGENCY-EVALUATION.md`.
  The guard stays single-owner; the rewrite changes _where_ the check runs,
  not _who_ it checks for.
