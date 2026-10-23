import { connection, NextResponse } from 'next/server';
import { APP_VERSION } from '@/core/version';

/**
 * Public liveness + readiness for orchestrators and uptime monitors.
 *
 * Intentionally thin: adapter identity and a boolean, never error text. The
 * owner-only `/api/admin/storage` already carries the database's own message
 * for debugging; exposing that here would hand connection strings to the
 * internet (they turn up in driver errors more often than anyone expects).
 *
 * 200 when the backend answers, 503 when it does not. Both are JSON so a
 * load balancer can check the status code and a human can read the body.
 */
export async function GET() {
  // Every request is a fresh check; nothing here may be prerendered.
  await connection();
  const started = Date.now();
  let adapterId: string | null = null;
  let ok = true;

  try {
    const { getStorageAdapter } = await import('@/core/storage/registry');
    const adapter = await getStorageAdapter();
    adapterId = adapter.id;
    const report = await adapter.health();
    ok = report.ok;
  } catch {
    ok = false;
  }

  const body = {
    ok,
    version: APP_VERSION,
    adapter: adapterId,
    uptimeSeconds: Math.floor(process.uptime()),
    latencyMs: Date.now() - started,
  };

  return NextResponse.json(body, {
    status: ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store, private' },
  });
}
