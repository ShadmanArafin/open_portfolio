# The marketing and documentation site

`getopenportfolio.vercel.app` — the homepage, the comparison pages, `/what-it-costs`,
`/is-this-right-for-you`, the help centre and the developer docs.

**This is not part of the product.** It is a separate Next.js application that
happens to live in the same repository, and it is deliberately not an npm
workspace member, so `npm install` at the repository root never touches it.

## Why it is not in the product's `app/` directory

The Deploy button clones this entire repository into the user's own GitHub
account. Anything under the product's `app/` becomes a route on **their**
portfolio — so a marketing site there would put `/alternatives/squarespace` and
`/what-it-costs` on every site anybody deploys, and duplicate the same pages
across every installation for a search engine to find.

## Running it

```bash
cd site
npm install
npm run dev        # http://localhost:3200
```

```bash
npm run build      # contrast check, then a static export into out/
npm run typecheck
npm run check:contrast
```

`npm run build` runs the contrast check first and fails on it. The product
refuses to publish a palette nobody could read; it would be a poor look for the
page that says so to fail its own rule.

The output is a fully static export. It needs no server, no database and no
runtime — which is the right shape for the marketing site of a project whose
argument is that you should not depend on a platform.

## Deploying

A separate Vercel (or Netlify, or anything that serves files) project pointed at
the same repository, with **Root Directory** set to `site`.

Set `SITE_URL` to the public address. It is the only thing that needs
configuring, and it feeds the canonical links, the sitemap and the social card.
Without it the default in `lib/site.ts` is used.

## How it is put together

| Path                         | What it holds                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/`                       | Routes. One file per page; nothing clever.                                                                                                 |
| `content/help/*.md`          | The help centre. Plain Markdown, four lines of frontmatter.                                                                                |
| `content/docs/*.md`          | The developer docs. Same.                                                                                                                  |
| `lib/facts.ts`               | **Every claim about another product, with a source URL and the date it was checked.**                                                      |
| `lib/alternatives.ts`        | The four comparison pages, as data.                                                                                                        |
| `lib/content.ts`             | Reads the Markdown at build time and builds the navigation from the files.                                                                 |
| `app/globals.css`            | The whole design, and the reasoning behind it.                                                                                             |
| `scripts/check-contrast.mjs` | Reads the tokens out of the stylesheet and fails the build below 4.5:1.                                                                    |
| `lib/demo/`                  | The seven invented personas behind `/demo/try`, and the bridge to the product.                                                             |
| `components/demo/`           | The interactive demo: the admin shell and its nav, thirteen screens, the block palette, the generated field editor, the resizable preview. |
| `public/shots/`              | Product screenshots. One persona throughout — see below.                                                                                   |

## The demo imports the product

`/demo/try` runs the admin and the published site in the browser with nothing
behind them. It is not a mock-up: the blocks, the block renderer, the theme
token generator, the profession vocabulary, the editor's field metadata, the
content warnings, the dashboard's checks (`analyseContent`), the contrast audit
(`auditContrast`) and the newsletter's CSV (`toCsv`) are all imported from
`../core` and `../src/cms`. A block added to the product appears in the demo
with no work here.

That is worth the coupling for a reason beyond fidelity: **running the
product's own functions against seeded content falsifies stale copy.** It
immediately caught two sentences repeated across this site and the README —
a check count that had changed, and a colour refusal that mostly does not
happen because the token layer clamps first.

Three screens cannot exist without a server and say so when opened: uploading
a file, saving a service password, and reporting a bug through GitHub under
your own account.

Two build settings make that possible and they are easy to get backwards:

- **`turbopack.root` stays at `site/`.** Move it up and Next decides the
  repository root is the workspace root and compiles the _product's_
  `middleware.ts`, which fails naming a file this application has never heard of.
- **`outputFileTracingRoot` must be the repository root.** Leave it at `site/`
  and every relative import climbing out of this directory resolves to nothing,
  with the file plainly there on disk.

A consequence worth recognising rather than fixing: `next build` prints
`Proxy (Middleware)` because it finds the product's `middleware.ts` up there.
A static export cannot emit middleware, and the export was checked — nothing
from it ships. It is noise, not a leak.

### It gets the whole window

`/demo/try` and `/demo/site` are the two routes the site's own header and footer
are not rendered on — see `components/chrome-gate.tsx`, and add to the list there
rather than hiding chrome with CSS. They are applications rather than documents,
and the demo carries its own bar instead.

Two consequences worth knowing before changing this layout. The preview is a
fixed share of the width (`--preview-w`, set by the drag handle) and the editor
takes the rest, which is the opposite of the obvious arrangement and deliberate:
`1fr` on the preview made it more than half the window, so the admin was
permanently judged at half width. And the narrow-width rules that turn the
navigation into an icon rail live _after_ the rules they override, because a
media query adds no specificity — one `display: none` inside one already lost to
a plain rule written further down the file.

`/demo/site` renders whatever the editor last handed it through local storage.
Not the URL: a full page of blocks does not survive a query string, and a
truncated one would look like the product being broken.

## Screenshots

`public/shots/` holds real screenshots of the product running locally with the
photographer persona published — not mock-ups and not redraws.

**One persona everywhere.** The same invented photographer appears in the
screenshots, in the demo and in the README. Mixing personas across screenshots is
the fastest way to make a young product look like a mock-up.

To retake them: run the product on port 3111 with a fresh `OPB_DATA_DIR`, seed it,
and capture at 1440x950. Everything in them is fictional — invented names,
invented studios, invented clients — and it stays that way.

## Two rules for editing it

**A claim about somebody else's product does not go on this site unless it is in
`lib/facts.ts` with a URL and a date.** Pricing changes, features are added and
support articles get rewritten. A comparison page with no dates is describing a
product as it was on some unknown day.

**Every comparison page names at least two things the other product does
better**, specifically, with no hedging clause afterwards. If two cannot be
found honestly, the page does not ship. The reader has used that product and
knows what it does well; a page that pretends otherwise is telling them it was
not written for anybody who knows anything.

## Adding a page to the help centre or the docs

Drop a `.md` file into `content/help/` or `content/docs/` with:

```markdown
---
title: What it is called
summary: One line, used in listings and as the meta description.
group: Which sidebar group
order: 55
---
```

The navigation, the search index, the sitemap and the static routes are all
generated from the directory. A missing frontmatter key fails the build rather
than producing a page with a blank title.

Raw HTML inside a Markdown file is escaped, not rendered. A page that genuinely
needs a component gets a real route.

**The one hard rule about which directory:** the help centre never shows a
terminal command, and the developer docs never explain what a hero section is.
Where a help page needs a command, it links across and says so in a sentence.
Two audiences, two destinations — merging them produces documentation that fails
both.
