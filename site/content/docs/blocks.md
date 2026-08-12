---
title: Blocks
summary: The envelope, the twenty-four definitions, and how to add one.
group: Extending it
order: 60
---

# Blocks

## The envelope

Every block on a page is stored as:

```ts
{
  id: string;
  type: string;
  v: number;        // schema version of THIS block type
  props: unknown;
  frame?: Partial<BlockFrame>;
  hidden?: boolean;
  anchor?: string;
  role?: string;
  note?: string;
}
```

**Versioning is per block type, not global.** A change to the hero's props must not force every other block to bump. The definition owns the migrations from one version to the next, so a document written a year ago upgrades one block at a time on read.

**An unknown or unreadable block is quarantined, never dropped.** Content can arrive from storage that a newer build wrote. Silently discarding a block the current code does not recognise destroys somebody's work on the next save — so it is round-tripped untouched, rendered as nothing publicly and as an explanation in the editor.

## The frame

`frame` is the entire presentation vocabulary: `width`, `spacing`, `surface`, `divider`, `align`, `flip`. **Enums only — no pixels, no colours.** There is no path from the UI to "20px purple Comic Sans", and that bound is what makes a non-designer's arrangement come out usable.

## The definition

```ts
interface BlockDefinition<P> {
  type: string;
  version: number;
  label: string;
  description: string;
  group: 'identity' | 'work' | 'credentials' | 'conversion' | 'utility';

  schema: z.ZodType<P>;
  defaults(): P;
  fields: BlockField[];

  Render: React.ComponentType<BlockRenderProps<P>>;

  frameCapabilities?: (keyof BlockFrame)[];
  frameDefaults?: Partial<BlockFrame>;
  migrations?: Record<number, (previous: unknown) => unknown>;
  checks?: BlockCheck<P>[];
  jsonLd?(props: P): object | null;
}
```

Two of those carry the design.

**`fields` describes the editor as data, not as a component.** One generic form renders every block from it. A per-block editor would make the thirtieth block a React file in the admin as well as a definition, and would drag the admin's client code into every public page render.

**`checks` are advice, not validation.** The block is valid; these are the "this headline will wrap to four lines on a phone" observations a schema cannot express. `run(props, content)` receives the site's records too, so a block pointed at an empty collection can warn that it will render nothing — which is the failure this project shipped three times, and the author is the one person who cannot see it because they know what they meant to put there.

## Two kinds of block

**Literal** blocks hold what somebody typed: `hero`, `richText`, `image`, `gallery`, `stats`, `cards`, `ctaBanner`, plus `contactForm`, `faq`, `video`, `split`, `quote`, `newsletter`, `socialRow`, `services`, `download`, `separator`.

**Record-placing** blocks hold a _rule_ rather than content: `collection`, `writingList`, `timeline`, `logoWall`, `testimonials`, `skills`, `steps`. Their props say which records to show and never what the records say, so updating a project updates every page showing it.

Records reach them through `content: BlockContent`, passed down by the renderer rather than fetched inside the block — `Render` is synchronous, and a block that awaited its own content would be an async Server Component that the test harness cannot render. `BlockContent` is deliberately narrow: no settings, no media library and above all no `messages`, so the contact inbox is never one careless prop spread from a public page.

## The block/theme contract

Blocks own semantics. Themes own tokens. Neither imports the other.

Blocks compose only from the primitives in `core/primitives` — `Band`, `Measure`, `Grid`, `Heading`, `Prose`, `Card`, `Media`, `Button`, `Row`, `Stack`, `Metric`, `Pill`, `Eyebrow`, `Divider`, `Text`. An ESLint rule bans literal colours, literal sizes, palette utilities and arbitrary Tailwind values inside `core/blocks/**`, and a test re-checks the rendered HTML — because the lint rule checks the source and the HTML is what breaks when somebody switches theme.

**A theme that ships only tokens is a complete theme.** There is deliberately no per-block override hook; that is the crack the whole contract would leak through.

## Adding one

1. Write the definition in `core/blocks/standard.tsx` (or a new file if it is a family).
2. Add it to the exported array. Nothing else needs to know it exists.
3. `npm test`. The generic suites will already be checking it: that every field path writes somewhere the schema accepts, that defaults survive a parse, that the rendered HTML names no colour and no hardcoded length, and that it appears in the palette under a real group.

If a block needs something the primitives cannot express, the answer is a new primitive — never a one-off style in a block.

## Interactivity

Blocks render on the server and ship no JavaScript. Three need some: the contact form, the newsletter box and the video facade. They import from one `'use client'` file so the client boundary is a single file somebody can read, rather than a `'use client'` sprinkled through a long definitions file where a fourth is easy to add by accident.
