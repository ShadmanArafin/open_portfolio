# RAW RESEARCH — How successful open-source projects market themselves

**Purpose.** Evidence dump for designing the landing page, launch and docs of a new open-source
no-code portfolio builder. This file is deliberately _raw_: verbatim quotes, actual section orders,
actual numbers, with source URLs. Someone else synthesises it into a plan. **Nothing here is a
recommendation.**

**Gathered:** 2026-08-11/12.
**Method:** direct `WebFetch` of live marketing pages, GitHub READMEs (`raw.githubusercontent.com`),
and the Hacker News Algolia API (`hn.algolia.com/api/v1/search`), plus targeted web search.

### Reliability caveats — READ FIRST

| Caveat                             | Detail                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fetch pipeline is a summariser** | `WebFetch` renders a page to markdown and passes it through a small model. Section lists are reliable; headline/CTA strings are _usually_ verbatim but a small number may be lightly normalised (capitalisation, an ellipsis). Anything load-bearing should be re-checked against the live page before it is quoted publicly. |
| **JS-rendered pages under-report** | Supabase, Umami, Excalidraw and Papermark returned partial or empty bodies. Their rows below are marked `⚠️ PARTIAL`.                                                                                                                                                                                                         |
| **Wayback needs a workaround**     | `WebFetch` is blocked for `web.archive.org` (`Claude Code is unable to fetch from web.archive.org`). It IS reachable via `curl https://web.archive.org/web/<timestamp>id_/<url>` — that is how the five early snapshots in §5.10–5.14 were obtained. All snapshot timestamps there are exact.                                 |
| **Web search budget exhausted**    | 200/200 `WebSearch` calls consumed. Later gaps were filled with `WebFetch` only.                                                                                                                                                                                                                                              |
| **Dates**                          | Star counts, pricing and numeric claims are as of **August 2026** and move fast. Treat every number as a snapshot, not a constant.                                                                                                                                                                                            |

### Contents

| §          | Section                           | The highest-value items inside                                                                                                                                                                    |
| ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **§0**     | ⚠️ Cal.com went closed source     | The announcement quotes, the HN backlash, why licence permanence is now a live trust axis                                                                                                         |
| **§1**     | Landing page anatomy — 24 sites   | Full verbatim section orders; §1.4 PocketBase (zero social proof); §1.25 the shared skeleton                                                                                                      |
| **§2**     | Hero copy — 39 verbatim headlines | §2.2 the formulas; §2.3 where "open-source alternative to X" actually lives; §2.5 the CTA strings                                                                                                 |
| **§3**     | Comparison pages                  | §3.2 Plausible's "when NOT to use us" page; §3.4 PostHog conceding rows to a rival; §3.14 the "Steelman competitors" handbook rule; §3.15 the legal position                                      |
| **§4**     | Demo strategy                     | §4.1 PocketBase's reset banner; §4.2 "demo" captured by sales; §4.7 the three demo architectures                                                                                                  |
| **§5**     | Trust and social proof            | §5.6 Documenso's honest compliance matrix + Plausible's badge-free /security; **§5.10–5.15 five archived zero-proof homepages**; §5.16 the FTC rule; §5.17 honest substitutes                     |
| **§6/§6b** | Launch tactics                    | §6.2 the launch is rarely the peak; §6b.3 the base-rate table; §6b.5 timing; §6b.6 Plausible's MRR by month; §6b.7 dang's tips; §6b.8 what backfires; §6b.9 fake stars; §6b.10 awesome-selfhosted |
| **§7**     | Documentation sites               | §7.2 tooling tally (Mintlify 8, Fumadocs 4, Nextra 0); §7.3 four getting-started teardowns; **§7.3B Ghost's persona-split nav**; §7.5 Diátaxis                                                    |
| **§8**     | Pricing when everything is free   | §8.1 PocketBase's zero-ask model; §8.7 Immich's "unlocks nothing"; **§8.10 what the nav says instead of "Pricing"**; §8.11 the pledge set                                                         |
| **§9**     | Cross-cutting threads             | Ten places where independent research streams corroborated each other                                                                                                                             |

---

## ⚠️ §0 — THE SINGLE BIGGEST STORY IN THIS RESEARCH: Cal.com went closed source (April 2026)

This is the most important context in the entire document, because it invalidates a chunk of the
conventional "be the open-source alternative to X" playbook and it is _fresh_.

**What happened.** On **14–15 April 2026** Cal.com — for five years the canonical "open-source
Calendly alternative" and one of the most-cited OSS marketing success stories — **moved its main
codebase to closed source**, and spun out `calcom/cal.diy`, an MIT-licensed, feature-stripped
community fork.

- Source: <https://cal.com/blog/cal-com-goes-closed-source-why> — "Cal.com is going closed source. Here's why.", **Bailey Pumfleet, Apr 14 2026**
- Source: <https://cal.com/blog/cal-diy-open-source-to-closed-source> — "Going Closed-Source: Technical Changes Behind Cal.diy", **Keith Williams, Apr 15 2026**
- HN thread: <https://news.ycombinator.com/item?id=47780456> — title **"Cal.com is going closed source"**, **391 points, 317 comments**

**Verbatim from the announcement** (<https://cal.com/blog/cal-com-goes-closed-source-why>):

> "When we started Cal.com, we believed deeply in open source. It's a core principle we built this company around, and something we've been incredibly proud of."

> "Today, AI can be pointed at an open source codebase and systematically scan it for vulnerabilities."

> "Being open source is increasingly like giving attackers the blueprints to the vault. When the structure is fully visible, it becomes much easier to identify weaknesses and exploit them."

> "Remain open source and accept increasing risk to customer data, or move to closed source to reduce that risk."

> "We want to ensure there is still a truly open version available for developers, hobbyists, and anyone who wants to explore and experiment."

> "AI uncovered a 27-year-old vulnerability in the BSD kernel, one of the most widely used and security-focused open source projects, and generated working exploits in a matter of hours."

Attributed to CEO Bailey Pumfleet in press coverage (⚠️ _second-hand, via search summary of
how2shout / Slashdot / Gigazine coverage — not fetched directly_):

> "Open source code is basically like handing out the blueprint to a bank vault. And now there are 100× more hackers studying the blueprint."

**Verbatim from the technical follow-up** (<https://cal.com/blog/cal-diy-open-source-to-closed-source>):

> "We changed Cal.diy's license from AGPL 3.0 to MIT."

> "Cal.diy is maintained by former Cal.com interns who are now official maintainers."

**The `cal.diy` README now carries a warning banner** — this is the _first thing_ in the file
(<https://raw.githubusercontent.com/calcom/cal.com/main/README.md>, which now serves the cal.diy README):

> "[!WARNING] Use at your own risk. Cal.diy is the open source community edition of Cal.com and it is intended for users who want to self-host their own Cal.diy instance. It is strictly recommended for personal, non-production use."

> "[!TIP] For any commercial and enterprise-ready scheduling infrastructure, use Cal.com, not Cal.diy; hosted by us or get invited to on-prem enterprise access here"

README tagline: **"The community-driven, open-source scheduling platform."**
Repo About: **"Scheduling infrastructure for absolutely everyone."** — **47.4k stars**.

**The community reaction** (verbatim top comments from <https://news.ycombinator.com/item?id=47780456>):

| User                         | Comment (verbatim)                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `simonw`                     | "open source libraries can share that auditing budget while closed source software has to find all the exploits themselves in private."                 |
| `DrammBA`                    | "I have a feeling the real reason is them trying to avoid someone using AI to copyright-wash their product, they're just using security as the excuse." |
| `OsrsNeedsf2P`               | "The real answer is they are likely having a hard time converting people to paid plans"                                                                 |
| `opem`                       | "For real, one of the reasons I use cal.com is because it's open source. Time to migrate."                                                              |
| `lrvick`                     | "I expect in a misguided effort to save customers, they are going to lose a lot more. My two companies will be canceling over this."                    |
| `bit1993`                    | "Called this 9 months ago... most open-source projects will be closed source not only because of the increased work maintainers have to do."            |
| `ryanleesipes` (Thunderbird) | "Our scheduling tool, Thunderbird Appointment, will always be open source... Come talk to us and build with us. We'll help you replace Cal.com"         |
| `gouthamve`                  | "This is a weird knee-jerk reaction. I feel like this is more a business decision than a security decision."                                            |

**Why this matters for a new OSS project's marketing:**

1. The audience for "open-source alternative to X" is now **primed for betrayal**. Licence
   permanence is a live trust axis, not a footnote.
2. `ryanleesipes`' comment is a template: a _competitor_ immediately used the moment to say
   "ours will always be open source." Licence commitment is now a marketing weapon.
3. Note the _symmetry_ critics spotted: if the code is too dangerous to publish for enterprise,
   why is it safe for hobbyists? A two-tier open/closed story invites this attack.

⚠️ **Unverified:** the "100× more hackers" quote and the specific claim of "185 comments and 255
upvotes within hours" came from a search-results summary, not a direct fetch. The direct fetch of
the HN item showed **391 points / 317 comments**.

---

# 1. LANDING PAGE ANATOMY

All fetched **2026-08-11/12**. Section order is top-to-bottom as rendered.

---

## 1.1 Supabase — <https://supabase.com/> ⚠️ PARTIAL (JS-rendered; nav/CTA not recoverable)

| Field            | Verbatim                                                                                                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H1**           | **"Build in a weekend. Scale to millions."**                                                                                                                                                                               |
| **Sub-headline** | "Supabase is an open source Firebase alternative built on Postgres. It provides a complete backend platform for building web and mobile applications, with a suite of integrated tools that work together out of the box." |
| **CTAs**         | ⚠️ NOT RECOVERABLE from fetch                                                                                                                                                                                              |
| **Sections**     | Products (Database, Auth, Storage, Edge Functions, Realtime, Vector) → Data APIs → Key Differentiators (includes open-source status and SOC2) → Links                                                                      |
| **Social proof** | Not recoverable from the fetched body.                                                                                                                                                                                     |

**GitHub repo** (<https://github.com/supabase/supabase>) — **107.8k stars**:

- About: "The Postgres development platform. Supabase gives you a dedicated Postgres database to build your web, mobile, and AI applications."
- README opening: **"Supabase is the Postgres development platform. We're building the features of Firebase using enterprise-grade open source tools."**
- Honesty note in README: **"Supabase is not a 1-to-1 mapping of Firebase."**

**Observation:** Supabase has _migrated away_ from the "open source Firebase alternative" H1 it
launched with (see §6 — the 2020 Show HN title was literally "An open source Firebase alternative").
The phrase now survives only in the sub-headline and README. The H1 is pure outcome copy.

---

## 1.2 Cal.com — <https://cal.com/>

| Field             | Verbatim                                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | Solutions · Enterprise · Cal.ai · Developer · Resources · Pricing · Sign in · **Get started** — _no GitHub star count in nav_                            |
| **H1**            | **"The better way to schedule your meetings"**                                                                                                           |
| **Sub-headline**  | "A fully customizable scheduling software for individuals, businesses taking calls and developers building scheduling platforms where users meet users." |
| **Primary CTA**   | "Sign up with Google"                                                                                                                                    |
| **Secondary CTA** | "Sign up with email"                                                                                                                                     |

**Section order:**

1. Hero
2. "Trusted by fast-growing companies around the world" (logo band — **immediately after hero**)
3. "How it works" (3 steps: connect calendar → set availability → choose meeting type)
4. "With us, appointment scheduling is easy"
5. "Benefits"
6. "Your all-purpose scheduling app"
7. "…and so much more!" (feature grid)
8. Testimonials
9. "Don't just take our word for it"
10. App store / "All your key tools in sync with your meetings"
11. "Wall of love"
12. "See why our users love Cal.com"
13. "Frequently asked questions"
14. "Smarter, simpler scheduling" (final CTA)
15. Footer — logo band **repeats** before footer

**Social proof:** logo band appears **twice** (post-hero and pre-footer). Numeric claim in FAQ:

> "used by over a million people to eliminate booking back-and-forth"

Also "65+ languages", "100+ more" (integrations).

**Open-source statement:** _demoted to footer only_ — "Self-hosted" and "GitHub" links in the footer
Solutions column. Footer legal: "Cal.com® and Cal® are registered trademarks of Cal.com, Inc. All
rights reserved." **The word "open source" no longer appears in the hero.** (Consistent with §0.)

---

## 1.3 Plausible Analytics — <https://plausible.io/>

| Field             | Verbatim                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | Why Plausible · Who it's for · **Compare** · Resources · Pricing · Login · **Start free trial**                                                    |
| **H1**            | **"Easy to use and privacy-friendly Google Analytics alternative"**                                                                                |
| **Sub-headline**  | "Plausible is powerful, lightweight analytics. No cookies, just insights. Made and hosted in the EU, powered by European-owned infrastructure. 🇪🇺" |
| **Primary CTA**   | "Start free trial"                                                                                                                                 |
| **Secondary CTA** | **"View live demo"** → `/plausible.io`                                                                                                             |

**Section order:**

1. Hero (+ primary/secondary CTA, secondary is the **live demo**)
2. "Why use Plausible Analytics?"
3. **"People ❤️ Plausible"** — stats + testimonials
4. "It's time to ditch Google Analytics"
5. "Simple analytics at a glance"
6. "Lightweight script that keeps your site speed fast"
7. "No need for cookie banners or GDPR consent"
8. "Traffic based plans that match your growth"
9. "Ready to ditch Google Analytics?" (final CTA)

**Social proof — verbatim numeric claims, all in "People ❤️ Plausible":**

> "Paying subscribers: 20k"
> "Tracked pageviews: 260B"
> "Uptime (Last 90 days): 99.99%"

Five named testimonials incl. Hugging Face, 37signals, **Ghost**.

**Open-source statements — verbatim:**

> "The code is public and auditable. Verify exactly what we collect, and run it yourself if you want to."
> "Our code is open source too, so you're never locked in." _(founder note)_
> "Your data never leaves European-owned infrastructure."
> "No cookies, no persistent identifiers, no cross-site or cross-device tracking."

**Notable:** Plausible is the only site in the set with **"Compare" as a top-level nav item**, and
the only one with **"View live demo" as the hero secondary CTA**. Both are directly relevant to us.

---

## 1.4 PocketBase — <https://pocketbase.io/>

| Field             | Verbatim                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | FAQ · Documentation · GitHub Repo _(three items — the smallest nav in the set)_                                             |
| **H1**            | **"Open Source backend in 1 file"**                                                                                         |
| **Sub-headline**  | _No prose sub-headline._ Four capability words: "Realtime database" / "Authentication" / "File storage" / "Admin dashboard" |
| **Primary CTA**   | **"Live demo"** → `https://pocketbase.io/_/`                                                                                |
| **Secondary CTA** | "Read the documentation"                                                                                                    |

**Section order:**

1. Hero (with **demo as the primary CTA** — the only site in the set that does this)
2. "Ready to use out of the box"
3. "Realtime database"
4. "Authentication"
5. "File storage"
6. "Extendable"
7. "Explore all features"
8. "Integrate nicely with your favorite frontend stack" (Flutter/Svelte/Vue/React/Angular logos)

**Social proof:** **NONE.** No testimonials, no logos, no star count, no numeric claims. Framework
logos are shown as _compatibility_, not endorsement.

**Footer:** "© 2023-2026 PocketBase The Gopher artwork is from marcusolsson/gophers"

**This is the single most useful template for a zero-social-proof launch in the whole document.**
PocketBase has ~50k stars and shows _none of it_ on the homepage. The proof is the demo.

README (<https://raw.githubusercontent.com/pocketbase/pocketbase/master/README.md>) also carries an
honest limitation up front:

> "PocketBase is still under active development and therefore full backward compatibility is not guaranteed before reaching v1.0.0."

---

## 1.5 Ghost — <https://ghost.org/>

| Field             | Verbatim                                                                                                                                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | For Creators · For Publishers · For Business · For Developers · Explore · Marketplace · Start here · Themes · Help center · Integrations · Product updates · Experts · About us · Pricing · Sign in · **Get Started — free**              |
| **H1**            | **"Turn your audience into a business."**                                                                                                                                                                                                 |
| **Sub-headline**  | "Ghost is a powerful app for professional publishers to create, share, and grow a business around their content. It comes with modern tools to build a website, publish content, send newsletters & offer paid subscriptions to members." |
| **Primary CTA**   | "Try Ghost completely free for 14 days →"                                                                                                                                                                                                 |
| **Secondary CTA** | "Get Started — free"                                                                                                                                                                                                                      |

**Section order:** Easy site design → Advanced creator tools → Rich media & dynamic cards →
Newsletters built-in → Grow your audiences → Run your business → Native analytics → Offers &
promotions → Integrations → **Publishers** → **Creators** → **Businesses** → **"Built to last"** →
"Launch your big idea"

**Social proof — verbatim:**

> "$100,000,000+ Revenue earned each year by publications running on Ghost, with 0% payment fees."
> "Last week, 16,718 brand new publications got started with Ghost."

Named publications with their own metrics: 404 Media (123K members), Tangle ($281K MRR),
Platformer (197K members), The Lever (149K members).

**Open-source / non-profit statement — verbatim, in the "Built to last" section:**

> "Ghost is open source, independent, and funded 100% by its users. No investors. No bullshit."

Footer badges: "Non-Profit Foundation," "Open Source," "Carbon Neutral".

**Notable:** the _"Last week, 16,718 new publications"_ format is a **rolling, self-refreshing
proof number** — it needs no accumulated total and therefore works from a low base. Also note
Ghost's proof is about **their customers' outcomes**, not about Ghost.

---

## 1.6 Appwrite — <https://appwrite.io/>

| Field             | Verbatim                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Nav**           | Products · Docs · Pricing · Enterprise · Customers · Blog · Changelog · **"56.9K"** (GitHub star count element) · Sign up · Go to Console / Start project                                  |
| **H1**            | **"Build faster and scale bigger than ever"**                                                                                                                                              |
| **Sub-headline**  | "Appwrite is an open-source platform for building and scaling applications faster, offering Auth, Databases, Storage, Functions, Messaging, Realtime, and web hosting - all in one place." |
| **Primary CTA**   | "Start project"                                                                                                                                                                            |
| **Secondary CTA** | **"Request a demo"**                                                                                                                                                                       |

**Sections captured (⚠️ partial — heavy JS):**

1. "Optimized for the frameworks, languages and agents you love"
2. **"Trusted by developer teams worldwide"** — The Times of India, IBM, American Airlines, Bosch, Decathlon

**Numeric claim (case study):** "Appwrite helped reduce development time by 60%, and lower server costs by 40%."

**Star count is in the nav as a bare number: "56.9K".**

---

## 1.7 n8n — <https://n8n.io/>

| Field             | Verbatim                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | Product · Use cases · Docs · Community · Enterprise · Pricing · **"200,235"** (GitHub star count, labelled "Top 50 Github") · Sign in · **Get Started**         |
| **H1**            | **"AI agents and workflows you can see and control"**                                                                                                           |
| **Sub-headline**  | "Build visually, go deep with code, connect to anything. Every step of your agents' reasoning, traceable on the canvas. Deploy on your infrastructure or ours." |
| **Primary CTA**   | "Get started for free"                                                                                                                                          |
| **Secondary CTA** | "Talk to sales"                                                                                                                                                 |

**Section order:**

1. Hero
2. **"The world's most popular workflow automation platform for technical teams including"** (logo band, immediately post-hero)
3. "Plug AI into your own data & over 500 integrations"
4. "Build AI agents you can actually follow"
5. "Build complex AI without getting boxed in"
6. "Runs where you decide"
7. "Let people and logic guide AI decisions"
8. "Code when you need it, UI when you don't"
9. "Move fast. Break nothing."
10. "See The Results" → "Case Studies"
11. "Enterprise-ready" → "Reliable. Scalable. Secure." → Security and control / Observability and transparency / Developer experience / AI governance
12. "Simple enough to see. Powerful enough to ship." (final CTA)

**Social proof — verbatim:** "200,235" GitHub stars · "4.7/5 stars on G2" · "200k+ community
members" · case studies: "saved 1,000 hours of manual work", "saved £2.2 Million".

**Licence statement:** "Access the entire source code on Github". n8n is **"fair-code"**, not OSI
open source — and the nav contains a dedicated **"Our license"** item under Docs. The homepage
does _not_ use the words "open source" in the hero.

---

## 1.8 Coolify — <https://coolify.io/>

| Field              | Verbatim                                                                                                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**            | Philosophy · Contributors · Pricing · Services · Docs · Merch · **Sponsor Us** · Changelog · Community (20k+) · To Cloud                                                                       |
| **H1**             | **"Self-hosting with superpowers."**                                                                                                                                                           |
| **Sub-headline**   | "An open-source & self-hostable alternative to Vercel, Heroku, Netlify and Railway for easily deploying websites, databases, web applications and 280+ one-click services to your own server." |
| **Primary CTAs**   | "Cloud" and "Self-hosted" _(a two-path fork, not a single CTA)_                                                                                                                                |
| **Secondary CTAs** | "Screenshots" · "Videos" · **"Building in live-streams"**                                                                                                                                      |

**Section order:** Features → Any Language → Any Server → Any Use-Case → Any Service → Push to
deploy → Free SSL Certificates → No vendor lock-in → Automatic DB Backups → Webhooks → Powerful API
→ Real-time Terminal → Collaborative → Pull Request Deployments → Server Automations → Monitoring →
Notifications

**Social proof — verbatim:** "3,641+ customers in the cloud" · a live "self-hosted instances"
counter · "20k+" community.

**Open-source statement — verbatim:**

> "Open source & free forever, backed by our philosophy."

Note the nav items **"Philosophy"**, **"Contributors"** and **"Sponsor Us"** — three trust/community
items promoted to top-level nav. Almost nobody else does this.

README sponsorship ask (<https://raw.githubusercontent.com/coollabsio/coolify/main/README.md>) — verbatim:

> "To stay completely free and open-source, with no feature behind the paywall and evolve the project, we need your help. If you like Coolify, please consider donating to help us fund the project's future development."

README also: "Imagine having the ease of a cloud but with your own servers. That is **Coolify**." and
"No vendor lock-in, which means that all the configurations for your applications/databases/etc are
saved to your server."

---

## 1.9 Twenty CRM — <https://twenty.com/>

| Field             | Verbatim                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | Product · Resources · Customers · Pricing · **GitHub "54.8K"** · **Discord "7.1K"** · Log in · **Get started**                                    |
| **H1**            | **"Build your Enterprise CRM at AI Speed"**                                                                                                       |
| **Sub-headline**  | "Twenty gives technical teams the building blocks for a custom CRM that meets complex business needs and quickly adapts as the business evolves." |
| **Primary CTA**   | "Get started"                                                                                                                                     |
| **Secondary CTA** | "Talk to us"                                                                                                                                      |

**Section order — note the explicit problem-first structure:**

1. Hero
2. **"The Problem."**
3. "A custom CRM gives your org an edge, but building one comes with tradeoffs" → "The Giant Monolith" / "The In-house Burden"
4. **"Stop settling for trade-offs."**
5. "Assemble, iterate and adapt a robust CRM, that's quick to flex" → Production grade quality / AI for rapid iterations / Control without drag
6. "Begin with production-grade building blocks" → "Continue iteration without friction" → **"Stay in control with our open-source software"**
7. "Skip the clunky UX that always comes with custom." → Familiar, modern interface / Live data and AI built / Fast path to action
8. **"In production."** → "Dev teams power company-wide change with Twenty" (case studies)
9. "They are the real sales" (testimonials)
10. "Any Questions?" (FAQ — contains "Twenty is the #1 Open Source CRM on GitHub")
11. "Stop fighting custom. Start building, with Twenty"

**Numeric claim:** AC&T case study — "cut CRM costs by more than 90%."

**Two star counters in nav (GitHub _and_ Discord).** Open-source claim is a _ranking_ claim
("#1 Open Source CRM on GitHub") buried in the FAQ, not the hero.

README (<https://raw.githubusercontent.com/twentyhq/twenty/main/README.md>) tagline: **"The #1 Open-Source CRM"**.

---

## 1.10 Formbricks — <https://formbricks.com/>

| Field             | Verbatim                                                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | Products · Industries · Templates · Pricing · **Privacy** · **Deploy Formbricks** · Get started free · (banner: "Changelog: Formbricks 5.0 is here. See what's new.") · badges "Privacy-first" and "Open Source" |
| **H1**            | **"The Open Source Experience Data Hub"**                                                                                                                                                                        |
| **Sub-headline**  | "A privacy-first Experience Management suite built on the largest open source survey platform worldwide. Gather feedback on websites, apps and everywhere else to understand what your customers need."          |
| **Primary CTA**   | "Get started free"                                                                                                                                                                                               |
| **Secondary CTA** | **"Deploy Formbricks"** (i.e. self-host as the _secondary_ CTA)                                                                                                                                                  |

**Section order:** "Measure satisfaction continuously" → "Ask anywhere, get insights in one place" →
"Follow individual feedback trails or zoom out for the big picture. All in one place." → On your
website / In emails / In your app → "Digital Product User Journey" → **"Data privacy at heart"** →
**"Open Source Experience Management"** → "Comply with all data privacy regulation with ease.
Self-host if you want." → "Ask at the right moment, get the data you need." → "Don't 'Spray and
pray'. Pre-segment granularly." → "Questions? Let's have a chat!" → "READY? Set Formbricks up in
minutes."

**Trust badges used instead of raw star counts:** G2, TrustPilot, Product Hunt logos.

**README** (<https://raw.githubusercontent.com/formbricks/formbricks/main/README.md>) tagline:
**"The Open Source Qualtrics Alternative"** — note the _README_ uses the alternative-to framing and
the _website H1_ does not. This split is a recurring pattern (see §2.4).
README one-liner: "Gather feedback at every point in the user journey with beautiful in-app,
website, link and email surveys."

---

## 1.11 Documenso — <https://documenso.com/>

| Field             | Verbatim                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| **Nav**           | Solutions (Enterprise, Platform, Self-Hosted) · Resources · Developers · Pricing · Sign In · Sign Up |
| **H1**            | **"Enterprise-Grade E-Signatures. For Everyone."**                                                   |
| **Sub-headline**  | "Fully compliant signatures out of the box. Ready to use or ready to be built upon."                 |
| **Primary CTA**   | "Get Started"                                                                                        |
| **Secondary CTA** | "Check out the Platform Plan"                                                                        |

**Section order:**

1. Hero
2. "Embed Documenso's signing experience to your application with ease."
3. **"Trusted by fast-growing companies around the world."**
4. "What Our Customers Say" (Prisma Inc., Vial Inc.)
5. "Do More With Documenso"
6. "Create, Send, Sign Documents With Ease. Works Like Magic"
7. "Let Documenso power your signatures flows or automate your teams work."
8. "Create & Manage Teams"
9. "Fully compliant signatures in your embeds, links, and emails."
10. "Create Templates and Enable Direct Linking"
11. "Your Favorite Tools Work With Documenso"
12. "Frequently Asked Questions"
13. **"Why use Documenso?"**

**Open-source / transparency statement — verbatim:**

> "Documenso is open source and we share our code, designs and metrics."

**Compliance as trust proof:** 21 CFR Part 11, ESIGN Act, UETA, SOC2, HIPAA.

**README** (<https://raw.githubusercontent.com/documenso/documenso/main/README.md>) tagline:
**"The Open Source DocuSign Alternative."** — again, README uses alternative-to, website H1 does not.

---

## 1.12 Dub — <https://dub.co/>

| Field             | Verbatim                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Nav**           | Product · Solutions · Resources · Customers · Pricing · Enterprise · Startups · Log in · Sign Up — _**no GitHub star count in nav**_ |
| **H1**            | **"Turn clicks into revenue"**                                                                                                       |
| **Sub-headline**  | "Dub is the modern link attribution platform for short links, conversion tracking, and affiliate programs."                          |
| **Primary CTA**   | "Start for free"                                                                                                                     |
| **Secondary CTA** | "Get a demo"                                                                                                                         |

**Section order:** Affiliate Programs → Conversion Analytics → Short Links → "Marketing isn't just
about clicks. It's about outcomes." → Dub Links → "It starts with a link" → QR Code Design → Dub
Analytics → "Measure what matters" → "Connect with your favorite tools" → Dub Partners → "Grow with
partnerships" → "Built to scale" → Dub API → "Enterprise-grade link infrastructure" →
**"Trusted by startups and enterprises"** → "Supercharge your marketing efforts" → **"We ship fast"**

**Customer logos:** Twilio, Raycast, Buffer, Vercel, Framer, Superhuman, Perplexity, Zillow, BeHiiv.
Testimonials from Scicomm Media, Perplexity, Framer, Whop, Vercel, Clerk, Cal.com.

**⚠️ Open-source statement: NONE FOUND on the landing page.** The README
(<https://raw.githubusercontent.com/dubinc/dub/main/README.md>) still says:

> "The open-source link attribution platform."
> "Dub is the modern, open-source link attribution platform for short links, conversion tracking, and affiliate programs."

**This is the most extreme website/README divergence in the set.** Dub launched on HN in 2022 as
_"Show HN: I made an open-source Bitly alternative"_ (255 pts) and has now removed open-source from
its homepage entirely. Trajectory worth noting: **open-source is a launch asset that mature
projects retire from the homepage.**

---

## 1.13 Trigger.dev — <https://trigger.dev/>

| Field             | Verbatim                                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | How it works · Product · Changelog · Blog · Docs · Pricing · Discord icon · **"Star 16.0k"** · Login · Get started                                  |
| **H1**            | **"Build and deploy fully‑managed AI agents and workflows"**                                                                                        |
| **Sub-headline**  | "Trigger.dev is the platform for building AI workflows in TypeScript. Long-running tasks with retries, queues, observability, and elastic scaling." |
| **Primary CTA**   | "Start building now"                                                                                                                                |
| **Secondary CTA** | **"16.0k \| Open source"** — the secondary CTA _is_ the star count                                                                                  |

**Section order:** **"Trusted by developers at companies all over the world"** (immediately post-hero)
→ "How it works" → "Build invincible AI apps" → "Deploy and scale to any size" → "Find and fix bugs
fast" → "Bring your tasks to the foreground" → "True runtime freedom for developers" → "All the
tools you need to ship" → "Reliable by default" → "Works with your existing tech stack…" →
**open-source section** → "Loved by developers" → "Ready to start building?"

**Open-source statement — verbatim, and it is its own full section heading:**

> "We love open source. Trigger.dev is Apache 2.0 licensed so you can view the source code, contribute and self-host."

**Notable:** Trigger.dev names the _specific licence_ (Apache 2.0) in the section heading itself, and
uses the star count as a clickable secondary CTA. Long testimonial roll (30+ companies incl.
Supabase, Resend, Cal.com, Novu, Mintlify, Infisical, Papermark) — heavy OSS-peer cross-endorsement.

---

## 1.14 Infisical — <https://infisical.com/>

| Field             | Verbatim                                                                                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Nav**           | Platform (Secrets Management, Certificate Management, Privileged Access) · Pricing · Docs · Resources (Blog, Videos, Case Studies, **Compare → "Infisical vs Hashicorp Vault"**) · Careers · **GitHub "27k"** · Talk to an expert · **Get started for free** |
| **H1**            | **"Security Infrastructure for Developers and Agents"**                                                                                                                                                                                                      |
| **Sub-headline**  | "All-in-one platform to securely manage application secrets, certificates, and privileged access across cloud, on-prem, and AI infrastructure."                                                                                                              |
| **Primary CTA**   | "Get started for free"                                                                                                                                                                                                                                       |
| **Secondary CTA** | "Request a demo"                                                                                                                                                                                                                                             |

**Section order:** **"Trusted by the best teams in the world"** → **"Everyone has secrets. We secure
10 Billion every day."** → Products → "Meet the all-in-one identity security stack…" → "One source
of truth for every application secret" → "Secure access for AI agents" → "Run your private PKI on
autopilot" → "Just-in-time entry to your most critical systems" → Integrations ("We support your
stack.") → Reliability → "Enterprise ready." → Customer Stories ("Infisical customers are happy
customers.") → Community (**"The only security tool loved by developers."** — Twitter testimonials)
→ "Starting with Infisical is simple, fast, and free."

**Best numeric-proof line in the whole document:**

> "Everyone has secrets. We secure 10 Billion every day."

**⚠️ No explicit open-source licence statement found on the homepage** despite the 27k star nav
badge and an open-source launch history. Same retirement pattern as Dub. Note the **dedicated
comparison page in nav**: "Infisical vs Hashicorp Vault".

---

## 1.15 Directus — <https://directus.com/> (note: `directus.io` 301s to `directus.com`)

| Field             | Verbatim                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Nav**           | AI & MCP · Enterprise · Pricing · Community · Docs · Log In · **Get a Demo**                                  |
| **H1**            | **"The backend for your whole team."**                                                                        |
| **Sub-headline**  | "Connect any database. Get instant APIs, a no-code interface, and a native MCP server for your headless CMS." |
| **Primary CTA**   | "Get Started Free"                                                                                            |
| **Secondary CTA** | "Get a demo"                                                                                                  |

**Section order:** "Your data. Your API. Your entire team's workspace." → "Build websites and apps
from your database" → "Edit content without filing a ticket" → "Govern data access across your team
and agents" → "Connect AI directly to your live data" → "Replace spreadsheets with structured data"
→ "Extend the interface with your own code" → "Teams can work independently. On the same data." →
"AI that acts on your data. Not a copy of it." → "A no-code admin interface with the features your
end-users need." → **"Over 45 million downloads. And counting."** → "Fit your stack. Not the other
way around." → **"Try it yourself or book a demo."**

**Numeric proof:** "Over 45 million downloads. And counting." — note **downloads, not stars**.

**⚠️ No open-source statement found on the landing page.** (Directus is BSL — relicensing history is
itself a cautionary tale; ⚠️ _not verified in this session_.)

**Notable:** final CTA is **"Try it yourself or book a demo."** — an explicit try-vs-talk fork.

---

## 1.16 NocoDB — <https://www.nocodb.com/>

| Field             | Verbatim                                                                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | How it works · Why NocoDB ? · Import Airtable (with "20k+") · APIs · COMMUNITY · Docs · Templates · Pricing · Contact Sales · **Start for Free** · **GitHub stars "62,000+"**                      |
| **H1**            | **"Build Databases As Spreadsheets : No-Coding Required"**                                                                                                                                         |
| **Sub-headline**  | "NocoDB allows building no-code database solutions with ease of spreadsheets. Bring your own database or choose ours! Millions of rows? Not a problem. Your Data. Your rules. You are in control." |
| **Primary CTA**   | "Get Started"                                                                                                                                                                                      |
| **Secondary CTA** | "Contact Sales"                                                                                                                                                                                    |

**Section order:** **"Trusted by 35,000+ Organisations"** (logo band: Accenture, Western Digital,
Hyundai, Walmart, Finn, PwC, Bosch, American Express, Lyrid) → "How It Works ? A Quick Overview" →
"Versatile views for your data" → "Endless Usecases" → "Why NocoDB ?" → **"Fair Source Advantage"**
→ Features Overview → … → "Craft Your Database With Ease" → "Anytime, Anywhere" → "Scale to Millions
of Rows!" → "Easy Schema Visualisation & Control" → "Subscribe to our Newsletter"

**The "Fair Source Advantage" section is a dedicated 4-stat proof block — verbatim:**

> "20+ Million" Docker Downloads · "62,000+" Github Stars · "6,000+" Community Members · "In Top 3" Fair Source No-Code

**Licence statement — verbatim:** "NocoDB is A Community Driven Fair Source Product"

**This is the clearest example of "turn your OSS metrics into a stats section".** Note they mix four
_different_ metric types so no single weak number stands alone.

---

## 1.17 Outline — <https://www.getoutline.com/>

| Field             | Verbatim                                                                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | Download · Guide · Integrations · Developers · Changelog · Pricing · Contact Us · GitHub · Twitter · Log in · Sign up                                                       |
| **H1**            | **"Your team's knowledge base"**                                                                                                                                            |
| **Sub-headline**  | "Lost in a mess of Docs? Never quite sure who has access? Colleagues requesting the same information repeatedly in chat? It's time to get your team's knowledge organized." |
| **Primary CTA**   | "Get started for free →"                                                                                                                                                    |
| **Secondary CTA** | **"Deploy on-premises"**                                                                                                                                                    |

**Section order:** "Why you'll love using Outline" → Blazing fast → Collaborative → Dark mode →
Security & permissions → 20+ Integrations → In your language → **"Built in public"** →
**"Open source"** → Customizable

**Open-source statement — verbatim:**

> "Outline's source code is public, and development is completed in the open."

**Notable:** the sub-headline is a **three-question problem statement** — the only pure problem-led
sub-head in the set. Also: **"Built in public"** is its own feature card alongside product features,
i.e. transparency framed as a _feature_. Almost no numeric social proof ("20+ Integrations",
"20 languages" only). A good model for low-proof positioning.

---

## 1.18 Penpot — <https://penpot.app/>

| Field             | Verbatim                                                                                                                                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | Product · Self-Host · AI Workflows · Features · Release notes · Integration & API · Business Cases · Community (Community Space, Ambassador Program, **Wall of love**, Penpot Fest) · Blog · Resources · Pricing · Contact Sales · Log In · Sign up |
| **H1**            | **"Think and build digital products. Together."**                                                                                                                                                                                                   |
| **Sub-headline**  | "Penpot is the open-source design platform for teams that need scalable collaboration."                                                                                                                                                             |
| **Primary CTA**   | **"Sign up, it's free"**                                                                                                                                                                                                                            |
| **Secondary CTA** | **"Self-host install"**                                                                                                                                                                                                                             |

**Section order (⚠️ partial):** "Full-stack design for every future." → UI Design → Design Systems →
AI Workflows → Code → **"POWERING DESIGN AT"** (logo band)

**Footer:** "Made with LOVE and Open Source"

**Notable:** the CTA pair **"Sign up, it's free" / "Self-host install"** is the cleanest expression of
the _hosted-vs-self-host fork_ in the set. Community nav includes **"Wall of love"** and an
**"Ambassador Program"**.

---

## 1.19 Rallly — <https://rallly.co/>

| Field                           | Verbatim                                                      |
| ------------------------------- | ------------------------------------------------------------- |
| **Nav**                         | How it Works · Pricing · Blog · Support · Login · Sign Up     |
| **H1**                          | **"Find the best time to meet"**                              |
| **Sub-headline**                | "Coordinate group meetings without the back-and-forth emails" |
| **Primary CTA**                 | **"Create a Meeting Poll"**                                   |
| **Secondary CTA / CTA subtext** | **"It's free! No login required."**                           |

**Section order:** Hero → "Create a page like this in seconds!" → stats block → testimonials →
press mentions

**Social proof — verbatim:** "199K+ registered users" · "300K+ polls created" · "10+ languages
supported" · a 5-star Trustpilot review from _Eric Fletcher, Executive Assistant at MIT_ · press
logos: PCMag, HubSpot, Goodfirms, PopSci.

**Funding ask — verbatim:**

> "This project is user-funded. Please consider supporting it by donating."

README (<https://raw.githubusercontent.com/lukevella/rallly/main/README.md>):

- Tagline: "Schedule group meetings, without the back-and-forth"
- Licence: **"Rallly is open-source under the GNU Affero General Public License Version 3 (AGPLv3) or any later version."**
- Ask: "Become a sponsor →" plus a "Donate with Paypal" badge

**Most relevant single detail for us:** the primary CTA is a **verb that starts the product**
("Create a Meeting Poll"), and the CTA microcopy kills the biggest objection instantly:
**"It's free! No login required."** Press logos substitute for customer logos.

---

## 1.20 Budibase — <https://budibase.com/>

| Field             | Verbatim                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | Agents _(Beta)_ · Apps · Automations · API explorer · Connectors · Data tables · Use Cases · Enterprise · Security · IT Teams · Docs · Customers · Blog · Changelog · Pricing |
| **H1**            | **"Save weeks building agents, apps, and automations"**                                                                                                                       |
| **Sub-headline**  | "Automate workflows, handle requests, build internal tools, and connect your business systems - with your own data, LLMs, and APIs."                                          |
| **Primary CTA**   | "Try it free"                                                                                                                                                                 |
| **Secondary CTA** | "Contact sales"                                                                                                                                                               |

**Section order:** Agents / Apps / Tables / Automations → "Operations your team can run with AI
agents" → Employee requests / Approval workflows / Support triage → "Agents that take action" →
"Scale with Confidence" → **"Open-source and self-hosting"** → "Enterprise-grade security" → "Built
to scale" → "Ready to see Budibase in action?" → "Connect the tools your business runs on" →
**"Trusted for real-world operations"** → **"Open source"** → "Sign up today."

**Numeric proof — verbatim:** "Join 300K teams from SMEs to Govs"

**Open-source statement — verbatim:**

> "Budibase is open source, allowing you to transform operations within the security of your own infrastructure."

Note the framing: open source is justified **as a security/control benefit**, not as an ideology.

---

## 1.21 Novu — <https://novu.co/>

| Field            | Verbatim                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Nav**          | ⚠️ not recoverable                                                                                                      |
| **H1**           | **"Connect your AI agents and products to customers"**                                                                  |
| **Sub-headline** | "Open-source infrastructure to notify your users and let your agents talk with them, on the channels they already use." |
| **Primary CTA**  | **`npx novu connect`** — the primary CTA is a **copyable command**, not a button                                        |

**Section order:** "Integrate a world-class conversation experience today" → "Opinionated about
communication. Unopinionated about intelligence." → "One platform. Two ways to communicate." → "The
Agent Communication Infrastructure" → "Novu Notify overview" → "How engineering teams ship faster
with Novu" → "Built for enterprise environments" → FAQ → "One engine underneath"

**Numeric proof, at the very top of the page — verbatim:**

> "1.5b messages just sent out in the last month"

Again a **rolling window** ("in the last month"), not a lifetime total.

**Open-source statement — verbatim:**

> "Novu Connect is built in the open: inspect the code, contribute integrations, or adapt it for your team's workflow."

README tagline: "The open-source communication infrastructure for agents and products".

---

## 1.22 Typebot — <https://typebot.com/> (`typebot.io` 308s to `typebot.com`)

| Field             | Verbatim                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**           | Blog · Community · Pricing · Documentation · GitHub · **Get started free** — _no star count_                                                            |
| **H1**            | **"Hack the bot game: Build faster, Chat smarter"**                                                                                                     |
| **Sub-headline**  | "Typebot is a no-code platform that enables you to effortlessly create and integrate advanced chatbots into websites and chat platforms like WhatsApp." |
| **Primary CTA**   | "Start building"                                                                                                                                        |
| **Secondary CTA** | "Get started free"                                                                                                                                      |

**Section order:** Marketing / Support & Product / Sales → **"Trusted by 650+ companies worldwide"**
→ "From block to bot: create your custom chat experience" → "One fits all: deploy your bot
seamlessly within your ecosystem" → "More than just a bot: analyze your performance and grow" →
"Designed for every department" → "Built for everyone, made for developers" → "Together, we're
hacking the future of conversational AI apps" → "We strive to create great things" → "All the
features you need to hack bots building" → "Get started with Typebot" → **"Oh my Bot!"**
(testimonials) → "Ready to dive into the latest tools and hack your business growth?" → FAQ

**Numeric proof — verbatim:** "2x increase on our conversation rate" · "conversion rate increase from
14% to 43%" · "2M+ monthly chats" · "1.5M+ bots published" · "3,000+ members on Discord" ·
"Trusted by 650+ companies worldwide"

**Website says:** "100% open source. No vendor-locking"
**README says (⚠️ CONTRADICTION):** tagline is **"Fair Source chatbot builder"**, and the licence is
the **Functional Source License** — i.e. _not_ OSI open source.
(<https://raw.githubusercontent.com/baptisteArno/typebot.io/main/README.md>)

⚠️ **Flag:** the homepage claim "100% open source" and the README's "Fair Source"/FSL licence appear
to conflict. Worth verifying before using Typebot as a positive model on licence honesty. This is
exactly the credibility trap a new project should avoid.

---

## 1.23 Mattermost — <https://mattermost.com/>

| Field             | Verbatim                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Nav**           | Platform · Solutions · Pricing · Partners · Resources · Login · Try Mattermost · Contact Sales                                                                                             |
| **H1**            | **"Operational Sovereignty for National Security and Critical Infrastructure"**                                                                                                            |
| **Sub-headline**  | "Collaboration, automation and AI for air-gapped, on-prem and private cloud environments. Trusted by governments, enterprises and allied militaries. Deploy anywhere. Control everything." |
| **Primary CTA**   | "Talk to an Expert"                                                                                                                                                                        |
| **Secondary CTA** | "Talk to a specialist in your region:"                                                                                                                                                     |

**Section order:** "Control in a Connected World" → "Talk to a specialist in your region" →
**"Deployed by the world's leading organizations"** (US Air Force, NASA, RTE, Samsung) → "Built for
real-world mission success" → "Proven in Mission-Critical Environments" → "Purpose-built for
critical infrastructure use cases" → "The Intelligent Mission Environment" → "Deploy anywhere.
Control everything" → "Designed for teams with stringent security & privacy requirements" → "Take
command of your operations"

**⚠️ No open-source statement found on the homepage at all.** Mattermost has completed the full
journey from "open-source Slack alternative" to an enterprise/defence positioning with **zero
self-serve CTA** — both CTAs are "talk to a human". Included here as the **end state** of the
trajectory, and as a warning about what happens to the OSS story at enterprise scale.

---

## 1.24 Papermark — <https://www.papermark.com/> ⚠️ PARTIAL (`papermark.io` 301s to `papermark.com`; fetch returned an index-style body, likely an LLM/agent-oriented page)

| Field             | Verbatim                                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H1**            | "Papermark"                                                                                                                                           |
| **Sub-headline**  | "Papermark is a secure virtual data room (VDR) and document sharing platform for M&A, fundraising, due diligence, and confidential document sharing." |
| **Primary CTA**   | "Start for free"                                                                                                                                      |
| **Secondary CTA** | "Start a data room — free 7-day trial"                                                                                                                |
| **Sections**      | Key facts · Who it's for · Key pages · Features · Use cases · Customers · **Compare** · Developer (API, CLI, MCP) · **For AI agents** · Resources     |

**Numeric proof — verbatim:** "Rated 4.9/5 across 171 reviews (G2, Product Hunt, Reddit)"

**Trust + open-source combined into one sentence — verbatim:**

> "Papermark is certified (SOC 2 Type II, ISO 27001, GDPR), open source, and self-hostable"

README (<https://raw.githubusercontent.com/mfts/papermark/main/README.md>): **"The open-source
DocSend alternative."**

⚠️ **The "For AI agents" section is novel** — Papermark appears to publish an LLM-readable index of
the site. Worth investigating separately (llms.txt pattern).

---

## 1.25 THE SHARED PATTERN (observed, not prescribed)

Counting across the 24 sites above:

**Section order — the modal skeleton (appears in some form in 18+ of 24):**

```
1. NAV                    (product | docs/resources | pricing | [star count] | login | primary CTA)
2. HERO                   (H1 + sub-head + 2 CTAs, often a product screenshot/animation)
3. SOCIAL PROOF BAND      ← immediately after hero in 9 of 24 (Cal.com, n8n, Trigger.dev,
                             Infisical, NocoDB, Appwrite, Documenso, Typebot, Dub)
4. HOW IT WORKS / 3 STEPS (Cal.com, NocoDB, Trigger.dev)
5. FEATURE BLOCKS         (3-8 alternating image/text sections)
6. DIFFERENTIATOR SECTION (privacy / self-host / open source / control)
7. INTEGRATIONS           ("works with your stack")
8. ENTERPRISE / SECURITY  (only for projects with a sales motion)
9. TESTIMONIALS / WALL OF LOVE
10. FAQ
11. FINAL CTA             (usually restating the hero promise as a question or imperative)
12. FOOTER                (licence, GitHub, status, security)
```

**Consistent observations:**

- **The social-proof band sits directly under the hero** more often than anywhere else. It is the
  #1 slot. A project with no logos has a structural hole exactly there — see §5.
- **The final CTA restates the hero.** Plausible: hero "…Google Analytics alternative" → final
  "Ready to ditch Google Analytics?". Twenty: hero "Build your Enterprise CRM…" → final "Stop
  fighting custom. Start building, with Twenty". Dub: "Turn clicks into revenue" → "Supercharge
  your marketing efforts".
- **Two CTAs, always, and they encode the _audience fork_, not urgency levels.** The forks seen:
  hosted vs self-host (Penpot, Formbricks, Outline, Coolify), try vs talk-to-sales (Dub, Directus,
  n8n, Twenty, Budibase, NocoDB), try vs see-the-demo (Plausible, PocketBase, Appwrite).
- **Star count in nav: 6 of 24 confirmed** — Appwrite ("56.9K"), n8n ("200,235"), Twenty ("54.8K" +
  Discord "7.1K"), Trigger.dev ("Star 16.0k"), Infisical ("27k"), NocoDB ("62,000+").
  **Notably absent from nav:** Cal.com, Dub, Documenso, Plausible, Ghost, Typebot, PocketBase,
  Penpot, Rallly, Outline, Mattermost, Directus, Budibase.
- **Nobody's H1 is a feature.** Every H1 is an outcome, an identity, or a category claim.
- **"Open source" in the H1: only 3 of 24** — PocketBase ("Open Source backend in 1 file"),
  Formbricks ("The Open Source Experience Data Hub"), and Coolify's sub-headline. Everyone else
  demotes it to sub-headline, a mid-page section, or the footer.
- **The README and the website disagree, deliberately.** Documenso, Formbricks, Papermark, Dub and
  Twenty all use "the open-source X alternative" in the **README** and a non-alternative,
  outcome-led H1 on the **website**. The README speaks to developers/GitHub; the website speaks to
  buyers. **This is the most actionable structural finding in §1.**

---

# 2. HERO COPY PATTERNS — 25 verbatim headlines

## 2.1 The corpus (all verbatim, all fetched 2026-08-11/12)

| #   | Project     | H1 (verbatim)                                                                    | Source         |
| --- | ----------- | -------------------------------------------------------------------------------- | -------------- |
| 1   | Supabase    | "Build in a weekend. Scale to millions."                                         | supabase.com   |
| 2   | Cal.com     | "The better way to schedule your meetings"                                       | cal.com        |
| 3   | Plausible   | "Easy to use and privacy-friendly Google Analytics alternative"                  | plausible.io   |
| 4   | PocketBase  | "Open Source backend in 1 file"                                                  | pocketbase.io  |
| 5   | Ghost       | "Turn your audience into a business."                                            | ghost.org      |
| 6   | Appwrite    | "Build faster and scale bigger than ever"                                        | appwrite.io    |
| 7   | n8n         | "AI agents and workflows you can see and control"                                | n8n.io         |
| 8   | Coolify     | "Self-hosting with superpowers."                                                 | coolify.io     |
| 9   | Twenty      | "Build your Enterprise CRM at AI Speed"                                          | twenty.com     |
| 10  | Formbricks  | "The Open Source Experience Data Hub"                                            | formbricks.com |
| 11  | Documenso   | "Enterprise-Grade E-Signatures. For Everyone."                                   | documenso.com  |
| 12  | Dub         | "Turn clicks into revenue"                                                       | dub.co         |
| 13  | Trigger.dev | "Build and deploy fully‑managed AI agents and workflows"                         | trigger.dev    |
| 14  | Infisical   | "Security Infrastructure for Developers and Agents"                              | infisical.com  |
| 15  | Directus    | "The backend for your whole team."                                               | directus.com   |
| 16  | NocoDB      | "Build Databases As Spreadsheets : No-Coding Required"                           | nocodb.com     |
| 17  | Outline     | "Your team's knowledge base"                                                     | getoutline.com |
| 18  | Penpot      | "Think and build digital products. Together."                                    | penpot.app     |
| 19  | Rallly      | "Find the best time to meet"                                                     | rallly.co      |
| 20  | Budibase    | "Save weeks building agents, apps, and automations"                              | budibase.com   |
| 21  | Novu        | "Connect your AI agents and products to customers"                               | novu.co        |
| 22  | Typebot     | "Hack the bot game: Build faster, Chat smarter"                                  | typebot.com    |
| 23  | Mattermost  | "Operational Sovereignty for National Security and Critical Infrastructure"      | mattermost.com |
| 24  | Papermark   | ⚠️ "Papermark" (page returned an index; real H1 not captured)                    | papermark.com  |
| 25  | Excalidraw  | ⚠️ No marketing H1 — the app IS the homepage. Title tag: "Excalidraw Whiteboard" | excalidraw.com |

**Plus README/repo taglines (the "developer-facing" headline for the same products):**

| Project    | README tagline (verbatim)                                                                                                                                                  | Source                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Documenso  | **"The Open Source DocuSign Alternative."**                                                                                                                                | raw.githubusercontent.com/documenso/documenso     |
| Papermark  | **"The open-source DocSend alternative."**                                                                                                                                 | raw.githubusercontent.com/mfts/papermark          |
| Formbricks | **"The Open Source Qualtrics Alternative"**                                                                                                                                | raw.githubusercontent.com/formbricks/formbricks   |
| Coolify    | **"An open-source & self-hostable Heroku / Netlify / Vercel alternative."**                                                                                                | raw.githubusercontent.com/coollabsio/coolify      |
| Dub        | **"The open-source link attribution platform."**                                                                                                                           | raw.githubusercontent.com/dubinc/dub              |
| Twenty     | **"The #1 Open-Source CRM"**                                                                                                                                               | raw.githubusercontent.com/twentyhq/twenty         |
| Novu       | "The open-source communication infrastructure for agents and products"                                                                                                     | raw.githubusercontent.com/novuhq/novu             |
| PocketBase | "open source backend in 1 file"                                                                                                                                            | raw.githubusercontent.com/pocketbase/pocketbase   |
| Rallly     | "Schedule group meetings, without the back-and-forth"                                                                                                                      | raw.githubusercontent.com/lukevella/rallly        |
| Excalidraw | "An open source virtual hand-drawn style whiteboard. Collaborative and end-to-end encrypted."                                                                              | github.com/excalidraw/excalidraw                  |
| Umami      | "Umami is a privacy-first analytics platform. Traffic, campaigns, behavior, conversions, and revenue in one place — no cookies, no tracking, self-hosted or in the cloud." | raw.githubusercontent.com/umami-software/umami    |
| Typebot    | ⚠️ "Fair Source chatbot builder"                                                                                                                                           | raw.githubusercontent.com/baptisteArno/typebot.io |
| Supabase   | "We're building the features of Firebase using enterprise-grade open source tools."                                                                                        | github.com/supabase/supabase                      |
| Cal.diy    | "The community-driven, open-source scheduling platform."                                                                                                                   | github.com/calcom/cal.diy                         |

That is **39 verbatim headlines** in total.

## 2.2 The formulas, categorised

**A. OUTCOME-LED / TRANSFORMATION (the dominant website form — 11 of 24)**
Verb + the user's desired end state. No product category, no competitor.

- "Turn clicks into revenue" (Dub)
- "Turn your audience into a business." (Ghost)
- "Build in a weekend. Scale to millions." (Supabase)
- "Save weeks building agents, apps, and automations" (Budibase)
- "Build faster and scale bigger than ever" (Appwrite)
- "Find the best time to meet" (Rallly)
- "Build your Enterprise CRM at AI Speed" (Twenty)
- "Build and deploy fully-managed AI agents and workflows" (Trigger.dev)
- "Connect your AI agents and products to customers" (Novu)
- "Think and build digital products. Together." (Penpot)
- "Build Databases As Spreadsheets : No-Coding Required" (NocoDB)

_Sub-pattern:_ **two-clause contrast** — Supabase's "Build in a weekend. Scale to millions." sets a
low effort against a high ceiling in six words. Typebot copies the shape ("Build faster, Chat
smarter"). This is the most imitated single line in OSS marketing.

**B. CATEGORY CLAIM / "THE <definite article> <category>" (6 of 24)**
Asserts the product _is_ the category. Confident; works only if the category is legible.

- "The better way to schedule your meetings" (Cal.com)
- "The backend for your whole team." (Directus)
- "Your team's knowledge base" (Outline)
- "The Open Source Experience Data Hub" (Formbricks)
- "Security Infrastructure for Developers and Agents" (Infisical)
- "The #1 Open-Source CRM" (Twenty, README)

**C. "OPEN-SOURCE ALTERNATIVE TO <BIG COMPANY>" (see §2.3 — dominant in READMEs, near-extinct in H1s)**

**D. CONSTRAINT-AS-HOOK / TECHNICAL BRAG (2)**
A surprising limitation stated as the benefit.

- **"Open Source backend in 1 file"** (PocketBase) — _"in 1 file"_ is doing all the work
- "Self-hosting with superpowers." (Coolify)

**E. PROBLEM-LED (rare in H1s, common in sub-heads)**
Only Twenty commits a whole _section_ to it ("The Problem."). The purest problem-led sub-headline is
Outline's:

> "Lost in a mess of Docs? Never quite sure who has access? Colleagues requesting the same information repeatedly in chat? It's time to get your team's knowledge organized."

**F. VALUES / SOVEREIGNTY-LED (2)**

- "AI agents and workflows you can see and control" (n8n) — _control_ as the promise
- "Operational Sovereignty for National Security and Critical Infrastructure" (Mattermost)

**G. AUDIENCE-EXPANSION ("X. For Everyone.") (1)**

- "Enterprise-Grade E-Signatures. For Everyone." (Documenso) — takes an enterprise-coded
  category and democratises it in four words. Highly relevant framing for a portfolio builder
  ("professional portfolios, for everyone").

**H. "X FOR Y"** — ⚠️ **Notably absent from all 24 homepage H1s.** It survives only in READMEs and
Show HN titles. Treat "X for Y" as a _launch-title_ formula, not a _homepage_ formula.

## 2.3 The "open-source alternative to <big company>" positioning — where it actually lives

**Finding: it has almost entirely migrated out of homepage H1s and into READMEs, HN titles and
sub-headlines.**

| Placement                  | Count                     | Examples                                                                                                                                         |
| -------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Homepage H1**            | **1 of 24**               | Plausible: "Easy to use and privacy-friendly **Google Analytics alternative**"                                                                   |
| **Homepage sub-headline**  | 3                         | Supabase ("open source Firebase alternative"), Coolify ("alternative to Vercel, Heroku, Netlify and Railway"), Appwrite ("open-source platform") |
| **README tagline**         | **7+**                    | Documenso (DocuSign), Papermark (DocSend), Formbricks (Qualtrics), Coolify (Heroku/Netlify/Vercel), Dub, Twenty, Supabase                        |
| **HN launch title**        | **overwhelming majority** | see §6                                                                                                                                           |
| **Removed entirely later** | 3                         | Dub (no OSS mention on site at all), Infisical (no licence statement found), Mattermost, Cal.com (post-Apr-2026)                                 |

**The lifecycle, as evidenced:**

1. **Launch:** "Show HN: I made an open-source Bitly alternative" (Dub, 2022, 255 pts)
2. **Growth:** README keeps it; homepage sub-headline keeps it
3. **Maturity:** homepage H1 becomes outcome-led ("Turn clicks into revenue"); OSS mention retreats
   to a mid-page section or footer
4. **Enterprise:** removed (Dub, Mattermost, Infisical, Cal.com)

**Plausible is the exception that proves the rule** — they never left, because the _competitor's
name is the category_ and the objection (privacy) is against the competitor specifically. Their
final CTA is literally "Ready to ditch Google Analytics?" and "Compare" is a nav item.

**Why this matters for a new project with zero stars:** the alternative-to framing is _maximally
valuable at launch_ (it borrows the incumbent's search demand and gives HN/Reddit an instant
mental model) and _decreasingly valuable thereafter_. The evidence says: use it in the README, the
HN title, the meta description and the comparison pages — and decide separately whether the
homepage H1 should carry it.

## 2.4 Sub-headline formula (observed)

The modal sub-headline is one sentence doing exactly three jobs:
`<Product> is <category>` + `<key capability list>` + `<the differentiator>`.

- Supabase: "Supabase is **an open source Firebase alternative built on Postgres**. It provides **a complete backend platform**…"
- Appwrite: "Appwrite is **an open-source platform** for building and scaling applications faster, offering **Auth, Databases, Storage, Functions, Messaging, Realtime, and web hosting** - **all in one place**."
- Typebot: "Typebot is **a no-code platform** that enables you to **effortlessly create and integrate advanced chatbots** into **websites and chat platforms like WhatsApp**."
- Coolify: "**An open-source & self-hostable alternative to Vercel, Heroku, Netlify and Railway** for **easily deploying websites, databases, web applications and 280+ one-click services** to **your own server**."
- Novu: "**Open-source infrastructure** to **notify your users and let your agents talk with them**, on **the channels they already use**."

**The sub-headline is where "open source" earns its keep** when the H1 is outcome-led. 12 of 24
sub-headlines contain "open-source", "self-host" or "your own server/infrastructure".

## 2.5 CTA wording — the actual strings

**Primary CTAs seen:** "Get started" / "Get started for free" / "Start for free" / "Start free
trial" / "Start building" / "Start building now" / "Start project" / "Try it free" / "Sign up, it's
free" / "Get Started — free" / "Create a Meeting Poll" / **"Live demo"** (PocketBase) /
`npx novu connect` (Novu).

**Secondary CTAs seen:** "Talk to sales" / "Contact Sales" / "Talk to us" / "Talk to an Expert" /
"Get a demo" / "Request a demo" / **"View live demo"** (Plausible) / **"Self-host install"** (Penpot)
/ **"Deploy Formbricks"** (Formbricks) / **"Deploy on-premises"** (Outline) / **"Self-hosted"**
(Coolify) / "Read the documentation" (PocketBase) / **"16.0k | Open source"** (Trigger.dev).

**Free-ness in the button, not below it:** "Start for free", "Get started for free", "Sign up, it's
free", "Get Started — free", "Try it free". Rallly goes furthest and puts the whole objection-killer
in the CTA area: **"It's free! No login required."**

**The demo-as-CTA cluster (directly relevant to us):**

- PocketBase — **"Live demo" is the PRIMARY CTA**
- Plausible — **"View live demo" is the SECONDARY CTA**
- Directus — final CTA is **"Try it yourself or book a demo."**
- Coolify — secondary CTAs are "Screenshots" / "Videos" / "Building in live-streams"

---

# 3. COMPARISON PAGES ("vs <competitor>")

**Confidence key:** `[RAW]` = raw HTML/markdown pulled and read directly; quotes verbatim, high
confidence. `[WF]` = extracted via the summarising fetch layer; structure reliable, treat quotes as
near-verbatim and re-verify before publishing.

## 3.1 Plausible vs Google Analytics 4 `[RAW]`

**URL:** <https://plausible.io/vs-google-analytics>

**H1:** "Plausible vs Google Analytics 4 (GA4): What changed and why people are switching"

**Date stamp:** JSON-LD only — `"dateModified":"2026-08-07T07:42:30+00:00"`. **No visible date on page.**

**Section order (verbatim):**

1. What GA4 changed and why it matters
2. GA4 replaced real data with estimated data
3. GA4 became significantly harder to use
4. GA4 made accuracy worse, not better
5. GA4 created legal exposure
6. GA4 is built for Google's business, not yours
7. Faster and lighter
8. **What GA4 does better**
9. Why isn't Plausible free while GA4 is free?
10. **Is Plausible right for you?**
11. Ready to switch?

**Structural note:** the **table comes first**, directly under the intro and _above_ all prose, then
two customer quotes (DHH of 37signals, John O'Nolan of Ghost) and CTAs — _then_ the argument.

**TABLE — columns: `(blank) | Plausible | Google Analytics 4`**

| Row label                      | Plausible      | Google Analytics 4                  |
| ------------------------------ | -------------- | ----------------------------------- |
| Cookie consent banner required | No             | Yes                                 |
| Personal data collected        | No             | Yes                                 |
| Script blocked by ad blockers  | Rarely         | Often                               |
| Data modeled or estimated      | No             | Yes (consent mode)                  |
| Data retention                 | From 3 years   | 14 months on free plan              |
| Setup complexity               | One script tag | Tag Manager, events, custom reports |
| Hosted in the EU               | Yes            | No                                  |
| Open source                    | Yes            | No                                  |

8 rows, all favouring Plausible — but note the **honest hedges inside the cells**: "Rarely" not
"No"; "From 3 years" not "Unlimited".

**The concessions — an entire H2 titled "What GA4 does better":**

> "If you need deep custom attribution modeling or enterprise-scale reporting with SQL access, GA4, especially with BigQuery, has more depth. If your business runs heavily on Google Ads, the tight integration between GA4 and Google's ad products is hard to replicate elsewhere."

> "For most site owners who want to understand where their traffic is coming from and what's working, that depth comes with overhead that is rarely justified."

Second concession H2, "Is Plausible right for you?":

> "Plausible is not the right fit for every use case. If you need session replay, user-level product analytics, retargeting or free hosted analytics, read this before you decide."

**Pre-empting the price objection ("Why isn't Plausible free while GA4 is free?"):**

> "GA4 is free because Google's business runs on data. Collecting analytics from millions of websites is part of how they build the behavioral profiles that power their ad network."
> "Plausible doesn't use that model. We charge a subscription to cover costs and keep the product independent."

**Legal / fairness hedging: none.** No "we may be biased", no trademark disclaimer, no "as of
<date>". Credibility is **outsourced to third parties** instead:

> "An independent study found that GA4 fails to capture an average of 55.6% of traffic compared to cookieless analytics."
> "An independent legal assessment comparing Plausible and Google Analytics written by a data protection lawyer is available if you want the detail."

Claims are specific and falsifiable rather than hedged: "The Google Analytics tracking script is
135KB gzipped. Plausible's is 2.5KB, which is 54 times smaller." / "We exclude around 32,000 data
center IP ranges".

**Pricing:** not tabled. Reframed instead:

> "'Free' is also relative. GA4 comes with hidden costs: time spent learning a complex interface, consent management platforms, legal exposure in GDPR-regulated markets and developer time maintaining a compliant setup. When you factor those in, Plausible often costs less in practice."

**CTA:** "Ready to switch from Google Analytics? / Start your free trial today" — buttons "Start free
trial" / "View live demo", preceded by risk reversal: _"Install it alongside Google Analytics, check
both dashboards side by side and switch when you're ready."_

---

## 3.2 ⭐ Plausible — "When Plausible is not the right fit" `[RAW]`

**URL:** <https://plausible.io/when-not-to-use-plausible>

**The single most striking artefact in this entire research file.** A dedicated, indexed,
footer-linked page (footer label: **"Right for you?"**) whose whole purpose is to talk you out of
buying.

**H1:** "When Plausible is not the right fit"

**Section order (verbatim):**

1. Plausible is not a session replay or heatmap tool
2. Plausible is not for tracking individual users
3. Plausible is not a full product analytics platform
4. Plausible is not an ad-tech or retargeting platform
5. Plausible is not the best fit if you need free hosted analytics forever
6. Plausible should not be used to collect sensitive personal data
7. Why we keep Plausible focused
8. Is Plausible right for you?

**No table.** Two-column "good fit / not a good fit" bullet lists at the end.

**Verbatim self-criticism — they recommend competitors by name:**

> "If you need to watch how a specific visitor navigates your site or diagnose UX problems through visual replay, Plausible is not built for that. Tools like Hotjar, Microsoft Clarity or FullStory are designed for those workflows."

> "If you need cohort analysis, feature flag measurement, retention curves, experimentation, user-level behavior analysis inside your app, or session replay tied to specific user accounts, you need a product analytics tool. Mixpanel, Amplitude and PostHog are built for those workflows. Plausible is not."

> "One practical consequence: Plausible has no new-vs-returning visitor segment. ... If new-vs-returning is central to how you read your traffic, Plausible will not give it to you."

> "Plausible is not HIPAA-compliant and does not offer a Business Associate Agreement (BAA)."

> "Plausible can tell you that your pricing page drove 400 trial signups last month. It cannot tell you how many of those trial accounts activated a specific feature within seven days."

**The framing device that makes the page work — limitation reframed as principle:**

> "Every use case listed above represents a real request we have received. We have said no to all of them."

> "Saying no is how Plausible stays simple. ... Adding session replay, user profiling, ad-tech integrations or free-tier hosted infrastructure would make Plausible something else. Something more like the tools people come to Plausible to get away from."

> "Individual surveillance of your visitors is not something we are willing to build, regardless of what competing tools offer."

> "This boundary is also what makes Plausible compliant with GDPR, CCPA and similar laws without a consent banner. It is not a limitation to work around. It is the design."

**"Plausible is likely NOT a good fit if you:"** (verbatim list) — Need session replay, heatmaps or
individual visitor recordings · Need user-level product analytics, cohorts or retention analysis
inside your app · Need to see new vs. returning visitor segments · Need retargeting, audience
syncing or cross-site ad measurement · Need a free hosted analytics service with no subscription ·
Need to process protected health information or require a BAA

**CTA:** "Think Plausible is the right fit? / Start your free trial today" — note the **conditional
framing**. The page also links outward to a competitor-neutral asset: _"our buyer's guide to
privacy-friendly analytics covers the criteria that separate tools that are genuinely privacy-first
from those that only claim to be."_

---

## 3.3 Plausible vs Matomo `[WF]`

**URL:** <https://plausible.io/vs-matomo> · **H1:** "Plausible vs Matomo: A simple, privacy-first alternative"

**Section order:** What Plausible and Matomo have in common → Simple web analytics vs complex web
analytics → Matomo is more like a full blown Google Analytics alternative → Plausible is built with
simplicity and ease of use in mind → A lightweight analytics script that is optimized for speed →
No cookies, no consent banner required → Which tool is right for you? → Bringing your historical
data with you → Sign up for a free Plausible trial

**No table.** Notable: **the opening section is what they have in common**, not what divides them.

**Concession:**

> "If you need heatmaps, session recordings and deep customization and are willing to invest in setup and ongoing maintenance, Matomo is built for that."

---

## 3.4 ⭐ PostHog vs Amplitude `[RAW — markdown source, obtained by appending `.md` to the URL]`

**URL:** <https://posthog.com/blog/posthog-vs-amplitude>

**H1 (rendered):** "In-depth: PostHog vs Amplitude" · **H1 (markdown source):** "PostHog vs
Amplitude in-depth tool comparison"

**Date stamp:** "Jan 27, 2026", under **two named human bylines** (Andy Vandervell, Natalia Amorim),
each linking to a profile page. Categorised `[Comparisons]`.

**Opening lines — an even-handed frame before any claim:**

> "Choosing the right analytics platform often comes down to trade-offs."
> "PostHog and Amplitude both cover the essentials – analytics, experimentation, feature flags, session replay, and more – but their strengths show up in different places."

**Section order (verbatim):** How is PostHog different? → 1. Everything you need in one place → 2. It's a platform built for developers → 3. Transparent pricing, generous free tiers → Comparing
PostHog and Amplitude → Product analytics → Feature flags → Experiments → Session replay → Surveys →
Price comparison (PostHog pricing philosophy / Amplitude pricing philosophy) → Integrations →
Security and compliance → When to choose PostHog vs Amplitude → Recommendations by team type → FAQ →
Community questions

**TABLES:** many, one per product area. Master columns `Feature | PostHog | Amplitude`. **Each row
label is a linked product name with a one-line NEUTRAL definition of the criterion underneath** —
nobody else in the sample does this.

| Row label                                                                                | PostHog  | Amplitude |
| ---------------------------------------------------------------------------------------- | -------- | --------- |
| Product Analytics — "Track usage, retention, and feature adoption…"                      | ✓        | ✓         |
| Web Analytics — "Privacy-focused web analytics with real-time data and no sampling"      | ✓        | ✓         |
| Session Replay / Feature Flags / Experiments / Surveys                                   | ✓        | ✓         |
| Error tracking                                                                           | ✓        | ✗         |
| AI Observability                                                                         | ✓        | ✗         |
| Revenue Analytics                                                                        | **Beta** | ✓         |
| **Product Tours** — "Communicate with users through product tours, tooltips, and popups" | **✗**    | **✓**     |

**Two rows where PostHog loses, plus an honest "Beta" value instead of a checkmark.** Mechanically
the opposite of every other table in this research.

**Concessions — they hand entire buyer segments to the competitor, verbatim:**

> "PostHog and Amplitude offer a similar suite of products, but Amplitude lacks things like error tracking and LLM observability."

> "Need a platform optimized for marketing analytics, campaign attribution, and growth experimentation with a UI built for non-technical teams? **Amplitude** is probably the right choice."

> "**For marketing and growth teams** — **Amplitude** – Purpose-built for growth analytics with a UI designed for non-technical users. Tighter integrations with ad platforms and marketing tools, plus dedicated web experimentation features."

> "**For data teams** — **Amplitude:** – Strong option if you want to keep data in your external warehouse."

> "**For enterprise product teams** — **Tied** – Both offer robust analytics, experimentation, and compliance features. Choose based on team composition: engineering-heavy teams will prefer PostHog; marketing-heavy teams will prefer Amplitude."

> "Amplitude offers a startup scholarship (one year of Growth plan free), but PostHog's usage-based model keeps costs predictable as you scale."

> "The main exception is warehouse-native analytics: Amplitude can run queries directly on your data warehouse (Snowflake, BigQuery), while PostHog offers an integrated data warehouse approach."

> "**Amplitude's approach is better if** you have an existing warehouse and need queries to run directly in Snowflake/BigQuery for compliance or performance reasons."

> "**What's the best tool for marketers?** — **Amplitude**."
> "**Which is the best tool for product managers?** — **Tied**."
> "**Which is the best all-in-one analytics platform?** — **Tied**."

**FAQ pattern:** questions phrased exactly as a buyer would ask ("Is PostHog cheaper than
Amplitude?"), and the answer refuses to overclaim — **"It depends on your usage pattern."**

**Pricing:** both philosophies stated in words _before_ any numbers, and they concede Amplitude's
event free tier is 2× theirs ("PostHog offers 1M events…; Amplitude offers 2M events…").

> "Unlike PostHog, only the Plus plan has published per-tier pricing – Growth and Enterprise both require talking to sales."

**Legal hedging:** none. Accuracy insurance is instead: dated byline + the public handbook policy
(§3.14) + a single-source-of-truth competitor data file (§3.14).

**CTA:** no hard sell. An inline install widget mid-page — _"Install PostHog with one command / Paste
this into your terminal and make AI do all the work. / `npx @posthog/wizard`"_ — and the page ends on
FAQ + "Community questions".

---

## 3.5 PostHog vs Mixpanel `[RAW]`

**URL:** <https://posthog.com/blog/posthog-vs-mixpanel> · **Date:** "Jan 28, 2026"

**Concessions, verbatim:**

> "Prefer a polished UI optimized for product managers and growth teams, with strong warehouse-native analytics? **Mixpanel** is a solid choice."
> "**For product management teams** — **Mixpanel** – Purpose-built for non-technical users with a polished interface, metric trees for aligning teams on goals, and strong collaboration features."
> "**Mixpanel's approach is better if** you have a limited use-case and need to keep data in an existing, external warehouse for compliance reasons."

**Crediting the competitor's recent shipping — dated and specific:**

> "**Mixpanel** added AI-powered replay summaries and heatmap comparison mode in late 2025."
> "Mixpanel relaunched experimentation in late 2025 after previously deprecating it – their Experiments report is available as an Enterprise add-on."
> "**Mixpanel** recently added Account Profiles and Activation Metrics specifically for B2B analysis (requires Group Analytics add-on)."

**A rare self-directed hedge:**

> "The main difference is PostHog's broader feature set means there's more to explore, but you can adopt features incrementally."

---

## 3.6 Supabase vs Firebase `[WF]`

**URL:** <https://supabase.com/alternatives/supabase-vs-firebase> · **H1:** "Supabase vs Firebase"

**Section order:** What is Supabase? → **What is Firebase?** → Core architecture and database →
Authentication and user management → Serverless functions and backend logic → Storage and file
management → Open source vs. proprietary → Pricing and cost comparison → Ecosystem, extensibility
and community → Scalability and performance → Migrating from Firebase to Supabase → Conclusion

**Symmetry as a fairness device:** "What is Supabase?" and "What is Firebase?" get equal, neutral
treatment up top. **Firebase is placed in the LEFT/first data column** of the tables — a small
fairness signal.

**Concessions `[WF — re-verify before publishing]`:**

> "Firebase offers an excellent developer experience for prototypes and simple applications. It excels at real-time synchronization and has a generous free tier."
> "Firebase provides a polished, fully managed experience."
> "Firebase benefits from Google's ecosystem and has mature SDKs for many platforms."
> "Firebase Authentication is easy to set up for email/password and social logins."

⚠️ A date string `2025-08-20` was surfaced but **could not be confirmed** as a visible "last
updated" stamp vs. metadata.

---

## 3.7 Dub vs Bitly `[RAW]` — the cautionary example

**URL:** <https://dub.co/compare/bitly> · **H1:** "Dub vs Bitly"

**Section order:** Dub is a modern, delightful take on link management → Dub vs Bitly at a glance →
Compare plans → **Migrate in 3 minutes** → Dub vs. others → Supercharge your marketing efforts

**TABLE — columns: `Pro | Bitly Growth`** — one _named Dub tier_ against one _named competitor
tier_. Like-for-like tier matching is the fairest structural choice available, but the matchup is
still chosen by the vendor.

Row labels verbatim: Monthly pricing · Monthly links / QR codes · Advanced analytics · Analytics
data retention · AI insights · Custom domains · Teammates & user management · UTM builder · UTM
templates · Change your link destination · Custom link previews · Shorten links on a subpath ·
Query parameter passing · Developer SDKs · **Beautiful, intuitive UI** · Open-source

⚠️ **"Beautiful, intuitive UI" is a conclusion, not a criterion** — an unfalsifiable row inside a
factual table.

**The sibling page <https://dub.co/compare/rebrandly> `[WF]` honestly shows a row the competitor wins:**

| Row                         | Dub Pro    | Rebrandly Professional           |
| --------------------------- | ---------- | -------------------------------- |
| Monthly pricing             | $25/mo     | $32/mo                           |
| Monthly links / QR codes    | 1,000/mo   | **1,500/mo** ← competitor higher |
| Monthly tracked clicks      | 50,000/mo  | 25,000/mo                        |
| Custom domains              | 10 domains | 3 domains                        |
| Teammates & user management | 3 users    | 1 user                           |

**TONE:** no prose concessions anywhere; no sentence admits a Dub weakness. All negative framing is
**outsourced to named customer testimonials**, which lets the vendor attack without doing the
attacking:

> "Bitly was far more complicated than necessary. We simply needed a straightforward service to create branded short links, and Dub is perfect for that." — Sebastian Mellen, CEO, Cerebrum
> "Dub is the perfect Bitly alternative. We instantly switched all our links to it since the early days and have never looked back." — Pranav, CEO, Chatwoot
> "Dub is one of my favorite new tools in our tech stack. Thanks for freeing me of Bitly." — Paul Elijas, Chief of Staff, Augment.org

**⚠️ Legal / fairness hedging: NONE.** The raw HTML was grepped for "as of", "publicly available",
"trademark", "disclaimer", "accurate", "last updated" — the **only** match was the footer
`© 2026 Dub Technologies, Inc.` **Exact competitor pricing ($25/mo vs $29/mo, $32/mo) is published
with no date stamp and no sourcing note.** The clearest example of the risky pattern in the sample.

**CTA:** "Supercharge your marketing efforts" → "Start for free" / "Get a demo", plus a mid-page
de-risking block **"Migrate in 3 minutes"** linking to `/help/article/migrating-from-bitly`.

---

## 3.8 Cal.com vs Calendly `[RAW]`

**URL:** <https://cal.com/blog/cal-com-vs-calendly-the-ultimate-guide> · **Date: "Jul 7, 2026"**
⚠️ **`https://cal.com/compare/calendly` returns 404** — the blog post is the real page.

**Section order (verbatim):** TL;DR: Cal.com vs Calendly → Cal.com vs Calendly at a glance →
Calendly → Cal.com → Quick verdict → Feature comparison → Booking experience → _Winner: Cal.com_ →
Customization and branding → _Winner: Cal.com_ → Integrations → _Winner: Cal.com_ → Automation and
workflows → _Winner: Cal.com_ → Security and compliance → _Winner: Cal.com_ → Pricing comparison →
**Calendly advantages** → **Cal.com advantages** → Which platform should you choose? → Choose
Calendly if you… → Choose Cal.com if you… → Conclusion → FAQ

**Seven tables.** Columns: `Feature | Cal.com | Calendly | Winner` (TL;DR), then
`Feature | Calendly | Cal.com` per section (**competitor first**).

⚠️ **The "Winner:" verdict after every single section is Cal.com** — a five-for-five sweep that
undercuts the credibility of the verdict format itself.

**BUT they run a dedicated "Calendly advantages" section — verbatim:**

> "Simplicity and accessibility, these are the two most standout advantages of Calendly. Anyone who has never used scheduling software before can also sign up on Calendly and create their own booking page in a matter of minutes. This level of accessibility is what has catapulted Calendly to the height of success as one of the most popular scheduling software options."

> "**Reliable scheduling experience:** The booking engine of Calendly is very reliable. It does not double-book meetings; the integrations it has with calendar apps like Google Calendar and Microsoft Outlook are very strong and do not fail."

> "**Healthy ecosystem:** Given the popularity that Calendly enjoys, it has built a healthy ecosystem of apps and integration options…"

> "**Minimal maintenance:** Calendly is a software that works out of the box. It doesn't require a detailed setup."

> "**Ideal for individuals:** Despite having different tiers for businesses and even enterprises, the true value and MVP of Calendly is its plan for individuals."

**The clearest price concession, inside a table cell:**

> "If you go directly on a per-dollar comparison, Calendly wins. However, Cal.com offers much more for its paid plans than Calendly."

**An unusually generous framing of the whole category:**

> "To be very honest, both Calendly and Cal.com are incredibly well priced. ... So, it is safe to say there are many valid reasons why Cal.com and Calendly are considered industry leaders."

**"Choose Calendly if you…"** — Want a scheduling app that sets up quickly · Need scheduling just for
your personal purposes · **"Don't care that much about customization options and features"** · Have
simple scheduling requirements.
⚠️ This list is subtly loaded — "don't care that much about features" is a backhanded qualifier,
unlike PostHog's straight handoffs.

**Pricing:** full tier-by-tier numbers for both (Calendly: free / Standard $10 / Teams $16 /
Enterprise $15,000 yr. Cal.com: Free forever / Teams $12 / Organizations $28 / Enterprise custom).
**Date-stamped only by the post date; no "pricing as of" note on the pricing section.**

**Legal:** only a self-protective mark — "Cal.com® and Cal® are registered trademarks of Cal.com,
Inc. All rights reserved." **No Calendly trademark attribution and no "not affiliated" disclaimer.**

**CTA:** "Get started with Cal.com for free today! Experience seamless scheduling and productivity
with no hidden fees. Sign up in seconds and start simplifying your scheduling today, no credit card
required!"

---

## 3.9 Umami vs Google Analytics `[RAW — recovered from the Next.js RSC payload]`

**URL:** <https://umami.is/compare/google-analytics>

**H1:** "Everything you use GA for — without the complexity or surveillance"
**Sub-headline:** "Traffic, campaigns, funnels, revenue, session replay, and heatmaps in one
privacy-first platform. No cookies, no consent banners, no weeks-long learning curve."

**Section order:** [table by category] → Privacy without compromise → Analytics your whole team can
actually use → Lightweight and fast → Own your data → FAQ → Resources

**TABLE — columns `Feature | Umami | Google Analytics`, grouped into four labelled categories:**

- **Privacy & Compliance:** Cookie-free tracking · GDPR compliant by default · No cookie banner required · Data ownership (`Full ownership` vs `Google retains data`) · Open source
- **Analytics Features:** Real-time dashboard (✓ vs `Limited`) · Pageviews & visitors · UTM tracking · Custom events (`Simple setup` vs `Complex setup`) · Funnel analysis · User journeys (✓ vs `Limited`) · Session replay (✓/✗) · Heatmaps (✓/✗) · Custom dashboards (✓ vs `Via Looker Studio`) · Revenue tracking · Attribution · Link & pixel tracking (✓/✗) · Raw data export (✓ vs `Via BigQuery`)
- **Setup & Usability:** Setup complexity (`Single script tag` vs `Multiple steps`) · Learning curve (`Minutes` vs **`Weeks to months`**) · Interface complexity (`Simple & clean` vs `Complex UI`) · Data sampling (`No sampling` vs `Sampled data`) · Report customization
- **Hosting & Pricing:** Self-hosting option (✓/✗) · Cloud hosting · Free tier (`Generous` vs `Yes (with limits)`) · Script size (`~2KB` vs `~45KB`) · Impact on page speed (`Minimal` vs **`Noticeable`**)

⚠️ **Across 28 rows there is not one row where Google Analytics wins.** Best case for GA is a tie.
Several cells editorialise rather than state fact ("Weeks to months", "Noticeable", "Complex UI").
**No concession section, no "when GA is better", no admitted weakness anywhere.** Textbook
straw-manning by PostHog's own definition (§3.14).

⚠️ **THE CONTRADICTION WORTH REMEMBERING:** Plausible's page says the GA script is **135KB gzipped**;
Umami's table says **~45KB**. Two vendors in the same category publish materially different numbers
for the same competitor artefact. This is the concrete argument for why undated, unsourced
competitor figures are hazardous.

---

## 3.10 Appwrite vs Firebase `[RAW]` — best date-stamping practice found

**URL:** <https://appwrite.io/blog/post/open-source-firebase-alternative>
⚠️ `https://appwrite.io/blog/post/appwrite-vs-firebase` **404s**.

**H1:** "Appwrite vs Firebase: An open source alternative for Firebase"

**⭐ Date-stamping — the best practice in the whole sample:** published "Feb 3, 2024", byline
"Aditya Oberai, Developer Relations Lead", **plus a visible in-body line: "Updated on October 6,
2025"**. Both dates shown.

**Structural pattern worth stealing:** every feature section is split into **"Similarities:" then
"Differences:"** — similarities always first.

> "**Similarities:** Both Appwrite and Firebase offer comprehensive user authentication and authorization capabilities. Both use industry-leading hashing algorithms to protect user passwords."

**Table (placed at the END, after the argument):** `Feature | Appwrite | Firebase`. Rows: Deployment
· Free plan · Paid plan · Open source · Support · Functions marketplace · Messaging providers. The
**Support** row honestly favours Firebase (Appwrite "Community and email" vs Firebase "Community,
Support Portal, and help center").

**Concessions — including flat admissions of missing features:**

> "Firebase offers In-App Messaging to help you engage your app's active users through targeted, contextual messages inside the app. **Appwrite does not offer this feature yet but aims to do so in the future.**"
> "Firebase offers the infrastructure to implement push notifications via Firebase Cloud Messaging (FCM). **Appwrite doesn't have its own infrastructure** but contains a provider to implement FCM."
> "Firebase's storage system is a direct extension of Google Cloud Storage and has additional out-of-the-box integrations such as image filtering and video transcoding."
> "Firebase has been well-known and widely used in the market as the only BaaS for a long time."

**The conclusion is genuinely balanced — verbatim in full:**

> "Both Appwrite and Firebase are powerful platforms that simplify backend development and help teams focus on building great products rather than managing infrastructure. They share many similarities but take different approaches to solving the same challenges."
> "Firebase offers a mature, battle-tested ecosystem that's deeply integrated with Google Cloud. It's a good choice for teams looking for a managed, ready-to-use solution that scales seamlessly with minimal setup."
> "Ultimately, the right choice depends on your priorities. If you want a managed, plug-and-play ecosystem with deep Google Cloud integrations, Firebase fits the bill. If you value openness, flexibility, and an all-in-one development experience that you can run anywhere, Appwrite is built for you."

---

## 3.11 Formbricks vs Typeform `[WF]`

**URL:** <https://formbricks.com/typeform-alternative>
**H1:** "Open Source Typeform Alternative (2026) | Free & Self-Hosted" — **note the year in the H1
itself**, an SEO freshness signal. Post date "February 11th, 2026".

**Section order:** TLDR: Formbricks vs Typeform at a Glance → **See It In Action** → Table of
Contents → Why Users Seek Typeform Alternatives in 2026 → What Is Formbricks? → Detailed Feature
Comparison → **Where Typeform Excels** → **Where Formbricks Excels** → Survey Builder Features &
Usability → Look, Feel & Customization → Data Security & Privacy → API, Integrations & Developer
Experience → Pricing Plans Compared → **Other Typeform Alternatives Worth Considering** → Other Open
Source Alternatives → FAQ → Final Verdict → Try Formbricks now

**Two structural moves worth noting:**

1. **"Where Typeform Excels" comes BEFORE "Where Formbricks Excels".**
2. The page **recommends five rival products by name** (Google Forms, Jotform, Tally, SurveyMonkey,
   Fillout), each with a "Best for" tag — buying credibility by being genuinely useful.

**Three tables**, and the column headers **name the exact compared tier** — good practice:
`Feature | Typeform Free | Formbricks Cloud Free` and `Feature | Typeform Plus (2.5k responses) |
Formbricks Startup`.

**Concessions, verbatim:**

> "Typeform wins on built-in workflows and advanced quizzing."
> "Typeform's advantage is its calculator and built-in workflow features."
> "**Built-in emailing and workflows** for contacting respondents directly from the platform (Formbricks handles this via webhooks or third-party tools like Zapier or Make)"
> "**A complex logic editor with variables** for calculations, scoring, and dynamic routing"
> "**Advanced quiz creation features** with outcome-based and score-based quiz types"

**CTA:** dual path — "Run locally with docker-compose. [One Click Install]" / "Test our managed
service for free: [Get started]", with the reassurance "Keep full control over your data 🔒".

---

## 3.12 Mattermost vs Slack `[RAW + WF]`

⚠️ **`https://mattermost.com/mattermost-vs-slack/` is NOT a comparison page.** Confirmed via raw
HTML: it serves a page titled **"The open source advantage"** (sections: Open source, now & always ·
Why choose open source? · Security · Data Privacy · Interoperability · Avoid Vendor Lock-In · Why
and How to Contribute to Mattermost · … · Download and get started with Mattermost today). No table,
no Slack comparison, no pricing. Legacy redirect — do not cite this URL from memory.

**The real page: <https://mattermost.com/open-source-slack-alternative/> `[WF]`**

- **H1:** "The Open Source Slack Alternative"
- **Sections:** Teams that use Mattermost instead of Slack → The only collaboration solution built for mission-critical work → Designed for the way mission-critical teams work → Why choose Mattermost over Slack → **The flexibility and extensibility that Slack lacks** → More deployment options than Slack → Designed for agile teams → Don't just take our word for it → Mattermost vs. Slack Platform Comparison → Talk to an expert today.
- **Table:** `Mattermost | Slack`; rows: Software type · Deployment options · Features · Usability · Customizability · Security. ⚠️ **Only 6 rows, and every row label is a broad subjective category rather than a checkable fact** — the least falsifiable table in the sample.
- **Concessions: none found. Trademark attribution or disclaimer: none found.**
- **CTA:** "Talk to an expert today." → "Contact Us" — the only comparison page in the set that gates the CTA behind sales.

**<https://mattermost.com/mattermost-vs-slack-total-cost-of-ownership/> `[WF]`** — H1: "Total Cost of
Ownership: Mattermost vs. Slack Enterprise Grid". Content **gated behind a PDF download**; no
on-page table, no pricing numbers, no methodology note, no date stamp, no disclaimer. The headline
claim promoted elsewhere is "savings of over 60% vs. Slack Enterprise Grid" — ⚠️ **no sourcing or
as-of date could be verified because the substantiation is inside the gated PDF.**

---

## 3.13 Documenso vs DocuSign `[WF]`

⚠️ **No dedicated "vs DocuSign" page exists.** `documenso.com/blog/documenso-vs-docusign` 404s. The
positioning lives entirely in the README tagline ("The Open Source DocuSign Alternative") and the
launch post <https://documenso.com/blog/announcing-open-source-docusign-alternative> (**Dec 29, 2022**).

**Sections:** TL;DR; → Let's build the world's most trusted document-signing tool. → Digital signing
is great → How do we build trusted systems? → Next Steps

**The one DocuSign sentence — and it's a concession:**

> "Document signing is NOT a technical problem. [Editor's Note: Because it was solved technically a long time ago] It's a legal acceptance problem — and everyone KNOWS DocuSign and friends and understands how they're admissible."

They concede the incumbent's **trust and legal recognition is the actual moat**. No table, no
pricing comparison, no disclaimers.

**CTA:** "If you think Documenso is worthy of support, please share documenso.com with anyone
interested, and sign up to be among the first to try out version 0.1 as soon as it launches."

---

## 3.14 ⭐ PostHog's PUBLIC HANDBOOK RULE — "11. Steelman competitors" `[RAW, quoted in full]`

**URL:** <https://posthog.com/handbook/content/seo-guide> (also at `/handbook/growth/marketing/seo-guide`)

**The single most valuable document found in this research.** Full verbatim text:

> ## 11. Steelman competitors
>
> Many other companies "straw man" their competitors. They claim their competitors are worse than reality, focus on differences that don't matter, and make hyperbolic claims about how much better they are. We don't do this.
>
> When writing about competitors, be honest about their capabilities. Assume they are reading and will dunk on you for being dishonest. PostHog may not have all the features competitors have today, that's okay. Our reputation and trust with readers is more important than whatever "marketing win" being dishonest gives us.
>
> It's also okay to make mistakes here. Competitors change faster than we can keep up. Whenever we find a mistake, we fix it as soon as we realize. We also happily accept updates from competitors if they make our post more accurate.

Note it sits at position 11 of 11 inside their **SEO** best-practices guide — framed as an SEO
practice, not a legal or PR one.

**Adjacent rule on freshness — "8. Updates work / are important", verbatim:**

> "Publishing a great article is not the end of the story. SEO is an ongoing process, and one of the best ways to maintain or boost rankings is to keep content up-to-date."
> "How often this should happen is very subjective, but the more traffic a page gets the more often it should be updated. When updating, don't just change a few words or the date; search engines are smart about detecting meaningful updates versus superficial ones. Add genuinely valuable content: new stats, a new tip, clearer structure, recent developments, etc. **And if your last update was a while ago, consider adding an 'Updated on [Date]' notice to show readers (and Google) that the page is maintained.**"

**Adjacent rule on evidence — "4. Demonstrate expertise and authority", verbatim:**

> "**Backing our claims with data.** Include relevant statistics, research findings, or mention credible studies. Citing reputable sources or adding footnotes for facts can also build trust (and AI models tend to favor answers with a cited source)."

**PostHog: "Why attacking your competitors online is dumb" `[WF]`**
<https://posthog.com/blog/why-attacking-competitors-is-dumb>
Sections: You're only talking to your own fans → You're doing their marketing, with your audience →
Most people didn't see the thing you're upset about → What to do instead → Further reading

> "This isn't a moral argument about keeping it classy. I just think public competitor attacks never work."
> "The better move is genuine honesty about tradeoffs – where you're stronger, where you're not, who each product is actually for."
> "Make fun of trends, not companies. If something in your market is genuinely dumb, be funny and critical about that without naming anyone."
> "where we have made factual errors, we fix them as quickly as possible when they're pointed out."
> "Contacting a competitor to say 'Hey, this isn't accurate, it should be this' takes five minutes and either fixes it."
> "But mostly: use your anger to outship them and build a better product."

**⭐ The machinery that makes honesty sustainable `[RAW]`**
<https://posthog.com/handbook/engineering/posthog-com/product-comparisons.md> — purely technical, no
ethics content (verified by fetching):

- Feature definitions live in `/src/hooks/featureDefinitions/`
- **Competitor data lives in `/src/hooks/competitorData/`**
- Rendered by a shared `<ProductComparisonTable />` component
- Supports overriding labels, excluding sections, filtering incomplete data, adding custom rows

**Competitor facts are stored ONCE, centrally, and every comparison page reads from that single
source.** When a competitor ships a feature, one file changes and every page updates. This is the
operational answer to "competitors change faster than we can keep up."

⚠️ PostHog's `/handbook/marketing/positioning` page contains **no** competitor guidance (verified).
The rules live in the SEO guide.

---

## 3.15 LEGAL — comparative advertising and nominative fair use

**The three-part nominative fair use test** (_New Kids on the Block v. News America Publishing_),
verbatim via <https://harriganip.com/blog/nominative-fair-use-trademark-law/>:

> 1. "The product or service is not readily identifiable without using the trademark."
> 2. "Only so much of the mark is used as is reasonably necessary."
> 3. "The use does not suggest sponsorship or endorsement by the trademark holder."

> "if your use meets the three-part test, you don't also have to prove that consumers won't be confused—the test already accounts for that."

**Practical do's and don'ts, verbatim from the same source:**

> - "Use the brand name only when necessary."
> - "Don't use logos, slogans, or stylized marks."
> - "Include clear disclaimers." (example given: "XYZ Repairs is not affiliated with Apple Inc.")
> - "Watch your ad copy and domain names."
> - "Don't overdo it."

⚠️ Caveat in source: protections "vary by circuit, with the Third Circuit treating it differently
than the Ninth Circuit's approach."

**INTA fact sheet** <https://www.inta.org/fact-sheets/fair-use-of-trademarks-intended-for-a-non-legal-audience/>:

> "Nominative fair use permits use of another's trademark to refer to the trademark owner's goods and…"
> "(1) the product or service in question is not readily identifiable without use of the trademark; (2) only so much of the mark as is reasonably necessary to identify the product or service is used; and (3) use of the mark does not suggest sponsorship or…"
> "Nominative fair use generally applies to comparative advertising, parody and non-commercial use of trademarks in academic articles, media reports, _etc_."
> "For example, one could refer to 'the professional basketball team from Chicago,' but it is simpler and more understandable to say the Chicago Bulls."
> **"In Europe, use in comparative advertising must comply with the European Union directive concerning misleading and comparative advertising."**

**Practical rules distilled from the legal sources:**

1. Using the competitor's **word mark** in the page title and body is protected. Using their
   **logo, stylised wordmark, or brand colours** is not covered by the same protection.
2. Use only as much of the mark as needed — name them in text, don't reproduce their brand assets.
3. Nothing may imply endorsement, affiliation or sponsorship. A short "not affiliated with X"
   disclaimer directly addresses prong 3.
4. **Separately from trademark law, false-advertising exposure (Lanham Act §43(a)) is the bigger
   practical risk** for a comparison table: factual claims about a competitor must be true and
   substantiated. Trademark fair use does **not** immunise a false factual claim.
5. Avoid competitor names in **domain names and ad copy**.
6. EU-facing pages fall under an additional statutory regime (the Misleading and Comparative
   Advertising Directive).

⚠️ **UNVERIFIED:** the Dykema legal primer PDF
(`dykema.com/.../dykema-primercomparative-advertising-and-nominative-fair-use.pdf`) downloaded
(427KB) but could not be text-extracted (image/font-encoded PDF, no poppler available).
**Its Lanham Act false-advertising elements are therefore unverified.** Likely the single best
source on the topic — worth retrieving manually.

---

## 3.16 CROSS-CUTTING PATTERNS IN COMPARISON PAGES

**Four distinct concession strategies, genuinely different in kind:**

| Strategy                              | Who                                                                                                                          | Mechanism                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Dedicated concession section**      | Plausible ("What GA4 does better"), Cal.com ("Calendly advantages"), Formbricks ("Where Typeform Excels" — **placed first**) | One clearly labelled H2 admitting competitor strengths                                                        |
| **Concession distributed throughout** | PostHog, Appwrite                                                                                                            | ✗ and "Beta" in their own table column; whole buyer segments handed to the competitor; per-section admissions |
| **Separate honesty page**             | **Plausible `/when-not-to-use-plausible`** — unique in the sample                                                            | An entire indexed page devoted to disqualifying yourself                                                      |
| **Zero concession**                   | Dub, Umami, Mattermost                                                                                                       | No admitted weakness anywhere; Umami is starkest at 28/28 rows won                                            |

**The strongest negative finding:** of every page checked directly for hedging language, **not one
carried "as of <date>" on pricing, "based on publicly available information", "we may be biased", or
a competitor trademark disclaimer.** Dub publishes exact competitor dollar figures with no date and
no sourcing. The only trademark text found anywhere was Cal.com asserting its _own_ marks.
Date-stamping is handled entirely through blog-post publication dates — **Appwrite is the sole best
practice**, showing both "Feb 3, 2024" and a visible "Updated on October 6, 2025".

**Table row labels run on a quality spectrum:**

- **Checkable facts** — Plausible ("Data retention", "Script blocked by ad blockers")
- **Editorialised verdicts** — Dub ("Beautiful, intuitive UI"), Umami ("Weeks to months", "Noticeable")
- **Unfalsifiable categories** — Mattermost ("Usability", "Features")
- **PostHog is the only one to pair each row label with a neutral one-line definition of the criterion.**

**CTA patterns:** self-serve + risk reversal ("Install it alongside Google Analytics … switch when
you're ready" — Plausible; "Migrate in 3 minutes" — Dub; "no credit card required" — Cal.com) versus
sales-gated ("Talk to an expert today" — Mattermost). **PostHog has no closing CTA at all**, ending
on FAQ and community questions.

## 3.17 Confirmed 404s — do not cite these URLs

- `https://plausible.io/vs-fathom` — 404. Plausible's live compare set is only: vs Google Analytics, vs Matomo, vs Cloudflare Analytics, plus Migrate from GA4.
- `https://plausible.io/vs-simple-analytics` — 404
- `https://cal.com/compare/calendly` — 404
- `https://n8n.io/vs-zapier/` — 404. **No official n8n vs Zapier page located.** (Zapier publishes one about n8n — unfetched.)
- `https://appwrite.io/blog/post/appwrite-vs-firebase` — 404
- `https://documenso.com/blog/documenso-vs-docusign` — 404
- `https://nocodb.com/compare/nocodb-vs-airtable`, `nocodb.com/vs/airtable` — 404
- `https://budibase.com/comparison/retool/`, `budibase.com/blog/alternatives/budibase-vs-retool/` — 404
- `https://rallly.co/compare/doodle` — 404

**No official comparison page found at all for:** NocoDB vs Airtable, Budibase vs Retool, Outline vs
Notion, Rallly vs Doodle, Typebot vs Typeform. Their homepages are live but none runs a "vs" page at
any probed URL. **Not every successful OSS project runs comparison pages** — this is itself a finding.

**Tooling notes for follow-up work:**

- `appwrite.io` breaks WebFetch with "Parse Error: Header overflow" — use curl.
- `mattermost.com` returns 403 to curl (Cloudflare) — use WebFetch.
- `umami.is` and `dub.co` are client-rendered; content must be recovered from the Next.js RSC payload in the raw HTML.
- `web.archive.org` is blocked in this environment.
- **PostHog serves clean Markdown for any page by appending `.md`** (index at `posthog.com/llms.txt`) — by far the best source for verbatim extraction anywhere in this research.

---

# 4. DEMO STRATEGY — how people try before installing

**Method note from the sub-research:** the summarising fetch layer over-reports on SPA shells, so
most of this was obtained with raw `curl` on HTML/JS bundles plus a real Playwright browser for
JS-rendered demos. Everything marked ✅ was fetched first-hand on **2026-08-12**.

---

## 4.1 TIER 1 — real, seeded, self-serve sandboxes

### ⭐ PocketBase ✅ — the gold standard

- **Demo URL:** `https://pocketbase.io/_/` — `https://pocketbase.io/demo/` **HTTP 307-redirects** there (verified via `curl -sIL`)
- **Type:** live sandbox, seeded superuser, **credentials pre-filled in the login form**
- **Banner, verbatim, read off the live DOM:**
  > "This is a live demo of PocketBase. The database resets every hour. Realtime data and file upload are disabled. To login use: **test@example.com** **(123456)**."
- **Credentials:** `test@example.com` / `123456` — and the Email and Password fields arrive **already populated**. You click "Login". That's it.
- **Protection/reset — three mechanisms, all stated on the page itself:** hourly DB reset, realtime disabled, file upload disabled. Note _what_ they disabled: realtime (a free pub/sub channel for abusers) and file upload (free file hosting). They removed the abuse surface rather than policing it.
- **Prominence: the PRIMARY landing-page CTA.** Verbatim from the `pocketbase.io` HTML:
  ```html
  <a
    href="https://pocketbase.io/_/"
    class="btn btn-lg btn-primary btn-expanded"
    target="_blank"
    rel="noreferrer noopener"
    ><span class="txt">Live demo</span></a
  >
  <div class="clearfix m-b-sm"></div>
  <a href="/docs" class="btn btn-lg btn-outline btn-expanded"
    ><span class="txt">Read the documentation</span></a
  >
  ```
  `btn-primary` = "Live demo"; `btn-outline` = "Read the documentation". **There is no "Sign up" CTA at all** — the demo _is_ the top conversion path.
- **⭐ Demo-ability is a PRODUCT FEATURE, not a marketing page.** From the shipped admin bundle `https://pocketbase.io/_/assets/index-BUR5vHwc.js`:
  ```js
  function $r(e){app.store.title=`Superuser login`;
  let n=store({authMethods:{}, identity: e.query.demoEmail?.[0]||``, password: e.query.demoPassword?.[0]||``, ...
  ```
  **Any** PocketBase instance can be linked as `?demoEmail=…&demoPassword=…` and the login form self-populates.
- **README:** no demo mention (verified raw). The demo lives entirely on the website.

### Plausible ✅ — read-only public dashboard

- **Demo URL:** `https://plausible.io/plausible.io` — their own real traffic since 2019
- **Type:** read-only public dashboard, **no login whatsoever**
- **Credentials:** none. Proof from the page's own HTML attributes:
  ```html
  data-native-stats-begin="2019-01-23" data-embedded="" data-current-user-role="public"
  data-current-user-id="null"
  ```
- **Protection:** enforced by the product's own sharing primitive. From <https://plausible.io/docs/shared-links>:

  > "People that you send your shared link to can view the stats dashboard without having a Plausible Analytics account and without needing to log in. They can only view the specific dashboard that you shared and can't see any other sites that you have added to your Plausible account."

  Optional password protection exists: "If you add password protection to the shared link, people that you send your shared link to can only view the stats if they enter the password."

- **Prominence:** hero **secondary** CTA, verbatim **"View live demo"**, immediately right of primary "Start free trial". Repeated at page bottom.
- **⭐ They instrument it as a tracked conversion event:**
  ```js
  plausible('CTA Click', { props: { position: 'Hero', type: 'Home', button: 'View live demo' } });
  plausible('CTA Click', { props: { position: 'Bottom', type: 'Home', button: 'View live demo' } });
  ```
- **⭐ The demo is a closed loop with its own funnel.** On the demo page itself the bottom CTAs are
  **"Start free trial"** (primary, indigo) and **"See pricing"** (secondary), tracked as
  `type: 'Live demo'`.
- Homepage copy: _"We invite you to take a look around, explore our live demo and try Plausible for free."_

### Umami ✅ — one README badge line

- **Demo URL:** `https://cloud.umami.is/share/LGazGOecbDtaIwDr/umami.is` — **verified 200**, redirects to `https://cloud.umami.is/analytics/eu/share/LGazGOecbDtaIwDr/umami.is`
- **Type:** read-only public share of their own analytics · **Credentials:** none
- **Prominence:** a **badge in the top badge row of the README** (4th, after Release/License/Build):
  ```html
  <a href="https://cloud.umami.is/share/LGazGOecbDtaIwDr/umami.is" style="text-decoration: none;"
    ><img
      src="https://img.shields.io/badge/Try%20Demo%20Now-Click%20Here-brightgreen"
      alt="Umami Demo"
  /></a>
  ```
  Badge text: **"Try Demo Now | Click Here"**. Costs one line and rides the badge convention readers already scan.
- ⚠️ No demo link found in `umami.is` server HTML (client-rendered) — **unverified for the landing page specifically**.
- README also publishes self-host defaults: _"It will also create a login user with username **admin** and password **umami**."_
- **Same mechanism as Plausible:** the demo is just the product's own public-share feature pointed at themselves. **Zero bespoke infrastructure.**

### ⭐ Excalidraw ✅ — the product IS the demo

- **URL:** `https://excalidraw.com` — you land **directly on the canvas**. No modal, no login, no interstitial.
- **The entire trust model, verbatim from the live DOM:**
  > "Your drawings are saved in your browser's storage.Browser storage can be cleared unexpectedly.Save your work to a file regularly to avoid losing it."
- **Welcome screen:** "Pick a tool & Start drawing!" with menu items `Open Ctrl+O`, `Help ?`, `Live collaboration...`, and a small `Sign up` link → `https://plus.excalidraw.com/plus?utm_source=excalidraw&utm_medium=app&utm_content=welcomeScreenGuest`
- **Upsell placement:** a small "Excalidraw+" link top-right (`utm_content=guestBanner`) beside "Share". Both are _side garnish_, never a gate.
- **Where the wall falls: NOWHERE** for drawing, exporting, or even end-to-end-encrypted "Live collaboration". Only Excalidraw+ (cloud workspaces/persistence) needs an account.
- **⭐ The UTM naming (`welcomeScreenGuest`, `guestBanner`) shows "guest" is a first-class, permanent state — not a funnel step.**
- **README:** the very first nav link is **"Excalidraw Editor" → https://excalidraw.com**, placed _before_ Blog, Documentation, and Excalidraw+.

### Formbricks ✅ — demo as a staged product experience

- **URLs:** `https://formbricks.com/demo/saas` and `https://formbricks.com/demo/e-commerce` (both 200)
- **Type:** a mock product page that fires real Formbricks surveys at you. **You experience the output, not the builder.**
- **Verbatim:** "Try Formbricks for Digital Products now" / "We're happy to get you started, no credit card required." / CTA button "Try Formbricks"
- Cross-link between the two: "Test out E-Commerce Customer Journey". Nav labels: "SaaS Demo" and "E-Com Demo".
- **Credentials:** none needed (nothing to log into)
- README sends you to signup instead: _"**Try it out in the cloud at [formbricks.com](https://app.formbricks.com/auth/signup)**"_

### Cal.com ✅ — the public artifact is the demo

- **URLs:** `https://cal.com/peer` → 200 (→ `https://i.cal.com/peer/meet?user=peer&orgRedirection=true`); `https://cal.com/rick` → 200 (→ `/rick/get-rick-rolled`)
- **Type:** no-signup public product surface. Payload carries `"isBookingPage":true,"requiresLicense":false`. A visitor books with name + email — **no account, ever**.
- **⚠️ Critical tension:** every CTA on cal.com _labelled_ "demo" is a **sales call** — "Book a demo", "Get a demo" (→ `./talk-to-sales`), "Talk to sales". The genuinely great self-serve demo (a real booking page) **is never marketed as a demo.**
- **README publishes local seed credentials** (for `yarn dx`, _not_ a hosted demo):

  > "> - Will start a local Postgres instance with a few test users - the credentials will be logged in the console"

  | Email                    | Password          | Role                  |
  | ------------------------ | ----------------- | --------------------- |
  | `free@example.com`       | `free`            | Free user             |
  | `pro@example.com`        | `pro`             | Pro user              |
  | `trial@example.com`      | `trial`           | Trial user            |
  | `admin@example.com`      | `ADMINadmin2022!` | Admin user            |
  | `onboarding@example.com` | `onboarding`      | Onboarding incomplete |

### Outline ✅ — a real demo, but undiscoverable

- **URL:** `https://demo.getoutline.com/` — **verified 200**, a genuine Outline instance. Title: "Outline Demo – Login - Outline", heading "Login to Outline Demo", buttons "Continue with Google" / "Continue with Email", plus "Back to home".
- **Type:** live shared instance, but **you authenticate with your own identity** — no published credentials, no stated reset policy.
- **⚠️ Prominence: effectively zero.** No demo href found anywhere in `getoutline.com` HTML; no demo mention in the README. **A working demo that nobody can find is worth nothing.**

### Mattermost ✅ — community server as de facto demo

- **URL:** `https://community.mattermost.com/` — 200. Interstitial: "Where would you like to view this?" / "You can view in the desktop app or continue in your web browser." → "View in Desktop App" / "View in Browser", then login.
- **Type:** a real production community server, **not** a seeded demo. You sign up with your own account.
- README: _"[Deploy Mattermost on-premises](…), or [try it for free in the cloud](…)."_
- `mattermost.com` links only `https://mattermost.com/resources/?filter=demos` — a **recorded**-demo resource filter, not a sandbox.

---

## 4.2 ⚠️ TIER 2 — "Demo" that means a sales call

**This was the single most common pattern in the sample and it matters for naming.**

| Project       | "Demo" CTA verbatim                                  | Where it actually goes                                                                                                 |
| ------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Directus**  | "Get a Demo" / "Get a demo"                          | `directus.io/demo` → **302 redirects to `directus.com/sales`** (verified); `demo.directus.io` → `directus.com/contact` |
| **Appwrite**  | "Request a demo" (`class="web-button is-secondary"`) | `/contact-us/enterprise`                                                                                               |
| **Dub.co**    | "Get a demo" (`"variant":"secondary"`)               | `/contact/sales`                                                                                                       |
| **Cal.com**   | "Book a demo" / "Get a demo"                         | `./talk-to-sales`                                                                                                      |
| **Infisical** | nav **primary** = "Get a Demo"                       | `infisical.com/talk-to-us`; README: _"book a meeting with us"_ → `https://infisical.cal.com/vlad/infisical-demo`       |
| **Papermark** | "Book a Demo"                                        | sales; `aria-label":"Schedule a product demo"`                                                                         |

**Directus is the starkest: the literal URL `directus.io/demo` 302s to a sales page.**
Infisical is the only one where "Get a Demo" outranks "Sign Up" as the _primary_ nav CTA (its
secondary CTAs "Try it out" / "Try it now" go to `app.infisical.com/signup` — a signup wall, not a
sandbox).

---

## 4.3 TIER 3 — verified negatives (no self-serve demo)

- **n8n** ✅ — `n8n.io/demo` → **404**; `demo.n8n.io` → DNS failure. Hero primary `"Get started for free"` → `https://app.n8n.cloud/register`. Also "Contact sales", "Talk to sales", "Watch this video to hear our pitch". README: no demo. ⚠️ _Flagged as NOT FOUND rather than definitively absent._
- **Typebot** ✅ — README `## Builder demo` is an **MP4 video**. Nav CTA `**[Try Typebot](https://app.typebot.io/register)**` → registration wall.
- **Papermark** ✅ — README `## Demo` is an animated **GIF** (`.github/images/papermark-welcome.gif`). `papermark.com/view/demo` returns HTTP 200 but an app-level 404: _"404 error Page not found. Sorry, we had trouble loading this link."_ Landing offers "See it in Action" / "Watch how easy it is to set up your data room" (video).
- **Coolify** ✅ — `coolify.io/demo` returns 200 but is **byte-identical to the homepage** (36,314 bytes both) = catch-all route, no demo page. Offers "Screenshots", "Videos", "Building in live-streams", "To Cloud" instead.
- **Budibase** ✅ — `budibase.com/demo` → 404. `demo.budibase.app/builder` loads then **errors**: heading "Oops...", "There was a problem initialising the builder", **"Tenant not found"** — a _dead_ demo still resolving.
- **Baserow** ✅ — `baserow.io/demo` → 404; `demo.baserow.io` DNS fail. Primary "Get started. It's free!" → `/signup`; secondary "Contact sales".
- **NocoDB** ✅ — `nocodb.com/demo` → 404; `app.nocodb.com` → 200 (cloud signup). README has no demo but describes the enabling primitive: _"⚡ Share Bases / Views: either Public or Private (with Password Protected)"_
- **Penpot** ✅ — `design.penpot.app` → 200 but requires an account. Landing CTAs "Sign up, it's free", "Sign up", "Log In" — **no demo CTA**. README has only a YouTube code walkthrough. ⚠️ **Penpot view-only share links: NOT VERIFIED.**
- **Documenso** ✅ — `documenso.com/demo` → 404; `demo.documenso.com` DNS fail.
- **Trigger.dev** ✅ — `demo.trigger.dev` DNS fail. CTAs "Get started for free", "Start building now", "Get started with Next.js/Node.js/Bun/Remix", "Self-host".
- **Novu** ✅ — `demo.novu.co` DNS fail. README "Want to see ACI in action?" resolves to `npx novu@latest connect` — **a CLI, not a hosted demo**.

### ⚠️ Twenty CRM — the demo appears DECOMMISSIONED (changed since most write-ups)

`https://demo.twenty.com` returns HTTP 200 and briefly renders `demo.twenty.com/welcome` ("Welcome
to your workspace"), then **client-side redirects to `https://app.twenty.com/welcome`** ("Sign in or
Create an account"). **No credentials displayed anywhere.** The README (raw, `main`) has **no demo
link at all**.

⚠️ _Historical, UNVERIFIED (from search results):_ credentials were `tim@apple.dev` / `Applecar2025`.
GitHub issue cluster: [#7304 "Set default demo account to noah@demo.dev"], [#7754 "Accounts on demo
can't be created"], [#8373 "Demo instance doesn't work - User is not a member of the workspace"],
[#7165 "Demo login not functioning"]. **That issue cluster — repeated breakage, then account-creation
lockdown, then removal — is itself evidence of the operational cost of a shared seeded demo.**

---

## 4.4 Where the signup wall falls

**Verified in depth: Excalidraw only.** The pattern is precise and worth copying:
_anonymous by default → localStorage persistence → account required only for cloud sync_ — with an
explicit honesty notice ("Browser storage can be cleared unexpectedly") that converts a limitation
into a trust signal **and** a natural upsell.

**Adjacent verified data points:**

- **Cal.com** — the _consumer_ side (booking) is permanently anonymous; only the _creator_ side needs an account. **Two-sided products get a free demo surface this way.**
- **Plausible / Umami / NocoDB** — all three ship a "public share link" feature; Plausible and Umami then point it at themselves. The demo costs nothing to build and nothing to maintain **because it's the product's own sharing primitive.**
- **Signup wall on the builder:** Penpot, Budibase, Baserow, Documenso, Typebot, Infisical, Formbricks, Twenty.

⚠️ **LARGEST GAP IN THE BRIEF — NOT VERIFIED, search budget exhausted before reaching them:**
tldraw, Figma/FigJam view-only links, Carrd, Typedream, Framer, Bento, Linktree, CodePen,
StackBlitz, Val Town, Replit, Canva. **No evidence gathered on where their signup walls fall.**
Given the product being built is a portfolio builder, **this is the highest-value follow-up.**

---

## 4.5 Demo abuse and reset policy ⚠️ THIN

**Only PocketBase states a policy on-page**, and it names all three levers at once:

> "The database resets every hour. Realtime data and file upload are disabled."

**No other project in the sample publishes any reset or protection wording.**

**Structural evidence of abuse pressure (inference, flagged as such):** Twenty's demo issue cluster
includes "Accounts on demo can't be created" — account creation was locked down — and the demo now
appears retired. Budibase's demo tenant is dead ("Tenant not found"). Directus routed its demo URL
to sales. Across 24 projects, **the shared-seeded-sandbox pattern shows a clear decay curve; the
read-only-public-share pattern (Plausible, Umami) shows none, because there is nothing to abuse.**

HN threads located (titles only, comments not fetched — no verbatim quotes):

- "Ask HN: Does anyone else instantly uninstall apps that require a signup to try?" — 19 pts, 13 comments — <https://news.ycombinator.com/item?id=18668645>
- "Tell HN: Stop asking me to sign up" — 13 pts, 2 comments — <https://news.ycombinator.com/item?id=37473108>

⚠️ No write-ups on spam-in-public-sandboxes found; no reset crons located in any repo (GitHub API
returned 403 rate-limit when enumerating the Twenty tree).

---

## 4.6 Scripted tours vs real sandboxes ⚠️ THIN

**One useful verified negative.** All 22 saved landing pages were grepped for `arcade.software`,
`navattic`, `storylane`, `supademo`, `reprise`, `walnut`, `instruqt`, `tourial`, `chameleon`,
`userflow`, `appcues`, `loom.com`, `youtube.com/embed`. **Zero matches across all 22.**

⚠️ **Caveat: these vendors inject via client-side script, and the same grep found zero YouTube
embeds on sites that certainly have videos** — so this likely reflects lazy-loading, not true
absence. Treat as _suggestive, not conclusive_.

What the server HTML _does_ show: the substitutes these projects actually reach for are **video and
screenshots** — Typebot's README demo is an MP4, Papermark's is a GIF, Coolify's landing offers
"Screenshots" / "Videos" / "Building in live-streams", n8n offers "Watch this video to hear our
pitch", Papermark offers "See it in Action".

---

## 4.7 THE THREE DEMO ARCHITECTURES (with very different maintenance costs)

| #     | Architecture                                                  | Who                               | Cost / durability                                                                                                                                                                                                    |
| ----- | ------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Public read-only share of your own data**                   | Plausible, Umami                  | Zero marginal cost, zero abuse surface, self-updating, doubles as dogfooding proof. Both built it from a feature they'd already shipped. **No decay observed.**                                                      |
| **2** | **Seeded sandbox + published credentials + aggressive reset** | PocketBase                        | Highest fidelity, the only one that lets you _write_. Survives **only** with an explicit stated protection policy. **Everyone who tried this without a reset policy has a dead or retired demo** (Twenty, Budibase). |
| **3** | **The product itself is anonymous-first**                     | Excalidraw, Cal.com booking pages | Strictly best when the core loop can run without persistence. **No demo to maintain, because there is no demo.**                                                                                                     |

**Placement finding.** PocketBase is the only project of 24 where the demo is the **primary** CTA.
Plausible is the only one that puts it in the hero as a deliberate secondary next to "Start free
trial" — _and_ instruments it as a conversion event, _and_ closes the loop with "Start free trial"
on the demo page itself. Umami gets ~80% of the value from a single README badge line. Everyone else
either buried it (Outline: a working demo nobody links), redirected it to sales (Directus), or let
it rot (Budibase, Twenty).

**⭐ Naming finding.** "Demo" has been so thoroughly captured by sales that it is nearly a dead word
— **6 of 24 projects use "demo" to mean "talk to a human"**. A self-serve sandbox is better labelled
**"Live demo"** (PocketBase) or **"View live demo"** (Plausible), where **"live" is doing the
disambiguating work**.

**⭐ The HN connection.** Recall §6.3: Show HN's rules say _"Please make it easy for users to try
your thing out, ideally without barriers such as signups or emails"_ and _"Don't post landing
pages."_ Architectures 2 and 3 satisfy that rule directly. Architecture 1 does not (there is nothing
to _do_). For a product whose launch channel is HN, this constrains the choice.

---

# 5. TRUST AND SOCIAL PROOF

**Note on method:** several sites render their nav client-side, so raw HTML was fetched with `curl`
and the server payload grepped. Wayback is blocked to `WebFetch` but reachable via
`curl https://web.archive.org/web/<timestamp>id_/<url>` — that is how §5.10–5.15 were obtained.
**All Wayback timestamps below are exact.**

---

## 5.1 GitHub star counters in the site header — audited across 25 sites

### HAS a live star count in the nav — 8 confirmed

| Site              | Exact nav element                                                                                                                                                        | Position                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **trigger.dev**   | `Star 16.0k` — GitHub icon + the word "Star" + count                                                                                                                     | Right cluster, after Pricing, alongside Discord/GitHub icons, before "Login / Get started" |
| **twenty.com**    | `54.8K` (GitHub icon + number, no word "star") — **and next to it `7.1K` for Discord**                                                                                   | Right of nav, after Pricing, before "Log in / Get started"                                 |
| **appwrite.io**   | `56.9K`                                                                                                                                                                  | After Changelog, before "Go to Console / Sign up"                                          |
| **infisical.com** | `27k`                                                                                                                                                                    | Right CTA cluster, immediately before "Talk to an expert" / "Get started for free"         |
| **n8n.io**        | `200,235` — **raw unformatted integer**, linked to `github.com/n8n-io/n8n`                                                                                               | After Pricing, before "Sign in / Get Started"                                              |
| **budibase.com**  | `27.5K`                                                                                                                                                                  | After Pricing, before "Log in / Contact sales / Try it free"                               |
| **novu.co**       | Server payload contains `["$","$L59",null,{"githubStars":39481}]` — header component receives a live count of **39,481**                                                 | Header                                                                                     |
| **supabase.com**  | Nav has `<a href="https://github.com/supabase/supabase" … class="… hidden group lg:flex …">` with a GitHub SVG and an empty `<span class="truncate">` filled client-side | Right cluster, `lg:` breakpoint only — **hidden on mobile**                                |

### NO star count in the nav — 17

cal.com · dub.co · documenso.com · formbricks.com · typebot.com (plain `GitHub` text link, no number) ·
coolify.io · **pocketbase.io (GitHub icon only, no count)** · penpot.app · plausible.io · ghost.org ·
getoutline.com · rallly.co · nocodb.com · directus.com · umami.is · excalidraw.com · papermark.com

### ⭐ The pattern splits almost perfectly by audience

- **Infrastructure/developer-tool products put the star count in the nav** (Trigger, Twenty, Appwrite, Infisical, n8n, Budibase, Novu, Supabase).
- **Products sold to non-developers do not** (Cal.com, Dub, Documenso, Ghost, Plausible, Outline, Rallly, Penpot) — even though several are famous open-source projects with huge counts.
- **Dub and Documenso are the tell: both are heavily "open source"-branded and both REMOVED the star counter as they matured.** Dub's 2022 site had one (§5.13).

**Two sites move the number out of the nav into a stats band instead:** nocodb.com (`62,000+` labelled
`Github Stars`) and trigger.dev (duplicates it in the body as `16k+ stars on GitHub`).

**Format conventions:** `16.0k`, `54.8K`, `56.9K`, `27k`, `27.5K` (abbreviated, one decimal) vs n8n's
`200,235` (exact, comma-separated — deliberately flexing precision at scale).

**Relevance to a zero-star project: a nav star counter is optional and audience-dependent.** The
projects targeting non-developers — which is our audience — mostly don't have one.

---

## 5.2 Contributor walls

**On marketing sites (rare):**

- **coolify.io/contributors** — a dedicated page. Heading verbatim: **"Contributors."** Intro: **"Meet the incredible developers who are building Coolify"**. Sub-sections "Top Coolify Contributors" / "All Coolify Contributors" / Docs Contributors. Coolify also has **"Contributors"** and **"Sponsor Us"** as _top-level nav items_. ⚠️ _Counts rendered as 0 in the fetch — data is client-side from the GitHub API; display format unverified._

**In READMEs (common) — `contrib.rocks` confirmed:**

- **Cal.com** — `### Contributors` + `<img src="https://contrib.rocks/image?repo=calcom/cal.diy" />` ⚠️ _(repo now renamed to cal.diy — see §0)_
- **Formbricks** — heading verbatim **"All Thanks To Our Contributors"** + contrib.rocks avatar grid
- **Documenso** — no avatar grid; embeds a **Repobeats activity graph**: `![Repository Activity](https://repobeats.axiom.co/api/embed/622a2e9aa709696f7226304b5b7178a5741b3868.svg)`
- **Coolify README** — no contributor grid; three sponsor tiers instead: **"Huge Sponsors"**, **"Big Sponsors"**, **"Small Sponsors"**
- **Appwrite README** — no contributor grid at all

---

## 5.3 Testimonials — verbatim, with attribution format

**cal.com** — full name + role + company:

> "More elegant than Calendly, more open than SavvyCal, Cal.com works and it feels just right." — **Flo Merian, Product Marketing, Mintlify**
> "I think Cal.com has a very good chance of creating a new category around being both great and well designed." — **Guillermo Rauch, CEO, Vercel**
> "I finally made the move to Cal.com after I couldn't find how to edit events in the Calendly dashboard." — **Ant Wilson, Co-Founder & CTO, Supabase**

**plausible.io** — name + role + company, sourced from Twitter/X:

> "We're massive users of Plausible here at Hugging Face." — **Clem Delangue, Co-founder and CEO at Hugging Face**
> "Check out Plausible if you haven't yet - fantastic product. We switched over everything from GA." — **John O'Nolan, Founder and CEO at Ghost**

**formbricks.com**:

> "We run NPS surveys for several products with Formbricks. It's open source and the team lays a strong focus on keeping user data secure and compliant" — **Marius Cristea, CTO @ ThemeIsle**
> "I've been looking for an open source XM solution for a while. Super happy to see Formbricks building it!" — **Peer Richelsen, Co-founder @ Cal.com**

**trigger.dev** — thinner attribution (name + company, no role):

> "Trigger.dev is redefining background jobs for modern developers." — **Paul Copplestone, Supabase**

**rallly.co** — mixes a named person with _publication_ endorsements, and **cites the source platform**:

> "If your scheduling workflow lives in emails, I strongly encourage you to try and Rallly simplify your scheduling tasks..." — **Eric Fletcher, Executive Assistant at MIT (via Trustpilot)**
> "Set up a scheduling poll in as little time as possible." — **PCMag**

**⭐ Convention observed:** the strongest testimonials are **peer founders/CTOs of other known
open-source projects** (Rauch, Copplestone, Richelsen, Delangue, Ant Wilson, DHH, Kent C. Dodds).
Attribution format is consistently **Name — Role, Company**. This is a reachable target for a new
project: OSS founders cross-endorse each other constantly (see Trigger.dev's 30-company wall in §1.13).

---

## 5.4 "Used by" logo walls — verbatim headings

| Site                | Verbatim heading                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| cal.com             | "Trusted by fast-growing companies around the world"                                               |
| documenso.com       | "Trusted by fast-growing companies around the world." _(same line, with full stop)_                |
| dub.co              | "Trusted by startups and enterprises" (as an `<h2>`)                                               |
| trigger.dev         | "Trusted by developers at companies all over the world"                                            |
| infisical.com       | "Trusted by the best teams in the world"                                                           |
| appwrite.io         | "Trusted by developer teams worldwide"                                                             |
| twenty.com          | "trusted by" _(lowercase)_ — logos then **"+10k others"**                                          |
| directus.com        | "Trusted by teams at"                                                                              |
| n8n.io              | "The world's most popular workflow automation platform for technical teams including"              |
| plus.excalidraw.com | "Trusted by the largest companies in the world" / "Trusted by the people" / "Loved by individuals" |
| formbricks.com      | **Logos with NO heading at all** (Themeisle, Siemens, Cal, FlixBus, GitHub, Ethereum, IKEA)        |

**Numeric "trusted by X" claims:**

- **papermark.com**: "TRUSTED BY 60,000+ GLOBAL COMPANIES"; "60,000+ dealmakers worldwide trust Papermark"; "Join 20 thousands of companies and employees who trust us" _(sic — grammatical error is verbatim)_
- **nocodb.com**: "Trusted by 35,000+ Organisations"
- **typebot.com**: "Trusted by 650+ companies worldwide"
- **budibase.com**: "Join 300K teams from SMEs to Govs"
- **twenty.com**: "+10k others"

---

## 5.5 Numeric social proof — 15 verbatim claims and whether they cite a source

| #   | Claim (verbatim)                                                                                                           | Site          | Source cited?                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------- |
| 1   | "TRUSTED BY 60,000+ GLOBAL COMPANIES"                                                                                      | papermark.com | No                                                         |
| 2   | "100,000+ customers"                                                                                                       | dub.co        | No                                                         |
| 3   | "2M+ monthly chats" / "1.5M+ bots published" / "3,000+ members on Discord"                                                 | typebot.com   | No                                                         |
| 4   | "3,641+ customers in the cloud"                                                                                            | coolify.io    | No _(oddly precise)_                                       |
| 5   | "20+ Million" Docker Downloads / "62,000+" Github Stars / "6,000+" Community Members                                       | nocodb.com    | **Implicitly verifiable** (Docker Hub, GitHub)             |
| 6   | "Join 300K teams from SMEs to Govs"                                                                                        | budibase.com  | No                                                         |
| 7   | "200k+ community members" and **"4.7/5 stars on G2"**                                                                      | n8n.io        | **Yes — G2 named**                                         |
| 8   | "199K+ registered users" / "300K+ polls created" / "10+ languages supported"                                               | rallly.co     | No                                                         |
| 9   | "Over 45 million downloads"                                                                                                | directus.com  | No                                                         |
| 10  | "20k" paying subscribers / "260B" tracked pageviews / "99.99%" uptime (last 90 days)                                       | plausible.io  | Uptime implicitly tied to their status page                |
| 11  | "$100,000,000+" earned yearly by publications on Ghost; "16,718 brand new publications got started with Ghost" (last week) | ghost.org     | No — but the oddly exact 16,718 reads as machine-generated |
| 12  | "We secure 10 Billion every day." / "99.99% availability"                                                                  | infisical.com | No                                                         |
| 13  | "1.5b messages just sent out in the last month"                                                                            | novu.co       | No                                                         |
| 14  | "over a million people" / "65+ languages" / "100+" integrations                                                            | cal.com       | No                                                         |
| 15  | "16k+ stars on GitHub" / "5k+ Discord members"                                                                             | trigger.dev   | Verifiable on GitHub                                       |

**⭐ Almost none cite a source.** Across 25 sites the _only_ explicit third-party citations found were
n8n's `4.7/5 stars on G2` and Rallly's `(via Trustpilot)`. **The most credible numbers are the
independently checkable ones** — GitHub stars, Docker pulls, Discord members — which anyone can
verify in one click. That asymmetry matters enormously for a project that has nothing to hide but
also nothing to show.

**Implementation detail:** directus.com ships its stats band as `0 M+ Downloads`, `0 K+ GitHub Stars`,
`0 K+ Projects Deployed`, `0 K+ Open Innovation Grants` in the _server_ HTML — they are **count-up
animations** that tick from zero on scroll.

---

## 5.6 ⭐ Security / trust pages — and the two models that matter for us

### Documenso's compliance matrix — the best artefact in this whole brief for a project with nothing yet

**URL:** `documenso.com/compliance`. It is a compliance matrix with **honest per-item status labels,
including admissions of what is not done:**

| Standard       | Status (verbatim)               |
| -------------- | ------------------------------- |
| U.S. ESIGN Act | "Status: Compliant"             |
| UETA           | "Status: Compliant"             |
| eIDAS - SES    | "Status: Compliant"             |
| 21 CFR Part 11 | "Status: Compliant"             |
| SOC 2          | "Status: Compliant"             |
| HIPAA          | "Status: Compliant"             |
| ISO 27001      | **"Status: Planned (2026)"**    |
| ZertES         | **"Status: Planned (2026)"**    |
| eIDAS - AES    | **"Status: Planned (H2 2026)"** |
| eIDAS - QES    | **"Status: Planned (H2 2026)"** |

**Documenso's wider trust posture** (they sell signatures, so this is existential):

- Homepage card labelled **"Open Company — Documenso is open source"**
- README frames open source **as** the trust mechanism: **"You can read, audit, run, and fork the code."**
- Trust centre at `https://documen.so/trust` (resolves 200)
- **security.txt** at `documenso.com/.well-known/security.txt`, verbatim:
  ```
  # General Issues
  Contact: https://github.com/documenso/documenso/issues/new?assignees=&labels=bug&projects=&template=bug-report.yml

  # Report critical issues privately to let us take appropriate action before publishing.
  Contact: mailto:security@documenso.com
  Preferred-Languages: en
  Canonical: https://documenso.com/.well-known/security.txt
  ```
- **SECURITY.md** headings: Security Policy → Reporting a Vulnerability → Triage and Response → Scope → Supported Versions. Verbatim: **"Do not open a public issue, discussion, or pull request for security reports."** / **"Include the affected version, a clear description, steps to reproduce, and the potential impact."**

### ⭐ Plausible's /security — the model for a company with ZERO certifications

21 headings, every claim a **checkable practice** rather than a badge: `Security Practices`, `TL;DR`,
`Data minimization`, `Personal data`, `Data encryption`, `Server location`, `Data ownership`, `Data
portability`, `Data deletion`, `User identification and authorization`, `Data sharing controls`,
`Internal access controls`, `Backups and disaster recovery`, `Subprocessors`, `Payment information`,
`Physical security`, `Availability and infrastructure monitoring`, **`You can audit our entire code
base`**, `Software quality assurance`, `Data privacy and legal documents`, `Reporting security
problems`, `Security questions or concerns?`.

Claims: "All data is encrypted in transit", "All visitor data is irreversibly hashed", "All visitor
data is hosted in the EU on EU-owned servers".
**No SOC 2, no ISO 27001, no pen-test claim, no bug bounty — and it still reads as credible**, because
every claim is a practice a reader can verify against the source code.

### Others, for reference

- **cal.com/security** — headings: Security → Compliance → How has this been accomplished? → What happens if something becomes out of compliance? → Procedures & controls → Vulnerability disclosure. References "ISO 27001, SOC 2 Type II, CCPA, GDPR, and HIPAA certifications"; offers downloadable DPA, SOC 2 Type II report, ISO 27001 cert and **penetration test report**.
- **formbricks.com/security** — verbatim: **"We are SOC 2 Type II compliant. This independent audit validates that our security, availability, and operational processes meet stringent industry standards."** and, honestly hedged: **"We are also actively pursuing ISO 27001 certification."** Plus "We conduct independent penetration tests annually, and also after major feature releases or infrastructure changes."
- **infisical** (docs/security) — **"Infisical undergoes penetration tests and vulnerability assessments twice a year"**, naming **Cure53** as the auditor.
- **supabase.com/.well-known/security.txt** — points to HackerOne (`hackerone.com/supabase`), lists out-of-scope issues, commits to **"respond within 5 business days"**, legal safe harbour for good-faith researchers, and public credit.
- **twenty.com** — a **"Trust Center"** link in the footer Legal column (`trust.twenty.com`). ⚠️ _page rendered only the heading "Trust center"; contents/vendor unverified._
- ⚠️ **trust.cal.com does not resolve** (`ENOTFOUND`).

---

## 5.7 Uptime / status pages

- **status.cal.com** — **openstatus.dev**. Status line verbatim: **"Operational · Aug 11, 2026 20:52 (GMT+0)"**. Components: App **99.99%**, Website **99.99%**, API **100%**.
- **status.supabase.com** — **Atlassian Statuspage**. "All Systems Operational". Components: Compute capacity (17 regional endpoints), Analytics, API Gateway, Auth, Connection Pooler, Dashboard, Database, Edge Functions, Management API, Realtime, Storage.
- **⭐ plausible.io puts uptime on the marketing page itself** — "99.99%" (last 90 days) sits in the stats row next to "20k" subscribers and "260B" pageviews, rather than hidden behind a status subdomain.

⚠️ Footer-link placement for status pages was not exhaustively audited across all 25 sites.

---

## 5.8 Licence clarity — WHERE on the page it appears

- **trigger.dev** — in a homepage stats/feature band: **"Apache 2.0 open source license"**, adjacent to "16.0k | Open source". _The only site naming a licence near the top of the marketing page._
- **cal.com** — **"License"** is a footer link under a **Legal** column
- **plausible.io/about** — **"Plausible is open source under the GNU Affero General Public License Version 3 (AGPLv3)."** and **"Our source code is publicly available and can be inspected, reviewed and verified at any time."** On the _product_ pages the licence name is **dropped in favour of the benefit**: "The code is public and auditable. Verify exactly what we collect, and run it yourself if you want to."
- **supabase.com** — section heading **"Open source from day one"**, body: **"Supabase is built in the open because we believe great developer tools should be transparent, inspectable, and owned by the community. Read, contribute, self-host. You're never locked in, and always in control."** _No licence name on the homepage._
- **ghost.org** — **"Ghost is open source, independent, and funded 100% by its users. No investors. No bullshit."** + footer badges "Non-Profit Foundation", "Open Source", "Carbon Neutral"
- **umami.is** — tagline "Simple, Privacy-friendly, Open source"; "Self-host the open-source platform on your own infrastructure, or use Umami Cloud. Either way, your data is never sold or shared." _No licence name._
- **twenty.com** — no licence statement on the homepage. FAQ: **"Is Twenty really open-source?"** → "Twenty is the #1 Open Source CRM on GitHub. You can self-host to fully own your infrastructure, or run it on our managed cloud for a zero-ops setup."
- **directus.com** — only "Copyright © 2026 Monospace Inc. All rights reserved." _No licence on the marketing page._
- **READMEs:** Formbricks "The Formbricks core application is licensed under the AGPLv3 Open Source License." · Appwrite "This repository is available under the [BSD 3-Clause License](./LICENSE)." · Documenso badge `license-AGPLv3-purple`

**⭐ Pattern: the licence NAME lives in the README badge row or a footer link, not the hero. The
hero-adjacent statement is a BENEFIT sentence** — "you're never locked in", "run it yourself if you
want to", "read, audit, run, and fork the code". Given §0 (Cal.com's relicensing), a _permanence
commitment_ may now be worth more than the licence identifier.

---

## 5.9 Open startup / transparency pages

**cal.com/open** — verbatim: **"Our KPIs are public"** and **"Cal.com, Inc. is an Open Startup, which
means it operates fully transparent and shares its salaries and core metrics."** Current tagline:
**"The most public private company."** Categories: salaries, core metrics, open company handbook.
Footer places "Open Startup" under Resources. ⚠️ _metric values load from an embedded dashboard —
framing verbatim, numbers not captured._

**documenso.com/open** — intro verbatim: **"All our metrics, finances, and learnings are public. We
believe in transparency and want to share our journey with you."** Published metric categories:
Total Forks · Total Open Issues · **Stars** · Merged PRs · Growth · New Users · Total Users · Total
Customers · **Signers who signed up** · Total signers who signed up · **Completed Documents per
Month** · Total Completed Documents. Links to an "Announcing Open Metrics" blog post.

**⚠️ Plausible has NO `/open-startup` page.** A Wayback CDX query for `plausible.io/open-startup`
returned **zero snapshots ever**. Their transparency lives on **plausible.io/about**:

> "Uku Taht started Plausible in December 2018, building it alone as a simple privacy-friendly alternative to Google Analytics."
> "Plausible crossed $1 million in annual recurring revenue in 2022"
> "More than 20,000 paying subscribers use Plausible"
> "Today Plausible is a team of 10"
> "We are self-funded and profitable, with no outside investors and no plans to sell."
> "Subscription revenue is the only revenue we have."
> "We have never spent a cent on advertising, affiliates or paid endorsements."

---

# ⭐⭐ PART B — THE ZERO-SOCIAL-PROOF PLAYBOOK (five verified early snapshots)

**This is the most directly applicable material in the entire research file.** Five archived
homepages, from before any of these projects had social proof, retrieved via
`curl https://web.archive.org/web/<timestamp>id_/<url>`.

---

## 5.10 Documenso — snapshot `20221229124136` (**29 December 2022, 12:41:36 UTC**)

<https://web.archive.org/web/20221229124136/https://documenso.com/>

**A pure pre-launch page with literally zero social proof of any kind — no stars, no logos, no
testimonials, no user count, not even a waitlist number.** Documenso now sells trust-critical
e-signatures to enterprises. This is where it started.

**Full content, verbatim, in order:**

- Title tag: **"Documenso - The Open Source DocusSign Alternative"** _(sic — "DocusSign")_
- **Hero: "The DocuSign Open Source Alternative."**
- Hero sub: **"Documenso aims to be the world's most trusted document signing tool. This trust is built by empowering you to self-host Documenso and review how it works under the hood. Join us in creating the new internet of trust."**
- CTA block: **"Join the movement."** / **"Sign up to be among the first to get exclusive early access."**
- Section: **"Powerful, open signing tools"** — _"Documenso allows you to use state of the art document signing with minimal hassle. Open and extendable for everyone."_
- Three feature cards (**repeated twice** on the page):
  - **"Fast"** — "Signing digitally is fast. Really fast."
  - **"Open and Trusted"** — "Documenso is open and will stay open. This means you can host your own version and even build on top of it. Completely free. Join a community of like-minded document signing fans and become a provider of trust."
  - **"Shiny"** — "Not just easy, but beautiful. Too many open signing solutions look and feel like complicated developer tools. Documenso aims to be really easy to use for everybody."
- **"Frequently asked questions"** — _"If you have any questions, you are welcome to reach to hi@documenso.com."_ **The FAQ IS the trust section:**
  - _"Why should i prefer Documenso over DocuSign or some other signing tool?"_ → **"Documenso is a community effort to create an open and vibrant ecosystem around a tool, everybody is free to use and adapt. By beeing truly open we want to create trusted infrastructure for the future of the internet."**
  - _"Can i use Documenso commercially?"_ → **"Yes! Documenso will be offered under GNU AGPL V3 or a similar open source license."**
  - _"When will Documenso be launched?"_ → **"The launch is planned for 2023. Just sign up and we will keep you posted."**
  - _"Who can contribute?"_ → **"Since we are still in th early phases we need all kinds of people from user to tester and developers. If you want to be a part of our journey let us know, help is always appreciated."**
- Footer: **"Copyright © 2022 Venturo UG | HRB 165716. All rights reserved."** / "Questions: hi@documenso.com" / **"Made with ☔ in Hamburg."**

**Section order:** hero → email capture → feature triptych → feature triptych (repeat) → email capture
(repeat) → FAQ → footer. **No proof section exists at all.**

**Note the typos** ("DocusSign", "i", "beeing", "th early"). This shipped rough and it did not stop them.

**Substitutes used:** a named legal entity + registration number (`Venturo UG | HRB 165716`), a real
human email in the body, a physical location ("Made with ☔ in Hamburg"), a named future licence, a
stated launch date, and an explicit invitation to contribute.

---

## 5.11 ⭐ Supabase — snapshot `20200310080644` (**10 March 2020, 08:06:44 UTC**)

<https://web.archive.org/web/20200310080644/https://supabase.io/>

**The single most useful find in this research: Supabase shipped a homepage section displaying a
repo with SIX stars.**

- **Nav (complete): `Docs` · `Guides` · `GITHUB →`** — a text link, **no star count**
- **Hero: "realtime postgres."**
- Hero sub: **"Supabase adds realtime and RESTful APIs to your existing PostgreSQL database without a single line of code."**
- CTAs: **`Learn More`** and **`Follow our GitHub →`**
- **Immediately below the hero: a working code sample**, captioned **"Get notified of all new records in your database"**
- Section order: hero + code sample → "How it works" (_"Supabase helps you build faster, so you can focus on your core products."_) → "For Developers" → "Use Cases" (Chat apps, Realtime dashboards, Logging, Realtime Games, Streaming analytics, Backoffice and Admin) → "Self-documenting" → **"Open source"** → footer
- **The "Open source" section, verbatim: "Follow us on GitHub. Watch the releases of each repo to get notified when we are ready for Beta launch."** followed by a repo list with **honest, tiny star counts:**

| Repo                     | Description shown                                                                      | Stars shown |
| ------------------------ | -------------------------------------------------------------------------------------- | ----------- |
| `@supabase/supabase`     | "Website, docs, and client libraries. Follow to stay updated about our public Beta."   | **75 ★**    |
| `@supabase/realtime`     | "Listen to your to PostgreSQL database in realtime via websockets. Built with Elixir." | **373 ★**   |
| `@supabase/schemas`      | "An opensource repository of PostgreSQL schemas to get your projects started."         | **6 ★**     |
| `@supabase/postgrest-js` | "Isomorphic JavaScript client for PostgREST"                                           | **25 ★**    |

- Footer: Company / Docs / Guides / Opensource / Humans / Community / GitHub / Twitter / DevTo. "Copyright © 2020 Supabase."
- **Zero testimonials. Zero customer logos. Zero user counts.** The product was **not even in beta** — the page's own words: _"when we are ready for Beta launch."_

**⭐ THE TAKEAWAY: Supabase put a 6-star repo on its homepage, framed not as popularity but as
"watch this to get notified". The star count was recast from a bragging metric into a SUBSCRIPTION
MECHANISM.** Two months later their HN post hit 1,120 points (§6.1).

---

## 5.12 ⭐ Plausible — snapshot `20190722082333` (**22 July 2019, 08:23:33 UTC**)

<https://web.archive.org/web/20190722082333/https://plausible.io/>
_(earliest HTTP 200 snapshot of plausible.io in the Wayback index)_

**The hero IS the product's own live dashboard, showing genuinely tiny real numbers:**

> **Top Referrers** _(by visitors)_ — indiehackers.com **30** · Twitter **17** · Google **6** · DuckDuckGo **4** · Bing **2**
> **Top Countries** _(by visitors)_ — United Kingdom **41** · United States **38** · France **13** · India **7** · Netherlands **6**

**Roughly 100 visitors, displayed in the hero, unedited.**

- **Nav (complete): `Login` · `Start free trial`** — that is all. No GitHub, no stars.
- **Hero: "Simple analytics for your website"**
- Hero sub: **"Plausible is a lightweight, non-intrusive alternative to Google Analytics"**
- CTAs: **`Start free trial`** and **`View live demo`** _(the demo CTA was there from day one)_
- **Section order, verbatim:**
  1. **"Why Plausible?"** — _"Plausible is built by and for privacy-conscious minimalists"_ / _"Here's what makes it different from other solutions"_ → three cards: **"Clutter-free"**, **"Anonymous"**, **"Lightweight"** (the last with a checkable claim: _"Our script is 14x smaller, making your website quicker to load."_)
  2. **"Check out our analytics"** → **`View live demo →`**
  3. **"Simple, traffic based pricing"** / _"Try Plausible free for 30 days"_ — full price table (Personal 10k/$6, Startup 100k/$12, Business 1m/$36) + _"No credit card required up front. Cancel anytime."_
  4. **Manifesto — "If you're not paying for the product, you are the product"** → _"Plausible does not sell your data or use it to follow people around with ads. Instead, we ask a small monthly fee to keep the servers running."_
  5. **"What people are saying"** — 3 testimonials attributed with **name + Twitter handle only** — no company, no photo, no title:
     - _"Plausible is focused on exactly what I need: clear insights into my site visitors, without getting in my way"_ — **Felipe Sere, @felipesere**
     - _"All the stats you need in a single page. Plausible's user experience and user interface are the stark opposite of Google Analytics."_ — **Makis Otman, @makisotman**
     - _"I love Plausible because it is lightweight and looks beautiful. It shows me all the statistics that I need in a simple and unique style."_ — **Markus Schranz, @ma_schranz**
  6. **"Frequently asked questions"** — 3 questions, ending with **"Ask a question from the founder"**
- Footer: **"Made by @ukutaht in London, UK"**, then: "Read our Blog", "Study the Documentation", "Check out the Live Demo", "Give us Feedback", **"We have a Public roadmap"**, "Contact us via email"
- **Zero customer logos. Zero user/customer counts. Zero GitHub stars.**

_(Compare to today: "20k paying subscribers", "260B pageviews", logo wall, named CEOs of Hugging Face and Ghost.)_

**Substitutes used:** live demo (twice), full transparent pricing, a values manifesto, a named solo
founder with a real city, a **public roadmap**, "ask a question from the founder", and three
testimonials from ordinary people identified only by Twitter handle.

---

## 5.13 ⭐ Dub — snapshot `20220922143755` (**22 September 2022, 14:37:55 UTC**)

<https://web.archive.org/web/20220922143755/https://dub.sh/>

**Dub shipped a star counter reading effectively zero, and used its own product as the demo.**
_(This is the same day as its 255-point Show HN — see §6.1.)_

- **Nav (complete): `Sign in`.** That is the entire nav.
- Hero badge: **"Introducing Dub.sh"**
- **Hero: "Open Source Bitly Alternative"**
- Hero sub: **"Dub is an open-source link shortener with built-in analytics and free custom domains."**
- CTAs: **`Start For Free`** and **`Star on GitHub`** — _the "Star on GitHub" CTA is in the HERO, not the nav_
- **Then a live product demo using its own link:** a real-time click map on `dub.sh/github`, captioned verbatim: **"This map shows the locations of the last 30 clicks on dub.sh/github in real time."** with **`View all stats`**. The demo link is `https://github.com/steven-tey/dub` — **i.e. the demo data IS people clicking through to the repo.**
- Section: **"Fast. Powerful. Open source."** → _"With Dub, you get the best of both worlds: a powerful link shortener with built-in analytics, and the freedom to host it yourself."_
- Sub-features: "Built-in analytics" (with a **`View demo`** link), "Free custom domains" (with **`Create your project`**)
- Section: **"Proudly open source"** → **"Our source code is available on GitHub – feel free to read, review, or contribute to it however you want!"** followed by a **`Star on GitHub`** widget rendering **`Star`** and a count of **`0`**
- **⭐ The page's own SSG payload contains the true value:** `{"props":{"pageProps":{"stars":3},"__N_SSG":true},"page":"/"…}` — **three stars.**
- Section: **"Simple, affordable pricing"** — _"Start for free, no credit card required. Upgrade anytime."_
- **Zero testimonials. Zero customer logos. Zero user counts. Zero waitlist number.**

**Section order:** hero + link-shortener input → live real-time demo map → feature explainer →
"Proudly open source" + star button → pricing → footer.

---

## 5.14 PocketBase — snapshot `20220707142135` (**7 July 2022, 14:21:35 UTC**)

<https://web.archive.org/web/20220707142135/https://pocketbase.io/> · version **v0.1.0**

- **Nav (complete): `PocketBase v0.1.0` · `FAQ` · `Discussions` · `Support us` · `Documentation`.** No star count.
- **Hero: "Open Source backend for your next SaaS and Mobile app in 1 file"** + four capability tags: Realtime database · Authentication · File storage · Admin dashboard
- CTAs: **`Live demo`** and **`Read the documentation`** _(demo as primary, from v0.1.0)_
- Section: "Ready to use out of the box" → four cards → **`Explore all features`**
- **Then a full JavaScript SDK code sample** with real API calls (`client.Records.getList("demo", 1, 100, {filter: "title != '' && totalComments > 10", sort: "-created,title"})`) — **the code IS the proof**
- Section: "Integrate nicely with your favorite frontend stack"
- Footer: FAQ / Discussions / Support us / Documentation / JavaScript SDK, "© 2022 PocketBase", **"Crafted by Gani"**
- **Zero testimonials, zero logos, zero counts, zero stars.**

**⭐ And today's pocketbase.io still has none of these** — four years and ~50k stars later, the nav
is still a GitHub icon with no number. **The strongest counter-example to "you need social proof".**

---

## 5.15 ⭐⭐ What all five early sites had in common — no exceptions

1. **Led with a positioning line naming a known incumbent.** "The DocuSign Open Source Alternative", "Open Source Bitly Alternative", "alternative to Google Analytics", "Open Source backend in 1 file". **Borrowed _category_ credibility instead of borrowed _social_ credibility.**
2. **Put a demo or real code above the fold.** Plausible's own dashboard, Dub's real-time click map, Supabase's code sample, PocketBase's SDK snippet + `Live demo` CTA. **Four of five used demo-as-proof.**
3. **Published pricing openly** (Plausible, Dub) — **pricing transparency substitutes for customer proof.**
4. **Named a real human and a real place.** "Made by @ukutaht in London, UK" · "Made with ☔ in Hamburg" + `Venturo UG | HRB 165716` · "Crafted by Gani" · `github.com/steven-tey/dub`.
5. **Offered a way to follow the journey rather than a claim about the present.** "Watch the releases of each repo to get notified when we are ready for Beta launch" (Supabase) · "Sign up to be among the first to get exclusive early access" (Documenso) · "We have a Public roadmap" (Plausible) · "Support us" / "Discussions" (PocketBase).
6. **Used the FAQ as the trust section.** Documenso's entire credibility argument lives in its FAQ; Plausible's ends with "Ask a question from the founder".
7. **Where a number WAS shown, it was shown honestly and tiny.** Supabase's 6 stars, Dub's 3, Plausible's 30-visitor referrer chart. **None inflated, rounded up, or hid the number. They reframed it (subscribe, contribute) rather than fake it.**
8. **None used a customer logo wall.** Not one of the five.

---

## 5.16 ⚠️ What is legally and reputationally risky — the FTC rule

The **FTC Final Rule on the Use of Consumer Reviews and Testimonials (16 CFR Part 465)**, announced
**14 August 2024**, is directly on point.
Source: <https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials>

Verbatim, the rule prohibits:

> **"Fake or False Consumer Reviews, Consumer Testimonials, and Celebrity Testimonials:** The final rule addresses reviews and testimonials that misrepresent that they are by someone who does not exist, such as AI-generated fake reviews, or who did not have actual experience with the business or its products or services, or that misrepresent the experience of the person giving it. It prohibits businesses from creating or selling such reviews or testimonials. It also prohibits them from buying such reviews, procuring them from company insiders, or disseminating such testimonials, when the business knew or should have known that the reviews or testimonials were fake or false."

> **"Insider Reviews and Consumer Testimonials:** The final rule prohibits certain reviews and testimonials written by company insiders that fail to clearly and conspicuously disclose the giver's material connection to the business. It prohibits such reviews and testimonials given by officers or managers."

> **"Misuse of Fake Social Media Indicators:** The final rule prohibits anyone from selling or buying fake indicators of social media influence, such as followers or views generated by a bot or hijacked account. This prohibition is limited to situations in which the buyer knew or should have known that the indicators were fake and misrepresent the buyer's influence or importance for a commercial purpose."

> **"Company-Controlled Review Websites:** The final rule prohibits a business from misrepresenting that a website or entity it controls provides independent reviews or opinions about a category of products or services that includes its own products or services."

Enforcement teeth, verbatim: the rule allows the agency to _"seek civil penalties against knowing
violators"_; approved **5–0**; effective _"60 days after the date it's published in the Federal
Register."_ FTC Chair Lina M. Khan: **"Fake reviews not only waste people's time and money, but also
pollute the marketplace and divert business away from honest competitors."**

**Concretely, for a zero-proof project this makes the following UNSAFE:**

- Any testimonial from a person who is not a real user — including a plausible invented persona with a stock photo.
- A testimonial from the founder, a co-founder, an employee or a friend **without conspicuously disclosing the connection** — the "Insider Reviews" clause names officers and managers specifically.
- **Buying GitHub stars, followers or Discord members** — squarely inside "fake indicators of social media influence". (See also §6.6 on the fake-star market and its measured 2-month half-life.)
- Running a "comparison" or "best X tools" site you control that ranks your own product without disclosing ownership.

**On customer logo walls specifically:** the FTC rule governs reviews/testimonials and fake influence
indicators; it does **not** directly govern logo use. The distinct risk there is **trademark law and
implied endorsement** — displaying a company's mark implies a commercial relationship (see §3.15).

⚠️ **UNRESEARCHED:** specific named incidents of companies caught using unlicensed customer logos or
fabricated testimonials. The web-search budget was exhausted. **The FTC rule text above is fully
verified; the incident history is not.** Treat as "not researched", not "none found".

**The practical asymmetry:** a fake logo wall or invented testimonial is _cheap to fabricate and
cheap to check_. A developer audience will search the named company + your product, find nothing,
and the credibility loss is total and permanent — while the upside was a logo strip they scrolled
past. **Every one of the five early sites in §5.10–5.14 declined that trade.**

---

## 5.17 ⭐ Honest substitutes, each with a verified example

| Substitute                                                                     | Verified example                                                                       | Verbatim                                                                                                                                                                                           |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Demo as proof**                                                              | Plausible 2019, Dub 2022, PocketBase 2022, Supabase 2020                               | "View live demo →" / "This map shows the locations of the last 30 clicks on dub.sh/github in real time." / "Live demo"                                                                             |
| **Show your own real (tiny) numbers**                                          | Plausible 2019 hero                                                                    | Referrers: indiehackers.com **30**, Twitter **17**, Google **6**, DuckDuckGo **4**, Bing **2**                                                                                                     |
| **Tiny star count, honestly displayed**                                        | Supabase 2020, Dub 2022                                                                | `@supabase/schemas — 6 ★`; `pageProps: {"stars":3}`                                                                                                                                                |
| **Star count reframed as a SUBSCRIPTION**                                      | Supabase 2020                                                                          | "Watch the releases of each repo to get notified when we are ready for Beta launch."                                                                                                               |
| **"Be among the first" waitlist, with NO count**                               | Documenso 2022                                                                         | "Join the movement." / "Sign up to be among the first to get exclusive early access."                                                                                                              |
| **Public roadmap**                                                             | Plausible 2019 footer                                                                  | "We have a Public roadmap"                                                                                                                                                                         |
| **Changelog as ongoing proof of life**                                         | trigger.dev, formbricks.com, appwrite.io, coolify.io — all have `Changelog` in the nav | formbricks banner: "Changelog: Formbricks 5.0 is here. See what's new."                                                                                                                            |
| **Founder story / why-we-built-this**                                          | plausible.io/about                                                                     | "Uku Taht started Plausible in December 2018, building it alone…" / "We are self-funded and profitable, with no outside investors and no plans to sell."                                           |
| **Named founder + real location + legal entity**                               | Plausible 2019, Documenso 2022, PocketBase 2022                                        | "Made by @ukutaht in London, UK" / "Copyright © 2022 Venturo UG \| HRB 165716" + "Made with ☔ in Hamburg." / "Crafted by Gani"                                                                    |
| **FAQ doing the trust work**                                                   | Documenso 2022                                                                         | "Why should i prefer Documenso over DocuSign…?" → "…By beeing truly open we want to create trusted infrastructure for the future of the internet."                                                 |
| **Transparent pricing shown immediately**                                      | Plausible 2019, Dub 2022                                                               | "No credit card required up front. Cancel anytime." / "Start for free, no credit card required. Upgrade anytime."                                                                                  |
| **Values / manifesto section**                                                 | Plausible 2019                                                                         | "If you're not paying for the product, you are the product"                                                                                                                                        |
| **Auditability as the trust claim**                                            | plausible.io/security, supabase.com, documenso README                                  | "You can audit our entire code base" / "transparent, inspectable, and owned by the community" / "You can read, audit, run, and fork the code."                                                     |
| **Security PRACTICES instead of certification badges**                         | plausible.io/security                                                                  | 21 headings of concrete practices, **zero** SOC 2 / ISO / pen-test claims — still credible                                                                                                         |
| **Honest compliance matrix including "not yet"**                               | documenso.com/compliance                                                               | `ISO 27001 — Status: Planned (2026)` alongside the Compliant rows                                                                                                                                  |
| **Direct line to a human**                                                     | Plausible 2019, Documenso 2022                                                         | "Ask a question from the founder" / "you are welcome to reach to hi@documenso.com"                                                                                                                 |
| **Public build surface**                                                       | Documenso 2022, PocketBase 2022, Coolify                                               | "Who can contribute? Since we are still in th early phases we need all kinds of people from user to tester and developers." / nav: `Discussions`, `Support us` / nav: `Contributors`, `Sponsor Us` |
| **Contributor wall as a site page**                                            | coolify.io/contributors                                                                | "Contributors." / "Meet the incredible developers who are building Coolify"                                                                                                                        |
| **security.txt + SECURITY.md** — costs nothing, signals seriousness on day one | documenso.com/.well-known/security.txt                                                 | (full file quoted in §5.6)                                                                                                                                                                         |

---

# 6. LAUNCH TACTICS — primary HN data

_(Section 6 is split in two: **§6** is the primary HN dataset gathered first-hand; **§6b** adds the
parallel research stream — verified item IDs, base rates, timing analyses, funded retrospectives,
licence-backlash data, fake-star economics and the awesome-selfhosted path.)_

All data pulled directly from the **Hacker News Algolia API** (`hn.algolia.com/api/v1/search`),
which returns exact titles, points, comment counts and timestamps. This is gold-standard evidence.

## 6.1 Launch posts for the studied projects — verbatim titles and real numbers

| Project                                        | Verbatim HN title                                                                  | Points   | Comments | Date       | URL                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- | -------- | -------- | ---------- | ----------------------- |
| **Supabase**                                   | "Supabase (YC S20) – An open source Firebase alternative"                          | **1120** | 366      | 2020-05-27 | supabase.io             |
| **Trigger.dev**                                | "Show HN: We built a developer-first open-source Zapier alternative"               | **745**  | 190      | 2023-02-01 | trigger.dev             |
| **PocketBase**                                 | "Show HN: PocketBase – Open Source realtime backend in one file"                   | **563**  | 111      | 2022-07-07 | github.com/pocketbase   |
| **PocketBase** _(later repost, not by author)_ | "Pocketbase: Open-source back end in one file"                                     | **630**  | 149      | 2024-01-07 | pocketbase.io           |
| **PocketBase** _(later repost)_                | "Pocketbase – open-source realtime back end in 1 file"                             | **671**  | 204      | 2025-11-28 | pocketbase.io           |
| **NocoDB**                                     | "Show HN: NocoDB – Open-Source Airtable Alternative"                               | **562**  | 157      | 2021-05-27 | github.com/nocodb       |
| **Chatwoot**                                   | "Launch HN: Chatwoot (YC W21) – Open-Source Alternative to Intercom, Zendesk"      | **396**  | 110      | 2021-03-18 | chatwoot.com            |
| **Coolify**                                    | "Show HN: Coolify v2 – Open-source and self-hostable Heroku/Netlify alternative"   | **158**  | 54       | 2022-03-30 | coolify.io              |
| **Coolify** _(3 yrs later, repost)_            | "Coolify: Open-source and self-hostable Heroku / Netlify / Vercel alternative"     | **382**  | 180      | 2025-04-02 | coolify.io              |
| **Coolify** _(original v1)_                    | "Show HN: An open-source, self-hostable Heroku and Netlify alternative"            | **345**  | 116      | 2021-03-29 | coollabs.io/coolify     |
| **Appwrite**                                   | "Show HN: Appwrite – Open-Source and Self Hosted Firebase Alternative"             | **326**  | 118      | 2022-03-22 | github.com/appwrite     |
| **Payload CMS**                                | "Launch HN: Payload (YC S22) – Headless CMS for Developers"                        | **242**  | 137      | 2022-08-31 | payloadcms.com          |
| **Jitsu**                                      | "Launch HN: Jitsu (YC S20) – Open-Source Segment Alternative"                      | **265**  | 110      | 2021-11-04 | jitsu.com               |
| **Porter**                                     | "Launch HN: Porter (YC S20) – Open-source Heroku in your own cloud"                | **239**  | 74       | 2021-04-30 | getporter.dev           |
| **Activepieces**                               | "Launch HN: Activepieces (YC S22) – Open-Source Zapier Alternative"                | **231**  | 62       | 2023-02-09 | activepieces.com        |
| **Infisical**                                  | "Infisical – open-source HashiCorp Vault alternative" _(not a Show HN)_            | **284**  | 105      | 2023-08-11 | github.com/Infisical    |
| **Infisical**                                  | "Show HN: Infisical – open-source secrets manager"                                 | **232**  | 97       | 2022-12-19 | github.com/Infisical    |
| **Infisical**                                  | "Launch HN: Infisical (YC W23) – Open-source secrets manager for developers"       | **231**  | 121      | 2023-02-27 | github.com/infisical    |
| **Infisical**                                  | "Show HN: Infisical – open-source secret management platform"                      | **131**  | 58       | 2023-07-19 | infisical.com           |
| **Infisical**                                  | "Show HN: Infisical – open-source secrets manager for developers"                  | **103**  | 30       | 2023-01-24 | infisical.com           |
| **Novu**                                       | "Novu – Service for managing multi-channel notifications with a single API"        | **160**  | 24       | 2022-12-26 | github.com/novuhq       |
| **Formbricks**                                 | "Show HN: Formbricks – Open-source alternative to Typeform and Sprig"              | **155**  | 39       | 2023-10-31 | github.com/formbricks   |
| **Postcard**                                   | "Show HN: Postcard – Easy way to make a personal website"                          | **140**  | 88       | 2022-11-10 | postcard.page           |
| **Webiny**                                     | "Launch HN: Webiny (YC W21) – Open-source serverless framework with a drop-in CMS" | **100**  | 46       | 2021-03-11 | webiny.com              |
| **Typebot**                                    | "Typebot: A conversational form builder that you can self-host" _(not a Show HN)_  | **77**   | 8        | 2022-03-26 | github.com/baptisteArno |
| **Papermark**                                  | "Show HN: Papermark – the open-source DocSend alternative with custom domains"     | **35**   | 15       | 2023-10-23 | papermark.io            |
| **Documenso**                                  | "Documenso: The DocuSign Open Source Alternative"                                  | **3**    | 1        | 2023-06-01 | documenso.com           |
| **Excalidraw**                                 | "Show HN: Excalidraw – Sketch Hand-Drawn Like Diagrams"                            | **30**   | 6        | 2020-01-25 | github.com/excalidraw   |
| **Excalidraw** _(later)_                       | "Excalidraw whiteboard – easily sketch diagrams with a hand-drawn feel"            | **241**  | 54       | 2020-06-15 | github.com/excalidraw   |
| **Excalidraw** _(later still)_                 | "Why is Excalidraw so good?" _(third-party blog post)_                             | **738**  | 267      | 2021-11-04 | offbyone.us             |

**Generic "open-source alternative" Show HNs, for title-formula reference:**

| Verbatim title                                                                     | Points | Comments | Date       |
| ---------------------------------------------------------------------------------- | ------ | -------- | ---------- |
| "Show HN: Restfox – Open source lightweight alternative to Postman"                | 758    | 182      | 2022-10-21 |
| "Show HN: Files.md – Open-source alternative to Obsidian"                          | 730    | 356      | 2026-05-18 |
| "Show HN: HyperDX – open-source dev-friendly Datadog alternative"                  | 722    | 163      | 2023-09-18 |
| "Show HN: BookStack – An open source wiki platform and alternative to Confluence"  | 562    | 198      | 2022-01-08 |
| "Show HN: OpenSign – Open source alternative to DocuSign"                          | 545    | 160      | 2023-10-28 |
| "Show HN: SigNoz – open-source alternative to DataDog, NewRelic"                   | 510    | 132      | 2022-10-01 |
| "Show HN: Pangolin – Open source alternative to Cloudflare Tunnels"                | 500    | 125      | 2025-07-10 |
| "Show HN: I'm working on a open-source, self-hosted alternative to Disqus"         | 436    | 167      | 2021-04-20 |
| "Show HN: Open-source alternative to Retool, Internal.io, etc."                    | 429    | 68       | 2021-06-07 |
| "Show HN: Open-source alternative to Retool"                                       | 420    | 115      | 2022-11-14 |
| "Show HN: Open-Source Alternative to Intercom, Drift, Zendesk, FreshChat"          | 417    | 79       | 2019-11-17 |
| "Show HN: OpenKnowledge – open source AI-first alternative to Obsidian/Notion"     | 381    | 173      | 2026-06-25 |
| "Show HN: Ladder, open source alternative to 12ft.io and 1ft.io"                   | 377    | 150      | 2023-11-06 |
| "Show HN: Medusa – Open-source alternative to Shopify"                             | 373    | 80       | 2021-09-10 |
| "Show HN: I made an open-source Loom alternative"                                  | 351    | 177      | 2024-05-12 |
| "Show HN: Void, an open-source Cursor/GitHub Copilot alternative"                  | 347    | 154      | 2024-09-17 |
| "Show HN: Openkoda – Open–source, private, Salesforce alternative"                 | 318    | 111      | 2024-05-28 |
| "Show HN: Automatisch – Open source workflow automation, an alternative to Zapier" | 317    | 58       | 2023-01-25 |
| "Show HN: Someday, Open-Source Calendly Alternative for Gmail / Google App Script" | 313    | 51       | 2024-11-02 |
| "Show HN: Sourcebot, an open-source Sourcegraph alternative"                       | 259    | 59       | 2024-10-01 |
| "Show HN: I made an open-source Bitly alternative" (= **Dub**)                     | 255    | 207      | 2022-09-22 |

## 6.2 What the HN numbers actually say

1. **The "open-source alternative to X" title formula is overwhelmingly dominant on HN and it
   works.** Of the 21 generic examples above, every single one clears 250 points. This is the
   opposite of the homepage finding in §2.3 — **HN wants the comparison, homepages don't.**

2. **The first-person framing performs.** "Show HN: **I made** an open-source Loom alternative"
   (351), "**I made** an open-source Bitly alternative" (255), "**I'm working on** a open-source,
   self-hosted alternative to Disqus" (436). Modesty + personal authorship reads as authentic.

3. **⚠️ The launch is very often NOT the peak — this is the most encouraging finding for a new project.**
   - **Excalidraw**: first Show HN = **30 points** (Jan 2020). Five months later a plain URL post = 241. Twenty-two months later a third-party blog post = **738**. Excalidraw now has **129.3k
     stars**. _A 30-point Show HN did not stop it._
   - **Coolify**: Show HN v1 = 345 (2021), v2 = 158 (2022) — then a plain repost in 2025 = **382**,
     and a _third-party tutorial_ ("Beginner Guide to VPS Hetzner and Coolify") = **306**.
   - **PocketBase**: original Show HN 563 → reposts by others got **630** and **671** later.
   - **Papermark**: Show HN = **35 points**. Papermark is now SOC 2 Type II / ISO 27001 certified
     with "4.9/5 across 171 reviews".
   - **Documenso**: _every_ HN post scored 1–4 points. Documenso raised money and shipped an
     enterprise product anyway.
     **Conclusion: HN is a lottery ticket, not a requirement.** Several of the studied projects
     succeeded with essentially zero HN traction.

4. **Reposting works and is normal.** Infisical has **five** separate HN posts (103, 131, 231, 232, 284) across 8 months. The _best-performing_ one was **not** a Show HN and came **8 months after**
   the first. HN's own rules permit reposts of stories that didn't get attention.

5. **The best-performing posts are frequently written by third parties**, not the maintainer:
   "Why is Excalidraw so good?" (738), "Coolify's rise to fame, and why it could be a big deal"
   (172), "Beginner Guide to VPS Hetzner and Coolify" (306). **Being _written about_ beats
   _announcing_.**

6. **YC's "Launch HN" is a separate, privileged format** (Chatwoot 396, Jitsu 265, Payload 242,
   Porter 239, Activepieces 231, Infisical 231, Webiny 100). Not available to non-YC projects.

## 6.3 Show HN rules — verbatim (<https://news.ycombinator.com/showhn.html>)

> "Show HN is for something you've made that other people can play with."

> "On topic: things people can run on their computers or hold in their hands."

> "The project should be non-trivial. Don't post quickly-generated one-offs."

> "The project must be something you've worked on personally and which you're around to discuss."

> **"Please make it easy for users to try your thing out, ideally without barriers such as signups or emails."**

> "Off topic: blog posts, sign-up pages, newsletters, lists, and other reading material."

> **"Don't post landing pages or fundraisers."**

> "New features and upgrades ('Foo 1.3.1 is out') generally aren't substantive enough to be Show HNs."

> **"Please don't ask friends to upvote or comment. That's not ok on HN."**

> "Be respectful. Anyone sharing work is making a contribution, however modest."

> "Ask questions out of curiosity. Don't cross-examine."

⚠️ _Note:_ these were extracted individually rather than as one continuous block (the fetch layer
refused a full verbatim reproduction). Each line above is quoted as returned; re-verify against the
live page before quoting publicly.

**Two rules are load-bearing for a no-code portfolio builder:**

- **"Don't post landing pages"** — a Show HN pointing at a marketing site will be flagged. It must
  point at something runnable.
- **"ideally without barriers such as signups or emails"** — HN structurally rewards a
  no-signup demo. This is the single strongest argument in this document for building the
  try-before-signup path _before_ launching.

## 6.4 Adjacent evidence on this specific product category

Searches for portfolio/website-builder Show HNs returned notably **low** point counts, with one
enormous exception:

| Verbatim title                                                    | Points   | Comments | Date       | URL               |
| ----------------------------------------------------------------- | -------- | -------- | ---------- | ----------------- |
| **"Show HN: I recreated Windows XP as my portfolio"**             | **1032** | 323      | 2025-09-07 | mitchivin.com     |
| "Show HN: My Windows XP portfolio with working Game Boy and iPod" | 71       | 35       | 2026-06-20 | mitchivin.com     |
| "Show HN: Postcard – Easy way to make a personal website"         | 140      | 88       | 2022-11-10 | postcard.page     |
| "Show HN: Makers.so – A website builder inside Figma"             | 180      | 45       | 2022-02-10 | (Figma plugin)    |
| "Show HN: I cloned HN to make a simple portfolio page"            | 66       | 19       | 2024-08-01 | guycombinator.net |
| "Show HN: I made a simple Markdown blog creator"                  | 47       | 22       | 2024-07-09 | portfolo.app      |
| "Show HN: Open-Source Video Editor Web App"                       | 588      | 90       | 2024-05-12 | omniclip.app      |

**Reading:** HN does not reward _"a tool for making portfolios"_ (Postcard 140, portfolo.app 47).
HN massively rewards _"look at this astonishing portfolio I made"_ (1032). The distribution
suggests the launch artefact for a portfolio builder may need to be **a jaw-dropping portfolio
built with it**, with the builder as the reveal — not the builder itself.
⚠️ _This is an inference from the data, not something any source states._

## 6.5 Sustainability cautionary tales visible in the HN record

| Verbatim title                                                                  | Points  | Comments | Date       | URL                                               |
| ------------------------------------------------------------------------------- | ------- | -------- | ---------- | ------------------------------------------------- |
| "Pocketbase lost its funding from FLOSS fund"                                   | 125     | 101      | 2026-02-18 | github.com/pocketbase/pocketbase/discussions/7287 |
| "Will PocketBase Survive?"                                                      | 61      | 10       | 2024-12-23 | github.com/pocketbase/pocketbase/discussions/3087 |
| "No longer accepting donations (Pocketbase)"                                    | 4       | 0        | 2024-01-22 | github.com/pocketbase/pocketbase/discussions/4199 |
| "PocketBase 2026: FLOSS/fund sponsorship and UI rewrite"                        | 9       | 2        | 2025-10-29 | (same discussion)                                 |
| "Tell HN: Plausible Analytics is getting greedy"                                | 3       | 6        | 2022-10-04 | —                                                 |
| "Plausible Analytics Isn't GDPR Compliant"                                      | 54      | 75       | 2020-10-23 | blog.paranoidpenguin.net                          |
| "Migrating from Supabase"                                                       | 382     | 134      | 2023-05-19 | blog.val.town                                     |
| "Migrating Infrastructure Off Coolify"                                          | 4       | 0        | 2026-03-27 | coryd.dev                                         |
| "Cal.com is going closed source"                                                | 391     | 317      | 2026-04-15 | cal.com                                           |
| **"Hey Nico, you didn't vibe code your data room but stole it from Papermark"** | **620** | 291      | 2026-06-25 | twitter.com/mfts0                                 |

**Notes:**

- The **PocketBase funding thread (125 pts, 101 comments)** is the single best case study of the
  "sole maintainer, no business model" risk becoming public. Directly relevant to §8.
- The **Papermark plagiarism thread (620 pts)** is a reminder that an open-source project's code
  _will_ be copied and that the founder's public response became a bigger HN moment than the
  original launch (35 pts). ⚠️ _Thread content not fetched; title and metrics only._
- Every mature project has a public "migrating off X" post. Expect one.

---

# 6b. LAUNCH TACTICS — extended evidence

_(§6 above contains the primary HN dataset gathered directly. This section adds the parallel research
stream: verified item IDs and submitters, base-rate statistics, timing analyses, funded
retrospectives with real revenue numbers, licence-backlash data, fake-star economics, and the
awesome-selfhosted submission path.)_

⚠️ **Character note:** HN titles use an **en dash `–`** in the `Name – description` pattern.
Reproduced faithfully.

---

## 6b.1 Launch posts with verified HN item IDs and submitters

| #   | Verbatim title                                                                       |   Points | Cmts | Date       | Submitter                       | HN item                                                   |
| --- | ------------------------------------------------------------------------------------ | -------: | ---: | ---------- | ------------------------------- | --------------------------------------------------------- |
| 1   | `Penpot: Open-source design and prototyping platform`                                | **1145** |  128 | 2022-09-15 | wiradikusuma (**3rd party**)    | [32851262](https://news.ycombinator.com/item?id=32851262) |
| 2   | `Supabase (YC S20) – An open source Firebase alternative`                            | **1120** |  366 | 2020-05-27 | vira28 (**3rd party**)          | [23319901](https://news.ycombinator.com/item?id=23319901) |
| 3   | `Show HN: Restfox – Open source lightweight alternative to Postman`                  |  **758** |  182 | 2022-10-21 | kermire                         | [33287137](https://news.ycombinator.com/item?id=33287137) |
| 4   | `Show HN: We built a developer-first open-source Zapier alternative` (Trigger.dev)   |  **745** |  190 | 2023-02-01 | eallam (**founder**)            | [34610686](https://news.ycombinator.com/item?id=34610686) |
| 5   | `Show HN: Files.md – Open-source alternative to Obsidian`                            |  **730** |  356 | 2026-05-18 | zakirullin                      | [48179677](https://news.ycombinator.com/item?id=48179677) |
| 6   | `N8n.io – Workflow automation alternative to Zapier`                                 |  **728** |  196 | 2019-10-08 | tablet (**3rd party**)          | [21191676](https://news.ycombinator.com/item?id=21191676) |
| 7   | `Show HN: HyperDX – open-source dev-friendly Datadog alternative`                    |  **722** |  163 | 2023-09-18 | mikeshi42                       | [37558357](https://news.ycombinator.com/item?id=37558357) |
| 8   | `Pocketbase – open-source realtime back end in 1 file`                               |  **671** |  204 | 2025-11-28 | (repost)                        | [46075320](https://news.ycombinator.com/item?id=46075320) |
| 9   | `Pocketbase: Open-source back end in one file`                                       |  **630** |  149 | 2024-01-07 | (repost)                        | [38898934](https://news.ycombinator.com/item?id=38898934) |
| 10  | **`Cal.com: Open Scheduling Infrastructure`**                                        |  **576** |    — | 2023-01-24 | nateb2022 (**3rd party**)       | [34507672](https://news.ycombinator.com/item?id=34507672) |
| 11  | `Show HN: PocketBase – Open Source realtime backend in one file`                     |  **563** |  111 | 2022-07-07 | randomwebdev (**founder**)      | [32013330](https://news.ycombinator.com/item?id=32013330) |
| 12  | `Show HN: NocoDB – Open-Source Airtable Alternative`                                 |  **562** |  157 | 2021-05-27 | rnavi (**founder**)             | [27303783](https://news.ycombinator.com/item?id=27303783) |
| 13  | `Show HN: BookStack – An open source wiki platform and alternative to Confluence`    |  **562** |  198 | 2022-01-08 | ssddanbrown                     | [29851834](https://news.ycombinator.com/item?id=29851834) |
| 14  | `Show HN: I am building an open-source Confluence and Notion alternative` (Docmost)  |  **551** |  217 | 2024-06-29 | Pi9h                            | [40832146](https://news.ycombinator.com/item?id=40832146) |
| 15  | `Show HN: OpenSign – Open source alternative to DocuSign`                            |  **545** |  160 | 2023-10-28 | alexopensource                  | [38052344](https://news.ycombinator.com/item?id=38052344) |
| 16  | `Show HN: SigNoz – open-source alternative to DataDog, NewRelic`                     |  **510** |  132 | 2022-10-01 | pranay01                        | [33049046](https://news.ycombinator.com/item?id=33049046) |
| 17  | `Show HN: Pangolin – Open source alternative to Cloudflare Tunnels`                  |  **500** |  125 | 2025-07-10 | miloschwartz                    | [44526015](https://news.ycombinator.com/item?id=44526015) |
| 18  | `Show HN: I'm working on a open-source, self-hosted alternative to Disqus` (Cusdis)  |  **436** |  167 | 2021-04-20 | djyde                           | [26878153](https://news.ycombinator.com/item?id=26878153) |
| 19  | `Show HN: Open-source alternative to Retool, Internal.io, etc.` (ToolJet)            |  **429** |   68 | 2021-06-07 | navaneethpk (**founder**)       | [27421408](https://news.ycombinator.com/item?id=27421408) |
| 20  | `Show HN: Open-Source Alternative to Intercom, Drift, Zendesk, FreshChat` (Chatwoot) |  **417** |   79 | 2019-11-17 | pranavrajs (**founder**)        | [21559139](https://news.ycombinator.com/item?id=21559139) |
| 21  | **`Launch HN: Twenty.com (YC S23) – Open-source CRM`**                               |  **415** |  311 | 2023-07-19 | iFelix (**founder**)            | [36791434](https://news.ycombinator.com/item?id=36791434) |
| 22  | `Coolify: Open-source and self-hostable Heroku / Netlify / Vercel alternative`       |  **382** |  180 | 2025-04-02 | vanschelven (**3rd party**)     | [43555996](https://news.ycombinator.com/item?id=43555996) |
| 23  | `Twenty, a modern CRM alternative to Salesforce`                                     |  **378** |  165 | 2024-06-11 | client4 (**3rd party**)         | [40648082](https://news.ycombinator.com/item?id=40648082) |
| 24  | `Show HN: Medusa – Open-source alternative to Shopify`                               |  **373** |   80 | 2021-09-10 | owjuhl                          | [28481913](https://news.ycombinator.com/item?id=28481913) |
| 25  | **`Show HN: Plausible – Self-Hosted Google Analytics alternative`**                  |  **351** |  139 | 2020-10-06 | markosaric (**co-founder**)     | [24696145](https://news.ycombinator.com/item?id=24696145) |
| 26  | `Show HN: Appwrite – Open-Source and Self Hosted Firebase Alternative`               |  **326** |  118 | 2022-03-22 | christyjacob4 (team)            | [30769044](https://news.ycombinator.com/item?id=30769044) |
| 27  | **`Calendso: An open source Calendly alternative`**                                  |  **311** |   91 | 2021-04-15 | baileypumfleet (**co-founder**) | [26817795](https://news.ycombinator.com/item?id=26817795) |
| 28  | `Infisical – open-source HashiCorp Vault alternative`                                |  **284** |  105 | 2023-08-11 | (3rd party)                     | [37090754](https://news.ycombinator.com/item?id=37090754) |
| 29  | `Show HN: Budibase – An open-source low code platform`                               |  **280** |  105 | 2021-11-16 | foxbee (**founder**)            | [29242466](https://news.ycombinator.com/item?id=29242466) |
| 30  | **`Show HN: I made an open-source Bitly alternative`** (Dub, then dub.sh)            |  **255** |  207 | 2022-09-22 | steventey (**founder**)         | [32939407](https://news.ycombinator.com/item?id=32939407) |
| 31  | `Show HN: Infisical – open-source secrets manager`                                   |  **232** |   97 | 2022-12-19 | vmatsiiako (**founder**)        | [34055132](https://news.ycombinator.com/item?id=34055132) |
| 32  | `Launch HN: Infisical (YC W23) – Open-source secrets manager for developers`         |  **231** |  121 | 2023-02-27 | founder                         | [34955699](https://news.ycombinator.com/item?id=34955699) |
| 33  | `Excalidraw whiteboard – easily sketch diagrams with a hand-drawn feel`              |  **241** |   54 | 2020-06-15 | dragonsh (**3rd party**)        | [23525648](https://news.ycombinator.com/item?id=23525648) |
| 34  | `Show HN: Trigger.dev V2 – a Temporal alternative for TypeScript devs`               |  **172** |   39 | 2023-10-03 | eallam (**founder**)            | [37750763](https://news.ycombinator.com/item?id=37750763) |
| 35  | `Novu – Service for managing multi-channel notifications with a single API`          |  **160** |   24 | 2022-12-26 | —                               | [34136381](https://news.ycombinator.com/item?id=34136381) |
| 36  | `Show HN: Coolify v2 – Open-source and self-hostable Heroku/Netlify alternative`     |  **158** |   54 | 2022-03-30 | andrasbacsai (**founder**)      | [30854912](https://news.ycombinator.com/item?id=30854912) |
| 37  | `Show HN: Formbricks – Open-source alternative to Typeform and Sprig`                |  **155** |   39 | 2023-10-31 | matthiasnannt (**founder**)     | [38082621](https://news.ycombinator.com/item?id=38082621) |
| 38  | `Typebot: A conversational form builder that you can self-host`                      |   **77** |    8 | 2022-03-26 | thunderbong (**3rd party**)     | [30811499](https://news.ycombinator.com/item?id=30811499) |
| 39  | **`Show HN: Papermark – the open-source DocSend alternative with custom domains`**   |   **35** |   15 | 2023-10-23 | mfts0 (**founder**)             | [37984167](https://news.ycombinator.com/item?id=37984167) |
| 40  | `Show HN: Excalidraw – Sketch Hand-Drawn Like Diagrams`                              |   **30** |    6 | 2020-01-25 | —                               | [22146973](https://news.ycombinator.com/item?id=22146973) |
| 41  | `Show HN: Directus – Free and Open-Source Headless CMS`                              |   **18** |    4 | 2016-09-14 | —                               | [12496964](https://news.ycombinator.com/item?id=12496964) |
| 42  | `Show HN: Rallly – Collaborative Scheduling`                                         |    **4** |    5 | 2015-02-26 | —                               | [9113426](https://news.ycombinator.com/item?id=9113426)   |

## 6b.2 ⚠️ Projects with NO significant HN launch — the absence is evidence

- **Ghost** — no HN launch. Origin was a **Kickstarter**; the HN submission of it (`Ghost: Just a Blogging Platform`, [5625543](https://news.ycombinator.com/item?id=5625543), 2013-04-29) scored **19 points**. Ghost's growth did not come from HN.
- **Umami** — best HN result ever: `Umami: Own Your Website Analytics`, **89 points**, 2022-05-06 ([31284853](https://news.ycombinator.com/item?id=31284853)). No Show HN.
- **Outline** — best result **2 points**. Three submissions, all ≤2. Grew entirely off-HN.
- **Rallly** — 4 points in 2015; a 2025 resubmission got 2.
- **Directus** — 18-point Show HN in 2016; highest-ever **72 points** (2025). Its _licence-change_ posts got more engagement than its launches.
- **Documenso** — **no post ever cleared 5 points.** Highest: 3. Its ~14k stars came from Twitter/GitHub, not HN.
- **Papermark** — founder's Show HN **35 points**. Its highest-scoring HN appearance by far is a _plagiarism dispute_: `Hey Nico, you didn't vibe code your data room but stole it from Papermark`, **620 points, 291 comments**, 2026-06-25 ([48672328](https://news.ycombinator.com/item?id=48672328)).
- **Cal.com under the "cal.com" name** — the 2021 submission `Cal.com – open-source Calendly alternative` got **15 points**; `Cal.com v2. Formerly Calendso...` got **4 points**. Only the plain third-party framing (`Cal.com: Open Scheduling Infrastructure`) hit 576.

## 6b.3 ⭐ THE BASE RATE — "open-source alternative to X" Show HN titles

Computed directly against the Algolia API.

| Threshold       | Show HN matching "open source alternative" |       ALL Show HN |     Ratio |
| --------------- | -----------------------------------------: | ----------------: | --------: |
| >0 pts (corpus) |                                      1,044 |           566,457 |         — |
| **>50 pts**     |                            178 (**17.0%**) | 13,001 (**2.3%**) |  **7.4×** |
| **>100 pts**    |                            129 (**12.4%**) |  7,357 (**1.3%**) |  **9.5×** |
| **>300 pts**    |                              37 (**3.5%**) | 1,548 (**0.27%**) | **13.0×** |
| **>500 pts**    |                              12 (**1.1%**) |  536 (**0.095%**) | **12.1×** |

Queries: `hn.algolia.com/api/v1/search?query=open source alternative&tags=show_hn&numericFilters=points>100`
vs `hn.algolia.com/api/v1/search_by_date?tags=show_hn&numericFilters=points>100`

⚠️ **Caveats that must survive synthesis:** (1) Algolia's query is fuzzy and searches title _and_
URL, so the 1,044 denominator includes loose matches. (2) **Heavy selection bias** — people who
write "open-source alternative to X" have usually shipped a substantive clone of a known product,
and "there is a known product worth cloning" is itself a strong demand signal.
**This is correlation, not a title-writing trick.** But a 7–13× effect is large enough to report.

**Calibration:** only **84 Show HN posts in history have ever exceeded 1,000 points** (out of
566,457). Anything ≥300 is **top 0.27%**.

**The realistic target band (100–250 pts, 78 such posts):** Openpanel/Mixpanel 244 · Pico/Ngrok 244 ·
Evernote alt 241 · ClickStack/Datadog 241 · OneUptime/Datadog 233 · OpenWork/Claude Cowork 231 ·
Nhost/Firebase 210 · ToolJet 2.0 210 · Memex/Roam+Obsidian 188 · BoxyHQ/Auth0+WorkOS 176 ·
Portr/ngrok 172 · Tegon/Jira+Linear 163 · Open SaaS 163 · **Formbricks/Typeform+Sprig 155** ·
Illa/Retool 151 · Papercups/Intercom 148 · Graphic-Walker/Tableau 148.

**Naming observation:** winners almost universally use `<Name> – Open-source alternative to <Well-Known
Product>`. **Multi-target naming is common and does not appear to hurt** ("Intercom, Drift, Zendesk,
FreshChat" 417; "DataDog, NewRelic" 510; "Jira, Linear" 163).

## 6b.4 ⭐ Two structural patterns the numbers reveal

**Pattern 1 — third-party submissions frequently OUTSCORE the founder's own Show HN.**

| Project    |                                    Founder's own post |                                                                       Third party's post |     Delta |
| ---------- | ----------------------------------------------------: | ---------------------------------------------------------------------------------------: | --------: |
| Cal.com    | `Calendso: An open source Calendly alternative` — 311 |                                      `Cal.com: Open Scheduling Infrastructure` — **576** |  **+85%** |
| Coolify    |                       `Show HN: Coolify v2 – …` — 158 | `Coolify: Open-source and self-hostable Heroku / Netlify / Vercel alternative` — **382** | **+142%** |
| PocketBase |                       `Show HN: PocketBase – …` — 563 |                                                   reposts **630** (2024), **671** (2025) |      +19% |
| Supabase   |                                                     — |                                                                        **1120** (vira28) |         — |
| Penpot     |                                                     — |                                                                  **1145** (wiradikusuma) |         — |
| n8n        |                                                     — |                                                                         **728** (tablet) |         — |
| Twenty     |                `Launch HN: Twenty.com (YC S23)` — 415 |                                   `Twenty, a modern CRM alternative to Salesforce` — 378 |       −9% |

**Pattern 2 — the biggest scores often carry NO "Show HN:" prefix.** Five of the top ten posts have
no prefix (Penpot 1145, Supabase 1120, n8n 728, Cal.com 576, Coolify 382). **A bare
`Name: what it is` title submitted organically by a reader consistently performs at or above a
founder's Show HN.**

## 6b.5 TIMING — the actual analyses, and the tension between them

### Myriade — 157,000+ Show HN posts since 2009, BigQuery

<https://www.myriade.ai/blogs/when-is-it-the-best-time-to-post-on-show-hn>

- "Breakout" = **30+ votes (top 10%)**; also 83+ (top 5%), 275+ (top 1%).
- **Sunday: 11.75% breakout rate** (highest). Saturday 11.08%. Weekdays 9.45–9.90%.
- **Peak hour: 12:00 UTC — 12.2%.** Golden window **11:00–16:00 UTC** (all above 10.5%).
- **Worst: 03:00–07:00 UTC (~8.2–8.4%).**
- Best combos: **Sunday 00:00–02:00 UTC → up to 15.7%**; Sunday 11:00–16:00 UTC → 12–14%; Saturday 14:00–20:00 UTC → 12–14%.
- Verbatim conclusion: _"Weekends are 20-30% more effective than weekdays for breakout potential."_

### Chanind — Jan 2018–May 2019, HN on BigQuery, front page = 50+ upvotes

<https://chanind.github.io/2019/05/07/best-time-to-submit-to-hacker-news.html>

> "Articles posted on Sunday, 6am UTC are 2.5x more likely to make it to the front page than posting on Wednesday, 9am UTC."

Explicitly **contradicts** prior 2017 research recommending peak hours. Mechanism is **reduced
competition, not more readers.** Stated trade-off: low-traffic slots raise front-page odds but yield
**fewer total views** for posts that do land.

### The community's own dissent — [44625897](https://news.ycombinator.com/item?id=44625897) (12 pts, 8 comments, 2025-07-20)

> _vanschelven_: "Skimming the graphs one would say 'it hardly matters' which matches the naive assumption that any advantage would be 'arbitraged away.'"
> _gametorch_: "Building something that people actually want will get you orders of magnitude more upvotes than whatever variance can be attributed to the time of posting."
> _sampl3username_: "Are you trying to 'game' and 'optimize' us too? Don't you think that is a bit out of tune with the atmosphere here?"

⚠️ **UNRESOLVED TENSION:** the two data analyses (weekend, low-competition) and common founder
folklore (weekday 8–11am ET) point in **opposite directions**. The analyses optimise for
_probability of reaching the front page_; the folklore optimises for _total eyeballs conditional on
making it_. Both are internally consistent. Flagged as a genuine open question.

### Product Hunt

**PH's own guidance** — <https://www.producthunt.com/launch/preparing-for-launch>

- 24-hour cycle on **Pacific time**; homepage refreshes daily.
- Recommends scheduling at **"12:01am PST"** for the complete 24-hour window.
- Verbatim hedge: there is **"no golden-ticket answer"**; _"the best time to launch your product is when you're ready to do so."_
- Day-of-week: weekdays skew to larger companies; **weekends skew to side projects and smaller teams.** PH cites research that weekend launches receive **"15% more 'Visit' button clicks than those on weekdays."**
- On upvotes, verbatim: **"Ask for feedback (NOT upvotes)"** in your first comment.

⚠️ **Third-party consensus (search-derived, multiple secondary sources agreeing, no single primary
dataset):** Tuesday is the most-cited "best day"; Wed/Thu strong; Tue–Thu have the highest hunter
traffic **and the most competition**; Sunday/Monday softer. The repeated arithmetic: a launch going
live at 8am PT loses 8 hours of its 24-hour window.

**Timezone note:** PH's cycle is anchored to **Pacific** (their copy says "PST" year-round even
though the US is on PDT ~8 months). **HN has no reset cycle at all** — ranking is a continuous
time-decay function, which is why the HN analyses are expressed in **UTC**.

---

## 6b.6 RETROSPECTIVES WITH REAL NUMBERS

### ⭐ Plausible — the best-documented case

<https://plausible.io/blog/open-source-saas> — _"How we built a $1M ARR open source SaaS"_

| Date     |         MRR | Trigger                    |
| -------- | ----------: | -------------------------- |
| May 2019 |     **$64** | launch                     |
| Jul 2019 |        $118 | first HN traffic spike     |
| Sep 2019 |        $178 | **went open source**       |
| Feb 2020 |        $403 | —                          |
| Apr 2020 |        $607 | viral post                 |
| May 2020 |      $1,055 | prominent mention          |
| Jul 2020 |      $2,844 | **second Hacker News hit** |
| Aug 2020 |      $4,062 | **Product Hunt launch**    |
| Sep 2020 |      $5,035 | first salaries paid        |
| Jan 2021 |     $11,303 | sustainability             |
| Oct 2021 |     $42,624 | $500k ARR                  |
| Jun 2022 | **$83,637** | **$1M ARR**                |

**Traffic/conversion spikes, verbatim:**

> Jul 2019: _"more than 2,500 visitors in one day"_ from HN.
> Apr 2020: _"More than 25,000 people visited our site on the day we published the post."_
> May 2020: _"94 trial signups on May 2nd, which is still our best day."_
> Jul 2020: _"more than 35,000 visitors in a single day."_
> Aug 2021: _"More than 30,000 read the post within the first 24 hours"_ (the GA-adblocking study).

Jun 2022: **7,000+ paying subscribers**, **50,000+ websites**, **1B+ monthly pageviews**. Growth was
organic with **zero paid advertising**.

**⭐⭐ CRITICALLY: Plausible's biggest HN hits were BLOG POSTS, not the product launch.**
The Show HN scored **351**. But:

- `Tech-savvy audiences block Google Analytics` — **1214 points / 681 comments**, 2021-08-31 ([28365163](https://news.ycombinator.com/item?id=28365163))
- `You probably don't need a single-page app` — **816 points / 499 comments** ([19184496](https://news.ycombinator.com/item?id=19184496))

**Content marketing on HN outperformed the launch by 3.5×.**

Other data points: `Plausible Community Edition` 125/103 (2024-07-10, [40925266](https://news.ycombinator.com/item?id=40925266)); `Lessons from building Plausible Analytics to $1.2M ARR in public` 210/76 ([35121435](https://news.ycombinator.com/item?id=35121435)).

⚠️ **Unverified:** the widely repeated "HN was Plausible's #1 traffic source, 60% of all traffic
through 2021" appears only in secondary summaries (startupspells.com, which **403'd**). **Do not
cite the 60% figure.**

### Cal.com — direct founder confirmation of HN #1

HN comment by **Peer_Rich** (Peer Richelsen, co-founder), 2023-01-25, in [34507672](https://news.ycombinator.com/item?id=34507672) — verbatim:

> "Hey, Peer here, Co-Founder of Cal.com. Wow this has been overwhelming! Shoutout to all the nice people in the comments supporting us. Also thank you all for providing valuable feedback, reporting bugs and more. The beauty of OSS that everyone can contribute, participate and help. We're ending this day adding the new 'badge of honor' of hackernews #1 to our README: https://github.com/calcom/cal.com/pull/6682"

That post: **576 points, submitted by a third party**. The original Calendso launch was **311 / 91**
on 2021-04-15 by co-founder `baileypumfleet`.

⚠️ Search-derived (podcast summaries, not fetched): Calendso "went completely bananas on Hacker News
when they just had 'Calendly open source alternative' as a single title and didn't even have a
description"; ~6K stars + 500 forks shortly after.

### Dub.co / Steven Tey

- **Verified:** `Show HN: I made an open-source Bitly alternative` — **255 points, 207 comments**, 2022-09-22, by `steventey` ([32939407](https://news.ycombinator.com/item?id=32939407)). URL submitted was `https://dub.sh/`. _(Same day as the archived homepage in §5.13 showing 3 stars.)_
- Open Pioneers (<https://www.openpioneers.com/p/dub>, Jan 2024): _"over 14k stars on GitHub"_; started at Vercel **October 2022**; _"reached #1 on Hacker News"_; growth _"mostly through word of mouth, without spending a cent on paid marketing"_ over the first 12 months.
- ⚠️ **Second-hand, unverified at a primary source:** Product Hunt launch of **1,085 upvotes**, **#1 Product of the Day / Week / Month**, **663 new signups in one day**, founder **responding to all 210 comments on launch day**.

### ⭐ Papermark / Marc Seitz — the Product-Hunt-not-HN story

<https://www.starterstory.com/papermark-breakdown>

- MVP built in **3 days** over one weekend. First tweet **2023-05-23** → **265 likes**.
- **Product Hunt launch 2023-09-04: 850 upvotes, 250 comments → 300 signups, 250 GitHub stars, 4,000 website visitors.**
- Launch tweet: _"450 likes and over 95,000 views."_
- Reached **~$50K MRR / $600K ARR**, profitable within the first year.
- ⚠️ Search-derived: 6.9K stars / 945 forks / 62 contributors mid-2025; a separate secondary source claims **$900K ARR**.
- **The HN launch was a flop at 35 points.** Papermark's growth is a **Product Hunt + Twitter** story. One of the most useful contrasts in the dataset.

### Documenso / Timur Ercan — the GitHub-not-HN story

<https://posthog.com/spotlight/startup-documenso>

- Launched **November 2022**; **4,000+ GitHub stars** by Oct 2023 (~11 months).
- **⭐ "First 50 stars came primarily from friends and team members."**
- Channels: open-source community engagement, Twitter outreach, Discord hub, pre-seed announcement, bounty program with cash + merch.
- Verbatim: _"Stars are mainly useful to us as a social proof. They show that users trust us, and encourage others to do the same"_ / _"We try to be as transparent as possible and share everything publicly, even revenue details"_ / **"GitHub really is our main channel and our key focus. That's where Documenso really lives."**
- ⚠️ Search-derived: ~14,000 stars and ~$2.2M early funding as of 2026.
- **Documenso never cleared 5 points on HN.**

### NocoDB — a "Thank HN"

`Thank HN: A customer found us on Hacker News and wrote our first angel check` — **66 points, 6
comments**, 2021-09-21 ([28606258](https://news.ycombinator.com/item?id=28606258)). Direct evidence
that HN launch value is not only traffic.

---

## 6b.7 dang's canonical Show HN tips — [22336638](https://news.ycombinator.com/item?id=22336638), 2020-02-15, **edited 2026-03-28**

**The single most actionable document in the corpus.** Verbatim highlights:

> **"Edit (2026-03-28): … Write your text by hand. Don't use an LLM to generate any of it (not even a tiny bit, including to edit or spruce it up). Reason: the community is super fussy about this right now, and LLM language leaves imprints on your text which are generating quite some backlash when it appears on HN itself. This is a big dividing line at present!"**

> "Include text giving the backstory of how you came to work on this, and explaining what's different about it. That tends to seed discussion in a good direction."

> "Include a clear statement of what your project is or does. If you don't, the discussion will consist of 'I can't tell what this is'."

> "Include links to any previous HN threads that are relevant. Readers like those."

> **"Drop any language that sounds like marketing or sales. On HN, that is an instant turnoff. Use factual, direct language. Personal stories and technical details are great."**

> "Please make it easy for users to try your thing out, preferably without having to sign up, get a confirmation email, and other such barriers. You'll get more feedback that way, plus HN users get ornery if you make them jump through hoops."

> **"Don't have your username be that of your company or project. It creates a feeling of using HN for promotion and of not really participating as a person."**

> **"Make sure your friends and users do not add booster comments in the thread. HN users are adept at picking up on those, they consider it spamming, and they will flame you for it."**

> "You can post a new release as a Show HN only if the new version is significantly different. It shouldn't just be an incremental upgrade. If you do repost, add a comment linking to the previous Show HN and explaining what is different from last time. **This should probably only happen once or twice a year**—more starts to be excessive."

### Additional newsguidelines.html rules, verbatim

<https://news.ycombinator.com/newsguidelines.html>

> **"Please don't use HN primarily for promotion. It's ok to post your own stuff part of the time, but the primary use of the site should be for curiosity."**
> **"Don't solicit upvotes, comments, or submissions. Users should vote and comment when they run across something they personally find interesting—not for promotion."**
> "Please don't do things to make titles stand out, like using uppercase or exclamation points, or saying how great an article is."
> "If the title includes the name of the site, please take it out, because the site name will be displayed after the link."
> "If the title contains a gratuitous number or number + adjective, we'd appreciate it if you'd crop it. E.g. translate '10 Ways To Do X' to 'How To Do X,' and '14 Amazing Ys' to 'Ys.'"
> "Otherwise please use the original title, unless it is misleading or linkbait; don't editorialize."
> "Please don't delete and repost. Deletion is for things that shouldn't have been submitted in the first place."
> "Please don't post insinuations about astroturfing, shilling, brigading, foreign agents, and the like. It degrades discussion and is usually mistaken."
> "Please don't post shallow dismissals, especially of other people's work. A good critical comment teaches us something."

⚠️ **Note the asymmetry:** HN penalises gaming **and** penalises _accusing_ others of gaming.

---

## 6b.8 ⚠️ WHAT BACKFIRES

### The "open source as a growth hack" backlash — from Cal.com's own #1 thread

Even the most successful launch in this dataset drew sharp scepticism. From [34507672](https://news.ycombinator.com/item?id=34507672):

- **candiddevmike:** _"> Clone the repo into a public GitHub repository (to comply with AGPLv3. To clone in a private repository, acquire a commercial license) — The AGPL won't save you from folks modifying/reselling your software. And if someone was non compliant, are you going to pay the lawyer fees to prove it?_ **I wish companies would stop using 'open source' as a growth strategy.**"
- **candiddevmike:** _"They're venture backed,_ **it's a growth hack**… _Expect the usual tension of open core shenanigans to eventually play out."_
- **moneywoes:** _"Yep, note how the title is 'Open Source' not Open Core._ **They know what they're doing**"
- **arkitaip:** _"What does open source mean when you have to use a hosted solution and 'premium' names cost 29 usd / month."_
- **gen220** (defending, but conceding): _"in the long term I agree with you, it'll probably fall apart in the way you expect within 10 years. It's hard to outlast the financial interest of investors."_

**⭐ These 2023 comments predicted §0 exactly. Cal.com went closed source in April 2026.**

### Licence-change backlash — the biggest OSS blowups by HN engagement

| Title                                          |   Points |    Cmts | Date       | Item                                                      |
| ---------------------------------------------- | -------: | ------: | ---------- | --------------------------------------------------------- |
| `OpenTF announces fork of Terraform`           | **1711** |     486 | 2023-08-25 | [37262440](https://news.ycombinator.com/item?id=37262440) |
| `HashiCorp adopts Business Source License`     |      632 | **731** | 2023-08-10 | [37081306](https://news.ycombinator.com/item?id=37081306) |
| `OpenTF repository is now public`              |      510 |     177 | 2023-09-05 | [37392581](https://news.ycombinator.com/item?id=37392581) |
| `OpenTF is now OpenTofu`                       |      438 |     246 | 2023-09-20 | [37581132](https://news.ycombinator.com/item?id=37581132) |
| `Redis adopts dual source-available licensing` |      417 | **601** | 2024-03-20 | [39772562](https://news.ycombinator.com/item?id=39772562) |
| `Re-Licensing Sentry`                          |      348 |     280 | 2019-11-06 | [21466967](https://news.ycombinator.com/item?id=21466967) |
| `Cal.com is going closed source`               |      391 | **317** | 2026-04-15 | [47780456](https://news.ycombinator.com/item?id=47780456) |

**⭐ THE TELL: comment-to-point ratio.** HashiCorp's BSL post has **731 comments on 632 points
(1.16)**; Redis's **601 on 417 (1.44)**; Cal.com's **317 on 391 (0.81)** — versus **~0.2–0.4 for a
healthy launch**. **A comment/point ratio above ~0.8 is the signature of a community fight, not
enthusiasm.**

⚠️ Named criticism (search-derived): Joe Duffy (Pulumi CEO) called HashiCorp's move
**"disingenuous"**; Adam Jacob (System Initiative): **"People are pretty mad – they [HashiCorp] just
want to squeeze more from the orange"** (The Register, 2023-08-11,
<https://www.theregister.com/2023/08/11/hashicorp_bsl_licence/>). OpenTF's manifesto reportedly
gathered 32K+ GitHub stars before joining the Linux Foundation as OpenTofu on 2023-09-20.

**Smaller-project versions of the same:**

- **Directus** — `Directus is no longer open source` ([35730861](https://news.ycombinator.com/item?id=35730861)) · `Directus become semi-closed source after benefits from open source contributions` ([35871858](https://news.ycombinator.com/item?id=35871858)) · community fork `Fork of Directus v9 (because v10 become semi-closed)` ([36075384](https://news.ycombinator.com/item?id=36075384)) · 2026: `Self-hosted Directus 12 requires a license key to lift caps` ([48573165](https://news.ycombinator.com/item?id=48573165)) · `Directus 12 Move to Monospace Sustainable Core License (MSCL)` ([48222820](https://news.ycombinator.com/item?id=48222820))
- **Budibase** — `Budibase Will Soon Limit Users on OSS Self Hosted Version` ([38277920](https://news.ycombinator.com/item?id=38277920), links to r/selfhosted)
- **PocketBase** — `Pocketbase lost its funding from FLOSS fund` 125/101, 2026-02-18 ([47062561](https://news.ycombinator.com/item?id=47062561)) · `Will PocketBase Survive?` ([42496775](https://news.ycombinator.com/item?id=42496775)) · `No longer accepting donations (Pocketbase)` ([39087376](https://news.ycombinator.com/item?id=39087376))

### Project theft / plagiarism as a real OSS launch risk

`My open source project got stolen by a HN user` — **131 points, 65 comments**, 2023-11-16, by
`AndreVitorio` ([38293698](https://news.ycombinator.com/item?id=38293698)). Verbatim from the post:

> "I created this open-source project called Outstatic… someone on HN took my entire project, renamed it, and has been showing it off all over the internet as their own thing… The only reason I found out was because this person was asking for help with my project on our Discord server."
> "I understand that open source means people can use and modify the work, but claiming total credit and denying any connection to the original project? That's a bit much."

Practical resolution in the thread: forensic evidence via commit history and GitHub's event stream —
commenter `None4U`: _"commits can be overwritten, what is actually reliable here is GitHub's 'event stream'"_.

Papermark's 620-point plagiarism thread showed a community split — `xyzsparetimexyz`: _"Don't care.
Competition is good for consumers."_ vs `bogwog`: _"It is, but this isn't competition. This just
copyright infringement."_

### Voting-ring enforcement

⚠️ Search-derived (dang comments, not individually fetched): "Voting ring detection has been one of
HN's priorities for over 12 years and it's pretty good"; **"it's sadly common for a great Show HN
post to get demoted because its creators, eager to get it on the front page, tried to game it."**
Related threads: [22761897](https://news.ycombinator.com/item?id=22761897),
[24063832](https://news.ycombinator.com/item?id=24063832),
`Ask HN: Is Hacker News Being Astroturfed?` [19418177](https://news.ycombinator.com/item?id=19418177).
Community-documented norms: <https://github.com/minimaxir/hacker-news-undocumented>

---

## 6b.9 ⚠️ GITHUB STARS — the fake-star economy

### Academic — "Six Million (Suspected) Fake Stars in GitHub"

CMU + Socket + NC State, arXiv **2412.13459** — <https://arxiv.org/abs/2412.13459>
Verbatim abstract opening:

> "GitHub… provides a set of social-media-like features to signal high-quality repositories. Among them, the star count is the most widely used popularity signal, but it is also at risk of being artificially inflated (i.e., faked), decreasing its value as a decision-making signal and posing a security risk to all GitHub users."

- **6 million** suspected fake stars; detection tool **StarScout**; event data **2019–2024**
- The **majority of fake-starred repos promoted "short-lived phishing malware"**
- **⭐ CRUCIAL FOR FOUNDERS: the popularity benefit lasts "less than two months"** and becomes counterproductive long-term
- Campaigns "rapidly surged in 2024"
- HN discussion: `4.5M Suspected Fake Stars in GitHub` — 236/212, 2024-12-29 ([42540182](https://news.ycombinator.com/item?id=42540182))

### Industry — Dagster, "Tracking the Fake GitHub Star Black Market"

<https://dagster.io/blog/fake-stars> — **489 points, 284 comments**, 2023-03-18 ([35207020](https://news.ycombinator.com/item?id=35207020))

- **Actual vendor prices:** Baddhi Shop **$64 for 1,000 stars**; GitHub24 **€0.85/star** (100 = €85)
- They bought stars for a test repo `frasermarlow/tap-bls`: GitHub24 delivered **100 stars within 48 hours**; a month later all GitHub24 stars survived but only **three-quarters of Baddhi Shop stars remained**
- **Fake-account heuristic:** _"Created in 2022 or later, Followers <=1, Following <= 1, Public gists == 0, Public repos <=4"_, empty profiles, star date == account creation date
- Unsupervised clustering: **98% precision / 85% recall**; false-positive rate **0.17%**
- Conclusion: _"it's heartening to see that this is not a widespread phenomenon."_

**Latest:** `GitHub's fake star economy` — **810 points, 377 comments**, 2026-04-20 ([47831621](https://news.ycombinator.com/item?id=47831621)). Tool: `Show HN: CLI that spots fake GitHub stars, risky dependencies and licence traps` (StarGuard) — 122/72 ([43962427](https://news.ycombinator.com/item?id=43962427)).

⚠️ Search-derived, **not verified in the paper text**: 15,835 repos affected; 16% of all repos with
star activity at the July 2024 peak; 3,216 repos + 30,779 bot accounts; ~60% phishing/malware;
GitHub purged ~91% of identified repos and 62% of suspected accounts by Oct 2024; stars sold as low
as $0.03; "less than $200 sufficient to meet seed-round VC thresholds."

**Cross-reference §5.16:** buying stars is squarely inside the FTC's "fake indicators of social media
influence" prohibition.

### star-history.com and GitHub Trending

- **star-history.com** (<https://github.com/star-history/star-history>) — "the de facto GitHub star history graph". Features: xkcd-style sketch charts, one-click image export, **Date mode vs Timeline mode** (days-since-first-star, which normalises repos that started at different times — _the honest way to compare growth_), embeddable live charts for READMEs, a Chrome extension, Star Map, Leaderboards.
- **⚠️ GitHub Trending mechanics: GitHub has NEVER published the algorithm** (community consensus is that this is deliberate). Community-derived model: **star velocity is the primary signal, measured relative to the repo's own historical baseline** — a repo that normally gets 2 stars/day getting 10 outranks one that normally gets 50 getting 60. **This means trending strongly favours small repos having a spike** — exactly what an HN/PH launch produces. Sources: <https://ossinsight.io/blog/introducing-trending-page>, <https://github.com/orgs/community/discussions/163970>. **Flag the whole trending model as inferred, not documented.**
- Alternatives: <https://seladb.github.io/StarTrack-js/>, <https://gitstar-ranking.com/>

---

## 6b.10 ⭐ awesome-selfhosted — the actual submission path

**Key structural fact most people get wrong: you must NOT submit to the main
`awesome-selfhosted/awesome-selfhosted` repo.** Its PR template says verbatim:

> "Please do not submit pull requests in this repository. Use https://github.com/awesome-selfhosted/awesome-selfhosted-data instead."

From <https://github.com/awesome-selfhosted/awesome-selfhosted-data/blob/master/CONTRIBUTING.md> — verbatim:

**Submission mechanics:**

> "Create a new `software/software-name.yml` file, based on the template in `.github/ISSUE_TEMPLATES/addition.md`. Please use kebab-case for file naming, for example, `my-awesome-software.yml`." → "Select `Create a new branch for this commit and start a pull request`" → "Click `Create pull request`"
> "In single page mode the software will only appear under the first category in its `tags` list, **so choose wisely**."

**Curation / removal rules (how you get delisted):**

> "Software with no development activity for 6-12 months may be removed from the list"
> "Non-working software may be removed from the list"
> "Unmaintained software without an active community may be removed from the list"
> "Software with persistent, serious security issues will be removed from the list"

Automated CI runs `check-dead-links.yml` and `check-unmaintained-projects.yml`.

**⭐ Description style rules — directly relevant to positioning:**

> **"Please avoid redundant terms in project descriptions, such as _open-source_, _free_, _self-hosted_… as their presence on awesome-selfhosted already implies this."**
> "Prefer shorter forms for descriptions - for example, `Minimalist text adventure game` would be preferred to `A minimalist text adventure game` or `$PROJECT is a minimalist text adventure game`."
> **"If the project is presented as an alternative to another service or application, please mention it as `(alternative to $PRODUCT1, $PRODUCT2)` at the end of the description."**
> "If the project is forked from another project, please add `(fork of $PROJECT)` at the end of the description."
> **"Machine/LLM-generated contributions, that do not respect project guidelines are not allowed and will result in a ban."**

**There is NO minimum star count and NO minimum project age.** The gates are: source code + a FOSS
licence + a working link + sustained maintenance. (A tag needs "a minimum of 3 software projects
referencing it" before it can exist.)

⚠️ **UNVERIFIED: whether an awesome-selfhosted listing actually drives measurable traffic.** No
first-party analytics from any project attributing traffic to it were found. Secondary sources only
assert it "serves as social proof". **Treat "awesome-list listing drives traffic" as unproven.**
(Secondary sources cite ~284K stars for the list repo.)

---

## 6b.11 ⚠️ REDDIT — LARGELY UNVERIFIED, ACCESS BLOCKED

**Every route was blocked from this environment:**

- `WebFetch` on `www.reddit.com` → "unable to fetch"
- `WebFetch` on `old.reddit.com` → "unable to fetch"
- `curl` on `www.reddit.com/r/selfhosted/about/rules.json` → **HTTP 403** (block page, not JSON)
- `curl` on `api.reddit.com` → **HTTP 403**
- Redlib/Libreddit mirrors (`redlib.catsarch.com`, `safereddit.com`, `libreddit.privacydev.net`) → 403 / Anubis challenge / 502

**⚠️ DO NOT PRESENT ANY r/selfhosted RULE AS A VERIFIED QUOTE.** Everything below is
search-summary level and needs re-verification with browser access.

⚠️ Search-derived only:

- r/selfhosted reportedly permits self-promotion **"when relevant"** — contextual, not a blanket ban, not confined to a weekly thread.
- General Reddit landscape: _"A subreddit can forbid promotion entirely, confine it to a weekly thread, or allow it freely, and those local rules always win."_ Weekly-thread patterns cited elsewhere: "Share Your SaaS", "Promote Your Business", "Marketing Monday".
- One study (<https://oneup.today/blogs/reddit-selfpromo-rules-study-2026>) claims it checked 49 subreddits founders pitch in and **61% ban self-promotion**. Unverified.
- The "9:1 rule" (nine contributions per promotional post) is folklore Reddit no longer formally publishes.

**Indirect evidence that r/selfhosted matters for this category (this IS verified):** HN submissions
have linked to r/selfhosted threads as newsworthy in their own right —
`Budibase Will Soon Limit Users on OSS Self Hosted Version` links to
`old.reddit.com/r/selfhosted/comments/17v48t8/...` ([38277920](https://news.ycombinator.com/item?id=38277920)),
and Appwrite's realtime-API announcement was submitted to HN **as a Reddit link**
([28407052](https://news.ycombinator.com/item?id=28407052)). **r/selfhosted threads demonstrably
surface into HN.**

**Subreddit shortlist for a self-hosted no-code portfolio builder** ⚠️ _subscriber counts NOT
verified — must be checked_: `r/selfhosted` (primary — the category's centre of gravity),
`r/opensource`, `r/webdev`, `r/SideProject`, `r/nocode`, `r/InternetIsBeautiful`, `r/Portfolios`
_(note: likely `r/Portfolios`, not `r/Portfolio` — unverified)_, `r/webdesign`, `r/homelab`,
`r/degoogle` / `r/privacy` (if privacy is a positioning angle).

---

## 6b.12 ⚠️ NO GOOD COMPARABLE EXISTS FOR "PORTFOLIO BUILDER"

Searches of Show HN for `portfolio builder` / `no-code website builder` / `self-hosted portfolio`
returned **essentially nothing in-category**. The closest is `Show HN: Makers.so – A website builder
inside Figma` (180/45, 2022-02-10).

**This category has no established HN launch precedent.** That cuts both ways: no proven playbook,
but also no saturation. Cross-reference §6.4 — HN does not reward _"a tool for making portfolios"_
(Postcard 140, portfolo.app 47) but massively rewards _"look at this astonishing portfolio I made"_
(Windows XP portfolio, **1032**).

---

## 6b.13 SUMMARY OF UNVERIFIED ITEMS IN THE LAUNCH RESEARCH

1. **All Reddit rules and subreddit sizes** — hard-blocked at the network level. Highest-priority gap.
2. **Dub.co's Product Hunt numbers** (1,085 upvotes, 663 signups, "responded to all 210 comments") — second-hand only.
3. **Plausible's "60% of traffic from HN"** — source returned HTTP 403.
4. **Whether an awesome-selfhosted listing drives measurable traffic** — no first-party analytics found. Unproven.
5. **GitHub Trending's algorithm** — never published; all descriptions are community inference.
6. **Several CMU fake-stars figures** (15,835 repos, 60% malware, GitHub's purge percentages) — press coverage, not paper text.
7. **The n8n licence backlash** — n8n's own "fair-code" posts were found (all ≤4 points, e.g. [41180569](https://news.ycombinator.com/item?id=41180569), [29553242](https://news.ycombinator.com/item?id=29553242)) but **no significant HN backlash thread**. If a backlash existed, it wasn't on HN.

---

# 7. DOCUMENTATION SITES

**Method:** every row was verified either by fetching the live page (raw HTML via `curl`, checking
`<meta name="generator">` and asset markers) **or** by reading the config file in the project's
GitHub repo via the authenticated `gh` CLI. Where only one method worked, it is stated.

## 7.1 The tooling table

| Project         | Docs URL                                             | Tool                                    | How verified                                                                                                                                                                                                                                                               |
| --------------- | ---------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supabase**    | supabase.com/docs                                    | **Custom Next.js** (`@next/mdx`)        | `gh api repos/supabase/supabase/contents/apps/docs/next.config.mjs` → FOUND. Deps: `"@next/mdx": "15.3.1"`, `"next": "^15.5.21"`, `"next-mdx-remote-client"`, `"@supabase/supa-mdx-lint"`. No docs framework anywhere.                                                     |
| **Cal.com**     | cal.com/docs → `/docs/api-reference/v2/introduction` | **Mintlify (hosted)**                   | Live HTML `<meta name="generator" content="mintlify">`; 78× `mintlify`, 15× `mintcdn`. ⚠️ _Repo config not located_ — `calcom/docs` is a stale Markdoc site.                                                                                                               |
| **Ghost**       | ghost.org/docs/ → **301 → docs.ghost.org**           | **Mintlify (hosted)**                   | `<meta name="generator" content="mintlify">`; 969× `mintlify`. Repo: `gh api repos/TryGhost/docs/contents/docs.json` → FOUND (**docs.json**, newer config name)                                                                                                            |
| **Plausible**   | plausible.io/docs                                    | **Docusaurus v3.9.2**                   | `<meta name="generator" content="docusaurus v3.9.2">` — exact version in live HTML                                                                                                                                                                                         |
| **Umami**       | umami.is/docs → 307 → **docs.umami.is/docs**         | **Fumadocs** (Next.js 16)               | `gh api repos/umami-software/docs/contents/package.json` → `"fumadocs-core": "16.0.7"`, `"fumadocs-mdx": "13.0.5"`, `"fumadocs-ui": "16.0.7"`, `"next": "16.0.7"`                                                                                                          |
| **Directus**    | directus.io/docs → **directus.com/docs/**            | **Nuxt + @nuxt/content v3** (custom)    | Separate repo `directus/docs`: `nuxt.config.ts`, `content.config.ts`, `.nuxtrc`. Deps `"@nuxt/content": "3.13.0"`, `"@nuxt/ui": "^4.6.1"`, `"@nuxtjs/mcp-toolkit"`                                                                                                         |
| **Appwrite**    | appwrite.io/docs                                     | **Custom SvelteKit**                    | 130× `svelte`, 14× `_app/immutable`. `gh api repos/appwrite/website/contents/svelte.config.js` → FOUND                                                                                                                                                                     |
| **PocketBase**  | pocketbase.io/docs/                                  | **Custom SvelteKit**                    | 171× `svelte`, 22× `_app/immutable`. Repo `pocketbase/site`; docs are hand-written `.svelte` files at `src/routes/(app)/docs/`. Client-rendered (SSR HTML only 25 KB)                                                                                                      |
| **Coolify**     | coolify.io/docs/                                     | **Fumadocs** (TanStack Start + Vite)    | `gh api repos/coollabsio/coolify-docs/contents/package.json` → `"fumadocs-core": "16.8.5"`, `"fumadocs-mdx": "14.2.11"`, `"fumadocs-ui": "16.8.5"`, `"fumadocs-openapi": "10.8.1"`, `@tanstack/react-start`, `vite`, `@orama/orama`. **Recently migrated — was VitePress** |
| **n8n**         | docs.n8n.io                                          | **GitBook**                             | `<meta name="generator" content="gitbook (634a24f)">`; 832× `gitbook`. Repo has `.github/workflows/gitbook-preview-links.yml` and **no `mkdocs.yml`** — **migrated from MkDocs Material**                                                                                  |
| **Formbricks**  | formbricks.com/docs                                  | **Mintlify** (on their own domain)      | `<meta name="generator" content="mintlify">`. Repo: **`docs/docs.json`** FOUND                                                                                                                                                                                             |
| **Documenso**   | docs.documenso.com                                   | **Fumadocs** (Next.js 16)               | `gh api repos/documenso/documenso/contents/apps/docs/package.json` → `"fumadocs-core": "16.5.0"`, `"fumadocs-ui": "16.5.0"`, `"next": "16.2.6"`. Has `apps/docs/source.config.ts`                                                                                          |
| **Twenty CRM**  | twenty.com/developers → **docs.twenty.com**          | **Mintlify**                            | `<meta name="generator" content="mintlify">`; 976× `mintlify`. Repo: **`packages/twenty-docs/docs.json`** FOUND                                                                                                                                                            |
| **Trigger.dev** | trigger.dev/docs                                     | **Mintlify**                            | `<meta name="generator" content="mintlify">`; 180× `mintcdn`. Repo: **`docs/docs.json`** FOUND                                                                                                                                                                             |
| **Novu**        | docs.novu.co                                         | **Mintlify**                            | `<meta name="generator" content="mintlify">`; 958× `mintlify`. Repo: **`docs/docs.json`** + `docs/.mintlify/` + `docs/.mintignore`                                                                                                                                         |
| **Infisical**   | infisical.com/docs/…                                 | **Mintlify**                            | `<meta name="generator" content="mintlify">`. Repo: **`docs/docs.json`** FOUND                                                                                                                                                                                             |
| **Typebot**     | docs.typebot.io → **docs.typebot.com**               | **Mintlify**                            | `<meta name="generator" content="mintlify">`; 970× `mintlify`. Repo: **`apps/docs/mint.json`** — the _older_ config filename, the only one in the set still on it                                                                                                          |
| **Budibase**    | docs.budibase.com                                    | **ReadMe.com (hosted)**                 | 120× `readme.io` asset references in live HTML. ⚠️ _Live-HTML markers only — config lives in ReadMe's dashboard_                                                                                                                                                           |
| **NocoDB**      | docs.nocodb.com → **nocodb.com/docs/product-docs**   | **Fumadocs**                            | 87× `fd-` and 77× `nd-` CSS class prefixes (`fd-muted-foreground`, `fd-toc-width`) — Fumadocs UI's namespaced classes. Content repo `nocodb/noco-docs`. **The old `packages/noco-docs` Docusaurus setup is GONE**                                                          |
| **Outline**     | docs.getoutline.com                                  | **Outline itself (dogfooding)**         | Live HTML is the Outline app shell: `<title>Outline</title>`, `<meta name="slack-app-id" content="A0W3UMKBQ">`, `window.env`, React SPA, 12.7 KB. ⚠️ _Inference from the app shell — strong but not config-confirmed_                                                      |
| **Excalidraw**  | docs.excalidraw.com                                  | **Docusaurus v2.2.0**                   | `<meta name="generator" content="docusaurus v2.2.0">`. Notably an **old v2** — unmaintained relative to the rest                                                                                                                                                           |
| **Penpot**      | help.penpot.app/technical-guide/                     | **Eleventy (11ty)**, custom static site | `gh api repos/penpot/penpot-docs/contents/.eleventy.js` → FOUND. Live HTML: `/feed/feed.xml`, `/feed/feed.json` (classic Eleventy feed plugin), plain `/css/index.css` + `/css/prism.css`                                                                                  |
| **Mattermost**  | docs.mattermost.com                                  | **Sphinx + Furo theme**                 | `gh api repos/mattermost/docs/contents/source/conf.py` → FOUND. 32× `_static`, 9× `furo`, 4× `sphinx`, `documentation_options`. The only Python-toolchain docs site in the set                                                                                             |

## 7.2 ⭐ Tooling tally

| Tool                    | Count | Projects                                                                                      |
| ----------------------- | ----: | --------------------------------------------------------------------------------------------- |
| **Mintlify** (hosted)   | **8** | Cal.com, Ghost, Formbricks, Twenty, Trigger.dev, Novu, Infisical, Typebot                     |
| **Fumadocs**            | **4** | Umami, Coolify, Documenso, NocoDB                                                             |
| **Custom build**        | **4** | Supabase (Next.js+MDX), Appwrite (SvelteKit), PocketBase (SvelteKit), Directus (Nuxt Content) |
| **Docusaurus**          | **2** | Plausible (v3.9.2), Excalidraw (v2.2.0)                                                       |
| GitBook                 |     1 | n8n                                                                                           |
| ReadMe.com              |     1 | Budibase                                                                                      |
| Eleventy                |     1 | Penpot                                                                                        |
| Sphinx/Furo             |     1 | Mattermost                                                                                    |
| Self-hosted own product |     1 | Outline                                                                                       |
| **Nextra**              | **0** | — none                                                                                        |
| **VitePress**           | **0** | — none _(Coolify was VitePress; now Fumadocs)_                                                |
| **Astro Starlight**     | **0** | — none                                                                                        |
| **Docsify**             | **0** | — none                                                                                        |

**Headline signals:**

- **Mintlify dominates the VC-backed dev-tool tier (8/23).**
- **Fumadocs is the clear challenger and is NEWER in every case** — Coolify migrated off VitePress; NocoDB migrated off Docusaurus.
- Mintlify's config filename has migrated **`mint.json` → `docs.json`**; only Typebot is still on `mint.json`.
- **Nobody in this set uses Nextra, VitePress, Starlight or Docsify today.**
- **Migration direction observed:** MkDocs → GitBook (n8n) · VitePress → Fumadocs (Coolify) · Docusaurus → Fumadocs (NocoDB).

---

## 7.3 ⭐⭐ "GETTING STARTED" FOR NON-TECHNICAL PEOPLE

### A. PocketBase — the gold standard for "one binary, no prerequisites"

**URL:** <https://pocketbase.io/docs/> · _Source read from `pocketbase/site` → `src/routes/(app)/docs/+page.svelte` because the page is client-rendered._

**Opening paragraph, verbatim:**

> "PocketBase is an open source backend consisting of embedded database (SQLite) with realtime subscriptions, builtin auth management, convenient dashboard UI and simple REST-ish API. It can be used both as Go framework and as standalone application."

**⭐ Structure — there are NO numbered headings.** The entire getting-started is four short
paragraphs and a download widget. In order:

1. **A red warning callout — the FIRST thing on the page, above the intro:**
   > "Please keep in mind that PocketBase is still under active development and full backward compatibility is not guaranteed before reaching v1.0.0. PocketBase is NOT recommended for production critical applications yet, unless you are fine with reading the changelog and applying some manual migration steps from time to time."
2. The intro paragraph (above).
3. > "The easiest way to get started is to download the prebuilt minimal PocketBase executable:"

   Then a tabbed widget — tabs are **`x64`** and **`ARM64`** — each listing three links: _"Download {version} for Linux x64"_, _"…for Windows x64"_, _"…for macOS x64"_, each annotated with the zip size (`~{N}MB zip`). **Architecture is auto-detected from the user agent** (`window.UA_ARCHITECTURE`).

4. > "See the GitHub Releases page for other platforms and more details."
5. `<hr />`, then the run step:
   > "Once you've extracted the archive, you could start the application by running `./pocketbase serve` in the extracted directory."
6. > "**And that's it!** The first time it will generate an installer link that should be automatically opened in the browser to set up your first superuser account (you can also create the first superuser manually via `./pocketbase superuser create EMAIL PASS`)."
7. > "The started web server has the following default routes:" — `http://127.0.0.1:8090` ("if `pb_public` directory exists, serves the static content from it"), `…/_/` ("superusers dashboard"), `…/api/` ("REST-ish API")
8. > "The prebuilt PocketBase executable will create and manage 2 new directories alongside the executable:" — `pb_data` ("stores your application data, uploaded files, etc.") and `pb_migrations` ("contains JS migration files with your collection changes")
9. > "You could find all available commands and their options by running `./pocketbase --help`"

**Order of options presented:** **prebuilt binary download ONLY.** No hosted signup (they have
none), no Docker, no one-click deploy, no source build on this page.
**⭐ The word "install" never appears — there is nothing to install.**

**The design lesson:** the entire happy path is **download → extract → `./pocketbase serve` → the
browser opens itself.** Three actions. The architecture tab is auto-selected so a non-technical
reader never has to know what "ARM64" means. And the _first_ thing on the page is an honest warning
that lowers expectations.

---

### B. ⭐⭐ Ghost — persona-split NAVIGATION, not persona-split docs

**URL:** <https://ghost.org/docs/> → **301 → <https://docs.ghost.org/>**

**Note the title: "Getting Started With Ghost - Ghost Developer Docs".** The docs site is explicitly
branded _**Developer**_ Docs, and the non-technical audience is routed elsewhere entirely.

**Page structure, verbatim, in order:**

- H1 area: **"Getting Started with Ghost"** — subtitle _"Learn how to build and develop beautiful, independent publications"_
- Card 1: **"Developer install guide"** — _"Follow our setup guides for any platform, from local development to production environments."_ → CTA _"Get Started →"_
  - Directly under it, a tab strip in this literal order: **`Ghost(Pro)` · `Ubuntu` · `Local` · `Docker`**
- Card 2: **"Platform guide"** — _"A detailed overview of Ghost's architecture & configuration."_ → _"Read the docs"_
- Card 3: **"Migration guide"** — _"Import your content, members and payments from other platforms."_ → _"Import data"_
- Card 4: **"Theme guide"** — _"A full guide to building custom designed templates for your site."_ → _"Start building"_
- Section: **"Developer resources"** → "Starter theme framework", "Ghost API documentation", "JAMstack front-end frameworks"
- Section: **"Changelog"**
- Section: **"Community"** → GitHub (_Source code and releases_), Developer forum (_Official community_), Reddit (_News and highlights_), Twitter (_Bite-size updates_)

**Order of install options: Ghost(Pro) (hosted) FIRST**, then Ubuntu (production self-host), then
Local, then Docker. The hosted option is the leftmost tab.

**The non-technical split — <https://ghost.org/help/>** — titled **"Ghost Help Center"**, three categories:

1. **"Ghost manual"** — _"Everything you need to know to customize your site, publish content & launch memberships."_
2. **"Ghost(Pro)"** — _"Help articles for Ghost(Pro) customers for billing, login issues, custom domains, and more."_
3. **"FAQ"** — _"Answers to some of the most commonly asked questions about Ghost."_

**⭐ Ghost's audience segmentation is in the TOP NAV ITSELF** (verbatim from ghost.org HTML):

- **"For Creators"** — _"YouTubers, bloggers, podcasters, musicians & artists"_
- **"For Publishers"** — _"Writers, journalists, local news and new media outlets"_
- **"For Business"** — _"Modern brands & companies with ambitious content marketing"_
- **"For Developers"** — _"Source code, documentation, guides and tutorials"_

**⭐⭐ THIS IS THE SINGLE MOST TRANSFERABLE PATTERN IN THE RESEARCH:** Ghost does not write one set
of docs for everyone. **It splits the NAVIGATION by persona first, and only one of the four personas
is sent to `docs.ghost.org`.** The other three go to `ghost.org/help`.

---

### C. Coolify — leads with cloud, and explicitly manages expectations about difficulty

**URL:** <https://coolify.io/docs/get-started/introduction>

**Opening, verbatim:**

> ### What is Coolify?
>
> "Coolify is a software that makes self-hosting simple and powerful. It lets you run your applications, databases, and services on your own server, whether that's an old laptop, a Raspberry Pi, or a rented server from a provider like Hetzner.
>
> With Coolify, you get full control over your projects, your data, and your costs. **It's completely free to use, open-source, and has no features locked behind a paywall.**
>
> Think of Coolify as your personal alternative to cloud platforms like Vercel, Railway, or Heroku, but without the huge bills or privacy trade-offs."

**⭐ Then — the unusual bit — a section titled "What Coolify Is Not":**

> "Coolify isn't a cloud service that hosts everything for you, you need your own server. That could be your old laptop, a Raspberry Pi, or a rented server from a hosting provider like Hetzner, and you'll need SSH access to use it.
>
> **It's not a zero-effort solution either**, if you choose to self-host, you'll need to set up your server and install Coolify. But once it's running, managing your projects becomes very easy."

Intro-page headings in order: **"What is Coolify?"** → **"What Coolify Is Not"** → "Features of
Coolify" (table) → "Benefits of Using Coolify" (table) → "Getting Started with Coolify".

**URL:** <https://coolify.io/docs/installation> (→ `/docs/get-started/installation`)

**The very first line of the installation page, before any heading:**

> "If you decide to go with Coolify Cloud, there's no installation required. Simply visit Coolify Cloud Registration to create an account and start using Coolify within minutes!
>
> Below, you'll find instructions for installing Coolify if you prefer to self-host it."

Then, headings verbatim in order:

1. **"Self-hosted Installation"** — _"If you like taking control and managing everything yourself, self-hosting Coolify is the way to go. It's completely free (apart from your server costs) and gives you full control over your setup."_
   - "Quick Installation (recommended):" → `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash`
   - _"Run this script in your terminal, and Coolify will be installed automatically."_
   - "Note for Ubuntu Users: The automatic installation script only works with Ubuntu LTS versions (20.04, 22.04, 24.04)…"
2. **"Before You Begin"**
3. **"1. Server Requirements"** — "A VPS", "A Dedicated Server", "A Virtual Machine (VM)", "A Raspberry Pi", "Or any other server with SSH access" + "Note: It's best to use a fresh server for Coolify to avoid any conflicts" + "Tip: If you haven't picked a server provider yet, consider using Hetzner."
4. **"2. Supported Operating Systems"** — Debian-based, Redhat-based, SUSE-based, Arch, Alpine, Raspberry Pi OS 64-bit

**⭐ Order: Cloud (no install) FIRST → one-line curl → manual install.** Coolify is the only project
with numbered `1.` `2.` prerequisite headings placed **after** the quick path — you see the
one-liner before you see the requirements.

---

### D. ⚠️ Umami — the COUNTER-EXAMPLE: leads with a source build

**URL:** <https://umami.is/docs/install> → 307 → **<https://docs.umami.is/docs/install>**

**Opening paragraph, verbatim:**

> ### Installation
>
> "There are several different ways to install Umami."

Bulleted menu in this literal order: "Installing from source: Get the code from GitHub and build the
application yourself." · "Using Docker compose" · "Using a Docker image" · "Using Kubernetes with
HelmForge".

**Headings verbatim, in order:**

1. **"Installing from source"**
2. **"Requirements"** — "A server with Node.js version 18.18 or newer." / "A database. Umami supports PostgreSQL (minimum v12.14)." + "We recommend configuring the PostgreSQL database to use the UTC timezone."
3. **"Install pnpm"** → `npm install -g pnpm`
4. **"Get the source code and install packages"** → `git clone …` / `cd umami` / `pnpm install`
5. **"Configure Umami"** → "Create an .env file with the following" `DATABASE_URL={connection url}`
6. **"Build the application"** → `pnpm build` — "The first time the build is run, it will create all the required database tables… It will also create a login account with username `admin` and password `umami`."
7. **"Start the application"** → `pnpm start` — "By default this will launch the application on http://localhost:3000."
8. **"Running Umami"** → PM2 (`pnpm add -g pm2` / `pm2 start "pnpm start" --name umami` / `pm2 startup` / `pm2 save`)
9. **"Installing with Docker"** → `docker compose up -d` — "The default login credentials are username `admin` and password `umami`." + **"Important: Change the default password immediately after your first login."**

**⚠️ Order: source build FIRST, Docker LAST, cloud not mentioned at all on this page.** This is the
**least** non-technical-friendly ordering in the set — a non-developer hits `npm install -g pnpm` as
step one. Umami Cloud is only surfaced on the marketing site and pricing page.

---

### E. Budibase & Typebot — the no-code targets

**Budibase** — <https://docs.budibase.com/docs/quickstart>
Opening: _"Using our internal database to hit the ground running"_ / _"This tutorial will take less
than 5 minutes, and at the end, you will have successfully built a complete CRUD application."_
Main headings in order: **Getting started → Agents → Data → External datasource → Apps →
Autogenerated screens → Components → Blocks → Preview and Publish → Automate → Settings → Further
exploration → The Budibase community**
Getting-started steps: (1) Create account at `account.budibase.app/register`, (2) Log in,
(3) Step through the workspace wizard, selecting Budibase Sample data.
**Order: cloud signup FIRST. Self-hosting is not on the quickstart at all.**
⚠️ _Page is client-rendered; heading list reliable, prose outside the marked quotes lightly paraphrased._

**Typebot** — <https://docs.typebot.com/get-started/introduction>
Opening paragraph, verbatim: _"Typebot is a **fair source** chatbot builder. It allows you to create
conversational apps/forms (Lead qualification, Customer support, Product launch, User onboarding, AI
chats), deploy it on your website or WhatsApp number, and collect results in real time."_
Cards in order: **Welcome 👋 → Learn Concepts → Deploy your bots → Contribute → Self-hosting**.
Sidebar top level: Get Started / Learn / Self-Hosting / Contribute / API Reference.
**Order: no explicit cloud-vs-self-host ordering** — self-hosting is one of several peer cards.
**Note the licence framing is in the FIRST SENTENCE: "a fair source chatbot builder."**

**NocoDB** — <https://nocodb.com/docs/product-docs> — Fumadocs-rendered, content repo
`nocodb/noco-docs`. ⚠️ _Verbatim numbered quickstart not extracted — flagged as not fully verified._

---

## 7.4 ⭐ One-click deploy buttons — the actual inventory (much smaller than reputation suggests)

READMEs of 13 projects were grepped via `gh api repos/<x>/readme`. **Only TWO ship one-click deploy
buttons.** The practice has largely died out in this cohort in favour of Docker + docs.

**Documenso** — the widest set, 4 targets. Section heading is literally `### One-Click Deploys`:

```markdown
## Self Hosting

We support a variety of deployment methods including Docker, Docker Compose, Railway, Kubernetes, and manual deployment.

For full instructions, requirements, and configuration details, see the [Self Hosting documentation](https://docs.documenso.com/docs/self-hosting).

### One-Click Deploys

#### Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/DjrRRX?referralCode=EZR3s0&utm_medium=integration&utm_source=template&utm_campaign=generic)

#### Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/documenso/documenso)

#### Koyeb

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/documenso/documenso&branch=main&name=documenso-app&builder=dockerfile&dockerfile=/docker/Dockerfile)

#### Elestio

[![Deploy on Elestio](https://elest.io/images/logos/deploy-to-elestio-btn.png)](https://elest.io/open-source/documenso)
```

Targets: **Railway, Render, Koyeb, Elestio.** ⚠️ Note the Railway link carries `referralCode=EZR3s0`
— **the deploy button doubles as an affiliate link.**

**Directus** — one target, own top-level section with an emoji heading:

```markdown
## ⚡ One-Click Deployment Options

### Deploy on Railway

One click. Fully provisioned with PostgreSQL, Redis, and S3-compatible storage, connected via Railway's private network.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.com/deploy/directus-official?referralCode=b2RDZT)
```

Also carries a referral code (`b2RDZT`). Immediately _above_ it, Directus leads with hosted:
_"**All-in-one solution:** Database, storage, and auto-scaling included with a global CDN"_ /
_"**Simple setup:** Select a region and get a running instance immediately"_ → `[Create a Directus
Cloud Project](https://directus.cloud)`.

**Appwrite** — no button, but a **DigitalOcean Marketplace** listing linked with a logo tile:
`https://marketplace.digitalocean.com/apps/appwrite`

**Infisical** — no buttons; a two-column comparison table in the README instead:

> `| Use Infisical Cloud | Deploy Infisical on premise |`
> "The fastest and most reliable way to get started with Infisical is signing up for free to [Infisical Cloud](https://app.infisical.com/login)."

**Trigger.dev** — no buttons: _"The quickest way to get started is to create an account and project
in our [web app](https://cloud.trigger.dev), and follow the instructions in the onboarding. Build and
deploy your first task in minutes."_

**No deploy buttons found in:** Umami, Formbricks, Novu, Typebot, NocoDB, Outline, Twenty, Plausible.

**Deploy-target frequency:** Railway ×2 · Render ×1 · Koyeb ×1 · Elestio ×1 · DigitalOcean
Marketplace ×1. **Zero "Deploy to Vercel" buttons, zero Heroku, zero Fly.io in this cohort.**

---

## 7.5 Diátaxis — the framework, verbatim

<https://diataxis.fr> · subtitle: **"A systematic approach to technical documentation authoring."**

> "Diátaxis is a way of thinking about and doing documentation."
> "It prescribes approaches to content, architecture and form that emerge from a systematic approach to understanding the needs of documentation users."
> "Diátaxis identifies four distinct needs, and four corresponding forms of documentation - tutorials, how-to guides, technical reference and explanation. It places them in a systematic relationship, and proposes that documentation should itself be organised around the structures of those needs."
> "Diátaxis, from the Ancient Greek δῐᾰ́τᾰξῐς: dia ('across') and taxis ('arrangement')."
> "Diátaxis solves problems related to documentation content (what to write), style (how to write it) and architecture (how to organise it)."
> "As well as serving the users of documentation, Diátaxis has value for documentation creators and maintainers. It is light-weight, easy to grasp and straightforward to apply."

### The four categories — verbatim opening lines

**1. Tutorials** — <https://diataxis.fr/tutorials/>

> "A tutorial is an experience that takes place under the guidance of a tutor. **A tutorial is always learning-oriented.**
> A tutorial is a practical activity, in which the student learns by doing something meaningful, towards some achievable goal.
> A tutorial serves the user's acquisition of skills and knowledge - their study. **Its purpose is not to help the user get something done, but to help them learn.**
> A tutorial in other words is a lesson."

> "A good lesson gives the learner confidence, by showing them that they can be successful in a certain skill or with a certain product."

**2. How-to guides** — <https://diataxis.fr/how-to-guides/>

> "How-to guides are directions that guide the reader through a problem or towards a result. **How-to guides are goal-oriented.**
> A how-to guide helps the user get something done, correctly and safely; it guides the user's action."

> "Examples could be: how to calibrate the radar array; how to use fixtures in pytest… On the other hand, how to build a web application is not - that's not addressing a specific goal or problem, it's a vastly open-ended sphere of skill."

> "**How-to guides matter not just because users need to be able to accomplish things: the list of how-to guides in your documentation helps frame the picture of what your product can actually do. A rich list of how-to guides is an encouraging suggestion of a product's capabilities.**"

> "Well-written how-to guides that address the right questions are likely to be the most-read sections of your documentation."

**3. Reference** — <https://diataxis.fr/reference/>

> "Reference guides are technical descriptions of the machinery and how to operate it. **Reference material is information-oriented.**"
> "The only purpose of a reference guide is to describe, as succinctly as possible, and in an orderly way. Whereas the content of tutorials and how-to guides are led by needs of the user, reference material is led by the product it describes."
> "Your users need reference material because they need truth and certainty - firm platforms on which to stand while they work."
> "Reference material describes the machinery. **It should be austere.**"

**4. Explanation** — <https://diataxis.fr/explanation/>

> "Explanation is a discursive treatment of a subject, that permits reflection. **Explanation is understanding-oriented.**"
> "Explanation deepens and broadens the reader's understanding of a subject. It brings clarity, light and context."
> "For the user, explanation joins things together. It's an answer to the question: Can you tell me about …?"
> "It's documentation that it makes sense to read while away from the product itself (one could say, explanation is the only kind of documentation that it might make sense to read in the bath)."

### The Diátaxis compass — <https://diataxis.fr/compass/> (verbatim from the HTML table)

| If the content…   | …and serves the user's… | …then it must belong to… |
| ----------------- | ----------------------- | ------------------------ |
| informs action    | acquisition of skill    | **a tutorial**           |
| informs action    | application of skill    | **a how-to guide**       |
| informs cognition | application of skill    | **reference**            |
| informs cognition | acquisition of skill    | **explanation**          |

> "The Diátaxis compass is something like a truth-table or decision-tree of documentation. It reduces a more complex, two-dimensional problem to its simpler parts, and provides the author with a course-correction tool."

### Why exactly four — <https://diataxis.fr/foundations/>

> "A skill or craft or practice contains both **action** (practical knowledge, knowing how, what we do) and **cognition** (theoretical knowledge, knowing that, what we think)."
> "…the relationship of a practitioner with their practice is that it is something that needs to be both **acquired**, and **applied**."
> "This is a complete map. There are only two dimensions, and they don't just cover the entire territory, they define it. **This is why there are necessarily four quarters to it, and there could not be three, or five. It is not an arbitrary number.**"

⚠️ **GAP FLAGGED:** no third-party _critique_ of Diátaxis (e.g. arguments that it under-serves
non-technical audiences) was gathered — the web-search budget was exhausted. Diátaxis itself is
fully documented above.

---

## 7.6 Docs caveats

- **Cal.com** tooling verified from the live `<meta name="generator">` only; the `calcom/docs` repo is a stale Markdoc site and the live `docs.json`/`mint.json` was not located.
- **Budibase** = ReadMe.com, verified from 120 `readme.io` asset references; no repo config exists to check (hosted SaaS).
- **Outline** docs = an Outline instance, inferred from the app shell. Strong but not config-confirmed.
- **NocoDB** quickstart structure not extracted verbatim.

---

# 8. PRICING PAGE WHEN EVERYTHING IS FREE

## 8.1 ⭐ PocketBase — the purest case: no pricing page, no donate link, NOTHING

**Nav, literally and completely:** `FAQ` | `Documentation`. That is the entire top nav. (A version
badge `PocketBase v0.39.10` and a `Go / JavaScript` toggle sit beside it.)

**Footer, literally:** `FAQ` `Discussions` `Documentation` `JavaScript SDK` `Dart SDK` `PocketBase` —
then _"© 2023-2026 PocketBase. The Gopher artwork is from marcusolsson/gophers"_ — then
**"Crafted by Gani"**.

**⭐ Every `href` on the homepage and FAQ was grepped for
`sponsor|donate|patreon|opencollective|buymeacoffee|ko-fi|pricing|paypal`. Result: ZERO matches on
both pages.** The only outbound links are five GitHub URLs.

`gh api repos/pocketbase/pocketbase/contents/.github/FUNDING.yml` → **no FUNDING.yml**, so GitHub's
Sponsor button is not enabled either. Licence: **MIT**.

**How the author frames sustainability — FAQ item 0, "Why?", verbatim:**

> "PocketBase was created to assist building self-contained applications that can run on a single server without requiring to install anything in addition.
>
> The basic idea is that the common functionality like crud, auth, files upload, auto TLS, etc. are handled out of the box, allowing you to focus on the UI and your actual app business requirements.
>
> **Please note that PocketBase is neither a startup, nor a business. There is no paid team or company behind it. It is a personal open source project with intentionally limited scope and developed entirely on volunteer basis. There are no promises for maintenance and support beyond what is already available** (you can explore the Roadmap to get a general idea where the project is headed but there are no fixed ETAs).
>
> If you don't have the time to at least skim through the documentation and you plan to solely rely on some AI tool, then please do NOT use PocketBase!"

**FAQ item 1, "Do you offer hosting?", verbatim:**

> "**No. PocketBase is self-hosted only.** If you are looking for free options for small PoC and hobby apps, you can check:" — Google Cloud Free Tier, Oracle Cloud Always Free ("note: there were unconfirmed reports for randomly deleted 'inactive' accounts"), IBM LinuxONE — then _"For a more traditional setup you can use any VPS provider that comes with a persistent storage, like: Hetzner, Vultr, UpCloud, Linode, etc."_

**FAQ item 2, "Does it scale?", verbatim:**

> "Only on a single server, aka. vertical. Most of the time, you may not need the complexity of managing a fleet of machines and services just to run your backend."
> "Even without optimizations, PocketBase can easily serve 10 000+ persistent realtime connections on a cheap $4 Hetzner CAX11 VPS (2vCPU, 4GB RAM)."

**⭐ THE PATTERN:** instead of a Pricing page there is an **FAQ whose item 0 is "Why?"** and whose
item 1 is **"Do you offer hosting? — No."** It converts the entire commercial question into an
expectations-management document, and it **lowers expectations aggressively** ("no promises", "please
do NOT use PocketBase"). **Trust comes from under-promising, not from a pledge.**

_(Cross-reference §6b.8: `Pocketbase lost its funding from FLOSS fund` — 125 pts / 101 comments,
2026-02-18. The zero-ask model has a visible failure mode.)_

---

## 8.2 Excalidraw — free core + Excalidraw+

`excalidraw.com` **is the app** (a 6.8 KB SPA shell, no marketing copy). The marketing site is
**plus.excalidraw.com**.

**Nav on plus.excalidraw.com, literally:** `Pricing` | `Teams` | `Roadmap` | `Resources` | discord |
github | `Sign in` | **`Free whiteboard`**
**⭐ The rightmost / most prominent CTA on the PAID site is "Free whiteboard" — the paid site's
primary button sends you to the free product.**

**The free/paid split — the section is literally headed "Say hi to Excalidraw":**

> ### Say hi to Excalidraw
>
> ### Free & Open source
>
> ### No account is needed. Just start drawing.
>
> `Start drawing` `Try Plus` — _"14 days of free trial"_

Eyebrow badges used down the page, verbatim: `open-source`, `easy to use`, `real-time collaboration`,
**`available in free editor`**, **`no sign-up`**.

**Pricing page — <https://plus.excalidraw.com/pricing>**

> ### Pricing made simple
>
> `Monthly` / `Annually` — _"save 14 %"_

**Free tier:**

> ### Free
>
> **"Free forever"** ← _the price line is the words, not "$0"_
> `Draw now`
>
> - "Full editor functions"
> - "1 infinite scene"
> - "Unlimited collaborators"
> - "Export to .png, .svg or 'save to file'"
> - "Notion, Obsidian and other integrations"
> - "Libraries"
> - "E2EE locally in your browser"
> - **"Open-source software for devs"**

**Plus tier:** "$6 a month per user" · `Try for free` — "14 days of free trial" · "Everything in Free +"

**⭐ Three mechanisms that stop the paid tier eroding trust:**

1. The free plan's price line is the literal words **"Free forever"**, not "$0".
2. The free plan lists **eight** features including _"Full editor functions"_ — **the paid tier is positioned as workspace/storage/admin, not as unlocking the drawing tool.**
3. The paid site's top-right CTA is **"Free whiteboard"** — the funnel deliberately leaks to the free product.

**Repo-side ask** — `excalidraw/excalidraw`:

- `.github/FUNDING.yml` contains exactly: `open_collective: excalidraw`
- README licence badge is in the **header block, lines 25-26, above the fold**: `<img alt="Excalidraw is released under the MIT license." src="https://img.shields.io/badge/license-MIT-blue.svg">`
- README feature list line 56: `- 💯 Free & open-source.`
- README section **"## Sponsors & support"**, verbatim ask:

  > "If you like the project, you can become a sponsor at [Open Collective](https://opencollective.com/excalidraw) or use [Excalidraw+](https://plus.excalidraw.com/)."

  **That single sentence is the whole ask — and it offers BUYING THE PRODUCT as an equal alternative to donating.**

---

## 8.3 Umami — self-host free + Umami Cloud, with an honest feature gap

**<https://umami.is/pricing>** — subtitle verbatim:

> "Simple, usage-based pricing for Umami Cloud. Start free, scale as you grow. **Self-hosting is always free.**"

On-page heading: **"Simple usage based pricing"**.

**⭐ FAQ — "What's the difference between Umami Cloud and self-hosting?", verbatim:**

> "Umami is open-source and can be self-hosted for free. Umami Cloud is our managed hosting service that handles infrastructure, updates, and maintenance for you. **Cloud also includes additional features like email reports and the streaming API that are not available in the self-hosted version.**"

**Umami admits on its own pricing page that Cloud has features self-host does not.** It does _not_
claim "no feature is paywalled."

**Other trust-building FAQ copy, verbatim:**

> "Yes, all of your data can be exported from Umami Cloud. You have full ownership of your data at all times… **There is no vendor lock-in — if you ever decide to leave, your data goes with you.**"
> "If you exceed the events included in your plan, additional events are billed at a per-event rate. **Your data collection will not be interrupted and you won't lose any data.**"

**Homepage copy, verbatim:**

> "Understand traffic, campaigns, behavior, conversions, and revenue in one privacy-first, open-source analytics platform. **Self-host or use Umami Cloud.**"
> "**Self-host the open-source platform on your own infrastructure, or use Umami Cloud. Either way, your data is never sold or shared.**"

**No `.github/FUNDING.yml`.** There is a `Pricing` nav item; there is no Donate/Sponsor.

---

## 8.4 ⭐ Plausible — no free tier at all, and they say so plainly

**Nav:** `Why Plausible` / `Who it's for` / `Compare` / `Resources` / **`Pricing`** / `Login` /
`Start free trial`. **Crucially `Pricing` links to `/#pricing`** — an anchor on the homepage, not a
separate page.

**The pricing block (verbatim):**

> ### Traffic based plans that match your growth
>
> "Sign up for 30-day free trial. No credit card required."
> `2 months free` · `Monthly` / `Yearly` · slider "Up to 10k monthly pageviews" (10k → 10M+)

- **Starter — $9/mo** — One site · 3 years data retention · dashboard · Email/Slack reports · GA import · Goals and custom events · Saved Segments · Annotations
- **Growth — $14/mo** — Everything in Starter · Up to 3 sites · Up to 3 team members · Team Management · Shared Links · Embedded Dashboards · Shared Segments · Shared Annotations
- **Business — $19/mo** — Everything in Growth · Up to 10 sites · Up to 10 team members · 5 years retention · Custom Properties · Stats API · Data Studio Connector · Ecommerce revenue attribution · Funnels and user journeys · Consolidated View
- **Enterprise — Custom** — 10+ sites · SSO · Managed Proxy · Scheduled raw event exports · Priority support

**There is no $0 plan.** Only a 30-day trial.

**⭐⭐ The founders' sign-off on the homepage — the single best "why we charge" paragraph found:**

> "We invite you to take a look around, explore our live demo and try Plausible for free. We'd be honored to have you as a customer. Thank you.
> — **Uku and Marko, Co-founders**
>
> **P.S. We're a completely independent, self-funded, bootstrapped and profitable team of 10, running since 2018. No outside investors, no acquisition targets. We choose the subscription business model rather than surveillance capitalism. Our code is open source too, so you're never locked in.** Read more about us."

**Footer strapline:** _"Made and hosted in the EU 🇪🇺 — **Funded entirely by our subscribers.**"_

**The self-hosting page** — `plausible.io/docs/self-hosting` redirects to
`plausible.io/self-hosted-web-analytics`. Section headings verbatim, in order:

1. "What's the difference between Plausible Analytics Cloud and Plausible CE?"
2. **"Self-hosting is a real commitment"**
3. **"How can you be sustainable if you're giving your software for free?"**
4. "Transparency as a key value of privacy focused software"
5. "What license is Plausible Community Edition released under?"
6. "How do I self-host Plausible CE?"

**Intro, verbatim:**

> "The same code runs in two ways. **Plausible Community Edition (CE) is the free, self-hosted, AGPL-licensed release**: you run it on your own server and manage everything yourself. Our managed cloud service handles all of that for you, and **revenue from subscriptions funds the ongoing development of Plausible**."

**⭐ "How can you be sustainable if you're giving your software for free?" — verbatim in full:**

> "Many open source projects are under-resourced and under-funded. Some maintainers sacrifice their financial security to work on their passion. **We do not think that should be required.**
>
> **We released our code on GitHub and made it easy to self-host on principle, not because it is good business.** Plausible CE is free to self-host. **Our only source of funding is the managed cloud service**: subscribers pay us directly, and we use that revenue to pay our team and develop Plausible.
>
> Our business model has nothing to do with collecting personal information from your visitors or selling it to advertisers. Plausible is completely independent and bootstrapped. No outside investment, no surveillance revenue."

**⭐ The honest paywall admission, inside the comparison table, verbatim:**

> Premium features — Cloud: _"All features available as listed in our pricing plans."_ / CE: _"**Marketing funnels, user journeys, ecommerce revenue goals, SSO and sites API are not available to help support the project's long-term sustainability.**"_

**⭐ And an unusually candid ANTI-sales section, "Self-hosting is a real commitment", verbatim:**

> "When you self-host, the work we do for cloud customers becomes your work. You own your backups, your server's uptime, the capacity to handle your traffic, the speed of your dashboard and the filtering that keeps bots out of your stats. **The control that makes self-hosting appealing also makes all of this your responsibility.**"
>
> "Security is the clearest example of work that needs fast action. When we learn of an issue we fix it on Plausible Cloud immediately… On a self-hosted instance that fix only protects you once you apply the release yourself, **so the gap is yours to close.**"
>
> "Plan for this before you install. … **Self-hosting works well when you treat your instance as infrastructure you maintain, not software you install once.**"

**Licence placement:** its **own H2 section phrased as a question**, near the bottom of the
self-hosting page — _"What license is Plausible Community Edition released under?"_ → "…the **GNU
Affero General Public License Version 3 (AGPLv3)** or any later version." **Not in the footer, not
on the homepage.**

⚠️ **`plausible.io/open-startup` and `plausible.io/dashboard` both return HTTP 404** — the historical
"open startup" revenue dashboard **no longer exists**. Remaining public numbers are inline homepage
stats: _"Paying subscribers 20k / Tracked pageviews 260B / Uptime (Last 90 days) 99.99%"_.
_(This corroborates §5.9, which found zero Wayback snapshots for that URL ever.)_

---

## 8.5 ⭐ Ghost — non-profit foundation with LIVE public financials

**Nav:** `Product` · `Explore` · **`Pricing`** · `Sign in` · `Get Started — free`. Footer ends:
**"Ghost Foundation © 2026"**.

**<https://ghost.org/about/> — verbatim, the whole structural explanation:**

> ### We're a non-profit organisation building open source technology for modern publishing.
>
> "Ghost was founded in April 2013 by John O'Nolan & Hannah Wolfe, with a mission to create the best open source tools for independent journalists and writers across the world…"
>
> "Today Ghost powers an incredible range of websites… **We've built a sustainable business around a free core application, funded by a premium managed-service to run it on.**"
>
> "**100,000,000+** Ghost installs to date"
>
> "**We set Ghost up as non-profit foundation so that it would always be true to its users, rather than shareholders or investors. Our legal constitution ensures that the company can never be bought or sold, and one hundred percent of our revenue is reinvested into the product and the community.**
>
> As a public organisation we also believe in being transparent and accountable for everything we do, **so we publish our live financial data for all to see.**"

**"All of our company metrics are public." — "Yes, this is a live feed of our real data."**
Values read from the embedded chart data at fetch time:

- **ARR: $11,055,673** · **Monthly Run Rate: $921,306** · **Net churn: 2.92%** · **Active customers: 30,557** · **Requests/month: 9B** · **Installs: 100M+** · **GitHub stars: 54,701**
- The chart series runs monthly from **Aug 18 ($1,044,284.43)** to **Jul 26 ($11,024,783.53)** — **94 data points publicly embedded in the page HTML**.

**⭐ The virtuous-cycle diagram, verbatim, four steps in order:**

> "We use our revenue to hire amazing developers who build really great, open software" → "Great software attracts people who are excited about using it to publish online" → "People who want the best experience pay for our premium Ghost(Pro) platform" → "The Ghost(Pro) platform generates revenue for the non-profit foundation"

> ### It's a sustainable open source model.
>
> "The more people use Ghost, the more demand there is for our paid service, the more revenue we make, the more great people we can hire to work on Ghost full-time, the better the software gets, the more people use Ghost… and so on. It's a virtuous cycle that allows us to produce open source software and release it for free.
>
> **This sustainable funding model means that we don't rely on any external donations or grant funding. The Ghost Foundation is completely self-sufficient, and is able to employ a wonderful team.**"

**⭐ That last sentence is a direct REJECTION of the donation model, stated on the About page of a
non-profit.**

**<https://ghost.org/pricing/>** — "Ghost(Pro) plans & pricing" / "Launch your creative business" /
_"No payment fees — upgrade, downgrade, or cancel anytime."_ Plans: **Starter $18/mo**, **Publisher
$29/mo**, Business, Custom — priced on a member-count slider.

**⚠️ Where self-hosting appears on the pricing page: essentially nowhere as an _option_.** The full
pricing page was grepped for `self-host|open source|download|github|MIT|free forever`. The only
self-hosting mentions are a feature-comparison row and a $50/mo addon caveat — and the framing is
**adversarial**:

> **Threat & uptime management** — "When you're under attack or the servers catch fire, **if you self-host then you're the one who loses sleep. With Ghost(Pro), we lose sleep!**"

> **Managed Subdirectory Install** — "…this requires customers to run their own self-hosted reverse proxy with a custom configuration. Supporting this setup is non-trivial, and is a $50/month addon only available on our Ghost(Pro) Business plan. **We only recommend this setup for teams who are very comfortable with complex technical infrastructure…**"

"Source code" appears only as a **footer link** under Developers. **The licence is never named on
ghost.org's homepage or pricing page** (0 licence-string matches on both).

---

## 8.6 Coolify — "Free Forever" as the literal price, plus THREE money surfaces in the nav

**Nav, literally and completely:** `Philosophy` | `Contributors` | **`Pricing`** | `Services` |
`Docs` | `Merch` | **`Sponsor Us`** | `Changelog` | `Community (20k+)` | `To Cloud`

Money hrefs: `Pricing → /pricing`, `Merch → shop.coollabs.io`, **`Sponsor Us → /sponsorships`**,
`Refund Policy → coollabs.io/refund-policy/`.

**⭐ KEY STRUCTURAL FINDING: Coolify keeps BOTH a `Pricing` nav item AND a `Sponsor Us` nav item,
side by side, PLUS `Merch`. Three separate monetisation surfaces in one nav.**

**<https://coolify.io/pricing> — verbatim:**

> ### Pricing.
>
> ### Pricing that adjusts according to your needs.

**Self-hosted column:**

> ### Self-hosted
>
> **"Free Forever"**
> "Deploy Coolify on your infrastructure without any restrictions on features."
>
> - "Full access to all features"
> - "Need your own infrastructure for Coolify"
> - **"No limitation or restrictions"**
> - "Community support (19+ members)"
> - "Automated or Self-managed updates"
> - **"Includes all upcoming features"**
>
> `Start Self‑hosting`

**Cloud column:**

> ### Cloud
>
> "**$5 /month** Base price (connect 2 servers)" / "**+ $3 /month** per additional server"
> "Just connect your servers, Coolify runs on our managed infrastructure."
>
> - "Connect unlimited servers", "Unlimited deployments per server", "Free email alerts", "Community + limited email support", "Founder-tested updates"
> - "**You need to bring your own servers** from any cloud provider (such as Hetzner, DigitalOcean, AWS, etc.)."
> - "(You can connect your RPi, old laptop, or any other device that runs the supported operating systems.)"

**⭐ The comparison table's LAST ROW is the trust pledge, verbatim:**

> `Any Other Upcoming Features` | Self-hosted: **"Unlimited & Free Forever"** | Cloud: "Included In The Price"

And: `Codebase` | Self-hosted: **"Open source"** | Cloud: **"Open source"** — they explicitly state
**the Cloud runs the same open-source codebase.**

**Corroborating pledges from the docs:**

> "It's completely free to use, open-source, and **has no features locked behind a paywall**."
> "**No Feature Restrictions** — All features are included in the open-source version—nothing locked behind a paywall."

**No `.github/FUNDING.yml`**; the ask is the `/sponsorships` page linked from the nav.
Footer entity: **"© 2026 coolLabs Solutions Kft."**

---

## 8.7 The donation-model projects — verbatim asks

### Syncthing — <https://syncthing.net/donations/>

**Nav:** `Project` | `Downloads` | `Security` | `Foundation` | `Docs` | `Forum` | `Code` |
**`Donations`** — **no `Pricing`**.

**The ask, verbatim in full:**

> ### Donations
>
> "Developing Syncthing costs money, in domain and hosting fees for the various servers we need to run the operation such as discovery servers, build servers and this website. Your donations help fund these costs. **We also periodically award grants for the development of specific features, which is paid for by these donations.**"
>
> "Click to donate securely using any major credit or debit card."
> "We also accept donations via **GitHub Sponsors** and **Liberapay**."
> "You can manage or cancel your existing recurring donation by visiting the subscription portal…"
>
> "**If you experience any issues with the donation handling, regret your donation and want a refund, or want to cancel a recurring donation please feel free to contact donations@syncthing.org at any time.**"
>
> "If you'd like to become a corporate sponsor of the project and be featured here we're happy to discuss that too!"

**⭐ Two trust mechanics:** an **unconditional, no-questions refund offer inside the donation ask**;
and **specificity** — "domain and hosting fees … discovery servers, build servers and this website".
The money is tied to named line items, not to vibes.

### curl — <https://curl.se/donation.html>

**Nav position:** `Donate` sits **inside the docs sidebar under `Project`**; `Sponsors` sits under a
separate **`Who and Why`** section. **No "Pricing" anywhere.**

**Verbatim, in full:**

> ### Donate to the curl project!
>
> ### How
>
> "Donate! (**Donations are done to Open Source Collective 501c6, a US non-profit that collects and holds funds on the behalf of the curl project.**)"
>
> ### Why
>
> "To ensure that the curl project continues to thrive. **Even open source projects has expenses! You can use curl forever without paying anything, but maybe you think you have got quite a lot and feel you could contribute a little back?**
>
> See also Mary Gardiner's excellent guide _How To Pay for Free Software_."
>
> ### What to donate
>
> "**Donate your time.** Answer questions, contribute code, review patches and help out. Or let one of your employees do this for the benefit of the project!
>
> **If you cannot donate time or skill, consider donating a small amount of money.** Maybe even do it in a recurring manner?
>
> Anyone donating 100USD per month, or more, is considered a sponsor and could get listed on that page - assuming the team agrees."
>
> ### What are the donated funds used for?
>
> "Donated money is strictly and only used for project expenses, like the curl annual conference series curl up.
>
> **Please note that sponsorships and donations are exactly that: donations to the curl project. They are used to help and further the project as the project leadership deems best. No goods or services are expected or promised in return. Requests for refunds for such purposes are rejected.**"

**⭐ Two things worth stealing:** _"You can use curl forever without paying anything"_ stated
**inside** the donation ask, and **time listed BEFORE money** as the preferred donation.
⚠️ Note curl's refund stance is the **exact opposite** of Syncthing's — worth contrasting.

### ⭐⭐ Immich — "this purchase will not grant you any additional features"

_Source read from `immich-app/static-pages` → `apps/buy.immich.app/src/routes/+page.svelte` (the live
page is client-rendered)._

**Page heading:** `Buy Immich`
**Sub-line, verbatim:** _"This is a software-only purchase and still requires hardware. See the docs for setup and install instructions."_

| Card       | Features (verbatim)                                             | Price    |
| ---------- | --------------------------------------------------------------- | -------- |
| **Family** | "For the whole family", "Lifetime purchase", "Supporter status" | **$100** |
| **Single** | "For a single user", "Lifetime purchase", "Supporter status"    | **$25**  |

**⭐⭐ The closing copy — the single most important quote in this whole topic, verbatim:**

> "Building Immich takes a lot of time and effort, and we have full-time engineers working on it to make it as good as we possibly can.
>
> Our mission is for open-source software and ethical business practices to become a sustainable income source for developers and to create a privacy-respecting ecosystem with real alternatives to exploitative cloud services.
>
> **As we're committed not to add paywalls, this purchase will not grant you any additional features in Immich. We rely on users like you to support Immich's ongoing development.**"

**Immich sells a product key that unlocks NOTHING.** The nav item is **`Purchase`** (under a
`Company` group), **not "Pricing"** — because nothing is priced. Licence **AGPLv3**, declared as a
**badge in the first lines of the README**. Nav groups: `Download` / `Company` (with `FUTO`,
`Purchase`, `Merch`) / `Sites` / `Miscellaneous`. **No `Pricing` item anywhere.**

### Home Assistant / Nabu Casa / Open Home Foundation — money on a separate domain

**home-assistant.io nav, literally:** `Getting started` | `Documentation` | `Our hardware` |
`Integrations` | `Blog` | `Need help?` — **no Pricing, no Donate, no Sponsor.** The only money link
on the entire homepage is a footer `Merch store → store.openhomefoundation.org`.

The money lives on a **separate domain**, <https://www.nabucasa.com/>, whose nav is `About us` |
`Privacy` | `Configuration` | **`Pricing`** | `FAQ` | `Support` | `News` | `Jobs` | `Start Trial` | `Login`.

**Nabu Casa hero, verbatim — note how the ask is framed:**

> ### Home Assistant Cloud
>
> "**Get the best extras for Home Assistant while supporting its development.** Securely access Home Assistant anywhere, connect voice assistants, and much more. **Made by the team driving the development of Home Assistant.**"
> "Start your 31-day trial today"

**Open Home Foundation** — <https://www.openhomefoundation.org/> — nav: `Who we are` | `What we do` |
`Resources` | `Blog` | `Store` | **`Support us`**.

> "The Open Home Foundation fights for the fundamental principles of **privacy, choice, and sustainability** for smart homes. And for every person who lives in one."

**⭐ THE PATTERN: the free product's site has ZERO money surface. The commercial ask is a separate
brand on a separate domain, and its value proposition is worded as "extras… while supporting its
development."**

### Jellyfin — <https://jellyfin.org/>

**Nav, literally:** `Blog` | `Downloads` | `Contribute` | `Documentation` | `Contact` | `Forum`.
**No Pricing. No Donate. No Sponsor.** The only money-adjacent link is `Contribute → /contribute`.

**Hero, verbatim:**

> ### The Free Software Media System
>
> "Jellyfin is the volunteer-built media solution that puts you in control of your media. Stream to any device from your own server, with no strings attached. **Your media, your server, your way.**"
> `See it in Action` `Download Now`
> **"Note: We do not run servers for users."**

⭐ That parenthetical sits directly under the hero CTAs — the same expectation-setting move as
PocketBase's "Do you offer hosting? No."

**Licence placement — a dedicated homepage section titled "Free Software", verbatim:**

> ### Free Software
>
> "Jellyfin is Free Software, licensed under the GNU GPL. **You can use it, study it, modify it, build it, and distribute it for free, as long as your changes are licensed the same way.**"

### Blender — <https://www.blender.org/> and <https://fund.blender.org/>

**Nav:** `Features` | `Download` | `Support` | `Get Involved` | `About` | `Jobs` | **`Store`** | **`Donate`**

**Licence statement on the homepage, verbatim — note the word "forever":**

> ### Free and Open Source
>
> "Blender is a public project hosted on blender.org, **licensed as GNU GPL, owned by its contributors**. For that reason Blender is **Free and Open Source software, forever**."

Footer also carries an explicit `License` link alongside `Logo & Trademark`, `Credits`, `Privacy
Policy`, `Code of Conduct`.

**fund.blender.org nav:** `About` | `Grants` | `Corporate Memberships` | **`Funding Policy`** |
`Contact` | `Sign in`. Two donate paths:

- **"Development Fund"** — _"Support core development with a monthly contribution."_
- **"One-time Donations"** — _"Perform a single donation with more payment options available."_

⭐ Note the existence of a public **"Funding Policy"** nav item — transparency as a nav-level artefact.

### Krita — <https://krita.org/>

**Nav:** `Features` | `Download` | `Learn` | `Get Involved` | `Shop` | **`♥ Donate`** — the heart glyph
is part of the nav label.

**Licence on the homepage, verbatim — near-identical construction to Blender's (both KDE-adjacent):**

> ### Free and Open Source
>
> "Krita is a public project **licensed as GNU GPL, owned by its contributors**. That's why Krita is **Free and Open Source software, forever**."

**Donations page — <https://krita.org/en/donations/>:**

> ### Donations
>
> "Krita is a Free and Open Source application. **Krita is mostly developed by an international team of enthusiastic volunteers. We welcome donations from Krita users to support all the work we're doing!**"
>
> ### Monthly Donations
>
> "If you join the **Krita Development Fund**, you will directly help keep Krita getting better and better, and you will get the following:
>
> - A great application with powerful features, features designed together with the Krita community
> - **Stable software where we will always try to fix issues—last year over 1,200 issues were resolved!**"

**⭐ The "benefits" of donating are deliberately NOT product features — they are the continued
existence of the free product, quantified (1,200 issues resolved).**

### Vue.js — <https://vuejs.org/sponsor/>

> "**Vue.js is an MIT licensed open source project and completely free to use.** The tremendous amount of effort needed to maintain such a large ecosystem and develop new features for the project is only made sustainable thanks to the generous financial backing of our sponsors."

> ### How to Sponsor
>
> "Sponsorships can be done via **GitHub Sponsors or OpenCollective**. Invoices can be obtained via GitHub's payment system. **Both monthly-recurring sponsorships and one-time donations are accepted.**"

**Tiers, verbatim:** **Global Special Sponsor** — _"Limited to one sponsor globally. Currently
vacant."_ · Platinum **$2,000/mo** · Gold **$500/mo** · Silver **$250/mo** · Bronze **$100/mo** ·
Generous Backer **$50/mo** · Individual Backer **$5/mo**

**Nav placement:** `Sponsor` lives under a top-level nav group literally called **`Support`**. The
licence (**MIT**) is named in the **first six words** of the sponsor page.

### Babel — <https://opencollective.com/babel>

Tagline: _"**Babel is the community maintained compiler for evolving the future of JavaScript**"_.
Fiscal Host: **Open Source Collective**.

- **Backers** — _"Support us with a monthly donation and help us continue our work!"_ — **"Starts at $2 USD / month"** — CTA `Become a backer` — 520+ contributors shown
- **Bronze Sponsors** — _"Thanks for being a sponsor!"_ — **"Starts at $100 USD / month"**

Collective page nav: `Contribute` | **`Budget`** (Transactions / Expenses) | `About` | `Contact`.

### Open Collective itself — <https://opencollective.com/>

> ### Collaborative Money Management
>
> "**We provide the infrastructure for effective financial coordination. Enabling organizations, groups and communities to build trust around money.**"

> ### Tell us who you are
>
> - **Legally Incorporated** — "For Foundations, Non-Profits, Companies, Public Sector and Co-ops"
> - **Unincorporated** — "For Collectives, Groups and Projects without a legal identity" — "Not legally registered / Need access to a legal status / **Need a trusted home for your money**"

> ### Stewarded by Open Finance Consortium
>
> "OFiCo is a nonprofit 501(c)(6) coordinating the governance and evolution of open financial tools… ensuring it stays **community-owned**."

Fiscal hosts: **Open Source Collective** (US 501(c)(6)), **Open Collective Europe** (Brussels),
**Gift Collective** (NZ), **Social Change Nest** (UK), **Raft Foundation** (US 501(c)(3)).

> ### Our Impact, By the Numbers
>
> **41** Organizations · **10K+** Collectives · **$40M** Money Managed · **116K+** Expenses Paid

The recurring trust word across all their copy is **"transparency"** — their page title is _"Raise,
manage and disburse money with full transparency."_

---

## 8.8 Open core vs donations vs hosted — including the FUTO / "source available" debate

### FUTO — <https://futo.org/> (redirects to <https://futo.tech/>)

Nav: `About` | `Blog` | `Events` | `Grants` | `Jobs` | `Merch` | `Explore Open Tech` — **no Pricing,
no Donate.** FUTO _gives_ money rather than asking for it.
Hero: **"Computers Belong to You"** / _"We develop and fund technology to give them back"_.

Homepage FAQ headings — these are the sustainability-debate questions:

> "What does FUTO stand for?" · **"How is FUTO funded?"** · **"Is FUTO a non-profit organization?"** · "What happens when you receive legal requests?" · "I work in tech, how can I get involved?" · "I'm just some person, how can I get involved?"

Relevant posts: **"Shifting Perspectives on Purchasing Open Source Software"** (Apr 15 2025) — _"At
FUTO, we want to make open-source software development sustainable. We believe that developers should
be paid for their time and energy spent on their projects…"_; **"The Future of Software Distribution"**
(Nov 14 2024).

### ⭐ Source First — <https://sourcefirst.com/> (FUTO's licensing manifesto)

The clearest statement of the "source available" position.

> ### Source First
>
> "Source first is a set of software and licensing principles that both hold developers socially accountable to their users, while simultaneously ensuring the rights of the original creators of software are respected."
> "The primary goal of source first is to allow users to be in control of their computers…"
> "The secondary goal is to enshrine the rights of developers. High quality software should have responsible owners who have the right to control the destiny of the software that they create. **Developers have the right to profit from their work and deny large corporations the ability to freeload.**"

**All six principles, verbatim:**

1. **"Access to Source"** — _"Everyone should have full access to the source code of everything they are running… **Any code running serverside must also be released alongside any client source code.**"_
2. **"Right to modify and share modifications"** — _"Users must be allowed to modify the software they are running for their own use and have the right to redistribute it for non-commercial purposes. **This does not include the right to strip out payment links or use trademarks in modified versions of software.**"_
3. **"No Free Ride for Megacorps"** — _"**The tech oligopoly has gotten a free ride from open source projects for too long… If you are a large organization you are obligated to pay developers of the software you are using or packaging. Full stop.**"_
4. **"Preservation of Attribution"** — _"Authorship associated with a source first license is to be preserved in all copies… Developers deserve to be credited for their work…"_
5. **"No Advertisements"** — _"No product or software that is source first can include ads or other malware within it."_
6. **"Privacy is Respected"** — _"Any software that contains telemetry must have a mechanism for **opting into** said telemetry. **We fundamentally reject all 'the user is the product' software business models.**"_

**On the licence itself, verbatim:**

> "The following template for licensing exists at the moment: **FUTO License**. Feel free to use this in your own software if you follow the source first criteria laid out above."
>
> ### Why not use another similar software license?
>
> "There are obscure commercial licensing options that attempt similar goals. **These other sets of licensing principles, such as Fair Code, have not managed to gain any relevant traction.**"
> "**Unlike other organizations, we are trademarking the term 'source first'. This makes it an enforceable term with teeth to it that we can stand behind.**"

⚠️ **That last paragraph is a direct public swipe at n8n's "fair-code"** — relevant because n8n uses
exactly that term and has a nav item for it (§7.1, §8.9).

### ⭐ The models, as stated by the projects themselves

| Model                                                   | Project                                | Their own words                                                                                                                                                                     |
| ------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hosted funds free core (non-profit)**                 | Ghost                                  | "We've built a sustainable business around a free core application, funded by a premium managed-service to run it on." + "we don't rely on any external donations or grant funding" |
| **Hosted funds free core (bootstrapped, no free tier)** | Plausible                              | "Our only source of funding is the managed cloud service" + "We released our code on GitHub and made it easy to self-host **on principle, not because it is good business**."       |
| **Hosted + open core (features held back)**             | Plausible CE                           | "Marketing funnels, user journeys, ecommerce revenue goals, SSO and sites API are not available **to help support the project's long-term sustainability**"                         |
| **Hosted + honest feature gap**                         | Umami                                  | "Cloud also includes additional features like email reports and the streaming API that are not available in the self-hosted version."                                               |
| **Hosted, but nothing paywalled**                       | Coolify                                | "No Feature Restrictions — All features are included in the open-source version—nothing locked behind a paywall."                                                                   |
| **Voluntary purchase, nothing unlocked**                | Immich                                 | "As we're committed not to add paywalls, this purchase will not grant you any additional features in Immich."                                                                       |
| **Pure donations**                                      | Syncthing, curl, Krita, Blender, Babel | "You can use curl forever without paying anything" / "We welcome donations from Krita users"                                                                                        |
| **No ask at all**                                       | PocketBase                             | "PocketBase is neither a startup, nor a business. There is no paid team or company behind it."                                                                                      |
| **Source-available / anti-freeload**                    | FUTO                                   | "If you are a large organization you are obligated to pay developers of the software you are using or packaging. Full stop."                                                        |

---

## 8.9 ⭐ WHERE the licence is stated on the marketing site — by placement

| Placement                                     | Projects                                                                          | Exact wording / location                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dedicated homepage section**                | **Jellyfin**, **Blender**, **Krita**                                              | A section literally headed **"Free Software"** (Jellyfin) or **"Free and Open Source"** (Blender, Krita), mid-page. Blender/Krita: _"licensed as GNU GPL, **owned by its contributors**. …Free and Open Source software, **forever**."_ Jellyfin: _"licensed under the GNU GPL. You can use it, study it, modify it, build it, and distribute it for free, as long as your changes are licensed the same way."_ |
| **Top-level nav item**                        | **n8n**                                                                           | The nav literally contains **"Our license"** under the `Docs` group — **the only project in the set with the licence as a NAVIGATION DESTINATION.** Consistent with "fair-code" positioning.                                                                                                                                                                                                                    |
| **First sentence of the product description** | **Typebot**                                                                       | _"Typebot is a **fair source** chatbot builder."_ — licence class stated before any feature                                                                                                                                                                                                                                                                                                                     |
| **First six words of the sponsor page**       | **Vue.js**                                                                        | _"Vue.js is an **MIT licensed** open source project and completely free to use."_                                                                                                                                                                                                                                                                                                                               |
| **Own H2 on the self-hosting page**           | **Plausible**                                                                     | Heading: _"What license is Plausible Community Edition released under?"_ → AGPLv3. **Not on the homepage.**                                                                                                                                                                                                                                                                                                     |
| **README badge only (line 1–2)**              | **Immich** (AGPLv3), **Excalidraw** (MIT)                                         | Shields.io badge in the README header block                                                                                                                                                                                                                                                                                                                                                                     |
| **Pricing-table row**                         | **Coolify**                                                                       | `Codebase \| Open source \| Open source` — states the _Cloud_ runs the same open-source code. Licence name never given on marketing pages                                                                                                                                                                                                                                                                       |
| **Nowhere on marketing pages**                | **Ghost**, **PocketBase**, **Penpot**, **Outline**, **Home Assistant**, **Umami** | 0 licence-string matches on homepage and pricing page. Ghost has only a footer `Source code` link; **PocketBase's site never names MIT at all** — only the repo does                                                                                                                                                                                                                                            |

**⭐ THE PATTERN: projects funded by DONATIONS put the licence on the homepage in a named section
with the word "forever". Projects funded by a HOSTED PRODUCT either bury it (Plausible, on a
sub-page) or omit it entirely (Ghost, Umami, Penpot, Outline).**

---

## 8.10 ⭐⭐ THE NAV QUESTION — what each project literally has

Extracted programmatically from each homepage's `<a>` elements.

| Project            | Top nav, literally                                                                                                             | Pricing?     | Money item                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------- |
| **PocketBase**     | `FAQ` `Documentation`                                                                                                          | **No**       | **NONE AT ALL** — zero sponsor/donate/pricing hrefs anywhere on the site          |
| **Jellyfin**       | `Blog` `Downloads` `Contribute` `Documentation` `Contact` `Forum`                                                              | **No**       | **`Contribute`** — money folded into contribution generally                       |
| **Home Assistant** | `Getting started` `Documentation` `Our hardware` `Integrations` `Blog` `Need help?`                                            | **No**       | **None on-site** — only a footer `Merch store`; commerce lives on nabucasa.com    |
| **Syncthing**      | `Project` `Downloads` `Security` `Foundation` `Docs` `Forum` `Code` **`Donations`**                                            | **No**       | **`Donations`**                                                                   |
| **Krita**          | `Features` `Download` `Learn` `Get Involved` `Shop` **`♥ Donate`**                                                             | **No**       | **`♥ Donate`** + `Shop`                                                           |
| **Blender**        | `Features` `Download` `Support` `Get Involved` `About` `Jobs` `Store` **`Donate`**                                             | **No**       | **`Donate`** + `Store`                                                            |
| **Immich**         | `Download` `Company` `Sites` `Miscellaneous` (with `Purchase`, `Merch`, `FUTO` under Company)                                  | **No**       | **`Purchase`** (not "Pricing") + `Merch`                                          |
| **Open Home Fdn**  | `Who we are` `What we do` `Resources` `Blog` `Store` **`Support us`**                                                          | **No**       | **`Support us`** + `Store`                                                        |
| **Vue.js**         | `Docs` `Playground` `Ecosystem` `About` **`Support`** (→ `Sponsor`, `Partners`)                                                | **No**       | **`Support` → `Sponsor`**                                                         |
| **curl**           | docs sidebar; **`Donate`** under `Project`, `Sponsors` under `Who and Why`                                                     | **No**       | **`Donate`** + `Sponsors` (two separate items, two separate sections)             |
| **Coolify**        | `Philosophy` `Contributors` **`Pricing`** `Services` `Docs` `Merch` **`Sponsor Us`** `Changelog` `Community (20k+)` `To Cloud` | **Yes**      | **`Pricing` AND `Sponsor Us` AND `Merch`**                                        |
| **Ghost**          | `Product` `Explore` **`Pricing`** `Sign in` `Get Started — free`                                                               | Yes          | `Pricing` only                                                                    |
| **Plausible**      | `Why Plausible` `Who it's for` `Compare` `Resources` **`Pricing`** (→ `/#pricing`) `Login` `Start free trial`                  | Yes (anchor) | `Pricing` only                                                                    |
| **Excalidraw+**    | **`Pricing`** `Teams` `Roadmap` `Resources` `Sign in` **`Free whiteboard`**                                                    | Yes          | `Pricing`; the donation ask lives **only in the GitHub README** (Open Collective) |
| **Umami**          | (client-rendered; pricing page exists)                                                                                         | Yes          | `Pricing` only; no FUNDING.yml                                                    |
| **Penpot**         | `Self-Host` `AI Workflows` `Features` … `Help Center` **`Pricing`** `Contact Sales` `Log In` `Sign up`                         | Yes          | `Pricing`; note **`Self-Host` is the FIRST nav item**                             |
| **Outline**        | `Product` `Download` `Guide` `Integrations` `Developers` `Changelog` **`Pricing`** `Community` `Contact Us` `GitHub`           | Yes          | `Pricing`                                                                         |
| **Mattermost**     | `Platform` `Solutions` **`Pricing`** `Partners` `Resources` `Customers`                                                        | Yes          | `Pricing` + a separate `Contribute` link                                          |
| **n8n**            | `Product` `Docs` (incl. **`Our license`**) `Learn` `Support` `Enterprise` **`Pricing`** `Sign in` `Get Started`                | Yes          | `Pricing` + `Merch`                                                               |

### ⭐⭐ ANSWER TO THE NAV QUESTION, DISTILLED

**When there is genuinely no paid tier, NO project uses a "Pricing" nav item.** The replacements, in
observed frequency order:

1. **`Donate`** — Blender, Krita (as `♥ Donate`), curl
2. **`Donations`** — Syncthing
3. **`Support us`** — Open Home Foundation; **`Support`** (a group containing `Sponsor`) — Vue.js
4. **`Contribute`** — Jellyfin (money and code merged into one item)
5. **`Purchase`** — Immich (deliberately _not_ "Pricing", because nothing is priced — the key unlocks nothing)
6. **Nothing at all** — PocketBase, Home Assistant

**⭐ Nobody uses "Open Collective" as a nav label**, even when Open Collective is the payment rail
(Excalidraw, curl and Babel all route through it but label the link `Sponsors`, `Donate`, or
`Sponsors & support`).

---

## 8.11 ⭐ VERBATIM TRUST-PRESERVING PLEDGES — the quotable set

Ranked by how directly each defends against the **"you'll paywall it later"** fear — which, after
§0 (Cal.com going closed source), is the live objection.

1. **Immich** — _"As we're committed not to add paywalls, this purchase will not grant you any additional features in Immich. We rely on users like you to support Immich's ongoing development."_
2. **Coolify** — _"It's completely free to use, open-source, and has no features locked behind a paywall."_ · pricing-table final row: _"Unlimited & Free Forever"_ · _"No Feature Restrictions — All features are included in the open-source version—nothing locked behind a paywall."_
3. **Blender / Krita** — _"licensed as GNU GPL, **owned by its contributors**. For that reason Blender is Free and Open Source software, **forever**."_
   **⭐ The "owned by its contributors" clause is the actual guarantee — it makes relicensing structurally impossible.** This is the strongest available answer to the Cal.com problem.
4. **Ghost** — _"Our legal constitution ensures that the company can never be bought or sold, and one hundred percent of our revenue is reinvested into the product and the community."_
5. **curl** — _"You can use curl forever without paying anything, but maybe you think you have got quite a lot and feel you could contribute a little back?"_
6. **Excalidraw** — the free tier's price line is the literal words **"Free forever"**.
7. **Umami** — _"Self-hosting is always free."_ · _"There is no vendor lock-in — if you ever decide to leave, your data goes with you."_
8. **Plausible** — _"No outside investors, no acquisition targets. We choose the subscription business model rather than surveillance capitalism. Our code is open source too, so you're never locked in."_
9. **Syncthing** — _"If you experience any issues with the donation handling, regret your donation and want a refund … please feel free to contact donations@syncthing.org at any time."_
10. **PocketBase** — the anti-pledge: _"PocketBase is neither a startup, nor a business. There is no paid team or company behind it."_

---

## 8.12 Pricing/sustainability caveats

- **Plausible's "open startup" page is GONE** — both `/open-startup` and `/dashboard` return **HTTP 404**. (Corroborated independently in §5.9 by a Wayback CDX query returning zero snapshots ever.)
- **Ghost's live ARR figures** ($11,055,673 etc.) were read from chart data embedded in the About page HTML at fetch time; they change continuously by design.
- **Immich's buy page** copy was read from the Svelte component source in `immich-app/static-pages` (authoritative). **Budibase/Typebot quickstarts** are client-rendered; heading lists reliable, prose outside marked quotes lightly paraphrased.
- **Cal.com's docs config** could not be located in the repo (live `<meta generator>` only).

---

# 9. CROSS-CUTTING THREADS — where the sections corroborate each other

These are observations, not recommendations. They are listed because they appeared independently in
more than one research stream.

1. **The README and the website deliberately disagree.** Documenso, Formbricks, Papermark, Dub, Twenty and Coolify all use _"the open-source X alternative"_ in the **README** and an outcome-led, non-comparative H1 on the **website** (§1.25, §2.3). The README speaks to GitHub; the website speaks to buyers.

2. **The comparison framing is a LAUNCH asset that matures out of the homepage.** It is dominant in HN titles (§6b.3: a 7–13× base-rate lift), dominant in READMEs, present in one homepage H1 out of 24 (Plausible), and actively _removed_ by mature projects (Dub, Infisical, Mattermost, Cal.com).

3. **Demo-as-proof is what zero-social-proof sites actually used.** Four of five archived early homepages (§5.15) put a demo or real running code above the fold. PocketBase still does it today as its _primary_ CTA (§4.1). Show HN's rules explicitly reward it (§6.3). Three independent streams converge here.

4. **Honest numbers beat no numbers, and tiny honest numbers were shipped by everyone who later got big.** Supabase displayed a 6-star repo; Dub displayed 3 stars; Plausible displayed a 30-visitor referrer chart (§5.11–5.13). None inflated. Meanwhile the fake-star market's measured benefit lasts **"less than two months"** (§6b.9) and buying stars is inside the FTC's prohibited conduct (§5.16).

5. **Licence permanence is now a live trust axis, not a footnote.** Cal.com's April 2026 relicensing (§0) drew 391 points / 317 comments; HashiCorp's and Redis's drew comment/point ratios above 1.0 (§6b.8); a Thunderbird maintainer immediately used the moment to market their own permanence (§0). The strongest available structural pledge found anywhere is Blender's and Krita's _"owned by its contributors"_ (§8.11).

6. **"Demo" is a captured word.** Six of 24 projects use it to mean "talk to a salesperson" (§4.2); `directus.io/demo` literally 302s to a sales page. **"Live demo"** and **"View live demo"** are the surviving self-serve labels.

7. **Persona-split navigation beats persona-split docs.** Ghost routes four audiences from the top nav and sends only developers to `docs.ghost.org` (§7.3B). This is the only structural answer found to "docs for non-technical people."

8. **When nothing is paid, nobody calls it "Pricing".** Six alternatives were observed (§8.10), and the two projects with the strongest reputations for integrity — PocketBase and Home Assistant — have **no money surface on the product site at all**.

9. **The launch is usually not the peak, and it is often not yours.** Third-party submissions outscored the founder's own Show HN for Cal.com (+85%), Coolify (+142%) and PocketBase (§6b.4). Excalidraw's first Show HN scored **30 points** and the project now has 129.3k stars. Papermark's scored 35 and it went on to SOC 2 and ~$600K ARR. Documenso never cleared 5 points. **HN is a lottery ticket, not a gate.**

10. **Plausible's biggest HN wins were blog posts, by 3.5×** (1214 and 816 points vs a 351-point launch, §6b.6). Content marketing outperformed the launch, and their own retrospective ties specific posts to specific MRR steps.

---

_End of raw research. Nothing in this file is a recommendation; it is evidence for someone else to
synthesise. Every ⚠️ marks something unverified or contested — those flags should survive into the
plan._
