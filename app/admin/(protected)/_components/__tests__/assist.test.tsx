// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AssistProvider, Suggest } from '../assist';

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
  vi.unstubAllGlobals();
});

describe('Suggest', () => {
  it('is not there at all until a model is connected', () => {
    const container = mount(
      <AssistProvider value={{ text: true, alt: false }}>
        <Suggest task="alt" source={() => ({})} onUse={() => {}} />
      </AssistProvider>
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows the answer and applies it only on “Use it”', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ json: async () => ({ ok: true, suggestion: 'A calm summary.' }) }))
    );
    const onUse = vi.fn();
    const container = mount(
      <AssistProvider value={{ text: true, alt: false }}>
        <Suggest task="summary" source={() => ({ text: 'Words' })} onUse={onUse} />
      </AssistProvider>
    );
    const ask = container.querySelector('button')!;
    expect(ask.textContent).toBe('Suggest a summary');
    await act(async () => ask.click());
    expect(container.textContent).toContain('A calm summary.');
    expect(onUse).not.toHaveBeenCalled();
    const use = [...container.querySelectorAll('button')].find((b) => b.textContent === 'Use it')!;
    act(() => use.click());
    expect(onUse).toHaveBeenCalledWith('A calm summary.');
    expect(container.textContent).not.toContain('A calm summary.');
  });
});
