import { useEffect, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { Trans, useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';

const STORAGE_KEY = 'g0v0.unofficial-project-notice.seen';

export default function UnofficialProjectNotice() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      // The notice still works when browser storage is unavailable.
    }

    const frame = requestAnimationFrame(() => {
      setIsOpen(true);
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // Continue remains available without persistent storage.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-[10000]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <DialogPanel className="w-full max-w-xl rounded-2xl border border-default bg-card p-5 text-text-primary shadow-2xl sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <TriangleAlert className="h-7 w-7 shrink-0 text-amber-500" aria-hidden="true" />
              <DialogTitle className="text-xl font-bold sm:text-2xl">
                {t('unofficialNotice.title')}
              </DialogTitle>
            </div>
            <Description className="text-sm leading-relaxed sm:text-base">
              {t('unofficialNotice.relationship')}
            </Description>
            <div className="mt-4 space-y-4 text-sm leading-relaxed sm:text-base">
              <p>
                <Trans
                  i18nKey="unofficialNotice.support"
                  components={{
                    officialServers: (
                      <a
                        href="https://osu.ppy.sh/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-profile-color underline underline-offset-4"
                      />
                    ),
                    supporter: (
                      <a
                        href="https://osu.ppy.sh/home/support"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-profile-color underline underline-offset-4"
                      />
                    ),
                  }}
                />
              </p>
              <p>{t('unofficialNotice.playOriginal')}</p>
              <p>{t('unofficialNotice.continueDescription')}</p>
              <p className="text-xs text-text-secondary">{t('unofficialNotice.once')}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <a
                href="https://osu.ppy.sh/home/download"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex min-h-11 items-center justify-center px-4 py-2 text-center"
              >
                {t('unofficialNotice.download')}
              </a>
              <button
                type="button"
                autoFocus
                className="btn-primary min-h-11 px-6 py-2"
                onClick={() => setIsOpen(false)}
              >
                {t('unofficialNotice.continue')}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
