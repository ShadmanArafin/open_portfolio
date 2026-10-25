import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Media } from '../index';

describe('Media component and focal-point crop', () => {
  it('renders a slot placeholder when src is missing', () => {
    const html = renderToStaticMarkup(<Media src="" alt="Missing" />);
    expect(html).toContain('role="presentation"');
    expect(html).not.toContain('<img');
  });

  it('renders an img element with basic attributes', () => {
    const html = renderToStaticMarkup(
      <Media src="/api/media/photo.jpg" alt="A photo" ratio="16 / 9" fit="cover" />
    );
    expect(html).toContain('<img');
    expect(html).toContain('src="/api/media/photo.jpg"');
    expect(html).toContain('alt="A photo"');
    expect(html).toContain('aspect-ratio:16 / 9');
    expect(html).toContain('object-fit:cover');
  });

  it('marks decorative images correctly', () => {
    const html = renderToStaticMarkup(
      <Media src="/api/media/bg.jpg" alt="Ignored" decorative={true} />
    );
    expect(html).toContain('alt=""');
    expect(html).toContain('role="presentation"');
  });

  it('applies focal point keywords to object-position', () => {
    const htmlTop = renderToStaticMarkup(
      <Media src="/api/media/photo.jpg" alt="Portrait" focalPoint="top" />
    );
    expect(htmlTop).toContain('object-position:top');

    const htmlBottom = renderToStaticMarkup(
      <Media src="/api/media/photo.jpg" alt="Portrait" focalPoint="bottom" />
    );
    expect(htmlBottom).toContain('object-position:bottom');
  });

  it('applies focal point percentage strings', () => {
    const html = renderToStaticMarkup(
      <Media src="/api/media/photo.jpg" alt="Portrait" focalPoint="30% 70%" />
    );
    expect(html).toContain('object-position:30% 70%');
  });

  it('applies coordinate objects with clamping', () => {
    const htmlClamped = renderToStaticMarkup(
      <Media src="/api/media/photo.jpg" alt="Portrait" focalPoint={{ x: 120, y: -10 }} />
    );
    expect(htmlClamped).toContain('object-position:100% 0%');

    const htmlNormal = renderToStaticMarkup(
      <Media src="/api/media/photo.jpg" alt="Portrait" focalPoint={{ x: 45, y: 65 }} />
    );
    expect(htmlNormal).toContain('object-position:45% 65%');
  });

  it('ignores invalid focal point strings without crashing', () => {
    const html = renderToStaticMarkup(
      <Media
        src="/api/media/photo.jpg"
        alt="Portrait"
        focalPoint={'javascript:alert(1)' as unknown as string}
      />
    );
    expect(html).not.toContain('object-position');
  });
});
