import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, type AppLanguages } from './resources';

const defaultLanguage: AppLanguages = 'en';

// 支持的语言列表
const supportedLanguages: AppLanguages[] = ['en', 'zh'];

// 获取浏览器语言偏好
const getBrowserLanguage = (): AppLanguages => {
  if (typeof window === 'undefined') return defaultLanguage;
  
  const browserLang = navigator.language || (navigator as any).userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // 检查是否是支持的语言
  if (supportedLanguages.includes(langCode as AppLanguages)) {
    return langCode as AppLanguages;
  }
  
  // 检查是否是中文变体
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }
  
  return defaultLanguage;
};

// 获取存储的语言或浏览器语言
const getInitialLanguage = (): AppLanguages => {
  if (typeof window === 'undefined') return defaultLanguage;
  
  const storedLanguage = localStorage.getItem('app-language') as AppLanguages | null;
  
  if (storedLanguage && supportedLanguages.includes(storedLanguage)) {
    return storedLanguage;
  }
  
  return getBrowserLanguage();
};

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: {
      default: [defaultLanguage],
      'zh-CN': ['zh'],
      'zh-TW': ['zh'],
      'zh-HK': ['zh'],
      'en-US': ['en'],
      'en-GB': ['en'],
    },
    supportedLngs: supportedLanguages,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// 语言变化监听器
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app-language', lng);
    // 更新HTML lang属性
    document.documentElement.lang = lng;
  }
});

// 初始化时设置HTML lang属性
if (typeof window !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

export default i18n;
