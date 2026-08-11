import { describe, expect, it } from 'vitest';
import { arrange, createWritingEntry, isLive, writingSchema } from '../schema';
import type { WritingEntry } from '../schema';

/**
 * Writing, and the two behaviours that make it not-a-blog.
 *
 * Scheduling is a predicate rather than a job, and ordering puts the best piece
 * first rather than the newest. Both are the point of the feature.
 */

const entry = (over: Partial<WritingEntry> = {}): WritingEntry => ({
  ...createWritingEntry('A piece'),
  status: 'published',
  ...over,
});

describe('scheduling', () => {
  const now = new Date('2026-06-15T12:00:00Z');

  it('publishes a scheduled piece once its time has passed', () => {
    // No cron, no job queue, nothing to run. A free serverless plan makes no
    // promise that a scheduled task ever executes; a predicate on read keeps
    // itself, on any host, with nothing to configure.
    expect(isLive(entry({ status: 'scheduled', scheduledFor: '2026-06-15T09:00:00Z' }), now)).toBe(
      true
    );
  });

  it('keeps it private until then', () => {
    expect(isLive(entry({ status: 'scheduled', scheduledFor: '2026-06-20T09:00:00Z' }), now)).toBe(
      false
    );
  });

  it('treats a scheduled piece with no date, or a broken one, as not live', () => {
    // Failing closed: showing an unfinished draft to the world is the worse of
    // the two mistakes available here.
    expect(isLive(entry({ status: 'scheduled' }), now)).toBe(false);
    expect(isLive(entry({ status: 'scheduled', scheduledFor: 'soon' }), now)).toBe(false);
  });

  it('never publishes a draft', () => {
    expect(isLive(entry({ status: 'draft' }), now)).toBe(false);
  });
});

describe('ordering', () => {
  const older = entry({ id: 'a', title: 'Older', sortOrder: 1, publishedAt: '2024-01-01' });
  const newer = entry({ id: 'b', title: 'Newer', sortOrder: 2, publishedAt: '2026-01-01' });
  const best = entry({
    id: 'c',
    title: 'Best',
    sortOrder: 9,
    publishedAt: '2023-01-01',
    featured: true,
  });

  it('puts the pinned piece first, whatever the order', () => {
    // The whole argument against a blog: a strong essay from 2023 must not sink
    // below last week's throwaway.
    expect(arrange([older, newer, best], 'curated')[0].title).toBe('Best');
    expect(arrange([older, newer, best], 'newest')[0].title).toBe('Best');
  });

  it('respects manual order when curated', () => {
    expect(arrange([newer, older], 'curated').map((e) => e.title)).toEqual(['Older', 'Newer']);
  });

  it('is a blog when somebody asks for one', () => {
    expect(arrange([older, newer], 'newest').map((e) => e.title)).toEqual(['Newer', 'Older']);
  });

  it('falls back to date when manual positions tie', () => {
    const a = entry({ id: 'x', title: 'X', sortOrder: 0, publishedAt: '2024-01-01' });
    const b = entry({ id: 'y', title: 'Y', sortOrder: 0, publishedAt: '2026-01-01' });
    expect(arrange([a, b], 'curated').map((e) => e.title)).toEqual(['Y', 'X']);
  });
});

describe('records', () => {
  it('creates one that validates and is not live', () => {
    const created = createWritingEntry('How I Approach Research');
    expect(writingSchema.safeParse(created).success).toBe(true);
    expect(created.slug).toBe('how-i-approach-research');
    expect(created.status).toBe('draft');
  });

  it('still produces an address when the title has nothing usable in it', () => {
    expect(createWritingEntry('???').slug).not.toBe('');
  });

  it('has no date until somebody sets one', () => {
    // Evergreen by default. A date on an undated essay makes it look stale.
    expect(createWritingEntry('Untitled').publishedAt).toBeUndefined();
  });
});
