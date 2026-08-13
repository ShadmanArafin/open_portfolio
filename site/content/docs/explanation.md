---
title: Why it is built this way
summary: The four decisions that shaped everything else, and what each one cost.
group: Explanation
order: 80
---

# Why it is built this way

Not how it works — that is the rest of these pages. This is why, including the parts that were reversed.

## Why a content store rather than files in the repository

A static-site generator would be simpler and is the obvious choice for a portfolio. It was rejected on one question: **can somebody non-technical change a headline on a Tuesday?** With content in the repository the answer is a pull request, and that is the point every existing open-source option stops at.

The cost is real. There is a database to run, a backup to keep and a migration story to maintain. The mitigation is that the export is one JSON file, so the _lock-in_ a database usually brings does not follow.

## Why draft and published are two snapshots

Every public render is **one** read of one key. Not a query per collection, not a join — one blob, identical on every backend, trivially cacheable.

That decides more than it looks. Adding a fifth backend costs nothing at the read path. Publishing is a single write. Previewing a draft is the same code path pointed at a different key.

What it does not scale to is a four-hundred-post blog, where the whole document is rewritten on every save. That is understood and deferred; it is not a problem a portfolio has, and building the per-record write path first would have meant designing the admin against a surface nothing needed yet.

## Why publishing exists at all

The first version of this project had a Publish button that changed nothing outside the editor's own browser. Content lived in IndexedDB, so visitors saw whatever seed data was compiled into the bundle.

That is why the snapshot channels are separate and why publishing is a server write followed by a cache invalidation. It is also why four separate bugs of the same shape appeared during the rebuild — _a browser-local copy that was authoritative before there was a server and stayed authoritative after_ — and why the admin now reads the server draft before trusting its own.

## Why unknown blocks are quarantined

Content can be written by a newer build and read by an older one: a rollback, a second machine, a restored backup. The tempting behaviour is to drop what you cannot parse. The consequence is that opening an old build and pressing save destroys everything the new one added.

So a block whose type is unknown, or whose version is newer, or whose props fail validation, is round-tripped verbatim and rendered as nothing. It costs a little complexity in the parser and removes an entire category of unrecoverable failure.

The same instinct produced the rule that a content check **advises** where a schema **refuses**. A block is added before it is filled in — that is the interaction — so "not finished" must be storable and only "not valid" may be rejected.

## Why authorization is checked in every handler

A layout guard does not protect a route handler. A handler is a public HTTP endpoint regardless of what rendered the button that normally calls it, and forgetting the check produces no error, no warning and no visible symptom — the route simply works for everybody.

So every handler calls `requireOwner()` itself, and a test walks the syntax tree of `app/api/**` and fails the build on any exported HTTP handler that does not, unless it is on an allowlist with a written reason. The allowlist is the mechanism: reviewing a one-line diff that claims "anyone may call this" is a decision somebody has to make out loud.

## Why the marketing site imports the product

The demo at `/demo/try` renders with this repository's real blocks, real theme
tokens, real content checks and real editor metadata rather than a copy. That
couples two applications that are otherwise independent, and it is worth it for
two reasons.

A reproduction drifts silently. Change a block and the imitation still looks
fine — it is just now showing a product that does not exist.

And running the real functions against seeded content **falsifies stale
prose**. Two claims repeated across the README, the help centre and the
homepage were wrong the moment the demo executed them: the dashboard's check
count varies with content rather than being sixteen, and an unreadable palette
is usually prevented by clamping at token generation rather than refused at
publish. Tests did not catch either, because neither is a behaviour anybody had
written a test about — they were sentences.

## What the tests are for, and what they are not

Six hundred and fifty-five of them, and the honest position is that **they have never once caught the bug that mattered most that week.**

A hundred and fifty-three passed while every block page returned HTTP 500 — they all checked block data and none rendered anything. Five hundred and eighty-four passed while `docker compose up` could not get past setup, because every one of them ran with `OPB_DATA_DIR` unset. The suite is a ratchet against regression, not evidence that the product works. That evidence comes from running it.

Which is why the ones that pay for themselves are the mechanical ones: the syntax-tree walk over route handlers, the conformance suite run against a real database, the check that no field path can write somewhere its schema rejects, the grep of the client bundle for secret values. Each of those encodes a rule that a person cannot be relied on to remember.
