#!/usr/bin/env bash
# Runs the Neon + Vercel Blob conformance suite against the real Blob service.
#
# The only thing that needs a Vercel account is the blob token. The database
# half of this adapter is the shared Postgres engine, so a local Postgres in
# Docker proves exactly as much as a hosted Neon would — which means verifying
# Vercel Blob costs one token and no deployment.
#
# Put BLOB_READ_WRITE_TOKEN in .env.local (git-ignores anything *.local), then:
#   bash scripts/verify-blob.sh
set -euo pipefail

[ -f .env.local ] || { echo "Create .env.local with BLOB_READ_WRITE_TOKEN=... first."; exit 1; }
# shellcheck disable=SC1091
set -a; . ./.env.local; set +a

: "${BLOB_READ_WRITE_TOKEN:?BLOB_READ_WRITE_TOKEN is not set in .env.local}"

docker start opb-pg >/dev/null 2>&1 || {
  echo "Starting Postgres..."
  docker run -d --name opb-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=opb_test \
    -p 55432:5432 postgres:16 >/dev/null
}
for _ in $(seq 1 40); do docker exec opb-pg pg_isready -q 2>/dev/null && break; sleep 1; done

echo "Token loaded (${#BLOB_READ_WRITE_TOKEN} chars). Running the Neon + Blob conformance suite..."
DATABASE_URL="postgres://postgres:postgres@localhost:55432/opb_test" \
  npx vitest run core/storage/__tests__/hosted-adapters.test.ts
