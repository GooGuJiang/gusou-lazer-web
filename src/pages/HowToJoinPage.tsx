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
  FaAndroid,
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
        className="group relative flex items-center justify-between bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 cursor-pointer hover:border-osu-pink/50 transition-all duration-200"
      >
        <code className="font-mono text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate pr-8 select-all">
          {text}
        </code>
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {copied ? (
            <FaCheck className="w-4 h-4 text-green-500" />
          ) : (
            <FaCopy className="w-4 h-4 text-gray-400 group-hover:text-osu-pink transition-colors" />
          )}
        </div>
        {/* Tooltip hint */}
        <span className="absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {t('howToJoin.clickToCopy')}
        </span>
      </div>
    </div>
  );
};

/**
 * Styled Download Button Card
 */
const DownloadCard: React.FC<{ 
  href: string; 
  icon: React.ReactNode; 
  title: string; 
  subtitle: string;
  variant?: 'primary' | 'secondary' 
}> = ({ href, icon, title, subtitle, variant = 'primary' }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
      variant === 'primary' 
        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-osu-pink dark:hover:border-osu-pink' 
        : 'bg-gray-50 dark:bg-gray-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    <div className={`p-3 rounded-full ${
      variant === 'primary' 
        ? 'bg-osu-pink/10 text-osu-pink' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
    }`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-gray-900 dark:text-white truncate">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
    </div>
    <FaDownload className="text-gray-300 dark:text-gray-600" />
  </a>
);

/**
 * Step Container
 */
const StepItem: React.FC<{ number: number; children: React.ReactNode }> = ({ number, children }) => (
  <div className="flex gap-4 sm:gap-6">
    <div className="flex-shrink-0 flex flex-col items-center">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-osu-pink to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-osu-pink/20">
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
             <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              {t('howToJoin.title')}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t('howToJoin.subtitle')}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8">
          
          {/* --- Method 1: Custom Client (Recommended) --- */}
          <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-12 relative">
            {/* Top Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-osu-pink to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
               {t('howToJoin.method1.recommended')}
            </div>

            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-osu-pink/10 rounded-2xl">
                   <FaGamepad className="w-8 h-8 text-osu-pink" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {t('howToJoin.method1.title')}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                    <DownloadCard 
                      href="https://github.com/GooGuTeam/osu/releases/latest"
                      icon={<FaWindows className="w-5 h-5" />}
                      title={t('howToJoin.method1.steps.step1.downloadPc')}
                      subtitle={t('howToJoin.method1.steps.step1.pcVersion')}
                    />
                     <DownloadCard 
                      href="https://pan.wo.cn/s/1D1e0H30675"
                      icon={<FaAndroid className="w-5 h-5" />}
                      title={t('howToJoin.method1.steps.step1.downloadAndroidDomestic')}
                      subtitle={t('howToJoin.method1.steps.step1.androidVersion')}
                    />
                  </div>
                  <div className="mt-3">
                     <a href="#" className="text-sm text-gray-500 hover:text-osu-pink transition-colors underline decoration-dotted">
                        {t('howToJoin.method1.steps.step1.downloadAndroidOverseas')}
                     </a>
                  </div>
                </StepItem>

                {/* Step 2 */}
                <StepItem number={2}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t('howToJoin.method1.steps.step2.description')}
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="flex-1 w-full">
                        <CodeSnippet 
                          label="Server Address"
                          text="lazer-api.g0v0.top" 
                        />
                        <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                          {t('howToJoin.method1.steps.step2.imageHint')}
                        </p>
                      </div>
                      <div className="w-full md:w-64 flex-shrink-0">
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
                  </div>
                </StepItem>

                {/* Step 3 */}
                <StepItem number={3}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('howToJoin.method1.steps.step3.description')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Enjoy the game!
                  </p>
                </StepItem>
              </div>
            </div>
          </section>

          {/* --- Method 2: Authlib Injector --- */}
          <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-osu-blue/10 rounded-2xl">
                   <FaGamepad className="w-8 h-8 text-osu-blue" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
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
              <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <div className="flex gap-3">
                  <FaExclamationTriangle className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">
                      {t('howToJoin.method2.warning.title')}
                    </h4>
                    <p className="text-amber-700 dark:text-amber-500 text-sm mt-1">
                      {t('howToJoin.method2.warning.description')}
                    </p>
                  </div>
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
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 grid gap-4">
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
          <div className="flex justify-center mt-16 mb-8">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold rounded-full shadow-lg shadow-gray-200/50 dark:shadow-black/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
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
