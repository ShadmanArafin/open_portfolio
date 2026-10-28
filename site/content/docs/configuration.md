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

| Variables present                                            | Backend                 |
| ------------------------------------------------------------ | ----------------------- |
| `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`               | Supabase                |
| A database URL plus `BLOB_READ_WRITE_TOKEN`                  | Neon + Vercel Blob      |
| `CONVEX_URL` or `CONVEX_DEPLOYMENT`                          | Convex                  |
| `FIREBASE_PROJECT_ID`                                        | Firebase                |
| `CLOUDFLARE_ACCOUNT_ID` + `D1_DATABASE_ID` + API token       | Cloudflare D1 + R2 REST |
| `CLOUDFLARE_ACCOUNT_ID` + `D1_DATABASE_ID`, no API token     | Cloudflare embedded     |
| `POCKETBASE_URL`                                             | PocketBase              |
| `APPWRITE_ENDPOINT`                                          | Appwrite                |
| `OPB_POSTGRES_URL`, `DATABASE_URL` or `POSTGRES_URL` (alone) | Postgres                |
| none of the above                                            | Local filesystem        |

If two sets of credentials are present the app refuses to guess and asks for `OPB_ADAPTER`; silently picking one is how content ends up split across two databases. The filesystem backend is refused in production on hosts that discard the disk.

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

## Contact notifications and push

Both are optional. The enquiry is stored in the admin inbox either way.

| Variable                                         | Meaning                                                                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `OPB_CONTACT_WEBHOOK`                            | Discord, Slack or any JSON endpoint. New enquiries are posted there after they are stored. Best-effort with an 8s timeout. |
| `OPB_VAPID_PUBLIC_KEY` / `OPB_VAPID_PRIVATE_KEY` | The P-256 VAPID pair for browser push. See `docs/PUSH-NOTIFICATIONS.md` in the repository.                                 |
| `OPB_VAPID_SUBJECT`                              | `mailto:you@example.com` or your `https://` site address. Required with the key pair.                                      |

## Career tools

These are routes rather than settings:

| Route                | Who can use it | What it returns                                                       |
| -------------------- | -------------- | --------------------------------------------------------------------- |
| `/cv`                | Anyone         | The printable CV built from experience, education and skills          |
| `/api/contact/vcard` | Anyone         | RFC 6350 vCard 4.0 download for the owner's contact details           |
| `/api/admin/resume`  | Owner only     | `GET` exports standard JSON Resume; `POST` imports one into the draft |
| `/bio`               | Anyone         | Mobile link-in-bio page built from featured projects and social links |

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

## Scheduled jobs and the static copy

| Variable           | Meaning                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `CRON_SECRET`      | Turns on the owner's monthly digest. Send it as `Authorization: Bearer …` to `/api/cron/digest`. `OPB_CRON_SECRET` also works. |
| `OPB_DIGEST`       | `off` to stop the digest without removing the secret.                                                                          |
| `OPB_INTERNAL_URL` | Where the app reaches itself when it builds a static copy. Defaults to `http://127.0.0.1:$PORT`.                               |

## Writing assistant

Off unless you connect one under **Services → Writing assistant**. It is not an environment variable, because the address and the key are kept encrypted in your storage, like the mail settings.

Connect it to any server that speaks the OpenAI-compatible chat API. Free options run on your own machine: [Ollama](https://ollama.com), LM Studio, or llama.cpp's server. Once it is connected, three buttons appear: **Suggest a description** on a page, **Suggest a summary** on a piece of writing, and **Suggest alt text** on a picture (this one needs a model that can see pictures, such as `llava`). A suggestion is shown first, and only goes into the field when you press **Use it**. What you write goes to the address you gave and nowhere else.

## A note on secrets

A build-time check greps the client bundle for the value of every secret and fails if one appears. This exists because the project's own first version compiled its admin passcode into the public JavaScript.
