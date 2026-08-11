import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parseBlock, parseBlocks, serialiseBlocks } from '../parse';
import type { ParseContext } from '../parse';
import type { BlockDefinition } from '../schema';
import type React from 'react';

const noopRender = (() => null) as unknown as React.ComponentType<never>;

function defineTest(overrides: Partial<BlockDefinition<{ title: string }>> = {}) {
  const definition = {
    type: 'test',
    version: 1,
    label: 'Test',
    description: '',
    group: 'utility',
    schema: z.object({ title: z.string().min(1) }),
    defaults: () => ({ title: 'x' }),
    Render: noopRender,
    ...overrides,
  } as unknown as BlockDefinition<never>;

  const ctx: ParseContext = {
    getDefinition: (t) => (t === definition.type ? definition : undefined),
  };
  return { definition, ctx };
}

const valid = { id: 'a', type: 'test', v: 1, props: { title: 'Hello' } };

describe('parseBlock', () => {
  it('accepts a well-formed block', () => {
    const { ctx } = defineTest();
    const result = parseBlock(valid, ctx);
    expect(result.kind).toBe('block');
  });

  it('quarantines an unknown type instead of dropping it', () => {
    // Content can be written by a newer build. Discarding what we do not
    // recognise destroys somebody's work on their next save.
    const { ctx } = defineTest();
    const result = parseBlock({ ...valid, type: 'from-the-future' }, ctx);
    expect(result.kind).toBe('unknown');
    if (result.kind === 'unknown')
      expect(result.raw).toEqual({ ...valid, type: 'from-the-future' });
  });

  it('quarantines a block whose props do not validate', () => {
    const { ctx } = defineTest();
    const result = parseBlock({ ...valid, props: { title: '' } }, ctx);
    expect(result.kind).toBe('unknown');
  });

  it('names the field that failed, so the editor can point at it', () => {
    const { ctx } = defineTest();
    const result = parseBlock({ ...valid, props: {} }, ctx);
    if (result.kind !== 'unknown') throw new Error('expected quarantine');
    expect(result.reason).toContain('title');
  });

  it('quarantines a block from a newer version rather than guessing', () => {
    // Reading a future version optimistically is how a downgrade corrupts data.
    const { ctx } = defineTest();
    const result = parseBlock({ ...valid, v: 99 }, ctx);
    if (result.kind !== 'unknown') throw new Error('expected quarantine');
    expect(result.reason).toContain('newer version');
  });

  it('never throws on rubbish input', () => {
    const { ctx } = defineTest();
    for (const rubbish of [null, undefined, 42, 'string', [], {}, { id: 1 }]) {
      expect(() => parseBlock(rubbish, ctx)).not.toThrow();
      expect(parseBlock(rubbish, ctx).kind).toBe('unknown');
    }
  });
});

describe('migrations', () => {
  it('runs the chain up to the current version', () => {
    const { ctx } = defineTest({
      version: 3,
      migrations: {
        2: (p) => ({ ...(p as object), title: `${(p as { t: string }).t}` }),
        3: (p) => ({ title: `${(p as { title: string }).title}!` }),
      },
    });

    const result = parseBlock({ id: 'a', type: 'test', v: 1, props: { t: 'old' } }, ctx);
    if (result.kind !== 'block') throw new Error('expected a block');
    expect((result.block.props as { title: string }).title).toBe('old!');
    // The stored version is rewritten, so the migration runs once rather than
    // on every read forever.
    expect(result.block.v).toBe(3);
  });

  it('quarantines when a step in the chain is missing', () => {
    const { ctx } = defineTest({ version: 3, migrations: { 3: (p) => p } });
    const result = parseBlock({ id: 'a', type: 'test', v: 1, props: {} }, ctx);
    if (result.kind !== 'unknown') throw new Error('expected quarantine');
    expect(result.reason).toContain('No migration');
  });

  it('quarantines when a migration throws, rather than taking the page down', () => {
    const { ctx } = defineTest({
      version: 2,
      migrations: {
        2: () => {
          throw new Error('boom');
        },
      },
    });
    const result = parseBlock({ id: 'a', type: 'test', v: 1, props: {} }, ctx);
    if (result.kind !== 'unknown') throw new Error('expected quarantine');
    expect(result.reason).toContain('boom');
  });
});

describe('parseBlocks and serialiseBlocks', () => {
  it('keeps order, including quarantined entries', () => {
    const { ctx } = defineTest();
    const parsed = parseBlocks(
      [valid, { ...valid, id: 'b', type: 'nope' }, { ...valid, id: 'c' }],
      ctx
    );
    expect(parsed.map((p) => (p.kind === 'block' ? p.block.id : p.id))).toEqual(['a', 'b', 'c']);
  });

  it('round-trips an unreadable block untouched', () => {
    // The whole point of keeping `raw`: saving a page written by a newer build
    // must not silently strip what this build could not read.
    const { ctx } = defineTest();
    const future = { id: 'b', type: 'from-the-future', v: 7, props: { anything: true } };
    const out = serialiseBlocks(parseBlocks([future], ctx));
    expect(out[0]).toEqual(future);
  });

  it('returns nothing for a non-array', () => {
    const { ctx } = defineTest();
    expect(parseBlocks({ not: 'an array' }, ctx)).toEqual([]);
  });
});
