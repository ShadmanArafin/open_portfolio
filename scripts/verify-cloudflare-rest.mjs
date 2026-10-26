#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { runLiveVerification } from './lib/run-live-verification.mjs';

// Load .env.local if present
if (existsSync('.env.local')) {
  const content = readFileSync('.env.local', 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const required = ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN', 'D1_DATABASE_ID'];
const missing = required.filter((k) => !process.env[k]);

if (missing.length > 0) {
  console.log(`
--- Cloudflare D1 + R2 REST Adapter Verification ---

Missing required environment variables in .env.local:
${missing.map((k) => `  - ${k}`).join('\n')}

How to get them:
1. In the Cloudflare Dashboard, go to Workers & Pages -> D1.
   Create a database (or choose existing) and copy the Database ID -> D1_DATABASE_ID.
2. Go to R2 -> Create a bucket named "opb-media" (or set R2_BUCKET_NAME).
3. Go to Manage Account -> Account Details to copy your Account ID -> CLOUDFLARE_ACCOUNT_ID.
4. Go to My Profile -> API Tokens -> Create Token with:
   - Account -> Workers D1 -> Edit
   - Account -> Workers R2 Storage -> Edit
   Copy token -> CLOUDFLARE_API_TOKEN.
5. Save in .env.local:
   CLOUDFLARE_ACCOUNT_ID=...
   CLOUDFLARE_API_TOKEN=...
   D1_DATABASE_ID=...

Then re-run:
   node scripts/verify-cloudflare-rest.mjs

Use a scratch database and bucket, not the one a live portfolio uses: the
check writes a draft snapshot, a media object, a message and a record, then
removes them. The snapshot is restored if a draft already existed.
`);
  process.exit(1);
}

console.log('Environment loaded. Starting the live D1 + R2 verification…\n');
runLiveVerification(
  'core/storage/__tests__/live-verification.test.ts',
  'live storage: cloudflare-rest'
);
