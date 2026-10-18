# Editing your portfolio without touching code

Everything on the site — text, projects, case studies, images, colours, navigation — is edited
from the admin panel at `/admin`. You do not need to change any files to update content.

---

## 1. Running it locally

```bash
npm install
npm run dev
```

- Public site: http://localhost:3000/
- Admin panel: http://localhost:3000/admin

Nothing to sign up for and no keys to find. With no database configured, content is stored on
disk under `.opb/` — delete that folder to start over from a fresh install.

### Signing in

The first time you open the site you are sent to `/setup` to claim it. You choose
an email and a passphrase there, and that becomes the only account that can edit
the site. Nobody else can claim it afterwards.

There is nothing to put in a file. The passphrase is hashed with scrypt and
stored by whichever backend you are using; the session is an httpOnly cookie the
browser cannot read.

On a public host you must set `OPB_SETUP_TOKEN` to any long random string before
deploying. The claim form asks for it, which is what stops a stranger who finds
your URL first from taking ownership. `npm run dev` does not need it.

**If you forget your passphrase**, click **Forgot your passphrase?** on the
sign-in screen and enter your email. If SMTP is configured (see
[.env.example](.env.example)), a link is emailed to the owner's address —
it works once, expires after 30 minutes, and signs out every other session the
moment it's used.

Without SMTP configured there is no reset yet: delete the owner record and
claim the site again — `.opb/state/owner.json` on the local backend, or the
`opb_owner` row on a database backend. Your content is untouched either way.

## 2. How editing works

1. Open a screen in `/admin` and type. **Changes save automatically** — there is no Save button.
2. What you type is a **draft**. Visitors still see the previously published version.
3. Click **Preview** in the top bar to see the draft rendered in a live panel beside the editor.
4. Click **Publish Live** when you're happy. The button tells you what changed and stays
   disabled when there's nothing to publish.

Version history at `/admin/history` keeps the last 20 published snapshots, and you can restore
any of them into your draft.

---

## 3. Where content lives

Two places, and the split is the thing worth understanding.

**Published content is on the server**, in whichever backend you configured — the local
filesystem, Supabase, Neon, or any Postgres. Clicking **Publish Live** writes a snapshot there
and clears the cached pages, so what visitors see changes within seconds. This is what makes the
button mean what it says.

**Your draft is in this browser**, in IndexedDB, in this browser profile. Nothing you have typed
but not published exists anywhere else yet.

That means:

- Published changes are live for everyone, with no rebuild and no deploy.
- **Unpublished drafts are not.** Editing from a second computer starts from the published
  version, not from the draft you left open elsewhere.
- Clearing site data for this origin discards your unpublished draft. Published content is
  unaffected.

**Uploads go straight to the server**, not into the draft. An image is stored in your backend
the moment you add it and referenced as `/api/media/<key>`, which is why it appears for visitors
once the content around it is published. Files are accepted on their contents rather than their
name, so an HTML page renamed `.pdf` is refused, and SVG is refused outright — a browser runs
any script inside an SVG as though you had written it yourself.

`/admin/settings` → **Export Content** downloads one `.json` file containing all text and every
uploaded image, which is your backup and the way to move everything to another install.
**Import Bundle** restores it.

---

## 4. What's on each screen

| Screen                 | What it controls                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard              | What is still unfinished, each item linking to the screen that fixes it.                                                           |
| Analytics              | Enquiry counts from your own database, plus audience figures once a provider is connected.                                         |
| Homepage               | Order and visibility of homepage bands; their headings and buttons. Also the headers for the Work, Case Studies and Contact pages. |
| Selected work          | Projects: copy, images, metadata, live URL. Drives the homepage cards, `/work` and `/work/:slug`.                                  |
| Case studies           | The long-form stories, including research, wireframes, decisions and outcomes.                                                     |
| Brands                 | Logo strip on the homepage.                                                                                                        |
| Experience / Education | The two timelines.                                                                                                                 |
| Process steps          | The numbered "How I work" list.                                                                                                    |
| Capabilities           | Skill groups.                                                                                                                      |
| Recommendations        | Testimonials.                                                                                                                      |
| Visual explorations    | The image gallery on the About page.                                                                                               |
| Media library          | Every uploaded image and PDF. Uploading a PDF also sets it as the downloadable résumé.                                             |
| Messages               | Enquiries submitted through the contact form.                                                                                      |
| Newsletter             | The sign-up box on your site, and the addresses collected. Exports as a CSV. Sending needs a mail server connected under Services. |
| Navigation             | Links in the header. Warns if a link points at a page that doesn't exist.                                                          |
| Footer & social        | Copyright line, oversized footer word, social cards.                                                                               |
| Microcopy              | Every short string — buttons, labels, confirmations. Searchable.                                                                   |
| Appearance             | Six colours — accent, background and stroke, per theme — and the Google Fonts. See section 5.                                      |
| SEO                    | Page title, meta description, share image.                                                                                         |
| General & backup       | Your name and contact details, the About story, and export/import/reset.                                                           |
| Version history        | The last 20 published snapshots, any of which can be restored into your draft.                                                     |
| Your site              | The public address to give people, and step-by-step for putting your own domain on it. Says plainly that a domain is not free.     |
| Where content lives    | Which backend is storing your site, whether it is answering, and how the alternatives compare. Explains rather than switches.      |

`src/data/` is **seed content only** — the demo projects and clients a fresh install starts with,
so the site is never an empty shell. Editing those files will not change an install that already
has content; use the admin, or Reset to Defaults.

---

## 5. Colours, and why you only pick six

The Appearance screen asks for an accent, a background and a stroke colour, for each of the two
themes. Everything else the site paints — card surfaces, secondary and muted text, hover states,
badge fills, the label colour on an accent-filled button — is generated from those six by
`core/theme/tokens.ts`, and rendered into the page on the server so the first paint is already
your palette rather than the built-in one.

Two rules hold for every generated value, and they are why the screen is small:

- **Foregrounds are derived, never asked for.** Pick a yellow accent and the text on your
  buttons goes dark; pick navy and it goes light. Nobody has to think about it.
- **Text is clamped to stay readable.** Anything that would fail WCAG's 4.5:1 against the
  surface it sits on is walked toward black or white until it passes. A colour you love but
  cannot read is the one mistake a person is least likely to catch in their own site, because
  they chose it precisely because they like looking at it.

## 6. How the admin is built

Plain **Tailwind** classes over the site's own CSS variables — no component
library, nothing to install, no CLI to learn.

- **Tokens, never literals:** `text-text-secondary`, `border-border`,
  `bg-surface-secondary`, `rounded-2xl`. `core/theme/tokens.ts` derives every
  colour from the six you pick on the Appearance screen and `app/layout.tsx`
  renders them on the server, so the admin paints itself in your palette
  rather than one shipped with the product.
- **Thumb-sized controls.** Buttons and links in the interactive islands are at
  least 44px tall; cards are `rounded-2xl border border-border p-4`.
- **Screens are server components.** A file marked `'use client'` is one
  interaction — a button, a form, the preview — and talks to a server action or
  an endpoint rather than to the database.

The full set of rules is in [.claude/CLAUDE.md](.claude/CLAUDE.md), and
`app/admin/(protected)/services/page.tsx` is a good page to copy.

Two notes for anyone touching styles:

- **Cascade layer order is load-bearing.** `src/styles/layers.css` declares it
  and is imported before any other CSS, so Tailwind's Preflight registers in a
  low layer and the app's own rules can override a browser default without
  `!important`.
- **Tailwind 3 is pinned on purpose**, one product call away from Tailwind 4.
  The port is done and verified on a branch; what is left is not technical —
  v4 requires Safari 16.4+, which decides who can see a site built with this
  (issue #9). See [docs/PLAN.md](docs/PLAN.md).

The admin is not indexed by search engines, and the draft preview runs in an
iframe — a separate document — so it always shows the site's own typography and
brand colour rather than the editor's.

Until 2026-10-18 the admin was built on the **Astryx** kit. It is gone: the
last component on it — the push-notifications island on /admin/messages — was
ported to the classes above, and `@astryxdesign/*` and the orphaned
`@stylexjs/stylex` left `package.json`. See
[docs/ADMIN-REWRITE.md](docs/ADMIN-REWRITE.md).

---

## 7. Going online

Push to any host that runs Node. The public site is server-rendered, so there is no SPA rewrite
to configure and no `/*` → `/index.html` rule to remember — a request for `/work/some-slug`
is a real request the server answers.

What you do need:

1. **`OPB_SETUP_TOKEN`**, any long random string, set before you deploy. Without it the claim
   form is closed in production — the site serves, but nobody can take ownership of it,
   including you. That is deliberate: an open claim form on a public URL is a race the owner
   can lose, and the only alternative evidence available is the `Host` header, which the caller
   chooses.
2. **A backend, unless you control the disk.** The local filesystem adapter is the default and
   is correct for a VPS, Docker or a Raspberry Pi. It refuses to run on Vercel, Netlify and
   Cloudflare, where the disk is discarded between deploys and your content would silently
   disappear. On those, add Supabase or Neon + Blob; the app uses whichever service's
   environment variables are present, so provisioning is the only step.

See [.env.example](.env.example) for every variable, and the
[Deploy your own](README.md#deploy-your-own) button for the one-click path.

## 8. Production build

```bash
npm run build     # type-checks and builds
npm run start     # serve the built output locally
```

Linting and tests are separate, and worth running before you push:

```bash
npm run lint && npm run format:check && npm run test
```

Testing a production build over plain HTTP on your own machine also needs
`OPB_ALLOW_INSECURE_COOKIES=1`, because the session cookie is otherwise marked `Secure` and the
browser will not send it back. Never set that on a public site.

## Analytics

The admin has an **Analytics** page. The enquiry half is exact — those numbers come from the
contact form straight into your own database. The audience half is empty until you connect a
provider, because counting visitors means recording something on every page view, and this
project deliberately records nothing about your visitors unless you ask it to.

The site is already instrumented. These fire on the public site the moment a
provider is configured, and are never sent from `/admin` or the draft preview:

| Event               | Fires when                                                               |
| ------------------- | ------------------------------------------------------------------------ |
| `pageview`          | Any route change (the provider script only sees the first load in a SPA) |
| `Project viewed`    | A project page opens — carries `slug` and `title`                        |
| `Case study viewed` | A case study opens — carries `slug` and `title`                          |
| `Live site clicked` | A "Visit site" link is followed — carries `project`                      |
| `Social clicked`    | A footer social card is clicked — carries `platform`                     |
| `Resume downloaded` | The résumé PDF is downloaded                                             |
| `Email copied`      | The email address is copied                                              |
| `Contact submitted` | The contact form is sent                                                 |

### Connecting a provider

Plausible and Umami are both cookieless, so neither needs a consent banner in the
UK or EU. Umami has a free tier and can be self-hosted.

Add to `.env.local` and rebuild:

```
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
NEXT_PUBLIC_ANALYTICS_DOMAIN=yourdomain.com
```

For Umami use `NEXT_PUBLIC_ANALYTICS_PROVIDER=umami` with `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID`.
Self-hosted installs also need `NEXT_PUBLIC_ANALYTICS_SRC` pointing at your script.

Optionally create a read-only share link in the provider and set
`NEXT_PUBLIC_ANALYTICS_SHARE_URL` — the Analytics page embeds it, so the charts appear
in the admin instead of on the provider's site.
