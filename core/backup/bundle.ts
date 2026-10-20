import 'server-only';
import type { CMSState } from '@/cms/types/cms';
import { looksLikeContent } from '@/core/content/validate';
import { withoutEnquiries } from '@/core/content/sanitise';
import { APP_VERSION } from '@/core/version';

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
export const BACKUP_VERSION = 1;

/** 25 MB of JSON — same ceiling as the largest single upload. */
export const MAX_BACKUP_BYTES = 25 * 1024 * 1024;

export interface BackupMediaEntry {
  key: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ServerBackup {
  format: (typeof ACCEPTED_FORMATS)[number];
  bundleVersion: 1;
  appVersion: string;
  exportedAt: string;
  adapter: string;
  published: CMSState | null;
  draft: CMSState | null;
  media: BackupMediaEntry[];
}

export function buildBackup(args: {
  adapterId: string;
  published: CMSState | null;
  draft: CMSState | null;
  media: BackupMediaEntry[];
}): ServerBackup {
  return {
    format: BACKUP_FORMAT,
    bundleVersion: BACKUP_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    adapter: args.adapterId,
    published: args.published ? withoutEnquiries(args.published) : null,
    draft: args.draft ? withoutEnquiries(args.draft) : null,
    media: args.media,
  };
}

export type BackupCheck = { ok: true; backup: ServerBackup } | { ok: false; error: string };

/**
 * Structural validation before anything is written. Deliberately lenient about
 * unknown fields (a newer build's snapshot must still restore here) and strict
 * about the three things that lose content silently: wrong file, newer bundle,
 * and a channel that is not content at all.
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
    },
  };
}
