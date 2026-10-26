#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

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
`);
  process.exit(1);
}

console.log('Environment loaded. Initialising cloudflare-rest adapter...');

const { cloudflareRestAdapter } = await import('../core/storage/adapters/cloudflare-rest.js').catch(
  async () => {
    return await import('../core/storage/adapters/cloudflare-rest.ts');
  }
);

try {
  console.log('1. Provisioning database tables...');
  await cloudflareRestAdapter.provision();
  console.log('   ✓ Schema provisioned');

  console.log('2. Running health check...');
  const health = await cloudflareRestAdapter.health();
  console.log(`   ✓ Health status: ${health.status}`);

  console.log('3. Verifying snapshot round-trip...');
  const testState = {
    siteTitle: 'Live Test Site',
    projects: [],
  };
  await cloudflareRestAdapter.writeSnapshot('draft', testState);
  const read = await cloudflareRestAdapter.readSnapshot('draft');
  if (read?.state.siteTitle !== testState.siteTitle) {
    throw new Error(
      `Snapshot title mismatch: expected ${testState.siteTitle}, got ${read?.state.siteTitle}`
    );
  }
  console.log('   ✓ Snapshot write/read confirmed');

  console.log('4. Verifying media upload and retrieval...');
  const key = `test-${Date.now()}.txt`;
  const file = new File(['Hello Cloudflare R2!'], key, { type: 'text/plain' });
  const uploaded = await cloudflareRestAdapter.media.put(key, file);
  const resolvedUrl = await cloudflareRestAdapter.media.resolveUrl(key);
  console.log(`   ✓ Uploaded: ${uploaded.url}`);
  console.log(`   ✓ Resolved URL: ${resolvedUrl}`);
  await cloudflareRestAdapter.media.remove(key);
  console.log('   ✓ Media removed cleanly');

  console.log('5. Verifying message inbox...');
  const messageId = `msg-${Date.now()}`;
  await cloudflareRestAdapter.messages.append({
    id: messageId,
    name: 'Live Verifier',
    email: 'verify@example.com',
    projectType: 'Verification',
    message: 'Testing D1 REST live inbox.',
    status: 'unread',
    receivedAt: new Date().toISOString(),
  });
  const messages = await cloudflareRestAdapter.messages.list();
  const found = messages.find((m) => m.id === messageId);
  if (!found) throw new Error('Appended message was not found in list.');
  console.log('   ✓ Message stored and queried');
  await cloudflareRestAdapter.messages.remove(messageId);
  console.log('   ✓ Message cleaned up');

  console.log('\n✅ All live Cloudflare D1 + R2 REST operations passed successfully!');
} catch (err) {
  console.error('\n❌ Cloudflare REST verification failed:', err);
  process.exit(1);
}
