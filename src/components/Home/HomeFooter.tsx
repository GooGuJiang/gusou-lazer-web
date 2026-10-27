import React from 'react';
import { useTranslation } from 'react-i18next';

const HomeFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-8 bg-white/50 dark:bg-gray-900/50 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <img src="/lazer.ico" alt={t('common.brandAlt')} className="w-6 h-6 opacity-60" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('common.brandName')}
            </span>
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
