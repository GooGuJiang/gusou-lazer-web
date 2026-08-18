import { NextResponse } from 'next/server';
import {
  AUTH_SESSION_COOKIE,
  fetchAuthenticatedUser,
  getAuthSessionCookieOptions,
} from '../../../../utils/authSessionServer';

const isSameOrigin = (request: Request): boolean => {
  const origin = request.headers.get('origin');
  return origin === null || origin === new URL(request.url).origin;
};

const getAccessToken = (body: unknown): string | null => {
  if (typeof body !== 'object' || body === null || !('accessToken' in body)) return null;

  const { accessToken } = body;
  return typeof accessToken === 'string' && accessToken.length > 0 && accessToken.length <= 4096
    ? accessToken
    : null;
};

export const POST = async (request: Request) => {
  if (!isSameOrigin(request))
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const accessToken = getAccessToken(body);
  if (!accessToken) return NextResponse.json({ error: 'Invalid access token' }, { status: 400 });

  const user = await fetchAuthenticatedUser(accessToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(AUTH_SESSION_COOKIE, accessToken, getAuthSessionCookieOptions());
  return response;
};

export const DELETE = async (request: Request) => {
  if (!isSameOrigin(request))
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(AUTH_SESSION_COOKIE, '', { ...getAuthSessionCookieOptions(), maxAge: 0 });
  return response;
};
