# Market research

**Decisions, as of 2026-08-12.** The evidence sits in
[`_raw-market.md`](_raw-market.md) — 381 sources, ~115 verbatim user quotes,
every price dated. This document is the judgement layer: what the evidence
means for Open Portfolio, where it supports a claim we can make in
public, and where it does not.

Three standing rules, carried from the dossier and binding on anything written
from this page:

- **`UNVERIFIED` is not "probably true".** Every flag below is preserved. An
  unverified figure may be used internally with the flag attached. It may not
  appear in public copy at all.
- **There are no review-site ratings anywhere in this research.** Trustpilot,
  G2 and Capterra returned HTTP 403 to every method including a real browser.
  See §8.
- **Two statistics people expect here do not exist.** See §7 before writing any
  sentence containing a percentage about hiring managers.

---

## 1. Where we actually win, and where we do not

### The gap is real, and it is precisely shaped

The dossier tested one question against primary sources: **at exactly which step
does a non-technical person stop?** Every open-source alternative fails at a
line you can quote.

| Project                                                           | The line where they stop                                                                                                                                                                                             | Source                                                                                                           |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Ghost**                                                         | Step one of the install is `ssh root@your_server_ip`. Before it, they must already own a VPS, a domain and a configured DNS A-record — "This must be done in advance so that SSL can be configured during setup."    | [docs.ghost.org/install/ubuntu](https://docs.ghost.org/install/ubuntu/)                                          |
| **WordPress**                                                     | Step 2 of the "famous 5-minute install": "**Create a database for WordPress on your web server, as well as a MySQL (or MariaDB) user who has all privileges for accessing and modifying it.**"                       | [developer.wordpress.org](https://developer.wordpress.org/advanced-administration/before-install/howto-install/) |
| **Webstudio**                                                     | Its own docs: "**While both the Builder and the generated site are open-source, self-hosting the Builder in production is more difficult and currently not recommended.**"                                           | [docs.webstudio.is/university/self-hosting](https://docs.webstudio.is/university/self-hosting)                   |
| **Grav**                                                          | "Extract the zip file into your webroot." They do not have a webroot, or the PHP 8.3.11+ its 2.0 requirements page mandates.                                                                                         | Grav README and 2.0 requirements page, dossier §2.5                                                              |
| **Publii**                                                        | Solves authoring beautifully, then asks for a **GitHub classic personal access token with `repo` scope**, or an FTP host/port/remote-path triplet — and the site can only ever be edited from one specific computer. | [getpublii.com/docs](https://getpublii.com/docs/host-static-website-github-pages.html)                           |
| **Decap / Tina / Sveltia / Keystatic / Pages CMS / Front Matter** | All six require hand-authoring a schema in YAML, JSON or TypeScript. None is no-code.                                                                                                                                | §2.3 of the dossier                                                                                              |
| **Statamic**                                                      | `composer global require statamic/cli`, PHP 8.3+, nine PHP extensions. Also proprietary.                                                                                                                             | [statamic.dev/requirements](https://statamic.dev/requirements)                                                   |
| **Primo**                                                         | Its own README: "**Primo is a CMS _for developers_ who build sites for clients who need to manage them afterward.**"                                                                                                 | [primocms/primo](https://github.com/primocms/primo)                                                              |

And the category itself is missing from the canonical index. In
`awesome-selfhosted` — **312,028 stars**, over a thousand applications, updated
two days before verification — the **Static Site Generators section is empty**,
containing only a pointer to two external lists, and there is **no portfolio
builder category at all**
([raw README, line 2074](https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md)).

The only genuinely no-code Git-based CMS is **CloudCannon, at $55/month,
proprietary and not self-hostable** ([cloudcannon.com/pricing](https://cloudcannon.com/pricing/)).
That is the price umbrella over this whole category.

The dossier's own summary row is the cleanest statement of the opportunity:
across every option tested — open source, self-hostable, free, installable by a
non-technical person, editable by them afterwards, and portfolio-shaped —
**nothing occupies that row.**

### How big the gap really is

Smaller than the emptiness of that row suggests, and worth being blunt about.

**The row may be empty because the intersection is small, not only because
nobody built it.** Two bodies of evidence point that way:

- The people who have already paid the ownership tax are countable, and the
  count is in the tens of thousands, not millions. `academicpages` has **8,392
  forks** — 8,392 people who copied a repository and edited YAML to get a
  portfolio. `al-folio` has 15,992 stars, Hugo Blox 9,626. That is the size of
  the population who wanted ownership badly enough to tolerate friction.
- The people who tried and went back are on the record. A self-hoster: "I
  settled on **not** self-hosting a Ghost instance and it has been the best way
  to write because paying $9/mo is a lot easier for me than to update deps or
  manage bugs" ([HN 38892816](https://news.ycombinator.com/item?id=38892816)).
  A CMS vendor's own employee, advising a self-described novice *against* the
  route: "You might save $10/mo but end up spending hours longer to get it up
  and running" ([HN 39217663](https://news.ycombinator.com/item?id=39217663)).
  And from a hiring manager on r/UXDesign: "Unless you're trying to get work as
  a web page designer/dev **don't waste time building a portfolio web site. Use
  a product. Be a customer.**"

**And a ten-thousand-star project in this exact niche already died.** Gridea —
same desktop-static-CMS concept as Publii, MIT, **10,265 stars** — last commit
**2023-07-26**, 583 open issues. Stars are not survival.

**So our win is not "self-hosted".** Self-hosting is what everyone else already
offers and what nobody can complete. Our win is narrower and more specific:

> **You own it and you do not have to run it.**

That claim rests entirely on the deploy button and the Docker one-liner — not on
the licence. It is also more fragile than it sounds, because it depends on
third-party free tiers staying free, and on one clause we have not resolved:

> **Vercel Hobby is restricted to non-commercial personal use.** Verbatim from
> [Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
> (updated 2026-07-29): commercial usage includes "**Advertising the sale of a
> product or service**", "Receiving payment to create, update, or host the
> site", and "Asking for Donations fall under commercial usage."

A freelance designer's portfolio that advertises services — which is what a
freelance portfolio _is_ — plausibly falls inside that definition. Our primary
documented path may not be usable, under Vercel's own terms, by a large part of
our stated audience. **Netlify's free plan carries no such restriction**
(300 credits; what a credit buys is **UNVERIFIED**, the credits doc 404s), and
Docker on your own machine carries none at all. This is a product decision, not
a research gap. See §8.

**Sizing, honestly.** US employment across the four occupations where a
portfolio is the sales channel is **767,400 (2024)** with roughly **60,600
openings a year**; photographers are **66% self-employed** and writers **63%**
([BLS OOH](https://www.bls.gov/ooh/), via Internet Archive snapshots — bls.gov
blocks bots). Demand for ownership is loud: r/selfhosted is **~817,000 members,
+42.5%/yr** ([The Hive Index](https://thehiveindex.com/communities/r-selfhosted/),
third-party — Reddit's API is blocked, so **UNVERIFIED**), and
Reactive-Resume — the closest analogue, a self-hosted personal-career tool with
a real admin UI — carries **40,297 stars**. But Reactive-Resume produces a
_document_. We produce a _website_, and the delta between those two is a domain,
DNS and hosting: exactly the wall everything in the table above falls at.

At v0.5.0, private repo, zero stars, none of this is a position. It is a
hypothesis with an unusually good evidentiary case.

### Where the commercial products are genuinely better

They are, in nine specific places. A document that cannot say so is not usable.

| #   | They win at                      | The gap, concretely                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Design range**                 | Format, Pixpa, Squarespace and Framer ship dozens of designed templates. **We ship one theme.** Six are planned for 0.6 and none exist. Against the most-evidenced complaint in the whole dossier — "every portfolio looks the same", **332 upvotes** — we are currently the worst offender in the field, because we have exactly one look.                                                                                      |
| 2   | **Measured performance**         | HTTP Archive CWV, Nov 2025: Duda **84.87%**, Wix **74.86%**, Squarespace **70.39%**, WordPress **46.28%** ([SEJ, 19 Dec 2025](https://www.searchenginejournal.com/core-web-vitals-champ-open-source-versus-proprietary-platforms/563796/)). On this measure the proprietary hosted platforms beat the open-source ones by up to 38.59 points. **We have measured nothing.** Budgets are written into the plan; no number exists. |
| 3   | **Storage for image-heavy work** | Format Pro: 100 GB. Pixpa Professional: 25 GB. Wix Core: 50 GB. Our free path: **Neon 0.5 GB database + 1 GB blob**, or Supabase 500 MB / 1 GB. A photographer with two shoots of high-res files exhausts it.                                                                                                                                                                                                                    |
| 4   | **Photography workflow**         | Format ships 50–250 client galleries; Pixpa ships gallery links and CSV order export. **We have no client galleries, no proofing, no store, no video hosting.**                                                                                                                                                                                                                                                                  |
| 5   | **Commerce**                     | Every hosted platform can take money. We cannot, at all.                                                                                                                                                                                                                                                                                                                                                                         |
| 6   | **Domain and DNS done for you**  | Squarespace, Wix, Pixpa, Format and Framer bundle a free year-one domain on annual billing, and **Format's support team performs the DNS connection for you**. We hand the user a DNS record.                                                                                                                                                                                                                                    |
| 7   | **Support that answers**         | Squarespace's support is the target of 435 BBB complaints in three years and has no phone line — and it is still infinitely more support than an unstarred GitHub issue tracker with **bus factor 1**. That is the exact criticism this dossier levels at Sveltia CMS, Pages CMS and Front Matter, and it applies to us unchanged.                                                                                               |
| 8   | **Maturity**                     | v0.5.0, alpha. No blog, no page builder, one theme, admin mid-rebuild. **Uploads have never been run against Supabase Storage or Vercel Blob with live credentials** — the storage conformance suite covers the code path, the live service has not been exercised. For an image-first product that is the single riskiest unknown we own.                                                                                       |
| 9   | **Editing from a phone**         | Notion, Behance, Dribbble and wordpress.com have real mobile apps. Ours is a docked preview with three frames; whether the admin is usable on a phone is **unverified**, and the PWA work is researched, not built.                                                                                                                                                                                                              |

**Cases where a competitor is simply the right answer**, and saying so costs us
nothing:

- **A one-page portfolio, wanting portability, unwilling to run anything** —
  **Carrd Pro Standard, $19/year**, which exports "unminified HTML, CSS, JS, and
  images" ([carrd.co/docs/pro/features](https://carrd.co/docs/pro/features)).
  Cheaper in money and effort than us, and genuinely portable.
- **Someone who already runs WordPress** — **Semplice, $119 once**
  ([semplice.com/get-semplice](https://www.semplice.com/get-semplice)). Content
  in their own database, best long-run economics in the dossier.
- **Someone who already has PHP hosting** — **Grav**, MIT, free, with a real
  browser admin.
- **A designer who values curated design over ownership and has many projects** —
  **Cargo, $14/mo annual, unlimited pages and unlimited bandwidth**; the only
  commercial platform that does not punish a portfolio for growing.

We compete for the person who wants a multi-page portfolio, on their own domain,
with no subscription and no terminal — and who is not already served by one of
the four above.

---

## 2. The pain we solve, evidenced

Fifteen themes, ~115 verbatim quotes. Ranked below by **evidence strength** (how
well the dossier supports the pain) crossed with **our answer** (how honestly we
address it today, at v0.5.0).

| Theme                                                     | Evidence                                       | Do we answer it?           |
| --------------------------------------------------------- | ---------------------------------------------- | -------------------------- |
| 1. Price rises on a captive base                          | **Very strong**                                | **Solve**                  |
| 2. Lock-in — cannot take the site                         | **Very strong, vendor-documented**             | **Solve**                  |
| 3. Billing, auto-renewal, refund refusal                  | **Very strong**                                | **Solve**                  |
| 4. Free tiers that cannot publish, or cannot use a domain | **Strong, vendor-documented**                  | **Solve, with one caveat** |
| 5. Ads and branding badges on free tiers                  | **Strong, vendor-documented**                  | **Solve**                  |
| 6. "AI we did not ask for, paid for by our price rise"    | **Strong (dominant 2026 grievance)**           | **Solve by omission**      |
| 7. Platform shutdown and stranding                        | **Strong**                                     | **Partly** — see §3        |
| 8. Client handoff has no good answer anywhere             | **Moderate, unsolved everywhere**              | **Partly**                 |
| 9. Editors that break; mobile responsiveness              | **Strong**                                     | **Partly, unproven**       |
| 10. SEO controls                                          | **Moderate and contested**                     | **Partly**                 |
| 11. Slow sites / Core Web Vitals                          | **Strong, measured**                           | **Promise only**           |
| 12. Support quality                                       | **Very strong against incumbents**             | **We are worse**           |
| 13. Template sameness                                     | **Very strong (332p thread)**                  | **We are worse today**     |
| 14. Multi-language priced punitively                      | **Strong, documented**                         | **We do not have it**      |
| 15. Accessibility                                         | **Unverified — no lawsuit or study confirmed** | **Planned, unbuilt**       |

### Solve

**1 — Price.** This is the richest vein and it is burning now: Webflow's hike is
13 May 2026, Squarespace's is July 2026, both inside ninety days of the
dossier. Squarespace raised annual prices **19% to 26%** and, per PetaPixel,
customers "were informed via direct email communications, though '**Squarespace
has seemingly not published a specific memo about its price changes**'"
([PetaPixel, 17 Jul 2026](https://petapixel.com/2026/07/17/squarespace-is-increasing-prices-by-up-to-26/);
the dossier's change table gives an effective date of ~6 Jul 2026, itself
approximate). Users, verbatim:

> "The Pro plan went from $420/year to $1,068/year, a 154% price increase- and
> as far as I can tell, no additional features?"
> — u/sneepsnorp3d, r/squarespace, 2024-01-04
> ([thread](https://www.reddit.com/r/squarespace/comments/18yrc91/154_price_increase_on_digital_products_plans/))

> "this is a joke. the bandwidth limitations hurt and drain my clients. while
> literally none used the new AI stuff… those plan are only here to make money
> but do really not consider the needs for **portfolio**, or even testing sites."
> — u/uebersax, r/webflow, 18p, 2026-05-15

> "200$/year does hit hard when you're just trying to make a small website for a
> restaurant or a portfolio..."
> — u/marco5991, r/squarespace, 2023-03-10

We answer this completely and permanently: there is no price, and no mechanism
by which one can appear for software already released under MIT.

**2 — Lock-in.** The single most citable fact in this research is Wix's own live
help page ([support.wix.com](https://support.wix.com/en/article/exporting-or-embedding-your-wix-site-elsewhere),
fetched 2026-08-12):

> "Your Wix site is a standard HTML5 site, and is built with Wix's technology.
> In order for your site to work properly, it needs to be hosted and operated on
> Wix's servers."
> "**Since Wix is a SaaS solution, your site must run on Wix's servers.**"
> "The content you build on Wix belongs to you."

Those three sentences sit on the same page. The second and third cannot both be
fully true in any sense a user would recognise.

Squarespace's is subtler and, for us, better. Its export
([Exporting your site](https://support.squarespace.com/hc/en-us/articles/206566687-Exporting-your-site),
updated 12 Feb 2026) produces a WordPress-shaped XML file that carries layout
pages, one blog page, text blocks and image blocks — and **does not export
portfolio pages**, album pages, cover pages, index pages, galleries, additional
blog pages, style settings or Custom CSS. **The one content type the platform
markets hardest to creatives is the one content type it will not give back.**

And the trap closes on itself, from a user defending the price rise:

> "Even if there is a $600 increase, consider how much time/energy it's take to
> move to another platform… How is that going to make any savings?"
> — u/ThrustersToFull, r/squarespace, 2024-01-04

That is the mechanism in one sentence: **metered content plus no export means the
cost of leaving rises with the value of what you built.** It is a design
property, not a personality.

Our answer: MIT, your own Postgres, a single-file JSON export at any time, and a
Docker image. **With one condition attached** — see §3 on why an untested export
is not an exit.

**3 — Billing.** The angriest material in the dossier, and it is structural
rather than anecdotal: r/WIX reads as a near-continuous stream of it.

> "I had a 3 year renewal on a site I've had for 6 years, price rose 84% - I got
> pushed into the 'Premium' tier. **$864 for a static website.**"
> — u/tberger, r/WIX, 60p, 2026-02-04

> Wix support, quoted in the same post: "Premium Plan renewal and Upgrade charges
> are **not covered by our refund policy** which you agreed with when signed up
> with Wix."

> "Wix just pulled $903 out of my bank account for a website I tried to cancel
> multiple times. And the best part? The cancel renewal option mysteriously
> appeared after they charged me."
> — u/Fickle-Lab-8662, r/WIX, 32p, 2026-03-07

We solve this by having no billing relationship. Worth stating plainly once and
never dwelling on: this is the kind of pain where restraint is more persuasive
than emphasis.

**4 — Free tiers that cannot do the job.** Documented, not inferred. **Three
platforms forbid publishing at all** on the free tier: Cargo ("All Cargo sites
are free to try or build. To make a site public simply choose a desired service
option"), UXfolio (free tier allows "unlimited draft portfolios" and forbids
publishing anything), and Squarespace, whose trial sites are private, are not
indexed — "Search engines don't index trial sites" — and on expiry "**all
content is marked for permanent deletion**"
([support.squarespace.com](https://support.squarespace.com/hc/en-us/articles/206536827-Starting-a-Squarespace-trial-site)).
Two more make it unusable professionally: Wix's ad banner scrolls with the
visitor, and Webflow Starter caps at **two pages**. Authory's free plan blocks
search-engine indexing outright.

**A portfolio tool whose free tier forbids publishing a portfolio** is the
sharpest illustration in the dossier of what "free" has come to mean here.

We give a custom domain on the free path because the hosting is yours. **The
caveat is the Vercel Hobby commercial-use clause in §1** — resolve it before
this claim goes into copy.

**5 — Badges and ads.** Documented on Wix (ad banner), wordpress.com ("Free
sites display WordPress.com ads to visitors"), Framer ("Made in Framer"),
Webflow, Carrd, Super.so, Authory and UXfolio. We ship no badge. **The
commitment worth making explicitly is that we never will**, because a badge is
the first thing a project adds when it starts looking for growth.

**6 — AI nobody asked for.** Not in the original brief; the dominant 2026
grievance on r/webflow and r/framer, and it pairs with price because users
believe they are paying for it.

> "Desperately pushing Ai tools that most of your user didn't want or ask
> for—and from what feedback I see, don't really work. / Charges for tools,
> features, and services that are standard with other CMS' for much less money.
> / Price hikes for minimal-to-zero improvements"
> — u/sregormd, r/webflow, 26p, 2026-05-13

> "Still can't use CMS in a slider, but hey... ✨AI✨"
> — u/White_Panther420, r/webflow, 5p, 2026-05-18

> "We get it—AI is the buzzword of the moment. But if we really wanted AI-driven
> design, we'd already be using products built specifically for AI website
> generation."
> — u/Living_Ad_8102, r/framer, 108p, 2025-07-27

Note that Hugo Blox — the strongest portfolio-adjacent open-source project at
9,626 stars — gates its **only** no-code path behind a **$9–$50/month AI chat
subscription** that edits Markdown for you. Shipping no AI is currently a
positioning asset. It has an expiry date, and it is worth knowing that we are
choosing it rather than lacking it.

### Partly

**7 — Shutdowns.** We remove the class of failure where the platform's death
takes the site with it. We do not remove the failure where _this project_ stops
being maintained. §3 handles both halves.

**8 — Client handoff.** Raised independently of the brief and unsolved
everywhere: "As an agency, most of our work involves building websites for
clients. **There's no straightforward way to transfer a website to a client upon
completion**" (u/Living_Ad_8102, r/framer, 108p). Webflow's answer is to buy a
Freelancer or Agency Workspace at $16–35/mo; Wix's is to transfer to another Wix
account, which keeps everyone inside Wix. Structurally we solve it — hand over
the repository, the database and the domain, and the relationship ends — but
there is **no handoff feature**, no second user, no ownership transfer flow. It
is a consequence of the architecture, not a shipped capability, and should be
described that way.

**9 — Editors that break.** Strongly evidenced against Wix Studio and Webflow
("The editor is so laggy sometimes it makes me want to scream, and don't even
get me started on mobile responsiveness—it never looks how I want it to. Half
the time, simple changes break the entire layout" — u/NickNova3016, r/WIX, 22p).
The plan's answer is twelve structural guardrails — no free-form styling, no
nested layout containers, intrinsic `auto-fit minmax()` grids, `clamp()` type
only, overflow detection in preview, and a kitchen-sink CI matrix through
axe-core. That design is genuinely responsive to the evidence. **None of it is
proven, because it needs the six themes and the block set that do not exist
yet.** Today we have a docked preview at three widths.

**10 — SEO.** The complaint is real but contested, and an honest document says
so: "Seo has nothing to do with the platform… This is a myth propogated by
agencies to justify spends on redeveloping" (u/General-Physics86, r/SEO, 7p).
What is _not_ contested is documented platform behaviour: Notion Sites "can take
up to four weeks to be indexed", Authory's free plan blocks indexing, and
Squarespace's site-wide password means "your site won't be accessible to search
engines". We ship server-rendered pages with per-page title, description, Open
Graph and Twitter tags, and generate `sitemap.xml` and `robots.txt` from
content. That is a real answer to the mechanical half. It is not evidence of
ranking, and must not be presented as such.

### Promise only

**11 — Speed.** The one place where the incumbents have the numbers and we have
none. WordPress passes CWV on 46.28% of sites; Duda on 84.87%. Any new
open-source entrant has to clear 46% to be credible and should be aiming at 85%.
Our plan sets budgets — ≤130 KB gz initial JS, LCP ≤2.0s p75, CLS ≤0.05,
Lighthouse ≥95/100/100 — enforced by LHCI. **Until a real deployment is
measured, we have a target, not a claim.**

### Where we are worse

**12 — Support.** They are bad; we are absent. Squarespace refuses phone support
by policy and carries **435 BBB complaints in three years, not BBB accredited**
([BBB](https://www.bbb.org/us/ny/new-york/profile/internet-service/squarespace-inc-0121-103868/complaints)).
We offer a GitHub issue tracker maintained by one person. The honest framing is
that the trade is _self-service and no bill_ against _a queue and a bill_ — not
that we support people better.

**13 — Template sameness.** The best-evidenced complaint in the dossier and the
one we currently fail hardest. Two hiring managers, unprompted:

> "there is a very similar style that many of the portfolios have, Squarespace
> included… **they start to blur together after reviewing dozens of them.** The
> portfolios that present information differently are far more likely to grab my
> attention."
> — u/shadowgerbil, r/UXDesign, 2022-08-31
> ([thread](https://www.reddit.com/r/UXDesign/comments/x258p4/are_most_people_still_using_squarespace_for_their/))

> "just buy a nice simple $30-$60 template that allows you to highlight your
> process and impact. There is nothing more annoying than having to fight a
> parallax or scroll-jacking interactions while trying to look at someone's
> work. **Most design managers spent 1-3 mins looking at your work. Optimize for
> that.**"
> — u/MK-XXIIV, same thread

One theme means every Open Portfolio site looks identical to every other
one. Until 0.6 ships six themes and ~95 design tokens, we should not go near
this theme in public copy — it argues against us. The MK-XXIIV quote is the more
useful one anyway: it says a portfolio is a _utility optimised for a three-minute
read_, which is a better design brief than anything the incumbents' marketing
implies.

**14 — Multi-language.** Priced punitively everywhere — Framer **$20 per
locale** up to 20, Webflow Localize **$9–29/mo per site**, Squarespace not
natively at all (it routes users to third-party paid Weglot), Journo Portfolio
the outlier at $8/mo for three languages. That is a clean opening and **we do
not have it**. Not in the roadmap through 1.0.

**15 — Accessibility.** Flagged in the dossier as a theme that could not be
verified: **no website-builder accessibility lawsuit was confirmed**, and the
only adjacent quote concerns WordPress. Our planned axe-core CI gate across
every block × variant × theme × breakpoint would be a claim no incumbent
currently makes. It is unbuilt, and the _market_ evidence for it is absent — do
not build a positioning argument on it until §8's follow-up is done.

---

## 3. The platform-risk case, with dates

### The record

| Date                          | What happened                                                                                                                                                                                                                                                                                           | Source                                                                                                                                                                                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feb 2016 → Jun 2016**       | **Behance ProSite discontinued.** "Behance ProSite is being discontinued as of June 2016… you can purchase a new Adobe Creative Cloud Plan (starting at $9.99) when you publish your Adobe Portfolio." The migration path from a dead portfolio product was _start paying for a software subscription_. | [Core77 boards](https://boards.core77.com/t/behance-prosite-discontinued-moving-to-adobe-portfolio/30813)                                                                                                                                                                                                 |
| **15 Jun 2023 / 7 Sep 2023**  | **Google Domains sold to Squarespace** — $180M, ~10 million domains.                                                                                                                                                                                                                                    | [Squarespace press releases](https://www.squarespace.com/press-releases/2023/6/15/squarespace-enters-definitive-agreement-to-acquire-google-domains-assets); [$180M via Domain Name Wire](https://domainnamewire.com/2023/06/15/squarespace-buys-google-domains-for-180-million/)                         |
| **17 Oct 2024**               | **Squarespace taken private by Permira**, $7.2B / $46.50 per share.                                                                                                                                                                                                                                     | [PetaPixel](https://petapixel.com/2024/10/18/private-equity-firm-permira-acquires-squarespace-for-7-2-billion/)                                                                                                                                                                                           |
| **17 Jan 2025 → 16 May 2025** | **Read.cv shut down** after acqui-hire by Perplexity. Four-month wind-down.                                                                                                                                                                                                                             | [TechCrunch](https://techcrunch.com/2025/01/17/perplexity-acquires-read-cv-a-social-media-platform-for-professionals/); announcement recovered from Internet Archive snapshot `20250305010750`                                                                                                            |
| **Oct 2025**                  | **Framer removed the Personal/Mini plan ($60/yr)**, cut CMS to one collection, cut bandwidth 50 GB → 10 GB.                                                                                                                                                                                             | r/framer [thread](https://www.reddit.com/r/framer/comments/1o2zf42/did_framer_just_kill_personal_site_plans/)                                                                                                                                                                                             |
| **30 Sep 2025**               | **Typepad shut down** — "exports won't be available after this date."                                                                                                                                                                                                                                   | [indieweb.org/site-deaths](https://indieweb.org/site-deaths)                                                                                                                                                                                                                                              |
| **15 Apr 2026**               | **Cal.com moved its production codebase from a public repository to a private one**, publishing a reduced open-source product (Cal.diy) relicensed AGPL-3.0 → MIT, with Organizations, Teams, Routing Forms, Workflows, Insights, API v1, SAML/SSO and audit logging removed.                           | [cal.com/blog/cal-diy-open-source-to-closed-source](https://cal.com/blog/cal-diy-open-source-to-closed-source) — fetched and confirmed 2026-08-12; reported 14–15 Apr 2026                                                                                                                                |
| **13 May 2026**               | **Webflow merged CMS and Business into a single "Premium" plan**; CMS item add-ons eliminated; a $2,500/mo Team plan added. Rollout: new purchases 13 May, existing sites from 29 Jun, legacy pricing 16 Nov 2026.                                                                                      | [BRIX, 18 May 2026](https://brixtemplates.com/blog/webflow-may-2026-pricing-changes-explained); [Flow Ninja, 15 May 2026](https://www.flowninja.com/blog/webflow-pricing-demystified); [Carly, 15 Jul 2026](https://www.usecarly.com/blog/webflow-pricing/) — Webflow's own announcement 403s to fetchers |
| **July 2026**                 | **Squarespace annual prices +19% to +26%, with no public memo.**                                                                                                                                                                                                                                        | [PetaPixel, 17 Jul 2026](https://petapixel.com/2026/07/17/squarespace-is-increasing-prices-by-up-to-26/)                                                                                                                                                                                                  |
| **Date UNVERIFIED**           | **Copyfolio's permanent free plan replaced with a 7-day trial.** A 2022 Copyfolio blog post describes a genuine free tier; the live page on 2026-08-12 shows only the trial.                                                                                                                            | [copyfol.io/pricing.html](https://copyfol.io/pricing.html); [blog.copyfol.io, 14 Jul 2022](https://blog.copyfol.io/explore-copyfolio-premium)                                                                                                                                                             |
| **Date UNVERIFIED**           | **UXfolio's free plan replaced with a 7-day trial that cannot publish.** Same company as Copyfolio, same price to the dollar.                                                                                                                                                                           | [uxfol.io/pricing](https://uxfol.io/pricing)                                                                                                                                                                                                                                                              |
| **Date UNVERIFIED**           | **Dribbble removed external profile links** — designers can no longer display links to personal websites unless clients pay through Dribbble.                                                                                                                                                           | [uxplaybook.org, 24 Mar 2025](https://uxplaybook.org/articles/why-designers-are-leaving-dribbble)                                                                                                                                                                                                         |

### Read.cv is the case, and the last fact is the whole argument

Read.cv did almost everything right. A three-person team, a monetised $6/month
product, a community people loved. The wind-down gave four months' notice and a
**genuinely good export by the standards of this industry**: profile and Sites
as JSON **plus a complete Next.js project**, Posts and Messages as Markdown.
Domains registered _through_ Read.cv were migrated to hello.cv.

Two things still went wrong, and both are instructive.

**The escape hatch was slightly broken.** The most technically useful reaction
([foote.pub, 18 Jan 2025](https://foote.pub/2025/01/18/read-cv-eol-nextjs.html))
praises the export as genuinely pro-user while documenting two concrete bugs:
"It expects a JPG copy of your profile photo to exist in the
`/public/content/media` directory in your repo," and "The profile photo is
self-hosted, which isn't supported by default in Vercel projects." An export
that has not been run end-to-end by someone who is not the author is a half-exit.

**Domains registered elsewhere and merely pointed at Read.cv simply stopped
resolving to content.** The lesson is the one a Squarespace user drew after the
Google Domains migration: "Yet another example as to why you **keep your domain
registration, site hosting, and web services (like email), separate**"
(u/north7, r/squarespace, 14p).

And then, checked 2026-08-12:

```
read.cv    → HTTP 402  "Payment required / DEPLOYMENT_DISABLED"  (Vercel)
posts.cv   → HTTP 402  "Payment required / DEPLOYMENT_DISABLED"  (Vercel)
hello.cv   → HTTP 200  live
```

**The shutdown notice outlived the site by less than eighteen months.** Nobody
is even paying the hosting bill on the page that explained the shutdown. That is
the entire case for owning your own domain, in one fact — and it needs no
adjectives.

The thesis statement for this product came from that thread:

> "Users are increasingly treated like stepping stools for founders… Users help
> grow a product with their network, their content, or their money, get
> comfortable with that product, integrate it into their lives... and then it's
> yanked out from under them. No, you're not (legally) obligated to provide a
> service in perpetuity… but what would it look like for founders to push back
> (even a bit) and say 'Listen, I want your money and you want my product, but
> you need to do something to take care of my users'?"
> — @JadoJodo, [HN 42742241](https://news.ycombinator.com/item?id=42742241)

There is also a canonical, maintained registry of this failure mode whose own
framing is quotable and which we did not write:

> "**Site deaths are when sites go offline, taking content and permalinks with
> them, and breaking the web accordingly. Site deaths are one of the big reasons
> why you should own your own identity and content on the web.**"
> — [indieweb.org/site-deaths](https://indieweb.org/site-deaths)

### How to use this without gloating

Seven rules. They are not politeness; each one protects a claim.

1. **Cite the date and the vendor's own words. Never characterise motive.**
   "Squarespace raised annual prices 19–26% in July 2026 and did not publish a
   memo" is checkable. "Squarespace is greedy" is not, and invites the argument
   we lose.
2. **Never predict a shutdown.** This dossier exists partly because three
   confidently-repeated shutdowns turned out not to have happened (§6).
   Prediction is exactly where this genre discredits itself.
3. **The people in these threads lost work and money.** They are witnesses, not
   ammunition. Quote them only when the point is about the mechanism they
   experienced, and never in a triumphant frame.
4. **Lead with the mechanism, not the villain.** Metered content plus no export
   means the cost of leaving rises with the value of what you built. That is a
   design property. Anyone can verify it; nobody can be offended by it.
5. **Credit good behaviour when it happens.** Read.cv gave four months and a
   real export. Framer _cut_ editor seats from $40 to $20 in May 2026 — the only
   price decrease anywhere in this dossier. Saying so makes every other claim
   more believable.
6. **Never launch off a fresh shutdown.** Turning up in a thread of people who
   just lost their sites is the fastest way to become the thing this document is
   about.
7. **Avoid "enshittification" and similar tribal shorthand.** It presumes motive
   and signals that we are talking to an in-group rather than to the
   photographer who is our actual user.

### The same could one day be said of us

It could, and the honest version is worse than it first looks.

**Cal.com is the case that breaks the naive licence argument.** They did not
even move to a restrictive licence — Cal.diy went _from_ AGPL-3.0 _to_ MIT, more
permissive, not less. What changed is that **the production codebase moved to a
private repository** and a long list of capabilities was removed from what is
published. The licence on the published artefact stayed excellent while the
published artefact got much smaller. **A permissive licence is a promise about
the code you can see, not about how much code you will be able to see.**

The same pattern, in gentler forms, is all over this research: Directus
relicensed to MSCL-1.0-GPL at v12 in May 2026 with a "Competing Use" clause;
Statamic is proprietary with hourly licence phone-home; Payload joined Figma in
June 2025 and Payload Cloud is "currently paused" for new projects; Decap's
maintainer states plainly, "There is no timeline for this as this is a
non-funded open-source project," while Decap Turbo is announced as a commercial
layer.

So our answers have to be structural, not rhetorical. There are exactly three.

**One: MIT cannot be revoked on what has shipped.** Every released version stays
MIT forever. If this project is relicensed, sold, abandoned or made worse, the
last good version remains forkable by anyone. That is a real, permanent
guarantee — and it is the _only_ one a licence can give.

**Two: MIT does not guarantee maintenance, and we should stop pretending it
does.** Gridea: 10,265 stars, MIT, dead since 2023-07-26. BioDrop: 5,692 stars,
MIT, archived. ezfolio, the highest-starred "open source portfolio builder" on
GitHub at 291 stars: dead since 2024-04-21. Bus factor here is one. A user
choosing us is choosing a different risk, not the absence of risk, and the
honest sentence is: _if this stops, you keep everything and someone can continue
it — you are not waiting on us to give it back._

**Three: the exit path must be a tested feature, not a claim.** Read.cv's export
was better than anything commercial in this dossier and still shipped two bugs
that broke the restore. The commitments that would make our version real:

- A **round-trip test in CI**: export from a populated install → fresh install →
  import → byte-identical published output. Until that exists, "export
  everything as a single JSON file" is an assertion.
- **The published site must render without our admin.** Content in plain
  Postgres, schema documented, no proprietary runtime.
- **Docker image tags pinned and retained**, so a version that works keeps
  working.
- **A written "if this project stops" page** in the repository, saying what a
  user should do — before anyone needs it.
- **Tell users to register their domain somewhere that is not their host.**
  That advice costs us nothing and is the single most valuable thing in this
  entire section.

Those five are the honest content of "you own it". Everything else is a licence
badge.

---

## 4. Pricing reality

All figures verified **2026-08-12** unless flagged. Squarespace, Wix, Webflow and
Framer render prices in JavaScript; where a live page did not yield a figure it
came from the vendor's help centre plus two or more dated third parties that
agree, and is flagged. **Every `UNVERIFIED` below is load-bearing.**

### 4.1 Prices

| Platform                | Free tier                                      | Entry paid (annual, per mo)             | Month-to-month         | Top tier                            | Flags                                                                                                                                                                                                                                |
| ----------------------- | ---------------------------------------------- | --------------------------------------- | ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Squarespace**         | **None** — 14-day trial                        | Basic **$19** (was $16)                 | **$25**                | Advanced $99 / $139                 | Core $29/$39, Plus $49/$65. **UNVERIFIED against the live JS pricing page**; two dated sources agree                                                                                                                                 |
| **Wix**                 | Yes, with ad banner                            | Light **$17**                           | **$24**                | Business Elite $159 / $172          | Core $29/$36, Business $39/$46. **UNVERIFIED at source.** Wix Studio track: $19/$27/$49/$159. **Restructure date UNVERIFIED**                                                                                                        |
| **Webflow**             | Starter, free                                  | Basic **$15**                           | **$25**                | Enterprise custom                   | Premium **$25**/$39 (new, 13 May 2026). Code export needs a **Workspace on top**: Core $19/mo or Freelancer $16/mo → **$34/mo minimum** for hosting + your own code. Team plan $2,500/mo exists                                      |
| **Framer**              | Yes, badged                                    | Basic **$10**                           | **UNVERIFIED**         | Pro $30                             | **Not one of six sources published month-to-month prices.** A "Scale" $100/mo plan appears in third-party articles but not on the live page — **UNVERIFIED**. Overages: $20/100 pages, $40/10 collections, $20/10k items, $40/100 GB |
| **Carrd**               | Yes, 3 sites                                   | **$9/YEAR** (Pro Lite)                  | n/a — annual only      | Pro Plus $49/yr                     | **Pro Standard $19/yr** is the tier with a custom domain. Note the inverted ladder: Pro Lite 25 at $29/yr has **no** custom domain                                                                                                   |
| **Cargo**               | Build-only, **cannot publish**                 | Standard **$14**                        | **$19**                | +Commerce $19.50 / $28              | Students and educators **free**. Free-tier storage, bandwidth and badge all **UNVERIFIED**                                                                                                                                           |
| **Format**              | **None** — 14-day trial                        | Basic **$10** (annual)                  | **$14**                | Pro Plus $26 regular / $36 monthly  | Pro **$17 regular**, $12 promo (code PROINTRO). **The $12 and $15 promo rates expire 31 Aug 2026, 11:59pm PST** — model at $17 and $26                                                                                               |
| **Pixpa**               | **None** — 15-day trial                        | Basic **$3.00** promo / **$4** standard | **$5**                 | Advanced $23.40 promo / $39 monthly | Live "Limited Time Offer": 40% off yearly vs a stated standard 20%. Standard yearly computed: $4 / $7.20 / $15.20 / $31.20                                                                                                           |
| **Adobe Portfolio**     | **None**                                       | **Not sold standalone**                 | —                      | —                                   | **Cheapest verified route: Behance Pro US$11.49/mo.** All Creative Cloud figures are third-party — **adobe.com timed out or 403'd on every attempt**                                                                                 |
| **Dunked**              | **None** — 10-day trial                        | Professional **$8**                     | **$12**                | Agency $19 / $29                    | **Currency not stated on the page; USD inferred — UNVERIFIED**                                                                                                                                                                       |
| **Semplice**            | n/a                                            | **$119 once** (Single, reg. $148)       | —                      | Business $699 (10 domains)          | Plus WordPress hosting, domain and all maintenance. **No direct support, no refunds**, by the vendor's own statement                                                                                                                 |
| **Super.so**            | Yes, badged                                    | Personal **$16/site/mo**                | —                      | Pro $28/site/mo                     | **Per site, not per account.** Analytics billed separately **$10–$400+/mo**. Entry rose $12 → $16 (+33%), **date UNVERIFIED**                                                                                                        |
| **Notion**              | Yes                                            | Plus ~**$8/user/mo** annual             | $10/user/mo            | Business $20                        | Custom domain is a **separate $8/mo (annual) or $10/mo add-on on top of a paid plan**. Realistic minimum for a portfolio on your own domain: **$18/mo**. 25-domain cap is **UNVERIFIED**                                             |
| **Contra**              | Yes                                            | Pro **$199/year**                       | $29/mo                 | —                                   | Free tier charges **$15, or $29 per payment over $500**, plus a 5% digital-product fee capped $3–$29                                                                                                                                 |
| **Journo Portfolio**    | Yes, 10 items                                  | Plus **$5**                             | $8                     | Unlimited $14 / $18                 | Custom domain starts at **Pro $8/mo**. Badge on free sites **UNVERIFIED**; store fees **UNVERIFIED**                                                                                                                                 |
| **Authory**             | Yes, 10 items                                  | Lite **$9**                             | $12                    | Professional $24 / $29              | Free and Lite monitor **zero sources** — the product's core function. Real functionality starts at Standard, **$180/yr**                                                                                                             |
| **Copyfolio**           | **None** — 7-day trial                         | Premium **$9** ($108/yr)                | $15                    | —                                   | Free plan withdrawn; **date UNVERIFIED**                                                                                                                                                                                             |
| **UXfolio**             | **None** — 7-day trial that **cannot publish** | Full Access **$9** ($108/yr)            | $15                    | —                                   | Same company as Copyfolio. Free-plan withdrawal date **UNVERIFIED**                                                                                                                                                                  |
| **Behance**             | Yes                                            | Pro **US$11.49/mo**                     | —                      | —                                   | Launched 13 Mar 2024 at $9.99 → **+15%**. Free tier pays a **15–30% platform fee** on transactions                                                                                                                                   |
| **Dribbble**            | Yes                                            | Lite **$4/mo billed yearly** ($48/yr)   | **none — annual only** | Plus $99/mo yearly = **$1,188/yr**  | The "personal website (Playbook)" is paid-only. **Whether Playbook supports a custom domain is UNVERIFIED**                                                                                                                          |
| **Ghost(Pro)**          | None                                           | Starter **$18/mo** yearly               | —                      | Business $199/mo                    | **Starter cannot install custom themes** — portfolio themes need Publisher at $29/mo. Ghost's own docs say "From $15/mo"; the pricing page says $18                                                                                  |
| **wordpress.com**       | Yes, with ads                                  | Personal **$4**                         | $9                     | Commerce $45 / $70                  | Free plan: 1 GB, no plugins, no custom domain, 7-day stats                                                                                                                                                                           |
| **WordPress self-host** | Software free                                  | **+$49–89/yr page builder**             | —                      | —                                   | Elementor Pro Essential $49/yr; Divi $89/yr; WPBakery $82 lifetime + $59/yr for updates. Plus hosting and domain                                                                                                                     |
| **CloudCannon**         | **None** — 21-day trial                        | **$55/mo** (3 users)                    | —                      | Team $350/mo                        | The only genuinely no-code Git-based CMS, and not self-hostable                                                                                                                                                                      |
| **Webstudio**           | Hobby, wstd.io                                 | Pro **$15/mo** yearly                   | —                      | Team $35/mo yearly                  | Self-hosting the Builder **"currently not recommended"** by its own docs                                                                                                                                                             |
| **Statamic**            | Core free                                      | **$349 per site** once, then **$99/yr** | —                      | Enterprise custom                   | Proprietary; licence validation phones home hourly                                                                                                                                                                                   |
| **Open Portfolio**      | **The product**                                | **$0**                                  | $0                     | $0                                  | Costs are a domain (~$10–15/yr from a registrar, not included) and, if you self-host, a server. v0.5.0 alpha                                                                                                                         |

### 4.2 What each free tier forbids, and the custom-domain rule

| Platform           | Free tier                                       | What it forbids                                                                                                                                                                                                                                                                                          | Cheapest custom domain                                                    | Domain included?                                                                                                                                    |
| ------------------ | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Squarespace        | **None.** 14-day trial                          | Custom domains, **search-engine indexing**, Search Console/Bing verification, payments, subscription products, customer emails, form-submission emails, Apple Podcasts, Getty. Private by default, max 5 contributors, one 7-day extension. On expiry **"all content is marked for permanent deletion"** | Basic, **$228/yr**                                                        | Year one free, **annual billing only**. Renewal price **UNVERIFIED** — the help article declines to publish it                                      |
| Wix                | Publishes, with a **scrolling ad banner**       | Custom domain, ecommerce, Google Analytics, advanced SEO; 500 MB storage, 1 GB bandwidth                                                                                                                                                                                                                 | Light, **$204/yr**                                                        | Year-one voucher on annual. Renewal conflicts across sources ($13.35 / $14.95 / ~$17) — **UNVERIFIED**. Private registration +$9.90/yr              |
| Webflow            | Starter                                         | Custom domain, code export; **2 pages**, 50 CMS items, 1 GB bandwidth, **50 lifetime form submissions**; webflow.io + badge                                                                                                                                                                              | Basic, **$180/yr**                                                        | **No — Webflow is not a registrar.** In-product purchase goes through IONOS                                                                         |
| Framer             | framer.website + permanent badge                | Custom domain; 1 GB bandwidth, **5 MB upload cap**; 30 pages                                                                                                                                                                                                                                             | Basic, **$120/yr**                                                        | **Yes**, free custom domain on Basic                                                                                                                |
| Carrd              | 3 sites, "Made with Carrd"                      | Custom domains, forms                                                                                                                                                                                                                                                                                    | **Pro Standard, $19/yr** — ~$1.58/mo                                      | No — Carrd does not sell domains. SSL via Let's Encrypt                                                                                             |
| Cargo              | **Cannot publish at all**                       | Everything public                                                                                                                                                                                                                                                                                        | Standard, **$168/yr**                                                     | One included; extra domains $2/mo yearly. Year-one and renewal **UNVERIFIED**                                                                       |
| Format             | **None.** 14-day trial                          | —                                                                                                                                                                                                                                                                                                        | Pro, **$204/yr regular**                                                  | Year one free from Pro. Basic can connect a domain you own; **Format's support team does the DNS**. Renewal **UNVERIFIED** (`help.format.com` 403s) |
| Pixpa              | **None.** 15-day trial                          | —                                                                                                                                                                                                                                                                                                        | **Basic, $36/yr promo (~$48 standard)** — cheapest of any hosted platform | Free year-one domain on annual **except Basic**                                                                                                     |
| Adobe Portfolio    | **None** — needs a paid CC or Behance Pro plan  | —                                                                                                                                                                                                                                                                                                        | Behance Pro, **$137.88/yr** (includes up to 5 sites)                      | No — buy from a registrar. **One custom domain per site**                                                                                           |
| Dunked             | **None.** 10-day trial                          | —                                                                                                                                                                                                                                                                                                        | Professional, **$96/yr**                                                  | No — "You will need to purchase your own domain name from a registrar of your choice"                                                               |
| Super.so           | super.site + "Made with Super" badge            | Custom domain, custom code, password protection, custom fonts, RSS, SSL, SEO features, manual publishing, file uploads, redirects, multi-language                                                                                                                                                        | Personal, **$144/yr per site**                                            | No                                                                                                                                                  |
| Notion             | Yes                                             | Custom domain (paid plan **and** a paid add-on); **5 MB upload cap**; 10 guests; 7-day history                                                                                                                                                                                                           | Plus + add-on, **~$216/yr**                                               | No                                                                                                                                                  |
| Contra             | `[handle].contra.com`, **Sydney template only** | All other templates, customisation, custom domain, full analytics, priority placement, priority support                                                                                                                                                                                                  | Pro, **$199/yr** — the most expensive domain gate in the dossier          | No                                                                                                                                                  |
| Journo Portfolio   | 10 items, **home page only**                    | Custom domain, article backups, password protection, store                                                                                                                                                                                                                                               | Pro, **$96/yr**                                                           | Domain change after registration ~$10 on Pro                                                                                                        |
| Authory            | 10 items                                        | **Search-engine indexing**, custom domain, auto-updating (0 sources monitored), password protection, secret links, media uploads, API; branding cannot be removed below Lite                                                                                                                             | Standard, **$180/yr**                                                     | Free domain for 12 months on yearly, Standard and above                                                                                             |
| Copyfolio          | **None** — 7 days                               | —                                                                                                                                                                                                                                                                                                        | Premium, **$108/yr**                                                      | Not documented                                                                                                                                      |
| UXfolio            | 7-day trial, **cannot publish**                 | Publishing live portfolios or case studies, custom domains, feedback, GA4, password protection; branding unremovable                                                                                                                                                                                     | Full Access, **$108/yr**                                                  | Not documented                                                                                                                                      |
| Behance            | Yes                                             | Custom domain (never — needs Adobe Portfolio); analytics; password protection; scheduled publishing; **15–30% platform fee on transactions**                                                                                                                                                             | n/a — via Behance Pro → Adobe Portfolio                                   | —                                                                                                                                                   |
| Dribbble           | Yes, **10 shot uploads/day**                    | Personal website (Playbook), recommendations/InstantMatch, enhanced profile, GA                                                                                                                                                                                                                          | Lite, **$48/yr**                                                          | **Playbook custom-domain support UNVERIFIED**                                                                                                       |
| **Open Portfolio** | **The whole product**                           | Nothing we impose. **The host's limits apply**: Vercel Hobby is non-commercial-use-only (see §1); Supabase free projects pause after ~7 days idle; Neon free is 0.5 GB storage / 100 CU-hours; Vercel Blob 1 GB                                                                                          | **Cost of a domain only** (~$10–15/yr)                                    | **No** — you buy it, you set the DNS record. This is a real friction point we have not removed                                                      |

### 4.3 The three numbers worth remembering

1. **Zero of twenty commercial platforms give a custom domain on a free tier.**
   The cheapest is Carrd at $19/yr, which builds only one-page sites; the
   cheapest that can build a multi-page portfolio is Pixpa Basic at $36/yr promo
   (~$48 standard), capped at 200 images across 10 pages.
2. **Webflow bills twice.** A published site plus your own code is **$15 + $19 =
   $34/mo minimum** — and the export strips exactly the CMS content that a
   portfolio is made of.
3. **Adobe Portfolio has a kill switch.** "If you cancel or choose not to renew
   your creative cloud membership, **your site will remain live for 14 days.
   After this 14-day grace period, your site will come offline.**"
   ([Adobe Product Community](https://community.adobe.com/questions-606/what-happens-to-my-portfolio-once-i-end-my-adobe-subscription-578410))
   Your portfolio is a hostage to a Photoshop subscription.

---

## 5. The feature matrix

**How to read this.** `?` means **not verified** — it does not mean "no". Do not
convert a `?` into a claim without checking it. **Y** = yes at the tier named ·
**N** = no · **$N** = paid tier only.

### 5.1 The four columns that matter most

| Platform                       | Custom domain on free tier                                                                       | Export your data                                                                                                                                         | Self-host                                  | Open source               |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------- |
| Squarespace                    | **N** — no free tier exists                                                                      | Partial XML; **excludes portfolio pages, galleries, Custom CSS, styling**                                                                                | N                                          | N                         |
| Wix                            | **N**                                                                                            | **N** — "your site must run on Wix's servers"                                                                                                            | N                                          | N                         |
| Webflow                        | **N** — Starter is 2 pages, no domain                                                            | Static HTML/CSS/JS, **needs a paid Workspace on top of a site plan**; loses CMS, forms, ecommerce                                                        | Exported static only                       | N                         |
| Framer                         | **N**                                                                                            | **N** — no native export                                                                                                                                 | N                                          | N                         |
| Carrd                          | **N**                                                                                            | **Y** — "unminified HTML, CSS, JS, and images"                                                                                                           | Y, from export                             | N                         |
| Cargo                          | **N** — free tier cannot publish                                                                 | **?** — none documented anywhere reachable                                                                                                               | N                                          | N                         |
| Format                         | **N** — no free tier                                                                             | **?** — none documented                                                                                                                                  | N                                          | N                         |
| Pixpa                          | **N** — no free tier                                                                             | **N** — "They cannot be downloaded or hosted elsewhere"                                                                                                  | N                                          | N                         |
| Adobe Portfolio                | **N**                                                                                            | **N** — and the site goes offline 14 days after cancellation                                                                                             | N                                          | N                         |
| Dunked                         | **N** — no free tier                                                                             | **?** — help centre has no export topic                                                                                                                  | N                                          | N                         |
| Semplice                       | n/a — a WordPress product                                                                        | **Y** — your own WordPress DB, WXR/SQL                                                                                                                   | **Y**                                      | N — proprietary licence   |
| Super.so                       | **N**                                                                                            | Content lives in Notion and exports from there                                                                                                           | N                                          | N                         |
| Notion                         | **N** — paid plan **plus** an $8–10/mo add-on                                                    | **Y** — PDF, HTML, Markdown, CSV                                                                                                                         | N                                          | N                         |
| Contra                         | **N** — Pro only, $199/yr                                                                        | **?** — no export topic in help centre                                                                                                                   | N                                          | N                         |
| Journo Portfolio               | **N**                                                                                            | Partial — **PDF only**                                                                                                                                   | N                                          | N                         |
| Authory                        | **N**                                                                                            | "Full backups" on all plans; **extraction path undocumented**                                                                                            | N                                          | N                         |
| Copyfolio                      | **N** — no free tier any more                                                                    | **?** — none documented                                                                                                                                  | N                                          | N                         |
| UXfolio                        | **N** — free tier cannot publish                                                                 | **N** — "You can't export your portfolio from UXfolio"                                                                                                   | N                                          | N                         |
| Behance                        | **N** — never                                                                                    | **N**                                                                                                                                                    | N                                          | N                         |
| Dribbble                       | **?** — no site on free; Playbook from $48/yr                                                    | **N**                                                                                                                                                    | N                                          | N                         |
| Ghost (self-hosted)            | **Y**                                                                                            | **Y** — JSON content export                                                                                                                              | **Y**                                      | **Y**, MIT                |
| WordPress (self-hosted)        | **Y**                                                                                            | **Y** — WXR/XML plus DB                                                                                                                                  | **Y**                                      | **Y**, GPL                |
| wordpress.com free             | **N**                                                                                            | **Y** — WXR/XML                                                                                                                                          | N                                          | platform GPL, hosting not |
| Astro / Hugo / Jekyll starters | **Y**                                                                                            | **Y** — the files are yours                                                                                                                              | **Y**                                      | **Y**                     |
| Publii                         | **Y**                                                                                            | **Y** — static output                                                                                                                                    | **Y**                                      | **Y**, GPL-3.0            |
| Grav                           | **Y**                                                                                            | **Y** — flat files                                                                                                                                       | **Y**                                      | **Y**, MIT                |
| Statamic                       | **Y**                                                                                            | **Y** — flat files                                                                                                                                       | **Y**                                      | **N** — proprietary       |
| Webstudio                      | **Y** on hosted Pro ($15/mo); Hobby is wstd.io                                                   | **Y** — CLI or download                                                                                                                                  | Builder self-hosting **"not recommended"** | **Y**, AGPL-3.0           |
| CloudCannon                    | **N** — no free tier, $55/mo                                                                     | **Y** — content is in your Git repo                                                                                                                      | **N**                                      | **N**                     |
| **Open Portfolio v0.5.0**      | **Y** — you own the domain because the hosting is yours (**you must buy and point it yourself**) | **Y** — single-file JSON export at any time, plus your own Postgres, plus the source. **The export has not been round-trip tested into a fresh install** | **Y** — `docker compose up`                | **Y**, MIT                |

### 5.2 Us against the best in the field, feature by feature

The honest version. "Best commercial" and "best open source" name the strongest
option in the dossier for that feature, not the average.

| Feature                         | Best commercial                                                                                     | Best open source                                                                      | **Open Portfolio v0.5.0**                                                                                                   | Verdict                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| No-code editing, end to end     | Squarespace / Wix / Framer — mature                                                                 | **CloudCannon ($55/mo, not self-hostable)**; nothing free and self-hostable qualifies | **Y — the entire premise.** Every word, image, colour, section and SEO field edits from the admin                           | **We win.** This is the row nothing else occupies                         |
| Non-technical install           | Any hosted platform — sign up                                                                       | Grav ("extract the zip into your webroot"); Publii (desktop app, then a PAT)          | **Y** — deploy button, or `docker compose up`                                                                               | **We win**, subject to the Vercel Hobby clause                            |
| Editing after install           | All hosted platforms                                                                                | Grav Admin Next; Statamic control panel; Publii (**one computer only**)               | **Y** — browser admin, draft/publish, autosave                                                                              | **We win** on the combination; individual admins are more mature          |
| Templates / themes              | Squarespace, Format, Pixpa — dozens                                                                 | Grav: 128 themes, 56 skeletons; Statamic: 65 starter kits ($70–99)                    | **1 theme.** Six planned in 0.6                                                                                             | **We lose badly**                                                         |
| Custom domain cost              | Carrd $19/yr; Pixpa $36/yr                                                                          | Free — the domain is yours                                                            | **Free** — you buy the domain                                                                                               | **We win**, but nobody sets up DNS for you                                |
| Export                          | Carrd — unminified HTML/CSS/JS                                                                      | Semplice / Grav / SSGs — the files are yours                                          | **JSON export + your own Postgres + the source**                                                                            | **We win on paper.** Untested round-trip                                  |
| Blog                            | Squarespace, Webflow, Ghost                                                                         | Ghost, WordPress, Grav                                                                | **N** — planned 0.9                                                                                                         | **We lose**                                                               |
| Page / block builder            | Webflow, Framer, Wix                                                                                | Webstudio, Silex, GrapesJS                                                            | **N** — planned 0.7                                                                                                         | **We lose**                                                               |
| SEO controls                    | Squarespace, Webflow                                                                                | WordPress + plugin                                                                    | **Y** — SSR, per-page title/description/OG/Twitter, generated `sitemap.xml` + `robots.txt`                                  | **Comparable.** No ranking evidence                                       |
| Measured performance            | **Duda 84.87% CWV**; Wix 74.86%; Squarespace 70.39%                                                 | WordPress 46.28%                                                                      | **Unmeasured.** Budgets set, nothing run                                                                                    | **Unknown — assume we lose until measured**                               |
| Storage for images              | Format Pro 100 GB; Pixpa Pro 25 GB; Wix Core 50 GB                                                  | Your disk                                                                             | **Neon 0.5 GB + Blob 1 GB** on the free path; unlimited on your own server                                                  | **We lose on the free path**                                              |
| Uploads to hosted object stores | Proven at scale                                                                                     | —                                                                                     | **Code path covered by a conformance suite; never run against live Supabase Storage or Vercel Blob with real credentials**  | **Unverified — our biggest own-product risk**                             |
| Contact form                    | All                                                                                                 | WordPress plugin; Statamic (one form free)                                            | **Y** — enquiries land in an in-admin inbox; SMTP optional for notification and reset. **No OTP, no spam protection wired** | **Comparable, thinner**                                                   |
| Analytics                       | Squarespace built-in; Webflow Analyze $9/mo; Super.so $10–400/mo                                    | Umami (self-host)                                                                     | **N** — nothing wired                                                                                                       | **We lose**                                                               |
| Version history                 | Squarespace/Webflow have partial undo                                                               | Git, for the technical                                                                | **Y** — every publish snapshots; any version restorable; capped at 20                                                       | **We win** — and it is not a feature anyone else in this category markets |
| Content health checks           | —                                                                                                   | —                                                                                     | **Y** — 16 checks over published content, each linking to the screen that fixes it                                          | **We win** — no equivalent found anywhere in the dossier                  |
| Password-protected pages        | Squarespace (all plans, one shared password, 4-hour session, kills indexing); Format, Pixpa, Dunked | Ghost (private site); WordPress plugin                                                | **N**                                                                                                                       | **We lose**                                                               |
| Multi-language                  | Journo Portfolio $8/mo for 3; Framer **$20/locale**; Webflow $9–29/mo                               | WordPress plugins; Sveltia CMS first-class i18n                                       | **N**, and not on the roadmap to 1.0                                                                                        | **We lose**                                                               |
| Client galleries / proofing     | Format 50–250; Pixpa gallery links                                                                  | —                                                                                     | **N**                                                                                                                       | **We lose**                                                               |
| Commerce                        | All hosted platforms                                                                                | WooCommerce; Statamic                                                                 | **N**                                                                                                                       | **We lose**                                                               |
| Mobile editing                  | Notion, Behance, Dribbble, wordpress.com apps                                                       | **?** — least-documented column in the dossier                                        | **?** — preview has 3 frames; admin usability on a phone unverified; PWA researched, unbuilt                                | **Unknown for everyone — a genuine open gap**                             |
| Accessibility guarantees        | None found                                                                                          | None found                                                                            | Planned: axe-core over every block × variant × theme × breakpoint in CI. **Unbuilt**                                        | **Nobody currently wins.** Potential differentiator                       |
| Support                         | Squarespace email/chat, no phone, 435 BBB complaints                                                | Community forums                                                                      | **GitHub issues, bus factor 1**                                                                                             | **We lose**                                                               |
| Maturity                        | Years in production                                                                                 | Ghost since 2013; WordPress since 2003                                                | **v0.5.0 alpha, private repo, zero stars**                                                                                  | **We lose**                                                               |

### 5.3 What the matrix shows

1. **Custom domain on a free tier does not exist in the commercial set.** Twenty
   platforms, zero. The only rows with one are the self-hosted ones, where the
   domain is yours because the hosting is yours.
2. **"Open source" and "no-code editor" almost never co-occur.** The only rows
   with both are Grav (needs a PHP 8.3.11+ webroot), Publii (desktop-only,
   single computer) and Webstudio (tells you not to self-host the builder).
   **That is the entire competitive field for this product** — and we should
   expect to be compared against those three, not against Squarespace.
3. **Mobile editing is the least-documented column in the whole dossier.**
   Nobody has verified that a _designed_ portfolio can meaningfully be edited
   from a phone on any platform. If the gap is real it is one of the more
   defensible differentiators available — and it is unverified for us too.
4. **Our two unique rows are unglamorous**: version history with restore, and
   sixteen content-health checks that link to the screen that fixes each
   problem. Neither appears anywhere else in this research. Both are more
   defensible than anything we could say about design.

---

## 6. Corrections to the brief

**Three premises the research was asked to confirm did not survive
verification.** Anyone writing from memory would repeat all three. A live-status
sweep on 2026-08-12 contradicts each.

| Premise                        | What is actually true                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"Coroflot shut down"**       | **It did not.** `coroflot.com` returned HTTP 200 on 2026-08-12 with live job listings, a running Core77 × Autodesk Fusion competition with a **28 Sep 2026** deadline and a $9,750 prize pool, and a weekly featured-designer showcase. What actually happened is quieter and more common: the portfolio section was pulled from Core77's navigation in **December 2024** ([Core77 boards](https://boards.core77.com/t/no-more-coroflot-portfolio-section/93876)), and a Basic/Pro tier gating project count appeared in **March 2026** ([Core77 boards](https://boards.core77.com/t/96133)). **Feature removal followed by paywalling — not a shutdown.** |
| **"Dunked is dead"**           | **It is not.** `dunked.com` returns 200, `secure.dunked.com/signup` serves a working signup form with a live "Create my portfolio" button, pricing and templates are live, and a 2025 relaunch is documented. It claims "we've helped more than 100,000 talented people." Its last _public_ product update was **31 March 2025** ([blog.dunked.com](https://blog.dunked.com/the-latest-from-dunked/)) — roughly 17 months stale. **Quiet, not dead.** The defensible claim is "no documented export path and no public update since March 2025", not "shut down".                                                                                          |
| **"Format changed ownership"** | **No evidence of any ownership change was found.** `format.com` returns 200 and is trading normally. Do not assert this in any form.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

A fourth premise — "Cargo Collective v1→v2/v3 migrations breaking sites" — is
**plausible but not independently verified**. Three incompatible generations with
three separate documentation sites demonstrably exist, and Cargo 3's docs carry a
"Moving from Cargo 2 to 3" article. But the only vivid description of migration
pain comes from **a vendor selling migration services**, and **no official
end-of-life date for Cargo 1 or Cargo 2 could be found**.

**The replacement case study is better than any of them.** Behance ProSite →
Adobe Portfolio (2016) has a verbatim shutdown notice, a dated deadline, and
contemporaneous user reactions describing the exact re-upload cost — "**30+
projects and 100s of images. Ugh.**"

### Four more corrections worth carrying, because they are the same kind of trap

- **Decap CMS is not unmaintained.** 157 commits and **12 releases** in the last
  twelve months; the maintainer, on the record: "It's actively maintained. Some
  months we do more, some we do less." The real risk is funding — "There is no
  timeline for this as this is a non-funded open-source project" — and the real
  defect is that **Netlify Git Gateway _is_ deprecated** while Decap's docs still
  route new users onto it with no warning.
- **Netlify Identity was NOT sunset.** The deprecation was announced and then
  reversed: "**Update, February 19, 2026: Netlify Identity will continue as a
  supported authentication option on Netlify**"
  ([netlify.com](https://www.netlify.com/blog/auth0-extension-identity-changes/)).
- **TinaCMS is not discontinued.** v3.11.0 shipped 2026-07-16. The shutdown
  people remember is its predecessor **Forestry, killed April 2023**.
- **Dribbble did not remove its free tier.** A free tier demonstrably exists with
  shot uploads, client leads and 15 brief credits a month; the June 2024 change
  moved _toward_ free access. The removal of **external profile links** is the
  real and genuinely hostile change — date **UNVERIFIED**.

---

## 7. Two statistics that do not exist

Both are things people expect to find in this space. **Neither exists. Neither
may be invented, estimated, or "roughly" stated.**

**1. "X% of hiring managers look at a portfolio."**
There is no such figure. It is **not** in NACE's Job Outlook research, which
measures the _skills_ employers seek on résumés — the real NACE findings are
"nearly 90% [of employers] indicated they are seeking evidence of a student's
ability to solve problems and nearly 80% are seeking candidates who have strong
teamwork skills" (Job Outlook 2024,
[naceweb.org](https://www.naceweb.org/about-us/press/the-key-attributes-employers-are-looking-for-on-graduates-resumes)).
Nothing about portfolios. It was not found anywhere else either.

**2. "Recruiters spend N seconds on a portfolio."**
No credible study exists. **The frequently-cited six-second figure is from
TheLadders' eye-tracking study of _résumés_, not portfolios.** Repurposing it is
a fabrication, and it is the specific fabrication most likely to be spotted.

### What to say instead

Three substitutes, each with its own honest label:

- **A federal labour-market authority, verbatim** — the strongest citation
  available: "**Graphic designers should demonstrate their creativity and
  originality through a professional portfolio**" and "Candidates for graphic
  design positions should have a portfolio that demonstrates their creativity and
  originality" ([BLS Occupational Outlook Handbook, Graphic
  Designers](https://www.bls.gov/ooh/arts-and-design/graphic-designers.htm) —
  265,900 US jobs).
- **Survey data, with the year attached** — CareerBuilder / Harris Poll, 2,300+
  hiring managers, fieldwork 16 Feb – 9 Mar 2017: **70% of employers use social
  media to screen candidates**, and **57% are less likely to interview a
  candidate they cannot find online**
  ([PRNewswire, 15 Jun 2017](https://www.prnewswire.com/news-releases/number-of-employers-using-social-media-to-screen-candidates-at-all-time-high-finds-latest-careerbuilder-study-300474228.html);
  the 2018 follow-up held at 70%). **This is 2017/2018 data and no more recent
  equivalent with comparable methodology was found. Always cite the year.**
- **An anecdote, labelled as one** — a hiring manager who describes having "hired
  dozens of $100k/year+ designers": "**Most design managers spent 1-3 mins
  looking at your work. Optimize for that.**" (u/MK-XXIIV, r/UXDesign,
  2022-08-31). Useful as a design brief, never as a statistic.

---

## 8. What is still unknown

### The biggest hole: there are no review-site ratings anywhere in this research

**Trustpilot, G2 and Capterra returned HTTP 403 to every available method,
including a real browser.** There are no star ratings, no review counts and no
review quotes from any of the three anywhere in the dossier or in this document.
X/Twitter was not fetchable either.

**Why this matters more than it looks.** Every complaint in §2 comes from a venue
where complaining is the purpose — r/WIX, r/squarespace, r/webflow, Hacker News.
That corpus is evidence that _specific pains exist and are severe_. It is **not**
a satisfaction measurement, and it must never be presented as one. The dossier's
complaint volume tells us nothing about the denominator.

**What would change if we had the data:**

- **If the incumbents score badly** (say Wix low with a large review count), the
  positioning broadens from "you should own your work" to "the incumbents are
  disliked _and_ you should own your work" — a much easier comparison page, and a
  quotable third-party number, which is the highest-converting format in this
  category.
- **If they score well** — Wix at 4.2/5 across tens of thousands of reviews is
  entirely plausible — then the "everybody hates them" framing is simply wrong,
  and we must argue on ownership, price and exit alone. **We should want to know
  this before we write copy, not after someone corrects us in a comment
  thread.** This is the realistic outcome to plan for.
- Either way it would give the one thing this research completely lacks: a
  measure of _typical_ rather than _aggrieved_ experience.

**The cheapest way to get it: twenty minutes of manual browsing on a normal
machine.** The 403s are datacentre-IP blocks, not paywalls. In order of cost:

1. **Open the G2, Capterra and Trustpilot profile pages for Wix, Squarespace,
   Webflow and Format in an ordinary browser on a residential connection, and
   record the score, review count and date.** Free. This is the answer.
2. A phone on mobile data, if the desktop connection is also blocked. Free.
3. A residential proxy for a scripted pull — roughly $1–5 for a one-off. Only
   worth it if this needs to be repeatable.
4. **Not worth it:** G2's API or Gartner Digital Markets (Capterra) commercial
   data. Trustpilot's free Business Unit API only covers your own company, not
   competitors.

Record the retrieval date with every figure — these scores move.

### Everything else that is open, in priority order

| #   | Open question                                                                | Why it matters                                                                                                                                                                           | Cheapest resolution                                                                                                                                         |
| --- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Does Vercel Hobby's non-commercial clause exclude a freelance portfolio?** | It is our primary documented deployment path and our audience is freelancers. "Advertising the sale of a product or service" and "Asking for Donations" are both named as commercial use | **A product decision, not research.** Either document Netlify/Docker as the path for anyone selling anything, or ask Vercel directly and publish the answer |
| 2   | **Do our uploads work against live Supabase Storage and Vercel Blob?**       | Portfolios are images. The conformance suite covers the code path; neither live service has been exercised with real credentials                                                         | One afternoon with two free accounts. Blocking for any launch claim                                                                                         |
| 3   | **What are our own Core Web Vitals?**                                        | The incumbents have numbers (Duda 84.87%, WordPress 46.28%) and we have none. We must clear 46% to be credible                                                                           | Deploy the demo, run Lighthouse and CrUX. Blocking for any performance claim                                                                                |
| 4   | **Can a designed portfolio be edited from a phone, on any platform?**        | The least-documented column in the entire dossier. If nobody does it well, it is a differentiator — for us too, and ours is unverified                                                   | Fifteen minutes each on Squarespace, Wix, Framer and Webflow trials, on a phone                                                                             |
| 5   | **Does our JSON export round-trip into a fresh install?**                    | §3 — an untested export is not an exit path, and Read.cv proves it                                                                                                                       | A CI test. Should exist before the repo goes public                                                                                                         |
| 6   | **Fresh Core Web Vitals from HTTP Archive**, including open-source platforms | Current figures are a news article's summary of Nov 2025 data                                                                                                                            | Query [httparchive.org](https://httparchive.org) directly                                                                                                   |
| 7   | **Webflow's "State of the Website" survey**                                  | The closest thing to primary research on what website owners actually want; `webflow.com/state-of-the-website` 404s and the live URL was not located                                     | Search; it reportedly covers 1,000 respondents across US/UK/CA for 2025 and 2026                                                                            |
| 8   | **Adobe's General Terms, "Your Content" clause**                             | Needed before any ownership claim about work posted to Behance. `adobe.com/legal/terms.html` timed out on every attempt                                                                  | Read it manually                                                                                                                                            |
| 9   | **Accessibility litigation in this category**                                | Theme 13 is entirely unverified — no builder lawsuit was confirmed. Our axe-core plan needs a reason to exist                                                                            | UsableNet's annual digital accessibility lawsuit report                                                                                                     |
| 10  | **Netlify's credit system** — what one credit buys                           | It is our fallback for anyone excluded by #1, and its real free-tier capacity is undocumented (the credits doc 404s)                                                                     | Ask Netlify, or measure on a live free site                                                                                                                 |

### Standing UNVERIFIED list carried into this document

Prices and limits still flagged, so nothing here silently hardens into fact:
Framer month-to-month prices (six sources, none published them) and the "Scale"
$100/mo plan; Wix's plan-restructure date and .com renewal price; Squarespace's
.com renewal price (the official article declines to state it) and the exact
effective date of the July 2026 rise; Format's export capability and domain
renewal price; Cargo's export capability, free-tier storage, bandwidth and badge;
Dunked's export capability and currency; Contra's export and portfolio custom
domain; Authory's export formats; Journo Portfolio's badge and store fees;
Copyfolio's and UXfolio's free-plan withdrawal dates; Dribbble Playbook custom
domain, the date external links were removed, and whether the job board was shut
down or renamed; all Adobe Creative Cloud prices; Super.so's $12 → $16 date;
Decap Turbo pricing; TinaCMS self-hosted feature limitations; Sanity Content Lake
self-hostability; Elementor and Builder.io prices above the entry tier; every
market-size figure (analysts disagree **2.4×** on the same year — $2.2B to $5.4B,
CAGR 6.4% to 16.58%); Grand View Research's website-builder report, which appears
**not to exist**; Statista and MarketsandMarkets figures; the global designer
count; r/selfhosted's subscriber count from Reddit's own API.

**Two figures with provenance warnings that must travel with them:** the
"1.57 billion freelancers worldwide" number traces to ILO self-employment data
that **includes subsistence farmers and informal traders** — the World Bank's
narrower estimate for online gig-platform workers is **154–435 million**. And
"86.5 million US freelancers by 2027" is **a projection, not a measurement**.
