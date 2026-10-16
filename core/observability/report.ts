/**
 * Vendor-neutral server error reporting.
 *
 * Set `OPB_ERROR_WEBHOOK_URL` to receive a JSON POST for every server-side
 * failure Next.js surfaces via `onRequestError`: `{ message, path, method,
 * requestId, version, at }`. Anything that accepts a webhook works — a tiny
 * receiver, GlitchTip, a Sentry inbound relay — and when unset nothing happens
 * beyond the existing `console.error`. No SDK, no vendor lock, no new
 * dependency for self-hosters to audit.
 *
 * Fail-silent by design: reporting must never break the request it reports on.
 * Secrets are never included — message only, truncated, no stacks with env.
 */

export interface ErrorReport {
  message: string;
  path: string;
  method: string;
  requestId: string;
  version: string;
  at: string;
}

export function buildErrorReport(input: {
  message: string;
  path?: string;
  method?: string;
  requestId?: string;
  version?: string;
}): ErrorReport {
  return {
    message: input.message.slice(0, 500),
    path: (input.path ?? 'unknown').slice(0, 200),
    method: (input.method ?? 'unknown').slice(0, 16),
    requestId: (input.requestId ?? 'none').slice(0, 64),
    version: (input.version ?? 'unknown').slice(0, 32),
    at: new Date().toISOString(),
  };
}

export async function reportServerError(
  report: ErrorReport,
  fetchImpl: typeof fetch = fetch
): Promise<'sent' | 'skipped' | 'failed'> {
  const url = process.env.OPB_ERROR_WEBHOOK_URL;
  if (!url) return 'skipped';
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetchImpl(url, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      return res.ok ? 'sent' : 'failed';
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return 'failed';
  }
}
