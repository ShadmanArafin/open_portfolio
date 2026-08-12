# The marketing and documentation site

`openportfoliobuilder.com` — the homepage, the comparison pages, `/what-it-costs`,
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

| Path                         | What it holds                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `app/`                       | Routes. One file per page; nothing clever.                                            |
| `content/help/*.md`          | The help centre. Plain Markdown, four lines of frontmatter.                           |
| `content/docs/*.md`          | The developer docs. Same.                                                             |
| `lib/facts.ts`               | **Every claim about another product, with a source URL and the date it was checked.** |
| `lib/alternatives.ts`        | The four comparison pages, as data.                                                   |
| `lib/content.ts`             | Reads the Markdown at build time and builds the navigation from the files.            |
| `app/globals.css`            | The whole design, and the reasoning behind it.                                        |
| `scripts/check-contrast.mjs` | Reads the tokens out of the stylesheet and fails the build below 4.5:1.               |

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
