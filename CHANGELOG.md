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

- **Start from what you do.** Seven starting points — Design, Software,
  Photography, Writing, Research, Student, or something else — each setting the
  wording, the theme and what your writing is called.
- **Install the editor on your phone.** Add it to your home screen and it opens
  like an app.
- **Publish writing.** Essays, notes, posts — you choose what the section is
  called, whether dates appear at all, and whether your best piece stays pinned
  at the top or the newest comes first. RSS either way.
- **Choose from six themes.** Editorial, Terminal, Gallery, Warm, Bold and
  Minimal. Each changes the palette, the typeface, the spacing and the corner
  radius together, in both light and dark. Change anything on top and your
  choice wins over the theme.
- **Try it before installing it.** `OPB_DEMO_MODE=1` gives every visitor their
  own copy of the site, in memory, discarded after an hour — a fully usable
  editor with nothing shared to vandalise.
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
- **Themes change colour, type and spacing — not layout.** Six of them, but
  they do not rearrange the page. Different structures come with more block
  types.
- **The admin is not laid out for a phone yet**, though it installs and works.
  Notifications are not built.
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
