---
title: Configuration
summary: Every environment variable, with its default and what happens without it.
group: Self-hosting
order: 40
---

# Configuration

Everything is an environment variable. Nothing about how to reach the database is stored _in_ the database, which resolves the obvious circularity and means a misconfigured instance fails at boot rather than halfway through a request.

Mail is the one exception, and only additively: it can also be set from the admin, and an environment variable always wins over what is stored.

## Choosing a backend

There is no `BACKEND=` variable. Whichever backend's variables are present is the one selected, in this order:

| Variables present                                    | Backend            |
| ---------------------------------------------------- | ------------------ |
| `OPB_POSTGRES_URL`, `DATABASE_URL` or `POSTGRES_URL` | Postgres           |
| Supabase URL and service key                         | Supabase           |
| Neon connection string plus `BLOB_READ_WRITE_TOKEN`  | Neon + Vercel Blob |
| none of the above                                    | Local filesystem   |

The filesystem backend is refused in production on hosts that discard the disk.

## Required in production

| Variable          | What happens without it                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPB_SETUP_TOKEN` | The site cannot be claimed on a public host. Locally there is a short boot window instead.                                                                          |
| `OPB_SECRET_KEY`  | Credentials saved from the admin cannot be encrypted, so saving them is refused.                                                                                    |
| `OPB_SITE_URL`    | No passphrase reset and no newsletter sign-ups: both need an absolute link and neither will build one from a request header. Canonical links fall back to the host. |

## Storage

| Variable                | Default               | Notes                                                          |
| ----------------------- | --------------------- | -------------------------------------------------------------- |
| `OPB_DATA_DIR`          | `.opb` beside the app | Where uploads live. Set it to a mounted volume in a container. |
| `OPB_POSTGRES_URL`      | —                     | Also accepted as `DATABASE_URL` or `POSTGRES_URL`.             |
| `BLOB_READ_WRITE_TOKEN` | —                     | Vercel Blob. Selects blob storage for media.                   |

## Mail

All optional. Presence of `OPB_SMTP_HOST` alone selects SMTP.

| Variable                              | Default                                            |
| ------------------------------------- | -------------------------------------------------- |
| `OPB_SMTP_HOST`                       | —                                                  |
| `OPB_SMTP_PORT`                       | `587`                                              |
| `OPB_SMTP_USER` / `OPB_SMTP_PASSWORD` | — (Mailpit needs neither)                          |
| `OPB_SMTP_SECURE`                     | `0`. Set to `1` only for implicit TLS on port 465. |
| `OPB_MAIL_FROM`                       | `no-reply@<your SMTP host>`                        |

Credentials are never sent over a cleartext connection: when a username is set, STARTTLS is required rather than optional, so a server that does not offer encryption produces a visible failure instead of a password on the wire.

## Development and demo

| Variable                     | Meaning                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `OPB_ALLOW_INSECURE_COOKIES` | `1` to test a production build over plain HTTP locally. Without it the session cookie is `Secure`, the browser drops it, and sign-in appears to do nothing at all. |
| `OPB_DEMO_MODE`              | `1` gives every visitor their own in-memory copy, discarded after an hour. Uploading, sending mail and saving credentials are switched off.                        |
| `OPB_GITHUB_CLIENT_ID`       | Enables reporting bugs from inside the admin, via GitHub's device flow. No client secret is involved.                                                              |

## Analytics

Cookieless, and nothing is recorded until set.

| Variable                           | Meaning                  |
| ---------------------------------- | ------------------------ |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER`   | `plausible` or `umami`   |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN`     | The site being measured  |
| `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` | Umami only               |
| `NEXT_PUBLIC_ANALYTICS_SRC`        | A self-hosted script URL |

## A note on secrets

A build-time check greps the client bundle for the value of every secret and fails if one appears. This exists because the project's own first version compiled its admin passcode into the public JavaScript.
