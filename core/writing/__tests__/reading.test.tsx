import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BlockList } from '@/core/blocks/registry';
import { parsePage } from '@/core/blocks/lookup';
import { neighbours, readingMinutes, related, slugifyHeading, withContents } from '../reading';

const text = (heading: string | undefined, words: number, id: string) => ({
  id,
  type: 'richText',
  v: 1,
  props: { ...(heading ? { heading } : {}), paragraphs: [Array(words).fill('word').join(' ')] },
});

describe('reading a piece', () => {
  it('estimates minutes at 220 words a minute, never under one', () => {
    expect(readingMinutes(parsePage([text(undefined, 10, 'a')]))).toBe(1);
    expect(readingMinutes(parsePage([text(undefined, 1100, 'a')]))).toBe(5);
  });

  it('does not count addresses, or hidden blocks', () => {
    const blocks = parsePage([
      text(undefined, 220, 'a'),
      { ...text(undefined, 2200, 'b'), hidden: true },
      { id: 'c', type: 'image', v: 1, props: { media: { src: '/api/media/x.jpg', alt: '' } } },
    ]);
    expect(readingMinutes(blocks)).toBe(1);
  });

  it('anchors each heading once and lists them, keeping an author’s anchor', () => {
    const { blocks, toc } = withContents(
      parsePage([
        text('Why it matters', 5, 'a'),
        text('Why it matters', 5, 'b'),
        { ...text('Mine', 5, 'c'), anchor: 'custom' },
        text(undefined, 5, 'd'),
      ])
    );
    expect(toc).toEqual([
      { anchor: 'why-it-matters', label: 'Why it matters' },
      { anchor: 'why-it-matters-2', label: 'Why it matters' },
      { anchor: 'custom', label: 'Mine' },
    ]);
    const html = renderToStaticMarkup(<BlockList blocks={blocks} firstLevel={2} />);
    for (const { anchor } of toc) expect(html).toContain(`id="${anchor}"`);
    // The page title is the h1; the blocks start below it.
    expect(html).not.toMatch(/<h1[\s>]/);
  });

  it('keeps letters from any script in anchors', () => {
    expect(slugifyHeading('Café — résumé')).toBe('café-résumé');
    expect(slugifyHeading('আমার কাজ')).toBe('আমার-কাজ');
    expect(slugifyHeading('আমার কাজ')).not.toBe('section');
  });

  it('finds the pieces either side, in index order', () => {
    const list = [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }];
    expect(neighbours(list, 'b')).toEqual({ previous: { slug: 'a' }, next: { slug: 'c' } });
    expect(neighbours(list, 'a').previous).toBeNull();
    expect(neighbours(list, 'zzz')).toEqual({ previous: null, next: null });
  });
});

describe('related', () => {
  const entries = [
    { slug: 'a', tags: ['Design', 'Process'] },
    { slug: 'b', tags: ['design'] },
    { slug: 'c', tags: [] },
    { slug: 'd', tags: ['process', 'design'] },
    { slug: 'e', tags: ['Design'] },
  ];
  it('ranks by shared tags, skips the neighbours, and is empty without tags', () => {
    expect(related(entries, 'a').map((e) => e.slug)).toEqual(['d', 'e']);
    expect(related(entries, 'c')).toEqual([]);
  });
});
