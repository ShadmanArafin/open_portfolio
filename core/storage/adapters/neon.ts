import 'server-only';
import { del, head, list, put } from '@vercel/blob';
import type { MediaAdapter, StorageAdapter } from '../contract';
import { AdapterConfigError } from '../contract';
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
 * Neon Postgres for content, Vercel Blob for media.
 *
 * Deliberately the second hosted adapter, because it is structurally as
 * different from Supabase as the options get: two separate services rather than
 * one, with the database and the object store sharing nothing. If the contract
 * survives both of these it will survive the rest — which is the whole reason
 * for building a second adapter before building more screens.
 *
 * Neon suspends an idle database but resumes in milliseconds, so unlike some
 * free tiers a quiet portfolio does not come back dead after a week.
 */

function connectionString(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new AdapterConfigError(
      'Neon is selected but no database URL is set. Add DATABASE_URL — the pooled ' +
        'connection string from your Neon dashboard.'
    );
  }
  return url;
}

function sql() {
  return getSql(connectionString());
}

function blobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new AdapterConfigError(
      'Uploads need a Vercel Blob store. Add the Blob integration to your project, which ' +
        'sets BLOB_READ_WRITE_TOKEN for you.'
    );
  }
  return token;
}

const media: MediaAdapter = {
  async put(key, data, mimeType) {
    const result = await put(key, data as unknown as Blob, {
      access: 'public',
      contentType: mimeType,
      token: blobToken(),
      // Without this, Blob appends a random suffix to every filename, and the
      // key we return would not be the key we could look up again.
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return {
      key,
      url: result.url,
      mimeType,
      sizeBytes: data.byteLength,
      uploadedAt: new Date().toISOString(),
    };
  },

  async resolveUrl(key) {
    try {
      const found = await head(key, { token: blobToken() });
      return found?.url ?? null;
    } catch {
      // `head` throws rather than returning null when the blob is absent.
      return null;
    }
  },

  async remove(key) {
    try {
      await del(key, { token: blobToken() });
    } catch {
      // Already gone is the outcome the caller wanted.
    }
  },

  async list() {
    const { blobs } = await list({ token: blobToken() });
    return blobs.map((blob) => ({
      key: blob.pathname,
      url: blob.url,
      mimeType: 'application/octet-stream',
      sizeBytes: blob.size,
      uploadedAt: new Date(blob.uploadedAt).toISOString(),
    }));
  },
};

export const neonAdapter: StorageAdapter = {
  id: 'neon',
  displayName: 'Neon Postgres + Vercel Blob',
  docsUrl: 'https://github.com/ShadmanArafin/open_portfolio_builder#choose-your-backend',

  capabilities: {
    durable: true,
    auth: 'none',
    fileStorage: 'presigned',
    maxUploadBytes: 100 * 1024 * 1024,
    fullTextSearch: true,
    realtime: false,
    transactions: true,
    worksOnEphemeralHosts: true,
  },

  health: () => health(sql(), 'Neon Postgres'),

  async provision() {
    await provisionSchema(sql());
    // No bucket to create: Vercel Blob is provisioned by adding the
    // integration, and the token's existence is the only thing to check.
    blobToken();
    await migrateSnapshotMessages({
      readSnapshot: (channel) => neonAdapter.readSnapshot(channel),
      writeSnapshot: (channel, state) => neonAdapter.writeSnapshot(channel, state),
      listMessages: () => neonAdapter.messages.list(),
      appendMessage: (message) => neonAdapter.messages.append(message),
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
