import { generateTokens } from '../../../core/theme/tokens';
import { generateLayoutTokens } from '../../../core/theme/layout-tokens';
import { getThemePreset, THEME_PRESETS } from '../../../core/theme/presets';
import { PROFESSIONS } from '../../../src/cms/data/professions';
import type { BlockContent } from '@/core/blocks/content';
import { EMPTY_BLOCK_CONTENT } from '../../../core/blocks/content';
import type { Persona } from './personas';

/**
 * Turning a persona and a theme into what the product would actually render.
 *
 * Every value here comes from the product's own modules — `generateTokens`,
 * `generateLayoutTokens`, `THEME_PRESETS`, `PROFESSIONS` — rather than from a
 * copy kept in this directory. The demo is worth having only if it shows the
 * real thing; a faithful reproduction starts lying the first time somebody
 * changes a token, and nobody finds out because the demo still looks fine.
 */

export const THEMES = THEME_PRESETS.map((preset) => ({
  id: preset.id,
  name: preset.name,
  description: preset.description,
}));

/**
 * The CSS custom properties the product writes into the page, as a style
 * object React can hand to a `<div>`.
 *
 * Scoped to an element rather than `:root`, which is what lets the demo show a
 * themed portfolio inside a page that has its own, entirely different, theme.
 */
export function themeStyle(themeId: string, mode: 'light' | 'dark'): React.CSSProperties {
  const preset = getThemePreset(themeId);
  const colours = preset.colours;

  const tokens = generateTokens(mode, {
    accent: mode === 'dark' ? colours.accentDark : colours.accentLight,
    background: mode === 'dark' ? colours.backgroundDark : colours.backgroundLight,
    stroke: mode === 'dark' ? colours.strokeDark : colours.strokeLight,
  });

  const layout = generateLayoutTokens(preset.layout);

  return {
    ...tokens,
    ...layout,
    // The font stacks the theme names. Not loaded from Google here — the demo
    // renders inside a page that already has three faces, and pulling six more
    // families to preview a theme would cost more than it shows. The stack
    // falls through to something with the right *shape*: a serif theme reads as
    // a serif, a monospace one as monospace.
    '--font-display': displayStack(preset.fonts.display),
    '--font-body': bodyStack(preset.fonts.body),
    '--font-mono': "'IBM Plex Mono', ui-monospace, monospace",
  } as React.CSSProperties;
}

function displayStack(family: string): string {
  const serif = /serif|baskerville|didone|bodoni|instrument|playfair/i.test(family);
  const mono = /mono|code/i.test(family);
  if (mono) return "'IBM Plex Mono', ui-monospace, monospace";
  if (serif) return `'${family}', 'Bodoni Moda Variable', Georgia, serif`;
  return `'${family}', 'Public Sans Variable', system-ui, sans-serif`;
}

function bodyStack(family: string): string {
  if (/mono|code/i.test(family)) return "'IBM Plex Mono', ui-monospace, monospace";
  return `'${family}', 'Public Sans Variable', system-ui, sans-serif`;
}

/** What this persona's profession calls each section, from the product's packs. */
export function vocabulary(persona: Persona) {
  const pack = PROFESSIONS.find((entry) => entry.id === persona.id) ?? PROFESSIONS[0];
  return {
    name: pack.name,
    work: pack.sectionLabels.work ?? 'Selected work',
    caseStudies: pack.sectionLabels['case-studies'] ?? 'Case studies',
    capabilities: pack.sectionLabels.capabilities ?? 'Capabilities',
    brands: pack.sectionLabels.brands ?? 'Clients',
    writing: pack.writingLabel,
    suggestedThemeId: pack.themeId,
  };
}

/**
 * The persona's records, in the shape a block expects to receive them.
 *
 * Built from `EMPTY_BLOCK_CONTENT` rather than an object literal so that a new
 * collection added to the product appears here as an empty array instead of
 * `undefined` — which is the difference between a block rendering nothing and a
 * block throwing.
 */
export function blockContentFor(persona: Persona): BlockContent {
  const now = new Date().toISOString();

  return {
    ...EMPTY_BLOCK_CONTENT,

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
      testimonial: undefined,
      nextProjectSlug: '',
      seoTitle: '',
      seoDescription: '',
    })) as unknown as BlockContent['projects'],

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
      updatedAt: now,
      publishedAt: new Date(entry.date).toISOString(),
      revision: 1,
    })),

    writingSettings: { label: vocabulary(persona).writing, showDates: true },
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
