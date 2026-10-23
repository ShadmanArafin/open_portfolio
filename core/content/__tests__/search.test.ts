import { describe, expect, it } from 'vitest';
import type { ProjectItem } from '@/cms/types/cms';
import type { PageRecord } from '@/core/pages/schema';
import type { WritingEntry } from '@/core/writing/schema';
import { buildSearchIndex, searchIndex } from '../search';

const text = (id: string, heading: string, paragraphs: string[]) => ({
  id,
  type: 'richText',
  v: 1,
  props: { heading, paragraphs },
});

const index = buildSearchIndex({
  projects: [
    {
      title: 'Harbour booking',
      slug: 'harbour',
      shortDescription: 'Booking a berth in three taps.',
      company: 'Harbour Studio',
      deliverables: ['Research'],
      description: [],
      overview: [],
      challenge: '',
      category: '',
      role: '',
    } as unknown as ProjectItem,
  ],
  pages: [
    {
      title: 'Services',
      slug: 'services',
      seo: {},
      blocks: [text('a', 'What I do', ['I design calm interfaces for the Café sector.'])],
    } as unknown as PageRecord,
  ],
  writing: [
    {
      title: 'On slow mornings',
      slug: 'slow',
      summary: 'Why the harbour is quiet at six.',
      tags: ['Process'],
      blocks: [text('b', 'Hidden', ['secret words'])].map((b) => ({ ...b, hidden: true })),
    } as unknown as WritingEntry,
  ],
});

describe('site search', () => {
  it('ranks a title match above a summary match', () => {
    expect(searchIndex(index, 'harbour').map((r) => r.href)).toEqual([
      '/work/harbour',
      '/writing/slow',
    ]);
  });

  it('needs every word, in any order, ignoring case and accents', () => {
    expect(searchIndex(index, 'CAFE calm').map((r) => r.href)).toEqual(['/services']);
    expect(searchIndex(index, 'cafe harbour')).toEqual([]);
  });

  it('shows the passage around a body match', () => {
    const [result] = searchIndex(index, 'interfaces');
    expect(result.snippet).toContain('calm interfaces for the Café sector');
  });

  it('finds tags, never hidden blocks, and nothing for an empty query', () => {
    expect(searchIndex(index, 'process').map((r) => r.href)).toEqual(['/writing/slow']);
    expect(searchIndex(index, 'secret')).toEqual([]);
    expect(searchIndex(index, '  !! ')).toEqual([]);
  });
});
