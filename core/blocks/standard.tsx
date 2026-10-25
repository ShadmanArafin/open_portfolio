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
} from '../primitives';
import { resolveFrame } from '../primitives/frame';
import { deeper } from '../primitives/heading-level';
import { ContactForm, CommentsFacade, EmbedFacade, NewsletterForm, VideoFacade } from './forms';
import type { BlockField } from './fields';
import type { BlockDefinition } from './schema';
import { sanitizeHref } from '@/core/security/urls';
import { srcSetFor } from '@/core/media/srcset';

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
  focalPoint: z.string().optional(),
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
  {
    kind: 'choice',
    path: `${prefix}.focalPoint`,
    label: 'Crop focus',
    advanced: true,
    options: [
      { value: 'center', label: 'Center' },
      { value: 'top', label: 'Top' },
      { value: 'bottom', label: 'Bottom' },
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
    ],
  },
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
      advanced: true,
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

/* ------------------------------------------------------------------- embed */

/**
 * Turns a booking link somebody pasted into an embed address.
 *
 * Same rule as video: the **host** is checked, not the string, and the URL is
 * rebuilt from the validated parts rather than passed through. Cal.com and
 * Calendly are the two allowlisted hosts — a scheduling page anywhere else is
 * a link, not an embed, and belongs in a button or a card.
 */
const SCHEDULING_HOSTS: Record<string, string> = {
  'cal.com': 'Cal.com',
  'www.cal.com': 'Cal.com',
  'calendly.com': 'Calendly',
  'www.calendly.com': 'Calendly',
};

export function toSchedulingUrl(raw: string): { url: string; provider: string } | null {
  const value = raw.trim();
  if (!value) return null;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;

  const provider = SCHEDULING_HOSTS[parsed.hostname.toLowerCase()];
  if (!provider) return null;
  if (parsed.pathname.replace(/\//g, '').length === 0) return null;

  return { url: `https://${parsed.hostname.toLowerCase()}${parsed.pathname}`, provider };
}

const embedProps = z.object({
  heading: z.string().optional(),
  url: z.string(),
  title: z.string().min(1),
  ratio: z.enum(['1 / 1', '4 / 3', '3 / 4']).optional(),
});
type EmbedProps = z.infer<typeof embedProps>;

const embed: BlockDefinition<EmbedProps> = {
  type: 'embed',
  version: 1,
  label: 'Booking calendar',
  description: 'A Cal.com or Calendly link. Nothing loads until a visitor presses book.',
  group: 'conversion',
  schema: embedProps,
  defaults: () => ({ url: '', title: 'Book a time' }),
  fields: [
    headingField,
    {
      kind: 'text',
      path: 'url',
      label: 'Cal.com or Calendly link',
      placeholder: 'https://cal.com/you/intro',
      help: 'Paste the booking address from the browser bar. Anything else is a link, not an embed.',
    },
    {
      kind: 'text',
      path: 'title',
      label: 'What is being booked',
      help: 'Announced to anyone using a screen reader.',
    },
    {
      kind: 'choice',
      path: 'ratio',
      advanced: true,
      label: 'Shape',
      options: [
        { value: '1 / 1', label: 'Square' },
        { value: '4 / 3', label: 'Classic' },
        { value: '3 / 4', label: 'Tall' },
      ],
    },
  ],
  checks: [
    {
      id: 'recognised',
      run: (props) =>
        props.url.trim() && !toSchedulingUrl(props.url)
          ? 'That link is not a Cal.com or Calendly booking address, so nothing will appear here.'
          : null,
    },
  ],
  Render: ({ props, frame, headingLevel }) => {
    const scheduling = toSchedulingUrl(props.url);
    if (!scheduling) return null;

    return (
      <Band frame={frame}>
        <Stack gap={5}>
          {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
          <EmbedFacade
            embedUrl={scheduling.url}
            title={props.title}
            provider={scheduling.provider}
            ratio={props.ratio ?? '3 / 4'}
            blurb={`Booking runs on ${scheduling.provider}, and nothing loads from there until you ask.`}
            action="Book a time"
          />
        </Stack>
      </Band>
    );
  },
};

/* -------------------------------------------------------------- socialPost */

/**
 * A post, a project or a subscribe box, from the hosts that publish one.
 *
 * Three hosts, and the addresses are the ones their own documentation or
 * endpoints produce rather than the ones a memory produces:
 *
 *   - Instagram: `/p|reel|tv/<code>/embed`, the documented embed path.
 *   - Behance: `/embed/project/<id>?ilo0=1`, the exact iframe their oEmbed
 *     endpoint returns for a gallery link. It was fetched while writing this,
 *     not guessed at.
 *   - Substack: `https://<publication>.substack.com/embed`, the subscribe box
 *     their publications serve.
 *
 * The same rule as the video and booking facades holds: the address is
 * **rebuilt** from the id read out of the link, never passed through. The link
 * can arrive in an import, a restored backup or a typo, and "it is the owner's
 * own link" is not a property a string has.
 *
 * GitHub is absent on purpose and says so in the editor. It publishes no
 * embeddable page for a repository; the alternatives are framing something
 * that refuses to be framed, or shipping a script this site promised not to
 * ship, and an honest gap beats both.
 */
const INSTAGRAM_HOSTS = ['instagram.com', 'www.instagram.com'];
const BEHANCE_HOSTS = ['behance.net', 'www.behance.net'];
const GITHUB_HOSTS = ['github.com', 'www.github.com'];
const SUBSTACK_SUFFIX = '.substack.com';

export interface SocialEmbed {
  url: string;
  provider: string;
  /** What pressing the button does, in the provider's own terms. */
  action: string;
  /** The sentence beside it, naming the provider and the promise. */
  blurb: string;
  /** The shape the provider's own embed is built for. */
  ratio: string;
}

export function toSocialEmbed(raw: string): SocialEmbed | null {
  const value = raw.trim();
  if (!value) return null;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;

  const host = parsed.hostname.toLowerCase();

  if (INSTAGRAM_HOSTS.includes(host)) {
    const match = parsed.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]{5,})/);
    if (!match) return null;
    return {
      url: `https://www.instagram.com/${match[1]}/${match[2]}/embed`,
      provider: 'Instagram',
      action: 'Show the post',
      blurb: 'This is an Instagram post. Nothing loads from Instagram until you show it.',
      ratio: '4 / 5',
    };
  }

  if (BEHANCE_HOSTS.includes(host)) {
    const match = parsed.pathname.match(/^\/gallery\/([0-9]{4,})(?:\/|$)/);
    if (!match) return null;
    return {
      url: `https://www.behance.net/embed/project/${match[1]}?ilo0=1`,
      provider: 'Behance',
      action: 'Show the project',
      blurb: 'This is a Behance project. Nothing loads from Behance until you show it.',
      ratio: '4 / 3',
    };
  }

  const bare = host.startsWith('www.') ? host.slice(4) : host;
  if (bare.endsWith(SUBSTACK_SUFFIX)) {
    const publication = bare.slice(0, -SUBSTACK_SUFFIX.length);
    if (!/^[a-z0-9-]+$/.test(publication)) return null;
    return {
      url: `https://${publication}${SUBSTACK_SUFFIX}/embed`,
      provider: 'Substack',
      action: 'Show the subscribe box',
      blurb: 'Subscribing runs on Substack, and nothing loads from there until you ask.',
      ratio: '4 / 3',
    };
  }

  return null;
}

const socialPostProps = z.object({
  heading: z.string().optional(),
  url: z.string(),
  title: z.string().min(1),
  ratio: z.enum(['1 / 1', '4 / 5', '4 / 3', '3 / 4']).optional(),
});
type SocialPostProps = z.infer<typeof socialPostProps>;

const socialPost: BlockDefinition<SocialPostProps> = {
  type: 'socialPost',
  version: 1,
  label: 'Social post',
  description:
    'An Instagram post, a Behance project or a Substack subscribe box. Nothing loads until a visitor asks for it.',
  group: 'work',
  schema: socialPostProps,
  defaults: () => ({ url: '', title: 'A post' }),
  fields: [
    headingField,
    {
      kind: 'text',
      path: 'url',
      label: 'Link to the post or project',
      placeholder: 'https://www.instagram.com/p/...',
      help: 'Instagram posts and reels, Behance projects, and <name>.substack.com for the subscribe box. A publication on its own domain has to be pasted as its .substack.com address.',
    },
    {
      kind: 'text',
      path: 'title',
      label: 'What it is',
      help: 'Announced to anyone using a screen reader.',
    },
    {
      kind: 'choice',
      path: 'ratio',
      advanced: true,
      label: 'Shape',
      options: [
        { value: '4 / 5', label: 'Portrait' },
        { value: '1 / 1', label: 'Square' },
        { value: '4 / 3', label: 'Classic' },
        { value: '3 / 4', label: 'Tall' },
      ],
    },
  ],
  checks: [
    {
      id: 'recognised',
      run: (props) => {
        const link = props.url.trim();
        if (!link || toSocialEmbed(link)) return null;

        let host = '';
        try {
          host = new URL(link).hostname.toLowerCase();
        } catch {
          host = '';
        }

        if (GITHUB_HOSTS.includes(host)) {
          return 'GitHub publishes no embeddable page for a repository, so nothing can appear here. Link to it from a card or from your work instead.';
        }
        if (BEHANCE_HOSTS.includes(host)) {
          return 'That is not a project page. A Behance project address looks like behance.net/gallery/<number>/<name>.';
        }
        return 'That link is not an Instagram post, a Behance project or a Substack publication, so nothing will appear here.';
      },
    },
  ],
  Render: ({ props, frame, headingLevel }) => {
    const social = toSocialEmbed(props.url);
    if (!social) return null;

    return (
      <Band frame={frame}>
        <Stack gap={5}>
          {props.heading && <Heading level={headingLevel}>{props.heading}</Heading>}
          <EmbedFacade
            embedUrl={social.url}
            title={props.title}
            provider={social.provider}
            ratio={props.ratio ?? social.ratio}
            blurb={social.blurb}
            action={social.action}
          />
        </Stack>
      </Band>
    );
  },
};

/* ------------------------------------------------------------------- split */ const splitProps =
  z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    // Empty while editing is a state the editor writes (see `richText` for the
    // whole reason), so nothing here refuses it.
    paragraphs: z.array(z.string()),
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
    { kind: 'text', path: 'eyebrow', advanced: true, label: 'Small line above' },
    headingField,
    { kind: 'paragraphs', path: 'paragraphs', label: 'Text' },
    ...mediaFields('media'),
    {
      kind: 'choice',
      path: 'ratio',
      advanced: true,
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
  checks: [
    {
      id: 'empty',
      run: (props) =>
        props.heading ||
        props.eyebrow ||
        props.paragraphs.some((paragraph) => paragraph.trim()) ||
        props.media.src
          ? null
          : 'This block is empty. Write something, or delete it.',
    },
  ],
  // `flip` finally has a consumer. It has been in the frame vocabulary since
  // the schema was written and no block read it, which is why the setting
  // existed and did nothing.
  frameCapabilities: ['width', 'spacing', 'surface', 'divider', 'flip'],
  Render: ({ props, frame, headingLevel, content }) => {
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
        srcSet={srcSetFor(props.media.src, content.images)}
        // Beside the text on a wide screen, so about half the page.
        sizes="(min-width: 768px) 50vw, 100vw"
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

/* --------------------------------------------------------------- comments */

const commentsProps = z.object({
  heading: z.string().optional(),
  repo: z.string().default(''),
  repoId: z.string().default(''),
  category: z.string().default(''),
  categoryId: z.string().default(''),
  mapping: z.enum(['pathname', 'url', 'title', 'og:title']).default('pathname'),
});
type CommentsBlockProps = z.infer<typeof commentsProps>;

const comments: BlockDefinition<CommentsBlockProps> = {
  type: 'comments',
  version: 1,
  label: 'Discussion',
  description: 'Reader comments via GitHub Discussions. Nothing loads until a visitor asks.',
  group: 'conversion',
  schema: commentsProps,
  defaults: () => ({
    heading: 'Discussion',
    repo: '',
    repoId: '',
    category: '',
    categoryId: '',
    mapping: 'pathname' as const,
  }),
  fields: [
    headingField,
    { kind: 'text', path: 'repo', label: 'Repository', placeholder: 'owner/name' },
    {
      kind: 'text',
      path: 'repoId',
      label: 'Repository ID',
      help: 'Copy it from giscus.app — it is shown once a repository is chosen there.',
    },
    { kind: 'text', path: 'category', label: 'Discussion category', placeholder: 'Announcements' },
    {
      kind: 'text',
      path: 'categoryId',
      label: 'Category ID',
      help: 'Also from giscus.app, next to the repository ID.',
    },
    {
      kind: 'choice',
      path: 'mapping',
      advanced: true,
      label: 'Match discussions by',
      options: [
        { value: 'pathname', label: 'Page address' },
        { value: 'url', label: 'Full URL' },
        { value: 'title', label: 'Page title' },
        { value: 'og:title', label: 'Share title' },
      ],
    },
  ],
  checks: [
    {
      id: 'comments-unconfigured',
      run: (props) =>
        !props.repo
          ? 'No repository yet, so this block publishes nothing. Connect one under Services → Comments, or fill the fields above — giscus.app hands you every value.'
          : !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(props.repo)
            ? 'That repository does not look like owner/name, so the thread cannot load.'
            : null,
    },
  ],
  Render: ({ props, frame, headingLevel }) => {
    // Unfinished is advice in the editor, not a hole on the page: without a
    // repository there is no thread to show and nothing may phone GitHub.
    if (!props.repo) return null;
    return (
      <Band frame={frame}>
        <Stack gap={5}>
          {props.heading && (
            <Heading level={headingLevel} size="md">
              {props.heading}
            </Heading>
          )}
          <CommentsFacade
            repo={props.repo}
            repoId={props.repoId}
            category={props.category}
            categoryId={props.categoryId}
            mapping={props.mapping}
          />
        </Stack>
      </Band>
    );
  },
};

/* ---------------------------------------------------------------- socialRow */

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
      advanced: true,
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
            {content.socialLinks.map((link) => {
              const safeUrl = sanitizeHref(link.url);
              if (!safeUrl) return null;
              return (
                <a
                  key={link.id}
                  href={safeUrl}
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
              );
            })}
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
    const safeFile = sanitizeHref(props.file);
    if (!safeFile) return null;

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
              href={safeFile}
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

/* ------------------------------------------------------------------ links */

const linkItemSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  highlight: z.boolean().optional(),
});

const linksProps = z.object({
  heading: z.string().optional(),
  subhead: z.string().optional(),
  items: z.array(linkItemSchema),
});
type LinksProps = z.infer<typeof linksProps>;

/**
 * A vertical stack of links.
 *
 * The classic link-in-bio pattern: a clean list of prominent tap targets for
 * social bios, project directories, quick links, or a compact mobile navigation.
 */
const links: BlockDefinition<LinksProps> = {
  type: 'links',
  version: 1,
  label: 'Stack of links',
  description: 'A vertical list of links — for a bio page, socials, or quick shortcuts.',
  group: 'conversion',
  schema: linksProps,
  defaults: () => ({
    heading: 'Links',
    items: [
      { title: 'My Work', url: '/work', subtitle: 'Selected case studies and projects' },
      { title: 'Writing & Notes', url: '/writing' },
      { title: 'Get in Touch', url: '/contact', badge: 'Available' },
    ],
  }),
  fields: [
    headingField,
    { kind: 'textarea', path: 'subhead', label: 'Introductory note', rows: 2 },
    {
      kind: 'list',
      path: 'items',
      label: 'Links',
      itemNoun: 'link',
      titlePath: 'title',
      min: 1,
      fields: [
        { kind: 'text', path: 'title', label: 'Label', placeholder: 'My Work' },
        { kind: 'text', path: 'url', label: 'Where it goes', placeholder: '/work or https://...' },
        { kind: 'text', path: 'subtitle', label: 'Short description (optional)' },
        { kind: 'text', path: 'badge', label: 'Badge / tag (optional)', placeholder: 'New' },
        { kind: 'toggle', path: 'highlight', label: 'Highlight this link' },
      ],
      newItem: () => ({ title: 'New link', url: 'https://' }),
    },
  ],
  frameDefaults: { width: 'narrow', align: 'center' },
  checks: [
    {
      id: 'has-links',
      run: (props) =>
        props.items.length === 0 ? 'No links added yet. Add at least one link.' : null,
    },
    {
      id: 'empty-url',
      run: (props) =>
        props.items.some((item) => !item.url.trim())
          ? 'One or more links has no destination.'
          : null,
    },
  ],
  Render: ({ props, frame, headingLevel }) => {
    if (!props.items || props.items.length === 0) return null;

    return (
      <Band frame={frame}>
        <Stack gap={6}>
          {props.heading && (
            <Heading level={headingLevel} size="lg">
              {props.heading}
            </Heading>
          )}
          {props.subhead && (
            <Text tone="muted" size="base">
              {props.subhead}
            </Text>
          )}
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            {props.items.map((item, index) => {
              const safeUrl = sanitizeHref(item.url);
              if (!safeUrl) return null;
              const isExternal = /^https?:\/\//i.test(safeUrl);
              const isHighlight = Boolean(item.highlight);

              return (
                <li key={`${item.title}-${index}`}>
                  <a
                    href={safeUrl}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      minHeight: 'var(--control-height)',
                      padding: 'var(--space-4) var(--space-5)',
                      borderRadius: 'var(--radius-lg)',
                      background: isHighlight
                        ? 'var(--surface-accent, var(--btn-primary-bg))'
                        : 'var(--surface-raised, var(--surface-secondary))',
                      color: isHighlight
                        ? 'var(--btn-primary-text, var(--text-primary))'
                        : 'var(--text-primary)',
                      border: isHighlight
                        ? 'var(--hairline) solid transparent'
                        : 'var(--hairline) solid var(--border-color)',
                      textDecoration: 'none',
                      transition: 'transform 0.15s ease, opacity 0.15s ease, background 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-base)',
                          fontWeight: 600,
                          lineHeight: 'var(--leading-tight)',
                        }}
                      >
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-xs)',
                            color: isHighlight ? 'inherit' : 'var(--text-muted)',
                            opacity: isHighlight ? 0.85 : 1,
                            lineHeight: 'var(--leading-normal)',
                          }}
                        >
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        flexShrink: 0,
                        marginLeft: 'var(--space-3)',
                      }}
                    >
                      {item.badge && (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 500,
                            background: isHighlight
                              ? 'var(--surface-sunken)'
                              : 'var(--surface-secondary)',
                            color: isHighlight ? 'inherit' : 'var(--text-primary)',
                            lineHeight: 1,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      <span
                        aria-hidden="true"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-sm)',
                          opacity: 0.6,
                        }}
                      >
                        {isExternal ? '↗' : '→'}
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </Stack>
      </Band>
    );
  },
};

export const STANDARD_DEFINITIONS = [
  contactForm,
  faq,
  video,
  embed,
  socialPost,
  split,
  quote,
  newsletter,
  comments,
  socialRow,
  services,
  download,
  separator,
  links,
] as unknown as BlockDefinition<never>[];
