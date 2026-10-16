# Agency, multi-site and team roles — evaluation (Phase D)

> Status: evaluated 2026-10-17. Decision: **post-1.0, do not build now.**
> This document is the Phase D deliverable for this item: the question is
> closed, the constraint is written down, and there is nothing to implement.

## The request

Three related asks, all from the freelancer/agency persona:

1. **Multi-site**: one install serving several portfolio sites.
2. **Agency handoff**: build a site for a client, hand over editing without
   handing over the server.
3. **Team roles**: owner / editor / viewer rather than a single owner.

## Why not now

Each one contradicts a load-bearing decision elsewhere:

- **One owner, one deployment.** The storage contract (`core/storage/contract.ts`)
  models exactly one `OwnerRecord`; sessions, passkeys, OTP and the setup claim
  all assume it. Multi-site means tenant scoping every adapter, every kv
  namespace and every route — a second product, not a feature.
- **"One owner, one deployment" is also the scope guard** in
  `site/content/docs/what-this-is-not.md`. Lifting it reopens moderation,
  billing, abuse handling and support load for a single maintainer with no
  funding ("How this is paid for: it is not").
- **Roles need a second identity.** Passkeys, the session epoch and the
  `requireOwner()` guard (`core/auth/guard.ts`, ~40 call sites) are single-owner
  by design. An editor role is a new auth model plus per-screen permission
  checks carried through every admin screen for a capability nobody
  self-hosting a portfolio has asked for.

## What to do instead (now)

- **Client handoff**: deploy one instance per client (Docker + Coolify is the
  documented path), claim it with the client's email, hand over the passphrase
  - passkey enrolment. One server, one site, zero code changes.
- **Collaboration**: the owner edits; the client reviews via expiring share
  links (one link per page, TTL-bound) rather than an editor login.
- **White-label**: the MIT licence already permits it; the product does not
  need a mode for it.

## Revisit criteria (post-1.0)

Reopen only when all three hold: (a) sustained demand from people running
client work on this, (b) a second maintainer or funding for the support load,
(c) the App Router admin rewrite has landed (roles need server-guarded routes,
not a client-side router). Until then, multi-tenancy stays a non-goal and
references to it should point here.
