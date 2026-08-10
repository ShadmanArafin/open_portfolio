# Open Portfolio Builder

A self-hosted portfolio site with a visual editor built in. Change any word,
image or colour from an admin panel — no code, no redeploy, and your content
stays yours.

Built for people who need a portfolio but should not have to learn a framework
to keep one: students, designers, developers, photographers, writers.

> **Status: alpha (0.3).** It runs, the public site is properly
> server-rendered, the editor works, and the admin now has real
> authentication. Read
> [What does not work yet](#what-does-not-work-yet) before using it for
> anything real.

## Running it

Node 20 or newer. No account, no API key, nothing to sign up for.

```bash
git clone https://github.com/ShadmanArafin/open_portfolio_builder.git
cd open_portfolio_builder
npm install
cp .env.example .env.local   # then set your own passcode
npm run dev
```

- Public site: http://localhost:3000/
- Admin: http://localhost:3000/admin

The site ships with fictional demo content so nothing looks empty on first run.
Replace it from the admin, or delete it.

## What it does today

**Everything on the page is editable.** Work, case studies, clients, experience,
education, process, capabilities, testimonials, navigation, footer, microcopy,
typography, colours and SEO fields all live in a content store rather than in
the code.

**Draft and publish.** Edits save as you type into a draft. The live site keeps
showing the published version until you publish, and a docked preview shows the
draft on desktop, tablet and mobile frames.

**Version history.** Every publish snapshots the content and any version can be
restored. Capped at 20 so storage stays flat.

**Media.** Images and PDFs are stored as blobs and referenced by id, so nothing
depends on a file path you have to remember.

**A dashboard that tells you what is missing.** Sixteen checks over the
published content — work still in draft, missing images, a meta description
outside the length search engines show, no share image, missing alt text,
unanswered enquiries — each linking straight to the screen that fixes it.

**Export and import.** One JSON file containing the content and the media. This
is your backup and the way to move between machines.

## Choose your backend

| Backend                | Free tier                 | Works on Vercel/Netlify | Best for                                                                |
| ---------------------- | ------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| **Local filesystem**   | free forever, no account  | no                      | trying it out, a VPS, Docker, a Raspberry Pi                            |
| **Supabase**           | 500MB database, 1GB files | yes                     | one account for everything; note free projects pause after ~1 week idle |
| **Neon + Vercel Blob** | 0.5GB database, 1GB blob  | yes                     | deploying on Vercel; resumes instantly after idling                     |

You do not have to choose in advance. Whichever service's environment variables
are present is the one that gets used, so provisioning a database is the only
step. See [.env.example](.env.example).

Adding another backend is one file implementing `StorageAdapter`, one line in
the registry, and a green run of the conformance suite — 21 tests covering
round-tripping, concurrent writes, expiry, namespace isolation, and the rule
that auth state never travels inside a content export.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5.5**
- **Tailwind 3.4** for the public site, with typography and colour driven by CSS
  variables the editor writes at runtime
- **[Astryx](https://astryx.atmeta.com)** for the admin panel
- **Pluggable storage** behind a `StorageAdapter` interface — local filesystem,
  Supabase, or Neon + Vercel Blob
- **scrypt + httpOnly session cookies** for admin authentication
- **React Router** still drives the admin, mounted inside one Next route —
  transitional, and removed when the admin moves to shadcn/ui

## What does not work yet

Being direct about this, because the gaps are structural rather than cosmetic
and you should not discover them after typing in a portfolio:

- **The hosted backends are new.** Supabase and Neon are implemented and pass
  the conformance suite's database tests against a real Postgres in CI, but
  neither has been run against the live services yet, so treat 0.4 as
  experimental if you use one. Firebase, Convex, Cloudflare, PocketBase and
  Appwrite are not built.
- **No email.** Enquiries reach your inbox in the admin, but nothing is emailed
  to you yet.
- **No blog, no page builder, no themes.** Later releases.
- **No password reset.** If you forget your passphrase, delete
  `.opb/state/owner.json` and claim the site again.

**Fixed in 0.3:** publishing now actually publishes — the admin sends your
content to the server and visitors see it. The contact form delivers to your
inbox instead of writing into the sender's own browser. And the admin has real
authentication: a passphrase hashed with scrypt, an httpOnly session cookie the
browser cannot read, rate limiting, and cross-site request rejection. The
passcode that used to sit in the public JavaScript bundle is gone.

**Fixed in 0.2:** every page is now server-rendered with its own title,
description, Open Graph and Twitter tags drawn from your SEO settings — that
screen previously saved to fields nothing read. Project and case-study pages are
statically pre-rendered, `sitemap.xml` and `robots.txt` are generated from your
content, and an unknown URL returns a real 404 instead of silently redirecting
to the homepage.

## Roadmap

| Version   | What lands                                                                                    |
| --------- | --------------------------------------------------------------------------------------------- |
| 0.1       | Open-source groundwork: MIT licence, no personal data, lint and CI, demo content              |
| 0.2       | Next.js App Router, server rendering, working SEO, Open Graph, sitemap, real 404              |
| 0.3       | Server-side auth, publishing that reaches visitors, a contact form that delivers              |
| 0.4 (now) | Pluggable storage: local, Supabase and Neon, with a conformance suite every backend must pass |
| 0.5       | Remaining backends — Firebase, Convex, Cloudflare, PocketBase, Appwrite                       |
| 0.6       | One-click deploy, first-run setup wizard, profession presets                                  |
| 0.7       | Block and page builder, six themes, deep design tokens                                        |
| 0.8       | Blog, newsletter capture, integrations                                                        |
| 1.0       | Stable                                                                                        |

## Deploying

`npm run build` produces a standard Next.js build, so it deploys as-is to
Vercel, Netlify or Cloudflare with no configuration. The SPA rewrite files the
old client-routed build needed are gone — routing is handled by the framework
now.

On first visit you will be sent to `/setup` to claim the site: pick an email
and a passphrase, and that becomes the only account that can edit it. Set an
`OPB_SETUP_TOKEN` environment variable before deploying — the claim form
requires it in any production build, so a stranger who finds the URL before you
cannot take ownership.

## Contributing

Contributions are welcome, especially bug reports from actually using the
admin, accessibility fixes, and interface copy that stops assuming the user is a
designer. See [CONTRIBUTING.md](CONTRIBUTING.md).

Two rules worth reading before you start: **no personal or client content in the
repository** (demo content must be fictional, yours, or CC0), and **no secrets
in the client bundle**.

- [CONTRIBUTING.md](CONTRIBUTING.md) — setup, conventions, DCO sign-off
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md) — report vulnerabilities privately, never as an issue
- [ADMIN_SETUP.md](ADMIN_SETUP.md) — using the editor, and the constraints that are load-bearing

## Licence

[MIT](LICENSE). Use it, fork it, sell what you build with it.

Demo assets in `public/demo/` are CC0 and depict invented companies — see
[public/demo/LICENSE.md](public/demo/LICENSE.md).
