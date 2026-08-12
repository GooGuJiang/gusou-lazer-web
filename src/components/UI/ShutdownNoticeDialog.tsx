import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Languages } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import sadImage from '../../assets/sad.webp';
import type { AppLanguages } from '../../i18n/resources';

const languages: ReadonlyArray<{ code: AppLanguages; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
];

export default function ShutdownNoticeDialog() {
  const { i18n, t } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage ?? i18n.language).split('-')[0];

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const changeLanguage = (language: AppLanguages) => {
    void i18n.changeLanguage(language);
  };

  return (
    <Dialog open onClose={() => undefined} className="relative z-[10000]">
      <DialogBackdrop className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl" />

      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6">
        <DialogPanel className="relative grid h-[calc(100dvh-1.5rem)] w-full max-w-5xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl border border-white/15 bg-card shadow-2xl shadow-black/40 sm:h-[42rem] sm:max-h-[calc(100dvh-3rem)] md:grid-cols-[minmax(0,1fr)_minmax(16rem,38%)]">
          <div className="col-span-full flex flex-wrap items-center justify-between gap-4 px-5 pb-2 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
            <span className="rounded-full border border-osu-pink/30 bg-osu-pink/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-osu-pink">
              {t('shutdownNotice.status')}
            </span>

            <div
              className="flex items-center gap-1 rounded-xl border border-default bg-btn-bg p-1"
              aria-label={t('shutdownNotice.languageLabel')}
              role="group"
            >
              <Languages aria-hidden="true" className="mx-2 h-4 w-4 text-text-secondary" />
              {languages.map((language) => {
                const isActive = currentLanguage === language.code;

                return (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => changeLanguage(language.code)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-osu-pink text-white shadow-sm'
                        : 'text-text-secondary hover:bg-card-hover hover:text-text-primary'
                    }`}
                    aria-pressed={isActive}
                  >
                    {language.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 overflow-y-auto">
            <div className="flex min-h-full flex-col px-5 pb-6 pt-3 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10">
              <DialogTitle className="text-4xl font-bold leading-none tracking-tight text-text-primary sm:text-5xl">
                {t('shutdownNotice.title')}
              </DialogTitle>

              <div className="flex flex-1 items-center py-4">
                <div className="w-full text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                      strong: ({ children }) => (
                        <strong className="block rounded-2xl border border-osu-pink/20 bg-osu-pink/10 px-4 py-3 font-semibold text-text-primary">
                          {children}
                        </strong>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-text-primary underline decoration-dotted underline-offset-4 transition-colors hover:text-primary"
                        >
                          {children}
                        </a>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="my-5 border-l-4 border-osu-pink/60 pl-4 italic text-text-secondary">
                          {children}
                        </blockquote>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-osu-pink underline decoration-osu-pink/50 underline-offset-4 transition-colors hover:text-text-primary"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {t('shutdownNotice.content')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden min-h-0 items-center justify-center overflow-hidden bg-gradient-to-br from-osu-pink/20 via-bg-secondary to-osu-blue/20 p-6 md:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.32),transparent_55%)]" />
            <img
              src={sadImage}
              alt={t('shutdownNotice.imageAlt')}
              className="relative max-h-full w-full select-none object-contain"
              draggable={false}
            />
          </div>

          <img
            src={sadImage}
            alt={t('shutdownNotice.imageAlt')}
            className="pointer-events-none absolute bottom-0 right-0 -z-0 block h-40 select-none object-contain opacity-10 md:hidden"
            draggable={false}
          />
        </DialogPanel>
      </div>
    </Dialog>
  );
}
