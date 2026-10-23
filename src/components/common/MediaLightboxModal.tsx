'use client';

import React, { useEffect } from 'react';
import { resolveAssetUrl } from '../../cms/utils/mediaUrls';
import { X, ZoomIn, Play } from 'lucide-react';

export interface GalleryMediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt: string;
  title: string;
  caption?: string;
  gradient?: string;
}

interface MediaLightboxModalProps {
  isOpen: boolean;
  item: GalleryMediaItem | null;
  onClose: () => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Same focus contract as ImageLightboxModal: focus in on open, trapped Tab,
  // focus back to the opener on close. Two modals sharing one pattern beats
  // one shared abstraction nobody can find.
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const trapTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', trapTab);
    return () => {
      window.removeEventListener('keydown', trapTab);
      openerRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return (
    <>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.title || item.alt || 'Media preview'}
        className="opb-fade fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md select-none"
      >
        {/* The backdrop is a button of its own: a click outside the picture
            closes it. Out of the tab order — the close button and Escape
            already give keyboards a way out, and one is enough. */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={onClose}
          className="absolute inset-0 cursor-zoom-out"
        />
        {/* Close Button Top Right */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close Media Preview"
          className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Centered Media Container */}
        <div className="opb-pop relative max-w-5xl max-h-[85vh] w-auto h-auto flex flex-col items-center justify-center cursor-default">
          {item.type === 'video' ? (
            <video
              src={item.src}
              controls
              autoPlay
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-2xl border border-white/15 shadow-2xl"
            >
              {/* The media library has no way to attach a caption file yet, so
                  this is an empty track rather than a real one. When captions
                  become uploadable, point this at the stored .vtt. */}
              <track kind="captions" />
            </video>
          ) : (
            <img
              src={resolveAssetUrl(item.src)}
              alt={item.alt}
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-2xl border border-white/15 shadow-2xl"
            />
          )}

          {/* Caption Bar */}
          <div className="mt-4 px-5 py-2.5 rounded-full bg-surface-primary/90 border border-border text-xs sm:text-sm font-medium font-body text-text-primary shadow-lg flex items-center gap-2">
            {item.type === 'video' ? (
              <Play className="w-4 h-4 text-accent flex-shrink-0" />
            ) : (
              <ZoomIn className="w-4 h-4 text-accent flex-shrink-0" />
            )}
            <span>
              {item.title} — {item.caption || item.alt}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
