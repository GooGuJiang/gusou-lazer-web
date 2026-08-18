import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import '../../index.css';
import { SUPPORTED_LANGUAGES, isSupportedLanguage } from '../../i18n/config';
import { SITE_URL } from '../../utils/seo';

interface LanguageLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8fb' },
    { media: '(prefers-color-scheme: dark)', color: '#18191f' },
  ],
};

export const generateStaticParams = () =>
  SUPPORTED_LANGUAGES.map((language) => ({ lang: language }));

export const generateMetadata = async ({ params }: LanguageLayoutProps): Promise<Metadata> => {
  const { lang } = await params;
  if (!isSupportedLanguage(lang)) return {};

  return {
    metadataBase: SITE_URL,
    applicationName: 'g0v0!',
    authors: [{ name: 'GooGuTeam', url: 'https://github.com/GooGuTeam/g0v0-server' }],
    creator: 'GooGuTeam',
    publisher: 'GooGuTeam',
    category: 'gaming',
    icons: {
      icon: '/lazer.ico',
      shortcut: '/lazer.ico',
    },
    manifest: '/manifest.webmanifest',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
};

const LanguageLayout = async ({ children, params }: LanguageLayoutProps) => {
  const { lang } = await params;
  if (!isSupportedLanguage(lang)) notFound();

  return (
    <html lang={lang === 'zh' ? 'zh-CN' : 'en'} suppressHydrationWarning>
      <body>
        {children}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script','tfqh5w2yov');`}
        </Script>
      </body>
    </html>
  );
};

export default LanguageLayout;
