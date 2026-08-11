# Changelog

Notable changes, newest first. Versions follow [semantic versioning](https://semver.org),
with the caveat that everything below 1.0 may still move under you — the shape
of stored content is stable, but screens and options are not settled yet.

Anyone who reported or suggested something is credited by name. That is the
whole point of the Help & feedback screen in the admin.

## 0.5.0 — unreleased

The first release worth deploying. Somebody non-technical can now put a
portfolio online and run it without opening a file.

### You can now

- **Build pages visually.** Add blocks, reorder them, hide them, edit every
  field, set each page's own title and description for search results, preview
  before publishing. Seven block types: hero, text, image, gallery, numbers,
  cards, and a call to action.
- **Build your home page the same way.** It falls back to the theme's own
  layout until you publish one, so nothing changes until you decide it should.
- **Choose pictures from your library** instead of uploading the same file
  twice, and write the description at the moment you pick it.
- **Publish and have visitors actually see it.** In the original version this
  button changed nothing outside the editor's own browser.
- **Receive contact messages**, read them in the admin, and be emailed when one
  arrives.
- **Connect a mail server from the admin** — no environment variables, no
  redeploy. Press Test and it tells you what is wrong in plain words.
- **Preview drafts** at their real address, with a banner so you never mistake
  one for the live site.
- **Report a bug or ask for a feature from the admin**, with your version and
  setup attached, after it has checked whether somebody already said it — and
  whether it is already fixed in a newer version.
- **Run it on your own server** with `docker compose up`, on any machine, with
  no account anywhere.

### Under it

- **Storage is pluggable.** Local filesystem, Postgres, Supabase or Neon, chosen
  by which environment variables are present. Every backend passes the same
  conformance suite against a real database in CI.
- **Real server-side auth.** Opaque session tokens in httpOnly cookies, scrypt
  passphrase hashing, sessions stored hashed so a database leak is not a session
  leak. The original shipped its passcode in the public JavaScript bundle.
- **Every mutating endpoint checks authorization itself**, enforced by a test
  that walks the syntax tree and fails the build on any that does not.
- **Colour contrast is checked before publishing**, and a palette nobody could
  read is refused rather than warned about.
- **Unknown and future content is quarantined, never dropped**, so an older
  build cannot destroy what a newer one wrote.
- **Concurrent edits are detected** rather than silently overwriting each other.
- 353 tests, or 420 with a database and a mail server attached.

### Known gaps

Said plainly, because they are the kind you should not discover after typing in
a portfolio:

- **Uploads have not been run against Vercel Blob or Supabase Storage with real
  credentials.** They work on the local filesystem and share the same code path.
- **One theme, and no way to swap it.** The machinery for more is built.
- **No blog.**
- **Nothing on mobile beyond the site being responsive.** No app to install, no
  notifications.
- **Sign-in is an email and a passphrase.** No passkeys, no one-time codes.
- **Your home page's old layout** is still edited on a separate screen from
  pages, until you rebuild it from blocks.

### What is coming

In roughly this order. Nothing here is promised by a date.

|         |                                                                                             |
| ------- | ------------------------------------------------------------------------------------------- |
| **0.6** | A second theme, and a way to switch. More block types                                       |
| **0.7** | Mobile admin, an installable app, notifications when someone writes to you                  |
| **0.8** | Firebase, Convex, Cloudflare, PocketBase and Appwrite backends. Passkeys and one-time codes |
| **0.9** | Blog with RSS, newsletter sign-ups, six themes, profession presets                          |
| **1.0** | Stable. Nothing renamed under you after this                                                |

---

## Before 0.5.0

The project was rebuilt rather than extended. The original was one person's
portfolio with an editor bolted on, and three things about it could not be
fixed in place: content lived in the editor's own browser so publishing reached
nobody, there was no server so there could be no email and no search-engine
metadata, and the admin passcode was compiled into the public bundle.

The full history of what changed and why is in
[docs/PLAN.md](docs/PLAN.md), including the decisions that were reversed and
the reasons.
