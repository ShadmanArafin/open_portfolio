import { describe, expect, it } from 'vitest';
import { buildMessages, cleanSuggestion, LIMITS, textOfBlocks } from '../prompts';

describe('textOfBlocks', () => {
  it('keeps the words and drops links, ids, layout names and hidden blocks', () => {
    const text = textOfBlocks([
      { id: 'a', type: 'richText', props: { heading: 'Why', paragraphs: ['First.', 'Second.'] } },
      { id: 'b', type: 'cta', props: { label: 'Write to me', href: '/contact', variant: 'solid' } },
      { id: 'c', type: 'richText', hidden: true, props: { heading: 'Secret draft' } },
      { id: 'd', type: 'image', props: { src: '/api/media/x.jpg', alt: 'A harbour at dawn' } },
    ]);
    expect(text.split('\n')).toEqual([
      'Why',
      'First.',
      'Second.',
      'Write to me',
      'A harbour at dawn',
    ]);
  });
});

describe('buildMessages', () => {
  it('asks for a description from the title and the words, within the limit', () => {
    const [system, user] = buildMessages('description', { title: 'About', text: 'I design.' });
    expect(system.content).toContain('same language');
    expect(user.content).toContain(`${LIMITS.description} characters`);
    expect(user.content).toContain('Title: About\n\nI design.');
  });

  it('sends the picture for alt text as an image part', () => {
    const [, user] = buildMessages('alt', { imageDataUrl: 'data:image/webp;base64,AA' });
    expect(Array.isArray(user.content) && user.content[1]).toEqual({
      type: 'image_url',
      image_url: { url: 'data:image/webp;base64,AA' },
    });
  });
});

describe('cleanSuggestion', () => {
  it('strips the preamble, quotes, Markdown and thinking', () => {
    expect(
      cleanSuggestion(
        'summary',
        '<think>hmm</think>Here is a summary:\n"**A calm** guide to slow mornings."'
      )
    ).toBe('A calm guide to slow mornings.');
  });

  it('cuts a long answer on a sentence, or a word, within the limit', () => {
    const long = `${'Short sentence here. '.repeat(10)}`;
    const cut = cleanSuggestion('description', long)!;
    expect(cut.length).toBeLessThanOrEqual(LIMITS.description);
    expect(cut.endsWith('.')).toBe(true);
    const words = cleanSuggestion('alt', 'word '.repeat(60))!;
    expect(words.length).toBeLessThanOrEqual(LIMITS.alt + 1);
    expect(words.endsWith('word…')).toBe(true);
  });

  it('gives null for nothing', () => {
    expect(cleanSuggestion('alt', '  ""  ')).toBeNull();
    expect(cleanSuggestion('alt', 42)).toBeNull();
  });
});
