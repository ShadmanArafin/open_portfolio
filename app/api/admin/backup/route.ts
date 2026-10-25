import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { PUBLISHED_TAG } from '@/core/content/read';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { getStorageAdapter } from '@/core/storage/registry';
import { APP_VERSION } from '@/core/version';
import { BACKUP_VERSION, MAX_BACKUP_BYTES, buildBackup, checkBackup } from '@/core/backup/bundle';
import { isZip, readZip, writeZip, ZipError, type ZipEntry } from '@/core/backup/zip';
import { isSafeMediaKey, readMediaBytes } from '@/core/media/read-bytes';
import { UploadRejected, validateUpload } from '@/core/media/validate';
import { listVersions, VERSIONS_COLLECTION } from '@/core/content/versions';
import {
  listAllRecords,
  replaceDraftWriting,
  WRITING_DRAFT_COLLECTION,
  WRITING_RECORD_COLLECTIONS,
} from '@/core/writing/records';
import type { StoredRecord } from '@/core/storage/contract';
import type { ContentVersion } from '@/cms/types/cms';

/**
 * Server-side backup: export and restore.
 *
 * The admin's General screen already backs up the *browser's* draft store.
 * This is the other half: the published and draft snapshots as the server
 * holds them, plus a media manifest. Owner-only — a backup is the whole site
 * in one file — and never cached.
 *
 * Two shapes. The JSON file is content only, with a media manifest (see
 * `core/backup/bundle.ts` for why it carries no bytes). `?format=zip` is the
 * whole site in one file: that same JSON, the version history, and every media
 * file. It exists because the JSON alone could not move a site between
 * backends — leaving Vercel Blob for a VPS lost every picture — which made "you
 * own your content" true of the words and not of the work. Restore takes
 * either, and from a zip puts back any file the store does not already have.
 */

/** A zip in memory: a portfolio's media is megabytes, not gigabytes. */
const MAX_ZIP_BYTES = 1024 * 1024 * 1024;
const MAX_MEDIA_FILE_BYTES = 100 * 1024 * 1024;

const README = `This is a complete backup of an Open Portfolio site.

backup.json    the published site and the draft (restore it from Settings)
versions.json  the publish history shown under History
media/         every uploaded file, under the name the site knows it by

Restore it from Settings -> Backup & restore -> Restore from file, on this
install or any other, whatever storage it uses. Files already in that store
are left as they are; missing ones are put back.
`;

async function guard(): Promise<NextResponse | null> {
  try {
    await requireOwner();
    return null;
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }
}

function filename(extension: 'json' | 'zip'): string {
  const day = new Date().toISOString().slice(0, 10);
  return `portfolio-backup-${day}-v${APP_VERSION}-b${BACKUP_VERSION}.${extension}`;
}

export async function GET(req: Request) {
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

  // The writing composites live in records, not either snapshot: drafts that
  // are still being written and the immutable bodies every published piece
  // points at. Leaving them out would make a restored article blank.
  const records: Record<string, StoredRecord[]> = {};
  await Promise.all(
    WRITING_RECORD_COLLECTIONS.map(async (collection) => {
      records[collection] = await listAllRecords(adapter.records, collection);
    })
  );

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
    records,
  });

  if (new URL(req.url).searchParams.get('format') === 'zip') {
    const entries: ZipEntry[] = [
      { name: 'README.txt', data: new TextEncoder().encode(README) },
      { name: 'backup.json', data: new TextEncoder().encode(JSON.stringify(bundle)) },
      {
        name: 'versions.json',
        data: new TextEncoder().encode(JSON.stringify(await listVersions(adapter, published))),
      },
    ];
    const missing: string[] = [];
    for (const item of media) {
      if (!isSafeMediaKey(item.key)) continue;
      const data = await readMediaBytes(adapter, item.key);
      if (data) entries.push({ name: `media/${item.key}`, data });
      else missing.push(item.key);
    }
    if (missing.length) {
      entries.push({
        name: 'MISSING.txt',
        data: new TextEncoder().encode(
          `These files are listed in storage but could not be read when the backup was made:\n\n${missing.join('\n')}\n`
        ),
      });
    }
    const zip = writeZip(entries);
    return new NextResponse(new Uint8Array(zip), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename('zip')}"`,
        'Cache-Control': 'no-store, private',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  return new NextResponse(JSON.stringify(bundle), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename('json')}"`,
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

  const bytes = new Uint8Array(await req.arrayBuffer().catch(() => new ArrayBuffer(0)));
  if (bytes.length === 0) {
    return NextResponse.json({ ok: false, error: 'Nothing to restore.' }, { status: 400 });
  }

  // The whole-site zip: its backup.json goes through exactly the JSON path
  // below, then its files and history are put back.
  let archive: ZipEntry[] | null = null;
  if (isZip(bytes)) {
    if (bytes.length > MAX_ZIP_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'That archive is larger than 1 GB.' },
        { status: 413 }
      );
    }
    try {
      archive = readZip(bytes);
    } catch (err) {
      const message = err instanceof ZipError ? err.message : 'That archive could not be read.';
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }
  }
  const json = archive ? archive.find((entry) => entry.name === 'backup.json') : null;
  if (archive && !json) {
    return NextResponse.json(
      { ok: false, error: 'That archive has no backup.json, so it is not a site backup.' },
      { status: 400 }
    );
  }
  const raw = new TextDecoder().decode(json ? json.data : bytes);
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
  // Records first. A snapshot is the switch that makes writing visible, so it
  // must not point at a body the restore has not written yet; if a record fails,
  // the throw happens before either channel changes.
  //
  // Unconditional writes: a restore is a deliberate act on content the owner
  // just chose, like publishing. Autosave's revision check would refuse the
  // most common case — restoring over a site that moved on since the backup.
  let recordsRestored = 0;
  for (const [collection, records] of Object.entries(checked.backup.records ?? {})) {
    for (const record of records) {
      await adapter.records.put(collection, record.id, record.data);
      recordsRestored += 1;
    }
  }

  // A restore replaces the draft rather than merging with it. Any draft records
  // already in storage that the backup does not carry must be cleaned up, or
  // posts deleted before the backup was taken will resurrect.
  if (checked.backup.draft) {
    const backupDraftIds = new Set(
      (checked.backup.records?.[WRITING_DRAFT_COLLECTION] ?? []).map((r) => r.id)
    );
    if (backupDraftIds.size === 0 && checked.backup.draft.writing?.length) {
      await replaceDraftWriting(adapter.records, checked.backup.draft.writing);
    } else {
      const existingDraftRecords = await listAllRecords(adapter.records, WRITING_DRAFT_COLLECTION);
      for (const record of existingDraftRecords) {
        if (!backupDraftIds.has(record.id)) {
          await adapter.records.remove(WRITING_DRAFT_COLLECTION, record.id);
        }
      }
    }
  }

  if (checked.backup.published) await adapter.writeSnapshot('published', checked.backup.published);
  if (checked.backup.draft) await adapter.writeSnapshot('draft', checked.backup.draft);

  // From a zip: the files the store does not already have, each checked the
  // way an upload is — by its bytes, not its name — and the history.
  let filesRestored = 0;
  let filesRefused = 0;
  if (archive) {
    const already = new Set((await adapter.media.list().catch(() => [])).map((m) => m.key));
    for (const entry of archive) {
      if (!entry.name.startsWith('media/')) continue;
      const key = entry.name.slice('media/'.length);
      if (!isSafeMediaKey(key) || already.has(key)) continue;
      try {
        const validated = validateUpload(entry.data, key, MAX_MEDIA_FILE_BYTES);
        await adapter.media.put(key, validated.bytes, validated.mimeType);
        filesRestored += 1;
      } catch (err) {
        if (!(err instanceof UploadRejected))
          console.error('[backup] A file could not be restored.', err);
        filesRefused += 1;
      }
    }
    const history = archive.find((entry) => entry.name === 'versions.json');
    if (history) {
      try {
        const versions = JSON.parse(new TextDecoder().decode(history.data)) as ContentVersion[];
        for (const version of Array.isArray(versions) ? versions.slice(0, 20) : []) {
          if (version && typeof version.id === 'string' && version.snapshot) {
            await adapter.records
              .put(VERSIONS_COLLECTION, version.id, version)
              .catch(() => undefined);
          }
        }
      } catch {
        // History is a convenience; a damaged copy of it does not undo the restore.
      }
    }
  }

  // A restore changes the published site as much as a publish does, so the
  // cached public pages go the same way; without this a restored site showed
  // the old pages until their minute was up.
  // Route handlers cannot `updateTag`; an immediate expiry is the same
  // promise — the next visitor waits for the new content.
  revalidateTag(PUBLISHED_TAG, { expire: 0 });
  revalidatePath('/', 'layout');

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
      filesRestored,
      filesRefused,
      recordsRestored,
    },
    note: archive
      ? 'Content, history and media restored from the archive.'
      : 'Content restored. Media files travel separately — download the full .zip backup to carry them, or restore the /data volume or object store alongside this file.',
  });
}
