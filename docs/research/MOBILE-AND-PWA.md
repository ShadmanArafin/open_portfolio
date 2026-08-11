# Mobile and PWA

**Status:** a plan and one decision, awaiting your call. Nothing here is built.
**Derived from:** `_raw-mobile.md` (199 sources, compiled 2026-08-12). Every claim
carried forward keeps its URL. Where that dossier marked something **UNVERIFIED**,
it stays marked here — those are things nobody has confirmed against a primary
source, and they must not be repeated as fact in the README, the admin, or a
release note.

**Measured state of this app**, from a real browser at 375 px:

| Measurement                                    | Value                       |
| ---------------------------------------------- | --------------------------- |
| Horizontal overflow on the public site         | none                        |
| `h1` overflowing its own box                   | **406 px** in a 375 px view |
| Interactive elements below 24 px               | **6**                       |
| Interactive elements below 44 px               | **17**                      |
| Manifest / service worker / PWA of any kind    | **none**                    |
| Viewport meta                                  | present (Next.js default)   |
| Responsive utility classes in the entire admin | **17**                      |

Read §1 for why this is worth doing, §3 before writing any service-worker code,
and §5 today — it is the only part that needs an answer from you rather than a
sprint.

---

## 1. The opportunity

### 1.1 What the vendors actually say

Every quote below is verbatim from an official vendor page fetched during the
research pass. These are not analyst summaries.

| Platform            | Position on editing from a phone                                                                                                                           | Source                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Webflow**         | _"Webflow requires a mouse-and-keyboard device (i.e., desktop or laptop computer) with a screen width of at least 1268px."_                                | <https://help.webflow.com/hc/en-us/articles/33961260162323-Intro-to-Webflow>                             |
| **Webflow**         | _"Starting August 4, 2026, the legacy Editor will no longer be available."_                                                                                | <https://help.webflow.com/hc/en-us/articles/48412420902675-Legacy-Editor-deprecation-FAQ>                |
| **Wix**             | _"Currently, you can't edit sites created in the Wix Editor or Studio Editor using the Wix mobile app."_ — filed as a feature request, "collecting votes"  | <https://support.wix.com/en/article/wix-owner-app-request-editing-your-site-from-the-app>                |
| **Squarespace**     | _"You can edit block content in the app, but it's not possible to add or rearrange blocks on pages in the app."_                                           | <https://support.squarespace.com/hc/en-us/articles/360002093708-Edit-your-site-with-the-Squarespace-app> |
| **Squarespace**     | Eight apps discontinued 2016–2023, including the **Portfolio app (March 2019)** and the **Blog app (July 2019)**                                           | <https://support.squarespace.com/hc/en-us/articles/206544757-Discontinued-features>                      |
| **Adobe Portfolio** | _"**We do not support editing on mobile and tablet devices.** For optimal editing experience, we suggest editing your site on a desktop"_                  | <https://help.myportfolio.com/hc/en-us/articles/360038045914-Supported-Browsers-and-Devices>             |
| **Framer**          | Canvas requires _"a device running Windows, macOS, Linux, or ChromeOS"_ — iOS and Android are listed for _published sites_ and absent from the Canvas list | <https://www.framer.com/help/articles/requirements/>                                                     |
| **Ghost**           | Android app retired; notice dated **February 2020**, Play listing now HTTP 404. No replacement, no roadmap commitment                                      | <https://ghost.org/changelog/android/> · <https://forum.ghost.org/t/android-app-status/43033>            |
| **WordPress**       | Two apps from one codebase, and: _"Managing your site across both apps is currently unsupported and may lead to issues like data conflicts"_               | <https://jetpack.com/support/switch-to-the-jetpack-app/>                                                 |

The Webflow retirement is the sharpest datum. The legacy Editor was the
standalone overlay that clients realistically used from an iPad; its replacement
runs inside the Webflow application shell. **That the 1268 px minimum therefore
now applies to client content editing is an inference from two official
articles, not a published Webflow sentence** — the dossier flags it as such, and
so do we. What is quoted is that the Editor is gone as of 2026-08-04.

Two sourcing caveats that stop this being cleaner than it is: Webflow migrated
its forum, so the old `discourse.webflow.com` threads about tablet support now
301-redirect to `community.webflow.com/ask-answer` and their content is
unrecoverable (**those complaint quotes are UNVERIFIED**). Statamic quietly
stopped claiming its Control Panel is responsive between v2 and v6, but an
_absence_ of a marketing claim is weak evidence and the widely-quoted "edit from
your phone" lines could not be verified on any live Statamic page
(**UNVERIFIED**).

### 1.2 How confident can we be

Split the claim in two, because they do not deserve the same confidence.

**"No mainstream builder lets you lay out a page from a phone."** — **High
confidence.** Seven vendors, each with a direct quote from a live official page,
all saying no in different words. Webflow and Adobe say it outright; Wix says it
outright about its own app; Squarespace draws the line precisely at blocks;
Framer draws it precisely at the Canvas. There is no dissenting vendor.

**"The industry is actively retreating."** — **Moderate confidence, and it needs
qualifying.** The retreat is real where it is documented: Webflow removed a
surface on 2026-08-04, Squarespace killed eight apps to arrive at one, Ghost
killed its only app and never replaced it. But there are genuine counter-signals
in the same evidence: Sanity shipped a release specifically improving narrow
viewports (v5.31.0, 2026-06-10, "Presentation now adapts to narrow viewports" —
<https://www.sanity.io/docs/changelog/studio-NS4zMC4w>), Framer added a
mobile-friendly CMS on 2025-03-18
(<https://www.framer.com/updates/mobile-friendly-cms>), and Squarespace's app is
under active development (v2.124.0, released 2026-08-10, 4.63★ from 18,765
ratings).

The honest, defensible form of the claim is narrower and more useful:

> **Layout editing on a phone is being abandoned. Content editing on a phone is
> being invested in.** Everyone who tried the first retreated; the ones still
> shipping are shipping the second.

Do not write "the industry is abandoning mobile" in marketing copy. Write "no
major builder will let you edit your site from your phone; we do" — and mean
_content_.

### 1.3 What it means for us

The dossier sorts the field into three tiers. We are, by architecture, in the
first one and did not have to choose it:

| Tier                         | Who                                           | What it costs them                                                  |
| ---------------------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| **Responsive admin, no app** | Sanity, Statamic, Ghost, WordPress mobile web | CSS discipline. No store, no second codebase, no review queue.      |
| **Companion app**            | Squarespace, Wix, Format                      | A native team, forever. Squarespace killed eight apps getting here. |
| **Desktop-only**             | Webflow, Framer, Adobe Portfolio, Carrd       | Nothing — they simply refuse the phone.                             |

Our admin is already a single responsive React SPA behind
`app/admin/[[...slug]]`. Making it work at 375 px is a CSS and layout problem,
not a product to build. That is the whole advantage: **we can beat every
platform in the table on the one axis users notice — does it work on my phone —
for the price of a few weeks of layout work, because we chose the web and never
took on an app.**

The demand is not hypothetical. Third-party apps exist purely because the
vendors won't ship one: **Phoneflow — Webflow on Phone** (v2.10.5, updated
2026-05-19, <https://apps.apple.com/us/app/phoneflow-webflow-on-phone/id1528892928>),
EditFlow, Flow To-Go, "Ghost CMS Editor & Publisher" (updated 2026-08-09), and
**Nib**, an Android Ghost client announced on Ghost's own forum on 2026-08-08
whose opening line is _"I wanted to write to my Ghost site from my phone, so I
built an Android app for it."_
(<https://forum.ghost.org/t/i-built-nib-an-android-app-for-posting-to-ghost/63530>)

### 1.4 The counterweight, which should temper the ambition

Format built exactly the product this section argues for — a genuine iOS app
that creates galleries, writes blog posts, edits the site menu and _"modif[ies]
your website in real-time on your phone"_. It is actively maintained (v2.16.6,
released 2026-03-30, release notes citing Apple's Liquid Glass UI).

It has **4 ratings**. Total.
<https://apps.apple.com/us/app/format/id1080574504>

Read that as the ceiling on this opportunity, not as a reason to skip it. Mobile
admin is a **retention and differentiation** feature — the thing that makes
someone keep the site rather than the thing that makes them choose it. Size the
investment accordingly: weeks of layout work, yes; a native app or an offline
sync engine, no.

---

## 2. What to build, in order

Estimates are developer-days for one maintainer who knows this codebase. They
are my calibration, not measurements.

| #   | Work                                           | Effort        | Risk                | Unlocks                                                               |
| --- | ---------------------------------------------- | ------------- | ------------------- | --------------------------------------------------------------------- |
| 0   | Tap targets + the overflowing `h1`             | ~1 d          | None                | WCAG 2.2 AA on the public site; the right to claim "works on a phone" |
| 1   | Viewport, manifest, icons, `apple-touch-icon`  | ~1 d          | Low                 | Installability; iOS storage exemption; the precondition for iOS push  |
| 2   | Mobile admin layout                            | 10–20 d       | Scope               | The entire competitive claim in §1                                    |
| 3   | Install nudge (iOS instructions only)          | ~0.5 d        | Nagging             | Conversion into the installed state that 1 depends on                 |
| 4   | Connectivity awareness (no caching)            | ~1 d          | None                | "Don't lose my save on the train", told honestly                      |
| 5   | Notifications for new contact messages         | 1 d → 5 d     | iOS silence         | Owner finds out about an enquiry without opening the admin            |
| 6   | _Optional, later:_ service worker with caching | ~2 d + review | **High** — see §3.1 | Offline fallback page, faster repeat loads                            |

### Phase 0 — Fix our own accessibility first (~1 day, no risk)

Six controls fail **SC 2.5.8 Target Size (Minimum), Level AA**. That is a
conformance failure today, on the public site, on every deployment anyone makes
with this software. It is also the cheapest item on the list. Full checklist in
§7.

Do this first for a reason beyond conformance: everything after it is a claim
about mobile quality, and shipping a manifest on top of an admin with 16 px tap
targets makes the claim worse, not better.

### Phase 1 — Manifest, icons, viewport (~1 day, low risk)

Small, and it is the keystone: three separate later capabilities are gated on
being installed, not merely on being installable.

**What being installed buys us, each from a primary source:**

- **Safari's 7-day storage cap does not apply.** WebKit, on the 7-day cap over
  _"Indexed DB, LocalStorage, Media keys, SessionStorage, Service Worker
  registrations and cache"_: _"Web applications added to the home screen are not
  part of Safari and thus have their own counter of days of use."_
  <https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/>
- **Chrome will not auto-revoke the notification permission.** Since 2025-10-10
  Chrome removes notification permission from low-engagement sites, but the post
  carries an explicit carve-out: _"does not revoke notifications for any
  installed web apps."_
  <https://blog.google/chromium/automatic-notification-permission/>
- **iOS push requires it.** iOS 16.4+ only delivers Web Push to a web app added
  to the Home Screen (§4).

**Concrete shape:**

```ts
// app/manifest.ts
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  return {
    id: '/admin',
    name: `${siteName} admin`,
    short_name: siteName,
    start_url: '/admin',
    scope: '/',
    display: 'standalone',
    background_color: appearance.background, // from the owner's appearance settings
    theme_color: appearance.accent, //     "
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
```

Decisions embedded there, and why:

- **`start_url: '/admin'`.** The person who installs a portfolio _builder_ is the
  owner, not a visitor. `middleware.ts` already sends a session-less visitor to
  `/admin/login`, so both audiences land somewhere sensible. If we ever want a
  visitor-facing install, that needs a second manifest linked only from the
  public layout — _(implementation detail not covered by the dossier; verify
  before relying on it)_.
- **`display: 'standalone'`.** iOS 26 removed installability requirements
  entirely — WebKit: _"There are now zero requirements for 'installability' in
  Safari"_ and _"By default, every website added to the Home Screen opens as a
  web app"_ (<https://webkit.org/blog/17333/webkit-features-in-safari-26-0/>).
  But the 2023 Web Push rules required a manifest with `display: standalone` or
  `fullscreen`, and Apple has never restated whether that still holds on iOS 26.
  **That is an open UNVERIFIED question needing a device test.** Shipping
  `standalone` satisfies both readings and costs nothing.
- **No `orientation`.** Setting `orientation: "portrait"` locks an installed PWA
  to portrait and engages **SC 1.3.4 Orientation (AA)**. Omit it.
- **192 _and_ 512.** Chromium's install criteria require both — MDN: icons _"must
  contain a 192px and a 512px icon"_
  (<https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable>).
  We currently ship one `favicon.svg` and nothing else.
- **Two icon files, not one combined.** web.dev: _"We don't recommend using
  multiple purposes for maskable icons. Using `maskable` icons as `any` icons
  adds unnecessary padding, making the core icon content smaller."_
  (<https://web.dev/articles/maskable-icon>). The maskable safe zone is _"a
  circular area in the center of the icon with a radius equal to 40% of the icon
  width"_ — for 512 px that is a **409.6 px** safe diameter; anything outside can
  be cropped by Android's mask. This is also forced on us by the type: Next's
  `MetadataRoute.Manifest` types `purpose` as a single literal union, so the
  spec-legal `"any maskable"` is not expressible without a cast.
- **`apple-touch-icon` separately.** iOS does not generate splash screens from
  the manifest; that needs per-device `<link rel="apple-touch-startup-image">`
  entries. Whether iOS 26 changed this is **UNVERIFIED**. `apple-touch-icon`
  remains the reliable iOS icon path. Splash screens are a nice-to-have — skip
  them in v1.
- **The manifest reading published content makes it dynamic.** Next: _"`manifest.js`
  is a special Route Handler that is cached by default unless it uses a
  [Request-time API] or dynamic config option"_
  (<https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest>).
  Reading the site name and theme colour is worth the invocation — this is _their_
  site's icon on _their_ home screen — but set a `revalidate`.

**Worth adding cheaply while we are here:** `shortcuts` (long-press the icon →
"Inbox", "New page") is in the type and costs three lines. `screenshots` with
`form_factor: 'narrow'` improves the Chromium install dialogue.

**Worth wanting, later, once verified:** `share_target` is in Next's manifest
type and is the highest-value idea in the dossier for a photographer's tool —
share a photo from the iOS or Android photo app straight into the media library.
Chromium/Android supports it; **iOS support is UNVERIFIED** (caniuse has no
`web-share-target` entry at all). Verify on a device before scoping it.

### Phase 2 — Mobile admin layout (10–20 days, scope risk)

This is the actual product. Seventeen responsive utility classes exist across
the whole admin, all of them grid-column tweaks in five page files; the shell
itself — Astryx `AppShell` with `SideNav` — has none.

Frame it before writing CSS, per the project's own layout rule: pick the shell
and budget regions in pixels first. The evidence that should shape it:

- **Reach.** 49% of use is one-handed, 36% cradled, 15% two-handed; within
  one-handed use the right thumb is 67%; two-handed use is 90% portrait. Steven
  Hoober, 1,333 observations, 780 of them interactive —
  <https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php>.
  ⚠️ This is a **2013** study and phones have grown. Treat the proportions as
  directional and the reach principle as durable; no newer study of equivalent
  rigour was located.
- **Bottom bar, not hamburger, and no more than five destinations.** NN/g: _"Tab
  bars and navigation bars are well suited for sites with relatively few
  navigation options"_ and beyond five, fitting them while keeping proper
  touch-target sizes becomes problematic; hidden menus make options _"least
  discoverable"_ — <https://www.nngroup.com/articles/mobile-navigation-patterns/>.
  NN/g publishes no quantitative discoverability figures, so do not cite any.
- **`env(safe-area-inset-bottom)`** on anything anchored to the bottom, or the
  primary action sits under the iPhone home indicator. Baseline widely available
  since January 2020 — <https://developer.mozilla.org/en-US/docs/Web/CSS/env>.
- **`dvh`/`svh`, never `vh`** for sheet and panel heights. Plain `vh` equals the
  _large_ variant — the viewport with browser UI retracted — so a `100vh` sheet
  is clipped whenever the toolbar is showing.
- **Inputs at ≥16 px.** _"If the `font-size` of an `<input>` is 16px or larger,
  Safari on iOS will focus into the input normally. But as soon as the
  `font-size` is 15px or less, the viewport will zoom."_
  <https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/>. Fix it
  with font size. **Never** with `user-scalable=no` — see §7.
- **`interactive-widget`** in the viewport meta controls what the on-screen
  keyboard resizes (`resizes-visual` is the default). MDN publishes no
  browser-support data for it, so **support is UNVERIFIED** — do not build a
  layout that depends on it.

**Scope discipline is the real risk here.** The line Squarespace draws after
years of iteration is the line to copy: _content yes, structure no._ Editing
text, swapping an image, reordering within a list with buttons, reading the
inbox, publishing — all yes. A drag-and-drop block canvas at 375 px is where
this turns from three weeks into three months, and §7 shows it is also the item
that drags **SC 2.5.7 Dragging Movements** and **SC 2.5.1 Pointer Gestures** in
with it.

### Phase 3 — Install nudge (~0.5 day)

Detect `window.matchMedia('(display-mode: standalone)').matches`; if already
installed, render nothing. If on iOS, render the "tap Share, then Add to Home
Screen" instructions — Next's official guide ships that component verbatim
(<https://nextjs.org/docs/app/guides/progressive-web-apps>).

**Do not use `beforeinstallprompt`.** It is `false` on Firefox, Safari and iOS
Safari in MDN's compat data, lives in the non-standard "Manifest Incubations"
spec, and MDN labels it _"Limited availability — This feature is not Baseline
because it does not work in some of the most widely-used browsers."_ Next.js's
own guide says: _"You can provide a custom installation button with
`beforeinstallprompt`, however, we do not recommend this as it is not cross
browser and platform (does not work on Safari iOS)."_

Chromium shows its own install affordance once the manifest is valid, which is
the whole point of phase 1. The only place we need custom UI is iOS, where no
API exists.

The risk here is social, not technical: an install prompt that appears on every
visit is an irritation. Show it once, after a successful action, with a
"not now" that is remembered.

### Phase 4 — Connectivity awareness, and nothing more (~1 day)

The failure our users actually hit is not "I want to work on a train with no
signal". It is "I pressed Save in a lift and lost the paragraph". Those need
completely different engineering, and only the second one is worth building.

Ship: an `online`/`offline` listener, a status banner using action-based
language, destructive submits disabled while offline with a reason given, and an
automatic retry when connectivity returns. About forty lines. No service worker,
no cache, no outbox — therefore none of §3.

Note that `navigator.onLine` alone is unreliable — it reports online for a
captive-portal Wi-Fi _(engineering note, not from the dossier)_. Next's
`useOffline` uses a better heuristic worth copying; see §6.

### Phase 5 — Notifications for new contact messages (1 day, or 5)

Two products, and the cheap one is better for most owners. See §4 in full. The
short version: send the owner an email (we already have `nodemailer` and an SMTP
integration) and offer a webhook — Telegram, Discord, or ntfy — which gives a
real push notification on an iPhone with **no PWA install and about ten lines of
code**. Web Push is the polished option and should come after, not instead.

### Phase 6 — A caching service worker (only if we decide we want one)

Read §3.1 in full before starting. The honest position is that we probably do
not need it: the only thing caching buys a single-owner admin is an offline
fallback page and slightly faster repeat loads, and the downside is a
device-local cache of authenticated content that our security headers cannot
reach.

---

### What we are deliberately not building

| Not building                                  | Why                                                                                                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A native app**                              | Squarespace killed eight. Ghost killed its one and never replaced it. Format's, which does exactly what we would build, has 4 ratings. Two codebases and a review queue, forever.                |
| **Serwist's `defaultCache` unmodified**       | It caches authenticated admin HTML, RSC payloads and `/api/admin/*` JSON for 24 hours in an origin-scoped cache. §3.1.                                                                           |
| **Offline editing / an outbox**               | Background Sync does not exist on iOS, so it can only flush when the app is next opened (§3.2). Cache API cannot replay POSTs or Server Actions at all. Vercel's own answer is retry, not cache. |
| **A drag-and-drop layout canvas at 375 px**   | Everyone who built one retreated from it. HTML5 drag-and-drop is `n` on Firefox Android 153 and Samsung Internet 30. **SC 2.5.7** would require a no-drag equivalent anyway.                     |
| **`beforeinstallprompt`**                     | `false` on Firefox, Safari, iOS Safari. Next's own docs advise against it.                                                                                                                       |
| **`orientation: "portrait"` in the manifest** | Locks an installed app to one orientation, engaging **SC 1.3.4 (AA)**.                                                                                                                           |
| **`user-scalable=no` to stop iOS input zoom** | Fails **SC 1.4.4**, and iOS 10+ ignores `user-scalable`, `maximum-scale` and `minimum-scale` by default anyway — so it damages accessibility without even working.                               |
| **iOS splash screens in v1**                  | One image per device size class, hand-generated, and whether iOS 26 still needs them is **UNVERIFIED**.                                                                                          |

---

## 3. Two hazards

These are the two places where a reasonable-looking implementation is wrong in a
way you will not notice until a user is harmed.

### 3.1 Serwist's `defaultCache` will cache the logged-in admin

**Read this before adding any service worker to this repo.**

Serwist is the right library (§6). Its `defaultCache` export is what its docs
point at and what almost everyone drops in unmodified. Read directly from the
`@serwist/next@9.5.12` tarball (`dist/index.worker.mjs`), the production rules
include:

| Rule | Matcher                                                        | Strategy        | Cache name           | maxAge   |
| ---- | -------------------------------------------------------------- | --------------- | -------------------- | -------- |
| 13   | **`/api/auth/*`**                                              | **NetworkOnly** | —                    | —        |
| 14   | same-origin GET `/api/*`                                       | NetworkFirst    | `apis`               | **24 h** |
| 15   | `RSC: 1` + `Next-Router-Prefetch: 1`, same-origin, not `/api/` | NetworkFirst    | `pages-rsc-prefetch` | **24 h** |
| 16   | `RSC: 1`, same-origin, not `/api/`                             | NetworkFirst    | `pages-rsc`          | **24 h** |
| 17   | `Content-Type: text/html`, same-origin, not `/api/`            | NetworkFirst    | `pages`              | **24 h** |

Rule 13 shows the authors knew this class of problem exists — they carved out
`/api/auth/*` specifically. **Rules 14 to 17 have no auth exclusion at all.**

**What that means in this codebase specifically.** Our admin is a single
document at `app/admin/[[...slug]]` that fetches its data from `/api/admin/*`.
So with `defaultCache` in place:

- the rendered admin shell is stored in the `pages` cache for 24 hours (rule 17);
- its RSC payloads are stored in `pages-rsc` / `pages-rsc-prefetch` (rules 15–16);
- **`GET /api/admin/messages` — the contact inbox, containing visitors' names,
  email addresses and message bodies — is stored in the `apis` cache for 24
  hours** (rule 14). Only `/api/auth/*` is excluded, and our auth routes are the
  only thing that carve-out protects.

**Why this is worse than "a stale page".**

1. **Cache Storage is keyed by origin, not by session or user.** Nothing in a
   cache entry records who fetched it. Two people using the same device share one
   cache.
2. **A service worker answers before the network, so `middleware.ts` never
   runs.** Our redirect-to-login lives in middleware, on the server. A response
   served from Cache Storage never reaches it. _(Inference from how service
   worker `fetch` interception works — not a vendor statement.)_
3. **HTTP cache headers do not constrain Cache Storage.** The Cache API is a
   programmatic store, not an HTTP cache; it holds whatever the service worker
   puts into it regardless of `Cache-Control: no-store`. Our `next.config.ts`
   comment already says the admin "must never be cached by a CDN" — a service
   worker would be a cache we install _inside the device_, past every header we
   set. (Background:
   <https://web.dev/articles/service-worker-caching-and-http-caching>)
4. **Logging out does not clear it.** `POST /api/auth/logout` calls
   `destroySession()`, which clears the cookie. Nothing touches Cache Storage
   unless we write that code.

**The concrete scenario.** A photographer hands their phone to an assistant, or
sells it, or the studio iPad is shared. The device is in a lift or on aeroplane
mode. The next person opens the app: they get the previous session's rendered
admin shell and, if anything requests the inbox, the previous session's client
enquiries — names, addresses, message bodies — served from the device with no
network round trip and therefore no authentication.

**⚠️ You cannot reproduce any of this with `next dev`.** `defaultCache` is
literally `[{ matcher: /.*/i, handler: new NetworkOnly() }]` whenever
`NODE_ENV !== 'production'`. Every rule above exists only in production builds.
Any testing must be `next build && next start`, or the Docker image, over
HTTPS or `localhost`.

#### The configuration that prevents it

Two layers, because the first one depends on getting an ordering assumption
right and the second does not.

**Layer 1 — never let a private URL reach `defaultCache`.**

```ts
// app/sw.ts
import { defaultCache } from '@serwist/next/worker';
import { Serwist, NetworkOnly } from 'serwist';

const PRIVATE = /^\/(admin|setup|api)(\/|$)/;

new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching: [
    // FIRST, before anything else. Anything private must never fall through
    // to defaultCache's rules 14–17.
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && PRIVATE.test(url.pathname),
      handler: new NetworkOnly(),
    },
    // Belt and braces: non-GET is never cacheable anyway, but be explicit.
    { matcher: ({ request }) => request.method !== 'GET', handler: new NetworkOnly() },
    ...defaultCache,
  ],
});
```

Note the `/api` in that regex covers **all** of it, not just `/api/auth/*`. Note
also that this deliberately excludes `/setup`.

Two things to verify against Serwist's own docs before trusting this, because
the dossier did not confirm either: **(a)** that route matching is
first-match-wins — strongly implied by `defaultCache` ending in a catch-all, but
an inference; **(b)** the exact callback signature, including whether the
property is named `sameOrigin`. If either is wrong the config silently does
nothing, which is the worst possible failure mode. Prove it with a production
build and DevTools → Application → Cache Storage: after visiting the admin, the
`pages`, `pages-rsc` and `apis` caches must be **empty**.

**Layer 2 — the parts that do not depend on getting layer 1 right.**

- **Clear caches on logout**, before redirecting:

  ```ts
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => /^(pages|pages-rsc|pages-rsc-prefetch|apis|others|next-data)/.test(n))
        .map((n) => caches.delete(n))
    );
  }
  ```

  Those names are exactly Serwist's (rules 11, 14–18). **This is a mitigation,
  not the fix** — it only runs when logout happens in a live page with
  JavaScript. A server-side session expiry, a cleared cookie, or a closed tab
  leaves everything in place.

- **Set `Cache-Control: private, no-store` on `/admin/:path*` and
  `/api/admin/:path*`** in `next.config.ts`. It does not restrain the service
  worker (point 3 above), but it is correct for every _other_ cache between us
  and the user, and the config currently only sets `X-Robots-Tag` there.

- **Add the service-worker headers from Next's guide**, which we do not have:

  ```js
  // next.config.ts — one more entry in headers()
  const serviceWorkerHeaders = {
    source: '/sw.js',
    headers: [
      { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
      { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
    ],
  };
  ```

  and register with `updateViaCache: 'none'`. Without both, an HTTP-cached
  service worker script can pin an old caching policy in place for as long as
  its max-age — including a policy we have since fixed.

**The simplest correct answer, and my recommendation:** do not cache anything
private at all, which means for v1 we do not need Serwist. The official Next.js
guide's service worker handles `push` and `notificationclick` and contains no
caching whatsoever. That gets us installability, push, and the iOS storage
exemption with none of this hazard. Adopt Serwist when we want precaching or an
offline fallback page, and only with the configuration above.

**Related trap worth knowing if we ever do cache.** `NetworkFirst` returns a copy
up to 24 hours old when the network fails. If the editor loads that copy, edits
it, and saves when connectivity returns, the save is computed from stale state
and silently overwrites anything changed in between. There is no version check
in any of Serwist's default rules. If we ever cache editable content, we need an
`updatedAt`/ETag check server-side, or a rule that the editor never renders from
a cached response.

### 3.2 Background Sync does not exist on iOS — so do not promise it

| API                   | Chrome | Chrome Android | Firefox   | Safari    | **iOS Safari** |
| --------------------- | ------ | -------------- | --------- | --------- | -------------- |
| `SyncManager`         | 49     | yes            | **false** | **false** | **false**      |
| `PeriodicSyncManager` | 80     | yes            | false     | false     | false          |

caniuse `background-sync`: `safari 26.5 = n`, `ios_saf 26.5 = n`. MDN calls it
_"Limited availability — This feature is not Baseline because it does not work
in some of the most widely-used browsers."_
<https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API>

**The consequence is absolute, not partial.** On an iPhone there is no mechanism
by which a queued write leaves the device while the app is closed. A draft
written to IndexedDB sits there until the owner next opens the app. Any UI that
says "we'll send this in the background", "we'll take care of it", or "syncing…"
is **false on every iPhone** — and iPhone is precisely the device a photographer
uses.

Note that Next's `useOffline` retry loop does retry an in-flight Server Action
when connectivity returns, but **only while the page is still open**. It does
not survive the tab closing either.

Even web.dev's own recommended wording fails this test. Their offline UX
guidelines offer as an example: _"You seem to have a bad network connection. Not
to worry! Messages will be sent when the network is restored."_
(<https://web.dev/articles/offline-ux-design-guidelines>). On iOS that sentence
is a lie unless the app stays open. We cannot use it verbatim.

#### What honest UI looks like instead

The same web.dev guidance still applies where it is about clarity rather than
capability: _"When explaining UI components or the state of the app, avoid tech
jargon. The word 'offline' often isn't clear enough."_ Use action-based
language; use several cues together (colour _and_ label _and_ icon), not one;
communicate sync status; do not block the user from continuing to work.

Applied to us:

| Instead of                    | Say                                                                   |
| ----------------------------- | --------------------------------------------------------------------- |
| "You are offline"             | "Can't reach your site right now — changes aren't saved yet"          |
| "Will sync in the background" | "Saved on this phone. It will go up next time you open this app"      |
| "Syncing…"                    | "3 changes waiting. **Send now**" — with a button that actually tries |
| A silent spinner              | A named device, a visible count, and a manual retry                   |

Three further honesty requirements if we ever do store anything locally:

- **Do not imply a local draft is safe.** Safari deletes IndexedDB, localStorage
  and service-worker registrations after seven days of Safari use without
  interaction with the site — unless the app is installed to the Home Screen
  (§1.9 of the dossier, WebKit source above). An owner who edits from a Safari
  tab once a fortnight loses local drafts and will never be told why.
- **Two installs are two separate drafts.** iOS lets the same PWA be installed
  more than once and _"each installation will have its own isolated storage"_
  (<https://web.dev/learn/pwa/installation>). "Your draft" may be behind the
  other icon.
- **The best version of this feature is not having it.** If v1 never queues
  writes offline, there is nothing to be dishonest about: show connectivity
  state, disable the destructive action with a reason, keep the text in the form,
  retry when the connection returns. That is phase 4, and it is one day of work.

---

## 4. Push notifications, realistically

### 4.1 Who actually gets a notification

| Owner's device                                 | Gets push? | Conditions                                                                               |
| ---------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| Android — Chrome, Edge, Samsung Internet       | **Yes**    | Installing is not required, but it protects the permission from Chrome's auto-revocation |
| Android / desktop — Firefox                    | **Yes**    | caniuse note 2: _"Requires full browser to be running to receive messages"_              |
| Desktop — Chrome, Edge                         | **Yes**    | as above                                                                                 |
| macOS — Safari 16+                             | **Yes**    | caniuse note 6: _"Supported in Safari, not WKWebView nor SFSafariViewController"_        |
| **iPhone / iPad — installed to Home Screen**   | **Yes**    | **iOS 16.4+ only**; permission must come from a direct user gesture                      |
| **iPhone / iPad — site open in a browser tab** | **No**     | caniuse `push-api` note 7: _"Requires website to first be added to the Home Screen."_    |
| **iOS below 16.4**                             | **No**     | `PushManager` and `Notification` both land at 16.4                                       |
| Any in-app browser (Instagram, LinkedIn)       | **No**     | WKWebView / SFSafariViewController cannot subscribe                                      |

**The sentence to put in the admin, not just in this document: an iPhone owner
who has not added the admin to their Home Screen will receive nothing at all.**
Not an error, not a fallback — silence. That single fact is the reason phase 1
comes before phase 5, and the reason the install nudge exists.

### 4.2 What iOS drops on the floor

| Notification option  | Chrome | Chrome Android | Firefox | **Safari / iOS** |
| -------------------- | ------ | -------------- | ------- | ---------------- |
| `body`               | 33     | 42             | 26      | 11 / 16.4        |
| `data`               | 44     | yes            | 34      | 16 / 16.4        |
| `actions` (buttons)  | 48     | yes            | 152     | **false**        |
| `badge`              | 53     | yes            | false   | **false**        |
| `image`              | 56     | yes            | false   | **false**        |
| `vibrate`            | 45     | **false**      | false   | **false**        |
| `requireInteraction` | 47     | yes            | false   | false            |

So the notification must carry its whole meaning in **title and body**, and the
tap must land somewhere useful via `notificationclick`. No action buttons ("Reply"
/ "Archive") on iOS — they do not exist there.

**A trap worth naming because it is in the official example.** Next.js's own PWA
guide ships a service worker using `badge: '/badge.png'` and
`vibrate: [100, 50, 100]`. Copy it and you ship two no-ops on iOS, and `vibrate`
is also dead on Chrome Android.

**`setAppBadge` is the inverse of what people assume:** Safari 17 / iOS 16.4
support it, **Chrome Android is `false`**. The number on the app icon works on
iPhone and not on Android.

### 4.3 Subscription lifecycle

- **`pushsubscriptionchange` never fires on iOS Safari** (MDN BCD:
  `safari_ios = false`) and only landed in **Chrome 138**. Any design that
  assumes the service worker will be told its subscription rotated is unreliable
  on the majority of our owners' devices.
- **The fallback is a poll on open:** on every app open, call
  `registration.pushManager.getSubscription()`, compare the endpoint with what
  the server stored, and re-register if it differs.
- **Prune on `404` / `410 Gone`** from `sendNotification`. The library surfaces
  `statusCode` for exactly this. A dead subscription that is never deleted is a
  wasted outbound request forever.
- `PushSubscription.expirationTime` is supported everywhere but is usually
  `null` in practice — **UNVERIFIED**.
- Deleting the home-screen icon on iOS destroys that installation's storage and
  subscription. **UNVERIFIED as an explicit Apple statement** — it is implied by
  the isolated-storage behaviour.
- The push endpoint is a **capability URL and must be kept secret**
  (<https://developer.mozilla.org/en-US/docs/Web/API/Push_API>).

### 4.4 Sending it ourselves

Everything is in-process; there is no service to sign up for. Generate one VAPID
keypair, subscribe the client, POST the serialised subscription to our own
server, and `webpush.sendNotification()` talks directly to whichever push
service the endpoint names — FCM for Chrome, Mozilla autopush for Firefox,
`web.push.apple.com` for Safari and iOS.

| Fact                                    | Detail                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `web-push`                              | **3.6.7**, published **2024-01-16**. Not deprecated. <https://github.com/web-push-libs/web-push>                |
| Runtime                                 | Node only (uses node `crypto` / `https`). Fine in our route handlers and Server Actions, which default to Node. |
| Edge runtime                            | Will not run. PushForge and `@mmmike/web-push` exist; **both UNVERIFIED for maintenance status and version**.   |
| Payload size                            | 2–4096 octets. The 4096 APNs figure is consistent across sources but **Apple's own doc was not fetched**.       |
| Serverless sending                      | One outbound POST per subscription. For 1–3 owner devices this is trivial.                                      |
| Vercel limits on outbound push requests | **Not verified. No evidence of any limit was found.**                                                           |

**The localhost trap, verbatim from the `web-push` README:**

> "As of this writing, if a push notification request contains a VAPID `subject`
> referencing an `https://localhost` URI (set either using the `options` argument
> or via the global `setVapidDetails()` method), Safari's push notification
> endpoint rejects the request with a `BadJwtToken` error."

For a self-hosted product this is a live footgun: someone running on a LAN box
will end up with a localhost subject and iOS push will fail silently. Use a
`mailto:` subject, and validate it at startup.

**Two consequences of being self-hosted that the Next.js guide does not cover:**

1. **VAPID keys must be generated automatically at first boot and stored in the
   database.** A photographer will not run `web-push generate-vapid-keys`. But
   the guide's pattern puts the public key in `NEXT_PUBLIC_VAPID_PUBLIC_KEY`,
   which Next inlines **at build time** — useless for keys minted at runtime. We
   must serve the public key from a small endpoint instead.
2. **Subscriptions are a new table, and therefore a storage-adapter change** that
   must work across local filesystem, Postgres, Supabase and Neon. That, not the
   push code, is the real cost. Next's own guide is explicit that its in-memory
   store is a demo: _"In a production environment, you would want to store the
   subscription in a database for persistence across server restarts and to
   manage multiple users' subscriptions."_

**Permission prompting.** The request must come from a user gesture — WebKit
requires _"direct user interaction — such as tapping on a 'subscribe' button
provided by the web app."_ Use a soft pre-prompt first and only call the native
API if the user says yes, because a native "Block" is effectively permanent.
Auto-prompting on load is also a fast route into Chrome's quiet UI.

**Declarative Web Push** (Safari 18.4+) is worth knowing about but not worth
building yet: a `{"web_push": 8030, "notification": {...}}` payload that Safari
renders with no service worker, and which is backwards-compatible — _"If your
push message arrives to a newer browser, it's handled declaratively by the
browser. If it arrives to an older browser, it's handled imperatively by
JavaScript as it always had been."_
(<https://webkit.org/blog/16535/meet-declarative-web-push/>). Still scoped to
home-screen web apps on iOS, so it changes none of §4.1. A third-party claim
that it has become a W3C Working Draft and the preferred format is
**UNVERIFIED**.

### 4.5 The recommendation

**Ship email first, then a webhook, then Web Push — in that order, and be
willing to stop after the second.**

- **Email** already works here (`nodemailer`, `core/email/transport.ts`, an SMTP
  integration). It reaches every owner on every device with zero new surface.
- **A webhook** — Telegram bot, Discord webhook, or ntfy — is one HTTP POST, no
  client-side code, no subscription table, no VAPID rotation, and it produces a
  **real push notification on an iPhone with no PWA install at all**. The dossier
  puts it plainly: _"For a solo portfolio owner this is strictly better
  engineering than web push."_ I agree. It is an afternoon.
- **Web Push** is the polished, no-third-party option and it is genuinely nice
  once the PWA exists. But it costs a storage-adapter migration, per-install key
  generation, a public-key endpoint, subscription pruning, an open-on-poll
  re-check, and it silently gives an un-installed iPhone owner nothing.

Ongoing note: on Vercel Hobby, batching or digesting notifications by cron is
capped at **once per day, ±59 minutes** — a more frequent cron expression fails
at deploy time with `Hobby accounts are limited to daily cron jobs`
(<https://vercel.com/docs/cron-jobs/usage-and-pricing>). Per-message
notifications are unaffected.

---

## 5. A decision, not a plan: Vercel Hobby forbids commercial use

Our README leads with the Deploy-with-Vercel button and describes the free tier
as the primary path. The terms of that tier are worth reading in full.

### What the terms say — verbatim

<https://vercel.com/docs/limits/fair-use-guidelines> (last updated 2026-07-29):

> "**Hobby teams** are restricted to non-commercial personal use only. All
> commercial usage of the platform requires either a Pro or Enterprise plan.
> Commercial usage is defined as any Deployment that is used for the purpose of
> financial gain of **anyone** involved in **any part of the production** of the
> project, including a paid employee or consultant writing the code."

The same page explicitly lists as commercial usage:

- **"Advertising the sale of a product or service"**
- **"Receiving payment to create, update, or host the site"**
- affiliate linking as a primary purpose
- any advertising, including AdSense

and carries the callout that **"Asking for Donations fall under commercial
usage."**

### What is quoted and what is inference

**Quoted, above:** every sentence in the block. Including the donations line.

**Inference — ours, and the dossier's:** that a freelance designer's portfolio
saying "Hire me", or listing services and rates, constitutes "advertising the
sale of a service". Vercel does not mention portfolios anywhere. This is a plain
reading of a broadly-worded clause, and it is the reading a careful person would
take, but **it is not a Vercel statement about our users.**

**Not evidenced either way:** enforcement. The dossier contains no evidence that
Vercel has ever acted against a small portfolio site, and no evidence that it
has not. Nobody should tell users "Vercel will take your site down" — we do not
know that. Nor should anyone tell them "nobody enforces it" — we do not know
that either.

**Not affected at all:** our software. This is a restriction on a Vercel plan,
not on Open Portfolio Builder. The problem is narrower and entirely ours: **our
README steers a freelancer towards a plan whose terms their intended use appears
to breach, without telling them.**

### Who this actually catches

| User                                                 | On a plain reading of the terms                                      |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| Student portfolio, no services offered, no donations | Fine on Hobby                                                        |
| Photographer or designer advertising services        | Commercial → Pro                                                     |
| Anyone with a "Buy me a coffee" or donate link       | **Explicitly** commercial by the quoted callout                      |
| Anyone who paid someone to set the site up           | Caught by "including a paid employee or consultant writing the code" |
| Writer with a portfolio and no commerce              | Fine on Hobby                                                        |

That fourth row deserves attention. The clause reaches "anyone involved in any
part of the production of the project" — which on its face includes paying a
friend to do the deployment. That is a plausible path for exactly the
non-technical users this project targets.

### Options

| #   | Option                                                | What changes                                                                                    | Cost to the user                   | Cost to us                                                |
| --- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------- |
| A   | Keep Vercel first, add a plain-language warning       | One sentence beside the Deploy button naming the restriction and linking the terms              | £0, or Pro at $20/mo               | ~1 hour of docs                                           |
| B   | Give Docker/VPS equal billing as the default for pros | README leads with two paths; `docker compose up` is presented as the one with no terms attached | ~$5/mo VPS, needs a server         | Docs rewrite; the Docker path already works               |
| C   | Recommend a different host without this clause        | A second one-click path                                                                         | varies                             | Research first — see below                                |
| D   | Say nothing                                           | Status quo                                                                                      | A ToS breach they never knew about | Reputational, and it is the kind of thing found in public |

**Option C carries a research prerequisite.** The README currently says "works
on Vercel/Netlify". **Netlify's 2026 terms were not examined in this research
pass — UNVERIFIED.** Do not present Netlify as the safe alternative until
someone has read its equivalent clause. The same applies to Render, Railway and
Fly.

### Recommendation

**A and B together, now. Reject D explicitly, because it is what happens by
default.**

The Deploy button is genuinely the best onboarding in this category and it is
_correct_ for the student and hobbyist audience, who are a real and large part
of our users. Keep it. But stop presenting it as _the_ path:

1. Put one sentence beside the button: Vercel's free Hobby tier is for
   non-commercial personal use, which by their terms includes asking for
   donations — link <https://vercel.com/docs/limits/fair-use-guidelines>.
2. Give the Docker path equal billing rather than second billing. It exists, it
   is verified, and it is the answer with no terms attached — which for a
   freelancer-facing product is the _compliant_ default, not merely the
   self-reliant one.
3. Do not claim Vercel forbids portfolios. They do not say that.
4. Do not claim enforcement is unlikely. We do not know.

This is one decision and about a day of documentation. It is the only item in
this document that is a liability rather than a feature.

---

## 6. Tooling decision

### Service-worker library

| Package                   | Latest     | Published      | Verdict                                                                                                                                                 |
| ------------------------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next-pwa` (shadowwalker) | 5.6.0      | **2022-08-23** | **Do not use.** ~4 years without a release, 123 open issues, 15 open PRs. Never formally deprecated on npm, which is why blog posts still recommend it. |
| `@ducanh2912/next-pwa`    | 10.2.9     | 2024-09-18     | **Do not use.** Its own README: _"consider migrating to `@serwist/next`."_                                                                              |
| **`@serwist/next`**       | **9.5.12** | **2026-07-22** | **The only maintained option.** MIT, `next: ">=14.0.0"`, Node ≥18, Turbopack example exists.                                                            |

Next.js's own docs name it: _"For full service-worker-based offline caching, one
option is Serwist, which provides Next.js integration examples for both Turbopack
and webpack."_ <https://serwist.pages.dev/docs/next>

**Decision: Serwist is the right library, and we should not install it yet.**
The first question is not which library, it is whether to cache at all. For
phases 1–5 the answer is no, and the official Next.js guide's push-only service
worker — which contains no caching whatsoever — covers everything we need. Adopt
`@serwist/next` at phase 6, with `defaultCache` overridden exactly as §3.1
sets out, and never from the quick start unmodified.

### Next.js 16's experimental `useOffline`

It is present in the version installed in this repo — `node_modules/next/offline.js`
re-exports it, and `experimental.useOffline` is in the config schema with a
default of `false`. Docs:
<https://nextjs.org/docs/app/api-reference/functions/use-offline> (2026-07-28).

**What it does**, verbatim from those docs, when the flag is enabled:

> - "Listen for the browser's `offline` and `online` events to track connectivity.
> - Detect network failures on navigation, prefetch, and Server Action requests.
> - Poll for connectivity using `HEAD` requests with backoff while offline.
> - Automatically retry blocked requests once connectivity is restored.
> - Make the `useOffline` hook available from `next/offline`."

The connectivity heuristic is the clever part and is worth understanding whether
or not we adopt the hook:

> "Each check issues a single `HEAD` request to the current page's URL with the
> RSC header set… The request is aborted after 200 ms. Two outcomes count as
> 'online': 1. The fetch resolves normally. 2. The 200 ms timeout aborts the
> request. A truly offline request fails almost instantly (DNS or TCP error), so
> if it's still pending at 200 ms the TCP handshake succeeded and the server is
> reachable."

Backoff is 500 ms → 1 s → 2 s → 3 s and then holds at 3 s: _"The polling loop
never gives up on its own."_

**What it is not:** not a service worker, no caching, and it makes nothing
available offline. Without the flag the hook always returns `false`, and it
returns `false` during SSR and before hydration.

**Is it worth using?** Not yet in production, but its _model_ is exactly right
for us — and that is the more important signal. Vercel's own answer for a
server-rendered app is connectivity awareness plus automatic retry, explicitly
not offline caching. For a CMS admin whose real failure is "I lost my save in a
lift", that is the correct shape, and it is a much smaller surface than a
caching service worker.

Against adopting it now: both doc pages carry _"This feature is currently
experimental and subject to change, it's not recommended for production."_ It
changes global navigation and Server Action behaviour behind an experimental
flag, and we ship to self-hosters who cannot easily roll a bad release back.

**Decision: build the same behaviour ourselves in phase 4** — roughly forty
lines, portable, unflagged and testable — **and copy the 200 ms `HEAD` heuristic
rather than trusting `navigator.onLine` alone.** Watch `useOffline`; when it
leaves experimental, delete ours and switch. Track it as a one-line entry in
`docs/UPDATING.md`.

---

## 7. Accessibility fixes

All normative text is quoted from W3C's _Understanding WCAG 2.2_ documents at
<https://www.w3.org/WAI/WCAG22/Understanding/>. Note that there is no separate
mobile standard: _Guidance on Applying WCAG 2.2 to Mobile Applications_ is a
**W3C Group Draft Note (06 May 2025)**, informative only, and 2.5.1, 2.5.4,
2.5.7 and 2.5.8 are **not yet included** in it — guidance for them _"will be
added at a later stage"_ (<https://www.w3.org/TR/wcag2mobile-22/>). WCAG 2.2
itself is the authority.

### What we measured, and what it fails

| #   | Finding                                            | Criterion                                  | Level  | Threshold          | Fix                                                                                  |
| --- | -------------------------------------------------- | ------------------------------------------ | ------ | ------------------ | ------------------------------------------------------------------------------------ |
| 1   | **6 interactive elements below 24 px**             | **SC 2.5.8 Target Size (Minimum)**         | **AA** | **24 × 24 CSS px** | Resize to ≥24×24, or satisfy the spacing exception below. This is a live AA failure. |
| 2   | **17 interactive elements below 44 px**            | SC 2.5.5 Target Size (Enhanced)            | AAA    | 44 × 44 CSS px     | Not required for AA conformance — but see the platform guidance below.               |
| 3   | **`h1` overflows its own box to 406 px at 375 px** | **SC 1.4.10 Reflow**                       | **AA** | **320 CSS px**     | Remove `whitespace-nowrap`, or make the element non-content.                         |
| 4   | Same element, clipped by `overflow-hidden`         | **SC 1.4.4 Resize Text** (failure **F69**) | **AA** | 200% without loss  | Clipping/truncating text on resize is a documented failure technique.                |

**On finding 1 — the exception people get wrong.** SC 2.5.8 has five exceptions:
Spacing, Equivalent, Inline, User Agent Control, Essential. The spacing one is
not "leave a gap": it is that _"a 24 CSS pixel diameter circle"_ centred on each
undersized target must not intersect another target, or the circle of another
undersized target. Measure the circles, not the gaps.
<https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>

**On finding 2 — AAA is not a requirement, but do it in the admin anyway.**
Android's guidance is 48 × 48 dp separated by ≥8 dp: _"A touch target of 48x48dp
results in a physical size of about 9mm, regardless of screen size"_
(<https://support.google.com/accessibility/android/answer/7101858>). Apple's
44 × 44 pt is universally cited but **UNVERIFIED here** — Apple's HIG pages
render client-side and could not be fetched. Working rule: **24 px is the hard
floor everywhere; 44 px is the target for anything a thumb uses one-handed in
the admin.**

**On findings 3 and 4 — the culprit is identified.** `src/components/Footer.tsx:256`:

```
text-[clamp(56px,20vw,360px)] … whitespace-nowrap … max-w-full overflow-hidden
```

At 375 px, `20vw` resolves to 75 px and `whitespace-nowrap` forbids wrapping, so
the box is as wide as the word; `overflow-hidden` hides the consequence rather
than fixing it, which is why the page shows no horizontal overflow while the
element itself measures 406 px.

**A further finding, derived from reading that file rather than measured:** the
element is an `<h1>` used as a decorative watermark at 10% opacity
(`text-text-primary/10`), and `src/components/HeroSection.tsx:60` also renders
an `<h1>`. Two `h1`s per page, one purely decorative, is a **SC 1.3.1 Info and
Relationships (Level A)** problem — the heading structure conveys something
untrue to a screen-reader user. Making the footer wordmark a `<div>` or `<span>`
with `aria-hidden="true"` fixes 1.3.1 and removes findings 3 and 4 at the same
time, because decorative clipped text is then not content.

### Criteria to build the mobile admin against

| Criterion                        | Level | Threshold / requirement                                                                                                                                                 | Where it bites us                                                                                                      |
| -------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **1.4.10 Reflow**                | AA    | No two-dimensional scrolling at **320 CSS px** wide (or 256 px high). "320 CSS pixels is equivalent to a starting viewport width of 1280 CSS pixels wide at 400% zoom." | Every admin table, sheet and panel                                                                                     |
| **1.4.4 Resize Text**            | AA    | **200%** without loss of content or functionality. Failures **F69** (clipping), **F80** (form controls don't resize), **F94** (viewport units to size text)             | The footer h1; any `vw`-sized text                                                                                     |
| **2.5.8 Target Size (Minimum)**  | AA    | **24 × 24 CSS px**, or the 24 px-circle spacing exception                                                                                                               | 6 controls today                                                                                                       |
| **2.5.5 Target Size (Enhanced)** | AAA   | 44 × 44 CSS px                                                                                                                                                          | 17 controls today; adopt as an internal target                                                                         |
| **1.3.4 Orientation**            | AA    | _"Content does not restrict its view and operation to a single display orientation… unless… essential"_                                                                 | **Do not set `orientation` in the manifest.** Setting it engages this.                                                 |
| **2.5.7 Dragging Movements**     | AA    | _"All functionality that uses a dragging movement… can be achieved by a single pointer without dragging"_                                                               | Any drag-to-reorder needs move-up/move-down buttons                                                                    |
| **2.5.1 Pointer Gestures**       | **A** | No path-based or multipoint gesture without a single-pointer equivalent                                                                                                 | Swipe-to-delete rows; pinch-to-zoom previews                                                                           |
| **1.4.12 Text Spacing**          | AA    | Must survive **user-applied** overrides: line height ≥ **1.5×**, paragraph spacing ≥ **2×**, letter spacing ≥ **0.12×**, word spacing ≥ **0.16×** font size             | Tight `leading-[0.8]` / `leading-[1.18]` blocks — note this is about surviving _their_ overrides, not about our values |
| 2.5.4 Motion Actuation           | A     | **Normative text UNVERIFIED — not fetched.** Only relevant if shake/tilt is ever added                                                                                  | —                                                                                                                      |

### Two mechanical rules with no criterion number

- **Inputs at ≥16 px** to stop Safari zooming on focus. A behaviour, not a
  criterion — but the wrong fix breaks a real one.
- **Never `user-scalable=no`, `maximum-scale` or `minimum-scale`.** MDN:
  _"Disabling zooming capabilities by setting `user-scalable` to a value of `no`
  prevents people experiencing low vision conditions from being able to read and
  understand page content. Additionally, WCAG requires a minimum of 2× scaling;
  however, the best practice is to enable a 5× zoom."_ And it does not even work
  — **iOS 10+ ignores `user-scalable`, `maximum-scale` and `minimum-scale` by
  default.** <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport>

### Suggested order

1. The footer `h1` — fixes findings 3, 4 and a 1.3.1 problem in one edit.
2. The 6 sub-24 px controls — the only live AA failure of the four.
3. The remaining 11 below 44 px, as part of phase 2 rather than before it.
4. Add the criteria table above to the admin's component review checklist so
   phase 2 does not create a new backlog while fixing this one.

---

## Open questions to close before shipping

Carried from the dossier, filtered to the ones that actually block a decision
here. Everything below is **UNVERIFIED** and must not be stated as fact.

| #   | Question                                                                                                                            | Blocks                         | How to close it                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------- |
| 1   | Does iOS 26+ still require a `display: standalone\|fullscreen` manifest for Web Push, given "zero requirements for installability"? | Phase 5 design                 | Device test. Shipping `standalone` is safe meanwhile. |
| 2   | Is `share_target` offered to installed web apps in the iOS share sheet? No caniuse entry exists.                                    | A future high-value feature    | Device test                                           |
| 3   | Does Serwist match runtime-caching routes first-match-wins, and is the matcher callback property `sameOrigin`?                      | §3.1 layer 1 correctness       | Serwist docs + a production build with DevTools       |
| 4   | How do `deploymentId` / `experimental.useSkewCookie` interact with a CacheFirst `/_next/static` rule?                               | Phase 6 only                   | Read Next docs before caching build output            |
| 5   | Netlify's (and Render's, Fly's, Railway's) 2026 commercial-use terms                                                                | **§5 option C**                | Read their terms                                      |
| 6   | Maintenance status and current versions of PushForge and `@mmmike/web-push`                                                         | Only if we ever need Edge push | npm                                                   |
| 7   | Does iOS 26 generate splash screens from the manifest, or is `apple-touch-startup-image` still required?                            | A v2 polish item               | Device test                                           |
