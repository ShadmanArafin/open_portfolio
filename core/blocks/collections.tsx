import React from 'react';
import { z } from 'zod';
import {
  Band,
  Button,
  Card,
  Eyebrow,
  Grid,
  Heading,
  Media,
  Pill,
  Row,
  Stack,
  Text,
} from '../primitives';
import { deeper } from '../primitives/heading-level';
import type { BlockContent } from './content';
import type { BlockDefinition } from './schema';

/**
 * Blocks that place the site's own records, rather than restating them.
 *
 * The distinction that makes the builder worth using: a `cards` block holds
 * three cards somebody typed, and updating a project means editing it in two
 * places and forgetting one. A `collection` block holds a *rule* — "my featured
 * work, four of them" — and the page follows the records.
 *
 * Kept out of `definitions.tsx` because that file is already 545 lines of
 * literal-prop blocks and these have a different shape: their props say which
 * records to show, never what the records say.
 *
 * Every one of them renders nothing when its collection is empty. That is the
 * honest outcome — a heading over a blank space is worse — but it is also
 * invisible to the one person who needs to know, so each carries a check that
 * says so in the editor.
 */

/* ------------------------------------------------------------------ shared */

/** Reused by every view here, so "show me six" means the same thing throughout. */
const limitField = {
  kind: 'choice' as const,
  path: 'limit',
  label: 'How many',
  options: [
    { value: 0, label: 'All of them' },
    { value: 3, label: 'First 3' },
    { value: 4, label: 'First 4' },
    { value: 6, label: 'First 6' },
    { value: 8, label: 'First 8' },
  ],
};

/** `0` means all. An absent limit means all. Anything else is a maximum. */
function take<T>(items: T[], limit: number | undefined): T[] {
  return !limit || limit <= 0 ? items : items.slice(0, limit);
}

/**
 * The warning shown when a view has nothing to show.
 *
 * Phrased as what will happen rather than what is wrong, because nothing is
 * wrong: an empty collection on a page somebody is still building is normal,
 * and the only mistake would be publishing it without knowing.
 */
function emptyCheck<P>(id: string, count: (content: BlockContent) => number, noun: string) {
  return {
    id,
    run: (_props: P, content: BlockContent) =>
      count(content) === 0
        ? `There are no ${noun} yet, so this block will not appear on the page.`
        : null,
  };
}

const headingField = {
  kind: 'text' as const,
  path: 'heading',
  label: 'Heading',
  help: 'Leave blank to run the records straight into the page without a title.',
};

/* -------------------------------------------------------------- collection */

const collectionProps = z.object({
  heading: z.string().optional(),
  source: z.enum(['projects', 'caseStudies', 'both']).default('projects'),
  featuredOnly: z.boolean().optional(),
  limit: z.number().int().min(0).max(24).optional(),
  columns: z.union([z.literal(2), z.literal(3)]).optional(),
});

type CollectionProps = z.infer<typeof collectionProps>;

function collectionItems(props: CollectionProps, content: BlockContent) {
  const projects = props.source === 'caseStudies' ? [] : content.projects;
  const studies = props.source === 'projects' ? [] : content.caseStudies;

  const rows = [
    ...projects.map((p) => ({
      id: p.id,
      title: p.title,
      summary: p.shortDescription,
      href: `/work/${p.slug}`,
      meta: p.category,
      featured: p.featured,
    })),
    ...studies.map((c) => ({
      id: c.id,
      title: c.title,
      // Case studies lead with the problem rather than a description; it is the
      // nearest thing they have to a one-line summary.
      summary: c.shortChallenge,
      href: `/case-studies/${c.slug}`,
      meta: c.category,
      featured: c.featured,
    })),
  ];

  return take(props.featuredOnly ? rows.filter((r) => r.featured) : rows, props.limit);
}

const collection: BlockDefinition<CollectionProps> = {
  type: 'collection',
  version: 1,
  label: 'Your work',
  description: 'Places your projects or case studies. They follow the records, not this block.',
  group: 'work',
  schema: collectionProps,
  defaults: () => ({ source: 'projects', limit: 6, heading: 'Selected work' }),
  fields: [
    headingField,
    {
      kind: 'choice',
      path: 'source',
      label: 'Show',
      options: [
        { value: 'projects', label: 'Projects' },
        { value: 'caseStudies', label: 'Case studies' },
        { value: 'both', label: 'Both' },
      ],
    },
    {
      kind: 'toggle',
      path: 'featuredOnly',
      label: 'Featured only',
      help: 'Uses the star you set on each record, so the page changes when the record does.',
    },
    limitField,
    {
      kind: 'choice',
      path: 'columns',
      label: 'Across',
      options: [
        { value: 2, label: 'Two' },
        { value: 3, label: 'Three' },
      ],
    },
  ],
  frameDefaults: { spacing: 'loose' },
  checks: [
    emptyCheck(
      'collection-empty',
      (c) => c.projects.length + c.caseStudies.length,
      'published records'
    ),
    {
      id: 'collection-featured-empty',
      run: (props: CollectionProps, content: BlockContent) =>
        props.featuredOnly && collectionItems(props, content).length === 0
          ? 'Nothing is marked as featured, so this block will not appear. Star a record, or turn off "Featured only".'
          : null,
    },
  ],
  Render: ({ props, frame, headingLevel, content }) => {
    const items = collectionItems(props, content);
    if (items.length === 0) return null;

    return (
      <Band frame={frame}>
        <Stack gap={6}>
          {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
          <Grid columns={props.columns ?? 3}>
            {items.map((item) => (
              <Card key={item.id}>
                {item.meta && <Eyebrow>{item.meta}</Eyebrow>}
                <Heading level={deeper(headingLevel)} size="sm">
                  {item.title}
                </Heading>
                {item.summary && <Text size="sm">{item.summary}</Text>}
                <Button href={item.href} variant="secondary">
                  View
                </Button>
              </Card>
            ))}
          </Grid>
        </Stack>
      </Band>
    );
  },
};

/* ---------------------------------------------------------------- timeline */

const timelineProps = z.object({
  heading: z.string().optional(),
  kind: z.enum(['work', 'education', 'both']).default('work'),
  limit: z.number().int().min(0).max(24).optional(),
});

type TimelineProps = z.infer<typeof timelineProps>;

function timelineRows(props: TimelineProps, content: BlockContent) {
  const work =
    props.kind === 'education'
      ? []
      : content.experience.map((e) => ({
          id: e.id,
          period: e.period,
          title: e.role,
          where: e.company,
          detail: e.summary,
        }));

  const study =
    props.kind === 'work'
      ? []
      : content.education.map((e) => ({
          id: e.id,
          period: e.yearLabel,
          title: e.degree,
          where: e.institution,
          detail: e.status,
        }));

  return take([...work, ...study], props.limit);
}

const timeline: BlockDefinition<TimelineProps> = {
  type: 'timeline',
  version: 1,
  label: 'Experience',
  description: 'Your roles and study, in the order you arranged them.',
  group: 'credentials',
  schema: timelineProps,
  defaults: () => ({ kind: 'work', heading: 'Experience' }),
  fields: [
    headingField,
    {
      kind: 'choice',
      path: 'kind',
      label: 'Show',
      options: [
        { value: 'work', label: 'Roles' },
        { value: 'education', label: 'Study' },
        { value: 'both', label: 'Both' },
      ],
    },
    limitField,
  ],
  checks: [
    emptyCheck(
      'timeline-empty',
      (c) => c.experience.length + c.education.length,
      'roles or courses'
    ),
  ],
  Render: ({ props, frame, headingLevel, content }) => {
    const rows = timelineRows(props, content);
    if (rows.length === 0) return null;

    return (
      <Band frame={frame}>
        <Stack gap={6}>
          {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
          <Stack gap={5}>
            {rows.map((row) => (
              <Stack key={row.id} gap={2}>
                {row.period && <Eyebrow>{row.period}</Eyebrow>}
                <Heading level={deeper(headingLevel)} size="sm">
                  {row.title}
                </Heading>
                {row.where && <Text size="sm">{row.where}</Text>}
                {row.detail && <Text size="sm">{row.detail}</Text>}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Band>
    );
  },
};

/* ---------------------------------------------------------------- logoWall */

const logoWallProps = z.object({
  heading: z.string().optional(),
  columns: z.union([z.literal(3), z.literal(4)]).optional(),
  limit: z.number().int().min(0).max(24).optional(),
});

type LogoWallProps = z.infer<typeof logoWallProps>;

const logoWall: BlockDefinition<LogoWallProps> = {
  type: 'logoWall',
  version: 1,
  label: 'Clients',
  description: 'The logos from your Brands screen.',
  group: 'credentials',
  schema: logoWallProps,
  defaults: () => ({ heading: 'Trusted by' }),
  fields: [
    headingField,
    {
      kind: 'choice',
      path: 'columns',
      label: 'Across',
      options: [
        { value: 3, label: 'Three' },
        { value: 4, label: 'Four' },
      ],
    },
    limitField,
  ],
  frameDefaults: { surface: 'sunken' },
  checks: [emptyCheck('logo-wall-empty', (c) => c.brands.length, 'clients')],
  Render: ({ props, frame, headingLevel, content }) => {
    const brands = take(content.brands, props.limit);
    if (brands.length === 0) return null;

    return (
      <Band frame={frame}>
        <Stack gap={6}>
          {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
          <Grid columns={props.columns ?? 4} gap={5}>
            {brands.map((brand) => (
              // `alt` comes from the record. A logo whose description is empty
              // is decorative here — the client's name is not information a
              // screen-reader user loses, because the heading above says what
              // this row is.
              <Media
                key={brand.id}
                src={brand.logo}
                alt={brand.alt || ''}
                ratio="wide"
                fit="contain"
              />
            ))}
          </Grid>
        </Stack>
      </Band>
    );
  },
};

/* ------------------------------------------------------------ testimonials */

const testimonialsProps = z.object({
  heading: z.string().optional(),
  featuredOnly: z.boolean().optional(),
  limit: z.number().int().min(0).max(24).optional(),
  columns: z.union([z.literal(2), z.literal(3)]).optional(),
});

type TestimonialsProps = z.infer<typeof testimonialsProps>;

const testimonials: BlockDefinition<TestimonialsProps> = {
  type: 'testimonials',
  version: 1,
  label: 'What people say',
  description: 'Quotes from your Recommendations screen.',
  group: 'credentials',
  schema: testimonialsProps,
  defaults: () => ({ heading: 'What people say', limit: 3 }),
  fields: [
    headingField,
    { kind: 'toggle', path: 'featuredOnly', label: 'Featured only' },
    limitField,
    {
      kind: 'choice',
      path: 'columns',
      label: 'Across',
      options: [
        { value: 2, label: 'Two' },
        { value: 3, label: 'Three' },
      ],
    },
  ],
  checks: [emptyCheck('testimonials-empty', (c) => c.recommendations.length, 'recommendations')],
  Render: ({ props, frame, headingLevel, content }) => {
    const all = props.featuredOnly
      ? content.recommendations.filter((r) => r.featured)
      : content.recommendations;
    const quotes = take(all, props.limit);
    if (quotes.length === 0) return null;

    return (
      <Band frame={frame}>
        <Stack gap={6}>
          {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
          <Grid columns={props.columns ?? 3}>
            {quotes.map((quote) => (
              <Card key={quote.id}>
                {/* A quotation is quoted markup, not a styled paragraph — the
                    difference a screen reader announces. */}
                <blockquote>
                  <Text>{quote.quote}</Text>
                </blockquote>
                <Text size="sm">
                  {quote.name}
                  {quote.role ? ` — ${quote.role}` : ''}
                  {quote.company ? `, ${quote.company}` : ''}
                </Text>
              </Card>
            ))}
          </Grid>
        </Stack>
      </Band>
    );
  },
};

/* ------------------------------------------------------------------ skills */

const skillsProps = z.object({
  heading: z.string().optional(),
  columns: z.union([z.literal(2), z.literal(3)]).optional(),
});

type SkillsProps = z.infer<typeof skillsProps>;

const skills: BlockDefinition<SkillsProps> = {
  type: 'skills',
  version: 1,
  label: 'What you do',
  description: 'The groups from your Capabilities screen.',
  group: 'credentials',
  schema: skillsProps,
  defaults: () => ({ heading: 'What I do' }),
  fields: [
    headingField,
    {
      kind: 'choice',
      path: 'columns',
      label: 'Across',
      options: [
        { value: 2, label: 'Two' },
        { value: 3, label: 'Three' },
      ],
    },
  ],
  checks: [emptyCheck('skills-empty', (c) => c.capabilityGroups.length, 'capability groups')],
  Render: ({ props, frame, headingLevel, content }) => {
    if (content.capabilityGroups.length === 0) return null;

    return (
      <Band frame={frame}>
        <Stack gap={6}>
          {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
          <Grid columns={props.columns ?? 3}>
            {content.capabilityGroups.map((group) => (
              <Stack key={group.id} gap={3}>
                <Heading level={deeper(headingLevel)} size="sm">
                  {group.title}
                </Heading>
                {group.description && <Text size="sm">{group.description}</Text>}
                {group.capabilities.length > 0 && (
                  <Row gap={2}>
                    {group.capabilities.map((capability) => (
                      <Pill key={capability}>{capability}</Pill>
                    ))}
                  </Row>
                )}
              </Stack>
            ))}
          </Grid>
        </Stack>
      </Band>
    );
  },
};

/* ------------------------------------------------------------------- steps */

const stepsProps = z.object({
  heading: z.string().optional(),
  showDetails: z.boolean().optional(),
});

type StepsProps = z.infer<typeof stepsProps>;

const steps: BlockDefinition<StepsProps> = {
  type: 'steps',
  version: 1,
  label: 'How you work',
  description: 'The numbered stages from your Process screen.',
  group: 'credentials',
  schema: stepsProps,
  defaults: () => ({ heading: 'How I work' }),
  fields: [
    headingField,
    {
      kind: 'toggle',
      path: 'showDetails',
      label: 'Include the detail under each stage',
      help: 'Off keeps it to a summary, which reads better on a phone.',
    },
  ],
  checks: [emptyCheck('steps-empty', (c) => c.processSteps.length, 'process steps')],
  Render: ({ props, frame, headingLevel, content }) => {
    if (content.processSteps.length === 0) return null;

    return (
      <Band frame={frame}>
        <Stack gap={6}>
          {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
          <Stack gap={5}>
            {content.processSteps.map((step) => (
              <Stack key={step.id} gap={2}>
                <Eyebrow>{step.number}</Eyebrow>
                <Heading level={deeper(headingLevel)} size="sm">
                  {step.title}
                </Heading>
                {step.description && <Text size="sm">{step.description}</Text>}
                {props.showDetails && step.details.length > 0 && (
                  <Stack gap={1}>
                    {step.details.map((detail) => (
                      <Text key={detail} size="sm">
                        {detail}
                      </Text>
                    ))}
                  </Stack>
                )}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Band>
    );
  },
};

export const COLLECTION_DEFINITIONS = [
  collection,
  timeline,
  logoWall,
  testimonials,
  skills,
  steps,
] as unknown as BlockDefinition<never>[];
