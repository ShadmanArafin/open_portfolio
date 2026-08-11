<div align="center">

# Open Portfolio Builder

**A self-hosted portfolio site with a visual editor built in.**
Change any word, image or colour from an admin panel — no code, no redeploy,
and your content stays in your own database.

[![CI](https://github.com/ShadmanArafin/open_portfolio_builder/actions/workflows/ci.yml/badge.svg)](https://github.com/ShadmanArafin/open_portfolio_builder/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Deploy your own](#deploy-your-own) · [Run it locally](#run-it-locally) ·
[Choose a backend](#choose-a-backend) · [Contributing](CONTRIBUTING.md) ·
[Roadmap](#roadmap)

</div>

---

Built for people who need a portfolio but should not have to learn a framework
to keep one: students, designers, developers, photographers, writers.

> [!WARNING]
> **Status: alpha (0.5).** The site, the editor and publishing all work, and the
> admin has real server-side authentication. But there is no blog and only one
> visual theme. Read [What does not work yet](#what-does-not-work-yet) before
> using this for anything you depend on.

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShadmanArafin%2Fopen_portfolio_builder&project-name=my-portfolio&repository-name=my-portfolio&env=OPB_SETUP_TOKEN&envDescription=Invent+any+long+phrase.+You+will+be+asked+for+it+once%2C+to+prove+the+site+is+yours.&envLink=https%3A%2F%2Fgithub.com%2FShadmanArafin%2Fopen_portfolio_builder%23what-happens-on-first-run&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22neon%22%2C%22productSlug%22%3A%22neon%22%2C%22protocol%22%3A%22storage%22%7D%2C%7B%22type%22%3A%22blob%22%2C%22access%22%3A%22public%22%7D%5D)

Vercel copies this repository into your own GitHub account, provisions a free
Neon Postgres database and a Blob store for your images, and asks you to invent
one setup phrase. Then open your new site, claim it with that phrase, and answer
four questions.

No keys to find, nothing to install. The database connection string and the blob
token are set for you and you never see either.

> If the button ever stops provisioning them, deploy anyway and add **Neon** and
> **Blob** from your project's Storage tab. The app uses whichever backend's
> environment variables are present, so nothing else changes.

## Run it on your own server

One command, on any machine with Docker. No account anywhere, no platform that
can change its terms, and nothing that phones home.

```bash
docker compose up
```

Open <http://localhost:3000> and follow the setup. That brings up the app and a
Postgres database together; change `OPB_SETUP_TOKEN` and `OPB_SECRET_KEY` in
`docker-compose.yml` first.

Just the app, against a database you already have:

```bash
docker build -t open-portfolio-builder .
docker run -p 3000:3000 -v opb-data:/data   -e OPB_POSTGRES_URL="postgres://…"   -e OPB_SETUP_TOKEN="a long phrase you invent"   -e OPB_SECRET_KEY="a different long phrase"   open-portfolio-builder
```

**The volume matters.** `/data` is where uploads and — if you are not using a
database — your content live. Without it, replacing the container deletes your
site. With it, you can throw the container away and rebuild it as often as you
like: that is exactly what updating does, and your content is untouched.

## Run it locally

Node 20.9 or newer. No account, no API key, nothing to sign up for.

```bash
git clone https://github.com/ShadmanArafin/open_portfolio_builder.git
cd open_portfolio_builder
npm install
npm run dev
```

Open <http://localhost:3000>. You will be sent to `/setup` to claim the site.
Content is stored under `.opb/` — delete that folder to start over.

## What happens on first run

1. **Claim the site at `/setup`.** You give an email and a passphrase, and that
   becomes the only account that can edit it. On a public host you also enter
   your `OPB_SETUP_TOKEN`, which is what stops a stranger who finds the URL
   before you from taking ownership.
2. **Answer four questions.** Your name and what you do, the kind of work you
   show, a colour, then publish. The second question renames sections to
   language that fits your field — a photographer gets _Portfolio_ and _Brands
   I've shot for_ where a developer gets _Projects_ and _Stack_. It changes
   wording only, so nothing you have written can be lost by it.
3. **You have a live site.** Demo projects stay as examples until you replace
   them, and the dashboard lists whatever is still unfinished with a link to the
   screen that fixes it.

Every step is skippable. None of it is permanent.

## Features

- **Everything on the page is editable.** Work, case studies, clients,
  experience, education, process, capabilities, testimonials, navigation,
  footer, microcopy, typography, colours and SEO all live in a content store
  rather than in the code.
- **Draft and publish.** Edits save as you type into a draft. The live site keeps
  showing the published version until you publish, and a docked preview shows
  the draft on desktop, tablet and mobile frames.
- **Real SEO.** Every page is server-rendered with its own title, description,
  Open Graph and Twitter tags. `sitemap.xml` and `robots.txt` are generated from
  your content.
- **Version history.** Every publish snapshots the content and any version can be
  restored. Capped at 20 so storage stays flat.
- **A dashboard that tells you what is missing.** Sixteen checks over the
  published content — work still in draft, missing images, a meta description
  outside the length search engines show, unanswered enquiries — each linking to
  the screen that fixes it.
- **Your data, your database.** Pick a backend or let the deploy button provide
  one. Export everything as a single JSON file at any time.

## Choose a backend

| Backend                 | Free tier                 | Works on Vercel/Netlify | Best for                                                           |
| ----------------------- | ------------------------- | ----------------------- | ------------------------------------------------------------------ |
| **Local filesystem**    | free forever, no account  | no                      | trying it out, a VPS, Docker, a Raspberry Pi                       |
| **Supabase**            | 500MB database, 1GB files | yes                     | one account for everything; free projects pause after ~1 week idle |
| **Neon + Vercel Blob**  | 0.5GB database, 1GB blob  | yes                     | deploying on Vercel; resumes instantly after idling                |
| **Postgres (any host)** | depends on your host      | no                      | Railway, Render, Fly, Coolify, or a database you already run       |

You do not choose in advance. Whichever service's environment variables are
present is the one that gets used, so provisioning a database is the only step.
See [.env.example](.env.example).

Adding another backend is one file implementing `StorageAdapter`, one line in the
registry, and a green run of the conformance suite — 21 tests covering
round-tripping, concurrent writes, expiry, namespace isolation, and the rule that
auth state never travels inside a content export.

## What does not work yet

Being direct about this, because the gaps are structural and you should not
discover them after typing in a portfolio:

- **Email is optional; without it there is no notification and no reset.**
  Enquiries always reach your inbox inside the admin. Configure SMTP (see
  [.env.example](.env.example)) and the owner is also emailed when one
  arrives, and a forgotten passphrase can be reset from `/admin/login` instead
  of deleting the owner record. There is still no OTP.
- **Uploads have not been run against the hosted object stores.** Uploading now
  goes through the server into whichever backend is configured, and is verified
  end to end on the local filesystem backend. The same code path drives Supabase
  Storage and Vercel Blob, and the storage conformance suite covers both, but
  neither has yet been run against the live service with real credentials.
- **No blog, no page builder, one theme.** All planned; none built.
- **The admin is the old component kit.** It works, but it is being rebuilt on
  shadcn/ui.

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** for the public site, with colour and typography driven by CSS
  variables the editor writes at runtime
- **Pluggable storage** behind a `StorageAdapter` interface — local filesystem,
  Supabase, Neon + Vercel Blob, or any Postgres
- **scrypt + httpOnly session cookies** for admin authentication
- **Vitest**, including a storage conformance suite run against a real Postgres
  in CI

## Roadmap

| Version       | What lands                                                                       |
| ------------- | -------------------------------------------------------------------------------- |
| 0.1           | Open-source groundwork: MIT licence, no personal data, lint and CI               |
| 0.2           | Next.js App Router, server rendering, SEO, Open Graph, sitemap, real 404         |
| 0.3           | Server-side auth, publishing that reaches visitors, a contact form that delivers |
| 0.4           | Pluggable storage with a conformance suite every backend must pass               |
| **0.5 (now)** | One-click deploy, first-run wizard, profession vocabulary packs                  |
| 0.6           | Design tokens, six themes, Tailwind 4                                            |
| 0.7           | Admin rebuilt on shadcn/ui, media picker, block and page builder                 |
| 0.8           | Remaining backends, integrations registry, email                                 |
| 0.9           | Blog, newsletter capture, full profession presets                                |
| 1.0           | Stable                                                                           |

Detailed status for every phase, including what is verified and what is not, is
in **[docs/PLAN.md](docs/PLAN.md)**.

## Contributing

Contributions are welcome — especially bug reports from actually using the admin,
accessibility fixes, and interface copy that stops assuming the user is a
designer.

Two rules worth reading before you start: **no personal or client content in the
repository** (demo content must be fictional, yours, or CC0), and **no secrets in
the client bundle**.

- **[CONTRIBUTING.md](CONTRIBUTING.md)** — setup, conventions, DCO sign-off
- **[docs/PLAN.md](docs/PLAN.md)** — architecture, phase status, handoff notes
- **[ADMIN_SETUP.md](ADMIN_SETUP.md)** — using the editor
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)**
- **[SECURITY.md](SECURITY.md)** — report vulnerabilities privately, never as an issue

## Licence

[MIT](LICENSE). Use it, fork it, sell what you build with it.

Demo assets in `public/demo/` are CC0 and depict invented companies — see
[public/demo/LICENSE.md](public/demo/LICENSE.md).
