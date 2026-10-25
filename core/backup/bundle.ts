import 'server-only';
import type { CMSState } from '@/cms/types/cms';
import { looksLikeContent } from '@/core/content/validate';
import { withoutEnquiries } from '@/core/content/sanitise';
import { APP_VERSION } from '@/core/version';
import type { StoredRecord } from '@/core/storage/contract';
import { WRITING_BODY_COLLECTION, WRITING_RECORD_COLLECTIONS } from '@/core/writing/records';

/**
 * Server-side backup bundle.
 *
 * The legacy editor's browser-side bundle embedded media bytes as data URLs
 * from IndexedDB, which made sense when the bytes lived in the editor's
 * browser and nowhere else (that client is gone; its format still imports).
 * Here the bytes live in the storage backend (disk, Postgres large objects,
 * Supabase Storage, Blob) — embedding them in JSON would mean downloading
 * every upload on export and re-uploading on import, and for hosted stores it
 * would double egress on every backup.
 *
 * So this bundle carries content only: both snapshot channels, stripped of
 * enquiries, plus a media *manifest* (keys and URLs, no bytes). The bytes are
 * backed up where they live — the `/data` volume for the local adapter, the
 * object store's own versioning for hosted ones. Restoring the JSON without
 * the files yields the site with broken images rather than someone else's
 * uploads, which is the honest failure mode and the one the import reports.
 *
 * Never in here, by construction: sessions/OTP/rate-limits (`kv`), the owner
 * record, SMTP passwords (`config`), the contact inbox (`messages`) and the
 * mailing list (`subscribers`). A backup restored onto another machine must
 * not carry live sessions or secrets with it.
 */

export const BACKUP_FORMAT = 'open-portfolio-builder';
const ACCEPTED_FORMATS = [BACKUP_FORMAT, 'arshan-portfolio-cms'] as const;
/**
 * 2 added `records`: the per-piece writing drafts and the published bodies.
 *
 * Without them a v2 backup would restore a published snapshot naming body
 * records that were never written, which is every article blank. Version 1
 * files still restore - they carry their bodies inline in the snapshot, the
 * shape that predates the split.
 */
export const BACKUP_VERSION = 2;

/** 25 MB of JSON — same ceiling as the largest single upload. */
export const MAX_BACKUP_BYTES = 25 * 1024 * 1024;

export interface BackupMediaEntry {
  key: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

/** One stored record, in the shape every backend's `records` surface uses. */
export interface BackupRecord {
  id: string;
  revision: number;
  data: unknown;
  updatedAt: string;
}

export interface ServerBackup {
  format: (typeof ACCEPTED_FORMATS)[number];
  bundleVersion: 2;
  appVersion: string;
  exportedAt: string;
  adapter: string;
  published: CMSState | null;
  draft: CMSState | null;
  media: BackupMediaEntry[];
  /**
   * Collection name -> records. Only the writing collections are carried:
   * history is a convenience that can be rebuilt, and sessions, secrets and
   * the inbox live outside the bundle by design.
   */
  records?: Record<string, BackupRecord[]>;
}

export function buildBackup(args: {
  adapterId: string;
  published: CMSState | null;
  draft: CMSState | null;
  media: BackupMediaEntry[];
  records?: Record<string, StoredRecord[]>;
}): ServerBackup {
  const records: Record<string, BackupRecord[]> = {};
  for (const [collection, list] of Object.entries(args.records ?? {})) {
    if (list.length === 0) continue;
    records[collection] = list.map((record) => ({
      id: record.id,
      revision: record.revision,
      data: record.data,
      updatedAt: record.updatedAt,
    }));
  }

  return {
    format: BACKUP_FORMAT,
    bundleVersion: BACKUP_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    adapter: args.adapterId,
    published: args.published ? withoutEnquiries(args.published) : null,
    draft: args.draft ? withoutEnquiries(args.draft) : null,
    media: args.media,
    ...(Object.keys(records).length > 0 ? { records } : {}),
  };
}

export type BackupCheck = { ok: true; backup: ServerBackup } | { ok: false; error: string };

const RECORD_ADDRESS = /^[a-z0-9-_]{1,64}$/;
const ALLOWED_RECORD_COLLECTIONS = new Set<string>(WRITING_RECORD_COLLECTIONS);
/** 200 pieces, their drafts and every published version of their bodies. */
const MAX_BACKUP_RECORDS = 10_000;

/**
 * Structural validation before anything is written. Deliberately lenient about
 * unknown fields (a newer build's snapshot must still restore here) and strict
 * about the things that lose content silently: wrong file, newer bundle, a
 * channel that is not content at all, and a published snapshot naming a body
 * the bundle does not carry.
 */
export function checkBackup(value: unknown): BackupCheck {
  if (!value || typeof value !== 'object') {
    return { ok: false, error: 'That file is not a portfolio backup.' };
  }
  const b = value as Partial<ServerBackup> & {
    version?: number;
    published?: unknown;
    draft?: unknown;
  };

  if (!b.format || !(ACCEPTED_FORMATS as readonly string[]).includes(b.format)) {
    return { ok: false, error: 'That file is not a portfolio backup.' };
  }

  // Both the server shape (`bundleVersion`) and the browser shape (`version`)
  // are accepted on read; only the server shape is ever written.
  const bundleVersion = b.bundleVersion ?? b.version;
  if (typeof bundleVersion === 'number' && bundleVersion > BACKUP_VERSION) {
    return {
      ok: false,
      error: `That backup was made by a newer version (bundle format ${bundleVersion}). Update this site, then import again.`,
    };
  }

  if (b.published != null && !looksLikeContent(b.published)) {
    return { ok: false, error: 'That backup has no published content in it.' };
  }
  if (b.draft != null && !looksLikeContent(b.draft)) {
    return { ok: false, error: 'That backup has a draft channel that is not content.' };
  }
  if (b.published == null && b.draft == null) {
    return { ok: false, error: 'That backup is empty — neither channel has content.' };
  }

  const media = Array.isArray(b.media) ? b.media : [];
  const cleanMedia: BackupMediaEntry[] = [];
  for (const entry of media) {
    if (
      entry &&
      typeof entry === 'object' &&
      typeof (entry as BackupMediaEntry).key === 'string' &&
      typeof (entry as BackupMediaEntry).url === 'string'
    ) {
      const e = entry as Partial<BackupMediaEntry>;
      cleanMedia.push({
        key: e.key as string,
        url: e.url as string,
        mimeType: typeof e.mimeType === 'string' ? e.mimeType : 'application/octet-stream',
        sizeBytes: typeof e.sizeBytes === 'number' ? e.sizeBytes : 0,
      });
    }
  }

  // Records are an allowlist, not a passthrough. A bundle may only put back the
  // collections this build owns; a hand-edited file must not be able to write
  // into `versions`, `messages` or anything else the storage surface knows.
  const records: Record<string, BackupRecord[]> = {};
  let recordCount = 0;
  if (b.records != null) {
    if (typeof b.records !== 'object' || Array.isArray(b.records)) {
      return { ok: false, error: 'That backup has a damaged records section.' };
    }
    for (const [collection, rawList] of Object.entries(b.records as Record<string, unknown>)) {
      if (!ALLOWED_RECORD_COLLECTIONS.has(collection)) continue;
      if (!Array.isArray(rawList)) {
        return { ok: false, error: `That backup's "${collection}" records are not a list.` };
      }
      const clean: BackupRecord[] = [];
      for (const raw of rawList) {
        if (!raw || typeof raw !== 'object') continue;
        const record = raw as Partial<BackupRecord>;
        if (typeof record.id !== 'string' || !RECORD_ADDRESS.test(record.id)) {
          return {
            ok: false,
            error: `That backup has a record with an unusable id in "${collection}".`,
          };
        }
        if (
          typeof record.revision !== 'number' ||
          !Number.isInteger(record.revision) ||
          record.revision < 1
        ) {
          return {
            ok: false,
            error: `That backup has a record with an unusable revision in "${collection}".`,
          };
        }
        if (!('data' in record)) {
          return { ok: false, error: `That backup has an empty record in "${collection}".` };
        }
        recordCount += 1;
        if (recordCount > MAX_BACKUP_RECORDS) {
          return { ok: false, error: 'That backup holds more records than a site can have.' };
        }
        clean.push({
          id: record.id,
          revision: record.revision,
          data: record.data,
          updatedAt:
            typeof record.updatedAt === 'string' ? record.updatedAt : new Date(0).toISOString(),
        });
      }
      if (clean.length > 0) records[collection] = clean;
    }
  }

  // A published entry with a `bodyKey` is a pointer into `writing-bodies`. A
  // backup without that body restores a site whose articles are blank, which
  // looks like a successful restore until somebody opens one.
  const bodies = new Set((records[WRITING_BODY_COLLECTION] ?? []).map((record) => record.id));
  const publishedState = b.published as CMSState | null;
  for (const entry of publishedState?.writing ?? []) {
    const bodyKey = (entry as { bodyKey?: unknown } | null)?.bodyKey;
    if (typeof bodyKey === 'string' && bodyKey && !bodies.has(bodyKey)) {
      return {
        ok: false,
        error:
          'That backup names published writing whose bodies are not in it. Export a new backup ' +
          'from the site that made it, rather than restoring a partial one.',
      };
    }
  }

  return {
    ok: true,
    backup: {
      format: BACKUP_FORMAT,
      bundleVersion: BACKUP_VERSION,
      appVersion: typeof b.appVersion === 'string' ? b.appVersion : 'unknown',
      exportedAt: typeof b.exportedAt === 'string' ? b.exportedAt : new Date(0).toISOString(),
      adapter: typeof b.adapter === 'string' ? b.adapter : 'unknown',
      // Strip enquiries again on the way in: the shape arriving over HTTP is
      // the client's claim, not a fact, and the published snapshot is
      // serialised into every page's HTML.
      published: b.published ? withoutEnquiries(b.published as CMSState) : null,
      draft: b.draft ? withoutEnquiries(b.draft as CMSState) : null,
      media: cleanMedia,
      ...(Object.keys(records).length > 0 ? { records } : {}),
    },
  };
}
