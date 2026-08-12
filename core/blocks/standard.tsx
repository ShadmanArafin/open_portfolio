import React from 'react';
import { z } from 'zod';
import {
  Band,
  Button,
  Card,
  Divider,
  Eyebrow,
  Grid,
  Heading,
  Measure,
  Media,
  Prose,
  Row,
  Stack,
  Text,
  resolveFrame,
} from '../primitives';
import { deeper } from '../primitives/heading-level';
import { ContactForm, NewsletterForm, VideoFacade } from './forms';
import type { BlockField } from './fields';
import type { BlockDefinition } from './schema';

/**
 * The blocks every mainstream builder ships, and this one did not.
 *
 * `definitions.tsx` holds the seven that proved the contract and `collections.tsx`
 * holds the six that place records. Both were chosen to exercise the system.
 * These were chosen the opposite way: by opening the palettes of the tools
 * people leave to come here — Squarespace, Wix, Framer, Carrd, Adobe Portfolio
 * — and taking what appears in all of them and was missing from ours.
 *
 * In rough order of how universal each one is:
 *
 * | Block        | Where it exists elsewhere                                       |
 * | ------------ | --------------------------------------------------------------- |
 * | `contactForm`| Every one of the five. Squarespace Form, Wix Contact, Carrd Form |
 * | `faq`        | Squarespace Accordion, Wix FAQ, Framer Accordion                |
 * | `video`      | Every one of the five                                            |
 * | `split`      | "Media & Text" — every one of the five                          |
 * | `quote`      | Squarespace Quote, Wix Quote, Framer                            |
 * | `newsletter` | Squarespace Newsletter, Wix Subscribe, Framer                   |
 * | `socialRow`  | Wix Social Bar, Squarespace Social Links                        |
 * | `services`   | The pricing section every freelance site has                    |
 * | `separator`  | Squarespace Line and Spacer, in one                             |
 *
 * Two things are deliberately **not** here, and both are common elsewhere:
 *
 * - **A raw HTML or code block.** Squarespace and Wix both have one. It is a
 *   stored-XSS primitive aimed at people who have been told they do not need to
 *   understand code, and the one place a mistake is unrecoverable — the script
 *   runs for every visitor, and for the owner inside their own admin. If a
 *   specific embed is wanted, it gets a block that knows what it is embedding,
 *   the way `video` does.
 * - **A map.** It cannot be done without contacting a third party on page load,
 *   and a portfolio is not a shop with a door.
 */

/* ------------------------------------------------------------------ shared */

const mediaSchema = z.object({
  src: z.string(),
  alt: z.string(),
  decorative: z.boolean().optional(),
});

const mediaFields = (prefix: string): BlockField[] => [
  { kind: 'media', path: `${prefix}.src`, altPath: `${prefix}.alt`, label: 'Image' },
  {
    kind: 'text',
    path: `${prefix}.alt`,
    label: 'Describe this image',
    help: 'What someone who cannot see it would need to know.',
  },
  { kind: 'toggle', path: `${prefix}.decorative`, label: 'Purely decorative' },
];

const headingField: BlockField = { kind: 'text', path: 'heading', label: 'Heading' };

/* ------------------------------------------------------------- contactForm */

const contactFormProps = z.object({
  heading: z.string().optional(),
  intro: z.string().optional(),
  submitLabel: z.string().min(1),
  successMessage: z.string().min(1),
  askCompany: z.boolean().optional(),
  askProjectType: z.boolean().optional(),
  projectTypes: z.array(z.string()).optional(),
});
type ContactFormProps = z.infer<typeof contactFormProps>;

const contactForm: BlockDefinition<ContactFormProps> = {
  type: 'contactForm',
  version: 1,
  label: 'Contact form',
  description: 'Lets someone write to you. Messages arrive in your inbox in the admin.',
  group: 'conversion',
  schema: contactFormProps,
  defaults: () => ({
    heading: 'Get in touch',
    submitLabel: 'Send',
    successMessage: 'Thank you — your message has arrived. I will reply to the address you gave.',
    askProjectType: true,
    projectTypes: ['A new project', 'A collaboration', 'Something else'],
  }),
  fields: [
    headingField,
    { kind: 'textarea', path: 'intro', label: 'A line above the form', rows: 2 },
    { kind: 'text', path: 'submitLabel', label: 'Button text' },
    {
      kind: 'textarea',
      path: 'successMessage',
      label: 'What they see after sending',
      rows: 2,
      help: 'Say what happens next. "Thanks!" leaves somebody wondering whether it worked.',
    },
    { kind: 'toggle', path: 'askCompany', label: 'Ask for their company' },
    { kind: 'toggle', path: 'askProjectType', label: 'Ask what it is about' },
    {
      kind: 'lines',
      path: 'projectTypes',
      label: 'Choices for "what is it about"',
      help: 'One per line. Keep it to three or four — a long list is a form people abandon.',
    },
  ],
  frameDefaults: { width: 'narrow' },
  checks: [
    {
      id: 'needs-mail',
      run: () =>
        'Messages always reach your inbox in the admin. You are only emailed about them once a mail server is connected under Services.',
    },
  ],
  Render: ({ props, frame, headingLevel }) => (
    <Band frame={frame}>
      <Stack gap={6}>
        {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
        {props.intro && (
          <Measure>
            <Text>{props.intro}</Text>
          </Measure>
        )}
        <Measure>
          <ContactForm
            submitLabel={props.submitLabel}
            successMessage={props.successMessage}
            askCompany={props.askCompany}
            askProjectType={props.askProjectType}
            projectTypes={props.projectTypes}
          />
        </Measure>
      </Stack>
    </Band>
  ),
};

/* --------------------------------------------------------------------- faq */

const faqProps = z.object({
  heading: z.string().optional(),
  items: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
});
type FaqProps = z.infer<typeof faqProps>;

const faq: BlockDefinition<FaqProps> = {
  type: 'faq',
  version: 1,
  label: 'Questions and answers',
  description: 'The things people ask before they write to you. Each one opens and closes.',
  group: 'credentials',
  schema: faqProps,
  defaults: () => ({
    heading: 'Questions',
    items: [
      {
        question: 'What does a project usually cost?',
        answer: 'Say something honest here. A range beats "it depends".',
      },
    ],
  }),
  fields: [
    headingField,
    {
      kind: 'list',
      path: 'items',
      label: 'Questions',
      itemNoun: 'question',
      titlePath: 'question',
      min: 1,
      max: 20,
      fields: [
        { kind: 'text', path: 'question', label: 'Question' },
        { kind: 'textarea', path: 'answer', label: 'Answer', rows: 4 },
      ],
      newItem: () => ({ question: 'Another question', answer: 'And the answer.' }),
    },
  ],
  frameDefaults: { width: 'narrow' },
  checks: [
    {
      id: 'answered',
      run: (props) =>
        props.items.some((item) => !item.answer.trim())
          ? 'One of these has no answer yet. It will show as an empty panel.'
          : null,
    },
  ],
  // Native <details>, so it opens with no JavaScript, works before hydration,
  // is keyboard-operable and announces its own state to a screen reader. Every
  // hand-built accordion in this category gets at least one of those wrong.
  Render: ({ props, frame, headingLevel }) => (
    <Band frame={frame}>
      <Stack gap={6}>
        {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
        {/* No gap between rows: each carries its own top rule, and a gap would
            turn a continuous list into floating strips. */}
        <div>
          {props.items.map((item, i) => (
            <details key={i} style={{ borderTop: 'var(--hairline) solid var(--border-color)' }}>
              <summary
                style={{
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  gap: 'var(--space-4)',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  // Tall enough to be a comfortable target on a phone; the
                  // whole row is the control, not just the words.
                  minHeight: 'var(--control-height)',
                  paddingBlock: 'var(--space-4)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--text-primary)',
                }}
              >
                {item.question}
                <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
                  +
                </span>
              </summary>
              <div style={{ paddingBottom: 'var(--space-5)' }}>
                <Text>{item.answer}</Text>
              </div>
            </details>
          ))}
        </div>
      </Stack>
    </Band>
  ),
};

/* ------------------------------------------------------------------- video */

/**
 * Turns a link somebody pasted into an embed address.
 *
 * Two hosts, both matched by pattern, and the URL is **rebuilt** from the
 * extracted id rather than passed through. Handing a user-supplied string
 * straight to an `<iframe src>` is how a page ends up embedding whatever the
 * string actually pointed at, and "it is the owner's own site" stops being a
 * defence the moment content arrives from an import or a restored backup.
 */
const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];
const VIMEO_HOSTS = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];

export function toEmbedUrl(raw: string): { url: string; poster?: string } | null {
  const value = raw.trim();
  if (!value) return null;

  // The **host** is checked, not the string. Searching the whole link for
  // "youtube.com/watch?v=" matches `https://evil.example/youtube.com/watch?v=…`
  // — which a test caught here, and which would have quietly turned a link to
  // somebody else's site into a video that appeared to work.
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;

  const host = parsed.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.includes(host)) {
    const id =
      parsed.searchParams.get('v') ??
      parsed.pathname.match(/^\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{6,20})/)?.[1] ??
      (host === 'youtu.be' ? parsed.pathname.slice(1) : null);

    if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null;
    return {
      // `youtube-nocookie` on top of the facade: the facade means nothing loads
      // until somebody presses play, and this means what loads then is the
      // version that does not set advertising state.
      url: `https://www.youtube-nocookie.com/embed/${id}`,
      poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  if (VIMEO_HOSTS.includes(host)) {
    const id = parsed.pathname.match(/\/(?:video\/)?([0-9]{6,12})/)?.[1];
    if (!id) return null;
    return { url: `https://player.vimeo.com/video/${id}` };
  }

  return null;
}

const videoProps = z.object({
  heading: z.string().optional(),
  url: z.string(),
  title: z.string().min(1),
  caption: z.string().optional(),
  ratio: z.enum(['16 / 9', '4 / 3', '1 / 1']).optional(),
});
type VideoProps = z.infer<typeof videoProps>;

const video: BlockDefinition<VideoProps> = {
  type: 'video',
  version: 1,
  label: 'Video',
  description: 'A YouTube or Vimeo link. Nothing loads until a visitor presses play.',
  group: 'work',
  schema: videoProps,
  defaults: () => ({ url: '', title: 'A video' }),
  fields: [
    headingField,
    {
      kind: 'text',
      path: 'url',
      label: 'YouTube or Vimeo link',
      placeholder: 'https://www.youtube.com/watch?v=…',
      help: 'Paste the address from the browser bar. Nothing else is accepted, on purpose.',
    },
    {
      kind: 'text',
      path: 'title',
      label: 'What is in it',
      help: 'Announced to anyone using a screen reader, and shown if the video will not load.',
    },
    { kind: 'text', path: 'caption', label: 'Caption' },
    {
      kind: 'choice',
      path: 'ratio',
      label: 'Shape',
      options: [
        { value: '16 / 9', label: 'Widescreen' },
        { value: '4 / 3', label: 'Classic' },
        { value: '1 / 1', label: 'Square' },
      ],
    },
  ],
  checks: [
    {
      id: 'recognised',
      run: (props) =>
        props.url.trim() && !toEmbedUrl(props.url)
          ? 'That link is not a YouTube or Vimeo address, so nothing will appear here.'
          : null,
    },
  ],
  Render: ({ props, frame, headingLevel }) => {
    const embed = toEmbedUrl(props.url);
    if (!embed) return null;

    return (
      <Band frame={frame}>
        <Stack gap={5}>
          {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
          <VideoFacade
            embedUrl={embed.url}
            title={props.title}
            poster={embed.poster}
            ratio={props.ratio ?? '16 / 9'}
          />
          {props.caption && <Text size="sm">{props.caption}</Text>}
        </Stack>
      </Band>
    );
  },
};

/* ------------------------------------------------------------------- split */

const splitProps = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  paragraphs: z.array(z.string()).min(1),
  media: mediaSchema,
  cta: z
    .array(z.object({ label: z.string(), href: z.string() }))
    .max(1)
    .optional(),
  ratio: z.enum(['4 / 3', '1 / 1', '3 / 4']).optional(),
});
type SplitProps = z.infer<typeof splitProps>;

const split: BlockDefinition<SplitProps> = {
  type: 'split',
  version: 1,
  label: 'Picture and text',
  description: 'A photograph beside a paragraph. The "about me" shape, and much else.',
  group: 'identity',
  schema: splitProps,
  defaults: () => ({
    heading: 'About',
    paragraphs: ['Two or three sentences about who you are and what you do.'],
    media: { src: '', alt: '' },
  }),
  fields: [
    { kind: 'text', path: 'eyebrow', label: 'Small line above' },
    headingField,
    { kind: 'paragraphs', path: 'paragraphs', label: 'Text' },
    ...mediaFields('media'),
    {
      kind: 'choice',
      path: 'ratio',
      label: 'Picture shape',
      options: [
        { value: '4 / 3', label: 'Landscape' },
        { value: '1 / 1', label: 'Square' },
        { value: '3 / 4', label: 'Portrait' },
      ],
    },
    {
      kind: 'list',
      path: 'cta',
      label: 'Button',
      itemNoun: 'button',
      titlePath: 'label',
      max: 1,
      fields: [
        { kind: 'text', path: 'label', label: 'Button text' },
        { kind: 'text', path: 'href', label: 'Where it goes' },
      ],
      newItem: () => ({ label: 'Read more', href: '/about' }),
    },
  ],
  // `flip` finally has a consumer. It has been in the frame vocabulary since
  // the schema was written and no block read it, which is why the setting
  // existed and did nothing.
  frameCapabilities: ['width', 'spacing', 'surface', 'divider', 'flip'],
  Render: ({ props, frame, headingLevel }) => {
    const flipped = resolveFrame(frame).flip;

    const words = (
      <Stack gap={5}>
        {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
        {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
        <Prose>
          {props.paragraphs.map((paragraph, i) => (
            <p key={i} style={{ margin: 0 }}>
              {paragraph}
            </p>
          ))}
        </Prose>
        {props.cta?.length ? (
          <Row>
            <Button href={props.cta[0].href}>{props.cta[0].label}</Button>
          </Row>
        ) : null}
      </Stack>
    );

    const picture = (
      <Media
        src={props.media.src}
        alt={props.media.alt}
        decorative={props.media.decorative}
        ratio={props.ratio ?? '4 / 3'}
      />
    );

    return (
      <Band frame={frame}>
        {/* Two intrinsic columns that become one when there is no room, with no
            media query and therefore no breakpoint to get wrong. `flip` swaps
            the DOM order, which keeps the reading order and the visual order
            the same — a CSS-only swap reads correctly and tabs backwards. */}
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-10)',
            alignItems: 'center',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(var(--card-min-2), 100%), 1fr))',
          }}
        >
          {flipped ? picture : words}
          {flipped ? words : picture}
        </div>
      </Band>
    );
  },
};

/* ------------------------------------------------------------------- quote */

const quoteProps = z.object({
  quote: z.string().min(1),
  attribution: z.string().optional(),
  role: z.string().optional(),
});
type QuoteProps = z.infer<typeof quoteProps>;

const quote: BlockDefinition<QuoteProps> = {
  type: 'quote',
  version: 1,
  label: 'Quote',
  description: 'One sentence, set large. Something somebody said, or something you believe.',
  group: 'identity',
  schema: quoteProps,
  defaults: () => ({ quote: 'A short line worth setting apart from everything around it.' }),
  fields: [
    { kind: 'textarea', path: 'quote', label: 'The quote', rows: 3 },
    { kind: 'text', path: 'attribution', label: 'Who said it' },
    { kind: 'text', path: 'role', label: 'Their role' },
  ],
  frameDefaults: { width: 'narrow', align: 'center' },
  checks: [
    {
      id: 'length',
      run: (props) =>
        props.quote.length > 240
          ? 'This is long for a quote set at display size. Under about 160 characters keeps the effect.'
          : null,
    },
  ],
  Render: ({ props, frame }) => (
    <Band frame={frame}>
      {/* A real <figure>/<blockquote>/<figcaption>, not a styled div. It is the
          difference between "a large sentence" and "a quotation" to anything
          that is not looking at the screen. */}
      <figure style={{ margin: 0, display: 'grid', gap: 'var(--space-5)' }}>
        <blockquote
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'inherit',
          }}
        >
          {props.quote}
        </blockquote>
        {(props.attribution || props.role) && (
          <figcaption
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
            }}
          >
            {[props.attribution, props.role].filter(Boolean).join(' · ')}
          </figcaption>
        )}
      </figure>
    </Band>
  ),
};

/* -------------------------------------------------------------- newsletter */

const newsletterProps = z.object({
  heading: z.string().optional(),
  pitch: z.string().optional(),
  buttonLabel: z.string().min(1),
});
type NewsletterBlockProps = z.infer<typeof newsletterProps>;

const newsletter: BlockDefinition<NewsletterBlockProps> = {
  type: 'newsletter',
  version: 1,
  label: 'Newsletter sign-up',
  description: 'Collects email addresses. Everyone confirms by email before joining the list.',
  group: 'conversion',
  schema: newsletterProps,
  defaults: () => ({
    heading: 'Occasional updates',
    pitch: 'A short note when there is something new. No more than that.',
    buttonLabel: 'Subscribe',
  }),
  fields: [
    headingField,
    { kind: 'textarea', path: 'pitch', label: 'What they are signing up for', rows: 2 },
    { kind: 'text', path: 'buttonLabel', label: 'Button text' },
  ],
  frameDefaults: { width: 'narrow', surface: 'raised' },
  checks: [
    {
      id: 'switched-on',
      run: () =>
        'Sign-ups only work once you switch the newsletter on and connect a mail server — Newsletter, then Services.',
    },
  ],
  Render: ({ props, frame, headingLevel }) => (
    <Band frame={frame}>
      <Stack gap={5}>
        {props.heading && (
          <Heading level={headingLevel} size="md">
            {props.heading}
          </Heading>
        )}
        {props.pitch && <Text>{props.pitch}</Text>}
        <NewsletterForm buttonLabel={props.buttonLabel} />
      </Stack>
    </Band>
  ),
};

/* --------------------------------------------------------------- socialRow */

const socialRowProps = z.object({
  heading: z.string().optional(),
  showHandles: z.boolean().optional(),
});
type SocialRowProps = z.infer<typeof socialRowProps>;

const socialRow: BlockDefinition<SocialRowProps> = {
  type: 'socialRow',
  version: 1,
  label: 'Where else to find you',
  description: 'Your social links, as a row. Edited under Footer & social.',
  group: 'conversion',
  schema: socialRowProps,
  defaults: () => ({ heading: 'Elsewhere', showHandles: true }),
  fields: [
    headingField,
    {
      kind: 'toggle',
      path: 'showHandles',
      label: 'Show the handle as well as the platform',
    },
  ],
  checks: [
    {
      id: 'empty',
      run: (_props, content) =>
        content.socialLinks.length === 0
          ? 'You have no social links yet, so this block will not appear. Add them under Footer & social.'
          : null,
    },
  ],
  Render: ({ props, frame, headingLevel, content }) => {
    if (content.socialLinks.length === 0) return null;

    return (
      <Band frame={frame}>
        <Stack gap={5}>
          {props.heading && (
            <Heading level={headingLevel} size="md">
              {props.heading}
            </Heading>
          )}
          {/* Words, not icons. Reaching for the icon set would pull
              `react-icons` — and its whole `fa6` bundle — into a Server
              Component that renders on every page, which the plan called out
              specifically. A named link is also what a screen reader announces
              either way. */}
          <Row gap={3}>
            {content.socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="me noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  minHeight: 'var(--control-height)',
                  paddingInline: 'var(--space-5)',
                  borderRadius: 'var(--radius-full)',
                  border: 'var(--hairline) solid var(--border-color)',
                  background: 'var(--surface-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                }}
              >
                <span>{link.label}</span>
                {props.showHandles && link.name && (
                  <span style={{ color: 'var(--text-muted)' }}>{link.name}</span>
                )}
              </a>
            ))}
          </Row>
        </Stack>
      </Band>
    );
  },
};

/* ---------------------------------------------------------------- services */

const servicesProps = z.object({
  heading: z.string().optional(),
  intro: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string(),
        price: z.string().optional(),
        description: z.string().optional(),
        includes: z.array(z.string()).optional(),
      })
    )
    .min(1),
  cta: z
    .array(z.object({ label: z.string(), href: z.string() }))
    .max(1)
    .optional(),
});
type ServicesProps = z.infer<typeof servicesProps>;

const services: BlockDefinition<ServicesProps> = {
  type: 'services',
  version: 1,
  label: 'What you offer',
  description: 'The work you take on, and what it costs. Say a real number if you can.',
  group: 'conversion',
  schema: servicesProps,
  defaults: () => ({
    heading: 'How we could work together',
    items: [
      {
        title: 'A short engagement',
        price: 'From £X',
        description: 'What it is, who it suits, and roughly how long it takes.',
        includes: ['What they get', 'And what else'],
      },
    ],
  }),
  fields: [
    headingField,
    { kind: 'textarea', path: 'intro', label: 'A line above', rows: 2 },
    {
      kind: 'list',
      path: 'items',
      label: 'What you offer',
      itemNoun: 'offer',
      titlePath: 'title',
      min: 1,
      max: 4,
      fields: [
        { kind: 'text', path: 'title', label: 'Name' },
        {
          kind: 'text',
          path: 'price',
          label: 'Price',
          help: 'A range beats "on request" — it is the question everybody has and nobody asks.',
        },
        { kind: 'textarea', path: 'description', label: 'What it is', rows: 3 },
        { kind: 'lines', path: 'includes', label: 'What is included' },
      ],
      newItem: () => ({ title: 'Another offer', price: '', description: '' }),
    },
    {
      kind: 'list',
      path: 'cta',
      label: 'Button',
      itemNoun: 'button',
      titlePath: 'label',
      max: 1,
      fields: [
        { kind: 'text', path: 'label', label: 'Button text' },
        { kind: 'text', path: 'href', label: 'Where it goes' },
      ],
      newItem: () => ({ label: 'Get in touch', href: '/contact' }),
    },
  ],
  checks: [
    {
      id: 'priced',
      run: (props) =>
        props.items.every((item) => !item.price?.trim())
          ? 'None of these has a price. It is the first thing anybody looks for, and its absence reads as expensive.'
          : null,
    },
  ],
  Render: ({ props, frame, headingLevel, content: _content }) => (
    <Band frame={frame}>
      <Stack gap={8}>
        <Stack gap={4}>
          {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
          {props.intro && (
            <Measure>
              <Text>{props.intro}</Text>
            </Measure>
          )}
        </Stack>

        <Grid columns={props.items.length >= 3 ? 3 : 2}>
          {props.items.map((item, i) => (
            <Card key={i}>
              <Heading level={deeper(headingLevel)} size="sm">
                {item.title}
              </Heading>
              {item.price && (
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-2xl)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {item.price}
                </span>
              )}
              {item.description && <Text size="sm">{item.description}</Text>}
              {item.includes?.length ? (
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'grid',
                    gap: 'var(--space-2)',
                  }}
                >
                  {item.includes.map((line, j) => (
                    <li
                      key={j}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          ))}
        </Grid>

        {props.cta?.length ? (
          <Row>
            <Button href={props.cta[0].href}>{props.cta[0].label}</Button>
          </Row>
        ) : null}
      </Stack>
    </Band>
  ),
};

/* --------------------------------------------------------------- separator */

const separatorProps = z.object({
  rule: z.boolean().optional(),
  size: z.enum(['tight', 'default', 'loose']).optional(),
});
type SeparatorProps = z.infer<typeof separatorProps>;

const separator: BlockDefinition<SeparatorProps> = {
  type: 'separator',
  version: 1,
  label: 'Space or a line',
  description: 'Room to breathe between two blocks, with an optional rule.',
  group: 'utility',
  schema: separatorProps,
  defaults: () => ({ rule: true, size: 'default' }),
  fields: [
    { kind: 'toggle', path: 'rule', label: 'Draw a line' },
    {
      kind: 'choice',
      path: 'size',
      label: 'How much room',
      options: [
        { value: 'tight', label: 'A little' },
        { value: 'default', label: 'Some' },
        { value: 'loose', label: 'A lot' },
      ],
    },
  ],
  // Its own spacing *is* the block, so the frame's spacing control would be two
  // ways to say the same thing — and the pair that disagreed would be a puzzle.
  frameCapabilities: ['width'],
  Render: ({ props, frame }) => (
    <Band frame={{ ...frame, spacing: props.size ?? 'default', divider: 'none' }}>
      {props.rule ? <Divider /> : <div aria-hidden="true" />}
    </Band>
  ),
};

/* -------------------------------------------------------------- download */

const downloadProps = z.object({
  heading: z.string().optional(),
  description: z.string().optional(),
  label: z.string().min(1),
  file: z.string(),
  meta: z.string().optional(),
});
type DownloadProps = z.infer<typeof downloadProps>;

/**
 * A file to take away.
 *
 * The hole this closes: uploading a PDF offered to make it the CV the footer
 * links to, and that was the only place a file could be offered anywhere on the
 * site. Somebody could not put "Download my CV" on their About page, or a rate
 * card on a Services page, or a press kit anywhere at all.
 *
 * The file is picked from the media library rather than read from the site's
 * settings, which is what makes it general. A PDF uploaded for the footer is
 * already in the library, so nothing is uploaded twice.
 */
const download: BlockDefinition<DownloadProps> = {
  type: 'download',
  version: 1,
  label: 'Something to download',
  description: 'A CV, a rate card, a press kit. Any file already in your library.',
  group: 'conversion',
  schema: downloadProps,
  defaults: () => ({ heading: 'My CV', label: 'Download', file: '' }),
  fields: [
    headingField,
    { kind: 'textarea', path: 'description', label: 'What it is', rows: 2 },
    {
      kind: 'media',
      path: 'file',
      label: 'The file',
      help: 'Anything in your media library — a PDF, an image, a document.',
    },
    { kind: 'text', path: 'label', label: 'Button text' },
    {
      kind: 'text',
      path: 'meta',
      label: 'Size or format',
      placeholder: 'PDF · 2 MB',
      help: 'Optional, and appreciated. Nobody likes finding out after the tap.',
    },
  ],
  frameDefaults: { width: 'narrow', surface: 'raised' },
  checks: [
    {
      id: 'has-file',
      run: (props) =>
        props.file.trim() ? null : 'No file chosen yet, so this block will not appear on the page.',
    },
  ],
  Render: ({ props, frame, headingLevel }) => {
    if (!props.file.trim()) return null;

    return (
      <Band frame={frame}>
        <Stack gap={4}>
          {props.heading && (
            <Heading level={headingLevel} size="md">
              {props.heading}
            </Heading>
          )}
          {props.description && <Text>{props.description}</Text>}
          <Row gap={3}>
            {/* A real download rather than a navigation. Without `download` a
                PDF opens in the browser's viewer, which on a phone is a
                different and usually worse outcome than the button promised. */}
            <a
              href={props.file}
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                minHeight: 'var(--control-height)',
                paddingInline: 'var(--space-6)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              {props.label}
            </a>
            {props.meta && <Text size="sm">{props.meta}</Text>}
          </Row>
        </Stack>
      </Band>
    );
  },
};

export const STANDARD_DEFINITIONS = [
  contactForm,
  faq,
  video,
  split,
  quote,
  newsletter,
  socialRow,
  services,
  download,
  separator,
] as unknown as BlockDefinition<never>[];
