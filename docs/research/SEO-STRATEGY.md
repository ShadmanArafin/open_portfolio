# SEO & Content Strategy

**Status:** decision-ready. **Written:** 2026-08-12. **Evidence:** [`_raw-seo.md`](./_raw-seo.md) — every claim below traces there, and source URLs are carried forward inline.
**Product state assumed:** v0.5.0, repository private, zero stars, no domain, no marketing site.

Anything marked **UNVERIFIED** could not be confirmed by the research and must not be quoted as fact — including every monthly search-volume figure, everywhere, because no free tool exposed absolute volumes.

---

## 1. The findings that change the plan

### 1.1 Our own category name is not a search query

`open source portfolio builder` returns **one** Google autocomplete prediction — an echo of itself. `portfolio builder open source github` returns **zero**. `nextjs portfolio cms` returns **zero**. Google serves predictions only for queries with non-trivial volume, so this is a real signal, not a sampling artefact.

Meanwhile `open source website builder` and `self hosted website builder` both return a full ten.

**Consequence:** the phrase we would naturally use to describe ourselves has no traffic behind it. We rank for _website builder_ qualified by _open source_ or _self hosted_, and we reach portfolio-seekers through profession and brand-alternative pages instead. The word "portfolio" is a product promise and a conversion word. It is not, at the top of the funnel, a ranking word.

### 1.2 Two audiences, two vocabularies, and they never overlap

| Population              | What they type                                                                                                                        | What they never type         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Non-technical creatives | `free portfolio website builder`, `portfolio website for <profession>`, `best portfolio site for <profession>`, `<brand> alternative` | "open source", "self-hosted" |
| Technical / prosumer    | `open source website builder`, `self hosted website builder`, `portfolio cms open source`, `self hosted no code website builder`      | "portfolio builder"          |

This is the central structural problem. Handled badly it produces pages that read as keyword soup and convert nobody. §2 sets out how to handle it.

### 1.3 There is exactly one genuinely winnable commercial SERP, and its incumbent is two years stale

The #1 result for `open source website builder` / `open source website builder self hosted` is [Colorlib's "7 Best Open Source Website Builders"](https://colorlib.com/wp/open-source-website-builders/) — **published 2024-02-27**, titled for 2026, ~4,500–5,000 words, and covering **WordPress, Joomla, Drupal, SilverStripe, ConcreteCMS, ModX and Grav**. Seven legacy PHP CMSes. No pricing. No modern tool of any kind — no Webstudio, no GrapesJS, no Payload, no Builder.io.

The #2 result is [Webstudio's own blog post](https://webstudio.is/blog/open-source-website-builder) — a direct category peer ranking on this exact query with a blog post rather than a product page.

That combination is unusual and it is the most valuable thing in the dossier: an under-served head term where a vendor in our category has already proven vendor content ranks.

### 1.4 Four brands have already told Google that people want an open-source version of them

Autocomplete generates an "open source" or "self hosted" qualified prediction, unprompted, for exactly four brands:

| Brand           | Predictions returned for base query | The qualified prediction                                                 |
| --------------- | ----------------------------------: | ------------------------------------------------------------------------ |
| Wix             |                                  10 | `wix alternative open source` (and `wix studio open source alternative`) |
| Adobe Portfolio |                                   5 | `adobe portfolio open source alternative`                                |
| Pixieset        |                                  10 | `pixieset open source alternative`, `self hosted pixieset alternative`   |
| Framer          |                                  10 | `framer alternative open source`                                         |

These are pre-qualified demand for our exact positioning, with essentially no competition on the qualified variant. They are the beachhead. Note also that `open source alternative to` returns ten predictions (`claude code`, `microsoft office`, `photoshop`, `obsidian`, `spotify`, `notion`, `adobe acrobat`, `lightroom`, `figma`) — the frame is proven, and **no website-builder brand has claimed it yet**.

### 1.5 The launch story must be a website builder with a technical angle, never a portfolio builder

Hacker News history for this category (Algolia API, 2026-08-12):

| Framing                       | Story                                                                                                                        |  Points |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------: |
| Website builder, novel angle  | [Show HN: Makers.so — A website builder inside Figma](https://news.ycombinator.com/item?id=30286185)                         | **180** |
| Website builder, YC launch    | [Launch HN: Typedream (YC W20) — WYSIWYG website builder](https://news.ycombinator.com/item?id=29084309)                     |  **78** |
| Portfolio framing             | [Show HN: I made a 1 minute portfolio website builder for designers and devs](https://news.ycombinator.com/item?id=44059362) |       4 |
| Portfolio framing             | [Show HN: Free no-code website portfolio builder](https://news.ycombinator.com/item?id=27975289)                             |       2 |
| Portfolio framing             | [Show HN: A one-click Read.CV alternative](https://news.ycombinator.com/item?id=45066698)                                    |       1 |
| Self-hosted builder, no angle | [Show HN: I made a (self-hosted) Website Builder](https://news.ycombinator.com/item?id=38916236)                             |       7 |
| Open-source Next.js builder   | [SHOW HN Open-Source NextJS Website Builder](https://news.ycombinator.com/item?id=43186546)                                  |       1 |

Every post framed as a portfolio tool has failed. This is not a small sample of one bad title; it is the whole visible history of the category on HN. §5.3 turns it into a concrete title rule.

**In one sentence:** we win the technical SERPs with a comparison hub and a self-hosted product page, we win the creative demand through brand-alternative pages, and we do not fight for the head terms that Canva, Wix and Squarespace own.

---

## 2. The two-vocabulary problem, solved by URL rather than by sentence

The temptation is to write one page that says "free open-source self-hosted no-code portfolio website builder". That page ranks for nothing, reads as spam, and fails Google's own helpful-content test (§4.2).

**The rule: one vocabulary per URL. Never blend inside a paragraph.**

| Surface                               | Vocabulary                                      | Primary audience             | Job                                                                           |
| ------------------------------------- | ----------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| Homepage `/`                          | Technical framing, creative promise             | Both                         | Classification and conversion, not ranking                                    |
| `/open-source-website-builders`       | Technical only                                  | Prosumer, self-hoster        | Rank for the winnable head term                                               |
| `/self-hosted-website-builder`        | Technical only                                  | Self-hoster                  | Rank for `self hosted website builder`, `self hosted no code website builder` |
| `/alternatives/<brand>`               | Brand vocabulary, "open source" as the _reason_ | Creative                     | Capture qualified alternative demand                                          |
| `/portfolio-website-for-<profession>` | Creative only                                   | Creative                     | Later; gated on artefacts (§4.4)                                              |
| GitHub README / About                 | Technical                                       | Developers, listicle writers | Discovery and classification                                                  |
| Directory listings                    | Technical                                       | Both                         | Third-party authority                                                         |

**The homepage is the exception, deliberately.** It is not a ranking vehicle — the hub and product pages are. Its two jobs are conversion for both audiences and _five-second classification by a listicle author_ (§6.3: outreach only works if a skimming writer can categorise you instantly). So the homepage may use the category description `open source portfolio website builder` even though nobody searches it, provided the exact strings **"open source website builder"** and **"self-hosted"** also appear prominently and in plain sight.

**The bridge sentence matters more than any keyword.** The SEO entry point is technical; the product promise is not. Somewhere above the fold there must be a line that translates: _you do not need to understand any of this — click one button and you have a site you own_. That sentence is what stops the technical framing from repelling the actual users.

**One canonical description string, used everywhere.** The dossier found that a GitHub repo page carries no `<meta name="robots">` and that its description tag is literally the About field — **Google's snippet for our repository is whatever we type in About**. That same string should be the meta description, the awesome-list entry, the directory submissions and the HN self-description. Draft it once, this week. It must contain "open source", "self-hosted" and "portfolio website" verbatim, and stay short enough to survive as a search snippet.

---

## 3. Product decisions that came out of SEO research

These are not SEO footnotes. Two of them are gates on whole distribution channels and one is a launch-blocking framing decision.

### 3.1 The Docker path — closed, and now open

**Resolved while this document was being written.** The finding was correct when
the research ran: there was no `Dockerfile`, no `docker-compose.yml` and no
`.dockerignore`, while the README's backend table already advertised Docker as a
supported use case — promising the deployment story without shipping the file
that makes it true.

A `Dockerfile`, `docker-compose.yml` and `.dockerignore` now exist and are
verified end to end: the image builds at 302MB, runs non-root, passes its own
health check, and — the part that matters for the claim — the container was
destroyed and recreated against the same volume, after which the owner and all
content were still there. `output: 'standalone'` was enabled, and the local
storage adapter gained `OPB_DATA_DIR`, without which a rebuild would have
silently deleted the owner's site because it wrote to `process.cwd()`.

The rest of this section stands: the eligibility rules, the tag trap and the
submission target are unchanged, and the four returns still apply.

[awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) has **312,028 stars**. Its [CONTRIBUTING.md](https://github.com/awesome-selfhosted/awesome-selfhosted-data/blob/master/CONTRIBUTING.md) excludes, verbatim, _"Software that depends on a specific cloud provider"_.

Our headline install path is a Vercel Deploy button that provisions Neon and Vercel Blob. Read literally by a maintainer, that is a cloud-provider dependency. The `README` already documents a local-filesystem backend and "any Postgres", so the capability exists — but the _documented, first-class self-host path_ does not, and a reviewer will judge the README, not the adapter registry.

**Decision required: ship a Dockerfile and a `docker-compose.yml` that stand up the app plus Postgres in one command, and give them their own README section with working installation instructions** (also a stated requirement of the [PR template](https://github.com/awesome-selfhosted/awesome-selfhosted-data/blob/master/.github/PULL_REQUEST_TEMPLATE.md)). This is a product decision with four separate returns:

1. It is the entry ticket to awesome-selfhosted, [selfh.st](https://selfh.st/submit/) and Self-Host Weekly, and r/selfhosted.
2. `self hosted website builder docker` is a live autocomplete prediction — it is a query, not just a feature.
3. It makes the HN framing in §5.3 defensible; a "self-hosted" claim that turns out to mean "deploy to Vercel" is exactly what HN commenters punish.
4. It removes the honesty problem in every alternative page's "you own this" argument.

Two further traps in the same list, both cheap to avoid:

- **Do not file under static site generators.** `tags/static-site-generators.yml` carries a `redirect:` to staticgen.com, and per CONTRIBUTING _"if this is set, no software items will be allowed to reference this tag"_. **Positioning as an SSG makes us ineligible.** File under _Content Management Systems (CMS)_.
- **Submissions go to [awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data)**, one YAML file per project, one item per PR, merged at least ~1 week after approval. There is **no minimum-star rule** (verified by full-text read). There _is_ a rule that the project must have been _"first released more than 4 months ago"_ — see §3.2.

### 3.2 The four-month clock starts the day the repository goes public, not the day the marketing site ships

awesome-selfhosted requires four months since first release. sindresorhus/awesome requires a list to have _"been around for at least 30 days"_. [AlternativeTo's FAQ](https://alternativeto.net/faq/) says _"a new app usually sits in our backlog for at least a few months"_ on the free path.

None of these clocks start until we are public. **Going public is therefore the single highest-leverage scheduling decision available, and it is independent of whether the marketing site exists.** Publish the repository and cut a tagged release in week 1; the site can follow.

### 3.3 The demo instance is an SEO asset, not a nice-to-have

A public, permanently-live demo is a prerequisite for: template gallery pages (§4.4), every alternative page's screenshots, [awesome-github-pages-portfolios](https://github.com/guilyx/awesome-github-pages-portfolios) (template-oriented, submit a demo site), and [developer-portfolios](https://github.com/emmabostian/developer-portfolios) (25,978 stars, **lists individual portfolios rather than tools** — the only way in is via our own demo site as a portfolio).

### 3.4 Roadmap items 0.6 and 0.9 are SEO-gating

Profession pages and template gallery pages are the two safest scaled families, but only because each page is backed by a real artefact. Right now there is **one visual theme** and six vocabulary packs in `src/cms/data/professions.ts` (designer, developer, photographer, writer, student, other) that change wording only.

- Themes 2–6 land in **0.6** → template gallery pages unlock then.
- Full profession presets land in **0.9** → profession pages unlock then.

A profession page today would be backed by section-label renaming alone. That is on the wrong side of Google's doorway-abuse line (§4.2). Building them early is the most likely way to damage the site.

### 3.5 We cannot honestly claim the SoftwareApplication rich result yet

`SoftwareApplication` requires `name`, `offers.price` (set `"0"`) **and either `aggregateRating` or `review`** ([docs](https://developers.google.com/search/docs/appearance/structured-data/software-app)). We have no genuine ratings. Emit the type anyway for entity clarity, omit the rating, and revisit when a real ratings source exists. Do not invent ratings.

---

## 4. The page plan, ranked

Ranked by winnability × value. Winnability is judged against the SERP occupants actually observed on 2026-08-12; value is judged on commercial intent and reuse. Both scores are **judgement, not measurement** — no absolute volumes exist for any term here.

| #   | Page                                                                           | Target query                                                           | Win | Value | Verdict                                                       |
| --- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | :-: | :---: | ------------------------------------------------------------- |
| 1   | GitHub repo surface (About, topics, README, social preview)                    | `website-builder` topic, `in:readme` search, brand                     |  5  |   5   | **Week 1.** Zero-cost, already-owned surface                  |
| 2   | `/open-source-website-builders` — comparison hub                               | `open source website builder`, `+ self hosted`                         |  4  |   5   | **Weeks 3–5.** The single most winnable commercial SERP found |
| 3   | `/self-hosted-website-builder` — product page                                  | `self hosted website builder`, `self hosted no code website builder`   |  4  |   4   | **Weeks 3–5**                                                 |
| 4   | `/alternatives/wix`                                                            | `wix alternative open source`                                          |  4  |   4   | **Weeks 6–8**                                                 |
| 5   | `/alternatives/adobe-portfolio`                                                | `adobe portfolio open source alternative`                              |  4  |   4   | **Weeks 6–8**                                                 |
| 6   | `/alternatives/pixieset`                                                       | `pixieset open source alternative`, `self hosted pixieset alternative` |  5  |   3   | **Weeks 6–8**                                                 |
| 7   | `/alternatives/framer`                                                         | `framer alternative open source`                                       |  4  |   3   | **Weeks 6–8**                                                 |
| 8   | Original-data study                                                            | Link and citation magnet, no target query                              |  3  |   5   | **Weeks 9–11**                                                |
| 9   | `/docs/self-hosting-with-docker`                                               | `self hosted website builder docker`                                   |  4  |   3   | With the Dockerfile                                           |
| 10  | `/blog/<architecture piece>`                                                   | HN and dev.to distribution, `portfolio website builder github`         |  3  |   4   | Week 12, paired with Show HN                                  |
| 11  | `/alternatives/{squarespace,carrd,behance}`                                    | `<brand> alternative` unqualified                                      |  2  |   4   | After the first four prove out                                |
| 12  | Template gallery pages                                                         | `developer portfolio template` and variants                            |  4  |   3   | **Blocked on 0.6**                                            |
| 13  | `/portfolio-website-for-{students,developers,designers,writers,photographers}` | `portfolio website for <X>`                                            |  3  |   4   | **Blocked on 0.9**                                            |

### 4.1 The four pages that matter first

#### 1. GitHub repository surface

**Target:** the `website-builder` topic page, `in:readme` search, and the repo's own Google snippet.

**Why winnable at zero authority:** topic pages rank by stars, and the arbitrage is enormous. Live counts, 2026-08-12: `nextjs` 177,082 repos; `portfolio` 73,048; `self-hosted` 27,697 — but **`website-builder` 626**, **`page-builder` 313**, **`portfolio-builder` 79**, **`open-source-alternative` 41**. A new repo is invisible on the first group and can reach page one of the second with modest stars. `website-builder` is the highest-value winnable topic; its incumbents (Halo 39.5k, GrapesJS 26.1k, Webstudio 8.8k) are genuine category peers. Separately, [github.com/robots.txt](https://github.com/robots.txt) disallows `/stargazers`, `/forks`, `/commits/`, `/pulse`, `/network`, `/tree/` and `/gist/` but **not** `/<owner>/<repo>` root pages or `/topics/*` — both are crawlable.

**Where the current state is weak:** the repository is private and has no About string, no topics and no social preview.

**What it must contain:**

- The 20-topic slate: `website-builder`, `page-builder`, `portfolio`, `portfolio-website`, `personal-website`, `developer-portfolio`, `portfolio-template`, `cms`, `headless-cms`, `no-code`, `self-hosted`, `nextjs`, `react`, `typescript`, `vercel`, `open-source-alternative`, `jamstack`, `resume`, `static-website`, `hacktoberfest`. (Rules: [max 20 topics, lowercase, hyphens, ≤50 chars](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics).)
- The canonical description string in About (§2).
- A [social preview image](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview) at 1280×640, under 1 MB. Without one, shared links expand to _"basic information about the repository and the owner's avatar"_.
- README restructured around the **under-served** sections. Prana et al. ([arXiv:1802.06997](https://arxiv.org/abs/1802.06997), 4,226 sections across 393 repos) found _"information discussing the 'What' and 'How' of a repository is very common, while many README files lack information regarding the purpose and status of a repository"_ — so **"why this exists"** and **"project status"** are the differentiators. Our README already has an unusually honest "What does not work yet"; keep it, and add the "why".
- Treat README work as **conversion optimisation, not growth**: [arXiv:2502.18440v2](https://arxiv.org/html/2502.18440v2) finds no clear causal evidence that adding README/CONTRIBUTING files drives contributor growth, and Venigalla & Chimalakonda ([arXiv:2206.10772](https://arxiv.org/abs/2206.10772)) is correlational only.
- **UNVERIFIED counter-signal:** community threads report GitHub sometimes injecting `noindex` for new or low-activity accounts ([discussion 156489](https://github.com/orgs/community/discussions/156489), [197474](https://github.com/orgs/community/discussions/197474)); not reproducible on established repos. Worth checking with `site:` once public.

#### 2. `/open-source-website-builders` — the comparison hub

**Target:** `open source website builder`, `open source website builder self hosted`, `best open source website builders`. Autocomplete depth 10 on the head term, with `ai`, `free`, `drag and drop`, `github`, `reddit`, `software`, `linux`, `download`.

**Why winnable at zero authority:** the SERP is classified in the dossier as _"thin / poorly served — the best opportunity found"_, and the #2 slot is already held by a category peer's blog post, which proves a vendor with no listicle authority can rank here. Google's **site diversity system** is live, which limits how many results one domain can hold, and the **original content systems** reward primary sourcing — both favour a page built on tests we actually ran.

**Incumbent and where it is weak:** [Colorlib](https://colorlib.com/wp/open-source-website-builders/), published **2024-02-27** and titled for 2026. Seven tools, all legacy PHP CMSes (WordPress, Joomla, Drupal, SilverStripe, ConcreteCMS, ModX, Grav). It has a 7×9 comparison table, screenshots, pros/cons and FAQs, but **no pricing at all** and **no modern tool of any kind**. The remaining SERP is small blogs ([contenttoolkit.co](https://www.contenttoolkit.co/blog/open-source-website-builders), [rshweb.com](https://rshweb.com/blog-free-website-builder)), a directory blog ([opensourcealternatives.to](https://www.opensourcealternatives.to/blog/best-open-source-website-builders)) and paginated AlternativeTo pages.

**What our page must contain to beat it:**

- **At least ten tools including the modern ones the incumbent omits** — Webstudio, GrapesJS, Payload, Builder.io, Silex, Frappe Builder, Ycode, Halo — alongside the legacy CMSes for completeness. Coverage of what the incumbent missed is the entire thesis of the page.
- **Real total cost of ownership per tool**, including hosting, which Colorlib has for none of them. This is the strongest single differentiator available.
- **Installs actually run**, with time-to-first-published-page recorded per tool and our own screenshots. This is what makes the page survive Google's _"Does the content provide original information, reporting, research, or analysis?"_ test (§4.2).
- **A named author, a real date, and a stated methodology.** Colorlib's biggest tell is a 2024 page wearing a 2026 title; ours must show its work.
- **Ourselves included, disclosed, and not ranked first.** Webstudio does exactly this at #2. Concede where competitors are better (§5.2) — a roundup that concludes we win everything is not credible and will not be cited.
- **Visible FAQs, no FAQ markup** (§7.2).
- 3,000–5,000 words is the observed band for this format.

#### 3. `/self-hosted-website-builder` — the product page

**Target:** `self hosted website builder` (10 predictions), `self hosted no code website builder`, `open source self hosted website builder`, `free self hosted website builder`, `best self hosted website builder`.

**Why winnable:** `self hosted no code website builder` is described in the dossier as _"the closest thing to an exact-match query for this product that exists in Google's prediction set"_. Volume is unknown and probably small (**UNVERIFIED**), but competition is near-zero and the intent is perfectly matched.

**Incumbent weakness:** the same thin cluster as the hub, plus AlternativeTo pagination. Nobody owns the "no code" qualifier.

**What it must contain:** the Docker install path front and centre; the "your data, your database" argument with the actual backend table from the README; the one-command quickstart; an honest statement of what self-hosting costs in time; a comparison against _hosted_ alternatives on ownership rather than features. Keep it distinct from the hub — the hub is a roundup, this is the product. Distinct H1s, cross-linked. If both start ranking for the same query, merge them.

#### 4–7. The four alternative pages

**Targets, in build order:** `wix alternative open source` → `adobe portfolio open source alternative` → `pixieset open source alternative` / `self hosted pixieset alternative` → `framer alternative open source`.

**Why winnable:** each is a live Google prediction, so demand is non-zero; each has thin autocomplete depth, which means low volume (**magnitude UNVERIFIED**) _and_ low competition. Crucially, the unqualified versions of these queries are owned by [Tooltester](https://www.tooltester.com/en/blog/squarespace-alternatives/) (~8,500 words, 17 tools, named authors with bios, video reviews, updated 2026-02-26), [Website Planet](https://www.websiteplanet.com/blog/best-squarespace-alternatives/) (~3,500 words, named author plus editor, 8-step migration guide) and [Zapier](https://zapier.com/blog/squarespace-alternatives/) — unwinnable. The _qualified_ versions are empty.

**Where the incumbents are weak:** none of the top pages on `squarespace alternatives free` covers a modern open-source self-hosted option. Website Planet's six alternatives include zero; Tooltester's seventeen include only WordPress.org; Zapier's six include only WordPress.org. **That gap is a pitch (§6.3), not a page** — but it also means the qualified queries have no serious answer at all.

**Proof the page type ranks in this niche:** on `squarespace alternatives free`, position 4 is [Breakdance's own vendor alternative page](https://breakdance.com/squarespace-alternative/) and position 6 is [Squarespace's own blog ranking on a competitor's alternative query](https://www.squarespace.com/blog/wix-alternatives). Vendor-owned alternative pages demonstrably rank here.

**What each must contain:** see §5.2 — the skeleton is derived from three teardowns and is the same every time.

### 4.2 Do not attempt these yet

| Query / page                                                                                                                                                           | Why not                                                                                                                                                                                                                                                                                                                                                                                                                                             | What would change it                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `free portfolio website builder`, `portfolio website builder`, `best free portfolio website builder`                                                                   | Seven of the top eight are brand-owned vendor pages: [Canva](https://www.canva.com/create/portfolios/), [Wix](https://www.wix.com/portfolio-website), [Portfoliobox](https://www.portfoliobox.com/), [Crevado](https://crevado.com/), [Squarespace](https://www.squarespace.com/websites/create-a-portfolio), [Adobe Express](https://www.adobe.com/express/create/portfolio). No open-source tool appears at all. A new domain does not enter this | Years of authority. The soft spot is #4, [Aquent's ~900-word listicle](https://aquent.com/blog/top-5-free-portfolio-sites) with no byline, no table, no pricing and no methodology — beatable content, but not from zero authority |
| `squarespace alternatives`, `wix alternatives`, `squarespace vs wix`                                                                                                   | High-DR affiliate and media, deeply resourced (§4.1)                                                                                                                                                                                                                                                                                                                                                                                                | These are **outreach targets**, not SERPs. Get mentioned in them (§6.3)                                                                                                                                                            |
| `read.cv alternative`                                                                                                                                                  | The migration wave is over and was never large: read.cv wound down after the [Perplexity acquisition](https://techcrunch.com/2025/01/17/perplexity-acquires-read-cv-a-social-media-platform-for-professionals/), data export closed 2025-05-16, the top HN thread scored **4 points** and someone's "one-click Read.CV alternative" Show HN scored **1**                                                                                            | Nothing. Deprioritise permanently                                                                                                                                                                                                  |
| `linktree alternative open source`, `open source portfolio builder`, `portfolio builder open source github`, `nextjs portfolio cms`, `wordpress alternative portfolio` | Zero or echo-only autocomplete. No measurable demand                                                                                                                                                                                                                                                                                                                                                                                                | Nothing                                                                                                                                                                                                                            |
| "Format" brand alternative page                                                                                                                                        | The query is contaminated by "file format" and "alternative format" (accessibility, DVLA). **Unusable as a brand term**                                                                                                                                                                                                                                                                                                                             | Nothing                                                                                                                                                                                                                            |
| Cargo Collective alternative                                                                                                                                           | 1 prediction. Thin                                                                                                                                                                                                                                                                                                                                                                                                                                  | Nothing                                                                                                                                                                                                                            |
| Profession pages                                                                                                                                                       | One theme exists; vocabulary packs rename sections only. Without a profession-specific artefact this is Google's doorway-abuse example verbatim                                                                                                                                                                                                                                                                                                     | Ship 0.6 themes and 0.9 presets                                                                                                                                                                                                    |
| `<profession> portfolio examples`                                                                                                                                      | Would require curating real third-party sites; high effort; competes with Behance and Dribbble                                                                                                                                                                                                                                                                                                                                                      | Later, if the template gallery gives us a corpus                                                                                                                                                                                   |
| `<city>` / `<country>` pages                                                                                                                                           | No evidence of demand; textbook doorway abuse                                                                                                                                                                                                                                                                                                                                                                                                       | Never build these                                                                                                                                                                                                                  |
| Localisation (ja, pt-BR, es)                                                                                                                                           | See §9                                                                                                                                                                                                                                                                                                                                                                                                                                              | An English site that is already working                                                                                                                                                                                            |

---

## 5. The "&lt;brand&gt; alternative" play

### 5.1 The evidence, and its honest limits

Plausible Analytics is the best-documented open-source "alternative to X" growth story available, because they published first-party numbers.

- **Google traffic: 143 monthly visitors (March 2020) → 7,167 (January 2021)** — ten months, publishing _"approximately once per week"_, building 32 blog posts, full docs and **15 product pages focused on differentiation**. MRR over the same window went **$400 → $10,000+** ([seobuddy.com](https://seobuddy.com/blog/my-seo-journey-marko-saric/)).
- **The positioning change:** in April 2020 they _"decided to pick a fight"_ and rewrote the homepage from _"Simple analytics for your website"_ to _"Simple and privacy-friendly alternative to Google Analytics"_ ([plausible.io/blog/open-source-saas](https://plausible.io/blog/open-source-saas), [startup-marketing](https://plausible.io/blog/startup-marketing)).
- **Their keyword research method, stated verbatim:** Google autocomplete, "People also ask", and "Searches related to" — the same free method that produced the dossier.
- **Channel mix, first four months:** Hacker News 43,600 visits; Twitter 10,000; Facebook 6,400; **Google Search 6,300**; Indie Hackers 4,800; **GitHub 2,700**; Hacker Newsletter 2,600; LWN.net 2,600; **Reddit 2,200** (r/degoogle, r/opensource, r/webdev); Dev.to 2,200. Google was sixth by volume but had the **longest visit duration (3+ min)**.
- **Single events:** an HN front-page post → **25,000+ visitors in a day**; another → **35,000+**; a guest post on [Opensource.com](https://opensource.com/alternatives) → **94 new trial signups in one day**, their largest single-day conversion spike; Dev.to syndication → **12,000+ views**.

**Three caveats, all material:**

1. These are self-reported numbers from a paid analytics vendor blogging about its own growth. First-party and specific, but not independent.
2. **Cal.com, Dub and Umami have published no traffic attribution for their alternative pages.** Any claim that alternative pages drove N% of their signups is **UNVERIFIED** and should never be repeated.
3. **We have no single villain.** Plausible worked partly because Google Analytics is one dominant incumbent with a live grievance. Our market is fragmented across Squarespace, Wix, Adobe Portfolio, Format, Pixieset, Carrd, Framer and Behance. The nearest equivalent grievance is **subscription cost and platform shutdown risk**, which is visible in autocomplete — `squarespace alternative cheaper`, `wix alternatives cheaper`, `framer alternatives cheaper`, `website builder without subscription`, `free website builder no ads` — but it is diffuse. That is an inference, flagged as one.

**A related fact from the sibling dossier, worth knowing before we cite Cal.com as a peer:** [`_raw-oss-marketing.md`](./_raw-oss-marketing.md) records that Cal.com **moved its main codebase to closed source on 14–15 April 2026** ([announcement](https://cal.com/blog/cal-com-goes-closed-source-why), [technical follow-up](https://cal.com/blog/cal-diy-open-source-to-closed-source), [HN: 391 points](https://news.ycombinator.com/item?id=47780456)), spinning out an MIT-licensed community fork. Cal.com's `/calcom-vs-calendly` page remains a useful structural teardown, but it can no longer be cited as an open-source success story — and the event itself makes "open source is a promise, and here is ours in writing" a live, topical argument rather than boilerplate.

### 5.2 The page skeleton, derived from three teardowns

| Element                         | [Plausible /vs-google-analytics](https://plausible.io/vs-google-analytics) | [Ghost /vs/squarespace/](https://ghost.org/vs/squarespace/) | [Cal.com /calcom-vs-calendly](https://cal.com/calcom-vs-calendly) |
| ------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| Length                          | ~1,800–2,000 words                                                         | ~1,200–1,400                                                | ~800–900                                                          |
| Comparison table above the fold | 7 rows                                                                     | Yes, open source as a row                                   | 13+ rows                                                          |
| Named third-party proof         | DHH, John O'Nolan                                                          | Yes                                                         | Deel, with a 15% close-rate lift; Trustpilot 4.7 vs 3.1           |
| Concession section              | Yes — names what GA4 does better                                           | Yes                                                         | **No** — reads as more adversarial                                |
| Switching-cost removal          | Historical data import                                                     | Pricing-delta argument                                      | _"We'll pay your Calendly bill"_                                  |
| Open source as the argument     | Secondary                                                                  | A table row                                                 | Barely used; self-hosting is a GitHub link                        |

**Our required elements** (synthesis, flagged as inference):

1. H1 naming both products **and the reason to switch**.
2. Comparison table above the fold — not buried.
3. At least one honest concession. Two of the three concede; the one that does not reads as adversarial.
4. Switching-cost removal is the conversion lever. For us that is a **migration guide plus, where feasible, an importer**. This is the single most valuable thing to build and the one most likely to be skipped.
5. Third-party proof with names — which we do not have yet, and which should be collected from the first real users rather than fabricated.
6. **800–2,000 words.** None of these pages is a 5,000-word monster.
7. Visible FAQ content, **no FAQPage markup** (§7.2).
8. Multiple CTAs: Plausible runs four "start" CTAs plus two demo links.

### 5.3 Two distribution notes attached to this play

**Directory submission is the cheapest distribution available.** [OpenAlternative](https://openalternative.co/submit) has an explicit `### Website Builders` section (Frappe Builder, Silex, WordPress, Ycode), auto-generates the [6,561-star awesome list](https://github.com/piotrkulpinski/openalternative) from its own database, and has a 12K newsletter — **one submission lands in both**, the highest single-submission ROI identified. [AlternativeTo](https://alternativeto.net/manage/new/) already ranks organically on `squarespace alternatives` and hosts a [Portfolio Website feature tag](https://alternativeto.net/feature/portfolio-website/); the free queue is _"at least a few months"_ but **$5 priority review is 1–2 business days**. Pay it.

**The HN title rule, from §1.5.** When we post, the title must describe a technical mechanism, not a portfolio outcome, and must not contain the words "portfolio builder". Candidates in the shape that scored 78–180:

- "Show HN: A no-code site editor that writes to your own Postgres, not ours"
- "Show HN: A CMS that runs at zero cost on free Vercel and Neon tiers"
- "Show HN: Self-hosted visual editing with draft/publish, in one Docker command"

---

## 6. Scaled pages: what Google permits and forbids

### 6.1 The policy, verbatim

From [developers.google.com/search/docs/essentials/spam-policies](https://developers.google.com/search/docs/essentials/spam-policies):

> **Scaled content abuse** is when many pages are generated for the primary purpose of manipulating search rankings and not helping users.

Listed examples include _"Using generative AI tools or other similar tools to generate many pages without adding value for users"_, _"Stitching or combining content from different web pages without adding value"_, and _"Creating many pages where the content makes little or no sense to a reader but contains search keywords"_.

**Doorway abuse** is the one that applies directly to a profession page family:

> Doorway abuse is when sites or pages are created to rank for specific, similar search queries. They lead users to intermediate pages that are not as useful as the final destination.

The policy is **method-agnostic** — it targets _"producing content at scale to boost search ranking — whether automation, humans or a combination are involved"_ ([Google blog, 2024-03-05](https://blog.google/products-and-platforms/products/search/google-search-update-march-2024/)). Google expected the March 2024 work to reduce low-quality unoriginal content by 40%, revised to _"45% less"_ on 2024-04-26.

**AI generation is not the problem; thinness is.** Ahrefs studied **331,000 pages** from 100,000 SERPs with GSC data (June 2025–June 2026): 5.3% of top-ranking pages returned 100% AI detection; average AI content rises only from **27.1% at position 1 to 30.9% at position 10**; low-AI pages were indexed 49.28% vs 40.35% for very-high-AI, and received **2–3× the impressions** ([ahrefs.com](https://ahrefs.com/blog/google-doesnt-punish-ai-content/)). Their conclusion: _"Google is not against AI content; it is against bad content."_

### 6.2 The operational gate — run this per template, not per page

From [creating-helpful-content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), usable verbatim:

- _"Does the content provide original information, reporting, research, or analysis?"_
- _"Does the content provide a substantial, complete, or comprehensive description of the topic?"_
- _"If the content draws on other sources, does it avoid simply copying or rewriting those sources, and instead provide substantial additional value and originality?"_
- _"Is the content mass-produced by or outsourced to a large number of creators…?"_

Plus Who/How/Why: _"Is it self-evident to your visitors who authored your content?"_; _"Is the use of automation, including AI-generation, self-evident to visitors through disclosures?"_; purpose _"primarily to help people"_.

**The load-bearing rule for us: every page in a scaled family must be backed by a real artefact** — a template, a live demo, a migration script, a comparison we actually ran. Where the artefact does not exist, the page is thin by construction. Backlinko names the failure mode as _"simply changing '[City] plumbers' to target 500 locations while offering identical generic text"_; pages must _"meaningfully change between variations"_ ([backlinko.com/programmatic-seo](https://backlinko.com/programmatic-seo)). The same source records the downside: ZoomInfo lost substantial visibility across the 2021 and 2023 updates, and **G2 fell from ~12 million monthly visits (2021) to under 1 million** (all Backlinko figures **UNVERIFIED** independently, as are the Omnius and real-estate case studies cited from [rebusadvertising.com](https://rebusadvertising.com/blogs/seo-case-studies/) and [siegemedia.com](https://www.siegemedia.com/strategy/programmatic-seo)).

### 6.3 Our families, graded

| Family                                                        |            Count | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------- | ---------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<brand> alternative`, merged with `<brand> vs us`            |            10–15 | **Build, hand-written.** At twelve pages this is not programmatic — it is twelve pages. One URL can serve both "alternative" and "vs" intent                                                                                                                                                                                                                                                                                                                                                                     |
| Template gallery pages                                        | = template count | **Build — the safest scaled family**, because each page is backed by a distinct live demo and one-click deploy. Blocked on 0.6                                                                                                                                                                                                                                                                                                                                                                                   |
| `portfolio website for <profession>`                          |  **6–8, not 40** | **Build only where a profession-specific artefact exists.** Autocomplete depth: students 10, writers 5, video editors 3, photographers 3, architects 3, models 2, and **illustrators, musicians and teachers return echo only — do not build those**. Note the `portfolio website for` seed's own top ten is `web developer`, `graphic designer`, `developer`, `software engineer`, `students`, `video editors`, `free`, `data analyst`, `artists`, `full stack developer` — **five of ten are technical roles** |
| `how to make a <profession> portfolio`                        |              5–8 | **Merge into the profession pages.** Do not run a parallel family                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Deploy-target pages (Vercel, Netlify, Supabase, Neon, Docker) |              4–8 | **Build, small.** Real, genuinely different instructions per target                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `<city>` / `<country>`                                        |                — | **Never**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `<profession> portfolio examples`                             |                — | **Defer**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

One further note on generic how-to content: `how to make a portfolio website` autocomplete is **entirely platform-qualified** — `on canva`, `using html and css`, `on github`, `on framer`, `on figma`, `on squarespace`, `on wix`. The winnable version is _"how to make a portfolio website with &lt;our product&gt;"_, never the generic head term.

---

## 7. Technical implementation

### 7.1 Next.js and crawl fundamentals

Metadata API, [docs 16.3.0](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) (lastUpdated 2026-06-01), which matches the Next 16 in `package.json`:

- `metadataBase` on the root layout; `title.template` per section; **self-referential absolute** `alternates.canonical` on every page. Google ranks the signals **redirects (strong) > rel=canonical (strong) > sitemap inclusion (weak)** and states canonicals are _"a hint, not a directive"_ ([docs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)); use absolute paths, never relative.
- One host and one trailing-slash convention, enforced by redirect — redirects outrank canonicals.
- `generateMetadata`'s `params` is a **Promise** and must be awaited; `metadata`/`generateMetadata` are Server-Components-only; deduplicate fetches with React `cache()`.
- **The silent SEO breaker:** _"Streaming metadata is disabled for bots and crawlers that expect metadata to be in the `<head>` tag (e.g. Twitterbot, Slackbot, Bingbot)"_, detected by user agent and configurable via [`htmlLimitedBots`](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots). Prerendered pages resolve metadata at build, so a mostly-static marketing site is unaffected — **but any dynamically rendered page must be checked against the bot list.**
- `app/sitemap.ts` with **honest `lastmod` derived from real content modification time**. Google _"ignores `<priority>` and `<changefreq>`"_ and uses `<lastmod>` only _"if it's consistently and verifiably accurate"_ ([build-sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)). **A build-time `new Date()` on every URL is exactly the pattern that makes Google stop trusting it.** Limits: 50 MB or 50,000 URLs.
- `app/robots.ts` emitting the `Sitemap:` line, and submit in Search Console as well for error visibility.
- `opengraph-image.tsx` at root plus per-comparison overrides; nested files override ancestors. `ImageResponse` supports **flexbox only — `display: grid` will not work**. Four required OG properties: `og:title`, `og:type`, `og:image`, `og:url`; the spec adds that _"if the page specifies an og:image it should specify og:image:alt"_ ([ogp.me](https://ogp.me/)). **OG tags are not a ranking factor** — their value is click-through on the social surfaces that carry a developer-tool launch.
- Core Web Vitals budget at **p75 mobile**: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 ([web.dev/articles/vitals](https://web.dev/articles/vitals)). Any specific "CWV is X% of ranking" figure is **UNVERIFIED**; Google has never published a magnitude.
- Worth knowing: the **Helpful Content System no longer exists as a separate system** — it was folded into core ranking in March 2024 and is now listed under [retired systems](https://developers.google.com/search/docs/appearance/ranking-systems-guide), alongside Panda, Penguin and Hummingbird. Live systems that matter to us: **original content systems** (rewards primary sources — argues for §8's data study) and the **site diversity system** (limits results from one domain — which is why third-party listicle placements compound).

### 7.2 Structured data — what is actually still live

| Type                  | Status                                                                                           | Use here                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SoftwareApplication` | Live — [docs](https://developers.google.com/search/docs/appearance/structured-data/software-app) | **Yes**, site-wide, `offers.price: "0"`. Rating requirement blocks the rich result for now (§3.5)                                                                                                                                                                                                                                                                                                                                                 |
| `BreadcrumbList`      | Live                                                                                             | **Yes** on docs and blog — cheap                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `Organization`        | Live                                                                                             | **Yes** — logo, `sameAs` to GitHub, canonical entity for knowledge-graph and AI purposes                                                                                                                                                                                                                                                                                                                                                          |
| `Article`             | Live                                                                                             | **Yes** on blog posts                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `VideoObject`         | Live                                                                                             | Yes if demo videos ship                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `Product`             | Live                                                                                             | **No** — wrong type for free software                                                                                                                                                                                                                                                                                                                                                                                                             |
| `FAQPage`             | **Dead**                                                                                         | **No markup.** [Google's own doc](https://developers.google.com/search/docs/appearance/structured-data/faqpage) records the Aug 2023 restriction to _"well-known, authoritative government and health websites"_ and the June 2024 removal of the documentation because _"The FAQ rich result feature is no longer shown in Google Search results"_. Still write visible FAQs — Plausible and Ghost both do — just expect nothing from the markup |
| `HowTo`               | **Dead**                                                                                         | **No.** Absent from the [current search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery). The absence is verified; the exact device-level wording of the [Aug 2023 announcement](https://developers.google.com/search/blog/2023/08/howto-faq-changes) is **UNVERIFIED**                                                                                                                              |
| Sitelinks SearchBox   | **Dead**                                                                                         | **No** — absent from the gallery                                                                                                                                                                                                                                                                                                                                                                                                                  |

### 7.3 AI crawlers: allow everything

| Bot                                            | Effect of blocking                                                                                                                                                                                                                                   |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OAI-SearchBot`                                | Sites blocking it _"will not be shown in ChatGPT search answers"_ — **never block** ([OpenAI docs](https://developers.openai.com/api/docs/bots))                                                                                                     |
| `GPTBot`                                       | Training only; blocking has no effect on ChatGPT search                                                                                                                                                                                              |
| `ChatGPT-User`                                 | User-triggered; _"robots.txt rules may not apply"_                                                                                                                                                                                                   |
| `ClaudeBot`, `Claude-User`, `Claude-SearchBot` | Training / user fetch / search quality ([Anthropic docs](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler))                                                           |
| `Google-Extended`                              | Controls Gemini/Vertex training; the [2023 announcement](https://blog.google/technology/ai/an-update-on-web-publisher-controls/) makes no claim about Search. The dedicated docs URL 404'd on 2026-08-12 — **current canonical location UNVERIFIED** |

For a project that wants to be _recommended_ by assistants, visibility beats protection. Allow all.

---

## 8. Off-site: where the authority actually comes from

At zero domain authority, off-site work is not a supporting activity — it is the main activity for the first quarter.

### 8.1 Awesome lists and directories, in submission order

| Target                                                                                                                                                                                                                                                                                                                                                                |                                        Stars / reach | Gate                                                                                                                                         | When                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [OpenAlternative](https://openalternative.co/submit)                                                                                                                                                                                                                                                                                                                  |                         6,561★ list + 12K newsletter | Free queue; a paid skip-the-queue tier exists (**price UNVERIFIED**)                                                                         | Week 1 after going public                |
| [AlternativeTo](https://alternativeto.net/manage/new/)                                                                                                                                                                                                                                                                                                                |       Ranks organically on brand-alternative queries | Free = months; **$5 = 1–2 business days**                                                                                                    | Week 1, pay the $5                       |
| [awesome-nextjs](https://github.com/unicodeveloper/awesome-nextjs)                                                                                                                                                                                                                                                                                                    |                                      11,108★, active | Formatting rules only. Also propagates to [LibHunt](https://go.libhunt.com/site/about), whose listings are _derived from awesome lists_      | Week 2                                   |
| [awesome-nocode-lowcode](https://github.com/kairichard/awesome-nocode-lowcode)                                                                                                                                                                                                                                                                                        |                                       1,187★, active | Best no-code list                                                                                                                            | Week 2                                   |
| [SaaSHub](https://www.saashub.com/services/submit)                                                                                                                                                                                                                                                                                                                    |                                                    — | Needs an email on the product's domain; _"most listings are approved within one or two days"_                                                | Week 3, once a domain exists             |
| [selfh.st](https://selfh.st/submit/)                                                                                                                                                                                                                                                                                                                                  |                       Self-Host Weekly, every Friday | Needs the Docker path to be real                                                                                                             | After the Dockerfile                     |
| [awesome-static-website-services](https://github.com/agarrharr/awesome-static-website-services) · [awesome-jamstack](https://github.com/automata/awesome-jamstack) · [awesome-open-source-alternatives](https://github.com/diegoleme/awesome-open-source-alternatives) · [awesome-github-pages-portfolios](https://github.com/guilyx/awesome-github-pages-portfolios) |                           1,979 / 1,368 / 477 / 438★ | Low effort each                                                                                                                              | Weeks 3–6                                |
| [awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data)                                                                                                                                                                                                                                                                              | Feeds a **312,028★** list and awesome-selfhosted.net | **4 months since first release**, actively maintained, working install instructions, one item per PR, not filed under static-site-generators | **~December 2026** — start the clock now |
| [developer-portfolios](https://github.com/emmabostian/developer-portfolios)                                                                                                                                                                                                                                                                                           |                                 25,978★, very active | Lists individual portfolios, not tools — enter via our own demo site                                                                         | When the demo is live                    |
| Skip: [awesome-cms](https://github.com/postlight/awesome-cms) (last commit 2024-10-23), [awesome-portfolios](https://github.com/amnashanwar/awesome-portfolios) (2018), [awesome-opensource-alternatives](https://github.com/WarenGonzaga/awesome-opensource-alternatives) (2021)                                                                                     |                                                    — | Stale or dead                                                                                                                                | Never                                    |

A secondary play worth noting: [sindresorhus/awesome](https://github.com/sindresorhus/awesome) (494,602★) accepts **lists, not projects**. Publishing `awesome-portfolio-builders` and owning the category is viable, but the rules are strict — 30 days of age, `awesome-lint` clean, a section named exactly `Contents`, a **CC0 licence (MIT is rejected for the list itself)**, and you must review four other open PRs first.

### 8.2 Listicle outreach — the compounding channel

Every publisher below has already published a ranking article in this niche and refreshes it annually, which means **there is a predictable rewrite window and a named author to email**: [Tooltester](https://www.tooltester.com/en/blog/squarespace-alternatives/), [Website Planet](https://www.websiteplanet.com/blog/best-open-source-website-builders/), [Zapier](https://zapier.com/blog/squarespace-alternatives/), [TechRadar Pro](https://www.techradar.com/pro/website-building/best-alternative-to-squarespace), [EXPERTE](https://www.experte.com/website-builder/squarespace-alternative), [Colorlib](https://colorlib.com/wp/open-source-website-builders/), [Wbcom Designs](https://wbcomdesigns.com/best-open-source-website-builders/) (Jun 2026), [Codeless](https://codeless.co/best-open-source-website-builders/) (May 2026), [Droptica](https://www.droptica.com/blog/6-best-open-source-website-builders/), [OpenSourceAlternatives.to](https://www.opensourcealternatives.to/blog/best-open-source-website-builders), [Dribbble content hub](https://content-hub.dribbble.com/career/best-portfolio-website-builders), [Aquent](https://aquent.com/blog/top-5-free-portfolio-sites).

Two evidence-backed rules: highest yield comes from reaching the author **during research, before publication**, and pitches citing the specific article and section report **8–15% reply rates** ([position.digital](https://www.position.digital/blog/listicle-outreach-guide/)). And within a month of publishing a post containing **original data**, listicle authors proactively asked to include the tool ([Indie Hackers](https://www.indiehackers.com/post/were-invisible-in-the-listicles-here-s-what-we-tried-today-and-the-surprise-that-came-with-it-993e44a239)) — which is the direct argument for §8.3.

[Opensource.com](https://opensource.com/alternatives) deserves special mention: a guest post there produced Plausible's single largest conversion day (94 trial signups).

### 8.3 One piece of original research, because three separate systems reward it

Google's live **original content systems** elevate primary sources; Google's first self-assessment question asks for _"original information, reporting, research, or analysis"_; Ahrefs finds original research is what AI cannot source elsewhere; and the Indie Hackers case shows original data pulls listicle authors in unprompted.

Candidates, in order of fit:

1. **The true annual cost of a portfolio site** across Squarespace, Wix, Adobe Portfolio, Format, Pixieset and Carrd, including transaction fees and renewal pricing. Directly feeds the hub page's missing-pricing differentiator and the alternative pages' pricing-delta argument. Highest reuse.
2. **A Core Web Vitals benchmark of portfolio sites** built on each platform, measured at p75 against the LCP 2.5 s / INP 200 ms / CLS 0.1 thresholds. Technically credible, hard to dispute, and hard for a competitor to copy.
3. **A platform-shutdown risk survey** — read.cv, [Cohost](https://en.wikipedia.org/wiki/Cohost) — which is the grievance our positioning actually answers.

Also worth building later, because Ahrefs notes tools and calculators _"resist AI summarization"_: a portfolio-cost calculator, or a "is your portfolio site fast?" CWV checker.

### 8.4 Product Hunt is a harvest, not a seed

Dub's documented launch produced **1,085 upvotes, 210 comments, #1 Product of the Day/Week/Month, 2,000+ unique visitors and 663 signups** — an 8× day ([dub.co/blog/product-hunt](https://dub.co/blog/product-hunt)). The preconditions they name are **15,000+ existing GitHub stars and a 25,000+ email list**. We have neither. Defer to 2027. (Rules for when we do: free, [company accounts prohibited](https://www.producthunt.com/launch) so launch from a personal maker account, 12:01 am Pacific.)

Hacker News, by contrast, is available now and is the largest single traffic event on the table. First-party reports put the front page at **4k–30k visitors**, with #1 ≈ **11,000 uniques/day** ([nikofischer.com](https://nikofischer.com/website-traffic-after-hacker-news-ranking)), a documented 68-point post yielding ≈3,500–4,000 from the front page and ≈8,000 over four days ([marcotm.com](https://marcotm.com/articles/stats-of-being-on-the-hacker-news-front-page/)), and an exceptional multi-day case at **138,137 views** ([thehftguy.com](https://thehftguy.com/2017/09/26/hitting-hacker-news-front-page-how-much-traffic-do-you-get/)). Claims of "500–2,000 stars in 24 hours from a Show HN" appear only in marketing blogs and are **UNVERIFIED**. GitHub's trending algorithm is a black box with **no published threshold**; reverse-engineering claims that it measures star velocity relative to a repo's own baseline are **UNVERIFIED** practitioner speculation.

---

## 9. LLM and AI-answer visibility

**Google's position, verbatim** ([ai-features](https://developers.google.com/search/docs/appearance/ai-features)):

> "To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet."
>
> "You don't need to create new machine readable files, AI text files, or markup to appear in these features. There's also no special schema.org structured data that you need to add."

So there is no AI-specific technical programme to run. What the evidence says actually moves citation is **off-site presence**:

- **Up to 89% of Ahrefs' own brand mentions in AI answers came from other websites**, not their own site. A study of 75,000 brands found _"off-site mentions, especially … YouTube video transcripts, had some of the strongest correlations with visibility in ChatGPT, Google AI Mode, and Google AI Overviews"_, with YouTube, Reddit, Facebook and LinkedIn among the most-cited platforms ([ahrefs.com/blog/ai-search-strategy](https://ahrefs.com/blog/ai-search-strategy/)).
- **AI-cited content is 25.7% fresher** than organic Google results (same source) — an argument for dated, maintained pages.
- **Explicit GEO optimisation has negative evidence.** In an Ahrefs test, an untouched page was cited by GPT-4o-mini 13.3% of the time; after _"full GEO optimization"_ citation **fell to 10.9–12.2%**. One site saw a 1,900% month-over-month jump in ChatGPT citations to a single page with _"little-to-no business impact"_ ([ahrefs.com/blog/ai-search-trends](https://ahrefs.com/blog/ai-search-trends/)).
- **`llms.txt`: ship it in twenty minutes, expect nothing.** [llmstxt.org](https://llmstxt.org/) is a proposal by Jeremy Howard (2024-09-03, v2 2026-08-10) claiming wide publication; but **publishing is not consuming**, no vendor confirmation of consumption was found, Ahrefs analysed 137,000 sites and reports **"97% of llms.txt files never get read"**, and Google says flatly that no AI file is needed. Next.js itself ships `/docs/llms.txt`, so it is conventional in this ecosystem. Cheap, harmless, unevidenced.
- **AI referral traffic is real but small.** Plausible measured a **~2,200% increase** in 2024 from a base _"in the 100's in 2023"_, with good quality signals (58% homepage scroll depth; the free-trial page was the second-most-visited page in AI sessions) — and they ran **no GEO optimisation at all**, attributing it to search authority ([plausible.io](https://plausible.io/blog/ai-referral-traffic-and-optimization)).

**Meanwhile classic clicks are getting scarcer.** Ahrefs measured **−34.5% CTR** for the top-ranking page on keywords where AI Overviews appear (300,000 keywords, GSC data, March 2024 vs March 2025); [Pew](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) found users clicked a traditional result on **8%** of visits with an AI summary versus **15%** without, and clicked a link inside the summary on **1%**; Ahrefs' July 2026 index work puts the position-#1 click loss at **~58%**. Google notes that "query fan-out" in AI Mode lets them _"display a wider and more diverse set of helpful links"_ — a genuine opening for small sites, but the honest planning assumption is that a #1 ranking is worth materially less than it used to be, which strengthens the case for community and directory presence over pure SERP chasing.

**Practical conclusion:** no GEO programme. Publish `llms.txt` because it costs nothing, allow every AI crawler, keep pages dated and maintained, and put the effort into the off-site mentions that the data says actually drive citation.

---

## 10. What we do not know, and what it would change

| Gap                                                                                                                                                      | Why it matters                                                                                                                                                                                                                  | What it would change                                                                                                                                                                                                                                                                                                         | Cheapest way to close it                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reddit is entirely missing.** Blocked to every tool: `reddit.com` refused the search tool and WebFetch, and `reddit.com/search.json` returned non-JSON | **21 of ~45 tested seeds return a `reddit` suffix prediction** — users distrust the affiliate listicles that own these SERPs. Reddit is also among the most-cited LLM platforms, and sent Plausible 2,200 visits in four months | The wording of the homepage promise and every alternative page's "reason to switch" should come from grievance language users actually use, not our guesses. Also: which three or four subreddits to be present in, and whether r/selfhosted permits launch posts at all (**sidebar rules and subscriber count UNVERIFIED**) | Two hours of manual browsing, logged out. Search r/graphic_design, r/web_design, r/photography, r/userexperience, r/webdev, r/selfhosted and r/freelance for "portfolio website", "Squarespace price", "leaving Adobe Portfolio". Save 20 verbatim quotes with URLs and dates |
| **No absolute search volumes anywhere.** Ahrefs, Semrush, Ubersuggest and Keyword Planner all required login or JS                                       | All demand sizing in this document is _relative_, inferred from autocomplete depth                                                                                                                                              | Mainly the ordering _within_ the alternative-page family, and whether the profession-page artefact investment is justified. **It would not change the top of the plan** — the hub page is ranked first on competitive weakness, not on volume, and that judgement is independent of volume                                   | Google Ads Keyword Planner, free with an account. Expect banded ranges rather than exact figures without an active campaign — enough to rank-order the ~40 terms in the dossier's Appendix A                                                                                  |
| **"People Also Ask" boxes could not be scraped**                                                                                                         | PAA is the direct source of question-shaped content briefs, and it is the method Plausible themselves used                                                                                                                      | The H2 structure of the hub page and each alternative page                                                                                                                                                                                                                                                                   | 30 minutes of manual SERP inspection on six head terms                                                                                                                                                                                                                        |
| Turkish SERP composition                                                                                                                                 | Named as a cheap localisation test on autocomplete evidence alone                                                                                                                                                               | Whether Turkish is worth a single translated page                                                                                                                                                                                                                                                                            | Run the SERP. Not urgent                                                                                                                                                                                                                                                      |
| Google-Extended canonical docs URL; the verbatim Aug-2023 HowTo/FAQ announcement                                                                         | Minor. Both conclusions hold on other evidence                                                                                                                                                                                  | Nothing material                                                                                                                                                                                                                                                                                                             | Retry the URLs occasionally                                                                                                                                                                                                                                                   |

**The honest summary: the plan is robust to the two big gaps.** Ranking pages by _how weak the incumbent is_ rather than by _how much volume the query has_ is precisely what makes it survivable without volume data. Reddit data would improve the copy and the community plan; it would not reorder the build list.

---

## 11. International: hold, but keep the notes

Not in the first 90 days. Localisation is high-cost and slow-payback: freeCodeCamp reported **310,000 words per language** in the curriculum alone and insists on human translation ([freecodecamp.org](https://www.freecodecamp.org/news/world-language-translation-effort/)), and **no OSS project reachable in this research publishes i18n-attributed traffic or conversion numbers** — including Cal.com, which shipped ten-plus languages in 2022 with no metrics.

Three findings worth keeping, because they save re-running the research later:

1. **The head terms are traps in the two largest non-English markets.** Spanish `crear portafolio` is contaminated by Meta Business Suite (`crear portafolio comercial facebook`); the correct head term is **`portafolio web`**, which is clean and developer-flavoured (`gratis`, `developer`, `programador`, `github`). Portuguese `criar portfólio` is the same trap plus heavy PDF intent; the head term is **`site de portfólio`**. Japanese must use the `サイト` form — `ポートフォリオ 作成 無料` collides with investing.
2. **Japan has the best demand-to-competition ratio**: ten on-intent predictions including `エンジニア` and `無料`, a SERP occupied by domestic recruiting media and local tools rather than Wix/Squarespace/Adobe, EF EPI 446 (very low English proficiency), and Google's effective reach is higher than the 59.73% Statcounter share because [Yahoo! Japan runs on Google's technology](https://searchengineland.com/google-yahoo-deal-is-cleared-in-japan-57530). Brazilian Portuguese is second on volume-to-effort, and its SERP is listicle-dominated — **placement in existing roundups beats ranking a new page there**.
3. **Deprioritise German and Polish permanently.** EF EPI 615 and 600 (very high) means those users read English documentation comfortably; German autocomplete is only four deep and the German SERP is the most brand-locked found.

When the time comes: subdirectories (`/ja/`, `/pt-br/`), because Googlebot _"usually originates from the USA"_ and _"doesn't set Accept-Language"_, and Google says explicitly _"Don't use IP analysis to adapt your content"_. hreflang must be bidirectional and self-referencing or it is ignored entirely — **31.02% of 18,786 audited sites have conflicting directives and 47.95% omit `x-default`** ([Search Engine Land](https://searchengineland.com/study-31-of-international-websites-contain-hreflang-errors-395161)). And machine translation at scale with no human review walks straight into the scaled-content-abuse bullet, which names _"translating"_ explicitly.

---

## 12. The 90-day sequence

Ordered so that time-gated items start their clocks first, the single most winnable page gets the longest indexing runway, and the launch event happens only after the assets it will be judged against exist.

### Weeks 1–2 — Go public and fix the repository surface

| Do                                                                                                                | Why now                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~Ship a `Dockerfile` and `docker-compose.yml`~~ — **done**, verified by destroying and recreating the container  | Gates awesome-selfhosted, selfh.st, r/selfhosted and the credibility of the HN framing. It is also a live query (`self hosted website builder docker`)                                            |
| **Make the repository public and cut a tagged release**                                                           | Starts the awesome-selfhosted four-month clock (eligible ~December 2026) and the sindresorhus 30-day clock. Nothing else in the plan is time-gated like this, and it costs nothing to start early |
| Write the canonical description string; set About, 20 topics, social preview; add "why this exists" to the README | The About field _is_ our Google snippet. Topic-page arbitrage is available immediately at 626/313/79 repos                                                                                        |
| Submit to OpenAlternative and AlternativeTo (**pay the $5 priority review**)                                      | OpenAlternative is the highest single-submission ROI and feeds a 6,561-star list. AlternativeTo's free queue is months                                                                            |
| Do the Reddit research manually; open a Keyword Planner account                                                   | The two known evidence gaps, both closable in under three hours total                                                                                                                             |
| Stand up the public demo instance                                                                                 | Prerequisite for template pages, screenshots and the developer-portfolios list                                                                                                                    |

### Weeks 3–5 — The marketing site and the two money pages

| Do                                                                                                                                                                                                                                                     | Why now                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Site skeleton with the full technical baseline from §7 — `metadataBase`, absolute self-canonicals, honest `lastmod`, robots allowing all AI crawlers, OG images, JSON-LD (SoftwareApplication / Organization / BreadcrumbList), CWV budget, `llms.txt` | Do it once, at the start. Retrofitting canonicals and sitemap honesty across 20 pages is far more expensive                                      |
| Publish `/open-source-website-builders` — the comparison hub                                                                                                                                                                                           | **The single most winnable commercially-relevant SERP found.** It needs the longest runway to index and age, so it must go first, not last       |
| Publish `/self-hosted-website-builder` and the homepage                                                                                                                                                                                                | The homepage is the classification surface every later outreach email points at; the product page owns the closest exact-match query that exists |
| Submit to awesome-nextjs and awesome-nocode-lowcode; SaaSHub once the domain resolves                                                                                                                                                                  | awesome-nextjs propagates automatically to LibHunt                                                                                               |

### Weeks 6–8 — The four qualified alternative pages

Build `/alternatives/wix`, `/alternatives/adobe-portfolio`, `/alternatives/pixieset`, `/alternatives/framer`, in that order, to the §5.2 skeleton — table above the fold, one honest concession, a migration path, 800–2,000 words, no FAQ markup.

They come third rather than first because they are lower-volume than the hub, and because building them generates the pricing data, feature tables and side-by-side screenshots that the hub page and the §8.3 data study both reuse. Doing them in this order means the research is done once and spent three times.

### Weeks 9–11 — Original data, then outreach

Publish the cost study (§8.3, candidate 1). Then run listicle outreach to the twelve publishers in §8.2, citing the specific article and section, leading with the data rather than with the product. Timing is deliberate: several of those pages refresh in the March–June window, so a September–November pitch lands while the next rewrite is being planned rather than after it has shipped. The Indie Hackers precedent says original data is what makes the pitch answer itself.

Also in this window: the remaining small awesome-list PRs, and the demo site into developer-portfolios.

### Week 12 — Show HN, and only then

Post with a **technical mechanism in the title and no mention of portfolios** (§5.3). By this point the Dockerfile is real, the demo is live, the docs exist and the hub page has had two months to index — so the traffic spike lands on assets that can convert and retain it. Submit to selfh.st for Self-Host Weekly the same week.

**Not in this window:** Product Hunt (needs stars and a list we do not have), profession pages (blocked on 0.9), template gallery pages (blocked on 0.6), any localisation, and any attempt on `free portfolio website builder`.

### Day-90 checkpoint

Instrument from week 1 — Search Console (submit the sitemap there as well as in robots.txt, for error visibility), privacy-friendly analytics, and a note of GitHub stars and referrers. At day 90 the questions worth asking are narrow:

1. Is `/open-source-website-builders` indexed, and where does it sit on `open source website builder`? This is the one number that decides whether the whole thesis holds.
2. Did any of the four alternative pages get an impression on its qualified query? Even a handful validates that the demand autocomplete implied is real.
3. Did any third-party listicle, directory or awesome list add us? Off-site placement is what compounds, and per §9 it is also what drives AI citation.
4. Did the Show HN clear 50 points? Below that, the framing is still wrong and should be retried with a different mechanism, not a different product description.

---

## Verified independently: Cal.com went closed source

Confirmed on 2026-08-12, because this claim is load-bearing for positioning and
would be embarrassing to get wrong in public.

On **15 April 2026** Cal.com moved its commercial codebase to a private
repository and launched **Cal.diy** as a stripped-down MIT-licensed community
version. The stated reason was AI-driven security risk — that modern coding
models can scan a public codebase for vulnerabilities and produce working
exploits quickly. The decision was widely criticised, with a common reading
being that the security argument was cover for a commercial one.

Sources:
[Cal.com's own post](https://cal.com/blog/cal-diy-open-source-to-closed-source) ·
[Slashdot](https://yro.slashdot.org/story/26/04/15/1913213/calcom-is-going-closed-source-because-of-ai) ·
[It's FOSS](https://itsfoss.com/news/cal-com-goes-proprietary/) ·
[AlternativeTo](https://alternativeto.net/news/2026/4/cal-com-is-going-closed-source-with-a-major-shift-in-its-license-strategy/)

**What it means for us.** Cal.com stays a good structural model for a comparison
page and stops being citable as an open-source success story. More usefully, it
is a recent, verifiable instance of the precise fear this product's audience
has: the thing you built on changes its terms after you have committed to it.
That argument is far stronger made with a date and a link than made in the
abstract — and it should be made without gloating, because the same could be
said of us one day and the only real answer is the licence and the exit path.

**Use it carefully.** Cal.com's users were not abandoned — existing customers
were unaffected and an MIT version still exists. Overstating it would be both
unfair and easy to disprove.
