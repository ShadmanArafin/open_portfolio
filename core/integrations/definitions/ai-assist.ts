import 'server-only';
import { z } from 'zod';
import { registerIntegration, type TestResult } from '../registry';

/**
 * A writing assistant on a model the owner runs or chooses.
 *
 * Off until connected, and then only ever a "Suggest" button beside a field:
 * a search description, a summary, an image's alt text. Nothing is written
 * without the owner pressing "Use it".
 *
 * It speaks the OpenAI-compatible chat API because that is the one shape
 * every free option answers: Ollama and LM Studio on the owner's own machine,
 * llama.cpp's server, vLLM. A hosted key works too, but nothing here points
 * at a paid service — the free-only rule of this project.
 *
 * Considered and not shipped: alt text in the browser with transformers.js.
 * It would add onnxruntime to every install for a feature most leave off,
 * download a few hundred megabytes of model into the owner's browser, and
 * need the admin's Content-Security-Policy opened to a model host and a
 * script CDN — the most privileged page on the site, widened for a
 * convenience. A vision model on the same endpoint (Ollama's `llava` or
 * `qwen2.5vl`, for example) does the job with none of that.
 */

export const aiAssistSchema = z.object({
  baseUrl: z.string().min(1),
  model: z.string().min(1),
  visionModel: z.string().optional(),
  apiKey: z.string().optional(),
});

export type AiAssistSettings = z.infer<typeof aiAssistSchema>;

/** `http://localhost:11434/v1/` + `/models` → `http://localhost:11434/v1/models`. */
export function assistUrl(baseUrl: string, path: string): string {
  return `${baseUrl.trim().replace(/\/+$/, '')}${path}`;
}

export function assistHeaders(config: Pick<AiAssistSettings, 'apiKey'>): Record<string, string> {
  return {
    'content-type': 'application/json',
    ...(config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : {}),
  };
}

registerIntegration<AiAssistSettings>({
  id: 'ai-assist',
  name: 'Writing assistant (your own model)',
  category: 'assist',
  summary:
    'Suggests search descriptions, summaries and alt text from a model you run — Ollama on your own computer works.',

  freeTier: {
    summary:
      'Free when the model runs on your own machine: Ollama and LM Studio are free downloads, and the models they run are free to use.',
    verifiedOn: '2026-10-21',
  },
  docsUrl: 'https://ollama.com/download',
  setup: [
    'Install Ollama (ollama.com) on a computer this site can reach — the same server is simplest.',
    'Download a model for writing, for example: ollama pull llama3.2',
    'For alt text, also download one that can see pictures, for example: ollama pull llava',
    'Paste the address below. For Ollama on the same machine it is http://localhost:11434/v1 — from inside Docker, use http://host.docker.internal:11434/v1.',
    'Type the model names exactly as Ollama lists them, and press Test.',
  ],

  fields: [
    {
      name: 'baseUrl',
      label: 'Address',
      kind: 'text',
      placeholder: 'http://localhost:11434/v1',
      help: 'The OpenAI-compatible address, ending in /v1.',
    },
    { name: 'model', label: 'Writing model', kind: 'text', placeholder: 'llama3.2' },
    {
      name: 'visionModel',
      label: 'Picture model',
      kind: 'text',
      placeholder: 'llava',
      optional: true,
      help: 'Used for alt text. Leave empty to have no alt-text suggestions.',
    },
    {
      name: 'apiKey',
      label: 'Key',
      kind: 'password',
      optional: true,
      help: 'Only if your server asks for one. Ollama does not.',
    },
  ],
  secretFields: ['apiKey'],

  schema: aiAssistSchema,

  degradation:
    'Without this there are no Suggest buttons. Everything else works the same, and nothing you write is sent anywhere.',

  async test(config): Promise<TestResult> {
    let res: Response;
    try {
      res = await fetch(assistUrl(config.baseUrl, '/models'), {
        headers: assistHeaders(config),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      return {
        ok: false,
        message:
          'Nothing answered at that address. Check that the model server is running, and that this site can reach it — from inside Docker, localhost is the container itself.',
      };
    }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: 'The server answered but refused the key. Check the key.' };
    }
    const body = (await res.json().catch(() => null)) as { data?: Array<{ id?: unknown }> } | null;
    if (!res.ok || !Array.isArray(body?.data)) {
      return {
        ok: false,
        message: `Something answered (${res.status}), but not like an OpenAI-compatible server. The address usually ends in /v1.`,
      };
    }
    const names = body.data.map((item) => String(item.id ?? ''));
    const has = (wanted: string) =>
      names.some((name) => name === wanted || name === `${wanted}:latest`);
    const missing = [config.model, config.visionModel].filter(
      (name): name is string => Boolean(name) && !has(name!)
    );
    if (missing.length > 0) {
      return {
        ok: false,
        message: `The server is up, but it does not have ${missing.join(' or ')}. It has: ${names.slice(0, 8).join(', ') || 'no models'}.`,
      };
    }
    return {
      ok: true,
      message: config.visionModel
        ? 'Connected. Suggest buttons appear beside descriptions, summaries and alt text.'
        : 'Connected. Suggest buttons appear beside descriptions and summaries; add a picture model for alt text.',
    };
  },
});
