# Landing page and marketing site

**Status:** decision-ready, buildable. **Written:** 2026-08-12.
**Evidence:** [`_raw-oss-marketing.md`](./_raw-oss-marketing.md) (primary), [`_raw-market.md`](./_raw-market.md) (competitor facts and user complaints), [`SEO-STRATEGY.md`](./SEO-STRATEGY.md) (positioning and vocabulary constraints). Section references in square brackets point at those files.
**Product state assumed:** v0.5.0, repository private, zero GitHub stars, no domain, no marketing site, one theme, seven page-block types, no blog.

Every competitor claim in this document carries a source URL and a verification date. Anything marked **UNVERIFIED** must not be published as fact. Two portfolio statistics that circulate widely **do not exist** and are banned outright — see §11.3.

---

## 0. The five constraints this plan is built around

1. **"Open source portfolio builder" is not a search term.** Google returns one echo-only autocomplete prediction for it. Two audiences use vocabularies that never meet [SEO §1.1–1.2].
2. **The comparison framing carries a 7–13× lift on Hacker News and appears in one homepage H1 out of twenty-four.** READMEs and homepages disagree on purpose [OSS §6b.3, §1.25, §2.3].
3. **"Demo" is a captured word.** Six of twenty-four projects use it to mean "talk to a salesperson"; `directus.io/demo` literally 302s to a sales page [OSS §4.2].
4. **Five archived zero-proof homepages were recovered.** Supabase shipped a 6-star repo on its homepage; Dub shipped 3. All five named an incumbent, put a demo or real code above the fold, named a real human and a real place, and used **no customer logo wall** [OSS §5.10–5.15].
5. **When nothing is paid, nobody calls it "Pricing".** Six replacements were observed, and the two projects with the strongest integrity reputations have no money surface at all [OSS §8.10].

---

## 1. Positioning

### 1.1 The two-vocabulary problem, and where it is actually solved

It is not solved in a sentence. It is solved by URL [SEO §2]: one vocabulary per page, never blended inside a paragraph. The homepage is the deliberate exception, because its job is not ranking — it is **conversion for both audiences and five-second classification by a listicle author**.

So the homepage has to do something no other page does: carry the creative promise in the headline and the technical vocabulary in the line directly beneath it, without either reading as keyword stuffing. The evidence says exactly how. Twelve of twenty-four sub-headlines in the corpus carry "open source", "self-host" or "your own server", while only three of twenty-four H1s do [OSS §2.4, §1.25]. **The H1 is where the outcome lives; the sub-headline is where "open source" earns its keep.**

### 1.2 The chosen line

**H1: "Build a portfolio site you own outright."**

**Sub-headline:** "Open Portfolio Builder is a free, open-source website builder for portfolios — a self-hosted alternative to Adobe Portfolio, Squarespace, Wix and Framer. Edit every word, image and colour from an admin panel. Your content lives in your database, on your domain, and it stays there when you stop paying anybody."

**Why this line:**

- **"Own outright" is the grievance, in the users' own words.** The market research recovered a user writing "I also really really do not like that they 'own' my website and that I have no control over it" and, in the same thread, "**At some point, I think a free open source product will compete with the mayor players**" [Market §Theme 2]. We are not inventing a want; we are answering one that was typed out.
- **"Build a…" is the dominant, proven H1 formula** — outcome-led, eleven of twenty-four [OSS §2.2A].
- **The sub-headline names four incumbents, not one.** Multi-target naming is normal and does not hurt: "Intercom, Drift, Zendesk, FreshChat" scored 417 on HN, "DataDog, NewRelic" 510, and Coolify's own sub-headline names Vercel, Heroku, Netlify and Railway [OSS §6b.3, §1.8]. It is also honest: this market is genuinely fragmented and we have no single villain [SEO §5.1, caveat 3].
- **It contains "open-source" and "self-hosted" verbatim and in plain sight**, which is the SEO precondition for the homepage being usable as an outreach landing target [SEO §2].
- **It puts the reason to switch in the last clause**: "it stays there when you stop paying anybody" is a direct answer to Adobe's fourteen-day kill switch and Wix's "your site must run on Wix's servers" [Market §1.9, §Theme 3].

### 1.3 Rejected alternatives, and why

| Rejected                                                         | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"The open-source Squarespace alternative"**                    | One villain we cannot support. Squarespace sells commerce, scheduling, email campaigns and a blog; we sell none of those. A straw-man positioning invites the exact penalty PostHog's public handbook names: _"Assume they are reading and will dunk on you for being dishonest"_ [OSS §3.14]. Separately, `squarespace alternatives` is owned by Tooltester (~8,500 words), Website Planet and Zapier and is unwinnable from zero authority [SEO §4.1]. |
| **"Open source portfolio builder" as the category line**         | Zero measurable demand. One echo-only autocomplete prediction; `portfolio builder open source github` returns zero [SEO §1.1]. It is a description, not a search term. It may appear on the page — it must not be the wedge.                                                                                                                                                                                                                             |
| **"The open-source no-code website builder"** (drop "portfolio") | Abandons the conversion word. "Portfolio" is what makes a stranger recognise themselves in the first two seconds, and it is what makes the product's narrowness a feature rather than a missing-feature list next to Wix.                                                                                                                                                                                                                                |
| **"A self-hosted CMS for portfolios"**                           | "CMS" repels the creative audience and files us with Strapi, Directus and Payload — the category that fails the decisive test in the market research: _after installing, do you have a website?_ The answer for every headless CMS is no [Market §2.5]. Being classified with them loses the only thing that distinguishes us.                                                                                                                           |
| **Privacy-first framing (the Plausible shape)**                  | A portfolio is public by definition. There is no grievance to attach and the analogy collapses under the first question.                                                                                                                                                                                                                                                                                                                                 |
| **"Free forever" as the headline**                               | Price is the weakest wedge available here. Carrd already does custom-domain hosting for $19/year [Market §1.5], so "cheap" is taken; and leading with free invites "you get what you pay for" from an audience whose entire product is taste. Free belongs in the CTA microcopy and on `/what-it-costs`, not in the H1.                                                                                                                                  |
| **A single-villain README tagline**                              | Same reason as row 1, but note the split: the README **should** use the alternative framing, because that is where it works [OSS §9.1]. It just should name the same four brands, not one.                                                                                                                                                                                                                                                               |

### 1.4 The one canonical description string

Draft once, use everywhere: GitHub About (which **is** our Google snippet — a repo page carries no `<meta name="robots">` and its description tag is literally the About field [SEO §4.1]), meta description, directory submissions, the HN self-description.

> **Open source, self-hosted portfolio website builder. Build and edit your site from an admin panel — no code — and keep the content in your own database.**

150 characters. Contains "open source", "self-hosted" and "portfolio website" verbatim.

**One variant, for awesome-selfhosted only.** Its CONTRIBUTING file forbids "open-source", "free" and "self-hosted" in descriptions because the list already implies them, and requires the alternative framing as a suffix [OSS §6b.10]:

> **No-code portfolio website builder with a visual editor and admin panel. (alternative to Adobe Portfolio, Squarespace, Wix, Framer)**

File it under **Content Management Systems (CMS)**. Filing under static-site-generators makes us permanently ineligible [SEO §3.1].

### 1.5 Where each framing lives

| Surface                 | Framing                                                         | Evidence                                                                           |
| ----------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Homepage H1             | Outcome, ownership. No brand names.                             | 23 of 24 homepage H1s avoid the alternative framing [OSS §2.3]                     |
| Homepage sub-headline   | "open-source", "self-hosted", four incumbents named             | 12 of 24 sub-heads carry the technical words [OSS §2.4]                            |
| README tagline          | Alternative framing, front and centre                           | 7+ READMEs do exactly this while their homepages do not [OSS §1.25]                |
| HN title                | Technical mechanism only. Never the words "portfolio builder".  | Every portfolio-framed Show HN in the visible history scored 1–4 points [SEO §1.5] |
| `/alternatives/<brand>` | Brand vocabulary; open source is the _reason_, not the headline | [SEO §2]                                                                           |
| Directory listings      | Technical, with the alternative-to suffix                       | [OSS §6b.10]                                                                       |

**Retirement plan, decided now so it is not an accident later.** The alternative framing is a launch asset that mature projects remove: Dub, Infisical, Mattermost and Cal.com all deleted it from their homepages [OSS §2.3]. Trigger: when the site has its own organic traffic and named users, move the four brand names out of the sub-headline and into `/compare`. Not before.

---

## 2. The homepage, section by section

Twelve sections plus nav and footer. Order follows the modal skeleton observed across eighteen of twenty-four sites [OSS §1.25], with **one deliberate substitution**: the slot immediately below the hero — the single most common position for a customer logo wall — is filled with verifiable facts instead. That slot is where a project with no logos has a structural hole, and leaving it visibly empty is worse than filling it honestly.

### Nav

**Items:** Live demo · Compare · What it costs · Help · Docs · GitHub

**No star count in the nav.** Six of twenty-four have one, and the split is almost perfectly by audience: infrastructure tools show it, products sold to non-developers do not — Cal.com, Dub, Documenso, Ghost, Plausible, Outline, Rallly and Penpot all omit it despite large counts [OSS §5.1]. Ours would read 0. Omit permanently, not just at launch.

**"Compare" as a top-level item** is unusual — Plausible is the only site in the corpus that does it [OSS §1.3] — and it is directly right for us, because comparison is the frame our audience arrives with.

**Help and Docs are two separate items** pointing at two separate destinations. That is the Ghost pattern and it is the whole answer to §7.

---

### Section 1 — Hero

**Job.** Classify the product in five seconds for two audiences at once, and send the visitor into the demo.

**Three headline options.**

| #       | Headline                                                     | Formula                                                                                | Read                                                                                                                                                             |
| ------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A** ★ | **"Build a portfolio site you own outright."**               | Outcome-led (the dominant form, 11/24)                                                 | Answers the grievance in the users' own language; leaves the category to the sub-head; works equally for a student and a self-hoster                             |
| B       | "Your portfolio, in your own database, for nothing a month." | Constraint-as-hook, the PocketBase "in 1 file" shape                                   | Sharper, more technical, more memorable — but "database" is a word half the audience does not want to think about, and leading on price weakens a design product |
| C       | "Professional portfolio websites. Without the rent."         | Audience-expansion, the Documenso "Enterprise-Grade E-Signatures. For Everyone." shape | Strong rhythm and the best line for a social card; "rent" is an argument the reader has to already agree with, and it says nothing about what the thing is       |

**Recommendation: A.** It is the only one of the three that a listicle author can classify without reading the sub-headline, which is the homepage's second job [SEO §2]. B is the better Show HN title. C is the better OG-image line — use them there rather than discarding them.

**Copy, as built:**

> # Build a portfolio site you own outright.
>
> Open Portfolio Builder is a free, open-source website builder for portfolios — a self-hosted alternative to Adobe Portfolio, Squarespace, Wix and Framer. Edit every word, image and colour from an admin panel. Your content lives in your database, on your domain, and it stays there when you stop paying anybody.
>
> **[ Open the live demo ]** **[ Deploy your own — free ]**
>
> _MIT licensed. No account needed to try it. Nothing to cancel._

**CTA reasoning.** PocketBase is the only project of twenty-four that makes the demo its **primary** CTA — and it is also the closest structural analogue we have: no hosted service, no signup, ~50k stars and zero social proof on the page [OSS §1.4, §4.1]. Plausible put "View live demo" in the hero from its very first archived snapshot in 2019 [OSS §5.12]. At zero proof, the demo _is_ the proof, so it takes the primary slot.

The secondary CTA is a fork one level down: `/deploy` is where the two vocabularies split (one-click button · one Docker command · run it locally). Keeping the fork off the homepage stops the hero from having to speak both languages at once.

**The microcopy line is doing specific work.** Rallly puts the whole objection-killer in the CTA area — "It's free! No login required." — and it is the single most imitable detail in the corpus [OSS §1.19]. Ours kills three objections in eight words.

**Asset.** A short silent screen recording (≤30 s, poster frame, no autoplay sound, no browser chrome faked) of the core loop: change a headline → drop in an image from the library → publish → the public site updates. Not a hero screenshot. Four of the five archived zero-proof homepages put a demo or real running code above the fold; it is the most corroborated single finding in the file [OSS §9.3].

---

### Section 2 — What you can verify right now

**Job.** Occupy the logo-wall slot with something true. This is the section that replaces social proof, and §3 covers it in full.

**Copy:**

> ## What you can verify right now
>
> Nobody is using this yet. There are no customer logos on this page and no testimonials, because there are no customers and no users. So here is everything you can check for yourself instead, in one click each.
>
> - **MIT licence** — [read it](/LICENSE). Already released, and not revocable for anything already released.
> - **The whole thing is one repository** — [github.com/…](https://github.com/ShadmanArafin/open_portfolio_builder). Every commit, every issue, every decision.
> - **v0.5.0, released ⟨date⟩** — [changelog](/changelog). The version number is on this page because it is alpha and you should know that before you type in a portfolio.
> - **`docker compose up`** — one command, app and database together. The container was destroyed and rebuilt against the same volume and every piece of content survived; that test is in the repository.
> - **Export everything as one JSON file, at any time** — the export button exists today, not on a roadmap.
> - **Twenty-one conformance tests** that every storage backend has to pass before it ships, including the rule that authentication state never travels inside a content export.

**Why this shape.** Across twenty-five sites, almost no numeric claim cites a source; the only ones that do are n8n's "4.7/5 on G2" and Rallly's "(via Trustpilot)". **The most credible numbers in the whole corpus are the independently checkable ones** — that asymmetry is exactly what a project with nothing to show can exploit [OSS §5.5]. Plausible's `/security` page carries twenty-one headings, zero certifications and still reads as credible because every claim is a practice a reader can verify against the source [OSS §5.6].

**Asset.** No imagery. Six one-line rows with a link on each. Resist the urge to make it a stats band with big numbers — every number we have is either zero or an engineering detail, and enlarging an engineering detail looks like padding.

---

### Section 3 — How it works, in three steps

**Job.** Show a non-technical person that there is no terminal in their path.

**Copy:**

> ## Three steps, and none of them is a terminal
>
> **1. Deploy it.** Press the button. Your own copy is created in your own GitHub account, with a free database attached. You invent one setup phrase and that is the only thing you have to remember. Or run one Docker command on any machine you already have.
>
> **2. Claim it and answer four questions.** Your name and what you do, the kind of work you show, a colour, then publish. The second question renames the sections to language that fits your field — a photographer gets _Portfolio_ and _Brands I've shot for_ where a developer gets _Projects_ and _Stack_. Every step is skippable and nothing is permanent.
>
> **3. Edit anything, any time.** Click a heading, change it. Swap an image from your library. Add a page, drag blocks around, set that page's own search description, look at it on a phone frame, publish when you are ready. Drafts stay private until you press publish.

**Evidence.** "How it works / 3 steps" is a recurring slot directly under the proof band [OSS §1.25]. All three steps here are things the product does today — verified against the README and the first-run flow. Nothing aspirational.

**Asset.** Three screenshots, same demo persona throughout (see §8). Step 1 is the Vercel clone screen; step 2 is question two of the wizard with the profession list visible; step 3 is the editor with the docked preview open on the phone frame.

---

### Section 4 — What it does today

**Job.** Feature blocks, but written so that a sceptical reader cannot catch us overstating.

Four alternating image/text blocks. Every claim below is checked against the shipped product.

> ### Everything on the page is editable
>
> Work, case studies, clients, experience, education, process, capabilities, testimonials, navigation, the footer, the microcopy, the typography, the colours and the SEO all live in a content store rather than in the code. If you can see it, you can change it without opening a file.
>
> ### Draft, preview, publish
>
> Edits save as you type, into a draft. Visitors keep seeing the published version until you decide otherwise. A docked preview shows the draft on desktop, tablet and phone frames. Every publish snapshots the whole site, and any snapshot can be restored.
>
> ### Pages built from blocks
>
> Add a page, give it a slug, then stack blocks: hero, text, image, gallery, stats, call-to-action, cards. Reorder them, edit every field, give the page its own title and search description, or keep it out of search entirely. **Your home page is not built this way yet** — it is still the theme's fixed sections. That is the largest remaining gap in the builder and it is being worked on.
>
> ### It answers the post
>
> A contact form that actually delivers, an inbox inside the admin so a message is never lost if email is misconfigured, and optional SMTP so you are notified. A dashboard that runs sixteen checks over your published site — work still in draft, missing images, a search description too long to display, an unanswered enquiry — each linking to the screen that fixes it.

**Evidence for the honesty insert.** PocketBase's getting-started page opens with a red warning box before the intro paragraph, and it has not stopped them [OSS §7.3A]. Coolify runs a section literally titled "What Coolify Is Not" [OSS §7.3C]. Admitting the home-page gap _inside_ the feature block is stronger than a footnote, because it is the first thing a competitor would use against us.

---

### Section 5 — What it costs to run

**Job.** Transparent pricing is a documented substitute for customer proof — Plausible and Dub both published full pricing on their zero-proof homepages [OSS §5.15.3]. Ours is a cost table rather than a price table, which is a better version of the same move.

> ## What it costs to run
>
> Nothing, to us. There is no paid tier, no account and nothing to cancel. What you pay is whatever your hosting and your domain cost, and here are the real numbers.
>
> | Where you run it                         | What it costs        | The catch, stated plainly                                                                                                                                              |
> | ---------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Vercel Hobby + a free Neon database      | $0/month             | Vercel's Hobby plan is for **non-commercial personal use only**. If your portfolio advertises services for sale, read [this](/what-it-costs#vercel) before you use it. |
> | Netlify free                             | $0/month             | Netlify moved to a credit model; what one credit buys is not published anywhere we could find.                                                                         |
> | Supabase free                            | $0/month             | Supabase pauses free projects after about a week of low traffic. A portfolio nobody visits for seven days is exactly that profile.                                     |
> | Any server you already have, with Docker | your electricity     | You maintain it. That is a real commitment, not a formality.                                                                                                           |
> | A small VPS                              | a few pounds a month | Same as above. We have not price-checked providers — check them yourself.                                                                                              |
>
> A domain is roughly £10–15 a year from a registrar of your choosing — we have not price-checked registrars, so compare them. We do not sell domains and we do not take a cut.
>
> [ Read the whole cost and sustainability page → ]

**Sources and dates for the table** (these belong in the page's own footnote, visible, not hidden): Vercel Fair Use Guidelines, last updated 2026-07-29 — the commercial-use clause is quoted in full on `/what-it-costs`; Neon free-plan FAQ (0.5 GB storage, 100 CU-hours, 5 GB transfer per project per month, scale-to-zero after 5 minutes); Netlify pricing page — 300-credit free plan, **credit definition UNVERIFIED, the credits documentation URL 404s**; Supabase free-project-pausing docs — 7-day low-activity threshold, one-year restore window. All checked 2026-08-12 [Market §4.8].

**This is not optional detail.** The Vercel commercial-use clause is the single most dangerous unstated assumption in our own deployment story — a freelance designer's portfolio that advertises services plausibly falls inside Vercel's own definition [Market §4.8]. Publishing it before anyone asks converts our biggest liability into the section that proves we are being straight.

---

### Section 6 — Your work, and how to get it out

**Job.** The ownership argument, made with the competitors' own documentation rather than with adjectives.

> ## The part everyone finds out too late
>
> Wix's own support article, [still live](https://support.wix.com/en/article/exporting-or-embedding-your-wix-site-elsewhere), says: _"Since Wix is a SaaS solution, your site must run on Wix's servers."_ (checked 12 August 2026)
>
> Squarespace's export leaves out portfolio pages, gallery pages, style settings and custom CSS — the one content type it markets hardest to creatives is the one it will not give back. ([Squarespace help, updated 12 Feb 2026](https://support.squarespace.com/hc/en-us/articles/206566687-Exporting-your-site); checked 12 August 2026)
>
> Adobe Portfolio has no export at all, and if your Creative Cloud subscription lapses your site _"will remain live for 14 days. After this 14-day grace period, your site will come offline."_ ([Adobe Product Community](https://community.adobe.com/questions-606/what-happens-to-my-portfolio-once-i-end-my-adobe-subscription-578410); checked 12 August 2026)
>
> Here, there is nothing to get out, because it was never in. The database is yours, on infrastructure you chose. There is an export button that hands you every word, every setting and every link in one JSON file. The code is MIT, so you can fork it, change it, sell what you build with it, and keep running the version you have for as long as you like — whatever happens to this project.
>
> [ Compare us properly → ]

**Evidence.** Every one of these three facts is verified with a live vendor URL [Market §1.1, §1.2, §1.9]. The market research calls the Wix line "the single most citable fact in this dossier" [Market §Theme 3]. Quoting a vendor's own documentation is legally the safest form of comparative claim available — it is nominative use of a word mark in text, with no logos and no implied endorsement [OSS §3.15].

**Asset.** No screenshot. Three pull-quotes with visible source links and visible dates. The dates are the differentiator: not one comparison page in the entire corpus date-stamps a competitor claim, and two vendors publish materially different numbers for the same competitor artefact [OSS §3.16, §3.9].

---

### Section 7 — Where it runs

**Job.** The install fork, and the credibility of the self-hosted claim.

> ## Somewhere you chose
>
> **One click.** Vercel copies the repository into your own GitHub account, provisions a free Neon database and a blob store for your images, and asks you to invent one setup phrase. No keys to find, nothing to install.
>
> **One command.** `docker compose up` on any machine with Docker — a rented server, an old laptop, a Raspberry Pi. App and database together. No account anywhere and nothing that phones home.
>
> **Or a database you already run.** Postgres anywhere, Supabase, or the local filesystem. Whichever service's environment variables are present is the one that gets used, so provisioning a database is the only step.
>
> [ See all three, in full → ]

**Evidence.** A "self-hosted" claim that turns out to mean "deploy to Vercel" is exactly what HN commenters punish, and it is what gates awesome-selfhosted, selfh.st and r/selfhosted [SEO §3.1]. The Docker path is real and verified end to end, so lead the second option with the literal command — Novu makes a copyable command its entire primary CTA [OSS §1.21].

---

### Section 8 — What does not work yet

**Job.** Put the limitations on the homepage, not on a subpage nobody reads.

> ## What does not work yet
>
> Being direct about this, because the gaps are structural and you should not find them after typing in a portfolio.
>
> - **One theme, and no way to swap it.** The token layer that makes themes possible is built. The second theme is not.
> - **Your home page is not built from blocks yet.** Other pages are.
> - **No blog.** Planned, not started.
> - **Uploads have not been run against the hosted object stores with real credentials.** The code path is the same one the local filesystem backend uses and the conformance suite covers it, but that is not the same as having done it.
> - **Sign-in is an email and a passphrase.** No passkeys, no one-time codes.
> - **Nothing on mobile beyond the site being responsive.** No app, no notifications, no admin laid out for a phone.
>
> This list is the same one in the README, and it will keep being the same one. [The full version, with what happens next →](/is-this-right-for-you)

**Evidence.** PocketBase's own README carries its limitation up front — _"full backward compatibility is not guaranteed before reaching v1.0.0"_ — and its docs open with a red warning that says outright _"PocketBase is NOT recommended for production critical applications yet"_ [OSS §1.4, §7.3A]. Documenso publishes a compliance matrix with "Planned (2026)" rows sitting next to the compliant ones [OSS §5.6]. **Trust here comes from under-promising, not from a pledge.**

---

### Section 9 — Who is behind this

**Job.** Every one of the five archived zero-proof homepages named a real human and a real place. Not one exception [OSS §5.15.4].

> ## Who is behind this
>
> One person, ⟨name⟩, in ⟨city⟩. This is not a company. There are no investors, no staff, no hosted service and nothing to sell you.
>
> It exists because a portfolio should not be a subscription, and because every open-source option that already existed stopped at the point where a non-technical person needed to write a config file.
>
> You can email me at ⟨address⟩. Bug reports from actually using the admin are the most useful thing anybody can send.
>
> ⟨GitHub profile · public roadmap · changelog⟩

**Evidence, verbatim from the archive:** "Made by @ukutaht in London, UK" (Plausible, 2019) · "Made with ☔ in Hamburg" plus a company registration number (Documenso, 2022) · "Crafted by Gani" (PocketBase, 2022) [OSS §5.10–5.14]. Plausible's 2019 FAQ ended with "Ask a question from the founder"; Documenso's said "you are welcome to reach to hi@documenso.com".

**Do not put a headshot here.** A photograph invites an assessment of a person; a name, a city and a working email invite contact. The corpus uses the latter, universally.

---

### Section 10 — FAQ

**Job.** In the zero-proof playbook the FAQ _is_ the trust section. Documenso's entire credibility argument in 2022 lived in four FAQ answers [OSS §5.10, §5.15.6].

Eight questions, written the way a reader would ask them:

1. **Is it really free? What is the catch?** — No paid tier, no account, nothing gated. The catch is that you host it, and that is a real job. [→ /what-it-costs]
2. **What happens if you stop working on this?** — Nothing, to your site. It is running on your infrastructure, from a version you already have, under a licence that cannot be withdrawn from anything already released. You can fork it. [→ /what-it-costs#permanence]
3. **Will you go closed source later, like Cal.com did?** — Answered honestly and with a date and a link. [→ /what-it-costs#permanence]
4. **Do I need to know how to code?** — No for using it. Yes for one of the three install paths, and the other two are a button and one command.
5. **Can I move an existing Squarespace or Wix site over?** — Not automatically. What we can and cannot import, stated plainly. [→ /compare]
6. **Is this ready to put my actual work on?** — It is alpha. Here is precisely what that means, and here is what it would take to make me comfortable. [→ /is-this-right-for-you]
7. **What does it look like? Are there other designs?** — One theme today. Here is the demo. More in 0.6.
8. **Can I sell websites built with this?** — Yes. MIT. Use it, fork it, sell what you build with it. Note the Vercel Hobby clause if you deploy client sites there.

**No FAQPage structured data.** The rich result is dead — Google restricted it in August 2023 and removed the documentation in June 2024 because _"The FAQ rich result feature is no longer shown in Google Search results"_ [SEO §7.2]. Write visible FAQs anyway; Plausible and Ghost both do.

---

### Section 11 — Final CTA

**Job.** The final CTA restates the hero. That is the most consistent single pattern in the corpus [OSS §1.25].

> ## A portfolio site you own outright.
>
> Try the live demo first. Nothing to sign up for, and it resets itself every hour.
>
> **[ Open the live demo ]** **[ Deploy your own — free ]**

---

### Footer

Four columns and a strapline.

- **Product** — Live demo · Deploy · Changelog · Roadmap · What it costs
- **Compare** — Adobe Portfolio · Wix · Framer · Squarespace · **Right for you?** ← the honest-assessment page, using Plausible's exact footer label [OSS §3.2]
- **Learn** — Help centre · Developer docs · Blog
- **Project** — GitHub · Issues · Security · Contributing · Code of conduct · Licence

**Strapline:** "MIT licensed. Made by ⟨name⟩ in ⟨city⟩. No investors, no hosted service, nothing to sell you."

The licence name lives in the footer and the README badge, not in the hero. Across the corpus, the hero-adjacent statement is a **benefit sentence** — "you're never locked in", "run it yourself if you want to" — and the licence identifier sits in the footer or a README badge [OSS §5.8].

---

## 3. What we show instead of social proof we do not have

We have zero stars, zero users, zero reviews and no logos. The FTC's Final Rule on the Use of Consumer Reviews and Testimonials (16 CFR Part 465, announced 14 August 2024) makes several of the obvious shortcuts unlawful, not merely tacky [OSS §5.16].

### 3.1 Banned outright

| Banned                                                                                                       | Why                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Any testimonial from a person who is not a real user, including a plausible invented persona                 | 16 CFR 465 — misrepresenting a testimonial by someone who "did not have actual experience with the business"                                                                                                                                                                                                                                                                                                                         |
| A testimonial from the maintainer, a friend or a contributor without conspicuously disclosing the connection | 16 CFR 465, "Insider Reviews and Consumer Testimonials", which names officers and managers specifically                                                                                                                                                                                                                                                                                                                              |
| Buying GitHub stars, followers or Discord members                                                            | 16 CFR 465, "fake indicators of social media influence". Separately, the measured popularity benefit of bought stars lasts **less than two months** and becomes counterproductive after that (CMU/Socket/NC State, [arXiv:2412.13459](https://arxiv.org/abs/2412.13459)) [OSS §6b.9]                                                                                                                                                 |
| A customer logo wall                                                                                         | We have no customers. Trademark and implied-endorsement exposure, and none of the five archived zero-proof homepages used one [OSS §5.15.8]                                                                                                                                                                                                                                                                                          |
| **Any "rated X stars by users" claim**                                                                       | **Cannot be sourced.** Trustpilot, G2 and Capterra returned HTTP 403 to every method attempted in the research, including a real browser. There are no review-site ratings for anyone in this market anywhere in our evidence base. What it would take: an actual listing on one of those sites, actual users leaving actual reviews, and a screenshot with a date. Until then the claim does not exist and must not be approximated |
| Any invented usage number                                                                                    | The whole asymmetry is that a developer audience checks in one click, and the credibility loss is total and permanent [OSS §5.16]                                                                                                                                                                                                                                                                                                    |

### 3.2 What goes in the slot instead, ranked by strength

1. **The demo, as the primary CTA.** Four of five archived zero-proof homepages put a demo or real running code above the fold; PocketBase still makes it the primary CTA at ~50k stars [OSS §9.3]. Full spec in §4.
2. **The maintainer's own portfolio, live, built with the product, linked by name.** This is Plausible's mechanism exactly — `plausible.io/plausible.io` is their own real traffic, and Umami's demo is a public share of their own analytics [OSS §4.1]. Zero marginal cost, zero abuse surface, self-updating, and it doubles as dogfooding proof. **It is also the only route into [developer-portfolios](https://github.com/emmabostian/developer-portfolios) (25,978 stars), which lists individual portfolios rather than tools** [SEO §8.1].
3. **Checkable engineering facts, as §2 of the homepage.** The licence, the version, the export button, the Docker rebuild test, the conformance suite. Plausible's `/security` proves that twenty-one concrete practices with zero certifications reads as more credible than a badge row [OSS §5.6].
4. **Honest tiny numbers, shown rather than hidden — but only once there are any.** Supabase shipped a homepage section listing a **6-star** repo; Dub shipped a star widget reading **0** with the true value of 3 in its own page payload; Plausible's 2019 hero showed a referrer chart totalling about a hundred visitors [OSS §5.11–5.13]. **The move that makes this work is reframing, not inflating**: Supabase's caption was _"Watch the releases of each repo to get notified when we are ready for Beta launch"_ — the star count recast from a bragging metric into a subscription mechanism. Do the same: a "Watch releases" widget, never a "Star us" widget.
5. **Transparent cost, published immediately.** §5 of the homepage. Both Plausible and Dub published full pricing on their zero-proof pages [OSS §5.15.3].
6. **A public roadmap and a changelog with dates.** Plausible's 2019 footer said "We have a Public roadmap"; four projects in the corpus carry `Changelog` in the top nav [OSS §5.17]. Our roadmap already exists in the README and `docs/PLAN.md` — it needs a URL, not writing.
7. **A named human, a city, and a working email address.** Universal across the five archived pages [OSS §5.15.4].
8. **The FAQ doing the trust work**, and `security.txt` plus `SECURITY.md`. Both files already exist in the repository; they cost nothing and they signal seriousness on day one [OSS §5.17].
9. **The honest-limitations list, on the homepage.** See §9.
10. **Peer endorsement, when it comes, from other open-source maintainers.** The strongest testimonials in the corpus are consistently founders and CTOs of other known open-source projects, in the format _Name — Role, Company_ [OSS §5.3]. This is reachable and it is the correct first target, but it must be earned and it must be real.

### 3.3 The one number we will have, and how to handle it

The GitHub star count. It will be small for months. Three rules:

- **Not in the nav.** Ever [OSS §5.1].
- **Not as a stat.** If it appears at all, it appears as a "Watch releases" link with the count as incidental context.
- **Never as a claim.** "Join N developers" at any N below five figures reads as desperation and invites arithmetic.

---

## 4. The demo

### 4.1 What it is called

**"Live demo"**, everywhere. Never "Get a demo", "Book a demo", "Request a demo" or "Schedule a demo".

"Demo" has been so thoroughly captured by sales that six of twenty-four projects use it to mean "talk to a human", and `directus.io/demo` 302-redirects to a sales page [OSS §4.2]. The two surviving self-serve labels in the corpus are PocketBase's **"Live demo"** and Plausible's **"View live demo"** — in both, _live_ is doing the disambiguating work [OSS §9.6]. Use "Live demo" as the button, and give the page an H1 that removes all doubt: **"Live demo — edit a real site, right now."**

### 4.2 The two surfaces

A portfolio builder is two products and the demo has to be both.

| Surface                                                | URL                   | Who it is for                                                   | Access                                        |
| ------------------------------------------------------ | --------------------- | --------------------------------------------------------------- | --------------------------------------------- |
| **The site** — what a visitor to your portfolio sees   | `demo.⟨domain⟩`       | Everyone. This is the artefact you would send a hiring manager. | Anonymous. No login, ever.                    |
| **The editor** — the admin you actually manage it from | `demo.⟨domain⟩/admin` | Anyone deciding whether they could use this                     | Published credentials, pre-filled in the form |

Both are linked from the homepage hero, and each links to the other with a persistent bar: _"You are looking at the published site. [Open the editor →]"_ and _"You are editing the demo. [See the published site →]"_.

**Why two.** Cal.com gets a free anonymous demo surface because its consumer side (a booking page) needs no account — the creator side is the only thing behind a wall [OSS §4.4]. Our published site is the same kind of surface: permanently public, zero maintenance, and it is what makes the product's output visible without asking anyone to log into anything.

### 4.3 What the editor demo must let someone do

The whole loop, in under sixty seconds, with no dead ends:

1. **Change a headline** and see it change in the preview.
2. **Swap an image** from the media library — the library must already contain a dozen usable images so nobody hits an empty state.
3. **Add a block** to a page and drag it above another one.
4. **Set that page's search description** and watch the character counter turn amber.
5. **Preview it on the phone frame.**
6. **Press publish** and then open the public site in another tab and see the change live.
7. **Look at the contact inbox** — seeded with two plausible messages, so the screen is not empty.
8. **Press "Export everything"** and get a real JSON file. This is the ownership argument, demonstrated rather than asserted.

Anything the demo cannot do must say so _at the point of the click_, not in a banner at the top. Disabled controls with a one-line reason beat a hidden control every time.

### 4.4 How it resets

**Every hour, on the hour. Stated on the page.**

PocketBase is the only project in the corpus that publishes a reset policy at all, and it names all three levers in one sentence: _"This is a live demo of PocketBase. The database resets every hour. Realtime data and file upload are disabled."_ [OSS §4.1, §4.5]. Ours, in the same shape and our own voice:

> **This is a live demo. Everything resets on the hour, so change whatever you like — you cannot break it and nobody can see what you did.** Uploads and outgoing email are switched off. Sign in with **demo@example.com** / **demo1234** (already filled in below).

**Mechanism.** The reset is `restore seed snapshot` plus `wipe media added since` — which is the product's existing publish-snapshot and JSON-import machinery, pointed at a fixed seed file. A cron inside the container, and a `docker compose down && up` as the manual fallback because the whole instance is disposable by construction.

**Ship the demo as a product feature, not as an operations task.** This is the single most important structural decision in this section. PocketBase's admin bundle reads `?demoEmail=` and `?demoPassword=` from the query string and self-populates the login form — meaning _any_ PocketBase instance can be linked as a demo, and their demo has therefore never rotted [OSS §4.1]. Every project that ran a hand-maintained shared sandbox instead has a dead or retired demo: Twenty's issue cluster ran repeated breakage → account-creation lockdown → removal; Budibase's demo tenant still resolves and errors with "Tenant not found"; Directus routed its demo URL to sales [OSS §4.3, §4.5].

So: add **`OPB_DEMO_MODE`** to the application. When set, it turns on the banner, pre-fills the credentials from `?demoEmail=`/`?demoPassword=`, disables the abuse surfaces below, and schedules the reset. One environment variable, in the codebase, covered by tests. That is what makes the demo survive.

### 4.5 How it is protected from abuse

PocketBase's actual lesson is not "police it" — it is **remove the abuse surface**. They disabled realtime (a free pub/sub channel) and file upload (free file hosting) rather than moderating them [OSS §4.1].

| Surface                                      | Decision                                                                                                                       | Why                                                                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File uploads**                             | **Off.** Media library pre-seeded with a dozen images; the picker works, the upload button is disabled with a one-line reason. | Free anonymous file hosting is the number one abuse magnet, and it is exactly what PocketBase turned off.                                                         |
| **Outgoing email**                           | **Off.** SMTP unconfigured, and the send path short-circuits with a visible "disabled in the demo" notice.                     | A demo with working SMTP is an open relay. This is the highest-severity risk in the list and it is easy to miss because our email feature is optional by default. |
| **Contact form**                             | Accepts and discards. The inbox shows only the seeded messages.                                                                | Keeps the loop demonstrable without a spam sink.                                                                                                                  |
| **Account creation and owner change**        | **Off.** One demo account, no signup, no password reset.                                                                       | Twenty's demo died precisely here.                                                                                                                                |
| **Integrations / connect-a-service screens** | Read-only.                                                                                                                     | Nobody's API keys, and no outbound calls from our infrastructure.                                                                                                 |
| **Publishing**                               | **Allowed** — it is the core loop. But the published demo site is `noindex` and carries a visible "this is a demo" bar.        | Otherwise the demo competes with the real site in search and pollutes the index. The product already supports per-page `noindex`.                                 |
| **Rate limiting**                            | Per-IP limits on the admin routes, plus the platform WAF.                                                                      | Cheap, and the only thing standing between an hourly reset and a script.                                                                                          |
| **Blast radius**                             | The instance holds nothing real. Worst case is one hour of someone else's typing, then a rebuild.                              | This is the actual protection. Everything above just reduces how often it is needed.                                                                              |

### 4.6 Placement and instrumentation

- **Primary hero CTA** (PocketBase's placement) plus a repeat in the final CTA (Plausible repeats theirs at page bottom).
- **A README badge**, first row, after the licence badge. Umami gets roughly eighty per cent of the value of its demo from one badge line: `Try Demo Now | Click Here` [OSS §4.1].
- **Close the loop.** Plausible's demo page carries its own CTAs back to the funnel, tracked separately [OSS §4.1]. The demo editor gets a persistent, non-modal bar: _"Like this? Deploy your own in one click — it is free and it is yours."_
- **Instrument it as a conversion event**, with the position recorded (`hero` / `nav` / `footer` / `demo-page`), using our own privacy-friendly analytics. Plausible does exactly this and it is how they know the demo works.

### 4.7 The Show HN constraint

Show HN's rules say _"Please make it easy for users to try your thing out, ideally without barriers such as signups or emails"_ and _"Don't post landing pages"_ [OSS §6.3]. A read-only demo does not satisfy the first rule because there is nothing to _do_. **The seeded, writable, credential-published sandbox is the only architecture that satisfies both**, which settles the choice: architecture 2, with architecture 1's published-site surface alongside it.

---

## 5. Comparison pages

### 5.1 Which competitors, and in what order

| #   | Page                            | Target query                                                             | Evidence we hold                                                                                                                                                                                                               | Build                                                                                                                                                              |
| --- | ------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `/alternatives/adobe-portfolio` | `adobe portfolio open source alternative` (live autocomplete prediction) | **Strong.** Behance Pro price verified at source; the 14-day kill switch verified; the 2016 Behance ProSite stranding documented verbatim; open "has Adobe abandoned this?" community threads                                  | First                                                                                                                                                              |
| 2   | `/alternatives/wix`             | `wix alternative open source`, `wix studio open source alternative`      | **Strong.** Wix's own article saying the site can never leave; free tier with a scrolling ad banner; pricing from two agreeing third parties                                                                                   | Second                                                                                                                                                             |
| 3   | `/alternatives/framer`          | `framer alternative open source`                                         | **Strong.** Pricing verified on the live page 2026-08-12; no export at all; the Mini plan removed Oct 2025; a 345-upvote pricing backlash thread                                                                               | Third                                                                                                                                                              |
| 4   | `/alternatives/squarespace`     | `squarespace alternatives free` — **unwinnable as a ranking target**     | **Strong.** July 2026 rise of 19–26% with no public announcement; portfolio pages excluded from export                                                                                                                         | Fourth, and be explicit internally that its job is **conversion and citation, not ranking**. The SERP is owned by Tooltester, Website Planet and Zapier [SEO §4.1] |
| 5   | `/alternatives/carrd`           | `carrd alternative`                                                      | Verified pricing and, unusually, a competitor that **beats us on portability**                                                                                                                                                 | Fifth. This is the page that proves the others are honest                                                                                                          |
| —   | `/alternatives/pixieset`        | `pixieset open source alternative`, `self hosted pixieset alternative`   | **BLOCKED.** The SEO research identifies Pixieset as one of four pre-qualified brands, but **the market research covers Pixpa, not Pixieset — we hold zero verified facts about Pixieset**. Do not write this page from memory | Blocked on primary research: pricing page, export policy, free tier, client-gallery features. Half a day of work                                                   |

**Hub page** `/open-source-website-builders` is a separate artefact and remains the highest-value SEO target [SEO §4.1]. It is a roundup of at least ten tools including our own, disclosed and not ranked first. This section is about the `/alternatives/*` family.

### 5.2 The structure, every time

Derived from three teardowns [SEO §5.2] plus the concession taxonomy and the failure modes in [OSS §3.16].

1. **H1 naming both products and the reason to switch.** Not "X vs Y" alone.
2. **A dated byline, visible on the page.** `Written by ⟨name⟩, ⟨date⟩. Updated ⟨date⟩.` Appwrite is the sole best practice in the entire corpus, showing both "Feb 3, 2024" and "Updated on October 6, 2025" [OSS §3.10].
3. **A one-paragraph "what these two things have in common".** Plausible's Matomo page opens on commonality; Appwrite splits every section into _Similarities_ then _Differences_, similarities first [OSS §3.3, §3.10].
4. **The comparison table, above the fold**, with four rules the corpus says matter:
   - **The competitor's column comes first.** Supabase places Firebase in the left data column as a fairness signal [OSS §3.6].
   - **Every row label is a checkable fact with a neutral one-line definition of the criterion.** PostHog is the only project in the corpus that does this and it is free differentiation [OSS §3.4]. Never a row like Dub's "Beautiful, intuitive UI" — a conclusion masquerading as a criterion [OSS §3.7].
   - **Column headers name the exact tier compared** (Formbricks: `Typeform Plus (2.5k responses) | Formbricks Startup`) [OSS §3.11].
   - **Hedge inside the cell where the truth is hedged.** Plausible writes "Rarely" not "No", "From 3 years" not "Unlimited" [OSS §3.1].
5. **"Where ⟨competitor⟩ is better" — placed BEFORE "where we are better".** Formbricks does exactly this [OSS §3.11]. Two of the three teardowns concede; the one that does not reads as adversarial [SEO §5.2].
6. **Pricing, with the as-of date and the source URL in the visible copy.** Not one page in the corpus does this. Dub publishes exact competitor dollar figures with no date and no sourcing, and Plausible and Umami publish materially different sizes for the _same_ Google Analytics script (135 KB vs ~45 KB) [OSS §3.9, §3.16]. That contradiction is the argument for the date stamp, and it is our cheapest available credibility win.
7. **Switching cost.** A migration guide, and an honest statement that there is no automatic importer. This is the conversion lever and the thing most likely to be skipped [SEO §5.2].
8. **Visible FAQ, no `FAQPage` markup** [SEO §7.2].
9. **CTAs: "Open the live demo" and "Deploy your own".** Plus a risk-reversal line in Plausible's shape: _"Build it alongside the site you have. Nothing changes until you point your domain at it."_
10. **A trademark line at the foot:** _"⟨Brand⟩ is a trademark of ⟨owner⟩. This page is not affiliated with, endorsed by or sponsored by them."_ Nominative fair use protects using the word mark in text; it does not cover logos, stylised marks or brand colours, and it does not immunise a false factual claim [OSS §3.15].
11. **800–2,000 words.** None of the three teardown pages is a 5,000-word monster [SEO §5.2].

### 5.3 The machinery that makes honesty sustainable

PostHog's public handbook rule sits at position 11 of 11 inside their **SEO** guide, not their legal or PR guide [OSS §3.14]:

> "Many other companies 'straw man' their competitors… We don't do this. When writing about competitors, be honest about their capabilities. Assume they are reading and will dunk on you for being dishonest… Our reputation and trust with readers is more important than whatever 'marketing win' being dishonest gives us. It's also okay to make mistakes here. Competitors change faster than we can keep up. Whenever we find a mistake, we fix it as soon as we realize. We also happily accept updates from competitors if they make our post more accurate."

Adopt that verbatim as a public policy page at `/how-we-compare`, credited to PostHog. Then build the mechanism that makes it possible, which is the part everyone skips:

**One file: `content/competitors/<brand>.ts`.** Every fact about a competitor lives there once — value, source URL, verification date, and a `confidence` field of `verified | third-party | unverified`. Every comparison page, the hub page and the homepage read from it. When a competitor changes their pricing, one file changes and every page updates. This is PostHog's `/src/hooks/competitorData/` and it is the operational answer to "competitors change faster than we can keep up" [OSS §3.14].

The renderer must **refuse to display an `unverified` fact without printing the flag next to it**. That single rule is what stops the discipline decaying in six months.

**And a public "corrections" note in the footer of every comparison page:** _"Found something wrong here? [Tell me](mailto:…) and I will fix it. That includes if you work at ⟨brand⟩."_ PostHog's stated practice, and it costs nothing [OSS §3.14].

### 5.4 Worked example, written out: `/alternatives/adobe-portfolio`

Everything below is publishable copy. Facts are drawn from [Market §1.9] and [Market §Theme 9]; each carries its source and date.

---

> # Adobe Portfolio vs Open Portfolio Builder: what happens when you stop paying
>
> _Written by ⟨name⟩, 12 August 2026. Prices checked 12 August 2026 at [behance.net/pro](https://www.behance.net/pro). Adobe's own Creative Cloud pricing pages returned errors to us on that date, so every Creative Cloud figure below is third-party and is labelled as such._
>
> ## What these two things have in common
>
> Both build a portfolio website without writing code, both give you a custom domain, and both are aimed at people whose work is visual. If you already pay Adobe for Photoshop or Lightroom, Adobe Portfolio is included at no extra cost and syncs with your Behance profile — and for a lot of photographers and designers that is genuinely the right answer. This page is about the one place they differ completely: what you are left holding.
>
> ## At a glance
>
> |                                                                                      | Adobe Portfolio                                                                                                                                                                                                                                                                                                             | Open Portfolio Builder                                                        |
> | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
> | **Cheapest way to publish** — the least you can pay and have a live site             | Requires a paid Adobe subscription. Cheapest verified route: **Behance Pro, US$11.49/month** ([behance.net/pro](https://www.behance.net/pro), 12 Aug 2026)                                                                                                                                                                  | **$0.** Free hosting tiers, or a server you already own                       |
> | **A free tier that publishes** — can strangers see your site without you paying      | **No.** An active paid subscription is required to publish and stay live                                                                                                                                                                                                                                                    | Yes                                                                           |
> | **What happens if you stop paying** — the state of your live site after cancellation | _"your site will remain live for 14 days. After this 14-day grace period, your site will come offline"_ ([Adobe Product Community](https://community.adobe.com/questions-606/what-happens-to-my-portfolio-once-i-end-my-adobe-subscription-578410), 12 Aug 2026). Your content is preserved in the editor but is not public | There is nobody to stop paying. The site runs on infrastructure you chose     |
> | **Export** — getting your site out in a form another tool can read                   | **None documented**                                                                                                                                                                                                                                                                                                         | JSON export of all content, any time. Source code is MIT                      |
> | **Where your content lives**                                                         | Adobe's servers                                                                                                                                                                                                                                                                                                             | Your database, on your host                                                   |
> | **Sites per account**                                                                | Up to **5** ([behance.net/pro](https://www.behance.net/pro), 12 Aug 2026)                                                                                                                                                                                                                                                   | Unlimited — one deployment each                                               |
> | **Custom domain**                                                                    | Included at no extra Adobe charge, **one per site**. You buy the domain separately                                                                                                                                                                                                                                          | Yes. You buy the domain separately                                            |
> | **Visual themes** — how many distinct designs ship with it                           | **Several** (Adobe publishes a template gallery). Exact count UNVERIFIED                                                                                                                                                                                                                                                    | **One.** A second is planned for 0.6                                          |
> | **Who can change the terms**                                                         | Adobe                                                                                                                                                                                                                                                                                                                       | Nobody, for a version already released. MIT cannot be withdrawn retroactively |
> | **Setup needs a terminal**                                                           | No                                                                                                                                                                                                                                                                                                                          | No for the one-click deploy. Yes for the Docker path                          |
> | **Support**                                                                          | Adobe's support channels                                                                                                                                                                                                                                                                                                    | GitHub issues. One maintainer. No SLA and no phone number                     |
> | **Maturity**                                                                         | Shipping since 2016                                                                                                                                                                                                                                                                                                         | **Alpha, v0.5.0**                                                             |
>
> **[ Open the live demo ]** **[ Deploy your own — free ]**
>
> ## Where Adobe Portfolio is better
>
> Four things, and they are not small.
>
> **If you already pay Adobe, it is free and it is one click.** Photoshop, Lightroom and Behance users get Portfolio bundled, and it syncs from Behance directly. There is no world in which "install Docker" beats that on convenience. If you are already inside the Adobe subscription and you intend to stay, the marginal cost of your portfolio is zero and this comparison is not for you.
>
> **Nothing to run and nothing to update.** Adobe's uptime, security patches and backups are Adobe's problem. Ours are yours. That is a real transfer of work and it should be counted as a cost.
>
> **Five sites on one subscription.** For someone running a personal site, a client site and a side project, that is good value against most of the market.
>
> **It has been shipping since 2016 and it is stable.** Ours is alpha, has one theme, and its home page cannot yet be built from blocks. Adobe Portfolio will not break because you skipped an update. That is worth something and we are not going to pretend otherwise.
>
> ## Where we are better
>
> **You keep the site when the payments stop.** This is the whole argument. Adobe's own community documentation is unambiguous: fourteen days after your subscription lapses, the site goes dark. Not degraded, not badged — offline. Your work is still there in the editor, and nobody can see it. A portfolio that depends on an unrelated software subscription staying current is a portfolio with a switch on it, and the switch is not in your hand.
>
> **There is an export button.** Adobe Portfolio has no documented export at all. Ours hands you a single JSON file with every word, setting and link in it, and the code is MIT, so you can run the version you have for as long as you like.
>
> **It costs nothing to keep alive.** Free hosting tiers exist and the software is free; the only recurring cost is a domain, which you buy from whoever you like.
>
> **You can see how it works and change it.** The whole thing is one public repository.
>
> ## The thing worth knowing before you choose either
>
> Adobe has done this before, to this exact product line. **Behance ProSite was discontinued in February 2016 and switched off that June.** Behance's own notice, quoted verbatim in the [Core77 discussion thread](https://boards.core77.com/t/behance-prosite-discontinued-moving-to-adobe-portfolio/30813) (thread created 9 February 2016; checked 12 August 2026):
>
> > "Behance ProSite is being discontinued as of June 2016… If you're not currently subscribed with Adobe, you can purchase a new Adobe Creative Cloud Plan (starting at $9.99) when you publish your Adobe Portfolio."
>
> The migration path away from a product being switched off was _start paying for a software subscription_. A user in that thread, the day after: _"I'd have to start from scratch in Squarespace not only building the template but uploading 30+ projects and 100s of images. Ugh."_
>
> Is Adobe still investing in Portfolio? There is **no official deprecation notice, and we are not claiming one**. What exists is Adobe's own community forum carrying open threads titled ["Has Adobe abandoned Portfolio, or is there still a team working on improving it?"](https://community.adobe.com/t5/creative-cloud-services-discussions/has-adobe-abandoned-portfolio-or-is-there-still-a-team-working-on-improving-it/td-p/15165849) and ["Is Portfolio still being developed?"](https://community.adobe.com/t5/creative-cloud-services-discussions/is-portfolio-still-being-developed/td-p/11583268), citing missing basics like dropdown menus. Draw your own conclusion. For context on Adobe's willingness to retire creative tools, Adobe Animate is being discontinued on 1 March 2026 ([ITP.net](https://www.itp.net/digital-culture/adobe-to-discontinue-animate-as-ai-takes-centre-stage), checked 12 August 2026).
>
> And the same question applies to us, so here is our answer: this project could stop tomorrow. The difference is what that would do to your site, which is nothing, because it is running on your infrastructure from code you already have.
>
> ## Moving across
>
> **There is no automatic importer, and there will not be one soon.** Adobe Portfolio publishes no export, so there is nothing for an importer to read. Moving means copying your text across and re-uploading your images, and here is the honest estimate: for a portfolio of ten to fifteen projects, an afternoon.
>
> What makes it less painful:
>
> 1. **Build it alongside the site you have.** Deploy, put your work in, and leave your Adobe site running. Nothing changes for anybody until you point your domain at the new one.
> 2. **Get your images at full resolution from the originals**, not by right-clicking your live site — Adobe serves resized copies.
> 3. **Redirect properly at the end.** Change your domain's DNS; your old URLs stop resolving fourteen days after you cancel anyway, so there is no window in which both work.
>
> [ Step-by-step: moving from Adobe Portfolio → ]
>
> ## Questions people actually ask
>
> **If I cancel Creative Cloud, do I lose my portfolio content?** No — Adobe says the content stays in the editor. You lose the public site after fourteen days.
>
> **Is Behance Pro really cheaper than Creative Cloud for this?** On 12 August 2026, yes: Behance Pro at US$11.49/month includes Adobe Portfolio with up to five sites, which undercut every Creative Cloud route we could verify. Adobe's own Creative Cloud pricing pages did not respond to us, so treat every figure we have for those plans as third-party.
>
> **Can I use my own domain with the free version of yours?** Yes. There is no free version — there is just the version, and it does custom domains. You buy the domain from a registrar.
>
> **Is yours as polished as Adobe Portfolio?** No. One theme, alpha, and the home page is not yet built from blocks. [Here is the full list of what does not work yet.](/is-this-right-for-you)
>
> ---
>
> **[ Open the live demo ]** **[ Deploy your own — free ]**
>
> _Adobe, Adobe Portfolio, Behance, Creative Cloud, Photoshop and Lightroom are trademarks of Adobe Inc. This page is not affiliated with, endorsed by or sponsored by Adobe. Found something wrong here? [Tell me](mailto:…) and I will fix it — including if you work at Adobe._

---

### 5.5 The concession rule, stated once

Every page names at least one thing the competitor does better, in a section placed **before** our own advantages, and at least one row in the table where the competitor wins.

This is not politeness. Four distinct concession strategies exist in the corpus and the projects that use none of them — Dub, Umami, Mattermost — produce the least credible pages in the sample; Umami's table wins 28 of 28 rows against Google Analytics, which is straw-manning by PostHog's own published definition [OSS §3.16, §3.9]. Cal.com declares itself the winner of five sections out of five and the verdict format collapses [OSS §3.8].

The Carrd page is the test case. Carrd hands back **unminified** HTML, CSS, JS and images for $9–19 a **year**, and the market research ranks it second only to Semplice on portability — ahead of us on price and level with us on the thing we claim as our differentiator [Market §1.5, §1.21]. The honest page says: _if you want one page and you want the source, Carrd is cheaper than a domain and you should use it._ Our answer is multi-page structure, a CMS behind it and no annual fee at all — and we say that after conceding the point, not instead of it.

---

## 6. `/what-it-costs` — the page that replaces pricing

### 6.1 The nav label

**"What it costs"**, not "Pricing", not "Donate", not "Sponsor".

When there is genuinely no paid tier, **no project in the corpus uses a "Pricing" nav item**. Six replacements were observed: `Donate`, `Donations`, `Support us`, `Contribute`, `Purchase`, and nothing at all [OSS §8.10]. Immich's reasoning is the useful one — the label is `Purchase` rather than `Pricing` precisely because nothing is priced.

"What it costs" is chosen because it is the literal question this audience arrives with. They are coming from $11–29 a month and the first thing they want to know is the number. It also lets one page answer both halves honestly: what you pay us (nothing) and what running it actually costs (not nothing).

### 6.2 The page, written

> # What it costs
>
> ## Nothing, to me
>
> There is no paid tier, no account, no usage limit and nothing to cancel. Every feature is in the free version because there is only one version. I do not sell hosting, I do not sell themes, and I am not collecting anything to sell later.
>
> ## What it actually costs you
>
> Real numbers, checked on 12 August 2026, with the awkward parts included.
>
> ### Free, on somebody else's platform
>
> **Vercel Hobby plus a free Neon database — $0/month.** Vercel's typical monthly Hobby guidelines are 100 GB of fast data transfer, 1 million function invocations and 5,000 image transformations ([Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines), last updated 29 July 2026). Neon's free plan gives 0.5 GB of storage, 100 compute-hours and 5 GB of network transfer per project per month, and scales the database to zero after five minutes idle ([Neon FAQ](https://neon.com/faqs/free-plan-limits-and-quotas)). For a portfolio, that is a lot of headroom.
>
> <a id="vercel"></a>**The catch, and it is a real one.** Vercel's Fair Use Guidelines say, verbatim:
>
> > "Hobby teams are restricted to non-commercial personal use only. All commercial usage of the platform requires either a Pro or Enterprise plan."
> > "Commercial usage is defined as any Deployment that is used for the purpose of financial gain of anyone involved in any part of the production of the project… Examples of this include, but are not limited to, the following: Any method of requesting or processing payment from visitors of the site; **Advertising the sale of a product or service**; Receiving payment to create, update, or host the site… Asking for Donations fall under commercial usage."
>
> Read that plainly: **a student's portfolio is fine. A freelance designer's portfolio that advertises services for hire probably is not.** I am not going to pretend otherwise to make the deploy button look better. If that is you, use Netlify, use a small server, or pay Vercel for a Pro plan — the software works identically on all of them.
>
> **Netlify free — $0/month.** Netlify's free plan now runs on credits: 300 of them, with custom domains, SSL, deploy previews, functions and a CDN ([netlify.com/pricing](https://www.netlify.com/pricing/)). **What one credit buys is not stated on the pricing page and the credits documentation URL 404s, so I cannot tell you where the ceiling is.** The page carries no commercial-use restriction.
>
> **Supabase free — $0/month.** 500 MB of database and 1 GB of files. Supabase pauses free projects after about a week of low activity and gives you a year to restore one ([Supabase docs](https://supabase.com/docs/guides/platform/free-project-pausing)). A personal site nobody visits for seven days is exactly that profile, so this is the option that needs the most thought.
>
> ### On a machine you control
>
> **A server you already own — the electricity.** `docker compose up` on an old laptop, a Raspberry Pi or a home server.
>
> **A small rented server — a few pounds a month.** I have not price-checked providers and I am not going to publish numbers I have not verified. Compare them yourself.
>
> Both of these move real work onto you: updates, backups, and being the person who notices when it is down. That is not a formality — it is the honest cost of owning the thing.
>
> ### And a domain
>
> Roughly £10–15 a year, from whichever registrar you like. **I do not sell domains, I do not take a referral cut, and there is no free-for-the-first-year deal that renews at three times the price.** This is the one cost that does not go away, and it is the one that is genuinely yours.
>
> ## Why there is no paid tier
>
> Because the entire point of the project is that a portfolio should not be a subscription, and a project that argues that while charging a subscription is arguing with itself.
>
> There is also a simpler reason: taking money creates an obligation I cannot currently meet. One person cannot promise a response time.
>
> ## How this is sustainable
>
> Honestly: it may not be, and I would rather say that than make a promise with nothing behind it.
>
> This is one person, unpaid, in evenings. There is no company, no funding, no staff and no hosted service. There is no roadmap that ends in a paywall because there is no business plan at all. I am not asking for donations right now — partly because it is too early to ask for money for something at version 0.5, and partly because taking recurring money is a promise about the future that I am not able to make yet.
>
> If that changes, it will be announced here first, in writing, and the two things below will still be true.
>
> <a id="permanence"></a>## The bit about going closed source
>
> This is a live question and it deserves a straight answer rather than a slogan.
>
> On **14–15 April 2026, Cal.com moved its main codebase to closed source**, after five years as the canonical open-source alternative to Calendly, and spun out an MIT-licensed community fork. Their stated reason was that AI can now scan a public codebase for vulnerabilities and produce working exploits quickly ([Cal.com's announcement](https://cal.com/blog/cal-com-goes-closed-source-why); [HN discussion, 391 points](https://news.ycombinator.com/item?id=47780456); checked 12 August 2026). Existing customers were not abandoned and an open version still exists, so this is not a horror story — but it is a recent, verifiable instance of exactly the thing people fear when they commit work to a platform: **the terms changed after they committed.**
>
> I am not going to gloat about it, because the same could be said of this project one day and the only honest answers are structural ones. There are three, and they are all things you can check rather than believe:
>
> 1. **MIT cannot be taken back from what has already been released.** Every version published so far is yours under those terms, permanently. If I relicensed tomorrow, v0.5.0 would still be MIT, still be forkable, and still be running your site.
> 2. **Your site does not depend on me.** It is running on your infrastructure, against your database, from a copy of the code you already have. If this repository disappeared this evening your site would not notice.
> 3. **The exit exists today, not as a promise.** There is an export button in the admin, and it works now.
>
> What I will commit to in writing, and what you should hold me to:
>
> - **No feature will ever be moved out of the free version into a paid one.** If a hosted service ever exists, it will be convenience, not capability — the Coolify position, not the open-core one.
> - **No advertising, no tracking of your visitors, and no telemetry that is not opt-in.**
> - **If the project stops, it will say so on this page** rather than going quiet.
>
> ## How to help, if you want to
>
> Time is worth more than money here, and that is not a polite deflection.
>
> - **Use it and tell me where it broke.** Bug reports from actually using the admin are the single most useful thing anybody can send.
> - **Accessibility fixes.** I am one person and I will have missed things.
> - **Interface copy that stops assuming the user is a designer.** Genuinely one of the hardest parts.
> - **Tell someone.** A link from a person who used it is worth more than anything I can write.
>
> If you want to send money anyway, there is nowhere to send it, on purpose. Ask me again at 1.0.

### 6.3 Why this shape rather than the alternatives

| Model                                   | Who does it                     | Why not us, yet                                                                                                                                                              |
| --------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosted service funds the free core      | Ghost, Plausible                | We have no hosted service and building one contradicts the positioning                                                                                                       |
| Open core, features held back           | Plausible CE, Umami             | Directly contradicts the argument we make on every comparison page                                                                                                           |
| Voluntary purchase that unlocks nothing | Immich                          | The right destination, but it needs a product mature enough that people want to pay for nothing. Revisit at 1.0                                                              |
| Pure donations                          | Syncthing, curl, Krita, Blender | Premature at v0.5 and it creates an obligation. Note curl's ordering: **time listed before money**                                                                           |
| **No ask at all**                       | **PocketBase, Home Assistant**  | **This, for now.** PocketBase's FAQ item 0 is "Why?" and item 1 is "Do you offer hosting? — No." It converts the commercial question into expectations management [OSS §8.1] |

**The failure mode is documented and we should name it internally:** PocketBase's zero-ask model produced `Pocketbase lost its funding from FLOSS fund` (125 points, 101 comments, 18 Feb 2026) and `Will PocketBase Survive?` [OSS §6.5]. Zero-ask is right for v0.5 and wrong forever. The trigger to revisit is a 1.0 release with real users.

**The strongest permanence pledge in the corpus is Blender's and Krita's** — _"licensed as GNU GPL, **owned by its contributors**… Free and Open Source software, **forever**"_ — because contributor ownership makes relicensing structurally impossible [OSS §8.11]. **We cannot claim it**: this is one person's copyright. Claiming it would be the exact kind of overstatement this document exists to prevent. The three checkable facts in §6.2 are the honest substitute, and they are stronger than a promise because none of them requires trusting anyone.

---

## 7. Docs for two audiences

### 7.1 The pattern

Ghost does not write one set of docs for everyone. **It splits the navigation by persona first**, and only one of four personas is sent to `docs.ghost.org`; the other three go to `ghost.org/help`. The docs site is even titled "Ghost Developer Docs" [OSS §7.3B]. This is the only structural answer to "docs for non-technical people" found anywhere in the research.

### 7.2 Our split

Two personas, two destinations, two separate nav items.

|               | `/help` — **Help centre**                                                                                                              | `/docs` — **Developer docs**                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Who**       | Anyone with a portfolio to run. Students, designers, photographers, writers                                                            | Anyone running the server, contributing, or building on it      |
| **Voice**     | Task-first, screenshot-led                                                                                                             | Precise, terse                                                  |
| **Hard rule** | **Never shows a terminal command.** If a task requires one, it links across and says so in one sentence                                | **Never explains what a hero section is.** Links across instead |
| **Shape**     | All how-to. Diátaxis's own point: _"A rich list of how-to guides is an encouraging suggestion of a product's capabilities"_ [OSS §7.5] | Full Diátaxis: tutorials, how-to, reference, explanation        |
| **Search**    | Scoped to itself. A help search must never return a Docker page                                                                        | Scoped to itself                                                |

**Help centre categories** (six, and they map to the actual lifecycle rather than to our architecture):

1. **Getting your site up** — the one-click deploy, claiming the site, the four questions
2. **Editing your site** — pages, blocks, images, colours, typography, navigation
3. **Your domain and your email** — pointing a domain, why email is optional, what breaks without it
4. **Getting found** — search descriptions, social cards, the sitemap, what the sixteen checks mean
5. **When something goes wrong** — the twelve things that actually go wrong, each with the fix
6. **Moving in and moving out** — importing your content by hand, and the export button

**Developer docs top level:**

1. **Get started** — three install paths, in this order: one-click deploy → Docker → local from source
2. **Self-hosting** — Docker, Postgres, environment variables, updates, backups, reverse proxies
3. **Configuration** — every environment variable, with defaults and consequences
4. **Storage backends** — the adapter interface, the conformance suite, adding one
5. **Blocks** — the schema, the seven definitions, adding one
6. **Theming** — the token layer, what is and is not overridable
7. **Explanation** — why the content store, why draft/publish, why blocks quarantine instead of rejecting

### 7.3 Two ordering decisions that matter more than they look

**Install options are ordered easiest-first, and the first thing on the page is an honest warning.** PocketBase's getting-started page opens with a red callout before the introduction, presents a download widget with the architecture auto-detected from the user agent so nobody has to know what "ARM64" means, and the word "install" never appears — three actions, then the browser opens itself [OSS §7.3A]. Umami is the counter-example: it leads with a source build, and step one for a non-developer is `npm install -g pnpm` [OSS §7.3D]. Do not be Umami.

**Copy Coolify's second heading.** Its introduction runs "What is Coolify?" then immediately **"What Coolify Is Not"**, which states outright _"It's not a zero-effort solution either"_ [OSS §7.3C]. Our version — "What this is not" — sits second on both `/help` and `/docs` and says: it is not a hosted service, there is nobody on call, and it does not do shops, bookings or blogs yet.

### 7.4 Tooling

**Fumadocs**, in-repo, under `/docs` on the same domain.

Mintlify dominates the VC-backed dev-tool tier (8 of 23) but it is a hosted SaaS, which is an awkward look for a project whose entire argument is that you should host your own things. Fumadocs is the clear challenger, is newer in every observed case — Coolify migrated off VitePress to it, NocoDB off Docusaurus — and is Next.js-native, which matters because this is a Next 16 repository. Nobody in the corpus uses Nextra, VitePress, Starlight or Docsify today [OSS §7.1–7.2].

The help centre is not Fumadocs. It is pages on the marketing site, because it needs to look like the marketing site and it needs images more than it needs code blocks.

**Breadcrumb structured data on both**, `Article` on blog posts, and no `HowTo` markup — that rich result is dead and absent from the current search gallery [SEO §7.2].

---

## 8. Screenshots and product imagery

### 8.1 One persona, everywhere

Pick **one** demo persona and use it in every screenshot on the site, in the demo instance, in the README and in the OG images. Mixing personas across screenshots is the fastest way to make a young product look like a mock-up.

**Recommendation: a photographer.** Three reasons: the gallery and image blocks are the best-looking part of the product and a photographer's site exercises both; photographers have the most acute grievance in the market data (Adobe's kill switch, Squarespace's July 2026 rise reported by PetaPixel, client-gallery pricing); and image-heavy screenshots survive being scaled down to a social card, which text-heavy ones do not.

All demo assets must stay obviously invented. The repository's existing `public/demo/` assets are CC0 and depict invented companies — keep that rule and extend it: no real client names, no real brand marks, no recognisable real people.

### 8.2 The shot list

| #   | Shot                                                                | Must show                                                                                                                                                                               | Where it goes                                              |
| --- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | **Hero video** (≤30 s, silent, poster frame)                        | The whole loop: edit a headline → swap an image → publish → the public site changes. Real cursor, real latency, no speed-up beyond 1.5×                                                 | Homepage hero                                              |
| 2   | **The published site**, full page, desktop                          | What the output actually looks like. Scrolled to the work grid, not the top                                                                                                             | Homepage §3 step 3; comparison pages; OG image base        |
| 3   | **The editor with the docked preview open on the phone frame**      | That editing and previewing are the same screen; that mobile is real                                                                                                                    | Homepage §3; help centre                                   |
| 4   | **The block picker mid-drag**, one block lifted                     | That blocks are the mechanism, and that reordering is direct                                                                                                                            | Homepage §4                                                |
| 5   | **The four-question wizard, question two**, profession list visible | That the setup is four questions and one of them is "what do you do"                                                                                                                    | Homepage §3 step 2                                         |
| 6   | **The dashboard with three open checks**                            | That it tells you what is unfinished. Must show a real amber state, not all-green                                                                                                       | Homepage §4                                                |
| 7   | **The page SEO panel** with the description counter in amber        | That per-page SEO is real and gives feedback                                                                                                                                            | Homepage §4; comparison pages                              |
| 8   | **The contact inbox** with two seeded messages                      | That messages land somewhere even without email configured                                                                                                                              | Homepage §4                                                |
| 9   | **The export dialogue**, mid-download                               | The ownership argument, demonstrated                                                                                                                                                    | Homepage §6; every comparison page                         |
| 10  | **A terminal** with `docker compose up` and the ready line          | Credibility for the self-hosted claim. The **only** terminal image on the marketing site                                                                                                | Homepage §7; `/self-hosted-website-builder`                |
| 11  | **The version-history list** with a restore button                  | That publishing is reversible                                                                                                                                                           | Help centre                                                |
| 12  | **The media library** with the picker open                          | That images come from a library, not a file dialogue every time                                                                                                                         | Help centre; homepage §4                                   |
| 13  | **GitHub social preview**, 1280×640, under 1 MB                     | Product name, the one-line description, and one recognisable screenshot. Without one, shared links expand to "basic information about the repository and the owner's avatar" [SEO §4.1] | GitHub repository settings                                 |
| 14  | **Root OG image**                                                   | Headline option C — "Professional portfolio websites. Without the rent." — plus the product name                                                                                        | `app/opengraph-image.tsx`                                  |
| 15  | **Per-comparison OG images**                                        | "⟨Brand⟩ vs Open Portfolio Builder" on a consistent template                                                                                                                            | Nested `opengraph-image.tsx`, which overrides the ancestor |

### 8.3 Rules for every shot

**Do:**

- Shoot at 2× and export at the display size. Retina screenshots on a marketing site are table stakes and their absence reads as amateur immediately.
- Use real content from the demo persona. Every string a reader can see must be a plausible sentence.
- Keep one browser frame style, or none, consistently. If a frame shows a URL, it must be a URL we actually control.
- Show the amber and error states, not only the happy path. A dashboard with three outstanding checks is more persuasive than one with none, because nobody believes the one with none.
- Annotate sparingly and in the site's own type and colours, never in a screenshot tool's default red.
- Provide `alt` text that describes the _state_, not the _file_ ("the editor with the mobile preview open beside a half-written case study").
- Ship both a light and dark variant only if the product genuinely has both. It has one theme; do not fake a second.

**Do not:**

- **No lorem ipsum, no "Your Name", no "Lorem Studio".** The product ships with a "Your Name" placeholder before setup is finished [GOING-PUBLIC]; that string must never appear in a marketing image.
- **No stock-photo people.** Every one of them is reverse-image-searchable.
- **No invented company logos that look real.** The CC0 demo brands are fine because they are visibly invented; a convincing fake logo strip is a trademark and credibility problem at once.
- **No fabricated analytics, visitor counts, star counts or revenue figures in a screenshot.** A number in an image is still a claim.
- **No macOS window chrome with a URL bar showing a domain we do not own.**
- **No mock-up frames of devices we have not tested on**, especially the admin on a phone — mobile admin does not exist yet and a screenshot implying it does is the single easiest way to be caught.
- **No competitor screenshots.** Nominative fair use covers naming a brand in text; it does not cover reproducing their interface, their logo or their brand colours [OSS §3.15]. Comparison pages get a table and our own screenshots, never theirs.
- **No `display: grid` in `ImageResponse`** — the OG image renderer supports flexbox only [SEO §7.1].

### 8.4 Video, and what the corpus actually reaches for

No project in the sample was found using a scripted-tour vendor (Arcade, Navattic, Storylane, Supademo, Reprise, Walnut and eight others were grepped for across 22 saved landing pages — zero matches, though the grep is suggestive rather than conclusive because those vendors inject client-side) [OSS §4.6]. What they reach for instead is **video and screenshots**: Typebot's README demo is an MP4, Papermark's is a GIF, Coolify's landing page offers "Screenshots" and "Videos" as secondary CTAs.

So: one hero video, one README GIF (the same loop, under 3 MB, autoplaying because GitHub does), and static screenshots everywhere else. No tour vendor, no product-tour overlay, no talking head.

---

## 9. `/is-this-right-for-you` — the honest self-assessment page

Modelled on `plausible.io/when-not-to-use-plausible`, which the research calls the single most striking artefact in the file: a dedicated, indexed, footer-linked page whose entire purpose is to talk you out of it [OSS §3.2]. Footer label: **"Right for you?"** — Plausible's exact label.

**One structural difference from Plausible's, and it is the honest one.** Plausible's framing device is _"Every use case listed above represents a real request we have received. We have said no to all of them."_ We cannot say that, because most of our gaps are "not built yet" rather than "decided against". So the page separates the two explicitly. That distinction is more useful to a reader than borrowing a line we have not earned.

---

> # When this is not the right tool
>
> This page exists because there is a decent chance you should use something else, and finding that out now is better for both of us than finding it out after you have moved your portfolio.
>
> Everything below is either **not built yet** or **not going to be built**, and I have said which is which.
>
> ## It is alpha, and that word is doing real work
>
> _Not built yet._ Version 0.5. The site works, the editor works and publishing works. But the home page cannot yet be built from blocks, there is one visual theme with no way to swap it, there is no blog, and image uploads have not been run against the hosted object stores with real credentials. If you would be upset by a rough edge in the thing that represents your professional work, wait for 1.0.
>
> ## There is one design, and it might not be yours
>
> _Not built yet — a second theme is planned for 0.6._ One theme, and you cannot change it without editing code. You can change the colours, the typography and every word, and you can arrange blocks freely on any page except the home page. That is a long way from what Framer, Cargo or a bought Semplice licence give a designer who wants a specific look. If the design _is_ the work — if you are a designer being hired for visual range — you will feel this constraint on day one. **[Framer](https://www.framer.com/), [Cargo](https://cargo.site/) and [Semplice](https://www.semplice.com/) are all better answers to that problem than this is today.**
>
> ## Nobody is on call
>
> _Not going to change, and this one is structural._ There is no support desk, no phone number, no SLA and no status page with somebody watching it. There is one person and a GitHub issue tracker. If you are self-hosting and something breaks at 11pm before an interview, the person fixing it is you.
>
> This is the honest trade for owning it. Plausible put it better than I can, about their own product: _"When you self-host, the work we do for cloud customers becomes your work… The control that makes self-hosting appealing also makes all of this your responsibility."_
>
> If your income depends on this site being reachable tomorrow morning and you do not want to be the person responsible for that, **paying Squarespace or Adobe is a rational purchase and I am not going to talk you out of it.**
>
> ## It is a portfolio, and only a portfolio
>
> _Not going to be built._ There is no shop, no booking system, no membership or paid-subscriber area, no events calendar and no course platform. If you need to take payments, **[Squarespace](https://www.squarespace.com/) and [Wix](https://www.wix.com/) both sell commerce plans and this never will.** Staying narrow is the point — it is what stops the setup from being a project in its own right.
>
> ## There is no blog yet
>
> _Not built yet — planned for 0.9._ You can make pages, and a page can hold text, images and galleries. But there is no post list, no dates, no tags, no RSS feed and no archive. If writing is the main thing you do, **[Ghost](https://ghost.org/) is a better tool and is also open source**, and a static site generator with a Git-based CMS will serve you well if you do not mind a little setup.
>
> ## It is not a client-gallery or proofing tool
>
> _Not going to be built._ No per-client galleries with individual passwords, no proofing, no print sales, no download-limits or watermarking. Photographers who need those should look at the tools built for them. The product does support password-free private pages by keeping them out of search, which is not the same thing and should not be mistaken for it.
>
> ## It does not solve client handoff
>
> _Not built yet, and honestly nobody else has solved it either._ If you build sites for clients, there is no clean way to hand one over — no ownership transfer, no agency workspace, no billing separation. What you _can_ do is deploy it into the client's own GitHub and hosting account from the start, which is more than most platforms allow but is not the same as a handoff button.
>
> ## English only
>
> _Not built yet, and not soon._ The admin interface is in English. Your site's content can be in any language, but there is no multilingual site support — no second-language version of a page, no language switcher.
>
> ## If your portfolio advertises services and you deploy on Vercel Hobby
>
> _Not our rule, but you need to know it._ Vercel's Fair Use Guidelines restrict Hobby to non-commercial personal use, and their definition of commercial usage includes _"advertising the sale of a product or service"_. A freelancer's portfolio plausibly falls inside it. Use Netlify, use a server, or pay for Vercel Pro. [The details are here.](/what-it-costs#vercel)
>
> ## If you do not want to think about hosting at all
>
> _Not going to change._ Somebody has to press deploy and somebody has to own a domain. It is one button and one purchase, and it is still two more decisions than signing up for something. If that is one decision too many, **Wix's free tier will publish a site today** — it carries an advertising banner that scrolls with your visitors, but it is free and it is instant. **[Behance](https://www.behance.net/) and [Contra](https://contra.com/) will also give you a public profile with no setup at all.**
>
> ---
>
> ## This is probably a good fit if you:
>
> - Want a multi-page portfolio with real project pages, not a one-page link list
> - Are tired of a subscription for a site you update twice a year
> - Want the work to still be yours if you stop paying, or if a company gets bought, or if a product gets discontinued
> - Are comfortable pressing one deploy button, or already have a server
> - Can live with one design for now
> - Would rather report a bug than wait for a support ticket
>
> ## This is probably not a good fit if you:
>
> - Need to sell things, take bookings or run a membership
> - Need a blog with posts, dates, tags and a feed
> - Need client galleries with individual passwords or proofing
> - Need a specific visual design that one theme will not give you
> - Need somebody to be responsible when it breaks
> - Need it in a language other than English
> - Are handing the finished site to a client and never touching it again
> - Would be upset by an alpha-quality rough edge on the thing that gets you hired
>
> ---
>
> Still think it fits? **[Open the live demo](/demo)** and try to break it. That is the fastest way to find out, and it costs you four minutes.

---

## 10. Launch sequence

### 10.1 The three findings that shape it

1. **The launch is rarely the peak.** Excalidraw's first Show HN scored **30 points**; it now has 129.3k stars. Papermark's scored **35**; it went on to SOC 2 Type II and roughly $600K ARR. **Documenso never cleared 5 points on any HN post** and raised money and shipped an enterprise product anyway [OSS §6.2, §6b.2]. HN is a lottery ticket, not a gate.
2. **Third-party submissions frequently outscore the founder's own.** Cal.com +85%, Coolify +142%, PocketBase's reposts +19%. Penpot (1145), Supabase (1120) and n8n (728) were all submitted by readers, not makers. **Five of the top ten posts carry no "Show HN:" prefix at all** [OSS §6b.4].
3. **Content outperformed the launch, by 3.5×, for the best-documented project in the file.** Plausible's Show HN scored 351; their blog post "Tech-savvy audiences block Google Analytics" scored **1214** [OSS §6b.6].

The consequence: **the launch is one event in a sequence, it is not the plan, and the assets it lands on matter more than its timing.**

### 10.2 The sequence

**Week 0 — Go public. Do not announce.**

Publish the repository, set the About string from §1.4, set the twenty topics, upload the social preview, and cut a tagged **v0.5.0** release. This is the only time-gated action in the whole plan: awesome-selfhosted requires four months since first release, sindresorhus's awesome guidance requires thirty days, and AlternativeTo's free queue is months long. None of those clocks start until we are public [SEO §3.2]. Everything else in this document can happen afterwards. Full checklist already exists in [`GOING-PUBLIC.md`](./GOING-PUBLIC.md).

Same week: OpenAlternative (highest single-submission ROI — it feeds a 6,561-star awesome list and a 12K newsletter from one form) and AlternativeTo (**pay the $5 priority review**; the free queue is months) [SEO §8.1].

**Weeks 1–2 — The demo, and the dogfood.**

Ship `OPB_DEMO_MODE` (§4.4). Stand the demo up on `demo.⟨domain⟩`. Publish the maintainer's own portfolio, built with the product, on a real domain, and link it from the homepage as "this is my actual site". Do the Reddit research the SEO dossier flags as its biggest gap — two hours, logged out, twenty verbatim quotes with URLs [SEO §10].

**Weeks 3–5 — The site.**

Homepage, `/what-it-costs`, `/is-this-right-for-you`, the help/docs split, and the two SEO money pages (`/open-source-website-builders`, `/self-hosted-website-builder`). The hub page goes first because it needs the longest indexing runway [SEO §12].

**Weeks 6–8 — Comparison pages.**

Adobe Portfolio, Wix, Framer, Squarespace, Carrd, in that order, to the §5.2 skeleton. Building them generates the pricing data, the tables and the side-by-side screenshots that the hub page and the cost study both reuse — the research is done once and spent three times.

**Weeks 9–11 — Original data, then outreach.**

Publish the true annual cost of a portfolio site across Squarespace, Wix, Adobe Portfolio, Format, Carrd and Framer, including renewal pricing and transaction fees. Three separate systems reward this: Google's live original-content systems, Google's own first self-assessment question, and the documented behaviour of listicle authors, who proactively asked to include a tool within a month of it publishing original data [SEO §8.3]. Then run outreach to the twelve publishers in [SEO §8.2], leading with the data rather than the product.

**Week 12 — Show HN.**

By this point the Docker path is real, the demo is live, the docs exist, and the hub page has had two months to index — so the spike lands on assets that can convert it.

### 10.3 The Show HN itself

**The title rule, which is non-negotiable.** Every portfolio-framed Show HN in the visible history of the category failed: 4 points, 2 points, 1 point [SEO §1.5]. The title must describe a **technical mechanism** and must not contain the words "portfolio builder". Candidates in the shape that scored 78–180 in this category, and 250+ in the general "open-source alternative" shape:

- `Show HN: A no-code site editor that writes to your own Postgres, not ours`
- `Show HN: A CMS that runs at zero cost on free Vercel and Neon tiers`
- `Show HN: Self-hosted visual editing with draft/publish, in one Docker command`

**Submit the demo URL, not the homepage.** Show HN's rules say _"Don't post landing pages"_ and _"Please make it easy for users to try your thing out, ideally without barriers such as signups or emails"_ [OSS §6.3]. The demo satisfies both; the marketing site satisfies neither and will be flagged.

**dang's rules, which are the actual scoring function** [OSS §6b.7]:

- **Write the post by hand. No LLM, not even to tidy it.** dang added this on 2026-03-28: _"the community is super fussy about this right now, and LLM language leaves imprints on your text which are generating quite some backlash… This is a big dividing line at present!"_
- **Give the backstory** — how you came to work on it, what is different about it.
- **Drop anything that sounds like marketing.** _"On HN, that is an instant turnoff."_
- **Do not use the project name as your username.**
- **Do not ask anyone to upvote or comment**, and make sure nobody adds booster comments. HN's voting-ring detection has been a priority for over twelve years and the documented outcome is that great Show HNs get demoted for it.

**Pre-empt the one predictable attack.** Cal.com's most successful thread still drew _"I wish companies would stop using 'open source' as a growth strategy"_ and _"They're venture backed, it's a growth hack"_ [OSS §6b.8] — and those 2023 comments predicted Cal.com's April 2026 relicensing exactly. Our first comment should say, plainly and early: no company, no funding, no hosted service, no paid tier, MIT, and here is the page where I said what happens if that ever changes. That is a defence nobody else in the corpus could make.

**Timing is genuinely unresolved and should not be over-thought.** Two BigQuery analyses point at weekends and low-competition hours (Myriade: Sunday 11.75% breakout vs 9.45–9.90% on weekdays; Chanind: Sunday 06:00 UTC 2.5× more likely to reach the front page than Wednesday 09:00 UTC), and both optimise for _probability of reaching the front page_. Founder folklore optimises for _total eyeballs conditional on making it_. Both are internally consistent and they point in opposite directions [OSS §6b.5]. **Pick a Sunday between 11:00 and 16:00 UTC**, because breakout probability matters more than ceiling for a first post, and stop optimising. HN's own commenters are right that _"building something that people actually want will get you orders of magnitude more upvotes than whatever variance can be attributed to the time of posting."_

### 10.4 The plays that matter more than the launch

**The astonishing-portfolio play.** HN does not reward _a tool for making portfolios_ — Postcard scored 140, portfolo.app 47. HN massively rewards _look at this astonishing portfolio I made_: "Show HN: I recreated Windows XP as my portfolio" scored **1032 points** [OSS §6.4]. The research flags this as an inference rather than a stated finding, but it is the strongest signal available in a category with no launch precedent. **Build one genuinely remarkable portfolio with the product and let the builder be the reveal, not the pitch.** That is a separate submission from the Show HN, later, and it is probably the higher-ceiling one.

**Content, because it beat the launch 3.5× for Plausible.** Three posts we are uniquely positioned to write, in order of expected value:

1. The true annual cost of a portfolio site (the §10.2 data study — this is also the listicle-outreach asset).
2. What happens to your website when the company gets bought, discontinued or relicensed — Behance ProSite 2016, read.cv 2025, Cal.com 2026 — all verified, all dated, all linked. **Do not use Coroflot as an example; it has not shut down and coroflot.com still resolves.**
3. An architecture piece on how the block editor writes to a pluggable storage backend, timed with the Show HN [SEO §4].

**Third-party submission, done correctly.** You cannot ask for it — soliciting submissions is against HN's guidelines and against dang's explicit advice. What you _can_ do is be genuinely present in the places where someone might: r/selfhosted (the category's centre of gravity, and r/selfhosted threads demonstrably surface into HN), r/opensource, r/webdev, r/SideProject, and selfh.st's Self-Host Weekly once the Docker path is public. **Every Reddit rule in the research is search-derived and unverified because every access route was blocked; read each subreddit's actual sidebar before posting** [OSS §6b.11].

**Reposting is normal and permitted.** Infisical has five separate HN posts and its best-performing one was not a Show HN and came eight months after the first. dang's rule: only if the version is significantly different, link the previous thread, and _"probably only… once or twice a year"_ [OSS §6.2, §6b.7].

**Product Hunt: defer to 2027.** Dub's documented 1,085-upvote launch had two named preconditions — 15,000+ GitHub stars and a 25,000+ email list. We have neither [SEO §8.4].

### 10.5 What success looks like at day 90

Four narrow questions, and only the first one decides anything [SEO §12]:

1. Is `/open-source-website-builders` indexed, and where does it sit on `open source website builder`?
2. Did any of the alternative pages get an impression on its qualified query?
3. Did any third-party listicle, directory or awesome list add us? Off-site placement is what compounds.
4. Did the Show HN clear 50 points? Below that, the framing is still wrong and should be retried with a **different mechanism**, not a different product description.

And one more, specific to this document: **did anybody use the demo, and did anyone who used it then deploy?** If the demo does not convert, nothing else on the homepage will, because at zero social proof the demo is the only proof we have.

---

## 11. Facts, flags and forbidden claims

### 11.1 The competitor fact table

This is the specification for `content/competitors/*.ts` (§5.3). Every marketing claim about a competitor must trace to a row here. `confidence` values: **V** = verified at the vendor's own live URL; **T** = agreeing third parties, vendor page unfetchable; **U** = unverified, must carry the flag wherever it appears.

| Fact                                           | Value                                                                                                                                                        | Source                                                                                                                                                                                                                                         | Checked    | Conf. |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----- |
| Wix cannot export a site                       | _"Since Wix is a SaaS solution, your site must run on Wix's servers."_                                                                                       | [support.wix.com](https://support.wix.com/en/article/exporting-or-embedding-your-wix-site-elsewhere)                                                                                                                                           | 2026-08-12 | **V** |
| Wix free tier                                  | Publishes on a subdomain with an ad banner that scrolls with the visitor; 500 MB storage, 1 GB bandwidth; no custom domain                                   | [WebsiteBuilderExpert](https://www.websitebuilderexpert.com/website-builders/wix-pricing/)                                                                                                                                                     | 2026-02-03 | **T** |
| Wix pricing                                    | Light $17 / Core $29 / Business $39 / Elite $159 per month, annual                                                                                           | WebsiteBuilderExpert + [Tooltester](https://www.tooltester.com/en/reviews/wix-review/prices/) agree; live page is JS-rendered                                                                                                                  | 2026-08-12 | **T** |
| Squarespace export excludes portfolio pages    | Export omits portfolio pages, album, cover, index and info pages, style settings and Custom CSS                                                              | [Squarespace help](https://support.squarespace.com/hc/en-us/articles/206566687-Exporting-your-site)                                                                                                                                            | 2026-08-12 | **V** |
| Squarespace has no free tier                   | _"Squarespace doesn't offer a free plan"_; trial content _"marked for permanent deletion"_ on expiry                                                         | [squarespace.com/pricing](https://www.squarespace.com/pricing) + [help](https://support.squarespace.com/hc/en-us/articles/206536827-Starting-a-Squarespace-trial-site)                                                                         | 2026-08-12 | **V** |
| Squarespace July 2026 rise                     | Basic $16→$19 (+19%), Core $23→$29 (+26%), Plus $39→$49 (+26%), annual. _"Squarespace has seemingly not published a specific memo about its price changes."_ | [PetaPixel](https://petapixel.com/2026/07/17/squarespace-is-increasing-prices-by-up-to-26/) + WebsiteBuilderExpert agree                                                                                                                       | 2026-08-12 | **T** |
| Squarespace ownership                          | Taken private by Permira for $7.2bn, closed 17 Oct 2024                                                                                                      | [PetaPixel](https://petapixel.com/2024/10/18/private-equity-firm-permira-acquires-squarespace-for-7-2-billion/)                                                                                                                                | 2026-08-12 | **T** |
| Adobe Portfolio kill switch                    | _"your site will remain live for 14 days. After this 14-day grace period, your site will come offline."_                                                     | [Adobe Product Community](https://community.adobe.com/questions-606/what-happens-to-my-portfolio-once-i-end-my-adobe-subscription-578410)                                                                                                      | 2026-08-12 | **V** |
| Adobe Portfolio cheapest route                 | Behance Pro US$11.49/mo, includes Portfolio with up to 5 sites, free hosting and custom domains, 7-day trial                                                 | [behance.net/pro](https://www.behance.net/pro)                                                                                                                                                                                                 | 2026-08-12 | **V** |
| Adobe Portfolio has no free tier and no export | Requires an active paid subscription to publish; no export documented                                                                                        | Adobe pages 403'd/timed out; community + third parties                                                                                                                                                                                         | 2026-08-12 | **T** |
| All Creative Cloud plan prices                 | Photography 20GB $9.99→$14.99/mo from 15 Jan 2026; CC Standard $54.99; CC Pro $69.99                                                                         | Adobe's own pages timed out or 403'd on every attempt                                                                                                                                                                                          | 2026-08-12 | **U** |
| Behance ProSite shutdown                       | Announced Feb 2016, off June 2016; migration path was buying a Creative Cloud plan                                                                           | [Core77 thread](https://boards.core77.com/t/behance-prosite-discontinued-moving-to-adobe-portfolio/30813), quoting Behance verbatim                                                                                                            | 2026-08-12 | **V** |
| Framer pricing                                 | Free / Basic $10 / Pro $30 per month, annual. Pages 30/30/150                                                                                                | [framer.com/pricing](https://www.framer.com/pricing/)                                                                                                                                                                                          | 2026-08-12 | **V** |
| Framer month-to-month prices                   | —                                                                                                                                                            | **Not one of six sources published them**                                                                                                                                                                                                      | 2026-08-12 | **U** |
| Framer has no export                           | No native HTML or code export                                                                                                                                | Absence; third-party exporters exist because of it                                                                                                                                                                                             | 2026-08-12 | **T** |
| Framer removed the Mini plan                   | $60/yr Mini removed Oct 2025; CMS cut to one collection; bandwidth 50 GB → 10 GB                                                                             | r/framer threads with dated permalinks                                                                                                                                                                                                         | 2026-08-12 | **T** |
| Webflow code export needs two subscriptions    | Site plan $15/mo **plus** a Workspace $16–19/mo; export loses all CMS content, ecommerce and native forms                                                    | Three independent dated write-ups agree; Webflow's own page 403s                                                                                                                                                                               | 2026-08-12 | **T** |
| Carrd exports unminified source                | _"Download the unminified HTML, CSS, JS, and images for any sites you build (note: excludes server-side code)."_ Pro Standard $19/**year**                   | [carrd.co/docs/pro/features](https://carrd.co/docs/pro/features)                                                                                                                                                                               | 2026-08-12 | **V** |
| Carrd builds one-page sites only               | _"a free service for building fully responsive one-page sites"_                                                                                              | carrd.co docs                                                                                                                                                                                                                                  | 2026-08-12 | **V** |
| read.cv wound down                             | Acquired by Perplexity, announced 17 Jan 2025, fully wound down 16 May 2025                                                                                  | [TechCrunch](https://techcrunch.com/2025/01/17/perplexity-acquires-read-cv-a-social-media-platform-for-professionals/); read.cv and posts.cv now return HTTP 402                                                                               | 2026-08-12 | **V** |
| Cal.com went closed source                     | 15 April 2026; MIT community fork spun out; HN 391 points / 317 comments                                                                                     | [Cal.com](https://cal.com/blog/cal-diy-open-source-to-closed-source), [Slashdot](https://yro.slashdot.org/story/26/04/15/1913213/calcom-is-going-closed-source-because-of-ai), [It's FOSS](https://itsfoss.com/news/cal-com-goes-proprietary/) | 2026-08-12 | **V** |
| **Pixieset — everything**                      | —                                                                                                                                                            | **No data. The market research covers Pixpa, not Pixieset.**                                                                                                                                                                                   | —          | **U** |
| Vercel Hobby commercial-use restriction        | _"Hobby teams are restricted to non-commercial personal use only… Advertising the sale of a product or service"_ counts as commercial                        | [Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines), last updated 2026-07-29                                                                                                                                             | 2026-08-12 | **V** |
| Netlify credit value                           | 300-credit free plan; **what one credit buys is not published and the credits doc URL 404s**                                                                 | [netlify.com/pricing](https://www.netlify.com/pricing/)                                                                                                                                                                                        | 2026-08-12 | **U** |
| Supabase pauses free projects                  | After ~7 days of low activity; one-year restore window                                                                                                       | [Supabase docs](https://supabase.com/docs/guides/platform/free-project-pausing)                                                                                                                                                                | 2026-08-12 | **V** |

### 11.2 Standing gaps, stated rather than papered over

**No review-site ratings exist anywhere in this research.** Trustpilot, G2 and Capterra returned HTTP 403 to every method attempted, including a real browser [Market §3 preamble]. There are therefore no star ratings, no review counts and no review quotes for any competitor, and none for us. Any "rated X by users" proof is unavailable, for everyone, in every direction. What it would take to close it: a listing on one of those sites, real users leaving real reviews, and a dated screenshot. Until then, the claim does not exist.

**Core Web Vitals: do not make a speed comparison.** The figures in the market research (Duda 71% / Squarespace 58% / Drupal 54% / Wix 52% / Joomla 43% / WordPress 38%) are **April 2024 data — roughly two years stale** and not re-verified for 2026. A November 2025 pull exists in the same source with different numbers. Either way, **we have not measured our own Core Web Vitals**, so a comparison would be an unmeasured claim against stale data. If any of those numbers is used at all, the April 2024 date must appear in the visible copy, not in a footnote. **Better: do not use them.** The performance claim we can actually stand behind is architectural and needs no borrowed number: server-rendered, static where possible, and no page-builder runtime shipped to visitors. Live-figure lead, unfetched and **UNVERIFIED**: `webvitals.tools/blog/core-web-vitals-data-april-2026/`.

**Coroflot has not shut down.** coroflot.com still resolves. It must not be used as a platform-shutdown example. The verified shutdown examples are **read.cv** (2025) and **Behance ProSite** (2016).

**Reddit rules and subscriber counts are all unverified.** Every access route to Reddit was blocked at the network level during the research [OSS §6b.11]. Read each subreddit's actual sidebar before posting anything.

**Awesome-list traffic is unproven.** No first-party analytics from any project attributing traffic to an awesome-selfhosted listing were found. Treat the listing as a discovery and classification asset, not a traffic channel [OSS §6b.10].

### 11.3 Two statistics that do not exist and must never appear

The market research went looking for both and could not find either [Market §6.4]:

1. **"X% of hiring managers look at a portfolio."** It is not in NACE's Job Outlook research, which measures _skills sought on résumés_, and it was not found anywhere else.
2. **"Recruiters spend N seconds on a portfolio."** No credible study exists. The widely repeated six-second figure is from TheLadders' eye-tracking study of **résumés**. It must not be repurposed.

**Use these instead, each with its qualifier attached:**

- The US Bureau of Labor Statistics, on its Graphic Designers page: _"Graphic designers should demonstrate their creativity and originality through a professional portfolio."_ A federal labour-market authority stating that a portfolio is an expected hiring artefact.
- CareerBuilder/Harris Poll, **2017** (2,300+ hiring managers): **57% of employers are less likely to interview a candidate they can't find online.** Always cite it with the year attached — it is nine years old and no comparable-methodology replacement was found.
- A hiring manager's unprompted remark that _"most design managers spent 1-3 mins looking at your work"_ — quotable **only** if labelled as an anecdote from a named forum thread, never as a statistic.

### 11.4 The banned-copy list, in one place

Never publish, on any page, in any image, in any commit:

- A testimonial from anyone who is not a real, disclosed user.
- A customer logo wall, or any third-party brand mark used as endorsement.
- Any competitor's screenshot, logo, stylised wordmark or brand colours.
- Any usage, star, download, revenue or rating number that is not independently checkable in one click.
- Any competitor pricing or capability claim without a source URL and a verification date in the visible copy.
- Any unflagged **U**-confidence fact from §11.1.
- The two non-existent portfolio statistics in §11.3.
- A speed comparison against a competitor (§11.2).
- Coroflot as a shutdown example (§11.2).
- Any use of the word "demo" that means "talk to a human".
- The string "Your Name", or any placeholder content, in a marketing image.

---

## 12. Build order, one line each

| #   | Artefact                                                                                                       | Blocks                                              | Week |
| --- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---- |
| 1   | Repository public, About string, twenty topics, social preview, v0.5.0 tag                                     | Nothing — do this first, three clocks start         | 0    |
| 2   | `OPB_DEMO_MODE` in the product: banner, credential prefill, disabled surfaces, hourly reset                    | The demo, the Show HN, every screenshot             | 1    |
| 3   | Demo instance at `demo.⟨domain⟩` plus the maintainer's own portfolio, live                                     | The homepage hero, all social proof                 | 1–2  |
| 4   | Site skeleton: metadata, canonicals, honest `lastmod`, OG images, JSON-LD, `llms.txt`, all AI crawlers allowed | Everything else; retrofitting is far more expensive | 3    |
| 5   | `content/competitors/*.ts` with the §11.1 table and the unflagged-fact guard                                   | Every comparison page and the hub                   | 3    |
| 6   | Homepage, twelve sections                                                                                      | —                                                   | 3–4  |
| 7   | `/what-it-costs` and `/is-this-right-for-you`                                                                  | Homepage FAQ links into both                        | 4    |
| 8   | `/open-source-website-builders` hub, `/self-hosted-website-builder`                                            | Longest indexing runway, so earliest                | 4–5  |
| 9   | Help centre and developer docs, split by persona                                                               | —                                                   | 5    |
| 10  | Screenshot set, all fifteen shots, one persona                                                                 | Homepage, docs, comparison pages, README            | 5    |
| 11  | `/alternatives/{adobe-portfolio,wix,framer,squarespace,carrd}`                                                 | Generates the cost-study data                       | 6–8  |
| 12  | Pixieset primary research, then `/alternatives/pixieset`                                                       | Blocked: we hold zero verified facts                | 8    |
| 13  | The cost study, then listicle outreach to the twelve publishers                                                | Needs 11                                            | 9–11 |
| 14  | Show HN, demo URL, mechanism title, hand-written                                                               | Needs 2, 3, 8, 9                                    | 12   |
