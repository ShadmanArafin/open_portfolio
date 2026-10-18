import { describe, expect, it } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import {
  changedParts,
  contentFingerprint,
  countMediaUsage,
  describeChanges,
  hasUnpublishedChanges,
} from '../changes';

const state = () => structuredClone(INITIAL_CMS_STATE);

describe('content comparisons', () => {
  it('ignores bookkeeping when deciding whether to light up Publish', () => {
    const a = state();
    const b = state();
    b.lastSavedAt = new Date().toISOString();
    b.messages = [
      {
        id: 'msg-1',
        name: 'A',
        email: 'a@example.com',
        company: '',
        projectType: '',
        message: 'hi',
        receivedAt: new Date().toISOString(),
        status: 'unread',
      },
    ];
    // An incoming enquiry must never light up the Publish button.
    expect(hasUnpublishedChanges(b, a)).toBe(false);
  });

  it('notices real edits', () => {
    const a = state();
    const b = state();
    b.settings = { ...b.settings, fullName: 'Someone Else' };
    expect(hasUnpublishedChanges(b, a)).toBe(true);
    expect(describeChanges(a, b)).toContain('site settings');
    const firstPage = (b.pages ?? [])[0];
    if (firstPage) {
      b.pages = [...(b.pages ?? []), { ...firstPage, id: 'page_new', slug: 'new' }];
      expect(describeChanges(a, b)).toContain('pages (+1)');
    }
  });

  it('treats a first collection as a change from nothing', () => {
    const a = state();
    const b = state();
    expect(describeChanges(a, b)).toBe('No content changes.');
  });

  it('names the collections that moved, on their own, for the History preview', () => {
    const base = state();
    const later = state();
    expect(changedParts(base, later)).toEqual([]);

    later.settings = { ...later.settings, fullName: 'Someone Else' };
    expect(changedParts(base, later)).toEqual(['site settings']);

    const firstPage = (later.pages ?? [])[0];
    if (firstPage) {
      later.pages = [...(later.pages ?? []), { ...firstPage, id: 'page_new', slug: 'new' }];
      expect(changedParts(base, later)).toEqual(['site settings', 'pages (+1)']);
      // The sentence the publish button shows is exactly these parts, so the
      // History preview and the publish summary cannot drift apart.
      expect(describeChanges(base, later)).toBe(
        `Changed: ${changedParts(base, later).join(', ')}.`
      );
      // History asks the other way round: draft → snapshot, so a restore that
      // would drop the page reads as `pages (-1)`.
      expect(changedParts(later, base)).toEqual(['site settings', 'pages (-1)']);
    }
  });

  it('counts media references by the URL written into content', () => {
    const s = state();
    expect(countMediaUsage(s, 'missing')).toBe(0);
    expect(contentFingerprint(s)).toBe(contentFingerprint(state()));
  });
});
