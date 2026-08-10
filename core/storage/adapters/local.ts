import 'server-only';
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { CMSState } from '@/cms/types/cms';
import type { Channel, HealthReport, MediaAdapter, MediaRecord, StorageAdapter } from '../contract';

/**
 * Filesystem-backed storage.
 *
 * This is the zero-configuration default: clone, `npm run dev`, and everything
 * works with no account, no keys and no database. It is also a genuinely usable
 * production store on a VPS, a Raspberry Pi or a Docker volume — anywhere the
 * filesystem persists.
 *
 * It is *not* usable on Vercel, Netlify or Workers, where the filesystem is
 * read-only and thrown away between invocations. `worksOnEphemeralHosts: false`
 * is what stops the registry selecting it there and silently losing a user's
 * content on their next deploy.
 */

const ROOT = path.join(process.cwd(), '.opb');
const CONTENT_DIR = path.join(ROOT, 'content');
const MEDIA_DIR = path.join(ROOT, 'media');

/** Rejects `..` and absolute paths so a crafted key cannot escape the folder. */
function safeMediaPath(key: string): string {
  const resolved = path.resolve(MEDIA_DIR, key);
  if (resolved !== MEDIA_DIR && !resolved.startsWith(MEDIA_DIR + path.sep)) {
    throw new Error(`Refusing to touch a media path outside the store: ${key}`);
  }
  return resolved;
}

const media: MediaAdapter = {
  async put(key, data, mimeType) {
    const target = safeMediaPath(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
    return {
      key,
      url: `/api/media/${encodeURI(key)}`,
      mimeType,
      sizeBytes: data.byteLength,
      uploadedAt: new Date().toISOString(),
    };
  },

  async resolveUrl(key) {
    try {
      await stat(safeMediaPath(key));
      return `/api/media/${encodeURI(key)}`;
    } catch {
      return null;
    }
  },

  async remove(key) {
    try {
      await unlink(safeMediaPath(key));
    } catch {
      // Already gone is the desired end state, not an error.
    }
  },

  async list() {
    try {
      const names = await readdir(MEDIA_DIR);
      const records = await Promise.all(
        names.map(async (name): Promise<MediaRecord | null> => {
          try {
            const info = await stat(path.join(MEDIA_DIR, name));
            if (!info.isFile()) return null;
            return {
              key: name,
              url: `/api/media/${encodeURI(name)}`,
              mimeType: 'application/octet-stream',
              sizeBytes: info.size,
              uploadedAt: info.mtime.toISOString(),
            };
          } catch {
            return null;
          }
        })
      );
      return records.filter((r): r is MediaRecord => r !== null);
    } catch {
      return [];
    }
  },
};

function channelPath(channel: Channel): string {
  return path.join(CONTENT_DIR, `${channel}.json`);
}

export const localAdapter: StorageAdapter = {
  id: 'local',
  displayName: 'Local filesystem',
  docsUrl: 'https://github.com/ShadmanArafin/open_portfolio_builder#choose-your-backend',

  capabilities: {
    durable: true,
    auth: 'none',
    fileStorage: 'proxy',
    maxUploadBytes: 25 * 1024 * 1024,
    fullTextSearch: false,
    realtime: false,
    transactions: false,
    worksOnEphemeralHosts: false,
  },

  async health(): Promise<HealthReport> {
    const started = Date.now();
    try {
      await mkdir(CONTENT_DIR, { recursive: true });
      // Prove the directory is actually writable rather than merely present —
      // a read-only mount looks fine until the first save fails.
      const probe = path.join(CONTENT_DIR, '.write-probe');
      await writeFile(probe, '');
      await unlink(probe);
      return { ok: true, detail: `Reading and writing ${ROOT}`, latencyMs: Date.now() - started };
    } catch (err) {
      return {
        ok: false,
        detail: err instanceof Error ? err.message : 'Filesystem is not writable.',
        latencyMs: Date.now() - started,
      };
    }
  },

  async provision() {
    await mkdir(CONTENT_DIR, { recursive: true });
    await mkdir(MEDIA_DIR, { recursive: true });
  },

  async readSnapshot(channel) {
    try {
      const raw = await readFile(channelPath(channel), 'utf8');
      return JSON.parse(raw) as CMSState;
    } catch {
      // Nothing stored yet is the normal state of a fresh install, not a fault.
      return null;
    }
  },

  async writeSnapshot(channel, state) {
    await mkdir(CONTENT_DIR, { recursive: true });
    const target = channelPath(channel);
    // Write then rename: a crash mid-write leaves the previous content intact
    // instead of a truncated file that parses as nothing.
    const temp = `${target}.tmp`;
    await writeFile(temp, JSON.stringify(state, null, 2), 'utf8');
    const { rename } = await import('node:fs/promises');
    await rename(temp, target);
  },

  media,
};
