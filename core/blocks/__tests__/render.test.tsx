import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BlockList, listBlockDefinitions, parsePage } from '../registry';
import type { ParsedBlock } from '../schema';

/**
 * Blocks, actually rendered.
 *
 * The parsing tests proved the block *data* was right and still let a page that
 * returned HTTP 500 ship: heading level came from React context, context needs
 * a Client Component, and every block is a Server Component — so the first real
 * page built from blocks failed on the first heading it reached. Nothing that
 * checked data could have caught it. Only rendering could.
 *
 * So this file renders. It is also the seed of the kitchen-sink matrix: the
 * per-theme, per-breakpoint axe run in Phase 9 is this, multiplied out.
 */

function block(type: string, props: unknown, id = type): unknown {
  return { id, type, v: 1, props };
}

function render(raw: unknown[]): string {
  return renderToStaticMarkup(<BlockList blocks={parsePage(raw)} />);
}

/** Every `<hN>` in document order. */
function headingLevels(html: string): number[] {
  return [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
}

describe('every block renders', () => {
  it.each(listBlockDefinitions().map((d) => [d.type, d] as const))(
    '%s renders from its own defaults without throwing',
    (type, definition) => {
      // Whatever "Add block" inserts must survive being rendered immediately.
      // A block that only works once it is filled in is a block that shows a
      // crash the moment somebody adds it.
      const html = render([block(type, definition.defaults())]);
      expect(html).toBeTypeOf('string');
    }
  );

  it('covers all of them', () => {
    expect(listBlockDefinitions().length).toBeGreaterThanOrEqual(7);
  });
});

describe('document outline', () => {
  const page = [
    block('hero', { headline: 'First' }, 'one'),
    block('richText', { heading: 'Second', paragraphs: ['x'] }, 'two'),
    block('cards', { heading: 'Third', items: [{ title: 'An item' }] }, 'three'),
  ];

  it('gives the first block h1 and the rest h2', () => {
    const levels = headingLevels(render(page));
    expect(levels[0]).toBe(1);
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
  });

  it('never skips a level', () => {
    // h1 → h3 is the thing a screen-reader user actually trips over.
    const levels = headingLevels(render(page));
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  it('puts item titles inside a block one level below its own', () => {
    const html = render([block('cards', { heading: 'Services', items: [{ title: 'Design' }] })]);
    expect(html).toMatch(/<h1[^>]*>Services<\/h1>/);
    expect(html).toMatch(/<h2[^>]*>Design<\/h2>/);
  });

  it('keeps the outline correct when blocks are reordered', () => {
    // The entire reason level is computed by the renderer rather than written
    // by the block: dragging a section must not break the outline.
    const reversed = [...page].reverse();
    expect(headingLevels(render(reversed))[0]).toBe(1);
  });
});

describe('what does not render', () => {
  it('says nothing to a visitor about a block it could not read', () => {
    const html = render([
      block('hero', { headline: 'Fine' }),
      { id: 'x', type: 'fromTheFuture', v: 99, props: {} },
    ]);
    expect(html).toContain('Fine');
    expect(html).not.toContain('fromTheFuture');
  });

  it('honours hidden', () => {
    const html = renderToStaticMarkup(
      <BlockList
        blocks={
          parsePage([
            { ...(block('hero', { headline: 'Secret' }) as object), hidden: true },
          ]) as ParsedBlock[]
        }
      />
    );
    expect(html).not.toContain('Secret');
  });

  it('promotes the first *visible* block to h1', () => {
    const html = render([
      { ...(block('hero', { headline: 'Hidden' }, 'a') as object), hidden: true },
      block('richText', { heading: 'Shown', paragraphs: ['x'] }, 'b'),
    ]);
    expect(html).toMatch(/<h1[^>]*>Shown<\/h1>/);
  });
});

describe('the block/theme boundary holds in the output', () => {
  const html = listBlockDefinitions()
    .map((d) => render([block(d.type, d.defaults())]))
    .join('');

  it('emits no literal colours', () => {
    // The ESLint rule checks the source. This checks what actually reaches the
    // page, which is the thing that breaks when somebody switches theme.
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(html).not.toMatch(/rgb\(|hsl\(|oklch\(/);
  });

  it('emits no hardcoded lengths outside of tokens', () => {
    const lengths = [...html.matchAll(/(\d+(?:\.\d+)?)(px|rem|em)\b/g)].map((m) => m[0]);
    expect(lengths).toEqual([]);
  });
});
