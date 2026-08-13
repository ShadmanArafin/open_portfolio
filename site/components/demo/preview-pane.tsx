'use client';

import React from 'react';
import { ExternalLink, Monitor, Smartphone, Tablet, X } from 'lucide-react';
import type { Persona } from '@/lib/demo/personas';
import type { PageBlock } from '@/lib/demo/types';
import { DEVICES, SitePreview, type DeviceId } from './site-preview';

/**
 * The preview pane, with the controls the real admin puts on it.
 *
 * The device sizes used to live in the top bar next to the persona and theme
 * pickers, which put a control for the preview three metres from the preview
 * and made the editor's own bar read as a demo control panel. They belong on
 * the thing they change — which is also where the product keeps them.
 *
 * Closing and reopening it matters more than it looks. The preview took more
 * than half the window, so a visitor evaluating whether they could work the
 * admin was judging it at half width, and every list and form they saw was
 * narrower than it will ever be on their own machine.
 */

const DEVICE_ICONS: Record<DeviceId, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  phone: Smartphone,
};

export function PreviewPane({
  persona,
  blocks,
  themeId,
  mode,
  device,
  channel,
  onDevice,
  onClose,
  onPopOut,
}: {
  persona: Persona;
  blocks: PageBlock[];
  themeId: string;
  mode: 'light' | 'dark';
  device: DeviceId;
  channel: 'draft' | 'live';
  onDevice: (id: DeviceId) => void;
  onClose: () => void;
  onPopOut: () => void;
}) {
  return (
    <div className="studio__preview">
      <div className="studio__previewbar">
        <span className="studio__previewwhat">
          <span className="studio__dot" data-live={channel === 'live' ? 'true' : 'false'} />
          {channel === 'draft' ? 'Draft — only you can see this' : 'Live — what visitors see'}
        </span>

        <span className="studio__previewtools">
          <span className="studio__devices" role="group" aria-label="Screen size">
            {DEVICES.map((option) => {
              const Glyph = DEVICE_ICONS[option.id];
              const title = `${option.label} (${option.width}px)`;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={device === option.id}
                  aria-label={title}
                  title={title}
                  onClick={() => onDevice(option.id)}
                >
                  <Glyph aria-hidden />
                </button>
              );
            })}
          </span>

          <button
            type="button"
            className="studio__iconbtn"
            onClick={onPopOut}
            title="Open this page in a new tab"
            aria-label="Open this page in a new tab"
          >
            <ExternalLink aria-hidden />
          </button>

          <button
            type="button"
            className="studio__iconbtn"
            onClick={onClose}
            title="Hide the preview"
            aria-label="Hide the preview"
          >
            <X aria-hidden />
          </button>
        </span>
      </div>

      <div className="studio__frame">
        <SitePreview
          persona={persona}
          blocks={blocks}
          themeId={themeId}
          mode={mode}
          device={device}
        />
      </div>

      <p className="studio__previewfoot">
        {DEVICES.find((d) => d.id === device)?.width}px ·{' '}
        {persona.name.toLowerCase().replace(/\s+/g, '')}.example
      </p>
    </div>
  );
}
