import type { AppLanguages } from './resources';

export const DEFAULT_LANGUAGE: AppLanguages = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'zh'] as const satisfies readonly AppLanguages[];

export const isSupportedLanguage = (value: string): value is AppLanguages =>
  SUPPORTED_LANGUAGES.includes(value as AppLanguages);

export const getLanguageFromAcceptLanguage = (header: string | null): AppLanguages => {
  if (!header) return DEFAULT_LANGUAGE;

  const preferredLanguages = header
    .split(',')
    .map((entry) => entry.trim().split(';')[0]?.toLowerCase())
    .filter((entry): entry is string => Boolean(entry));

  return preferredLanguages.some((language) => language === 'zh' || language.startsWith('zh-'))
    ? 'zh'
    : DEFAULT_LANGUAGE;
};
