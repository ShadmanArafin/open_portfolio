# CLAUDE

Project-specific guidance for AI coding agents.

## The admin's UI kit

The admin is **plain Tailwind 3 utilities over the site's CSS variables**. There
is no component library: the last Astryx component was ported on 2026-10-18
(`docs/ADMIN-REWRITE.md`) and `@astryxdesign/*` left `package.json` with it. Do
not add one back.

Read `app/admin/(protected)/services/page.tsx` and `.../newsletter/page.tsx`
before writing a screen. `app/admin/(protected)/_components/` holds the shared
pieces, and `messages/message-actions.tsx` is the shape of a client island.

- **Tokens, never literals.** `text-text-primary`, `text-text-secondary`,
  `text-text-muted`, `border-border`, `bg-surface-secondary`, `bg-bg-secondary`.
  No hex, no `text-gray-500`, no `p-[13px]`.
- **The page frame** is
  `<div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>`. Its
  heading is the eyebrow line
  `<p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">`
  then `<h1 className="font-display m-0 mt-1 text-3xl">`.
- **Every `<p>` in this directory carries `m-0`**; supporting copy under a
  heading is `<p className="m-0 text-sm text-text-secondary">`.
- **A card** is `grid gap-3 rounded-2xl border border-border p-4` with one
  `<h2 className="m-0 text-xl">`.
- **Touch targets are ≥44px**: buttons and links in client islands get
  `style={{ minHeight: 44 }}`. Inline text links are exempt.
- **Server first.** A server component renders the screen; `'use client'` is
  one interaction, talking to a server action or an endpoint rather than to the
  database.
- **Route handlers and server actions call `requireOwner()` themselves** — the
  layout guard does not reach them, and no authorization decision may come from
  a request header.

If a file, screen or doc you meet still talks about Astryx, `AppShell`, `VStack`
or an `astryx` CLI, it is stale — fix it rather than following it.
