import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ADMIN = [/^\/admin(?!\/login).*/];
const PROTECTED_APP = [/^\/quiz.*/, /^\/topup.*/, /^\/leaderboard.*/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedAdmin = PROTECTED_ADMIN.some((r) => r.test(pathname));
  const isProtectedApp = PROTECTED_APP.some((r) => r.test(pathname));

  const token =
    req.cookies.get('user_token')?.value ||
    req.cookies.get('token')?.value ||
    req.headers.get('authorization') || '';
  const hasToken = token.includes('Bearer ') || token.length > 0;

  if ((isProtectedAdmin || isProtectedApp) && !hasToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/quiz', '/topup', '/leaderboard'],
};


