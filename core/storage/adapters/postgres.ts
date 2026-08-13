import 'server-only';
import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { MediaAdapter, MediaRecord, StorageAdapter } from '../contract';
import { AdapterConfigError } from '../contract';
import { mediaRoot } from './_shared/data-dir';
import {
  getSql,
  health,
  makeKvAdapter,
  makeMessagesAdapter,
  makeSubscribersAdapter,
  provisionSchema,
  readOwner,
  readSnapshot,
  readSnapshotMeta,
  writeOwner,
  writeSnapshot,
} from './_shared/postgres';
import { migrateSnapshotMessages } from './_shared/migrate-messages';

/**
 * Any Postgres, plus a disk for uploads.
 *
 * The cheapest adapter in the project and, for self-hosters, probably the most
 * useful: it works with Railway, Render, Fly, Coolify, Timescale, a Supabase
 * connection string used directly, or a database on the same box — anything
 * that speaks Postgres. All of that comes from a connection string and the SQL
 * engine that Supabase and Neon already share and that the conformance suite
 * already covers.
 *
 * Uploads go to the local filesystem, which is the honest constraint here:
 * there is no object store to assume. That means this adapter needs a
 * persistent disk, so it is fine on a VPS or a Docker volume with a mounted
 * directory, and refused on hosts that throw the disk away.
 */

/**
 * Read on each call rather than captured at module load, so a test or a
 * container that sets `OPB_DATA_DIR` after this file is imported still gets the
 * directory it asked for.
 */
const mediaDir = () => mediaRoot();

function connectionString(): string {
  const url = process.env.OPB_POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new AdapterConfigError(
      'Postgres is selected but no connection string is set. Add DATABASE_URL.'
    );
  }
  return url;
}

function sql() {
  return getSql(connectionString());
}

/** Rejects any key that would resolve outside the media directory. */
function safePath(key: string): string {
  const root = mediaDir();
  const resolved = path.resolve(root, key);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error(`Refusing to touch a media path outside the store: ${key}`);
  }
  return resolved;
}

const media: MediaAdapter = {
  async put(key, data, mimeType): Promise<MediaRecord> {
    const target = safePath(key);
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
      await stat(safePath(key));
      return `/api/media/${encodeURI(key)}`;
    } catch {
      return null;
    }
  },

  async remove(key) {
    try {
      await unlink(safePath(key));
    } catch {
      // Already absent is the outcome the caller asked for.
    }
  },

  async list() {
    try {
      const names = await readdir(mediaDir());
      const records = await Promise.all(
        names.map(async (name): Promise<MediaRecord | null> => {
          try {
            const info = await stat(path.join(mediaDir(), name));
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

export const postgresAdapter: StorageAdapter = {
  id: 'postgres',
  displayName: 'Postgres (any host)',
  docsUrl: 'https://getopenportfolio.vercel.app/docs/self-hosting',

  capabilities: {
    durable: true,
    auth: 'none',
    fileStorage: 'proxy',
    maxUploadBytes: 25 * 1024 * 1024,
    fullTextSearch: true,
    realtime: false,
    transactions: true,
    // Content survives anywhere, but uploads land on disk — so a host that
    // discards its disk would lose every image while keeping the text, which
    // is a confusing half-failure worth refusing outright.
    worksOnEphemeralHosts: false,
  },

  health: () => health(sql(), 'Postgres'),

  async provision() {
    await provisionSchema(sql());
    await mkdir(mediaDir(), { recursive: true });
    await migrateSnapshotMessages({
      readSnapshot: (channel) => postgresAdapter.readSnapshot(channel),
      writeSnapshot: (channel, state) => postgresAdapter.writeSnapshot(channel, state),
      listMessages: () => postgresAdapter.messages.list(),
      appendMessage: (message) => postgresAdapter.messages.append(message),
    });
  },

  readSnapshot: (channel) => readSnapshot(sql(), channel),
  readSnapshotMeta: (channel) => readSnapshotMeta(sql(), channel),
  writeSnapshot: (channel, state, expected) => writeSnapshot(sql(), channel, state, expected),
  readOwner: () => readOwner(sql()),
  writeOwner: (owner) => writeOwner(sql(), owner),

  kv: makeKvAdapter(sql),
  media,
  messages: makeMessagesAdapter(sql),
  subscribers: makeSubscribersAdapter(sql),
};
