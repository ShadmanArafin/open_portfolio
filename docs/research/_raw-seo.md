# SEO & Content Strategy — Raw Research Dossier

**Subject:** launch positioning for a free, open-source (MIT), self-hosted, no-code **portfolio website builder** — deploys free to Vercel/Netlify with a free database, managed entirely from an admin UI by non-technical people.

**This is evidence, not a plan.** Someone else turns it into a strategy. Claims carry source URLs. Numbers that could not be verified are marked **UNVERIFIED**.

**Research date:** 2026-08-12. All SERP observations, autocomplete pulls and GitHub counts are from this date unless stated.

---

## 0. Method and its limits — read this before trusting anything below

**What was used**

| Method                                                                                      | Status                       | Notes                                                                                                                                           |
| ------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Google Autocomplete (`suggestqueries.google.com/complete/search`)                           | ✅ Primary data, pulled live | Real predictions. Google only serves predictions for queries with non-trivial volume, so **suggestion depth is a usable relative-demand proxy** |
| Google/Bing SERP observation via search tool                                                | ✅                           | Top ~8 organic results per query                                                                                                                |
| WebFetch of primary docs (Google Search Central, Next.js, schema.org, web.dev, vendor docs) | ✅                           | Verbatim quotes where it matters                                                                                                                |
| Hacker News Algolia API (`hn.algolia.com/api/v1/search`)                                    | ✅                           | Real point/comment counts                                                                                                                       |
| GitHub REST API + `github.com/topics/*`                                                     | ✅                           | Live repo counts                                                                                                                                |

**What could not be reached — treat as gaps, not absence of evidence**

1. **No verified absolute search volumes.** Ahrefs/Semrush/Ubersuggest/Keyword Planner all require login or JS. **Every monthly-volume figure anywhere in this document is UNVERIFIED.** Autocomplete depth is used as the substitute demand signal and is labelled as such.
2. **Reddit is completely inaccessible** to this toolchain — `reddit.com` is blocked for both the search tool ("domains not accessible to our user agent") and WebFetch, and `reddit.com/search.json` returns non-JSON. **Task E of the original brief (verbatim Reddit pain-point quotes) is therefore UNVERIFIED and outstanding.** It should be done manually — it is high value, see §6.5 for why the autocomplete data says so.
3. **Web-search budget was exhausted mid-session** (200/200 calls). Later sections were built from direct WebFetch of known URLs, so a few "does this page exist" checks returned 404 and are noted inline.
4. **Google "People Also Ask" boxes could not be scraped.** Question-shaped autocomplete is used as the proxy.

---

## 1. KEYWORD LANDSCAPE

### 1.1 The single most important finding

**Autocomplete depth collapses to zero on exactly the phrases the brief proposed.** This is the highest-signal result in the whole keyword section, and it cuts both ways.

Live autocomplete pulls, 2026-08-12 — number of predictions returned:

| Seed phrase                            |                              Predictions returned | Reading                                           |
| -------------------------------------- | ------------------------------------------------: | ------------------------------------------------- |
| `portfolio website builder`            |                                                10 | Real head term                                    |
| `free portfolio website builder`       |                                                10 | Real, commercially contested                      |
| `open source website builder`          |                                                10 | **Real head term**                                |
| `self hosted website builder`          |                                                10 | **Real head term**                                |
| `developer portfolio template`         |                                                10 | Real, template-intent                             |
| `carrd alternative`                    |                                                10 | Real                                              |
| `photography portfolio website free`   |                                                 7 | Real                                              |
| `portfolio website for designers`      |                                                10 | Real                                              |
| `squarespace alternative free`         |                               2 (self + "reddit") | **Very thin**                                     |
| `webflow alternative free`             |                                                 2 | **Very thin**                                     |
| `free portfolio website no code`       | 1 (rewritten to "free no code portfolio website") | **Effectively no volume as phrased**              |
| `read.cv alternative`                  |                                                 2 | **Very thin**                                     |
| `wix alternative open source`          |                                                 2 | **Thin — but it exists at all, which is notable** |
| `open source portfolio builder`        |                                     1 (echo only) | **No measurable volume**                          |
| `linktree alternative open source`     |                                     1 (echo only) | No measurable volume                              |
| `portfolio builder open source github` |                                                 0 | No volume                                         |
| `nextjs portfolio cms`                 |                                                 0 | No volume                                         |
| `wordpress alternative portfolio`      |                                                 0 | No volume                                         |

Raw dumps: Appendix A.

**Interpretation.** "Open source portfolio builder" is a _category description_, not a _query_. Nobody searches it. The demand is split into two populations that use different vocabulary:

- **Non-technical creatives** search `free portfolio website builder`, `portfolio website for <profession>`, `best portfolio site for <profession>`, `<brand> alternative`. They do not use the words "open source" or "self-hosted".
- **Technical/prosumer users** search `open source website builder`, `self hosted website builder`, `portfolio cms open source`. They do not use the word "portfolio builder".

A site that wants both must run two vocabularies. That is a strategy input, not a plan.

### 1.2 Head terms with confirmed autocomplete depth

**Free/portfolio cluster** (`free portfolio website` seed returned 10):
`free portfolio website templates`, `free portfolio website maker`, `free portfolio website hosting`, `free portfolio website builder`, `free portfolio website reddit`, `free portfolio website builder ai`, `free portfolio website for video editor`, `free portfolio website for photographers`
→ Source: live autocomplete, seed `free portfolio website`.

**Builder cluster** (`portfolio website builder`):
`portfolio website builder free`, `… ai`, `… ai free`, `… reddit`, `… wix`, `… for designers`, `… github`, `… for artists`, `… photography`
→ Note **`portfolio website builder github`** is a live Google prediction. That is direct evidence a slice of this audience already expects a GitHub-hosted answer.

**Open-source cluster** (`open source website builder`):
`open source website builder ai`, `… free`, `… drag and drop`, `… github`, `… drag and drop free`, `… reddit`, `… software`, `… linux`, `… download`

**Self-hosted cluster** (`self hosted website builder`):
`self hosted website builder reddit`, `… docker`, `best self hosted website builder`, `self hosted ai website builder`, `free self hosted website builder`, `self hosted static website builder`, `open source self hosted website builder`, **`self hosted no code website builder`**
→ The last one is the closest thing to an exact-match query for this product that exists in Google's prediction set.

### 1.3 Profession modifiers — which are real and which would be thin spam

This is the empirical basis for judging a `portfolio website for <profession>` page family (§3). Autocomplete depth per profession, seed `portfolio website for <X>`:

| Profession    | Predictions | Verdict for a dedicated page                                                                                    |
| ------------- | ----------: | --------------------------------------------------------------------------------------------------------------- |
| students      |          10 | **Strong** — deepest of all; includes `free`, `github`, `examples`, `html and css`, `engineering students`      |
| writers       |           5 | Strong                                                                                                          |
| video editors |           3 | Moderate                                                                                                        |
| photographers |           3 | Moderate (but see `photography portfolio website free` = 7, and `best portfolio site for photographers` exists) |
| architects    |           3 | Moderate                                                                                                        |
| models        |           2 | Weak                                                                                                            |
| illustrators  |    1 (echo) | **Thin — do not build**                                                                                         |
| musicians     |    1 (echo) | **Thin — do not build**                                                                                         |
| teachers      |    1 (echo) | **Thin — do not build**                                                                                         |

Separately, the `portfolio website for` seed (no profession) returns its own top-10, which is the _actual_ demand ranking Google sees:
`web developer`, `graphic designer`, `developer`, `software engineer`, `students`, `video editors`, `free`, `data analyst`, `artists`, `full stack developer`
→ **Five of the top ten are technical roles.** Combined with `developer portfolio template` returning a full 10 predictions (`free`, `github`, `free download`, `html css js`, `wordpress`, `figma`, `react`, `html`), the developer/student segment is measurably the largest single profession cluster — and it is also the segment most likely to accept a self-hosted product.

`best portfolio site for` returns: `artists`, `graphic designers`, `designers`, `photographers`, `video editor`, `writers`, `creatives` — a second, non-technical ranking.

### 1.4 Alternative-seeking terms — the real ones

| Query                          |  Predictions | Notable                                                                                                                                                                                                                                                                                  |
| ------------------------------ | -----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wix alternative`              |           10 | includes `wix alternatives free`, `wix alternatives reddit`, **`wix alternative open source`**, `wix alternatives for portfolio`, `wix alternatives india`                                                                                                                               |
| `carrd alternative`            |           10 | `carrd alternatives free`, `… reddit`, `… for artists`, `… twitter`, `… tumblr`, `… discord`                                                                                                                                                                                             |
| `adobe portfolio alternative`  |            5 | `… free`, `… reddit`, **`adobe portfolio open source alternative`**                                                                                                                                                                                                                      |
| `behance alternative`          |           10 | `… for portfolio`, `… free`, `… reddit`, `… for photography`                                                                                                                                                                                                                             |
| `pixieset alternative`         |           10 | **`pixieset open source alternative`**, **`self hosted pixieset alternative`**, `pixieset alternatives free`, `… reddit`                                                                                                                                                                 |
| `framer alternative`           |           10 | **`framer alternative open source`**, `… free`, `… reddit`, `… cheaper`                                                                                                                                                                                                                  |
| `dribbble alternative`         |            8 | `… reddit`, `… free`, `… 2025`                                                                                                                                                                                                                                                           |
| `squarespace alternative`      |           10 | `… free`, `… reddit`, `… for photographers`, `… for portfolio`, `… cheaper`                                                                                                                                                                                                              |
| `cargo collective alternative` |            1 | Thin                                                                                                                                                                                                                                                                                     |
| `format alternative`           | contaminated | Query collides with "file format" / "alternative format" (accessibility). **Do not target the brand term "Format" — it is unusable.**                                                                                                                                                    |
| `open source alternative to`   |           10 | `claude code`, `microsoft office`, `photoshop`, `obsidian`, `spotify`, `notion`, `adobe acrobat`, `lightroom`, `figma` — **no website-builder brand appears in the top 10**, i.e. the "open source alternative to X" frame is proven as a _format_ but not yet claimed for this category |

**Four brands independently generate an "open source" or "self hosted" prediction:** Wix, Adobe Portfolio, Pixieset, Framer. Those four are the alternative pages with pre-existing, Google-confirmed demand for exactly this product's positioning.

### 1.5 Reddit-seeking intent is unusually high — and it is a ranking signal

`best website builder for portfolio reddit` returns **8** predictions, every one a profession variant:
`best free website builder for portfolio reddit`, `… art portfolio reddit`, `… photography portfolio reddit`, `… ux portfolio reddit`, `… design portfolio reddit`, `… creative portfolio reddit`

And `reddit` appears as a suffix prediction on: `free portfolio website`, `free portfolio website builder`, `best free portfolio website builder`, `portfolio website builder`, `open source website builder`, `self hosted website builder`, `best self hosted website builder`, `squarespace alternatives`, `wix alternatives`, `carrd alternatives`, `adobe portfolio alternative`, `pixieset alternatives`, `framer alternatives`, `dribbble alternatives`, `webflow alternative free`, `squarespace free alternative`, `free website builder for artists`, `portfolio website examples`, `ux portfolio website`, `architecture portfolio website`, `free photography portfolio website`.

That is **21 of the ~45 seeds tested**. Users are explicitly appending "reddit" because they distrust the affiliate listicles that own these SERPs. Two implications, both evidence-backed elsewhere in this document: Reddit threads are competitors _and_ distribution (§6), and off-site community mentions correlate strongly with LLM citation (§4.8).

### 1.6 Intent grouping and winnability for a zero-authority domain

Winnability is judged against the actual SERP occupants documented in §6.

**Transactional / commercial — NOT winnable at launch**
`free portfolio website builder`, `portfolio website builder`, `best free portfolio website builder`, `free website builder for artists`
→ SERP is Canva, Wix, Squarespace, Adobe, Portfoliobox, Crevado (§6.1). These are brand-owned product pages plus a recruitment firm. No new domain enters this.

**Comparison — NOT winnable at launch, high value later**
`squarespace alternatives`, `wix alternatives`, `squarespace vs wix`
→ Owned by Tooltester (~8,500 words, 17 tools, named authors, video, updated 2026-02-26), Website Planet (~3,500 words, named author + editor, affiliate links, updated Jan 2026), Zapier (~3,500 words), TechRadar, EXPERTE. See §6.2.

**Alternative-seeking, qualified by "open source" / "self hosted" — WINNABLE**
`wix alternative open source`, `adobe portfolio open source alternative`, `pixieset open source alternative`, `self hosted pixieset alternative`, `framer alternative open source`, `open source self hosted website builder`, `self hosted no code website builder`
→ Thin autocomplete depth = low volume (UNVERIFIED magnitude) **and** low competition. Each is a live Google prediction, so demand is non-zero. These are the beachhead.

**Informational, technical — WINNABLE**
`open source website builder`, `self hosted website builder`, `portfolio cms open source`, `portfolio website builder github`, `open source website builder drag and drop`
→ The #1 result for `open source website builder` is a Colorlib article **published 2024-02-27, titled "2026", covering WordPress / Joomla / Drupal / SilverStripe / ConcreteCMS / ModX / Grav** — i.e. seven legacy PHP CMSes and zero modern tools (§6.3). This is the most under-served commercially-relevant SERP found in the entire study.

**Informational, creative — PARTIALLY WINNABLE**
`portfolio website for students`, `how to make a portfolio website for free`, `ux portfolio website`, `architecture portfolio website`
→ Mixed SERPs with weaker incumbents. `how to make a portfolio website` autocomplete is entirely platform-qualified (`on canva`, `using html and css`, `on github`, `on framer`, `on figma`, `on squarespace`, `on wix`) — meaning **the winnable version is `how to make a portfolio website with <this product>`**, not the generic head term.

**Brand-substitution, event-driven — WINNABLE but tiny**
`read.cv alternative` (2 predictions). Read.cv was acquired by Perplexity and wound down; data export closed 2025-05-16 ([TechCrunch, 2025-01-17](https://techcrunch.com/2025/01/17/perplexity-acquires-read-cv-a-social-media-platform-for-professionals/)). HN discussion was small — the top "Read.cv is winding down" thread scored **4 points / 2 comments** ([HN 42746728](https://news.ycombinator.com/item?id=42746728)). Someone already shipped "Show HN: A one-click Read.CV alternative" on 2025-08-29 at **1 point** ([HN 45066698](https://news.ycombinator.com/item?id=45066698)). **The read.cv migration wave is over and was never large. Deprioritise.**

---

## 2. THE "ALTERNATIVE TO" PLAY

### 2.1 The strongest documented case: Plausible Analytics

Plausible is the best-documented open-source "alternative to X" growth story available, because they published first-party analytics.

**Traffic outcome** — [seobuddy.com/blog/my-seo-journey-marko-saric](https://seobuddy.com/blog/my-seo-journey-marko-saric/):

- March 2020: **143** monthly visitors from Google
- January 2021: **7,167** monthly visitors from Google
- **10 months**, publishing "approximately once per week"
- Assets built: 32 blog posts (first 2020-04-08), full docs, **15 product pages focused on differentiation**
- MRR over the same window: **$400 → $10,000+**; subscribers **<100 → 2,000+**

**The positioning change itself** — [plausible.io/blog/open-source-saas](https://plausible.io/blog/open-source-saas): in April 2020 they "decided to pick a fight", and the homepage was rewritten from _"Simple analytics for your website"_ to _"Simple and privacy-friendly alternative to Google Analytics"_ ([plausible.io/blog/startup-marketing](https://plausible.io/blog/startup-marketing)).

**Channel mix, first 4 months (April–July 2020)** — first-party, from [plausible.io/blog/startup-marketing](https://plausible.io/blog/startup-marketing):

| Source                                          |    Visits |
| ----------------------------------------------- | --------: |
| Hacker News                                     |    43,600 |
| Twitter                                         |    10,000 |
| Facebook                                        |     6,400 |
| **Google Search**                               | **6,300** |
| Indie Hackers                                   |     4,800 |
| **GitHub**                                      | **2,700** |
| Hacker Newsletter                               |     2,600 |
| LWN.net                                         |     2,600 |
| **Reddit** (r/degoogle, r/opensource, r/webdev) |     2,200 |
| Dev.to                                          |     2,200 |

Google Search was 6th by volume but they note it had the **"longest visit duration" (3+ min)** — highest quality.

**Single events with numbers:**

- "Why you should stop using Google Analytics on your website" hit the top of HN → **25,000+ visitors in one day** ([open-source-saas](https://plausible.io/blog/open-source-saas))
- A July 2020 post on open-source funding → **35,000+ visitors in a single day** (same source)
- A guest post on Opensource.com → **94 new trial signups in one day**, their largest single-day conversion spike ([startup-marketing](https://plausible.io/blog/startup-marketing))
- Dev.to syndication → **12,000+ views** (same source)
- Trial→paid conversion **33.5%**; $415 MRR (2 Apr) → $2,750 MRR / 427 subs (30 Jul) (same source)

**Their keyword research method, stated verbatim:** Google autocomplete, "People also ask", and "Searches related to" ([startup-marketing](https://plausible.io/blog/startup-marketing)). That is the same free method used to build §1 of this dossier.

### 2.2 What an "alternative" page must contain — three teardowns

**Plausible — `/vs-google-analytics`** ([plausible.io/vs-google-analytics](https://plausible.io/vs-google-analytics)), ~1,800–2,000 words:

1. H1 naming both products and the _reason to switch_: "Plausible vs Google Analytics 4 (GA4): What changed and why people are switching"
2. **Comparison table above the fold** — 7 rows (consent, data collection, ad-blocker impact, data modeling, retention, setup, hosting)
3. Social proof immediately after: DHH (37signals), John O'Nolan (Ghost)
4. Side-by-side screenshot
5. Jump-link table of contents
6. Five argued subsections (real vs estimated data, complexity, accuracy, GDPR exposure, business-model misalignment)
7. A hard performance number (script size)
8. **A "What GA4 does better" concession section** — names attribution modelling, enterprise SQL access, ad-product integration
9. FAQ, including the uncomfortable one: _"Why isn't Plausible free while GA4 is free?"_
10. CTA: "Start free trial" ×4 (top, post-testimonial, bottom, footer); "View live demo" ×2; contextual "Import your historical data"

**Ghost — `/vs/squarespace/`** ([ghost.org/vs/squarespace/](https://ghost.org/vs/squarespace/)), ~1,200–1,400 words. Same skeleton, but **open source is a table row with ✅/❌** and there is an explicit pricing-delta argument ("Ghost from $15/mo with 0% transaction fees vs Squarespace 1–7% fees plus $57–83/mo"). Closes on the nonprofit/open-source ownership story.

**Cal.com — `/calcom-vs-calendly`** ([cal.com/calcom-vs-calendly](https://cal.com/calcom-vs-calendly)), ~800–900 words. 13+ row table, Deel testimonial with a business metric (15% close-rate lift), Trustpilot ratings shown side by side (4.7 vs 3.1), and a switching-cost demolisher: **"We'll pay your Calendly bill."** Notably it makes **no concessions** to Calendly and **barely uses open source as a differentiator** — self-hosting is a GitHub link, not an argument.

**Synthesised requirements** (inference from the three, flagged as such):

- Comparison table **above the fold**, not buried
- At least one concession — Plausible and Ghost both concede; Cal.com does not, and reads as more adversarial
- Switching-cost removal is the conversion lever (migration guide, importer, or paying the bill)
- Third-party social proof with names
- 800–2,000 words is the observed band. None of these pages are 5,000-word monsters.
- **No FAQ schema** — see §4.5, FAQ rich results are dead

### 2.3 Directory distribution for "alternative" pages

[OpenAlternative](https://openalternative.co/) claims _"Over 1 million users replaced their proprietary tools"_ and _"Trusted by 12K+ people"_ (newsletter). Its URL pattern is `/alternatives/[tool-name]`. It has a **`### Website Builders`** section (Frappe Builder, Silex, WordPress, Ycode) and it auto-generates the 6,561★ GitHub awesome-list from its own database. One submission at [openalternative.co/submit](https://openalternative.co/submit) lands in both.

[AlternativeTo](https://alternativeto.net/) already ranks organically for `squarespace alternatives` (multiple paginated URLs appear in the SERP, e.g. `alternativeto.net/software/squarespace/?p=29`) and hosts a [`Portfolio Website` feature tag](https://alternativeto.net/feature/portfolio-website/).

### 2.4 Honest limits of this section

- **Cal.com, Dub and Umami have not published "alternative page" traffic attribution.** Cal.com's blog surfaces no SEO retrospective; Dub's blog covers Product Hunt, payouts and year-in-review but not organic SEO numbers ([dub.co/blog](https://dub.co/blog)). **Any claim that their alternative pages drove N% of signups is UNVERIFIED.**
- The Plausible numbers are from a _paid analytics vendor blogging about its own growth_. They are first-party and specific, which is better than most, but they are still self-reported.
- **Category caveat:** Plausible succeeded partly because "Google Analytics" is a single dominant incumbent with a live grievance (privacy/GDPR). The portfolio-builder market is fragmented across Squarespace, Wix, Adobe Portfolio, Format, Pixieset, Carrd, Framer, Behance — **there is no single villain to pick a fight with.** The equivalent grievance here is subscription cost and platform shutdown risk (read.cv, Cohost), not privacy. That is an inference, flagged.

---

## 3. PROGRAMMATIC / SCALED SEO

### 3.1 Google's policy — the exact wording

**Primary source:** [developers.google.com/search/docs/essentials/spam-policies](https://developers.google.com/search/docs/essentials/spam-policies)

> **Scaled content abuse** is when many pages are generated for the primary purpose of manipulating search rankings and not helping users.

Examples listed, verbatim:

> - Using generative AI tools or other similar tools to generate many pages without adding value for users
> - Scraping feeds, search results, or other content to generate many pages (including through automated transformations like synonymizing, translating, or other obfuscation techniques), where little value is provided to users
> - Stitching or combining content from different web pages without adding value
> - Creating multiple sites with the intent of hiding the scaled nature of the content
> - Creating many pages where the content makes little or no sense to a reader but contains search keywords

**Doorway abuse** — also directly relevant to a `<profession>` page family:

> Doorway abuse is when sites or pages are created to rank for specific, similar search queries. They lead users to intermediate pages that are not as useful as the final destination.

Examples include: _"Having multiple domain names or pages targeted at specific regions or cities that funnel users to one page"_ and _"Generating pages to funnel visitors into the actual usable or relevant portion of a site."_

**The method-agnostic point**, from the announcement ([Google blog, 2024-03-05](https://blog.google/products-and-platforms/products/search/google-search-update-march-2024/)): the policy targets _"producing content at scale to boost search ranking — whether automation, humans or a combination are involved."_ Google expected the March 2024 work to _"collectively reduce low-quality, unoriginal content in search results by 40%"_, and on 2024-04-26 updated that to _"You'll now see 45% less low-quality, unoriginal content."_

**The three policies introduced March 2024** ([developers.google.com/search/blog/2024/03/core-update-spam-policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies)): scaled content abuse, site reputation abuse (enforcement began 2024-05-05), expired domain abuse.

### 3.2 The operational test Google gives you

From [developers.google.com/search/docs/fundamentals/creating-helpful-content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) — these are usable verbatim as a per-template gate:

> - "Does the content provide original information, reporting, research, or analysis?"
> - "Does the content provide a substantial, complete, or comprehensive description of the topic?"
> - "If the content draws on other sources, does it avoid simply copying or rewriting those sources, and instead provide substantial additional value and originality?"
> - **"Is the content mass-produced by or outsourced to a large number of creators, or spread across a large network of sites?"**

And the Who/How/Why frame:

> - Who: _"Is it self-evident to your visitors who authored your content?"_
> - How: _"Is the use of automation, including AI-generation, self-evident to visitors through disclosures?"_
> - Why: the purpose should be _"primarily to help people"_

> "If you use automation, including AI-generation, to produce content for the primary purpose of manipulating search rankings, that's a violation of our spam policies."

### 3.3 Does AI-generated content get penalised? The data says no — bad content does

Ahrefs, **331,000 pages** from 100,000 SERPs (June 2026), GSC data June 2025–June 2026 — [ahrefs.com/blog/google-doesnt-punish-ai-content](https://ahrefs.com/blog/google-doesnt-punish-ai-content/):

- **5.3%** of top-ranking pages returned 100% AI-content detection
- 9% of positions 1–3 contain ≥80% AI content
- Pages under 50% AI content account for **82.2%** of top-3 rankings
- Average AI content rises only slightly across the top 10: **27.1% at position 1 → 30.9% at position 10**
- Indexation: low-AI pages **49.28%** indexed vs very-high-AI **40.35%** — _"40% of these pages were still indexed"_
- Low/moderate-AI pages received **2–3× the impressions**
- Conclusion quoted: _"Google is not against AI content; it is against bad content."_

### 3.4 What scaled page families look like when they work

[backlinko.com/programmatic-seo](https://backlinko.com/programmatic-seo) documents the canonical examples (all figures as reported by Backlinko, **UNVERIFIED** independently):

| Company     | Pattern                            | Scale                           | Traffic claim                               |
| ----------- | ---------------------------------- | ------------------------------- | ------------------------------------------- |
| Wise        | `Convert [currency] to [currency]` | 8.5M currency pages; 10M+ total | 100M+ monthly visits                        |
| Tripadvisor | `Things to do in [city]`           | ~100k+ keywords                 | "millions"                                  |
| Zillow      | home values / listings by location | tens of millions of URLs        | 243M monthly organic visits                 |
| Zapier      | `Connect [app] to [app]`           | 590,000+ pages                  | 610,000+ monthly visits from `/apps/` alone |

**Cautionary cases from the same source:** ZoomInfo lost substantial organic visibility across the May–Aug 2021 and Oct 2023 updates; **G2 dropped from ~12 million monthly visits (2021) to under 1 million.**

The failure mode Backlinko names: _"simply changing '[City] plumbers' to target 500 locations while offering identical generic text"_ is spam. Pages must "meaningfully change between variations".

Other reported programmatic outcomes (**UNVERIFIED** — vendor blogs, no primary data): Omnius 5,520 → 17,700 monthly visitors in one quarter and 67 → 2,100 monthly signups ([rebusadvertising.com](https://rebusadvertising.com/blogs/seo-case-studies/)); a real-estate site 10,000 → 425,000 pages in three months with cost-of-living guides producing 55.5% of all traffic ([siegemedia.com/strategy/programmatic-seo](https://www.siegemedia.com/strategy/programmatic-seo)).

### 3.5 Candidate page families for THIS product, graded against §1 evidence

Grading uses autocomplete depth (§1.3, §1.4) as the demand test and "does each page carry unique, non-template content?" as the policy test.

| Family                                                                                                                                |       Est. count | Demand evidence                                                                                                                        | Unique-content substance available                                                                                                                                                                                                           | Verdict                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---------------: | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `<brand> alternative` — Squarespace, Wix, Adobe Portfolio, Carrd, Framer, Pixieset, Behance, Format, Cargo, Webflow, Dribbble, Notion |            10–15 | All have deep autocomplete except Cargo/Format (§1.4)                                                                                  | Real pricing comparison, real feature table, real migration steps, a working import path, screenshots of both UIs                                                                                                                            | **BUILD.** Hand-written or heavily hand-edited. This is not "programmatic" at 12 pages — it is just 12 pages                                  |
| `<brand> vs <this product>`                                                                                                           |       same 10–15 | `squarespace vs`, `adobe portfolio vs` both return 10 predictions                                                                      | Same as above                                                                                                                                                                                                                                | **BUILD, but merge with the above** — one page can target both "alternative" and "vs" intent                                                  |
| `portfolio website for <profession>`                                                                                                  | 8–10, **not 40** | Depth varies 10 → 1 (§1.3). Students/writers/developers/designers real; illustrators/musicians/teachers empty                          | Genuinely differentiated _only if_ each has: a real template designed for that profession, real example sites, profession-specific advice (e.g. photographers need galleries + client proofing; developers need code blocks + GitHub embeds) | **BUILD ONLY WHERE A REAL TEMPLATE EXISTS.** A profession page with no profession-specific template is exactly Google's doorway-abuse example |
| `how to make a <profession> portfolio`                                                                                                |              5–8 | `how to make a designer portfolio` returns 10 incl. graphic/fashion/game/product/interior/UI-UX                                        | Requires genuinely different advice per profession; overlaps heavily with the above                                                                                                                                                          | **MERGE into the profession pages** rather than running a parallel family                                                                     |
| `<template name>` gallery pages                                                                                                       | = template count | `developer portfolio template` 10 predictions; `portfolio website templates for designers`, `architecture portfolio website templates` | Each page has a distinct live demo, distinct screenshots, one-click deploy                                                                                                                                                                   | **BUILD — this is the safest scaled family**, because each page is backed by a real artefact                                                  |
| Deploy-target / stack pages (`deploy on Vercel`, `on Netlify`, `with Supabase`, `with Neon`)                                          |              4–8 | Not directly tested; inferred from `self hosted website builder docker`                                                                | Real, different instructions per target                                                                                                                                                                                                      | **BUILD, small**                                                                                                                              |
| `<city>` or `<country>` pages                                                                                                         |                — | No evidence found                                                                                                                      | None                                                                                                                                                                                                                                         | **DO NOT BUILD** — textbook doorway abuse                                                                                                     |
| `<profession> portfolio examples`                                                                                                     |                — | `portfolio website examples` returns 10                                                                                                | Would require curating real third-party sites; high effort, and competes with Behance/Dribbble                                                                                                                                               | **DEFER**                                                                                                                                     |

**The load-bearing constraint:** every page in a scaled family must be backed by a real artefact — a template, a demo, a migration script, a comparison the team actually ran. When the artefact does not exist, the page is thin by construction, and §3.1's doorway language applies directly.

---

## 4. TECHNICAL SEO FOR A NEXT.JS MARKETING SITE

### 4.1 Next.js App Router metadata — current API

Source: [nextjs.org/docs/app/getting-started/metadata-and-og-images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) — **docs version 16.3.0, lastUpdated 2026-06-01**.

- Two always-present defaults: `<meta charset="utf-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1">`
- **Static:** `export const metadata: Metadata = { … }` from `layout.js`/`page.js`
- **Dynamic:** `export async function generateMetadata({ params, searchParams }, parent)` — note `params` is a **Promise** and must be awaited (Next 15+ change)
- **`metadata` and `generateMetadata` are Server-Components-only**
- **Deduplicate fetches** between `generateMetadata` and the page using React's `cache()` — documented pattern, not optional if you fetch in both

**Streaming metadata — the one thing that can silently break SEO:**

> "For dynamically rendered pages, Next.js streams metadata separately, injecting it into the HTML once `generateMetadata` resolves, without blocking UI rendering."
> "Streaming metadata is **disabled for bots and crawlers** that expect metadata to be in the `<head>` tag (e.g. `Twitterbot`, `Slackbot`, `Bingbot`). These are detected by using the User Agent header from the incoming request."

Configurable via [`htmlLimitedBots`](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots). Prerendered pages don't stream — metadata resolves at build. **For a marketing site that is mostly static, this is a non-issue; for any dynamically rendered page it must be verified against the actual crawler list.**

**File conventions** ([nextjs.org/docs/app/api-reference/file-conventions/metadata](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)):
`favicon.ico` / `icon.jpg` / `apple-icon.jpg`; `opengraph-image.*` and `twitter-image.*`; `robots.txt` (or `app/robots.ts`); `sitemap.xml` (or `app/sitemap.ts`). Nested `opengraph-image` overrides ancestors.

**Dynamic OG images:** `ImageResponse` from `next/og`, `export const size = { width: 1200, height: 630 }`, `export const contentType = 'image/png'`. Built on `@vercel/og` + `satori` + `resvg`. **Only flexbox and a CSS subset are supported — `display: grid` will not work.** Playground: [og-playground.vercel.app](https://og-playground.vercel.app/).

### 4.2 Open Graph

Spec: [ogp.me](https://ogp.me/). Four required properties: **`og:title`, `og:type`, `og:image`, `og:url`** (_"The canonical URL of your object that will be used as its permanent ID in the graph"_). Optional image sub-properties: `og:image:width`, `og:image:height`, `og:image:type`, `og:image:alt` — and the spec states _"If the page specifies an og:image it should specify og:image:alt."_

1200×630 is the Next.js documented default size. **OG tags are not a Google ranking factor** — no Google documentation asserts otherwise; their value is click-through on social/Slack/Discord/LinkedIn shares, which for a developer-tool launch is the primary distribution surface (see §5 HN/PH numbers).

### 4.3 Canonicals

Source: [developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

Google's ranked signal strength: **redirects (strong) > `rel="canonical"` (strong) > sitemap inclusion (weak).**

Key guidance quoted:

- _"Do include a rel="canonical" link on the canonical page itself (also known as a self-referential canonical)."_
- _"Use absolute paths rather than relative paths with the rel="canonical" link element."_
- _"none of them are required; your site will likely do just fine without specifying a canonical preference"_ — i.e. **it is a hint, not a directive**

Mistakes Google names: don't use robots.txt or the removal tool for canonicalisation; don't mix techniques giving different canonicals for one page; don't canonicalise to a URL fragment; don't use `noindex` to influence canonical selection within a site.

In Next.js this is `alternates: { canonical: '…' }` plus a `metadataBase` on the root layout so relative canonicals resolve.

### 4.4 Sitemaps and robots

Source: [developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

- Limit: **50 MB uncompressed or 50,000 URLs** per sitemap; use a sitemap index beyond that
- Google **"ignores `<priority>` and `<changefreq>` values"**
- Google **"uses the `<lastmod>` value if it's consistently and verifiably (for example by comparing to the last modification of the page) accurate"** — it should reflect significant main-content/structured-data/link changes, _not_ a copyright-year bump. **A build-time `new Date()` on every URL is exactly the pattern that makes Google stop trusting `lastmod`.**
- Submission: robots.txt `Sitemap: https://example.com/my_sitemap.xml` (multiple lines allowed, no limit) **and/or** Search Console. Both work; Search Console gives error visibility.

### 4.5 Structured data — which types are actually still alive

**Primary source:** [developers.google.com/search/docs/appearance/structured-data/search-gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery), fetched 2026-08-12. The complete documented list is:

Article, Breadcrumb, Carousel, Course list, Dataset, Discussion forum, Education Q&A, Employer aggregate rating, Event, Image metadata, Job posting, Local business, Math solver, Movie, Organization, Product, Profile page, Q&A, Recipe, Review snippet, **Software app**, Speakable, Subscription and paywalled content, Vacation rental, Video.

| Type                    | Status                                                                                                                                                                                                                                                                                                                                                                                                                                            | Worth implementing here?                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SoftwareApplication** | ✅ Live — [docs](https://developers.google.com/search/docs/appearance/structured-data/software-app), no deprecation notice. Required: `name`, `offers.price` (**set `0` for free**), and either `aggregateRating` or `review`. Recommended: `applicationCategory`, `operatingSystem`                                                                                                                                                              | **Yes** — the only rich-result type that describes this product. Note the rating requirement is a real constraint: you need genuine ratings, not invented ones |
| **BreadcrumbList**      | ✅ Live ("Breadcrumb")                                                                                                                                                                                                                                                                                                                                                                                                                            | **Yes** — cheap, helps docs/blog hierarchy                                                                                                                     |
| **Organization**        | ✅ Live                                                                                                                                                                                                                                                                                                                                                                                                                                           | **Yes** — logo, sameAs to GitHub/X, canonical entity for AI/knowledge-graph purposes                                                                           |
| **Article**             | ✅ Live                                                                                                                                                                                                                                                                                                                                                                                                                                           | **Yes** on blog posts                                                                                                                                          |
| **VideoObject**         | ✅ Live ("Video")                                                                                                                                                                                                                                                                                                                                                                                                                                 | Yes if demo videos are published                                                                                                                               |
| **Product**             | ✅ Live                                                                                                                                                                                                                                                                                                                                                                                                                                           | No — wrong type for free software; use SoftwareApplication                                                                                                     |
| **FAQPage**             | ❌ **DEAD.** [Google's FAQPage doc](https://developers.google.com/search/docs/appearance/structured-data/faqpage) records: Aug 2023 — _"The feature is only shown for well-known, authoritative government and health websites"_; then June 2024 — _"Removed documentation for the FAQ rich result feature"_ because _"The FAQ rich result feature is no longer shown in Google Search results, as announced in the changelog entry in May 2026"_ | **No SEO value.** Still write FAQs as visible page content (Plausible and Ghost both do) — just don't expect markup to do anything                             |
| **HowTo**               | ❌ **DEAD** — absent from the search gallery. Announcement: [developers.google.com/search/blog/2023/08/howto-faq-changes](https://developers.google.com/search/blog/2023/08/howto-faq-changes) (full text of that post could not be retrieved cleanly — the _specific desktop/mobile wording_ is **UNVERIFIED**, but the absence from the current gallery is verified)                                                                            | **No**                                                                                                                                                         |
| **Sitelinks SearchBox** | ❌ Absent from the gallery                                                                                                                                                                                                                                                                                                                                                                                                                        | **No**                                                                                                                                                         |

### 4.6 Core Web Vitals — current thresholds

Source: [web.dev/articles/vitals](https://web.dev/articles/vitals)

| Metric                              | "Good" threshold | Status                            |
| ----------------------------------- | ---------------- | --------------------------------- |
| **LCP** (Largest Contentful Paint)  | **≤ 2.5 s**      | Stable                            |
| **INP** (Interaction to Next Paint) | **≤ 200 ms**     | Stable — replaced FID in **2024** |
| **CLS** (Cumulative Layout Shift)   | **≤ 0.1**        | Stable                            |

Assessment rule, quoted: _"a good threshold to measure is the **75th percentile** of page loads, segmented across mobile and desktop devices."_ No metrics are currently listed as pending/experimental for the CWV track.

**Ranking weight:** Google has never published a magnitude. Any specific "CWV is X% of ranking" figure is **UNVERIFIED**. The defensible framing is that page experience is a documented input but is dominated by content relevance.

### 4.7 What Google says actually ranks in 2025–2026

**The Helpful Content System no longer exists as a separate system.** [developers.google.com/search/docs/appearance/ranking-systems-guide](https://developers.google.com/search/docs/appearance/ranking-systems-guide) lists it under **retired systems**, with the note: _"In March 2024, it evolved and became part of our core ranking systems, as our systems use a variety of signals and systems to present helpful results to users."_ Also retired: Hummingbird, Panda, Penguin.

Currently documented live systems include: BERT, deduplication, exact-match-domain, freshness, **link analysis systems and PageRank**, MUM, neural matching, **original content systems**, passage ranking, RankBrain, reliable information systems, reviews system, **site diversity system**, spam detection.

Two of these matter disproportionately here: **"original content systems"** (elevates primary sources — argues for original data/research, §6.4) and the **"site diversity system"** (limits results from a single domain — which is why a competitor's owned blog can't monopolise a SERP, and why third-party listicle placement compounds).

### 4.8 AI Overviews, AI Mode, and LLM citation

**Google's own position — quoted verbatim** from [developers.google.com/search/docs/appearance/ai-features](https://developers.google.com/search/docs/appearance/ai-features):

> "To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements."

> "You don't need to create new machine readable files, AI text files, or markup to appear in these features. There's also no special schema.org structured data that you need to add."

> "To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls."

Google also notes that "query fan-out" lets them _"display a wider and more diverse set of helpful links"_ than classic results — which is a genuine opening for small sites.

**Measured CTR impact — three independent studies:**

| Source                                                                                                                                                                   | Method                                                                                     | Finding                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Ahrefs](https://ahrefs.com/blog/ai-overviews-reduce-clicks/)                                                                                                            | 300,000 keywords (150k with AIO / 150k without), March 2024 vs March 2025, GSC data        | **−34.5% CTR** for the top-ranking page. Position-1 CTR on AIO keywords fell 0.073 → 0.026                                                                                                               |
| [Pew Research, 2025-07-22](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) | 900 US adults, real browsing data, 68,879 searches (12,593 with an AI summary), March 2025 | Clicked a traditional result on **8%** of visits with an AI summary vs **15%** without. Clicked a link _inside_ the summary on **1%** of visits. Session ended on 26% of AI-summary pages vs 16% without |
| [Ahrefs, July 2026](https://ahrefs.com/blog/ai-search-trends/)                                                                                                           | Ahrefs index                                                                               | **~58%** click loss at position #1 when AI Overviews appear                                                                                                                                              |

**What correlates with being cited by LLMs** — [ahrefs.com/blog/ai-search-strategy](https://ahrefs.com/blog/ai-search-strategy/):

- **Up to 89% of Ahrefs' own brand mentions in AI answers came from other websites, not Ahrefs' site.** Off-site mentions dominate.
- A study of **75,000 brands** found _"off-site mentions, especially … YouTube video transcripts, had some of the strongest correlations with visibility in ChatGPT, Google AI Mode, and Google AI Overviews"_
- YouTube, Reddit, Facebook and LinkedIn are among the **most frequently cited platforms**
- **"AI-cited content is 25.7% fresher than organic Google results"**
- Presented as principle rather than measured: original research, tools/calculators (resist summarisation), and documentation pages earn citations

This lines up with §1.5 — the audience is already appending "reddit" to these queries, and Reddit is one of the most-cited LLM sources. **Community presence is simultaneously a SEO play and an LLM-visibility play.**

**AI referral traffic is real but small in absolute terms** — [plausible.io/blog/ai-referral-traffic-and-optimization](https://plausible.io/blog/ai-referral-traffic-and-optimization): a **~2,200% increase** in referral traffic from AI search engines in 2024, but from a base _"in the 100's in 2023"_. Sources: ChatGPT, Perplexity, Claude, Phind. Spike began mid-August 2024 alongside ChatGPT's 8 Aug release. Quality signals were good — 58% homepage scroll depth, and the free-trial page was the **second-most-visited page** in AI sessions. Their stated cause: _"If a search engine likes you (high brand authority) – you are more likely to be noticed by AI."_ They explicitly did **not** run any GEO optimisation.

**`llms.txt` — be sceptical.** [llmstxt.org](https://llmstxt.org/) — proposed by **Jeremy Howard, 2024-09-03** (v2 update 2026-08-10); a markdown file at `/llms.txt`. The site claims _"The AI labs themselves publish llms.txt files for their own developer docs: OpenAI, Anthropic, and Gemini"_, that _"thousands of sites publish an llms.txt file"_, and that _"Chrome's Lighthouse audits sites for one as part of its agentic browsing checks."_ **Publishing one is not the same as consuming one, and no vendor confirmation of consumption was found.** Counter-evidence: Ahrefs analysed **137,000 sites** and reports **"97% of llms.txt files never get read"** ([ahrefs.com/blog/ai-search-trends](https://ahrefs.com/blog/ai-search-trends/)). Google states flatly that no AI text file is needed (§4.8 quote above).

Note that **Next.js itself ships `/docs/llms.txt`** (visible in the docs metadata fetched for §4.1) — so it is cheap and conventional in this ecosystem, just not evidenced as effective.

**Also from Ahrefs' July 2026 trends piece, worth flagging as a caution:** in a GEO test, an untouched page was cited by GPT-4o-mini **13.3%** of the time; after "full GEO optimization" citation **dropped to 10.9–12.2%**. And one site saw a **1,900% month-over-month jump** in ChatGPT citations to a single page with _"little-to-no business impact."_

### 4.9 AI crawler controls — vendor-by-vendor

| Bot                | Vendor doc                                                                                                                                                      | What it does                                                                                                                              | Block effect                                                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GPTBot`           | [developers.openai.com/api/docs/bots](https://developers.openai.com/api/docs/bots)                                                                              | Crawls for **training**. _"Disallowing GPTBot indicates a site's content should not be used in training generative AI foundation models"_ | No effect on ChatGPT search                                                                                                                                                                                              |
| `OAI-SearchBot`    | same                                                                                                                                                            | Surfaces sites in **ChatGPT search results**                                                                                              | Sites blocking it _"will not be shown in ChatGPT search answers"_ — **do not block**                                                                                                                                     |
| `ChatGPT-User`     | same                                                                                                                                                            | User-triggered fetches. _"Because these actions are initiated by a user, robots.txt rules may not apply"_                                 | Not controllable via robots.txt                                                                                                                                                                                          |
| `OAI-AdsBot`       | same                                                                                                                                                            | Ad landing-page safety; not used for training                                                                                             | —                                                                                                                                                                                                                        |
| `ClaudeBot`        | [support.claude.com/…/8896518](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) | _"collecting web content that could potentially contribute to their training"_                                                            | `User-agent: ClaudeBot` / `Disallow: /`. `Crawl-delay` also supported                                                                                                                                                    |
| `Claude-User`      | same                                                                                                                                                            | _"When individuals ask questions to Claude, it may access websites using a Claude-User agent"_                                            | —                                                                                                                                                                                                                        |
| `Claude-SearchBot` | same                                                                                                                                                            | _"navigates the web to improve search result quality"_                                                                                    | —                                                                                                                                                                                                                        |
| `Google-Extended`  | [blog.google, 2023-09-28](https://blog.google/technology/ai/an-update-on-web-publisher-controls/)                                                               | _"a new control that web publishers can use to manage whether their sites help improve Bard and Vertex AI generative APIs"_               | The announcement makes **no claim** that it affects Search ranking or inclusion. The dedicated docs URL `…/crawling-indexing/google-extended` returned **404** on 2026-08-12 — current canonical location **UNVERIFIED** |

**Practical read for an open-source project that wants to be recommended by assistants: allow everything.** The only bot with a documented downside to blocking is `OAI-SearchBot`, and the whole §4.8 evidence base says visibility, not protection, is the goal here.

### 4.10 Checklist distilled

- `metadataBase` on the root layout; `title.template` for section consistency; self-referential absolute `alternates.canonical` on every page
- One trailing-slash convention, one host (www or apex), enforced by redirect — redirects outrank canonicals as a signal (§4.3)
- `app/sitemap.ts` with **honest `lastmod`** derived from real content mtime, never `new Date()`
- `app/robots.ts` emitting the `Sitemap:` line; allow all AI crawlers
- `opengraph-image.tsx` at root + per-template/per-comparison pages (flexbox only)
- JSON-LD: `SoftwareApplication` (site-wide, `offers.price: "0"`), `Organization`, `BreadcrumbList` on docs/blog, `Article` on posts. **Skip FAQPage and HowTo entirely**
- If any page is dynamically rendered, verify streaming-metadata behaviour against `htmlLimitedBots`
- CWV budget: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at p75 mobile
- Docs, marketing site and repo should agree on one canonical description string — it becomes the Google snippet on GitHub too (§5.2)

---

## 5. GITHUB AS A DISCOVERY CHANNEL

### 5.1 Topics — rules and live counts

Rules ([GitHub Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)): **"Add no more than 20 topics"**; **"Use lowercase letters, numbers, and hyphens"**; **50 characters or less**; topic names are always public even from a private repo. Search qualifiers `topic:`, `topics:n`, and crucially **`in:readme`** ([search docs](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories)) — README body text is a first-class search surface. `is:featured` topics are those with the most repos; `is:curated` topics are enriched via [github/explore](https://github.com/github/explore).

**Live repo counts, observed 2026-08-12:**

| Topic               |   Repos |     | Topic                         |   Repos |
| ------------------- | ------: | --- | ----------------------------- | ------: |
| `nextjs`            | 177,082 |     | `cms`                         |  10,721 |
| `portfolio`         |  73,048 |     | `static-site-generator`       |   4,768 |
| `portfolio-website` |  28,631 |     | `no-code`                     |   2,631 |
| `self-hosted`       |  27,697 |     | `developer-portfolio`         |   2,266 |
| `vercel`            |  26,833 |     | `headless-cms`                |   1,660 |
| `jamstack`          |  19,553 |     | `portfolio-template`          |   1,650 |
| `personal-website`  |  18,912 |     | **`website-builder`**         | **626** |
| `resume`            |  13,874 |     | **`page-builder`**            | **313** |
|                     |         |     | **`portfolio-builder`**       |  **79** |
|                     |         |     | **`open-source-alternative`** |  **41** |

(`portfolio-builder` = 79 and `website-builder` = 608 confirmed independently via the GitHub REST search API, same date; small deltas vs the topic-page header are normal indexing lag.)

**The arbitrage:** topic pages rank by stars. A new repo is invisible on `nextjs` (177k) but can reach page 1 of `website-builder` (626), `page-builder` (313), `portfolio-builder` (79) or `open-source-alternative` (41) with modest star counts. `website-builder` is the highest-value winnable topic — its incumbents are Halo (39.5k★), GrapesJS (26.1k★), Webstudio (8.8k★), i.e. genuine category peers.

**Recommended 20-topic slate** (from the research): `website-builder`, `page-builder`, `portfolio`, `portfolio-website`, `personal-website`, `developer-portfolio`, `portfolio-template`, `cms`, `headless-cms`, `no-code`, `self-hosted`, `nextjs`, `react`, `typescript`, `vercel`, `open-source-alternative`, `jamstack`, `resume`, `static-website`, `hacktoberfest`.

### 5.2 README, About, and whether repo pages rank

- [About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes): _"a README is often the first item a visitor will see"_; should answer what/why/getting-started/help/who-maintains. Content beyond **500 KiB is truncated**.
- [Social preview](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview): **"at least 640 by 320 pixels (1280 by 640 pixels for best display)"**, **"under 1 MB"**, PNG/JPG/GIF. Without it, links expand to _"basic information about the repository and the owner's avatar."_
- **`github.com/robots.txt`** (fetched 2026-08-12) disallows `/*/*/stargazers`, `/*/*/forks`, `/*/*/commits/`, `/*/*/pulse`, `/*/*/network`, `/*/tree/`, `/gist/` — but **does not disallow `/<owner>/<repo>` root pages or `/topics/*`**. Both are crawlable.
- Fetching a repo page directly showed **no `<meta name="robots">`** and a description tag that is literally the About field plus `owner/repo`. **Google's snippet for your repo is your About description.** Writing it is an SEO decision.
- `og:image` resolves to `repository-images.githubusercontent.com/...` with `twitter:card = summary_large_image` — the uploaded social preview is what appears when the repo is shared on X/Slack/LinkedIn.
- **Counter-signal (UNVERIFIED):** community threads report GitHub sometimes injects `noindex` for new or low-activity accounts — [community discussion 156489](https://github.com/orgs/community/discussions/156489), [197474](https://github.com/orgs/community/discussions/197474). Not reproducible on established repos.

**Academic evidence on README quality:**

- Venigalla & Chimalakonda (2022), 1,950 READMEs across ten languages — [arXiv:2206.10772](https://arxiv.org/abs/2206.10772): _"readme files in majority of the popular projects are well organised using lists and images, and comprise links to external sources"_; _"repositories with readme files containing contribution guidelines and references were observed to be associated with higher popularity."_ **Correlational, not causal.**
- Prana et al., 4,226 sections across 393 repos — [arXiv:1802.06997](https://arxiv.org/abs/1802.06997): _"information discussing the 'What' and 'How' of a repository is very common, while many README files lack information regarding the purpose and status of a repository."_ → **"Why this exists" and "project status/maturity" are the under-served differentiating sections.**
- **Counter-evidence:** [arXiv:2502.18440v2](https://arxiv.org/html/2502.18440v2) finds **no clear causal evidence** that introducing README/CONTRIBUTING files drives contributor growth. Treat README work as conversion optimisation, not growth.
- Borges & Valente, "What's in a GitHub Star?" — [arXiv:1811.07643](https://arxiv.org/abs/1811.07643) — **UNVERIFIED** (PDF not machine-readable this session).
- Practitioner claims like "a star-count badge lifts star conversion ~15%" appear only in vendor blogs (e.g. [star-history.com](https://www.star-history.com/blog/playbook-for-more-github-stars/)) — **UNVERIFIED**.

### 5.3 Awesome-lists — verified targets and rules

**awesome-selfhosted is the highest-value target, and it has a trap.**

- List repo: [awesome-selfhosted/awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) — **312,028 stars**, last push 2026-08-10, 1,263 entries.
- **Submissions do not go there.** They go to [awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data) (1,094★, 1,347 `software/*.yml` files) as one YAML file per project. That single PR feeds both the list and [awesome-selfhosted.net](https://awesome-selfhosted.net).
- Rules, verbatim from the [PR template](https://github.com/awesome-selfhosted/awesome-selfhosted-data/blob/master/.github/PULL_REQUEST_TEMPLATE.md):
  > - _"Any software project you are adding was first released more than 4 months ago."_
  > - _"Any software project you are adding to the list is actively maintained."_
  > - _"Any software project you are adding has working installation instructions."_
  > - _"Submit one item per pull request."_
  > - _"You understand that your Pull Request will be merged at least ~1 week after approval."_
- From [CONTRIBUTING.md](https://github.com/awesome-selfhosted/awesome-selfhosted-data/blob/master/CONTRIBUTING.md), **what does not qualify**: _"Software that depends on a specific cloud provider"_; _"Software that requires you to write application code before producing a working end-user application"_; _"Software acts as a platform to build and deploy arbitrary applications (PaaS, 'serverless'…)"_. Also: _"Machine/LLM-generated contributions, that do not respect project guidelines are not allowed and will result in a ban."_ Curation: _"Software with no development activity for 6-12 months may be removed."_
- **There is no minimum-star rule** (verified by full-text read).
- **The trap:** `tags/static-site-generators.yml` carries a `redirect:` to staticgen.com, and per CONTRIBUTING _"if this is set, no software items will be allowed to reference this tag."_ **Positioning as a static site generator makes the project ineligible.** File it under _Content Management Systems (CMS)_ or _Blogging Platforms_ instead. Equally, a **Vercel-only deploy story reads as "depends on a specific cloud provider"** — documented Docker/Node self-hosting is required to stay eligible. This is a _product_ constraint discovered through SEO research.

**Other lists — all stats 2026-08-12:**

| List                                                                                                              |  Stars | Last commit    | Verdict                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------- | -----: | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [openalternative](https://github.com/piotrkulpinski/openalternative)                                              |  6,561 | 2026-08-11     | **Best fit.** Has an explicit `### Website Builders` section (Frappe Builder, Silex, WordPress, Ycode). Auto-generated from openalternative.co — submit at [openalternative.co/submit](https://openalternative.co/submit) |
| [awesome-nextjs](https://github.com/unicodeveloper/awesome-nextjs)                                                | 11,108 | 2026-07-29     | Active; _Boilerplates_ / _Apps_ sections; formatting-only rules                                                                                                                                                           |
| [awesome-static-website-services](https://github.com/agarrharr/awesome-static-website-services)                   |  1,979 | 2026-04-20     | Moderately active, CC0                                                                                                                                                                                                    |
| [awesome-jamstack](https://github.com/automata/awesome-jamstack)                                                  |  1,368 | 2026-05-08     | Moderately active, no CONTRIBUTING                                                                                                                                                                                        |
| [awesome-nocode-lowcode (kairichard)](https://github.com/kairichard/awesome-nocode-lowcode)                       |  1,187 | 2026-08-04     | Active — best no-code list                                                                                                                                                                                                |
| [awesome-open-source-alternatives](https://github.com/diegoleme/awesome-open-source-alternatives)                 |    477 | 2026-04-10     | Alive                                                                                                                                                                                                                     |
| [awesome-github-pages-portfolios](https://github.com/guilyx/awesome-github-pages-portfolios)                      |    438 | 2026-05-13     | Alive; template-oriented — submit a demo site                                                                                                                                                                             |
| [developer-portfolios](https://github.com/emmabostian/developer-portfolios)                                       | 25,978 | 2026-08-11     | Very active but lists **individual portfolios**, not tools — route in via your own demo site                                                                                                                              |
| [awesome-cms (postlight)](https://github.com/postlight/awesome-cms)                                               |  3,125 | **2024-10-23** | **Stale — low priority**                                                                                                                                                                                                  |
| [awesome-portfolios (amnashanwar)](https://github.com/amnashanwar/awesome-portfolios)                             |    334 | **2018-11-25** | **Dead**                                                                                                                                                                                                                  |
| [awesome-opensource-alternatives (WarenGonzaga)](https://github.com/WarenGonzaga/awesome-opensource-alternatives) |      3 | **2021-10-10** | **Dead — skip**                                                                                                                                                                                                           |

**sindresorhus/awesome** ([repo](https://github.com/sindresorhus/awesome), **494,602★**, last push 2026-06-30, CC0) accepts _lists_, not projects. Rules from the [PR template](https://github.com/sindresorhus/awesome/blob/main/pull_request_template.md): _"Has been around for at least 30 days"_; _"Run `awesome-lint` on your list and fix the reported issues"_; a `Contents` section (_"Should be named `Contents`, not `Table of Contents`"_); a CC0 licence file (**MIT is rejected for the list itself**); and you must **review at least 4 other open pull requests** first. → A viable secondary play is publishing `awesome-portfolio-builders` and owning the category.

### 5.4 Stars, Trending, and what a launch actually delivers

- **GitHub has never published the trending algorithm.** [Community discussion 163970](https://github.com/orgs/community/discussions/163970) has no staff answer.
- OSS Insight states plainly _"GitHub's trending algorithm is a black box"_ and ranks their own alternative _"by recent star velocity and activity events"_ over 10.5 billion events — [ossinsight.io/blog/introducing-trending-page](https://ossinsight.io/blog/introducing-trending-page).
- Consensus reverse-engineering (**UNVERIFIED**, practitioner blogs): trending ranks stars gained in a window _relative to a repo's own baseline_, not absolute stars — [pagecrawl.io](https://pagecrawl.io/blog/github-trending-repository-star-velocity-alerts), [tooljet blog](https://blog.tooljet.com/github-stars-guide/). **No published numeric threshold exists.**

**Hacker News front-page traffic — first-party analytics:**

| Source                                                                                                        | Outcome                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [thehftguy.com](https://thehftguy.com/2017/09/26/hitting-hacker-news-front-page-how-much-traffic-do-you-get/) | _"The front page of Hacker News instantly brings 10k or 30k visitors."_ One article: **138,137 views / 828 GB in a week**, 2 days on the front page (baseline before: ~20 views/day) |
| [marcotm.com](https://marcotm.com/articles/stats-of-being-on-the-hacker-news-front-page/) (2023-03-22)        | Peak rank #17, 68 points, ~1h on front page → 35–40 uniques/minute, **≈3,500–4,000** from the front page, **≈8,000** uniques over 4 days                                             |
| [nikofischer.com](https://nikofischer.com/website-traffic-after-hacker-news-ranking)                          | **#1 ≈ 11,000 unique visitors** in a day                                                                                                                                             |
| Plausible (§2.1)                                                                                              | Two front-page posts → **25,000** and **35,000+** visitors in a day                                                                                                                  |

**Realistic band: 4k–30k visitors; #1 ≈ 11k/day; exceptional multi-day ≈ 138k.** Claims of "500–2,000 stars in 24 hours from a Show HN" appear only in marketing blogs — **UNVERIFIED**.

**Sobering baseline for this specific category** — Hacker News Algolia API, 2026-08-12:

| Story                                                                       |  Points | Comments | Date       |
| --------------------------------------------------------------------------- | ------: | -------: | ---------- |
| Show HN: Makers.so — A website builder inside Figma                         | **180** |       45 | 2022-02-10 |
| Launch HN: Typedream (YC W20) — WYSIWYG website builder                     |  **78** |       68 | 2021-11-02 |
| Helix: A Sleek Open-Source Portfolio Website                                |      23 |        8 | 2023-03-22 |
| Show HN: Open-source portfolio and blog template (Gatsby/Tailwind)          |      17 |        0 | 2020-10-19 |
| Show HN: I made a (self-hosted) Website Builder                             |       7 |        2 | 2024-01-08 |
| Show HN: I made a 1 minute portfolio website builder for designers and devs |   **4** |        0 | 2025-05-22 |
| Show HN: Free no-code website portfolio builder                             |       2 |        0 | 2021-07-27 |
| Show HN: A one-click Read.CV alternative                                    |       1 |        0 | 2025-08-29 |

**Read this carefully: almost every "portfolio website builder" Show HN has failed on HN.** The two that worked (180, 78 points) were positioned as _website builders with a novel angle_ (inside Figma; YC launch), not as portfolio tools. This is direct evidence that the HN framing must be the technical/self-hosting/architecture angle, not "make a portfolio".

**Product Hunt** — Dub's documented launch ([dub.co/blog/product-hunt](https://dub.co/blog/product-hunt)): launched 2024-03-21, teaser 2024-03-14. **1,085 upvotes, 210 comments**, #1 Product of the Day/Week/Month. **150 upvotes + 50 comments in the first hour.** Result: **2,000+ unique visitors and 663 new signups on launch day — an 8× increase from daily average.** Preconditions they name: **15,000+ existing GitHub stars** and a **25,000+ email list**. Product Hunt's domain rating is 91 with 4.5M+ monthly visits. Rules from [producthunt.com/launch](https://www.producthunt.com/launch): _"It's 100% free"_, **"Company accounts are prohibited"** (launch from a personal maker account), _"12:01 am Pacific Time is the best time to launch."_

**The uncomfortable inference:** Dub's 663 signups came _after_ 15k stars and 25k subscribers. A Product Hunt launch is a harvest, not a seed.

### 5.5 Getting into "best of" listicles

The 2026 SERP for `best open source website builders` is owned by WordPress-ecosystem SEO/affiliate blogs, not developer media: [wbcomdesigns.com](https://wbcomdesigns.com/best-open-source-website-builders/) (Jun 2026), [codeless.co](https://codeless.co/best-open-source-website-builders/) (May 2026), [websiteplanet.com](https://www.websiteplanet.com/blog/best-open-source-website-builders/) (Mar 2026), [colorlib.com](https://colorlib.com/wp/open-source-website-builders/) (Mar 2026), [droptica.com](https://www.droptica.com/blog/6-best-open-source-website-builders/), [getapp.com](https://www.getapp.com/website-ecommerce-software/website-builder/p/open-source/), [opensourcealternatives.to](https://www.opensourcealternatives.to/blog/best-open-source-website-builders). These refresh annually — **there is a predictable rewrite window and a named author to email.**

Evidence outreach works:

- [position.digital/blog/listicle-outreach-guide](https://www.position.digital/blog/listicle-outreach-guide/) — highest yield is reaching the author **during research, before publication**; frameworks citing the specific article/section report **8–15% reply rates**
- [Indie Hackers write-up](https://www.indiehackers.com/post/were-invisible-in-the-listicles-here-s-what-we-tried-today-and-the-surprise-that-came-with-it-993e44a239) — within a month of publishing a post containing **original data**, listicle authors proactively asked to include the tool
- Corollary: the landing page must state the category **verbatim** ("open source website builder", "self-hosted portfolio builder") so a skimming writer can classify it in five seconds

### 5.6 Adjacent discovery surfaces and their mechanics

| Surface                                                                                      | Mechanics                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[OpenAlternative](https://openalternative.co/submit)**                                     | Free queue. Payload contains a paid-tier string: _"Upgrade your listing to skip the queue and get published within 24 hours"_ (price not exposed — **UNVERIFIED**). 12K newsletter subscribers. Feeds the 6,561★ awesome-list with a **Website Builders** section. **Highest single-submission ROI** |
| **[AlternativeTo](https://alternativeto.net/manage/new/)**                                   | Free; account + email verification. [FAQ](https://alternativeto.net/faq/): _"a new app usually sits in our backlog for at least a few months."_ **$5 priority review → 1–2 business days**                                                                                                           |
| **[Product Hunt](https://www.producthunt.com/launch)**                                       | Free; personal maker account only; 12:01 am PT; relaunch allowed for _"significant product iterations"_. [Open-source topic hub](https://www.producthunt.com/topics/open-source)                                                                                                                     |
| **LibHunt** ([about](https://go.libhunt.com/site/about))                                     | Listings **derived from GitHub awesome lists**: _"If you wish to add a new library… you have to open a pull request at the official repository."_ Getting into awesome-nextjs propagates automatically. _(Cloudflare-blocked; partially verified)_                                                   |
| **[SaaSHub](https://www.saashub.com/services/submit)**                                       | Free form; _"You will need an email address on the product's domain"_; _"most listings are approved within one or two days."_ _(Cloudflare-blocked; partially verified)_                                                                                                                             |
| **[Slant](https://www.slant.co/help)**                                                       | Community Q&A via "I Recommend". Rule: _"Every statement must be supported by objective information"_                                                                                                                                                                                                |
| **[selfh.st](https://selfh.st/submit/)**                                                     | Accepts _"Self-hosted news, content, updates, launches, events"_. **Self-Host Weekly** every Friday ([latest observed](https://selfh.st/weekly/2026-08-07/)); separate [app directory](https://selfh.st/apps/) with star/fork/licence/language filters. Subscriber count **UNVERIFIED**              |
| **[awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data)** | The real endpoint for both awesome-selfhosted and awesome-selfhosted.net. See §5.3                                                                                                                                                                                                                   |
| **r/selfhosted**                                                                             | **UNVERIFIED** — Reddit inaccessible this session. Sidebar rules must be checked manually                                                                                                                                                                                                            |

---

## 6. CONTENT PILLARS — what already ranks, and what to compete with

### 6.1 SERP: `free portfolio website builder` (observed 2026-08-12)

| #   | Result                                                                                                     | Type                | Owner            |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------- | ---------------- |
| 1   | [Canva — Free Portfolio Website Maker](https://www.canva.com/create/portfolios/)                           | Vendor product page | Canva            |
| 2   | [Wix — Portfolio Website Maker](https://www.wix.com/portfolio-website)                                     | Vendor product page | Wix              |
| 3   | [Portfoliobox](https://www.portfoliobox.com/)                                                              | Vendor homepage     | Portfoliobox     |
| 4   | [Aquent — Top 5 Free Portfolio Websites For Creatives](https://aquent.com/blog/top-5-free-portfolio-sites) | Listicle            | Recruitment firm |
| 5   | [Crevado](https://crevado.com/)                                                                            | Vendor homepage     | Crevado          |
| 6   | [Squarespace — Create a Portfolio Website](https://www.squarespace.com/websites/create-a-portfolio)        | Vendor product page | Squarespace      |
| 7   | [Adobe Express — Free Online Portfolio Maker](https://www.adobe.com/express/create/portfolio)              | Vendor product page | Adobe            |
| 8   | Gumroad template listing                                                                                   | Product listing     | Individual       |

**Difficulty: (b) vendor-dominated — hardest class.** Seven of eight are brand-owned pages. **No open-source tool appears at all.**

The one soft spot is #4. Analysed in full: [Aquent](https://aquent.com/blog/top-5-free-portfolio-sites), updated **2025-02-25**, staff-written with no byline, **~900–1,000 words**, covers only Wix / Adobe Portfolio / Behance / Weebly / Dribbble, **3–5 sentences per tool**, one image each, **no comparison table, no pricing, no methodology, no ranking criteria**. That is a beatable page occupying a top-5 slot on a major commercial query — but beating it requires domain authority this project will not have at launch.

### 6.2 SERP: `squarespace alternatives free` (observed 2026-08-12)

| #   | Result                                                                                                                        | Type                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | [websiteplanet.com — 6 Best Squarespace Alternatives](https://www.websiteplanet.com/blog/best-squarespace-alternatives/)      | Affiliate listicle          |
| 2   | [TechRadar — Best alternative to Squarespace](https://www.techradar.com/pro/website-building/best-alternative-to-squarespace) | Media listicle              |
| 3   | [Tooltester — 16 Squarespace Alternatives](https://www.tooltester.com/en/blog/squarespace-alternatives/)                      | Affiliate listicle          |
| 4   | [Breakdance — Squarespace Alternative](https://breakdance.com/squarespace-alternative/)                                       | **Vendor alternative page** |
| 5   | [EXPERTE.com — 15 Website Builders Reviewed](https://www.experte.com/website-builder/squarespace-alternative)                 | Affiliate listicle          |
| 6   | [Squarespace's own blog — 9 Wix Alternatives](https://www.squarespace.com/blog/wix-alternatives)                              | **Competitor's own blog**   |
| 7   | [Zapier — The 6 best Squarespace alternatives](https://zapier.com/blog/squarespace-alternatives/)                             | Media listicle              |
| 8   | [AlternativeTo — Squarespace Alternatives](https://alternativeto.net/software/squarespace/)                                   | Directory                   |

**Difficulty: (a) high-DR affiliate/media — hardest class.** Depth of the incumbents:

| Page                                                                                | Updated                    |      Words |  Tools | Author                                      | Methodology                                                                                                   | Open source?       |
| ----------------------------------------------------------------------------------- | -------------------------- | ---------: | -----: | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------ |
| [Tooltester](https://www.tooltester.com/en/blog/squarespace-alternatives/)          | 2026-02-26                 | **~8,500** | **17** | Inka Wibowo + Robert Brandl (named, bios)   | Video reviews, per-tool pricing tables, decision matrix                                                       | Only WordPress.org |
| [Website Planet](https://www.websiteplanet.com/blog/best-squarespace-alternatives/) | Jan 2026, 3 revisions      |     ~3,500 |      6 | Kamso Oguejiofor + editor Danielle Nofuente | _"I built websites with each tool"_; comparison table; 8-step migration guide; FAQ; affiliate CTAs            | **None**           |
| [Zapier](https://zapier.com/blog/squarespace-alternatives/)                         | Pub Sep 2024, upd Mar 2025 |     ~3,500 |      6 | No byline                                   | _"hours of testing and tinkering done by the Zapier team"_; no selection criteria disclosed; no pitch process | WordPress.org only |

**The gap is glaring: none of the top pages covers a modern open-source self-hosted option.** Website Planet's 6 include zero. That is a pitch, not a page — these are link/mention targets (§5.5), not SERPs to attack head-on.

Note #4 and #6: **Breakdance ranks with its own vendor alternative page, and Squarespace ranks on its competitor's alternative query with its own blog.** Vendor-owned alternative pages do rank in this niche. That validates §2's page type.

### 6.3 SERP: `open source website builder self hosted` (observed 2026-08-12) — the opportunity

| #   | Result                                                                                                                                        | Type                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 1   | [Colorlib — 7 Best Open Source Website Builders](https://colorlib.com/wp/open-source-website-builders/)                                       | Listicle                |
| 2   | [Webstudio — 3 Modern Open-Source Tools](https://webstudio.is/blog/open-source-website-builder)                                               | **Vendor content play** |
| 3   | [contenttoolkit.co — 12 Best Open Source Website Builders](https://www.contenttoolkit.co/blog/open-source-website-builders)                   | Small blog              |
| 4   | [rshweb.com — Free Self Hosted Website Builders](https://rshweb.com/blog-free-website-builder)                                                | Small blog              |
| 5   | [opensourcealternatives.to — Best Open Source Website Builders](https://www.opensourcealternatives.to/blog/best-open-source-website-builders) | Directory blog          |
| 6–7 | AlternativeTo paginated pages                                                                                                                 | Directory               |

**Difficulty: (d) thin / poorly served — the best opportunity found.**

The #1 result ([Colorlib](https://colorlib.com/wp/open-source-website-builders/)) was **published 2024-02-27** by Rok Krivec, ~4,500–5,000 words, 7 tools with a 7×9 comparison table, screenshots, pros/cons, FAQs — but **no pricing**, and the seven tools are **WordPress, Joomla, Drupal, SilverStripe, ConcreteCMS, ModX, Grav**. Every one is a legacy PHP CMS. It is **titled "2026" while being two years old**, and it mentions no modern tool — no Webstudio, no GrapesJS, no Payload, no Builder.io, nothing Node/React-based.

Meanwhile **#2 is a vendor blog post by Webstudio, a direct category peer**, ranking on its own content. That is proof that a vendor in this exact category can rank on this exact query with a blog post rather than a product page.

**This is the single most winnable commercially-relevant SERP identified in this research.**

### 6.4 Recurring listicle publishers — the outreach/link target list

Derived from the SERPs above plus §5.5. Every one of these has published a ranking article in this niche:

| Publisher                                            | Example ranking URL                                                                                                                                                                                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tooltester                                           | [squarespace-alternatives](https://www.tooltester.com/en/blog/squarespace-alternatives/)                                                                                                                                                             |
| Website Planet                                       | [best-squarespace-alternatives](https://www.websiteplanet.com/blog/best-squarespace-alternatives/), [best-open-source-website-builders](https://www.websiteplanet.com/blog/best-open-source-website-builders/)                                       |
| Zapier                                               | [squarespace-alternatives](https://zapier.com/blog/squarespace-alternatives/)                                                                                                                                                                        |
| TechRadar Pro                                        | [best-alternative-to-squarespace](https://www.techradar.com/pro/website-building/best-alternative-to-squarespace)                                                                                                                                    |
| EXPERTE.com                                          | [squarespace-alternative](https://www.experte.com/website-builder/squarespace-alternative)                                                                                                                                                           |
| Colorlib                                             | [open-source-website-builders](https://colorlib.com/wp/open-source-website-builders/)                                                                                                                                                                |
| Wbcom Designs                                        | [best-open-source-website-builders](https://wbcomdesigns.com/best-open-source-website-builders/)                                                                                                                                                     |
| Codeless                                             | [best-open-source-website-builders](https://codeless.co/best-open-source-website-builders/)                                                                                                                                                          |
| Droptica                                             | [6-best-open-source-website-builders](https://www.droptica.com/blog/6-best-open-source-website-builders/)                                                                                                                                            |
| OpenSourceAlternatives.to                            | [best-open-source-website-builders](https://www.opensourcealternatives.to/blog/best-open-source-website-builders)                                                                                                                                    |
| Dribbble content hub                                 | [best-portfolio-website-builders](https://content-hub.dribbble.com/career/best-portfolio-website-builders)                                                                                                                                           |
| Aquent                                               | [top-5-free-portfolio-sites](https://aquent.com/blog/top-5-free-portfolio-sites)                                                                                                                                                                     |
| Microweber (competitor blog, still a mention target) | [your-website-your-way](https://microweber.com/your-website-your-way-free-open-source-website-builder)                                                                                                                                               |
| Directories                                          | [AlternativeTo](https://alternativeto.net/), [GetApp](https://www.getapp.com/website-ecommerce-software/website-builder/p/open-source/), [SourceForge](https://sourceforge.net/), [Opensource.com alternatives](https://opensource.com/alternatives) |

**Opensource.com deserves special mention:** a guest post there produced Plausible's single largest conversion day (**94 trial signups**, §2.1). It maintains an [open source alternatives hub](https://opensource.com/alternatives).

### 6.5 Content pillars with supporting evidence

Each pillar below is justified by something observed in this research, not by general SEO advice.

**Pillar 1 — "Open source / self-hosted website builders" comparison hub.**
_Evidence:_ §6.3 — the #1 result is two years stale and covers only legacy PHP CMSes; the #2 result is a competitor's blog post, proving vendor content ranks here. Autocomplete confirms 10-deep demand on `open source website builder` and `self hosted website builder`.
_Format required to beat it:_ ≥7 tools, comparison table, **pricing/hosting cost**, actually-run install tests, screenshots, and modern tools the incumbent omits.

**Pillar 2 — Per-competitor alternative pages (12–15).**
_Evidence:_ §1.4 — Wix, Adobe Portfolio, Pixieset and Framer each generate an "open source"/"self hosted" autocomplete prediction. §6.2 — Breakdance and Squarespace both rank with vendor alternative pages. §2.2 — three working templates teardowned.
_Format:_ comparison table above the fold, one concession, migration path, third-party proof, 800–2,000 words, no FAQ schema.

**Pillar 3 — Original data / research.**
_Evidence:_ Google's live "original content systems" (§4.7); Google's first self-assessment question is _"Does the content provide original information, reporting, research, or analysis?"_ (§3.2); Ahrefs finds original research is what AI can't source elsewhere (§4.8); the Indie Hackers case shows original data caused listicle authors to reach out unprompted (§5.5).
_Candidate topics grounded in this dossier:_ the true annual cost of portfolio hosting across Squarespace/Wix/Adobe/Format/Pixieset; a Core Web Vitals benchmark of portfolio sites built on each platform (LCP/INP/CLS at p75 — §4.6 gives the thresholds); a platform-shutdown risk survey (read.cv, Cohost — [Wikipedia: Cohost](https://en.wikipedia.org/wiki/Cohost)); an analysis of what actually appears in hired designers' portfolios.

**Pillar 4 — Free tools / generators.**
_Evidence:_ Ahrefs states tools/calculators _"resist AI summarization"_ (§4.8); Backlinko lists ROI calculators among the ten proven programmatic templates (§3.4).
_Candidates:_ portfolio-cost calculator; OG-image generator for portfolios; a "is your portfolio site fast?" CWV checker.

**Pillar 5 — Deeply technical how-tos aimed at HN/dev audiences.**
_Evidence:_ §5.4 — every "portfolio builder" Show HN failed; the two that succeeded (180 and 78 points) were framed as _website builders with a technical angle_. Autocomplete confirms `self hosted website builder docker`, `open source website builder drag and drop`, `portfolio website builder github`.
_Candidates:_ how the no-code editor persists to a free Postgres tier; deploying a CMS to Vercel free tier with zero ongoing cost; the architecture of a drag-and-drop editor.

**Pillar 6 — Template gallery pages.**
_Evidence:_ §3.5 — the safest scaled family because each page is backed by a real live demo. `developer portfolio template` returns 10 predictions including `github`, `react`, `figma`.

**Pillar 7 — Community answers (Reddit, HN, Slant, Stack Overflow).**
_Evidence:_ §1.5 — 21 of ~45 tested seeds return a `reddit` suffix prediction. §4.8 — off-site mentions accounted for **up to 89%** of one brand's AI citations, and Reddit is among the most-cited platforms. §2.1 — Reddit sent Plausible 2,200 visits in four months from r/degoogle, r/opensource, r/webdev. **This is the highest-leverage under-instrumented channel in the dossier, and the one this research could not measure.**

### 6.6 Audience pain — what could and could not be verified

**Verified:** the read.cv shutdown is real and documented ([TechCrunch 2025-01-17](https://techcrunch.com/2025/01/17/perplexity-acquires-read-cv-a-social-media-platform-for-professionals/); data export closed 2025-05-16), and it generated migration content ([thisisarda.com](https://www.thisisarda.com/writing/every-end-is-a-new-beginning-goodby-read-cv), [LinkedIn post](https://www.linkedin.com/posts/varun-raghunathan_readcv-is-shutting-down-so-we-decided-activity-7286441520860209152-C3U-), [Product Hunt alternatives](https://www.producthunt.com/products/cv/alternatives)) — but the HN reaction was tiny (4 points), so the wave was small.

**Verified indirectly:** price sensitivity is visible in autocomplete — `squarespace alternative cheaper`, `wix alternatives cheaper`, `framer alternatives cheaper`, `website builder without subscription`, `free website builder no ads`. These are grievance-shaped queries and are the closest thing this category has to Plausible's privacy grievance.

**NOT verified — outstanding work item:** actual Reddit thread titles and verbatim complaints from r/graphic_design, r/web_design, r/photography, r/userexperience, r/webdev, r/selfhosted, r/freelance. Reddit was inaccessible to every tool available. **Do this manually — §1.5 and §4.8 both say it is the highest-value missing evidence.**

---

## 7. NON-ENGLISH / INTERNATIONAL

_(Research conducted 2026-08-12 via live autocomplete with `hl=`/`gl=` parameters, Statcounter, and in-language SERP observation. All volume figures are **UNVERIFIED** — no free tool exposed absolute volumes.)_

### 7.1 The head-term trap

**The finding that matters is head-term selection, not language selection.** The obvious "translate the English term" head terms are intent-contaminated in the two largest markets.

- **Spanish:** `crear portafolio` is **contaminated by Meta Business Suite** — its #1 prediction is `crear portafolio comercial facebook`, plus `crear portfolio comercial`, `crear portafolio comercial meta` ([probe](https://suggestqueries.google.com/complete/search?client=firefox&hl=es&q=crear+portafolio)). **`portafolio web` is the correct head term** — clean and developer-heavy: `portafolio web gratis`, `portafolio web developer`, `portafolio web programador`, `portafolio web github`, `portafolio web ejemplos` ([probe](https://suggestqueries.google.com/complete/search?client=firefox&hl=es&q=portafolio+web)).
- **Portuguese (BR):** same trap. `criar portfólio` is led by `criar portfólio empresarial facebook`/`meta` and is heavily **PDF-intent** (`criar portfólio pdf grátis`). **`site de portfólio` is the head term** — `site de portfólio gratuito`, `… pessoal`, `… programação`, `… design`, `… arquitetura` ([probe](https://suggestqueries.google.com/complete/search?client=firefox&hl=pt-BR&q=site+de+portf%C3%B3lio)).
- **Japanese:** `ポートフォリオサイト` returns 10 predictions, **all on-intent**: `作成`, `無料`, `webデザイナー`, **`エンジニア`**, `初心者`, `参考`, `デザイン` ([probe](https://suggestqueries.google.com/complete/search?client=firefox&hl=ja&q=%E3%83%9D%E3%83%BC%E3%83%88%E3%83%95%E3%82%A9%E3%83%AA%E3%82%AA%E3%82%B5%E3%82%A4%E3%83%88)). Note `ポートフォリオ 作成 無料` collides with **investing** (`投資 ポートフォリオ`) — use the `サイト` form.
- **French:** `créer un portfolio` is clean — `gratuit`, `en ligne`, `en ligne gratuit`, `professionnel`, `photographe`, `artistique` ([probe](https://suggestqueries.google.com/complete/search?client=firefox&hl=fr&q=cr%C3%A9er+un+portfolio)).
- **German:** thin. `portfolio website erstellen` returns only **4** predictions ([probe](https://suggestqueries.google.com/complete/search?client=firefox&hl=de&q=portfolio+website+erstellen)); `bewerbungshomepage` likewise 4 — real but tiny.
- **Indonesian:** high volume, **wrong intent** — `cara membuat portofolio` is dominated by document/job-application intent (`untuk melamar kerja`, `di canva`, **`di hp`** (on phone), `anak tk`). Only `cara membuat portofolio web` is website intent.
- **Turkish:** surprisingly clean — `portfolyo sitesi` → `portfolyo web sitesi`, `ücretsiz portfolyo sitesi`, `kişisel portfolyo sitesi`, `portfolyo sitesi yapmak` ([probe](https://suggestqueries.google.com/complete/search?client=firefox&hl=tr&q=portfolyo+sitesi)).
- **Vietnamese:** clean and tech-literate — `tạo portfolio website`, `tạo portfolio miễn phí`, `trên notion`, `bằng ai`.
- **Polish:** weak — Canva/school/model-portfolio dominated.
- **India (English, `gl=in`):** `free portfolio website` → `builder`, `maker`, `hosting`, `templates download`, **`free portfolio website github`**, `builder ai` ([probe](https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=in&q=free+portfolio+website)). **The unprompted GitHub prediction is direct evidence that free/OSS positioning has organic pull in this market.**

### 7.2 Market structure

| Market                     | Google share (Statcounter, July 2026)                                                                                     | EF EPI 2025           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Worldwide                  | 91.31% ([source](https://gs.statcounter.com/search-engine-market-share))                                                  | —                     |
| Brazil                     | 87.41% ([source](https://gs.statcounter.com/search-engine-market-share/all/brazil))                                       | 482 / **Low**         |
| Japan                      | 59.73% (Bing 32.07%, Yahoo! 6.55%) ([source](https://gs.statcounter.com/search-engine-market-share/all/japan))            | 446 / **Very low**    |
| Russia                     | **Yandex 72.85%, Google 25.48%** ([source](https://gs.statcounter.com/search-engine-market-share/all/russian-federation)) | 521 / Moderate        |
| Germany                    | not probed                                                                                                                | 615 / **Very high**   |
| Poland                     | not probed                                                                                                                | 600 / **Very high**   |
| France / Spain             | not probed                                                                                                                | 539 / 540 / Moderate  |
| India / Indonesia / Turkey | not probed                                                                                                                | 484 / 471 / 488 / Low |
| Mexico                     | not probed                                                                                                                | 440 / **Very low**    |

EF EPI source: [EF English Proficiency Index](https://www.ef.com/wwen/epi/) (2025 edition, 2.2M test-takers) via [Wikipedia summary](https://en.wikipedia.org/wiki/EF_English_Proficiency_Index).

Two caveats: (a) the Japan Bing figure of 32.07% is anomalously high vs history and may be a measurement artefact — **UNVERIFIED in substance**; (b) Google's _effective_ index reach in Japan is higher than 59.73% because **Yahoo! Japan runs on Google's search technology** under a 2010 licensing deal ([Search Engine Land](https://searchengineland.com/google-yahoo-deal-is-cleared-in-japan-57530)).

**The EPI column inverts the naive instinct.** Germany (615) and Poland (600) are Very High proficiency — those users read English docs fine, so localisation has the _lowest_ marginal return. Japan (446), Mexico (440), Indonesia (471), Brazil (482), India (484), Turkey (488) are where English-only leaves the most demand unserved.

**Willingness to pay:** Wix runs country-differentiated pricing; Squarespace does not — _"Wix's pricing changes depending on the country and is seemingly tied to the country's cost of living… Squarespace's pricing is the same regardless of the country"_ ([sitebuilderreport.com](https://www.sitebuilderreport.com/wix-for-global-users)). Reported Wix India plans ₹199–₹1,599/mo + 18% GST ([nimbbl.biz](https://nimbbl.biz/blog/wix-plans-india)) — **UNVERIFIED**, could not confirm on wix.com. Implication: incumbents already discount hard in price-sensitive markets, so "free" is a _smaller_ wedge in India/Brazil than in the US.

### 7.3 In-language competitive landscape

- **Spanish** — mixed: [Adobe Express ES](https://www.adobe.com/es/express/create/portfolio), [Canva](https://www.canva.com/create/portfolios/), [Weblium ES](https://es.weblium.com/crear-portafolio-digital), [GoDaddy LatAm](https://www.godaddy.com/resources/latam/crearweb/como-hacer-portafolio-digital-pasos-herramientas), regional blogs. **Not locked down.**
- **Portuguese (BR)** — **local-publisher dominated**: [Great Pages](https://blog.greatpages.com.br/post/criador-de-portfolio-online-melhores-plataformas-2026), [Neil Patel BR](https://neilpatel.com/br/blog/portfolio-online/), [UNINASSAU](https://www.uninassau.edu.br/noticias/5-plataformas-para-criar-seu-portfolio-gratuitamente), [Shopify BR](https://www.shopify.com/br/blog/site-de-portfolio-gratuito). Listicle-driven → **inclusion in existing roundups is the fast play**.
- **German** — the most brand-locked: [Squarespace DE](https://de.squarespace.com/blog/beste-portfolio-website-builder), [Shopify DE](https://www.shopify.com/de/blog/kostenlose-portfolio-website).
- **French** — mostly French-owned properties: [graphiste.com](https://graphiste.com/blog/sites-creation-portfolio-en-ligne/), [Pixartprinting FR](https://www.pixartprinting.fr/blog/sites-creer-portfolio-en-ligne/).
- **Japanese — the clearest opening.** The SERP is almost entirely **domestic**: recruiting media ([Mynavi Creator](https://mynavi-creator.jp/knowhow/article/service-to-create-a-portfolio), [Aquent Japan](https://aquent.co.jp/blog/portfolio_tools/)), web agencies, [note.com](https://note.com/). The _tools_ recommended are also local — **foriio**, **Ameba Ownd** (CyberAgent), Portfoliobox, Jimdo. **Wix/Squarespace/Adobe barely feature.**
- **Indonesian** — local hosting-affiliate and .ac.id content ([Dewaweb](https://blog.dewaweb.com/website-untuk-portofolio/)). Low-authority SERP, but low-intent traffic.

### 7.4 Google's i18n rules (primary sources)

**hreflang** — [developers.google.com/search/docs/specialty/international/localized-versions](https://developers.google.com/search/docs/specialty/international/localized-versions). The bidirectional rule is absolute:

> "If two pages don't both point to each other, the tags will be ignored. This is so that someone on another site can't arbitrarily create a tag naming itself as an alternative version of one of your pages."

Every version must reference **all** others **including itself**. ISO 639-1 language + optional ISO 3166-1 Alpha-2 region; _"Specifying the region alone is not valid"_; `UK`/`EU` are invalid (use `GB`); `x-default` _"matches any language not explicitly listed."_

**URL structure** — [managing-multi-regional-sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites):

> "Use different URLs for each language version of a page rather than using cookies or browser settings to adjust the content language on the page"

because Googlebot _"usually originates from the USA"_ and _"doesn't set Accept-Language in the request header."_ And explicitly: _"Don't use IP analysis to adapt your content."_ **For a Vercel-deployed OSS project, subdirectories (`/ja/`, `/pt-br/`, `/es/`) are the correct call.**

**How often hreflang is done wrong** — audit of **18,786 hreflang-bearing sites** (SALT.agency + NerdyData, published 2023-04-04, [Search Engine Land](https://searchengineland.com/study-31-of-international-websites-contain-hreflang-errors-395161)): **31.02%** have conflicting directives; **47.95%** omit `x-default`; **22.46%** use irregular language-region combos; **16.04%** lack self-referencing tags; **8.91%** use invalid language codes. Earlier Semrush study of 20,000 multilingual sites (2017-02-15): 58% had in-source conflicts ([Semrush](https://www.semrush.com/blog/the-most-common-hreflang-mistakes-infographic/)).

**Machine translation and spam policy — an important correction.** The current [spam policies page](https://developers.google.com/search/docs/essentials/spam-policies) mentions translation exactly once, inside the scaled-content-abuse bullet: _"…including through automated transformations like synonymizing, translating, or other obfuscation techniques), where little value is provided to users."_ **The older, more explicit "text translated by an automated tool without human review or curation before publishing" line could not be located on the current page — treat that historical wording as UNVERIFIED for 2026.** Practical read: **MT is not per-se banned; MT at scale with no human review and no added value is.** A 10-language auto-translated marketing site walks straight into it.

**Next.js App Router i18n** — [nextjs.org/docs/app/guides/internationalization](https://nextjs.org/docs/app/guides/internationalization) (docs 16.3.0, lastUpdated 2026-06-10). **There is no built-in `i18n` config key in App Router** (unlike Pages Router). Pattern: nest under `app/[lang]/`; detect locale in middleware/`proxy.js` with `Negotiator` + `@formatjs/intl-localematcher`; load JSON dictionaries server-side via `import 'server-only'`; `generateStaticParams()` to prerender each locale; read locale via `next/root-params`. Because dictionaries load in Server Components, **translation files add zero client bundle weight**. Suggested libs: `next-intl`, `next-international`, `paraglide-next`, `lingui`.

### 7.5 OSS localisation precedents — the honest answer

**No OSS project reachable in this research publishes i18n-attributed traffic or conversion numbers.**

- **Cal.com** shipped i18n 2022-09-09: _"Our application now supports over 10 languages, which have all been translated by our team and the community"_ — **no adoption or traffic metrics** ([cal.com/blog/cal-v-1-1-i18n-internationalization](https://cal.com/blog/cal-v-1-1-i18n-internationalization)).
- **freeCodeCamp** (2021-02-25) is the most instructive on cost: **310,000 words per language** in the curriculum alone; 5 Spanish contributors, 30 Chinese contributors; explicit stance — _"These are human translations by contributors from our global community – not machine translations"_ ([freecodecamp.org](https://www.freecodecamp.org/news/world-language-translation-effort/)). Later: 475 Spanish articles, 1,000+ Chinese, ~350 Portuguese ([2022 summit post](https://www.freecodecamp.org/news/the-freecodecamp-world-translation-summit-2022-join-the-translation-effort/)). **Still no traffic deltas.**

_Inference, flagged:_ the absence of published numbers plus freeCodeCamp's cost figure means the honest planning assumption is that **localisation is high-cost, slow-payback, and only works when the community carries the translation load** — arguing for translating marketing/landing/template pages first, and docs only where contributors volunteer.

### 7.6 Where the demand-to-competition ratio is best

_(Ranking is inference; the underlying observations are verified.)_

1. **Japanese — best ratio.** Clean 10-deep on-intent autocomplete including `エンジニア` and `無料`; SERP occupied by domestic recruiting media and local tools, **not** Wix/Squarespace/Adobe; EF EPI 446 (Very low) means English-only genuinely does not serve them; Google index reach effectively includes Yahoo! Japan. _Risk:_ high content-quality bar; MT will read badly and is the likeliest place to trip §3.1.
2. **Brazilian Portuguese — best volume-to-effort.** `site de portfólio` is clean and includes `gratuito`/`pessoal`/`programação`; SERP is listicle-dominated rather than brand-locked, so **placement in existing roundups beats ranking a new page**; Google 87.41%; EF EPI 482.
3. **Spanish — third, on reach not ease.** `portafolio web` is clean and explicitly developer-flavoured (`developer`, `programador`, `github`); one surface serves Spain + all LatAm; Mexico's EPI 440 (Very low) means the largest Spanish-speaking country is poorly served by English.

**Cheap test:** Turkish (`portfolyo sitesi`, EPI 488, likely unlocked SERP — _the Turkish SERP was not run_).

**Deprioritise:** German/Polish (EPI 615/600 — they read English; German autocomplete only 4 deep; German SERP is the most brand-locked); Indonesian (large demand, but Canva/PDF/mobile intent — **wrong product**); Russian (Yandex 72.85% — separate playbook); Polish (Canva/school intent).

---

## Appendix A — Raw Google Autocomplete pulls, 2026-08-12

Endpoint: `https://suggestqueries.google.com/complete/search?client=firefox&q=<seed>` (US/English unless a `hl=`/`gl=` parameter is noted in §7).

```
free portfolio website
  templates | maker | hosting | builder | templates for blogger | reddit
  | builder ai | for video editor | for photographers

free portfolio website builder
  (self) | ai | and hosting | reddit | canva | for students
  | free personal portfolio website builder | best free … | best free … reddit | free online …

open source portfolio
  website | tracker | management software | (self) | website github
  | manager | github | performance | template | builder

open source portfolio builder
  (echo only — no suggestions)

portfolio website builder
  free | ai | ai free | reddit | wix | for designers | github | for artists | photography

open source website builder
  ai | free | drag and drop | github | drag and drop free | reddit | software | linux | download

self hosted website builder
  reddit | docker | best … | ai … | free … | static … | best … reddit
  | open source self hosted website builder | self hosted no code website builder

squarespace alternative
  alternatives | … reddit | … free | … 2026 | … for photographers | … 2025
  | squarespace alternativen | … for portfolio | … cheaper | … deutschland

squarespace alternative free
  (self) | squarespace free alternative reddit

wix alternative
  alternatives | … free | … reddit | … cheaper | wix alternativen
  | wix alternative open source | … free reddit | … for portfolio | … bds | … india

wix alternative open source
  (self) | wix studio open source alternative

adobe portfolio alternative
  alternatives | … free | … reddit | best … | adobe portfolio open source alternative

pixieset alternative
  alternatives | … free | … reddit | … logo | … for video | best …
  | pixieset deutsche alternative | pixieset open source alternative
  | self hosted pixieset alternative | pixieset alternativen

framer alternative
  alternatives | … free | … reddit | framer alternative open source | framer alternativen
  | … cheaper | framer ai alternatives | alternative framer motion | framer ai alternative | best …

behance alternative
  (self) | … for portfolio | … website | … free | … reddit | … for photography
  | behance alternativen | dribbble behance alternatives | best … | behance net alternative

carrd alternative
  alternatives | … free | … reddit | … twitter | … tumblr | … for artists
  | … discord | alternative carrd co | best … | carrd website alternative

read.cv alternative
  (self) | read cv alternative reddit

webflow alternative free
  (self) | webflow free alternative reddit

free alternative to squarespace
  (self) | best free alternative to squarespace | is there a free alternative to squarespace

squarespace vs
  wix | shopify | wordpress | godaddy | square | wix pricing
  | wix vs wordpress | framer | webflow | hostinger

adobe portfolio vs
  squarespace | behance | wix | binder | framer | smugmug | combine files | pixieset | wordpress

dribbble alternative
  alternatives | … reddit | … free | … 2025 | dribbble behance alternatives
  | adobe dribbble alternative | best … | dribbble ui alternative

cargo collective alternative
  cargo collective alternatives

format alternative
  [CONTAMINATED — "format alternative word", "alternative format to pdf",
   "alternative format thesis", "alternative format dvla gov uk"]

open source alternative to
  claude code | microsoft office | photoshop | obsidian | spotify
  | notion | adobe acrobat | lightroom | (self) | figma

linktree alternative open source
  (echo only)

portfolio website for
  web developer | graphic designer | developer | software engineer | students
  | video editors | free | data analyst | artists | full stack developer

best portfolio site for
  artists | graphic designers | designers | photographers | video editor | writers
  | creatives | best site for portfolio | best font for portfolio site | best site to create portfolio for free

portfolio website for designers
  (self) | best … | for graphic designers | free … | portfolio website builder for designers
  | examples for designers | templates for designers | for ux designers
  | for product designers | free … for graphic designers

portfolio website for students
  (self) | … free | … github | … examples | … using html and css | … code
  | templates for students | templates for engineering students
  | free templates for students | examples for high school students

portfolio website for writers        → (self) | free … | for content writers | best … | examples for writers
portfolio website for photographers  → (self) | … free | best …
portfolio website for architects     → (self) | templates for architects | best …
portfolio website for video editors  → (self) | … free | best …
portfolio website for models         → (self) | free …
portfolio website for illustrators   → (echo only)
portfolio website for musicians      → (echo only)
portfolio website for teachers       → (echo only)

developer portfolio template
  (self) | free | github | free download | website | html css js
  | wordpress | figma | react | html

photography portfolio website free
  (self) | template free | templates free download | free … reddit
  | how to make photography portfolio website free
  | free photography portfolio website builder | best free photography portfolio website

how to make a portfolio website
  (self) | for free | on canva | using html and css | on github | on framer
  | for photography | on figma | on squarespace | on wix

how to make a designer portfolio
  (self) | graphic designer | fashion designer | as a game designer | product design
  | interior designer | ui ux designer | good portfolio for graphic designer
  | jewelry designer/concept artist internship | as a graphic designer

portfolio website examples
  (self) | for web developer | for students | software engineer | graphic design
  | for beginners | reddit | github | for data analyst | for computer science students

ux portfolio website
  (self) | examples | builder | template | inspiration | free | reddit | design | or pdf | ui ux …

architecture portfolio website
  (self) | examples | templates | design | free | reddit | github
  | templates free download | template free | ideas

portfolio cms
  (self) | open source | github | cms portfolio website | [+ noise: cmsa portfolio, cms portfolio process, cms portfolio upc]

headless cms portfolio     → headless cms for portfolio | best headless cms for portfolio
portfolio website builder no code → no code portfolio website builder   (1 result)
free portfolio website no code    → free no code portfolio website      (1 result)
portfolio builder open source github → (none)
nextjs portfolio cms                 → (none)
wordpress alternative portfolio      → (none)

portfolio website github pages
  (self) | using github pages | template github pages | create … | personal …

personal website builder free      → (self) | personal portfolio website builder free | ai … | best …
free website builder no ads        → (self) | best free website builder no ads
website builder without subscription → (self) | free … | best …
free website builder for artists   → (self) | … reddit | best … | for music artists | best … reddit | best … for music artists
notion portfolio                   → template | website | examples | template free | page | design | sample | builder | maker
portfolio website free hosting     → (self) | personal … | free website hosting for portfolio reddit | free portfolio website builder and hosting

best website builder for portfolio reddit
  (self) | best free website builder for portfolio reddit | … art portfolio reddit
  | … photography portfolio reddit | … ux portfolio reddit | … design portfolio reddit
  | … creative portfolio reddit | … graphic design portfolio reddit
```

## Appendix B — Hacker News category baseline (Algolia API, 2026-08-12)

Query `portfolio website builder`, `open source website builder`, `self hosted website builder`, `portfolio open source`, `read.cv`; `tags=story`:

| Story                                                                        | Points | Comments | Date       | URL                                                       |
| ---------------------------------------------------------------------------- | -----: | -------: | ---------- | --------------------------------------------------------- |
| Show HN: Makers.so — A website builder inside Figma                          |    180 |       45 | 2022-02-10 | [30286185](https://news.ycombinator.com/item?id=30286185) |
| Launch HN: Typedream (YC W20) — WYSIWYG website builder                      |     78 |       68 | 2021-11-02 | [29084309](https://news.ycombinator.com/item?id=29084309) |
| Ask HN: With nothing but an open-source portfolio, how to start job-hunting? |     91 |       48 | 2017-02-04 | [13566927](https://news.ycombinator.com/item?id=13566927) |
| Show HN: We created custom domains for read.cv with Vercel edge functions    |     29 |        4 | 2021-11-03 | [29096239](https://news.ycombinator.com/item?id=29096239) |
| Helix: A Sleek Open-Source Portfolio Website                                 |     23 |        8 | 2023-03-22 | [35267944](https://news.ycombinator.com/item?id=35267944) |
| Show HN: Open-source portfolio and blog template (Gatsby/Tailwind)           |     17 |        0 | 2020-10-19 | [24822951](https://news.ycombinator.com/item?id=24822951) |
| Show HN: Kling.to — Self-hosted email marketing                              |     10 |        2 | 2026-01-18 | [46667519](https://news.ycombinator.com/item?id=46667519) |
| Opensource Website Builder Software                                          |      7 |        2 | 2014-09-26 | [8375390](https://news.ycombinator.com/item?id=8375390)   |
| Show HN: I made a (self-hosted) Website Builder                              |      7 |        2 | 2024-01-08 | [38916236](https://news.ycombinator.com/item?id=38916236) |
| Show HN: Open-Source Website Builder for Gumroad Products                    |      5 |        2 | 2024-06-17 | [40704155](https://news.ycombinator.com/item?id=40704155) |
| Ask HN: Open-source website builders for animated sites like Higgsfield?     |      4 |        0 | 2026-07-06 | [48802983](https://news.ycombinator.com/item?id=48802983) |
| Show HN: I made a 1 minute portfolio website builder for designers and devs  |      4 |        0 | 2025-05-22 | [44059362](https://news.ycombinator.com/item?id=44059362) |
| Read.cv is winding down, joining Perplexity                                  |      4 |        2 | 2025-01-18 | [42746728](https://news.ycombinator.com/item?id=42746728) |
| Show HN: Free no-code website portfolio builder                              |      2 |        0 | 2021-07-27 | [27975289](https://news.ycombinator.com/item?id=27975289) |
| SHOW HN Open-Source NextJS Website Builder                                   |      1 |        0 | 2025-02-26 | [43186546](https://news.ycombinator.com/item?id=43186546) |
| Show HN: A one-click Read.CV alternative                                     |      1 |        0 | 2025-08-29 | [45066698](https://news.ycombinator.com/item?id=45066698) |

## Appendix C — Outstanding research (not completed)

| Gap                                                                                                                                                        | Why it matters                                                                                                                                                                                   | How to close it                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Reddit thread titles + verbatim complaints** across r/graphic_design, r/web_design, r/photography, r/userexperience, r/webdev, r/selfhosted, r/freelance | §1.5 shows 21/45 seeds carry "reddit" intent; §4.8 shows Reddit is among the most-cited LLM sources; §2.1 shows Reddit sent Plausible real traffic. **This is the largest single evidence gap.** | Manual browsing; Reddit is blocked to every tool used here                                                                               |
| **Absolute search volumes** for every term in §1                                                                                                           | All demand sizing is currently relative                                                                                                                                                          | Google Ads Keyword Planner (free with an account), or a trial of Ahrefs/Semrush                                                          |
| **Google "People Also Ask"** for the head terms                                                                                                            | Direct source of question-shaped content briefs                                                                                                                                                  | Manual SERP inspection                                                                                                                   |
| r/selfhosted self-promotion rules and subscriber count                                                                                                     | Determines whether launch posting is viable there                                                                                                                                                | Read the sidebar manually                                                                                                                |
| Google-Extended canonical docs URL                                                                                                                         | The dedicated doc 404'd; only the 2023 announcement is confirmed                                                                                                                                 | Search Google Search Central directly                                                                                                    |
| The verbatim Aug-2023 HowTo/FAQ announcement text                                                                                                          | Absence from the search gallery is confirmed; the announcement's exact device-level wording is not                                                                                               | Retry [developers.google.com/search/blog/2023/08/howto-faq-changes](https://developers.google.com/search/blog/2023/08/howto-faq-changes) |
| Turkish SERP composition                                                                                                                                   | Named as a cheap-test market on autocomplete evidence alone                                                                                                                                      | Run the SERP                                                                                                                             |
| Cal.com / Dub / Umami alternative-page traffic attribution                                                                                                 | Frequently asserted in SEO blogs; **no primary evidence found**                                                                                                                                  | Likely does not exist publicly                                                                                                           |
