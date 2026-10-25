import { describe, expect, it } from 'vitest';
import { cdata, writingFeedHtml } from '../feed';

describe('RSS feed HTML serializer', () => {
  const siteUrl = 'https://example.com';

  it('serializes richText blocks with heading and paragraphs', () => {
    const blocks = [
      {
        id: 'b1',
        type: 'richText',
        v: 1,
        props: {
          heading: 'Hello World',
          paragraphs: ['First paragraph with <special> & characters.', 'Second paragraph.'],
        },
      },
    ];
    const html = writingFeedHtml(blocks, siteUrl);
    expect(html).toContain('<h2>Hello World</h2>');
    expect(html).toContain('<p>First paragraph with &lt;special&gt; &amp; characters.</p>');
    expect(html).toContain('<p>Second paragraph.</p>');
  });

  it('serializes quote blocks with attribution and role', () => {
    const blocks = [
      {
        id: 'b2',
        type: 'quote',
        v: 1,
        props: {
          quote: 'Design is how it works.',
          attribution: 'Steve Jobs',
          role: 'Apple',
        },
      },
    ];
    const html = writingFeedHtml(blocks, siteUrl);
    expect(html).toContain('<blockquote><p>Design is how it works.</p></blockquote>');
    expect(html).toContain('<figcaption>Steve Jobs · Apple</figcaption>');
  });

  it('serializes image and gallery blocks with absolute URLs and captions', () => {
    const blocks = [
      {
        id: 'b3',
        type: 'image',
        v: 1,
        props: {
          media: {
            src: '/media/photo.jpg',
            alt: 'A photo',
          },
          caption: 'Taken in 2026',
        },
      },
      {
        id: 'b4',
        type: 'gallery',
        v: 1,
        props: {
          heading: 'Gallery',
          items: [
            {
              src: 'https://cdn.example.com/item1.png',
              alt: 'Item 1',
            },
          ],
        },
      },
    ];
    const html = writingFeedHtml(blocks, siteUrl);
    expect(html).toContain('<img src="https://example.com/media/photo.jpg" alt="A photo" />');
    expect(html).toContain('<figcaption>Taken in 2026</figcaption>');
    expect(html).toContain('<h2>Gallery</h2>');
    expect(html).toContain('<img src="https://cdn.example.com/item1.png" alt="Item 1" />');
  });

  it('serializes FAQ blocks', () => {
    const blocks = [
      {
        id: 'b5',
        type: 'faq',
        v: 1,
        props: {
          heading: 'Questions',
          items: [
            { question: 'What is this?', answer: 'A test.' },
            { question: 'Why?', answer: 'For verification.' },
          ],
        },
      },
    ];
    const html = writingFeedHtml(blocks, siteUrl);
    expect(html).toContain('<h2>Questions</h2>');
    expect(html).toContain('<h3>What is this?</h3><p>A test.</p>');
    expect(html).toContain('<h3>Why?</h3><p>For verification.</p>');
  });

  it('serializes download blocks and separator blocks', () => {
    const blocks = [
      {
        id: 'b6',
        type: 'download',
        v: 1,
        props: {
          file: '/downloads/paper.pdf',
          label: 'Read the Paper',
          description: 'PDF, 2MB',
        },
      },
      {
        id: 'b7',
        type: 'separator',
        v: 1,
        props: { rule: true },
      },
    ];
    const html = writingFeedHtml(blocks, siteUrl);
    expect(html).toContain(
      '<p><a href="https://example.com/downloads/paper.pdf">Read the Paper</a> — PDF, 2MB</p>'
    );
    expect(html).toContain('<hr />');
  });

  it('ignores hidden blocks and unsupported interactive blocks', () => {
    const blocks = [
      {
        id: 'b8',
        type: 'richText',
        v: 1,
        hidden: true,
        props: { heading: 'Hidden' },
      },
      {
        id: 'b9',
        type: 'contactForm',
        v: 1,
        props: {},
      },
    ];
    const html = writingFeedHtml(blocks, siteUrl);
    expect(html).toBe('');
  });

  it('wraps HTML in CDATA and safely splits ]]> occurrences', () => {
    expect(cdata('Hello <world>')).toBe('<![CDATA[Hello <world>]]>');
    expect(cdata('Something with ]]> inside')).toBe(
      '<![CDATA[Something with ]]]]><![CDATA[> inside]]>'
    );
  });
});
