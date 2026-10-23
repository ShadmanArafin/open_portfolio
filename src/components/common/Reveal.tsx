import React from 'react';

interface RevealProps {
  children: React.ReactNode;
  width?: 'fit-content' | '100%';
  /** Kept for callers; scroll-driven entrances follow the scroll, not a clock. */
  delay?: number;
  duration?: number;
  type?: 'fade-up' | 'clip-headline' | 'scale-image' | 'label';
  className?: string;
}

/**
 * An entrance as the element scrolls into view — in CSS, with no script.
 *
 * This was a client component on the `motion` library: every instance
 * hydrated, observed itself and animated from opacity 0, so the server HTML
 * shipped invisible content that waited for JavaScript. Now it is a server
 * component and the animation is `animation-timeline: view()` (see
 * `src/styles/index.css`): no JavaScript, visible content in the HTML, and
 * nothing at all for visitors who asked for reduced motion or whose browser
 * lacks scroll-driven animations.
 *
 * The headline variant clips with `overflow: clip`, not `hidden`: `hidden`
 * makes the wrapper a scroll container, and a view timeline would then track
 * the wrapper instead of the page.
 */
export function Reveal({
  children,
  width = '100%',
  type = 'fade-up',
  className = '',
}: RevealProps) {
  if (type === 'clip-headline') {
    return (
      <div className={`overflow-clip py-1.5 -my-1.5 ${className}`} style={{ width }}>
        <div className="opb-reveal-clip">{children}</div>
      </div>
    );
  }
  if (type === 'scale-image') {
    return (
      <div className={`overflow-clip ${className}`} style={{ width }}>
        <div className="opb-reveal-scale">{children}</div>
      </div>
    );
  }
  return (
    <div
      className={`opb-reveal ${className}`}
      style={{ width, ...(type === 'label' ? { '--opb-rise': '8px' } : {}) } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
