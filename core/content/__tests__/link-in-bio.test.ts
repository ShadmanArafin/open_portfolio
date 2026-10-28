import { describe, expect, it } from 'vitest';
import { resolveLinkInBio } from '../link-in-bio';
import type { CMSState } from '@/cms/types/cms';

describe('Link-in-Bio Resolver', () => {
  it('resolves bio profile with default links, featured projects and socials', () => {
    const mockState = {
      settings: {
        fullName: 'Maya Lin',
        role: 'Architect & Sculptor',
        portraitPath: '/maya.jpg',
        aboutStoryParagraphs: ['Designer of the Vietnam Veterans Memorial.'],
      },
      projects: [
        {
          id: 'p1',
          slug: 'memorial',
          title: 'Vietnam Veterans Memorial',
          status: 'published',
          featured: true,
        },
        {
          id: 'p2',
          slug: 'civil-rights',
          title: 'Civil Rights Memorial',
          status: 'published',
          featured: false,
        },
      ],
      socialLinks: [
        {
          id: 's1',
          label: 'LinkedIn',
          name: 'mayalin',
          url: 'https://linkedin.com/in/mayalin',
          iconType: 'linkedin',
          visible: true,
        },
      ],
    } as unknown as CMSState;

    const bio = resolveLinkInBio(mockState);

    expect(bio.name).toBe('Maya Lin');
    expect(bio.role).toBe('Architect & Sculptor');
    expect(bio.avatar).toBe('/maya.jpg');
    expect(bio.bio).toContain('Vietnam Veterans Memorial');
    expect(bio.links.some((l) => l.url === '/')).toBe(true);
    expect(bio.links.some((l) => l.url === '/cv')).toBe(true);
    expect(bio.links.some((l) => l.url === '/work/memorial')).toBe(true);
    // Non-featured project excluded from quick bio links
    expect(bio.links.some((l) => l.url === '/work/civil-rights')).toBe(false);
    expect(bio.socials.length).toBe(1);
  });
});
