import { describe, expect, it } from 'vitest';
import { keywords } from '../search';
import { releaseAfter } from '../../updates/check';
import { explainGitHubStatus } from '../../version';

/**
 * The two pieces of judgement in duplicate detection.
 *
 * Both are guesses, and both are the difference between the feature working and
 * the feature being decoration: search terms that find nothing make every
 * report look new, and a wrong fix-version tells somebody to update for a bug
 * that is still there.
 */

describe('keywords', () => {
  it('keeps the words that carry the meaning', () => {
    // GitHub's search is AND, so a whole sentence matches nothing. The filler
    // is what makes two reports of the same problem look different.
    expect(keywords('The contact form sends two emails every time')).toEqual([
      'contact',
      'form',
      'sends',
      'two',
      'emails',
      'every',
    ]);
  });

  it('finds the same words in two differently-worded reports', () => {
    const one = keywords('My contact form sends duplicate emails');
    const two = keywords('I get two emails from the contact form');
    const shared = one.filter((word) => two.includes(word));
    expect(shared).toContain('contact');
    expect(shared).toContain('form');
    expect(shared).toContain('emails');
  });

  it('drops punctuation and duplicates', () => {
    expect(keywords('Gallery, gallery... GALLERY!')).toEqual(['gallery']);
  });

  it('caps how many it uses', () => {
    // Every extra term narrows an AND search. Past about six, a real duplicate
    // stops matching and everything looks new again.
    expect(keywords('alpha bravo charlie delta echo foxtrot golf hotel').length).toBe(6);
  });

  it('returns nothing for a title with nothing in it', () => {
    expect(keywords('is it the a of')).toEqual([]);
    expect(keywords('')).toEqual([]);
  });
});

describe('releaseAfter', () => {
  const releases = [
    { version: '0.7.0', name: '', publishedAt: '2026-03-01T00:00:00Z', body: '', url: '' },
    { version: '0.6.0', name: '', publishedAt: '2026-02-01T00:00:00Z', body: '', url: '' },
    { version: '0.5.0', name: '', publishedAt: '2026-01-01T00:00:00Z', body: '', url: '' },
  ];

  it('picks the first release after the fix was closed', () => {
    expect(releaseAfter('2026-01-15T00:00:00Z', releases)?.version).toBe('0.6.0');
  });

  it('returns nothing when the fix has not shipped yet', () => {
    // Closed but unreleased. Saying "fixed in 0.7.0" here would send somebody
    // to update for a bug that is still in every version they can install.
    expect(releaseAfter('2026-04-01T00:00:00Z', releases)).toBeNull();
  });

  it('counts a release published the same moment as after it', () => {
    expect(releaseAfter('2026-02-01T00:00:00Z', releases)?.version).toBe('0.6.0');
  });

  it('does not guess from an unparseable date', () => {
    expect(releaseAfter('sometime last year', releases)).toBeNull();
  });

  it('survives a project with no releases at all', () => {
    expect(releaseAfter('2026-01-15T00:00:00Z', [])).toBeNull();
  });
});

describe('explaining a refusal from GitHub', () => {
  it('names a private repository rather than repeating a status code', () => {
    // Found in a browser: the real 422 read "GitHub answered 422", which says
    // nothing about the one thing that needed changing — the repository was
    // private, so an anonymous search could not see it.
    for (const status of [404, 422]) {
      const message = explainGitHubStatus(status, 'check for duplicates');
      expect(message).toContain('not publicly visible');
      expect(message).not.toContain(String(status));
    }
  });

  it('distinguishes rate limiting, which fixes itself', () => {
    expect(explainGitHubStatus(403, 'check for updates')).toContain('rate-limiting');
    expect(explainGitHubStatus(429, 'check for updates')).toContain('rate-limiting');
  });

  it('falls back to the status for anything unrecognised', () => {
    expect(explainGitHubStatus(500, 'check for updates')).toContain('500');
  });
});
