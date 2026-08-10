import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/core/auth/constants';

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
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSessionCookie = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';

    if (!hasSessionCookie && !isLoginPage) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      // Where to return to once they are signed in.
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    if (hasSessionCookie && isLoginPage) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
