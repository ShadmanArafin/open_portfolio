---
title: Storage backends
summary: The adapter contract, the conformance suite, and how to add one.
group: Extending it
order: 50
---

# Storage backends

## The contract

One interface, in `core/storage/contract.ts`. Four backends implement it today: local filesystem, Postgres, Supabase and Neon + Vercel Blob.

Surfaces:

- **Snapshots** — `readSnapshot` / `writeSnapshot(channel, state, expectedRevision?)`, plus `readSnapshotMeta`. Two channels, `draft` and `published`. With `expectedRevision` the write only lands if the stored revision still matches and throws `RevisionConflictError` otherwise; without it the write is unconditional, which is right for publishing and wrong for autosave.
- **`media`** — `put` / `resolveUrl` / `remove` / `list`. `resolveUrl` returns a **URL, never a Blob**. An earlier design returned bytes, which forced the client to download every asset at boot to build object URLs.
- **`messages`** — the contact inbox. Its own surface because strangers append to it concurrently.
- **`subscribers`** — the mailing list. Same reason, plus one more: the content document is serialised into every public page and copied whole by the backup button, and a list of email addresses may be in neither.
- **`kv`** — sessions, one-time codes, rate limits, stored service credentials. Namespaced, with TTL. Deliberately _not_ content, so authentication state can never travel inside an export.
- **`readOwner` / `writeOwner`**, `provision()`, `health()`, and a `capabilities` object.

## Capabilities

An adapter declares what it can do — durability, whether it has its own auth, how file storage works, and `worksOnEphemeralHosts`. The registry reads that last one and refuses to select the filesystem backend in production on a host that discards the disk.

## The conformance suite

`core/storage/conformance.ts` is the specification, written framework-agnostically so it takes `describe`/`it`/`expect` as arguments.

**No green run, no ship.** This is the single thing that makes supporting many backends survivable — without it every adapter is eighty per cent finished in a slightly different way, and the bugs only appear on somebody else's deployment.

What it insists on, and each of these caught a real divergence:

- Two racing conditional writes: exactly one wins.
- Fifty concurrent appends to the inbox lose nothing. A read-modify-write on a shared blob keeps one.
- A patch merges rather than replaces, and two patches to different fields on the same record both survive.
- Clearing a field works. Spreading a patch treats `undefined` as "remove the key"; merging it as jsonb drops it before it reaches the database. One backend cleared a spent token and the other silently did not.
- A subscriber never appears inside a content snapshot.
- Removing something already gone is not an error.

The file adapter passed every revision test while real Postgres failed four. **One implementation is not a contract.**

## Adding one

1. Implement `StorageAdapter` in `core/storage/adapters/<name>.ts`. If it is SQL, look at `_shared/postgres.ts` first — three adapters share that engine.
2. Register it, with its capabilities and the environment variables that select it.
3. Run the conformance suite against it, against a real instance or an official emulator. Not a mock.
4. Add its variables to `.env.example` and a row to [configuration](/docs/configuration).

Five are planned and unbuilt: Firebase, Convex, Cloudflare D1 + R2, PocketBase and Appwrite. Each has an official local emulator, and none should ship without a green run against it.
