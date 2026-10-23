import { describe, expect, it } from 'vitest';
import { parseBlock } from '../../blocks/parse';
import { parseContext } from '../../blocks/lookup';
import { MAX_IMPORTED_BLOCKS, parseMarkdownNote, uniqueSlugs, type ParsedNote } from '../markdown';

/**
 * The reader, against the files people actually arrive with.
 *
 * Every case here is a shape an exporter writes: Jekyll front matter, a
 * Hugo-style leading `#` with none, an Obsidian list, a quoted pull with an
 * attribution after an em dash. The warnings are asserted as hard as the
 * content — what the reader could not carry is the part a user has to be told
 * about, and a test is the only thing that keeps the telling from being
 * quietly dropped.
 */

const parse = (fileName: string, raw: string) => {
  const result = parseMarkdownNote(fileName, raw);
  if (!result.ok) throw new Error(result.error);
  return result;
};

describe('Markdown import', () => {
  it('reads Jekyll front matter into the piece', () => {
    const { note, warnings } = parse(
      'post.md',
      [
        '---',
        'title: On slow mornings',
        'date: 2024-03-01',
        'summary: A short note about doing less.',
        'tags: [writing, habits]',
        'slug: slow-mornings',
        'featured: true',
        '---',
        '',
        'The first paragraph.',
        '',
        'The second one,',
        'continued on a new line.',
      ].join('\n')
    );

    expect(note.title).toBe('On slow mornings');
    expect(note.slug).toBe('slow-mornings');
    expect(note.summary).toBe('A short note about doing less.');
    expect(note.tags).toEqual(['writing', 'habits']);
    expect(note.featured).toBe(true);
    expect(note.publishedAt).toBe(new Date('2024-03-01').toISOString());
    expect(note.blocks).toHaveLength(1);
    expect(note.blocks[0].props.paragraphs).toEqual([
      'The first paragraph.',
      'The second one, continued on a new line.',
    ]);
    expect(warnings).toEqual([]);
  });

  it('takes the title from a leading heading when there is no front matter, and says so', () => {
    const { note, warnings } = parse('my-first-post.md', '# My first post\n\nHello there.\n');

    expect(note.title).toBe('My first post');
    expect(note.slug).toBe('my-first-post');
    expect(note.blocks).toHaveLength(1);
    expect(note.blocks[0].props).toEqual({ paragraphs: ['Hello there.'] });
    expect(warnings).toEqual([
      'No front matter — the title came from the first heading or the file name.',
    ]);
  });

  it('falls back to the file name, and only the first line can be the title', () => {
    const { note } = parse('a-note-about-maps.md', 'Text, then a heading.\n\n## Later\n\nMore.');
    expect(note.title).toBe('a note about maps');
    expect(note.blocks[0].props).toEqual({ paragraphs: ['Text, then a heading.'] });
    expect(note.blocks[1].props).toEqual({ heading: 'Later', paragraphs: ['More.'] });
  });

  it('opens a block per heading and carries its paragraphs', () => {
    const { note } = parse(
      'post.md',
      '---\ntitle: Two sections\n---\n\n## First\n\nOne.\n\n## Second\n\nTwo.\n\nThree.\n'
    );

    expect(note.blocks).toEqual([
      { type: 'richText', v: 1, props: { heading: 'First', paragraphs: ['One.'] } },
      { type: 'richText', v: 1, props: { heading: 'Second', paragraphs: ['Two.', 'Three.'] } },
    ]);
  });

  it('turns list items into bullet paragraphs, and warns once', () => {
    const { note, warnings } = parse(
      'post.md',
      '---\ntitle: A list\n---\n\n- First thing\n- Second thing\n- Third thing\n'
    );

    expect(note.blocks[0].props.paragraphs).toEqual([
      '• First thing',
      '• Second thing',
      '• Third thing',
    ]);
    expect(warnings).toContain(
      'Lists became bullet paragraphs — there is no list block to map them onto yet.'
    );
  });

  it('keeps a quote as a quote, with an attribution only after an em dash', () => {
    const { note } = parse(
      'post.md',
      [
        '---',
        'title: Quoted',
        '---',
        '',
        '> The unread book is furniture.',
        '> — Someone wise',
        '',
        '> - not an attribution',
      ].join('\n')
    );

    expect(note.blocks[0]).toEqual({
      type: 'quote',
      v: 1,
      props: { quote: 'The unread book is furniture.', attribution: 'Someone wise' },
    });
    expect(note.blocks[1]).toEqual({
      type: 'quote',
      v: 1,
      props: { quote: '- not an attribution' },
    });
  });

  it('keeps link addresses, drops images, and reports both', () => {
    const { note, warnings } = parse(
      'post.md',
      [
        '---',
        'title: Links',
        '---',
        '',
        'See [the archive](https://example.com/archive) for more.',
        '',
        '![A wide shot](https://example.com/photo.jpg)',
      ].join('\n')
    );

    expect(note.blocks[0].props.paragraphs).toEqual([
      'See the archive (https://example.com/archive) for more.',
    ]);
    expect(note.blocks).toHaveLength(1);
    expect(warnings).toContain(
      'One image was left out. Add it from your media library when you review the piece.'
    );
    expect(warnings).toContain(
      'Links keep their address in brackets after the text, so it survives the move.'
    );
  });

  it('takes emphasis off rather than leaving the markers in', () => {
    const { note, warnings } = parse(
      'post.md',
      '---\ntitle: Strong\n---\n\nThis is **important** and *emphatic* and `inline code`.'
    );

    expect(note.blocks[0].props.paragraphs).toEqual([
      'This is important and emphatic and inline code.',
    ]);
    expect(warnings).toContain('Bold and italic formatting is not carried over. The words are.');
  });

  it('turns a code fence into plain text and says so', () => {
    const { note, warnings } = parse(
      'post.md',
      '---\ntitle: Code\n---\n\nBefore.\n\n```bash\nnpm ci\n```\n\nAfter.'
    );

    expect(note.blocks[0].props.paragraphs).toEqual(['Before.', 'npm ci', 'After.']);
    expect(warnings).toContain('Code became plain text.');
  });

  it('reads a keyed list of tags, and the aliases exporters use', () => {
    const { note } = parse(
      'post.md',
      [
        '---',
        'name: Aliased',
        'categories:',
        '  - one',
        '  - two',
        'excerpt: A summary.',
        '---',
        '',
        'Text.',
      ].join('\n')
    );

    // `name` is not a title key this reader knows, and there is no leading
    // heading either, so the file name stands in.
    expect(note.title).toBe('post');
    expect(note.tags).toEqual(['one', 'two']);
    expect(note.summary).toBe('A summary.');
  });

  it('refuses an unreadable date instead of inventing one', () => {
    const { note, warnings } = parse(
      'post.md',
      '---\ntitle: Undated\ndate: sometime in spring\n---\n\nText.'
    );

    expect(note.publishedAt).toBeUndefined();
    expect(warnings).toContain(
      'The date “sometime in spring” could not be read, so the piece carries no date.'
    );
  });

  it('takes the last segment of a permalink as the address', () => {
    const { note } = parse(
      'post.md',
      '---\ntitle: Permalinked\npermalink: /2024/03/my-post/\n---\n\nText.'
    );
    expect(note.slug).toBe('my-post');
  });

  it('stops at the block cap and says the file is longer', () => {
    const body = Array.from(
      { length: MAX_IMPORTED_BLOCKS + 12 },
      (_, i) => `## Part ${i}\n\nText ${i}.`
    ).join('\n\n');
    const { note, warnings } = parse('long.md', `---\ntitle: Long\n---\n\n${body}`);
    expect(note.blocks).toHaveLength(MAX_IMPORTED_BLOCKS);
    expect(warnings.some((warning) => warning.includes('Only the first'))).toBe(true);
  });

  it('never returns an empty address', () => {
    const { note } = parse('12345.md', '# ###\n\nText.');
    expect(note.slug).toBe('untitled');
  });
  it('refuses a file with nothing in it at all', () => {
    expect(parseMarkdownNote('empty.md', '   \n\n')).toEqual({
      ok: false,
      error: 'That file is empty.',
    });
  });

  it('imports a title with no body as an empty piece', () => {
    const { note } = parse('stub.md', '---\ntitle: Nothing\n---\n');
    expect(note.title).toBe('Nothing');
    expect(note.blocks).toEqual([]);
  });

  it('produces blocks the renderer accepts rather than quarantines', () => {
    // The cases above assert shapes; this asserts the *contract* — every block
    // the reader builds passes the same validation the page renderer runs, so
    // an import cannot arrive as a quarantined block the editor will not open.
    // The block definitions own that schema; if one of them moves, this fails.
    const { note } = parse(
      'post.md',
      '---\ntitle: Shapes\n---\n\n## Section\n\nText.\n\n> A quote\n> — Someone wise\n\n- one\n- two\n'
    );

    expect(note.blocks).toHaveLength(3);
    for (const [index, block] of note.blocks.entries()) {
      const parsed = parseBlock({ ...block, id: `block_${index}` }, parseContext);
      if (parsed.kind !== 'block') throw new Error(parsed.reason);
      expect(parsed.block.type).toBe(block.type);
    }
  });
});

describe('Markdown import addresses', () => {
  const note = (slug: string): ParsedNote => ({
    title: 'A piece',
    slug,
    summary: '',
    tags: [],
    featured: false,
    blocks: [],
  });

  it('keeps an address that is free', () => {
    const { notes, renamed } = uniqueSlugs([note('a-post')], ['another-piece']);
    expect(notes[0].slug).toBe('a-post');
    expect(renamed).toBe(0);
  });

  it('moves the clashing piece aside rather than failing the whole save', () => {
    const { notes, renamed } = uniqueSlugs(
      [note('notes'), note('notes'), note('notes')],
      ['notes', 'notes-2']
    );
    expect(notes.map((entry) => entry.slug)).toEqual(['notes-3', 'notes-4', 'notes-5']);
    expect(renamed).toBe(3);
  });

  it('compares against normalised addresses, because the server will', () => {
    const { notes, renamed } = uniqueSlugs([note('my-post')], ['my post']);
    expect(notes[0].slug).toBe('my-post-2');
    expect(renamed).toBe(1);
  });
});
