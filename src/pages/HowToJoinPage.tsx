import React, { useState } from 'react';
import { FaDownload, FaExclamationTriangle, FaCog, FaGamepad, FaCopy, FaCheck } from 'react-icons/fa';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useTranslation } from 'react-i18next';
import 'react-photo-view/dist/react-photo-view.css';

const HowToJoinPage: React.FC = () => {
  const { t } = useTranslation();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error(`${t('howToJoin.copyFailed')}`, err);
    }
  };

  const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => (
    <button
      onClick={() => copyToClipboard(text, label)}
      className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      title={t('howToJoin.clickToCopy')}
    >
      {copiedText === label ? (
        <FaCheck className="w-3 h-3 text-green-500" />
      ) : (
        <FaCopy className="w-3 h-3 text-gray-500" />
      )}
    </button>
  );

  return (
    <PhotoProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              {t('howToJoin.title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('howToJoin.subtitle')}
            </p>
          </div>

        {/* 方法一：自定义客户端 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-osu-pink text-white rounded-full flex items-center justify-center text-lg font-bold">
              1
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('howToJoin.method1.title')}
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-osu-pink/10 text-osu-pink dark:bg-osu-pink/20 dark:text-profile-color">
                {t('howToJoin.method1.recommended')}
              </span>
            </h2>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              {t('howToJoin.method1.description')}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <FaGamepad className="text-osu-pink" />
              {t('howToJoin.method1.steps.title')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-osu-pink/10 dark:bg-osu-pink/20 text-osu-pink dark:text-profile-color rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  1
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    <FaDownload className="inline mr-2 text-osu-pink" />
                    {t('howToJoin.method1.steps.step1.title')}
                  </p>
                  
                  {/* PC 版本下载 */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('howToJoin.method1.steps.step1.pcVersion')}</p>
                    <a
                      href="https://github.com/GooGuTeam/osu/releases/latest"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg"
                    >
                      <FaDownload className="mr-2" />
                      {t('howToJoin.method1.steps.step1.downloadPc')}
                    </a>
                  </div>

                  {/* 安卓版本下载 */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('howToJoin.method1.steps.step1.androidVersion')}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href="https://pan.wo.cn/s/1D1e0H30675"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg"
                      >
                        <FaDownload className="mr-2" />
                        {t('howToJoin.method1.steps.step1.downloadAndroidDomestic')}
                      </a>
                      <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg"
                      >
                        <FaDownload className="mr-2" />
                        {t('howToJoin.method1.steps.step1.downloadAndroidOverseas')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-osu-pink/10 dark:bg-osu-pink/20 text-osu-pink dark:text-profile-color rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  2
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {t('howToJoin.method1.steps.step2.description')}
                  </p>
                  <div className="bg-gray-100/70 dark:bg-gray-700/70 backdrop-blur-sm p-4 rounded-lg flex items-center mb-4">
                    <code className="bg-osu-pink/10 dark:bg-osu-pink/20 text-osu-pink dark:text-profile-color px-2 py-1 rounded flex-1">
                      lazer-api.g0v0.top
                    </code>
                    <CopyButton text="lazer-api.g0v0.top" label="API URL" />
                  </div>
                  
                  {/* 示例图片 */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('howToJoin.method1.steps.step2.imageHint')}</p>
                    <PhotoView src="/image/join_photos/1.png">
                      <img 
                        src="/image/join_photos/1.png" 
                        alt={t('howToJoin.method1.steps.step2.imageAlt')}
                        className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ maxHeight: '300px' }}
                      />
                    </PhotoView>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-osu-pink/10 dark:bg-osu-pink/20 text-osu-pink dark:text-profile-color rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  3
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t('howToJoin.method1.steps.step3.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 方法二：Authlib Injector */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-osu-blue text-white rounded-full flex items-center justify-center text-lg font-bold">
              2
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('howToJoin.method2.title')}
            </h2>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {t('howToJoin.method2.suitableFor')}
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>{t('howToJoin.method2.platforms.windows')}</li>
              <li>{t('howToJoin.method2.platforms.linux')}</li>
              <li>{t('howToJoin.method2.platforms.mac')}</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <FaCog className="text-osu-blue" />
              {t('howToJoin.method2.steps.title')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-osu-blue/10 dark:bg-osu-blue/20 text-osu-blue dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  1
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    <FaDownload className="inline mr-2 text-osu-blue" />
                    {t('howToJoin.method2.steps.step1.title')}
                  </p>
                  <a
                    href="https://github.com/MingxuanGame/LazerAuthlibInjection/releases/latest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg"
                  >
                    <FaDownload className="mr-2" />
                    {t('howToJoin.method2.steps.step1.download')}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-osu-blue/10 dark:bg-osu-blue/20 text-osu-blue dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  2
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t('howToJoin.method2.steps.step2.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-osu-blue/10 dark:bg-osu-blue/20 text-osu-blue dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  3
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {t('howToJoin.method2.steps.step3.description')}
                  </p>
                  <div className="bg-gray-100/70 dark:bg-gray-700/70 backdrop-blur-sm p-4 rounded-lg space-y-2">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{t('howToJoin.method2.steps.step3.apiUrl')}</span>
                      <code className="bg-osu-blue/10 dark:bg-osu-blue/20 text-osu-blue dark:text-blue-300 px-2 py-1 rounded ml-2 flex-1">
                        https://lazer-api.g0v0.top
                      </code>
                      <CopyButton text="https://lazer-api.g0v0.top" label="Authlib API URL" />
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{t('howToJoin.method2.steps.step3.websiteUrl')}</span>
                      <code className="bg-osu-blue/10 dark:bg-osu-blue/20 text-osu-blue dark:text-blue-300 px-2 py-1 rounded ml-2 flex-1">
                        https://lazer.g0v0.top
                      </code>
                      <CopyButton text="https://lazer.g0v0.top" label="Website URL" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-osu-blue/10 dark:bg-osu-blue/20 text-osu-blue dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  4
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t('howToJoin.method2.steps.step4.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Authlib Injector 的警告 */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                  {t('howToJoin.method2.warning.title')}
                </h4>
                <p className="text-red-700 dark:text-red-300">
                  {t('howToJoin.method2.warning.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部返回按钮 */}
        <div className="text-center mt-12">
          <button
            onClick={() => window.history.back()}
            className="btn-primary inline-flex items-center px-6 py-3 text-base font-medium rounded-lg"
          >
            {t('common.backToPrevious')}
          </button>
        </div>
        </div>
      </div>
    </PhotoProvider>
  );
};

export default HowToJoinPage;
