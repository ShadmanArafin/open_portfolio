import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, SESSION_COOKIE_SECURE } from '@/core/auth/constants';
import { DEMO_SESSION_COOKIE, DEMO_TTL_SECONDS } from '@/core/demo/config';

/**
 * Routing convenience for the admin, and nothing more.
 *
 * This checks only whether a session cookie is *present* — it cannot validate
 * it, because middleware runs before the storage layer is reachable. Treating
 * that check as the authorization boundary would be a serious mistake, and
 * Next has shipped middleware-bypass advisories more than once. The real
 * boundary is `requireOwner()` inside every route handler and server action;
 * this only saves a signed-out visitor from watching the admin shell load
 * before it redirects them.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Every response carries the request id it was served under, so a log line
  // and a bug report can be joined without guessing. Respect an inbound id
  // from a proxy (truncated, it is correlation not auth); otherwise mint one.
  const inbound = req.headers.get('x-request-id')?.slice(0, 64);
  const requestId = inbound && /^[A-Za-z0-9_-]+$/.test(inbound) ? inbound : crypto.randomUUID();

  const withId = (res: NextResponse): NextResponse => {
    res.headers.set('x-request-id', requestId);
    return res;
  };

  const hasSessionCookie = Boolean(
    req.cookies.get(SESSION_COOKIE_SECURE)?.value ?? req.cookies.get(SESSION_COOKIE)?.value
  );

  /*
   * Demo mode: give each visitor their own sandbox.
   *
   * The proxy is the only place this can happen, because it is the only thing
   * that runs before a cached page is served — a cookie set from inside a route
   * would never be issued to the visitors who most need it, the ones landing on
   * the prerendered home page.
   *
   * `crypto.randomUUID` rather than anything cleverer: this identifies a
   * throwaway sandbox, not a person, and it must never look like a session
   * token to anybody reading the code later.
   */
  if (process.env.OPB_DEMO_MODE === '1' && !req.cookies.get(DEMO_SESSION_COOKIE)?.value) {
    const response = NextResponse.next();
    const secure = process.env.NODE_ENV === 'production';
    response.cookies.set(DEMO_SESSION_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: DEMO_TTL_SECONDS,
    });
    return withId(response);
  }

  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';
    // A mailed reset link is opened cold — no session cookie exists yet — so
    // it needs the same exemption as the login page itself. Losing this would
    // not just be inconvenient: the redirect below rewrites the whole URL,
    // which drops the `?token=` query string the link depends on entirely.
    const isResetPage = pathname === '/admin/reset';

    if (!hasSessionCookie && !isLoginPage && !isResetPage) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      // Where to return to once they are signed in.
      url.searchParams.set('next', pathname);
      return withId(NextResponse.redirect(url));
    }

    if (hasSessionCookie && isLoginPage) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin';
      url.search = '';
      return withId(NextResponse.redirect(url));
    }
  }

  return withId(NextResponse.next());
}

export const config = {
  /*
   * `/admin` for the redirect, and everything else for the demo sandbox cookie.
   *
   * The matcher used to be `/admin` alone, which meant the demo cookie was
   * never issued to anybody arriving at the public site — that is, to everybody.
   * They all shared the anonymous sandbox and each other's edits.
   *
   * Static assets are excluded: issuing a cookie alongside a favicon is pure
   * overhead, and `_next/static` is served from a CDN that should never see one.
   */
  matcher: ['/admin/:path*', '/((?!_next/static|_next/image|favicon.ico|api/media).*)'],
};
