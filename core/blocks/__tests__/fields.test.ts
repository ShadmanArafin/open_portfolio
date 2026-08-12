import { describe, expect, it } from 'vitest';
import { getPath, setPath, type BlockField } from '../fields';
import { listBlockDefinitions } from '../registry';

/**
 * Field descriptors, checked against the schemas they claim to edit.
 *
 * A field whose `path` has a typo in it is invisible: the form renders, the
 * input accepts typing, and the value lands somewhere the block never reads.
 * Nothing errors. So every path is exercised against the real schema here,
 * which is the only way a wrong one shows up before somebody loses an
 * afternoon's writing to it.
 */

function sampleFor(field: BlockField): unknown {
  switch (field.kind) {
    case 'toggle':
      return true;
    case 'paragraphs':
      return ['One.', 'Two.'];
    // Both write an array of strings; they differ only in what the editor
    // splits on. The `default` branch below returns a bare string, which is
    // what caught this the first time a `lines` field was added.
    case 'lines':
      return ['One', 'Two'];
    case 'choice':
      return field.options[0].value;
    case 'list':
      return [field.newItem()];
    default:
      return 'a value';
  }
}

interface Walked {
  path: string;
  field: BlockField;
  /**
   * Applied before the field itself.
   *
   * A child of a list can only be edited once the list has an item in it, and
   * in the editor that item arrives from `newItem()` with every required
   * sibling already filled in. Setting `cta.0.label` on a block that has no
   * `cta` yet is not something the UI can do, so testing it would be testing a
   * situation that cannot occur.
   */
  seed: { path: string; value: unknown }[];
}

/** Fields, with list children flattened onto their parent path. */
function walk(fields: BlockField[], prefix = '', seed: Walked['seed'] = []): Walked[] {
  return fields.flatMap((field) => {
    const path = prefix ? `${prefix}.${field.path}` : field.path;
    if (field.kind === 'list') {
      const withList = [...seed, { path, value: [field.newItem()] }];
      return [{ path, field, seed }, ...walk(field.fields, `${path}.0`, withList)];
    }
    return [{ path, field, seed }];
  });
}

describe.each(listBlockDefinitions().map((d) => [d.type, d] as const))('%s fields', (type, def) => {
  it('describes an editor at all', () => {
    expect(def.fields.length).toBeGreaterThan(0);
  });

  it('has a unique path per field', () => {
    const paths = walk(def.fields).map((f) => f.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it.each(walk(def.fields).map((f) => [f.path, f] as const))(
    '%s writes to somewhere the schema recognises',
    (path, { field, seed }) => {
      const seeded = seed.reduce<unknown>(
        (props, step) => setPath(props, step.path, step.value),
        def.defaults()
      );
      const next = setPath(seeded, path, sampleFor(field));
      const parsed = def.schema.safeParse(next);

      expect(
        parsed.success,
        parsed.success
          ? ''
          : `Setting "${path}" produced props this block rejects: ${parsed.error.issues[0]?.message} at "${parsed.error.issues[0]?.path.join('.')}"`
      ).toBe(true);
    }
  );

  it('offers a way to add to every list, and the result is valid', () => {
    for (const { field } of walk(def.fields)) {
      if (field.kind !== 'list') continue;
      const item = field.newItem();
      expect(item, `${field.path}.newItem() produced nothing`).toBeTruthy();
    }
  });
});

describe('path helpers', () => {
  it('reads a nested value and survives a missing branch', () => {
    expect(getPath({ a: { b: 'c' } }, 'a.b')).toBe('c');
    expect(getPath({}, 'a.b.c')).toBeUndefined();
    expect(getPath(null, 'a')).toBeUndefined();
  });

  it('does not mutate what it is given', () => {
    const original = { a: { b: 1 } };
    const next = setPath(original, 'a.b', 2);
    expect(original.a.b).toBe(1);
    expect(next.a.b).toBe(2);
  });

  it('creates missing objects on the way down', () => {
    expect(setPath({}, 'seo.title', 'Hello')).toEqual({ seo: { title: 'Hello' } });
  });

  it('keeps an array an array', () => {
    // Replacing a list with an object keyed by index is a quiet way to corrupt
    // one, and it type-checks perfectly.
    const next = setPath({ items: ['a', 'b'] }, 'items.1', 'c');
    expect(Array.isArray(next.items)).toBe(true);
    expect(next.items).toEqual(['a', 'c']);
  });
});
