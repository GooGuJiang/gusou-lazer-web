import 'server-only';

import { cookies, headers } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function resolveUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }

  const headerList = headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000';
  const protocol = headerList.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
  return `${protocol}://${host}${path}`;
}

interface FetchApiOptions extends RequestInit {
  allowNotFound?: boolean;
  returnNullOnUnauthorized?: boolean;
}

export async function fetchApi<T>(
  path: string,
  { allowNotFound = false, returnNullOnUnauthorized = true, ...init }: FetchApiOptions = {},
): Promise<T | null> {
  const resolvedUrl = resolveUrl(path);
  const cookieHeader = cookies()
    .getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const headersInit: HeadersInit = {
    Accept: 'application/json',
    ...(init.headers ?? {}),
  };

  if (cookieHeader) {
    headersInit.Cookie = cookieHeader;
  }

  const response = await fetch(resolvedUrl, {
    ...init,
    headers: headersInit,
    credentials: 'include',
    cache: 'no-store',
  });

  if (response.status === 401 && returnNullOnUnauthorized) {
    return null;
  }

  if (response.status === 404 && allowNotFound) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return (await response.json()) as T;
}
