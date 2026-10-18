# App Router admin rewrite — plan (Phase D)

> Status: planned, not started. This document is the Phase D deliverable for
> the rewrite item: the sequencing, the guard design and the completed
> prerequisites. The twenty-screen migration itself is post-1.0 work and is
> tracked here, not hidden.

> Update 2026-10-18 — the rewrite is complete, kill criteria included: slices
> 1–12 migrated all twenty-nine screens (dashboard, messages, storage, history,
> your-site, analytics, newsletter, welcome, settings, footer, microcopy,
> appearance, seo, pages, writing, homepage, media, projects, case-studies,
> brands, experience, education, process, capabilities, recommendations,
> artifacts, navigation, services, help) and the signed-out half (login, reset)
> onto its own public shell; then the catch-all mount and `src/admin/**` were
> deleted and `react-router-dom` left the manifest. The Tailwind 4
> re-evaluation landed 2026-10-18 — port verified on the `tailwind4-attempt`
> branch, Safari 16.4+ call pending (issue #9).

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
  old shell. Tailwind 4 could not be evaluated until the CSS-build guard
  existed — it now does, and the re-evaluation has landed (issue #9).

## Landed prerequisites (this phase)

1. **`motion/react` migration** — all 16 `framer-motion` imports now come
   from `motion/react` (MIT successor, same API surface); the `framer-motion`
   dependency is removed. Springs become the default curve per the
   Material 3 Expressive read; `MotionConfig reducedMotion="user"` remains
   the reduced-motion path.
2. **CSS-build assertion test** (`core/theme/__tests__/css-build.test.ts`) —
   compiles the real stylesheet through the real pipeline and asserts the
   token utilities (`bg-bg`, `text-text-primary`, …) survive. Tailwind 4
   stops reading the JS config silently; this test fails first, before any
   bump. The pin on Tailwind 3 stood until the re-evaluation landed
   2026-10-18: port verified on the `tailwind4-attempt` branch, Safari 16.4+
   call pending (issue #9).
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

### Slice 6 — landed 2026-10-18

The media library, and the second address that pointed at it:

- `/admin/media` — the draft's media list _is_ the library, and "used N×" is
  counted from the draft by `countMediaUsage`, the helper the publish summary
  already trusts, rather than read from the item's stored `usageCount`.
  Uploads go through `uploadMediaAction`: the same byte-sniffing
  `validateUpload` the HTTP endpoint uses, bytes written to the configured
  backend, and the record appended to the draft in the same call. The legacy
  screen was the only place its uploads could be seen; the block editor's
  media field now uploads through this same action, so a file added from a
  page's image field is in the library before the page is even saved — and a
  file in the library is pickable from every image field.
- Upload and delete are idempotent (append-if-absent, remove-if-present) and
  retried once against the freshly-read draft when the revision has moved:
  refusing instead would let one save in another tab lose an upload the
  backend already accepted, or swallow a delete. Delete removes the record
  first and the bytes second, so a conflict cannot leave referenced content
  pointing at a file that is already gone; only `/api/media/…` files are
  removed from storage — the seeded demo artwork lives in `public/demo/`, and
  legacy `data:`/`idb:` references have nothing on the server to delete. The
  armed delete now names the asset and its usage before anything happens.
- The résumé hand-off stays, and grows: a PDF upload asks the same "use as
  résumé?" question, and any PDF already in the library can be set as the
  résumé later, which the legacy screen could not do without a re-upload.
  `updateResumeAction` accepts only `/api/media/…` URLs, so no other string
  can become a link on the public site. `dimensions` is read in the browser
  and carried with the upload — the one thing a server would need an image
  library for — and a malformed value is dropped rather than stored.
- `/admin/resume` — the legacy deep link redirects to `/admin/media` instead
  of re-serving the old screen through the legacy mount.

Still legacy (next slices): collections, writing, navigation, integrations,
help.

Verified live (browser tools, the authenticated backup endpoint, and the data
directory): anonymous 307s on both addresses with `?next=%2Fadmin%2Fmedia`,
server-rendered library HTML carrying the seed items and computed usage, and
the authed alias following its 307 to `/admin/media`. Then the round trips: a
PNG uploaded through the real file input (bytes in the data directory, record
prepended to the draft with the browser-probed `200x120` dimensions, `unused`
badge, `used 0×`); a PDF upload raising the résumé prompt, answered with "use
as résumé", the toolbar line and card marker updating, and `/api/media/<key>`
serving `application/pdf`; an armed delete removing record and bytes (the
deleted URL 404s, the file is gone from the data directory); an upload from
the pages builder's image picker landing in the library with the typed alt
text while `page_example`'s revision and blocks stayed untouched; and — after
the picker gained the same dimension probe — a second picker upload carrying
`200x120` too. The copy button's clipboard write is refused by the automation
profile itself (`NotAllowedError: Write permission denied`); the fallback
named the reference URL, which is the branch that matters when a browser
denies the clipboard. `published.json` byte-identical throughout
(`07f0f97f67ba7d83`).

### Slice 7 — landed 2026-10-18

The two work collections, at unchanged addresses:

- `/admin/projects` and `/admin/case-studies` share one new shell
  (`_components/collection-editor.tsx`): records in an order, each a small
  form, add/duplicate/move/remove, and one Save that writes the whole list
  revision-checked. The legacy admin rebuilt this shell once per screen —
  which is how two sibling lists ended up with different delete flows — so
  the second screen costs only its fields, and the seven small collections
  of the next slice already have their scaffold.
- The actions (`_actions/collections.ts`) validate every record field by
  field against the interfaces the public site reads: a wrong type is
  rejected, missing text reads as empty so a snapshot older than a field
  keeps saving, slugs are normalised, `sortOrder` is reassigned from the
  array order (the list as displayed is the list as stored), and two
  records sharing a web address are refused. Story blocks round-trip
  untouched — nothing edits them yet, and the story-blocks backlog item
  will own their schema.
- Three deliberate additions the legacy screen could not make: the web
  address is editable (every legacy "Add" produced a date-stamped slug
  nobody could change), the short name is editable (it labels "next
  project" links and was frozen at "New project"), and a screenshot can be
  described (the seed images carry alt text; no field let a person write
  their own). Both records can also be marked featured — the collection
  blocks' "featured only" rule had no way to be set from the admin, and the
  block's own empty state already told people to "star a record".
- Image slots upload through `uploadMediaAction`, so a screenshot added
  here lands in the media library with its description and browser-read
  dimensions. The shared `ImageField` and the one `probeDimensions` now
  live in `_components/`; the media library and the block picker import the
  same probe instead of keeping their own copies.

Still legacy (next slices): the small collections (brands, experience,
education, process, capabilities, recommendations, artifacts), writing,
navigation, integrations, help.

Verified live (browser tools and the authenticated backup endpoint):
anonymous 307s on both addresses with `?next=`, server-rendered HTML in
storage order with the record titles in the headers. Then the round trips:
a project added (four empty image slots, `featured` on by default) and
edited — title, slug with its hint rewritten, both year bounds, image
description, status — saved as one revision-checked write; reordered with
the renumbering visible in the stored draft; a duplicate created (status
reset to draft) and deleted with the armed confirmation, the stored draft
back to its seed order. A case study's key decisions were added, edited
and removed — the stored draft kept the first and the edited third — and
its status was flipped to archived with the change visible in the stored
draft. An image uploaded from a project slot: bytes on disk, a library
record with the slot's description and the browser-read dimensions, the
URL written into the slot. A project pointed at another project's address
was refused with the exact message before any write; an anonymous fetch of
the added project's `/work/…` returned the draft's not-found state while
the seeded published pages still render. `published.json` byte-identical
throughout.

### Slice 8 — landed 2026-10-18

The seven small collections, at their unchanged addresses:

- `/admin/brands`, `/admin/experience`, `/admin/education`, `/admin/process`,
  `/admin/capabilities`, `/admin/recommendations`, `/admin/artifacts` — each a
  trunk that reads the draft and a slice-7 `CollectionEditor` island carrying
  only its own fields. The legacy screens had four different shapes for the
  same job (a card grid, cards with a footer Save, lists with no Save at all);
  one shell absorbs all seven, and every list now saves the whole array in one
  revision-checked write.
- One saver (`saveCollection`) enforces what the seven share — a bounded
  list, unique ids, `sortOrder` reassigned from the array order — and each
  collection keeps its cleaner next to the interface it mirrors. Missing text
  reads as empty so old snapshots keep saving; the closed sets (`size`,
  education `status`, artifact `category`) are validated; all seven actions
  call `requireOwner()` like every other write.
- Three frozen fields start moving. The timeline block reads
  `experience.period` verbatim and the legacy admin never wrote it, so editing
  dates changed nothing the site showed — the action now writes that label
  from the structured dates on every save (entries without dates keep their
  authored text). Education `number` is derived from the list position — the
  legacy screen's `"0" + length` collided after a removal — and `isCurrent`
  from the status. New process and capability numbers come from the highest
  number in the list, not the list length.
- Line-list fields — highlights, detail chips, capabilities — split on save
  rather than per keystroke, so blank lines drop out of the stored data while
  typing stays natural.
- Two shell extensions, both driven by artifacts: `leading` puts a preview
  before the record title, and `customAdd` replaces the Add button so the
  upload control is how records are made — the legacy behavior, where you
  picked one or more files, each became a record with `alt` from the library
  caption, in the chosen order.
- Additions the legacy screens could not make, in slice 7's spirit: Experience
  and Education can be hidden (`visible` exists in the type and the public
  filter, and no legacy toggle could reach it), Recommendations can be
  featured — the testimonials block's "featured only" rule was unreachable —
  its avatar can be cleared rather than only replaced, and a brand logo can
  carry its own description for screen readers instead of only a caption in
  the library. The seven screens also join the admin nav after Case studies.

Still legacy (next slices): writing, navigation, integrations, help.

Verified live (browser tools and the authenticated backup endpoint):
anonymous 307s on all seven addresses with `?next=`, server-rendered HTML in
storage order with the seed records visible. Then the round trips: a brand
added with a logo upload - bytes on disk, a library record with the upload's
caption, the stored brand carrying its own description and the default size -
and removed with the armed confirmation, the draft back to its five. A role
saved with both dates and Current off stored the label the structured dates
imply (`Jan 2020 — Jun 2021` was never typed), and a blank line in the
highlights left no empty string in the stored list. An education entry added
at the top stored `01` with `isCurrent` derived from its In Progress status,
read `02` after one Move down, and left the seeds back at `01`/`02` when it
was deleted. A step stored `04`, a group `05`, and their line lists one
string per non-blank line. A recommendation saved featured by default, kept
the toggle off when it was switched, and cleared its avatar to a missing
key. Two artifact files uploaded in one batch stored in file order with the
`ui` category and the library captions as alt text. The library ends where
it started - three items, the résumé PDF the only byte in `.opb/media` - and
`published.json` byte-identical throughout.

### Slice 9 — landed 2026-10-18

Writing, at its unchanged address:

- `/admin/writing` — a trunk reading the draft and an island carrying the
  legacy screen's two halves: the settings that make this not a blog (name,
  order, dates, on/off) and the pieces themselves, each built from the same
  blocks as pages. One Save writes the settings _and_ the list in a single
  revision-checked draft write, so a save that half-landed does not exist.
- The block editor is now shared, not copied. The per-block UI — warnings,
  visible/hidden, move, armed remove, the grouped Add-a-block palette — moved
  out of `pages-builder` into `_components/blocks-editor.tsx`, the block field
  renderer moved from `pages/` to `_components/block-fields.tsx`, and the
  shared `Field`/`CheckField` controls into `_components/form-fields.tsx`.
  Pages renders through the same components, so a block type added to the
  registry still appears on both screens the day it renders, and a piece that
  wants a gallery no longer needs a parallel editor.
- `core/blocks/clean.ts` holds the block cleaner both actions use. Anything
  exported from a `'use server'` module becomes a callable endpoint, so the
  shared cleaner lives in core rather than being re-exported from pages.
- `sortOrder` is trusted rather than reassigned from the array order (pages
  reassigns, because a page list _is_ its order): the reading order is what
  `arrange()` computes from position and pin, so the stored array stays in
  creation order and the numbers are the curated positions. Moving renumbers
  the whole visible list — the legacy dance — so no ties are left for the
  date fallback to break in ways nobody chose, and the move buttons exist
  only in curated mode, where a position means something.
- New pieces derive their address from the title like the legacy screen did
  (`untitled`, `untitled-2` when taken), the settings' `slug` is preserved
  rather than accepted — the public route is fixed at /writing — and
  scheduled pieces keep the legacy predicate: `isLive()` at read time, no
  cron to promise and none needed.
- Additions the legacy screen could not make, in the established spirit: the
  web address is editable at all (it was title-derived and frozen, so two
  "Untitled" pieces could share one and the second was unreachable), duplicate
  addresses are refused at save, and a piece's blocks get the same
  visible/hidden and move controls pages have. Dates stay exactly as
  unfrozen as before — `publishedAt` and per-piece SEO are fields the legacy
  editor never wrote, and this slice still does not invent them; the
  writing-SEO backlog item owns that.

Still legacy (next slices): navigation, integrations, help.

Verified live (browser tools and the authenticated backup endpoint):
anonymous 307 on `/admin/writing` with `?next=`, and authed HTML with the
seeded settings (label "Blog", section off) and an empty list. Then the
round trips: settings switched on, renamed, reordered and date-showing
stored as typed; two pieces created, one moved above the other in curated
mode with both `sortOrder`s renumbered; a scheduled piece kept its date; the
address field refused a duplicate with the writing-voice message while the
action refused it too; a pin flipped the reading order; both pieces deleted
with the armed confirmation and the settings restored to the seed. Pages was
re-checked through the shared editor — the seeded page still renders its
three blocks and the palette, and a local move without Save left the draft
untouched. The seed never had a `writing` key, so the draft ends with an
empty list; `published.json` byte-identical throughout and the media library
untouched.

### Slice 10 — landed 2026-10-18

The header menu, at its unchanged address:

- `/admin/navigation` — a trunk reading the draft and a slice-8
  `CollectionEditor` island carrying the legacy screen's one list: label,
  path, visible, move, remove. It saves through the same `saveCollection` the
  collections use, so the whole menu is one revision-checked write and the
  list as displayed is the list as stored.
- The "no such page" warning stops being a frozen list. The legacy screen
  warned for anything outside five hardcoded routes, so a link to a built
  page, a project, or a case study — addresses the site really serves — read
  as a mistake. The port derives the known addresses from the draft: the
  fixed routes, built pages, work, case studies, and the writing section
  while it is on. Query strings and fragments are set aside before the
  check, so `/about#team` is not a typo, and an empty address gets its own
  notice instead of passing for the homepage.
- The slice-9 controls finish moving in. `Field`, `SelectField` and
  `CheckField` now live only in `_components/form-fields.tsx`, and the nine
  collection builders import them from there the way the pages and writing
  editors already did; the collection editor keeps the shell.

Still legacy (next slices): integrations, help.

Verified live (browser tools and the authenticated backup endpoint):
anonymous 307 on `/admin/navigation` with `?next=`, and authed HTML with the
four seeded links server-rendered in order and warning-free; the eleven
screens whose imports moved to `form-fields` all still render. Then the round
trip: a link added at the top, label and address typed, moved below Work with
the order showing on screen. The address warning was checked all three ways —
`/nope` listed the addresses derived from this draft (the five fixed routes,
the built page, the four projects, the three case studies, and no `/writing`
while the section is off), an empty address said so instead of passing for
the homepage, and a real one went quiet. The save stored the five in the
displayed order with `sortOrder` renumbered 1–5; Work was hidden (badge on
the card, `visible: false` on disk), then the added link was deleted with the
armed confirmation and Work restored, and the seed is back as it was — same
four links, same ids, same order, all visible. `published.json`
byte-identical throughout, and the public home page still serves the seed
header links.

### Slice 11 — landed 2026-10-18

The services screen, at its unchanged address:

- `/admin/services` — a server-rendered trunk plus one island, carrying the
  legacy screen's interaction exactly: a card per service, all of them
  described by the definition registry, expanded to show the free-tier note,
  what breaks without it, the numbered setup, and the fields — then Save,
  Test, Disconnect. The legacy screen's twenty-fifth-service promise holds:
  nothing here knows a service's name.
- The writes stay on `/api/admin/integrations`. That endpoint is where a
  secret is handled (encrypted at rest, returned as a hint and never as a
  value), where tests are rate-limited because they reach a host the caller
  chose, and where the demo refusal lives. Moving those judgments into server
  actions would have duplicated the one path that must not drift while the
  legacy mount still calls it. What the port shared instead is the read:
  `core/integrations/views.ts` is now the single projection both the endpoint
  and the trunk speak, so the two cannot describe a service differently.
- Services are sorted by id in that projection. The registry remembers
  registration order, and a definition registers the first time its module is
  evaluated — `analytics.ts` imports the umami and plausible definitions for
  their script helpers, so which file wins depends on the bundle that happens
  to load first. The screen and the endpoint had already begun to disagree,
  in the same dev server, about the order of the same five services.
- Disconnect asks once before clearing stored settings, the same shape as
  every other destructive button in this admin. A save without a vault shows
  the refusal inside the card instead of in a toast nobody reads, and the
  password fields carry `autoComplete` themselves — `new-password` on the
  password, `off` on the rest — replacing the legacy MutationObserver that
  patched the same attributes in after React rendered. That needed `Field` to
  accept optional `type` and `autoComplete`; the services screen is the only
  caller that wants anything but text.
- A new `core/integrations/__tests__/views.test.ts` pins the projection:
  every service described, a stored secret present only as its hint and
  absent from `JSON.stringify`, and env-configured services marked as such.

Still legacy (next slices): help.

Verified live (browser tools, the endpoint and the raw config file):
55 HTTP checks — anonymous 307 with `?next=%2Fadmin%2Fservices`, anonymous
API 401, authed 200 with the heading, five collapsed cards all reading "Not
set", the vault warning and the form's `autoComplete` server-rendered; the
endpoint answering the legacy shape with the five services in the stable
order and no secret hints; all 28 admin screens 200; the public home page 200. Then the browser round trip on the clean seed: three Test paths on the
Giscus card — an unusable value named the field, a nonexistent repository
came back with GitHub's 404 branch, the real repository with the success
branch; Save stored it (badge "On", Disconnect appearing, plaintext on disk
where no secret is involved); Disconnect armed with its warning and Cancel
restored it, then the confirm cleared the namespace back to `{}`. On the SMTP
card, a vault-less Save showed the OPB_SECRET_KEY refusal in the card and
wrote nothing. Dev has no vault, so a temporary `OPB_SECRET_KEY` was set to
exercise the secret path: Save stored the password as `v1.*` ciphertext on
disk, the reloaded screen showed the field empty with `••••ter2 — leave blank
to keep` in its placeholder, and saving a port change with the field
untouched updated the port and left the ciphertext byte-identical. The key
was removed, the dev server restarted without it, and `kv-config.json` is
`{}` again with `published.json` at `07f0f97f67ba7d83` throughout. Gates:
typecheck; lint 0 errors, 121 warnings (119 pre-slice-9 baseline plus one per
new page); format:check; 992 tests passed, 11 skipped over 69 files (the
three view tests are new); build with `/admin/services` in the route table.

### Slice 12 — landed 2026-10-18

The help screen, at its unchanged address — the last legacy screen:

- `/admin/help` — a server-rendered trunk plus one island, carrying the same
  three answers the legacy screen had: report something broken, ask for
  something new, see what changed. Everything that does not need the network
  is server-rendered by calling the same core helpers the support endpoint
  calls — version, storage backend, host, content counts — so the page and the
  endpoint cannot describe the site differently, and the forms are in the
  first byte rather than after a client fetch.
- The update check stays in the browser, deliberately, exactly as the legacy
  screen had it: it is an unauthenticated call to GitHub that can take its
  full eight-second timeout on a server with no route out, and the one page
  somebody opens to report a problem should not hang on a request it does not
  need.
- The interactions stay on the existing endpoints —
  `/api/admin/support/search`, `/connect`, `/submit` — where the rate limits,
  the device flow and the server-side body composition already live. The port
  adds no second path to GitHub.
- The "recent errors" switch is no longer guaranteed empty. The legacy module
  exported `startCollectingErrors` and nothing in the codebase ever called it,
  so its ring buffer could only ever hold nothing. `error-log.ts` is ported,
  and `error-collector.tsx` mounts it once in the protected layout, so the
  buffer sees errors from every screen walked through in the session — which
  is the list the switch describes. `CheckField` grew an optional `disabled`
  for the switch that has nothing to offer yet.

Still legacy (next slices): none — every screen now has an App Router home,
and the mount and `src/admin/**` were deleted the same day; see the
kill-criteria section below.

Verified live (browser tools, the endpoints and the state files): 76 HTTP
checks — anonymous 307 with `?next=%2Fadmin%2Fhelp`, all five support
endpoints 401 anonymous, the authed page server-rendering its sections,
records, fields, toggles and the diagnostics preview with the same facts the
endpoint reported, the update line left as "Checking for the latest version…",
the no-GitHub-application fallback, search answering 200 with a matches array,
submit refusing 502 with "No GitHub account is connected.", all 29 admin
screens 200, the public home 200, and `published.json` `07f0f97f67ba7d83`
with `kv-config.json` `{}` untouched throughout. Then the browser round trip:
the island fetched updates and the screen said "You are on the newest version
(0.5.0)"; the diagnostics preview gained its Browser/Screen/Language rows
after mount; filling the bug record enabled the send button and fired the
debounced search POST (no matches shown when GitHub finds none); a trusted
Enter on the focused button opened the real pre-filled issue tab, whose
`return_to` carried the title, the body, the diagnostics `<details>` block
and `labels=bug,from-admin`; Clear emptied the record and disabled the button
again; the toggles hid and restored the preview; and the collector check —
soft-navigating to the dashboard, dispatching one error, soft-navigating back
— had the switch reading "1 error recorded in this session." and the preview
carrying that error, which is the thing the legacy collector never did. Zero
console errors. Gates: typecheck; lint 0 errors, 123 warnings (121 before
this slice plus the one each new page and island carry); format:check; 992
tests passed, 11 skipped over 69 files; build with `/admin/help` in the route
table — reached on the second attempt, for a reason worth knowing: Google
Fonts answers a family's stylesheet with extensionless `/l/font?kit=…` URLs
every so often (roughly 1–2% of responses; upstream `vercel/next.js#99114`),
Turbopack 16.3 cannot parse those, and once one lands in `.next` every later
build replays it. Thirty-four catalogue families means each fresh build is a
dice roll; when it loses, delete `.next` and build again.

### Kill criteria — landed 2026-10-18

The old shell is gone: `app/admin/[...slug]/` (the route, the `ssr:false`
wrapper and the React Router app) and all of `src/admin/**`. Three of the four
sequencing items closed with it:

- **Last `react-router-dom` import deleted** — and the dependency with it
  (`npm uninstall`, lockfile included). The ESLint block that restricted new
  imports of it had nothing left to guard, so it is retired.
- **`ssr: false` mount deleted** — with the mount went the last client-only
  admin route; every admin URL is server-rendered inside `(protected)` now.
- **`motion` stays** — it was never the legacy shell's; the public site uses
  `motion/react` throughout.

The fourth item, the Tailwind 4 re-evaluation, landed 2026-10-18 — the port
is verified on the `tailwind4-attempt` branch; only the Safari 16.4+ product
call remains (issue #9).

Two modules were still in use by the new tree and moved verbatim instead of
dying with it:

- `welcomeDismissed.ts` → `app/admin/(protected)/_components/welcome-dismissed.ts`
  — the skip preference, read by the welcome gate and written by the wizard.
- `PushNotifications.tsx` → `app/admin/(protected)/_components/push-notifications.tsx`
  — the inbox buzz button. It is the last Astryx component in the product and
  renders with the kit's built-in defaults (the `data-astryx-theme` scope
  lived on the deleted `AdminSurface`), which is exactly how it already
  rendered inside the new shell. **Ported to plain Tailwind on 2026-10-18**,
  which retired `@astryxdesign/*`, the orphaned `@stylexjs/stylex` and the
  global CSS imports in `app/layout.tsx` with it.

`src/styles/admin-theme.css` went too — its `.admin-ui` rules only ever
matched the deleted surface. `src/context` and `src/views` stay: the public
site still imports them.

Three checks moved with the deletion. `server-content-wins.test.ts`'s "leaves
the admin alone" assertion became a scan asserting the CMS provider is mounted
in exactly one place (`app/(site)/providers.tsx`), because no admin code
touches the CMS context any more. `admin-links.test.ts` — the guard against
React Router basename-relative hrefs — died with its subject. The route-guard
AST test needed no change: it already walked `app/admin/**/_actions`.
Housekeeping found on the way: `-X`, a header-only curl cookie jar accidentally
committed during the Phase A–D work, is deleted from the repo root.

Verified after the kill: gates green — typecheck; lint 0 errors with 81
warnings (the deleted screens carried 42); format:check; 984 tests passed, 11
skipped over 66 files; build green. The 76-check HTTP script re-ran green (all
29 admin screens 200, API guards 401 anonymous, `published.json` and
`kv-config.json` byte-identical throughout). Live routing: an authenticated
unknown `/admin/*` path now answers 404 where the catch-all used to render, and
a signed-out one still bounces to `/admin/login?next=…`; `/admin/login` and
`/admin/reset` serve 200 anonymously from the public shell; and in the browser
the messages screen still mounted the push island, zero console errors.

## Explicitly not in the rewrite

- Multi-tenancy, roles, white-labeling — see `docs/AGENCY-EVALUATION.md`.
  The guard stays single-owner; the rewrite changes _where_ the check runs,
  not _who_ it checks for.
