# Open Portfolio — Launch Kit & Directory Submissions

> Prepared submission copy, directory entries, and launch messaging for public release.

---

## 1. awesome-selfhosted Submission

Place under **Content Management Systems (CMS)** or **Software Development - Static Site Generators**:

```markdown
- [Open Portfolio](https://getopenportfolio.vercel.app/) - A self-hosted personal portfolio and writing CMS with a visual page builder, six themes, passkey auth, and pluggable storage backends (SQLite, Postgres, Supabase, Neon, Cloudflare, Convex, PocketBase, Firebase, Appwrite). ([Demo](https://getopenportfolio.vercel.app/demo/try), [Source Code](https://github.com/ShadmanArafin/open_portfolio)) `MIT` `Nodejs/Docker`
```

---

## 2. Show HN (Hacker News)

**Title:**

> Show HN: Open Portfolio – Self-hosted portfolio builder with visual editor and 9 backends

**Text:**

> Hi HN,
>
> I built Open Portfolio because creative and technical portfolios are stuck between two extremes:
>
> 1. Pay $16–$25/month forever to closed platforms (Squarespace, Webflow, Wix) that hold your content hostage, or
> 2. Build your portfolio by hand in React/Next.js/Astro, only to abandon it the second you need to update a case study or fix a typo from your phone.
>
> Open Portfolio is a self-hosted, MIT-licensed portfolio builder designed around three core principles:
>
> 1. **Content and storage independence:** Your content lives in a backend you control. We support 9 backends through one unified storage contract: local filesystem, vanilla Postgres, Supabase, Neon + Vercel Blob, PocketBase, Firebase, Appwrite, Cloudflare D1 + R2, and Convex. Every adapter runs against a strict conformance suite covering concurrent writes, transactions, and namespace isolation.
>
> 2. **Visual editor on the server:** 28 block types (hero, galleries, case studies, writing lists, cal.com/booking calendar, split layouts, token-styled links) arranged via a server-rendered admin with real server-side authorization. Saves write drafts; publishing updates live pages instantly via Next.js Cache Components and Partial Prerendering (PPR).
>
> 3. **Real ownership:** One button static HTML export (`wget`-style crawler), complete `.zip` backup and restore with byte-verified media, full CSV import/export for all collections, and passkey (WebAuthn) / email OTP authentication without third-party auth services.
>
> Released container images are published to GHCR for amd64 and arm64 (Raspberry Pi supported) with Sigstore build-provenance attestations and SBOMs:
> `docker pull ghcr.io/shadmanarafin/open_portfolio:0.7.0`
>
> - GitHub: https://github.com/ShadmanArafin/open_portfolio
> - Live interactive demo (runs client-side, zero signup): https://getopenportfolio.vercel.app/demo/try
> - Documentation: https://getopenportfolio.vercel.app/docs
>
> Would love your feedback and thoughts on self-hosting portfolio workflows!

---

## 3. Reddit (r/selfhosted & r/webdev)

**Title:**

> Open Portfolio: Free & Open-Source Portfolio Builder with a Visual Editor and Pluggable Backends

**Body:**

> Hey r/selfhosted,
>
> Over the past few months I've been building **Open Portfolio**, a modern self-hosted portfolio and writing site builder with an in-browser visual page editor.
>
> **Why?**
> Most portfolio templates are either static Markdown files that you have to redeploy git commits to edit, or hosted SaaS platforms that cost $200+/year. Open Portfolio is designed to run on a cheap VPS, Docker, Raspberry Pi, or free serverless tiers (Vercel + Supabase/Neon/Cloudflare).
>
> **Key Highlights:**
>
> - **Zero Vendor Lock-in:** 9 interchangeable storage backends (Local disk, Postgres, Supabase, Neon, PocketBase, Firebase, Appwrite, Cloudflare D1+R2, Convex).
> - **Visual Page Builder:** 28 block types, responsive design tokens, 6 curated typography/color themes.
> - **Writing & Blog:** Content-addressed immutable post bodies (SHA-256), paginated index with PPR, full HTML RSS 2.0.
> - **Booking & Contact:** Built-in contact form inbox with push notifications (Web Push / VAPID) + native Cal.com and Calendly embed support.
> - **Security:** Native Passkeys (WebAuthn), emailed single-use OTPs, Argon2/scrypt, strict CSP.
> - **Docker Ready:** Multi-arch images on GitHub Packages (`ghcr.io/shadmanarafin/open_portfolio:0.7.0`) with Sigstore attestations.
>
> Source code: https://github.com/ShadmanArafin/open_portfolio
> Try the in-browser sandbox: https://getopenportfolio.vercel.app/demo/try
>
> Feedback, issues, and contributions welcome!
