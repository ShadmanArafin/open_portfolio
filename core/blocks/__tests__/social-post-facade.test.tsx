// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { BlockList } from '../registry';
import { parsePage } from '../lookup';
import { EMPTY_BLOCK_CONTENT } from '../content';

/**
 * The social post's promise, measured in a browser-shaped place.
 *
 * The static suites can say "no `<iframe>` in the markup", which is not the
 * same claim as "no request to Instagram". This mounts the real block, presses
 * the real button, and looks at what exists on either side of the press: the
 * address the frame is given, and the title a screen reader will read out of
 * it. The address is the interesting half - the pasted link is rebuilt from
 * the code alone, so a query string, a fragment or a longer path cannot ride
 * along into the frame.
 */

function mount(props: Record<string, unknown>) {
  const container = document.createElement('div');
  document.body.append(container);
  const blocks = parsePage([{ id: 'social', type: 'socialPost', v: 1, props }]);
  act(() => {
    createRoot(container).render(<BlockList blocks={blocks} content={EMPTY_BLOCK_CONTENT} />);
  });
  return container;
}

function press(container: HTMLElement) {
  const button = container.querySelector('button');
  if (!button) throw new Error('the facade button is not on the screen');
  act(() => button.click());
}

describe('the social post facade', () => {
  it('has contacted nobody until the button is pressed', () => {
    const container = mount({
      url: 'https://www.instagram.com/p/CxYz12abcDe/?utm_source=ig_web',
      title: 'A post from my studio',
    });

    expect(container.querySelector('iframe')).toBeNull();
    // The promise is about requests, and a request is made from an address:
    // none of Instagram's is present, anywhere in the block.
    expect(container.innerHTML).not.toContain('instagram.com');
    expect(container.innerHTML).toContain('Show the post');
  });

  it('frames the rebuilt embed address, titled, once asked', () => {
    const container = mount({
      url: 'https://www.instagram.com/p/CxYz12abcDe/?utm_source=ig_web',
      title: 'A post from my studio',
    });

    press(container);

    const frame = container.querySelector('iframe');
    if (!frame) throw new Error('no frame appeared after the press');
    expect(frame.getAttribute('src')).toBe('https://www.instagram.com/p/CxYz12abcDe/embed');
    expect(frame.getAttribute('title')).toBe('A post from my studio');
  });

  it('gives Behance the address Behance itself hands out', () => {
    const container = mount({
      url: 'https://www.behance.net/gallery/123456789/Logo-Design',
      title: 'A project',
    });

    press(container);

    const frame = container.querySelector('iframe');
    if (!frame) throw new Error('no frame appeared after the press');
    expect(frame.getAttribute('src')).toBe(
      'https://www.behance.net/embed/project/123456789?ilo0=1'
    );
  });

  it('reads a Substack post link as its publication', () => {
    const container = mount({
      url: 'https://astralcodexten.substack.com/p/some-post',
      title: 'The newsletter',
    });

    press(container);

    const frame = container.querySelector('iframe');
    if (!frame) throw new Error('no frame appeared after the press');
    expect(frame.getAttribute('src')).toBe('https://astralcodexten.substack.com/embed');
  });
});
