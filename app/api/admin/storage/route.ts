import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';

export const dynamic = 'force-dynamic';

/**
 * Which backend is actually running, and whether it is answering.
 *
 * The admin could not previously tell. `storeName` and `isDurable` in the CMS
 * context describe the *browser's* IndexedDB draft store, not the server's
 * backend — so a settings screen reading them would confidently report the
 * wrong thing, which is worse than reporting nothing.
 *
 * Owner-only. The adapter's identity is not secret, but its health check
 * carries the database's own error text, and a connection string with a
 * password in it turns up in those more often than anyone would like.
 */
export async function GET() {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  try {
    const adapter = await getStorageAdapter();
    const health = await adapter.health();

    return NextResponse.json({
      ok: true,
      active: {
        id: adapter.id,
        displayName: adapter.displayName,
        durable: adapter.capabilities.durable,
        worksOnEphemeralHosts: adapter.capabilities.worksOnEphemeralHosts,
        maxUploadBytes: adapter.capabilities.maxUploadBytes,
      },
      health: { ok: health.ok, detail: health.detail, latencyMs: health.latencyMs },
    });
  } catch (err) {
    // A backend that cannot even be constructed is the case this screen exists
    // for, so it answers rather than throwing: "your database is unreachable"
    // is the single most useful thing it can say.
    return NextResponse.json({
      ok: true,
      active: null,
      health: {
        ok: false,
        detail: err instanceof Error ? err.message : 'No storage backend could be reached.',
        latencyMs: 0,
      },
    });
  }
}
