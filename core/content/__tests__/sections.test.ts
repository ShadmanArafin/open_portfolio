import { describe, expect, it } from 'vitest';
import type { SectionConfig } from '@/cms/types/cms';
import {
  aboutChanges,
  anchorProblem,
  moveBand,
  PAGE_HEADER_ORDER_FLOOR,
  sortSections,
  splitSections,
  withBandOrders,
} from '../sections';

const section = (overrides: Partial<SectionConfig> & { id: string }): SectionConfig => ({
  name: overrides.id,
  label: 'Label',
  visible: true,
  order: 1,
  anchorId: overrides.id,
  ...overrides,
});

describe('section order', () => {
  it('sorts by order without touching the input', () => {
    const input = [section({ id: 'b', order: 2 }), section({ id: 'a', order: 1 })];
    expect(sortSections(input).map((s) => s.id)).toEqual(['a', 'b']);
    expect(input.map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('splits bands from page headers at the floor', () => {
    const { bands, headers } = splitSections([
      section({ id: 'work-header', order: 100 }),
      section({ id: 'hero', order: 1 }),
      section({ id: 'about', order: 2 }),
    ]);
    expect(bands.map((s) => s.id)).toEqual(['hero', 'about']);
    expect(headers.map((s) => s.id)).toEqual(['work-header']);
    expect(PAGE_HEADER_ORDER_FLOOR).toBe(100);
  });

  it('moves a band one step and refuses to leave the list', () => {
    const bands = [section({ id: 'a', order: 1 }), section({ id: 'b', order: 2 })];
    expect(moveBand(bands, 0, 1).map((s) => s.id)).toEqual(['b', 'a']);
    expect(moveBand(bands, 0, -1)).toBe(bands);
    expect(moveBand(bands, 1, 1)).toBe(bands);
  });

  it('renumbers bands 1..n and nothing else', () => {
    const next = withBandOrders([
      section({ id: 'b', order: 7, heading: 'Keep me' }),
      section({ id: 'a', order: 3, visible: false }),
    ]);
    expect(next.map((s) => s.order)).toEqual([1, 2]);
    expect(next[0].heading).toBe('Keep me');
    expect(next[1].visible).toBe(false);
  });
});

describe('anchor advice', () => {
  const sections = [section({ id: 'hero', anchorId: 'hero' })];

  it('asks for an anchor when there is none', () => {
    expect(anchorProblem(sections, '  ')).toMatch(/Add an anchor/);
  });

  it('rejects characters that do not survive a URL', () => {
    expect(anchorProblem(sections, 'Selected Work')).toMatch(/lowercase letters/);
  });

  it('warns when two sections share one anchor', () => {
    expect(anchorProblem([...sections, section({ id: 'x', anchorId: 'hero' })], 'hero')).toMatch(
      /already uses "#hero"/
    );
  });

  it('is quiet for a good, unique anchor', () => {
    expect(anchorProblem(sections, 'selected-work')).toBeNull();
  });
});

describe('about mirroring', () => {
  const stored = section({
    id: 'about',
    heading: 'Old heading',
    description: 'One.\n\nTwo.',
  });

  it('says nothing when nothing changed', () => {
    expect(aboutChanges(stored, { ...stored })).toEqual({});
  });

  it('mirrors only the heading when that is what changed', () => {
    expect(aboutChanges(stored, { ...stored, heading: 'New heading' })).toEqual({
      heading: 'New heading',
    });
  });

  it('splits changed paragraphs on blank lines', () => {
    expect(
      aboutChanges(stored, { ...stored, description: ' First. \n\n\n Second. \n\n ' })
    ).toEqual({ paragraphs: ['First.', 'Second.'] });
  });

  it('treats a missing section as nothing to mirror', () => {
    expect(aboutChanges(stored, undefined)).toEqual({});
  });

  it('mirrors both fields for a section that did not exist before', () => {
    expect(aboutChanges(undefined, { ...stored })).toEqual({
      heading: 'Old heading',
      paragraphs: ['One.', 'Two.'],
    });
  });
});
