import 'server-only';
import { readConfig } from '@/core/integrations/vault';
import {
  aiAssistSchema,
  assistHeaders,
  assistUrl,
  type AiAssistSettings,
} from '@/core/integrations/definitions/ai-assist';
import { getStorageAdapter } from '@/core/storage/registry';
import { isSafeMediaKey, readMediaBytes } from '@/core/media/read-bytes';
import { variantKey } from '@/core/media/variants';
import { UploadRejected, validateUpload } from '@/core/media/validate';
import { buildMessages, cleanSuggestion, type AssistTask } from './prompts';

/**
 * Asking the owner's model for one suggestion.
 *
 * Server-side, so the endpoint and its key never reach a browser and the
 * admin's Content-Security-Policy stays as narrow as it is.
 */

/** Model servers on a laptop are slow on a cold start; a minute is fair. */
const TIMEOUT_MS = 60_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const VISION_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export class AssistError extends Error {}

export async function readAssistConfig(): Promise<AiAssistSettings | null> {
  try {
    const parsed = aiAssistSchema.safeParse(await readConfig('ai-assist', ['apiKey']));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** What the Suggest buttons may offer. */
export async function assistCapabilities(): Promise<{ text: boolean; alt: boolean }> {
  const config = await readAssistConfig();
  return { text: Boolean(config), alt: Boolean(config?.visionModel) };
}

/** `/api/media/photo.jpg` → `photo.jpg`, or null for anything else. */
export function mediaKeyFromUrl(url: string): string | null {
  const match = /^\/api\/media\/([^/?#]+)$/.exec(url.trim());
  if (!match) return null;
  const key = decodeURIComponent(match[1]);
  return isSafeMediaKey(key) ? key : null;
}

async function imageDataUrl(key: string): Promise<string> {
  const adapter = await getStorageAdapter();
  // The phone-sized copy, when there is one: a model needs 640 pixels, not 4000.
  const bytes =
    (await readMediaBytes(adapter, variantKey(key, 640))) ?? (await readMediaBytes(adapter, key));
  if (!bytes) throw new AssistError('That picture could not be read from your storage.');
  let mimeType: string;
  try {
    mimeType = validateUpload(bytes, key, MAX_IMAGE_BYTES).mimeType;
  } catch (err) {
    if (err instanceof UploadRejected)
      throw new AssistError('That picture is too large to describe.');
    throw err;
  }
  if (!VISION_TYPES.has(mimeType)) {
    throw new AssistError('Only photos (JPEG, PNG, WebP, GIF) can be described.');
  }
  return `data:${mimeType};base64,${Buffer.from(bytes).toString('base64')}`;
}

export async function suggest(
  task: AssistTask,
  input: { title?: string; text?: string; imageUrl?: string }
): Promise<string> {
  const config = await readAssistConfig();
  if (!config) throw new AssistError('The writing assistant is not connected.');
  const model = task === 'alt' ? config.visionModel : config.model;
  if (!model) throw new AssistError('Add a picture model to the assistant to get alt text.');

  let image: string | undefined;
  if (task === 'alt') {
    const key = mediaKeyFromUrl(input.imageUrl ?? '');
    if (!key) throw new AssistError('Only pictures in your media library can be described.');
    image = await imageDataUrl(key);
  } else if (!input.text?.trim() && !input.title?.trim()) {
    throw new AssistError('Write something first — there is nothing to work from yet.');
  }

  let response: Response;
  try {
    response = await fetch(assistUrl(config.baseUrl, '/chat/completions'), {
      method: 'POST',
      headers: assistHeaders(config),
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        model,
        messages: buildMessages(task, { ...input, imageDataUrl: image }),
        temperature: 0.4,
        max_tokens: 200,
        stream: false,
      }),
    });
  } catch {
    throw new AssistError('Your model did not answer in time. Is it running?');
  }
  if (!response.ok) {
    throw new AssistError(`Your model refused the request (${response.status}).`);
  }
  const body = (await response.json().catch(() => null)) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  } | null;
  const text = cleanSuggestion(task, body?.choices?.[0]?.message?.content);
  if (!text) throw new AssistError('Your model answered with nothing usable. Try again.');
  return text;
}
