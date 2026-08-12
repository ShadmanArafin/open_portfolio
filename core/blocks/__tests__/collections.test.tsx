import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BlockList, parsePage, runBlockChecks } from '../registry';
import { blockContentFrom, EMPTY_BLOCK_CONTENT, type BlockContent } from '../content';
import type { CMSState } from '@/cms/types/cms';

/**
 * The blocks that place records rather than restate them.
 *
 * What is worth testing here is not that a card renders — the generic render
 * test covers that. It is the three things a collection view can get wrong in a
 * way nobody notices: showing a record its owner hid, silently rendering
 * nothing, and carrying data onto a public page that was never meant to leave
 * the admin.
 */

function block(type: string, props: unknown, id = type): unknown {
  return { id, type, v: 1, props };
}

function render(raw: unknown[], content: BlockContent): string {
  return renderToStaticMarkup(<BlockList blocks={parsePage(raw)} content={content} />);
}

function checksFor(type: string, props: unknown, content: BlockContent): string {
  return runBlockChecks(parsePage([block(type, props)])[0], content).join(' ');
}

const project = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  slug: 'thing',
  number: '01',
  title: 'A Project',
  name: 'A Project',
  company: '',
  category: 'Design',
  year: '2026',
  shortDescription: 'One line about it.',
  description: [],
  heroHeadline: '',
  role: '',
  deliverables: [],
  industry: '',
  timeline: '',
  platform: '',
  featured: false,
  sortOrder: 1,
  status: 'published',
  visualPlaceholder: '',
  images: [],
  overview: [],
  challenge: '',
  approachSteps: [],
  keyScreensCount: 0,
  outcomeNote: '',
  ...over,
});

const brand = (over: Record<string, unknown> = {}) => ({
  id: 'b1',
  name: 'Northwind',
  logo: '/demo/logos/northwind.svg',
  alt: 'Northwind',
  size: 'default',
  sortOrder: 1,
  visible: true,
  ...over,
});

function contentWith(over: Partial<BlockContent>): BlockContent {
  return { ...EMPTY_BLOCK_CONTENT, ...over };
}

describe('a collection view places real records', () => {
  it('renders the records it was pointed at', () => {
    const html = render(
      [block('collection', { source: 'projects' })],
      contentWith({ projects: [project() as never] })
    );
    expect(html).toContain('A Project');
    expect(html).toContain('/work/thing');
  });

  it('honours featuredOnly', () => {
    const content = contentWith({
      projects: [
        project({ id: 'a', title: 'Starred', featured: true }) as never,
        project({ id: 'b', title: 'Ordinary', featured: false }) as never,
      ],
    });
    const html = render([block('collection', { source: 'projects', featuredOnly: true })], content);
    expect(html).toContain('Starred');
    expect(html).not.toContain('Ordinary');
  });

  it('treats the limit as a maximum, and zero as no limit', () => {
    const many = Array.from({ length: 5 }, (_, i) =>
      project({ id: `p${i}`, title: `Project ${i}` })
    ) as never[];

    const capped = render(
      [block('collection', { source: 'projects', limit: 2 })],
      contentWith({ projects: many })
    );
    expect(capped).toContain('Project 0');
    expect(capped).toContain('Project 1');
    expect(capped).not.toContain('Project 2');

    const all = render(
      [block('collection', { source: 'projects', limit: 0 })],
      contentWith({ projects: many })
    );
    expect(all).toContain('Project 4');
  });
});

describe('an empty collection is silent on the page and loud in the editor', () => {
  const cases: [string, unknown][] = [
    ['collection', { source: 'projects' }],
    ['timeline', { kind: 'work' }],
    ['logoWall', {}],
    ['testimonials', {}],
    ['skills', {}],
    ['steps', {}],
  ];

  it.each(cases)('%s renders nothing rather than a heading over blank space', (type, props) => {
    const html = render(
      [block(type, { ...(props as object), heading: 'A Heading' })],
      EMPTY_BLOCK_CONTENT
    );
    // A heading with nothing under it is worse than no block: it tells a
    // visitor something is missing without telling the owner.
    expect(html).not.toContain('A Heading');
    expect(html.trim()).toBe('');
  });

  it.each(cases)('%s warns its author that it will not appear', (type, props) => {
    // The whole point of the check. The person who cannot see the problem is
    // the author, because they know what they meant to put there.
    expect(checksFor(type, props, EMPTY_BLOCK_CONTENT)).toContain('will not appear');
  });

  it('says which switch caused it when featuredOnly is the reason', () => {
    const content = contentWith({ projects: [project({ featured: false }) as never] });
    const warning = checksFor('collection', { source: 'projects', featuredOnly: true }, content);
    expect(warning).toContain('Featured only');
  });

  it('stays quiet once there is something to show', () => {
    const content = contentWith({ brands: [brand() as never] });
    expect(checksFor('logoWall', {}, content)).toBe('');
  });
});

describe('blockContentFrom decides what a block may see', () => {
  const state = {
    projects: [
      project({ id: 'live', title: 'Live', status: 'published', sortOrder: 2 }),
      project({ id: 'draft', title: 'Draft', status: 'draft', sortOrder: 1 }),
    ],
    caseStudies: [],
    brands: [brand({ id: 'shown', visible: true }), brand({ id: 'hidden', visible: false })],
    experience: [],
    education: [],
    processSteps: [],
    capabilityGroups: [],
    recommendations: [],
    messages: [{ id: 'm1', name: 'Dana', email: 'dana@example.com', message: 'Private enquiry' }],
    settings: { fullName: 'Owner' },
  } as unknown as CMSState;

  it('drops records the owner has not published', () => {
    const content = blockContentFrom(state);
    expect(content.projects.map((p) => p.id)).toEqual(['live']);
  });

  it('drops records the owner has hidden', () => {
    // Publishing something explicitly hidden is a mistake nobody reports,
    // because the person who notices is a stranger.
    expect(blockContentFrom(state).brands.map((b) => b.id)).toEqual(['shown']);
  });

  it('applies the order the owner arranged, once, centrally', () => {
    const content = blockContentFrom({
      ...state,
      projects: [
        project({ id: 'second', sortOrder: 2, status: 'published' }),
        project({ id: 'first', sortOrder: 1, status: 'published' }),
      ],
    } as unknown as CMSState);
    expect(content.projects.map((p) => p.id)).toEqual(['first', 'second']);
  });

  it('never carries the contact inbox', () => {
    // The inbox holds strangers' names and addresses. It must not be one
    // careless prop spread away from a public page.
    const serialised = JSON.stringify(blockContentFrom(state));
    expect(serialised).not.toContain('Private enquiry');
    expect(serialised).not.toContain('dana@example.com');
    expect(Object.keys(blockContentFrom(state))).not.toContain('messages');
  });

  it('survives content that is not there at all', () => {
    expect(blockContentFrom(undefined)).toEqual(EMPTY_BLOCK_CONTENT);
  });
});

describe('the document outline survives collection views', () => {
  it('gives the first block h1 and item titles the level below', () => {
    const html = render(
      [block('collection', { source: 'projects', heading: 'Work' })],
      contentWith({ projects: [project() as never] })
    );
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    expect(levels[0]).toBe(1);
    expect(levels[1]).toBe(2);
  });
});
