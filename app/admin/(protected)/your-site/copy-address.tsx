'use client';

import { useState } from 'react';

/** The one thing on the Your-site screen that needs a browser: the clipboard. */
export function CopyAddress({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* The address is on screen to select. */
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="w-fit rounded-full border border-border px-4 text-sm text-text-secondary hover:text-text-primary"
      style={{ minHeight: 44 }}
    >
      {copied ? 'Copied' : 'Copy address'}
    </button>
  );
}
