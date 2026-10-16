import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { getStorageAdapter } from '@/core/storage/registry';
import { APP_VERSION } from '@/core/version';
import { BACKUP_VERSION, MAX_BACKUP_BYTES, buildBackup, checkBackup } from '@/core/backup/bundle';

export const dynamic = 'force-dynamic';

/**
 * Server-side backup: export and restore.
 *
 * The admin's General screen already backs up the *browser's* draft store.
 * This is the other half: the published and draft snapshots as the server
 * holds them, plus a media manifest. Owner-only — a backup is the whole site
 * in one file — and never cached.
 *
 * Media bytes are not embedded (see `core/backup/bundle.ts` for why). The
 * manifest lets the import report which files the bytes need to accompany;
 * the bytes themselves travel with the `/data` volume or the object store.
 */

async function guard(): Promise<NextResponse | null> {
  try {
    await requireOwner();
    return null;
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }
}

function filename(): string {
  const day = new Date().toISOString().slice(0, 10);
  return `portfolio-backup-${day}-v${APP_VERSION}-b${BACKUP_VERSION}.json`;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  const limit = await rateLimit(`backup:${await clientKey()}`, 20, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many backups in a row. Wait a while.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const adapter = await getStorageAdapter();
  const [published, draft, media] = await Promise.all([
    adapter.readSnapshot('published'),
    adapter.readSnapshot('draft'),
    adapter.media.list().catch(() => []),
  ]);

  const bundle = buildBackup({
    adapterId: adapter.id,
    published,
    draft,
    media: media.map((m) => ({
      key: m.key,
      url: m.url,
      mimeType: m.mimeType,
      sizeBytes: m.sizeBytes,
    })),
  });

  return new NextResponse(JSON.stringify(bundle), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename()}"`,
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const limit = await rateLimit(`restore:${await clientKey()}`, 10, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many restores in a row. Wait a while.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const raw = await req.text().catch(() => null);
  if (!raw) return NextResponse.json({ ok: false, error: 'Nothing to restore.' }, { status: 400 });
  if (raw.length > MAX_BACKUP_BYTES) {
    return NextResponse.json(
      { ok: false, error: 'That backup is larger than 25 MB. Export a smaller one.' },
      { status: 413 }
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'That file is not JSON.' }, { status: 400 });
  }

  const checked = checkBackup(parsed);
  if (!checked.ok) {
    return NextResponse.json({ ok: false, error: checked.error }, { status: 400 });
  }

  const adapter = await getStorageAdapter();
  // Unconditional writes: a restore is a deliberate act on content the owner
  // just chose, like publishing. Autosave's revision check would refuse the
  // most common case — restoring over a site that moved on since the backup.
  if (checked.backup.published) await adapter.writeSnapshot('published', checked.backup.published);
  if (checked.backup.draft) await adapter.writeSnapshot('draft', checked.backup.draft);

  const presentKeys = new Set((await adapter.media.list().catch(() => [])).map((m) => m.key));
  const manifestKeys = checked.backup.media.map((m) => m.key).filter(Boolean);
  const filesPresent = manifestKeys.filter((k) => presentKeys.has(k)).length;

  return NextResponse.json({
    ok: true,
    restored: {
      published: checked.backup.published != null,
      draft: checked.backup.draft != null,
      manifestEntries: checked.backup.media.length,
      filesPresent,
      filesMissing: manifestKeys.length - filesPresent,
    },
    note: 'Content restored. Media files travel separately — if images are broken, restore the /data volume or object store alongside this file.',
  });
}
