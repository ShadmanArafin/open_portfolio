// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useSaveShortcut, useUnsavedChanges } from '../unsaved-changes';
import { UnsavedNote } from '../unsaved-note';

/**
 * The guard is a promise about what the browser does, so it is driven the way
 * a browser drives it: real clicks on real anchors, a real `beforeunload`
 * event, a real key press — and the question is whether the edits survive.
 */
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const saves: string[] = [];
/** What the test drives the screen with, handed out once it has mounted. */
const handle: { setText: (value: string) => void; markSaved: (value: string) => void } = {
  setText: () => {},
  markSaved: () => {},
};
const setText = (value: string) => handle.setText(value);
const markSaved = (value: string) => handle.markSaved(value);

function Screen({ expose }: { expose: (api: typeof handle) => void }) {
  const [text, set] = useState('first');
  const guard = useUnsavedChanges(text);
  useEffect(() => {
    expose({ setText: set, markSaved: guard.markSaved });
  }, [expose, guard.markSaved]);
  useSaveShortcut(() => saves.push(text), true);
  return (
    <>
      <a href="/admin/brands">Brands</a>
      <a href="/admin/brands" target="_blank">
        Brands in a new tab
      </a>
      <UnsavedNote dirty={guard.dirty} />
    </>
  );
}

let root: Root | null = null;
function mount(): HTMLElement {
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root!.render(<Screen expose={(api) => Object.assign(handle, api)} />));
  return container;
}

/** A click as the router would see it: did it reach a bubble listener? */
function clickReachesRouter(anchor: HTMLAnchorElement): boolean {
  let reached = false;
  const listener = (event: Event) => {
    reached = true;
    event.preventDefault(); // jsdom would otherwise try to navigate
  };
  document.addEventListener('click', listener);
  anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  document.removeEventListener('click', listener);
  return reached;
}

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
  saves.length = 0;
  vi.restoreAllMocks();
});

describe('unsaved changes', () => {
  it('says nothing and stops nothing while nothing has changed', () => {
    const container = mount();
    const confirm = vi.spyOn(window, 'confirm');
    expect(container.textContent).not.toContain('Unsaved changes');
    expect(clickReachesRouter(container.querySelector('a')!)).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('asks before an in-admin link throws edits away, and stays when told to', () => {
    const container = mount();
    act(() => setText('edited'));
    expect(container.textContent).toContain('Unsaved changes');

    vi.spyOn(window, 'confirm').mockReturnValue(false);
    expect(clickReachesRouter(container.querySelector('a')!)).toBe(false);

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    expect(clickReachesRouter(container.querySelector('a')!)).toBe(true);
  });

  it('leaves a new-tab link alone, because the edits stay in this one', () => {
    const container = mount();
    act(() => setText('edited'));
    const confirm = vi.spyOn(window, 'confirm');
    clickReachesRouter(container.querySelectorAll('a')[1] as HTMLAnchorElement);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('holds the tab open on close or reload while dirty, and not after a save', () => {
    mount();
    act(() => setText('edited'));
    const dirtyUnload = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirtyUnload);
    expect(dirtyUnload.defaultPrevented).toBe(true);

    act(() => markSaved('edited'));
    const cleanUnload = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(cleanUnload);
    expect(cleanUnload.defaultPrevented).toBe(false);
  });

  it('is not dirty when an edit is typed and then undone', () => {
    const container = mount();
    act(() => setText('edited'));
    act(() => setText('first'));
    expect(container.textContent).not.toContain('Unsaved changes');
  });

  it('saves on Ctrl+S and Cmd+S instead of saving the web page', () => {
    mount();
    act(() => setText('edited'));
    for (const modifier of [{ ctrlKey: true }, { metaKey: true }]) {
      const press = new KeyboardEvent('keydown', { key: 's', cancelable: true, ...modifier });
      window.dispatchEvent(press);
      expect(press.defaultPrevented).toBe(true);
    }
    expect(saves).toEqual(['edited', 'edited']);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
    expect(saves).toHaveLength(2);
  });
});
