# Changelog

Notable changes, newest first. Versions follow [semantic versioning](https://semver.org),
with the caveat that everything below 1.0 may still move under you — the shape
of stored content is stable, but screens and options are not settled yet.

Anyone who reported or suggested something is credited by name. That is the
whole point of the Help & feedback screen in the admin.

## 0.7.0 — 2026-10-26

### Added

- **Records-backed writing & blog storage.** Posts are stored individually in
  `writing-draft` records with per-record conditional revisions, while published
  bodies live in content-addressed `writing-bodies` records (SHA-256). Snapshots
  now carry listing metadata only, preventing storage bloat.
- **Paginated public writing index & RSS 2.0.** The `/writing` index is paginated
  via `?page=` with `WRITING_PAGE_SIZE = 10` streamed inside a Suspense boundary for
  Partial Prerendering (PPR), and `/writing/feed.xml` renders full HTML via a
  dedicated block-to-HTML serializer with CDATA safety.
- **Convex storage adapter.** Built in `core/storage/adapters/convex.ts` using
  pure HTTP REST (`/api/query`, `/api/mutation`, `/api/storage/upload`) with zero
  heavy client dependencies, passing the full 66-test conformance suite.
- **Cloudflare Workers REST adapter.** Built in `core/storage/adapters/cloudflare-rest.ts`
  using Cloudflare's D1 REST API and R2 Object REST API with queue-serialised
  conditional writes, passing the full 67-test conformance suite.
- **Stack-of-links block.** Dedicated `links` block in `core/blocks/standard.tsx`
  for link-in-bio pages and shortcuts, with 48px touch targets, badge tags,
  highlight toggles, and strict design token adherence.
- **Focal-point crop.** Configurable crop focal points (`top`, `center`, `bottom`,
  `left`, `right`, percentage strings, or coordinate objects) on the `Media`
  primitive, image blocks, and split blocks.
- **Full axe accessibility matrix.** Static matrix expanded to cover all blocks,
  structural variants, and all 6 theme presets (`editorial`, `terminal`, `gallery`,
  `warm`, `bold`, `minimal`), plus responsive viewports (mobile 390×844 and desktop
  1440×900) across dark and light modes.

### Security

- **Next.js 16.4.3.** The previous 16.3.0 install was inside the affected
  range for a stack of unauthenticated remote-code-execution advisories
  (`GHSA-p293-qw3h-jr36`, `GHSA-2xp9-vwfh-vxw4`, `GHSA-vcvr-r3jv-pc5j`,
  `GHSA-2464-fhr4-w9xw`, `GHSA-673q-mjm6-r5xr`) plus cache-poisoning, SSRF and
  denial-of-service fixes. The bump stays inside 16.x and is verified on the
  Cache Components model this site already uses. 16.4 also expects
  `partialPrefetching` to be set explicitly, so it is now on: no page uses a
  full `prefetch={true}`, and the default becomes one shared App Shell per
  route.

## 0.6.0 — 2026-10-24

The admin is rebuilt on the server, every list comes and goes as a
spreadsheet, a whole site comes and goes as one file, and public pages carry
about 43% less JavaScript. Released images mean a self-hoster no longer builds
anything.

### The demo is the admin now

The browser demo was an admin sitting inside a marketing page: a site header
above it, a four-column footer below, and the preview taking more than half of
what was left. Somebody deciding whether they could work this was judging it
through a letterbox. It now takes the window.

- **No site chrome.** The demo route drops the header and the footer and carries
  one bar of its own — the product on the left, a way out on the right.

- **The preview closes, and moves.** Drag the divider, or close it entirely and
  give the whole window to the admin. Desktop, tablet and phone moved onto the
  preview itself, which is where the product keeps them and roughly three metres
  closer to the thing they change.

- **Open the page in its own tab.** At the width of your actual window, not a
  scaled-down pane.

- **The navigation has its icons**, the same ones the real admin uses, an unread
  count on Messages, and your name, role and a sign-out at the bottom. On a
  narrow window it becomes an icon rail instead of vanishing.

- **You can add a block.** All twenty-four, grouped the way your own install
  groups them, each inserted by the same call the real editor makes — so they
  arrive empty, with the warnings that come with being empty. And you can delete
  one again.

### You can now

- **Bring every list in a spreadsheet.** Work, Brands, Capabilities and
  Artifacts take a CSV too, each with its own template.

- **Let visitors search your site.** `/search` looks through your published
  pages, work and writing. It also appears on the "page not found" screen.

- **Show related writing.** Each piece lists others that share its tags.

- **Sign in with a passkey from the email field.** Your browser offers your
  passkey as you click in. After signing in with your passphrase, your password
  manager may offer to save a passkey for next time.

- **Edit blocks without the clutter.** Layout settings (shape, columns, how
  many) sit under "More options".

- **Get credit on Mastodon.** Add your Mastodon profile to your social links,
  and links to your site shared on Mastodon show you as the author.

- **Get a first draft from your own model.** Connect Ollama, or any
  OpenAI-compatible server, under Services. Suggest buttons then appear for page
  descriptions, writing summaries and alt text. Each suggestion appears first,
  and goes into the field only when you press Use it. Your words go only to the
  address you gave. Off, and invisible, until you connect one.

- **Take everything with you in one file.** Settings → Backup & restore →
  Download everything is a .zip holding your site, your draft, your publish
  history and every picture, and it restores onto any install, whatever storage
  it uses. Moving from Vercel Blob to your own server no longer loses images.

- **Keep a static copy of your site.** One button saves the published site as
  plain HTML, with its styles, fonts and pictures. It works from GitHub Pages,
  Netlify, a bucket or a USB stick, even if this app is gone.

- **Bring a spreadsheet.** Experience, Education and Recommendations import a
  CSV. Download the template, fill it in, then check the rows on screen and
  Save. Columns match in any order. Rows that can't be used are named, by line
  number.

- **Schedule a page.** A page can go live at a time you pick, like writing
  already could.

- **Send a CV.** `/cv` is your experience, education and skills on one page,
  laid out for paper. "Print or save as PDF" turns it into a PDF.

- **Give readers more to go on.** Writing shows the reading time, a table of
  contents for longer pieces, tags that link to their own archive pages, and
  the previous and next piece.

- **Hear how the month went.** With email and a cron secret set, the owner gets
  a monthly digest: visitors, most-read pages, new messages, and what is left
  before launch.

- **Be understood by search engines and AI tools.** The site now describes you
  as a Person on a ProfilePage, the home page as a WebSite, and detail pages
  with breadcrumbs. `/llms.txt` gives AI assistants a plain map of the site,
  unless you've asked search engines to stay away.

- **Jump anywhere with Cmd/Ctrl+K.** Type a few letters of a section, a page,
  a piece of writing or a project and press Enter; a record opens in its
  editor, ready to change.

- **See the page while you build it.** On a wide screen, "Preview beside"
  docks the real page next to the editor at phone, tablet or full width, and
  it reloads each time you save.

- **Undo a delete,** until you save.

- **Know what is left before launch.** The dashboard opens with a seven-step
  launch checklist — your name, your work, your email, a mail server, a search
  description, your address, publish — and puts it away once it is done.

- **Turn the theme's home page into blocks without losing a word.** Building a
  home page now starts from what your home page shows today, section by
  section, instead of from an empty page.

- **Send phones a phone-sized photo.** Large photos get WebP copies at 640,
  1280 and 1920 pixels when uploaded, and every image on the site offers them
  through `srcset`, so a phone downloads the small one instead of the
  camera-sized original.

- **Run a released image instead of building one.** Every version tag
  publishes `ghcr.io/shadmanarafin/open_portfolio` for amd64 and arm64, so a
  server — or a Raspberry Pi — pulls it rather than spending ten minutes and a
  few gigabytes compiling. Each image carries an SBOM and a build provenance
  record signed through Sigstore; `gh attestation verify` checks it came from
  this repository's release workflow and nowhere else.

- **Stop losing unsaved edits.** Every editing screen now says "Unsaved
  changes" next to Save as soon as something differs from what was loaded, asks
  before a link elsewhere in the admin throws the edits away, and holds the tab
  open on close or reload. Cmd/Ctrl+S saves the screen instead of offering to
  save the web page. Typing a word and deleting it again does not count as a
  change.

- **Set the language your site is written in.** Settings has a Site language
  field (`bn`, `es`, `pt-BR`, …) that becomes `<html lang>`. It was hard-coded to
  English, so a portfolio in any other language was read aloud by screen readers
  in the wrong voice and failed WCAG 3.1.1.

- **Keep automated submissions off the contact form.** Cloudflare Turnstile is
  the second integration, switched on from Services the way the mail server is:
  add the keys and the widget appears on every form that posts - the contact
  blocks, the contact page and the newsletter box - and a submission that
  arrives without a token is refused. Leave it unconfigured and nothing
  changes, because nothing loads. The widget is fetched only on a page that has
  a form on it, and the page's frame policy had to be widened to let it paint -
  the kind of detail a later debugger would otherwise have to rediscover.

- **See how many people read your site.** Umami and Plausible both take an
  optional read key now; with one, the dashboard shows visitors, page views and
  your busiest pages, cached for five minutes and going quietly absent when the
  API is away. With none, the cards simply do not appear and nothing breaks.
  Both are self-hosting first, and neither asks you to make an account
  anywhere.

- **Put a booking link on a page.** A new `embed` block takes a Cal.com or
  Calendly link, rebuilds it against a host allowlist rather than trusting
  whatever was pasted, and loads the frame only after a press. A page with a
  booking widget therefore ships no third-party URL until somebody asks for
  one.

- **Put an Instagram post, a Behance project or a Substack subscribe box on a
  page.** A new `Social post` block takes a link and rebuilds the embed address
  from the code it read rather than trusting whatever was pasted - the same
  rule the video and booking blocks follow - and loads nothing from any of them
  until a visitor presses show. Behance's address is the iframe Behance's own
  oEmbed endpoint hands out, and Substack's is the subscribe box its
  publications serve; both were fetched while this was written rather than
  remembered. GitHub is deliberately absent: there is no embeddable page for a
  repository, and the editor says so instead of leaving a gap.

- **Start a link-in-bio page in one press.** Pages has "Add a links page"
  beside "Add page": it makes a draft page at `/links` holding a
  picture-and-text introduction, cards pointing at your work, writing and
  contact, and your social row. All three are ordinary blocks, so everything in
  it can be edited, reordered or deleted straight away.

- **Let readers comment, if you want them to.** A `comments` block wires up
  Giscus: the thread lives in a GitHub Discussions category of a public repo
  you own, nothing is tracked and nothing is advertised, and it stays off until
  you connect it. The frame waits for a click, like the video and booking ones.

- **Give every piece of writing its own preview card.** An essay now unfurls
  with a card of its own - title, summary, date, your name and role - and its
  structured data carries the things that attach a headline to a page: the
  canonical address, the image, the author, the publisher, the modified date.
  The structured data appears once you have set a domain, because it wants
  absolute addresses and a site without one has none to give.

- **Bring your old posts with you.** The Writing screen takes `.md` files now,
  up to twenty at a time, read in your own browser. Front matter is read -
  title, date, summary, tags and address; a leading `#` stands in for a title
  when there is none; headings become block headings, lists become bullet
  paragraphs, quotes become the quote block, and a link keeps its address
  after its text. What it cannot carry is said out loud, per file, before
  anything is added: images, bold and italics, code, tables. Every piece
  arrives as a draft at the bottom of the list, and nothing is written until
  you press Save - so the way out of an import you regret is the Delete piece
  button you already know.

- **Share a draft page with one person, and take the link back.** The Pages
  screen mints a private link per page: 192 bits of randomness, stored only as
  a hash, with an expiry enforced in two places rather than one. The link shows
  the draft - never the live page - carries `noindex`, and says on the page
  itself that it is a draft. Revoke it and the same link is dead immediately.

- **Run the editor from a phone.** The admin's header was a wrapped list of 25
  links: 288px tall on a 375px screen, the whole first screen, every link a
  20px line of text. It is now a 44px Menu button that names the section you
  are in and opens the same 25 links as 44px pills - and the rest of the admin
  was measured at 375px the same way, with every real target miss fixed.

- **Know what a save did, or why it did not.** The admin tells you when you are
  offline, before a save fails with nothing to explain. A refused save now says
  which revisions disagreed and what the difference was - in the same words the
  publish summary uses - with a reload control beside it. Version history says
  what pressing Restore would actually change before you press it.

- **Send your list out, with the screen saying how.** The Newsletter screen
  never sends - that is deliberate - and it now says so out loud, in a "Sending
  it out" section: Listmonk first (AGPLv3, a single binary, with its connected
  state read from Services), Buttondown and Mailchimp for people already paying
  for one, and the obligations in plain words - confirmed addresses only, keep
  the unsubscribe link, send the first one to yourself.

### Changed

- **Pages are much lighter.** Every public page now loads about 43% less
  JavaScript (295 KB down to 168 KB, compressed). The theme renders on the
  server, animations are done in CSS, and icons are drawn on the server. Content
  is no longer invisible until a script runs, and nothing moves if you've asked
  your device for reduced motion.

- **Moving between pages crossfades** in browsers that support it, and a
  project's picture carries over into its case study.

- **Publishing shows on the site immediately.** Content caching is now tied to
  publishing, so a publish or a restore clears it at once. Scheduled pages
  still appear within about a minute of their time.

- **Pages don't grow with your photo library.** Every page used to carry a
  list of every uploaded photo with smaller copies, just so images could pick
  their size in the browser. That choice is now made on the server. With 200
  photos, each page sends about 65 KB less data (4-5 KB less once compressed),
  and the saving grows with the library. Photos still load at the right size.

- **Fonts come with the install.** The 35 fonts in the Appearance picker are
  installed from npm (Fontsource, all OFL) instead of being fetched from Google
  during the build, so a build works offline and can't fail because a font
  server answered strangely. Visitors still download only the fonts your site
  uses, from your own site, as before.

- **The admin menu is grouped** into Build, Profile, Audience, Look & reach
  and System, and Case studies only appears on sites that still have them.

- **Pages carry only what they show.** Every public page used to include every
  published page's blocks, every piece of writing in full and every project's
  case study, whatever page it was. They render on the server now and stay
  there, so a page's size no longer grows with how much you have written.
  About 1,300 lines of the old in-browser editor that every visitor downloaded
  and never ran are gone with it.

- **Version history is stored beside your site, not inside it.** Each publish
  is its own record; the copy every visitor's page is built from no longer
  carries twenty old copies of itself. Existing history moves across on your
  next publish and is readable the whole time.

- **CI walks the whole journey in a browser.** A new job builds the site,
  claims a fresh install, edits it, publishes and checks a visitor gets the
  change, and runs axe over the public pages and the admin. The browser tests
  existed but were never run by CI; this is the test that would have caught
  the new-install save bug the day it landed.

- **The project's own supply chain is checked.** CodeQL scans the code and the
  workflows, OpenSSF Scorecard publishes a score, and every GitHub Action is
  pinned to a commit rather than a movable tag.

- **A screen that is out of date refuses to save instead of overwriting.**
  Each screen now carries a fingerprint of exactly the part of the draft it
  edits, and a save is refused — "nothing was written" — when that part was
  changed in another tab or on another device since the screen opened. Until
  now the check only caught a millisecond race, so a list left open in one tab
  silently replaced the same list saved from another. Saving a different screen
  in between never triggers it: the fingerprint is per part, not per document.

- **The documented example secrets are refused in production.** A setup token
  or encryption key still set to the `change-me-…` values in
  `docker-compose.yml` (or the examples in the README) is public, so claiming
  the site with that token is refused, and the vault will not encrypt new
  service passwords under that key. Passwords already saved under it still
  read, so a running site keeps working after the update; the boot log says
  what to change.

- **Your social profiles verify.** The theme footer's social cards now carry
  `rel="me"`, as the social row block already did, and every page lists the
  profiles as `<link rel="me">` in its head — which is where Mastodon's verifier
  looks, since it reads the server's HTML and runs no script. A stored link that
  is not a safe address is left out of the footer instead of rendered.

- **Case studies and projects are one collection.** `/work` lists both now, a
  case-study write-up is a `story` on the project - the same block editor as a
  page, in the same Projects screen - and `/case-studies` and
  `/case-studies/<slug>` redirect permanently to their `/work` equivalents. A
  backup taken before the merge still reads: the old records are mapped onto
  projects when the content is loaded, so nothing has to be migrated by hand. A
  case study whose address a project already uses is refused now, rather than
  dropped quietly by the merge.

- **The admin no longer carries the design system it was built from.** Its CSS
  went from 394 KB across four files to 240 KB across three, with no visual
  change: the same tokens and the same screens, less to download on the phone
  the rest of this section is about.

- **The product is now called Open Portfolio**, not Open Portfolio Builder. The
  name matches the repository and the address; the sentence under it still says
  "portfolio website builder", which is the phrase people actually search with
  and is worth more in a description than in a name.

  Nothing you have to do. Your content, your database and your deploy are
  untouched, and exported backups still carry the `open-portfolio-builder`
  format identifier on purpose — it is matched exactly on import, so renaming it
  would have meant older backups needing a compatibility entry to load.

  The local Docker build tag in the docs changed from `open-portfolio-builder`
  to `open-portfolio`. If you follow an older copy of the README, the tag you
  build and the tag you run just have to match each other.

### Fixed

- The home page headline now gets its intended size; it was rendering far
  too small.
- Clicks on "Visit live project" are now recorded in analytics.
- The preview panel beside the editor now works on sites served over plain
  http.

- Restoring a backup now shows on the public site straight away. Before, pages
  kept the old content for up to a minute.
- Printing in a dark theme no longer gives you white headings on white paper.
- On PocketBase, saving an empty record no longer fails with "Cannot be
  blank". The fields were created as required; existing sites are relaxed
  automatically the next time storage is set up.
- The Settings, Appearance, SEO and home page saves now write only fields from
  a fixed list. Every field was already checked before, but a malformed request
  was refused by luck rather than design (flagged by CodeQL).

- **Preview could open on the wrong address** behind a proxy or under
  `next start`: it redirected to the server's own idea of its host instead of
  the one you were using.

- **A brand-new site's dashboard was empty** ("Nothing is stored yet") until
  the first save; it shows the checklist and the readiness checks from the
  start now.

- **A preview showed the old colours.** Previewing a theme or colour change
  painted the published palette until you published. Previews now show the
  draft's colours and typefaces.

- **Small grey and accent text was slightly too faint.** Captions, dates and
  labels met the 4.5:1 contrast minimum on the page background but not on the
  cards and bands they sit on (down to 4.39:1, and 2.83:1 for accent-coloured
  text in light mode). Every theme now derives them against every surface, and
  the publish check covers cards.

- **Four links said something different to assistive technology than on
  screen,** so voice-control users could not say the words they saw.

- **Pages with a form logged an error in every visitor's console** when spam
  protection was off.

- **A brand-new site could not save anything.** After claiming, every editing
  screen — and the welcome wizard — answered "There is no draft to change yet".
  The draft row used to be written by the legacy browser client on its first
  load; when that client was deleted in the admin rewrite, nothing wrote it any
  more. A missing draft now starts from what the screens already show (the
  published site, or the built-in content) and is created on the first save,
  create-only, so two first saves at once still end in one draft.

- **Structured data could not hold a `<` safely.** The Article JSON-LD on a
  writing page was `JSON.stringify` inside a `<script>`, so a title containing
  `</script>` — which Markdown import can bring in from somebody else's file —
  closed the tag. Every `<` is escaped as `\u003c` now, as the Next.js JSON-LD
  guide prescribes.

- **Emptying a Text block used to make it unopenable.** Clearing the text field
  writes an empty list - the editor writes what is in the box - and the block's
  schema demanded at least one paragraph, so the block came back unreadable:
  "This block cannot be shown here", no fields, and the only way out was to
  delete the block and start again. The one state a person reaches by deleting
  text was the one state the editor could not show. Empty is now a state rather
  than a refusal: the block keeps its fields, carries "This block is empty.
  Write something, or delete it." beside it in the outline, and draws nothing on
  the page, so a half-written page has no gap where the text will go. Pages
  saved in the old, invalid state open again too.

- **Dead addresses answered `200 OK`.** Every dead URL - `/no-such-route`,
  `/work/<missing>`, a bad share token - served the branded not-found page with
  a success status, in development and in production. The cause was not the
  routing: a `loading.tsx` boundary streamed a `200` shell the moment its
  segment was entered, so the status had been spent before any page ran and
  `notFound()` could only change the body. The skeletons now sit below each
  segment's existence check, and dead addresses answer `404` with the same page
  they always showed. Two guards keep it that way: a structural test over the
  boundaries, and a dead-address check in the smoke script.

- **The per-piece preview card was advertised at an address it did not
  answer.** A metadata route placed inside a route group is served at a hashed
  path, so `/writing/<slug>/opengraph-image` - what the page, the sitemap and
  the structured data all pointed at - answered 404, while a suffixed path
  nothing referred to answered 200. The route now lives outside the group, an
  unknown slug gets a 404 rather than the site-wide card, and a test fails if
  the file moves back in.

- The social preview card served as `application/octet-stream` while declaring
  itself a PNG, and had kept the old product name because it spelled it in
  capitals — which a search for the name in its normal casing does not find. It
  now takes the name from the same constant as everything else.

- Two test counts in these notes and in the developer docs were 10 short of what
  the suite actually runs. They were wrong when written rather than gone stale:
  no tests had been added since. It was 686 at that point, or 782 with a
  database and a mail server attached, and the suite has grown a lot since.

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
- 686 tests, or 782 with a database and a mail server attached.

### Known gaps

Said plainly, because they are the kind you should not discover after typing in
a portfolio:

- **Uploads verified on both hosted stores**, end to end (admin upload → anonymous fetch). Supabase and Vercel Blob.
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
