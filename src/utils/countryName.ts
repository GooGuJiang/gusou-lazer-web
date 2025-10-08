/**
 * 获取国家的翻译名称
 * @param t - i18next 的翻译函数
 * @param countryCode - 国家代码
 * @param fallbackName - 备用名称（API 返回的名称）
 * @returns 翻译后的国家名称
 */
export const getCountryName = (
  t: (key: string) => string, 
  countryCode: string, 
  fallbackName?: string
): string => {
  const translationKey = `countries.${countryCode}`;
  const translated = t(translationKey);
  
  // 如果翻译不存在（返回的是 key），使用备用名称或国家代码
  if (translated === translationKey) {
    return fallbackName || countryCode;
  }
  
  return translated;
};

