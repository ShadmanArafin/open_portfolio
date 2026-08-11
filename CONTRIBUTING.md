# Contributing

Thanks for considering it. This project is pre-1.0 and moving quickly, so
opening an issue before a large pull request will save you time.

**Read [docs/HANDOVER.md](docs/HANDOVER.md) first.** It is the current state
of the project checked against the code — what works and how it was verified,
what is not built, the traps that have already cost time, and the decisions that
should not be silently reversed.

## Getting set up

You need Node 20 or newer. There are **no credentials, accounts or API keys
required** to run the project locally — that is deliberate, and if you hit a
step that seems to need one, that is a bug worth reporting.

```bash
git clone https://github.com/ShadmanArafin/open_portfolio_builder.git
cd open_portfolio_builder
npm install
npm run dev
```

- Public site: <http://localhost:3000/>
- Admin: <http://localhost:3000/admin>

The first run sends you to `/setup` to claim the site with an email and a
passphrase of your choosing. Nothing else is required — no account, no keys, no
database. Content is stored under `.opb/`; delete that folder to start over.

Published content is stored on disk under `.opb/`, so your local edits never
leave your machine and cannot affect anyone else.

## Before you open a pull request

```bash
npm run typecheck   # must pass
npm run lint        # must pass
npm run format:check
npm run test        # must pass
npm run build       # must pass
```

CI runs all of these, plus a guard that no personal data has crept into the
repository and a gitleaks scan.

**Test with `npm ci`, not `npm install`.** A populated `node_modules` lets npm
reuse what is already installed and hides peer-dependency conflicts. CI installs
from the lockfile on a clean machine, which is the only honest test — and this
exact mistake has merged a broken dependency bump before.

To run the storage conformance suite against a real database:

```bash
docker run -d --name opb-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=opb_test -p 55432:5432 postgres:16
TEST_POSTGRES_URL="postgres://postgres:postgres@localhost:55432/opb_test" npx vitest run
```

## The rules that are not obvious

**No personal or client content in the repository.** Demo content must be
fictional, yours, or CC0. Use `@example.com` addresses and the reserved
`+1 555 01xx` phone range. Never commit a real company's logo, a real client's
screenshots, a real person's photograph, or a testimonial attributed to a real
person. A licence covers our copyright — it grants nothing in someone else's
trademark, and it is no defence at all for attributing words to a person who
never said them. See [public/demo/LICENSE.md](public/demo/LICENSE.md).

**No secrets in the client bundle.** Anything prefixed `NEXT_PUBLIC_` is compiled
into the JavaScript and is readable by every visitor. Server-only modules start
with `import 'server-only'` so a mistake here is a build failure rather than a
breach — keep it that way.

**Never derive an authorization decision from a request header.** A
`Host: localhost` check in the claim flow was a real auth bypass. Environment
variables and cookies only.

**Write for someone who does not code.** This project's users are students,
designers, photographers and writers. Interface copy, error messages and setup
instructions should be readable by someone who has never seen an API key.
"Invalid credentials" is a bad message; "That looks like a publishable key —
copy the one starting `re_` instead" is a good one.

**Match the surrounding code.** The existing code is commented where the
reasoning is not obvious and silent where it is. Please do the same, and explain
_why_ rather than restating _what_.

## Commits and DCO

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org):
`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

All commits must be signed off under the
[Developer Certificate of Origin](https://developercertificate.org) — add `-s`:

```bash
git commit -s -m "fix: resolve résumé link for uploaded PDFs"
```

That line certifies you wrote the change, or have the right to submit it. There
is no CLA.

## Good first contributions

- Interface copy that assumes the user is a designer. The project supports every
  profession, and the wording does not always reflect that yet.
- Accessibility fixes: focus management in the lightboxes and the mobile nav,
  a skip-to-content link, live regions for toasts.
- Bugs found while actually using the admin. Those reports are the most valuable
  thing anyone sends us.

## Reporting bugs

Use the issue templates. For anything in the admin, please say whether the
dashboard shows any warnings — the readiness checks often name the real problem.

**Security issues go to [SECURITY.md](SECURITY.md), not the issue tracker.**

## Code of conduct

Participation is covered by the [Code of Conduct](CODE_OF_CONDUCT.md).
