'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PERSONAS } from '@/lib/demo/personas';
import { readPreview, type Handoff } from '@/lib/demo/handoff';
import { SitePreview } from './site-preview';

/**
 * The page the demo hands to a second tab.
 *
 * Read on mount rather than during render, because the value lives in local
 * storage and this page is prerendered at build time — reading it in the render
 * body would mean the exported HTML and the first client render disagreed.
 * `null` while it loads is not a flash of the wrong thing; it is the honest
 * state of not having looked yet.
 *
 * Always at the desktop width. The pane in the editor exists to try the phone
 * and tablet sizes; this exists to see the page at full size, and shrinking it
 * back down here would leave no way to do that.
 */
export function PoppedPreview() {
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [looked, setLooked] = useState(false);

  useEffect(() => {
    setHandoff(readPreview());
    setLooked(true);
  }, []);

  if (!looked) return null;

  if (!handoff) {
    return (
      <div className="gate">
        <div className="gate__card">
          <p className="micro">Demo · full size</p>
          <h2 className="title">Nothing to show yet</h2>
          <p className="small">
            This page shows whatever you last previewed in the demo, and this browser has nothing
            stored from it. That is what you would expect if you opened this address directly, or if
            your browser is set to refuse local storage.
          </p>
          <Link className="btn" href="/demo/try">
            Open the demo
          </Link>
        </div>
      </div>
    );
  }

  const persona = PERSONAS.find((p) => p.id === handoff.personaId) ?? PERSONAS[0];

  return (
    <div className="popped">
      <div className="popped__bar">
        <span>
          {handoff.channel === 'draft'
            ? 'Draft — a snapshot of what was in the editor'
            : 'Published — a snapshot of what visitors would see'}
        </span>
        <span>
          <Link href="/demo/try">Back to the editor</Link>
        </span>
      </div>
      <div className="popped__frame">
        <SitePreview
          persona={persona}
          blocks={handoff.blocks}
          themeId={handoff.themeId}
          mode={handoff.mode}
          fluid
        />
      </div>
    </div>
  );
}
