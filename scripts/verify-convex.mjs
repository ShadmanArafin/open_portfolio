#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

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
`);
  process.exit(1);
}

console.log('Environment loaded. Initialising convex adapter...');

const { convexAdapter } = await import('../core/storage/adapters/convex.js').catch(async () => {
  return await import('../core/storage/adapters/convex.ts');
});

try {
  console.log('1. Provisioning schema and indices...');
  await convexAdapter.provision();
  console.log('   ✓ Schema provisioned');

  console.log('2. Running health check...');
  const health = await convexAdapter.health();
  console.log(`   ✓ Health status: ${health.status}`);

  console.log('3. Verifying snapshot round-trip...');
  const testState = {
    siteTitle: 'Live Convex Test',
    projects: [],
  };
  await convexAdapter.writeSnapshot('draft', testState);
  const read = await convexAdapter.readSnapshot('draft');
  if (read?.state.siteTitle !== testState.siteTitle) {
    throw new Error(
      `Snapshot title mismatch: expected ${testState.siteTitle}, got ${read?.state.siteTitle}`
    );
  }
  console.log('   ✓ Snapshot write/read confirmed');

  console.log('4. Verifying media upload and retrieval...');
  const key = `test-${Date.now()}.txt`;
  const file = new File(['Hello Convex Storage!'], key, { type: 'text/plain' });
  const uploaded = await convexAdapter.media.put(key, file);
  const resolvedUrl = await convexAdapter.media.resolveUrl(key);
  console.log(`   ✓ Uploaded: ${uploaded.url}`);
  console.log(`   ✓ Resolved URL: ${resolvedUrl}`);
  await convexAdapter.media.remove(key);
  console.log('   ✓ Media removed cleanly');

  console.log('5. Verifying message inbox...');
  const messageId = `msg-${Date.now()}`;
  await convexAdapter.messages.append({
    id: messageId,
    name: 'Convex Verifier',
    email: 'verify@example.com',
    projectType: 'Verification',
    message: 'Testing Convex live inbox.',
    status: 'unread',
    receivedAt: new Date().toISOString(),
  });
  const messages = await convexAdapter.messages.list();
  const found = messages.find((m) => m.id === messageId);
  if (!found) throw new Error('Appended message was not found in list.');
  console.log('   ✓ Message stored and queried');
  await convexAdapter.messages.remove(messageId);
  console.log('   ✓ Message cleaned up');

  console.log('\n✅ All live Convex operations passed successfully!');
} catch (err) {
  console.error('\n❌ Convex verification failed:', err);
  process.exit(1);
}
