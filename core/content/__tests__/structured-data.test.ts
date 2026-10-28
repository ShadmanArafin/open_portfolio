import { describe, expect, it } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import type { CMSState } from '@/cms/types/cms';
import {
  breadcrumbsFor,
  personFor,
  profilePageFor,
  reviewsFor,
  websiteFor,
} from '../structured-data';

function site(over: (state: CMSState) => void = () => {}): CMSState {
  const state = structuredClone(INITIAL_CMS_STATE);
  state.settings.fullName = 'Ada Lovelace';
  state.settings.role = 'Analyst';
  state.settings.siteUrl = 'https://ada.example.org/';
  state.settings.portraitPath = '/api/media/ada.jpg';
  state.socialLinks = [
    {
      id: 's1',
      label: 'GitHub',
      name: 'ada',
      url: 'https://github.com/ada',
      iconType: 'github',
      visible: true,
      sortOrder: 1,
    },
    {
      id: 's2',
      label: 'Mail',
      name: 'ada',
      url: 'mailto:ada@example.org',
      iconType: 'github',
      visible: true,
      sortOrder: 2,
    },
  ];
  over(state);
  return state;
}

describe('structured data', () => {
  it('describes the owner as a Person with absolute URLs and their profiles', () => {
    expect(personFor(site())).toEqual({
      '@type': 'Person',
      '@id': 'https://ada.example.org/#person',
      name: 'Ada Lovelace',
      url: 'https://ada.example.org',
      jobTitle: 'Analyst',
      image: 'https://ada.example.org/api/media/ada.jpg',
      sameAs: ['https://github.com/ada'],
    });
  });

  it('makes the About page a ProfilePage about that Person', () => {
    const page = profilePageFor(site());
    expect(page).toMatchObject({ '@type': 'ProfilePage', url: 'https://ada.example.org/about' });
    expect((page!.mainEntity as { name: string }).name).toBe('Ada Lovelace');
  });

  it('names the WebSite and its publisher', () => {
    expect(websiteFor(site())).toMatchObject({
      '@type': 'WebSite',
      url: 'https://ada.example.org',
      publisher: { '@id': 'https://ada.example.org/#person' },
    });
  });

  it('publishes nothing without an address or with the placeholder name', () => {
    expect(personFor(site((s) => (s.settings.siteUrl = '')))).toBeNull();
    expect(
      websiteFor(site((s) => (s.settings.fullName = INITIAL_CMS_STATE.settings.fullName)))
    ).toBeNull();
  });

  it('numbers breadcrumbs from the site root', () => {
    const crumbs = breadcrumbsFor(site(), [
      { name: 'Work', path: '/work' },
      { name: 'Harbour', path: '/work/harbour' },
    ]);
    expect(crumbs!.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Work', item: 'https://ada.example.org/work' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Harbour',
        item: 'https://ada.example.org/work/harbour',
      },
    ]);
  });

  it('generates Review schema for visible recommendations', () => {
    const s = site((state) => {
      state.recommendations = [
        {
          id: 'rec-1',
          name: 'Charles Babbage',
          role: 'Mathematician',
          company: 'Analytical Engine Corp',
          companyUrl: 'https://engines.example.org',
          quote: 'Ada understood the machine better than anyone.',
          featured: true,
          sortOrder: 1,
          visible: true,
        },
        {
          id: 'rec-2',
          name: 'Draft Hidden',
          role: 'Editor',
          company: 'Secret',
          quote: 'Hidden quote.',
          featured: false,
          sortOrder: 2,
          visible: false,
        },
      ];
    });

    const reviews = reviewsFor(s);
    expect(reviews).toHaveLength(1);
    expect(reviews![0]).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Review',
      reviewBody: 'Ada understood the machine better than anyone.',
      author: {
        '@type': 'Person',
        name: 'Charles Babbage',
        jobTitle: 'Mathematician',
        worksFor: {
          '@type': 'Organization',
          name: 'Analytical Engine Corp',
          url: 'https://engines.example.org',
        },
      },
      itemReviewed: {
        '@type': 'Person',
        '@id': 'https://ada.example.org/#person',
        name: 'Ada Lovelace',
      },
    });

    expect(reviewsFor(site((state) => (state.recommendations = [])))).toBeNull();
  });
});
