# App Router admin rewrite — plan (Phase D)

> Status: planned, not started. This document is the Phase D deliverable for
> the rewrite item: the sequencing, the guard design and the completed
> prerequisites. The twenty-screen migration itself is post-1.0 work and is
> tracked here, not hidden.

## Why

The admin is one client-side React Router app inside a single Next.js route
(`app/admin/[[...slug]]/admin-mount.tsx`, `ssr: false`) with ~25 lazy
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

## Explicitly not in the rewrite

- Multi-tenancy, roles, white-labeling — see `docs/AGENCY-EVALUATION.md`.
  The guard stays single-owner; the rewrite changes _where_ the check runs,
  not _who_ it checks for.
