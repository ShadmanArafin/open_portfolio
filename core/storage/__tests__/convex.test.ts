import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runConformanceSuite } from '../conformance';
import { convexAdapter, __setConvexFetch } from '../adapters/convex';
import type { CMSState, ContactMessage } from '@/cms/types/cms';
import type { Subscriber } from '@/core/newsletter/schema';
import type { OwnerRecord, PasskeyCredential, StoredRecord } from '../contract';

interface MockState {
  owner: OwnerRecord | null;
  snapshots: Map<string, { state: CMSState; revision: number }>;
  kv: Map<string, { value: unknown; expiresAt: number | null }>;
  messages: Map<string, ContactMessage>;
  subscribers: Map<string, Subscriber>;
  passkeys: Map<string, PasskeyCredential>;
  records: Map<string, Map<string, StoredRecord>>;
  singletons: Map<string, unknown>;
  media: Map<
    string,
    { key: string; storageId: string; mimeType: string; sizeBytes: number; url: string }
  >;
  storage: Map<string, { bytes: Uint8Array; mimeType: string }>;
}

function createMockState(): MockState {
  return {
    owner: null,
    snapshots: new Map(),
    kv: new Map(),
    messages: new Map(),
    subscribers: new Map(),
    passkeys: new Map(),
    records: new Map(),
    singletons: new Map(),
    media: new Map(),
    storage: new Map(),
  };
}

let mockState = createMockState();

function resetMockState(): void {
  mockState = createMockState();
}

function setupMockFetch(): void {
  __setConvexFetch(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? 'GET';

    // Storage upload
    if (url.endsWith('/api/storage/upload') && method === 'POST') {
      const storageId = `st_${Math.random().toString(36).slice(2)}`;
      const contentType =
        (init?.headers as Record<string, string>)?.['Content-Type'] || 'application/octet-stream';
      let bytes: Uint8Array;
      if (init?.body instanceof Uint8Array) {
        bytes = init.body;
      } else if (init?.body instanceof ArrayBuffer) {
        bytes = new Uint8Array(init.body);
      } else {
        bytes = new Uint8Array(0);
      }
      mockState.storage.set(storageId, { bytes, mimeType: contentType });
      return new Response(JSON.stringify({ storageId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Storage download
    if (url.includes('/api/storage/') && method === 'GET') {
      const storageId = url.split('/api/storage/')[1];
      const found = mockState.storage.get(storageId);
      if (!found) return new Response('Not found', { status: 404 });
      return new Response(Buffer.from(found.bytes), {
        status: 200,
        headers: { 'Content-Type': found.mimeType },
      });
    }

    // Query & Mutation API
    if (url.endsWith('/api/query') || url.endsWith('/api/mutation')) {
      const body = JSON.parse((init?.body as string) || '{}') as {
        path: string;
        args: Record<string, unknown>;
      };
      const { path, args } = body;

      const success = (value: unknown) =>
        new Response(JSON.stringify({ status: 'success', value }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      const error = (msg: string) =>
        new Response(JSON.stringify({ status: 'error', errorMessage: msg }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      switch (path) {
        case 'opb:readOwner':
          return success(mockState.owner);

        case 'opb:writeOwner':
          mockState.owner = args.owner as OwnerRecord;
          return success(null);

        case 'opb:health':
          return success({ ok: true });

        case 'opb:provision':
          return success(null);

        case 'opb:readSnapshot': {
          const channel = args.channel as string;
          const snap = mockState.snapshots.get(channel);
          return success(snap ?? null);
        }

        case 'opb:writeSnapshot': {
          const channel = args.channel as string;
          const current = mockState.snapshots.get(channel);
          const currentRev = current?.revision ?? 0;
          const expectedRev = args.expectedRevision as number | undefined;

          if (expectedRev !== undefined && expectedRev !== currentRev) {
            return error(`RevisionConflictError: expected ${expectedRev}, current ${currentRev}`);
          }

          const nextRev = currentRev + 1;
          mockState.snapshots.set(channel, {
            state: args.state as CMSState,
            revision: nextRev,
          });
          return success({ revision: nextRev });
        }

        case 'opb:kvGet': {
          const nsKey = `${args.ns}:${args.key}`;
          const entry = mockState.kv.get(nsKey);
          if (!entry) return success({ value: null });
          if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
            mockState.kv.delete(nsKey);
            return success({ value: null });
          }
          return success({ value: entry.value });
        }

        case 'opb:kvSet': {
          const nsKey = `${args.ns}:${args.key}`;
          const ttlSeconds = args.ttlSeconds as number | undefined;
          const expiresAt = typeof ttlSeconds === 'number' ? Date.now() + ttlSeconds * 1000 : null;
          mockState.kv.set(nsKey, { value: args.value, expiresAt });
          return success(null);
        }

        case 'opb:kvDel': {
          mockState.kv.delete(`${args.ns}:${args.key}`);
          return success(null);
        }

        case 'opb:kvIncr': {
          const nsKey = `${args.ns}:${args.key}`;
          const entry = mockState.kv.get(nsKey);
          const current = typeof entry?.value === 'number' ? entry.value : 0;
          const next = current + 1;
          const ttlSeconds = (args.ttlSeconds as number) || 60;
          mockState.kv.set(nsKey, { value: next, expiresAt: Date.now() + ttlSeconds * 1000 });
          return success({ count: next });
        }

        case 'opb:kvClear': {
          const prefix = `${args.ns}:`;
          for (const k of mockState.kv.keys()) {
            if (k.startsWith(prefix)) mockState.kv.delete(k);
          }
          return success(null);
        }

        case 'opb:messagesAppend': {
          const msg = args.message as ContactMessage;
          mockState.messages.set(msg.id, msg);
          return success(null);
        }

        case 'opb:messagesList': {
          const list = [...mockState.messages.values()].sort((a, b) => {
            const timeA = a.receivedAt || (a as { createdAt?: string }).createdAt || '';
            const timeB = b.receivedAt || (b as { createdAt?: string }).createdAt || '';
            return timeB.localeCompare(timeA);
          });
          const limit = (args.limit as number) || 100;
          return success(list.slice(0, limit));
        }

        case 'opb:messagesUpdate': {
          const id = args.id as string;
          const existing = mockState.messages.get(id);
          if (existing) {
            mockState.messages.set(id, { ...existing, ...(args.patch as Partial<ContactMessage>) });
          }
          return success(null);
        }

        case 'opb:messagesRemove': {
          mockState.messages.delete(args.id as string);
          return success(null);
        }

        case 'opb:subscribersAppend': {
          const sub = args.subscriber as Subscriber;
          mockState.subscribers.set(sub.id, sub);
          return success(null);
        }

        case 'opb:subscribersList': {
          const list = [...mockState.subscribers.values()].sort((a, b) => {
            const timeA = a.requestedAt || '';
            const timeB = b.requestedAt || '';
            return timeB.localeCompare(timeA);
          });
          return success(list);
        }

        case 'opb:subscribersUpdate': {
          const id = args.id as string;
          const existing = mockState.subscribers.get(id);
          if (existing) {
            mockState.subscribers.set(id, { ...existing, ...(args.patch as Partial<Subscriber>) });
          }
          return success(null);
        }

        case 'opb:subscribersRemove': {
          mockState.subscribers.delete(args.id as string);
          return success(null);
        }

        case 'opb:passkeysList':
          return success([...mockState.passkeys.values()]);

        case 'opb:passkeysGet':
          return success(mockState.passkeys.get(args.id as string) ?? null);

        case 'opb:passkeysPut': {
          const cred = args.credential as PasskeyCredential;
          mockState.passkeys.set(cred.id, cred);
          return success(null);
        }

        case 'opb:passkeysUpdate': {
          const id = args.id as string;
          const existing = mockState.passkeys.get(id);
          if (existing) {
            mockState.passkeys.set(id, {
              ...existing,
              ...(args.patch as Partial<PasskeyCredential>),
            });
          }
          return success(null);
        }

        case 'opb:passkeysRemove': {
          mockState.passkeys.delete(args.id as string);
          return success(null);
        }

        case 'opb:recordsList': {
          const col = args.collection as string;
          const map = mockState.records.get(col) ?? new Map();
          const all = [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          const offset = (args.offset as number) || 0;
          const limit = (args.limit as number) || 50;
          return success({
            records: all.slice(offset, offset + limit),
            total: all.length,
          });
        }

        case 'opb:recordsGet': {
          const col = args.collection as string;
          const map = mockState.records.get(col);
          return success(map?.get(args.id as string) ?? null);
        }

        case 'opb:recordsPut': {
          const col = args.collection as string;
          const id = args.id as string;
          let map = mockState.records.get(col);
          if (!map) {
            map = new Map();
            mockState.records.set(col, map);
          }
          const existing = map.get(id);
          const currentRev = existing?.revision ?? 0;
          const expectedRev = args.expectedRevision as number | undefined;

          if (expectedRev !== undefined && expectedRev !== currentRev) {
            return error(`RevisionConflictError: expected ${expectedRev}, current ${currentRev}`);
          }

          const nextRev = currentRev + 1;
          const stored: StoredRecord = {
            id,
            revision: nextRev,
            data: args.data,
            updatedAt: new Date().toISOString(),
          };
          map.set(id, stored);
          return success(stored);
        }

        case 'opb:recordsRemove': {
          const col = args.collection as string;
          mockState.records.get(col)?.delete(args.id as string);
          return success(null);
        }

        case 'opb:recordsCollections': {
          const cols: string[] = [];
          for (const [col, map] of mockState.records.entries()) {
            if (map.size > 0) cols.push(col);
          }
          return success(cols.sort());
        }

        case 'opb:recordsGetSingleton': {
          const col = args.collection as string;
          return success({ data: mockState.singletons.get(col) ?? null });
        }

        case 'opb:recordsPutSingleton': {
          const col = args.collection as string;
          mockState.singletons.set(col, args.data);
          return success(null);
        }

        case 'opb:mediaGet': {
          return success(mockState.media.get(args.key as string) ?? null);
        }

        case 'opb:mediaList': {
          return success([...mockState.media.values()]);
        }

        case 'opb:mediaPut': {
          const item = {
            key: args.key as string,
            storageId: args.storageId as string,
            mimeType: args.mimeType as string,
            sizeBytes: args.sizeBytes as number,
            url: args.url as string,
            uploadedAt: (args.uploadedAt as string) || new Date().toISOString(),
          };
          mockState.media.set(item.key, item);
          return success(item);
        }

        case 'opb:mediaRemove': {
          mockState.media.delete(args.key as string);
          return success(null);
        }

        default:
          return error(`Unknown function: ${path}`);
      }
    }

    return new Response('Not found', { status: 404 });
  });
}

beforeAll(() => {
  process.env.CONVEX_URL = 'https://mock-opb.convex.cloud';
  process.env.CONVEX_ADMIN_KEY = 'mock_secret_key_123';
  setupMockFetch();
});

afterAll(() => {
  __setConvexFetch(null);
  delete process.env.CONVEX_URL;
  delete process.env.CONVEX_ADMIN_KEY;
});

runConformanceSuite(
  { describe, it, expect } as never,
  'convex',
  async () => convexAdapter,
  async () => {
    resetMockState();
    await convexAdapter.provision();
  }
);

describe('convex adapter configuration', () => {
  it('throws AdapterConfigError when url and deployment are missing', async () => {
    delete process.env.CONVEX_URL;
    delete process.env.CONVEX_DEPLOYMENT;
    process.env.CONVEX_ADMIN_KEY = 'mock_key';
    await expect(convexAdapter.readOwner()).rejects.toThrow(/CONVEX_URL or CONVEX_DEPLOYMENT/);
  });

  it('throws AdapterConfigError when admin key is missing', async () => {
    process.env.CONVEX_URL = 'https://mock.convex.cloud';
    delete process.env.CONVEX_ADMIN_KEY;
    delete process.env.CONVEX_TOKEN;
    await expect(convexAdapter.readOwner()).rejects.toThrow(/CONVEX_ADMIN_KEY or CONVEX_TOKEN/);
  });
});
