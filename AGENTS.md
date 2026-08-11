# Working in this repository

Start with **[docs/PLAN.md](docs/PLAN.md)** — it records what is built, what is
verified, and what only looks finished. Its handoff section lists the things
that cost someone time to learn.

The five that bite hardest:

- **Test with `npm ci`, not `npm install`.** A populated `node_modules` hides
  peer-dependency conflicts. This exact mistake merged a broken bump into `main`.
- **Never derive an authorization decision from a request header.** A
  `Host: localhost` check in the claim flow was a real auth bypass. Environment
  variables and cookies only.
- **ESLint 9, TypeScript 5 and Tailwind 3 are pinned on purpose.** Dependabot
  will keep proposing bumps; see the handoff notes before taking one.
- **Admin paths are router-relative.** The old admin runs under
  `basename="/admin"`, so `to="/admin/login"` resolves to `/admin/admin/login`.
- **No personal or client content, ever.** `npm run check:personal-data` runs in
  CI. Demo content must be fictional, yours, or CC0.

Verify before claiming anything works:

```bash
npm run typecheck && npm run lint && npm run format:check && npm run test && npm run build
```

Claims in this repository are expected to be backed by something you ran. If it
is only in the DOM after hydration, it is not server-rendered — `curl` the route
and grep the HTML.

The admin's component kit has its own rules in
[.claude/CLAUDE.md](.claude/CLAUDE.md).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
