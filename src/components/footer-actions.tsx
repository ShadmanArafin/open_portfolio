'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { useToast } from '../context/use-toast';
import { cn } from '../utils/cn';
import { copyText } from '../utils/clipboard';

/**
 * The footer's two interactions, as the only client code in it. The rest of
 * the footer — identity, links, the social cards and their icons — renders on
 * the server and ships as HTML.
 */

/** A link that records one analytics event when followed. */
export function TrackedLink({
  event,
  eventProps,
  children,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  event: string;
  eventProps?: Record<string, unknown>;
}) {
  return (
    <a {...props} href={href} onClick={() => trackEvent(event, eventProps)}>
      {children}
    </a>
  );
}

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        copyText(email);
        setCopied(true);
        trackEvent('Email copied');
        showToast('Email address copied to clipboard.', 'success');
        setTimeout(() => setCopied(false), 2000);
      }}
      aria-label={`Copy email address ${email}`}
      className={cn(
        'px-3.5 py-1.5 rounded-xl border font-body transition-all duration-300 flex items-center gap-1.5 flex-shrink-0 cursor-pointer',
        copied
          ? 'bg-accent/15 border-accent/40 text-accent font-medium'
          : 'bg-surface-secondary border-border text-text-secondary group-hover:border-text-primary/40 group-hover:text-text-primary'
      )}
    >
      {copied ? (
        <div className="opb-pop flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-accent stroke-[2.5]" />
          <span className="text-[11px] font-medium text-accent font-body tracking-wider">
            Copied!
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <Copy className="w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary" />
          <span className="text-[11px] font-medium font-body uppercase tracking-wider hidden xs:inline-block">
            Copy
          </span>
        </div>
      )}
    </button>
  );
}
