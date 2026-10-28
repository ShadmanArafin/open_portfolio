'use client';

import React, { useState } from 'react';
import { generateQrSvg } from '@/core/resume/qr';
import { QrCode, Download, X, Check } from 'lucide-react';

interface RecruiterQrCardProps {
  fullName: string;
  role?: string;
  siteUrl: string;
  vcardUrl?: string;
}

export const RecruiterQrCard: React.FC<RecruiterQrCardProps> = ({
  fullName,
  role,
  siteUrl,
  vcardUrl = '/api/contact/vcard',
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate SVG QR string pointing to the site or vcard
  const targetUrl = siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const qrSvg = generateQrSvg(targetUrl, { size: 180, padding: 2 });

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      void err;
    }
  };

  return (
    <div className="not-prose my-6 print:hidden">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-primary px-4 py-2 text-xs font-medium uppercase tracking-wider text-text-primary shadow-sm transition-all hover:border-text-primary/40 hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <QrCode className="h-4 w-4 text-accent" />
          <span>Recruiter QR & Contact Card</span>
        </button>
      ) : (
        <div className="relative max-w-sm rounded-2xl border border-border bg-surface-primary p-6 shadow-md transition-all">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close QR card"
            className="absolute right-4 top-4 rounded-full p-1.5 text-text-muted hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>

          <p className="font-mono text-xs uppercase tracking-widest text-accent">Quick Connect</p>
          <h3 className="font-display mt-1 text-lg font-medium text-text-primary">{fullName}</h3>
          {role && <p className="font-body text-xs text-text-secondary">{role}</p>}

          <div className="my-5 flex justify-center">
            <div
              className="rounded-xl border border-border/80 bg-white p-3 text-black shadow-inner"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
              aria-label={`QR Code pointing to ${targetUrl}`}
            />
          </div>

          <p className="font-body text-center text-xs text-text-muted">
            Scan with your phone camera to open on mobile or save contact info.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href={vcardUrl}
              download
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-text-primary px-3 py-2 text-xs font-medium uppercase tracking-wider text-bg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Save .VCF</span>
            </a>
            <button
              type="button"
              onClick={copyUrl}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3 py-2 text-xs font-medium uppercase tracking-wider text-text-primary transition-colors hover:border-text-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  <span>Copied!</span>
                </>
              ) : (
                <span>Copy Link</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
