import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle } from 'react-icons/fa';
import { BsQuestionCircle } from 'react-icons/bs';

interface RestrictedBannerProps {
  className?: string;
}

const RestrictedBanner: React.FC<RestrictedBannerProps> = ({ className = '' }) => {
  const { t } = useTranslation();

  const handleLearnMore = () => {
    // 可以链接到帮助页面或说明文档
    window.open('', '_blank');
  };

  return (
    <>
      {/* 移动端：底部横幅 */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${className}`}>
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-4 shadow-lg">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base mb-1">
                {t('profile.restrictedBanner.title')}
              </h3>
              <p className="text-sm opacity-95 leading-relaxed">
                {t('profile.restrictedBanner.message')}
              </p>
            </div>
            <button
              onClick={handleLearnMore}
              className="flex-shrink-0 bg-white/20 hover:bg-white/30 transition-colors rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
            >
              <BsQuestionCircle className="h-4 w-4" />
              {t('profile.restrictedBanner.learnMore')}
            </button>
          </div>
        </div>
      </div>

      {/* 桌面端：右下角圆角提示框 */}
      <div className={`hidden md:block fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl shadow-2xl max-w-md overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-white/20 rounded-full p-3">
                <FaExclamationTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-2">
                  {t('profile.restrictedBanner.title')}
                </h3>
                <p className="text-sm opacity-95 leading-relaxed mb-4">
                  {t('profile.restrictedBanner.message')}
                </p>
                <button
                  onClick={handleLearnMore}
                  className="bg-white/90 hover:bg-white transition-colors text-red-700 rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <BsQuestionCircle className="h-4 w-4" />
                  {t('profile.restrictedBanner.learnMore')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestrictedBanner;
