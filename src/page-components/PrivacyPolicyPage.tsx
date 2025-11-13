import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto container-padding py-12">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('common.privacyPolicy')}
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {t('privacy.dataCollection.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('privacy.dataCollection.description')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {t('privacy.microsoftClarity.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('privacy.microsoftClarity.description')}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
                  {t('privacy.microsoftClarity.whatWeCollect.title')}
                </h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                  <li>{t('privacy.microsoftClarity.whatWeCollect.interactions')}</li>
                  <li>{t('privacy.microsoftClarity.whatWeCollect.pageViews')}</li>
                  <li>{t('privacy.microsoftClarity.whatWeCollect.clickData')}</li>
                  <li>{t('privacy.microsoftClarity.whatWeCollect.scrollBehavior')}</li>
                  <li>{t('privacy.microsoftClarity.whatWeCollect.deviceInfo')}</li>
                </ul>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('privacy.microsoftClarity.purpose')}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>{t('privacy.microsoftClarity.optOut.title')}</strong> {t('privacy.microsoftClarity.optOut.description')}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {t('privacy.microsoftClarity.learnMore')}{' '}
                <a 
                  href="https://privacy.microsoft.com/privacystatement" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('privacy.microsoftClarity.privacyStatement')}
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {t('privacy.userData.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('privacy.userData.description')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {t('privacy.dataSecurity.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('privacy.dataSecurity.description')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {t('privacy.yourRights.title')}
              </h2>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>{t('privacy.yourRights.access')}</li>
                <li>{t('privacy.yourRights.correction')}</li>
                <li>{t('privacy.yourRights.deletion')}</li>
                <li>{t('privacy.yourRights.portability')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {t('privacy.contact.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {t('privacy.contact.description')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {t('privacy.updates.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {t('privacy.updates.description')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                {t('privacy.lastUpdated')}: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
