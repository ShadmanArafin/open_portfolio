# Changelog

Notable changes, newest first. Versions follow [semantic versioning](https://semver.org),
with the caveat that everything below 1.0 may still move under you — the shape
of stored content is stable, but screens and options are not settled yet.

Anyone who reported or suggested something is credited by name. That is the
whole point of the Help & feedback screen in the admin.

## 0.5.0 — 2026-08-13

The first release worth deploying. Somebody non-technical can now put a
portfolio online and run it without opening a file.

### You can now

- **Find out where your site actually is.** A screen showing the public address
  to put on your CV, with a copy button — and, if you want one, exactly how to
  put your own domain on it for your host. It is honest that the free address
  is permanent and that a domain costs about £10–15 a year, paid to a registrar
  and not to us.

- **Upload pictures on a hosted backend, verified.** Both Supabase Storage and
  Vercel Blob were run against the real services for the first time. Supabase
  turned out to be broken in a way that would have stopped every Supabase site
  working after its first restart; that is fixed.

- **See where your content lives.** A screen in the admin showing which backend
  you are on, whether it is answering, and what the alternatives cost — with
  what to set and where to find it for each. It explains rather than switches,
  because the setting that says how to reach your database cannot itself live
  in the database.

- **Start from what you do.** Seven starting points — Design, Software,
  Photography, Writing, Research, Student, or something else — each setting the
  wording, the theme and what your writing is called.
- **Install the editor on your phone.** Add it to your home screen and it opens
  like an app.
- **Collect email addresses.** Switch on a sign-up box and visitors can ask to
  hear from you. Everybody confirms by email first, leaving takes one press from
  the mail client's own unsubscribe button, and the list downloads as a CSV that
  Buttondown, Mailchimp and the rest import directly. Nothing sends from here.
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
  before publishing. Sixteen blocks you fill in yourself: hero, text, image,
  gallery, numbers, cards, a call to action, a contact form, questions and
  answers, a video, a picture beside text, a quote, a newsletter box, your
  social links, what you offer, a file to download, and space.
- **Take enquiries from any page.** The contact form used to exist only at
  `/contact` and could not be placed anywhere else. It is a block now, posting
  to the same endpoint, so it keeps the origin check, the rate limit and the
  spam trap.
- **Show a video without loading YouTube on every visit.** A poster and a play
  button; nothing is fetched until somebody presses it.
- **Put your own work on a page.** Seven more blocks show what you have already
  entered elsewhere — your work, your writing, experience, clients,
  recommendations, what you do, and how you work. You choose which and how many; the page follows the
  records, so updating a project updates every page showing it. A block whose
  list is still empty tells you it will not appear, rather than leaving a gap
  you find out about later.
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
- **`docker compose up` reaches setup.** It did not: two adapters had each
  written their own copy of "where may this install write", one of them ignored
  `OPB_DATA_DIR`, and the documented one-command install died on its first
  write with `EACCES: mkdir '/app/.opb'`. Every test passed throughout, because
  every test ran with that variable unset. There is now one function and a test
  that sets it.
- **Try the whole admin in a browser tab.** The marketing site carries a demo
  with nothing behind it — no account, no server, nothing saved. Thirteen
  screens: the dashboard, the page builder, your work, writing, clients,
  experience, the inbox, the newsletter, appearance, search settings, the
  media library and version history. Seven professions and six themes,
  switchable, and it imports the product's real blocks, themes, checks and
  editor forms rather than imitating them.
- **A marketing site, a help centre and developer docs**, in `site/` — a
  separate application that builds to a static export. Every claim it makes
  about another product carries a source link and the date it was read, and
  every comparison page names at least two things the other product does
  better.
- **Two claims corrected by building the demo**, which is what a demo is for.
  The dashboard does not run "sixteen checks" — the number varies with what
  you have, and the demo's own content produced nineteen. And an unreadable
  palette is usually _prevented_ rather than refused: every text, border and
  link colour is derived from the background and clamped before it is drawn,
  and the publish-time refusal is the backstop for what clamping cannot fix.
- 676 tests, or 772 with a database and a mail server attached.

### Known gaps

Said plainly, because they are the kind you should not discover after typing in
a portfolio:

- **Uploads have not been run against Vercel Blob or Supabase Storage with real
  credentials.** They work on the local filesystem and share the same code path.
- **The newsletter collects addresses; it does not send them anything.** The
  export is the exit. Sign-ups also need a mail server connected, because
  confirming means emailing somebody a link.
- **Themes change colour, type and spacing — not layout.** Six of them, but
  they do not rearrange the page. Blocks that show your records adapt to what
  you have; a theme still cannot change the arrangement itself.
- **The admin is not laid out for a phone yet**, though it installs and works.
  Notifications are not built.
- **Sign-in is an email and a passphrase.** No passkeys, no one-time codes.
- **Your home page's old layout** is still edited on a separate screen from
  pages, until you rebuild it from blocks.

### What is coming

In roughly this order. Nothing here is promised by a date.

|         |                                                                                             |
| ------- | ------------------------------------------------------------------------------------------- |
| **0.6** | More block types, and a live demo anybody can open                                          |
| **0.7** | Mobile admin, notifications when someone writes to you                                      |
| **0.8** | Firebase, Convex, Cloudflare, PocketBase and Appwrite backends. Passkeys and one-time codes |
| **0.9** | Documentation, and a site that explains this project to somebody who has not used it        |
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
