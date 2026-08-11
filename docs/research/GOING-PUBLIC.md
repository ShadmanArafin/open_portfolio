# Going public

The SEO research found the one thing in the whole plan that is on a clock:
several discovery channels count from **the day the repository becomes public**,
not the day it is finished.

- **awesome-selfhosted** requires a project to have had its first release at
  least four months ago.
- **sindresorhus's awesome-list guidance** asks for 30 days.
- **AlternativeTo's** submission queue is months long and free.

Publishing today and launching in December costs nothing and starts all three.
Publishing in December means waiting until April. Nothing else in the plan
behaves this way.

While it stays private, five things are simply broken: the README's Deploy
button cannot clone the repository, releases cannot be listed so the update
checker returns 404, duplicate detection returns 422, every issue link 404s for
anyone but you, and `update.yml` cannot fetch from an upstream it cannot read.

---

## Audited on 2026-08-12 — clean

| Check                                                     | Result                                       |
| --------------------------------------------------------- | -------------------------------------------- |
| Secrets in tracked files (API keys, tokens, private keys) | None                                         |
| `.env` files tracked                                      | None — only `.env.example`                   |
| Personal or client-owned content                          | None across 274 tracked files, by the CI job |
| LICENCE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY          | All present                                  |
| Repository size                                           | 3.48 MiB packed — clones in seconds          |
| History                                                   | Already squashed to a clean root in Phase 0  |

The personal-data check and gitleaks both run in CI on every push, so this stays
true rather than being a one-off audit.

---

## On the day

**Set the repository description and topics.** Topics are how GitHub's own search
and the awesome-list maintainers find a project. Based on the two-vocabulary
finding, cover both: `portfolio`, `portfolio-website`, `website-builder`,
`cms`, `no-code`, `self-hosted`, `nextjs`, `typescript`, `open-source-alternative`.

**Cut a `v0.5.0` release with a tag.** Not for the changelog — because the
four-month clock starts from the _first release_, and because the update checker,
the "What's new" screen and the update workflow all read releases and currently
have nothing to read. This is the single highest-leverage action on this page.

**Turn on Discussions** if feature requests are going there, and **enable private
vulnerability reporting**, which `SECURITY.md` already tells people to use.

**Check the Deploy button end to end** from a signed-out browser, on a throwaway
Vercel account. It is the primary path in the README and it has never been run
by anybody who was not already the owner.

**Do not announce yet.** The launch research is unambiguous that the launch is
rarely the peak — Excalidraw's first Show HN scored 30 points and it now has
129k stars — and that a submission landing on an unfinished demo converts worse
than the same submission a month later. Publishing the repository and announcing
it are two separate events, and only the first is on a clock.

---

## Not blocking, but worth knowing before strangers arrive

- **The public site still ships demo content by default.** Somebody deploying and
  not finishing setup has a site that says "Your Name". Acceptable, and worth a
  look at whether the first-run wizard is insistent enough.
- **The README's backend table is accurate** — I checked, expecting it not to
  be. It lists only the four backends that exist and does not advertise
  Firebase, Appwrite, Convex, Cloudflare or PocketBase. The "Local filesystem"
  row does say "Docker", which was aspirational until this week and is now
  true.
- **The `local` row says "Works on Vercel/Netlify: no"**, which is right and
  worth keeping right. It is the one claim in that table somebody could lose a
  site over.
