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

const hasUrl = Boolean(
  process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_DEPLOYMENT
);
const hasKey = Boolean(process.env.CONVEX_ADMIN_KEY || process.env.CONVEX_TOKEN);

if (!hasUrl || !hasKey) {
  console.log(`
--- Convex Adapter Verification ---

Missing required environment variables in .env.local:
${!hasUrl ? '  - CONVEX_URL (or CONVEX_DEPLOYMENT)\n' : ''}${!hasKey ? '  - CONVEX_ADMIN_KEY (or CONVEX_TOKEN)\n' : ''}
How to get them:
1. Go to https://dashboard.convex.dev and select or create your project.
2. In Project Settings -> URL & Deploy Key:
   - Copy the Deployment URL -> CONVEX_URL (e.g. https://happy-otter-123.convex.cloud)
   - Or copy the deployment name -> CONVEX_DEPLOYMENT (e.g. dev:happy-otter-123)
3. Under Deploy Keys, click "Generate Deploy Key" -> CONVEX_ADMIN_KEY.
4. Save in .env.local:
   CONVEX_URL=https://your-deployment.convex.cloud
   CONVEX_ADMIN_KEY=...

Then re-run:
   node scripts/verify-convex.mjs

Use a scratch deployment, not the one a live portfolio uses: the check writes
a draft snapshot, a media object, a message and a record, then removes them.
The snapshot is restored if a draft already existed.
`);
  process.exit(1);
}

console.log('Environment loaded. Starting the live Convex verification…\n');
runLiveVerification('core/storage/__tests__/live-verification.test.ts', 'live storage: convex');
