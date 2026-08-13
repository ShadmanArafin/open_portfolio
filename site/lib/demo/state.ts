import type { CMSState } from '@/cms/types/cms';
import type { Persona } from './personas';
import { vocabulary } from './render';

/**
 * A whole content document, the way the product stores one.
 *
 * The demo used to build only what a block needed. Building the real thing
 * instead means the rest of the admin can be shown honestly: the dashboard runs
 * the product's actual checks against it, the appearance screen runs
 * the product's actual contrast audit, and the block content is derived by the
 * product's own `blockContentFrom` rather than assembled by hand here.
 *
 * Everything in it is invented and stays invented.
 */

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const ISO = '2026-08-13T09:00:00.000Z';

/** Enquiries, so the inbox has something in it. */
const MESSAGES = [
  {
    id: 'm1',
    name: 'Elin Ferrier',
    email: 'elin@ferrier.example',
    company: 'Ferrier',
    projectType: 'A commission',
    message:
      'We are reprinting the menus in September and the pictures we have are four years old. Could you come in on a service evening?',
    receivedAt: '2026-08-12T18:20:00.000Z',
    status: 'unread' as const,
  },
  {
    id: 'm2',
    name: 'Jonas Feld',
    email: 'jonas@northline.example',
    company: 'Northline',
    projectType: 'Something else',
    message: 'Are the Saltmarsh pictures available as prints? Two of them, framed if possible.',
    receivedAt: '2026-08-09T11:02:00.000Z',
    status: 'read' as const,
  },
  {
    id: 'm3',
    name: 'Aoife Nolan',
    email: 'aoife@quarterlytable.example',
    company: 'Quarterly Table',
    projectType: 'A collaboration',
    message: 'Commissioning a piece on closing industries. Would you shoot it if we write it?',
    receivedAt: '2026-07-30T08:45:00.000Z',
    status: 'read' as const,
  },
];

export function demoState(persona: Persona, themeId: string): CMSState {
  const words = vocabulary(persona);

  return {
    status: 'published',
    lastSavedAt: ISO,
    lastPublishedAt: ISO,

    settings: {
      fullName: persona.name,
      role: persona.role,
      email: persona.email,
      location: persona.location,
      siteUrl: `https://${persona.name.toLowerCase().replace(/\s+/g, '')}.example`,
      copyrightText: '',
    },

    microcopy: {},
    appearance: { themeId },

    seo: {
      siteTitle: `${persona.name} — ${persona.role}`,
      metaDescription: persona.blocks[0]?.props?.subhead as string,
    },

    sections: [],

    pages: [
      {
        id: 'page-home',
        slug: '',
        title: 'Home',
        blocks: persona.blocks,
        status: 'published',
        seo: {},
        nav: { show: false, order: 0 },
        updatedAt: ISO,
        revision: 1,
      },
    ],

    writing: persona.writing.map((entry, i) => ({
      id: `w${i}`,
      slug: slugify(entry.title),
      title: entry.title,
      summary: entry.summary,
      blocks: [],
      status: 'published' as const,
      tags: [],
      featured: i === 0,
      sortOrder: i,
      seo: {},
      updatedAt: ISO,
      publishedAt: new Date(entry.date).toISOString(),
      revision: 1,
    })),

    writingSettings: {
      label: words.writing,
      slug: 'writing',
      order: 'newest',
      showDates: true,
      enabled: true,
    },

    newsletter: {
      enabled: true,
      pitch: 'A note when there is something new. Nothing else.',
      buttonLabel: 'Subscribe',
      pendingMessage: 'Almost there — check your email and click the link to confirm.',
    },

    projects: persona.projects.map((project, i) => ({
      id: `p${i}`,
      slug: slugify(project.title),
      number: String(i + 1).padStart(2, '0'),
      title: project.title,
      name: project.title,
      company: persona.clients[i % persona.clients.length],
      category: project.category,
      tags: [project.category],
      year: project.year,
      shortDescription: project.summary,
      description: [project.summary],
      heroHeadline: project.title,
      role: persona.role,
      deliverables: [],
      industry: project.category,
      timeline: project.year,
      platform: '',
      featured: i < 2,
      sortOrder: i,
      status: 'published',
      visualPlaceholder: '',
      images: [],
      overview: [project.summary],
      challenge: '',
      approachSteps: [],
      outcomes: [],
      nextProjectSlug: '',
      seoTitle: '',
      seoDescription: '',
    })) as unknown as CMSState['projects'],

    caseStudies: [],

    brands: persona.clients.map((name, i) => ({
      id: `c${i}`,
      name,
      logo: '',
      alt: `${name} logo`,
      size: 'default' as const,
      sortOrder: i,
      visible: true,
    })),

    experience: persona.timeline.map((entry, i) => ({
      id: `e${i}`,
      period: entry.period,
      type: 'Full time',
      role: entry.role,
      company: entry.org,
      current: i === 0,
      summary: entry.note,
      highlights: [],
      sortOrder: i,
      visible: true,
    })),

    education: [],
    processSteps: [],

    capabilityGroups: persona.skills.map((group, i) => ({
      id: `s${i}`,
      number: String(i + 1).padStart(2, '0'),
      title: group.group,
      description: '',
      capabilities: group.items,
      sortOrder: i,
      visible: true,
    })),

    recommendations: [
      {
        id: 'r0',
        name: persona.testimonial.who,
        role: persona.testimonial.role,
        company: '',
        quote: persona.testimonial.quote,
        featured: true,
        sortOrder: 0,
        visible: true,
      },
      {
        id: 'r1',
        name: 'Sam Iredale',
        role: 'Design Lead',
        company: 'Ostro',
        quote:
          'Straightforward to work with, and the thing arrived when it was said it would arrive. That is rarer than it should be.',
        featured: false,
        sortOrder: 1,
        visible: true,
      },
    ],

    artifacts: [],

    socialLinks: [
      {
        id: 'so0',
        label: 'Instagram',
        name: `@${persona.name.toLowerCase().replace(/\s+/g, '')}`,
        url: 'https://example.com/',
        iconType: 'instagram',
        visible: true,
        sortOrder: 0,
      },
      {
        id: 'so1',
        label: 'Email',
        name: persona.email,
        url: `mailto:${persona.email}`,
        iconType: 'email',
        visible: true,
        sortOrder: 1,
      },
    ],

    navLinks: [],
    media: [],
    messages: MESSAGES,

    versions: [
      {
        id: 'v3',
        timestamp: '2026-08-12T16:10:00.000Z',
        editor: persona.name,
        action: 'publish',
        summary: 'Changed: what you offer, blocks.',
        snapshot: null,
      },
      {
        id: 'v2',
        timestamp: '2026-08-04T09:30:00.000Z',
        editor: persona.name,
        action: 'publish',
        summary: 'Changed: selected work (+1).',
        snapshot: null,
      },
      {
        id: 'v1',
        timestamp: '2026-07-21T14:02:00.000Z',
        editor: persona.name,
        action: 'publish',
        summary: 'First publish.',
        snapshot: null,
      },
    ] as unknown as CMSState['versions'],

    activityLogs: [],
  } as unknown as CMSState;
}

/** Subscribers, for the newsletter screen. Invented, and none of them real. */
export const DEMO_SUBSCRIBERS = [
  { email: 'elin@ferrier.example', status: 'confirmed', when: '2026-08-02', source: '/' },
  { email: 'jonas@northline.example', status: 'confirmed', when: '2026-07-28', source: '/writing' },
  { email: 'aoife@quarterlytable.example', status: 'confirmed', when: '2026-07-19', source: '/' },
  { email: 'r.ellery@ostro.example', status: 'pending', when: '2026-08-12', source: '/' },
] as const;
