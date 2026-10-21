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

Every version tag publishes a ready image, `ghcr.io/shadmanarafin/open_portfolio`, for both amd64 and arm64 — a Raspberry Pi pulls the same tag as a VPS. Tags are `:<version>`, `:<major>.<minor>` and `:latest`. To use it with the compose file, replace `build: .` with `image: ghcr.io/shadmanarafin/open_portfolio:<version>`.

Each image carries a build provenance attestation, signed through Sigstore with the release workflow's own identity, and an SBOM listing every package inside it. Check where an image came from before running it:

```bash
gh attestation verify oci://ghcr.io/shadmanarafin/open_portfolio:<version> --owner ShadmanArafin
```

`OPB_SETUP_TOKEN` and `OPB_SECRET_KEY` must be phrases of your own. The example values in `docker-compose.yml` and the README are public, so in production a site still using them refuses to be claimed and will not encrypt new service passwords.

To build the image yourself instead, for both architectures:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t open-portfolio .
```

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

**Settings → Backup & restore → Download everything** is the whole site in one `.zip`: the published site and the draft, the publish history, and every uploaded file. Restore it from the same screen, on this install or any other, whatever storage either one uses; files the store already has are left alone and missing ones are put back. That is the backup to keep off-site.

**Content only (.json)** is smaller and leaves the files where they are. Use it with `pg_dump`, or a copy of `OPB_DATA_DIR/media` or the bucket, if you back those up some other way.

## A static copy

**Settings → Backup & restore → Static copy** downloads the published site as plain HTML, one `folder/index.html` per page, with its scripts, styles, fonts and pictures. Upload the folder to any static host and it keeps working, with the same addresses, even without this app. The contact form and the newsletter need the app, so they won't work in the copy.

The app builds the copy by requesting its own pages, from `http://127.0.0.1:$PORT` by default. If it listens somewhere else, set `OPB_INTERNAL_URL` (for example `http://app:3000`). It is never taken from a request header.

## The monthly digest

Once a month the owner can get an email: last month's visitors and most-read pages (when analytics is connected), new and unread messages, whether there are unpublished changes, and what is left on the launch checklist. It needs a mail server (`OPB_SMTP_*`) and a secret, and it is sent by calling `/api/cron/digest` with that secret:

```bash
# .env
CRON_SECRET=a-long-random-string        # openssl rand -hex 32

# crontab -e — daily; the app sends at most one digest per calendar month
17 8 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://your.site/api/cron/digest
```

On Vercel, `vercel.json` already schedules the call, and Vercel sends `CRON_SECRET` itself once you set it. To turn the digest off, set `OPB_DIGEST=off`.

## Behind a reverse proxy

Standard Next.js. Terminate TLS at the proxy and forward to port 3000.

Two headers matter. Forward `X-Forwarded-Proto` so the app knows the request arrived over HTTPS — without it, session cookies marked `Secure` are set on what the app believes is a plain HTTP connection and sign-in silently fails. And set `OPB_SITE_URL` to the public address, because it is the only source used for links that arrive in email; a link built from a caller-supplied `Host` header is a way to mail somebody a valid token pointing at somebody else's domain.

Rate limiting reads the client address from `X-Forwarded-For` / `X-Real-IP`, and those headers are self-asserted. Only set them at a proxy you control, and strip any inbound values first — otherwise an attacker rotates headers to walk around the login and one-time-code limits.

## Health

`/api/health` answers 200 when the server is up and is what the container healthcheck hits. `/api/auth/session` answers without a session and is a reasonable liveness probe from outside.
