import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { getBlockDefinition, parsePage } from '../lookup';
import { EMPTY_BLOCK_CONTENT, type BlockContent } from '../content';
import { toEmbedUrl, toSchedulingUrl, toSocialEmbed } from '../standard';
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

describe('a pasted booking link', () => {
  it('keeps Cal.com and Calendly addresses, rebuilt from their own host', () => {
    expect(toSchedulingUrl('https://cal.com/you/intro')).toEqual({
      url: 'https://cal.com/you/intro',
      provider: 'Cal.com',
    });
    expect(toSchedulingUrl('https://calendly.com/you/30min?month=2026-10')?.url).toBe(
      'https://calendly.com/you/30min'
    );
  });

  it('refuses anything that is not a booking host, however it is dressed', () => {
    for (const link of [
      '',
      'not a url',
      'https://example.com/cal.com/you',
      'https://evil-cal.com/you',
      'https://cal.com.evil.example/you',
      'javascript:alert(1)',
      'https://cal.com/',
      'https://calendly.com/',
    ]) {
      expect(toSchedulingUrl(link)).toBeNull();
    }
  });
});

describe('the booking block', () => {
  it('renders nothing at all rather than an empty calendar', () => {
    expect(renderBlock('embed', { url: '', title: 'Book a time' })).toBe('');
  });

  it('invites without contacting the provider until asked', () => {
    const html = renderBlock('embed', {
      url: 'https://cal.com/you/intro',
      title: 'Book a time',
    });
    expect(html).toContain('Book a time');
    expect(html).toContain('Cal.com');
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('cal.com/you/intro');
  });

  it('warns in the editor when the link will not work', () => {
    const definition = definitionFor('embed');
    const warnings = (definition.checks ?? [])
      .map((check) =>
        check.run({ url: 'https://example.com/you', title: 'Book a time' }, EMPTY_BLOCK_CONTENT)
      )
      .filter(Boolean);
    expect(warnings.length).toBe(1);
  });
});

describe('turning a social link into an embed', () => {
  it('rebuilds an Instagram post, reel or TV address from the code', () => {
    // Rebuilt, not passed through: the pasted link can carry a query string,
    // and nothing of it survives into the iframe address.
    expect(toSocialEmbed('https://www.instagram.com/p/CxYz12abcDe/')?.url).toBe(
      'https://www.instagram.com/p/CxYz12abcDe/embed'
    );
    expect(toSocialEmbed('https://instagram.com/reel/CxYz12abcDe/?utm_source=ig_web')?.url).toBe(
      'https://www.instagram.com/reel/CxYz12abcDe/embed'
    );
    expect(toSocialEmbed('https://www.instagram.com/tv/CxYz12abcDe/')?.url).toBe(
      'https://www.instagram.com/tv/CxYz12abcDe/embed'
    );
    expect(toSocialEmbed('https://www.instagram.com/p/CxYz12abcDe/')?.provider).toBe('Instagram');
  });

  it('refuses an Instagram profile, because a profile is not a post', () => {
    expect(toSocialEmbed('https://www.instagram.com/yourname/')).toBeNull();
    expect(toSocialEmbed('https://www.instagram.com/')).toBeNull();
  });

  it('rebuilds a Behance gallery as the iframe Behance itself hands out', () => {
    // The address and its ?ilo0=1 are what Behance's own oEmbed endpoint
    // answered for a gallery link while this was written - fetched, not
    // remembered. If they change it, this test is where that shows up.
    expect(toSocialEmbed('https://www.behance.net/gallery/123456789/Logo-Design')?.url).toBe(
      'https://www.behance.net/embed/project/123456789?ilo0=1'
    );
    expect(toSocialEmbed('https://www.behance.net/gallery/123456789')?.url).toBe(
      'https://www.behance.net/embed/project/123456789?ilo0=1'
    );
  });

  it('rebuilds a Substack publication as its subscribe box', () => {
    expect(toSocialEmbed('https://astralcodexten.substack.com/')?.url).toBe(
      'https://astralcodexten.substack.com/embed'
    );
    // A post link is read as its publication: the subscribe box is what
    // Substack publishes for embedding, so that is what the block offers.
    expect(toSocialEmbed('https://astralcodexten.substack.com/p/some-post')?.url).toBe(
      'https://astralcodexten.substack.com/embed'
    );
    // The platform itself is not a publication.
    expect(toSocialEmbed('https://substack.com/@someone')).toBeNull();
  });

  it('refuses everything else, including the lookalikes', () => {
    for (const link of [
      '',
      'not a link',
      'https://evil.example/instagram.com/p/CxYz12abcDe/',
      'https://instagram.com.evil.example/p/CxYz12abcDe/',
      'https://instagrarn.com/p/CxYz12abcDe/',
      'https://www.behance.net/yourname',
      'https://behance.net.evil.example/gallery/123456789/x',
      'https://substack.com.evil.example/embed',
      'javascript:alert(1)',
      'ftp://instagram.com/p/CxYz12abcDe/',
    ]) {
      expect(toSocialEmbed(link), link).toBeNull();
    }
  });
});

describe('the social post block', () => {
  it('renders nothing at all rather than an empty frame', () => {
    expect(renderBlock('socialPost', { url: '', title: 'A post' })).toBe('');
  });

  it('invites without contacting the provider until asked', () => {
    // The press itself, and the address it hands the frame, are measured in
    // `social-post-facade.test.tsx`, in a real DOM. What can be said from
    // static markup is that the invitation names the provider and carries no
    // address of theirs at all.
    const html = renderBlock('socialPost', {
      url: 'https://www.instagram.com/p/CxYz12abcDe/',
      title: 'A post from my studio',
    });
    expect(html).toContain('Instagram');
    expect(html).toContain('Show the post');
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('instagram.com');
  });

  it('says why a GitHub link will not appear, rather than leaving a blank space', () => {
    const definition = definitionFor('socialPost');
    const warnings = (definition.checks ?? [])
      .map((check) =>
        check.run({ url: 'https://github.com/owner/name', title: 'A post' }, EMPTY_BLOCK_CONTENT)
      )
      .filter(Boolean);
    expect(warnings.length).toBe(1);
    expect(String(warnings[0])).toContain('GitHub');
  });
});

describe('the comments block', () => {
  const configured = {
    heading: 'Discussion',
    repo: 'owner/name',
    repoId: 'R_kgD0',
    category: 'Announcements',
    categoryId: 'DIC_kwD0',
    mapping: 'pathname',
  };

  it('renders nothing at all rather than phoning GitHub with nowhere to file it', () => {
    expect(renderBlock('comments', { heading: 'Discussion' })).toBe('');
  });

  it('invites without contacting GitHub until asked', () => {
    const html = renderBlock('comments', configured);
    expect(html).toContain('Show comments');
    expect(html).toContain('Discussion');
    expect(html).not.toContain('giscus.app/client.js');
    expect(html).not.toContain('github.com');
  });

  it('warns in the editor when there is no repository, and on a malformed one', () => {
    const definition = definitionFor('comments');
    const warnings = (definition.checks ?? [])
      .map((check) => check.run({ repo: '' }, EMPTY_BLOCK_CONTENT))
      .filter(Boolean);
    expect(warnings.length).toBe(1);
    const malformed = (definition.checks ?? [])
      .map((check) => check.run({ repo: 'not a repo' }, EMPTY_BLOCK_CONTENT))
      .filter(Boolean);
    expect(malformed.length).toBe(1);
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

describe('the two holes in the palette', () => {
  it('places writing on a page, in the order the owner chose', () => {
    // Writing had a route, a feed and a scheduler, and no way to put it
    // anywhere. Somebody could publish an essay and could not link to it from
    // their own home page except by typing the address in by hand.
    const html = renderBlock('writingList', { limit: 2, showSummaries: true, moreLink: true }, {
      ...EMPTY_BLOCK_CONTENT,
      writing: [
        {
          id: 'w1',
          slug: 'first',
          title: 'The first one',
          summary: 'A summary.',
          status: 'published',
          blocks: [],
          featured: true,
          sortOrder: 1,
          revision: 1,
          updatedAt: '2026-01-01T00:00:00.000Z',
          publishedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'w2',
          slug: 'second',
          title: 'The second one',
          summary: '',
          status: 'published',
          blocks: [],
          featured: false,
          sortOrder: 2,
          revision: 1,
          updatedAt: '2026-02-01T00:00:00.000Z',
        },
      ],
      writingSettings: { label: 'Essays', showDates: false },
    } as unknown as BlockContent);

    expect(html).toContain('/writing/first');
    expect(html).toContain('The second one');
    expect(html).toContain('A summary.');
    // The heading and the "all of them" button both take the owner's own word
    // for the section rather than saying "Writing" at somebody who called it
    // something else.
    expect(html).toContain('Essays');
  });

  it('shows a date only when the owner said dates appear', () => {
    const entry = {
      id: 'w1',
      slug: 'first',
      title: 'The first one',
      summary: '',
      status: 'published',
      blocks: [],
      featured: false,
      sortOrder: 1,
      revision: 1,
      updatedAt: '2026-01-01T00:00:00.000Z',
      publishedAt: '2026-01-01T00:00:00.000Z',
    };
    const render = (showDates: boolean) =>
      renderBlock('writingList', { limit: 0 }, {
        ...EMPTY_BLOCK_CONTENT,
        writing: [entry],
        writingSettings: { label: 'Writing', showDates },
      } as unknown as BlockContent);

    // The decision belongs to the Writing screen. A block prop for it would let
    // a page disagree with the section, silently, with the owner last to know.
    expect(render(true)).toMatch(/January|2026/);
    expect(render(false)).not.toMatch(/January 2026/);
  });

  it('renders nothing when there is no writing yet', () => {
    expect(renderBlock('writingList', { limit: 3 })).toBe('');
  });

  it('offers a file as a real download, and nothing without one', () => {
    // Uploading a PDF could make it the footer's CV link and nothing else.
    // There was no way to put "Download my CV" on an About page.
    const html = renderBlock('download', {
      heading: 'My CV',
      label: 'Download',
      file: '/api/media/cv.pdf',
      meta: 'PDF · 2 MB',
    });
    expect(html).toContain('href="/api/media/cv.pdf"');
    // Without `download`, a PDF opens in the browser's viewer instead — a
    // different outcome from the one the button promised.
    expect(html).toContain('download=""');

    expect(renderBlock('download', { label: 'Download', file: '' })).toBe('');
  });
});
