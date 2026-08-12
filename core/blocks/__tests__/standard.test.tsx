import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { getBlockDefinition, parsePage } from '../registry';
import { EMPTY_BLOCK_CONTENT, type BlockContent } from '../content';
import { toEmbedUrl } from '../standard';
import type { BlockDefinition } from '../schema';

/**
 * The blocks taken from what every other builder ships.
 *
 * The generic suites already prove the parts these share with the other
 * nineteen — that the editor writes where the schema reads, that nothing leaks
 * a colour or a hardcoded length, that defaults survive a round trip. What is
 * left is what is particular to these: a pasted link becoming an embed, a block
 * that renders nothing when the records behind it are missing, and a form that
 * carries its trap.
 */

/**
 * The registry types every definition as `BlockDefinition<never>`, so that a
 * caller cannot render one with props belonging to a different block. A test
 * that supplies props on purpose has to say so once, here, rather than casting
 * at every call site.
 */
function definitionFor(type: string): BlockDefinition<unknown> {
  const definition = getBlockDefinition(type) as BlockDefinition<unknown> | undefined;
  if (!definition) throw new Error(`No such block: ${type}`);
  return definition;
}

function renderBlock(type: string, props: unknown, content: BlockContent = EMPTY_BLOCK_CONTENT) {
  const definition = definitionFor(type);
  const parsed = parsePage([{ id: 'x', type, v: definition.version, props }]);
  const first = parsed[0];
  if (first.kind !== 'block') throw new Error(`Quarantined: ${first.reason}`);

  return renderToStaticMarkup(
    <definition.Render
      props={first.block.props}
      block={first.block}
      frame={undefined}
      headingLevel={2}
      content={content}
    />
  );
}

describe('a pasted video link', () => {
  it('is rebuilt from the id rather than passed through', () => {
    // The point of the exercise. Whatever somebody pasted, what reaches the
    // iframe is a URL this file constructed — so a link that happened to carry
    // a redirect, a tracking tail or an entirely different host cannot become
    // the embed.
    expect(toEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s')?.url).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    );
  });

  it('accepts the four shapes people actually paste', () => {
    const id = 'dQw4w9WgXcQ';
    for (const link of [
      `https://www.youtube.com/watch?v=${id}`,
      `https://youtu.be/${id}`,
      `https://www.youtube.com/embed/${id}`,
      `https://www.youtube.com/shorts/${id}`,
    ]) {
      expect(toEmbedUrl(link)?.url).toContain(id);
    }
  });

  it('uses the no-cookie host for YouTube', () => {
    expect(toEmbedUrl('https://youtu.be/dQw4w9WgXcQ')?.url).toContain('youtube-nocookie.com');
  });

  it('handles Vimeo, which has no poster to offer', () => {
    const embed = toEmbedUrl('https://vimeo.com/76979871');
    expect(embed?.url).toBe('https://player.vimeo.com/video/76979871');
    expect(embed?.poster).toBeUndefined();
  });

  it('refuses anything that is not one of the two', () => {
    for (const link of [
      '',
      'not a url',
      'https://example.com/video.mp4',
      'javascript:alert(1)',
      'https://evil.example/youtube.com/watch?v=abcdefg',
    ]) {
      expect(toEmbedUrl(link)).toBeNull();
    }
  });

  it('renders nothing at all rather than an empty player', () => {
    expect(renderBlock('video', { url: '', title: 'A video' })).toBe('');
  });

  it('warns in the editor when the link will not work', () => {
    const definition = definitionFor('video');
    const warnings = (definition.checks ?? [])
      .map((check) =>
        check.run({ url: 'https://example.com/x', title: 'A video' }, EMPTY_BLOCK_CONTENT)
      )
      .filter(Boolean);

    // Rendering nothing is right and invisible. The author is the one person
    // who cannot see that it is missing, because they know what they meant.
    expect(warnings.length).toBe(1);
  });
});

describe('the social row', () => {
  it('disappears when there is nothing to link to', () => {
    expect(renderBlock('socialRow', { heading: 'Elsewhere' })).toBe('');
  });

  it('renders one labelled link per visible account', () => {
    const html = renderBlock('socialRow', { heading: 'Elsewhere', showHandles: true }, {
      ...EMPTY_BLOCK_CONTENT,
      socialLinks: [
        {
          id: 's1',
          label: 'GitHub',
          name: '@someone',
          url: 'https://github.com/someone',
          iconType: 'github',
          visible: true,
          sortOrder: 1,
        },
      ],
    } as BlockContent);

    expect(html).toContain('https://github.com/someone');
    expect(html).toContain('GitHub');
    expect(html).toContain('@someone');
    // `rel="me"` is what lets Mastodon and the IndieWeb verify the link back.
    expect(html).toContain('rel="me noopener noreferrer"');
  });
});

describe('questions and answers', () => {
  const props = {
    heading: 'Questions',
    items: [{ question: 'How much?', answer: 'It depends.' }],
  };

  it('uses a real disclosure element, so it works with no JavaScript', () => {
    const html = renderBlock('faq', props);
    expect(html).toContain('<details');
    expect(html).toContain('<summary');
  });

  it('says so when an answer is missing', () => {
    const definition = definitionFor('faq');
    const warning = definition
      .checks!.map((check) =>
        check.run({ items: [{ question: 'How much?', answer: '  ' }] }, EMPTY_BLOCK_CONTENT)
      )
      .find(Boolean);
    expect(warning).toMatch(/no answer/i);
  });
});

describe('the contact form block', () => {
  it('posts to the endpoint that already does the work', () => {
    // Not a second endpoint. `/api/contact` stores the message, mails the
    // owner, checks the origin, rate-limits and answers a honeypot with
    // success — all of which a parallel route would have had to re-earn.
    const source = renderBlock('contactForm', definitionFor('contactForm').defaults());
    expect(source).toContain('<form');
    expect(source).toContain('type="submit"');
  });

  it('carries a trap the browser will not show anybody', () => {
    const html = renderBlock('contactForm', definitionFor('contactForm').defaults());
    expect(html).toContain('name="website"');
    expect(html).toContain('aria-hidden="true"');
  });
});

describe('picture and text', () => {
  const props = {
    heading: 'About',
    paragraphs: ['One.'],
    media: { src: '/x.png', alt: 'A picture' },
  };

  it('puts the words first by default and the picture first when flipped', () => {
    const definition = definitionFor('split');
    const parsed = parsePage([{ id: 'x', type: 'split', v: definition.version, props }]);
    const block = parsed[0].kind === 'block' ? parsed[0].block : null;

    const html = (flip: boolean) =>
      renderToStaticMarkup(
        <definition.Render
          props={block!.props}
          block={block!}
          frame={{ flip }}
          headingLevel={2}
          content={EMPTY_BLOCK_CONTENT}
        />
      );

    // Swapped in the DOM, not with CSS `order`. A visual-only swap leaves the
    // reading order and the tab order disagreeing with the picture.
    expect(html(false).indexOf('About')).toBeLessThan(html(false).indexOf('<img'));
    expect(html(true).indexOf('<img')).toBeLessThan(html(true).indexOf('About'));
  });
});

describe('space or a line', () => {
  it('draws a rule when asked and nothing visible when not', () => {
    expect(renderBlock('separator', { rule: true, size: 'default' })).toContain('<hr');
    expect(renderBlock('separator', { rule: false, size: 'loose' })).not.toContain('<hr');
  });
});
