import { describe, expect, it, vi } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { isShippedCopyright, isShippedTitleTemplate } from '../identity';

/**
 * Your name, in the places nobody thinks to update.
 *
 * The page title template and the footer copyright were each written once, by
 * the first-run wizard, as a literal containing the owner's name. Change your
 * name in Settings afterwards and the site half-renames itself: the heading
 * updates, every browser tab and every search result keeps the old one, and
 * nothing on either screen suggests they are connected.
 *
 * Both are derived from the name now, and settable only as a deliberate
 * override. These tests exist so nobody re-adds the convenience of snapshotting.
 */

// Hoisted, and reading a holder the tests can change. `vi.doMock` after the
// import does nothing: `buildMetadata` has already closed over the real module.
const served = { current: INITIAL_CMS_STATE };
vi.mock('../read', () => ({ getPublishedContent: async () => served.current }));

const { buildMetadata } = await import('../metadata');

async function titleFor(seo: Partial<(typeof INITIAL_CMS_STATE)['seo']>, page?: string) {
  served.current = { ...INITIAL_CMS_STATE, seo: { ...INITIAL_CMS_STATE.seo, ...seo } };
  return (await buildMetadata({ title: page })).title;
}

describe('the shipped defaults derive rather than snapshot', () => {
  it('ships no name baked into the title template or the copyright', () => {
    expect(INITIAL_CMS_STATE.seo.titleTemplate).toBe('');
    expect(INITIAL_CMS_STATE.settings.copyrightText).toBe('');
  });
});

describe('page titles', () => {
  it('keeps the site name when no template is set', async () => {
    // The previous fallback was bare '%s', which dropped the site's name from
    // every tab and every search result.
    await expect(titleFor({ siteTitle: 'Mira Vance — Designer' }, 'Work')).resolves.toBe(
      'Work — Mira Vance — Designer'
    );
  });

  it('gives the front door the site title alone', async () => {
    await expect(titleFor({ siteTitle: 'Mira Vance — Designer' })).resolves.toBe(
      'Mira Vance — Designer'
    );
  });

  it('still honours a template somebody chose', async () => {
    await expect(
      titleFor({ siteTitle: 'Mira Vance', titleTemplate: '%s | Studio' }, 'Work')
    ).resolves.toBe('Work | Studio');
  });

  it('does not produce a dangling separator when the site has no title yet', async () => {
    await expect(titleFor({ siteTitle: '' }, 'Work')).resolves.toBe('Work');
  });
});

describe('installs that already stored the old literals', () => {
  it('treats a template we shipped as unset, and one somebody wrote as theirs', async () => {
    // The whole point: an existing install picks up the fix without a
    // migration, and text a person actually typed is never second-guessed.
    await expect(
      titleFor({ siteTitle: 'Mira Vance — Designer', titleTemplate: '%s — Your Name' }, 'Work')
    ).resolves.toBe('Work — Mira Vance — Designer');

    await expect(
      titleFor({ siteTitle: 'Mira Vance', titleTemplate: '%s — Your Name Studio' }, 'Work')
    ).resolves.toBe('Work — Your Name Studio');
  });

  it('recognises the shipped copyright for any year, and nothing else', () => {
    expect(isShippedCopyright('© 2026 Your Name')).toBe(true);
    expect(isShippedCopyright('©2031 Your Name')).toBe(true);

    // Somebody who genuinely wrote something keeps it.
    expect(isShippedCopyright('© 2026 Mira Vance')).toBe(false);
    expect(isShippedCopyright('© 2026 Your Name Ltd')).toBe(false);
    expect(isShippedCopyright('All rights reserved')).toBe(false);
    expect(isShippedCopyright('')).toBe(false);
    expect(isShippedCopyright(undefined)).toBe(false);
  });

  it('recognises both dash spellings of the shipped template', () => {
    expect(isShippedTitleTemplate('%s — Your Name')).toBe(true);
    expect(isShippedTitleTemplate('%s - Your Name')).toBe(true);
    expect(isShippedTitleTemplate('%s | Studio')).toBe(false);
    expect(isShippedTitleTemplate('')).toBe(false);
  });
});
