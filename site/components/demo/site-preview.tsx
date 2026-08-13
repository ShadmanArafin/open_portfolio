'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BlockList, parsePage } from '../../../core/blocks/registry';
import type { Persona } from '@/lib/demo/personas';
import { blockContentFor, themeStyle, vocabulary } from '@/lib/demo/render';
import type { PageBlock } from '@/lib/demo/types';

/**
 * The portfolio, as it would actually be published.
 *
 * `parsePage` and `BlockList` are the product's own — the same functions the
 * real site calls on every request — and the CSS custom properties come from
 * the product's own token generator. So this is not a mock-up of the output; it
 * *is* the output, rendered in a different page.
 *
 * Two consequences worth stating. A block added to the product appears here
 * with no work. And a block broken in the product is broken here, visibly,
 * which is the right way round.
 */

/** A navigation bar and a footer, so the preview reads as a deployed site. */
function Chrome({ persona, children }: { persona: Persona; children: React.ReactNode }) {
  const words = vocabulary(persona);
  const links = [words.work, words.brands, words.writing, 'Contact'];

  return (
    <>
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 'var(--gutter)',
          paddingBlock: 'var(--space-5)',
          borderBottom: 'var(--hairline) solid var(--border-color)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            color: 'var(--text-primary)',
          }}
        >
          {persona.name}
        </span>
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-5)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          {links.map((link) => (
            <span key={link}>{link}</span>
          ))}
        </nav>
      </header>

      {children}

      <footer
        style={{
          paddingInline: 'var(--gutter)',
          paddingBlock: 'var(--space-10)',
          borderTop: 'var(--hairline) solid var(--border-color)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          justifyContent: 'space-between',
        }}
      >
        <span>
          © {new Date().getFullYear()} {persona.name}
        </span>
        <span>{persona.email}</span>
      </footer>
    </>
  );
}

/**
 * Device widths, and why the preview is scaled rather than squeezed.
 *
 * A preview pane is narrower than a browser window, so a site rendered
 * directly into it lays itself out for a tablet and the visitor concludes the
 * product only does one column. Rendering at a real device width and scaling
 * the whole thing down shows what the page would actually do — which is also
 * what makes the phone and tablet widths worth having rather than decorative.
 */
export const DEVICES = [
  { id: 'desktop', label: 'Desktop', width: 1280 },
  { id: 'tablet', label: 'Tablet', width: 834 },
  { id: 'phone', label: 'Phone', width: 390 },
] as const;

export type DeviceId = (typeof DEVICES)[number]['id'];

export function SitePreview({
  persona,
  blocks,
  themeId,
  mode,
  device = 'desktop',
  fluid = false,
}: {
  persona: Persona;
  blocks: PageBlock[];
  themeId: string;
  mode: 'light' | 'dark';
  device?: DeviceId;
  /**
   * Lay the page out at whatever width it is given, rather than at a device
   * width scaled to fit.
   *
   * For the tab the demo opens on its own: there, "full size" means the size of
   * the window somebody is looking at. Rendering 1280px centred in a 1600px
   * window and calling it full size shows a narrower page than the one their
   * own visitors would get, which is the opposite of the point.
   */
  fluid?: boolean;
}) {
  const [note, setNote] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shell = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [fluidWidth, setFluidWidth] = useState(1280);
  const deviceWidth = DEVICES.find((d) => d.id === device)?.width ?? 1280;
  const width = fluid ? fluidWidth : deviceWidth;

  useEffect(() => {
    const element = shell.current;
    if (!element) return;
    const measure = () => {
      if (fluid) {
        setFluidWidth(element.clientWidth);
        setScale(1);
        return;
      }
      // Never scale up. A phone frame blown up to fill a desktop pane looks
      // like a mistake, and the point of the narrow widths is to see the real
      // thing at its real size.
      setScale(Math.min(1, element.clientWidth / deviceWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [deviceWidth, fluid]);

  const parsed = useMemo(() => parsePage(blocks), [blocks]);
  const content = useMemo(() => blockContentFor(persona), [persona]);
  const tokens = useMemo(() => themeStyle(themeId, mode), [themeId, mode]);

  /**
   * The preview is inert.
   *
   * Every link and every button inside it belongs to a site that does not exist
   * at this address — and the contact block would post to an endpoint this
   * static site does not have, then tell the visitor it could not reach the
   * server. Catching it on the way down and saying what would happen is more
   * honest than either a dead click or a fabricated success message.
   */
  const explain = (message: string) => (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setNote(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(null), 3200);
  };

  return (
    <div ref={shell} style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {/*
        `overflow: hidden auto` — the horizontal half matters.
        The page inside is laid out at a real device width and then scaled with
        a transform, which changes what you see and not what the box occupies.
        So a 1280px page in a 600px pane still claims 1280px of scroll width,
        and the pane grew a horizontal scrollbar for content already fully
        visible. Hiding it is correct rather than a patch: there is nothing out
        there to scroll to.
      */}
      <div
        style={{
          height: '100%',
          overflow: 'hidden auto',
          display: 'grid',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            // The scaled box still occupies its unscaled height in the flow, so
            // without this the pane scrolls far past the end of the page.
            height: scale < 1 ? undefined : '100%',
            ...tokens,
            background: 'var(--bg)',
            color: 'var(--text-primary)',
          }}
          onClickCapture={explain('That link works on the real site. This is a preview.')}
          onSubmitCapture={explain(
            'On your own site this arrives in your inbox in the admin, and emails you.'
          )}
        >
          <Chrome persona={persona}>
            <BlockList blocks={parsed} content={content} />
          </Chrome>
        </div>
      </div>

      {note && (
        <p
          role="status"
          style={{
            position: 'absolute',
            insetInline: '1rem',
            bottom: '1rem',
            margin: 0,
            padding: '0.7rem 1rem',
            borderRadius: '2px',
            background: 'var(--ink)',
            color: 'var(--paper)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgb(0 0 0 / 0.18)',
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}
