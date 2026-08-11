import React from 'react';
import { z } from 'zod';
import {
  Band,
  Button,
  Card,
  Eyebrow,
  Grid,
  Heading,
  Measure,
  Media,
  Metric,
  Prose,
  Stack,
  Text,
} from '../primitives';
import { deeper } from '../primitives/heading-level';
import type { BlockField } from './fields';
import type { BlockDefinition } from './schema';

/**
 * The first six block types.
 *
 * Chosen to cover the shapes the rest will need rather than to be a complete
 * set: a hero (identity), prose (the escape hatch every missing feature would
 * otherwise become a request for), an image, a gallery, stats, and a call to
 * action. Between them they exercise every primitive and every frame value, so
 * the contract is proven before twenty more blocks are written against it.
 *
 * Each one composes only from primitives. No colour, no size, no spacing is
 * named here — that is the block/theme contract, and the ESLint boundary rule
 * enforces it so it cannot erode quietly.
 */

/**
 * `src` may be empty, deliberately.
 *
 * A block is added before it is filled in — that is the whole interaction — so
 * "no image chosen yet" has to be a storable state rather than a validation
 * error. Requiring a source here quarantined an Image block the instant it was
 * inserted from the palette, which a test caught before anyone met it.
 *
 * The schema's job is "is this structurally a media reference". Whether it is
 * *finished* is a content check, where the answer is advice rather than
 * refusal.
 */
const mediaSchema = z.object({
  src: z.string(),
  alt: z.string(),
  decorative: z.boolean().optional(),
});

/** A picture and the decision about its alt text, described once. */
const mediaFields = (prefix: string): BlockField[] => [
  {
    kind: 'media',
    path: prefix ? `${prefix}.src` : 'src',
    altPath: prefix ? `${prefix}.alt` : 'alt',
    label: 'Image',
  },
  {
    kind: 'text',
    path: prefix ? `${prefix}.alt` : 'alt',
    label: 'Describe this image',
    help: 'What someone who cannot see it would need to know. Leave blank only if it is purely decorative.',
  },
  {
    kind: 'toggle',
    path: prefix ? `${prefix}.decorative` : 'decorative',
    label: 'Purely decorative',
    help: 'Hides it from screen readers instead of announcing it.',
  },
];

const ctaFields: BlockField[] = [
  { kind: 'text', path: 'label', label: 'Button text', placeholder: 'Get in touch' },
  { kind: 'text', path: 'href', label: 'Where it goes', placeholder: '/contact' },
];

const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

/* --------------------------------------------------------------------- hero */

const heroProps = z.object({
  eyebrow: z.string().optional(),
  headline: z.string().min(1),
  subhead: z.string().optional(),
  cta: z.array(ctaSchema).max(2).optional(),
});
type HeroProps = z.infer<typeof heroProps>;

const hero: BlockDefinition<HeroProps> = {
  type: 'hero',
  version: 1,
  label: 'Hero',
  description: 'The opening statement — a headline, a line of context, and where to go next.',
  group: 'identity',
  schema: heroProps,
  defaults: () => ({ headline: 'A short, specific statement about what you do.' }),
  fields: [
    { kind: 'text', path: 'eyebrow', label: 'Small line above', placeholder: 'Designer' },
    {
      kind: 'textarea',
      path: 'headline',
      label: 'Headline',
      rows: 2,
      help: 'Around 60 characters reads best. Say what you do, not that you are passionate about it.',
    },
    { kind: 'textarea', path: 'subhead', label: 'Supporting line', rows: 3 },
    {
      kind: 'list',
      path: 'cta',
      label: 'Buttons',
      itemNoun: 'button',
      titlePath: 'label',
      max: 2,
      fields: ctaFields,
      newItem: () => ({ label: 'Get in touch', href: '/contact' }),
    },
  ],
  frameDefaults: { spacing: 'loose' },
  checks: [
    {
      id: 'headline-length',
      run: (props) =>
        props.headline.length > 90
          ? 'This headline will wrap to four or more lines on a phone. Around 60 characters reads best.'
          : null,
    },
  ],
  Render: ({ props, frame, headingLevel }) => (
    <Band frame={frame}>
      <Stack gap={5}>
        {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
        <Heading level={headingLevel} size="display">
          {props.headline}
        </Heading>
        {props.subhead && (
          <Measure>
            <Text size="lg">{props.subhead}</Text>
          </Measure>
        )}
        {props.cta?.length ? (
          <Stack gap={3}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              {props.cta.map((cta, i) => (
                <Button key={cta.href} href={cta.href} variant={i === 0 ? 'primary' : 'secondary'}>
                  {cta.label}
                </Button>
              ))}
            </div>
          </Stack>
        ) : null}
      </Stack>
    </Band>
  ),
};

/* ----------------------------------------------------------------- richText */

const richTextProps = z.object({
  heading: z.string().optional(),
  paragraphs: z.array(z.string()).min(1),
});
type RichTextProps = z.infer<typeof richTextProps>;

const richText: BlockDefinition<RichTextProps> = {
  type: 'richText',
  version: 1,
  label: 'Text',
  description: 'Headings and paragraphs. The general-purpose block.',
  group: 'identity',
  schema: richTextProps,
  defaults: () => ({ paragraphs: ['Write something here.'] }),
  fields: [
    { kind: 'text', path: 'heading', label: 'Heading' },
    {
      kind: 'paragraphs',
      path: 'paragraphs',
      label: 'Text',
      help: 'Leave a blank line between paragraphs.',
    },
  ],
  Render: ({ props, frame, headingLevel }) => (
    <Band frame={frame}>
      <Stack gap={5}>
        {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
        <Prose>
          {props.paragraphs.map((paragraph, i) => (
            <p key={i} style={{ margin: 0 }}>
              {paragraph}
            </p>
          ))}
        </Prose>
      </Stack>
    </Band>
  ),
};

/* -------------------------------------------------------------------- image */

const imageProps = z.object({
  media: mediaSchema,
  caption: z.string().optional(),
  ratio: z.enum(['16 / 9', '4 / 3', '1 / 1', '3 / 4']).optional(),
});
type ImageProps = z.infer<typeof imageProps>;

const image: BlockDefinition<ImageProps> = {
  type: 'image',
  version: 1,
  label: 'Image',
  description: 'A single image, with an optional caption.',
  group: 'work',
  schema: imageProps,
  defaults: () => ({ media: { src: '', alt: '' } }),
  fields: [
    ...mediaFields('media'),
    { kind: 'text', path: 'caption', label: 'Caption' },
    {
      kind: 'choice',
      path: 'ratio',
      label: 'Shape',
      options: [
        { value: '16 / 9', label: 'Wide' },
        { value: '4 / 3', label: 'Classic' },
        { value: '1 / 1', label: 'Square' },
        { value: '3 / 4', label: 'Tall' },
      ],
    },
  ],
  checks: [
    {
      id: 'no-image',
      run: (props) => (props.media.src.trim() ? null : 'This block has no image yet.'),
    },
    {
      id: 'alt-text',
      run: (props) =>
        props.media.src.trim() && !props.media.decorative && !props.media.alt.trim()
          ? 'This image has no alt text, so anyone using a screen reader will not know what it shows.'
          : null,
    },
  ],
  Render: ({ props, frame }) => (
    <Band frame={frame}>
      <Stack gap={3}>
        <Media {...props.media} ratio={props.ratio ?? '16 / 9'} />
        {props.caption && (
          <Text size="sm" tone="muted">
            {props.caption}
          </Text>
        )}
      </Stack>
    </Band>
  ),
};

/* ------------------------------------------------------------------ gallery */

const galleryProps = z.object({
  heading: z.string().optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  items: z.array(mediaSchema.extend({ caption: z.string().optional() })).min(1),
});
type GalleryProps = z.infer<typeof galleryProps>;

const gallery: BlockDefinition<GalleryProps> = {
  type: 'gallery',
  version: 1,
  label: 'Gallery',
  description: 'A grid of images.',
  group: 'work',
  schema: galleryProps,
  defaults: () => ({ items: [{ src: '', alt: '' }] }),
  fields: [
    { kind: 'text', path: 'heading', label: 'Heading' },
    {
      kind: 'choice',
      path: 'columns',
      label: 'Across',
      help: 'A maximum, not a promise — the grid uses fewer when there is no room.',
      options: [
        { value: 2, label: 'Two' },
        { value: 3, label: 'Three' },
        { value: 4, label: 'Four' },
      ],
    },
    {
      kind: 'list',
      path: 'items',
      label: 'Images',
      itemNoun: 'image',
      titlePath: 'alt',
      min: 1,
      fields: [...mediaFields(''), { kind: 'text', path: 'caption', label: 'Caption' }],
      newItem: () => ({ src: '', alt: '' }),
    },
  ],
  checks: [
    {
      id: 'empty-items',
      run: (props) =>
        props.items.some((item) => !item.src.trim())
          ? 'Some slots in this gallery have no image yet.'
          : null,
    },
    {
      id: 'single-item',
      run: (props) =>
        props.items.length === 1
          ? 'A gallery of one image will look like a mistake. Use an Image block instead.'
          : null,
    },
    {
      id: 'ragged-last-row',
      run: (props) => {
        const columns = props.columns ?? 3;
        const remainder = props.items.length % columns;
        return remainder === 1 && props.items.length > columns
          ? 'One image will sit alone on the last row. Adding or removing one will even it out.'
          : null;
      },
    },
  ],
  Render: ({ props, frame, headingLevel }) => (
    <Band frame={frame}>
      <Stack gap={6}>
        {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
        <Grid columns={props.columns ?? 3}>
          {props.items.map((item, i) => (
            <Stack key={`${item.src}-${i}`} gap={2}>
              <Media {...item} ratio="4 / 3" />
              {item.caption && (
                <Text size="sm" tone="muted">
                  {item.caption}
                </Text>
              )}
            </Stack>
          ))}
        </Grid>
      </Stack>
    </Band>
  ),
};

/* -------------------------------------------------------------------- stats */

const statsProps = z.object({
  heading: z.string().optional(),
  items: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).min(1),
});
type StatsProps = z.infer<typeof statsProps>;

const stats: BlockDefinition<StatsProps> = {
  type: 'stats',
  version: 1,
  label: 'Numbers',
  description: 'Figures worth pulling out — years, scale, outcomes.',
  group: 'credentials',
  schema: statsProps,
  defaults: () => ({ items: [{ value: '0', label: 'Something worth counting' }] }),
  fields: [
    { kind: 'text', path: 'heading', label: 'Heading' },
    {
      kind: 'list',
      path: 'items',
      label: 'Numbers',
      itemNoun: 'number',
      titlePath: 'label',
      min: 1,
      fields: [
        { kind: 'text', path: 'value', label: 'The figure', placeholder: '12' },
        { kind: 'text', path: 'label', label: 'What it counts', placeholder: 'Years working' },
      ],
      newItem: () => ({ value: '0', label: 'Something worth counting' }),
    },
  ],
  Render: ({ props, frame, headingLevel }) => (
    <Band frame={frame}>
      <Stack gap={6}>
        {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
        <Grid columns={props.items.length >= 4 ? 4 : 3} gap={5}>
          {props.items.map((item) => (
            <Metric key={item.label} value={item.value} label={item.label} />
          ))}
        </Grid>
      </Stack>
    </Band>
  ),
};

/* ---------------------------------------------------------------- ctaBanner */

const ctaBannerProps = z.object({
  headline: z.string().min(1),
  description: z.string().optional(),
  cta: z.array(ctaSchema).min(1).max(2),
});
type CtaBannerProps = z.infer<typeof ctaBannerProps>;

const ctaBanner: BlockDefinition<CtaBannerProps> = {
  type: 'ctaBanner',
  version: 1,
  label: 'Call to action',
  description: 'A prompt to get in touch, placed anywhere on a page.',
  group: 'conversion',
  schema: ctaBannerProps,
  defaults: () => ({
    headline: 'Have something worth building?',
    cta: [{ label: 'Get in touch', href: '/contact' }],
  }),
  fields: [
    { kind: 'text', path: 'headline', label: 'Headline' },
    { kind: 'textarea', path: 'description', label: 'Supporting line', rows: 2 },
    {
      kind: 'list',
      path: 'cta',
      label: 'Buttons',
      itemNoun: 'button',
      titlePath: 'label',
      min: 1,
      max: 2,
      fields: ctaFields,
      newItem: () => ({ label: 'Get in touch', href: '/contact' }),
    },
  ],
  frameDefaults: { surface: 'raised', align: 'center' },
  Render: ({ props, frame, headingLevel }) => (
    <Band frame={frame}>
      <Stack gap={5}>
        <Heading level={headingLevel} size="xl">
          {props.headline}
        </Heading>
        {props.description && (
          <Measure center>
            <Text>{props.description}</Text>
          </Measure>
        )}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            justifyContent: 'center',
          }}
        >
          {props.cta.map((cta, i) => (
            <Button key={cta.href} href={cta.href} variant={i === 0 ? 'primary' : 'secondary'}>
              {cta.label}
            </Button>
          ))}
        </div>
      </Stack>
    </Band>
  ),
};

/* ------------------------------------------------------------------- cards */

const cardsProps = z.object({
  heading: z.string().optional(),
  columns: z.union([z.literal(2), z.literal(3)]).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().optional(),
        href: z.string().optional(),
      })
    )
    .min(1),
});
type CardsProps = z.infer<typeof cardsProps>;

const cards: BlockDefinition<CardsProps> = {
  type: 'cards',
  version: 1,
  label: 'Cards',
  description: 'A set of short, titled items — services, capabilities, steps.',
  group: 'credentials',
  schema: cardsProps,
  defaults: () => ({ items: [{ title: 'Something you do' }] }),
  fields: [
    { kind: 'text', path: 'heading', label: 'Heading' },
    {
      kind: 'choice',
      path: 'columns',
      label: 'Across',
      options: [
        { value: 2, label: 'Two' },
        { value: 3, label: 'Three' },
      ],
    },
    {
      kind: 'list',
      path: 'items',
      label: 'Cards',
      itemNoun: 'card',
      titlePath: 'title',
      min: 1,
      fields: [
        { kind: 'text', path: 'title', label: 'Title' },
        { kind: 'textarea', path: 'body', label: 'Text', rows: 3 },
        { kind: 'text', path: 'href', label: 'Link (optional)', placeholder: '/work/example' },
      ],
      newItem: () => ({ title: 'Something you do' }),
    },
  ],
  Render: ({ props, frame, headingLevel }) => (
    <Band frame={frame}>
      <Stack gap={6}>
        {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
        <Grid columns={props.columns ?? 3}>
          {props.items.map((item) => (
            <Card key={item.title}>
              <Heading level={deeper(headingLevel)} size="sm">
                {item.title}
              </Heading>
              {item.body && <Text size="sm">{item.body}</Text>}
              {item.href && (
                <Button href={item.href} variant="secondary">
                  Read more
                </Button>
              )}
            </Card>
          ))}
        </Grid>
      </Stack>
    </Band>
  ),
};

export const BLOCK_DEFINITIONS = [
  hero,
  richText,
  image,
  gallery,
  stats,
  cards,
  ctaBanner,
] as unknown as BlockDefinition<never>[];
