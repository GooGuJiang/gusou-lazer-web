import type { AppLanguages } from '../../i18n/resources';

export const PRIVATE_PATHS = [
  /^\/login$/,
  /^\/register$/,
  /^\/password-reset$/,
  /^\/settings$/,
  /^\/messages$/,
  /^\/oauth\/authorize$/,
  /^\/teams\/create$/,
  /^\/teams\/[^/]+\/edit$/,
];

const KNOWN_PATHS = [
  /^\/$/,
  /^\/(?:login|register|password-reset|settings|rankings|teams|messages|how-to-join|beatmapsets)$/,
  /^\/oauth\/authorize$/,
  /^\/users\/[^/]+$/,
  /^\/teams\/[^/]+(?:\/edit)?$/,
  /^\/beatmaps\/\d+$/,
  /^\/beatmapsets\/\d+$/,
  /^\/scores\/\d+$/,
];

export const isKnownApplicationPath = (pathname: string): boolean =>
  KNOWN_PATHS.some((pattern) => pattern.test(pathname));

export const getLocalizedPath = (language: AppLanguages, pathname: string): string =>
  `/${language}${pathname === '/' ? '' : pathname}`;
