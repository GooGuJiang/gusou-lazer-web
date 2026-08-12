import { useTranslation, Trans } from 'react-i18next';
import { CloudOff } from 'lucide-react';

const DISCORD_INVITE_URL = 'https://discord.gg/AhzJXXWYfF';

function MaintenanceAnnouncement() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-page p-4">
      <div className="modal-card w-full max-w-2xl p-8 text-center sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-default bg-page">
          <CloudOff className="h-8 w-8 text-text-secondary" aria-hidden="true" />
        </div>
        <span className="inline-block rounded-full bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          {t('common.maintenance.badge')}
        </span>
        <h1 className="mt-5 text-2xl font-bold text-text-primary sm:text-3xl">
          {t('common.maintenance.title')}
        </h1>
        <div className="mt-6 space-y-4 text-left leading-relaxed text-text-secondary">
          <p>{t('common.maintenance.paragraph1')}</p>
          <p>{t('common.maintenance.paragraph2')}</p>
          <p>
            <Trans
              i18nKey="common.maintenance.paragraph3"
              components={{
                discordLink: (
                  <a
                    href={DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-text-primary underline decoration-dotted underline-offset-4 transition-colors hover:text-primary"
                  />
                ),
              }}
            />
          </p>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceAnnouncement;
