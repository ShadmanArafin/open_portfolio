// Production smoke: health, guards, and headers on a running instance.
//
// Usage: BASE_URL=http://localhost:3000 npm run smoke
// Exit non-zero on the first failure so CI can gate on it. No dependencies
// beyond Node itself — this must run on a deploy box, not just in this repo.

const base = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

let failures = 0;

async function check(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`FAIL - ${name}: ${err instanceof Error ? err.message : err}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const res = await fetch(`${base}/api/health`);
const health = await res.json().catch(() => ({}));

await check('health answers 200 with a version and no error text', async () => {
  assert(res.status === 200, `status ${res.status}`);
  assert(health.ok === true, `body ${JSON.stringify(health)}`);
  assert(typeof health.version === 'string', 'missing version');
  assert(!('detail' in health) && !('error' in health), 'leaks error text');
  assert((res.headers.get('cache-control') || '').includes('no-store'), 'health is cacheable');
});

await check('admin backup without a session is 401', async () => {
  const r = await fetch(`${base}/api/admin/backup`);
  assert(r.status === 401, `status ${r.status}`);
});

await check('admin storage without a session is 401', async () => {
  const r = await fetch(`${base}/api/admin/storage`);
  assert(r.status === 401, `status ${r.status}`);
});

await check('a dead address is a real 404, not a 200 wearing a 404', async () => {
  const r = await fetch(`${base}/definitely-not-a-page`, { redirect: 'manual' });
  if (r.status >= 300 && r.status < 400) {
    // A fresh, unclaimed instance sends everything to /setup first.
    assert(
      (r.headers.get('location') || '').includes('/setup'),
      `redirect to ${r.headers.get('location')}`
    );
    return;
  }
  assert(r.status === 404, `status ${r.status} — a soft 404 defeats crawlers and analytics`);
  const html = await r.text();
  // Next marks streamed/rendered 404s noindex; if the status is ever wrong
  // again, at least this must hold.
  assert(html.includes('noindex'), 'the 404 body carries no noindex');
});

await check('security headers present on /', async () => {
  const r = await fetch(`${base}/`, { redirect: 'manual' });
  // / may redirect to /setup on a fresh instance — headers ride either way.
  const csp = r.headers.get('content-security-policy') || '';
  assert(csp.includes("default-src 'self'"), 'CSP missing');
  assert(csp.includes("object-src 'none'"), 'object-src missing');
  assert((r.headers.get('strict-transport-security') || '').includes('max-age='), 'HSTS missing');
  assert(r.headers.get('x-request-id'), 'x-request-id missing');
});

if (failures > 0) {
  console.error(`${failures} smoke check(s) failed.`);
  process.exit(1);
}
console.log('smoke: all checks passed.');
