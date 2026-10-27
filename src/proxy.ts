import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  DEFAULT_LANGUAGE,
  getLanguageFromAcceptLanguage,
  isSupportedLanguage,
} from './i18n/config';

const LANGUAGE_COOKIE = 'app-language';

export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const pathLanguage = pathname.split('/')[1] ?? '';

  if (isSupportedLanguage(pathLanguage)) {
    const response = NextResponse.next();
    response.cookies.set(LANGUAGE_COOKIE, pathLanguage, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  const cookieLanguage = request.cookies.get(LANGUAGE_COOKIE)?.value;
  const language =
    cookieLanguage && isSupportedLanguage(cookieLanguage)
      ? cookieLanguage
      : getLanguageFromAcceptLanguage(request.headers.get('accept-language')) || DEFAULT_LANGUAGE;
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${language}${pathname === '/' ? '' : pathname}`;

  return NextResponse.redirect(redirectUrl);
};

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|lazer.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\..*).*)',
  ],
};
