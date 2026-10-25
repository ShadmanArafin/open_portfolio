import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runConformanceSuite } from '../conformance';
import { cloudflareRestAdapter, __setCloudflareRestFetch } from '../adapters/cloudflare-rest';
import type { CMSState, ContactMessage } from '@/cms/types/cms';
import type { Subscriber } from '@/core/newsletter/schema';
import type { OwnerRecord, PasskeyCredential, StoredRecord } from '../contract';

interface MockState {
  owner: OwnerRecord | null;
  content: Map<string, { state: CMSState; revision: number }>;
  kv: Map<string, { value: unknown; expiresAt: number | null }>;
  messages: Map<string, { id: string; receivedAt: string; data: ContactMessage }>;
  subscribers: Map<string, { id: string; requestedAt: string; data: Subscriber }>;
  passkeys: Map<string, { id: string; createdAt: string; data: PasskeyCredential }>;
  records: Map<string, Map<string, StoredRecord>>;
  singletons: Map<string, unknown>;
  mediaMeta: Map<string, { key: string; mimeType: string; sizeBytes: number; updatedAt: string }>;
  r2Objects: Map<string, { data: Uint8Array; mimeType: string }>;
}

function createMockState(): MockState {
  return {
    owner: null,
    content: new Map(),
    kv: new Map(),
    messages: new Map(),
    subscribers: new Map(),
    passkeys: new Map(),
    records: new Map(),
    singletons: new Map(),
    mediaMeta: new Map(),
    r2Objects: new Map(),
  };
}

let mockState = createMockState();

function resetState(): void {
  mockState = createMockState();
}

function setupMockFetch(): void {
  __setCloudflareRestFetch(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? 'GET';

    // R2 REST endpoints
    if (url.includes('/r2/buckets/')) {
      const match = /\/objects\/([^?#]+)/.exec(url);
      const key = match ? decodeURIComponent(match[1]) : '';

      if (method === 'PUT') {
        const mimeType =
          (init?.headers as Record<string, string>)?.['Content-Type'] || 'application/octet-stream';
        let data: Uint8Array;
        if (init?.body instanceof Uint8Array) {
          data = init.body;
        } else if (init?.body instanceof ArrayBuffer) {
          data = new Uint8Array(init.body);
        } else if (Buffer.isBuffer(init?.body)) {
          data = new Uint8Array(init.body);
        } else {
          data = new Uint8Array(0);
        }
        mockState.r2Objects.set(key, { data, mimeType });
        return new Response(null, { status: 200 });
      }

      if (method === 'GET') {
        const obj = mockState.r2Objects.get(key);
        if (!obj) return new Response('Not found', { status: 404 });
        return new Response(Buffer.from(obj.data), {
          status: 200,
          headers: { 'Content-Type': obj.mimeType },
        });
      }

      if (method === 'DELETE') {
        mockState.r2Objects.delete(key);
        return new Response(null, { status: 200 });
      }
    }

    // D1 Query REST endpoint
    if (url.includes('/d1/database/') && url.endsWith('/query')) {
      const body = JSON.parse((init?.body as string) || '{}') as {
        sql: string;
        params?: unknown[];
      };
      const { sql, params = [] } = body;
      const cleanSql = sql.replace(/\s+/g, ' ').trim();

      const success = (results: unknown[]) =>
        new Response(
          JSON.stringify({
            result: [{ results, success: true, meta: {} }],
            success: true,
            errors: [],
            messages: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      // CREATE TABLE / CREATE INDEX -> success
      if (cleanSql.startsWith('CREATE TABLE') || cleanSql.startsWith('CREATE INDEX')) {
        return success([]);
      }

      // SELECT 1 (health check)
      if (cleanSql === 'SELECT 1') {
        return success([{ '1': 1 }]);
      }

      // Owner
      if (
        cleanSql.includes('SELECT email, passphrase_hash, created_at, session_epoch FROM opb_owner')
      ) {
        if (!mockState.owner) return success([]);
        return success([
          {
            email: mockState.owner.email,
            passphrase_hash: mockState.owner.passphraseHash,
            created_at: mockState.owner.createdAt,
            session_epoch: mockState.owner.sessionEpoch,
          },
        ]);
      }
      if (cleanSql.includes('INSERT INTO opb_owner')) {
        mockState.owner = {
          email: params[0] as string,
          passphraseHash: params[1] as string,
          createdAt: params[2] as string,
          sessionEpoch: params[3] as number,
        };
        return success([]);
      }

      // Snapshots (opb_content)
      if (cleanSql.includes('SELECT data, revision FROM opb_content WHERE channel = ?')) {
        const ch = params[0] as string;
        const entry = mockState.content.get(ch);
        if (!entry) return success([]);
        return success([{ data: JSON.stringify(entry.state), revision: entry.revision }]);
      }
      if (cleanSql.includes('INSERT INTO opb_content')) {
        const ch = params[0] as string;
        const state = JSON.parse(params[1] as string) as CMSState;
        const revision = params[2] as number;
        mockState.content.set(ch, { state, revision });
        return success([]);
      }

      // KV
      if (cleanSql.includes('SELECT value, expires_at FROM opb_kv')) {
        const ns = params[0] as string;
        const key = params[1] as string;
        const now = (params[2] as number) || Date.now();
        const entry = mockState.kv.get(`${ns}:${key}`);
        if (!entry) return success([]);
        if (entry.expiresAt !== null && entry.expiresAt <= now) {
          mockState.kv.delete(`${ns}:${key}`);
          return success([]);
        }
        return success([{ value: JSON.stringify(entry.value), expires_at: entry.expiresAt }]);
      }
      if (cleanSql.includes('INSERT INTO opb_kv')) {
        const ns = params[0] as string;
        const key = params[1] as string;
        const value = JSON.parse(params[2] as string) as unknown;
        const expiresAt = params[3] as number | null;
        mockState.kv.set(`${ns}:${key}`, { value, expiresAt });
        return success([]);
      }
      if (cleanSql.includes('DELETE FROM opb_kv WHERE ns = ? AND key = ?')) {
        const ns = params[0] as string;
        const key = params[1] as string;
        mockState.kv.delete(`${ns}:${key}`);
        return success([]);
      }
      if (cleanSql.includes('DELETE FROM opb_kv WHERE ns = ?')) {
        const ns = params[0] as string;
        const prefix = `${ns}:`;
        for (const k of mockState.kv.keys()) {
          if (k.startsWith(prefix)) mockState.kv.delete(k);
        }
        return success([]);
      }

      // Messages
      if (cleanSql.includes('INSERT INTO opb_messages')) {
        const id = params[0] as string;
        const receivedAt = params[1] as string;
        const data = JSON.parse(params[2] as string) as ContactMessage;
        mockState.messages.set(id, { id, receivedAt, data });
        return success([]);
      }
      if (cleanSql.includes('SELECT data FROM opb_messages ORDER BY received_at DESC')) {
        const sorted = [...mockState.messages.values()].sort((a, b) =>
          b.receivedAt.localeCompare(a.receivedAt)
        );
        const limit = typeof params[0] === 'number' ? params[0] : sorted.length;
        return success(sorted.slice(0, limit).map((m) => ({ data: JSON.stringify(m.data) })));
      }
      if (cleanSql.includes('SELECT data FROM opb_messages WHERE id = ?')) {
        const id = params[0] as string;
        const found = mockState.messages.get(id);
        if (!found) return success([]);
        return success([{ data: JSON.stringify(found.data) }]);
      }
      if (cleanSql.includes('UPDATE opb_messages SET data = ? WHERE id = ?')) {
        const data = JSON.parse(params[0] as string) as ContactMessage;
        const id = params[1] as string;
        const existing = mockState.messages.get(id);
        if (existing) {
          mockState.messages.set(id, { ...existing, data });
        }
        return success([]);
      }
      if (cleanSql.includes('DELETE FROM opb_messages WHERE id = ?')) {
        const id = params[0] as string;
        mockState.messages.delete(id);
        return success([]);
      }

      // Subscribers
      if (cleanSql.includes('INSERT INTO opb_subscribers')) {
        const id = params[0] as string;
        const requestedAt = params[1] as string;
        const data = JSON.parse(params[2] as string) as Subscriber;
        mockState.subscribers.set(id, { id, requestedAt, data });
        return success([]);
      }
      if (cleanSql.includes('SELECT data FROM opb_subscribers ORDER BY requested_at DESC')) {
        const sorted = [...mockState.subscribers.values()].sort((a, b) =>
          b.requestedAt.localeCompare(a.requestedAt)
        );
        return success(sorted.map((s) => ({ data: JSON.stringify(s.data) })));
      }
      if (cleanSql.includes('SELECT data FROM opb_subscribers WHERE id = ?')) {
        const id = params[0] as string;
        const found = mockState.subscribers.get(id);
        if (!found) return success([]);
        return success([{ data: JSON.stringify(found.data) }]);
      }
      if (cleanSql.includes('UPDATE opb_subscribers SET data = ? WHERE id = ?')) {
        const data = JSON.parse(params[0] as string) as Subscriber;
        const id = params[1] as string;
        const existing = mockState.subscribers.get(id);
        if (existing) {
          mockState.subscribers.set(id, { ...existing, data });
        }
        return success([]);
      }
      if (cleanSql.includes('DELETE FROM opb_subscribers WHERE id = ?')) {
        const id = params[0] as string;
        mockState.subscribers.delete(id);
        return success([]);
      }

      // Passkeys
      if (cleanSql.includes('INSERT INTO opb_passkeys')) {
        const id = params[0] as string;
        const createdAt = params[1] as string;
        const data = JSON.parse(params[2] as string) as PasskeyCredential;
        mockState.passkeys.set(id, { id, createdAt, data });
        return success([]);
      }
      if (cleanSql.includes('SELECT data FROM opb_passkeys ORDER BY created_at ASC')) {
        const sorted = [...mockState.passkeys.values()].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt)
        );
        return success(sorted.map((p) => ({ data: JSON.stringify(p.data) })));
      }
      if (cleanSql.includes('SELECT data FROM opb_passkeys WHERE id = ?')) {
        const id = params[0] as string;
        const found = mockState.passkeys.get(id);
        if (!found) return success([]);
        return success([{ data: JSON.stringify(found.data) }]);
      }
      if (cleanSql.includes('UPDATE opb_passkeys SET data = ? WHERE id = ?')) {
        const data = JSON.parse(params[0] as string) as PasskeyCredential;
        const id = params[1] as string;
        const existing = mockState.passkeys.get(id);
        if (existing) {
          mockState.passkeys.set(id, { ...existing, data });
        }
        return success([]);
      }
      if (cleanSql.includes('DELETE FROM opb_passkeys WHERE id = ?')) {
        const id = params[0] as string;
        mockState.passkeys.delete(id);
        return success([]);
      }

      // Records
      if (
        cleanSql.includes(
          'SELECT id, revision, data, updated_at FROM opb_records WHERE collection = ? ORDER BY updated_at DESC'
        )
      ) {
        const col = params[0] as string;
        const limit = params[1] as number;
        const offset = params[2] as number;
        const map = mockState.records.get(col) ?? new Map();
        const sorted = [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        const sliced = sorted.slice(offset, offset + limit);
        return success(
          sliced.map((r) => ({
            id: r.id,
            revision: r.revision,
            data: JSON.stringify(r.data),
            updated_at: r.updatedAt,
          }))
        );
      }
      if (cleanSql.includes('SELECT COUNT(*) as count FROM opb_records WHERE collection = ?')) {
        const col = params[0] as string;
        const count = mockState.records.get(col)?.size ?? 0;
        return success([{ count }]);
      }
      if (
        cleanSql.includes(
          'SELECT id, revision, data, updated_at FROM opb_records WHERE collection = ? AND id = ?'
        )
      ) {
        const col = params[0] as string;
        const id = params[1] as string;
        const rec = mockState.records.get(col)?.get(id);
        if (!rec) return success([]);
        return success([
          {
            id: rec.id,
            revision: rec.revision,
            data: JSON.stringify(rec.data),
            updated_at: rec.updatedAt,
          },
        ]);
      }
      if (cleanSql.includes('INSERT INTO opb_records')) {
        const col = params[0] as string;
        const id = params[1] as string;
        const data = JSON.parse(params[2] as string) as unknown;
        const revision = params[3] as number;
        const updatedAt = params[4] as string;
        let map = mockState.records.get(col);
        if (!map) {
          map = new Map();
          mockState.records.set(col, map);
        }
        map.set(id, { id, revision, data, updatedAt });
        return success([]);
      }
      if (cleanSql.includes('DELETE FROM opb_records WHERE collection = ? AND id = ?')) {
        const col = params[0] as string;
        const id = params[1] as string;
        mockState.records.get(col)?.delete(id);
        return success([]);
      }
      if (cleanSql.includes('SELECT DISTINCT collection FROM opb_records')) {
        const cols: { collection: string }[] = [];
        for (const [col, map] of mockState.records.entries()) {
          if (map.size > 0) cols.push({ collection: col });
        }
        cols.sort((a, b) => a.collection.localeCompare(b.collection));
        return success(cols);
      }

      // Singletons
      if (cleanSql.includes('SELECT data FROM opb_singletons WHERE collection = ?')) {
        const col = params[0] as string;
        const data = mockState.singletons.get(col);
        if (data === undefined) return success([]);
        return success([{ data: JSON.stringify(data) }]);
      }
      if (cleanSql.includes('INSERT INTO opb_singletons')) {
        const col = params[0] as string;
        const data = JSON.parse(params[1] as string) as unknown;
        mockState.singletons.set(col, data);
        return success([]);
      }

      // Media
      if (cleanSql.includes('SELECT key FROM opb_media WHERE key = ?')) {
        const key = params[0] as string;
        const found = mockState.mediaMeta.get(key);
        if (!found) return success([]);
        return success([{ key: found.key }]);
      }
      if (cleanSql.includes('SELECT mime_type FROM opb_media WHERE key = ?')) {
        const key = params[0] as string;
        const found = mockState.mediaMeta.get(key);
        if (!found) return success([]);
        return success([{ mime_type: found.mimeType }]);
      }
      if (
        cleanSql.includes(
          'SELECT key, mime_type, size_bytes, updated_at FROM opb_media WHERE key = ?'
        )
      ) {
        const key = params[0] as string;
        const found = mockState.mediaMeta.get(key);
        if (!found) return success([]);
        return success([
          {
            key: found.key,
            mime_type: found.mimeType,
            size_bytes: found.sizeBytes,
            updated_at: found.updatedAt,
          },
        ]);
      }
      if (
        cleanSql.includes(
          'SELECT key, mime_type, size_bytes, updated_at FROM opb_media ORDER BY updated_at DESC'
        )
      ) {
        const sorted = [...mockState.mediaMeta.values()].sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt)
        );
        return success(
          sorted.map((m) => ({
            key: m.key,
            mime_type: m.mimeType,
            size_bytes: m.sizeBytes,
            updated_at: m.updatedAt,
          }))
        );
      }
      if (cleanSql.includes('INSERT INTO opb_media')) {
        const key = params[0] as string;
        const mimeType = params[1] as string;
        const sizeBytes = params[2] as number;
        const updatedAt = params[3] as string;
        mockState.mediaMeta.set(key, { key, mimeType, sizeBytes, updatedAt });
        return success([]);
      }
      if (cleanSql.includes('DELETE FROM opb_media WHERE key = ?')) {
        const key = params[0] as string;
        mockState.mediaMeta.delete(key);
        return success([]);
      }

      return success([]);
    }

    return new Response('Not found', { status: 404 });
  });
}

beforeAll(() => {
  process.env.CLOUDFLARE_ACCOUNT_ID = 'mock_account_123';
  process.env.CLOUDFLARE_API_TOKEN = 'mock_token_456';
  process.env.D1_DATABASE_ID = 'mock_db_789';
  process.env.R2_BUCKET_NAME = 'mock_media';
  setupMockFetch();
});

afterAll(() => {
  __setCloudflareRestFetch(null);
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.D1_DATABASE_ID;
  delete process.env.R2_BUCKET_NAME;
});

runConformanceSuite(
  { describe, it, expect } as never,
  'cloudflare-rest',
  async () => cloudflareRestAdapter,
  async () => {
    resetState();
    await cloudflareRestAdapter.provision();
  }
);

describe('cloudflare-rest adapter configuration', () => {
  it('throws AdapterConfigError when account ID is missing', async () => {
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    await expect(cloudflareRestAdapter.readOwner()).rejects.toThrow(
      /CLOUDFLARE_ACCOUNT_ID is not set/
    );
    process.env.CLOUDFLARE_ACCOUNT_ID = 'mock_account_123';
  });

  it('throws AdapterConfigError when API token is missing', async () => {
    delete process.env.CLOUDFLARE_API_TOKEN;
    await expect(cloudflareRestAdapter.readOwner()).rejects.toThrow(
      /CLOUDFLARE_API_TOKEN is not set/
    );
    process.env.CLOUDFLARE_API_TOKEN = 'mock_token_456';
  });

  it('throws AdapterConfigError when D1 database ID is missing', async () => {
    delete process.env.D1_DATABASE_ID;
    await expect(cloudflareRestAdapter.readOwner()).rejects.toThrow(/D1_DATABASE_ID is not set/);
    process.env.D1_DATABASE_ID = 'mock_db_789';
  });
});
