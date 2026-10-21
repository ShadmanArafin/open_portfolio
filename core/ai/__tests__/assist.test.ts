import { afterEach, describe, expect, it, vi } from 'vitest';

const stored = vi.hoisted(() => ({ value: null as Record<string, unknown> | null }));
vi.mock('@/core/integrations/vault', () => ({ readConfig: async () => stored.value }));

const { AssistError, assistCapabilities, mediaKeyFromUrl, suggest } = await import('../assist');

afterEach(() => {
  vi.unstubAllGlobals();
  stored.value = null;
});

describe('the writing assistant', () => {
  it('is off, with no buttons, until connected', async () => {
    expect(await assistCapabilities()).toEqual({ text: false, alt: false });
    await expect(suggest('summary', { text: 'Hello' })).rejects.toBeInstanceOf(AssistError);
    stored.value = { baseUrl: 'http://m/v1', model: 'llama3.2' };
    expect(await assistCapabilities()).toEqual({ text: true, alt: false });
  });

  it('asks the chat endpoint with the key, and returns the cleaned answer', async () => {
    stored.value = { baseUrl: 'http://m/v1/', model: 'llama3.2', apiKey: 'k' };
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: '"A short summary."' } }] }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await suggest('summary', { title: 'Slow mornings', text: 'Words.' })).toBe(
      'A short summary.'
    );
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('http://m/v1/chat/completions');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer k');
    expect(JSON.parse(init.body as string)).toMatchObject({ model: 'llama3.2', stream: false });
  });

  it('refuses to describe anything but a picture in the media library', async () => {
    stored.value = { baseUrl: 'http://m/v1', model: 'a', visionModel: 'llava' };
    await expect(suggest('alt', { imageUrl: 'https://elsewhere.example/x.jpg' })).rejects.toThrow(
      'media library'
    );
    expect(mediaKeyFromUrl('/api/media/photo-1.jpg')).toBe('photo-1.jpg');
    expect(mediaKeyFromUrl('/api/media/..%2Fetc')).toBeNull();
  });

  it('says so when the model is down', async () => {
    stored.value = { baseUrl: 'http://m/v1', model: 'a' };
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error('down')))
    );
    await expect(suggest('description', { text: 'x' })).rejects.toThrow('did not answer');
  });
});
