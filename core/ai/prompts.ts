/**
 * What the writing assistant is asked, and what is kept of its answer.
 *
 * Pure on purpose: the prompts are where this feature is right or wrong, so
 * they are testable without a model. Every answer is a suggestion the owner
 * reads and accepts or ignores — nothing here writes to the site — and it is
 * cleaned of the things models add that nobody asked for: quotes around the
 * whole answer, a "Here is…" preamble, Markdown emphasis, and length past what
 * the field can use.
 */

import { textOfBlocks } from '@/core/blocks/text';

export { textOfBlocks };

export type AssistTask = 'description' | 'summary' | 'alt';

export interface ChatMessage {
  role: 'system' | 'user';
  content:
    | string
    | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

/** The most text sent: a page's opening says what it is about. */
export const MAX_SOURCE_CHARS = 6000;

/** Longest answer kept per task, in characters. */
export const LIMITS: Record<AssistTask, number> = {
  description: 160,
  summary: 240,
  alt: 150,
};

const SYSTEM =
  'You help a person write the words on their own portfolio website. Answer with the requested text only: no preamble, no quotation marks, no Markdown, no options. Write in the same language as the source text. Never invent facts that are not in the source.';

export function buildMessages(
  task: AssistTask,
  input: { title?: string; text?: string; imageDataUrl?: string }
): ChatMessage[] {
  const source = [input.title ? `Title: ${input.title}` : '', input.text ?? '']
    .filter(Boolean)
    .join('\n\n')
    .slice(0, MAX_SOURCE_CHARS);

  if (task === 'alt') {
    return [
      { role: 'system', content: SYSTEM },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Write alt text for this image on a portfolio site: one plain sentence under ${LIMITS.alt} characters that says what it shows and why it matters. Do not start with "Image of" or "Picture of".${input.text ? `\n\nIt appears beside: ${input.text.slice(0, 500)}` : ''}`,
          },
          { type: 'image_url', image_url: { url: input.imageDataUrl ?? '' } },
        ],
      },
    ];
  }

  const ask =
    task === 'description'
      ? `Write a search-result description for this page: one or two sentences, at most ${LIMITS.description} characters, that tell a stranger what they will find.`
      : `Write a summary for this piece of writing: one or two sentences, at most ${LIMITS.summary} characters, that make someone want to read it.`;
  return [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: `${ask}\n\nSource:\n${source}` },
  ];
}

/** The answer as a field value, or null when nothing usable came back. */
export function cleanSuggestion(task: AssistTask, raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let text = raw
    // Reasoning models wrap their thinking in tags; it is not the answer.
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim()
    .replace(/^(?:sure[,!.]?\s*)?(?:here(?:'s| is)[^:\n]*:)\s*/i, '')
    .replace(/[*_`#]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const quoted = /^["“'‘](.*)["”'’]$/.exec(text);
  if (quoted) text = quoted[1].trim();
  if (!text) return null;

  const limit = LIMITS[task];
  if (text.length > limit) {
    const cut = text.slice(0, limit);
    // End on a whole sentence when one fits, else on a whole word.
    const sentence = cut.lastIndexOf('. ');
    text =
      sentence > limit / 2
        ? cut.slice(0, sentence + 1)
        : `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : limit).trimEnd()}…`;
  }
  return text;
}
