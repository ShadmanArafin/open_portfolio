// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import axe from 'axe-core';
import { BlockList } from '../registry';
import { listBlockDefinitions, parsePage } from '../lookup';
import { THEME_PRESETS } from '@/core/theme/presets';
import { buildThemeStylesheet } from '@/core/theme/tokens';
import { buildLayoutStylesheet } from '@/core/theme/layout-tokens';

/**
 * The axe seed of the kitchen-sink matrix.
 *
 * `render.test.tsx` proved every block renders; this proves the result is
 * navigable by assistive technology — one h1, labelled controls, alt text
 * decisions, no empty links. Today it runs every block from its own defaults
 * in one theme; the Phase 9 matrix multiplies this file out (every variant × 6
 * themes × light/dark × breakpoints), it does not replace it.
 *
 * `color-contrast` is off here on purpose: static markup carries no
 * stylesheets, so axe cannot compute real contrast and every check comes back
 * inconclusive. Contrast is enforced where the colours live instead — the
 * token generator clamps to 4.5:1 and the publish gate refuses the rest.
 */

function htmlOf(type: string, props: unknown): string {
  return renderToStaticMarkup(<BlockList blocks={parsePage([{ id: type, type, v: 1, props }])} />);
}

async function violationsOf(html: string, stylesheet?: string) {
  // Blocks always render inside the site's `<main id="main">` (see
  // `app/(site)/layout.tsx`), so the harness reproduces that. Without it
  // axe's `region` rule fails every block for having no landmark — a fact
  // about the harness, not the product.
  document.body.innerHTML = `${stylesheet ? `<style>${stylesheet}</style>` : ''}<main>${html}</main>`;
  const results = await axe.run(document.body, {
    rules: { 'color-contrast': { enabled: false } },
  });
  document.body.innerHTML = '';
  return results.violations;
}

describe('blocks are accessible from defaults', () => {
  it.each(listBlockDefinitions().map((d) => [d.type] as const))(
    '%s has no axe violations',
    async (type) => {
      const definition = listBlockDefinitions().find((d) => d.type === type);
      const violations = await violationsOf(htmlOf(type, definition?.defaults() ?? {}));
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)).toEqual(
        []
      );
    }
  );

  it('filled blocks introduce no new violations', async () => {
    // Defaults prove the "just added" state; filled props prove the lived-in
    // one — links with destinations, images with sources, forms with fields.
    const filled: [string, unknown][] = [
      [
        'hero',
        {
          headline: 'Pictures of places that are about to change',
          subhead: 'A photographer in Lisbon.',
          cta: [{ label: 'See the work', href: '/work' }],
        },
      ],
      [
        'image',
        {
          media: { src: '/api/media/photo.jpg', alt: 'Harbour at dusk', decorative: false },
        },
      ],
      ['video', { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'A talk' }],
      ['faq', { items: [{ q: 'How soon?', a: 'Two weeks.' }] }],
      ['quote', { quote: 'The best camera is the one you have.', name: 'A photographer' }],
      ['newsletter', { heading: 'Occasional updates' }],
      ['contactForm', { heading: 'Say hello' }],
      ['stats', { items: [{ value: '12', label: 'Years' }] }],
      ['cards', { heading: 'Work', items: [{ title: 'An item', text: 'Done in 2024.' }] }],
      [
        'gallery',
        {
          images: [
            { src: '/api/media/a.jpg', alt: 'First', decorative: false },
            { src: '/api/media/b.jpg', alt: 'Second', decorative: false },
          ],
        },
      ],
      [
        'split',
        {
          heading: 'About',
          paragraphs: ['One.'],
          media: { src: '/api/media/c.jpg', alt: 'Portrait', decorative: false },
        },
      ],
      ['ctaBanner', { heading: 'Hire me', cta: [{ label: 'Contact', href: '/contact' }] }],
      ['embed', { url: 'https://cal.com/you/intro', title: 'Book a time' }],
      [
        'socialPost',
        {
          url: 'https://www.instagram.com/p/CxYz12abcDe/',
          title: 'A post from my studio',
        },
      ],
      [
        'comments',
        {
          heading: 'Discussion',
          repo: 'owner/name',
          repoId: 'R_kgD0',
          category: 'Announcements',
          categoryId: 'DIC_kwD0',
          mapping: 'pathname',
        },
      ],
      [
        'links',
        {
          heading: 'Connect',
          subhead: 'Where to find my work online',
          items: [
            { title: 'Portfolio', url: '/work', subtitle: 'Featured work' },
            { title: 'Substack', url: 'https://example.substack.com', badge: 'Weekly' },
          ],
        },
      ],
    ];
    for (const [type, props] of filled) {
      const violations = await violationsOf(htmlOf(type, props));
      expect(
        violations.map((v) => `${type}/${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)
      ).toEqual([]);
    }
  });

  it('a composed page keeps one h1 and ordered headings', async () => {
    const html = renderToStaticMarkup(
      <BlockList
        blocks={parsePage([
          { id: 'one', type: 'hero', v: 1, props: { headline: 'First' } },
          { id: 'two', type: 'faq', v: 1, props: { items: [{ q: 'Q?', a: 'A.' }] } },
          {
            id: 'three',
            type: 'video',
            v: 1,
            props: { url: 'https://vimeo.com/123', title: 'A talk' },
          },
        ])}
      />
    );
    const violations = await violationsOf(html);
    expect(violations.map((v) => v.id)).toEqual([]);
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
  });
});

describe('theme presets matrix (all 6 themes)', () => {
  const composedBlocks = [
    {
      id: 'b1',
      type: 'hero',
      v: 1,
      props: {
        headline: 'Main Title',
        subhead: 'Intro',
        cta: [{ label: 'Work', href: '/work' }],
      },
    },
    {
      id: 'b2',
      type: 'richText',
      v: 1,
      props: { heading: 'About Me', paragraphs: ['I design systems.'] },
    },
    {
      id: 'b3',
      type: 'links',
      v: 1,
      props: {
        heading: 'Quick Links',
        items: [
          { title: 'Projects', url: '/work' },
          { title: 'Contact', url: '/contact' },
        ],
      },
    },
    {
      id: 'b4',
      type: 'cards',
      v: 1,
      props: {
        columns: 2,
        items: [
          { title: 'Web', body: 'Modern web apps.' },
          { title: 'Mobile', body: 'Native feel.' },
        ],
      },
    },
    {
      id: 'b5',
      type: 'quote',
      v: 1,
      props: {
        quote: 'Simplicity is prerequisite for reliability.',
        attribution: 'Edsger W. Dijkstra',
      },
    },
  ];

  it.each(THEME_PRESETS.map((p) => [p.id, p] as const))(
    'theme "%s" has no axe violations on composed page',
    async (_id, preset) => {
      const html = renderToStaticMarkup(<BlockList blocks={parsePage(composedBlocks)} />);
      const themeCss = `${buildThemeStylesheet(preset.colours)} ${buildLayoutStylesheet(preset.layout)}`;
      const violations = await violationsOf(html, themeCss);
      expect(
        violations.map((v) => `${preset.id}/${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)
      ).toEqual([]);
    }
  );
});

describe('block variants matrix', () => {
  const variants: [string, string, unknown][] = [
    ['hero', 'no-cta', { headline: 'Just the Headline' }],
    [
      'hero',
      'two-ctas',
      {
        headline: 'Big Statement',
        eyebrow: 'Design',
        cta: [
          { label: 'Primary', href: '/work' },
          { label: 'Secondary', href: '/contact' },
        ],
      },
    ],
    [
      'cards',
      'two-columns',
      {
        columns: 2,
        items: [
          { title: 'First', body: 'Desc 1', href: '/a' },
          { title: 'Second', body: 'Desc 2', href: '/b' },
        ],
      },
    ],
    [
      'cards',
      'three-columns',
      {
        columns: 3,
        items: [
          { title: '1', body: 'A' },
          { title: '2', body: 'B' },
          { title: '3', body: 'C' },
        ],
      },
    ],
    [
      'split',
      'flipped',
      {
        heading: 'Split Flipped',
        paragraphs: ['Reversed column order.'],
        media: { src: '/img.png', alt: 'Test' },
        flip: true,
      },
    ],
    [
      'split',
      'square-ratio',
      {
        heading: 'Square Ratio',
        paragraphs: ['1 / 1 ratio.'],
        media: { src: '/img.png', alt: 'Test' },
        ratio: '1 / 1',
      },
    ],
    ['quote', 'minimal', { quote: 'Quote with no attribution.' }],
    [
      'download',
      'with-meta',
      { heading: 'Rate Sheet', label: 'Download PDF', file: '/doc.pdf', meta: 'PDF · 1.5MB' },
    ],
    ['download', 'minimal', { label: 'Get File', file: '/doc.pdf' }],
    [
      'links',
      'highlighted',
      {
        heading: 'Highlights',
        items: [
          { title: 'Featured', url: '/featured', highlight: true, badge: 'New' },
          { title: 'Standard', url: '/standard' },
        ],
      },
    ],
    [
      'faq',
      'multiple-items',
      {
        heading: 'Frequently Asked Questions',
        items: [
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
          { question: 'Q3', answer: 'A3' },
        ],
      },
    ],
  ];

  it.each(variants)('variant %s (%s) has no axe violations', async (type, _variant, props) => {
    const violations = await violationsOf(htmlOf(type, props));
    expect(
      violations.map((v) => `${type}/${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)
    ).toEqual([]);
  });
});
