// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { BlockField } from '@/core/blocks/fields';

vi.mock('../../_actions/media', () => ({ uploadMediaAction: vi.fn() }));
const { BlockFields } = await import('../block-fields');
const { getBlockDefinition } = await import('@/core/blocks/lookup');

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
function mount(node: React.ReactNode): HTMLElement {
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root!.render(node));
  return container;
}
afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

describe('block fields', () => {
  it('opens on the words and folds how it looks under More options', () => {
    const fields: BlockField[] = [
      { kind: 'text', path: 'heading', label: 'Heading' },
      {
        kind: 'choice',
        path: 'columns',
        label: 'Across',
        advanced: true,
        options: [{ value: 2, label: 'Two' }],
      },
    ];
    const container = mount(
      <BlockFields fields={fields} props={{}} onChange={() => {}} media={[]} />
    );
    const details = container.querySelector('details')!;
    expect(details.open).toBe(false);
    expect(details.querySelector('summary')!.textContent).toContain('More options(1)');
    expect(details.textContent).toContain('Across');
    expect(container.querySelector(':scope > div > label')!.textContent).toContain('Heading');
  });

  it('folds nothing when every field is an option', () => {
    const fields: BlockField[] = [
      { kind: 'toggle', path: 'rule', label: 'Draw a line', advanced: true },
    ];
    const container = mount(
      <BlockFields fields={fields} props={{}} onChange={() => {}} media={[]} />
    );
    expect(container.querySelector('details')).toBeNull();
  });

  it('marks the real blocks’ layout fields as options', () => {
    const gallery = getBlockDefinition('gallery');
    expect(gallery).toBeDefined();
    expect(gallery!.fields.filter((f) => f.advanced).map((f) => f.path)).toContain('columns');
  });
});
