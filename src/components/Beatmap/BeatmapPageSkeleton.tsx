import { useTranslation } from 'react-i18next';

type SkeletonBlockProps = {
  className: string;
};

const SkeletonBlock = ({ className }: SkeletonBlockProps) => (
  <div
    aria-hidden="true"
    className={`rounded-lg bg-card-hover motion-safe:animate-pulse ${className}`}
  />
);

const BeatmapPageSkeleton = () => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-background"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{t('beatmap.loading')}</span>

      <div className="px-4 pb-6 pt-0 lg:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="relative min-h-[29rem] overflow-hidden rounded-2xl border border-border-color bg-card shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-card-hover via-card to-background opacity-80 motion-safe:animate-pulse" />
            <div className="relative flex min-h-[29rem] flex-col justify-between gap-6 px-5 py-6 sm:px-6 lg:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <SkeletonBlock className="h-6 w-20 rounded-full" />
                  <SkeletonBlock className="h-6 w-16 rounded-full" />
                </div>
                <SkeletonBlock className="h-12 w-12 shrink-0 rounded-full" />
              </div>

              <div className="grid min-w-0 grid-cols-1 items-end gap-6 xl:grid-cols-[minmax(0,1fr)_30rem]">
                <div className="min-w-0 space-y-3">
                  <SkeletonBlock className="h-12 w-4/5 max-w-2xl" />
                  <SkeletonBlock className="h-6 w-3/5 max-w-lg" />
                  <SkeletonBlock className="h-5 w-2/5 max-w-sm" />
                </div>

                <div className="min-w-0 rounded-2xl border border-border-color bg-card/75 p-4 shadow-xl">
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <SkeletonBlock className="h-16" />
                    <SkeletonBlock className="h-16" />
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {Array.from({ length: 3 }, (_, index) => (
                      <SkeletonBlock key={index} className="h-10" />
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <SkeletonBlock className="h-10" />
                    <SkeletonBlock className="h-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <section className="overflow-hidden rounded-xl border border-border-color bg-card shadow-sm">
              <div className="border-b border-border-color bg-card-hover px-6 py-4">
                <SkeletonBlock className="h-6 w-36" />
              </div>
              <div className="space-y-3 p-4">
                <SkeletonBlock className="h-5 w-24" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }, (_, index) => (
                    <SkeletonBlock key={index} className="h-10 w-20" />
                  ))}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-border-color bg-card shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-border-color px-6 py-4">
                <SkeletonBlock className="h-6 w-44 max-w-[70%]" />
                <SkeletonBlock className="h-7 w-20 shrink-0 rounded-full" />
              </div>
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <SkeletonBlock key={index} className="h-20" />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {Array.from({ length: 4 }, (_, index) => (
                    <SkeletonBlock key={index} className="h-16" />
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-6">
            <section className="overflow-hidden rounded-xl border border-border-color bg-card shadow-sm">
              <div className="bg-osu-pink/20 px-6 py-4">
                <SkeletonBlock className="h-6 w-32" />
              </div>
              <div className="space-y-4 p-6">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="flex items-center justify-between gap-4">
                    <SkeletonBlock className="h-4 w-20" />
                    <SkeletonBlock className="h-4 w-28 max-w-[45%]" />
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-6 min-w-0 overflow-hidden rounded-xl border border-border-color bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border-color px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <SkeletonBlock className="h-6 w-36" />
            <div className="flex gap-3">
              <SkeletonBlock className="h-10 w-28" />
              <SkeletonBlock className="h-10 w-36" />
            </div>
          </div>
          <div className="space-y-3 p-4 sm:p-5">
            <SkeletonBlock className="h-36" />
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBlock key={index} className="h-14" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BeatmapPageSkeleton;
