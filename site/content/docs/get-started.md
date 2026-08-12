---
title: Get started
summary: Three install paths, easiest first, and what each one actually needs.
group: Get started
order: 10
---

# Get started

Ordered easiest-first, deliberately. Leading with a source build is how a project turns "try it" into an afternoon.

> **This is alpha software, version 0.5.** The shape of stored content is stable and an older build quarantines content it does not understand rather than dropping it. Screens and options are not settled. Read [what this is not](/docs/what-this-is-not) before deploying it for somebody else.

## 1. One click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShadmanArafin%2Fopen_portfolio_builder)

Vercel clones the repository into the user's own GitHub account, provisions a Neon Postgres database and a Blob store, and asks for one variable — `OPB_SETUP_TOKEN`, which they invent.

Nothing else is required. The adapter is chosen from whichever backend's environment variables are present, so provisioning the database _is_ the configuration.

**Before recommending this to somebody who charges for their work**, read Vercel's non-commercial clause for the Hobby plan. It is quoted in full on [what it costs](/what-it-costs).

## 2. Docker

```bash
git clone https://github.com/ShadmanArafin/open_portfolio_builder.git
cd open_portfolio_builder
docker compose up
```

App and Postgres together, on `http://localhost:3000`. Change `OPB_SETUP_TOKEN` and `OPB_SECRET_KEY` in `docker-compose.yml` first.

The app alone, against a database you already run:

```bash
docker build -t open-portfolio-builder .
docker run -p 3000:3000 -v opb-data:/data \
  -e OPB_POSTGRES_URL="postgres://…" \
  -e OPB_SETUP_TOKEN="a long phrase you invent" \
  -e OPB_SECRET_KEY="a different long phrase" \
  open-portfolio-builder
```

**The volume matters.** `/data` holds uploads, and holds content too if no database is configured. Without it, replacing the container deletes the site. With it, the container is disposable — which is exactly what updating does.

## 3. From source

Node 20.9 or newer. No database needed; the filesystem backend is the default.

```bash
git clone https://github.com/ShadmanArafin/open_portfolio_builder.git
cd open_portfolio_builder
npm ci
npm run dev
```

`http://localhost:3000` sends you to `/setup`. Content lands in `.opb/` — delete the folder to start over.

`npm ci`, not `npm install`: a dependency bump once passed against a populated `node_modules` and failed on a clean install.

## Running the tests

```bash
npm test          # 655 passing, 7 skipped
```

The skipped ones need containers:

```bash
docker run -d --name opb-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=opb_test \
  -p 55432:5432 postgres:16
docker run -d --name opb-mail -p 1025:1025 -p 8025:8025 axllent/mailpit

TEST_POSTGRES_URL="postgres://postgres:postgres@localhost:55432/opb_test" \
TEST_MAILPIT_URL="http://localhost:8025" npm test
```

Both the `-e` and the `-p` flags matter. Without `POSTGRES_DB` the image only creates a database called `postgres` and ninety tests fail with _database "opb_test" does not exist_. A Mailpit container created without `-p` reports healthy and is unreachable. Both look like code bugs and neither is.

Setting `TEST_POSTGRES_URL` with the container stopped is worse than not setting it: the Postgres tests stop skipping and start failing.
