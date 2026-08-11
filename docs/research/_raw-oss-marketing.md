# RAW RESEARCH — How successful open-source projects market themselves

**Purpose.** Evidence dump for designing the landing page, launch and docs of a new open-source
no-code portfolio builder. This file is deliberately _raw_: verbatim quotes, actual section orders,
actual numbers, with source URLs. Someone else synthesises it into a plan. **Nothing here is a
recommendation.**

**Gathered:** 2026-08-11/12.
**Method:** direct `WebFetch` of live marketing pages, GitHub READMEs (`raw.githubusercontent.com`),
and the Hacker News Algolia API (`hn.algolia.com/api/v1/search`), plus targeted web search.

### Reliability caveats — READ FIRST

| Caveat                              | Detail                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fetch pipeline is a summariser**  | `WebFetch` renders a page to markdown and passes it through a small model. Section lists are reliable; headline/CTA strings are _usually_ verbatim but a small number may be lightly normalised (capitalisation, an ellipsis). Anything load-bearing should be re-checked against the live page before it is quoted publicly. |
| **JS-rendered pages under-report**  | Supabase, Umami, Excalidraw and Papermark returned partial or empty bodies. Their rows below are marked `⚠️ PARTIAL`.                                                                                                                                                                                                         |
| **Wayback blocked in this session** | `web.archive.org` could not be fetched (`Claude Code is unable to fetch from web.archive.org`). Early-site snapshots are therefore **not** first-hand verified by the primary researcher. See §5 for whatever the sub-research recovered.                                                                                     |
| **Web search budget exhausted**     | 200/200 `WebSearch` calls consumed. Later gaps were filled with `WebFetch` only.                                                                                                                                                                                                                                              |
| **Dates**                           | Star counts, pricing and numeric claims are as of **August 2026** and move fast. Treat every number as a snapshot, not a constant.                                                                                                                                                                                            |

---

## ⚠️ THE SINGLE BIGGEST STORY IN THIS RESEARCH: Cal.com went closed source (April 2026)

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

# 6. LAUNCH TACTICS — primary HN data

_(Numbered to match the brief; §3–5, §7–8 follow below from the parallel research streams.)_

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
