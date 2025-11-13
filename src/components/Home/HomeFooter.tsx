import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

const HomeFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-8 bg-white/50 dark:bg-gray-900/50 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <img src="/image/logos/logo.svg" alt={t('common.brandAlt')} className="w-6 h-6 opacity-60" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.brandName')}</span>
          </div>
          
          {/* Privacy Disclosure */}
          <div className="max-w-2xl text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
              {t('common.privacyDisclosure')}
            </p>
          </div>
          
          {/* Legal Links */}
          <div className="flex items-center space-x-4 text-xs">
            <Link 
              href="/privacy-policy" 
              className="text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t('common.privacyPolicy')}
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link 
              href="/terms-of-service" 
              className="text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t('common.termsOfService')}
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
