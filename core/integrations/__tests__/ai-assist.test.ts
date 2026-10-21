import { afterEach, describe, expect, it, vi } from 'vitest';
import { aiAssistSchema, assistUrl } from '../definitions/ai-assist';

afterEach(() => vi.unstubAllGlobals());

async function definition() {
  const { getIntegration } = await import('../registry');
  return getIntegration('ai-assist')!;
}

function stubModels(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: status < 300, status, json: async () => body }))
  );
}

describe('writing assistant settings', () => {
  it('needs an address and a model; the key is a secret', async () => {
    expect(
      aiAssistSchema.safeParse({ baseUrl: 'http://localhost:11434/v1', model: 'llama3.2' }).success
    ).toBe(true);
    expect(aiAssistSchema.safeParse({ baseUrl: 'http://x' }).success).toBe(false);
    expect((await definition()).secretFields).toEqual(['apiKey']);
    expect(assistUrl('http://localhost:11434/v1/', '/models')).toBe(
      'http://localhost:11434/v1/models'
    );
  });

  it('passes when the server has the models, Ollama’s :latest included', async () => {
    stubModels(200, { data: [{ id: 'llama3.2:latest' }, { id: 'llava:latest' }] });
    const result = await (
      await definition()
    ).test({
      baseUrl: 'http://localhost:11434/v1',
      model: 'llama3.2',
      visionModel: 'llava',
    } as never);
    expect(result.ok).toBe(true);
  });

  it('names a missing model and lists what is there', async () => {
    stubModels(200, { data: [{ id: 'llama3.2:latest' }] });
    const result = await (
      await definition()
    ).test({
      baseUrl: 'http://localhost:11434/v1',
      model: 'mistral',
    } as never);
    expect(result).toEqual({
      ok: false,
      message: expect.stringContaining('does not have mistral. It has: llama3.2:latest'),
    });
  });

  it('says plainly when nothing answers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error('ECONNREFUSED')))
    );
    const result = await (await definition()).test({ baseUrl: 'http://nope', model: 'm' } as never);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Nothing answered');
  });
});
