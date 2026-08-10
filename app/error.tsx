'use client';

import { useEffect } from 'react';

/**
 * Without this a single render error white-screens the whole site. The message
 * is deliberately vague — a stack trace on a public page tells an attacker
 * about your dependencies and tells a visitor nothing useful.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-6">
        <h1 className="font-display text-3xl font-medium text-text-primary">
          Something went wrong.
        </h1>
        <p className="font-body text-text-secondary">
          This page failed to load. Trying again often fixes it.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-[42px] items-center rounded-full bg-text-primary px-6 font-body text-xs font-medium uppercase tracking-wider text-bg transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
