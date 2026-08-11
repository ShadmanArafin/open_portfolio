/**
 * How a block describes its own editor, as data.
 *
 * Not as a React component. A block is rendered on the server and edited in the
 * browser, and a definition that carried both would drag the admin's client
 * code into every public page render. Describing the fields instead means one
 * generic form renders all of them, a new block type is still one file, and the
 * editor is the same shape for every block — which is the difference between a
 * builder somebody can learn and thirty bespoke screens.
 *
 * The same reason the integrations registry works this way later: metadata is
 * portable across renderers, components are not.
 */

export interface FieldBase {
  /** Dot path into the block's props. `media.alt`, `items`, `cta`. */
  path: string;
  label: string;
  /** Shown under the field. Say what it is for, not what it is. */
  help?: string;
}

export type BlockField =
  | (FieldBase & { kind: 'text'; placeholder?: string })
  | (FieldBase & { kind: 'textarea'; rows?: number })
  | (FieldBase & { kind: 'paragraphs' })
  | (FieldBase & { kind: 'choice'; options: { value: string | number; label: string }[] })
  | (FieldBase & { kind: 'toggle' })
  | (FieldBase & {
      kind: 'media';
      /**
       * Where this picture's description lives, so the picker can write both at
       * once. Named explicitly rather than inferred from the path: a convention
       * like "the sibling called alt" is invisible and breaks silently the first
       * time a block spells it differently.
       */
      altPath?: string;
    })
  | (FieldBase & {
      kind: 'list';
      /** Singular noun for the add button and each row: "image", "card". */
      itemNoun: string;
      /** Which sub-field labels a row when it is collapsed. */
      titlePath: string;
      fields: BlockField[];
      min?: number;
      max?: number;
      newItem: () => unknown;
    });

/** Reads `a.b.c` out of an object, without throwing on a missing branch. */
export function getPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value === null || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[key];
  }, source);
}

/**
 * Returns a copy of `source` with `path` set to `value`.
 *
 * Copies rather than mutates, and creates missing objects on the way down, so
 * an optional field can be filled in without the editor having to know whether
 * its parent existed. Arrays are preserved as arrays — replacing one with an
 * object keyed by index is a classic way to quietly corrupt a list.
 */
export function setPath<T>(source: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split('.');
  const base: Record<string, unknown> =
    source && typeof source === 'object' ? { ...(source as Record<string, unknown>) } : {};

  if (rest.length === 0) {
    base[head] = value;
  } else {
    // A missing branch has to be created as the right *kind* of container. If
    // the next key is an index, it is a list — building `{ "0": … }` instead
    // type-checks, renders, and silently produces props the schema rejects.
    const child = base[head] ?? (/^\d+$/.test(rest[0]) ? [] : {});
    base[head] = setPath(child, rest.join('.'), value);
  }

  return (Array.isArray(source) ? Object.assign([...source], base) : base) as T;
}
