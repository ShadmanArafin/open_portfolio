import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { getStorageAdapter } from '@/core/storage/registry';
import { getPublishedContent } from '@/core/content/read';
import { resolveTransportWithStored } from '@/core/email/transport';
import { detectHost, summariseContent } from '@/core/support/diagnostics';
import { checkForUpdates } from '@/core/updates/check';
import { APP_VERSION } from '@/core/version';

export const dynamic = 'force-dynamic';

/**
 * Everything the Help screen needs: what this is, and whether it is current.
 *
 * Owner-only. None of it is secret on its own — a version number is visible in
 * the page source of most software — but the storage backend, the host and the
 * feature inventory together are a decent map for somebody deciding what to try
 * against a site, and there is no reason a visitor needs any of it.
 */
export async function GET(req: Request) {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const [adapter, content, transport] = await Promise.all([
    getStorageAdapter(),
    getPublishedContent(),
    resolveTransportWithStored(),
  ]);

  // The update check is a network call to GitHub. It is cached for an hour and
  // fails to "no idea" rather than throwing, so it can be awaited alongside the
  // rest without the screen ever hanging on it.
  const updates = await checkForUpdates(new URL(req.url).searchParams.has('refresh'));

  return NextResponse.json({
    ok: true,
    server: {
      version: APP_VERSION,
      adapter: adapter.id,
      host: detectHost(),
      nodeVersion: process.version,
      emailConfigured: transport.kind !== 'none',
    },
    content: summariseContent(content),
    updates,
  });
}
