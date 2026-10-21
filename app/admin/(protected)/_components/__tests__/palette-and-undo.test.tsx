// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const { CommandPalette } = await import('../command-palette');
const { UndoNotice } = await import('../undo-remove');
const { useUndoableRemove } = await import('../use-undoable-remove');
const { ADMIN_SECTIONS } = await import('../sections');

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has <dialog> but not its modal methods.
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute('open');
};
Element.prototype.scrollIntoView = () => {};

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
  push.mockReset();
});

function type(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function key(target: EventTarget, init: KeyboardEventInit) {
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
    );
  });
}

describe('command palette', () => {
  const records = [{ label: 'On slow mornings', kind: 'Writing', href: '/admin/writing?open=w1' }];

  it('opens on Ctrl+K and Cmd+K, not on a plain K', () => {
    const container = mount(<CommandPalette sections={ADMIN_SECTIONS} records={records} />);
    const dialog = container.querySelector('dialog')!;
    key(window, { key: 'k' });
    expect(dialog.open).toBe(false);
    key(window, { key: 'k', ctrlKey: true });
    expect(dialog.open).toBe(true);
    act(() => dialog.close());
    key(window, { key: 'K', metaKey: true });
    expect(dialog.open).toBe(true);
  });

  it('finds the owner’s own records and goes to the one chosen with the keyboard', () => {
    const container = mount(<CommandPalette sections={ADMIN_SECTIONS} records={records} />);
    key(window, { key: 'k', ctrlKey: true });
    const input = container.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    type(input, 'slow');
    const options = [...container.querySelectorAll('[role="option"]')];
    expect(options.map((option) => option.textContent)).toEqual(['On slow morningsWriting']);
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);
    key(input, { key: 'Enter' });
    expect(push).toHaveBeenCalledWith('/admin/writing?open=w1');
  });

  it('matches every word, in any order, against name and group', () => {
    const container = mount(<CommandPalette sections={ADMIN_SECTIONS} records={[]} />);
    key(window, { key: 'k', ctrlKey: true });
    const input = container.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    type(input, 'system hist');
    const labels = [...container.querySelectorAll('[role="option"]')].map(
      (option) => option.firstChild?.textContent
    );
    expect(labels).toEqual(['History']);
    key(input, { key: 'ArrowDown' });
    key(input, { key: 'Enter' });
    expect(push).toHaveBeenCalledWith('/admin/history');
  });

  it('says so when nothing matches', () => {
    const container = mount(<CommandPalette sections={ADMIN_SECTIONS} records={[]} />);
    key(window, { key: 'k', ctrlKey: true });
    type(container.querySelector<HTMLInputElement>('input[role="combobox"]')!, 'zzzz');
    expect(container.querySelector('[role="status"]')?.textContent).toContain('zzzz');
  });
});

describe('undo after delete', () => {
  type Item = { id: string; name: string };
  let api: ReturnType<typeof useUndoableRemove<Item>> | null = null;
  let current: Item[] = [];

  function List() {
    const [items, setItems] = useState<Item[]>([
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
      { id: 'c', name: 'Gamma' },
    ]);
    const undoable = useUndoableRemove(items, setItems);
    api = undoable;
    current = items;
    return undoable.removed ? (
      <UndoNotice label={undoable.removed.label} onUndo={() => undoable.undo()} />
    ) : null;
  }

  it('puts the record back where it was', () => {
    const container = mount(<List />);
    act(() => api!.remove('b', 'Beta'));
    expect(current.map((item) => item.id)).toEqual(['a', 'c']);
    expect(container.textContent).toContain('Deleted “Beta”');
    act(() => container.querySelector('button')!.click());
    expect(current.map((item) => item.id)).toEqual(['a', 'b', 'c']);
    expect(container.textContent).toBe('');
  });

  it('keeps one level: the next delete replaces the last', () => {
    mount(<List />);
    act(() => api!.remove('a', 'Alpha'));
    act(() => api!.remove('c', 'Gamma'));
    act(() => {
      api!.undo();
    });
    expect(current.map((item) => item.id)).toEqual(['b', 'c']);
  });
});
