import React, { useState } from 'react';
import { 
  FaDownload, 
  FaExclamationTriangle, 
  FaGamepad, 
  FaCopy, 
  FaCheck, 
  FaWindows, 
  FaLinux, 
  FaApple, 
  FaChevronLeft
} from 'react-icons/fa';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useTranslation } from 'react-i18next';
import 'react-photo-view/dist/react-photo-view.css';

// --- Sub-components for cleaner code ---

/**
 * A copy-paste snippet component that looks like a code block
 */
const CodeSnippet: React.FC<{ text: string; label: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full max-w-md">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
        {label}
      </span>
      <div 
        onClick={handleCopy}
        className={`group relative flex items-center justify-between bg-gray-100 dark:bg-gray-900 border rounded-xl p-3 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
          copied 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : 'border-gray-200 dark:border-gray-700 hover:border-osu-pink hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <code className="font-mono text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate pr-12 select-all">
          {text}
        </code>
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
          copied 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 group-hover:bg-osu-pink group-hover:text-white'
        }`}>
          {copied ? (
            <FaCheck className="w-4 h-4" />
          ) : (
            <FaCopy className="w-4 h-4" />
          )}
        </div>
        {/* Tooltip hint */}
        <span className={`absolute -top-8 right-0 text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity ${
          copied ? 'bg-green-600 opacity-100' : 'bg-black opacity-0 group-hover:opacity-100'
        }`}>
          {copied ? t('common.copied') : t('howToJoin.clickToCopy')}
        </span>
      </div>
    </div>
  );
};

/**
 * Step Container
 */
const StepItem: React.FC<{ number: number; children: React.ReactNode }> = ({ number, children }) => (
  <div className="flex gap-4 sm:gap-6">
    <div className="flex-shrink-0 flex flex-col items-center">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-osu-pink text-white flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      {/* Connector Line */}
      <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-2 min-h-[2rem]"></div>
    </div>
    <div className="flex-1 pb-8">
      {children}
    </div>
  </div>
);

// --- Main Page Component ---

const HowToJoinPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PhotoProvider maskOpacity={0.8}>
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t('howToJoin.title')}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              {t('howToJoin.subtitle')}
            </p>
          </div>
          
          {/* --- Method 1: Custom Client (Recommended) --- */}
          <section className="bg-card rounded-xl shadow-sm border-card overflow-hidden mb-6 relative">
            {/* Top Badge */}
            <div className="absolute top-0 right-0 bg-osu-pink text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
               {t('howToJoin.method1.recommended')}
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-osu-pink/10 rounded-xl">
                   <FaGamepad className="w-7 h-7 text-osu-pink" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {t('howToJoin.method1.title')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('howToJoin.method1.description')}
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="mt-8">
                
                {/* Step 1 */}
                <StepItem number={1}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('howToJoin.method1.steps.step1.title')}
                  </h3>
                  <div className="flex items-center gap-0">
                    {/* Download button */}
                    <a
                      href="https://github.com/GooGuTeam/osu/releases/latest"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-10 py-4 bg-osu-pink text-white font-bold rounded-xl shadow-lg shadow-osu-pink/20 transition-all duration-200 hover:bg-osu-pink/90 hover:scale-105 hover:shadow-xl hover:shadow-osu-pink/30 active:scale-95"
                    >
                      <FaDownload className="w-5 h-5" />
                      <span>{t('howToJoin.method1.steps.step1.downloadClient')}</span>
                    </a>
                    {/* Character pointing to button */}
                    <div className="hidden sm:block flex-shrink-0 -ml-2">
                      <img 
                        src="/htj/p1.webp" 
                        alt="Character"
                        className="w-32 h-auto object-contain"
                      />
                    </div>
                  </div>
                </StepItem>

                {/* Step 2 */}
                <StepItem number={2}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t('howToJoin.method1.steps.step2.description')}
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    {/* Copy section with character */}
                    <div className="relative mb-4">
                      <div className="max-w-lg">
                        <CodeSnippet 
                          label="Server Address"
                          text="lazer-api.g0v0.top" 
                        />
                      </div>
                      {/* Character pointing to copy button - absolute positioned */}
                      <div className="hidden sm:block absolute top-0 z-10 pointer-events-none mt-[-35px]" style={{ left: 'min(100%, 32rem)', marginLeft: '-5rem' }}>
                        <img 
                          src="/htj/p2.webp" 
                          alt="Character pointing"
                          className="w-36 h-auto object-contain"
                        />
                      </div>
                    </div>
                    {/* Screenshot below */}
                    <div className="w-full max-w-xs">
                       <PhotoView src="/image/join_photos/1.png">
                        <div className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                          <img 
                            src="/image/join_photos/1.png" 
                            alt={t('howToJoin.method1.steps.step2.imageAlt')}
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">View</span>
                          </div>
                        </div>
                      </PhotoView>
                    </div>
                  </div>
                </StepItem>

                {/* Step 3 */}
                <StepItem number={3}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('howToJoin.method1.steps.step3.description')}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Enjoy the game!
                      </p>
                    </div>
                    {/* Character */}
                    <div className="hidden sm:block flex-shrink-0 mt-4">
                      <img 
                        src="/htj/p3.webp" 
                        alt="Character"
                        className="w-40 h-auto object-contain"
                      />
                    </div>
                  </div>
                </StepItem>
              </div>
            </div>
          </section>

          {/* --- Method 2: Authlib Injector --- */}
          <section className="bg-card rounded-xl shadow-sm border-card overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-blue-500/10 rounded-xl">
                   <FaGamepad className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {t('howToJoin.method2.title')}
                  </h2>
                  <div className="flex gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><FaWindows /> Windows</span>
                    <span className="flex items-center gap-1"><FaLinux /> Linux</span>
                    <span className="flex items-center gap-1"><FaApple /> MacOS</span>
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg relative overflow-visible">
                <div className="flex gap-3 items-start">
                  <FaExclamationTriangle className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
                  <div className="flex-1 sm:mr-28">
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">
                      {t('howToJoin.method2.warning.title')}
                    </h4>
                    <p className="text-amber-700 dark:text-amber-500 text-sm mt-1">
                      {t('howToJoin.method2.warning.description')}
                    </p>
                  </div>
                </div>
                {/* Character - absolute positioned to not affect height */}
                <div className="hidden sm:block absolute right-2 bottom-0 pointer-events-none">
                  <img 
                    src="/htj/p6.webp" 
                    alt="Character"
                    className="w-32 h-auto object-contain translate-y-9 translate-x-4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {/* M2 - Step 1 */}
                <StepItem number={1}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                         {t('howToJoin.method2.steps.step1.title')}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Download the latest injector release.
                      </p>
                    </div>
                    <a
                      href="https://github.com/MingxuanGame/LazerAuthlibInjection/releases/latest"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <FaDownload className="mr-2" />
                      {t('howToJoin.method2.steps.step1.download')}
                    </a>
                  </div>
                </StepItem>
                
                {/* M2 - Step 2 */}
                <StepItem number={2}>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                     {t('howToJoin.method2.steps.step2.description')}
                  </h3>
                </StepItem>

                {/* M2 - Step 3 */}
                <StepItem number={3}>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                     {t('howToJoin.method2.steps.step3.description')}
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 grid gap-4">
                     <CodeSnippet 
                        label={t('howToJoin.method2.steps.step3.apiUrl')}
                        text="https://lazer-api.g0v0.top"
                     />
                     <CodeSnippet 
                        label={t('howToJoin.method2.steps.step3.websiteUrl')}
                        text="https://lazer.g0v0.top"
                     />
                  </div>
                </StepItem>

                {/* M2 - Step 4 */}
                <StepItem number={4}>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                     {t('howToJoin.method2.steps.step4.description')}
                  </h3>
                </StepItem>
              </div>
            </div>
          </section>

          {/* Footer Back Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 px-6 py-3 bg-card border-card text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaChevronLeft className="text-osu-pink group-hover:-translate-x-1 transition-transform" />
              {t('common.backToPrevious')}
            </button>
          </div>

        </div>
      </div>
    </PhotoProvider>
  );
};

export default HowToJoinPage;
