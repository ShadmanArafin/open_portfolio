# Push notifications

> Free, no vendor, no new dependency. VAPID + the platform push service costs
> nothing; the signing is Node `crypto`, not a library.

## What it is

One buzz on the owner's devices when a new enquiry arrives. The inbox and
email carry the message — push is the tap on the shoulder, for the site that
is otherwise silent between visits.

## Setup (once per server)

1. Generate a VAPID pair (P-256). One line, no install:

   ```bash
   node -e "const {generateKeyPairSync}=require('node:crypto');const {publicKey,privateKey}=generateKeyPairSync('ec',{namedCurve:'P-256'});const pub=publicKey.export({format:'jwk'});const priv=privateKey.export({format:'jwk'});const raw=Buffer.concat([Buffer.from([4]),Buffer.from(pub.x,'base64url'),Buffer.from(pub.y,'base64url')]).toString('base64url');console.log('OPB_VAPID_PUBLIC_KEY='+raw+'\nOPB_VAPID_PRIVATE_KEY='+priv.d)"
   ```

2. Set three env vars and restart:

   - `OPB_VAPID_PUBLIC_KEY` — from above
   - `OPB_VAPID_PRIVATE_KEY` — from above
   - `OPB_VAPID_SUBJECT` — `mailto:you@example.com` (or your `https://` site URL)

3. In the admin inbox, after the first message arrives, press **Enable
   notifications** and allow them in the browser.

4. Press **Send test**. Devices buzz within seconds.

Without all three vars, the inbox says so plainly and email remains the
notify path. Nothing else changes.

## Rules worth knowing

- **Install first on phones.** iOS 16.4+ delivers web push only to a site
  added to the Home Screen; Chrome exempts installed sites from its
  low-engagement notification revocation. The button copy says this because
  the button alone is not enough.
- **Asked late, on purpose.** The toggle appears only once a first message
  exists — asking on install, before there is anything to notify about, is
  how permission gets denied forever.
- **Bursts arrive as one.** At most one buzz per five minutes for enquiries
  (`PUSH_MIN_INTERVAL_MS`); the worker fetches the unread count, so the
  notification names the number waiting rather than the one that triggered it.
- **Payload-less.** The server sends a wake-up with no body; the worker
  fetches the count with the owner's session cookie. Nothing sensitive
  crosses the push service, and there is no payload encryption to get wrong.
- **Dead devices clean themselves.** A 404/410 from the push service removes
  the subscription on the next send; re-enabling re-subscribes.
