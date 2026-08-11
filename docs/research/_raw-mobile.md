# Raw research: mobile & PWA capability for a self-hosted portfolio builder

**Compiled:** 2026-08-12
**Target stack:** Next.js 16.3.0 / React 19.2 (versions confirmed from this repo's `package.json` and `node_modules/next/package.json`)
**Scope:** owner-facing mobile admin — edit the site, read analytics, reply to contact messages from a phone; install to home screen; receive notifications.

**Status of this document:** evidence dossier. Facts, versions, thresholds and quotes only. No recommendations.

**Browser baseline used throughout** (current stable at time of writing, per caniuse `features-json` data pulled 2026-08-12 from <https://github.com/Fyrd/caniuse>):
Chrome 154 · Chrome Android 151 · Safari 26.5 · iOS Safari 26.5 · Firefox 156 · Edge 151 · Samsung Internet 30.

**Verification key**

- **VERIFIED** — quoted from primary source (spec, vendor docs, vendor blog, package metadata, or source code) fetched during this research.
- **UNVERIFIED** — plausible/widely-repeated but not confirmed against a primary source in this pass. Flagged inline.

---

## 1. PWA state of play now

### 1.1 Baseline support numbers

Pulled from caniuse feature JSON on 2026-08-12. `usage_y` = global % with full support; `usage_a` = % with partial support.

| Feature                               | caniuse id         | usage_y | usage_a | Safari 26.5     | iOS Safari 26.5 | Chrome 154            | Firefox 156 | Samsung 30 |
| ------------------------------------- | ------------------ | ------- | ------- | --------------- | --------------- | --------------------- | ----------- | ---------- |
| Service Workers                       | `serviceworkers`   | 96.07%  | 0.15%   | y               | y               | y                     | y           | y          |
| IndexedDB                             | `indexeddb`        | 96.38%  | 0.30%   | y               | y               | y                     | y           | y          |
| Add to Home Screen / Web App Manifest | `web-app-manifest` | 77.08%  | 15.79%  | **a** (partial) | **a** (partial) | y                     | **n**       | y          |
| Push API                              | `push-api`         | 81.85%  | 13.71%  | y (note 6)      | **a** (note 7)  | y (note 2)            | y (note 2)  | y          |
| Web Notifications                     | `notifications`    | 80.23%  | 14.13%  | y               | a (note 3)      | y                     | y           | y          |
| Background Sync API                   | `background-sync`  | 76.73%  | 0%      | **n**           | **n**           | y                     | u           | y          |
| Pointer Events                        | `pointer`          | 96.08%  | 0%      | y               | y               | y                     | y           | y          |
| HTML5 Drag and Drop                   | `dragndrop`        | 94.48%  | 0.27%   | y               | y               | y (note 4 on Android) | y           | **n**      |

caniuse notes verbatim:

- `push-api` **note 7** (applies to iOS Safari): _"Requires website to first be added to the Home Screen."_
- `push-api` **note 6** (applies to macOS Safari): _"Supported in Safari, not WKWebView nor SFSafariViewController"_
- `push-api` note 2 (Chrome/Firefox/Edge): _"Requires full browser to be running to receive messages"_
- `notifications` **note 3**: _"Requires website to first be added to the Home Screen"_
- `web-app-manifest` **note 2**: _"Safari on iOS does not support A2HS in WebViews like Chrome and Firefox."_
- `web-app-manifest` note 3: _"Firefox is experimenting with desktop support behind the `browser.ssb.enabled` flag."_
- `dragndrop` note 4: _"Not supported in Chromium browsers on Android 6 or older."_ Firefox Android (`and_ff` 153) = **n**, Samsung Internet 30 = **n**.

Source: <https://github.com/Fyrd/caniuse> (`features-json/{serviceworkers,indexeddb,web-app-manifest,push-api,notifications,background-sync,pointer,dragndrop}.json`)

### 1.2 Install criteria — Chromium (Chrome, Edge, Opera, Samsung Internet)

MDN, _Making PWAs installable_ — <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable>

Required manifest members for Chromium install:

- `name` **or** `short_name`
- `icons` — **"must contain a 192px and a 512px icon"**
- `start_url`
- `display` and/or `display_override`
- `prefer_related_applications` — **"must be `false` or not present"**

Transport requirement, verbatim:

> "For a PWA to be installable it must be served using the `https` protocol, or from a local development environment using `localhost` or `127.0.0.1` — with or without a port number."

Service worker requirement, verbatim from MDN:

> "While not a requirement for a PWA to be installable, many PWAs use service workers to provide an offline experience."

**A service worker with a `fetch` handler is no longer required to be installable.** Chrome for Developers, _Revisiting Chrome's installability criteria_, **2023-12-05** — <https://developer.chrome.com/blog/update-install-criteria>

> "As a first step we have removed the requirement to have a service worker that implements the `fetch()` method for installation from the menu."

Landed in **Chrome 108 on mobile and Chrome 112 on desktop**. The post also notes Chrome intends to experiment with relaxing manifest-field requirements further, and that the install _prompt_ algorithm (as opposed to menu install) may still weigh additional signals.

Minimal installable manifest per MDN:

```json
{
  "name": "My PWA",
  "icons": [{ "src": "icons/512.png", "type": "image/png", "sizes": "512x512" }]
}
```

### 1.3 `beforeinstallprompt`

MDN — <https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event>

> "**Limited availability** — This feature is not Baseline because it does not work in some of the most widely-used browsers."

Defined in the **"Manifest Incubations"** spec, i.e. not a W3C standard.

MDN browser-compat-data (`api/BeforeInstallPromptEvent.json`, main branch, fetched 2026-08-12):

|                            | Chrome | Chrome Android | Edge | Firefox   | Safari    | iOS Safari | Samsung |
| -------------------------- | ------ | -------------- | ---- | --------- | --------- | ---------- | ------- |
| `BeforeInstallPromptEvent` | 44     | yes            | yes  | **false** | **false** | **false**  | 5.0     |
| `.prompt()`                | **76** | yes            | yes  | false     | false     | false      | 5.0     |
| `.userChoice`              | 44     | yes            | yes  | false     | false     | false      | 5.0     |
| `.platforms`               | 44     | yes            | yes  | false     | false     | false      | 5.0     |

Canonical usage pattern (MDN):

```js
let installPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault(); // cancel the browser's default UI
  installPrompt = event; // stash the BeforeInstallPromptEvent
  installButton.removeAttribute('hidden');
});

installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  const result = await installPrompt.prompt();
  console.log(`Install prompt was: ${result.outcome}`);
  installPrompt = null;
  installButton.setAttribute('hidden', '');
});
```

**Next.js's official guide explicitly advises against relying on it** — <https://nextjs.org/docs/app/guides/progressive-web-apps> (docs version 16.3.0, lastUpdated 2026-07-30):

> "Modern browsers will automatically show an installation prompt to users when these criteria are met. You can provide a custom installation button with `beforeinstallprompt`, however, we do not recommend this as it is not cross browser and platform (does not work on Safari iOS)."

### 1.4 iOS — the big 2025 change (Safari 26.0 / iOS 26)

WebKit, _WebKit Features in Safari 26.0_, released **2025-09-15** — <https://webkit.org/blog/17333/webkit-features-in-safari-26-0/>

Verbatim:

> "By default, every website added to the Home Screen opens as a web app."

> "There are now zero requirements for 'installability' in Safari. Users can add any site to their Home Screen and open it as a web app on iOS 26 and iPadOS 26."

> "All of the same web technology is available to you as a developer, to build the experience you would like to build. Giving users a web app experience simply no longer requires a manifest file."

> "If the user prefers to add a bookmark for their browser, they can disable 'Open as Web App' when adding to Home Screen — even if the site is configured to be a web app."

This is a reversal of ~17 years of behaviour where a site needed `apple-mobile-web-app-capable` or a manifest with `display: standalone`/`fullscreen` to launch chromeless.

Corroborating coverage: iDownloadBlog, 2025-06-17 — <https://www.idownloadblog.com/2025/06/17/apple-ios-26-safari-web-apps-home-screen-bookmarks/>; WebKit WWDC25 post — <https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/>

**Implication to flag:** the manifest is now optional for _launching_ as a web app on iOS 26+, but it is still what supplies the app name, icon, `start_url` and `theme_color`, and it is still required on Chromium. Whether the old **"manifest with `display: standalone` or `fullscreen`"** precondition for **Web Push** still applies on iOS 26 is **UNVERIFIED** — the Safari 26.0 release notes contain no push/manifest statement, and the 2023 requirement (§2.2) has not been publicly restated. Needs device testing.

### 1.5 iOS — Add to Home Screen, other limits

- **iOS/iPadOS 16.4+**: third-party browsers can add to Home Screen. WebKit, 2023-02-16 — <https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/>
  > "Starting with 16.4, third-party browsers can now offer their users the ability to add websites and web apps to the Home Screen from the Share menu."
- MDN: _"iOS 16.3 and earlier: PWAs can only be installed with Safari. iOS 16.4 and later: PWAs can be installed from the Share menu in Safari, Chrome, Edge, Firefox, and Orion."_
- **No `beforeinstallprompt`** on any iOS browser → you must render manual "tap Share → Add to Home Screen" instructions. Next.js's official guide ships exactly this pattern (`InstallPrompt` component, §3.3).
- web.dev, _Installation_ (last updated **2024-09-20**) — <https://web.dev/learn/pwa/installation>
  > "On Apple devices, you can install the same PWA multiple times; each installation will have its own isolated storage."
  > "Only the standalone display mode is supported" (iOS/iPadOS)
  > Safari for macOS "does not support installability" — **superseded**: MDN records Safari macOS "Add to Dock" from **macOS Sonoma / Safari 17**. web.dev page pre-dates iOS 26 and should be treated as partly stale.
- web.dev on desktop: _"Only standalone and minimal-ui display modes are supported on desktop."_

### 1.6 EU / Digital Markets Act — the PWA removal was reversed

Apple announced in Feb 2024 it would remove Home Screen web apps in the EU in iOS 17.4, then **reversed** in March 2024.

- 9to5Mac, 2024-03-01, _"iOS 17.4 won't remove Home Screen web apps in the EU after all"_ — <https://9to5mac.com/2024/03/01/apple-home-screen-web-apps-ios-17-eu/>
- Apple Developer, _Update on apps distributed in the European Union_ — <https://developer.apple.com/support/dma-and-apps-in-the-eu/>
  > "Home Screen web apps continue to be built directly on WebKit and its security architecture, and align with the security and privacy model for native apps on iOS and iPadOS."
- Notificare, 2024-03-08 — <https://notificare.com/blog/2024/03/08/apple-reverse-decision-to-remove-pwa/>

⚠️ **Several 2026-dated third-party blog posts still assert that EU PWAs open in Safari tabs with no push.** That claim is **wrong / outdated**. E.g. <https://www.mobiloud.com/blog/progressive-web-apps-ios> and <https://webscraft.org/blog/pwa-pushspovischennya-na-ios-u-2026-scho-realno-pratsyuye?lang=en>. Do not cite them.

### 1.7 Display modes

MDN, `display` — <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display>

| Value        | Behaviour                                                   |
| ------------ | ----------------------------------------------------------- |
| `fullscreen` | All browser UI hidden, uses entire display                  |
| `standalone` | Separate window, no URL bar; platform status bar may remain |
| `minimal-ui` | Standalone plus minimal navigation controls                 |
| `browser`    | Conventional tab/window. **Default if unspecified.**        |

Fallback chain: `fullscreen → standalone → minimal-ui → browser`.

Detection in CSS:

```css
@media (display-mode: standalone) {
  /* ... */
}
```

Detection in JS (used by the official Next.js guide): `window.matchMedia('(display-mode: standalone)').matches`.

Legacy iOS-only alternative: `navigator.standalone` (**UNVERIFIED** in this pass; not fetched).

### 1.8 Icons, maskable icons, splash screens

**Sizes.** Chromium requires 192×192 and 512×512 (MDN, §1.2). MDN `icons` reference — <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons>:

- `src` required; `sizes`, `type`, `purpose` optional
- `purpose` values: `any` (default), `maskable`, `monochrome`
- Multiple space-separated purposes are allowed; if _only_ unrecognised purposes are given, the icon is ignored
- Specify `type` to avoid MIME sniffing overhead
- SVG with `sizes: "any"` works for high-DPI

**Maskable safe zone.** web.dev, _Adaptive icon support in PWAs with maskable icons_ — <https://web.dev/articles/maskable-icon>

> the safe zone is "a circular area in the center of the icon with a radius equal to 40% of the icon width"

For a 512×512 icon: radius = 204.8 px → **safe-zone diameter ≈ 409.6 px**. Anything outside can be cropped away by Android's mask (circle / squircle / rounded square / teardrop).

web.dev on combining purposes, verbatim:

> "We don't recommend using multiple purposes for maskable icons. Using `maskable` icons as `any` icons adds unnecessary padding, making the core icon content smaller."

→ ship **two files**: one `purpose: "any"`, one `purpose: "maskable"`.

Tooling named by web.dev: <https://maskable.app/> and <https://maskable.app/editor>; Chrome DevTools → Application → Manifest shows the safe-zone overlay.

**Splash screens.**

- **Android**: generated automatically by the browser from `name`, `background_color` and a manifest icon (typically the 512×512).
- **iOS/iPadOS**: **not** generated from the manifest. Requires per-device `<link rel="apple-touch-startup-image" media="...">` entries with device-dimension media queries — one image per device size class. Generators exist (`pwa-asset-generator` <https://github.com/SeWiLio/pwa-asset-generator>, Progressier's generator <https://progressier.com/pwa-icons-and-ios-splash-screen-generator>).
- The claim that "iOS PWAs get no support for icons, minimal-ui, fullscreen, theme-color and orientation from the manifest" circulates widely (e.g. <https://itnext.io/pwa-splash-screen-and-icon-generator-a74ebb8a130>) but is **partly outdated and UNVERIFIED** post-iOS 26. `apple-touch-icon` is still the reliable iOS icon path.

### 1.9 iOS storage eviction — the 7-day rule and the installed-app exemption

WebKit, John Wilander, _Full Third-Party Cookie Blocking and More_ (ships in **iOS/iPadOS 13.4 and Safari 13.1**, March 2020) — <https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/>

Section: **"7-Day Cap on All Script-Writeable Storage."** Storage types affected, verbatim:

> "Indexed DB, LocalStorage, Media keys, SessionStorage, Service Worker registrations and cache"

All of it is deleted after **seven days of Safari use without user interaction with the site**.

The exemption, verbatim:

> "Web applications added to the home screen are not part of Safari and thus have their own counter of days of use."

→ **An installed (home-screen) web app maintains its own days-of-use counter, so its data survives as long as the user keeps opening it.** A site used only in a Safari tab loses IndexedDB / localStorage / SW registration after 7 days of non-interaction.

Secondary write-ups: <https://support.didomi.io/apple-adds-a-7-day-cap-on-all-script-writable-storage>, <https://mjtsai.com/blog/2020/03/26/safari-13-1-third-party-cookie-blocking-and-7-day-script-writeable-storage/>, <https://www.itnews.com.au/news/apple-cops-flak-for-deleting-local-browser-storage-after-7-days-539833>

**Persistent storage API** (`navigator.storage.persist()`), MDN BCD `api/StorageManager.json`:

|                               | Chrome | Firefox | Safari    | iOS Safari |
| ----------------------------- | ------ | ------- | --------- | ---------- |
| `StorageManager`              | 55     | 57      | **15.2**  | 15.2       |
| `.persist()` / `.persisted()` | 55     | 57      | 15.2      | 15.2       |
| `.estimate()`                 | 61     | 57      | **17**    | 17         |
| `.estimate().usageDetails`    | 61     | false   | **false** | false      |

Note: each separate iOS installation of the same PWA gets **isolated storage** (web.dev, §1.5). Two home-screen copies do not share a session.

---

## 2. Web push notifications

### 2.1 API support matrix (MDN browser-compat-data, main branch, 2026-08-12)

| API                                          | Chrome  | Chrome Android | Edge | Firefox   | Safari    | **iOS Safari** | Samsung |
| -------------------------------------------- | ------- | -------------- | ---- | --------- | --------- | -------------- | ------- |
| `PushManager`                                | 42      | yes            | 17   | 44        | 16        | **16.4**       | yes     |
| `PushManager.subscribe`                      | 42      | yes            | 17   | 44        | 16        | 16.4           | yes     |
| `PushManager.getSubscription`                | 42      | yes            | 17   | 44        | 16        | 16.4           | yes     |
| `PushSubscription.expirationTime`            | 60      | yes            | 17   | 96        | 16        | 16.4           | yes     |
| `Notification`                               | 20      | 42             | 14   | 22        | 7         | **16.4**       | 4.0     |
| `ServiceWorkerRegistration.showNotification` | 42      | yes            | 17   | 44        | 16        | 16.4           | yes     |
| `Navigator.setAppBadge`                      | 81      | **false**      | yes  | false     | 17        | **16.4**       | yes     |
| `pushsubscriptionchange` event               | **138** | yes            | 17   | 44        | 16        | **false**      | yes     |
| `SyncManager` (Background Sync)              | 49      | yes            | yes  | **false** | **false** | **false**      | yes     |
| `PeriodicSyncManager`                        | 80      | yes            | yes  | false     | false     | false          | yes     |

**Notification option support — the gotcha table** (`api/ServiceWorkerRegistration.json` → `showNotification.options_*`, and `api/Notification.json`):

| Option               | Chrome | Chrome Android | Firefox   | Safari / iOS |
| -------------------- | ------ | -------------- | --------- | ------------ |
| `body`               | 33     | 42             | 26        | 11 / 16.4    |
| `data`               | 44     | yes            | 34        | 16 / 16.4    |
| `actions` (buttons)  | 48     | yes            | 152       | **false**    |
| `badge`              | 53     | yes            | **false** | **false**    |
| `image`              | 56     | yes            | false     | **false**    |
| `renotify`           | 50     | yes            | false     | false        |
| `requireInteraction` | 47     | yes            | false     | false        |
| `vibrate`            | 45     | **false**      | false     | **false**    |

**Direct consequence:** the service-worker snippet in Next.js's own PWA guide uses `badge: '/badge.png'` and `vibrate: [100, 50, 100]`. Both are **no-ops on iOS**, and `vibrate` is a no-op on Chrome Android too. Action buttons do not exist on iOS at all.

### 2.2 iOS requirements — primary source

WebKit, Brady Eidson & Jen Simmons, _Web Push for Web Apps on iOS and iPadOS_, **2023-02-16** — <https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/>

Verified requirements as stated in 2023 for **iOS/iPadOS 16.4**:

1. The web app must be **added to the Home Screen**, with a manifest whose `display` member is `standalone` or `fullscreen`.
2. Permission must be requested **"in response to direct user interaction — such as tapping on a 'subscribe' button provided by the web app."**
3. Standards used: **Push API, Notifications API and Service Workers**, delivered over **the same Apple Push Notification service that powers native push on all Apple devices**.
4. Portability, verbatim:
   > "This is the same W3C standards-based Web Push that was added in Safari 16.1 for macOS Ventura last fall. If you've implemented standards-based Web Push for your web app with industry best practices — such as using feature detection instead of browser detection — it will automatically work on iPhone and iPad."
5. **Badging API** supported (`setAppBadge` / `clearAppBadge`), badge shows on the Home Screen icon.
6. Notifications **integrate with Focus**; users configure them in Notification Settings "just like any other app."
7. Third-party browsers can add to Home Screen from the Share menu starting 16.4.

⚠️ **Open question (UNVERIFIED):** requirement (1) predates iOS 26's removal of installability requirements (§1.4). Whether a `display: standalone` manifest is still needed for push on iOS 26+, or whether any home-screen web app now qualifies, has not been publicly restated by Apple. **Test on device before designing around it.**

Also note caniuse `push-api` note 6 for macOS Safari: push is _"Supported in Safari, not WKWebView nor SFSafariViewController"_ — i.e. an in-app browser cannot subscribe.

### 2.3 Declarative Web Push (Safari 18.4+, March 2025)

WebKit, _Meet Declarative Web Push_ — <https://webkit.org/blog/16535/meet-declarative-web-push/>; shipped in **Safari 18.4** (<https://webkit.org/blog/16574/webkit-features-in-safari-18-4/>).

Payload format:

```json
{
  "web_push": 8030,
  "notification": {
    "title": "...",
    "lang": "en-US",
    "dir": "ltr",
    "body": "...",
    "navigate": "https://...",
    "silent": false,
    "app_badge": "1"
  }
}
```

- `"web_push": 8030` is the opt-in marker — _"an homage to RFC 8030 – Generic Event Delivery Using HTTP Push."_
- **Required:** non-empty `title` and a `navigate` URL. `navigate` is _"a URL that will be navigated to by the browser upon activation."_
- Optional: most of `NotificationOptions` — `lang`, `dir`, `body`, `silent`, `app_badge`.
- **No service worker required:** _"Declarative Web Push allows web developers to request a Web Push subscription and display user visible notifications without requiring an installed service worker."_ A service worker may still optionally intercept and modify.
- Exposes `window.pushManager`:
  ```js
  const subscription = await window.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: arrayForPublicKey,
  });
  ```
- Backwards-compatible, verbatim:
  > "If your push message arrives to a newer browser, it's handled declaratively by the browser. If it arrives to an older browser, it's handled imperatively by JavaScript as it always had been."
- Still scoped to _"web apps saved to the Home Screen"_ on iOS/iPadOS, and web apps on Mac.
- WWDC25 session: <https://developer.apple.com/videos/play/wwdc2025/235/>

Third-party claim that it has _"matured into a W3C Working Draft, gained multi-vendor editorship, and quietly become the preferred format"_ — <https://aimtell.com/blog/state-of-declarative-web-push-2026> — **UNVERIFIED**, not confirmed against W3C.

### 2.4 VAPID and the `web-push` Node library

npm registry metadata pulled 2026-08-12:

| Package    | Latest    | Published      | Notes                                          |
| ---------- | --------- | -------------- | ---------------------------------------------- |
| `web-push` | **3.6.7** | **2024-01-16** | ~2 yr 7 mo since last release. Not deprecated. |

Repo: <https://github.com/web-push-libs/web-push>

Key generation — CLI (what the Next.js guide tells you to run):

```bash
npm install -g web-push
web-push generate-vapid-keys
# or: web-push generate-vapid-keys --json
```

Programmatic:

```js
const vapidKeys = webpush.generateVAPIDKeys();
// { publicKey, privateKey }
```

`setVapidDetails(subject, publicKey, privateKey)` — README, verbatim:

> "_subject_: the VAPID server contact information, as either an `https:` or `mailto:` URI ([as per the VAPID spec](https://datatracker.ietf.org/doc/html/draft-thomson-webpush-vapid#section-2.1))."

**The localhost trap — README, verbatim:**

> "As of this writing, if a push notification request contains a VAPID `subject` referencing an `https://localhost` URI (set either using the `options` argument or via the global `setVapidDetails()` method), Safari's push notification endpoint rejects the request with a `BadJwtToken` error."

Corroborating reports: <https://github.com/web-push-libs/web-push-php/issues/406>, <https://github.com/openclaw/openclaw/issues/83134> (_"Auto-generated VAPID keys use @localhost subject, breaking Apple Web Push (iOS PWA)"_).

`sendNotification(pushSubscription, payload, options)` options, from the README:

- `vapidDetails: { subject, publicKey, privateKey }`
- `TTL` — seconds the push service should retain an undelivered message
- `contentEncoding` — `'aes128gcm'` (**default**) or `'aesgcm'`
- `urgency` — `very-low` | `low` | `normal` (default) | `high`
- `proxy`, `agent`

Returns/rejects with an object exposing:

> "- _statusCode_, the status code of the response from the push service;
>
> - _headers_, the headers of the response from the push service;
> - _body_, the body of the response from the push service."

→ **404 / 410 Gone means the subscription is dead and must be deleted from your DB.** (Standard Web Push Protocol behaviour; the library surfaces `statusCode` for you to branch on.)

**Payload size:** Web Push limits payload to between 2 and **4096 octets**; APNs max payload is **4096 bytes**. Sources: <https://autopush.readthedocs.io/en/latest/http.html>, and Apple's APNs limits (**partially UNVERIFIED** — the 4096 figure is consistent across sources but Apple's own doc was not fetched).

**Encryption specs:** Web Push Protocol <https://tools.ietf.org/html/draft-ietf-webpush-protocol>, Message Encryption for Web Push <https://tools.ietf.org/html/draft-ietf-webpush-encryption>, VAPID <https://datatracker.ietf.org/doc/html/draft-thomson-webpush-vapid>.

### 2.5 Self-hosted sending — no third-party service required

Everything needed is in-process:

1. Generate one VAPID keypair, once, ever. Store `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (client) and `VAPID_PRIVATE_KEY` (server-only).
2. Client subscribes via `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`.
3. POST the serialised `PushSubscription` (`endpoint`, `keys.p256dh`, `keys.auth`) to your own server; store one row per device.
4. Server calls `webpush.sendNotification(sub, JSON.stringify(payload))`. The library talks directly to whatever push service the `endpoint` names — FCM (`fcm.googleapis.com`) for Chrome, Mozilla autopush for Firefox, `web.push.apple.com` for Safari/iOS. **You never sign up for anything.**

**Next.js's official guide is explicit that its in-memory store is a demo, not production** — <https://nextjs.org/docs/app/guides/progressive-web-apps>:

```ts
let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub;
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}
```

> "In a production environment, you would want to store the subscription in a database for persistence across server restarts and to manage multiple users' subscriptions."

### 2.6 Does this work on serverless hosts (Vercel)?

- `web-push@3.6.7` is a **Node.js library** — it uses Node's `crypto` and `https` modules. It therefore runs in a **Node.js serverless function / Server Action**, which is the default runtime for Next.js route handlers and Server Actions on Vercel. **VERIFIED** by inspection of the README's API (`https.request`, `HttpsProxyAgent`, node `Buffer` payloads).
- It will **not** run in the **Edge runtime** (no Node `crypto`). Web-Crypto-based alternatives exist:
  - **PushForge** — <https://github.com/draphy/pushforge> — _"A modern, cross-platform Web Push Notification library with full VAPID support. Handles payload encryption, authentication, and delivery across Node.js, Browsers, Deno, Bun, and Cloudflare Workers. Zero dependencies, TypeScript-first."_
  - **`@mmmike/web-push`** — <https://www.npmjs.com/package/@mmmike/web-push> — zero-dependency RFC 8291 implementation for Node, Edge runtimes and browsers.
  - Neither was version-checked in this pass → **UNVERIFIED** for maintenance status/current version.
- **Real constraint on serverless:** sending push is an _outbound_ HTTP call per subscription, so a fan-out to many devices costs function execution time. For a single-owner portfolio admin (1–3 devices) this is trivial. Long-running fan-out or scheduled digests would need a Cron Job or queue.
- **Not verified in this pass:** whether Vercel's platform imposes any limit on outbound requests to push endpoints. No evidence of one found.

### 2.7 Permission-prompt best practice, and Chrome's 2025 auto-revocation

**Hard requirement:** the permission request must come from a user gesture. WebKit (§2.2) requires _"direct user interaction."_ Reports indicate iOS Safari _"strictly requires `Notification.requestPermission()` to be called directly from a click handler, otherwise the request will be silently ignored or blocked"_ — <https://documentation.pushly.com/integration/web-browser-push/safari/safari-on-mobile-ios-ipados> (**vendor doc, partly UNVERIFIED**).

**Two-step / pre-prompt pattern.** Vendor guidance (OneSignal, AWeber, PushPushGo) converges on: show your own soft pre-prompt explaining the benefit, and only call the native API if the user says yes — because a native "Block" is effectively permanent and unrecoverable.

- <https://onesignal.com/blog/web-push-permission-prompting-changes/>
- <https://docs.aweber.com/web-push-notifications/web-push-notifications/what-is-the-quiet-permission-ui-on-chrome-and-fire>
- <https://pushpushgo.com/en/blog/google-chromes-new-notification-policy>
- Chrome permissions request chip: <https://developer.chrome.com/blog/permissions-chip>

**Chrome quiet UI:** triggered for users who habitually block, and for sites with very low opt-in rates. Auto-prompting on page load is a fast route into it.

**Chrome auto-revocation — Chromium blog, 2025-10-10** — <https://blog.google/chromium/automatic-notification-permission/> (formerly blog.chromium.org):

> Chrome will "automatically remove notification permission for sites you haven't interacted with recently."

- Trigger: _"when there is very low user engagement and a high volume of notifications being sent."_
- Data cited: _"less than 1% of all notifications receive any interaction from users."_
- _"The feature will be launched in Chrome on Android and desktop."_
- _"Chrome will inform you when notification permissions are removed."_ Users can re-grant via Safety Check or by revisiting.
- **Critical carve-out, verbatim:** _"does not revoke notifications for any installed web apps."_

→ **Installing the PWA is what protects the notification permission from Chrome's auto-revocation.** That is a concrete, citable reason to push the install, not just a nicety.

### 2.8 Subscription lifecycle traps

- **`pushsubscriptionchange` does not fire on iOS Safari** (BCD: `safari_ios = false`), and only landed in **Chrome 138**. Any design that relies on the SW being told its subscription rotated is unreliable. Fallback: on every app open, call `registration.pushManager.getSubscription()`, compare the endpoint to what the server has, and re-register if it differs.
- `PushSubscription.expirationTime` is supported everywhere (Chrome 60, Firefox 96, Safari 16, iOS 16.4) but is usually `null` in practice (**UNVERIFIED**).
- Deleting the home-screen icon on iOS destroys that installation's storage and subscription (implied by the isolated-storage behaviour in §1.5, **UNVERIFIED** as an explicit Apple statement).
- Prune on `410 Gone` / `404` from `sendNotification` (§2.4).

---

## 3. Next.js PWA in 2026

### 3.1 The official guide

**<https://nextjs.org/docs/app/guides/progressive-web-apps>** — front-matter reports `version: 16.3.0`, `lastUpdated: 2026-07-30`. It is current and it is the canonical answer.

Structure: (1) manifest → (2) push notification client component → (3) Server Actions → (4) VAPID keys → (5) service worker → (6) Add to Home Screen → (7) local testing → (8) security headers.

Notable framing, verbatim:

> "Web Push Notifications are supported with all modern browsers, including:
>
> - iOS 16.4+ for applications installed to the home screen
> - Safari 16 for macOS 13 or later
> - Chromium based browsers
> - Firefox"

> "Notably, you can trigger install prompts without needing offline support."

**The official guide contains no caching at all.** Its service worker handles `push` and `notificationclick` only. Offline caching is deferred to Serwist (§3.5).

### 3.2 `app/manifest.ts`

Next.js auto-detects `app/manifest.ts|js|json|webmanifest` in the **root of `app/`** and links it in `<head>`.

From the API reference (<https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest>, `lastUpdated: 2026-03-03`):

> "Good to know: `manifest.js` is a special Route Handler that is cached by default unless it uses a [Request-time API] or dynamic config option."

The guide's example:

```ts
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Next.js PWA',
    short_name: 'NextPWA',
    description: 'A Progressive Web App built with Next.js',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

**Full `MetadataRoute.Manifest` type — read directly from this repo's installed `next@16.3.0`** (`node_modules/next/dist/lib/metadata/types/manifest-types.d.ts`). All fields optional:

`background_color`, `categories`, `description`, `dir` (`ltr|rtl|auto`), `display` (`fullscreen|standalone|minimal-ui|browser`), `display_override` (array incl. `window-controls-overlay`), `file_handlers`, `icons`, `id`, `lang`, `launch_handler` (`client_mode`: `auto|focus-existing|navigate-existing|navigate-new`), `name`, `orientation`, `prefer_related_applications`, `protocol_handlers`, `related_applications`, `scope`, `screenshots` (`form_factor: narrow|wide`, `platform`, `src`, `type`, `sizes`), **`share_target`**, `short_name`, `shortcuts`, `start_url`, `theme_color`.

```ts
type Icon = {
  src: string;
  type?: string | undefined;
  sizes?: string | undefined;
  purpose?: 'any' | 'maskable' | 'monochrome' | undefined;
};
```

⚠️ **Typing gap:** `purpose` is typed as a single literal union, so the combined `"any maskable"` string that the manifest spec permits is **not expressible** in the TS type without a cast. (This matches web.dev's advice not to combine them anyway — §1.8.)

⚠️ **`share_target` is in the type.** That is the manifest member that lets an installed PWA appear in the OS share sheet — e.g. share a photo from the iOS/Android photo app straight into the CMS as an upload. Chromium/Android supports it; **iOS support UNVERIFIED** (caniuse has no `web-share-target` feature entry).

`shortcuts` (long-press the app icon for "New post", "Inbox") is also in the type.

### 3.3 Service worker registration + install prompt (official guide, verbatim)

Registration — **note this is the current form; older tutorials register `/sw.js` from `public/`**:

```ts
async function registerServiceWorker() {
  const registration = await navigator.serviceWorker.register(
    new URL('../lib/service-worker.js', import.meta.url),
    {
      scope: '/',
      updateViaCache: 'none',
    }
  );
  const sub = await registration.pushManager.getSubscription();
  setSubscription(sub);
}
```

Subscribe:

```ts
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
  });
  setSubscription(sub);
  const serializedSub = JSON.parse(JSON.stringify(sub));
  await subscribeUser(serializedSub);
}
```

(`urlBase64ToUint8Array` helper is given in full in the guide — base64url → `Uint8Array`.)

Feature gate:

```ts
useEffect(() => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    setIsSupported(true);
    registerServiceWorker();
  }
}, []);
```

The iOS install-instructions component, verbatim from the guide:

```tsx
function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }
  // ... renders "tap the share button ⎋ and then Add to Home Screen ➕"
}
```

Service worker (push only):

```js
// lib/service-worker.js
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: { dateOfArrival: Date.now(), primaryKey: '2' },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.');
  event.notification.close();
  event.waitUntil(clients.openWindow('https://your-website.com'));
});
```

(See §2.1 — `badge` and `vibrate` are inert on iOS.)

### 3.4 Local testing and security headers (official guide)

Testing:

> "You are running locally with HTTPS — Use `next dev --experimental-https` for testing"

Security headers, verbatim from the guide's `next.config.js`:

```js
{
  source: '/sw.js',
  headers: [
    { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
    { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
    { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
  ],
}
```

Plus global `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

Rationale given: `Cache-Control: no-cache, no-store, must-revalidate` _"Prevents caching of the service worker, ensuring users always get the latest version."_

Static export caveat, verbatim:

> "you will need to move from Server Actions to calling an external API, as well as moving your defined headers to your proxy."

### 3.5 Is `next-pwa` still maintained? No.

npm registry + GitHub, checked 2026-08-12:

| Package                   | Latest     | Published      | Status                                                                                                                                                             |
| ------------------------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `next-pwa` (shadowwalker) | **5.6.0**  | **2022-08-23** | **Effectively abandoned — ~4 years, no release.** 4.1k ★, 123 open issues, 15 open PRs. Not formally deprecated on npm. <https://github.com/shadowwalker/next-pwa> |
| `@ducanh2912/next-pwa`    | **10.2.9** | **2024-09-18** | Maintenance mode; README redirects to Serwist. <https://github.com/DuCanhGH/next-pwa>                                                                              |
| `@serwist/next`           | **9.5.12** | **2026-07-22** | **Actively maintained.** <https://github.com/serwist/serwist>                                                                                                      |
| `serwist`                 | 9.5.12     | 2026-07-22     | Core toolkit ("A Swiss Army knife for service workers")                                                                                                            |

`@ducanh2912/next-pwa` README, verbatim:

> "If there's no specific reason to continue using `@ducanh2912/next-pwa`, consider migrating to [`@serwist/next`](https://serwist.pages.dev/docs/next), a part of [Serwist](https://serwist.pages.dev) (a Workbox fork)."

**Next.js's own docs name Serwist**, verbatim:

> "For full service-worker-based offline caching, one option is [Serwist](https://github.com/serwist/serwist), which provides Next.js integration examples for both [Turbopack](https://github.com/serwist/serwist/tree/main/examples/next-turbo-basic) and [webpack](https://github.com/serwist/serwist/tree/main/examples/next-basic)."

`@serwist/next@9.5.12` package metadata (read from the tarball):

```json
"peerDependencies": { "next": ">=14.0.0", "react": ">=18.0.0", "typescript": ">=5.0.0", "@serwist/cli": "^9.5.12" },
"engines": { "node": ">=18.0.0" },
"license": "MIT"
```

→ `next: ">=14.0.0"` covers Next 16. Turbopack example exists. Docs: <https://serwist.pages.dev/docs/next>; config options: <https://serwist.pages.dev/docs/next/configuring> (`swSrc`, `swDest`, `swUrl`, `cacheOnNavigation`, `exclude`, `dontCacheBustURLsMatching`, `disable`, `register`, `reloadOnOnline`, `scope`, `additionalPrecacheEntries`, `maximumFileSizeToCacheInBytes`, `manifestTransforms`, …).

Quick start: `npx degit serwist/serwist/examples/next-basic my-app`

### 3.6 Next.js 16 experimental `useOffline` — a caching-free offline story

**This is new and directly relevant.** Confirmed present in the version installed in this repo: `node_modules/next/offline.js` re-exports `useOffline` from `./dist/client/components/use-offline`, and `experimental.useOffline` exists in `config-schema.d.ts` / `config-shared.d.ts` with default `false`.

Docs: <https://nextjs.org/docs/app/api-reference/functions/use-offline> (`lastUpdated: 2026-07-28`) and <https://nextjs.org/docs/app/api-reference/config/next-config-js/useOffline> (`lastUpdated: 2026-07-28`). Version history says: **`v16.x.0` — `useOffline` hook introduced.**

Both pages carry the warning, verbatim:

> "This feature is currently experimental and subject to change, it's not recommended for production."

```js
// next.config.js
module.exports = { experimental: { useOffline: true } };
```

```tsx
'use client';
import { useOffline } from 'next/offline';
export function OfflineBanner() {
  const isOffline = useOffline();
  if (!isOffline) return null;
  return <div role="status">You are offline. Some content may be unavailable.</div>;
}
```

**Without the flag, the hook always returns `false`.** It returns `false` during SSR and before hydration.

What enabling it does, verbatim:

> - "Listen for the browser's `offline` and `online` events to track connectivity.
> - Detect network failures on navigation, prefetch, and Server Action requests.
> - Poll for connectivity using `HEAD` requests with backoff while offline.
> - Automatically retry blocked requests once connectivity is restored.
> - Make the `useOffline` hook available from `next/offline`."

**The connectivity check** (verbatim):

> "Each check issues a single `HEAD` request to the current page's URL with the RSC header set, the same endpoint navigations use. The request is aborted after 200 ms.
> Two outcomes count as 'online':
>
> 1. The fetch resolves normally.
> 2. The 200 ms timeout aborts the request. A truly offline request fails almost instantly (DNS or TCP error), so if it's still pending at 200 ms the TCP handshake succeeded and the server is reachable."

**Backoff table** (verbatim):

| Attempt     | Delay before next check |
| ----------- | ----------------------- |
| 1           | 500 ms                  |
| 2           | 1 s                     |
| 3           | 2 s                     |
| 4 and after | 3 s                     |

> "The polling loop never gives up on its own. It continues at the 3-second cap until a check succeeds or the page unloads."

> "While the offline state is active, any navigation, prefetch, or Server Action waits for the next connectivity check to succeed, whether it was newly issued or already in flight when the connection dropped. When the check succeeds, the request runs once; no extra backoff applies."

Offline-aware `loading.tsx` example is given in the docs:

```tsx
'use client';
import { useOffline } from 'next/offline';
export default function Loading() {
  const isOffline = useOffline();
  return <div>{isOffline ? 'Waiting for connection to load this page...' : 'Loading...'}</div>;
}
```

**What it is NOT:** it is not a service worker, it does not cache anything, and it does not make content available offline. It makes a _server-rendered_ app survive a flaky connection without throwing errors at the user and without losing an in-flight Server Action. For a CMS admin that mostly needs "don't lose my save when the lift drops signal", this is a much smaller-surface tool than a caching service worker.

### 3.7 Serwist's `defaultCache` for Next.js — extracted from source

**Read directly from `@serwist/next@9.5.12` → `dist/index.worker.mjs`** (npm tarball, 2026-08-12). This is the recommended caching list the Serwist docs point at, and it is the thing most people will drop in unmodified — so its exact rules matter.

```js
const PAGES_CACHE_NAME = {
  rscPrefetch: 'pages-rsc-prefetch',
  rsc: 'pages-rsc',
  html: 'pages',
};
const defaultCache =
  process.env.NODE_ENV !== 'production'
    ? [{ matcher: /.*/i, handler: new NetworkOnly() }]
    : [/* rules below */];
```

**In development everything is `NetworkOnly`.** Every caching behaviour below only exists in production builds — which means you cannot observe these bugs in `next dev`.

Production rules, in order:

| #   | Matcher                                                            | Strategy                       | Cache name                  | maxEntries                  | maxAge                |
| --- | ------------------------------------------------------------------ | ------------------------------ | --------------------------- | --------------------------- | --------------------- |
| 1   | `fonts.gstatic.com/*`                                              | CacheFirst                     | `google-fonts-webfonts`     | 4                           | 365 d                 |
| 2   | `fonts.googleapis.com/*`                                           | StaleWhileRevalidate           | `google-fonts-stylesheets`  | 4                           | 7 d                   |
| 3   | `.eot                                                              | otf                            | ttc                         | ttf                         | woff                  | woff2 | font.css` | StaleWhileRevalidate | `static-font-assets`  | 4   | 7 d  |
| 4   | `.jpg                                                              | jpeg                           | gif                         | png                         | svg                   | ico   | webp`     | StaleWhileRevalidate | `static-image-assets` | 64  | 30 d |
| 5   | `/_next/static/**.js`                                              | CacheFirst                     | `next-static-js-assets`     | 64                          | 24 h                  |
| 6   | `/_next/image?url=…`                                               | StaleWhileRevalidate           | `next-image`                | 64                          | 24 h                  |
| 7   | `.mp3                                                              | wav                            | ogg`                        | CacheFirst (+RangeRequests) | `static-audio-assets` | 32    | 24 h      |
| 8   | `.mp4                                                              | webm`                          | CacheFirst (+RangeRequests) | `static-video-assets`       | 32                    | 24 h  |
| 9   | `.js`                                                              | StaleWhileRevalidate           | `static-js-assets`          | 48                          | 24 h                  |
| 10  | `.css                                                              | .less`                         | StaleWhileRevalidate        | `static-style-assets`       | 32                    | 24 h  |
| 11  | `/_next/data/**.json`                                              | NetworkFirst                   | `next-data`                 | 32                          | 24 h                  |
| 12  | `.json                                                             | xml                            | csv`                        | NetworkFirst                | `static-data-assets`  | 32    | 24 h      |
| 13  | **`/api/auth/*`**                                                  | **NetworkOnly** (10 s timeout) | —                           | —                           | —                     |
| 14  | same-origin GET `/api/*`                                           | NetworkFirst (10 s timeout)    | `apis`                      | 16                          | 24 h                  |
| 15  | `RSC: 1` **+** `Next-Router-Prefetch: 1`, same-origin, not `/api/` | NetworkFirst                   | `pages-rsc-prefetch`        | 32                          | 24 h                  |
| 16  | `RSC: 1`, same-origin, not `/api/`                                 | NetworkFirst                   | `pages-rsc`                 | 32                          | 24 h                  |
| 17  | `Content-Type: text/html`, same-origin, not `/api/`                | **NetworkFirst**               | **`pages`**                 | 32                          | **24 h**              |
| 18  | same-origin, not `/api/`                                           | NetworkFirst                   | `others`                    | 32                          | 24 h                  |
| 19  | cross-origin                                                       | NetworkFirst (10 s timeout)    | `cross-origin`              | 32                          | 1 h                   |
| 20  | catch-all GET                                                      | NetworkOnly                    | —                           | —                           | —                     |

**Read rules 13–20 carefully.** Serwist ships a deliberate `NetworkOnly` carve-out for `/api/auth/*` — an acknowledgement that auth endpoints must never be cached. But rules **15, 16 and 17 have no auth exclusion at all**: any same-origin HTML page and any RSC payload, _including a logged-in admin dashboard_, is stored in the `pages` / `pages-rsc` caches for **24 hours**, in a Cache Storage bucket that is scoped to the **origin, not the session**. See §4.3.

---

## 4. Offline strategy for a CMS admin

### 4.1 The canonical strategy catalogue

Workbox / Chrome for Developers, _Caching strategies overview_ — <https://developer.chrome.com/docs/workbox/caching-strategies-overview/>

| Strategy                                 | Behaviour                                                 | Documented use case                                                                                                                                           |
| ---------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cache Only**                           | Only ever hits cache; assets must be precached at install | Static resources that change only when the SW updates                                                                                                         |
| **Network Only**                         | Bypasses the cache entirely                               | _"ensuring content freshness (think markup)"_                                                                                                                 |
| **Cache First, falling back to network** | Cache hit wins; otherwise fetch + store                   | _"great strategy to apply to all static assets (such as CSS, JavaScript, images, and fonts), especially hash-versioned ones"_                                 |
| **Network First, falling back to cache** | Try network, cache the response, fall back when offline   | _"great for HTML or API requests when… you want the most recent version of a resource, yet want to give offline access to the most recent available version"_ |
| **Stale-While-Revalidate**               | Serve cache immediately, refresh in background            | Resources _"sort of important to keep up to date, but are not crucial,"_ e.g. user avatars                                                                    |

Jake Archibald's _Offline Cookbook_ (2014-12-09, still the reference catalogue) — <https://web.dev/articles/offline-cookbook>. Serving patterns and their ideal use:

| Pattern                       | Ideal for                                |
| ----------------------------- | ---------------------------------------- |
| Cache only                    | Static site assets                       |
| **Network only**              | **Analytics, non-GET requests**          |
| Cache falling back to network | Offline-first architecture               |
| Cache and network race        | Small assets on slow disk                |
| Network falling back to cache | Frequently updating resources            |
| Cache then network            | Articles, timelines, leaderboards        |
| Generic fallback              | Secondary imagery, **failed POSTs**      |
| SW-side templating            | Dynamic pages built from JSON + template |

Storage notes from the same article:

- Origins get a **shared quota** across localStorage, IndexedDB, File System Access and Caches. Check with `navigator.storage.estimate()`.
- `navigator.storage.persist()` prevents eviction under storage pressure (requires permission).
- _"Responses can only be read once; use `.clone()` for multiple reads."_
- _"Browser may discard cached data under storage pressure."_

**Offline fallback page** — Workbox, _Managing fallback responses_ — <https://developer.chrome.com/docs/workbox/managing-fallback-responses/>

```js
import { matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { setDefaultHandler, setCatchHandler } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);
setDefaultHandler(new StaleWhileRevalidate());

setCatchHandler(async ({ request }) => {
  switch (request.destination) {
    case 'document':
      return matchPrecache('/offline.html');
    default:
      return Response.error();
  }
});
```

Note the `request.destination === 'document'` gate — the fallback is only for navigations.

### 4.2 Offline UX guidelines

web.dev, _Offline UX design guidelines_, published **2016-11-10** — <https://web.dev/articles/offline-ux-design-guidelines>

- Avoid jargon, verbatim: _"When explaining UI components or the state of the app, avoid tech jargon. The word 'offline' often isn't clear enough."_ Use action-based language.
- Example message given: _"You seem to have a bad network connection. Not to worry! Messages will be sent when the network is restored."_
- Use several cues together (colour + label + icon), not one.
- Caching by choice: _"Make sure there's a switch or pin to add an item for offline use. Auto-download files only if a user has specifically asked for this behavior."_
- Default caching only when cheap: _"If your app doesn't require much data, then cache that data by default."_
- Communicate sync status; don't block the user from continuing to work.
- Time-sensitive apps should auto-update and say so; reading-oriented apps should let the user refresh manually so they don't lose their place.

### 4.3 The traps — specific to an authenticated CMS admin

**Trap 1 — stale auth / a cached authenticated page outliving the session.**
Cache Storage is keyed by **origin**, not by user or session. Serwist's `defaultCache` rule 17 stores _any_ same-origin `text/html` response in a cache named `pages` under `NetworkFirst` with `maxAgeSeconds: 86400`. That includes `/admin`. Consequences:

- After logout, the previously-rendered admin HTML remains in Cache Storage and will be served on the next offline navigation.
- On a shared or handed-over device, a second person opening the app offline gets the first person's rendered admin shell.
- Serwist's own carve-out for `/api/auth/*` (`NetworkOnly`) shows the authors were aware of the class of problem but only solved it for the auth endpoints, not for authenticated HTML/RSC.
- Nothing clears these caches on logout unless you write that code (`caches.keys()` → `caches.delete()`).
  _(Derived from source inspection of `@serwist/next@9.5.12` — §3.7. The security conclusion is analysis, not a quoted vendor statement.)_

**Trap 2 — editing against stale data (lost update).**
`NetworkFirst` returns a cached copy up to 24 h old when the network fails. If the editor loads that copy, edits it, and then saves when connectivity returns, the save is computed from stale state and silently overwrites anything changed in between. There is no version check in any of Serwist's default rules. Mitigations that exist in the ecosystem: optimistic-concurrency tokens (`updatedAt` / ETag) checked server-side, and refusing to render an editor from a cached response at all.

**Trap 3 — losing a draft, and why Background Sync won't save you on iOS.**

- **Background Sync API is not available on Safari or iOS Safari** — caniuse `background-sync`: `safari 26.5 = n`, `ios_saf 26.5 = n`; MDN BCD `api/SyncManager` → `firefox: false`, `safari: false`, `safari_ios: false`. `PeriodicSyncManager` is Chrome-only (80+).
- MDN calls Background Sync _"Limited availability — This feature is not Baseline because it does not work in some of the most widely-used browsers."_
- The `sync` event handler shape:
  ```js
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
      event.waitUntil(sendOutboxMessages());
    }
  });
  ```
  <https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API>
- → On iOS, an "outbox" can only be flushed **when the user next opens the app**. A draft written to IndexedDB while offline sits there until then. Any UI that says "we'll send it in the background" is a lie on iPhone.
- The Next.js `useOffline` retry loop (§3.6) _does_ retry an in-flight Server Action once connectivity returns — but only while **the page is still open**. It does not survive the tab being closed.

**Trap 4 — storage eviction wiping the draft.**

- Safari's 7-day script-writable-storage cap deletes IndexedDB and localStorage for sites **not** installed to the Home Screen (§1.9). An owner who edits from a Safari tab once a fortnight loses local drafts.
- Installed home-screen web apps are exempt (own days-of-use counter).
- `navigator.storage.persist()` is available from Safari 15.2 / Chrome 55 / Firefox 57.
- Chrome/Firefox evict under overall storage pressure regardless.

**Trap 5 — the service worker itself going stale.**
This is why the Next.js guide sets `Cache-Control: no-cache, no-store, must-revalidate` on `/sw.js` and registers with `updateViaCache: 'none'` (§3.3–3.4). Without both, an HTTP-cached SW script can pin an old caching policy in place for as long as its max-age.

**Trap 6 — precached JS vs. freshly deployed server (version skew).**
Serwist rule 5 caches `/_next/static/**.js` **CacheFirst for 24 h**. After a deploy, a client can be running yesterday's client bundle against today's server, producing RSC/Server Action mismatches. Next.js has related mitigations (`deploymentId`, `experimental.useSkewCookie` — present in `config-shared.d.ts` of the installed 16.3.0) — **their interaction with a service worker was not verified in this pass.**

**Trap 7 — POSTs and Server Actions cannot be replayed from Cache Storage.**
Cache API only stores GET responses. Archibald's cookbook lists "Network only" as the right pattern for _"non-GET requests"_ and "generic fallback" for _"failed POSTs"_. Any offline write queue must be hand-built on IndexedDB.

**Trap 8 — cross-origin / opaque responses.** Serwist rule 19 caches cross-origin responses `NetworkFirst` for 1 h. Opaque (`no-cors`) responses cannot be inspected for success and are padded heavily against quota.

**Trap 9 — multiple tabs / multiple installs.** iOS lets the same PWA be installed more than once, each with **isolated storage** (web.dev, §1.5). Two installs = two independent draft stores and two independent push subscriptions.

**Trap 10 — you cannot reproduce any of this in `next dev`.** Serwist's `defaultCache` is `NetworkOnly` for everything when `NODE_ENV !== 'production'` (§3.7).

### 4.4 What is safe to cache vs. not — as evidenced

| Category                                    | Evidence-backed position                                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Hashed build output (`/_next/static/**`)    | Safe. CacheFirst. Immutable by content hash. (Workbox: _"especially hash-versioned ones"_)                |
| Fonts, icons, app-shell CSS                 | Safe. CacheFirst / SWR.                                                                                   |
| Public marketing/portfolio pages            | Safe. NetworkFirst / SWR. No per-user content.                                                            |
| Optimised images (`/_next/image`)           | Safe-ish. Serwist uses SWR, 64 entries, 24 h.                                                             |
| **Authenticated admin HTML / RSC payloads** | **Not safe by default** — Serwist caches them anyway (rules 15–17). Requires an explicit exclusion.       |
| **Auth endpoints**                          | Serwist already forces `NetworkOnly` for `/api/auth/*` (rule 13).                                         |
| **Authenticated JSON APIs (`/api/*` GET)**  | Serwist caches these `NetworkFirst` for 24 h (rule 14) with **no auth check**.                            |
| Analytics beacons                           | Network only (Archibald: _"Network only — Analytics, non-GET requests"_).                                 |
| POST / Server Actions                       | Cannot be cached. Hand-rolled IndexedDB outbox only.                                                      |
| User drafts                                 | IndexedDB, plus `navigator.storage.persist()`, plus install-to-home-screen on iOS to dodge the 7-day cap. |

### 4.5 Real-world precedent

Prior art that is documented and citable:

- **Workbox `offlineFallback` recipe** — an `offline.html` served only for `request.destination === 'document'` (§4.1). This is the "degrade gracefully" pattern, not full offline editing.
- **Next.js `useOffline`** (§3.6) — Vercel's own answer for a server-rendered app is _connectivity awareness + automatic retry_, explicitly **not** offline caching. That is a meaningful signal about what a server-rendered CMS should attempt.
- **web.dev offline UX guidelines** (§4.2) — explicit-opt-in caching ("a switch or pin to add an item for offline use") rather than blanket caching.

**Gap:** no primary-source case study of a _CMS admin dashboard_ that edits offline was located in this pass. WordPress's block editor keeps a browser-local autosave backup separate from the server autosave, which is the closest widely-deployed draft-protection analogue — **UNVERIFIED**, the developer.wordpress.org page for it 404'd during research and the behaviour was not confirmed against a primary source. Worth a dedicated follow-up.

---

## 5. Mobile admin UX patterns

_(§5A: design-pattern evidence, researched directly. §5B: how existing CMSes handle mobile editing — see below.)_

### 5A.1 How people actually hold phones

Steven Hoober, _How Do Users Really Hold Mobile Devices?_, UXmatters, **2013-02-18** — <https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php>

Method: **1,333 observations** over two months ending 2013-01-08; **780** involved actually interacting with the screen (scrolling, typing, gestures).

| Grip                                    | Share   |
| --------------------------------------- | ------- |
| One-handed                              | **49%** |
| Cradled (one hand holds, other touches) | **36%** |
| Two-handed (both thumbs)                | **15%** |

Within one-handed use: right thumb **67%**, left thumb **33%**.
Within cradling: thumb **72%** / finger **28%**; held in left hand **79%** / right **21%**.
Within two-handed use: portrait **90%** / landscape **10%**.
Also: 22% of observations were voice calls; 18.9% passive (listening/watching).

Reach model: green = easily reachable, yellow = requires a stretch, red = requires repositioning the hand. Hoober notes users frequently shift grip mid-task.

⚠️ This is a **2013** study and is the most-cited primary data on the subject. Newer devices are larger; treat the _proportions_ as directional and the _reach principle_ as durable. No newer primary study of equivalent rigour was located in this pass.

### 5A.2 Tap target sizes — the three numbers

| Authority                   | Minimum                          | Note                                                                                                                                                                  |
| --------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WCAG 2.2 SC 2.5.8 (AA)**  | **24 × 24 CSS px**               | With a spacing exception — see §8                                                                                                                                     |
| **WCAG 2.2 SC 2.5.5 (AAA)** | **44 × 44 CSS px**               |                                                                                                                                                                       |
| **Android / Material**      | **48 × 48 dp**, ≥ **8 dp** apart | _"A touch target of 48x48dp results in a physical size of about 9mm, regardless of screen size."_ — <https://support.google.com/accessibility/android/answer/7101858> |
| Apple HIG                   | 44 × 44 pt                       | **UNVERIFIED** — Apple's HIG pages render client-side and could not be fetched. Widely cited; treat as needing confirmation.                                          |

Google's exact wording:

> "Consider making touch targets at least 48x48dp, separated by 8dp of space or more, to ensure balanced information density and usability."

### 5A.3 Bottom navigation vs. hamburger

Nielsen Norman Group, Raluca Budiu, _Basic Patterns for Mobile Navigation_, **2015-11-15** — <https://www.nngroup.com/articles/mobile-navigation-patterns/>

- Tab/navigation bars: _"Tab bars and navigation bars are well suited for sites with relatively few navigation options."_ Beyond **5 options**, fitting them while keeping proper touch-target sizes becomes problematic.
- Hidden menus: _"The navigation menu makes the navigation options least discoverable and is best suited for content-heavy, browse-mostly sites and apps."_
- On out-of-sight navigation: _"Out of sight is out of mind, and if the categories are widely different… users won't think to scroll to get to those options."_
- Third-party research cited by NN/g suggests users respond slightly better to an explicit **"Menu"** label than to a bare hamburger icon.
- Overarching principle: _"Prioritize content over chrome."_
- NN/g gives no quantitative discoverability percentages in this article.

⚠️ NN/g's _mobile-form-design_ URL 404s; that specific article could not be verified.

### 5A.4 Form design on mobile — verifiable mechanics

**The 16px rule (iOS auto-zoom).** Chris Coyier, CSS-Tricks, **2021-05-04** — <https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/>

> "If the `font-size` of an `<input>` is 16px or larger, Safari on iOS will focus into the input normally. But as soon as the `font-size` is 15px or less, the viewport will zoom."

Fix: set inputs to ≥ 16px. Do **not** fix it with `user-scalable=no`:

MDN, viewport meta reference — <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport>, verbatim:

> "Disabling zooming capabilities by setting `user-scalable` to a value of `no` prevents people experiencing low vision conditions from being able to read and understand page content. Additionally, WCAG requires a minimum of 2× scaling; however, the best practice is to enable a 5× zoom."

Also from MDN: **"iOS 10+ ignores both `maximum-scale` and `minimum-scale` by default"** and **"iOS 10+ ignores `user-scalable` by default."** So the hack does not even work on modern iOS — it only damages accessibility elsewhere.

**Virtual keyboard handling.** `interactive-widget` in the viewport meta (MDN, same page):

| Value              | Effect                                                                               |
| ------------------ | ------------------------------------------------------------------------------------ |
| `resizes-visual`   | The **visual viewport** is resized by the widget (**default**)                       |
| `resizes-content`  | The **viewport** (and the initial containing block, hence viewport units) is resized |
| `overlays-content` | Neither viewport is resized                                                          |

MDN gives no browser-support data for `interactive-widget` on that page → **support UNVERIFIED**.

**Viewport units for mobile toolbars.** MDN, `<length>` — <https://developer.mozilla.org/en-US/docs/Web/CSS/length>

- `sv*` (`svh`, `svw`, …) = viewport with dynamic browser UI **expanded** (smallest).
- `lv*` = with browser UI **retracted** (largest).
- `dv*` = resizes live. Verbatim: _"The dynamic viewport size allows the content you design to fit exactly within the viewport, irrespective of the presence of dynamic browser interfaces."_ — but _"this can cause layout shifts while scrolling."_
- Plain `vh`/`vw` are equivalent to the **large** variants.

**Safe areas for bottom nav.** MDN, `env()` — <https://developer.mozilla.org/en-US/docs/Web/CSS/env>. **Baseline: widely available since January 2020.**

```css
footer {
  position: sticky;
  bottom: 0;
  padding: 1em 1em calc(1em + env(safe-area-inset-bottom));
}
```

Available variables: `safe-area-inset-{top,right,bottom,left}`, `safe-area-max-inset-*`, `titlebar-area-{x,y,width,height}` (for `window-controls-overlay` desktop PWAs), `keyboard-inset-*` (VirtualKeyboard API), `viewport-segment-*` (foldables), `preferred-text-scale`.
MDN's `env()` page does **not** mention `viewport-fit=cover`; that value is documented on the viewport meta page as one of `auto | contain | cover`.

### 5A.5 Drag-and-drop alternatives on touch

**Accessibility requirement.** WCAG 2.2 **SC 2.5.7 Dragging Movements (Level AA)** — <https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html> (Understanding doc updated **2026-07-26**), verbatim:

> "All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author."

→ A drag-to-reorder block list **must** also be operable without dragging (e.g. explicit "move up" / "move down" buttons, or a cut-and-place model).

**Technical reality.** caniuse `dragndrop` (94.48% "y" overall) hides real mobile gaps:

- **Firefox Android 153 = `n`**
- **Samsung Internet 30 = `n`**
- Chrome Android note 4: not supported on Android 6 or older.
- MDN's HTML Drag and Drop API page describes the model entirely in terms of `MouseEvent` and makes **no statement about touch support** — <https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API>. That HTML5 DnD does not respond to touch gestures in practice is the common experience but is **UNVERIFIED** against a primary source here.

**Pointer Events** are the portable substrate: caniuse `pointer` = **96.08%** full support, `y` on Safari 26.5, iOS Safari 26.5, Chrome 154, Firefox 156, Samsung 30 — strictly better mobile coverage than HTML5 DnD.

Related criteria that bite touch reordering: **SC 2.5.1 Pointer Gestures (A)** — see §8.

### 5A.6 Sheet-based editing

Material Design's bottom-sheet guidance pages (`m3.material.io`, `m2.material.io`) render client-side and could not be fetched in this pass — specific dp values and the standard/modal/expanding taxonomy are **UNVERIFIED here**. Follow-up needed against a fetchable mirror or the Android developer docs.

What _is_ established from the sources above and applies to sheet design:

- A sheet anchored to the bottom edge puts its primary action inside the thumb-reachable zone for the 49% one-handed / 36% cradled majority (§5A.1).
- Sheet content must still satisfy **1.4.10 Reflow** at 320 CSS px and **2.5.8 Target Size** at 24×24 px (§8).
- Sheet height should use `dvh`/`svh` rather than `vh` so the keyboard and the collapsing browser toolbar don't clip the primary action (§5A.4).
- `env(safe-area-inset-bottom)` padding is required or the action sits under the home indicator (§5A.4).

### 5B. How existing CMSes handle mobile editing

App-store figures verified **2026-08-11/12** via Apple's iTunes Lookup/Search API and live Google Play queries. Quotes are verbatim from the linked source.

| Platform       | Native mobile app TODAY?                                                                | Killed one? When                                                     | Editor on phone browser                                              | Official mobile stance                                                                |
| -------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Ghost**      | **No** (iOS never; Android dead)                                                        | Android app retired, notice dated **Feb 2020**; Play package now 404 | Admin is a responsive SPA — works, unofficially                      | _"Ghost has always been a responsive web application"_; no app roadmap commitment     |
| **WordPress**  | **Yes — two.** WordPress app _and_ Jetpack app, both v27.1, both shipped **2026-08-02** | Old WP app **not killed** — de-scoped Mar 2023                       | wp-admin / Gutenberg responsive                                      | _"Managing your site across both apps is currently unsupported"_                      |
| **Sanity**     | **No**                                                                                  | n/a                                                                  | Yes — Studio is responsive and actively improved (v5.31.0, Jun 2026) | Changelog explicitly targets _"narrow viewports"_                                     |
| **Contentful** | **No** (zero apps on Apple developer page)                                              | n/a                                                                  | **UNVERIFIED** — no official statement found                         | Silent. All "mobile" docs are about Contentful _as a backend_                         |
| **Statamic**   | **No**                                                                                  | n/a                                                                  | Yes — CP is responsive                                               | v2 docs: _"It's responsive, intuitive, and powerful."_ v6 docs make **no** such claim |
| **Webflow**    | **No, never**                                                                           | **Legacy Editor retired 2026-08-04** — the mobile-tolerant path      | **Effectively no** — 1268px + mouse/keyboard required                | _"Webflow requires a mouse-and-keyboard device… screen width of at least 1268px"_     |
| **Framer**     | **No**                                                                                  | Desktop app is Mac/Windows only                                      | **No** — Canvas requires a desktop OS                                | Canvas needs _"Windows, macOS, Linux, or ChromeOS"_ — iOS/Android excluded            |

#### Ghost — no app, responsive admin

- Official changelog <https://ghost.org/changelog/android/> — Android app launched Nov 2017 (community-developed by Vicky Chijwani); the page now carries a **February 2020** notice: _"The Ghost Android app is no longer available for use with the latest versions of Ghost."_
- **Verified delisted:** `play.google.com/store/apps/details?id=me.vickychijwani.spectre` returns **HTTP 404** (2026-08-11).
- Ghost staff explanation — Kevin, 2023-11-29, <https://forum.ghost.org/t/android-app-status/43033>: _"The Ghost Android app was primarily a community project that worked with early Ghost versions that only supported markdown. With the introduction of a rich-text editor the Android app no longer functioned and no one else picked it up as it's a huge amount of work to build support."_
- Same thread, user **samtuke**: _"Communication about the Android app is confusing - looks like it has been retired completely, with no successor, years ago"_
- Ghost's own 2017 framing: _"Ghost has always been a responsive web application, but today we're taking that a step further with an official native Android app!"_
- Roadmap <https://docs.ghost.org/product> — _"the exact roadmap isn't shared publicly."_ No mobile commitment. Ghost 6.0 (Aug 2025) shipped ActivityPub + native analytics, no app (<https://ghost.org/changelog/6/>). The changelog index through **2026-08-07** contains no mobile/app/PWA entries.
- **Is Ghost Admin an installable PWA? UNVERIFIED** — no official statement found.
- **Third parties are filling the gap in 2026:** **Nib** (Android), announced on the Ghost forum **2026-08-08** — <https://forum.ghost.org/t/i-built-nib-an-android-app-for-posting-to-ghost/63530>, opening line: _"Hey. I wanted to write to my Ghost site from my phone, so I built an Android app for it."_ Also "Ghost CMS Editor & Publisher" (VERSIONPRIME LTD, v1.27, updated **2026-08-09**, <https://apps.apple.com/us/app/ghost-cms-editor-publisher/id6759520730>) and the abandoned "Publisher for Ghost" (last updated 2020-05-15).

#### WordPress — two apps, one codebase, an explicit warning

| App                         | Publisher        | Version  | Released       | Rating          |
| --------------------------- | ---------------- | -------- | -------------- | --------------- |
| WordPress – Website Builder | Automattic, Inc. | **27.1** | **2026-08-02** | 4.62 ★ / 22,264 |
| Jetpack for WordPress       | Automattic, Inc. | **27.1** | **2026-08-02** | 4.74 ★ / 6,313  |

<https://apps.apple.com/us/app/wordpress/id335703880> · <https://apps.apple.com/us/app/jetpack-for-wordpress/id1565481562> · Android `org.wordpress.android`, `com.jetpack.android`. Identical version numbers and release timestamps confirm a shared codebase.

**The March 2023 split** — <https://jetpack.com/support/switch-to-the-jetpack-app/>:

> _"In March 2023, Jetpack features were removed from the WordPress app and will only be available in the Jetpack app."_

Moved to Jetpack: **Stats, Reader, Notifications, Activity Log, Jetpack Social, Jetpack Backup, Jetpack Scan, Menus, People, Themes.** _"The WordPress app's focus shifts to a closer-to-core publishing and site management experience."_

⚠️ Operational warning on the same page: _"Managing your site across both apps is currently unsupported and may lead to issues like data conflicts"_

Announcement: <https://wordpress.com/blog/2023/02/15/switch-to-the-new-jetpack-mobile-app/>. **What you get from a phone:** WordPress app = create/edit posts and pages, media, comments. Jetpack app = that plus stats, notifications, Reader, backups, security scans. Both support WordPress.com and self-hosted 4.0+.

#### Sanity — no app, best mobile-web story of the set

- iTunes Search "sanity" (US, 2026-08-11): **zero** apps published by Sanity.io.
- Official changelog **v5.31.0, published 2026-06-10** — <https://www.sanity.io/docs/changelog/studio-NS4zMC4w>, verbatim:
  > _"Presentation now adapts to narrow viewports. When the window is too small to show the preview and the document editor side-by-side, they collapse into a tab bar at the top so you can switch between 'Presentation' and 'Structure' (and 'Navigator', when configured) one pane at a time, instead of a cramped split view."_
  > The same release _"improves the responsive design for smaller screens by collapsing the side-by-side editor view into tabs."_
- **In practice you can do effectively everything from a phone** — Studio is a single responsive React SPA with no viewport feature-gating.
- Real complaint — GitHub **sanity-io/sanity#4196**, _"Object/Array Editor Modal UI/UX Extremely Poor on Mobile"_, opened 2023-02-22, now closed — <https://github.com/sanity-io/sanity/issues/4196>: _"the modal is fixed to the top of the page, opening the dialog does not scroll you to it, and the page behind the modal 'overlay' remains scrollable"_; in popover mode _"the modal disappears if you scroll down such that the top of the modal moves past the top of the viewport, and a small area at the bottom of the modal's scrollable area is always hidden"_
- ⚠️ **Don't conflate:** Sanity's "Mobile apps" pages (<https://www.sanity.io/solutions/mobile-apps>) are about using Sanity _as a backend for apps you build_, not editing from a phone.

#### Contentful — no editor app, and no published mobile stance

- iTunes Search "contentful" (2026-08-11): **zero** apps published by Contentful GmbH. Apple's developer page <https://apps.apple.com/us/developer/contentful/id892840018> renders with **no app listings**. Historically indexed Contentful apps ("Contentful Gallery Showcase", "Contentful Reference") were **SDK demo apps**, not editor tools, and no longer surface.
- Every Contentful "mobile" doc is about Contentful as a backend: <https://www.contentful.com/help/mobile-cms/>, <https://www.contentful.com/help/android-cms/>, <https://www.contentful.com/developers/docs/ios/tutorials/>.
- **Official mobile-browser support statement: NOT FOUND — UNVERIFIED.** No supported-browsers/system-requirements page addressing phones was locatable; contentful.com/help returned persistent HTTP 429.
- **No mobile-specific complaint thread with a quotable URL was found — UNVERIFIED.**

#### Statamic — responsive, but they stopped saying so

- No official app on either store (iTunes Search "statamic" returns unrelated pharmaceutical apps).
- **Statamic 6 released 2026-01-28** — <https://statamic.com/blog/statamic-6>. Completely redesigned Control Panel on **Vue 3 + Inertia.js + Tailwind CSS v4**; 1,000+ merged PRs.
- The clearest official responsive claim is **legacy** — Statamic 2 docs, <https://v2.statamic.com/control-panel>: _"It's responsive, intuitive, and powerful."_
- ⚠️ The **Statamic 6 Control Panel Overview** (<https://statamic.dev/control-panel/overview>) makes **no responsive/mobile/tablet claim at all**, and neither does the v6 release post. Widely-repeated marketing lines about editing "from your phone… dentist's waiting room" and container-query small-screen fieldtype improvements could **not be verified on a live official page → UNVERIFIED.**
- Known issue — GitHub **statamic/cms#2621**, _"Control Panel UI doesn't take up full width"_, opened 2020-10-08, closed via PR #2622: _"The unopened popover is occupying additional width on mobile, even though the x-position is transformed."_

#### Webflow — the most consequential finding in this dossier

**No native app, ever.** iTunes Search returns no apps by Webflow, Inc. The gap is filled by third parties — **Phoneflow – Webflow on Phone** (Com des Lézards, v2.10.5, updated **2026-05-19**, <https://apps.apple.com/us/app/phoneflow-webflow-on-phone/id1528892928>), EditFlow, Flow To-Go. _A maintained third-party app literally named "Webflow on Phone" is itself the evidence of unmet demand._

**The official statement** — Help Center, _Intro to Webflow_, <https://help.webflow.com/hc/en-us/articles/33961260162323-Intro-to-Webflow>:

> **"What screen resolutions/devices does Webflow support?**
> Webflow requires a mouse-and-keyboard device (i.e., desktop or laptop computer) with a screen width of at least 1268px. This requirement is the sum of the left and right toolbars and the canvas."

**The legacy Editor died on 2026-08-04 — and it took the mobile-tolerant path with it.** Official: _Legacy Editor deprecation FAQ_, <https://help.webflow.com/hc/en-us/articles/48412420902675-Legacy-Editor-deprecation-FAQ> (created 2026-01-21, updated 2026-07-02):

> _"Starting August 4, 2026, the legacy Editor will no longer be available. We will be providing free transition options, in the form of free client seats or limited seats, to existing legacy Editor users."_

| Date           | Milestone                                         |
| -------------- | ------------------------------------------------- |
| 2026-02-02     | Client seats become available for Workspace plans |
| 2026-05-04     | Automatic migration begins (phased, two weeks)    |
| **2026-08-04** | **The legacy Editor is no longer available**      |

Replacement runs **inside Webflow itself** — <https://help.webflow.com/hc/en-us/articles/33961251014931-Edit-site-content-as-a-content-editor> (updated 2026-07-16): content editors _"can edit site content (e.g., copy, assets, and videos) in Webflow using a simplified interface that ensures the site design stays untouched."_ Access via the Dashboard or by appending `?update` to a live URL.

⚠️ **Net effect (INFERENCE, not a Webflow quote):** because Edit mode is served inside the Webflow application shell, the 1268px minimum width and mouse-and-keyboard requirement now apply to client content editing too. The standalone Editor overlay — the one clients realistically used from an iPad — was retired 2026-08-04. **As of today Webflow has no supported way to edit content from a phone.**

⚠️ **Sourcing caveat:** Webflow migrated its forum. Old `discourse.webflow.com` thread URLs (`/t/webflow-on-tablets/100023`, `/t/minimum-screen-size-for-webflow/71224`) now **301-redirect to <https://community.webflow.com/ask-answer>**, losing the thread content. Those complaint quotes are **UNVERIFIED**.

#### Framer — desktop-OS-only Canvas, mobile CMS only

**No native app.** Downloads are desktop only — <https://www.framer.com/downloads/> ("Framer for Mac and Windows").

**The stance is expressed as a whitelist, not a warning** — _Requirements and browser support_, <https://www.framer.com/help/articles/requirements/> (footer read "Updated 5 days ago" ≈ 2026-08-07):

- For **published Framer sites**: _"Framer supports all operating systems that can run these browser versions, including macOS, Windows, Linux, **Android, and iOS**."_
- For **the editor**: _"To use the Framer Canvas, you need: · An internet connection · A device running **Windows, macOS, Linux, or ChromeOS** · A recent version of Chrome, Safari, Firefox, or Edge"_

**iOS and Android are explicitly listed for published sites and explicitly absent from the Canvas requirement.**

**The one real exception is the CMS** — <https://www.framer.com/updates/mobile-friendly-cms>, published **2025-03-18**. From a phone you can _"manage content on the go, switch between collections, browse items in a horizontally scrollable table view, create and edit entries, and publish"_. So: **CMS entries yes; Canvas/design no.**

Complaints: Framer's community has a thread _"❌Framer Desktop Version not working on Ipad"_ — <https://www.framer.community/c/support/framer-desktop-version-not-working-on-ipad> (reports of crashes and auto-reload in iPad Safari). **Thread body could not be extracted → quotes UNVERIFIED.** The Framer changelog (<https://www.framer.com/updates/>) shows **no mobile-editing entries since the March 2025 CMS release**.

Historical "Framer Preview" iOS/Android companion apps belonged to the pre-Framer-Web prototyping product; **no discontinuation announcement was locatable → UNVERIFIED**. Safe claim: they do not exist today.

---

## 6. What portfolio platforms offer on mobile

<!-- MERGE:PORTFOLIO_MOBILE -->

---

## 7. Quality-of-life features

All figures observed **2026-08-12** unless a doc's own `last_updated` date is quoted. USD unless stated. Where an official pricing page is JS-rendered and could not be parsed (Squarespace, Wix, Carrd, Webflow, Umami, Substack, Formspree, Netlify), the best 2026 third-party source is cited and marked **[3rd-party]**.

### 7.0 Summary table

| #   | Feature                    | What hosted platforms give                                                                                                       | Best self-hosted option                                                    | Free-tier viability                                                               | Difficulty (self-host / strict free tier)                |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | Analytics dashboard        | Built-in on nearly every paid tier; Carrd gates it behind Pro Standard ($19/yr); Framer gates _retention_ (30 d free → 90 d Pro) | **Umami** (MIT, one Postgres) or Vercel Web Analytics (50K events/mo free) | Excellent                                                                         | **EASY / EASY**                                          |
| 2   | Contact-form inbox + reply | Form builder + inbox; Webflow Starter caps at 50 submissions, Basic+ unlimited; Carrd needs Pro Standard                         | Own Postgres table + Turnstile + Resend                                    | Good, but Resend's 100 emails/**day** bites                                       | **MEDIUM / MEDIUM**                                      |
| 3   | Submission notifications   | Instant email notification, included everywhere                                                                                  | Email (piggyback on #2); ntfy/Telegram/Discord webhook for push            | Free; web push is the hard part                                                   | **MEDIUM / EASY** (email) · **HARD / MEDIUM** (web push) |
| 4   | Image optimisation / CDN   | Fully managed; bandwidth/storage capped per tier (Pixpa 3–100 GB)                                                                | `next/image` + sharp on a VPS, or Cloudflare Images                        | Vercel Hobby = **5,000 transformations/mo** — the tightest real limit             | **MEDIUM / MEDIUM-HARD**                                 |
| 5   | Password-protected pages   | Framer: **all plans incl. free**; Webflow Basic+; Pixpa all plans; Squarespace site + page passwords                             | `proxy.ts` + signed cookie + per-page hash                                 | Free — but **not** via Vercel's own feature ($150/mo add-on)                      | **MEDIUM / MEDIUM**                                      |
| 6   | Custom domains             | Gated at the first paid tier almost universally                                                                                  | Vercel Hobby (**50 domains/project, free TLS**) or Caddy on-demand TLS     | Excellent single-tenant; **hard** multi-tenant                                    | **EASY / EASY** (single) · **HARD / HARD** (multi)       |
| 7   | Backups / export           | Consistently the **worst** feature. Squarespace exports a lossy WordPress XML; Wix has no export; Webflow export is Premium-only | `pg_dump` → R2 via cron                                                    | Free-tier managed DBs have near-zero backup (Supabase Free: none; Neon Free: 6 h) | **EASY / MEDIUM**                                        |
| 8   | SEO + Open Graph previews  | SEO fields everywhere; auto OG images                                                                                            | `generateMetadata` + `opengraph-image.tsx` + `ImageResponse`               | Free, built into the framework                                                    | **EASY / EASY**                                          |
| 9   | RSS feeds                  | Squarespace/Ghost/Webflow yes; Framer/Carrd effectively no                                                                       | `app/rss.xml/route.ts` — literally the Next.js docs example                | Free                                                                              | **EASY / EASY**                                          |
| 10  | Newsletter                 | Ghost is the only true built-in (Starter $18/mo, 1,000 members)                                                                  | **Listmonk** (AGPLv3, Postgres) + SES/Resend                               | Sending volume + deliverability is the wall, not the software                     | **HARD / HARD**                                          |

### 7.1 Analytics dashboards

**Hosted:**

- **Framer** — analytics on every plan incl. Free; the gate is _retention_: 30 days Free/Basic, 90 days Pro ($30/mo, $360/yr). <https://www.framer.com/pricing/>
- **Carrd** — free plan has **no analytics at all**; unlocks at Pro Standard **$19/year**. [3rd-party: <https://www.nocode.mba/articles/carrd-pricing>, <https://linke.ro/blog/carrd-pricing-2026>]
- **Squarespace** — "Basic website metrics" on entry plans up to "Ecommerce analytics" and "Form and button conversion insights" higher up. <https://www.squarespace.com/pricing>. Annual: Basic $16/mo, Core $23, Plus $39, Advanced $99; monthly $25/$39/$65/$139. [3rd-party: <https://www.websitebuilderexpert.com/website-builders/squarespace-pricing/>]
- **Wix** — analytics depth is an explicit upsell ("wider analytics" sells Business Elite $159/mo annual). Annual: Light $17, Core $29, Business $39, Business Elite $159. [3rd-party: <https://craftybase.com/blog/wix-pricing-how-much-does-wix-cost>]
- **Webflow** — site analytics from Basic; the 2026 restructure folded CMS+Business into **Premium $25/mo (yearly)**. [3rd-party: <https://www.memberstack.com/blog/new-webflow-pricing-in-2026-what-every-plan-costs-and-how-to-choose>]
- **Adobe Portfolio** — no native analytics; bolt on Google Analytics. **UNVERIFIED**.

**Self-hosted:**

| Option                          | Licence                | Infra                                | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------- | ---------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Plausible Community Edition** | **AGPLv3**             | **Postgres + ClickHouse (two DBs)**  | CE **lacks** funnels, user journeys, ecommerce revenue goals, SSO, sites API; "basic bot filtering" only. Shipped as a **long-term release twice per year** — "latest features and improvements won't be immediately available". Community support only. <https://plausible.io/docs/self-hosting>. ClickHouse needs **SSE 4.2 or NEON**, **≥2 GB RAM recommended**, storage grows **~1 GB per million pageviews**. <https://github.com/plausible/community-edition/> |
| **Umami**                       | **MIT**                | **One Postgres** + Node              | Lightest realistic self-host. Umami Cloud free: **100K events/mo, 3 sites, 6 mo retention** [3rd-party: <https://freetier.co/directory/products/umami>]                                                                                                                                                                                                                                                                                                              |
| **Matomo On-Premise**           | GPLv3 (**UNVERIFIED**) | MySQL/MariaDB + PHP                  | Free core, forum support. Premium features are **paid plugins** (Funnels, Heatmaps, Session Recording, Form Analytics, A/B). Support bundles €275–€3,400/mo. Cloud from **$29/mo for 50,000 hits**. <https://matomo.org/pricing/>. **Bills "hits", not pageviews** — every event, download, outbound click counts.                                                                                                                                                   |
| **GoatCounter**                 | OSS                    | SQLite or Postgres, single Go binary | Hosted free for _"reasonable public usage"_ — _"Running your personal website or small-to-medium business on it is fine, but sending millions of pageviews/day isn't."_ <https://www.goatcounter.com/>                                                                                                                                                                                                                                                               |
| **PostHog Cloud free**          | —                      | none                                 | **1M events/mo**, 5K session replays, 1M feature-flag requests, 1,500 survey responses. Overage from **$0.0000500/event**. <https://posthog.com/pricing>                                                                                                                                                                                                                                                                                                             |
| **Vercel Web Analytics**        | —                      | none                                 | **50,000 events/month**; **1-month reporting window**; **custom events NOT available on Hobby**. Hobby cannot buy more — after the cap there is a **3-day grace period**, collection stops, resumes **7 days** later. Pro $0.03/1K events, 12-mo window; "Plus" add-on $10/mo/team → 24-mo window. <https://vercel.com/docs/analytics/limits-and-pricing> (`last_updated: 2026-06-26`). The beacon script itself **consumes Data Transfer and Edge Request quota**.  |
| **Cloudflare Web Analytics**    | —                      | none                                 | Free, **no event cap**. **10-site soft limit for non-proxied sites; unlimited if proxied**. **Does not require a DNS change** — a JS beacon works on any host. <https://developers.cloudflare.com/web-analytics/limits/> · <https://developers.cloudflare.com/web-analytics/about/>                                                                                                                                                                                  |

**Cookieless/GDPR:** Plausible, Umami, GoatCounter, Cloudflare and Vercel Web Analytics are all cookieless by design. GoatCounter's position: it stores _"aggregate data"_ rather than individual pageviews and cannot identify individuals _"even with full database access"_ — while disclaiming that _"the author is not a lawyer."_ <https://www.goatcounter.com/help/gdpr>

**Verdict: self-hosted EASY / free tier EASY.** Umami is one Postgres container under MIT. Cloudflare Web Analytics is unmetered and free. ⚠️ Avoid Plausible CE for a portfolio — two databases and ≥2 GB RAM for a site's traffic, plus releases only twice a year.

### 7.2 Contact-form inbox with reply

**Hosted:** Webflow Starter (free) = **50 form submissions total**; Basic $15/mo yearly = unlimited. Carrd forms need **Pro Standard $19/yr** (free plan has no forms). Pixpa forms on every plan ("Basic fields" → "Advanced + Payment"). Squarespace Form blocks on all plans. Framer forms included, no published cap.
The thing they all do that matters: **the notification email lands in your normal inbox with a usable `Reply-To`**, so you reply from your mail client. That is the behaviour self-hosting must reproduce.

**Storing submissions** is trivial (one table). Attachments need blob storage:

- **Cloudflare R2 free**: **10 GB-month storage, 1M Class A ops, 10M Class B ops, egress free**. Paid $0.015/GB-mo. <https://developers.cloudflare.com/r2/pricing/>
- **Vercel Blob**: free on Hobby "within usage limits"; Hobby caps **100 blob stores**, 1,200 simple ops/min, 900 advanced ops/min; **blobs >512 MB are never cached**. <https://vercel.com/docs/vercel-blob/usage-and-pricing> (`2026-06-16`). Hobby's included GB is **not published → UNVERIFIED**.

**Spam protection:**

| Option                       | 2026 terms                                                                                                                                                                                                                                                         | Notes                                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare Turnstile**     | **Free.** Managed mode _"completely free to everyone for unlimited use"_, advanced features below the **1 million siteverify request limit**. <https://blog.cloudflare.com/turnstile-ga/>                                                                          | **Does not require Cloudflare DNS/CDN** — _"Turnstile can be embedded into any website without sending traffic through Cloudflare."_ <https://developers.cloudflare.com/turnstile/> **Best free choice.** |
| **hCaptcha**                 | Basic $0; Pro **$139/mo monthly or $99/mo annual** incl. 100K evaluations, then $0.99/1K. <https://www.hcaptcha.com/pricing>                                                                                                                                       | Free tier's exact cap not published                                                                                                                                                                       |
| **Akismet**                  | **Personal: "name your price"** (personal sites only). Pro **$9.95/mo yearly** (500–2,000 checks). Business **$49.95/mo yearly** (5,000 checks). <https://akismet.com/pricing/>                                                                                    | Content-based; complements a captcha                                                                                                                                                                      |
| Honeypot + timing            | Free, self-hosted                                                                                                                                                                                                                                                  | Kills naive bots only                                                                                                                                                                                     |
| **Vercel WAF rate limiting** | **Available on Hobby**: **1 rule per project**, IP/JA4 keys, fixed window 10 s – 10 min, **1,000,000 allowed requests included**; up to 3 custom firewall rules and 3 IP blocks. <https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting> (`2026-06-16`) | Counters are **per-region**, so global traffic can exceed the configured limit                                                                                                                            |
| **Upstash Redis free**       | 256 MB, **500K commands/month**, 10 GB bandwidth, then $0.20/100K. <https://upstash.com/pricing/redis>                                                                                                                                                             | For your own rate limiter                                                                                                                                                                                 |

**Sending the reply:**

| Provider                              | 2026 free tier                                                                                                                                                                | Paid                                                                                                                                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Resend**                            | **3,000 emails/month, 100 emails/DAY, 1 domain, 30-day logs**                                                                                                                 | Pro $20/mo → 50,000; $35/mo → 100,000; **$0.90/1K** overage. Marketing billed by **contacts**: $0 (1,000) → $650/mo (150,000). <https://resend.com/pricing>                       |
| **Postmark**                          | **$0 for 100 emails/month**, never expires                                                                                                                                    | Basic **$15/mo** from 10,000 emails, $1.80/1K overage. **Nothing exists between 100 and 10,000.** <https://postmarkapp.com/pricing>                                               |
| **Amazon SES**                        | New AWS customers get up to **$200 Free Tier credits**; free plan runs **6 months** after account creation. New account defaults begin **21 July 2026**.                      | **Essentials $0.16/1K** (0–10M), $0.14/1K (10–100M), $0.11/1K (>100M). Pro $105/mo/account/region + $0.22→$0.12/1K. Dedicated IP $24.95/mo. <https://aws.amazon.com/ses/pricing/> |
| Brevo, MailerSend, Mailgun, ZeptoMail | **UNVERIFIED**                                                                                                                                                                |                                                                                                                                                                                   |
| SendGrid free tier                    | Widely reported **discontinued** [3rd-party: <https://dev.to/thiago_alvarez_a7561753aa/resend-vs-sendgrid-2026-sendgrid-killed-its-free-tier-now-what-2gh4>] — **UNVERIFIED** |                                                                                                                                                                                   |

⚠️ **The $0.10/1K figure for SES circulating in 2026 blog posts is stale** — AWS's own page shows plan-based pricing starting at **$0.16 per 1,000**.

**Plain SMTP from your own VPS is not viable.** Ghost's docs state it flatly: _"sending a bulk email to many recipients using basic SMTP will result in your IP address being instantly blacklisted and marked as spam by all mail providers"_ and _"You should never send bulk mail using basic SMTP."_ <https://docs.ghost.org/faq/mailgun-newsletters/>

**Deliverability — Google sender guidelines, effective 2024-02-01, still current** <https://support.google.com/a/answer/81126>:

- **All senders to Gmail personal accounts:** SPF **or** DKIM; valid forward and reverse DNS (PTR); TLS for transmission; spam rate **below 0.3%** in Postmaster Tools; RFC 5322 compliance; no impersonating Gmail `From:` headers.
- **Bulk senders (≥5,000 messages/day) additionally:** SPF **and** DKIM **and** DMARC (`p=none` acceptable); **DMARC alignment** — the `From:` domain must align with the SPF or DKIM domain; **one-click unsubscribe per RFC 8058** (`List-Unsubscribe-Post: List-Unsubscribe=One-Click` plus a visible link); spam rate **below 0.10%** recommended, **never reach 0.30%**.
- Microsoft/Outlook high-volume sender rules announced for May 2025: **UNVERIFIED**.

**The "reply from your own domain" pain, concretely:**

1. Domain verification with the ESP (DKIM CNAMEs + SPF include). **Resend's free tier allows exactly 1 domain.**
2. A naive "forward the submission" implementation that puts the _visitor's_ address in `From:` **fails SPF/DMARC and gets junked**. Correct pattern: `From: forms@yourdomain.com` + `Reply-To: visitor@example.com`.
3. Replying from your mail client sends via _your mailbox provider_, so the reply path has different reputation from the notification path. Replying _in-app_ means running an **inbound** route too (SES inbound / Postmark inbound / Cloudflare Email Routing) — roughly doubling the work.
4. **Resend's 100 emails/day** is the likeliest thing to break: one notification + one auto-acknowledgement per submission halves the ceiling to **50 submissions/day**.

Hosted form backends (Formspree, Basin, Getform, Web3Forms, Formspark, Netlify Forms, Tally, Formbricks): **2026 free-tier limits UNVERIFIED**.

**Verdict: self-hosted MEDIUM / free tier MEDIUM.** The DB table and Turnstile are an afternoon; DKIM/SPF/DMARC alignment and the reply path are where days go.

### 7.3 Visitor / form-submission notifications

Every platform in scope sends an **instant email notification** on submission at whatever tier forms exist. **None offers web push to the site owner.**

**Email notification self-hosted:** same cost and mechanism as §7.2. The design decision is batching — and **digests via cron hurt on Vercel Hobby**:

> **Hobby: 100 cron jobs per project, but the minimum interval is ONCE PER DAY.** A more frequent cron expression **fails at deploy time** with `Hobby accounts are limited to daily cron jobs`. Precision is **per-hour (±59 min)** — `0 1 * * *` fires anywhere between 1:00 and 1:59. Pro gets per-minute. <https://vercel.com/docs/cron-jobs/usage-and-pricing> (`2026-07-15`)

Workaround: GitHub Actions scheduled workflows hitting a secured route.

**Web push self-hosted:** the protocol is free (see §2 of this dossier for the full technical picture). Cost is engineering. Key constraints restated from the platform docs:

- Requires a service worker, `PushManager.subscribe()`, and VAPID keys. The endpoint is a **capability URL and must be kept secret**. Baseline "widely available" since **March 2023**. <https://developer.mozilla.org/en-US/docs/Web/API/Push_API>
- **Firefox imposes a push-message quota per app**, refreshed when the user visits the site; messages that generate a visible notification are exempt. Chrome imposes no limit.
- **iOS 16.4+, home-screen web apps only**, permission on direct user interaction, server must reach `*.push.apple.com`. No Apple Developer Program membership required. <https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/>
- Serverless is fine for _sending_ (one outbound POST per subscription), but **cannot hold long-lived connections** — SSE/WebSocket "live inbox" is out on Hobby.
- Ongoing cost: `410 Gone` cleanup, VAPID rotation, per-device subscription table.

**Cheaper escape hatches (effectively free):**

- **ntfy** — self-hostable notification server, HTTP PUT/POST to phone/desktop. <https://docs.ntfy.sh/>. Free rate limits **UNVERIFIED**.
- **Telegram Bot API / Discord webhook / Slack webhook** — free, one HTTP POST, zero client-side work, real push on iOS with no PWA install. **For a solo portfolio owner this is strictly better engineering than web push.**
- **OneSignal Free** — web push unlimited sends, **max 10,000 subscribers per send**; email 10,000 free sends/month. <https://onesignal.com/pricing>
- Novu / Knock / Gotify / Pushover 2026 tiers — **UNVERIFIED**.

**Verdict: email MEDIUM self-hosted / EASY free. Web push HARD self-hosted / MEDIUM free** — iOS users silently receive nothing unless they install the PWA.

### 7.4 Image optimisation / CDN

**Hosted:** Pixpa storage by tier — Basic **3 GB**, Creator **5 GB**, Professional **25 GB**, Advanced **100 GB** (<https://www.pixpa.com/pricing>). Framer bandwidth 50 GB (Free/Basic) → 100 GB (Pro), expandable to 2 TB. Webflow 1 GB (Starter) → 2.5 TB (Premium) [3rd-party: Memberstack]. Format Basic $120/yr → Pro Plus $312/yr [3rd-party: <https://help.format.com/hc/en-us/articles/40988178214035-Format-Portfolio-plans-and-add-ons>].

**`next/image` on Vercel** — <https://vercel.com/docs/image-optimization/limits-and-pricing> (`last_updated: 2026-02-23`):

| Metric                | Hobby included    | On-demand rate             |
| --------------------- | ----------------- | -------------------------- |
| Image transformations | **5,000/month**   | **$0.05 – $0.0812 per 1K** |
| Image cache reads     | **300,000/month** | $0.40 – $0.64 per 1M       |
| Image cache writes    | **100,000/month** | $4.00 – $6.40 per 1M       |

- A transformation is billed **on every cache MISS and STALE**.
- **On exceeding the Hobby cap, new images fail to optimize and return HTTP 402**, which fires `onError` and **renders the `alt` text instead of the image**. Cached images keep working. You are never billed.
- Hard limits: transformed image max **10 MB**; source max **8192 px** each dimension; source must be JPEG/PNG/WebP/AVIF or it is served as-is.
- ⚠️ **5,000 transformations is small for a photo portfolio.** With `deviceSizes` defaulting to 8 widths and `formats` producing both AVIF and WebP, **a single hero image can consume ~16 transformations**; ~300 distinct images at full responsive coverage exhausts the month.

**Self-hosted `next/image` gotchas** — <https://nextjs.org/docs/app/guides/self-hosting> (`2026-04-30`) and <https://nextjs.org/docs/app/api-reference/components/image> (v16.3.0):

- Works with **zero configuration under `next start`** — sharp is used automatically, no separate service.
- **"On glibc-based Linux, Image Optimization may require additional configuration to prevent excessive memory usage"** — the classic sharp/jemalloc `MALLOC_ARENA_MAX` OOM in containers. Stated verbatim in the self-hosting guide.
- **`qualities` is REQUIRED starting Next.js 16**, defaulting to `[75]`: _"This field is required starting with Next.js 16 because unrestricted access could allow malicious actors to optimize more qualities than you intended."_ `<Image quality={90}>` now fails unless 90 is allowlisted.
- **`minimumCacheTTL` default is 14400 (4 hours)**; effective max-age is `max(minimumCacheTTL, upstream Cache-Control)`.
- ⚠️ **"There is no mechanism to invalidate the cache at this time"** — to bust it you must change `src` or delete `<distDir>/cache/images`. **For a user-editable builder where someone re-uploads a photo to the same path this is a real correctness bug** → content-hash uploaded filenames.
- **`maximumDiskCacheSize`** (v16.1.7): if unset, Next.js checks free disk once at startup and **uses 50% of it**, LRU-evicting. On a small VPS this quietly eats the disk.
- **`maximumResponseBody`** (v16.1.2): source images fetched up to **50 MB**; reduce to ~5 MB on memory-constrained servers.
- **`maximumRedirects` defaults to 3** (v16.0.0), and **redirects from an allowed `remotePatterns` host are followed without re-validating `remotePatterns` on the target** — SSRF-adjacent for a multi-tenant builder with user-supplied image URLs. Set `maximumRedirects: 0`.
- **A CDN/reverse proxy in front of self-hosted Next.js MUST forward the `Accept` header**, or AVIF/WebP negotiation breaks.
- Both AVIF and WebP versions are stored separately — multi-format costs disk.
- Keep `dangerouslyAllowSVG` off; if on, set `contentDispositionType: 'attachment'` (default since v15) and a CSP.
- The image/ISR disk cache is **per-instance and non-persistent on ephemeral compute**; multi-instance needs a custom `cacheHandler`.

**Third-party optimisers:**

| Option                                                                 | 2026 pricing                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare Images (transformations only, images on your origin/R2)** | **Free: up to 5,000 unique transformations/month.** Beyond that new transformations error; cached ones keep serving. Paid: first 5,000 included + **$0.50 per 1,000 unique transformations**. A unique transformation counts **once per month** regardless of repeat requests. <https://developers.cloudflare.com/images/pricing/> |
| **Cloudflare Images (stored)**                                         | **$5 per 100,000 stored/month** + **$1 per 100,000 delivered/month**                                                                                                                                                                                                                                                               |
| **Cloudinary Free**                                                    | **25 credits/month**; 1 credit = 1,000 transformations OR 1 GB storage OR 1 GB video bandwidth. Plus **$99/mo ($89 yearly)** for 225 credits. <https://cloudinary.com/pricing>                                                                                                                                                     |
| **imgproxy**                                                           | OSS edition free; **Pro $49/month or $499/year**. Docker + Linux packages. <https://imgproxy.net/>                                                                                                                                                                                                                                 |
| **Thumbor**                                                            | MIT — **UNVERIFIED**                                                                                                                                                                                                                                                                                                               |

> **Useful coincidence:** Cloudflare Images' free transformation allowance (5,000/mo) equals Vercel Hobby's. Using Cloudflare via a custom `loaderFile` effectively **doubles** the free transformation budget to 10,000/mo, and Cloudflare counts a repeat transformation only **once per month**, which is materially more generous.

**Verdict: self-hosted MEDIUM / free tier MEDIUM-HARD.** `next start` gives sharp for free, but glibc memory tuning, the **un-invalidatable image cache**, `maximumDiskCacheSize` taking half the disk and the `Accept`-header proxy requirement are four separate production-only traps. 5,000 transformations/month is the tightest genuine limit in this dossier for an image-first product, and blowing it degrades to **alt text** — a visibly broken site.

### 7.5 Password-protected pages

**Hosted:**

- **Framer — password protection on ALL plans, including Free.** <https://www.framer.com/pricing/> Best in class.
- **Pixpa — on all four plans**, plus per-album protection with a separate **Download PIN** for client galleries. <https://www.pixpa.com/pricing>
- **Webflow — not on Starter (free); from Basic ($15/mo yearly).** [3rd-party: Memberstack]
- **Squarespace** — supports **site-wide and page passwords** with a customisable lock screen. Exact plan gating **UNVERIFIED** (help articles 404'd).
- **Format** — password-protected client proofing galleries are core. Per-plan detail **UNVERIFIED** (help desk 403'd).

**Self-hosted, Next.js 16 specifics.** `middleware.ts` is deprecated and renamed to **`proxy.ts`**; codemod `npx @next/codemod@canary middleware-to-proxy .`. Proxy **defaults to the Node.js runtime in v16**, and setting the `runtime` config option **throws an error**. <https://nextjs.org/docs/app/api-reference/file-conventions/proxy> (`2026-08-04`)

⚠️ **Four documented ways to be silently insecure, all quoted from that page:**

1. **"Without a `matcher`, Proxy runs on every request"** including `_next/static`, `_next/image`, `public/`. _"Consider using a negative match pattern to exclude these paths, otherwise auth logic or redirects can unintentionally block CSS, JS, or images from loading."_
2. **"Even when `_next/data` is excluded in a negative matcher pattern, proxy will still be invoked for `_next/data` routes. This is intentional behavior to prevent accidental security issues where you might protect a page but forget to protect the corresponding data route."**
3. **"Server Functions are not separate routes… A Proxy matcher that excludes a path will also skip Server Function calls on that path. A matcher change or a refactor that moves a Server Function to a different route can silently remove Proxy coverage. Always verify authentication and authorization inside each Server Function rather than relying on Proxy alone."**
4. Proxy is **not supported on static export**.

**Caching pitfall — the one people get wrong.** Next.js sets `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` on **dynamically rendered** pages and `public` on **fully prerendered static** pages (<https://nextjs.org/docs/app/guides/self-hosting>). **A password-gated page that is statically prerendered will be cached publicly by the CDN and served to unauthenticated visitors.** The gate must force dynamic rendering (read `cookies()`/`headers()`) or be enforced at the proxy layer _before_ the cache. Proxy runs before routes render and _"may in optimized cases be deployed to your CDN"_ — the right layer, but also why you _"should not attempt relying on shared modules or globals"_ inside it (no connection pooling; verify a signed cookie rather than hitting the DB).

**Vercel's own Password Protection is not available at any reasonable price.** It is _"Available on the Enterprise plan, or as a paid add-on for Pro plans"_ via **Advanced Deployment Protection at $150/month**. Hobby gets only **Vercel Authentication with Standard Protection**, which protects preview/deployment URLs and leaves **the production domain publicly accessible**. <https://vercel.com/docs/deployment-protection> (`2026-07-30`)

**Verdict: self-hosted MEDIUM / free tier MEDIUM.** The happy path is ~50 lines, but the matcher / `_next/data` / Server-Function / static-caching quartet means a naive implementation is _silently insecure_ rather than broken — the worst failure mode. This is the highest-risk-per-line-of-code feature in the list.

### 7.6 Custom domains

| Platform            | Gating                                                                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Carrd**           | Not on Free, **and not on Pro Lite ($9/yr)**. Requires **Pro Standard $19/yr**. Pro Plus $49/yr = up to 25 sites each with a domain. Annual-only. [3rd-party: <https://linke.ro/blog/carrd-pricing-2026>] |
| **Framer**          | Not on Free. Requires Basic **$10/mo ($120/yr)**. <https://www.framer.com/pricing/>                                                                                                                       |
| **Webflow**         | Not on Starter. Requires Basic **$15/mo yearly**. [3rd-party: Memberstack]                                                                                                                                |
| **Squarespace**     | All plans; _"If you purchase an annual plan, you'll receive a free custom domain for one year"_. <https://www.squarespace.com/pricing>                                                                    |
| **Wix**             | All paid plans; free domain year 1. [3rd-party: craftybase]                                                                                                                                               |
| **Pixpa**           | All plans; **free domain year 1 on Creator and above** (not Basic). <https://www.pixpa.com/pricing>                                                                                                       |
| **Format**          | Domain hosting **$30/yr or $75 for three years**; waived year 1 on Pro / Pro Plus Yearly. [3rd-party: Format help desk]                                                                                   |
| **Ghost(Pro)**      | Free custom domain from Starter ($18/mo yearly). <https://ghost.org/pricing/>                                                                                                                             |
| **Adobe Portfolio** | Supported on all CC plans; **domain not included**; **one domain per site, up to five sites**; automatic SSL; **site goes offline when the CC subscription lapses**. **UNVERIFIED**                       |

**Vercel free tier in 2026 — yes, and generously:** _"Hobby teams have a limit of **50 custom domains per project**."_ <https://vercel.com/docs/domains/working-with-domains/add-a-domain> (`2026-02-27`); the Hobby plan table confirms **Domains per project: 50** vs Unlimited on Pro (<https://vercel.com/docs/plans/hobby>, `2026-06-16`). TLS automatic and free.

🚨 **But read the fair-use clause first** — <https://vercel.com/docs/limits/fair-use-guidelines> (`2026-07-29`):

> _"**Hobby teams** are restricted to non-commercial personal use only. All commercial usage of the platform requires either a Pro or Enterprise plan. Commercial usage is defined as any Deployment that is used for the purpose of financial gain of **anyone** involved in **any part of the production** of the project, including a paid employee or consultant writing the code."_

Explicitly listed as commercial: **"Advertising the sale of a product or service"**, **"Receiving payment to create, update, or host the site"**, affiliate linking as a primary purpose, any ads including AdSense — and a callout that **"Asking for Donations fall under commercial usage."** Hobby fair-use guidelines are also modest: **Fast Data Transfer up to 100 GB/mo, Fast Origin Transfer up to 10 GB/mo**.

**This is the single most consequential finding for a portfolio builder.** A freelance designer's portfolio saying "Hire me" is, on a plain reading, advertising the sale of a service. Hobby is safe for a personal/hobby portfolio; it is **not** a defensible default for a freelancer-facing product.

**Self-hosted DNS + TLS:** Caddy serves everything over HTTPS by default using **Let's Encrypt as primary CA with ZeroSSL as automatic fallback**, retrying with exponential backoff up to 1-day intervals for up to 30 days. <https://caddyserver.com/docs/automatic-https>

**Let's Encrypt rate limits** (page last updated **5 August 2026**) — <https://letsencrypt.org/docs/rate-limits/>:

- **50 certificates per registered domain** (or IPv4 address, or IPv6 /64) **every 7 days**
- **5 duplicate certificates** per identical identifier set every 7 days
- **300 new orders per account every 3 hours**
- **5 authorization failures per identifier per account per hour**; account suspension after **1,152 consecutive** failures
- **10 accounts per IP every 3 hours**
- 2026 addition: IP addresses can be certificate subjects (IPv6 /64 treated as the registered domain)

**Multi-tenant wildcard domains — three ascending problems:**

1. **Wildcard subdomains (`*.yourbuilder.app`).** On Vercel: _"If using your custom domain as a wildcard domain, you **must use the nameservers method for verification**"_ — you hand all DNS for that apex to Vercel and must re-create every MX/TXT record. Self-hosted, wildcards require the **DNS-01 challenge**, so Caddy needs a DNS-provider plugin with API credentials.
2. **Per-user _apex_ domains (`janedoe.com` → your platform).** A wildcard cert cannot cover these. Self-hosted the answer is **Caddy On-Demand TLS**, obtaining certificates **during the initial TLS handshake** for domains not known in advance. It **mandates an "ask" endpoint** — Caddy HTTP-GETs your backend to confirm the domain belongs to a real customer before issuing. Without it you are an open cert-issuance relay.
3. **Rate-limit math.** 50 certs/registered-domain/7 days is irrelevant for distinct customer apexes, but **5 duplicate certs per identifier per 7 days** bites during a container restart loop, so **certificate storage must be persistent and shared** across instances — not baked into ephemeral containers.

**Verdict: EASY single-tenant / HARD multi-tenant, both self-hosted and free.** Caddy makes one domain a non-event. On-demand TLS + ask endpoint + persistent cert storage + DNS-01 credentials is a real subsystem. Vercel Hobby genuinely gives 50 domains with free TLS, but the non-commercial restriction (donations included) rules it out as a default for users who sell anything.

### 7.7 Backups / export

**This is consistently the worst feature across hosted platforms.**

**Squarespace** is the best-documented case — <https://support.squarespace.com/hc/en-us/articles/206566687-Exporting-your-site>. You get **one `.xml` in WordPress import format** containing layout pages, **one** blog page with posts and up to 1,000 comments each, text blocks, image blocks, text from embed/Instagram blocks, and gallery pages.

**Not exportable:** album pages, cover pages, index pages, info pages, calendar pages, **portfolio pages**, store/product pages, audio blocks, product blocks, video blocks, dropdowns, draft posts, style settings, **custom CSS**, page-specific headers/footers/sidebars, and **more than one blog page**.

Two killer caveats stated by Squarespace directly:

> _"It's not possible to export content from one Squarespace site and import it into another."_

and WordPress _"may only pull reference links for the images"_, which **break when your Squarespace site is deactivated**.

**For a portfolio product specifically: portfolio pages, album pages and product pages — the actual content — are on the "cannot export" list.**

- **Webflow** — code export is **Premium-only ($25/mo yearly)**; Starter and Basic cannot export at all. [3rd-party: Memberstack]. What it omits: **UNVERIFIED** (help article 403'd).
- **Wix** — no site/code export. **UNVERIFIED** (support article 404'd).
- **Ghost** — full **JSON export** of content and members, and the whole thing is open source and self-hostable. <https://ghost.org/pricing/>
- **GoatCounter** as a positive counter-example: _"you can always export all data and cancel at any time."_
- **Adobe Portfolio** — content isn't deleted when CC lapses, but the site goes offline within a grace period. **UNVERIFIED**.

**Free-tier managed-database backups are worse than most people assume:**

| DB                | Free-tier backup reality                                                                                                                                                                                        | Paid                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Supabase Free** | **No automatic backups.** Plus: 500 MB database, 1 GB file storage, 5 GB egress, 50,000 MAUs, 500,000 edge function invocations, **projects paused after 1 week of inactivity**. <https://supabase.com/pricing> | Pro **$25/mo** → **7 days** of daily backups. PITR add-on **$100/month per 7 days** of retention.       |
| **Neon Free**     | **Point-in-time restore: 6 hours, 1 GB limit.** Plus 0.5 GB storage/project, 100 CU-hours/project, 100 projects, 10 branches/project, 5 GB egress. <https://neon.com/pricing>                                   | Launch: history window **up to 7 days**, $0.106/CU-hour, $0.35/GB-mo storage. Scale: **up to 30 days**. |

> **On a strictly free tier, users' portfolio data has effectively no vendor-provided safety net.** Supabase Free has none; Neon Free gives six hours. A dropped table at 9am is unrecoverable by 4pm.

**The self-hosted answer is genuinely easy:** `pg_dump -Fc` → gzip → **Cloudflare R2 (10 GB-month free, egress free)**. A portfolio DB is megabytes; months of daily dumps fit inside the free tier. For SQLite, `VACUUM INTO` or Litestream/LiteFS streaming to R2/S3 (2026 status **UNVERIFIED**). Scheduling on Hobby is capped at **once per day, ±59 min** — adequate for a daily dump; hourly needs Pro or GitHub Actions.

**User-facing export is the differentiating feature.** Because you own the schema, a "download my entire site as JSON + a zip of original images" button is roughly a day of work — and it is precisely the thing Squarespace and Wix structurally will not give their users.

**Verdict: self-hosted EASY / free tier MEDIUM.** Tooling is free; the gap is that Supabase Free has zero automatic backups and Neon Free has a 6-hour window, so the backup job is yours to build. Hobby cron's daily floor caps RPO at 24 hours.

### 7.8 SEO previews + social share previews (Open Graph)

**Hosted:** SEO title/description/slug editing and an OG image picker on essentially every paid tier. Squarespace advertises "SEO tools" and "Search keyword analysis for SEO" across plans; Webflow's 2026 Premium adds "AI-powered SEO and AEO" [3rd-party: Memberstack]. **None auto-generates a templated OG card from content the way `ImageResponse` does** — a genuine differentiator.

**Next.js 16:** `generateMetadata` for per-route titles, descriptions, canonicals and `openGraph`/`twitter` objects.

**Static OG images** — drop `opengraph-image.(jpg|jpeg|png|gif)` / `twitter-image.*` into any route segment; Next.js emits `og:image`, `og:image:type`, `og:image:width`, `og:image:height` automatically, plus `opengraph-image.alt.txt` for alt text. Verbatim limits:

> _"The `twitter-image` file size must not exceed **5MB**, and the `opengraph-image` file size must not exceed **8MB**. If the image file size exceeds these limits, **the build will fail**."_

<https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image> (v16.3.0, `lastUpdated 2026-07-09`)

**Generated OG images** — `opengraph-image.tsx` default-exporting a function returning `new ImageResponse(...)` from `next/og`. **Statically optimized (generated at build time and cached) by default** unless they use request-time APIs or uncached data. `generateImageMetadata` produces multiple images from one file. **In v16.0.0 `params` became a Promise** — must be `await`ed.

**`ImageResponse` constraints that will bite** — <https://nextjs.org/docs/app/api-reference/functions/image-response> (v16.3.0, `lastUpdated 2026-08-06`):

- Pipeline is **@vercel/og → Satori → Resvg → PNG**.
- **"Only flexbox and a subset of CSS properties are supported. Advanced layouts (e.g. `display: grid`) will not work."**
- **"Maximum bundle size of `500KB`. The bundle size includes your JSX, CSS, fonts, images, and any other assets."** A single full-weight variable font blows this instantly — subset or fetch at runtime.
- **"Only `ttf`, `otf`, and `woff` font formats are supported"** — **`woff2` is NOT supported**.
- Defaults `width: 1200, height: 630`. `emoji`: `twemoji` (default) / `blobmoji` / `noto` / `openmoji`.
- Local assets: read once at module scope with `readFile`, pass as base64 data URI or `ArrayBuffer` (the latter needs `@ts-expect-error`).
- Debug at <https://og-playground.vercel.app/>.
- **Cost note:** an `opengraph-image.tsx` reading request-time data becomes a dynamic route handler, so each crawler hit is a function invocation. It renders through the _function_ path, **not** the Image Optimization path — so it does **not** consume the 5,000 image transformations.

**Verdict: self-hosted EASY / free tier EASY.** First-party framework functionality, no external dependency, identical under `next start` and Docker. Only real risks are the 500 KB bundle cap and the build-failing 8 MB / 5 MB static-file limits.

### 7.9 RSS feeds

**Hosted:** Ghost native and central. Squarespace blog pages expose RSS natively (**UNVERIFIED**). Webflow/Wix blog RSS available (**UNVERIFIED**). Framer/Carrd/Adobe Portfolio have no meaningful native RSS story (**UNVERIFIED**). Practical read: RSS is free-with-the-blog on publishing platforms and absent on design-oriented ones — **cheap differentiation against Framer and Carrd.**

**Next.js App Router** — the Next.js docs use an RSS feed as their **canonical example of a non-UI Route Handler response**:

```ts
// app/rss.xml/route.ts
export async function GET() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Next.js Documentation</title>
  <link>https://nextjs.org/docs</link>
  <description>The React Framework for the Web</description>
</channel>
</rss>`,
    { headers: { 'Content-Type': 'text/xml' } }
  );
}
```

<https://nextjs.org/docs/app/api-reference/file-conventions/route> (v16.3.0, `lastUpdated 2026-04-30`)

Notes:

- **`GET` handlers default to _dynamic_ since v15.0.0-RC** (changed from static). For a feed you want caching — `export const revalidate = 3600` or Cache Components.
- The same page notes `sitemap.xml`, `robots.txt`, app icons and OG images all have **built-in support** — pair the feed with `app/sitemap.ts` and `app/robots.ts`.
- Escape `&`, `<`, `>` or use `CDATA`; **one unescaped ampersand in a user-entered project title breaks the entire feed.** Use `feed`/`rss` rather than string templates for a multi-tenant builder.
- Multi-tenant: `app/[site]/rss.xml/route.ts` with `generateStaticParams`.

**Verdict: self-hosted EASY / free tier EASY.**

### 7.10 Newsletter

**Ghost is the only platform in this set with a real built-in newsletter** — <https://ghost.org/pricing/> (Ghost(Pro), billed yearly):

| Plan      | $/mo (yearly) | Members   | Staff     | Newsletters               | Custom themes | Paid subs |
| --------- | ------------- | --------- | --------- | ------------------------- | ------------- | --------- |
| Starter   | **$18**       | 1,000     | 1         | included, unlimited sends | **No**        | No        |
| Publisher | **$29**       | 1,000     | 3         | 3 newsletters             | Yes           | Yes       |
| Business  | **$199**      | 10,000    | 15        | 10 newsletters            | Yes           | Yes       |
| Custom    | quote         | Unlimited | Unlimited | Unlimited                 | Yes           | Yes       |

The software is free to self-host. Others (Squarespace Email Campaigns, Wix email marketing) sell it separately; Webflow/Framer/Carrd/Format/Pixpa/Adobe Portfolio expect a Mailchimp/ConvertKit bolt-on.

**The trap, documented by Ghost better than anyone** — <https://docs.ghost.org/faq/mailgun-newsletters/>:

> _"Sending a bulk email to many recipients using basic SMTP will result in your IP address being instantly blacklisted and marked as spam by all mail providers."_
> _**"You should never send bulk mail using basic SMTP, which is why Ghost does not support it."**_
> _"Currently the only bulk mail API we support is Mailgun… We're a small team with limited resources, and supporting multiple bulk-mail APIs is too much overhead."_

**Even the flagship open-source publishing platform, with a full-time team, refuses to implement bulk SMTP and hard-couples to one vendor.** That is the strongest available signal about how hard newsletters actually are.

| Option                        | 2026 terms                                                                                                                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Listmonk** (self-hosted)    | **AGPLv3**, single binary + **PostgreSQL**, official Docker image. **Single and double opt-in lists**, SQL-expression segmentation, campaign/bounce/link analytics, **multi-threaded multi-SMTP queues**, transactional API, messenger webhooks. **Free.** <https://listmonk.app/>   |
| **Buttondown**                | **Free for your first 100 subscribers**, **"at most one email a day to your entire subscriber base"**. Add-ons **$9 / $29 / $79 per month** ($9 = tagging, segmentation, paid subs, analytics, **RSS-to-email**). Billed on **active** subscribers. <https://buttondown.com/pricing> |
| **Mailchimp Free**            | **250 contacts max**; **500 sends/month or 250/day, whichever is lower**; _"Sending will be paused if contact or email send limit is exceeded"_. Essentials from $13/mo. <https://mailchimp.com/pricing/marketing/>                                                                  |
| **Resend Marketing**          | Billed by **contacts**, not sends: **$0 for 1,000 contacts** → $650/mo for 150,000. _"Marketing plans are not limited by the number of emails sent — only by the number of contacts."_ <https://resend.com/pricing>                                                                  |
| **Amazon SES** under Listmonk | **$0.16/1K** (Essentials 0–10M); new AWS customers up to **$200 Free Tier credits**, free plan for **6 months**.                                                                                                                                                                     |
| **Substack**                  | Free to publish; takes a percentage of paid subs (commonly cited 10%) plus Stripe fees — **UNVERIFIED**, pricing page 404'd.                                                                                                                                                         |

> **Note the shape of the constraint.** Resend Marketing's free tier is **1,000 contacts with unlimited sends** — dramatically better for a newsletter than Mailchimp's 250 contacts / 500 sends. **Listmonk (free, AGPLv3, your Postgres) + SES ($0.16/1K)** is the cheapest credible self-hosted stack: 1,000 subscribers × 4 sends/month = 4,000 emails = **$0.64/month**.

**Double opt-in + unsubscribe compliance — honestly, how hard.** The _software_ is easy: Listmonk ships both; rolling your own is a `subscribers` table with `status`, a signed confirmation token with TTL, and a one-click unsubscribe route keyed by an HMAC. The _compliance and deliverability_ side is the work:

1. **RFC 8058 one-click unsubscribe is mandatory at 5,000+/day to Gmail personal accounts** — `List-Unsubscribe-Post: List-Unsubscribe=One-Click` **and** a `List-Unsubscribe` header **and** a visible in-body link, and the POST endpoint must unsubscribe **without further confirmation**. <https://support.google.com/a/answer/81126>
2. **SPF + DKIM + DMARC with From-domain alignment** required at bulk volume; complaints **below 0.10% recommended, never reaching 0.30%**.
3. A separate sending subdomain (`news.yourdomain.com`) to isolate marketing from transactional reputation — doubles the DNS setup.
4. **CAN-SPAM** additionally requires accurate headers/subject lines, identification as an ad where applicable, a **valid physical postal address in every commercial email**, and honouring opt-outs **within 10 business days**. The FTC guidance page returned **HTTP 403** to automated fetch → **the current maximum civil penalty per violation is UNVERIFIED**; get a legal check before publishing a figure in product docs.
5. **The physical-address requirement is a product problem, not an engineering one** — you must collect and store a postal address from any user who wants to send a newsletter, or ship a non-compliant feature.
6. **Warm-up.** A brand-new domain/IP sending its first 1,000-recipient blast will be filtered regardless of correct DNS. Unfixable by code.

**Verdict: self-hosted HARD / free tier HARD.** Not because Listmonk is hard to install, but because you inherit sender reputation, DMARC alignment, RFC 8058, bounce/complaint processing, warm-up and CAN-SPAM's postal address. Free _software_ is abundant; free _sending at newsletter volume with acceptable deliverability_ is not — Resend free = 100/day, Mailchimp free = 250 contacts / 500 sends/month, Postmark free = 100/month.

### 7.11 Cross-cutting findings

1. **Vercel Hobby's non-commercial clause is the biggest strategic constraint.** "Advertising the sale of a product or service" and even **asking for donations** count as commercial usage requiring Pro. A self-hosted VPS path (Caddy + Docker + Postgres) is not just nice-to-have — for a freelancer-facing portfolio builder it is the _compliant_ default.
2. **Two Hobby limits bind before all others:** **5,000 image transformations/month** (degrades to alt text at HTTP 402) and **cron restricted to once per day, ±59 min**.
3. **Three features are essentially free wins:** RSS (§7.9), OG image generation (§7.8), and full data export (§7.7) — the last is the one hosted platforms structurally _cannot_ match, since Squarespace won't even export portfolio pages or custom CSS.
4. **Two features are worth scoping down in v1:** web push (a Telegram/Discord webhook gives an owner real iOS push for $0 and ~10 lines) and newsletter (integrate Buttondown/Resend Marketing rather than becoming a sender).
5. **The password gate is the highest-risk-per-line-of-code feature**, because Next.js 16's `proxy.ts` has four documented ways to be silently insecure.

---

## 8. Accessibility on mobile — exact criteria and thresholds

All normative text quoted from the W3C _Understanding WCAG 2.2_ documents at <https://www.w3.org/WAI/WCAG22/Understanding/>.

### 8.1 SC 2.5.8 Target Size (Minimum) — **Level AA** — 24 × 24 CSS px

> "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:"

Five exceptions, verbatim-summarised:

1. **Spacing** — undersized targets are positioned so that a **24 CSS pixel diameter circle** centred on each bounding box does not intersect another target, or the circle of another undersized target.
2. **Equivalent** — the function is achievable through a different control on the same page that meets the criterion.
3. **Inline** — the target is in a sentence, or its size is constrained by the line-height of non-target text.
4. **User Agent Control** — the size is determined by the user agent and not modified by the author.
5. **Essential** — a particular presentation is essential, or legally required.

<https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>

### 8.2 SC 2.5.5 Target Size (Enhanced) — **Level AAA** — 44 × 44 CSS px

> "The size of the target for pointer inputs is at least 44 by 44 CSS pixels except when:
>
> - Equivalent: The target is available through an equivalent link or control on the same page that is at least 44 by 44 CSS pixels;
> - Inline: The target is in a sentence or block of text;
> - User Agent Control: The size of the target is determined by the user agent and is not modified by the author;
> - Essential: A particular presentation of the target is essential to the information being conveyed."

<https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html>

### 8.3 SC 1.4.10 Reflow — **Level AA** — 320 CSS px / 256 CSS px

> "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for:
> Vertical scrolling content at a width equivalent to **320 CSS pixels**;
> Horizontal scrolling content at a height equivalent to **256 CSS pixels**.
> Except for parts of the content which require two-dimensional layout for usage or meaning."

> "320 CSS pixels is equivalent to a starting viewport width of 1280 CSS pixels wide at 400% zoom."

Acknowledged exceptions include images needed for understanding, maps, diagrams, video, games, presentations, data tables, and interfaces requiring persistent toolbars.

<https://www.w3.org/WAI/WCAG22/Understanding/reflow.html>

### 8.4 SC 1.4.4 Resize Text — **Level AA** — 200%

> "Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality."

Related failure techniques: **F69** (resizing to 200% causes clipping/truncation/obscuring), **F80** (text-based form controls don't resize), **F94** (incorrect use of viewport units to resize text). Related ACT test rule: **"Meta viewport allows for zoom."**

<https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html>

See §5A.4 — MDN's viewport warning ties `user-scalable=no` directly to this criterion, noting WCAG requires ≥ 2× and best practice is 5×.

### 8.5 SC 1.3.4 Orientation — **Level AA**

> "Content does not restrict its view and operation to a single display orientation, such as portrait or landscape, unless a specific display orientation is essential."

Essential examples given: bank cheque deposit capture, a piano app, projector slides, VR content.

<https://www.w3.org/WAI/WCAG22/Understanding/orientation.html>

**Direct implication for the manifest:** setting `orientation: "portrait"` in `manifest.json` locks an installed PWA to portrait and therefore engages this criterion.

### 8.6 SC 2.5.7 Dragging Movements — **Level AA** (new in WCAG 2.2)

> "All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author."

Exceptions: dragging is essential; functionality is UA-determined; UA-provided scrolling/dragging; CSS overflow scrolling. Understanding doc updated **2026-07-26**.

<https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html>

### 8.7 SC 2.5.1 Pointer Gestures — **Level A**

> "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture, unless a multipoint or path-based gesture is essential."

- **Path-based**: pointer movement along a specific path matters — swiping, tracing a shape, following a direction.
- **Multipoint**: two or more simultaneous pointers — pinch/spread zoom, split taps, multi-finger swipes.

<https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html>

→ A swipe-to-delete row or a pinch-to-zoom canvas needs a single-pointer equivalent.

### 8.8 SC 1.4.12 Text Spacing — **Level AA**

The four thresholds, verbatim:

1. "Line height (line spacing) to at least **1.5 times** the font size"
2. "Spacing following paragraphs to at least **2 times** the font size"
3. "Letter spacing (tracking) to at least **0.12 times** the font size"
4. "Word spacing to at least **0.16 times** the font size"

<https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html>

### 8.9 SC 2.5.4 Motion Actuation — Level A

Listed for completeness. Normative text **not fetched in this pass** — treat as **UNVERIFIED** until read. Relevant if any shake-to-undo or tilt gesture is added. <https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html>

### 8.10 W3C's mobile-specific guidance is still incomplete

_Guidance on Applying WCAG 2.2 to Mobile Applications (WCAG2Mobile)_ — **W3C Group Draft Note, 06 May 2025** — <https://www.w3.org/TR/wcag2mobile-22/>

Informative (non-normative). Coverage as of that draft:

- **1.3.4 Orientation** — has guidance: _"It is considered a best practice to support all available orientations, such as portrait, portrait (reversed), landscape, and landscape (reversed)."_
- **1.4.4 Resize Text** — placeholder, "Work In Progress"
- **1.4.10 Reflow** — placeholder, "Work In Progress"
- **2.5.1 Pointer Gestures**, **2.5.4 Motion Actuation**, **2.5.7 Dragging Movements**, **2.5.8 Target Size (Minimum)** — **not yet included**; the note states guidance for these _"will be added at a later stage."_

Landing page: <https://www.w3.org/WAI/standards-guidelines/mobile/> — W3C has no separate mobile standard; mobile accessibility is handled inside WCAG.

---

## Appendix A — Source index

**Specifications / standards bodies**

- W3C Understanding WCAG 2.2 — <https://www.w3.org/WAI/WCAG22/Understanding/>
- WCAG2Mobile (Group Draft Note, 2025-05-06) — <https://www.w3.org/TR/wcag2mobile-22/>
- W3C WAI mobile landing — <https://www.w3.org/WAI/standards-guidelines/mobile/>
- Web Push Protocol — <https://tools.ietf.org/html/draft-ietf-webpush-protocol>
- Message Encryption for Web Push — <https://tools.ietf.org/html/draft-ietf-webpush-encryption>
- VAPID — <https://datatracker.ietf.org/doc/html/draft-thomson-webpush-vapid>

**Apple / WebKit**

- WebKit Features in Safari 26.0 (2025-09-15) — <https://webkit.org/blog/17333/webkit-features-in-safari-26-0/>
- News from WWDC25: WebKit in Safari 26 beta — <https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/>
- Meet Declarative Web Push — <https://webkit.org/blog/16535/meet-declarative-web-push/>
- WebKit Features in Safari 18.4 — <https://webkit.org/blog/16574/webkit-features-in-safari-18-4/>
- Web Push for Web Apps on iOS and iPadOS (2023-02-16) — <https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/>
- Full Third-Party Cookie Blocking and More (2020) — <https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/>
- Apple Developer: DMA and apps in the EU — <https://developer.apple.com/support/dma-and-apps-in-the-eu/>
- WWDC25 session 235, Declarative Web Push — <https://developer.apple.com/videos/play/wwdc2025/235/>

**Google / Chrome**

- Revisiting Chrome's installability criteria (2023-12-05) — <https://developer.chrome.com/blog/update-install-criteria>
- Automatic notification permission revocation (2025-10-10) — <https://blog.google/chromium/automatic-notification-permission/>
- Workbox caching strategies overview — <https://developer.chrome.com/docs/workbox/caching-strategies-overview/>
- Workbox managing fallback responses — <https://developer.chrome.com/docs/workbox/managing-fallback-responses/>
- Permissions request chip — <https://developer.chrome.com/blog/permissions-chip>
- Android accessibility: touch target size — <https://support.google.com/accessibility/android/answer/7101858>
- web.dev PWA installation (2024-09-20) — <https://web.dev/learn/pwa/installation>
- web.dev maskable icons — <https://web.dev/articles/maskable-icon>
- web.dev add a web app manifest — <https://web.dev/articles/add-manifest>
- web.dev offline UX design guidelines (2016-11-10) — <https://web.dev/articles/offline-ux-design-guidelines>
- web.dev offline cookbook (Jake Archibald, 2014-12-09) — <https://web.dev/articles/offline-cookbook>
- web.dev service worker caching and HTTP caching (2020-07-17) — <https://web.dev/articles/service-worker-caching-and-http-caching>

**Next.js / Vercel**

- PWA guide (v16.3.0, 2026-07-30) — <https://nextjs.org/docs/app/guides/progressive-web-apps>
- manifest.json file convention (2026-03-03) — <https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest>
- `useOffline` hook (2026-07-28) — <https://nextjs.org/docs/app/api-reference/functions/use-offline>
- `experimental.useOffline` config (2026-07-28) — <https://nextjs.org/docs/app/api-reference/config/next-config-js/useOffline>

**MDN**

- Making PWAs installable — <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable>
- `beforeinstallprompt` — <https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event>
- Manifest `display` — <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display>
- Manifest `icons` — <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons>
- Push API — <https://developer.mozilla.org/en-US/docs/Web/API/Push_API>
- Background Synchronization API — <https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API>
- HTML Drag and Drop API — <https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API>
- viewport meta — <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport>
- CSS `env()` — <https://developer.mozilla.org/en-US/docs/Web/CSS/env>
- CSS `<length>` (viewport units) — <https://developer.mozilla.org/en-US/docs/Web/CSS/length>
- browser-compat-data — <https://github.com/mdn/browser-compat-data>

**Packages / repos**

- `web-push` — <https://github.com/web-push-libs/web-push>
- Serwist — <https://serwist.pages.dev/docs/next> · <https://github.com/serwist/serwist>
- `next-pwa` (abandoned) — <https://github.com/shadowwalker/next-pwa>
- `@ducanh2912/next-pwa` — <https://github.com/DuCanhGH/next-pwa>
- PushForge — <https://github.com/draphy/pushforge>
- `@mmmike/web-push` — <https://www.npmjs.com/package/@mmmike/web-push>
- pwa-asset-generator — <https://github.com/SeWiLio/pwa-asset-generator>
- caniuse — <https://github.com/Fyrd/caniuse>

**Research / UX**

- Hoober, _How Do Users Really Hold Mobile Devices?_ (2013-02-18) — <https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php>
- NN/g, _Basic Patterns for Mobile Navigation_ (2015-11-15) — <https://www.nngroup.com/articles/mobile-navigation-patterns/>
- CSS-Tricks, 16px prevents iOS form zoom (2021-05-04) — <https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/>

**Sources checked and found unreliable / outdated**

- <https://www.mobiloud.com/blog/progressive-web-apps-ios> — repeats the reverted EU PWA-removal claim
- <https://webscraft.org/blog/pwa-pushspovischennya-na-ios-u-2026-scho-realno-pratsyuye?lang=en> — same
- <https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide> — not independently verified

---

## Appendix B — Open questions for follow-up

1. **Does iOS 26+ still require a `display: standalone|fullscreen` manifest for Web Push**, given "zero requirements for installability"? Needs a device test. (§1.4, §2.2)
2. **Does iOS 26 generate splash screens from the manifest**, or is `apple-touch-startup-image` still mandatory? (§1.8)
3. **`share_target` on iOS** — is an installed web app offered in the iOS share sheet? No caniuse entry exists. (§3.2)
4. **Version skew + service worker**: how `deploymentId` / `experimental.useSkewCookie` interact with a CacheFirst `/_next/static` rule. (§4.3 trap 6)
5. **Current maintenance status of PushForge and `@mmmike/web-push`** (versions, last publish). (§2.6)
6. **A primary-source case study of an offline-capable CMS admin** — none found. WordPress block editor local autosave is the closest lead and needs verification. (§4.5)
7. **Material Design bottom-sheet specifications** — pages are client-rendered; need a fetchable source for the dp values. (§5A.6)
8. **Apple HIG 44×44 pt** — needs a fetchable primary citation. (§5A.2)
9. **WCAG SC 2.5.4 Motion Actuation** normative text. (§8.9)
