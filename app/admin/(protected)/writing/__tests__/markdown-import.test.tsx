// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { WritingEntry } from '@/core/writing/schema';
import { MarkdownImport } from '../markdown-import';

/**
 * The import panel, end to end in one component: a file is chosen, the shared
 * reader parses it, the preview says what arrived and what did not, and the
 * pieces join the screen's list through `onAdd`.
 *
 * What this covers that `core/writing/__tests__/markdown.test.ts` cannot is the
 * *wiring* — that the reader the tests run is the reader the browser runs, and
 * that what the panel promises in the preview is what it hands over. What it
 * does not cover is the file picker itself, which no test can drive; that is
 * what the live check with a real upload is for.
 */
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function mount(onAdd: (entries: WritingEntry[], note: string) => void, room = 10): HTMLElement {
  const container = document.createElement('div');
  document.body.append(container);
  act(() => {
    createRoot(container).render(
      <MarkdownImport existingSlugs={[]} startOrder={1} room={room} onAdd={onAdd} />
    );
  });
  return container;
}

function open(container: HTMLElement) {
  const button = [...container.querySelectorAll('button')].find(
    (candidate) => candidate.textContent === 'Import Markdown'
  );
  if (!button) throw new Error('the import button is not on the screen');
  act(() => button.click());
}

const note = (name: string, text: string) => new File([text], name, { type: 'text/markdown' });

async function choose(container: HTMLElement, files: File[]) {
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error('the file input is not on the screen');
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function click(container: HTMLElement, label: string) {
  const button = [...container.querySelectorAll('button')].find(
    (candidate) => candidate.textContent === label
  );
  if (!button) throw new Error(`no "${label}" button`);
  act(() => button.click());
}

describe('the Markdown import panel', () => {
  it('stays closed until it is asked for', () => {
    const container = mount(() => {});
    expect(container.textContent).not.toContain('Front matter is read');

    open(container);
    expect(container.textContent).toContain('Front matter is read');
  });

  it('reads what it can, says what it could not, and hands the pieces over', async () => {
    const added: { entries: WritingEntry[]; note: string }[] = [];
    const container = mount((entries, message) => added.push({ entries, note: message }));

    open(container);
    await choose(container, [
      note(
        'first-post.md',
        '---\ntitle: First post\n---\n\nA paragraph, and a link to [the archive](https://example.com).'
      ),
      note('empty.md', '   \n'),
    ]);

    // The preview: one piece, its address, and the honest report for the other.
    expect(container.textContent).toContain('First post');
    expect(container.textContent).toContain('/writing/first-post');
    expect(container.textContent).toContain('1 block');
    expect(container.textContent).toContain('empty.md: That file is empty.');

    click(container, 'Add 1 piece');

    expect(added).toHaveLength(1);
    expect(added[0].entries).toHaveLength(1);
    const entry = added[0].entries[0];
    expect(entry.title).toBe('First post');
    expect(entry.slug).toBe('first-post');
    expect(entry.status).toBe('draft');
    expect(entry.sortOrder).toBe(1);
    // Ids are the editor's job, and a block without one cannot be reordered.
    // (`blocks` is `unknown[]` on the record — the block registry validates
    // each one at render — so the test reads it the way the editor does.)
    const block = entry.blocks[0] as { id?: string; props?: unknown };
    expect(block.id).toBeTruthy();
    expect(block.props).toEqual({
      paragraphs: ['A paragraph, and a link to the archive (https://example.com).'],
    });
    expect(added[0].note).toContain('1 piece is in the list below.');
    expect(added[0].note).toContain('Nothing is saved until you press Save.');
  });

  it('moves a clashing address aside and says so', async () => {
    const added: { entries: WritingEntry[]; note: string }[] = [];
    const container = mount((entries, message) => added.push({ entries, note: message }));

    open(container);
    await choose(container, [
      note('notes.md', '---\ntitle: Notes\n---\n\nOne.'),
      note('notes-again.md', '---\ntitle: Notes\n---\n\nTwo.'),
    ]);

    click(container, 'Add 2 pieces');

    expect(added[0].entries.map((entry) => entry.slug)).toEqual(['notes', 'notes-2']);
    expect(added[0].note).toContain('One file wanted an address that is already taken');
  });

  it('will not offer to add pieces to a full site', () => {
    const container = mount(() => {}, 0);
    open(container);

    expect(container.textContent).toContain('you have that many');
    const input = container.querySelector('input[type="file"]');
    expect((input as HTMLInputElement).disabled).toBe(true);
  });
});
