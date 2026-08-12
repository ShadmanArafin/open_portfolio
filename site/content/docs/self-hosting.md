---
title: Self-hosting
summary: Docker, Postgres, volumes, updates, backups and a reverse proxy.
group: Self-hosting
order: 30
---

# Self-hosting

## The shape of it

A Next.js application in standalone output, plus a place to put content and a place to put files. Which backend is used is decided at boot from the environment; nothing is stored in a database about which database to use.

## Docker Compose

`docker-compose.yml` in the repository brings up the app and Postgres together and is the supported arrangement.

```bash
docker compose up -d
```

Change two values first:

- `OPB_SETUP_TOKEN` — proves the site is yours on first run. Anything long.
- `OPB_SECRET_KEY` — encrypts service credentials saved from the admin, such as SMTP passwords. Changing it later makes previously saved credentials unreadable, so they have to be re-entered.

## Volumes, and why the app refuses some hosts

`/data` — set as `OPB_DATA_DIR` — holds uploads, and holds content too when no database is configured.

The filesystem backend declares that it does not work on ephemeral hosts, and the registry **refuses to select it** in production on Vercel, Netlify or Workers. That is not caution: the filesystem there is discarded between invocations, so the failure mode without the check is a site that works for a day and loses everything on the next deploy.

Every adapter reads its directory from one shared function. Two of them once carried their own copy of that path expression and one ignored `OPB_DATA_DIR`, which meant `docker compose up` died on its first write with `EACCES: mkdir '/app/.opb'` while every test passed — because every test ran with the variable unset.

## Updating

```bash
git pull
docker compose up -d --build
```

Your content is not in the image. It is in Postgres, or on the volume, and both survive the container being replaced. That is the whole design: the container is disposable.

Two things to know:

- **Content written by a newer version stays readable by an older one.** Blocks carry their own schema version and anything unrecognised is round-tripped verbatim rather than dropped, so a rollback does not destroy what the newer build wrote.
- **Migrations run on first request**, not on boot, and are written to be safe to run repeatedly.

## Backups

Two things to keep, and they are separate.

**Content.** Either `pg_dump` the database, or press **Export** in the admin for one JSON file. The export is the more portable of the two and it is what to keep off-site.

**Files.** Whatever is under `OPB_DATA_DIR/media`, or the bucket if you are using object storage. The content export references images; it does not contain them.

Restoring is the same in reverse: import the JSON, put the files back where they were.

## Behind a reverse proxy

Standard Next.js. Terminate TLS at the proxy and forward to port 3000.

Two headers matter. Forward `X-Forwarded-Proto` so the app knows the request arrived over HTTPS — without it, session cookies marked `Secure` are set on what the app believes is a plain HTTP connection and sign-in silently fails. And set `OPB_SITE_URL` to the public address, because it is the only source used for links that arrive in email; a link built from a caller-supplied `Host` header is a way to mail somebody a valid token pointing at somebody else's domain.

## Health

`/api/auth/session` answers without a session and is a reasonable liveness probe. There is no separate health endpoint; a request that renders the home page is the honest check.
