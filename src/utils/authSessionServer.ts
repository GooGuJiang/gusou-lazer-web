import type { User } from '../types';
import { API_BASE_URL } from './api/baseUrl';

export const AUTH_SESSION_COOKIE = 'g0v0_auth_session';

export const getAuthSessionCookieOptions = () => ({
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
});

export const fetchAuthenticatedUser = async (accessToken?: string): Promise<User | null> => {
  if (!accessToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/v2/me/`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-api-version': '20250913',
      },
    });

    return response.ok ? ((await response.json()) as User) : null;
  } catch {
    return null;
  }
};
