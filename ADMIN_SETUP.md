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
- Admin panel: http://localhost:3000/admin/login

### Signing in

The passcode lives in `.env.local` (which is git-ignored, so it never leaves your machine):

```env
VITE_ADMIN_EMAIL=you@example.com
VITE_ADMIN_PASSCODE=pick-your-own-passcode
```

Change the passcode to something only you know, then restart the dev server — Vite only reads
env files at startup.

> **This is a local gate, not real security.** Anything prefixed `VITE_` is bundled into the
> JavaScript and readable by anyone who opens the site. Do not put `/admin` on a public URL
> until the hosted backend with proper authentication is in place (section 6).

---

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

Content is stored in **your browser's IndexedDB**, on this computer, in this browser profile.

That means:

- Changes appear instantly for you, with no rebuild and no deploy.
- **Nobody else sees them.** A visitor to the deployed site sees whatever was in the code at
  build time.
- Clearing site data for this origin deletes your content.

**So export regularly.** `/admin/settings` → **Export Content** downloads one `.json` file
containing all text and every uploaded image. That file is your backup, the way to move content
to another computer, and the seed for the hosted backend later. **Import Bundle** restores it;
**Reset to Defaults** returns everything to the content shipped in `src/data/`.

---

## 4. What's on each screen

| Screen                 | What it controls                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Homepage Builder       | Order and visibility of homepage bands; their headings and buttons. Also the headers for the Work, Case Studies and Contact pages. |
| Selected Work          | Projects: copy, images, metadata, live URL. Drives the homepage cards, `/work` and `/work/:slug`.                                  |
| Case Studies           | The long-form stories, including research, wireframes, decisions and outcomes.                                                     |
| Brands & Clients       | Logo strip on the homepage.                                                                                                        |
| Experience / Education | The two timelines.                                                                                                                 |
| Process Steps          | The numbered "How I work" list.                                                                                                    |
| Capabilities           | Skill groups.                                                                                                                      |
| Recommendations        | Testimonials.                                                                                                                      |
| Visual Explorations    | The image gallery on the About page.                                                                                               |
| Media Library          | Every uploaded image and PDF. Uploading a PDF also sets it as the downloadable résumé.                                             |
| Contact Messages       | Enquiries submitted through the contact form.                                                                                      |
| Navigation             | Links in the header. Warns if a link points at a page that doesn't exist.                                                          |
| Footer & Social        | Copyright line, oversized footer word, social cards.                                                                               |
| Microcopy              | Every short string — buttons, labels, confirmations. Searchable.                                                                   |
| Appearance             | Accent and background colours per theme, and the Google Fonts.                                                                     |
| SEO                    | Page title, meta description, share image.                                                                                         |
| Settings & Backup      | Your name and contact details, the About story, and export/import/reset.                                                           |

`src/data/` is **seed content only** — read once on a browser's first visit to populate the CMS.
Editing those files will not change a browser that already has stored content; use the admin, or
Reset to Defaults.

---

## 5. Design system

The admin is built on **Astryx** (`@astryxdesign/core`) with the **neutral**
theme — real components, not a lookalike. Colours, type scale, spacing, radii,
motion and light/dark palettes are the system's own defaults.

```
@astryxdesign/core          components + compiled StyleX
@astryxdesign/theme-neutral neutral theme tokens
@astryxdesign/cli           docs + templates (dev only)
```

The CLI is the reference while editing admin code:

```bash
npx astryx component Button      # props and examples
npx astryx template --list       # page and block recipes
npx astryx docs tokens           # every colour / spacing / radius token
npx astryx doctor                # check the setup
```

Rules worth knowing (full set in `.claude/CLAUDE.md`, generated by
`astryx init`):

- Prefer component props over CSS. Don't hardcode hex or px values.
- Dense data belongs in rows (Table, List), not one Card per row.
- Colour carries meaning — status only. The neutral accent is monochrome.

Two constraints specific to this repo:

- **React 19 is required** by `@astryxdesign/core`. The public site runs on it
  too, so check both after any React change.
- **Cascade layer order is load-bearing.** `src/styles/layers.css` must be
  imported before the Astryx stylesheets. Tailwind 3 emits Preflight unlayered,
  and a layer's rank is fixed the first time it appears — get this wrong and
  `button { background-color: transparent }` silently cancels Astryx button
  fills.

The admin is scoped by `.admin-ui` and the `Theme` provider, so none of it
reaches the public site. The draft preview runs in an iframe — a separate
document — so it always shows the site's own typography and brand colour, not
the editor's.

---

## 6. Going online (not set up yet)

Two things are still needed before edits are visible to visitors:

1. **A backend.** Content persistence sits behind one interface, `ContentStore`
   (`src/cms/services/storage/types.ts`). The current implementation is
   IndexedDB (`localStore.ts`). Adding a hosted implementation — Postgres for
   the content tree, object storage for media, and real authentication —
   replaces that one file; nothing above it changes. Seed it by importing your
   exported bundle.

2. **A host with an SPA rewrite.** This is a client-routed single-page app.
   Without a `/*` → `/index.html` rewrite, `/work/:slug` and `/admin` return
   404 when refreshed. Both `vercel.json` and `public/_redirects` are already
   in the repository, so Vercel, Netlify and Cloudflare Pages are covered.

Until then, treat `/admin` as a local tool.

---

## 7. Production build

```bash
npm run build     # type-checks, then bundles to dist/
npm run preview   # serve the built output locally
```

The admin is lazy-loaded into separate chunks, so visitors to the public pages never download it.

## Analytics

The admin has an **Analytics** page, but the audience half of it is empty until a
provider is connected. That is not a missing feature — a static site cannot count
its own visitors. Nothing runs on a server, so a page view has nowhere to be
recorded that you could read back later; IndexedDB only holds what happened in
_your_ browser.

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
VITE_ANALYTICS_PROVIDER=plausible
VITE_ANALYTICS_DOMAIN=yourdomain.com
```

For Umami use `VITE_ANALYTICS_PROVIDER=umami` with `VITE_ANALYTICS_WEBSITE_ID`.
Self-hosted installs also need `VITE_ANALYTICS_SRC` pointing at your script.

Optionally create a read-only share link in the provider and set
`VITE_ANALYTICS_SHARE_URL` — the Analytics page embeds it, so the charts appear
in the admin instead of on the provider's site.

**Enquiry numbers do not need any of this.** They come from the contact form
straight into this database, so they are exact whether or not a provider is
connected.
