import 'server-only';
import type { CMSState, ContactMessage } from '@/cms/types/cms';
import type { Subscriber } from '@/core/newsletter/schema';
import type {
  Channel,
  HealthReport,
  KvNamespace,
  MediaRecord,
  MessageListOptions,
  OwnerRecord,
  PasskeyCredential,
  RecordListOptions,
  RecordPage,
  SnapshotRead,
  StorageAdapter,
  StoredRecord,
} from '../contract';
import { AdapterConfigError, RevisionConflictError } from '../contract';
import { assertRecordAddress, decodeRecordCursor, encodeRecordCursor } from '../contract';
import { migrateSnapshotMessages } from './_shared/migrate-messages';

/**
 * Convex: reactive document database and file storage.
 *
 * Communicates via Convex's HTTP API (`/api/query`, `/api/mutation`,
 * `/api/storage/upload`), using standard HTTP requests without requiring
 * heavy proprietary client dependencies in serverless/edge environments.
 *
 * Configured via:
 * - `CONVEX_URL` (or derived from `CONVEX_DEPLOYMENT`)
 * - `CONVEX_ADMIN_KEY` or `CONVEX_TOKEN`
 */

function resolveConvexUrl(): string {
  if (process.env.CONVEX_URL) {
    return process.env.CONVEX_URL.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_CONVEX_URL) {
    return process.env.NEXT_PUBLIC_CONVEX_URL.replace(/\/$/, '');
  }
  const deployment = process.env.CONVEX_DEPLOYMENT;
  if (deployment) {
    // Deployments are named like "dev:happy-otter-123" or "prod:happy-otter-123"
    const name = deployment.includes(':') ? deployment.split(':')[1] : deployment;
    return `https://${name}.convex.cloud`;
  }
  throw new AdapterConfigError(
    'Convex is selected but no deployment is configured. Set CONVEX_URL or CONVEX_DEPLOYMENT.'
  );
}

function resolveConvexKey(): string {
  const key = process.env.CONVEX_ADMIN_KEY || process.env.CONVEX_TOKEN;
  if (!key) {
    throw new AdapterConfigError(
      'Convex is selected but CONVEX_ADMIN_KEY or CONVEX_TOKEN is not set.'
    );
  }
  return key;
}

export class ConvexError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data?: unknown
  ) {
    super(message);
    this.name = 'ConvexError';
  }
}

let customFetch: typeof fetch | null = null;

/** Test seam: override fetch for unit / mock conformance tests. */
export function __setConvexFetch(fn: typeof fetch | null): void {
  customFetch = fn;
}

async function doFetch(url: string, init?: RequestInit): Promise<Response> {
  const fetcher = customFetch ?? fetch;
  return fetcher(url, init);
}

async function callConvex<T>(
  type: 'query' | 'mutation',
  path: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  const url = `${resolveConvexUrl()}/api/${type}`;
  const token = resolveConvexKey();

  const res = await doFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ path, args, format: 'json' }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new ConvexError(
      `Convex ${type} ${path} failed (${res.status}): ${errorText}`,
      res.status
    );
  }

  const json = (await res.json()) as {
    status?: string;
    value?: T;
    errorMessage?: string;
    errorData?: unknown;
  };

  if (json.status === 'error') {
    const msg = json.errorMessage || 'Unknown Convex error';
    if (msg.includes('RevisionConflictError') || msg.includes('revision conflict')) {
      const match = /expected (\d+).*current (\d+)/i.exec(msg);
      if (match) {
        throw new RevisionConflictError(Number(match[1]), Number(match[2]));
      }
      throw new RevisionConflictError(0, 1);
    }
    throw new ConvexError(msg, 400, json.errorData);
  }

  return (json.value !== undefined ? json.value : (json as unknown)) as T;
}

export const convexAdapter: StorageAdapter = {
  id: 'convex',
  displayName: 'Convex',
  docsUrl: 'https://docs.convex.dev',
  capabilities: {
    durable: true,
    auth: 'none',
    fileStorage: 'proxy',
    maxUploadBytes: 25 * 1024 * 1024,
    fullTextSearch: false,
    realtime: true,
    transactions: true,
    worksOnEphemeralHosts: true,
  },

  async readOwner(): Promise<OwnerRecord | null> {
    return callConvex<OwnerRecord | null>('query', 'opb:readOwner');
  },

  async writeOwner(owner: OwnerRecord): Promise<void> {
    await callConvex<void>('mutation', 'opb:writeOwner', { owner });
  },

  kv: {
    async get<T>(ns: KvNamespace, key: string): Promise<T | null> {
      const res = await callConvex<{ value: T | null }>('query', 'opb:kvGet', { ns, key });
      return res?.value ?? null;
    },

    async set<T>(ns: KvNamespace, key: string, value: T, ttlSeconds?: number): Promise<void> {
      await callConvex<void>('mutation', 'opb:kvSet', { ns, key, value, ttlSeconds });
    },

    async del(ns: KvNamespace, key: string): Promise<void> {
      await callConvex<void>('mutation', 'opb:kvDel', { ns, key });
    },

    async incr(ns: KvNamespace, key: string, ttlSeconds: number): Promise<number> {
      const res = await callConvex<{ count: number }>('mutation', 'opb:kvIncr', {
        ns,
        key,
        ttlSeconds,
      });
      return res.count;
    },

    async clear(ns: KvNamespace): Promise<void> {
      await callConvex<void>('mutation', 'opb:kvClear', { ns });
    },
  },

  async health(): Promise<HealthReport> {
    const started = Date.now();
    try {
      await callConvex<{ ok: boolean }>('query', 'opb:health');
      return { ok: true, detail: 'Convex connected', latencyMs: Date.now() - started };
    } catch (err) {
      return {
        ok: false,
        detail: err instanceof Error ? err.message : String(err),
        latencyMs: Date.now() - started,
      };
    }
  },

  async provision(): Promise<void> {
    await callConvex<void>('mutation', 'opb:provision');
    await migrateSnapshotMessages({
      readSnapshot: (ch) => this.readSnapshot(ch),
      writeSnapshot: (ch, st) => this.writeSnapshot(ch, st),
      listMessages: () => this.messages.list(),
      appendMessage: (m) => this.messages.append(m),
    });
  },

  async readSnapshot(channel: Channel): Promise<CMSState | null> {
    const res = await this.readSnapshotMeta(channel);
    return res?.state ?? null;
  },

  async readSnapshotMeta(channel: Channel): Promise<SnapshotRead | null> {
    const res = await callConvex<{ state: CMSState; revision: number } | null>(
      'query',
      'opb:readSnapshot',
      {
        channel,
      }
    );
    if (!res) return null;
    return {
      state: res.state,
      revision: res.revision,
    };
  },

  async writeSnapshot(
    channel: Channel,
    state: CMSState,
    expectedRevision?: number
  ): Promise<number> {
    const res = await callConvex<{ revision: number }>('mutation', 'opb:writeSnapshot', {
      channel,
      state,
      expectedRevision,
    });
    return res.revision;
  },

  media: {
    async list(): Promise<MediaRecord[]> {
      const res = await callConvex<MediaRecord[]>('query', 'opb:mediaList');
      return res ?? [];
    },

    async resolveUrl(key: string): Promise<string | null> {
      const rec = await callConvex<MediaRecord | null>('query', 'opb:mediaGet', { key });
      return rec?.url ?? null;
    },

    async put(key: string, data: Uint8Array, mimeType: string): Promise<MediaRecord> {
      // 1. Upload bytes to Convex storage
      const uploadUrl = `${resolveConvexUrl()}/api/storage/upload`;
      const token = resolveConvexKey();

      const uploadRes = await doFetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': mimeType,
          Authorization: `Bearer ${token}`,
        },
        body: Buffer.from(data),
      });

      if (!uploadRes.ok) {
        throw new ConvexError(
          `Convex storage upload failed: ${uploadRes.statusText}`,
          uploadRes.status
        );
      }

      const { storageId } = (await uploadRes.json()) as { storageId: string };

      // 2. Register media record in Convex
      return callConvex<MediaRecord>('mutation', 'opb:mediaPut', {
        key,
        storageId,
        mimeType,
        sizeBytes: data.byteLength,
        url: `/api/media/${encodeURIComponent(key)}`,
        uploadedAt: new Date().toISOString(),
      });
    },

    async remove(key: string): Promise<void> {
      await callConvex<void>('mutation', 'opb:mediaRemove', { key });
    },

    async readBytes(
      key: string
    ): Promise<{ data: Uint8Array<ArrayBuffer>; mimeType: string; sizeBytes: number } | null> {
      const rec = await callConvex<MediaRecord | null>('query', 'opb:mediaGet', { key });
      if (!rec) return null;
      const storageId = (rec as unknown as { storageId?: string }).storageId;
      if (!storageId) return null;

      const fileUrl = `${resolveConvexUrl()}/api/storage/${storageId}`;
      const res = await doFetch(fileUrl);
      if (!res.ok) return null;

      const buffer = await res.arrayBuffer();
      return {
        data: new Uint8Array(buffer) as Uint8Array<ArrayBuffer>,
        mimeType: rec.mimeType,
        sizeBytes: buffer.byteLength,
      };
    },
  },

  messages: {
    async append(message: ContactMessage): Promise<void> {
      await callConvex<void>('mutation', 'opb:messagesAppend', { message });
    },

    async list(options?: MessageListOptions): Promise<ContactMessage[]> {
      const res = await callConvex<ContactMessage[]>('query', 'opb:messagesList', {
        limit: options?.limit,
      });
      return res ?? [];
    },

    async update(id: string, patch: Partial<ContactMessage>): Promise<void> {
      await callConvex<void>('mutation', 'opb:messagesUpdate', { id, patch });
    },

    async remove(id: string): Promise<void> {
      await callConvex<void>('mutation', 'opb:messagesRemove', { id });
    },
  },

  subscribers: {
    async append(subscriber: Subscriber): Promise<void> {
      await callConvex<void>('mutation', 'opb:subscribersAppend', { subscriber });
    },

    async list(): Promise<Subscriber[]> {
      const res = await callConvex<Subscriber[]>('query', 'opb:subscribersList');
      return res ?? [];
    },

    async update(id: string, patch: Partial<Subscriber>): Promise<void> {
      await callConvex<void>('mutation', 'opb:subscribersUpdate', { id, patch });
    },

    async remove(id: string): Promise<void> {
      await callConvex<void>('mutation', 'opb:subscribersRemove', { id });
    },
  },

  passkeys: {
    async list(): Promise<PasskeyCredential[]> {
      const res = await callConvex<PasskeyCredential[]>('query', 'opb:passkeysList');
      return res ?? [];
    },

    async get(id: string): Promise<PasskeyCredential | null> {
      return callConvex<PasskeyCredential | null>('query', 'opb:passkeysGet', { id });
    },

    async put(credential: PasskeyCredential): Promise<void> {
      await callConvex<void>('mutation', 'opb:passkeysPut', { credential });
    },

    async update(id: string, patch: Partial<PasskeyCredential>): Promise<void> {
      await callConvex<void>('mutation', 'opb:passkeysUpdate', { id, patch });
    },

    async remove(id: string): Promise<void> {
      await callConvex<void>('mutation', 'opb:passkeysRemove', { id });
    },
  },

  records: {
    async list(collection: string, options?: RecordListOptions): Promise<RecordPage> {
      assertRecordAddress(collection);
      const offset = decodeRecordCursor(options?.cursor);
      const limit = options?.limit ?? 50;

      const res = await callConvex<{ records: StoredRecord[]; total: number }>(
        'query',
        'opb:recordsList',
        {
          collection,
          offset,
          limit,
        }
      );

      const records = res?.records ?? [];
      const total = res?.total ?? records.length;
      const nextOffset = offset + records.length;
      const nextCursor = nextOffset < total ? encodeRecordCursor(nextOffset) : null;

      return { records, nextCursor };
    },

    async get(collection: string, id: string): Promise<StoredRecord | null> {
      assertRecordAddress(collection, id);
      return callConvex<StoredRecord | null>('query', 'opb:recordsGet', { collection, id });
    },

    async put(
      collection: string,
      id: string,
      data: unknown,
      expectedRevision?: number
    ): Promise<StoredRecord> {
      assertRecordAddress(collection, id);
      return callConvex<StoredRecord>('mutation', 'opb:recordsPut', {
        collection,
        id,
        data,
        expectedRevision,
      });
    },

    async remove(collection: string, id: string): Promise<void> {
      assertRecordAddress(collection, id);
      await callConvex<void>('mutation', 'opb:recordsRemove', { collection, id });
    },

    async collections(): Promise<string[]> {
      const res = await callConvex<string[]>('query', 'opb:recordsCollections');
      return res ?? [];
    },

    async getSingleton(collection: string): Promise<unknown | null> {
      assertRecordAddress(collection);
      const res = await callConvex<{ data: unknown } | null>('query', 'opb:recordsGetSingleton', {
        collection,
      });
      return res?.data ?? null;
    },

    async putSingleton(collection: string, data: unknown): Promise<void> {
      assertRecordAddress(collection);
      await callConvex<void>('mutation', 'opb:recordsPutSingleton', { collection, data });
    },
  },
};
