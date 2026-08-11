import { describe, expect, it } from 'vitest';
import { getBlockDefinition, listBlockDefinitions, parsePage, runBlockChecks } from '../registry';

const definitions = listBlockDefinitions();

describe('the block registry', () => {
  it('registers every definition under a unique type', () => {
    const types = definitions.map((d) => d.type);
    expect(new Set(types).size).toBe(types.length);
  });

  it('gives every block a label, a description and a palette group', () => {
    // These are what the "Add block" palette shows. A block nobody can
    // recognise in a list is a block nobody uses.
    for (const d of definitions) {
      expect(d.label.length, d.type).toBeGreaterThan(0);
      expect(d.description.length, d.type).toBeGreaterThan(0);
      expect(['identity', 'work', 'credentials', 'conversion', 'utility']).toContain(d.group);
    }
  });

  it('makes every default instance valid against its own schema', () => {
    // "Add block" inserts `defaults()`. If that does not parse, the block is
    // quarantined the instant it is created — a spectacular first impression.
    for (const d of definitions) {
      const result = d.schema.safeParse(d.defaults());
      expect(result.success, `${d.type}: ${JSON.stringify(result.error?.issues)}`).toBe(true);
    }
  });

  it('starts every block at version 1 or higher', () => {
    for (const d of definitions) expect(d.version, d.type).toBeGreaterThanOrEqual(1);
  });

  it('supplies a migration for every version above 1', () => {
    // A block at v3 with no migrations cannot read anything written at v1 or
    // v2, which is every document already in the wild.
    for (const d of definitions) {
      for (let v = 2; v <= d.version; v++) {
        expect(d.migrations?.[v], `${d.type} is missing a migration to v${v}`).toBeTruthy();
      }
    }
  });
});

describe('a page of real blocks', () => {
  const page = definitions.map((d, i) => ({
    id: `b${i}`,
    type: d.type,
    v: d.version,
    props: d.defaults(),
  }));

  it('parses every shipped block type without quarantining any', () => {
    const parsed = parsePage(page);
    const bad = parsed.filter((p) => p.kind === 'unknown');
    expect(bad.map((b) => (b.kind === 'unknown' ? `${b.type}: ${b.reason}` : ''))).toEqual([]);
  });

  it('runs content checks without throwing', () => {
    for (const entry of parsePage(page)) {
      expect(() => runBlockChecks(entry)).not.toThrow();
    }
  });
});

describe('content checks', () => {
  it('warns about a headline too long to read on a phone', () => {
    const hero = getBlockDefinition('hero')!;
    const long = 'x'.repeat(120);
    const entry = parsePage([
      { id: 'a', type: 'hero', v: hero.version, props: { headline: long } },
    ])[0];
    expect(runBlockChecks(entry).join(' ')).toContain('phone');
  });

  it('warns about a gallery of one', () => {
    const gallery = getBlockDefinition('gallery')!;
    const entry = parsePage([
      {
        id: 'a',
        type: 'gallery',
        v: gallery.version,
        props: { items: [{ src: 'x.png', alt: 'x' }] },
      },
    ])[0];
    expect(runBlockChecks(entry).join(' ')).toContain('Image block');
  });

  it('warns about an image with no alt text, but not about a decorative one', () => {
    const image = getBlockDefinition('image')!;
    const missing = parsePage([
      { id: 'a', type: 'image', v: image.version, props: { media: { src: 'x.png', alt: '' } } },
    ])[0];
    expect(runBlockChecks(missing).join(' ')).toContain('screen reader');

    // A block with no image yet is warned about, not treated as invalid: that
    // is the state every block is in the moment it is added.
    const empty = parsePage([
      { id: 'c', type: 'image', v: image.version, props: { media: { src: '', alt: '' } } },
    ])[0];
    expect(empty.kind).toBe('block');
    expect(runBlockChecks(empty).join(' ')).toContain('no image yet');

    const decorative = parsePage([
      {
        id: 'b',
        type: 'image',
        v: image.version,
        props: { media: { src: 'x.png', alt: '', decorative: true } },
      },
    ])[0];
    expect(runBlockChecks(decorative)).toEqual([]);
  });

  it('says nothing when there is nothing to say', () => {
    const hero = getBlockDefinition('hero')!;
    const entry = parsePage([
      { id: 'a', type: 'hero', v: hero.version, props: { headline: 'Short and clear.' } },
    ])[0];
    expect(runBlockChecks(entry)).toEqual([]);
  });
});
