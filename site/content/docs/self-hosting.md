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

Two things to keep, and they are separate.

**Content.** Either `pg_dump` the database, or press **Export** in the admin for one JSON file. The export is the more portable of the two and it is what to keep off-site.

**Files.** Whatever is under `OPB_DATA_DIR/media`, or the bucket if you are using object storage. The content export references images; it does not contain them.

Restoring is the same in reverse: import the JSON, put the files back where they were.

## Behind a reverse proxy

Standard Next.js. Terminate TLS at the proxy and forward to port 3000.

Two headers matter. Forward `X-Forwarded-Proto` so the app knows the request arrived over HTTPS — without it, session cookies marked `Secure` are set on what the app believes is a plain HTTP connection and sign-in silently fails. And set `OPB_SITE_URL` to the public address, because it is the only source used for links that arrive in email; a link built from a caller-supplied `Host` header is a way to mail somebody a valid token pointing at somebody else's domain.

Rate limiting reads the client address from `X-Forwarded-For` / `X-Real-IP`, and those headers are self-asserted. Only set them at a proxy you control, and strip any inbound values first — otherwise an attacker rotates headers to walk around the login and one-time-code limits.

## Health

`/api/health` answers 200 when the server is up and is what the container healthcheck hits. `/api/auth/session` answers without a session and is a reasonable liveness probe from outside.
