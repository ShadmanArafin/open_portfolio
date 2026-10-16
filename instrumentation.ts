import { checkBootConfig } from '@/core/security/boot';

/**
 * Ran once when the server boots, before any request is served.
 *
 * Fail-fast for the one misconfiguration that destroys content (local adapter
 * on an ephemeral host); loud warnings for the two that merely disable
 * features (no setup token, no vault key). Development boots silently.
 */
export async function register(): Promise<void> {
  const { errors, warnings } = checkBootConfig(process.env);
  for (const warning of warnings) console.warn(`[boot] ${warning}`);
  if (errors.length > 0) {
    for (const error of errors) console.error(`[boot] FATAL: ${error}`);
    throw new Error(errors.join(' '));
  }
}

/**
 * Server-side failures, with the request id attached.
 *
 * Runs on every route-handler / server-component error Next.js catches. The
 * report carries no content, no session, and no stack with env — message,
 * path, and the id middleware already put on the response, so a log line and
 * a webhook delivery join without guessing. Fail-silent when no webhook is
 * configured or reachable; logging the error locally is the backstop either
 * way.
 */
export async function onRequestError(
  err: unknown,
  request: { path?: string; method?: string; headers?: Record<string, string | string[]> },
  _context: unknown
): Promise<void> {
  const { buildErrorReport, reportServerError } = await import('@/core/observability/report');
  const { APP_VERSION } = await import('@/core/version');
  const headers = request.headers ?? {};
  const rawId = headers['x-request-id'];
  const requestId = (Array.isArray(rawId) ? rawId[0] : rawId)?.slice(0, 64) ?? 'none';
  const report = buildErrorReport({
    message: err instanceof Error ? err.message : String(err),
    path: request.path,
    method: request.method,
    requestId,
    version: APP_VERSION,
  });
  console.error(
    `[request-error] ${report.method} ${report.path} (${report.requestId}): ${report.message}`
  );
  await reportServerError(report);
}
