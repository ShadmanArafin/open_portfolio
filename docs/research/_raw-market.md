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

**Read section 6 before writing anything.** Three premises the research was asked
to confirm — that Coroflot shut down, that Dunked is dead, and that Format changed
hands — did not survive verification. Two statistics people expect to find in this
space (the percentage of hiring managers who look at a portfolio, and the seconds
a recruiter spends on one) **do not exist anywhere** and must not be invented.

## Contents

1. **Commercial competitors** — twenty platforms, exact prices, free-tier limits,
   custom-domain rules, export situation.
2. **Open-source and self-hosted alternatives** — what exists, and the exact line
   in each install document where a non-technical person stops.
3. **Real user complaints** — roughly 115 verbatim quotes across fifteen themes,
   including the Read.cv shutdown in full.
4. **Market data** — market size, share, freelancer and occupation counts, the
   evidence that a portfolio matters, and free-tier infrastructure limits.
5. **Feature comparison matrix** — thirteen columns, with unverified cells marked
   rather than guessed.
6. **Everything that could not be verified** — the full risk surface, plus the
   follow-ups worth doing.

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

## 1.8 Pixpa

From [pixpa.com/pricing](https://www.pixpa.com/pricing), fetched 2026-08-12. Note
a live "Limited Time Offer" banner: the monthly figures are list price, the
yearly and 2-yearly figures currently show 40% / 55% off, where the page states
the _standard_ discounts are 20% off yearly and 40% off 2-yearly, with the promo
adding "an extra 25% on top."

| Plan         | Monthly (list) | Yearly promo (per mo) | 2-yearly promo (per mo) | Yearly total |
| ------------ | -------------- | --------------------- | ----------------------- | ------------ |
| Basic        | $5             | $3.00                 | $2.25                   | $36/yr       |
| Creator      | $9             | $5.40                 | $4.05                   | $64.80/yr    |
| Professional | $19            | $11.40                | $8.55                   | $136.80/yr   |
| Advanced     | $39            | $23.40                | $17.55                  | $280.80/yr   |

Standard non-promo yearly rates, computed from the page's stated 20% discount:
Basic $4/mo, Creator $7.20/mo, Professional $15.20/mo, Advanced $31.20/mo.

| Feature         | Basic       | Creator   | Professional | Advanced  |
| --------------- | ----------- | --------- | ------------ | --------- |
| Storage         | 3 GB        | 5 GB      | 25 GB        | 100 GB    |
| Pages/galleries | 10          | Unlimited | Unlimited    | Unlimited |
| Images          | **200 cap** | Unlimited | Unlimited    | Unlimited |
| Products        | 3           | 10        | 100          | Unlimited |
| Gallery links   | 3           | 10        | 25           | Unlimited |

The 200-image cap is confirmed in the help docs: "The Basic plan includes 200
images only... Pixpa plans include unlimited website images except for the Basic
plan" ([help.pixpa.com](https://help.pixpa.com/kb/meant-200-images-start-plan/)).

**No free tier.** 15-day trial, no credit card, 30-day money-back guarantee.
Pixpa's own marketing explicitly rejects a free tier: "Pixpa does not offer a
permanent free plan, because free builders rely on ads, forced subdomains and a
cut of your sales."

**Custom domain:** available on every paid plan **including Basic** — the
cheapest custom-domain entry point of any hosted platform in this dossier at
$36/yr promo, ~$48/yr standard. A free year-one domain is bundled with annual and
2-yearly plans **except Basic**
([help.pixpa.com](https://help.pixpa.com/kb/get-one-year-free-domain-registration/)).

**Export — hard lock-in.** Verbatim from Pixpa's help centre: "Pixpa websites can
only be hosted on our servers as they leverage our hosting infrastructure to
function. **They cannot be downloaded or hosted elsewhere.**"
([help.pixpa.com](https://help.pixpa.com/kb/can-download-pixpa-website/)). You can
retrieve uploaded images and files, order and customer data, and invoices; client
gallery orders export as CSV.

**Biggest limitation:** the site is non-portable at any price, and the cheap
Basic tier is crippled for photographers by the 200-image cap over 10 pages.

---

## 1.9 Adobe Portfolio

**Domain change verified this session:** `myportfolio.com` now issues an HTTP 301
permanent redirect to `portfolio.adobe.com` (checked 2026-08-12). The product has
been folded under adobe.com.

**It is not sold standalone.** It is bundled with paid Creative Cloud
subscriptions and with Behance Pro.

**Cheapest verified route: Behance Pro at US$11.49/mo.** The live Behance Pro page
states Pro "includes access to Adobe Portfolio (includes up to 5 websites)" with
"free hosting and custom domains," at US$11.49/mo with a 7-day free trial
([behance.net/pro](https://www.behance.net/pro), fetched 2026-08-12). This
undercuts every Creative Cloud route.

Creative Cloud pricing, 2026 — **Adobe's own pages timed out or 403'd on every
attempt, so all figures below are third-party and flagged**:

| Plan                          | Price                                                                                                          | Source and confidence                                                                                                                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Photography 20GB (legacy)     | **$9.99 → $14.99/mo** annual-billed-monthly, effective **15 Jan 2026**; annual prepaid unchanged at $119.88/yr | Adobe FAQ page [helpx.adobe.com/creative-cloud/faq/ccpp-20gb.html](https://helpx.adobe.com/creative-cloud/faq/ccpp-20gb.html) via search snippet; **direct fetch timed out**                                                              |
| Photography 20GB availability | **Closed to new customers 15 Jan 2025**                                                                        | same                                                                                                                                                                                                                                      |
| Photography 1TB               | $19.99/mo, $239.88/yr                                                                                          | Multiple 2026 sources; **UNVERIFIED on adobe.com**                                                                                                                                                                                        |
| Single App                    | $22.99/mo                                                                                                      | [callthedesignguy.com, 16 Apr 2026](https://callthedesignguy.com/post/how-much-does-adobe-portfolio-cost); **UNVERIFIED**                                                                                                                 |
| Lightroom plan                | $11.99/mo                                                                                                      | same; **UNVERIFIED**. Behance Pro at $11.49 is cheaper and _is_ verified                                                                                                                                                                  |
| CC All Apps ($59.99/mo)       | **Ended for new North American customers 17 Jun 2025**                                                         | [cgchannel](https://www.cgchannel.com/2025/05/adobe-to-end-creative-cloud-all-apps-subscriptions-in-north-america/), [PetaPixel](https://petapixel.com/2025/05/20/if-you-have-adobe-creative-cloud-your-price-could-increase-next-month/) |
| Replaced by CC Standard       | $54.99/mo                                                                                                      | same                                                                                                                                                                                                                                      |
| Replaced by CC Pro            | $69.99/mo (up to +16.7% vs old All Apps)                                                                       | same                                                                                                                                                                                                                                      |

One 2026 blog publishes contradictory figures across two of its own articles.
Treat every non-Adobe number here as low confidence.

**No free tier.** Portfolio requires an active paid subscription to publish and
stay live.

**Custom domain:** supported at no extra Adobe charge, **one custom domain per
site**, on any qualifying paid plan including Behance Pro. You buy the domain
from a registrar separately.

**Export — hard lock-in with a kill switch.** No site export exists. Adobe's
official statement, still cited as current: "If you cancel or choose not to renew
your creative cloud membership, **your site will remain live for 14 days. After
this 14-day grace period, your site will come offline.**" Content is preserved
but non-public: "You will still be able to access all of your work in the Adobe
Portfolio editor but your website will not be live/public until you renew the
subscription."
([Adobe Product Community](https://community.adobe.com/questions-606/what-happens-to-my-portfolio-once-i-end-my-adobe-subscription-578410)).

**Limits:** up to **5 sites** per account, confirmed independently by
[behance.net/pro](https://www.behance.net/pro) and
[callthedesignguy.com](https://callthedesignguy.com/post/is-adobe-portfolio-free).
No published storage meter or visitor cap.

**Is Adobe still investing?** No official deprecation exists, but Adobe's own
community carries open threads titled
["Has Adobe abandoned Portfolio, or is there still a team working on improving
it?"](https://community.adobe.com/t5/creative-cloud-services-discussions/has-adobe-abandoned-portfolio-or-is-there-still-a-team-working-on-improving-it/td-p/15165849)
and ["Is Portfolio still being developed?"](https://community.adobe.com/t5/creative-cloud-services-discussions/is-portfolio-still-being-developed/td-p/11583268),
citing missing basics such as linking an existing page to the home page and
dropdown menus. For context on Adobe's willingness to retire creative tools,
**Adobe Animate is being discontinued on 1 March 2026**
([ITP.net](https://www.itp.net/digital-culture/adobe-to-discontinue-animate-as-ai-takes-centre-stage)).

**Biggest limitation:** your portfolio is a hostage to an unrelated software
subscription. Stop paying for Photoshop and your website is dark in fourteen
days, with no export path to rescue it.

---

## 1.10 Dunked — still alive, and quiet

**Status confirmed operating 2026-08-12** by three independent checks:
`dunked.com` loads normally with no shutdown notice;
`secure.dunked.com/signup` serves a working signup form with a live "Create my
portfolio" button; and a 2025 relaunch is documented ("We're starting 2025 with a
slam dunk! The all-new Dunked is here," facebook.com/DunkedHQ, Jan 2025).

| Plan         | Monthly | Annual (per mo) | Annual total | Projects  | Pages     | Images |
| ------------ | ------- | --------------- | ------------ | --------- | --------- | ------ |
| Professional | **$12** | **$8**          | $96/yr       | 100       | 100       | 1,000  |
| Agency       | **$29** | **$19**         | $228/yr      | Unlimited | Unlimited | 5,000  |

Source: [dunked.com/pricing](https://dunked.com/pricing), fetched 2026-08-12.
Currency is not stated on the page — USD is inferred, **UNVERIFIED**.

On "unlimited": "Is unlimited really unlimited? Yes. When using the agency plan
you can create as many projects and pages as you like" — note the 5,000-image cap
still applies.

**No free tier.** 10-day free trial: "Try the unlimited version of Dunked free
for 10 days. No card details required." Custom domain included on both plans, but
"You will need to purchase your own domain name from a registrar of your choice."

**Export — UNVERIFIED, likely none.** The help centre at
[help.dunked.com](https://help.dunked.com/) has categories for Account, Domains,
Pages, Project Media, Projects, SEO, Settings, Templates and Customization —
**and no export, backup or data-portability topic at all**.

**Most recent verified product activity: 31 March 2025**
([blog.dunked.com](https://blog.dunked.com/the-latest-from-dunked/)) — two new
templates, AI-powered SEO, enhanced password protection, Cloudflare delivery
across 335 data centres, GA4 support. That is roughly 17 months stale as of
today. The product is live and selling; the shipping cadence is not demonstrably
current.

**Biggest limitation:** a small, quiet vendor with no documented export path and
a 17-month-old last public update. This is a continuity risk, not a feature risk
— and it is exactly the risk this project exists to remove.

---

## 1.11 Semplice

A **WordPress plugin and theme**, not a hosted service. From
[semplice.com/get-semplice](https://www.semplice.com/get-semplice), fetched
2026-08-12 (note `/pricing`, `/compare` and `/buy` all 404):

| Tier     | Current price | Regular price | Domains                         |
| -------- | ------------- | ------------- | ------------------------------- |
| Single   | **$119**      | $148          | 1                               |
| Studio   | **$168**      | $229          | 1                               |
| Business | **$699**      | $799          | **10** ("only $69 per license") |

"No monthly subscription, you only pay once" and "it's yours forever." A
third-party site listing Studio at $287 is stale.

**What it requires — this is the real cost.** Stated requirements: "WordPress
6.7+, PHP 7.4+, MySQL 5.6+ OR MariaDB 10.0+, The mod_rewrite Apache module." So
total cost = licence + WordPress hosting (typically $5–30/mo) + domain, plus you
own all maintenance, updates, backups and security.

**Support and refunds, verbatim:** "We're **not providing direct support at this
time**; that's the only way we can keep prices low." And: "Due to the nature of
our product, **we're currently unable to offer a refund**."

**Export — the lowest lock-in of any commercial product here.** Content lives in
your own WordPress database on your own host. Standard WordPress WXR/XML export,
full database dumps and file-level backups all apply; you can migrate hosts
freely. Losing the licence costs you the Semplice-specific layout rendering,
never the content or the domain.

**Actively developed:** latest version **7.3.5, released 13 July 2026**, with
7.3.4 (13 Jul 2026), 7.3.3 (3 Jul 2026), 7.3.2 (2 Jul 2026)
([semplice.com/changelog](https://www.semplice.com/changelog)).

**Biggest limitation:** you must run and maintain WordPress, with no hosting, no
CDN, no managed updates and explicitly no direct support. Highest technical
burden here, traded for the best data ownership.

---

## 1.12 Super.so (Notion → website)

From [super.so/pricing](https://super.so/pricing), fetched 2026-08-12.

**Pricing is per site, not per account.** Verbatim: "Plans apply to a single site
and work on a **per-site per-month basis**."

| Plan     | Monthly         | Annual           | Custom domain |
| -------- | --------------- | ---------------- | ------------- |
| Free     | $0              | $0               | **No**        |
| Personal | **$16/site/mo** | **$144/site/yr** | Yes           |
| Pro      | **$28/site/mo** | **$252/site/yr** | Yes           |
| Custom   | from $50 + fees | —                | Yes           |

Analytics is billed separately: **$10/mo (up to 10,000 views) scaling to $400+/mo
(20M+ views)** across 12 tiers. Teams is $5/member/mo or $50/member/yr.

Super raised the entry tier from **$12 to $16/mo — a 33% increase** — reportedly
in 2025. **The exact date is UNVERIFIED** (third-party aggregators only).

**Free tier** allows one active free site on a `super.site` subdomain, theme
customisation, support, and notably no limit on pages or content — "as many pages
as you want on your free site." It forbids custom domain, custom code, password
protection, custom fonts, RSS/ATOM, SSL, SEO features, manual publishing,
advanced search, file uploads, redirects and page hiding, multi-language and
priority support, and forces a "Made with Super" badge.

**Export — low content lock-in, moderate design lock-in.** Structurally the best
position of any hosted service here: all content lives in Notion, which you own
and can export (below). Super is only the rendering and hosting layer. Leaving
costs you the theme, custom code and domain configuration, not the writing or
images.

**Biggest limitation:** per-site billing punishes anyone with more than one
portfolio, and cost stacks fast — $16 + $10 analytics = $26/mo minimum for a site
with basic traffic stats. You also inherit every Notion limitation underneath.

---

## 1.13 Notion itself as a website

Sources: [notion.com/pricing](https://www.notion.com/pricing),
[Notion Sites availability & pricing](https://www.notion.com/help/notion-sites-availability-and-pricing),
[public pages and web publishing](https://www.notion.com/help/public-pages-and-web-publishing),
[export your content](https://www.notion.com/help/export-your-content), all
fetched 2026-08-12.

| Plan       | Monthly (per user) | Annual                |
| ---------- | ------------------ | --------------------- |
| Free       | $0                 | $0                    |
| Plus       | **$10/user/mo**    | ~$8/user/mo (20% off) |
| Business   | **$20/user/mo**    | ~$16/user/mo          |
| Enterprise | Custom             | Custom                |

**Custom domain on free Notion: definitively no.** It is both paid-plan-only and
a separate paid add-on on top of the plan — **$8/month per domain paid annually,
or $10/month paid monthly**, and buying it is what removes Notion branding.
Notion's own wording: "Once a workspace owner **on a paid plan** connects a custom
domain with Sites, they'll be charged an additional $10 per month." Plus and
Business additionally include five `notion.site` vanity subdomains. A cap of 25
custom domains per workspace appears in third-party sources — **UNVERIFIED
against Notion docs**.

Free-plan feature list, verbatim: "Publish an unlimited number of Notion Sites,"
"Claim one `notion.site` domain," "Turn on search engine indexing." Paid adds:
"Claim up to five `notion.site` domains," "Set a Homepage for your domains,"
"Customize your Notion Sites," "Integrate your Notion Sites with Google
Analytics."

Hard free-plan limits: **file uploads capped at 5 MB**, 10 external guests, 7-day
page history, and block limits once a workspace has 2+ members.

**Minimum realistic cost for a Notion portfolio on your own domain: $10/user/mo
(Plus) + $8/mo (domain, annual) = $18/mo, or $20/mo on monthly billing.** That
makes Notion one of the _more_ expensive options here, not a cheap one — for a
site with almost no design control.

**SEO caveat, verbatim:** "Notion Sites can take up to four weeks to be indexed
and appear in search results."

**Export — best in class.** Formats: **PDF, HTML, Markdown and CSV**. "Any
non-database Notion page can be exported as a Markdown file. Full page databases
will be exported as a CSV file." Restrictions: form views cannot be exported;
custom emoji do not survive PDF export; failed PDF exports silently fall back to
HTML; full-workspace PDF export requires Business or Enterprise; workspace
exports take "up to 30 hours to process" and the download link "expires after 7
days."

On performance, a Hacker News commenter measuring a Notion-based site builder:

> "notion websites are so slow. Google's page speed for your home page has a
> score of 42. Why does it say 'fast page speed' and 'great seo'?"
> — itake, 2021-10-21, [news.ycombinator.com/item?id=28947577](https://news.ycombinator.com/item?id=28947577)

**Biggest limitation:** the 5 MB upload cap is fatal for image-heavy portfolios,
and the real cost of a custom domain makes the "free website" framing misleading.

---

## 1.14 Contra

From [contra.com/pricing](https://contra.com/pricing) and
[contra.com/portfolios](https://contra.com/portfolios), fetched 2026-08-12.

| Plan | Price                                 |
| ---- | ------------------------------------- |
| Free | **$0/mo**                             |
| Pro  | **$29/mo or $199/year** ("saves 43%") |

**"Commission-free" needs an asterisk.** The free tier carries per-payment fees:

| Fee                 | Free                                  | Pro  |
| ------------------- | ------------------------------------- | ---- |
| Client payment fee  | **$15, or $29 per payment over $500** | None |
| Digital product fee | **Capped 5% (min $3 — max $29)**      | None |
| Crypto fast payout  | 2%                                    | 2%   |

Page disclaimer: "This does not include payment processing fees charged by
third-party providers." So "commission-free" means no _percentage_ commission on
services — there is still a flat per-transaction charge on free. Pro pays for
itself at roughly one $500+ invoice per month.

**Free tier** gives a portfolio at `[handle].contra.com`, the **Sydney template
only**, inquiries, project management and commission-free payments subject to the
flat fees. It forbids all other templates, customisation and branding options,
custom domain, the full analytics dashboard, priority placement in search,
priority 24/7 support, and boosted visibility in Discover and job listings.

**Custom domain: Pro only.** "With a Contra Pro subscription, you can connect your
portfolio to a custom domain." Cheapest **$199/yr** — the most expensive
custom-domain gate in this entire dossier.

**Export — UNVERIFIED, no documented export.** The
[Contra help centre](https://help.contra.com/en/) has collections for Getting
started, Your Contra account, Payments, Find work and Community — no export or
data-portability topic. Assume full lock-in.

**Biggest limitation:** it is a marketplace first and a portfolio second. Your
discoverability is a lever Contra controls and sells back to you ("priority
placement," "boosted visibility").

---

## 1.15 Journo Portfolio

From [journoportfolio.com/pricing](https://www.journoportfolio.com/pricing/),
fetched 2026-08-12. Prices displayed in USD; "We automatically offer our plans in
one of 29 billing currencies based on your location."

| Plan      | Monthly | Annual (per mo) | Annual total |
| --------- | ------- | --------------- | ------------ |
| Free      | $0      | $0              | $0           |
| Plus      | **$8**  | **$5**          | $60/yr       |
| Pro       | **$12** | **$8**          | $96/yr       |
| Unlimited | **$18** | **$14**         | $168/yr      |

| Feature             | Free               | Plus   | Pro     | Unlimited |
| ------------------- | ------------------ | ------ | ------- | --------- |
| Portfolio items     | **10**             | 50     | 1,000   | Unlimited |
| Pages               | **Home page only** | 5      | 10      | Unlimited |
| Custom domain       | **No**             | **No** | **Yes** | Yes       |
| Article backups     | No                 | Yes    | Yes     | Yes       |
| Languages           | —                  | —      | 3       | Unlimited |
| Collaborators       | —                  | —      | 2       | Unlimited |
| Video/audio upload  | —                  | —      | 120 min | 240 min   |
| Password protection | No                 | No     | Yes     | Yes       |
| Built-in store      | No                 | No     | No      | Yes       |

**Custom domain:** cheapest is **Pro, $8/mo annual**. Note that Plus at $5–8/mo
does _not_ include one. Domain changes after registration cost about $10 on Pro;
transfers to personal accounts are free.

**The standout feature is article backups:** "Automatically backup online articles
as PDFs/screenshots in case they ever go offline," on Plus and above. For
journalists this is the core value — insurance against publisher link-rot.

**Export — partial, PDF only.** You can "export all the articles on your site as
a PDF for printing and sharing" and "export a list of all your articles"
([help.journoportfolio.com](https://help.journoportfolio.com/v2/settings-and-analytics/how-to-export-your-site-as-a-pdf)).
There is no full site or structured data export. PDF is a presentation format,
not a migration format.

Whether a Journo Portfolio badge appears on free sites is not stated —
**UNVERIFIED**. Store transaction fees are undisclosed — **UNVERIFIED**.

---

## 1.16 Authory

From [authory.com/pricing](https://authory.com/pricing), fetched 2026-08-12.

| Plan         | Monthly    | Annual (per mo) | Annual total |
| ------------ | ---------- | --------------- | ------------ |
| Free         | $0 forever | —               | —            |
| Lite         | **$12**    | **$9**          | $108/yr      |
| Standard     | **$19**    | **$15**         | $180/yr      |
| Professional | **$29**    | **$24**         | $288/yr      |

A 14-day trial of Standard or Professional exists _in addition to_ the permanent
free plan.

| Feature                           | Free   | Lite   | Standard  | Professional |
| --------------------------------- | ------ | ------ | --------- | ------------ |
| Content items                     | **10** | 50     | Unlimited | Unlimited    |
| Sources monitored                 | **0**  | **0**  | Unlimited | Unlimited    |
| Smart Share links                 | 1      | 5      | Unlimited | Unlimited    |
| Custom domain                     | No     | **No** | **Yes**   | Yes          |
| Remove Authory branding           | **No** | Yes    | Yes       | Yes          |
| Auto-import past & future work    | No     | No     | Yes       | Yes          |
| Google Analytics & Search Console | No     | No     | **No**    | **Yes**      |
| Free domain (12 mo, yearly plans) | No     | No     | Yes       | Yes          |

**The free plan blocks search engine indexing** — a portfolio search engines
cannot see. It also excludes auto-updating, custom domain, password protection,
secret links, audio/video uploads and API access, and Authory branding cannot be
removed below Lite.

**Real functionality starts at Standard ($180/yr).** Free and Lite monitor _zero_
sources, which disables the auto-updating archive — Authory's entire reason to
exist. The cheap tiers are effectively demos.

**Export:** "searchable archive with full backups" is listed on all plans
including Free, but **export formats and whether the archive can be extracted are
not specified — UNVERIFIED**.

---

## 1.17 Copyfolio

From [copyfol.io/pricing.html](https://copyfol.io/pricing.html), fetched
2026-08-12 (the site uses `.html` paths; `/pricing` 404s).

**The free plan is gone.** Copyfolio now offers only a **7-day free trial**:
"Start your trial today and enjoy **7 days of Premium** on us… No credit card
needed."

| Plan       | Price                                                                                   |
| ---------- | --------------------------------------------------------------------------------------- |
| Free trial | $0, 7 days, no card                                                                     |
| Premium    | **$15/month**, or **$108/year** (page says "Save $72" against $180, so $9/mo effective) |

This is a change from its historical model. A 2022 Copyfolio blog post describes
a genuine free tier — "the free tier restricts users to a basic three-page site
structure" with an unremovable "Made with Copyfolio" badge and no custom domain
([blog.copyfol.io, 14 Jul 2022](https://blog.copyfol.io/explore-copyfolio-premium)).
**The date the free plan was discontinued is UNVERIFIED.**

**Custom domain: Premium only.** There is no free path to one.

**Export:** none documented. Given shared ownership with UXfolio, where export is
explicitly confirmed impossible, assume full lock-in.

**Biggest limitation:** there is no free tier at all any more — after seven days
it is pay or lose the site. Combined with no export, Copyfolio has the shortest
runway of any product here.

---

## 1.18 UXfolio

**Same company as Copyfolio, same price to the dollar.** "Copyfolio is a web
service product, developed by **UXfolio LLC**" and "Copyfolio is part of the
**Folio product family** (including UXfolio and **Archifolio** as well)."

From [uxfol.io/pricing](https://uxfol.io/pricing), fetched 2026-08-12:

| Plan                | Price                                |
| ------------------- | ------------------------------------ |
| Free trial          | $0, **7 days**, no credit card       |
| Full Access monthly | **$15/month**                        |
| Full Access yearly  | **$108/year** = $9/month (saves $72) |

**The free trial cannot publish.** It allows "Unlimited draft portfolios,"
"Unlimited draft case studies," 4 AI actions, basic customisation and device
mockups. It forbids publishing live portfolios or case studies, custom domains,
feedback collection, Google Analytics 4, and password protection. UXfolio
branding is present and cannot be removed.

A portfolio tool whose free tier forbids publishing a portfolio is the sharpest
single illustration of the free-tier problem in this dossier. Third-party sources
still describe a permanent free plan ("you can create just one portfolio and one
case study"); the live page as of 2026-08-12 shows only the 7-day trial. The live
page is authoritative; **the discontinuation date is UNVERIFIED**.

**Export — explicitly impossible.** Quoted from UXfolio's own help content:
**"You can't export your portfolio from UXfolio."** Mitigating detail: cancelling
does not delete your work — published case studies are converted to drafts rather
than removed.

---

## 1.19 Behance

| Tier        | Price                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| Free        | **$0** — "no restrictions on the number of projects a member can create" |
| Behance Pro | **US$11.49/mo**, 7-day free trial                                        |

**Behance Pro raised its price ~15% since launch.** It launched **13 March 2024**
at **$9.99/mo** ([behance.net/blog/behance-pro](https://www.behance.net/blog/behance-pro),
[Creative Bloq](https://www.creativebloq.com/news/adobe-behance-pro)) and is
**$11.49/mo** on the live page as of 2026-08-12.

**The fee cliff between free and Pro is the story:**

|                                         | Free       | Pro                                                      |
| --------------------------------------- | ---------- | -------------------------------------------------------- |
| Platform fee on transactions            | **15–30%** | **0%**                                                   |
| Advanced analytics                      | No         | Yes                                                      |
| Adobe Portfolio                         | No         | **Yes — up to 5 websites**, free hosting, custom domains |
| Password protection / link-only sharing | No         | Yes                                                      |
| Scheduled publishing                    | No         | Yes                                                      |
| Boost (project promotion)               | No         | Yes                                                      |
| Profile customisation / dark mode       | No         | Yes                                                      |
| Exclusive job recommendations           | No         | Yes                                                      |

Pro's own framing: "100% of your revenue goes directly to you (aside from payment
processing fees from Stripe and PayPal)."

**No custom domain on Behance itself.** You get `behance.net/[username]` and
nothing more. A custom domain requires Adobe Portfolio, which is bundled into
Behance Pro.

**Account and terms:** `behance.net/misc/terms` issues an HTTP 302 redirect to
`adobe.com/legal/terms.html` (verified 2026-08-12). Behance is governed by
Adobe's General Terms of Use, not a Behance-specific agreement — an Adobe ID is
the account system. **The specific content-licence clause text is UNVERIFIED**;
`adobe.com/legal/terms.html` timed out on every attempt. Read Adobe's General
Terms, "Your Content," manually before publishing any ownership claim.

**Export:** none. Behance is a profile on someone else's network, not a site you
hold. Projects can be re-uploaded elsewhere by hand, but there is no bulk export,
no domain to redirect and no way to carry followers or your URL.

**Biggest limitation:** you have no URL of your own and no ownership of your
audience, free-tier commerce is taxed at 15–30%, and the property exists to sell
Creative Cloud.

---

## 1.20 Dribbble

From [dribbble.com/pro](https://dribbble.com/pro), fetched 2026-08-12
(`dribbble.com/pricing` 404s). **All Pro tiers are annual-billing only — no
monthly option is offered.**

| Plan     | Price                    | Annual total  |
| -------- | ------------------------ | ------------- |
| Free     | **$0**                   | $0            |
| Lite     | **$4/mo billed yearly**  | $48/yr        |
| Standard | **$8/mo billed yearly**  | $96/yr        |
| Plus     | **$99/mo billed yearly** | **$1,188/yr** |

| Feature                                  | Free   | Lite       | Standard       | Plus       |
| ---------------------------------------- | ------ | ---------- | -------------- | ---------- |
| **Shot uploads per day**                 | **10** | 15         | 25             | 50         |
| Number of services                       | **1**  | 3          | 25             | 50         |
| Project Brief credits                    | 15/mo  | 30/mo      | 150/mo         | 300/mo     |
| Appear in Recommendations & InstantMatch | **No** | Yes        | Yes            | Yes        |
| Ranking boost                            | —      | Lite level | Standard level | Plus level |
| Boosted Shot credit                      | —      | $30/mo     | $300/mo        | $300/mo    |
| **Personal website (Playbook)**          | **No** | Yes        | Yes            | Yes        |
| Enhanced profile layout                  | No     | Yes        | Yes            | Yes        |
| Google Analytics tracking                | No     | No         | Yes            | Yes        |
| Team seats                               | —      | —          | 3              | 10         |
| 0% designer platform fee                 | No     | No         | Yes            | Yes        |
| 0% client platform fee                   | No     | No         | No             | Yes        |
| Ad-free browsing                         | Yes    | Yes        | Yes            | Yes        |

**How many shots on free: 10 per day.** That is a rate limit, not a lifetime cap;
no total shot cap is disclosed. An older developer-docs figure of "48 shots per
month and five per day" dates to about 2015 and is superseded.

**The website feature is paid.** "Personal website (Playbook)" is unavailable on
Free and starts at **Lite, $48/yr** — the cheapest "portfolio site" entry point in
this dossier, though it is a Dribbble-hosted profile site. **Whether Playbook
supports a custom domain is UNVERIFIED.**

**Dribbble now sells search ranking.** Paying more literally buys placement above
other designers.

**2023–2025 changes — partially verified:**

| Claim                                                                                                                                                                                                                                                                         | Status                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tiny acquired Dribbble in 2017 for $5.5M (70% stake); revenue >$16M by 2022; valuation $7.9M (2017) → ~$80M (2022)                                                                                                                                                            | Verified — [uxplaybook.org, 24 Mar 2025](https://uxplaybook.org/articles/why-designers-are-leaving-dribbble)                                                                                                                                                |
| **Removal of external profile links** — designers can no longer display links to LinkedIn, personal websites or rival hiring platforms unless clients pay through Dribbble's system. A designer quoted: "no showcasing of social links on your profile? That's just too far." | Reported; **exact date UNVERIFIED** — same source                                                                                                                                                                                                           |
| June 2024: some premium features unlocked for free; new job-board features for hirers                                                                                                                                                                                         | [alternativeto.net, Jun 2024](https://alternativeto.net/news/2024/6/)                                                                                                                                                                                       |
| "Dribbble removed the free tier"                                                                                                                                                                                                                                              | **NOT SUPPORTED.** A free tier demonstrably exists today with shot uploads, client leads, 15 brief credits/mo and ad-free browsing. The 2024 change moved _toward_ free access                                                                              |
| "Dribbble removed the job board"                                                                                                                                                                                                                                              | **UNVERIFIED, and evidence points the other way.** The current page centres "Project Briefs" rather than a classic job board, and June 2024 reporting describes _new_ job-board features. A rename or restructure is plausible; a shutdown is not confirmed |
| Layoffs                                                                                                                                                                                                                                                                       | **UNVERIFIED**                                                                                                                                                                                                                                              |

**Biggest limitation:** the removal of external profile links is the single most
hostile design decision for a portfolio owner — Dribbble actively prevents you
directing traffic to your own site. Add annual-only billing with no monthly
escape hatch, a 10/day upload throttle on free, and $1,188/yr for the top tier.

---

## 1.21 Cross-cutting findings across all twenty competitors

### Cheapest path to a custom domain

| Rank | Platform                 | Cost                               | Note                                            |
| ---- | ------------------------ | ---------------------------------- | ----------------------------------------------- |
| 1    | **Carrd Pro Standard**   | **$19/yr**                         | One-page sites only                             |
| 2    | **Pixpa Basic**          | **$36/yr** promo, ~$48/yr standard | 200-image cap                                   |
| 3    | **Dribbble Lite**        | $48/yr                             | Playbook profile site; custom domain UNVERIFIED |
| 4    | **Journo Portfolio Pro** | $96/yr                             |                                                 |
| 4=   | **Dunked Professional**  | $96/yr                             |                                                 |
| 6    | **Copyfolio / UXfolio**  | $108/yr                            | Same vendor, identical price                    |
| 7    | **Framer Basic**         | $120/yr                            | Free domain included                            |
| 8    | **Behance Pro**          | $137.88/yr                         | Includes Adobe Portfolio, 5 sites               |
| 9    | **Super.so Personal**    | $144/yr **per site**               |                                                 |
| 10   | **Cargo Standard**       | $168/yr                            | Unlimited pages and bandwidth                   |
| 11   | **Webflow Basic**        | $180/yr                            | Plus $228/yr Workspace if you want code export  |
| 11=  | **Authory Standard**     | $180/yr                            |                                                 |
| 13   | **Wix Light**            | $204/yr                            |                                                 |
| 13=  | **Format Pro**           | $204/yr regular                    |                                                 |
| 15   | **Notion Plus + domain** | ~$216/yr                           |                                                 |
| 16   | **Squarespace Basic**    | $228/yr                            |                                                 |
| 17   | **Contra Pro**           | $199/yr                            | Marketplace, not a site                         |
| —    | **Semplice**             | **$119 once** + WordPress hosting  | Best long-run economics; you run the server     |

### Export portability, ranked best to worst

1. **Semplice** — your own WordPress database; WXR/SQL export; host-portable.
2. **Carrd** — unminified HTML, CSS, JS and images at $9–19/yr, nothing lost but
   server-side form processing.
3. **Notion / Super.so** — content exports as Markdown, HTML, CSV, PDF. Design is
   lost, content is not.
4. **Webflow** — full static export, but needs a $16–19/mo Workspace _on top of_ a
   site plan, and loses all CMS, ecommerce and forms.
5. **Squarespace** — XML text export that specifically excludes portfolio pages,
   galleries, Custom CSS and all styling.
6. **Journo Portfolio** — PDF of articles plus an article list. Presentation
   format, not migratable.
7. **Authory** — full backups on all plans, extraction path undocumented.
8. **Pixpa** — images, CSV orders and invoices retrievable; site explicitly
   non-portable.
9. **Adobe Portfolio** — no export, and the site goes dark 14 days after
   cancellation.
10. **UXfolio / Copyfolio** — "You can't export your portfolio from UXfolio."
11. **Framer / Format / Cargo / Dunked / Contra / Behance / Dribbble** — no export
    mechanism documented anywhere.
12. **Wix** — actively documents that leaving is impossible.

### Documented price and structure changes, 2024–2026

| Date                   | Platform    | Change                                                                       |
| ---------------------- | ----------- | ---------------------------------------------------------------------------- |
| Oct 2024               | Squarespace | Taken private by Permira for $7.2B                                           |
| Nov 2024               | Framer      | Localisation priced per locale; widespread backlash                          |
| Dec 2024               | Webflow     | Seat restructure                                                             |
| 15 Jan 2025            | Adobe       | Photography 20GB plan closed to new customers                                |
| 17 Jun 2025            | Adobe       | CC All Apps ($59.99) ended for new North American customers                  |
| Aug 2025               | Adobe       | Replaced by CC Standard $54.99 / CC Pro $69.99 (up to +16.7%)                |
| Oct 2025               | Framer      | Personal/Mini plan ($60/yr) removed; CMS cut to one; bandwidth 50 GB → 10 GB |
| 2025 (date UNVERIFIED) | Super.so    | Entry tier $12 → $16/mo (+33%)                                               |
| 15 Jan 2026            | Adobe       | Photography 20GB: $9.99 → $14.99/mo annual-billed-monthly (+50%)             |
| 13 May 2026            | Webflow     | CMS + Business merged into Premium; new $2,500/mo Team plan                  |
| May 2026               | Framer      | Editor seats **cut** $40 → $20; $10 Content Editor role added                |
| ~6 Jul 2026            | Squarespace | +19% to +26% on annual plans, no public announcement                         |
| by Aug 2026            | Behance     | Pro $9.99 → $11.49/mo (~+15% since launch)                                   |
| Date UNVERIFIED        | Copyfolio   | Permanent free plan replaced with a 7-day trial                              |
| Date UNVERIFIED        | UXfolio     | Free plan replaced with a 7-day trial that forbids publishing                |
| Date UNVERIFIED        | Dribbble    | External profile links removed from profiles                                 |

### The structural opening

Every platform in this set either **meters the portfolio** (pages, images, CMS
items, bandwidth) or **refuses to give the work back** — and most do both.

- Only **Carrd** and **Semplice** offer clean portability, and Carrd cannot build
  a multi-page portfolio while Semplice requires you to run WordPress.
- Only **Cargo** and **Pixpa's upper tiers** stop metering the portfolio, and
  neither documents any export.
- **Three platforms forbid publishing at all on their free tier** (Cargo, UXfolio,
  and Squarespace's trial), and two more make the free tier unusable
  professionally (Wix's scrolling ad banner, Webflow's 2-page cap).
- **Nobody offers unmetered multi-page portfolio hosting with real source
  export.**

---

# 2. Open-source and self-hosted alternatives

The question this section answers is not "does open-source software for websites
exist" — obviously it does — but **at exactly which step does a non-technical
person stop.** Where possible the sticking point is quoted verbatim from the
project's own install documentation.

All GitHub metrics below were pulled from the authenticated GitHub REST API on
**2026-08-11/12**.

## 2.0 The three findings that frame everything else

**One. `awesome-selfhosted`'s "Static Site Generators" section is empty.** In a
list of over a thousand self-hostable applications with **312,029 stars**, the
category exists but contains zero entries — it says only "Please visit
[staticsitegenerators.bevry.me](https://staticsitegenerators.bevry.me),
[staticgen.com](https://www.staticgen.com)" and links away. There is **no
"portfolio builder" category at all**
([raw README, line 2074](https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md)).

**Two. The GitHub search space for "open source portfolio builder" is a
graveyard.** Sorted by stars, the highest-ranked genuine match is
[`arifszn/ezfolio`](https://github.com/arifszn/ezfolio) at **291 stars, last
pushed 2024-04-21**. Everything below it is single or double digits:
`hi-Kartik2004/CraftFolio` (23 stars, dead 2024-10, unlicensed),
`yeabnoah/Frame` (14, dead 2024-12), `ownz-network/ownz` (6),
`maheshpaulj/NoCodefolio` (4).

Meanwhile a GitHub search for repositories matching "portfolio website" with more
than 500 stars returns, at the top, **templates you fork and edit code in**:

| Stars  | Repo                                                                                              | Licence | Last push  | What it is                       |
| ------ | ------------------------------------------------------------------------------------------------- | ------- | ---------- | -------------------------------- |
| 17,436 | [academicpages/academicpages.github.io](https://github.com/academicpages/academicpages.github.io) | MIT     | 2026-08-03 | Jekyll template, **8,392 forks** |
| 8,026  | codewithsadee/vcard-personal-portfolio                                                            | MIT     | 2025-06-12 | Static HTML template             |
| 7,109  | adrianhajdin/project_3D_developer_portfolio                                                       | none    | 2024-10-29 | React/Three.js tutorial code     |
| 6,440  | soumyajit4419/Portfolio                                                                           | none    | 2025-10-17 | One person's React site          |
| 6,267  | Evavic44/portfolio-ideas                                                                          | MIT     | 2026-08-02 | A _list_ of ideas                |
| 2,772  | smaranjitghose/awesome-portfolio-websites                                                         | MIT     | 2024-08-02 | A _list_, dead 2 years           |

Not one of these is a builder. The 8,392 forks of academicpages are 8,392 people
who copied a repository and edited YAML.

**Three. Not one open-source Git-based CMS is genuinely no-code.** Decap, Tina,
Sveltia, Keystatic, Pages CMS and Front Matter all require hand-authoring a
schema file in YAML, JSON or TypeScript. The only genuinely no-code Git-based CMS
is **CloudCannon at $55/month, closed-source and not self-hostable**
([cloudcannon.com/pricing](https://cloudcannon.com/pricing/)).

---

## 2.1 Ghost

[ghost.org](https://ghost.org) · [TryGhost/Ghost](https://github.com/TryGhost/Ghost)
· **54,741 stars** · MIT · last commit 2026-08-11 · v6.57.1 released 2026-08-10.

### The prerequisites, verbatim

From [docs.ghost.org/install/ubuntu/](https://docs.ghost.org/install/ubuntu/)
(note `ghost.org/docs/install/*` now 301-redirects to `docs.ghost.org/*`):

> "Ubuntu 22.04, Ubuntu 24.04 or Ubuntu 26.04"
> "NGINX (minimum of 1.9.5 for SSL)"
> "A supported version of Node.js"
> "MySQL 8.0 or 8.4"
> "Systemd"
> "A server with at least 1GB memory"
> "A registered domain name"

> "Before getting started you should set up a working DNS A-Record from your
> domain, pointing to the server's IP address. This must be done in advance so
> that SSL can be configured during setup."

> "This install is **not** suitable for local use or contributing to core."

> "If you're comfortable installing, maintaining and updating your own software,
> this is the place for you."

### The exact commands

```
ssh root@your_server_ip
adduser <user>
usermod -aG sudo <user>
su - <user>
sudo apt-get update && sudo apt-get upgrade
sudo apt-get install nginx
sudo ufw allow 'Nginx Full'
sudo apt-get install mysql-server
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH 'caching_sha2_password' BY '<password>';
FLUSH PRIVILEGES;
sudo npm install ghost-cli@latest -g
sudo mkdir -p /var/www/sitename && sudo chown <user>:<user> /var/www/sitename
ghost install
```

Ghost even flags its own footgun: "Using the user name `ghost` causes conflicts
with the Ghost-CLI, so it's important to use an alternative name."

### Where a non-technical person stops

**Line one: `ssh root@your_server_ip`.** They do not have a server, do not have
SSH and do not have an IP address. Before that line they must already have bought
a VPS, registered a domain and configured a DNS A-record, because SSL setup fails
otherwise.

Past install, Ghost hands over ongoing responsibility. From the
[hosting guide](https://docs.ghost.org/hosting):

> "Whenever running a public-facing production web server it's critically
> important to keep all software up to date. If you don't keep everything up to
> date, you place your site and your server at risk of numerous potential
> exploits and hacks. If you can't manage these things yourself, ensure that a
> systems administrator on your team is able to keep everything updated on your
> behalf."

Plus a hardening checklist: run `mysql_secure_installation`, set up UFW rules for
ssh/nginx/http/https, disable SSH root and password logins.

### Shared hosting and cPanel are explicitly excluded

[docs.ghost.org/faq/supported-hosting-providers/](https://docs.ghost.org/faq/supported-hosting-providers/)
names two excluded categories verbatim:

> "Auto-installers such as Softaculous"
> "Shared/cPanel hosting designed for PHP applications"

And from the hosting guide: "Ghost can also run successfully with different
operating systems, databases and web servers, but these are not officially
supported or widely adopted, so your mileage may (will) vary."

This matters enormously. cPanel shared hosting at $3–5/month is exactly what a
non-technical person can buy. Ghost is the one thing they cannot run on it.

### Ghost's own accounting of self-hosting cost

From [docs.ghost.org/hosting](https://docs.ghost.org/hosting): base hosting "From
$10/mo", global CDN and WAF "From $20/mo", email newsletter delivery "From
$15/mo", analytics platform "From $10/mo", full site backups "From $5/mo", image
editor "From $12/mo" — roughly **$72/month of third-party services** to match
Ghost(Pro), with "Install & setup: Manual · Weekly updates: Manual · Server
maintenance & updates: Manual · SSL certificate: Manual."

Ghost's own conclusion: **"TLDR: If you're unsure: Ghost(Pro) is probably your
best bet."**

### Ghost(Pro) pricing

From [ghost.org/pricing](https://ghost.org/pricing/), fetched 2026-08-12, yearly
billing:

| Plan      | Price                     | Members   | Note                                             |
| --------- | ------------------------- | --------- | ------------------------------------------------ |
| Starter   | **$18/mo** billed yearly  | 1,000     | "Simple design settings" — **custom themes: No** |
| Publisher | **$29/mo** billed yearly  | 1,000     | 3 staff users, custom themes, paid subscriptions |
| Business  | **$199/mo** billed yearly | 10,000    | 15 staff users, priority support                 |
| Custom    | Custom                    | Unlimited | Dedicated IP, 99.9% uptime SLA                   |

The hosting guide says Ghost(Pro) starts "From $15/mo" while the pricing page
shows $18/mo. Cite $18.

### Ghost is not a portfolio tool

Its GitHub description is "Independent technology for modern publishing,
memberships, subscriptions and newsletters." Its content model is
posts / pages / tags / members — there is no first-class "project" or "case
study" entity. Of roughly 200 themes at
[ghost.org/themes](https://ghost.org/themes/), about 15–20 are portfolio-oriented
and priced **$35–$149**. Crucially, **portfolio themes require the $29/mo
Publisher plan** — the $18 Starter plan cannot install custom themes.

Customising a theme is a developer task: "Ghost themes use the Handlebars
templating language"; testing requires you to "globally install the `gscan` npm
package"; themes ship as zip uploads. **There is no visual theme editor anywhere
in Ghost.** The docs state the audience plainly: "The Ghost theme layer has been
engineered to give developers and designers the flexibility to build custom
publications."

---

## 2.2 WordPress

### Self-hosting requirements, verbatim

[wordpress.org/about/requirements/](https://wordpress.org/about/requirements/):
**PHP "Version 8.3 or greater"**, database **"MariaDB 10.11+ or MySQL 8.0+"**,
HTTPS **"Required for every install"**. "Apache or Nginx is recommended."

### The "famous 5-minute install", verbatim

[developer.wordpress.org install guide](https://developer.wordpress.org/advanced-administration/before-install/howto-install/):

> 1. "Download and unzip the WordPress package if you haven't already."
> 2. **"Create a database for WordPress on your web server, as well as a MySQL
>    (or MariaDB) user who has all privileges for accessing and modifying it."**
> 3. "(Optional) Find and rename `wp-config-sample.php` to `wp-config.php`, then
>    edit the file and add your database information."
> 4. "Upload the WordPress files to the desired location on your web server."
> 5. "Run the WordPress installation script by accessing the URL in a web
>    browser."

### Where a non-technical person stops

**Step 2.** "Create a database… as well as a MySQL user who has all privileges"
is not a sentence a photographer can act on. Step 4 requires FTP/SFTP credentials
and a client. In practice they escape via a host's one-click installer — at which
point they are on managed hosting and the "free, self-hosted" premise has quietly
evaporated.

### The hidden cost: page builders

Vanilla WordPress does not produce a designed portfolio. The de facto answer is a
commercial page builder.

| Builder                     | Price (verified 2026-08-12)                         | Source                                                                |
| --------------------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| Elementor Pro Essential     | **$49/year** (1 site)                               | [elementor.com/pricing-plugin](https://elementor.com/pricing-plugin/) |
| Elementor Pro Advanced Solo | $99/year                                            | same                                                                  |
| Elementor Pro Advanced      | $199/year                                           | same                                                                  |
| Elementor Pro Expert        | $399/year                                           | same                                                                  |
| Divi (yearly)               | **$89/year**                                        | [elegantthemes.com/join](https://www.elegantthemes.com/join/)         |
| Divi Pro (yearly)           | $277/year                                           | same                                                                  |
| Divi Lifetime               | $249 one-time                                       | same                                                                  |
| WPBakery Regular            | $82 lifetime (1 site) + $59/yr to keep auto-updates | [wpbakery.com/pricing](https://wpbakery.com/pricing/)                 |

A "free, self-hosted" WordPress portfolio realistically costs **$49–$89/year in
builder licensing** plus hosting, before a theme. All are annual subscriptions
that renew "at list price."

### Security and maintenance burden — the hard numbers

[Patchstack, "State of WordPress Security in 2026"](https://patchstack.com/whitepaper/state-of-wordpress-security-in-2026/),
verbatim:

> "Overall 11,334 new vulnerabilities were found in the WordPress ecosystem in
> 2025 – that's a 42% increase compared to 2024."
> "91% of new vulnerabilities were found in plugins, and 9% were found in themes.
> There were only 6 vulnerabilities reported in the WordPress core."
> "46% of vulnerabilities did not receive a fix from the developer in time for
> public disclosure."
> "1,966 (17%) vulnerabilities had a high severity score, meaning they were
> likely to be exploited in automated mass-scale attacks."
> "The weighted median time to first exploit is 5 hours."

The framing matters: WordPress core is nearly clean — six CVEs in a year. The
danger lives in the plugins a non-technical person must install to make it do
anything, including the page builder itself. And 46% of the time no fix exists
when the flaw goes public.

### wordpress.com free plan

From [wordpress.com/pricing](https://wordpress.com/pricing/), fetched 2026-08-12:

| Plan     | Monthly | Annual (per mo) | Storage  |
| -------- | ------- | --------------- | -------- |
| Free     | $0      | $0              | **1 GB** |
| Personal | $9      | **$4**          | 6 GB     |
| Premium  | $18     | **$8**          | 13 GB    |
| Business | $40     | **$25**         | 50 GB    |
| Commerce | $70     | **$45**         | 50 GB    |

Verbatim: **"Free sites display WordPress.com ads to visitors. Upgrade to
Personal to turn them off."** The free plan has no custom domain, no plugin
installation ("Installing plugins is available on all WordPress.com paid plans"),
and stats limited to the last 7 days.

### Core Web Vitals

WordPress is last among major platforms. From the HTTP Archive Core Web Vitals
Technology Report, November 2025 data, reported by
[Search Engine Journal, 19 Dec 2025](https://www.searchenginejournal.com/core-web-vitals-champ-open-source-versus-proprietary-platforms/563796/):

| Platform    | Sites passing CWV |
| ----------- | ----------------- |
| Duda        | **84.87%**        |
| Wix         | **74.86%**        |
| Squarespace | **70.39%**        |
| Drupal      | 63.27%            |
| Joomla      | 56.92%            |
| WordPress   | **46.28%**        |

A 38.59-point gap between best and worst. Note the awkward implication for
open-source advocacy: on this measure the proprietary hosted platforms currently
win, and any new open-source entrant has to beat 46% to be credible.

---

## 2.3 Static-site portfolio themes: Astro, Hugo, Jekyll, Next.js

### The workflow, proven against real popular starters

**[`alshedivat/al-folio`](https://github.com/alshedivat/al-folio)** — Jekyll
academic portfolio, **15,992 stars**, MIT, last commit 2026-08-10. Its own
"Quick Start Guide — Get your al-folio site running in 5 minutes"
([docs/QUICKSTART.md](https://raw.githubusercontent.com/alshedivat/al-folio/main/docs/QUICKSTART.md))
requires, verbatim:

> "Click the green 'Use this template' button (top right), then select 'Create a
> new repository'"
> "Go to your new repository → Settings → Actions → General → Workflow
> permissions → Select Read and write permissions"
> "Open `_config.yml` in your repository" and edit `title`, `first_name`,
> `last_name`, `url`, `baseurl` — with the warning "baseurl: # Leave this empty
> (do NOT delete it)"
> "Go to Settings → Pages → Set the branch to gh-pages (NOT main)"

Content editing, verbatim:

> "**Publications:** Add entries to `_bibliography/papers.bib`"
> "**Blog posts:** Create files in `_posts/` with format `YYYY-MM-DD-title.md`"
> "**Social media links:** Edit `_data/socials.yml`"
> "**Theme color:** Not a `_config.yml` key. In `v1.x` the palette lives in Sass
> tokens owned by the `al_folio_core` gem"
> README: "Everything is content-driven — you edit data files, not templates."

And for local work,
[docs/INSTALL.md](https://raw.githubusercontent.com/alshedivat/al-folio/main/docs/INSTALL.md):

> "If you are using Windows, it is highly recommended to use Windows Subsystem
> for Linux (WSL)"

**Sticking point:** BibTeX. YAML with a semantically significant empty value.
Filename-encoded dates. GitHub Actions workflow permissions. Sass tokens inside a
Ruby gem. WSL on Windows. **There is no admin UI of any kind.**

---

**[`dillionverma/portfolio`](https://github.com/dillionverma/portfolio)** — the
most-copied modern developer portfolio, **1,457 stars**, MIT, last commit
2026-01-13. Its README promises:

> "Setup only takes a few minutes by editing the single config file
> (`./src/data/resume.tsx`)"

That "single config file" is TypeScript with JSX imports:

```
import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";
import { ReactLight } from "@/components/ui/svgs/reactLight";
export const DATA = {
  name: "Dillion Verma",
  initials: "DV",
  skills: [ { name: "React", icon: ReactLight }, ... ],
```

**Sticking point:** a `.tsx` file with import statements and component
references. A trailing comma or a stray quote breaks the build with a stack
trace. Getting started locally is `git clone` → `cd` → `pnpm install` →
`pnpm dev`.

---

**[`manuelernestog/astrofy`](https://github.com/manuelernestog/astrofy)** — the
best-known Astro portfolio template, **1,423 stars**, MIT, **last commit
2024-07-04 (two years stale)**. Install is `pnpm install` then `pnpm run dev`;
content lives in `src/pages/index.astro`, `src/pages/cv.astro`,
`src/pages/projects.astro`, markdown in `src/content/blog/`, config in
`src/config.ts`. No admin UI.

**[`gurusabarish/hugo-profile`](https://github.com/gurusabarish/hugo-profile)** —
1,082 stars, MIT, last commit 2026-02-11. Requires "Hugo version 0.87.0 or
higher", then `hugo new site my-site --format="yaml"`, `cd my-site/themes`,
`git clone …`. Content is a roughly 600-line `hugo.yaml` where bio, job history,
skills and projects are nested YAML params.

**Toolchain prerequisites:**

- **Hugo** ([gohugo.io/installation/windows/](https://gohugo.io/installation/windows/)):
  Git ("Install a theme as a Git submodule"), Go 1.26.0+ if building from source,
  and Dart Sass — "required to transpile Sass to CSS when using the latest
  features of the Sass language." Install via `choco` / `scoop` / `winget`, or
  extract a binary and "add it to PATH."
- **Jekyll** ([jekyllrb.com/docs/installation/](https://jekyllrb.com/docs/installation/)),
  verbatim: "Ruby version 2.7.0 or higher, including all development headers",
  RubyGems, and "GCC and Make."
- **Astro** ([astro.build/themes](https://astro.build/themes/)): a Portfolio
  category exists — "Share your art, coding projects, music, and more with an
  Astro portfolio theme" — and the featured portfolio theme, Kinetic Studio, is
  **paid**. None of the featured themes advertise a CMS or admin UI. Exact theme
  counts per category are **UNVERIFIED** (client-rendered listing).

### The admin-UI layer: Git-based CMSs

|                    | Decap CMS           | TinaCMS             | Sveltia CMS           | Keystatic           | Pages CMS          | Front Matter          | CloudCannon    |
| ------------------ | ------------------- | ------------------- | --------------------- | ------------------- | ------------------ | --------------------- | -------------- |
| Stars              | **19,291**          | 13,721              | 2,692                 | 2,274               | 3,907              | 2,532                 | n/a            |
| Licence            | MIT                 | Apache-2.0          | MIT                   | MIT                 | MIT                | MIT                   | Proprietary    |
| Latest release     | 3.15.1 · 2026-07-24 | 3.11.0 · 2026-07-16 | v0.186.0 · 2026-08-11 | 0.6.5 · 2026-08-11  | 2.1.8 · 2026-06-08 | v10.11.0 · 2026-07-02 | SaaS           |
| Maturity           | 3.x stable          | 3.x stable          | **0.x pre-1.0**       | **0.x pre-1.0**     | 2.x                | 10.x                  | —              |
| Open issues        | 564                 | 384                 | 61                    | 155                 | 64                 | 102                   | —              |
| Bus factor         | ~1–2                | team                | **1**                 | small team          | **1**              | **1**                 | company        |
| Hand-write config? | yes, YAML           | yes, TS/JS          | yes, YAML             | yes, **TypeScript** | scaffolded YAML    | yes, JSON             | **no, visual** |
| **Truly no-code?** | No                  | No                  | No                    | No                  | No                 | No                    | **Yes**        |

#### Decap CMS is NOT unmaintained — correct that before it enters any copy

157 commits in the last twelve months and **12 releases** (3.8.4 → 3.15.1), the
latest on 2026-07-24; repo not archived
([github.com/decaporg/decap-cms](https://github.com/decaporg/decap-cms), API-verified
2026-08-11: 19,291 stars, MIT, last push 2026-08-11T08:57:51Z). Maintainer
`martinjagodic` on [issue #7607](https://github.com/decaporg/decap-cms/issues/7607)
(2025-09-18, closed six minutes later): **"It's actively maintained. Some months
we do more, some we do less. In summer, we shipped a bit less."**

The rumour came from a real 2024–25 slowdown including a three-month gap (3.6.2
on 2025-02-13 → 3.6.3 on 2025-05-15). The genuine structural risk is funding, in
the maintainer's own words
([Discussion #7419](https://github.com/decaporg/decap-cms/discussions/7419),
2025-02-27): **"There is no timeline for this as this is a non-funded open-source
project."**

Commercialisation is in flight:
[Discussion #7813, 2026-05-14](https://github.com/decaporg/decap-cms/discussions/7813)
announces **Decap Turbo**, "an optional upgrade… It adds a database proxy layer…
It also ships with centralized user management and (finally) permission roles…
the service is not live yet." Pricing and launch date **UNVERIFIED**.

#### The real Decap failure: Netlify Git Gateway is deprecated and the docs still recommend it

Two corrections first, because both rumours circulate:

- **Netlify Identity was NOT sunset.** The deprecation was announced and then
  reversed. Banner on
  [netlify.com/blog/auth0-extension-identity-changes](https://www.netlify.com/blog/auth0-extension-identity-changes/):
  **"Update, February 19, 2026: Netlify Identity will continue as a supported
  authentication option on Netlify."**
- **Git Gateway IS deprecated.** From
  [docs.netlify.com git-gateway](https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/),
  verbatim: "Git Gateway is deprecated. While Git Gateway continues to function
  for sites that currently have it enabled, new Git Gateway configurations are
  not recommended. While we will keep fixing any major security issues that
  arise, **we will no longer fix bugs in the functionality of Git Gateway**." The
  upstream repo `netlify/git-gateway` (431 stars, MIT) has been untouched since
  2024-05-14.

The maintainer, on the record in
[Discussion #7419](https://github.com/decaporg/decap-cms/discussions/7419):
**"Yes, Decap is basically married to Netlify Identity, and as maintainers, we
are aware that a divorce is long overdue."** And: "Yes, git gateway seems
abandoned. I believe Decap is the largest user, so it would make sense for us to
fork it if we decide to use it in the future."

Decap's own docs still route new users onto it with no warning
([choosing-a-backend](https://decapcms.org/docs/choosing-a-backend/)).

**Why this is the strongest single gap in the incumbent stack:** Git Gateway is
the _only_ path that lets a non-technical editor log in without a GitHub account.
That path is now deprecated.

#### Decap's three walls

[decapcms.org/docs/install-decap-cms/](https://decapcms.org/docs/install-decap-cms/)
requires hand-creating two files, `admin/index.html` and `admin/config.yml`. The
docs: "The second file, `admin/config.yml`, is the heart of your Decap CMS
installation." All collections, fields, widgets, slugs and media paths are
hand-written YAML. **There is no GUI config builder.**

For auth without Netlify: "GitHub requires a server for authentication"
([github-backend](https://decapcms.org/docs/github-backend/)) and "all users must
have push access to your content repository for this to work." The alternative,
[external OAuth clients](https://decapcms.org/docs/external-oauth-clients/),
lists **21 separate community-maintained OAuth proxy implementations** across
Node, Go, Python, PHP, Rust, Lambda, Azure Functions, Cloudflare and Vercel. The
existence of 21 competing unofficial auth proxies is itself the proof that
onboarding is unsolved.

A third-party patch exists — **DecapBridge** ([decapbridge.com](https://decapbridge.com)),
free for 3 sites / 10 collaborators, $9/mo Professional, $199 one-time Lifetime
Pro. Its author on Hacker News: _"asking non-devs to create a github account
always felt a bit weird to me."_

#### TinaCMS is not discontinued

v3.11.0 shipped 2026-07-16; active multi-contributor team; v4 in development
([tina.io/whats-new/tinacms](https://tina.io/whats-new/tinacms)). The shutdown
people remember is its predecessor **Forestry, killed April 2023**. Self-hosting
is Apache-2.0 and free, but
[tina.io/docs/self-hosted/overview](https://tina.io/docs/self-hosted/overview)
requires you to supply three modules yourself: an "Auth Provider", a "Database
Adapter" and a "Git Provider" — plus "Note: Some features are not available when
self-hosting TinaCMS." Which features is **UNVERIFIED**; the limitations page
404s. Tina Cloud: Free $0 forever (2 users), Team $24/mo, Team Plus $41/mo,
Business $249/mo ([tina.io/pricing](https://tina.io/pricing)).

#### Sveltia CMS — beta disclaimer deleted, still v0.x

The old README at tag `v0.100.0` said: "Sveltia CMS is currently in _beta_ and
version 1.0 (GA) is expected to ship in late 2025." The current README has no
project-status section at all and now reads "Sveltia CMS is a **leading**
Git-based headless CMS for Jamstack sites." It is at **v0.186.0** and the roadmap
now says v1.0 is "Expected in late 2026" — a full year's slip — hard-blocked on
an external dependency: **"PKCE for GitHub — We are waiting for GitHub to support
client-side PKCE authentication for single-page apps. Sveltia CMS v1.0 will not
be released until this is supported."**
([sveltiacms.app/en/docs/roadmap](https://sveltiacms.app/en/docs/roadmap)).
Editorial workflow and nested collections are unshipped. Bus factor 1.

Its one genuine UX win is "Sign In with Token" — paste a GitHub personal access
token, no OAuth app, no proxy. Still requires a GitHub account and knowing what a
PAT is.

#### Keystatic — not abandoned, but had an eight-month silent gap

Thinkmill's `dcousens` on
[Discussion #1442](https://github.com/Thinkmill/keystatic/discussions/1442),
2025-08-05: "Keystatic is not abandoned. Thinkmill is actively using,
maintaining, and investing in these projects — just not always in public." But
npm shows `@keystatic/core@0.5.48` (2025-07-23) → `0.5.49` (2026-03-23) — an
**eight-month hole**. Community sentiment during it
([Discussion #1467](https://github.com/Thinkmill/keystatic/discussions/1467),
2025-10-18): _"Came here for the same question. I'm afraid the silence is the
answer. Very unfortunate, because it looked exactly what I needed."_

Keystatic is the least accessible of the group: its content model is executable
TypeScript (`keystatic.config.ts` importing `config, fields, collection` from
`@keystatic/core`), requiring npm, a build toolchain and a running dev server.

#### Pages CMS — lowest friction of the group, and still not enough

[pagescms.org](https://pagescms.org/): "The simplest CMS you'll ever need… Manage
content and media right in your GitHub repository. No database, no API, no extra
backend." And "Yes, Pages CMS is 100% free." Its quick start is six steps and
step 5 — "Create `.pages.yml` when prompted" — is **scaffolded by the app**, the
only tool in this category that does this. **It stops at step 3: "Install the
GitHub App on the account or organization that owns your repository."** The user
must already have a working static site in a repo. Self-hosting needs PostgreSQL
plus a GitHub App plus `.env.local`. Single maintainer.

#### Front Matter CMS — blocked at step zero

77,766 VS Code Marketplace installs, 5/5 stars. **You must install and use Visual
Studio Code.** There is no browser UI. Useful here only as evidence that even the
"easy" end of the category assumes an IDE.

#### CloudCannon — the price of no-code

Proprietary, not self-hostable. "Git-based CMS built for speed, security, and
zero headaches"; editors "update content on their own — no tickets, no pings"
using custom components without code. Pricing
([cloudcannon.com/pricing](https://cloudcannon.com/pricing/)): **Standard $55/mo**
(3 users), Team $350/mo (15 users), Enterprise custom, Partner Lite $10/mo.
21-day trial, no free tier.

**This is the pricing umbrella: the only genuinely no-code Git-based CMS costs
$55/month and you cannot host it yourself.**

---

## 2.4 Publii

[getpublii.com](https://getpublii.com) ·
[GetPublii/Publii](https://github.com/GetPublii/Publii) · **7,282 stars** ·
GPL-3.0 · last commit 2026-08-08 · v0.47.9 released 2026-07-23 · 291 open issues.

**Verdict: genuinely the most non-technical-friendly option in this whole
section, and structurally disqualified by being a desktop app.**

System requirements
([getpublii.com/docs/system-requirements.html](https://getpublii.com/docs/system-requirements.html)):
"a 64-bit version of Windows 10+", "a minimum of MacOS 11 or higher", Linux
"should work with all mainstream distributions."

### Desktop-only and single-user by design

Verbatim from
[Publii on multiple computers via Dropbox](https://getpublii.com/docs/publii-on-multiple-computers-via-dropbox.html):

> "Publii was originally designed to be utilized by a single user to build and
> maintain a static website."
> "if more than one user is editing the site content at a given moment and you
> are both connected to Dropbox, there may be some conflict between the changes
> and some of the content will be lost."

The official multi-device workaround is Dropbox, with the manual mitigation "you
can pause Dropbox from syncing your files… selecting the Pause syncing option." A
CMS whose collaboration story is "remember to pause Dropbox" is not a
collaborative CMS. No phone or tablet editing. If the laptop dies, the site data
dies with it — backups are manual.

### You still configure deployment yourself

[getpublii.com/docs/server-configuration.html](https://getpublii.com/docs/server-configuration.html)
offers FTP/SFTP, Amazon S3, GitHub Pages, GitLab Pages, Netlify, Google Cloud and
manual upload. For FTP/SFTP the user must supply Port (21 or 22), Server,
Username, Password and Remote Path ("usually `/public_html/`"), plus for key auth
"Your Key" and "Key Passphrase."

For GitHub Pages the documented procedure
([host-static-website-github-pages.html](https://getpublii.com/docs/host-static-website-github-pages.html))
is, verbatim: "In the left-sidebar of your profile screen, click on the Developer
settings" → "Click on the Personal access tokens option and select the Tokens
(classic) option" → "Click on the Generate new token button… and select Generate
new token (classic)" → "add a checkmark to the main Repo option" → "Click on the
Copy icon next to your token and copy it somewhere safe" — then create a repo,
commit a README, set Settings → Pages to `main`, return to Publii and enter
Username/Organization, Repository, Branch and Token.

**Sticking point:** Publii solves authoring beautifully and then hands the user a
**GitHub classic personal access token with `repo` scope**, or an FTP
host/port/remote-path triplet. And even past that wall, the site can only ever be
edited from one specific computer.

**A cautionary comparable:** [Gridea](https://github.com/getgridea/gridea) — the
same desktop-static-CMS concept, **10,265 stars**, MIT — **last commit
2023-07-26, last release v0.9.3 on 2022-05-17, 583 open issues**. A ten-thousand-
star project in this exact niche died.

---

## 2.5 Headless CMSs as a portfolio backend

|                 | Directus             | Strapi                  | Payload                 | KeystoneJS | Sanity              | Statamic             | Grav                |
| --------------- | -------------------- | ----------------------- | ----------------------- | ---------- | ------------------- | -------------------- | ------------------- |
| Stars           | 37,299               | **72,843**              | 44,098                  | 9,939      | 6,271               | 4,866                | 15,623              |
| Licence         | **MSCL-1.0-GPL**     | MIT + proprietary `ee/` | MIT                     | MIT        | MIT (Studio only)   | **Proprietary**      | MIT                 |
| Latest release  | v12.2.0 · 2026-07-29 | v5.51.2 · 2026-08-05    | v3.87.1 · 2026-08-06    | 2026-08-11 | v6.9.2 · 2026-08-11 | v6.27.1 · 2026-08-07 | 2.0.18 · 2026-08-11 |
| Builder or API? | **API**              | **API**                 | **API**                 | **API**    | **API (SaaS)**      | **BUILDER**          | **BUILDER**         |
| Runtime         | Node >=22            | Node 22/24/26           | Node ^18.20.2 or >=20.9 | undeclared | Node >=22.12        | PHP >=8.3            | PHP >=8.3.11        |
| Database        | SQL                  | SQL                     | yes                     | SQL        | hosted only         | optional             | **none**            |

All seven repos are active (`pushed_at` 2026-08-11, none archived).

### Three corrections to common assumptions

1. **Directus is no longer BSL 1.1.** As of **v12 (May 2026)** it is the
   "Monospace Sustainable Core License, Version 1.0" (`MSCL-1.0-GPL`)
   ([raw licence](https://raw.githubusercontent.com/directus/directus/main/license),
   [directus.com/mscl](https://directus.com/mscl),
   [v12 licence-change post](https://directus.com/resources/directus-v12-license-change)).
   It grants an additional GPL-3.0 licence "effective on the fourth anniversary"
   and forbids "Competing Use." Thresholds: "$5M in annual revenue" / "50
   employees."
2. **Payload Cloud is paused, not discontinued.** Verbatim from
   [payloadcms.com/cloud-pricing](https://payloadcms.com/cloud-pricing):
   **"Although deployment of new projects is currently paused, existing Cloud
   projects will continue running as normal."** Payload joined **Figma** on
   **2025-06-17** ([payloadcms.com/blog/payload-is-joining-figma](https://payloadcms.com/blog/payload-is-joining-figma),
   [figma.com/blog/payload-joins-figma](https://www.figma.com/blog/payload-joins-figma/):
   "Payload will remain an open-source product"). **The one-click managed escape
   hatch no longer exists for new users.** Historical Cloud pricing is
   UNVERIFIED — those pages 404.
3. **Payload v4 queues a Node jump.** Stable v3.87.1 declares
   `"node": "^18.20.2 || >=20.9.0"`; `main` is `4.0.0-canary.14` with
   `"node": ">=24.15.0"`.

### The decisive question: after installing, do you have a website?

**Directus — no.** [directus.com](https://directus.com/) hero: "The backend for
your whole team." Docs: "Directus is a backend for building your projects." After
`docker run -p 8055:8055 directus/directus` you get the Studio admin app and
REST/GraphQL APIs. No public site. Requirements: Node >=22, minimum 0.25 vCPU /
512 MB, recommended 1 vCPU / 2 GB, plus an SQL database. Pricing: Core $0 (3
seats, 25 collections, 5 flows); Team **$499/mo** annual or $599 month-to-month;
Enterprise custom; "Open Innovation Grant" free self-hosted or $99/mo Cloud for
organisations under $5M revenue and 50 employees
([directus.com/pricing](https://directus.com/pricing), fetched 2026-08-12).

**Strapi — no.** [docs.strapi.io/cms/intro](https://docs.strapi.io/cms/intro):
"Strapi is an open-source headless CMS that gives developers the freedom to
choose their favorite tools and frameworks." The Quick Start's own words after
you finish: **"give yourself a pat on the back — but you have yet to see the
final result"** — and the result is JSON at `/api/restaurants`. Requirements:
"Only Active LTS or Maintenance LTS versions are supported (currently `v22`,
`v24`, and `v26`)"; "Strapi does not support MongoDB (or any NoSQL databases)";
Python required for SQLite; production hardware recommended 2+ cores / 4 GB+ RAM
/ 32 GB+ disk. Pricing: self-host Community free, Growth $45/mo (+$15/seat),
Enterprise on request; **Strapi Cloud Starter $35/mo, Pro $90/mo, Business
$450/mo** ([strapi.io/pricing-cloud](https://strapi.io/pricing-cloud), fetched
2026-08-12).

**Payload — no.**
[Docs](https://payloadcms.com/docs/getting-started/what-is-payload): "Payload is
the Next.js fullstack framework." The Admin Panel is "The auto-generated, fully
type-safe React interface editors use to manage your data." It installs _into_ a
Next.js app — you write every line of that frontend yourself. Node 20.9.0+,
pinned Next.js ranges, pick a DB adapter.

**KeystoneJS — no.** Hero: "The superpowered CMS for developers… Describe your
schema, and you get a powerful GraphQL API & beautiful Management UI."
`npm run dev` gives "the Admin UI pages via Next.js on http://localhost:3000." A
non-technical user could genuinely believe they have a website until they try to
share the URL. Default SQLite is documented as "not intended to be used in
production systems." No `engines` field and no documented Node version
(**UNVERIFIED**). No hosted product at all.

**Sanity — no.** Hero: "The Content Operations Platform." Docs: "Sanity is a
fully customizeable all-code backend." Getting started immediately hands you a
menu of frontend frameworks to go learn. Studio is MIT and local; the Content
Lake is hosted SaaS and cannot be self-hosted (high-confidence inference; no
verbatim vendor sentence found, three architecture doc URLs 404'd —
**UNVERIFIED**). Pricing
([sanity.io/pricing](https://www.sanity.io/pricing), fetched 2026-08-12): **Free
$0 forever** — up to 20 seats, 2 datasets (public only), 10k documents, 1M API
CDN requests/mo, 250k API requests/mo, 100 GB assets, 100 GB bandwidth; Growth
**$15/seat/mo** (25k documents); Enterprise custom. Best free tier of the seven
for a solo user.

**Statamic — YES, a real builder, gated behind PHP and Composer.** README: "the
flat-first, Laravel + Git powered CMS designed for building beautiful, easy to
manage websites." The Control Panel is genuinely editor-grade: "Over 40 Unique
Fieldtypes", "Drag & Drop Nav Builder", "Inline Content Editing", "Live Preview",
and the Bard block editor. **65 starter kits** exist, including PersonaX
Multipurpose Portfolio Kit **$80**, Photographer **$70**, Rihan Model Portfolio
**$99**. Requirements ([statamic.dev/requirements](https://statamic.dev/requirements)):
**PHP 8.3+**, nine PHP extensions (BCMath, Ctype, Exif, JSON, Mbstring, OpenSSL,
PDO, Tokenizer, XML), GD or ImageMagick, and Composer. The licence is
**proprietary** — "Each licensed copy of the Software shall be actively installed
in no more than one production environment at a time" — and validation phones
home hourly to "The Outpost." Pricing
([statamic.com/pricing](https://www.statamic.com/pricing), fetched 2026-08-12):
**Core free** (one super-admin, one form, all frontend features); **Pro $349 per
site** including one year of updates, then **$99/yr**; Enterprise custom;
non-profits and education get 20% off; 14-day refund policy.
**Sticking point: `composer global require statamic/cli`.** Getting PHP 8.3 plus
Composer plus nine extensions onto a consumer Windows or macOS machine is a
harder lift than `npx`.

**Grav — YES, the closest thing to no-code, and free.** MIT, 15,623 stars,
released 2.0.18 on 2026-08-11. README: **"Grav is a Fast, Simple, and Flexible
file-based Web-platform. There is Zero installation required. Just extract the
ZIP archive, and you are already up and running."** No database. Grav 2.0 ships
"Admin Next" — "a modern single-page admin built on the Grav API and served by
the Admin2 plugin… It is the default admin in Grav 2.0, it is free, and it
installs at the same `/admin` route." From it a non-technical user can create and
edit pages and install plugins and themes from a browsable list. **128 themes**
and **56 "skeletons"** (complete ready-made sites) exist, including free
portfolio ones: Ceevee Site ("clean, modern, fully responsive site template for
your resume and portfolio"), Resume Site, Photographer Site, Webfolio, Nord
Resume, Brilliant Resume. Requirements: PHP 8.3.11+, a web server, 11 PHP
extensions.
**Sticking point: "Extract the zip file into your webroot."** A non-technical
user does not know what a webroot is and does not have a PHP 8.3.11+ server. No
`npx` one-liner, no official managed cloud. It is the lowest wall of the seven —
and it is still a wall, made entirely of hosting.
Documentation defect worth citing: Grav's 2.0 installation page still tells users
to verify "at least PHP version 7.3.6+" while the 2.0 requirements page mandates
8.3.11+. And Admin2 is a rewrite — the classic `grav-plugin-admin` is not
supported on 2.0, so third-party theme and plugin compatibility is a live
migration risk.

---

## 2.6 Actual open-source website and portfolio builders

### Visual builders — every one is a developer framework, not an end-user product

| Project                                                                                                  | Stars      | Licence             | Last commit    | What it actually is                                          |
| -------------------------------------------------------------------------------------------------------- | ---------- | ------------------- | -------------- | ------------------------------------------------------------ |
| [Webstudio](https://webstudio.is) · [webstudio-is/webstudio](https://github.com/webstudio-is/webstudio)  | **8,822**  | **AGPL-3.0**        | 2026-08-11     | Webflow alternative; **self-hosting explicitly discouraged** |
| [GrapesJS](https://grapesjs.com) · [GrapesJS/grapesjs](https://github.com/GrapesJS/grapesjs)             | **26,119** | BSD-3 (NOASSERTION) | 2026-08-11     | "framework for building your visual web builders"            |
| [Silex](https://www.silex.me) · [silexlabs/Silex](https://github.com/silexlabs/Silex)                    | 2,924      | AGPL-3.0            | 2026-08-11     | Free/libre visual page designer, non-profit                  |
| [Puck](https://puckeditor.com) · [puckeditor/puck](https://github.com/puckeditor/puck)                   | **13,112** | MIT                 | 2026-08-11     | React library — **you author the components**                |
| [Plasmic](https://www.plasmic.app) · [plasmicapp/plasmic](https://github.com/plasmicapp/plasmic)         | 6,951      | MIT                 | 2026-08-11     | SaaS visual builder                                          |
| [Builder.io](https://builder.io) · [BuilderIO/builder](https://github.com/BuilderIO/builder)             | 8,793      | MIT                 | 2026-08-11     | SDKs MIT, platform SaaS                                      |
| [Primo](https://primo.build) · [primocms/primo](https://github.com/primocms/primo)                       | 2,359      | MIT                 | 2026-08-03     | Go binary + PocketBase + Svelte 5                            |
| [Halo](https://www.halo.run) · [halo-dev/halo](https://github.com/halo-dev/halo)                         | **39,482** | GPL-3.0             | 2026-08-08     | Chinese-first Java CMS/site builder                          |
| [Microweber](https://microweber.org) · [microweber/microweber](https://github.com/microweber/microweber) | 3,430      | MIT                 | 2026-08-11     | Drag-and-drop PHP/Laravel CMS                                |
| [VvvebJs](https://www.vvveb.com) · [givanz/VvvebJs](https://github.com/givanz/VvvebJs)                   | 8,586      | Apache-2.0          | 2026-07-01     | Drag-drop **library**; Vvveb CMS is the app                  |
| [Frappe Builder](https://frappe.io/builder) · [frappe/builder](https://github.com/frappe/builder)        | 2,244      | MIT                 | 2026-08-11     | Requires a full Frappe bench install                         |
| [blocks/blocks](https://github.com/blocks/blocks)                                                        | 5,090      | MIT                 | 2026-07-31     | JSX page builder, no tagged releases                         |
| [Typemill](https://typemill.net) · [typemill/typemill](https://github.com/typemill/typemill)             | 613        | MIT                 | 2026-08-01     | **Documentation**, not portfolios                            |
| [Bludit](https://www.bludit.com) · [bludit/bludit](https://github.com/bludit/bludit)                     | 1,464      | MIT                 | 2026-08-05     | Flat-file blog CMS                                           |
| [HTMLy](https://www.htmly.com) · [danpros/htmly](https://github.com/danpros/htmly)                       | 1,355      | GPL-2.0             | **2026-01-25** | Databaseless PHP blog                                        |
| [Gridea](https://github.com/getgridea/gridea)                                                            | **10,265** | MIT                 | **2023-07-26** | **Dead 3+ years, 583 open issues**                           |

#### Webstudio — an "open-source Webflow alternative" that tells you not to self-host it

GitHub description: "Open source website builder and Webflow alternative… can be
hosted anywhere, including with us." But
[docs.webstudio.is/university/self-hosting](https://docs.webstudio.is/university/self-hosting)
says, verbatim:

> **"While both the Builder and the generated site are open-source, self-hosting
> the Builder in production is more difficult and currently not recommended."**
> "You can still self-host the Builder for development" — via GitHub Codespaces.
> "If you are self-hosting the Builder, then please use the Webstudio CLI to
> export your project."

Self-hosting the builder needs PostgreSQL, Node 22 and asset storage, and there
is a live tracking issue,
[#3966 "Improve self-hosting the Builder"](https://github.com/webstudio-is/webstudio/issues/3966).
Docker deployments require "a _minimum_ of 1 GB of memory and 1 core CPU, though
more is recommended." Pricing ([webstudio.is/pricing](https://webstudio.is/pricing)):
Hobby $0 (wstd.io subdomain, unlimited projects, project export), **Pro $15/mo
billed yearly** (custom domains, 100k pageviews, Content Mode), Team $35/mo
billed yearly. AGPL-3.0 also means a modified hosted version obliges you to
publish your source.

**Sticking point:** the product is the hosted SaaS. The open source is a
Webflow-grade design tool that assumes CSS fluency — that is not "no-code," it is
"code by mouse."

#### GrapesJS, Puck, VvvebJs, Builder.io, Plasmic — libraries, not products

- **GrapesJS** describes itself verbatim as "The leading open-source framework for
  **building your visual web builders**" and "embed in your own app with our
  SDK." Its commercial layer, Studio SDK, is priced Free ($0, 1,000 sessions/mo,
  1 domain, Studio branding, $50 per extra 1,000 sessions), Startup $200/mo,
  Business $2,000/mo, Enterprise custom
  ([grapesjs.com/sdk/pricing](https://grapesjs.com/sdk/pricing)).
- **Puck** requires `npm i @puckeditor/core` and a hand-written config where you
  author every React component
  ([puckeditor.com/docs/getting-started](https://puckeditor.com/docs/getting-started)).
  **A non-technical user has no components, so Puck renders an empty toolbox.**
- **Plasmic** pricing ([plasmic.app/pricing](https://www.plasmic.app/pricing)):
  Free $0 (3 collaborators), Starter $39/mo annual, Pro $103/mo annual, Scale
  $399/mo annual, Enterprise custom.
- **Builder.io** free tier: up to 5 users, admin-only role, 25 daily / 75 monthly
  Agent Credits, public previews. Pro/Team dollar amounts render client-side —
  **UNVERIFIED**. Only the SDKs are MIT; the platform is not self-hostable.

#### Silex — closest in spirit, wrong shape

README, verbatim: "The web belongs to everyone. Silex is a free/libre visual
website builder — no lock-in, no subscription, no tracking." Maintained by Silex
Labs, a non-profit; "No investors, no exit strategy, transparent finances."
Self-host: `git clone --recurse-submodules … && pnpm install && pnpm build &&
pnpm start` → `localhost:6805`, or Docker/CapRover.

**Sticking point, verbatim from the README:** "Use it online — v3.silex.me (free,
requires a GitLab account for storage)." A non-technical person must create a
GitLab account and grasp git-repo storage before designing anything. Its stated
audience is "Web agencies… WordPress developers… Freelance webdesigners… No-code
developers." It is a page designer, not a portfolio product: no project content
model, no "add a case study" flow.

#### Primo — the closest genuine competitor, and it targets developers

README, verbatim: **"Primo is a CMS _for developers_ who build sites for clients
who need to manage them afterward."** Homepage: "Designed for people who build
custom sites for nontechnical editors — devs, freelancers, and agencies." MIT,
free forever. Architecture: "One Go binary. PocketBase (SQLite) for storage.
Svelte 5 for the editor UI and for the blocks you write." Setup: one-click
Railway deploy,
`docker run -d -p 8080:8080 -v primo-data:/app/pb_data ghcr.io/primocms/primo:latest`,
or `npx primo-cli init my-workspace`.

**Sticking point:** the blocks are Svelte components you write. Primo is
explicitly the developer half of a two-person workflow. It does not serve a
non-technical person who has no developer.

#### Microweber — markets at non-technical users, gated by PHP

README, verbatim: "Microweber is a **Drag-and-Drop website builder**… It empowers
you to create various types of websites, online stores, and blogs **without
requiring any technical expertise**." Features "Live Edit view" and "75+
pre-designed layouts." Requirements: HTTP server, database server, PHP >= 8.2 and
fifteen PHP extensions — the docs hand you the apt command:

```
sudo apt install php8.2-{bcmath,bz2,curl,dom,fileinfo,gd,intl,mbstring,mysql,opcache,sqlite3,xmlrpc,zip}
```

plus Apache `mod_rewrite` or an nginx `try_files` block. Last tagged release
**v2.0.20 on 2025-08-14** — a year ago — despite active commits. A marketplace
one-click deploy exists (DigitalOcean/Azure/Linode/Vultr), which means renting a
VPS. Also ecommerce-first, not portfolio-first.

#### Halo, Frappe Builder, Vvveb, Typemill, Bludit, HTMLy

- **Halo** (39,482 stars, GPL-3.0) is the highest-starred "website builder" on
  GitHub — but it is Chinese-first (README and homepage in Chinese) and requires
  JRE 21 (2.21+) or JRE 17, minimum 1 GB RAM, Docker recommended, and
  PostgreSQL/MySQL/MariaDB/H2 with H2 discouraged in production. Blog and
  knowledge-base oriented.
- **Frappe Builder** cannot be installed standalone. README: "1. Setup Bench…
  `bench get-app builder` / `bench new-site builder.localhost --install-app
builder`." You must stand up the entire Frappe framework first.
- **Vvveb** ([vvveb.com](https://www.vvveb.com/)): "Powerful and easy to use drag
  and drop website builder", "Real WYSIWYG editor", "One click easy installation,
  with no setup when using sqlite", PHP 7.4–8.4+, AGPL-3.0, free. Portfolios are
  mentioned only in passing. Note the star count belongs to **VvvebJs, the
  library**, not the CMS.
- **Typemill** self-describes as "Simple docs for products and projects" —
  documentation, not portfolios. MIT Community edition plus paid Maker and
  Business annual licences; exact prices **UNVERIFIED**.
- **Bludit** requires "PHP v8.0 or higher" plus mbstring/gd/dom/json and a
  rewrite-capable server. A flat-file blog engine with a "Bludit PRO" upsell.
  `awesome-selfhosted` flags it as depending on a proprietary service outside the
  user's control.
- **HTMLy** — last commit 2026-01-25, seven months stale. Blog engine.

### Portfolio-specific open-source projects — the graveyard, in numbers

| Project                                                                                                        | Stars     | Licence  | Last push      | Status                                                                                      |
| -------------------------------------------------------------------------------------------------------------- | --------- | -------- | -------------- | ------------------------------------------------------------------------------------------- |
| [arifszn/ezfolio](https://github.com/arifszn/ezfolio) "Open Source Portfolio/Resume CMS"                       | **291**   | MIT      | **2024-04-21** | Dead 2+ yrs. Install: Docker + `laravelsail/php81-composer` + `sail artisan migrate --seed` |
| [smaranjitghose/awesome-portfolio-websites](https://github.com/smaranjitghose/awesome-portfolio-websites)      | 2,772     | MIT      | **2024-08-02** | Dead. A _list_, not a builder                                                               |
| [arifszn/gitprofile](https://github.com/arifszn/gitprofile)                                                    | 2,280     | MIT      | 2026-02-01     | Config-file React template; devs only                                                       |
| [HugoBlox/kit](https://github.com/HugoBlox/kit)                                                                | **9,626** | MIT      | 2026-08-04     | Best-in-class — see below                                                                   |
| [refinery/refinerycms-portfolio](https://github.com/refinery/refinerycms-portfolio)                            | 131       | none     | **2021-04-29** | Dead 5 yrs                                                                                  |
| [hi-Kartik2004/CraftFolio](https://github.com/hi-Kartik2004/CraftFolio) "AI Powered Personal Website Builder"  | 23        | **none** | **2024-10-08** | Dead, unlicensed                                                                            |
| [yeabnoah/Frame](https://github.com/yeabnoah/Frame) "open source portifolio builder"                           | 14        | none     | **2024-12-24** | Dead                                                                                        |
| [mkirste/io200](https://github.com/mkirste/io200) "self-hosted CMS for creating individual portfolio websites" | 12        | none     | 2025-12-06     | Unlicensed, negligible                                                                      |
| [ownz-network/ownz](https://github.com/ownz-network/ownz) "self-hostable link-in-bio & portfolio page builder" | 6         | AGPL-3.0 | 2026-07-08     | Negligible                                                                                  |
| [maheshpaulj/NoCodefolio](https://github.com/maheshpaulj/NoCodefolio)                                          | **4**     | MIT      | 2026-06-04     | Negligible                                                                                  |

**Hugo Blox** ([hugoblox.com](https://hugoblox.com), formerly Wowchemy/Academic)
is the one credible portfolio-adjacent project at scale: **9,626 stars, MIT**,
"The open-source structured-content Hugo framework for founders, dev advocates,
and consultants." Workflow: "Pick from real production templates. Deploy to
GitHub Pages or anywhere. You own the Markdown — fork-and-go." Content is
"Frontmatter blocks → Hugo render." Its no-code layer is an AI chat ("Hugo Chat")
on a **$9–$50/month subscription** that "edits your Markdown blocks." The
framework is MIT-free but the non-technical path is paid, chat-based, and still
Markdown underneath. **Sticking point:** GitHub account, fork, Markdown
frontmatter — or a subscription to an AI that writes it for you.

### What `awesome-selfhosted` actually contains

- **Static Site Generators:** empty, redirects to external lists.
- **Content Management Systems (CMS):** 38 entries, dominated by PHP enterprise
  CMSs (Drupal, Joomla, TYPO3, Contao, Concrete, Plone, SilverStripe, Umbraco).
  Only Vvveb CMS is described as "build websites, blogs or e-commerce stores"
  with a visual builder.
- **Blogging Platforms:** 16 entries, all blog engines.
- **Software Development – Low Code:** Appsmith, Appwrite, Halo, Manifest,
  PocketBase, Saltcorn, SQLPage, ToolJet, TrailBase — all internal-tool or
  backend builders, none a website builder.
- **There is no "Portfolio" or "Website Builder" category anywhere in the list.**

---

## 2.7 Open-source link-in-bio tools (adjacent category)

Naming correction worth carrying: **LittleLink-Custom and LinkStack are the same
project.** `github.com/JulianPrieber/littlelink-custom` redirects to
`github.com/LinkStackOrg/LinkStack`.

| Project                                                                         | Stars     | Licence    | Last push      | Latest release       | No-code?                           |
| ------------------------------------------------------------------------------- | --------- | ---------- | -------------- | -------------------- | ---------------------------------- |
| [LinkStack](https://linkstack.org)                                              | **3,739** | AGPL-3.0   | 2026-07-21     | v4.8.6 · 2026-02-17  | Yes — admin panel + setup wizard   |
| [LittleLink](https://littlelink.io)                                             | **3,055** | MIT        | 2026-07-29     | v3.11.0 · 2026-07-29 | **No — edit `index.html` by hand** |
| BioDrop (ex-LinkFree, EddieHub)                                                 | **5,692** | MIT        | **2024-07-01** | v2.104.3             | **ARCHIVED**                       |
| [techno-tim/littlelink-server](https://github.com/techno-tim/littlelink-server) | 1,147     | MIT        | 2026-08-09     | none                 | Docker env vars                    |
| [MichaelBarney/LinkFree](https://github.com/MichaelBarney/LinkFree)             | 691       | Apache-2.0 | 2026-04-24     | —                    | No                                 |
| [singlelink-co/Singlelink](https://github.com/singlelink-co/Singlelink)         | 585       | GPL-3.0    | **2023-03-07** | —                    | Dead 3.4 yrs                       |
| [KartikLabhshetwar/oneurl](https://github.com/KartikLabhshetwar/oneurl)         | 427       | BSD-3      | 2026-01-24     | —                    | Yes, admin UI                      |
| [heysagnik/Linkees](https://github.com/heysagnik/Linkees)                       | 392       | **none**   | 2026-07-25     | —                    | No, unlicensed                     |
| [rishi-raj-jain/itsmy.fyi](https://github.com/rishi-raj-jain/itsmy.fyi)         | 202       | AGPL-3.0   | 2025-06-21     | —                    | Yes, admin UI                      |

**LittleLink's "no-code" claim is false, from its own README:**

> "No need for gulp, npm, or anything else to make LittleLink work—it uses the
> bare essentials. … To edit, all you need is a little basic HTML knowledge to
> add a link to the existing buttons or you can create your own."
> Theming: "you can easily customize them by updating the values in `style.css`.
> You can set any of the themes right in `index.html`."

**LinkStack has a genuine admin panel, gated behind PHP hosting.** Install text,
verbatim ([docs.linkstack.org](https://docs.linkstack.org/getting-started/requirements/)):
"Download the latest release… and simply place the folder 'linkstack'… in the
root directory of your website. That's it! No coding no command line setup just
plug and play." But the requirements are "At least PHP 8.1 or above", "Apache web
server/web host with `.htaccess` support", "Apache Module `mod_rewrite`", twelve
PHP extensions, read/write access to `storage` and `database`, and "Access over
HTTPS/valid SSL certificate." Its homepage claim of "No database" is misleading —
it means SQLite with no separate DB server.

There was a **13.5-month release gap**: v4.8.4 (2024-12-10) → v4.8.5
(2026-01-26). Known fragility, verbatim from the README: "The updater may fail
without throwing an error and just remain on the current version if there are
unmet dependencies…" and "If you switched your database to MySQL, your database
will not be included in the backup."

**Conclusions for this adjacent category:**

1. **None of roughly twenty projects is a portfolio builder.** They render a
   photo, a bio line and a vertical stack of branded buttons. No projects, no
   case studies, no galleries, no rich content model.
2. **The no-code and zero-infrastructure axes are inversely correlated.**
   LinkStack is no-code but needs PHP 8.1 + Apache + mod_rewrite + 12 extensions.
   LittleLink is zero-infrastructure but requires "a little basic HTML
   knowledge." **Nobody occupies the good quadrant.**
3. **The two highest-star projects are compromised:** BioDrop (5,692) is
   archived; LinkStack went 13.5 months without a release.
4. **Bus factor is one nearly everywhere.**

---

## 2.8 People who tried self-hosting and gave up — verbatim

All from Hacker News (Reddit is not fetchable from this environment), retrieved
via the HN Algolia API, verifiable at the permalinks.

On Ghost's install guide specifically:

> "They claim one hundred million installs. If you believe that one hundred
> million real people are self hosting Ghost and blogging away, then I don't know
> what to say. This is again 'if you don't know how to bore out a cylinder you
> don't deserve to drive'. **This is not a simple process for normal people:
> https://ghost.org/docs/install/ubuntu/**"
> — [news.ycombinator.com/item?id=42761733](https://news.ycombinator.com/item?id=42761733), 2025-01-19

On giving up on self-hosted Ghost:

> "I have had a blog in plain html/css, a PHP-backed one, a self-hosted Ghost, a
> self-hosted Wordpress, and **ultimately, I settled on not self-hosting a Ghost
> instance and it has been the best way to write because paying $9/mo is a lot
> easier for me than to update deps or manage bugs when I'm trying to write about
> something on my mind.**"
> — [news.ycombinator.com/item?id=38892816](https://news.ycombinator.com/item?id=38892816), 2024-01-06

On the static-site workflow cost:

> "I'm so tired of this argument. I want to host stuff myself. Really, I do. But
> I really don't have enough time in the day to do it. **I set up a blog this
> weekend using Hugo, Ansible, and Github Actions to host it on
> NearlyFreeSpeech.NET. It "only" took two days, but I'm exhausted and I don't
> actually have any content yet.**"
> — [news.ycombinator.com/item?id=32153185](https://news.ycombinator.com/item?id=32153185), 2022-07-19

On SSGs and non-technical people:

> "**For non technical folks static site generators, GitHub, DNS, SSL, etc may
> seem like rocket science**, and a hosted WP subscription will be way more user
> friendly."
> — [news.ycombinator.com/item?id=25566618](https://news.ycombinator.com/item?id=25566618), 2020-12-29

A CMS vendor's own employee advising _against_ the SSG route, on a thread titled
"Static Site Generator (SSG) as a Free Squarespace Alternative?" where the asker
described themselves as "a novice with no expertise in website building or
design":

> "**SSGs don't prioritize ease of use, necessarily, but simplicity and cost of
> hosting. If your only goal is to get a very simple website up and running,
> using a CMS + SSG + configuring hosting is kinda overkill, IMO. You might save
> $10/mo but end up spending hours longer to get it up and running.** Aside from
> Squarespace, there's also Wix, Weebly, Wordpress.com, and a bunch of other
> WYSIWYG page builders, many with free plans."
> — [news.ycombinator.com/item?id=39217663](https://news.ycombinator.com/item?id=39217663), 2024-02-01

On self-hosted WordPress maintenance:

> "10+ years ago I had a self-managed Wordpress instance and it **was just
> getting hacked left and right and I had to constantly be applying the latest
> updates/patches to be safe**… **I agree the initial setup is usually easy and
> fast, but a lot of maintenance overhead to keep running.**"
> — [news.ycombinator.com/item?id=19841190](https://news.ycombinator.com/item?id=19841190), 2019-05-06

On the fundamental market shape:

> "**Apparently, lots of people want a website builder.** We in the startup
> culture often forget that the market for building bespoke webapps using the
> latest and greatest frameworks is only a tiny part of the web. **The vast
> majority of people who order websites just want something that works out of the
> box, and they want it yesterday.** … For the time being, though, I'm glad that
> there exists a well-known, open-source, self-hosted alternative to Wix and
> Squarespace."
> — [news.ycombinator.com/item?id=27311658](https://news.ycombinator.com/item?id=27311658), 2021-05-28

On markdown/git CMSs for clients:

> "I have [worked extensively] with Netlify CMS… **My experience was that it's
> very difficult to build a robust CMS on top of markdown.** If basic content
> editing is what you need, great! If, however, you need to accommodate a variety
> of conditions, things get dicey fast."
> — [news.ycombinator.com/item?id=22362648](https://news.ycombinator.com/item?id=22362648), 2020-02-19

---

## 2.9 The gap, in one table

| Option                                          | Open source | Self-host             | Free                 | Non-technical can install                  | Non-technical can edit after        | Portfolio-shaped                          |
| ----------------------------------------------- | ----------- | --------------------- | -------------------- | ------------------------------------------ | ----------------------------------- | ----------------------------------------- |
| Ghost (self-host)                               | MIT         | yes                   | yes                  | **No** — SSH + MySQL + NGINX               | yes                                 | Blog-first                                |
| Ghost(Pro)                                      | —           | no                    | $18–29/mo            | yes                                        | yes                                 | Needs $29 tier for themes                 |
| WordPress self-host                             | GPL         | yes                   | + $49–89/yr builder  | **No** — "create a database & MySQL user"  | yes                                 | Yes, with paid builder                    |
| wordpress.com free                              | —           | no                    | yes                  | yes                                        | yes                                 | **No** — ads, 1 GB, no plugins, no domain |
| Astro/Hugo/Jekyll/Next starters                 | yes         | yes                   | yes                  | **No** — Node/Ruby/Go + git                | **No** — edit `.tsx`/`.bib`/`.yaml` | yes                                       |
| Decap / Sveltia / Keystatic / Tina              | yes         | yes                   | yes                  | **No** — hand-write config + OAuth proxy   | yes, once built                     | via theme                                 |
| Pages CMS                                       | MIT         | needs Postgres        | yes                  | GitHub App install                         | yes                                 | via theme                                 |
| CloudCannon                                     | **No**      | **No**                | **$55/mo**           | yes                                        | yes                                 | via theme                                 |
| Publii                                          | GPL-3       | yes                   | yes                  | Easy app, then a PAT or FTP creds          | **One computer only**               | Blog-first                                |
| Directus / Strapi / Payload / Keystone / Sanity | mostly      | yes                   | partly               | **No** — terminal + DB                     | Admin only                          | **No website at all**                     |
| Statamic                                        | **No**      | yes                   | Core free / $349 Pro | **No** — PHP 8.3 + Composer + 9 extensions | Excellent control panel             | Yes, $70–99 kits                          |
| Grav                                            | MIT         | yes                   | yes                  | "extract the zip into your webroot"        | Yes, Admin Next                     | Yes, free skeletons                       |
| Webstudio                                       | AGPL        | **"not recommended"** | Free tier            | **No** — Postgres + Node 22                | Webflow-grade UI                    | yes                                       |
| Silex                                           | AGPL        | yes                   | yes                  | "requires a GitLab account"                | Page designer                       | No content model                          |
| Primo                                           | MIT         | yes                   | yes                  | **No** — Docker/Railway                    | Yes, for clients                    | Only if a dev writes blocks               |
| LittleLink                                      | MIT         | yes                   | yes                  | One-click deploy                           | **No** — edit `index.html`          | **No** — links only                       |
| LinkStack                                       | AGPL        | yes                   | yes                  | PHP 8.1 + Apache + 12 ext                  | Yes, admin panel                    | **No** — links only                       |
| **Nothing occupies this row**                   | yes         | yes                   | yes                  | yes                                        | yes                                 | yes                                       |

Three lines that are defensible from the primary sources above:

- Every open-source Git CMS makes you write a schema by hand.
- Every open-source link-in-bio tool gives you a button list, not a portfolio.
- The only genuinely no-code Git-based CMS costs $55/month and you cannot host it
  yourself.

---

# 3. Real user complaints

Roughly 115 verbatim quotes across fifteen themes. Reddit quotes carry upvote
counts where the source exposed them (`Np`); quotes recovered via Reddit's RSS
endpoint have no score available. Hacker News quotes carry permalinks. Anything
not literally recovered is marked SUMMARY.

**What is missing, stated plainly:** Trustpilot, G2 and Capterra returned HTTP
403 to every available method, including a real browser. **There are no star
ratings, review counts or review quotes from those three sites in this
document.** X/Twitter was not fetchable. Do not fill those gaps from memory.

**Also unverified and not asserted anywhere below:** Coroflot shutting down,
Cargo Collective v1→v2/v3 migrations breaking sites, Muzli, Wix Answers, and
website-builder accessibility/ADA lawsuits. Searches for these hit CAPTCHAs
before anything could be confirmed. `coroflot.com` still resolves.

---

## Theme 1 — Price increases: "I just want a portfolio, why $25/mo"

The richest vein, and it is burning right now — Webflow's May 2026 hike and
Squarespace's July 2026 hike are both inside the last ninety days.

### Squarespace

> "I first started a Digital Products (Member Areas, at the time) subscription
> with Squarespace in fall of 2022, and upgraded my Digital Products plan to Pro
> in 2023 for $420/year. […] The Pro plan went from $420/year to $1,068/year, a
> 154% price increase- and as far as I can tell, no additional features? […]
> obviously price gouging is a major trend of the 2020s, but this is genuinely
> the worst one I've seen yet."
> — u/sneepsnorp3d, r/squarespace, 2024-01-04.
> https://www.reddit.com/r/squarespace/comments/18yrc91/154_price_increase_on_digital_products_plans/

> "I was charged the new price and it caught me so off guard because I was not
> expecting it. I am a small business and all I can do is look at that and laugh.
> […] It's complete greed. They pumped out Ads for several years to every
> decently big streamer on the planet to get people in, and then once they were
> saturated and people gave up their old sites and migrated, they pulled the bait
> and switch and were like "oh just kidding, that will be $1,000.00/ Yr to have a
> functional calendar, thanks.""
> — u/Anml87x, same thread, 2024-08-22

> "An additional $600 paid every year for the foreseeable future for no new
> features or functionality just isn't worth it to me. […] I'd much rather spend
> a lot more money upfront paying a developer to build a new website from scratch
> rather than hand Squarespace however much money they want every year, honestly."
> — u/sneepsnorp3d, same thread, 2024-01-05

And the lock-in-as-pricing-defence reply, which is exactly the dynamic this
product attacks:

> "Even if there is a $600 increase, consider how much time/energy it's take to
> move to another platform which will likely cost just as much or more. How is
> that going to make any savings?"
> — u/ThrustersToFull, same thread, 2024-01-04

> "I swear when I subscribed to an annual squarespace domain for a year back in
> around 2015 it was £99. Now it's £144 + £30 VAT. That has honestly just put me
> right off paying for one. What on earth. Why the price increase?"
> — u/Sarithus, r/squarespace, 2023-10-06.
> https://www.reddit.com/r/squarespace/comments/171k20o/huge_rise_in_annual_cost_for_a_site/

> "200$/year does hit hard when you're just trying to make a small website for a
> restaurant or a portfolio..."
> — u/marco5991, r/squarespace, 2023-03-10.
> https://www.reddit.com/r/squarespace/comments/11o0cvt/squarespace_is_too_damn_expensive/

On the July 2026 hike, reported reactions
([PetaPixel, 17 Jul 2026](https://petapixel.com/2026/07/17/squarespace-is-increasing-prices-by-up-to-26/)):
a filmmaker — "Like many of you, I'm leaving @squarespace after their ridiculous
pricing increase"; a photographer — "I feel like I'm paying for things I
sincerely did not ask for, the biggest thing being AI"; and a Reddit user whose
price had "gone up 61 percent since they first signed up in 2021."

### Webflow — the May 2026 hike

Thread: "Recent price changes... are we serious? Been with Webflow for almost a
decade" — **86p, 65 comments**, 2026-05-15.
https://www.reddit.com/r/webflow/comments/1tdyfdo/recent_price_changes_are_we_serious_been_with/

> "And now I have to explain to my clients – who are already strapped in this
> economy – that our website cost is increasing by 34%."
> — u/fawnover (OP)

> "For anyone reading, how valuable to you is increasing the CMS limit from 3k to
> 20k? Most of my clients aren't making bloated, AI info-slop sites. They are
> small organizations making a blog post or event maybe every month."
> — u/fawnover (OP)

> "Webflow is just technical debt at this point. If you sell someone a webflow
> site you are giving them technical debt that is unnecessary. We owe it to our
> customers to provide the best solutions and Webflow is not it. It used to be
> good, but times have changed."
> — u/0xdnx0, **35p**

> "same boat here man, been explaining price hikes to clients all year and its
> getting ridiculous. most small businesses i work with barely scratch the surface
> of what webflow offers but now they're paying premium for features they'll never
> touch […] my garage owner clients just want their hours posted and maybe update
> a promotion once in while"
> — u/EmbarrassedGoose9910, **21p**

> "this is a joke. the bandwidth limitations hurt and drain my clients. while
> literally none used the new AI stuff. and no one cares about having more CMS
> collections or items. those plan are only here to make money but do really not
> consider the needs for portfolio, or even testing sites."
> — u/uebersax, **18p** — note the explicit mention of portfolio sites

> "Our situation - as I'm sure is the case for many others — is that we're going
> to have to take the brunt of the price rise across multiple clients. It's most
> probably going to cost us upwards of a $1,000 a month. On top of that, the
> proposals we sent out this week are now outdated, which makes us look like
> fucking idiots."
> — u/jakejakesnake, 6p

Companion thread: "Hahahahaha I mean at this point what can we even do" —
**63p, 120 comments**, 2026-05-13.
https://www.reddit.com/r/webflow/comments/1tc74sv/hahahahaha_i_mean_at_this_point_what_can_we_even/

> "Web hosts charging for bandwidth is so 2006"
> — u/djgoodhousekeeping, **48p**

> "First you lower the limits for CMS and now you charge more to restore said
> limits. I'm out. No more closed ecosystems for me and my clients. My company
> will make an effort to migrate our clients away before they have to renew their
> subscription."
> — u/ra1kk, **34p**

> "Now we have to foot the bill for those failed AI features."
> — u/Smooth_Garden1530, **29p**

> "I've been championing Webflow for 13 years and these continuous price jumps are
> just making my life more difficult."
> — u/No-Understanding-784, **18p**

> "Webflow will be redundant within 12 months"
> — u/0sko59fds24, **18p**

Earlier hike, from Hacker News:

> "Expensive, with a recent price hike with no increase in the functionality or
> quality."
> — @Karunamon, 2023-07-15. https://news.ycombinator.com/item?id=36736979

> "Webflow CMS is expensive, I can see a small business starting out with Webflow
> and getting locked in."
> — @rchaud, 2023-06-16. https://news.ycombinator.com/item?id=36357232

> "Webflow is great, but it's quite expensive to host a simple static website
> there."
> — @marc_io, 2020-11-26. https://news.ycombinator.com/item?id=25221907

> "I personally feel like it's way too expensive... there's no way I can justify
> paying for Webflow."
> — @josephpmay, 2014-03-07. https://news.ycombinator.com/item?id=7359714

### Framer — localisation pricing, then killing the personal plan

Thread: "Let's Talk About Framer's New Pricing - They're Missing The Point" —
**~345p, 128 comments**, 2024-11-22.
https://www.reddit.com/r/framer/comments/1gx96lc/lets_talk_about_framers_new_pricing_theyre/

> "The new pricing changes have left me feeling frustrated, confused, and honestly
> a bit betrayed."
> — u/JaniCozad (OP)

> "Yet Framer now wants to charge $40 per language? For what exactly? We're doing
> our own translations. We're not using their AI. We just need to display
> different text in different languages. That's it."
> — u/JaniCozad (OP)

> "The only reason why framer is not growing and maybe will be soon dead as a
> platform is because of pricing, they literally have no clue on how to be
> competitive on that market. What a shame, it would truly be the perfect web
> builder."
> — u/Aikon_94, **55p**

> "This is precisely why we are abandoning Framer. It's a beautiful experience for
> designers… and that's about it."
> — u/krispyrainbows, **20p**

> "we do not need their Ai […] after discussing this with their support they
> offered us a 24000 USD / year plan just for being able to translate our page to
> 23 languages"
> — u/DzingDzong, 9p

Thread: "Did Framer just kill personal site plans?" — 39p, 50 comments,
2025-10-10.
https://www.reddit.com/r/framer/comments/1o2zf42/did_framer_just_kill_personal_site_plans/

> "Just wanted to set up a new Framer website and the personal plans are gone. Is
> Framer expecting us to pay now $45 for a basic website per month?"
> — u/dloku (OP)

> "That's crazy, again and again :( I didn't notice it yet. Framer works hard to
> keep small sites away."
> — u/beegee79, **31p**

> "Yes, there's no more Mini plan that was $60/year. […] From Framer: "Your site
> is currently on a legacy Mini '24 plan." I guess next year I have to pay Framer
> $120/year."
> — u/hacktober, 9p

> "In addition to reducing the CMS to one, they also reduced the bandwidth from 50
> to 10 GB. This is a huge downgrade"
> — u/doom_ultras, 3p

> "Welp there's goes my plan to host my personal site on Framer."
> — u/Hazrd_Design, 2p

> "with the recent changes made to framers pricing these will all eventually end
> up on the scale plan as their sites are doing fairly well. The problem however
> is that with the new pricing structure their costs will increase something like
> 400%. Basically Ill lose more than half my clients."
> — u/Ok_Lavishness960, r/framer, **42p**, 2025-10-22.
> https://www.reddit.com/r/framer/comments/1odbsyj/searching_for_framer_alternatives_after_recent/

### Wix

> "My 3-year plan just more than doubled in price, so I'm considering canceling."
> — u/weirdo76, r/WIX, 2024-06-22.
> https://www.reddit.com/r/WIX/comments/1dm66sf/what_happens_to_my_domain_if_i_cancel_wix_premium/

> "Wix and webflow both hiked their prices so much that i just can't offer them to
> clients. I had to abandon both and it still pisses me off when i have to tell
> clients their annual hosting has gone up again"
> — u/Sphism, r/WIX, 9p, 2025-07-01

### The general "why is a brochure site $20/mo" sentiment

From the Hacker News thread "Have a fucking website" — **948 points**, 2026-03-18.
https://news.ycombinator.com/item?id=47421442

> "People put that stuff up on Google maps, Facebook, and Instagram now. I know
> it's not popular with the crowd here, but those platforms are free, easy to use,
> and where the customers are. The mainstream options for a website like
> squarespace are absurdly expensive."
> — @Gigachad. https://news.ycombinator.com/item?id=47422383

> "Ridiculously expensive. The cost of hosting a mom-and-pop website is close to
> zero, and they charge $20/month or something like that."
> — @markdown. https://news.ycombinator.com/item?id=47422840

> "My point is, SquareSpace could charge a fraction of what they do and still be
> rolling in cash. Instead they charge ridiculous fees that simply go to pay for
> more ads."
> — @markdown. https://news.ycombinator.com/item?id=47424421

> "It's not that they don't want to pay, but they don't want to pay outrageously.
> Squarespace, etc. are stupid expensive for most websites. $5/mo is the limit for
> a lot of businesses"
> — @ArlenBales. https://news.ycombinator.com/item?id=47426983

> "This all reminds me how important free things are to kids who want to learn
> things but can't spend any money (even $5 for a SquareSpace is prohibitively
> expensive)."
> — @bcjordan, 2016-07-18. https://news.ycombinator.com/item?id=12113165

### Private-equity ownership as a price-hike predictor

HN thread on Permira acquiring Squarespace — **285 points, 398 comments**.
https://news.ycombinator.com/item?id=40343006

> "PE realises you can fire most of the team and stop R&D, jack up prices by
> 50-100% due to lock in, and have something low risk that returns like four times
> bonds."
> — @dannyw. https://news.ycombinator.com/item?id=40343207

> "For users, on the other hand, I'll hardly trust a PE firm with a SaaS product.
> There's just too much incentive to jack up prices to service the debt taken to
> acquire Squarespace, and cut costs on customer support and building new
> features."
> — @blackhawkC17. https://news.ycombinator.com/item?id=40343243

> "The unsaid thing is that the customer signed up to squarespace is going to get
> less value for their dollars. Profit has to come from somewhere, and it aint
> innovation as you said."
> — @chii. https://news.ycombinator.com/item?id=40343665

> "They are owned by private equity, advertise on countless YouTube channels...You
> need your domain registrar to be stable and predictable. Their profile is not
> that."
> — @lolinder, 2026-07-13. https://news.ycombinator.com/item?id=48898591

---

## Theme 2 — Lock-in: "cannot leave", "held hostage"

> "You'll be wedded to the platform. You can't take your site and rehost
> elsewhere. […] Honestly just get a WordPress site, host it somewhere and run
> with that. At least you can "own" it and take it elsewhere or grow it in future
> as you need to."
> — u/mooter23, r/SEO, **53p**, 2024-01-02.
> https://www.reddit.com/r/SEO/comments/18wr7wx/why_would_wix_be_a_bad_choice_to_rebuild_my_site/

> "You don't build a house on rented land."
> — deleted user, r/SEO, 7p, 2023-08-29.
> https://www.reddit.com/r/SEO/comments/163ys8e/do_seos_hate_on_squarespace_why/

> "That's the problem with these site builders. You're locked in. It's very hard to
> move off them."
> — u/krileon, r/webdev, 2024-03-18.
> https://www.reddit.com/r/webdev/comments/1bhtl1p/how_can_i_escape_wix/

> "Sure for a small 1-2 page site. For 100 page site you absolutely should stay far
> far away from site builders."
> — u/krileon, same thread

> "I'm losing my mind with this God awful broken tool called Wix. The problem is I
> have about 100 pages on my site and it would be a huge hassle not sure if it's
> feasible to move my site."
> — u/No-Establishment4313 (OP), same thread

> "The problem with SquareSpace, Wix, Webflow, etc is you're stuck paying their
> monthly costs forever if you want to keep your site online."
> — deleted user, r/UXDesign, 2022-08-31.
> https://www.reddit.com/r/UXDesign/comments/x258p4/are_most_people_still_using_squarespace_for_their/

> "One of the significant drawbacks to every proprietary drag-and-drop website
> builder is that you cannot easily export your website. Any time you spend
> building your site with their tool just further locks you into their hosting
> platform."
> — @dublinben, HN, 2015-10-01. https://news.ycombinator.com/item?id=10313474

> "I love the phrase "roach motel" when it comes to a service provider who won't
> bend over backwards to give me back my content as soon and as often as I want
> it. Does that not describe Wix?"
> — @jessaustin, HN, 2021-04-07. https://news.ycombinator.com/item?id=26730079

> "They're pursuing technologically ignorant small businesses / organizations and
> intentionally seeking to trap them as much as possible (and you can bet they'll
> financially drain their captives in ever-worsening ways as time goes on)."
> — @adventured, HN, 2021-04-07. https://news.ycombinator.com/item?id=26729887

> "The argument of not being locked in the basement is really important for small
> businesses which is why Wordpress got so huge in the first place. […] Good luck
> porting your wix site if they turn evil and yeah that already seems to have
> happened."
> — @rijoja, HN, 2021-04-07. https://news.ycombinator.com/item?id=26729784

> "Uncomfortable amounts of lock-in. You can export your entire site of course but
> retrieving your "CMS" records is not so straightforward."
> — @Karunamon on Webflow, HN, 2023-07-15. https://news.ycombinator.com/item?id=36736979

> "But they're a bit expensive, and I hated having my projects under their
> control."
> — @karaterobot on Webflow, HN, 2024-07-08. https://news.ycombinator.com/item?id=40908601

> "compared to the other builders like Wix, Squarespace etc, you're not locked in.
> If you make a thing on wordpress.com or wordpress.org and want to escape, you
> just export your stuff in a common XML format. You get none of that with the
> commercial options."
> — @dmje, HN, 2025-05-06. https://news.ycombinator.com/item?id=43905454

> "Makeswift code can't be exported...locking them in to your ecosystem is, to me,
> antithetical to the culture of the web."
> — @detritus, HN, 2020-10-20. https://news.ycombinator.com/item?id=24837614

### The ownership desire, stated plainly

From "are there any ways to dowload/export my own wix site?" — r/WIX, 2023-12-03.
https://www.reddit.com/r/WIX/comments/18a56k1/are_there_any_ways_to_dowloadexport_my_own_wix/

> "Im frustrated with how expensive wix is and I want to own my own site. I have
> been paying for a year and I have decided that is already too much."
> — OP

> "I also really really do not like that they 'own' my website and that I have no
> control over it, besides through Wix. […] It feels like the vast majority of
> website building today has been taken over by subscription models. **At some
> point, I think a free open source product will compete with the mayor players.**"
> — same user, later in thread

The clearest articulation of an alternative pricing model found anywhere in this
research:

> "I guess part of my rant is, that I might not need to update my site. At least
> not more than once a year. Then it feels stupid to pay a subscription service, I
> mean, when it is basically a one time use I need the builder. **I would pay for
> being able to use the builder once. Upload to my server and own my own design.
> Pay again if/when I needed to update.**"
> — same user

> "I'm not wanting it for free, but it is a lot of money (at least for some of
> us..) for a subscription. Everything is effing subscription subscription
> subscription."
> — same user

---

## Theme 3 — Cannot export — and Wix's official position, verified

Wix's own live support article
([support.wix.com](https://support.wix.com/en/article/exporting-or-embedding-your-wix-site-elsewhere),
fetched 2026-08-12) says:

> "Your Wix site is a standard HTML5 site, and is built with Wix's technology. In
> order for your site to work properly, it needs to be hosted and operated on
> Wix's servers."
> "Since Wix is a SaaS solution, your site must run on Wix's servers."
> "If you embed your site into an external location, Wix cannot provide support,
> and Wix is no longer in control of the way your site appears or functions."
> "The content you build on Wix belongs to you."

The page offers no whole-site export; the only portability options concern a
_domain_. Historical wording of the same policy, quoted verbatim by HN users in
2021:

> "Your Wix site and its technology is hosted on Wix's servers. You can connect a
> domain to your Wix site and host the domain with another provider, however, your
> Wix site must remain hosted on Wix's servers."
> — quoted by @karaterobot, HN, 2021-04-13, who added: "The Wix documentation is
> pretty clear that you can't export your site. […] They then go on to say that
> the reason you can't export is due to the nature of SaaS, which is just hogwash.
> **It's a lock-in decision they made, which many of their competitors (E.g
> Squarespace, Webflow) did not make.**"
> https://news.ycombinator.com/item?id=26797897

> "Wix does not support the exporting of files created using Wix to an external
> destination or host. All Wix creations are hosted on Wix's servers. The
> advantages of using Wix as your host include improvements to your site's loading
> time, search engine optimization and more."
> — Wix docs quoted by @yosamino, HN, 2021-04-13, who added: "Edit: and to add
> "improvements to your site's loading time, search engine optimization and more."
> my ass…" https://news.ycombinator.com/item?id=26798207

> "I am currently manually copying a website off of Wix after trying to find a tool
> that does an export. […] The whole thing is a bunch of images, a menu and maybe
> one page worth of text alltogether - basically a small product catalog. But even
> that, because of the convoluted code Wix creates, is impossible to export in a
> half-maintainable way."
> — @yosamino, same comment

> "I don't understand how the inability to export data complies with GDPR. If a EU
> citizen decides to use wix and creates a site there, aren't they entitled to all
> of the data they created […]?"
> — @molyss, HN, 2021-04-08. https://news.ycombinator.com/item?id=26734277

Partial export exists only for CMS collections, and it strips the site:

> "How to export site content from Wix: […] This will produce a well-formatted
> Excel spreadsheet with all your content. […] **The collection export does NOT
> save any HTML, CSS, or JS information.**"
> — u/IdahoCutThroatTrout, r/webdev, 2024-03-18

A 2026 third-party tool exists precisely because of this, and its pitch is the
clearest statement of the pain:

> "I've been working on a project that solves a problem a lot of people run into
> with Wix: **you can't export your site. At all.** No HTML download, no
> portability, no way to move to cheaper or faster hosting without rebuilding
> everything manually. Their most recent price increases was the last straw for me
> personally."
> — u/ProfessionalWest3598, r/WIX, 22p, 2026-04-12.
> https://www.reddit.com/r/WIX/comments/1sjjwn8/built_a_tool_that_finally_exports_full_wix_sites/

And the caveat that makes scraper-style export tools insufficient:

> "I assume this won't replicate features? Just HTML5 + JSS? I would imagine for
> most, the biggest issue with migration is not the design, it's the store, blog,
> CMS, events, payment integration, forms."
> — u/ryanbuckner, 7p, same thread

Framer users route around the same gap with third-party exporters:

> "just export your site with https://nocodexport.com and don't pay a cent to
> them"
> — u/Kysan721, r/framer, 15p, 2024-11-22

> "I'm okay with paying $10-30 a month if they actually let me export the code."
> — u/nk12312, r/framer, 6p, 2025-10-10

---

## Theme 4 — SEO problems

> "Any Hoster that does not let you have complete control of your site, code, meta
> content, design, features et all / Is an SEO nightmare. With all the hoops you
> need to jump through to please google you need complete control / Site like those
> don't allow that"
> — u/Riverwalker12, r/SEO, **35p**, 2023-08-28.
> https://www.reddit.com/r/SEO/comments/163ys8e/do_seos_hate_on_squarespace_why/

> "Wix, shopify, squarespace et al limit your options, limited options mean you
> can't do the things you might want to do to improve performance"
> — u/Hollacaine, r/SEO, 15p, same thread

> "I think Wix gets it's bad rep from the way it does or doesn't allow you to
> change SEO-related things. For quite a while, you had to pay for a certain tier
> to even be able to install google analytics. […] it makes things like adding a
> gtag or doing redirects annoying as hell because they're often buried in some
> menu somewhere and it takes 20 clicks to get there."
> — u/Kittymeow7116, r/SEO, **19p**, 2025-02-02.
> https://www.reddit.com/r/SEO/comments/1iflfdp/is_it_still_necessary_to_switch_from_wix_to/

> "I've found it much more difficult to improve search performance for wix sites.
> Blog posts on them especially have a hard time ranking."
> — u/crrobinsonatx, r/SEO, 7p, same thread

> "a while ago I have noticed, our SEO is trash and now I'm trying to improve it,
> because we don't even show up in Google search for the most common keywords (I
> went through all 15 pages)."
> — u/ZapomnelJsemLogin (OP), r/SEO, 19p, 2025-05-15.
> https://www.reddit.com/r/SEO/comments/1kn5pys/is_wix_really_that_bad/

> "If you need something more complex or if SEO will be a critical marketing
> channel for the business then Squarespace will likely be too rigid to grow and
> change as your site grows and changes."
> — deleted user, r/SEO, 8p, 2023-08-28

**Balance point — the SEO complaint is contested, and an honest dossier should say
so:**

> "Seo has nothing to do with the platform. Speed, usability, content, sound
> architecture, navigation, content, and backlinks. […] This is a myth propogated
> by agencies to justify spends on redeveloping."
> — u/General-Physics86, r/SEO, 7p, 2025-02-02

Also relevant: Notion's own documentation warns that "Notion Sites can take up to
four weeks to be indexed and appear in search results"
([Notion Help](https://www.notion.com/help/public-pages-and-web-publishing)), and
Authory's free plan blocks search-engine indexing outright
([authory.com/pricing](https://authory.com/pricing)).

---

## Theme 5 — Slow sites, PageSpeed and Core Web Vitals

### Measured data

**HTTP Archive Core Web Vitals Technology Report, November 2025**, reported by
[Search Engine Journal, 19 Dec 2025](https://www.searchenginejournal.com/core-web-vitals-champ-open-source-versus-proprietary-platforms/563796/):

| Platform    | Sites passing CWV |
| ----------- | ----------------- |
| Duda        | **84.87%**        |
| Wix         | **74.86%**        |
| Squarespace | **70.39%**        |
| Drupal      | 63.27%            |
| Joomla      | 56.92%            |
| WordPress   | **46.28%**        |

The article notes "a significant gap between platforms with the highest ranked CMS
scoring 84.87% of sites passing CWV, while the lowest ranked CMS scored 46.28%" —
38.59 percentage points.

**The same report, April 2024 data**, reported by
[Search Engine Journal](https://www.searchenginejournal.com/core-web-vitals-wordpress-wix-squarespace-joomla-duda-drupal/517907/):
Duda 71%, Squarespace 58%, Drupal 54%, Wix 52%, Joomla 43%, WordPress 38%. Five
of six platforms _declined_ between January and April 2024; Squarespace was the
only riser (+3.92pp).

**Read this honestly.** On this measure the proprietary hosted platforms currently
beat the open-source ones by a wide margin. Any new open-source entrant has to
clear 46% to be credible and should be aiming at 85%. A fresher pull from
[httparchive.org](https://httparchive.org) would strengthen this section.

### First-hand reports

The strongest single anecdote — an **empty page** scoring 59 on mobile:

> "Mobile load times are horrific. If you're running ads to your site and care
> about mobile, just know know you're unlikely to get a score above 60, regardless
> of page elements. I tested an empty page on my site. Literally nothing but the
> footer. And it was 59 on mobile."
> — u/Hot-Resident5508 (OP), r/WIX, **56p, 61 comments**, 2024-01-05.
> https://www.reddit.com/r/WIX/comments/18yserk/wix_studio_was_not_ready_to_be_released_its/

> "I really like where they are taking Studio - polished it is not, slow it is!"
> — u/get2drew, 2p, same thread

> "notion websites are so slow. Google's page speed for your home page has a score
> of 42. Why does it say 'fast page speed' and 'great seo'?"
> — @itake, HN, 2021-10-21. https://news.ycombinator.com/item?id=28947577

Counter-evidence, included because it makes the dossier credible:

> "My GF has a Wix website with heavy image usage (she's an Interior Designer) that
> loads scary fast, nearly instantly on a ethernet connect desktop and still very
> fast on a wifi connected smart phone. […] Wix is quite fast because it serves
> server-side rendered and cached HTML."
> — u/cinemafunk, r/SEO, 7p, 2024-01-02

---

## Theme 6 — Template sameness: "every portfolio looks the same"

The best artefact is a **332-upvote, 135-comment** r/UXDesign thread whose title
is itself the complaint:

> "Why does every designer's portfolio try to make them look like they're some
> innovation visionary who can create incredible revolutionary products? Where are
> these products? They don't exist. Why can't portfolios just be about "I'm a good
> designer and I will work hard to update your minor features"."
> — u/J-drawer, r/UXDesign, **332p**, 2024-12-15.
> https://www.reddit.com/r/UXDesign/comments/1hevowl/why_does_every_designers_portfolio_try_to_make/

> "I need to update my portfolio because I'm broke AF and I desperately need a
> fucking job, and nobody's giving me an interview so I'm looking at better
> portfolios of people who are good and probably getting hired more than me, and
> they all claim to be some innovation guru genius, who's genius ideas brought the
> client's product to a revolutionary state, and everyone clapped. […] I need a
> KN95 mask and a better air purifier to try and block the stench of bullshit from
> all these portfolios I've been looking at."
> — u/J-drawer, same post

> "Unfortunately, employers/hiring managers looking for such portfolios and UX
> Designers have to follow that."
> — u/Flashy_Conclusion920, **181p**, same thread

> "Think the better question to ask is why can't the majority of portfolios just
> not look so amateurish? I've reviewed thousands of portfolios, and the vast
> majority of them just aren't good."
> — u/sabre35_, 17p, same thread

> "Because that concept doesn't sell well. Portfolios are marketing at the end of
> the day."
> — u/Plantasaurus, 8p, same thread

### Hiring managers on the same problem

This is the most useful sub-thread in the whole dossier, because it comes from
people who actually review portfolios. All from r/UXDesign, 2022-08-31,
https://www.reddit.com/r/UXDesign/comments/x258p4/are_most_people_still_using_squarespace_for_their/

> "I don't really care what candidates use to build their site, but I will admit
> that there is a very similar style that many of the portfolios have, Squarespace
> included. Home page with a welcome message and list of case studies, each with
> individual pages that go through the projects. Contact information and links to
> social media. About page with a photo and summary of why the candidate loves UX
> and some information about interests and hobbies. All of that information is good
> to include, but **they start to blur together after reviewing dozens of them.**
> The portfolios that present information differently are far more likely to grab
> my attention."
> — u/shadowgerbil

> "As someone who has hired dozens of $100k/year+ designers, I would advise you to
> just buy a nice simple $30-$60 template that allows you to highlight your process
> and impact. There is nothing more annoying than having to fight a parallax or
> scroll-jacking interactions while trying to look at someone's work. **Most design
> managers spent 1-3 mins looking at your work. Optimize for that.** Please don't
> use your website as an example of your work. It is nothing more than a utility."
> — u/MK-XXIIV

> "as a hiring manager, I don't care if you do your portfolio on the back of a
> napkin in mustard if it tells a good story and presents your design rationale.
> However, I will never see your portfolio if it doesn't make it past the recruiter
> gauntlet. And for better or for worse, they're hiring visual designers and web
> coders for my UX roles - it literally doesn't matter how many times I tell them,
> they want pretty pictures and websites that "pop" (kill me)."
> — u/oddible

> "I ain't got no damn time to code a whole ass website just to show my UX case
> studies. I'm being assessed for my UX ability, not coding. I use squarespace."
> — deleted user

> "Unless you're trying to get work as a web page designer/dev don't waste time
> building a portfolio web site. Use a product. Be a customer."
> — u/GrayBox1313 (an Adobe Portfolio user)

On builder templates specifically:

> "Adobe came in and development was basically non existent while every major
> competitor is better now. Wix, Squarespace, etc all offer better and more
> customisable templates"
> — u/Mangelius, r/graphic_design, 14p, 2023-10-01

---

## Theme 7 — Custom-domain paywalls and useless free tiers

> "so I have used wix before, a free site. i own a domain name at go daddy […] So
> everywhere i go, wix says i need a premium yearly plan to connect it, momthly
> plans do not cut it one bit, So what if i just want to pay month to month because
> of my personal situation, i can't use any domain names at all? seems totally
> insane"
> — u/bradlgrey, r/WIX, 2026-05-19.
> https://www.reddit.com/r/WIX/comments/1th71cs/connect_domain_impossible_without_buying_premium/

The only workaround offered does not mask the builder subdomain:

> "You can set up a redirect from your GoDaddy domain to your free Wix-sponsored
> URL. It won't be pretty since the Wix-sponsored URL is what site visitors will
> actually see"
> — u/Bobbycat2414, 2p, same thread

> "The builder includes the hosting so all you need to do is buy a custom domain if
> you don't want the .myportfolio subdomain visible."
> — deleted user on Adobe Portfolio, r/graphic_design, 3p, 2023-10-01

Framer's removal of the cheap personal tier belongs here too — see Theme 1, where
the $60/yr Mini plan was eliminated.

Three platforms in this dossier **forbid publishing at all** on their free tier:
Cargo ("All Cargo sites are free to try or build. To make a site public simply
choose a desired service option"), UXfolio (free tier allows "unlimited draft
portfolios" and forbids publishing), and Squarespace (trial sites are private and
non-indexed, and on expiry "all content is marked for permanent deletion").

---

## Theme 8 — Ads and branding badges on free tiers

This theme is thinner in retrieved quotes than the others; flagged rather than
padded. The documentary evidence is stronger than the anecdotal:

- **Wix free:** a Wix ad banner sits at the top of every page and scrolls with the
  visitor ([WebsiteBuilderExpert](https://www.websitebuilderexpert.com/website-builders/wix-pricing/)).
- **WordPress.com free**, verbatim from their pricing page: "Free sites display
  WordPress.com ads to visitors. Upgrade to Personal to turn them off."
- **Framer free:** permanent "Made in Framer" badge.
- **Webflow Starter:** Webflow badge in the bottom-right corner.
- **Carrd free:** "Made with Carrd" branding.
- **Super.so free:** forced "Made with Super" badge.
- **Authory free:** branding cannot be removed below Lite.
- **UXfolio free:** branding present, cannot be removed.

> "I understand that if I cancel, my site will become a free Wix website with ads,
> but what will happen to my domain?"
> — u/weirdo76, r/WIX, 8p, 2024-06-22.
> https://www.reddit.com/r/WIX/comments/1dm66sf/what_happens_to_my_domain_if_i_cancel_wix_premium/

> "And any service comparable to Adobe Portfolio would likely either have ads, or
> cost more than $5/mo."
> — u/moreexclamationmarks, r/graphic_design, 3p, 2023-10-01

---

## Theme 9 — Platform shutdowns and losing work

### Read.cv — the case study

| Item                | Value                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acquirer            | **Perplexity** — its third acquisition, after Carbon and Spellwise                                                                                  |
| Announced           | **Friday 17 January 2025**                                                                                                                          |
| Fully wound down    | **16 May 2025**                                                                                                                                     |
| Team size           | 3 people; founded 2021 by Andy Chung; backed by F7 Ventures and Fanjul Capital                                                                      |
| Sites product price | **$6 USD/month** ([indieweb.org/Read.cv](https://indieweb.org/Read.cv))                                                                             |
| Price paid          | Not disclosed ([TechCrunch, 17 Jan 2025](https://techcrunch.com/2025/01/17/perplexity-acquires-read-cv-a-social-media-platform-for-professionals/)) |

The announcement page `read.cv/a-new-chapter` is gone; the text below was
recovered from the Internet Archive (snapshot `20250305010750`). Verbatim, the
substantive portion:

> **A new chapter**
>
> Since 2021 we've had the immense privilege of putting our whole selves into
> building and growing Read.cv. We're tremendously proud of what we've
> accomplished, and the wonderful community that has blossomed around it.
>
> All of this makes today's update all the more bittersweet to share: Read.cv is
> joining the team at Perplexity in their mission to make the world's knowledge
> more accessible to everyone.
>
> This was not an easy decision for us, as the start of this new chapter will mark
> the end of our chapter with Read.cv. With this transition we will begin winding
> down operations on Read.cv and Posts on January 17th, 2025.
>
> In addition to your professional accomplishments, Read.cv was our take at
> celebrating creative work outside of the status quo — digital gardens,
> independent film, zines, furniture making, self-published music. Today we are
> making all of your data available to export in hopes that it can inspire our
> community to carry the torch and build something new.
>
> **What does this mean for Read.cv users?**
>
> Our users' data and the transition from the Read.cv platform is our highest
> priority. Starting today you can use our simple data export tool (Manage Account
>
> > Export Data) to download your profile, writing, sites, messages, and posts.
>
> **January 17th, 2025** — New user registration, new domain registration, and
> payments will be stopped. Data export tools will be available (until May 16th,
> 2025).
> **January 31st, 2025** — All domains registered via Read.cv will be migrated to
> our partners at hello.cv, where you can continue to manage your DNS, name
> servers, and renewal.
> **February 28th, 2025** — Read.cv and Posts will switch into read-only mode
> (until May 16th, 2025).
> **May 16th, 2025** — Read.cv and Posts and all corresponding data will be fully
> wound down.
>
> Profiles and sites are available as Next.js projects which you can re-host on
> Vercel or any other platform.
>
> […] We've long admired Perplexity and believe great things happen when the
> world's knowledge is made more open and accessible […]

**What users got, and what they did not.** The export was genuinely good by the
standards of this industry: profile and Sites as **JSON plus a complete Next.js
project**, Posts and Messages as **Markdown**. Domains _registered through_
Read.cv were migrated to hello.cv. Domains registered elsewhere and merely
pointed at Read.cv simply stopped resolving to content. **They did not open-source
it and never mentioned doing so** — the word does not appear in the announcement.

The escape hatch was also slightly broken. From
[foote.pub, 18 Jan 2025](https://foote.pub/2025/01/18/read-cv-eol-nextjs.html),
the most technically useful reaction, which praises the export as genuinely
pro-user — "making it easy to change between products is pro-privacy… read.cv has
done well in this regard" — while documenting two concrete bugs: "It expects a JPG
copy of your profile photo to exist in the `/public/content/media` directory in
your repo," and "The profile photo is self-hosted, which isn't supported by
default in Vercel projects."

**Current state of the domains, checked 2026-08-12:**

```
read.cv    → HTTP 402  "Payment required / DEPLOYMENT_DISABLED"  (Vercel)
posts.cv   → HTTP 402  "Payment required / DEPLOYMENT_DISABLED"  (Vercel)
hello.cv   → HTTP 200  live
```

Both `.cv` properties now return a Vercel deployment-disabled error. Nobody is
even paying the hosting bill. **The shutdown notice outlived the site by less than
eighteen months.** That is the whole argument for owning your own domain, in one
fact.

Reactions, from HN thread "Read CV Acquired by Perplexity", 2025-01-17,
https://news.ycombinator.com/item?id=42742241

> "Acquhired. Read.cv and posts.cv are shutting down on a rather aggressive
> schedule. Big points for offering download of your CV as a complete Next project
> that you can host elsewhere, though."
> — @tobr. https://news.ycombinator.com/item?id=42742546

> "Well, this feels like a betrayal. Specifically, the focus on cashing out your
> idea, which overtakes the desire to make your product the best it can be. Then
> the pretense of excitement and admiration of who bought them out. Finding and
> building a community for (tech) creatives is hard. Adding networking and post
> sharing aspects was stellar. I really liked how this one turned out. I hope the
> gap it'll leave behind is filled."
> — @pixeldrifter

**The single most useful quote in this dossier** — the thesis statement for an
ownership-first portfolio product:

> "This grows tiresome. Users are increasingly treated like stepping stools for
> founders (reminiscent of a pyramic scheme): Users help grow a product with their
> network, their content, or their money, get comfortable with that product,
> integrate it into their lives... and then it's yanked out from under them. No,
> you're not (legally) obligated to provide a service in perpetuity, and
> founders/investors take on all the risk, but what would it look like for founders
> to push back (even a bit) and say "Listen, I want your money and you want my
> product, but you need to do something to take care of my users"? Seems
> far-fetched, but at some point I (the user) am going to stop taking a risk on
> your new product and just go with one offered by Google that will last forev— Oh."
> — @JadoJodo

> "Yet again, let down by a centralised platform. I think most of the ones I
> haven't been disappointed by are forums, as many have lasted 10+ years."
> — @dorian-graph

> "To avoid relying on projects like that in the future. I use selfhosted version
> of Reactive Resume [1]. Then I can keep the last version that worked even if
> change the license or stopped working. I would recommend everyone to look into
> this as a potential solution. [1]
> https://github.com/AmruthPillai/Reactive-Resume"
> — @elashri

> "Maybe the project wasn't sustainable and the team decided to move on? It would
> be so nice if Perplexity gave them a few weeks to pull off what Campsite did and
> open source everything..."
> — @yawnxyz

> "As part of the deal, Read.cv will begin to wind down operations Friday. I don't
> recall ever hearing of such a rapidly executed acqui-hire."
> — @falcor84, 2025-01-18. https://news.ycombinator.com/item?id=42751919

> "Read.cv just announced they were shutting down and acqui-hired by Perplexity
> even though they were a lean 3-person team with a monetized product that their
> users loved. They were at it for 4 years and couldn't make it work."
> — @gyomu, 2025-01-20. https://news.ycombinator.com/item?id=42764464

> "Yeah, the community they'd built around it was next level."
> — @otter_is_fine, 2025-01-24

> "Read.cv was the only professional networking website that I enjoyed using"
> — @willmeyers, 2025-03-24. https://news.ycombinator.com/item?id=43461334

> "there was a better LinkedIn, it was called Read.cv. unfortunately, they've been
> bought by Perplexity"
> — @seanvelasco, 2025-03-25. https://news.ycombinator.com/item?id=43469706

From r/UXDesign, "What site/product is the new read.cv job board in 2025?" —
**SNIPPET-LEVEL**, recovered via search excerpt rather than fetched:

> "Last year, a friend recommended me to post on read.cv as that was 'where
> designers go to look for jobs by companies who care about design'. Indeed, after
> making our post there, we received many high-quality applications from very
> talented people. **It was perhaps the best $99 we ever spent.** However, that
> site and its associated job board is now defunct as its founder got acquired by
> Perplexity and is now designing for them."
> https://www.reddit.com/r/UXDesign/comments/1npkh33/what_siteproduct_is_the_new_readcv_job_board_in/

> "Read.cv was one of those projects that made the rounds in a bunch of pretty
> high quality private design circles and a bunch of people all jumped on really
> early. […] **I can't immediately think of anything I would equate to it
> today.**"
> — commenter, same thread

Blog reactions, fetched directly:

- [Jairus Joer, 14 Apr 2025, "Goodbye Read.cv"](https://jairusjoer.com/archive/aggregata/goodbye-read-cv/)
  — calls it "one of my favorite platforms on the web," describes spending the
  final weeks "preserving the people I've found while trying to capture the
  essence of an amazing platform that will soon be gone," and rebuilt his résumé
  "in the spirit of Read.cv" on **Astro**.
- [Patricia Parnet, Medium, "R.I.P. Read.CV"](https://patriciaparnet.medium.com/r-i-p-read-cv-the-forever-linkedin-competitor-471083ae9d13)
  — "Quietly, without much noise, the one true creative-centric alternative to
  LinkedIn has disappeared, and with it, a community…" (SNIPPET-LEVEL).

**What the community built in response, within days:**

| Thing          | What                                                                                                                                                                           | Evidence                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| readcv2pdf.com | Emergency PDF exporter — "Before read.cv has fully shut down after their acquisition by Perplexity AI, use this tool to download your CV to PDF and continue using it offline" | [HN 42793410](https://news.ycombinator.com/item?id=42793410), 2025-01-22 |
| twigg.social   | Successor to posts.cv, "built in the wake of the loss of posts.cv"                                                                                                             | [HN 42813068](https://news.ycombinator.com/item?id=42813068)             |
| tini.bio       | Alternative posted in the thread                                                                                                                                               | [HN 42742772](https://news.ycombinator.com/item?id=42742772)             |
| heyhunter.com  | "Show HN: A one-click Read.CV alternative"                                                                                                                                     | [HN 45066698](https://news.ycombinator.com/item?id=45066698), 2025-08-29 |

Where people actually went: Astro and self-built static sites, Next.js on Vercel,
self-hosted Reactive-Resume, and Squarespace. For the job-board function: Welcome
to the Jungle, Built In, Wellfound and Y Combinator.

Read.cv is catalogued as a site-death in
[indieweb.org/site-deaths](https://indieweb.org/site-deaths),
[indieweb.org/Read.cv](https://indieweb.org/Read.cv) and
[rip.so/read-cv.html](https://rip.so/read-cv.html).

### Behance ProSite → Adobe Portfolio, 2016 — the best-documented portfolio stranding

The brief expected Coroflot to be the second case study. It is not (see the
correction below). The strongest available second case is **Behance ProSite**,
announced dead in February 2016 and switched off that June. The
[Core77 thread](https://boards.core77.com/t/behance-prosite-discontinued-moving-to-adobe-portfolio/30813)
(created 2016-02-09, 4,643 views) quotes Behance's notice verbatim:

> "**Behance ProSite is being discontinued as of June 2016.** As an alternative to
> ProSite, we'd love you to check out Adobe Portfolio. Portfolio allows you to
> quickly and easily build a fully responsive website to showcase your creative
> work. Portfolio also syncs seamlessly with Behance… **You'll be able to edit and
> access your current ProSite until June 2016**, but we highly advise you to begin
> creating your site with Adobe Portfolio by visiting www.myportfolio.com today.
> If you're already paying for Prosite though Adobe with a Standalone, Single App,
> or Full Creative Cloud membership, your Adobe Portfolio membership is already
> included. If you're not currently subscribed with Adobe, **you can purchase a
> new Adobe Creative Cloud Plan (starting at $9.99)** when you publish your Adobe
> Portfolio."

Read that last sentence again: the migration path from a dead portfolio product
was _start paying for a software subscription_. User reactions in-thread:

> "Well that sucks. **Spent a lot of time setting up my professional website on
> Bechance Prosite, only to hear it's dead as of June 16.** Anyone tried Adobe
> Portfolio?"
> — rkuchinsky, 2016-02-09

> "I'd have to **start from scratch in Squarespace** not only building the template
> but **uploading 30+ projects and 100s of images. Ugh.** I may take another look
> at it though as **I do recognize being in Adobe's walled garden has its
> limits.**"
> — rkuchinsky, 2016-02-10

> "I played around with the public beta a couple months ago. It's ok, but I found
> some layout features to be limiting, and creating a page that was not just images
> next to impossible. **I went with Squarespace.**"
> — Ricecracker, 2016-02-10

The compounding irony: two commenters recommended **Adobe Muse** as the escape
hatch. Adobe discontinued Muse too. (Muse EOL date **UNVERIFIED**.)

### Corrections — three shutdowns that did not happen

A live-status sweep on 2026-08-12 contradicts three premises that circulate
widely. **Do not assert any of them.**

| Platform            | HTTP        | Verdict                                                                                                                                                                                                                      |
| ------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| coroflot.com        | 200         | **Alive and actively trading.** Live job listings, a running Core77 × Autodesk Fusion competition with a **28 Sep 2026** deadline and $9,750 prize pool, a weekly featured-designer showcase, and a Basic/Pro portfolio tier |
| dunked.com          | 200         | **Alive.** Claims "we've helped more than 100,000 talented people." Live pricing, blog and templates                                                                                                                         |
| format.com          | 200         | Alive. **No evidence of an ownership change was found**                                                                                                                                                                      |
| krop.com            | 200         | Portfolio hosting alive; the **job board** shut down "early 2024" per [Betterteam](https://www.betterteam.com/krop) (secondary; exact date UNVERIFIED)                                                                       |
| carbonmade.com      | 200         | Alive, no ownership change found                                                                                                                                                                                             |
| portfoliobox.net    | 200         | Alive                                                                                                                                                                                                                        |
| cargocollective.com | 200         | 301-redirects to cargo.site                                                                                                                                                                                                  |
| semplice.com        | 200         | Alive                                                                                                                                                                                                                        |
| muz.li              | 200         | Alive; muzli.space is a dead subdomain                                                                                                                                                                                       |
| theloop.com.au      | no response | **Ambiguous — UNVERIFIED.** DNS resolves; HTTPS does not respond; the LinkedIn page still claims "over 125,000 profiles"; no shutdown announcement found                                                                     |
| read.cv / posts.cv  | 402         | Dead                                                                                                                                                                                                                         |
| hello.cv            | 200         | Alive                                                                                                                                                                                                                        |

What actually happened to **Coroflot** is the quieter and arguably more common
failure mode: **feature removal followed by paywalling**. In December 2024 the
portfolio section vanished from Core77's navigation
([Core77 boards](https://boards.core77.com/t/no-more-coroflot-portfolio-section/93876)):

> "I tried to log in today and everything has changed. **Coroflot doesn't exist
> anymore** and there doesn't seem to be a portfolio section under core77. So I
> guess it's officially removed for good?"
> — molested_cow, 2024-12-26, who adds that he introduces it to his students every
> year and has them build portfolios on it

And in March 2026 a Basic/Pro tier appeared, gating project count
([Core77 boards](https://boards.core77.com/t/96133)):

> "So, I'm torn about updating to 'Pro' or letting my existing three projects (ha)
> lapse to 'Basic'."
> — slippyfish, 2026-03-30

> "'Corporate' is happy to hear you still see Coroflot in use! I think with three
> projects you could get by with basic for a long time. There are some cool
> features under development - like google stats, personal domain names, placement
> on the Core77 homepage - but those matter more if you are using it to promote
> yourself."
> — shaggy, Core77 staff, 2026-04-01

### Cargo Collective — three incompatible generations, no upgrade button

Verified: three generations coexist with three separate documentation sites —
Cargo 1 (`support.cargocollective.com`), Cargo 2 (`cargo2support.cargo.site`),
Cargo 3 (`docs.cargo.site`). Cargo 3's docs carry a dedicated
["Moving from Cargo 2 to 3"](https://docs.cargo.site/Moving-from-Cargo-2-to-3)
article; Cargo 2's support carries a "Moving a Cargo 1 Domain to Cargo 2" article
requiring manual DNS reconfiguration into a "pending state."

**No official Cargo 1 or Cargo 2 end-of-life date exists that could be found —
UNVERIFIED.** The strongest description of the migration cost comes from an
interested party (a vendor selling migrations), so treat it as a claim, not a
fact ([stevesims.com](https://www.stevesims.com/cargo-platform-migration/)):

> "Because the two engines rely on completely distinct framework logic, there is
> no automatic 'upgrade' button. Moving your site means executing a complete manual
> rebuild. … trying to migrate years of high-resolution portfolios manually can
> quickly lead to broken responsive scaling, dropped layout loops, and missing
> media files."

### Muzli and InVision

Muzli was not shut down but was cut loose. From Muzli's own post,
["A new chapter of the Muzli story"](https://medium.muz.li/a-new-chapter-of-the-muzli-story-3588fc645541):

> "So we are excited to announce that **starting 2023 Muzli becomes a 'Muzli X', a
> fully detached business, independent from our long-term parents at InVision.**
> For those who don't know, we were acquired by InVision almost 8 years ago…"

**InVision itself** announced the shutdown of its design-collaboration services on
**4 January 2024**, retiring them on **31 December 2024**
([DesignWhine](https://www.designwhine.com/invision-shutdown-2024/),
[Designmodo](https://designmodo.com/invision-alternatives/)). **Secondary sources
only** — InVision's own announcement was not fetched.

### The registry: indieweb.org/site-deaths

There is a canonical, maintained catalogue of exactly this failure mode, and its
framing is quotable verbatim
([indieweb.org/site-deaths](https://indieweb.org/site-deaths)):

> "**Site deaths are when sites go offline, taking content and permalinks with
> them, and breaking the web accordingly. Site deaths are one of the big reasons
> why you should own your own identity and content on the web.** This is a
> chronology of content hosting sites that have died, **removing millions
> (billions?) of permalinks from the web.**"

It runs year by year back to 2000. Entries relevant to people who host personal
sites, portfolios or creative work include **Read.cv (2025)**, Refern (2025-09-13,
all content deleted), Cohost (2024), TinyLetter (2024), Ello (2023), Revue (2023),
Polyvore (2018), Storify (2018), Lanyrd (2018), FFFFound (2017), Flavors.me
(2017), mlkshk (2017), Picasa (2016), Panoramio (2016), **Google Drive web hosting
(2016)**, **Comcast/Xfinity Personal Web Pages (2015)**, Vizify (2014), My Opera
(2014), Readmill (2014), Everpix (2013), Posterous (2013), and **Apple MobileMe
Gallery / iDisk / iWeb (2012)**.

Two more from that page worth flagging:

- **Typepad**, a blogging and personal-site platform: "2025-09-30: Typepad will be
  shutting down and **exports won't be available after this date.**"
- The page keeps an **"Acquihires"** section explicitly as a leading indicator:
  "The announcement of an acquihire… may, but does not necessarily, indicate a
  potential future site-death. Exporting your personal data from these services may
  be a good preventative measure."

Related compilations it links: "Our Incredible Journey" (a tumblr of
acquisition-plus-shutdown notices, self-described as "a snarky and angry response
to companies and people who profit from an acquisition while showing little regard
for the efforts of the thousands of people who spent time on their service"),
Killed by Google, the TechCrunch Deadpool, RIP.so, and r/Shutdown.

### Google Domains sold to Squarespace

| Event                          | Date                 | Detail                                           |
| ------------------------------ | -------------------- | ------------------------------------------------ |
| Definitive agreement announced | **15 June 2023**     | **$180 million**, roughly **10 million domains** |
| Deal completed                 | **7 September 2023** | Google Domains stopped new registrations         |

Sources: [Squarespace press release, 15 Jun 2023](https://www.squarespace.com/press-releases/2023/6/15/squarespace-enters-definitive-agreement-to-acquire-google-domains-assets);
[Squarespace newsroom](https://newsroom.squarespace.com/blog/googledomains) — "…which
will be winding down following a transition period. This purchase includes
approximately 10 million domains hosted on Google Domains";
[Squarespace press release, 7 Sep 2023](https://www.squarespace.com/press-releases/2023/9/7/squarespace-completes-acquisition-of-google-domains-assets);
[The Verge](https://www.theverge.com/2023/6/16/23763340/google-domains-sunset-sell-squarespace).
The $180M figure is from [Domain Name Wire](https://domainnamewire.com/2023/06/15/squarespace-buys-google-domains-for-180-million/).

HN threads: **548 points / 606 comments**
(https://news.ycombinator.com/item?id=36346454); 174 points (36423465); 120 points
(40187881).

**Renewal-price increases after the transfer: SNIPPET-LEVEL only, exact figures
UNVERIFIED.** Thread titles recovered but bodies not fetched: r/squarespace "$280
for Domain Renewal!!!"
(https://www.reddit.com/r/squarespace/comments/1d8fo94/280_for_domain_renewal/) —
"My domain moved from Google Domains to Squarespace… **Google, in my opinion, you
made a big oops when selecting Squarespace to inherit your domain inventory.**";
and Squarespace's own forum thread ["Forced Price Increase: How to Properly
Transfer Google Workspace Away from Squarespace Due to Price
Change"](https://forum.squarespace.com/topic/332065-forced-price-increase-how-to-properly-transfer-google-workspace-away-from-squarespace-due-to-price-change/).

> "how odd, all my google domains just transferred to squarespace today. now thru
> no consent of my own all my domain and payment information are belong to this
> private equity shop i dont know anything about that is also likely to strip it
> for parts. idk how to feel about that"
> — @swyx, 2024-05-13. https://news.ycombinator.com/item?id=40343196

> "I don't recall seeing anything about Squarespace immediately going private and
> being beholden to an investment firm showing up in those emails. […] Too bad the
> timing of this announcement is days after the migration from Google to
> Squarepspace, so I'm not actually allowed to migrate my domain for 60 days :)"
> — @ziddoap, 2024-05-13. https://news.ycombinator.com/item?id=40343526

> "My biggest mistake was trusting Google. When I heard the news, I migrated all my
> domains to Cloudflare/Namecheap."
> — @delduca, 2024-04-28. https://news.ycombinator.com/item?id=40188522

> "1: Price (66% increase in price for no additional value)"
> — @WillPostForFood, 2023-06-16. https://news.ycombinator.com/item?id=36350869

> "Multiple times this week (and for completely different accounts) I've updated
> DNS records in SquareSpace domains dashboard only for nothing to update nor
> propagate around the web. […] Reaching out to support is a nightmare because
> their agents are simply trained to say "you need to wait 72 hours" […] and after
> 72 hours has passed with no update, they've simply stopped replying to me. […]
> if you had domains on Google and simply let the migration go ahead - I'd
> recommend moving your domains off SquareSpace asap."
> — @jc_811 (OP), "Tell HN: I think there are major issues with Google –
> Squarespace domains", **120 points**, 2024-04-28.
> https://news.ycombinator.com/item?id=40187881

> "Google got tired of being in the business and sold it to Squarespace. Being a
> domain registrar is a total PITA and is not for the faint of heart, so it's the
> sort of thing that any business that takes it on as a non-core function will
> eventually tire of."
> — @jasongill, 2026-07-23. https://news.ycombinator.com/item?id=49029322

### People losing access to sites and email after the migration

> "I bought my domain through **Squarespace**, assuming they handled everything.
> Turns out Squarespace uses **Google as the backend registrar** for certain
> domains. When I tried to cancel or stop renewal, Squarespace said: _"You'll need
> to contact Google Workspace."_ Google Workspace said: _"You'll need to contact
> Squarespace, since they're the reseller."_ […] **It's a complete loop.**"
> — u/Affectionate-Top8987, r/squarespace, **35p, 41 comments**, 2025-10-07.
> https://www.reddit.com/r/squarespace/comments/1o0ny9h/warning_about_squarespace_google_workspace_domain/

> "Squarespace's chat reps want a copy of my drivers license and bank statement
> just to give me access to my account since the old email associated to it is shut
> down"
> — same post

> "I'm shocked this is even legal. There's **no clear ownership pathway**, **no
> transparent access to billing**, and **no live huma[n]**"
> — same post

> "TL;DR. We are launching our digital health startup and are locked out of our
> Google Workspace admin account bought via Squarespace. Squarespace says it's
> Google's fault. Google's security has us in a Catch-22 loop. We've lost access to
> our email and all our work right at the most critical time"
> — u/MakeYourTimeNow, r/squarespace, 22p, 2025-08-25.
> https://www.reddit.com/r/squarespace/comments/1mzlia9/warning_for_founders_our_startup_is_dead_in_the/

> "Yet another example as to why you keep your domain registration, site hosting,
> and web services (like email), separate."
> — u/north7, **14p**, same thread

> "I tell my web design clients the same thing: Don't hitch any other wagons to
> Squarespace."
> — u/InternationalCandy16, 5p, same thread

> "After this my homepage became a placeholder "We're under construction" site. […]
> **Unfortunately Squarespace support is GARBAGE and has not replied to my ticket
> after 1 week.**"
> — u/ricardowong, r/squarespace, 12p, 2024-07-10.
> https://www.reddit.com/r/squarespace/comments/1dzkn92/google_domain_transfer_issue_squarespace_support/

> "My business's .com domain previously registered with Google Domains failed to
> migrate successfully into my Squarespace account. Squarespace's "customer care"
> team has treated me like a stranger for weeks. […] No one has acknowledged that
> I've been a paying customer for 5 years."
> — u/kn0w_thyself, same thread, 2024-09-20

> "They did not think this migration through. My email account is suspended and
> Squarespace support is non existent. I literally cannot operate right now!
> Assholes!!!"
> — u/valgray8, same thread, 2025-05-18

> "I have a production outage and cannot even reach squarespace."
> — u/Standard-Pea-3438, same thread, 2024-10-05

### Sites simply vanishing

> "Been a WIX customer for 12 years. 5 websites, 3 current. Wake up yesterday to
> all 3 sites gone and my email blocked. And, as a "PREMIUM" customer, I get to
> send an email to abuse@wix.com and wait for ???? however long. Do better Wix."
> — u/tohellurider, r/WixHelp, 2024-06-14.
> https://www.reddit.com/r/WixHelp/comments/1c7mzc8/deleted_by_user/l8n160v/

Wix's own community account replied to the original poster: "There appears to be
a flag on your account, in this case please email our team at abuse@wix.com from
your account email address" — u/WixCommunity (official), same thread.

### Version migrations that strand existing sites

This is the verified case of the "platform upgrade broke my site" mechanic —
Squarespace 7.0 → 7.1:

> "I hate Squarespace so much it makes my blood boil. I've been a loyal user for
> years now, and the fact they punish long term users by not letting us upgrade to
> 7.1 is just mind blowing to me. **They tell me I'd have to delete and re create
> my entire site from scratch to upgrade**… which is laughable. Imagine having to
> redo all my SEO, blog posts, getting my location tags to rank on google, etc.
> just because they're too stubborn to offer us this option easily. WHY."
> — u/ihatecartoons, r/squarespace, 2022-07-19.
> https://www.reddit.com/r/squarespace/comments/w2jtwl/squarespace_is_so_incredibly_frustrating_in_every/

> "I had to switch entire templates just to be able to do a scrolling banner (which
> took a full day to re choose all my fonts, colors, and styling - because those
> don't transfer over either!) However now my gallery images are way too small on
> the new template and there is NO way to make them bigger."
> — same post

> "Yeah the 7.1 thing was my last straw. […] I have Maybe 10 hours a week for my
> business. Squarespace maintenance took like 15 hours of it. I'm not even doing
> anything complicated I literally just have a blog. But every simple feature I
> want to add is as difficult as pulling teeth out with pliers. Relaunching in a
> few weeks with Ghost"
> — u/freemangrist, same thread, 2023-03-04

### Adobe Portfolio, Behance and Dribbble — stagnation rather than shutdown

> "Back before Adobe bought Behance, their prosite (which became portfolio) was
> fairly cheap compared to other things and pretty convenient, since Behance was
> quite trendy and new at the time. **Adobe came in and development was basically
> non existent while every major competitor is better now.** […] **There's also no
> option to subscribe to Adobe portfolio. It's only available alongside a software
> subscription.** Maybe you'll use Adobe apps for the rest of your career. But if
> you don't need them anymore because you're off the tools or have transitione[d]…"
> — u/Mangelius, r/graphic_design, **14p**, 2023-10-01.
> https://www.reddit.com/r/graphic_design/comments/16wq32d/is_adobe_portfolio_worth_it_over_other_services/

> "Behance is not as good, as it's a social media platform first and foremost, it's
> barely above using Instagram."
> — u/moreexclamationmarks, 3p, same thread

> "If you want to cause more impact then go for Framer, it's cheaper and years
> ahead the overlimited Adobe Portfolio."
> — u/Extreme_Band_6097, r/graphic_design, 3p, 2025-02-16.
> https://www.reddit.com/r/graphic_design/comments/1iqizxm/is_adobe_portfolio_with_behance_pro_worth_it/

> "I suspect a lot of designers are really just designing for dribbble/Behance
> portfolios so they can finally climb the ladder to Art Director."
> — @et-al, HN, 2017-08-05. https://news.ycombinator.com/item?id=14937193

> "Designers face a similar problem; often companies do first-pass sourcing and
> filtering on the basis of Dribbble and Behance portfolios, which are heavy on
> pretty visuals but light on process and solving business problems."
> — @didgeoridoo, HN, 2015-09-25. https://news.ycombinator.com/item?id=10279706

### The structural argument

> "The goal was to provide adequate notice for people to figure out whether
> migration, export, or deletion of their classic sites makes the most sense. […]
> One of the big challenges in the website builder space, something that Google.
> Wix, Squarespace, have all dealt with - is that when a user publishes a website,
> there's an expectation around the fidelity and look-and-feel of that website."
> — @mattzito, a Google employee, on the Classic Google Sites shutdown, 2020-08-07.
> https://news.ycombinator.com/item?id=24082555

> "This gets you to somewhere like MySpace, Wix, Squarespace, Google Sites, even
> Blogger, etc. But of course, such offerings aren't stable - they change, fail, or
> enshittify over time. […] **TL;DR: there's no perfect solution for non-techies
> with a business. You either have a fucking website with all of the cost, hassle,
> and friction that comes with that, or you choose one of platforms that simplifies
> this but comes with unpredictable downsides over time.**"
> — @mft_, HN, 2026-03-18. https://news.ycombinator.com/item?id=47424055

---

## Theme 10 — Editors that break, and mobile responsiveness

> "Wix Studio was not ready to be released. It's horrible. […] Page resizing is
> torched. Want to used advanced sizing? Good luck. It's unusable."
> — u/Hot-Resident5508 (OP), r/WIX, **56p, 61 comments**, 2024-01-05.
> https://www.reddit.com/r/WIX/comments/18yserk/wix_studio_was_not_ready_to_be_released_its/

> "Wix Studio is painful, infuriatingly limited, and extremely buggy. It feels like
> it was written by amateurs with no understanding of usability or quality. Don't
> use it at any cost. Avoid it. Seek any other platform, and be grateful you're not
> at the mercy of Wix."
> — u/ZeManboy, 2p, same thread

> "The editor is so laggy sometimes it makes me want to scream, and don't even get
> me started on mobile responsiveness—it never looks how I want it to. Half the
> time, simple changes break the entire layout"
> — u/NickNova3016 (OP), r/WIX, 22p, 2025-02-05.
> https://www.reddit.com/r/WIX/comments/1iimx67/wix_designers_is_it_just_me_or_is_this_platform/

> "I often have to create a new page and start over because it simply refuses to
> stack the sections correctly on mobile. These are not complicated things I'm
> doing, it simply does not work."
> — u/rosedraws, 3p, same thread

> "Just earlier I was trying to center a stack, and when doing so it jumbled the
> order and made the spacing like -120px* or some ridiculous shit. These type of
> bugs makes me feel like I don't know what the hell I'm doing."
> — u/HvkS7n, 4p, same thread

> "last time I had the misfortune to have to use it, they had a separate layout for
> desktop and mobile making for twice the work."
> — u/mooter23, r/SEO, **53p**, 2024-01-02

> "I've tried to open the wix editing tool, and it uses so much memory that it
> regularily crashed the chrome tab that I had opened it in."
> — @yosamino, HN, 2021-04-13. https://news.ycombinator.com/item?id=26798207

> "The UI layer is complete and total garbage. It is unbelievably slow and clunky
> and it makes doing anything with it a chore. / The UI is complicated enough that
> it would be easier to teach the non-technical folks to use markdown."
> — @Karunamon on Webflow, HN, 2023-07-15. https://news.ycombinator.com/item?id=36736979

---

## Theme 11 — Support quality

**Squarespace does not offer phone support, by policy.** Its help centre article
["Why we don't offer phone support"](https://support.squarespace.com/hc/en-us/articles/206545487-Why-we-don-t-offer-phone-support)
gives four reasons verbatim: "We can instantly view your website, account
activity, system details, and other information so we can troubleshoot
effectively"; "Building a website is a visual process"; "It's faster. We can
quickly get to the bottom of your questions without putting you on hold"; "Online
support keeps detailed records in one place." Channels are email (24/7), live chat
(most weekdays) and X/@SquarespaceHelp.

The BBB profile for Squarespace, Inc. records **435 complaints in the last three
years, 108 closed in the last twelve months**, and the company is **not BBB
accredited**
([bbb.org](https://www.bbb.org/us/ny/new-york/profile/internet-service/squarespace-inc-0121-103868/complaints),
fetched 2026-08-12). Recent complaint excerpts from that page:

> "They THEN went and charged me for a separate workspace feature...They took my
> money for a feature that is canceled now" — 23 July 2026
> "Squarespace is holding $14,000 of my money...There is no phone number to call no
> escalation email" — 23 July 2026
> "my domain is now in redemption status and I am being charged an additional $45
> redemption fee" — 22 June 2026

> "squarespace support is an absolute nightmare"
> — u/Longjumping_Watch145, r/squarespace, 7p, 2025-10-07

> "Bottom line: Squarespace way overshot their capability, doesn't provide timely
> or live support, support staff doesn't even understand how their own system works
> […] Yes. Garbage. Opinion based on multiple first hand experiences over many
> years."
> — u/9inez, r/squarespace, 4p, 2024-07-10

> "More than two hours waiting in the "live chat". Any help?"
> — thread title, r/squarespace, 2024-05-17.
> https://www.reddit.com/r/squarespace/comments/1cuhm2o/

> "I've reached out to support 5 different times for various issues. Not a single
> time have they fixed the problem. […] After 30 min with support, he said he was
> going to have to email me. He then sent two emails saying he was going to
> escalate the issue. Two dates later, still no solution. This is is a section
> resizing issue…this should be the basics."
> — u/Hot-Resident5508, r/WIX, 56p, 2024-01-05

> "We have also had no less than 5 customer service attempts to only be told, "we
> will escalate the issue" never happens and NO responses. Will NOT ever use again
> and will not ever recommend."
> — u/mamaflysneekz, 7p, same thread

> "Wix customer service model is whack! The reps you are able to speak to (as
> serious developers with real technical issues) are often lightly knowledgeable in
> the code level stuff and will always need to "escalate" to the dev team who are a
> deep dark secret organization. They typically take days to reply and never truly
> give you an idea of if something will be addressed or not."
> — u/get2drew, 2p, same thread

> "the response time when it comes to reviewing templates is really bad, overall
> their support is deficient."
> — u/ezekielgonzalez on Framer, r/framer, 7p, 2024-11-22

> "I handed off our first Framer project to a client. It was confusing as hell,
> there was no support either or any documentation."
> — u/Wakinghours, r/framer, 2p, 2025-07-29

Also worth noting from Hacker News, 2026-07-28: a user reporting that Squarespace
"refuses to enable dkim signing for transactional emails...it's just disappointing
that we have to move to a different platform again for technical reasons that are
solvable with a dashboard switch" — @infogulch,
https://news.ycombinator.com/item?id=49084503

---

## Theme 12 — Billing, auto-renewal and refund refusals

This is the angriest material found anywhere. Trustpilot was inaccessible, but
r/WIX substitutes almost perfectly — it is a near-continuous stream of billing
complaints.

> "Count me in with the people on here warning about the absolutely dogshit
> business practices WIX has sunk to. You've heard it before: I had a 3 year
> renewal on a site I've had for 6 years, price rose 84% - I got pushed into the
> "Premium" tier. **$864 for a static website.**"
> — u/tberger, r/WIX, **60p, 64 comments**, 2026-02-04.
> https://www.reddit.com/r/WIX/comments/1qvt6cv/another_reminder_to_get_off_of_wix_now/

Wix's verbatim refusal, quoted by the same user:

> "Additionally, I'd like to clearly set expectations regarding your refund request
>
> - Premium Plan renewal and Upgrade charges are not covered by our refund policy
>   which you agreed with when signed up with Wix."
>   — Wix support, quoted in the above post

> "Dispute w your CC company. I did and they got my money back. Christ this sub
> Reddit is 90% people complaining about this. WIX is evil"
> — u/ghostboi420, **22p**, same thread

> "I urge anyone who has fallen victim to Wix's shady business practices to
> **PLEASE** file a complaint with the **New York Attorney General**'s office,
> ASAP."
> — u/Healthy_Ask_7393, 3p, same thread

> "Bought a $210 2-year subscription that increased to $620 over 2 years, hiding
> the fact that it would auto-renew at time of sale […] Wix are truly disgusting
> scammers who derive the majority of their profits through tricking their users.
> I'm a student who won't be able to pay rent with this charge"
> — u/shelben15, r/WIX, **74p, 69 comments**, 2025-07-01.
> https://www.reddit.com/r/WIX/comments/1lonmno/absolutely_disgusting_company/

> "Challenge it with your bank. I did and got my refund. They did appeal the banks
> decision but their appeal failed because it essentially got classed as a "scam"
> because of the way that Wix behaved when they hiked the prices and re-instated my
> auto renew."
> — u/E-Skullery, 7p, same thread

> "Wix just pulled $903 out of my bank account for a website I tried to cancel
> multiple times. And the best part? The cancel renewal option mysteriously
> appeared after they charged me. […] There was no option anywhere to cancel the
> renewal. None."
> — u/Fickle-Lab-8662, r/WIX, **32p, 60 comments**, 2026-03-07.
> https://www.reddit.com/r/WIX/comments/1rn9kbm/wix_just_charged_me_903_for_a_website_i_tried_to/

> "At this point I wonder if a CLASS ACTION LAWSUIT is in order. This type of post
> is a daily occurrence."
> — u/ghostboi420, 7p, same thread

> "if they don't let you cancel, do it at the payment level. I had to turn off my CC
> to stop my Wix account"
> — u/arguix, 3p, same thread

> "In September 2025 WIX raised switched my "Core" plan to an "Unlimited" plan,
> nearly doubling the price with no opt-in. […] I issued a chargeback on my credit
> card, which was disputed by WIX. Furthermore, WIX punitively cancelled my
> service! They were now trying to force me to pay $500+ for a service that not
> only did I not want, but one they were not even delivering!"
> — u/Sea_Establishment973, r/WIX, **28p, 32 comments**, 2025-12-31.
> https://www.reddit.com/r/WIX/comments/1q00wz0/wix_subscription_predatorily_raise_your/

> "They're doing the same thing to me, but since I paid through PayPal, PayPal has
> denied all of my chargebacks! Chargebacks! I had a core plan that I paid around
> $350 for, they raised to a business plan and charged $1,200!!!!! They also
> canceled my service and charged me for a reduced service. Plan, the smallest one,
> but then kept all of the $1200."
> — u/pahoiku, same thread, 2026-01-28

> "I've managed to secure a promise of a refund from Wix but they are holding on to
> my $NZ 1000 for 45 days before processing the refund. They are so scammy! I've
> used them for years and they have lost my businesses going forward."
> — u/Either-Excuse2567, same thread

> "Got charged 360€ on December 24th. Sent a refund request, and they are telling
> me such requests take 45 days to get answered! I'm so disgusted. It's a huge sum
> of money for a freelancer like me. For a service I don't even use anymore."
> — u/seypafo, same thread, 2026-01-05

> "This is really helpful. But best not to deal with this company at all. Wix used
> to be OK a few years ago but lately they've become aggressively greedy with bait
> and switch swindles."
> — u/JackStrawWitchita, 4p, same thread

Squarespace equivalents — thread titles captured verbatim, bodies not retrieved
(SUMMARY): "Avoid at all cost" (r/squarespace, 2025-12-16,
https://www.reddit.com/r/squarespace/comments/1pofo6u/); "Billing update request
resulted in $276 charge from SquareSpace" (2026-01-24,
https://www.reddit.com/r/squarespace/comments/1ql9cbg/); "Squarespace cancelled my
subscription and refusing to give me a refund" (2023-02-01,
https://www.reddit.com/r/squarespace/comments/10qlpfp/); "Squarespace holding my
funds for weeks - No Support, No Resolution" (2025-02-05,
https://www.reddit.com/r/squarespace/comments/1iicz64/).

---

## Theme 13 — Accessibility

**Not verified.** No website-builder accessibility lawsuit was confirmed. The only
adjacent quote retrieved concerns WordPress, not a builder:

> "Sure, accessibility continues to be an issue."
> — @goatherders, HN, 2021-04-07. https://news.ycombinator.com/item?id=26729984

This theme needs dedicated research. Suggested starting points: "Wix ADA
lawsuit", "accessiBe FTC", "Squarespace WCAG lawsuit", and UsableNet's annual
digital accessibility lawsuit report.

---

## Theme 14 — "They're spending our money on AI we didn't ask for", plus reliability

This was not in the original brief but is **the dominant 2026 grievance** on
r/webflow and r/framer, and it pairs naturally with the pricing theme.

> "The ai push feels so disconnected from actual client needs too."
> — u/EmbarrassedGoose9910, r/webflow, 21p, 2026-05-15

> "It really feels WF has lost its way and forgotten its mission/impetus. All just
> to chase the shiny object (AI) which they appear to be woefully behind on anyway"
> — u/sregormd, r/webflow, **16p**, 2026-05-15

> "Desperately pushing Ai tools that most of your user didn't want or ask for—and
> from what feedback I see, don't really work. / Charges for tools, features, and
> services that are standard with other CMS' for much less money. / Price hikes for
> minimal-to-zero improvements"
> — u/sregormd, r/webflow, **26p**, 2026-05-13

> "Still can't use CMS in a slider, but hey... ✨AI✨"
> — u/White_Panther420, r/webflow, 5p, 2026-05-18

> "It really feels like they're death spiralling and just want a bag before it
> truly implodes. Sentiment has never felt worse."
> — u/helpasisterout21, r/webflow, 7p, 2026-05-15

> "Given all the recent pain with outages etc which we received zero by way of
> goodwill gesture other than "soz", this is a bit salt-in-wound like, isn't it?"
> — u/steve1401, r/webflow, **51p**, 2026-05-13

> "Another webflow outage like every few months makes Webflow so unreliable"
> — thread title, r/webflow, 34p, 2026-04-16.
> https://www.reddit.com/r/webflow/comments/1smz07u/

> "Wix is very down"
> — thread title, r/WIX, 22p, **2026-08-01** — eleven days before this dossier was
> compiled. https://www.reddit.com/r/WIX/comments/1vcld69/

> "Don't Overly Focus on AI. We get it—AI is the buzzword of the moment. But if we
> really wanted AI-driven design, we'd already be using products built specifically
> for AI website generation."
> — u/Living_Ad_8102, r/framer, **108p**, 2025-07-27.
> https://www.reddit.com/r/framer/comments/1mavvc0/my_growing_frustrations_with_framer/

---

## Theme 15 — Client handoff has no good answer anywhere

A distinct, repeated and unsolved need that surfaced independently of the brief:

> "As an agency, most of our work involves building websites for clients. There's
> no straightforward way to transfer a website to a client upon completion."
> — u/Living_Ad_8102, r/framer, 108p, 2025-07-27

Webflow's answer is to buy a Freelancer or Agency Workspace ($16–35/mo) so client
sites can be transferred; Framer's is manual; Wix's is transferring a site to
another Wix account, which keeps everyone inside Wix.

---

## What the complaint data says, in five lines

1. **Price is the trigger, lock-in is the trap.** Almost every angry thread starts
   with a price rise and ends with someone calculating that leaving costs more
   than staying.
2. **The grievance is live, not historical.** Webflow's 34% May 2026 hike,
   Squarespace's unannounced July 2026 hike, and a Wix outage on 1 August 2026 are
   all within the last ninety days.
3. **Wix's own documentation is the single most citable fact in this dossier.**
   It says, in the vendor's words, that your site can never leave their servers.
4. **Hiring managers spend one to three minutes on a portfolio.** Two of them said
   so unprompted. That reframes what a portfolio product actually needs to be good
   at.
5. **Users are already asking for this product by name.** "At some point, I think
   a free open source product will compete with the mayor players," and "I would
   pay for being able to use the builder once. Upload to my server and own my own
   design."

---

# 4. Market data

## 4.1 Size of the website-builder market — analysts disagree by 2.4×

Present the spread, never an average. Part of the disagreement is definitional:
"website builders" and "website builder _software_" are different markets, and two
firms publish two differently-numbered reports under near-identical names.

| Firm                                                                                                                     | Base figure                                   | Base yr | Forecast       | Fcst yr | CAGR       | Verification                                      |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ------- | -------------- | ------- | ---------- | ------------------------------------------------- |
| [Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/website-builders-market)                       | **$3.06B** (2025) → **$3.57B** (2026)         | 2025/26 | **$7.67B**     | 2031    | **16.58%** | Fetched. Last updated 2026-07-09                  |
| [360iResearch](https://www.360iresearch.com/library/intelligence/website-builders)                                       | **$4.90B** (2025) → **$5.40B** (2026)         | 2025/26 | **$9.71B**     | 2032    | **10.25%** | Fetched                                           |
| [Verified Market Research](https://www.verifiedmarketresearch.com/product/website-builder-software-market/) (_software_) | **$1.97B**                                    | 2024    | **$3.58B**     | 2031    | **7.73%**  | Fetched                                           |
| [Global Growth Insights](https://www.globalgrowthinsights.com/market-reports/website-builders-market-110857)             | **$2,063.16M** (2024) → **$2,201.39M** (2025) | 2024/25 | **$3,946.17M** | 2034    | **6.7%**   | Fetched. Page contradicts itself on the base year |
| [Business Research Insights](https://www.businessresearchinsights.com/market-reports/website-builders-market-100500)     | **$2.72B**                                    | 2026    | **$4.76B**     | 2035    | **6.4%**   | SNIPPET-LEVEL — Cloudflare-blocked                |
| [Verified Market Research](https://www.verifiedmarketresearch.com/product/website-builders-market/) (second report)      | —                                             | —       | **$3,395.31M** | 2032    | **7.69%**  | SNIPPET-LEVEL                                     |

**The headline conflict, stated plainly:** for roughly the same year (2025/26),
estimates range from **~$2.2B to ~$5.4B**, and CAGRs range **6.4% to 16.58%**.

Two negative findings worth recording so nobody wastes time on them:

- **Grand View Research has no "website builders" report.** Their site is
  Cloudflare-protected and the Wayback Machine holds no capture of the URL that
  circulates. **Treat as non-existent — do not cite Grand View for this market.**
- **Fortune Business Insights** publishes a
  ["Website Builder Software Market"](https://www.fortunebusinessinsights.com/website-builder-software-market-111528)
  report (updated 2026-07-27, base year 2025) but **withholds the numbers from the
  public page**. Separately, the URL `fortunebusinessinsights.com/website-builders-market-106437`
  that circulates online is **a different market entirely** — ionic exchange
  nuclear waste treatment. Do not let that ID into anything.

Statista and MarketsandMarkets figures were not obtained — **UNVERIFIED**.

## 4.2 Market share — W3Techs, survey data as of 11 August 2026

Fetched from
[w3techs.com/technologies/overview/content_management](https://w3techs.com/technologies/overview/content_management)
on 2026-08-12. Note these are **two different denominators**, and they are
routinely conflated in marketing copy.

| CMS                 | % of **all websites** | % of **CMS market** |
| ------------------- | --------------------- | ------------------- |
| **WordPress**       | **41.1%**             | **59.1%**           |
| Shopify             | 5.3%                  | 7.6%                |
| **Wix**             | **4.3%**              | **6.1%**            |
| **Squarespace**     | **2.5%**              | **3.5%**            |
| Joomla              | 1.2%                  | 1.7%                |
| Tilda               | —                     | 1.2%                |
| **Webflow**         | **0.8%**              | **1.2%**            |
| Duda                | 0.7%                  | 1.1%                |
| Drupal              | 0.7%                  | 1.0%                |
| _(no CMS detected)_ | **30.4%**             | —                   |

**BuiltWith: UNVERIFIED.** `trends.builtwith.com/cms` is JS-rendered and returned
no data to any method. A secondhand claim seen but **not** verified against
BuiltWith: "approximately 822,550 websites currently use [Webflow]… grown from
around 544,000 just two years ago." Do not cite without confirming.

**Company-reported numbers:**

- **Wix**, from [its own press room, Q4/FY2025 results](https://www.wix.com/press-room/home/post/wix-reports-fourth-quarter-and-full-year-2025-results):
  Q4 2025 bookings **$535 million** (+15% year on year); Q4 2025 revenue **$524
  million** (+14%); **Base44**, its AI app builder, reached **$100 million ARR**;
  guidance of "healthy mid-teens top-line growth" for 2026. Registered-user count
  is not on that page — **UNVERIFIED**.
- **Squarespace**: taken private by Permira at **$7.2 billion / $46.50 per share**,
  closing 17 October 2024
  ([PetaPixel](https://petapixel.com/2024/10/18/private-equity-firm-permira-acquires-squarespace-for-7-2-billion/)).
  Subscriber count and revenue run-rate — **UNVERIFIED**.
- Webflow and Shopify customer counts — not obtained, **UNVERIFIED**.

## 4.3 How many freelancers there are

### United States

**Upwork, "Freelance Forward: 2023"** (10th annual), press release 12 Dec 2023,
[investors.upwork.com](https://investors.upwork.com/news-releases/news-release-details/upwork-study-finds-64-million-americans-freelanced-2023-adding):

- **64 million Americans** performed freelance work in the past year — an all-time
  high, **38% of the entire US workforce**, up 4 million from 2022.
- **$1.27 trillion** in annual earnings contributed to the US economy — a **78%
  increase** on an estimated $715 billion in 2014, the study's first year.
- Method: a representative survey of 3,000 professionals.
- 47% of freelancers (**≈30 million**) provided knowledge services; **52% of Gen
  Z** and **44% of Millennial** professionals freelanced; 8.3 million were 59+;
  **over 85%** said "the best days are ahead for freelancing."

**Upwork Research Institute, inaugural Future Workforce Index**, 23 Apr 2025,
[investors.upwork.com](https://investors.upwork.com/news-releases/news-release-details/upwork-study-finds-1-4-us-skilled-knowledge-workers-now-work):

- **More than 1 in 4 (28%) US knowledge workers** now freelance — "more than 20
  million individuals" — generating **$1.5 trillion in earnings in 2024**.
- Exclusively-freelance workers report **median income $85,000** against **$80,000**
  for full-time employees.
- **This is a different metric from the 64M figure** (knowledge workers only). Do
  not present the two as a time series.

**MBO Partners, 2025 State of Independence in America** (15th edition),
[mbopartners.com](https://www.mbopartners.com/state-of-independence/):

- **72.9 million total independents in the United States in 2025.**
- **5.6 million earn over $100K annually** — up 19% from 4.7 million in 2024, and
  nearly double the 3 million in 2020.
- Gen Z is **28%** of the independent workforce; **42%** rely on digital platforms
  to find work; **32%** serve global clients.
- MBO's 72.9M and Upwork's 64M measure different populations. Both are defensible.
  Present both; do not reconcile them.

### Global — a provenance warning on the number everyone cites

The widely circulated **"1.57 billion freelancers worldwide"** figure traces back
to **ILO self-employment data** (roughly 46.6% of an estimated 3.38 billion global
workers) — a category that **includes subsistence farmers, informal traders and
micro-entrepreneurs**, not digital freelancers. The **World Bank's narrower
estimate for online gig-platform workers specifically is 154 to 435 million.**
This framing comes from a secondary statistics roundup; the ILO and World Bank
primaries were not fetched. **Do not use "1.57 billion freelancers" without this
caveat. It is materially misleading.**

Also seen: "86.5 million US freelancers by 2027, ~50.9% of the workforce,"
attributed by [Upwork's own resources page](https://www.upwork.com/resources/freelancing-stats)
to Statista (28 Nov 2025). **This is a projection, not a measurement.**

## 4.4 How many designers, photographers and writers there are — US BLS

All figures from the Occupational Outlook Handbook. Employment is **2024**;
projections are **2024–34**; median pay is **May 2024**. Retrieved 2026-08-12 via
Internet Archive snapshots, because `bls.gov` actively blocks automated retrieval
("Access Denied… bot activity that doesn't conform to BLS usage policy is
prohibited"). Snapshot IDs are given so this is reproducible.

| Occupation                             | Jobs 2024   | Proj. 2034 | Growth           | Openings/yr | Median pay  | **% self-employed** |
| -------------------------------------- | ----------- | ---------- | ---------------- | ----------- | ----------- | ------------------- |
| **Graphic designers**                  | **265,900** | 271,500    | **+2%**, +5,700  | ~**20,000** | **$61,300** | **18%**             |
| **Web developers & digital designers** | **214,900** | 230,400    | **+7%**, +15,500 | ~**14,500** | —           | —                   |
| — web developers                       | 86,000      | 92,500     | +8%, +6,500      | —           | $90,930     | 5%                  |
| — web & digital interface designers    | 128,900     | 137,900    | +7%, +9,000      | —           | $98,090     | 10%                 |
| **Photographers**                      | **151,200** | 154,000    | **+2%**, +2,800  | ~**12,700** | **$42,520** | **66%**             |
| **Writers and authors**                | **135,400** | 140,300    | **+4%**, +4,900  | ~**13,400** | **$72,270** | **63%**             |

Live URLs and snapshots:
[Graphic Designers](https://www.bls.gov/ooh/arts-and-design/graphic-designers.htm)
(`20260718111948`);
[Web Developers and Digital Designers](https://www.bls.gov/ooh/computer-and-information-technology/web-developers.htm)
(`20260802222742`);
[Photographers](https://www.bls.gov/ooh/media-and-communication/photographers.htm)
(`20260521180921`);
[Writers and Authors](https://www.bls.gov/ooh/media-and-communication/writers-and-authors.htm)
(`20260718111948`).

**Two things to pull out:**

1. **Combined US employment across these four occupations is 767,400 (2024)**, with
   roughly **60,600 openings per year** on average over the decade.
2. **Self-employment is highest exactly where a portfolio _is_ the sales channel.**
   Photographers **66%**, writers **63%**. For both occupations, "self-employed
   workers" is the single largest employer category in BLS's own table, ahead of
   every actual industry.

A caveat for anyone cross-checking: OES/OEWS headcounts run below OOH headcounts
for photographers and writers because **OES excludes the self-employed entirely** —
the OOH's own wage-table footnote says the data "does not include pay for
self-employed workers."

**Global designer count: UNVERIFIED.** The best available was a secondhand claim
of "over 4 million Figma users worldwide in 2022, and over 10 million in 2025"
with no primary source. Behance and Dribbble registered-user counts were not
obtained. Either source these properly or drop the "global designers" line.

## 4.5 Does a portfolio actually matter for getting hired?

### The strongest citation is the US government's own

From the BLS Graphic Designers page, "How to Become One," verbatim:

> "**Graphic designers should demonstrate their creativity and originality through
> a professional portfolio.**"
> "Graphic designers usually need a bachelor's degree in graphic design or a
> related field. **Candidates for graphic design positions should have a portfolio
> that demonstrates their creativity and originality.**"

A federal labour-market authority stating that the portfolio is an expected hiring
artefact for the largest US design occupation (265,900 jobs). It is the cleanest
citation available.

### Employers do look you up — CareerBuilder / Harris Poll, 2017

From [PRNewswire, 15 Jun 2017](https://www.prnewswire.com/news-releases/number-of-employers-using-social-media-to-screen-candidates-at-all-time-high-finds-latest-careerbuilder-study-300474228.html).
Method, verbatim: "The national survey was conducted online on behalf of
CareerBuilder by Harris Poll between February 16 and March 9, 2017. It included a
representative sample of more than 2,300 hiring managers and human resource
professionals across industries and company sizes in the private sector."

- **70% of employers use social media to screen candidates before hiring** — up
  from 60% the prior year and **11% in 2006**.
- **57% are less likely to interview a candidate they can't find online.** This is
  the closest thing that exists to a "you need a personal website" statistic.
- **69% use search engines to research candidates**, up from 59%.
- 54% have found content that caused them **not** to hire.
- What they look for: information supporting qualifications (61%), whether the
  candidate has a **professional online persona (50%)**, what others post about
  them (37%), a reason not to hire (24%).

The [2018 follow-up](https://www.prnewswire.com/news-releases/more-than-half-of-employers-have-found-content-on-social-media-that-caused-them-not-to-hire-a-candidate-according-to-recent-careerbuilder-survey-300694437.html)
held at 70%. **Flag the age.** This is 2017/2018 data and no more recent
equivalent with comparable methodology was found. Always cite it with the year
attached.

### Two things that do NOT exist, and should not be invented

- **NACE has no portfolio statistic.** Its Job Outlook résumé research is about
  _skills_, not portfolios. The usable NACE figures are: Job Outlook 2024 — "nearly
  90% [of employers] indicated they are seeking evidence of a student's ability to
  solve problems and nearly 80% are seeking candidates who have strong teamwork
  skills"
  ([naceweb.org](https://www.naceweb.org/about-us/press/the-key-attributes-employers-are-looking-for-on-graduates-resumes));
  Job Outlook 2023 — "More than six in 10 of employers… are seeking evidence of a
  candidate's abilities to solve problems and to work in a team"; Job Outlook 2020
  — "Ninety-one percent of employer respondents." **There is no "% of hiring
  managers who look at a portfolio" figure in NACE.**
- **"How long recruiters spend looking at a portfolio" has no credible study.**
  Everything retrieved was practitioner opinion. **The frequently-cited "recruiters
  spend 6 seconds" figure is from TheLadders' eye-tracking study of _résumés_, not
  portfolios.** Do not repurpose it. **Make no numeric claim here.**

What can be offered instead, both explicitly labelled:

- From a hiring manager on r/UXDesign, and therefore anecdote rather than data —
  "**Most design managers spent 1-3 mins looking at your work. Optimize for
  that.**" (u/MK-XXIIV, who describes having "hired dozens of $100k/year+
  designers"; see section 3, theme 6).
- Quantified but with unstated methodology, so treat as anecdote: "About 8% of
  applications got 80% of approval (meaning that most of the hiring managers would
  have invited these candidates for an interview). More than 60% of applications
  were considered irrelevant"
  ([presentum.io](https://presentum.io/design/hiring-explained/evaluating-portfolio-and-resume)).
- Opinion, not data, but strategically interesting — a recruiting newsletter
  arguing against hosted platforms: "if your link says Behance or Dribbble, and
  you're applying for a UX or product design role, it probably won't be clicked.
  Recruiters and hiring managers have seen enough of those to know what they'll
  find — static visuals, no story, no context… **Behance signals that you're not
  serious about presentation. It's not a portfolio, it's an archive.**"
  ([Open Doors Careers](https://blog.opendoorscareers.com/p/how-recruiters-and-hiring-managers-actually-look-at-your-portfolio)).

## 4.6 Survey data on what website owners want — NOT OBTAINED

**UNVERIFIED.** The search budget was exhausted before any of this could be
verified. Notes for a follow-up pass:

- **Webflow's "State of the Website"** reports exist but `webflow.com/state-of-the-website`
  404s and the live URL was not located. A secondary description claims "the 2025
  and 2026 State of the Website surveys, each based on 1,000 respondents across the
  US, UK, and Canada." This is the most on-point available source for "what website
  owners want" and is worth chasing.
- Stack Overflow Developer Survey and State of JS: not researched.
- Small-business website spend: not obtained.

## 4.7 The self-hosting movement is large and growing fast

### r/selfhosted

**Approximately 817,000 members** as of 2026-08-12, per
[The Hive Index](https://thehiveindex.com/communities/r-selfhosted/) and
[GummySearch](https://gummysearch.com/r/selfhosted/), which both report "817K
members." Hive Index also reports **+244K members in the past year**, **+42.5%
growth per year**, established 2014, ranked 3rd in its self-hosting list and 2nd
largest in its DevOps topic.

Members added per year, per the same source (the page labels the series ambiguously
between "new" and "cumulative"; read here as new members per year): 2015: 4K ·
2016: 9K · 2017: 9K · 2018: 15K · 2019: 26K · 2020: 41K · 2021: 51K · 2023: 151K ·
2024: 139K · 2025: 218K.

Two caveats. **The 817K figure is third-party, not from Reddit's API** — Reddit
blocks this environment entirely and `reddit.com/r/selfhosted/about.json` could not
be fetched. And **do not use frontpagemetrics.com**, which reports 117,360
subscribers and is clearly stale (its milestone list stops at "100K — Nov 24,
2020").

### GitHub stars, all retrieved via the GitHub API on 2026-08-12

| Repo                                      | Stars       | Forks  | Created    | Last push  |
| ----------------------------------------- | ----------- | ------ | ---------- | ---------- |
| **awesome-selfhosted/awesome-selfhosted** | **312,028** | 14,633 | 2015-06-01 | 2026-08-10 |
| n8n-io/n8n                                | 200,250     | 60,081 | 2019-06-22 | 2026-08-11 |
| immich-app/immich                         | 110,218     | 6,490  | 2022-02-03 | 2026-08-11 |
| gohugoio/hugo                             | 89,405      | 8,342  | 2013-07-04 | 2026-08-11 |
| nocodb/nocodb                             | 64,498      | —      | —          | 2026-08-11 |
| withastro/astro                           | 61,690      | 3,705  | 2021-03-15 | 2026-08-11 |
| **coollabsio/coolify**                    | **60,390**  | 5,249  | 2021-01-25 | 2026-08-11 |
| **TryGhost/Ghost**                        | **54,741**  | 11,880 | 2013-05-04 | 2026-08-11 |
| jekyll/jekyll                             | 51,633      | 10,305 | 2008-10-20 | 2026-08-03 |
| payloadcms/payload                        | 44,098      | —      | 2021-01-05 | 2026-08-11 |
| **AmruthPillai/Reactive-Resume**          | **40,297**  | 4,585  | 2020-03-25 | 2026-08-11 |
| halo-dev/halo                             | 39,482      | —      | —          | 2026-08-08 |
| **umami-software/umami**                  | **38,160**  | 7,742  | 2020-07-17 | 2026-08-11 |
| directus/directus                         | 37,299      | —      | 2012-12-12 | 2026-08-11 |
| nextcloud/server                          | 36,390      | 5,094  | 2016-06-02 | 2026-08-11 |
| strapi/strapi                             | 72,843      | —      | 2015-09-30 | 2026-08-11 |

At **312,028 stars**, `awesome-selfhosted` is among the most-starred repositories
on GitHub — the strongest single proxy for self-hosting interest — and it was
still being updated two days before verification.

Coolify, Umami and Ghost adoption beyond stars (installs, customers, ARR):
**UNVERIFIED**.

**The demand signal and the supply signal connect directly.** The "what should I do
instead" reply on the Read.cv shutdown thread pointed at self-hosting
Reactive-Resume — which now carries **40,297 stars**.

## 4.8 Free-tier infrastructure: what "deploys free" actually means in 2026

This is the supply-side precondition for the whole product thesis, so the limits
matter and one of them is a genuine trap.

### Vercel Hobby

From [Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines),
last updated 2026-07-29. Typical monthly guidelines for Hobby: **100 GB** Fast
Data Transfer, 10 GB Fast Origin Transfer, **4 CPU-hours** Active CPU, 360 GB-hrs
provisioned memory, **1M function invocations**, **5,000 image transformations**,
300K image cache reads, 100K image cache writes.

**The trap, verbatim:**

> "**Hobby teams** are restricted to non-commercial personal use only. All
> commercial usage of the platform requires either a Pro or Enterprise plan."
> "Commercial usage is defined as any Deployment that is used for the purpose of
> financial gain of **anyone** involved in **any part of the production** of the
> project, including a paid employee or consultant writing the code. Examples of
> this include, but are not limited to, the following: Any method of requesting or
> processing payment from visitors of the site; **Advertising the sale of a product
> or service**; Receiving payment to create, update, or host the site; Affiliate
> linking is the primary purpose of the site; The inclusion of advertisements…"
> "Asking for Donations fall under commercial usage."

**This needs a decision, not a footnote.** A freelance designer's portfolio that
advertises services, or a photographer's site that takes bookings, plausibly falls
inside Vercel's definition of commercial use. A student's or a hobbyist's does
not. Any "deploy free to Vercel" messaging should be honest about which side of
that line the reader is on, and should name at least one alternative that has no
such restriction.

### Netlify

[netlify.com/pricing](https://www.netlify.com/pricing/) now runs a **credit**
model: the Free plan includes a **300 credit limit** with custom domains and SSL,
unlimited deploy previews, functions, a global CDN, Netlify Database and Blob
storage; the next tier, Personal, is **$9/month for 1,000 credits**. **What one
credit buys is not stated on the pricing page and the credits documentation URL
404s — UNVERIFIED.** The page carries no commercial-use restriction.

### Neon Postgres, free plan

From [Neon's FAQ](https://neon.com/faqs/free-plan-limits-and-quotas): **0.5 GB
storage per project**; **100 CU-hours of compute per project per month** ("enough
to run a 0.25 CU compute for roughly 400 hours"); **100 projects**; **10 branches
per project**; **5 GB public network transfer per project per month**; and
scale-to-zero "After 5 min inactivity, cannot be disabled."

On exceeding them: compute or transfer exhaustion suspends the project's compute
and drops connections; a storage overage suspends the project with data intact;
suspension lifts at the next monthly billing period or on upgrade.

### Supabase, free plan

From [Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing):
"Supabase pauses Free Plan projects that show low activity over a **7-day
period**." Avoiding it needs "a few user requests to the database each day over
the previous week." On restore, "The project will return to its previous state,
including data and configurations." There is a **one-year window** to restore a
paused project from Studio.

**For a portfolio this is a real risk, not a theoretical one.** A personal site
that gets no traffic for a week is exactly the profile Supabase pauses. Any
Supabase-backed deployment path needs either a keep-alive or an honest warning.

---

# 5. Feature comparison matrix

**How to read this.** Cells are only filled where the claim is backed by a source
cited in sections 1 or 2. **`?` means not verified** — it does not mean "no." The
`?` density is highest in the columns that vendors document worst: mobile editing,
image optimisation, and password protection on the smaller platforms. Do not
convert a `?` into a claim without checking it.

Legend: **Y** = yes, included at the tier named · **N** = no · **$N** = only on a
paid tier, with the cheapest qualifying tier named where known · **?** = not
verified.

## 5.1 The four columns that matter most, and are best verified

| Platform                       | Custom domain on free tier                              | Export your data                                                                                     | Self-host                                  | Open source                     |
| ------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------- |
| Squarespace                    | **N** — no free tier exists                             | Partial XML; **excludes portfolio pages, galleries, Custom CSS, styling**                            | N                                          | N                               |
| Wix                            | **N** — free tier exists, no custom domain              | **N** — "your site must run on Wix's servers"                                                        | N                                          | N                               |
| Webflow                        | **N** — Starter is free, 2 pages, no domain             | Static HTML/CSS/JS, **requires a paid Workspace on top of a site plan**; loses CMS, forms, ecommerce | Exported static only                       | N                               |
| Framer                         | **N**                                                   | **N** — no native export                                                                             | N                                          | N                               |
| Carrd                          | **N** — free tier, 3 sites, no domain                   | **Y** — "unminified HTML, CSS, JS, and images"                                                       | Y, from export                             | N                               |
| Cargo                          | **N** — free tier cannot publish at all                 | **?** — none documented anywhere reachable                                                           | N                                          | N                               |
| Format                         | **N** — no free tier                                    | **?** — none documented                                                                              | N                                          | N                               |
| Pixpa                          | **N** — no free tier                                    | **N** — "They cannot be downloaded or hosted elsewhere"                                              | N                                          | N                               |
| Adobe Portfolio                | **N** — requires a paid CC or Behance Pro plan          | **N** — and the site goes offline 14 days after cancellation                                         | N                                          | N                               |
| Dunked                         | **N** — no free tier                                    | **?** — help centre has no export topic                                                              | N                                          | N                               |
| Semplice                       | n/a — a WordPress product                               | **Y** — your own WordPress DB, WXR/SQL                                                               | **Y**                                      | N (proprietary licence)         |
| Super.so                       | **N** — free tier, super.site subdomain only            | Content lives in Notion and exports from there                                                       | N                                          | N                               |
| Notion                         | **N** — paid plan **plus** an $8–10/mo add-on           | **Y** — PDF, HTML, Markdown, CSV                                                                     | N                                          | N                               |
| Contra                         | **N** — Pro only, $199/yr                               | **?** — no export topic in help centre                                                               | N                                          | N                               |
| Journo Portfolio               | **N** — Pro, $8/mo annual                               | Partial — **PDF only**                                                                               | N                                          | N                               |
| Authory                        | **N** — Standard, $15/mo annual                         | "Full backups" on all plans; **extraction path undocumented**                                        | N                                          | N                               |
| Copyfolio                      | **N** — no free tier at all any more                    | **?** — none documented                                                                              | N                                          | N                               |
| UXfolio                        | **N** — free tier cannot publish                        | **N** — "You can't export your portfolio from UXfolio"                                               | N                                          | N                               |
| Behance                        | **N** — never; requires Adobe Portfolio                 | **N**                                                                                                | N                                          | N                               |
| Dribbble                       | **?** — no site at all on free; Playbook from $48/yr    | **N**                                                                                                | N                                          | N                               |
| Ghost (self-hosted)            | **Y** — you own the domain                              | **Y** — JSON content export                                                                          | **Y**                                      | **Y**, MIT                      |
| WordPress (self-hosted)        | **Y**                                                   | **Y** — WXR/XML plus DB                                                                              | **Y**                                      | **Y**, GPL                      |
| wordpress.com free             | **N**                                                   | **Y** — WXR/XML                                                                                      | N                                          | platform is GPL, hosting is not |
| Astro / Hugo / Jekyll starters | **Y**                                                   | **Y** — the files are yours                                                                          | **Y**                                      | **Y**                           |
| Publii                         | **Y**                                                   | **Y** — static output                                                                                | **Y**                                      | **Y**, GPL-3.0                  |
| Grav                           | **Y**                                                   | **Y** — flat files                                                                                   | **Y**                                      | **Y**, MIT                      |
| Statamic                       | **Y**                                                   | **Y** — flat files                                                                                   | **Y**                                      | **N** — proprietary             |
| Webstudio                      | **Y** on the hosted Pro tier ($15/mo); Hobby is wstd.io | **Y** — CLI or download                                                                              | Builder self-hosting **"not recommended"** | **Y**, AGPL-3.0                 |
| CloudCannon                    | **N** — no free tier, $55/mo                            | **Y** — content is in your Git repo                                                                  | **N**                                      | **N**                           |

## 5.2 The full matrix

| Platform                           | Custom domain free                     | Blog                             | SEO controls                                    | Contact form                            | Analytics                 | Export                | Self-host             | Open source | No-code editor                           | Mobile editing                  | Image optimisation          | Password pages                                     | Multi-language                                 |
| ---------------------------------- | -------------------------------------- | -------------------------------- | ----------------------------------------------- | --------------------------------------- | ------------------------- | --------------------- | --------------------- | ----------- | ---------------------------------------- | ------------------------------- | --------------------------- | -------------------------------------------------- | ---------------------------------------------- |
| Squarespace                        | N                                      | Y                                | Y                                               | Y                                       | Y built-in                | Partial               | N                     | N           | Y                                        | ? app exists                    | Y auto                      | **Y all plans**, one shared password, 4-hr session | **N** — Weglot, paid third party               |
| Wix                                | N                                      | Y                                | $ paid (no advanced SEO on free)                | Y                                       | $ paid (none on free)     | **N**                 | N                     | N           | Y                                        | ? app exists                    | Y                           | ?                                                  | $ Wix Multilingual app, plan **?**             |
| Webflow                            | N                                      | Y via CMS ($25/mo Premium)       | Y                                               | Y, 50 lifetime submissions on Starter   | $ Analyze from $9/mo      | $ Workspace $16–19/mo | export only           | N           | Y                                        | ?                               | Y                           | ?                                                  | **$ Localize $9–29/mo per site**               |
| Framer                             | N                                      | Y via CMS                        | Y                                               | Y                                       | ?                         | **N**                 | N                     | N           | Y                                        | ?                               | Y                           | ?                                                  | **$ $20 per locale**, up to 20                 |
| Carrd                              | N                                      | **N** — one-page sites only      | Basic                                           | $ Pro Standard $19/yr                   | $ Pro Standard            | **Y**                 | Y                     | N           | Y                                        | ?                               | ?                           | ?                                                  | N                                              |
| Cargo                              | N (cannot publish free)                | ?                                | ?                                               | ?                                       | ?                         | ?                     | N                     | N           | Y                                        | ?                               | ?                           | ?                                                  | ?                                              |
| Format                             | N                                      | Y                                | Y                                               | Y                                       | ?                         | ?                     | N                     | N           | Y                                        | ?                               | Y                           | **Y** — client galleries                           | ?                                              |
| Pixpa                              | N                                      | Y                                | Y                                               | Y                                       | Y                         | **N**                 | N                     | N           | Y                                        | ?                               | Y                           | **Y** — gallery links                              | ?                                              |
| Adobe Portfolio                    | N                                      | **N** native; syncs with Behance | Basic                                           | Y                                       | ?                         | **N**                 | N                     | N           | Y                                        | ?                               | Y                           | ?                                                  | ?                                              |
| Dunked                             | N                                      | ?                                | **Y** "Advanced SEO with AI", all plans         | ?                                       | GA4 supported             | ?                     | N                     | N           | Y                                        | ?                               | ?                           | **Y** all plans                                    | ?                                              |
| Semplice                           | n/a                                    | **Y** WordPress                  | Y                                               | Y                                       | Y                         | **Y**                 | **Y**                 | N           | Y                                        | ?                               | ?                           | Y via WordPress                                    | Y via WordPress plugins                        |
| Super.so                           | N                                      | via Notion                       | $ Personal $16                                  | via Notion                              | **$ $10–400/mo add-on**   | via Notion            | N                     | N           | Y                                        | Y via Notion apps               | ?                           | **$ Personal $16/mo**                              | **$ Pro $28/mo**                               |
| Notion                             | **N** — $8–10/mo add-on on a paid plan | Y                                | Limited; **"up to four weeks to be indexed"**   | $ custom forms paid                     | $ GA on paid              | **Y**                 | N                     | N           | Y                                        | **Y** — first-class mobile apps | ? (5 MB upload cap on free) | ?                                                  | N                                              |
| Contra                             | N                                      | ?                                | ?                                               | Y inquiries                             | $ Pro                     | ?                     | N                     | N           | Y                                        | ?                               | ?                           | ?                                                  | ?                                              |
| Journo Portfolio                   | N                                      | Y                                | Y                                               | Y                                       | Y                         | PDF only              | N                     | N           | Y                                        | ?                               | ?                           | **$ Pro $8/mo**                                    | **$ Pro — 3 languages; Unlimited — unlimited** |
| Authory                            | N                                      | Y                                | **N on free — indexing blocked**                | ?                                       | **$ Professional $24/mo** | Backups, format ?     | N                     | N           | Y                                        | ?                               | ?                           | **$ paid**                                         | ?                                              |
| Copyfolio                          | N                                      | **$ Premium**                    | **$ Premium** — detailed SEO settings           | Y                                       | Y "site insights"         | ?                     | N                     | N           | Y                                        | ?                               | ?                           | ?                                                  | ?                                              |
| UXfolio                            | N (cannot publish free)                | N                                | ?                                               | ?                                       | **$ GA4 paid**            | **N**                 | N                     | N           | Y                                        | ?                               | Y device mockups            | **$ paid**                                         | ?                                              |
| Behance                            | N                                      | N                                | Platform-controlled                             | Y                                       | $ Pro                     | **N**                 | N                     | N           | Y                                        | Y app                           | Y                           | **$ Pro**                                          | ?                                              |
| Dribbble                           | ?                                      | N                                | Platform-controlled; **ranking is purchasable** | Y leads                                 | **$ Standard $96/yr**     | **N**                 | N                     | N           | Y                                        | Y app                           | Y                           | ?                                                  | ?                                              |
| Ghost self-hosted                  | **Y**                                  | **Y**                            | **Y**                                           | **N** native                            | Y built-in                | **Y**                 | **Y**                 | **Y** MIT   | Content **Y**, design **N** (Handlebars) | ?                               | Y                           | Y private site                                     | **N** native                                   |
| WordPress self-hosted              | **Y**                                  | **Y**                            | Y via plugin                                    | Y via plugin                            | Y via plugin              | **Y**                 | **Y**                 | **Y**       | **Only with a $49–89/yr page builder**   | ?                               | Y                           | Y via plugin                                       | Y via plugin                                   |
| wordpress.com free                 | N                                      | Y                                | Limited                                         | Y                                       | 7-day stats only          | **Y**                 | N                     | —           | Y                                        | Y app                           | Y                           | ?                                                  | ?                                              |
| Astro/Hugo/Jekyll                  | **Y**                                  | **Y**                            | **Y**                                           | via third party                         | via third party           | **Y**                 | **Y**                 | **Y**       | **N — no admin UI at all**               | **N**                           | Y                           | via host                                           | Y                                              |
| Decap / Tina / Sveltia / Keystatic | **Y**                                  | **Y**                            | via theme                                       | via theme                               | via theme                 | **Y**                 | **Y**                 | **Y**       | **N — hand-written YAML/TS schema**      | ?                               | via theme                   | via host                                           | Y (Sveltia: first-class i18n)                  |
| Publii                             | **Y**                                  | **Y**                            | **Y**                                           | via third party                         | via third party           | **Y**                 | **Y**                 | **Y** GPL-3 | **Y** — desktop only                     | **N** — one computer            | Y                           | Y                                                  | ?                                              |
| Grav                               | **Y**                                  | **Y**                            | Y                                               | Y plugin                                | Y plugin                  | **Y**                 | **Y**                 | **Y** MIT   | **Y** — Admin Next                       | ?                               | Y                           | Y plugin                                           | Y                                              |
| Statamic                           | **Y**                                  | **Y**                            | Y                                               | **Y** — one form free, unlimited on Pro | Y                         | **Y**                 | **Y**                 | **N**       | **Y** — excellent control panel          | ?                               | Y                           | Y                                                  | **$ Pro $349** multi-site                      |
| Webstudio                          | $15/mo                                 | Y via CMS                        | Y                                               | Y                                       | ?                         | **Y**                 | **"not recommended"** | **Y** AGPL  | Webflow-grade, assumes CSS fluency       | ?                               | Y                           | ?                                                  | ?                                              |
| CloudCannon                        | N                                      | Y                                | via theme                                       | via theme                               | via theme                 | **Y**                 | **N**                 | **N**       | **Y** — the only fully no-code Git CMS   | ?                               | ?                           | ?                                                  | ?                                              |

## 5.3 What the matrix actually shows

Four readings that survive the `?` density:

1. **Custom domain on a free tier is essentially non-existent in the commercial
   set.** Twenty commercial platforms, zero that give a custom domain for free.
   The cheapest is Carrd at $19/yr, which cannot build a multi-page portfolio;
   the cheapest that can is Pixpa at $36/yr promo (~$48 standard). The _only_
   rows with a free custom domain are the self-hosted ones, where the domain is
   yours because the hosting is yours.
2. **"Open source" and "no-code editor" almost never co-occur.** The rows with
   both are Grav, Publii and Webstudio. Grav requires a PHP 8.3.11+ webroot;
   Publii is desktop-only and single-computer; Webstudio tells you not to
   self-host the builder. **That is the entire competitive field for this
   product.**
3. **Multi-language is a paid add-on almost everywhere, and it is priced
   punitively** — Framer $20 per locale, Webflow $9–29/mo per site, Squarespace
   not at all without Weglot. Journo Portfolio, at $8/mo for three languages, is
   the outlier.
4. **Mobile editing is the least-documented column in this entire dossier.** Only
   Notion and the social platforms clearly do it well, and they are the rows with
   the least design control. Nobody has verified that you can meaningfully edit a
   _designed_ portfolio from a phone. If that is true it is an open gap; it needs
   verifying before it becomes a claim.

---

# 6. Everything that could not be verified

Consolidated so that whoever writes from this dossier can see the whole risk
surface in one place. Nothing in this list should appear as a claim without a
fresh check.

## 6.1 Claims in the original brief that did NOT survive verification

Three premises the research was asked to confirm turned out to be false or
unsupported. **Do not assert any of them.**

| Premise                    | What is actually true                                                                                                                                                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Coroflot shut down"       | **It did not.** coroflot.com returned HTTP 200 on 2026-08-12 with live job listings and a competition running to 28 Sep 2026. What happened is quieter: the portfolio section was pulled from Core77's navigation in Dec 2024, and a Basic/Pro paywall on project count appeared in Mar 2026 |
| "Dunked is dead"           | **It is not.** Live, selling, working signup, claims 100,000+ users. Its last _public_ product update was 31 Mar 2025 — stale, not dead                                                                                                                                                      |
| "Format ownership changes" | **No evidence of any ownership change was found**                                                                                                                                                                                                                                            |

A fourth premise, "Cargo Collective v1→v2/v3 migrations breaking sites," is
**plausible but not independently verified** — three incompatible generations
with three doc sites and a "Moving from Cargo 2 to 3" article demonstrably exist,
but the only vivid description of migration pain comes from a vendor selling
migration services, and no official end-of-life date for Cargo 1 or Cargo 2 could
be found.

**The replacement case study is better than any of them.** Behance ProSite →
Adobe Portfolio (2016) has a verbatim shutdown notice, a dated deadline, and
contemporaneous user reactions describing the exact re-upload cost — "30+ projects
and 100s of images. Ugh."

## 6.2 Data that is genuinely unobtainable from this environment

| Source                                 | Status                                                                                                                                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trustpilot, G2, Capterra**           | HTTP 403 to every method including a real browser. **No star ratings, review counts or review quotes from these three sites exist anywhere in this dossier.** Needs a residential-IP fetch or a paid API |
| **X / Twitter**                        | Not fetchable. No quotes                                                                                                                                                                                 |
| **bls.gov**                            | Actively blocks bots. All BLS figures came via Internet Archive snapshots, with snapshot IDs recorded                                                                                                    |
| **adobe.com pricing and legal pages**  | Timeout or 403. All Adobe Creative Cloud prices are third-party                                                                                                                                          |
| **reddit.com JSON/API**                | Blocked. Reddit quotes were recovered through an authenticated browser session and an RSS endpoint; RSS-sourced quotes have no upvote counts                                                             |
| **trends.builtwith.com**               | JS-only, no data returned                                                                                                                                                                                |
| **grandviewresearch.com**              | Cloudflare-protected; no Wayback capture; the report may not exist                                                                                                                                       |
| **web.archive.org via the fetch tool** | Blocked to the fetcher; reachable via curl, which is how the Read.cv announcement was recovered                                                                                                          |

## 6.3 Prices and limits flagged UNVERIFIED

**Commercial platforms**

- Framer month-to-month prices — six sources checked, **none** published them; and
  whether the "Scale" $100/mo plan still exists.
- Wix Light/Core/Business/Elite restructure date; Wix .com renewal price (sources
  say $13.35, $14.95 and ~$17).
- Squarespace .com renewal price — the official doc explicitly declines to state
  prices.
- Squarespace, Wix, Webflow and Framer prices generally — from help docs plus two
  or more agreeing dated third parties, not from the live rendered pricing pages.
- Format export capability; Format domain renewal price (`help.format.com` 403s on
  every path).
- Cargo export capability; Cargo free-tier storage, bandwidth and badge; Cargo
  domain year-one-free and renewal price.
- Dunked export capability, currency, and whether development is ongoing.
- Contra export capability and custom domain support for portfolios.
- Authory export formats.
- Journo Portfolio store transaction fees, image and storage limits, and whether a
  badge appears on free sites.
- Copyfolio tier prices beyond Premium, and the date its free plan was withdrawn.
- UXfolio free-plan withdrawal date.
- Adobe: exact 2026 Single App and Lightroom prices; Adobe General Terms of Use
  "Your Content" clause (needed before any ownership claim about Behance);
  Adobe Muse end-of-life date.
- Dribbble: whether Playbook supports a custom domain; the date external profile
  links were removed; whether the job board was shut down or merely renamed;
  reports of layoffs.
- Semplice tier prices beyond the three headline figures.
- Super.so's $12 → $16 increase date.
- Wix registered-user count; Squarespace subscriber count; Webflow and Shopify
  customer counts.

**Open source and self-hosted**

- Elementor Pro tier prices above Essential (client-rendered page).
- Builder.io Pro and Team prices (client-rendered).
- Astro theme counts per category (client-rendered listing).
- Payload Cloud historical pricing — those pages 404.
- Whether Sanity's Content Lake can be self-hosted — high-confidence inference
  only; three architecture doc URLs 404'd.
- Sanity API CDN overage rate — two fetches disagreed ($1/25k vs $1/250k).
- RAM requirements for Directus (partial), Payload, Keystone, Statamic, Grav and
  Webstudio — unpublished. Only Strapi and Directus publish figures.
- KeystoneJS Node.js version — no `engines` field, no prerequisites section.
- Typemill Maker and Business prices; Grav premium add-on prices; Statamic,
  Directus and Strapi enterprise pricing.
- Decap Turbo pricing and launch date.
- Whether DecapBridge's promised open-source self-hosted version shipped.
- TinaCMS self-hosted feature limitations — the limitations page 404s.
- Keystatic's promised community update and refreshed roadmaps — still unpublished
  roughly twelve months after the Aug 2025 commitment.
- Netlify's credit system: what one credit buys, and the Free plan's real
  bandwidth and build-minute equivalents — the credits doc URL 404s.

**Market and research data**

- Statista and MarketsandMarkets website-builder figures.
- Grand View Research website-builder report — appears not to exist.
- Fortune Business Insights numbers — withheld from the public page.
- Global count of designers.
- Behance and Dribbble registered-user counts.
- Website-builder satisfaction, switching and spend surveys — including Webflow's
  "State of the Website," whose landing URL 404s.
- r/selfhosted subscriber count from Reddit's own API; the 817K figure is
  third-party.
- Coolify, Umami and Ghost adoption beyond GitHub stars.
- InVision's own shutdown announcement — secondary sources only.
- Wix Answers sunset; Bandzoogle; Adobe Spark → Adobe Express rebrand.
- The Loop (theloop.com.au) status — DNS resolves, HTTPS does not respond, no
  announcement found.

## 6.4 Two statistics that do not exist and must not be invented

- **"% of hiring managers who look at a portfolio."** It is not in NACE's Job
  Outlook research, which measures _skills_ sought on résumés, and it was not found
  anywhere else.
- **"Seconds a recruiter spends on a portfolio."** No credible study exists. The
  widely repeated six-second figure is from TheLadders' eye-tracking study of
  **résumés**. Do not repurpose it.

The honest substitutes are the BLS's own statement that graphic designers "should
demonstrate their creativity and originality through a professional portfolio,"
CareerBuilder's 2017 finding that **57% of employers are less likely to interview
a candidate they can't find online**, and a hiring manager's unprompted remark
that "most design managers spent 1-3 mins looking at your work" — the last clearly
labelled as anecdote.

## 6.5 Documentation defects worth citing as competitive evidence

These are not complaints from users; they are the incumbents' own docs
contradicting themselves, which is usable material.

- **Decap CMS** still recommends **Netlify Git Gateway** in
  [choosing-a-backend](https://decapcms.org/docs/choosing-a-backend/) with no
  deprecation notice, despite Netlify's "we will no longer fix bugs in the
  functionality of Git Gateway."
- **Grav 2.0's installation page** tells users to verify "at least PHP version
  7.3.6+" while the 2.0 requirements page mandates **PHP 8.3.11+**.
- **Directus docs** pin `directus/directus:12.0.2` in the compose example while
  shipping 12.2.0, and four documented self-hosting URLs 404.
- **Strapi docs** say Node v22/24/26; the npm package declares `>=20.0.0 <=26.x.x`.
- **Payload** stable v3 requires Node `^18.20.2 || >=20.9.0` while `main` (v4
  canary) already requires `>=24.15.0` — an undocumented two-major-version jump is
  queued.
- **Ghost's hosting guide** says Ghost(Pro) starts "From $15/mo" while the pricing
  page shows **$18/mo**.
- **Global Growth Insights'** market report contradicts itself on its own base
  year within a single page.
- **Squarespace's domain renewals article** declines to publish renewal prices at
  all, saying only that "the domain will renew for its listed price."

## 6.6 Highest-value follow-ups, in order

1. **Get the review-site data.** Trustpilot, G2 and Capterra scores for Wix,
   Squarespace, Webflow and Format are the single biggest hole. They are also the
   most quotable third-party numbers available in this category.
2. **Pull fresh Core Web Vitals from HTTP Archive directly** rather than through a
   news write-up, and include the open-source platforms. The current data is a
   news article's summary of November 2025.
3. **Decide the Vercel Hobby commercial-use question.** A freelancer's portfolio
   that advertises services plausibly falls inside Vercel's own definition of
   commercial use. This affects the product's core deployment story and cannot stay
   ambiguous.
4. **Verify mobile editing across the field.** It is the least-documented column in
   the matrix and, if the gap is real, one of the more defensible differentiators.
5. **Find Webflow's "State of the Website" survey.** It is the closest thing to
   primary research on what website owners actually want.
6. **Read Adobe's General Terms "Your Content" clause** before making any claim
   about who owns work posted to Behance.
