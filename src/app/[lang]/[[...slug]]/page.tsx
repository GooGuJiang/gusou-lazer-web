import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import NextApplication from '../../../components/NextApplication';
import StructuredData from '../../../components/StructuredData';
import { isSupportedLanguage } from '../../../i18n/config';
import type { AppLanguages } from '../../../i18n/resources';
import { fetchBeatmapsetsSsrPayload } from '../../../utils/beatmapsetsSsrServer';
import { fetchUserPageSsrPayload } from '../../../utils/userPageSsr';
import {
  createPageMetadata,
  createStructuredData,
  isKnownApplicationPath,
} from '../../../utils/seo';
import { fetchBeatmapsetSeoData } from '../../../utils/seoData';

type SearchParams = Record<string, string | string[] | undefined>;

interface ApplicationPageProps {
  params: Promise<{ lang: string; slug?: string[] }>;
  searchParams: Promise<SearchParams>;
}

const getUserPageData = cache(fetchUserPageSsrPayload);
const getBeatmapsetsData = cache(fetchBeatmapsetsSsrPayload);
const getBeatmapsetData = cache(fetchBeatmapsetSeoData);

const getPathname = (slug?: string[]): string =>
  slug?.length ? `/${slug.map(encodeURIComponent).join('/')}` : '/';

const getSearch = (searchParams: SearchParams): string => {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  });

  const search = params.toString();
  return search ? `?${search}` : '';
};

const resolveSeoData = async (pathname: string, search: string) => {
  const [userPayload, beatmapset] = await Promise.all([
    getUserPageData(`${pathname}${search}`),
    getBeatmapsetData(pathname),
  ]);

  return {
    user: userPayload && 'user' in userPayload ? userPayload.user : undefined,
    beatmapset: beatmapset ?? undefined,
  };
};

export const generateMetadata = async ({
  params,
  searchParams,
}: ApplicationPageProps): Promise<Metadata> => {
  const [{ lang, slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  if (!isSupportedLanguage(lang)) return {};

  const pathname = getPathname(slug);
  const search = getSearch(resolvedSearchParams);
  const seoData = await resolveSeoData(pathname, search);
  return createPageMetadata(lang, pathname, seoData);
};

const ApplicationPage = async ({ params, searchParams }: ApplicationPageProps) => {
  const [{ lang, slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  if (!isSupportedLanguage(lang)) notFound();

  const language: AppLanguages = lang;
  const pathname = getPathname(slug);
  if (pathname === '/beatmaps') redirect(`/${language}/beatmapsets`);
  if (!isKnownApplicationPath(pathname)) notFound();

  const search = getSearch(resolvedSearchParams);
  const internalUrl = `${pathname}${search}`;
  const [userPayload, beatmapsetsPayload, seoData] = await Promise.all([
    getUserPageData(internalUrl),
    getBeatmapsetsData(internalUrl),
    resolveSeoData(pathname, search),
  ]);
  const userPage = userPayload && 'user' in userPayload ? userPayload : null;
  const beatmapsets =
    beatmapsetsPayload && 'response' in beatmapsetsPayload ? beatmapsetsPayload : null;

  return (
    <>
      <StructuredData data={createStructuredData(language, pathname, seoData)} />
      <NextApplication
        language={language}
        location={`/${language}${internalUrl === '/' ? '' : internalUrl}`}
        userPage={userPage}
        beatmapsets={beatmapsets}
      />
    </>
  );
};

export default ApplicationPage;
