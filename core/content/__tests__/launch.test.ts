import { describe, expect, it } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { launchSteps } from '../launch';
import type { CMSState, ProjectItem } from '@/cms/types/cms';

const fresh = (): CMSState => structuredClone(INITIAL_CMS_STATE);
const done = (state: CMSState, context = { published: false, emailConfigured: false }) =>
  launchSteps(state, context)
    .filter((step) => step.done)
    .map((step) => step.id);

describe('launch checklist', () => {
  it('has nothing done on a brand-new site, demo work included', () => {
    expect(done(fresh())).toEqual([]);
  });

  it('counts only the owner’s own published work, three of it', () => {
    const state = fresh();
    const mine = (id: string, status: ProjectItem['status'] = 'published') =>
      ({ ...state.projects[0], id, slug: id, status }) as ProjectItem;
    state.projects = [...state.projects, mine('a'), mine('b'), mine('c', 'draft')];
    expect(done(state)).not.toContain('work');
    state.projects.push(mine('d'));
    expect(done(state)).toContain('work');
  });

  it('ticks each step from the content it is about', () => {
    const state = fresh();
    state.settings.fullName = 'Ada Lovelace';
    state.settings.role = 'Analyst';
    state.settings.email = 'ada@example.org';
    state.seo.metaDescription = 'Notes on the Analytical Engine.';
    state.settings.siteUrl = 'https://ada.example.org';
    expect(done(state, { published: true, emailConfigured: true })).toEqual([
      'name',
      'email',
      'notify',
      'description',
      'address',
      'publish',
    ]);
  });

  it('links every step to a real admin screen', () => {
    for (const step of launchSteps(fresh(), { published: false, emailConfigured: false })) {
      expect(step.href).toMatch(/^\/admin(\/[a-z-]+)?$/);
    }
  });
});
