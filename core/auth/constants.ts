/**
 * Auth constants with no dependencies.
 *
 * Kept in their own file because middleware runs on the Edge runtime, where
 * `process.cwd()` and the filesystem do not exist. Importing the session module
 * there would drag the whole storage layer in and fail the build — so the one
 * value middleware genuinely needs lives somewhere it can safely reach.
 */
export const SESSION_COOKIE = 'opb_session';
export const SESSION_COOKIE_SECURE = '__Host-opb_session';

/**
 * Which cookie name to use. The `__Host-` prefix tells the browser to require
 * `Secure`, `Path=/` and no `Domain` — it defeats subdomain shadowing. It
 * only works over HTTPS, so plain-HTTP dev keeps the unprefixed name. Both
 * names are accepted when reading, so a deploy that flips to HTTPS does not
 * sign everybody out.
 */
export function sessionCookieNames(): [string, string] {
  return [SESSION_COOKIE_SECURE, SESSION_COOKIE];
}

export function shouldUseSecureCookies(): boolean {
  if (process.env.NODE_ENV !== 'production') return false;
  if (process.env.OPB_ALLOW_INSECURE_COOKIES === '1') return false;
  return true;
}

export function activeSessionCookie(): string {
  return shouldUseSecureCookies() ? SESSION_COOKIE_SECURE : SESSION_COOKIE;
}
