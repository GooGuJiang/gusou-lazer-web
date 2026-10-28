import React, { useEffect, useState } from 'react';
import {
  FaApple,
  FaCheck,
  FaChevronLeft,
  FaCopy,
  FaDownload,
  FaExclamationTriangle,
  FaGamepad,
  FaLinux,
  FaWindows,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

type ClientPlatform = 'windows' | 'linux' | 'macos' | 'android' | 'ios';
type DesktopPlatform = Extract<ClientPlatform, 'windows' | 'linux' | 'macos'>;
type ClientArchitecture = 'x64' | 'aarch64';
type ReleaseChannel = 'g0v0' | 'robin';

type ClientAssetNames = {
  windows: Record<ClientArchitecture, string>;
  linux: Record<ClientArchitecture, string>;
  macos: Record<ClientArchitecture, string>;
  android: string;
  ios: string;
};

type BrowserUserAgentData = {
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
};

type BrowserNavigator = Navigator & {
  userAgentData?: BrowserUserAgentData;
};

const clientAssetNames: ClientAssetNames = {
  windows: {
    x64: 'g0v0-win-Setup.exe',
    aarch64: 'g0v0-win-arm64-Setup.exe',
  },
  linux: {
    x64: 'g0v0.AppImage',
    aarch64: 'g0v0-arm64.AppImage',
  },
  macos: {
    x64: 'g0v0-osx-x64-Setup.pkg',
    aarch64: 'g0v0-osx-arm64-Setup.pkg',
  },
  android: 'g0v0.apk',
  ios: 'g0v0-ios.ipa',
};

const githubReleasesUrl = 'https://github.com/GooGuTeam/g0v0/releases';
const robinReleaseTag = 'v2026.1012.1-robin';

const getClientAssetName = (platform: ClientPlatform, architecture: ClientArchitecture): string => {
  if (platform === 'android' || platform === 'ios') {
    return clientAssetNames[platform];
  }

  return clientAssetNames[platform][architecture];
};

const getClientDownloadUrl = (assetName: string, channel: ReleaseChannel): string => {
  const releasePath = channel === 'g0v0' ? 'latest/download' : `download/${robinReleaseTag}`;
  return `${githubReleasesUrl}/${releasePath}/${assetName}`;
};

const detectClientPlatform = (browserNavigator: BrowserNavigator): ClientPlatform => {
  const userAgent = browserNavigator.userAgent;

  if (/Android/i.test(userAgent)) {
    return 'android';
  }

  if (
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (browserNavigator.platform === 'MacIntel' && browserNavigator.maxTouchPoints > 1)
  ) {
    return 'ios';
  }

  if (/Windows/i.test(userAgent)) {
    return 'windows';
  }

  if (/Macintosh|Mac OS X/i.test(userAgent)) {
    return 'macos';
  }

  if (/Linux/i.test(userAgent)) {
    return 'linux';
  }

  return 'windows';
};

const detectClientArchitecture = (browserNavigator: BrowserNavigator): ClientArchitecture => {
  const browserInfo = `${browserNavigator.userAgent} ${browserNavigator.platform}`;
  return /arm64|aarch64|armv8|arm\b/i.test(browserInfo) ? 'aarch64' : 'x64';
};

const isDesktopPlatform = (platform: ClientPlatform): platform is DesktopPlatform =>
  platform === 'windows' || platform === 'linux' || platform === 'macos';

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
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-1">
      <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div
        onClick={handleCopy}
        className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all duration-200 active:scale-[0.98] ${
          copied
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-200 bg-gray-100 hover:border-osu-pink hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800'
        }`}
      >
        <code className="select-all truncate pr-12 font-mono text-sm text-gray-800 dark:text-gray-200 sm:text-base">
          {text}
        </code>
        <div
          className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-all duration-200 ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-500 group-hover:bg-osu-pink group-hover:text-white dark:bg-gray-700'
          }`}
        >
          {copied ? <FaCheck className="h-4 w-4" /> : <FaCopy className="h-4 w-4" />}
        </div>
        <span
          className={`pointer-events-none absolute -top-8 right-0 rounded bg-black px-2 py-1 text-xs text-white transition-opacity ${
            copied ? 'bg-green-600 opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {copied ? t('common.copied') : t('howToJoin.clickToCopy')}
        </span>
      </div>
    </div>
  );
};

/**
 * Step Container
 */
const StepItem: React.FC<{ number: number; children: React.ReactNode }> = ({
  number,
  children,
}) => (
  <div className="flex gap-4 sm:gap-6">
    <div className="flex flex-shrink-0 flex-col items-center">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-osu-pink text-lg font-bold text-white sm:h-10 sm:w-10">
        {number}
      </div>
      <div className="my-2 min-h-[2rem] w-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
    </div>
    <div className="flex-1 pb-8">{children}</div>
  </div>
);

const HowToJoinPage: React.FC = () => {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<ClientPlatform>('windows');
  const [architecture, setArchitecture] = useState<ClientArchitecture>('x64');
  const [isUnstable, setIsUnstable] = useState(false);

  useEffect(() => {
    const browserNavigator = navigator as BrowserNavigator;
    setPlatform(detectClientPlatform(browserNavigator));
    setArchitecture(detectClientArchitecture(browserNavigator));

    const userAgentData = browserNavigator.userAgentData;
    if (!userAgentData?.getHighEntropyValues) {
      return;
    }

    void userAgentData
      .getHighEntropyValues(['architecture'])
      .then(({ architecture: browserArchitecture }) => {
        if (browserArchitecture) {
          setArchitecture(/arm/i.test(browserArchitecture) ? 'aarch64' : 'x64');
        }
      })
      .catch(() => undefined);
  }, []);

  const platformOptions: Array<{ value: ClientPlatform; label: string }> = [
    { value: 'windows', label: t('howToJoin.method1.steps.step1.platforms.windows') },
    { value: 'linux', label: t('howToJoin.method1.steps.step1.platforms.linux') },
    { value: 'macos', label: t('howToJoin.method1.steps.step1.platforms.macos') },
    { value: 'android', label: t('howToJoin.method1.steps.step1.platforms.android') },
    { value: 'ios', label: t('howToJoin.method1.steps.step1.platforms.ios') },
  ];
  const architectureOptions: Array<{ value: ClientArchitecture; label: string }> = [
    {
      value: 'x64',
      label:
        platform === 'macos'
          ? t('howToJoin.method1.steps.step1.architectures.intel')
          : t('howToJoin.method1.steps.step1.architectures.x64'),
    },
    {
      value: 'aarch64',
      label:
        platform === 'macos'
          ? t('howToJoin.method1.steps.step1.architectures.appleSilicon')
          : t('howToJoin.method1.steps.step1.architectures.aarch64'),
    },
  ];
  const releaseChannel: ReleaseChannel = isUnstable ? 'robin' : 'g0v0';
  const clientAssetName = getClientAssetName(platform, architecture);
  const clientDownloadUrl = getClientDownloadUrl(clientAssetName, releaseChannel);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {t('howToJoin.title')}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 sm:text-lg">
            {t('howToJoin.subtitle')}
          </p>
        </div>

        <section className="relative mb-6 overflow-hidden rounded-xl border-card bg-card shadow-sm">
          <div className="absolute right-0 top-0 rounded-bl-xl bg-osu-pink px-4 py-1.5 text-xs font-bold text-white">
            {t('howToJoin.method1.recommended')}
          </div>

          <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-xl bg-osu-pink/10 p-3">
                <FaGamepad className="h-7 w-7 text-osu-pink" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  {t('howToJoin.method1.title')}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('howToJoin.method1.description')}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <StepItem number={1}>
                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  {t('howToJoin.method1.steps.step1.title')}
                </h3>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_8rem]">
                  <div className="rounded-xl border border-default bg-card p-4 sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-semibold text-text-primary">
                          {t('howToJoin.method1.steps.step1.platform')}
                        </span>
                        <select
                          value={platform}
                          onChange={(event) => setPlatform(event.target.value as ClientPlatform)}
                          className="mt-2 block w-full rounded-lg border border-default bg-card px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-osu-pink focus:ring-2 focus:ring-osu-pink/20"
                        >
                          {platformOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      {isDesktopPlatform(platform) && (
                        <label className="block">
                          <span className="text-sm font-semibold text-text-primary">
                            {t('howToJoin.method1.steps.step1.architecture')}
                          </span>
                          <select
                            value={architecture}
                            onChange={(event) =>
                              setArchitecture(event.target.value as ClientArchitecture)
                            }
                            className="mt-2 block w-full rounded-lg border border-default bg-card px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-osu-pink focus:ring-2 focus:ring-osu-pink/20"
                          >
                            {architectureOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>

                    <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-default px-3 py-3 transition hover:border-osu-pink/60">
                      <span className="block text-sm font-semibold text-text-primary">
                        {t('howToJoin.method1.steps.step1.useUnstable')}
                      </span>
                      <span className="relative inline-flex flex-shrink-0 items-center">
                        <input
                          type="checkbox"
                          role="switch"
                          checked={isUnstable}
                          onChange={(event) => setIsUnstable(event.target.checked)}
                          className="peer sr-only"
                        />
                        <span className="h-6 w-11 rounded-full bg-gray-300 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-osu-pink peer-checked:after:translate-x-5 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-osu-pink/50 dark:bg-gray-700"></span>
                      </span>
                    </label>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <a
                        href={clientDownloadUrl}
                        download
                        className="inline-flex items-center justify-center gap-3 rounded-xl bg-osu-pink px-8 py-4 font-bold text-white shadow-lg shadow-osu-pink/20 transition-all duration-200 hover:scale-[1.02] hover:bg-osu-pink/90 hover:shadow-xl hover:shadow-osu-pink/30 active:scale-95"
                      >
                        <FaDownload className="h-5 w-5" />
                        <span>{t('howToJoin.method1.steps.step1.downloadClient')}</span>
                      </a>
                    </div>
                  </div>

                  <div className="hidden items-end justify-center lg:flex">
                    <img
                      src="/htj/p1.webp"
                      alt="Character"
                      className="w-32 translate-y-4 object-contain"
                    />
                  </div>
                </div>
              </StepItem>

              <StepItem number={2}>
                <div className="flex items-start">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('howToJoin.method1.steps.step2.title')}
                  </h3>
                  <div className="ml-1 hidden flex-shrink-0 sm:block">
                    <img src="/htj/p3.webp" alt="Character" className="w-32 object-contain" />
                  </div>
                </div>
              </StepItem>
            </div>
          </div>
        </section>

        <section className="mb-6 overflow-hidden rounded-xl border-card bg-card">
          <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-xl bg-blue-500/10 p-3">
                <FaGamepad className="h-7 w-7 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  {t('howToJoin.method2.title')}
                </h2>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <FaWindows /> Windows
                  </span>
                  <span className="flex items-center gap-1">
                    <FaLinux /> Linux
                  </span>
                  <span className="flex items-center gap-1">
                    <FaApple /> MacOS
                  </span>
                </div>
              </div>
            </div>

            <div className="relative mb-8 overflow-visible rounded-r-lg border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/10">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="mt-0.5 flex-shrink-0 text-xl text-amber-500" />
                <div className="flex-1 sm:mr-28">
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">
                    {t('howToJoin.method2.warning.title')}
                  </h4>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
                    {t('howToJoin.method2.warning.description')}
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 right-2 hidden sm:block">
                <img
                  src="/htj/p6.webp"
                  alt="Character"
                  className="w-32 translate-x-4 translate-y-9 object-contain"
                />
              </div>
            </div>

            <div className="space-y-2">
              <StepItem number={1}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t('howToJoin.method2.steps.step1.title')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Download the latest injector release.
                    </p>
                  </div>
                  <a
                    href="https://github.com/MingxuanGame/LazerAuthlibInjection/releases/latest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    <FaDownload className="mr-2" />
                    {t('howToJoin.method2.steps.step1.download')}
                  </a>
                </div>
              </StepItem>

              <StepItem number={2}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('howToJoin.method2.steps.step2.description')}
                </h3>
              </StepItem>

              <StepItem number={3}>
                <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                  {t('howToJoin.method2.steps.step3.description')}
                </h3>
                <div className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                  <CodeSnippet
                    label={t('howToJoin.method2.steps.step3.apiUrl')}
                    text="https://lazer-api.g0v0.top"
                  />
                  <CodeSnippet
                    label={t('howToJoin.method2.steps.step3.websiteUrl')}
                    text="https://osu.g0v0.top"
                  />
                </div>
              </StepItem>

              <StepItem number={4}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('howToJoin.method2.steps.step4.description')}
                </h3>
              </StepItem>
            </div>
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 rounded-lg border-card bg-card px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            <FaChevronLeft className="text-osu-pink transition-transform group-hover:-translate-x-1" />
            {t('common.backToPrevious')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToJoinPage;
