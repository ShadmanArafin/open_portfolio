import { describe, expect, it } from 'vitest';
import { screenToken, staleScreenError } from '@/core/content/screen-token';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import type { CMSState } from '@/cms/types/cms';

const base = (): CMSState => structuredClone(INITIAL_CMS_STATE);

describe('screen tokens', () => {
  it('lets a save through when the screen saw what is stored', () => {
    const state = base();
    expect(staleScreenError(state, 'brands', screenToken(state, 'brands'))).toBeNull();
  });

  it('refuses a save from a screen opened before somebody else changed the same list', () => {
    const opened = base();
    const token = screenToken(opened, 'brands');
    const now = base();
    now.brands = now.brands.slice(1);
    const error = staleScreenError(now, 'brands', token);
    expect(error).toContain('your brands');
    expect(error).toContain('nothing was written');
  });

  it('does not refuse because a different screen saved in between', () => {
    const opened = base();
    const token = screenToken(opened, 'brands');
    const now = base();
    now.projects = [];
    now.settings.resumeUrl = '/elsewhere.pdf';
    expect(staleScreenError(now, 'brands', token)).toBeNull();
  });

  it('keeps the footer and the appearance screens apart though they share a record', () => {
    const opened = base();
    const appearance = screenToken(opened, 'appearance');
    const now = base();
    now.appearance.giantFooterText = 'changed in the footer screen';
    expect(staleScreenError(now, 'appearance', appearance)).toBeNull();
    expect(staleScreenError(now, 'footer', screenToken(opened, 'footer'))).not.toBeNull();
  });

  it('lets an untokened save through, so a tab open across an update still works', () => {
    const now = base();
    expect(staleScreenError(now, 'pages', undefined)).toBeNull();
    expect(staleScreenError(now, 'pages', '')).toBeNull();
  });

  it('does not depend on key order, which a jsonb round trip rearranges', () => {
    const state = base();
    const reordered = base();
    reordered.seo = Object.fromEntries(
      Object.entries(state.seo).reverse()
    ) as unknown as CMSState['seo'];
    expect(screenToken(reordered, 'seo')).toBe(screenToken(state, 'seo'));
  });
});
