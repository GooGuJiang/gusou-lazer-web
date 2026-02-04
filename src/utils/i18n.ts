import i18next from "i18next";

export type TranslationOptions = { [key: string]: unknown } | undefined;

/**
 * 在 useTranslation() 钩子无法使用的情况下进行本地化
 * @param key 字符串键
 * @param options 本地化参数
 */
export function t(key: string, options?: TranslationOptions): string {
  if (i18next.isInitialized) {
    try {
      return i18next.t(key, options);
    } catch {
      return key;
    }
  }
  return key;
}
