# Raw market research — portfolio website builders

**Compiled 2026-08-12.** This is a research dossier, not copy. Every factual
claim carries a source URL. Prices and limits carry the date they were verified.
Anything that could not be confirmed against a primary source is marked
**UNVERIFIED** rather than guessed.

## How this was gathered, and what that means for trusting it

Five research streams ran in parallel: two on commercial competitors, one on the
open-source landscape, one on user complaints, one on shutdowns and market data.
Findings were cross-checked against primary sources wherever a primary source
existed.

Three limitations you should know before quoting anything from here:

- **Most pricing pages render prices in JavaScript.** Squarespace, Wix, Webflow
  and Framer all return feature tables without dollar figures to a fetcher. Where
  that happened, prices come from (a) the vendor's own help centre, and (b) two
  or more dated third-party sources that agree. Each such case is labelled.
- **Reddit refuses plain fetching but was reachable through an authenticated
  browser session.** Reddit quotes in section 3 are verbatim with upvote counts
  and permalinks. Hacker News is fully accessible through the Algolia API, so HN
  quotes are verbatim with permalinks too.
- **Trustpilot, G2, Capterra, BLS and Adobe's own pricing pages block automated
  fetching** (HTTP 403 or timeout). There are **no star ratings, review counts or
  review quotes from Trustpilot, G2 or Capterra in this document.** That gap is
  real. Do not fill it from memory — it needs a residential-IP fetch or a paid
  API. Adobe figures are sourced to third parties and flagged.

---

# 1. Commercial competitors

## 1.1 Squarespace

**Owner:** Permira, a private equity firm, which took Squarespace private for
**$7.2 billion ($46.50/share)**, closing **17 October 2024**
([PetaPixel, 18 Oct 2024](https://petapixel.com/2024/10/18/private-equity-firm-permira-acquires-squarespace-for-7-2-billion/)).
Founder Anthony Casalena stayed on as CEO and chairman. This matters for the
lock-in story: the platform holding a designer's portfolio is now owned by a
buyout fund with a return horizon.

### Pricing — plans renamed and raised in July 2026

Squarespace retired Personal / Business / Commerce Basic / Commerce Advanced in
favour of **Basic, Core, Plus, Advanced**.

| Plan     | Annual (per mo)     | Month-to-month       | Annual change |
| -------- | ------------------- | -------------------- | ------------- |
| Basic    | **$19** (was $16)   | **$25** (unchanged)  | +19%          |
| Core     | **$29** (was $23)   | **$39** (was $36)    | +26%          |
| Plus     | **$49** (was $39)   | **$65** (was $56)    | +26%          |
| Advanced | **$99** (unchanged) | **$139** (unchanged) | 0%            |

Sources: [PetaPixel, 17 Jul 2026](https://petapixel.com/2026/07/17/squarespace-is-increasing-prices-by-up-to-26/)
and [WebsiteBuilderExpert, updated 30 Jul 2026](https://www.websitebuilderexpert.com/website-builders/squarespace-pricing/),
which agree on all eight figures. Verified 2026-08-12. Prices are UNVERIFIED
against the live pricing page, which is JS-rendered.

PetaPixel's account of how customers found out:

> Customers were informed via direct email communications, though "Squarespace
> has seemingly not published a specific memo about its price changes."

Monthly billing rose less than annual: Core +8% ($36 → $39), Plus +16%
($56 → $65), Basic and Advanced unchanged
([PetaPixel, 17 Jul 2026](https://petapixel.com/2026/07/17/squarespace-is-increasing-prices-by-up-to-26/)).

### There is no free tier — a 14-day trial only

[Starting a Squarespace trial site](https://support.squarespace.com/hc/en-us/articles/206536827-Starting-a-Squarespace-trial-site)
(help centre, updated 6 May 2026) lists what a trial forbids: custom domains,
search-engine indexing ("Search engines don't index trial sites"), Google Search
Console / Bing verification, accepting payments, subscription products, customer
email notifications, form-submission emails, Apple Podcasts submission, Getty
licensing. The site is private by default; maximum 5 contributors; one 7-day
extension. On expiry, **"all content is marked for permanent deletion."**

The pricing page itself confirms it: "Squarespace doesn't offer a free plan, but
every site starts with a free trial—no credit card required."
([squarespace.com/pricing](https://www.squarespace.com/pricing), fetched 2026-08-12).

### Custom domain

Cheapest plan that allows one: **Basic, $19/mo billed annually**. A free domain
for year one is included **only on annual billing**. Squarespace's
[domain renewals article](https://support.squarespace.com/hc/en-us/articles/218193418-Squarespace-domain-renewals)
(updated 5 Aug 2026) notably declines to publish renewal prices, saying only that
"the domain will renew for its listed price." A .com renewing at roughly $20/yr is
a third-party figure and is **UNVERIFIED**.

### Export — portfolio pages are explicitly excluded

From [Exporting your site](https://support.squarespace.com/hc/en-us/articles/206566687-Exporting-your-site)
(updated 12 Feb 2026). The export is a WordPress-shaped XML file. It carries
layout pages, **one** blog page, text blocks and image blocks.

It does **not** export: **portfolio pages**, album pages, cover pages, index
pages, info pages, calendar pages, store pages, page-specific headers / footers /
sidebars, additional blog pages, dropdown menus, audio blocks, product blocks,
video blocks, drafts, style settings, or Custom CSS. Linked PDFs export but do
not import into WordPress.

This is the single most quotable fact about Squarespace for this project: **the
one content type the platform markets hardest to creatives is the one content
type it will not give back.**

### Fees and caps

From [Choosing the right Squarespace plan](https://support.squarespace.com/hc/en-us/articles/206536797-Choosing-the-right-Squarespace-plan)
(updated 29 Jul 2026): commerce fee 2% on Basic, 0% above; digital-product fee
7% / 5% / 1% / 0%; Squarespace Payments 2.9% + $0.30 falling to 2.5% + $0.30;
video 30 min / 5 hr / 50 hr / unlimited; **1,000-page cap**; contributors 2 on
Basic, unlimited above; bandwidth unlimited.

### Password protection

Both page-level and site-wide passwords exist on all plans, with sharp limits.

[Page passwords](https://support.squarespace.com/hc/en-us/articles/205814618-Page-passwords),
verbatim:

> "Everyone uses the same password to access a password-protected page. It's not
> possible to create unique passwords for different people."
> "It's not possible to password-protect collection items individually or to
> apply different passwords to different items."
> "Passwords are case-sensitive and must be 30 characters or fewer."
> "After visitors enter a page password, the session expires after four hours and
> prompts them to re-enter the password."
> "If you're hiding an existing page, setting a password only prevents search
> engines from indexing it further. This means that search engines may have
> already indexed this page, and this content could appear in search results."

[Site-wide passwords](https://support.squarespace.com/hc/en-us/articles/205815528-Site-wide-passwords),
verbatim: "After you add a site-wide password, your site won't be accessible to
search engines. It will eventually stop appearing in search results." Customers
also cannot check out while a site-wide password is on.

For a photographer showing client galleries, "one shared password, four-hour
session, kills your SEO" is a real constraint.

### Multilingual — not native

Squarespace does not have built-in translation. Its own help centre routes 7.1
users to the third-party **Weglot** integration
([Creating a multilingual site with Weglot](https://support.squarespace.com/hc/en-us/articles/205809778-Creating-a-multilingual-site-with-Weglot))
and 7.0 users to a
[manual duplicate-page method](https://support.squarespace.com/hc/en-us/articles/16552875658765-Manually-creating-a-multilingual-site).
Weglot is a separate paid subscription.

### Support — no phone support, by policy

[Why we don't offer phone support](https://support.squarespace.com/hc/en-us/articles/206545487-Why-we-don-t-offer-phone-support),
verbatim reasons given: "We can instantly view your website, account activity,
system details, and other information so we can troubleshoot effectively";
"Building a website is a visual process"; "It's faster"; "Online support keeps
detailed records in one place." Channels are email (24/7), live chat (most
weekdays) and X/@SquarespaceHelp.

The Better Business Bureau profile for Squarespace, Inc. records **435 complaints
in the last three years and 108 closed in the last twelve months**, and the
company is **not BBB accredited**
([BBB complaints page](https://www.bbb.org/us/ny/new-york/profile/internet-service/squarespace-inc-0121-103868/complaints),
fetched 2026-08-12). Recent complaint excerpts from that page:

> "They THEN went and charged me for a separate workspace feature...They took my
> money for a feature that is canceled now" — 23 July 2026
> "Squarespace is holding $14,000 of my money...There is no phone number to call
> no escalation email" — 23 July 2026
> "my domain is now in redemption status and I am being charged an additional $45
> redemption fee" — 22 June 2026

### Biggest limitation for a portfolio user

Portfolio pages and Custom CSS are excluded from export, there is no free tier at
all, and the entry price rose 19% in July 2026 with no public announcement.

---

## 1.2 Wix

### Pricing

| Plan           | Annual (per mo) | Month-to-month | Storage   |
| -------------- | --------------- | -------------- | --------- |
| Free           | $0              | $0             | 500 MB    |
| Light          | **$17**         | **$24**        | 2 GB      |
| Core           | **$29**         | **$36**        | 50 GB     |
| Business       | **$39**         | **$46**        | 100 GB    |
| Business Elite | **$159**        | **$172**       | Unlimited |

Sources: [WebsiteBuilderExpert, updated 3 Feb 2026](https://www.websitebuilderexpert.com/website-builders/wix-pricing/)
and [Tooltester, updated 11 May 2026](https://www.tooltester.com/en/reviews/wix-review/prices/),
which agree. Live page is JS-rendered — UNVERIFIED at source. A separate **Wix
Studio** track exists at Basic $19 / Standard $27 / Plus $49 / Elite $159
([LiteExtension, Jul 2026](https://litextension.com/blog/wix-pricing/)).

The Light / Core / Business / Business Elite structure replaced the legacy Combo,
Unlimited, Pro, Business Basic and VIP plans. **The restructure date is
UNVERIFIED.**

### Free tier — publishes, but with an ad banner

Wix has the only genuinely free published tier among the big three. It allows
publishing on `username.wixsite.com/sitename`, templates, most editor features
and AI tools. It forbids a custom domain, ecommerce, Google Analytics and
advanced SEO, and caps storage at 500 MB and bandwidth at 1 GB. A Wix ad banner
sits at the top of every page and scrolls with the visitor
([WebsiteBuilderExpert](https://www.websitebuilderexpert.com/website-builders/wix-pricing/),
3 Feb 2026).

### Custom domain

Cheapest plan: **Light, $17/mo annual**, which includes a free domain voucher for
year one on annual billing. Renewal figures conflict across sources — $13.35,
~$17, and $14.95 all appear, with two sources saying $14.95/yr for .com. Treat as
approximate, **UNVERIFIED**. Private registration is +$9.90/yr.

### Export — Wix's own help article exists to say you cannot leave

[Exporting or Embedding Your Wix Site Elsewhere](https://support.wix.com/en/article/exporting-or-embedding-your-wix-site-elsewhere),
fetched 2026-08-12, verbatim:

> "Your Wix site is a standard HTML5 site, and is built with Wix's technology. In
> order for your site to work properly, it needs to be hosted and operated on
> Wix's servers."
> "Since Wix is a SaaS solution, your site must run on Wix's servers."
> "The content you build on Wix belongs to you."

You can export _data_ — contacts, products, orders, invoices — and manually copy
text and download images. There is **no HTML/CSS export** and no official path to
another host. Migration means rebuilding by hand.

### Biggest limitation for a portfolio user

Total lock-in with zero design portability — worse than Squarespace, which at
least emits an XML file. And the free tier's scrolling ad banner makes it
unusable as a professional portfolio, so the real floor is $17/mo.

---

## 1.3 Webflow

**Webflow overhauled pricing on 13 May 2026**, merging the CMS and Business site
plans into a single "Premium" plan. The announcement lives at
[help.webflow.com](https://help.webflow.com/hc/en-us/articles/51059955082387-Updated-pricing-and-simplified-plans-for-May-2026)
(returns 403 to fetchers). Three independent dated write-ups agree on the
details: [BRIX Templates, 18 May 2026](https://brixtemplates.com/blog/webflow-may-2026-pricing-changes-explained),
[Flow Ninja, 15 May 2026](https://www.flowninja.com/blog/webflow-pricing-demystified),
[Carly, 15 Jul 2026](https://www.usecarly.com/blog/webflow-pricing/).

### Site plans (billed per website)

| Plan          | Annual (per mo) | Monthly | Pages | CMS items               | Bandwidth |
| ------------- | --------------- | ------- | ----- | ----------------------- | --------- |
| Starter       | Free            | Free    | 2     | 50 (20 collections)     | 1 GB      |
| Basic         | **$15**         | **$25** | 300   | none                    | 10 GB     |
| Premium (new) | **$25**         | **$39** | 300   | 20,000 (40 collections) | 50 GB     |
| Enterprise    | Custom          | —       | —     | —                       | —         |

Superseded: CMS was $23/mo annual (2,000 items, 150 pages); Business $39/mo
annual. Ecommerce unchanged: Standard $29/mo annual +2% fee, Plus $74/mo,
Advanced $212/mo. Bandwidth add-on: first +50 GB = $20/mo annual. **CMS item
add-ons were eliminated.**

Rollout: new purchases from 13 May 2026; existing sites at next renewal on or
after 29 Jun 2026; Freelancer/Agency Workspace sites and legacy pricing
16 Nov 2026.

### Workspace plans — you pay twice

| Workspace  | Annual (per mo) | Staging sites            | Code export |
| ---------- | --------------- | ------------------------ | ----------- |
| Starter    | Free            | 2                        | **No**      |
| Core       | **$19**         | 10                       | **Yes**     |
| Growth     | **$49**         | Unlimited                | Yes         |
| Freelancer | $16             | 10 unhosted client sites | Yes         |
| Agency     | $35             | Unlimited unhosted       | Yes         |

Seats: Full $39/mo, Limited $15/mo, Reviewer free. A new **Team plan at
$2,500/mo** on annual contract exists. Add-ons: Optimize from $299/mo, Analyze
from $9/mo, Localize $9–$29/mo per site.

### Free tier

Starter forbids a custom domain and code export, and caps at **2 pages, 50 CMS
items, 1 GB bandwidth, 50 lifetime form submissions**. It publishes to
`webflow.io` and keeps the Webflow badge in the bottom-right corner. No time
limit, no card required. **Two pages is not a portfolio.**

### Custom domain

Cheapest: **Basic site plan, $15/mo annual**. **No free domain — Webflow is not a
registrar.** You buy elsewhere and set DNS, or use the in-product "Buy new domain"
flow which purchases through IONOS.

### Export — the best in the paid set, and still lossy

Code export requires a **paid Workspace plan** — site plans alone do not include
it. Cheapest route is **Core Workspace at $19/mo annual** (or Freelancer at
$16/mo). Because a published site also needs a site plan, a portfolio owner who
wants both hosting and their own code pays **$15 + $19 = $34/mo minimum**.

Export delivers a ZIP of per-page HTML, CSS, JS including interactions, images
and fonts ([The CSS Agency, 11 Jun 2026](https://www.thecssagency.com/blog/how-to-export-code-from-webflow)).
Lost on export: all CMS content and dynamic collections ("Webflow's CMS database
stays within the Webflow platform"), ecommerce, and native form handling
("Webflow's built-in form submission handling won't work on external hosting").

### Biggest limitation for a portfolio user

Double billing, plus the trap that the natural way to build a portfolio — one CMS
item per project — is exactly the content that export strips out.

---

## 1.4 Framer

### Pricing

Verified from [framer.com/pricing](https://www.framer.com/pricing/) on
2026-08-12. The page defaults to a yearly-billing toggle and does not expose
month-to-month figures to a fetcher.

| Plan       | Annual (per mo) | Monthly    | Pages  | CMS collections | CMS items | Bandwidth |
| ---------- | --------------- | ---------- | ------ | --------------- | --------- | --------- |
| Free       | $0              | $0         | 30     | 2               | 1,000     | 1 GB      |
| Basic      | **$10**         | UNVERIFIED | 30     | 2               | 1,000     | 50 GB     |
| Pro        | **$30**         | UNVERIFIED | 150    | 10              | 2,500     | 100 GB    |
| Enterprise | Custom          | Custom     | Custom | Custom          | Custom    | Custom    |

Corroborated as annual by [Goodspeed, 11 Aug 2026](https://goodspeed.studio/blog/framer-pricing-explained),
[BRIX Templates, 26 May 2026](https://brixtemplates.com/blog/framer-pricing-plans),
[The CSS Agency, 16 Jul 2026](https://www.thecssagency.com/blog/framer-pricing-breakdown).
**Not one of six sources published the month-to-month price.** A "Scale" plan at
$100/mo appears in third-party articles but did not appear on the live pricing
page on 2026-08-12 — **UNVERIFIED**.

Overage add-ons on Pro, verbatim from the live page: $20 per 100 additional
pages; $40 per 10 CMS collections (max 40); $20 per 10,000 CMS items (max
40,000); $40 per 100 GB bandwidth (max 2 TB). Localization $20/locale up to 20.
Convert A/B testing $50 per 500,000 events. Advanced Hosting $200/mo.

Seats: Editor $20/mo, Content Editor $10/mo, Viewers free. Framer **cut** editor
seats from $40 to $20 in May 2026 and added the $10 Content Editor role — the
only price decrease found anywhere in this dossier
([Goodspeed, 11 Aug 2026](https://goodspeed.studio/blog/framer-pricing-explained)).

### Free tier

Publishes to a `framer.website` subdomain with a permanent "Made in Framer"
badge, 1 GB bandwidth, 5 MB upload cap. The live pricing page states: "To connect
a custom domain, you'll need to upgrade to a paid plan."

### Custom domain

Cheapest: **Basic, $10/mo annual** — and unlike Webflow, Basic includes a free
custom domain. This is the cheapest real-design custom-domain entry point in the
commercial set.

### Export — none

Framer offers no native HTML or code export. The third-party
[NoCodeExport Framer page](https://www.nocodeexport.com/en/framer) exists because
of that gap: "Framer is excellent for designing and publishing, but it is not
built around portable source ownership." Even third-party extraction is partial:
"Complex Framer Motion effects that rely on the React runtime cannot be perfectly
replicated in raw HTML."

### Biggest limitation for a portfolio user

The 30-page cap on Basic combined with zero export. One page per project adds up;
crossing 30 forces $10 → $30/mo, and Pro's 150-page ceiling then costs $20 per
extra 100 pages. The animation work that makes a Framer portfolio distinctive is
the least portable content in this entire dossier.

---

## 1.5 Carrd

### Pricing — annual only, and an order of magnitude cheaper

From [carrd.co/pro](https://carrd.co/pro) and
[carrd.co/docs/pro/plans](https://carrd.co/docs/pro/plans), fetched 2026-08-12.
**All prices are per YEAR.**

| Tier             | Price/yr | Sites | Custom domain | Forms    | Branding removed |
| ---------------- | -------- | ----- | ------------- | -------- | ---------------- |
| Free             | $0       | 3     | No            | No       | **No**           |
| Pro Lite         | **$9**   | 3     | No            | No       | Yes              |
| Pro Lite 10      | **$14**  | 10    | No            | No       | Yes              |
| Pro Lite 25      | **$29**  | 25    | No            | No       | Yes              |
| **Pro Standard** | **$19**  | 10    | **Yes**       | Yes      | Yes              |
| Pro Plus         | **$49**  | 25    | Yes           | Advanced | Yes              |

Pro Standard scales: $39 (25 sites) / $69 (50) / $119 (100) / $249 (250) / $399
(500) / $599 (1000). Pro Plus scales: $89 (50) / $159 (100) / $349 (250) / $599
(500) / $999 (1000).

Note the counter-intuitive ladder: Pro Lite 25 at $29/yr is *more expensive* than
Pro Standard at $19/yr yet has **no** custom domain support.

### Free tier

"Build up to three sites per account and use all of Carrd's core features – for
free!" Forbids custom domains and forms, and carries "Made with Carrd" branding.
A 7-day Pro trial requires no payment details.

### Custom domain

Cheapest: **Pro Standard, $19/year** — about **$1.58/month**, roughly one twelfth
of Squarespace Basic. Carrd does not sell domains, so there is no free year-one
domain; you bring your own. SSL via Let's Encrypt.

### Export — the best portability of any commercial platform here

From [carrd.co/docs/pro/features](https://carrd.co/docs/pro/features), verbatim:

> "Download the unminified HTML, CSS, JS, and images for any sites you build
> (note: excludes server-side code)."

_Unminified._ Carrd is the only commercial platform in this set that hands back
readable, self-hostable source with essentially nothing lost but server-side form
processing, and it is not plan-gated behind a second subscription.

### Biggest limitation for a portfolio user

Carrd builds **one-page sites**. Its own docs: "Carrd is a free service for
building fully responsive one-page sites." The "3 sites" or "10 sites" counts are
separate single-page sites, not pages within one portfolio. There is no CMS, no
multi-page project structure and no per-project detail pages. A designer wanting
a landing page plus twelve case studies cannot build it here.

---

## 1.6 Cargo (cargo.site)

Pricing lives at `cargo.site/information`; `/pricing` and `/plans` both 404.

| Plan                | Annual (per mo) | Monthly |
| ------------------- | --------------- | ------- |
| Free                | $0              | $0      |
| **Standard**        | **$14**         | **$19** |
| Standard + Commerce | **$19.50**      | **$28** |
| Student / educator  | **Free**        | Free    |

Verified on [cargo.site/information](https://cargo.site/information) and
[Cargo 2 Rates & Services](https://cargo2support.cargo.site/Rates-Services),
both fetched 2026-08-12 and mutually consistent.

Cargo's explicit pitch is "One price, no tiers or hidden price stacking," and the
Rates & Services page lists "Unlimited bandwidth" and "Unlimited pages" on every
site, plus responsive templates, support, live chat, commerce integration, domain
registration and management, SSL and premium font libraries.

### Free tier — build-only, cannot publish

Verbatim: "All Cargo sites are free to try or build. To make a site public simply
choose a desired service option." The free tier is a design sandbox. **Storage
caps, free-tier bandwidth, and whether a Cargo badge appears are UNVERIFIED** —
the pricing surface is JS-rendered and `docs.cargo.site` article URLs returned
503/404.

### Student plan

Free for "all students (as well as teachers and related administrators)" via
[cargo.site/students](https://cargo.site/students). Requires a professor or
school administrator to email `studentprogram@cargo.site` from an official
`.edu`-style domain. Duration and included features unstated.

### Custom domain

Requires the paid plan. One free custom domain connection is included; additional
domains are $2/mo billed yearly or $3/mo billed monthly. Whether year one is free
and what renewal costs are **UNVERIFIED**.

### Export

**UNVERIFIED — no export capability is documented anywhere reachable.** Cargo is
absent from NoCodeExport's supported-platform list (Framer, Webflow, Wix,
Squarespace, WordPress, Elementor, Gamma). Assume none until confirmed.

### Biggest limitation for a portfolio user

You cannot show anyone your work without paying — unlike Wix (ad-supported),
Webflow (2 pages), Framer (badged) or Carrd (3 free sites). Against that, at $14/mo
annual with unlimited pages and unlimited bandwidth, Cargo is the only commercial
platform here that does not punish a portfolio for growing.

---

## 1.7 Format

### Pricing — the annual rates are a promotion expiring 31 Aug 2026

From [format.com/pricing-portfolio](https://www.format.com/pricing-portfolio),
fetched 2026-08-12. This page did render prices, including strikethroughs
revealing regular versus promo rates.

| Plan     | Monthly | Annual REGULAR | Annual PROMO (per mo)       |
| -------- | ------- | -------------- | --------------------------- |
| Basic    | **$14** | $10            | **$10**                     |
| Pro      | **$24** | **$17**        | **$12** (code PROINTRO)     |
| Pro Plus | **$36** | **$26**        | **$15** (code PROPLUSINTRO) |

**The $12 and $15 annual rates expire 31 August 2026, 11:59 p.m. PST.** Anyone
modelling Format's real cost should use $17 and $26.

| Feature            | Basic    | Pro       | Pro Plus  |
| ------------------ | -------- | --------- | --------- |
| Website pages      | **10**   | Unlimited | Unlimited |
| High-res images    | **70**   | 1,500     | Unlimited |
| Image storage      | **None** | 100 GB    | 1 TB      |
| Hosted video       | None     | 15 min    | 120 min   |
| Client galleries   | 3–10     | 50        | 250       |
| Store products     | None     | 15        | 1,000     |
| Custom code editor | No       | Yes       | Yes       |
| File transfers     | 2 GB     | 5 GB      | 10 GB     |

An independent fetch of format.com/pricing on the same day returned the same
plan structure with annual rates of $10 / $12 / $15 — consistent with the promo
reading.

### Free tier

None. A **14-day free trial**, no credit card required. Annual plans refundable
in full only within the first 30 days.

### Custom domain

Cheapest plan with a free year-one domain: **Pro ($17/mo annual regular, $24
monthly)**. Basic gets no free domain but can connect one you already own —
Format's support team performs the DNS connection. Renewal price after year one
is **UNVERIFIED**; `help.format.com` returned 403 on every path.

### Export

**UNVERIFIED.** No export documentation was reachable and Format is absent from
third-party export-tool coverage. File transfers (2–10 GB) move images, not the
site.

### Biggest limitation for a portfolio user

Basic — the only sub-$17 tier — allows **no image storage and 70 high-res images
across 10 pages**. For a photographer that is roughly two shoots. The plan aimed
at portfolios is the one that cannot hold a portfolio.

---
