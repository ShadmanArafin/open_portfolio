import type { RecentError } from '@/core/support/diagnostics';

/**
 * The last few things that went wrong in the admin.
 *
 * Held in memory, nowhere else. Not sent anywhere, not written to storage, not
 * persisted across a reload — it exists so that when somebody reports a bug the
 * report can carry the error they actually saw, instead of "it broke".
 *
 * A ring buffer of ten, because the useful one is almost always the most recent
 * and an unbounded list of repeated errors is how a page runs out of memory
 * while somebody is trying to tell you it is broken.
 */

const LIMIT = 10;
const entries: RecentError[] = [];

/**
 * First line of the stack, with the origin stripped.
 *
 * A full stack in a public issue can carry the site's own hostname and file
 * paths. One frame is enough to place the error and short enough that somebody
 * can read what they are about to publish.
 */
function firstFrame(stack: string | undefined): string | undefined {
  if (!stack) return undefined;
  const line = stack
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith('at '));
  if (!line) return undefined;
  return line.replace(/https?:\/\/[^/]+/g, '').slice(0, 200);
}

export function recordError(message: string, stack?: string): void {
  entries.push({
    message: message.slice(0, 300),
    where: firstFrame(stack),
    at: new Date().toISOString().slice(11, 19),
  });
  if (entries.length > LIMIT) entries.shift();
}

export function recentErrors(): RecentError[] {
  return [...entries];
}

export function clearErrors(): void {
  entries.length = 0;
}

let listening = false;

/**
 * Starts collecting. Safe to call more than once.
 *
 * Deliberately does not swallow anything: both handlers observe and return, so
 * the browser still logs to the console and any other handler still runs. A
 * collector that quietly ate errors would make debugging worse, not better.
 */
export function startCollectingErrors(): void {
  if (listening || typeof window === 'undefined') return;
  listening = true;

  window.addEventListener('error', (event) => {
    recordError(event.message || 'Script error', event.error?.stack);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as { message?: string; stack?: string } | string | undefined;
    if (typeof reason === 'string') recordError(reason);
    else recordError(reason?.message ?? 'A promise failed with no message', reason?.stack);
  });
}
