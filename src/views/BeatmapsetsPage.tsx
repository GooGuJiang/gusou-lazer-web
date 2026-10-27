import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Grid3X3,
  Heart,
  Loader2,
  Play,
  Search,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { beatmapAPI } from '../utils/api';
import { formatDuration, formatNumber } from '../utils/format';
import { getErrorMessage } from '../utils/typeGuards';
import { getStarDifficultyColor } from '../utils/starRating';
import StarRatingBadge from '../components/UI/StarRatingBadge';
import LazyImage from '../components/UI/LazyImage';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { AudioPlayButton, AudioPlayerControls } from '../components/UI/AudioPlayer';
import {
  getBeatmapsetsSsrMaxAge,
  getBeatmapsetsSsrPayloadFromDocument,
} from '../utils/beatmapsetsSsr';
import { useSsrData } from '../contexts/useSsrData';
import type {
  BeatmapsetSearchCategory,
  BeatmapDownload,
  BeatmapsetSearchExtra,
  BeatmapsetSearchGeneral,
  BeatmapsetSearchLanguage,
  BeatmapsetSearchCursor,
  BeatmapsetSearchQuery,
  BeatmapsetSearchRank,
  BeatmapsetSearchResult,
  BeatmapsetSearchSort,
  BeatmapsetSearchBeatmap,
} from '../types';

type FilterOption<T extends string> = {
  value: T;
  labelKey: string;
};

type ModeOption = {
  value: number | null;
  labelKey: string;
};

type SortField =
  | 'title'
  | 'artist'
  | 'difficulty'
  | 'updated'
  | 'ranked'
  | 'rating'
  | 'plays'
  | 'favourites'
  | 'relevance'
  | 'nominations';

type SortDirection = 'asc' | 'desc';

type SearchState = {
  query: string;
  general: BeatmapsetSearchGeneral[];
  mode: number | null;
  category: BeatmapsetSearchCategory;
  language: BeatmapsetSearchLanguage;
  extra: BeatmapsetSearchExtra[];
  ranks: BeatmapsetSearchRank[];
  played: boolean | null;
  nsfw: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
};

type BeatmapModeGroup = {
  mode: string;
  beatmaps: BeatmapsetSearchBeatmap[];
};

const GENERAL_OPTIONS: FilterOption<BeatmapsetSearchGeneral>[] = [
  { value: 'recommended', labelKey: 'beatmapsets.general.recommended' },
  { value: 'converts', labelKey: 'beatmapsets.general.converts' },
  { value: 'follows', labelKey: 'beatmapsets.general.follows' },
  { value: 'spotlights', labelKey: 'beatmapsets.general.spotlights' },
  { value: 'featured_artists', labelKey: 'beatmapsets.general.featured_artists' },
];

const MODE_OPTIONS: ModeOption[] = [
  { value: null, labelKey: 'beatmapsets.mode.any' },
  { value: 0, labelKey: 'beatmapsets.mode.osu' },
  { value: 1, labelKey: 'beatmapsets.mode.taiko' },
  { value: 2, labelKey: 'beatmapsets.mode.fruits' },
  { value: 3, labelKey: 'beatmapsets.mode.mania' },
];

const CATEGORY_OPTIONS: FilterOption<BeatmapsetSearchCategory>[] = [
  { value: 'any', labelKey: 'beatmapsets.category.any' },
  { value: 'leaderboard', labelKey: 'beatmapsets.category.leaderboard' },
  { value: 'ranked', labelKey: 'beatmapsets.category.ranked' },
  { value: 'qualified', labelKey: 'beatmapsets.category.qualified' },
  { value: 'loved', labelKey: 'beatmapsets.category.loved' },
  { value: 'favourites', labelKey: 'beatmapsets.category.favourites' },
  { value: 'pending', labelKey: 'beatmapsets.category.pending' },
  { value: 'wip', labelKey: 'beatmapsets.category.wip' },
  { value: 'graveyard', labelKey: 'beatmapsets.category.graveyard' },
  { value: 'mine', labelKey: 'beatmapsets.category.mine' },
];

const LANGUAGE_OPTIONS: FilterOption<BeatmapsetSearchLanguage>[] = [
  { value: 'any', labelKey: 'beatmapsets.language.any' },
  { value: 'english', labelKey: 'beatmapsets.language.english' },
  { value: 'japanese', labelKey: 'beatmapsets.language.japanese' },
  { value: 'chinese', labelKey: 'beatmapsets.language.chinese' },
  { value: 'instrumental', labelKey: 'beatmapsets.language.instrumental' },
  { value: 'korean', labelKey: 'beatmapsets.language.korean' },
  { value: 'french', labelKey: 'beatmapsets.language.french' },
  { value: 'german', labelKey: 'beatmapsets.language.german' },
  { value: 'spanish', labelKey: 'beatmapsets.language.spanish' },
  { value: 'italian', labelKey: 'beatmapsets.language.italian' },
  { value: 'russian', labelKey: 'beatmapsets.language.russian' },
  { value: 'polish', labelKey: 'beatmapsets.language.polish' },
  { value: 'other', labelKey: 'beatmapsets.language.other' },
];

const EXTRA_OPTIONS: FilterOption<BeatmapsetSearchExtra>[] = [
  { value: 'video', labelKey: 'beatmapsets.extra.video' },
  { value: 'storyboard', labelKey: 'beatmapsets.extra.storyboard' },
];

const RANK_OPTIONS: FilterOption<BeatmapsetSearchRank>[] = [
  { value: 'XH', labelKey: 'beatmapsets.rank.ssh' },
  { value: 'X', labelKey: 'beatmapsets.rank.ss' },
  { value: 'SH', labelKey: 'beatmapsets.rank.sh' },
  { value: 'S', labelKey: 'beatmapsets.rank.s' },
  { value: 'A', labelKey: 'beatmapsets.rank.a' },
  { value: 'B', labelKey: 'beatmapsets.rank.b' },
  { value: 'C', labelKey: 'beatmapsets.rank.c' },
  { value: 'D', labelKey: 'beatmapsets.rank.d' },
];

const SORT_OPTIONS: FilterOption<SortField>[] = [
  { value: 'title', labelKey: 'beatmapsets.sort.title' },
  { value: 'artist', labelKey: 'beatmapsets.sort.artist' },
  { value: 'difficulty', labelKey: 'beatmapsets.sort.difficulty' },
  { value: 'ranked', labelKey: 'beatmapsets.sort.ranked' },
  { value: 'rating', labelKey: 'beatmapsets.sort.rating' },
  { value: 'plays', labelKey: 'beatmapsets.sort.plays' },
  { value: 'favourites', labelKey: 'beatmapsets.sort.favourites' },
  { value: 'relevance', labelKey: 'beatmapsets.sort.relevance' },
];

const PLAYED_OPTIONS: FilterOption<'any' | 'played' | 'unplayed'>[] = [
  { value: 'any', labelKey: 'beatmapsets.played.any' },
  { value: 'played', labelKey: 'beatmapsets.played.played' },
  { value: 'unplayed', labelKey: 'beatmapsets.played.unplayed' },
];

const DEFAULT_SORT_FIELD: SortField = 'ranked';
const DEFAULT_SORT_DIRECTION: SortDirection = 'desc';
const SEARCH_SORT_FIELD: SortField = 'relevance';
const SEARCH_SORT_DIRECTION: SortDirection = 'desc';
const VIRTUAL_ROW_ESTIMATE = 124;
const VIRTUAL_OVERSCAN = 6;

const DEFAULT_STATE: SearchState = {
  query: '',
  general: [],
  mode: null,
  category: 'leaderboard',
  language: 'any',
  extra: [],
  ranks: [],
  played: null,
  nsfw: false,
  sortField: DEFAULT_SORT_FIELD,
  sortDirection: DEFAULT_SORT_DIRECTION,
};

const MODE_DISPLAY_NAMES: Record<string, string> = {
  osu: 'standard',
  taiko: 'taiko',
  fruits: 'catch',
  mania: 'mania',
  osurx: 'osu!relax',
  osuap: 'osu!autopilot',
  taikorx: 'taiko relax',
  fruitsrx: 'catch relax',
  sentakki: 'sentakki',
  tau: 'tau',
  rush: 'Rush!',
  hishigata: 'hishigata',
  soyokaze: 'soyokaze!',
};

const getArrayParam = <T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: T[]
): T[] => {
  const allowedSet = new Set<string>(allowed);
  return params.getAll(key).filter((value): value is T => allowedSet.has(value));
};

const getSingleParam = <T extends string>(
  params: URLSearchParams,
  key: string,
  fallback: T,
  allowed: T[]
): T => {
  const value = params.get(key);
  return value && allowed.includes(value as T) ? (value as T) : fallback;
};

const getInitialState = (params: URLSearchParams): SearchState => {
  const modeValue = params.get('m');
  const parsedMode = modeValue === null ? Number.NaN : Number(modeValue);
  const sort = params.get('sort') ?? 'ranked_desc';
  const [sortField = DEFAULT_STATE.sortField, sortDirection = DEFAULT_STATE.sortDirection] =
    sort.split('_') as [SortField, SortDirection];
  const played = params.get('played');

  return {
    query: params.get('q') ?? DEFAULT_STATE.query,
    general: getArrayParam(
      params,
      'c',
      GENERAL_OPTIONS.map((option) => option.value)
    ),
    mode: Number.isInteger(parsedMode) && parsedMode >= 0 && parsedMode <= 3 ? parsedMode : null,
    category: getSingleParam(
      params,
      's',
      DEFAULT_STATE.category,
      CATEGORY_OPTIONS.map((option) => option.value)
    ),
    language: getSingleParam(
      params,
      'l',
      DEFAULT_STATE.language,
      LANGUAGE_OPTIONS.map((option) => option.value)
    ),
    extra: getArrayParam(
      params,
      'e',
      EXTRA_OPTIONS.map((option) => option.value)
    ),
    ranks: getArrayParam(
      params,
      'r',
      RANK_OPTIONS.map((option) => option.value)
    ),
    played: played === 'true' ? true : played === 'false' ? false : null,
    nsfw: params.get('nsfw') === 'true',
    sortField: SORT_OPTIONS.some((option) => option.value === sortField)
      ? sortField
      : DEFAULT_STATE.sortField,
    sortDirection: sortDirection === 'asc' ? 'asc' : 'desc',
  };
};

const buildQuery = (
  state: SearchState,
  cursor?: BeatmapsetSearchCursor | null
): BeatmapsetSearchQuery => ({
  q: state.query,
  c: state.general,
  m: state.mode,
  s: state.category,
  l: state.language,
  sort: `${state.sortField}_${state.sortDirection}` as BeatmapsetSearchSort,
  e: state.extra,
  r: state.ranks,
  played: state.played,
  nsfw: state.nsfw,
  cursor,
});

const buildSearchParams = (state: SearchState): URLSearchParams => {
  const params = new URLSearchParams();

  if (state.query.trim()) params.set('q', state.query.trim());
  state.general.forEach((value) => params.append('c', value));
  if (state.mode !== null) params.set('m', state.mode.toString());
  if (state.category !== DEFAULT_STATE.category) params.set('s', state.category);
  if (state.language !== DEFAULT_STATE.language) params.set('l', state.language);
  if (
    state.sortField !== DEFAULT_STATE.sortField ||
    state.sortDirection !== DEFAULT_STATE.sortDirection
  ) {
    params.set('sort', `${state.sortField}_${state.sortDirection}`);
  }
  state.extra.forEach((value) => params.append('e', value));
  state.ranks.forEach((value) => params.append('r', value));
  if (state.played !== null) params.set('played', String(state.played));
  if (state.nsfw) params.set('nsfw', 'true');

  return params;
};

const toggleArrayValue = <T extends string>(values: T[], value: T): T[] =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

const getDifficultyRange = (beatmapset: BeatmapsetSearchResult): string => {
  const ratings = beatmapset.beatmaps.map((beatmap) => beatmap.difficulty_rating);
  if (ratings.length === 0) return '0.00★';

  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  return min === max ? `${min.toFixed(2)}★` : `${min.toFixed(2)}★ - ${max.toFixed(2)}★`;
};

const getBeatmapLength = (beatmapset: BeatmapsetSearchResult): string => {
  const lengths = beatmapset.beatmaps.map((beatmap) => beatmap.total_length);
  if (lengths.length === 0) return '0:00';
  return formatDuration(Math.max(...lengths));
};

const getBeatmapModeGroups = (beatmaps: BeatmapsetSearchBeatmap[]): BeatmapModeGroup[] => {
  const groupMap = new Map<string, BeatmapsetSearchBeatmap[]>();

  beatmaps.forEach((beatmap) => {
    const groupBeatmaps = groupMap.get(beatmap.mode) ?? [];
    groupBeatmaps.push(beatmap);
    groupMap.set(beatmap.mode, groupBeatmaps);
  });

  return Array.from(groupMap.entries())
    .map(([mode, groupBeatmaps]) => ({
      mode,
      beatmaps: groupBeatmaps.sort(
        (first, second) => first.difficulty_rating - second.difficulty_rating
      ),
    }))
    .sort((first, second) => first.beatmaps[0].mode_int - second.beatmaps[0].mode_int);
};

const getBeatmapLink = (beatmap: BeatmapsetSearchBeatmap): string =>
  `/beatmapsets/${beatmap.beatmapset_id}#${beatmap.mode}/${beatmap.id}`;

const getModeDisplayName = (mode: string): string =>
  (MODE_DISPLAY_NAMES[mode.toLowerCase()] ?? mode).toLowerCase();

const getModeClass = (mode: string): string => {
  const normalizedMode = mode.toLowerCase();
  if (normalizedMode === 'taiko' || normalizedMode === 'taikorx') return 'fa-extra-mode-taiko';
  if (normalizedMode === 'fruits' || normalizedMode === 'fruitsrx') return 'fa-extra-mode-fruits';
  if (normalizedMode === 'mania') return 'fa-extra-mode-mania';
  return 'fa-extra-mode-osu';
};

const getStatusColor = (status: string): string => {
  if (status === 'ranked' || status === 'approved') return 'bg-lime-400 text-slate-950';
  if (status === 'qualified') return 'bg-sky-400 text-slate-950';
  if (status === 'loved') return 'bg-pink-400 text-white';
  if (status === 'pending' || status === 'wip') return 'bg-amber-300 text-slate-950';
  return 'bg-slate-500 text-white';
};

const BeatmapsetsPage = () => {
  const { t } = useTranslation();
  const { beatmapsets: serverPayload } = useSsrData();
  const [searchParams, setSearchParams] = useSearchParams();
  const { preferences } = useUserPreferences();
  const currentSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const ssrPayload = useMemo(() => {
    const payload = serverPayload ?? getBeatmapsetsSsrPayloadFromDocument();
    if (!payload) return null;
    if (payload.route.search !== currentSearch) return null;
    if (Date.now() - new Date(payload.fetchedAt).getTime() > getBeatmapsetsSsrMaxAge()) return null;
    return payload;
  }, [currentSearch, serverPayload]);
  const skippedInitialSsrFetchRef = useRef(false);
  const [searchState, setSearchState] = useState<SearchState>(() => getInitialState(searchParams));
  const [inputValue, setInputValue] = useState(searchState.query);
  const [sortManuallyChanged, setSortManuallyChanged] = useState(searchParams.has('sort'));
  const [showMoreFilters, setShowMoreFilters] = useState(
    () =>
      searchState.extra.length > 0 ||
      searchState.language !== DEFAULT_STATE.language ||
      searchState.ranks.length > 0 ||
      searchState.played !== null
  );
  const [beatmapsets, setBeatmapsets] = useState<BeatmapsetSearchResult[]>(
    () => ssrPayload?.response.beatmapsets ?? []
  );
  const [cursor, setCursor] = useState<BeatmapsetSearchCursor | null>(
    () => ssrPayload?.response.cursor ?? null
  );
  const [loading, setLoading] = useState(!ssrPayload);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const listParentRef = useRef<HTMLDivElement | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isAudioPlayerVisible, setIsAudioPlayerVisible] = useState(false);
  const [cardsPerRow, setCardsPerRow] = useState(1);
  const [isVirtualizationEnabled, setIsVirtualizationEnabled] = useState(false);
  const [scrollMargin, setScrollMargin] = useState(0);

  const queryForSearch = useMemo(() => buildQuery(searchState), [searchState]);
  const beatmapsetRows = useMemo(() => {
    const rows: BeatmapsetSearchResult[][] = [];

    for (let index = 0; index < beatmapsets.length; index += cardsPerRow) {
      rows.push(beatmapsets.slice(index, index + cardsPerRow));
    }

    return rows;
  }, [beatmapsets, cardsPerRow]);
  const rowVirtualizer = useWindowVirtualizer({
    count: beatmapsetRows.length,
    estimateSize: () => VIRTUAL_ROW_ESTIMATE,
    getItemKey: (index) => beatmapsetRows[index]?.[0]?.id ?? index,
    overscan: VIRTUAL_OVERSCAN,
    scrollMargin,
    enabled: isVirtualizationEnabled,
  });

  const syncParams = useCallback(
    (nextState: SearchState) => {
      setSearchParams(buildSearchParams(nextState), { replace: true });
    },
    [setSearchParams]
  );

  const updateSearchState = useCallback((updater: (previous: SearchState) => SearchState) => {
    setSearchState(updater);
  }, []);

  const hasSyncedSearchParamsRef = useRef(false);
  useEffect(() => {
    if (!hasSyncedSearchParamsRef.current) {
      hasSyncedSearchParamsRef.current = true;
      return;
    }

    syncParams(searchState);
  }, [searchState, syncParams]);

  const debouncedUpdateSearchQuery = useDebouncedCallback(
    (nextInputValue: string, nextSortManuallyChanged: boolean) => {
      updateSearchState((previous) => {
        if (previous.query === nextInputValue) return previous;

        if (!nextSortManuallyChanged) {
          return {
            ...previous,
            query: nextInputValue,
            sortField: nextInputValue.trim() ? SEARCH_SORT_FIELD : DEFAULT_SORT_FIELD,
            sortDirection: nextInputValue.trim() ? SEARCH_SORT_DIRECTION : DEFAULT_SORT_DIRECTION,
          };
        }

        return { ...previous, query: nextInputValue };
      });
    },
    { wait: 420 }
  );

  useEffect(() => {
    debouncedUpdateSearchQuery(inputValue, sortManuallyChanged);
  }, [debouncedUpdateSearchQuery, inputValue, sortManuallyChanged]);

  useEffect(() => {
    if (ssrPayload && !skippedInitialSsrFetchRef.current) {
      skippedInitialSsrFetchRef.current = true;
      return;
    }

    let ignore = false;

    const fetchBeatmapsets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await beatmapAPI.searchBeatmapsets(queryForSearch);
        if (ignore) return;
        setBeatmapsets(response.beatmapsets);
        setCursor(response.cursor);
      } catch (fetchError: unknown) {
        if (ignore) return;
        const message = getErrorMessage(fetchError) || t('beatmapsets.search.error');
        setError(message);
        setBeatmapsets([]);
        setCursor(null);
        toast.error(message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void fetchBeatmapsets();

    return () => {
      ignore = true;
    };
  }, [queryForSearch, ssrPayload, t]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore || loading || error) return;

    try {
      setLoadingMore(true);
      const response = await beatmapAPI.searchBeatmapsets(buildQuery(searchState, cursor));
      setBeatmapsets((previous) => [...previous, ...response.beatmapsets]);
      setCursor(response.cursor);
    } catch (loadMoreError: unknown) {
      toast.error(getErrorMessage(loadMoreError) || t('beatmapsets.search.error'));
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, error, loading, loadingMore, searchState, t]);

  const handleFavouriteChange = useCallback((beatmapsetId: number, isFavourited: boolean) => {
    setBeatmapsets((previous) =>
      previous.map((beatmapset) =>
        beatmapset.id === beatmapsetId
          ? {
              ...beatmapset,
              has_favourited: isFavourited,
              favourite_count: Math.max(0, beatmapset.favourite_count + (isFavourited ? 1 : -1)),
            }
          : beatmapset
      )
    );
  }, []);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !cursor || loading || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: '360px 0px' }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [cursor, error, loadMore, loading]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 480);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateCardsPerRow = () => setCardsPerRow(mediaQuery.matches ? 2 : 1);

    updateCardsPerRow();
    setIsVirtualizationEnabled(true);
    mediaQuery.addEventListener('change', updateCardsPerRow);

    return () => mediaQuery.removeEventListener('change', updateCardsPerRow);
  }, []);

  useEffect(() => {
    const updateScrollMargin = () => {
      const listParent = listParentRef.current;
      if (!listParent) return;

      setScrollMargin(listParent.getBoundingClientRect().top + window.scrollY);
    };

    updateScrollMargin();
    window.addEventListener('resize', updateScrollMargin);

    const observer = new ResizeObserver(updateScrollMargin);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('resize', updateScrollMargin);
      observer.disconnect();
    };
  }, [beatmapsets.length, error, loading, showMoreFilters]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearchState((previous) => {
      if (!sortManuallyChanged) {
        return {
          ...previous,
          query: inputValue,
          sortField: inputValue.trim() ? SEARCH_SORT_FIELD : DEFAULT_SORT_FIELD,
          sortDirection: inputValue.trim() ? SEARCH_SORT_DIRECTION : DEFAULT_SORT_DIRECTION,
        };
      }

      return { ...previous, query: inputValue };
    });
  };

  const selectedPlayedValue =
    searchState.played === null ? 'any' : searchState.played ? 'played' : 'unplayed';
  const beatmapDownload = preferences.beatmap_download ?? 'all';

  return (
    <div className="relative min-h-screen bg-bg-primary pb-12 text-text-primary">
      <div className="relative mx-auto max-w-7xl px-4 py-3 lg:px-6">
        <section className="overflow-hidden rounded-3xl border border-border-color bg-card backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-border-color bg-navbar px-4 py-2.5 text-text-primary sm:px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-osu-pink/70 bg-osu-pink/10 text-osu-pink">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary sm:text-xl">
                {t('beatmapsets.title')}
              </h1>
              <p className="text-xs text-text-secondary sm:text-sm">{t('beatmapsets.subtitle')}</p>
            </div>
          </div>

          <div className="relative bg-card-hover p-4 text-text-primary sm:p-5">
            <div className="relative space-y-3">
              <form
                onSubmit={handleSubmit}
                className="flex overflow-hidden rounded-xl border border-border-color bg-card transition-colors focus-within:border-osu-pink focus-within:ring-2 focus-within:ring-osu-pink/20"
              >
                <input
                  type="search"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder={t('beatmapsets.search.prompt')}
                  className="min-w-0 flex-1 bg-card px-4 py-2.5 text-base text-text-primary outline-none placeholder:text-text-muted sm:text-lg"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 border-l border-border-color bg-card px-4 text-osu-pink transition-colors hover:bg-card-hover hover:text-osu-pink sm:px-5"
                  aria-label={t('beatmapsets.search.submit')}
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>

              <div className="space-y-2 text-sm">
                <FilterRow label={t('beatmapsets.filters.general')}>
                  {GENERAL_OPTIONS.map((option) => (
                    <FilterPill
                      key={option.value}
                      active={searchState.general.includes(option.value)}
                      onClick={() =>
                        updateSearchState((previous) => ({
                          ...previous,
                          general: toggleArrayValue(previous.general, option.value),
                        }))
                      }
                    >
                      {t(option.labelKey)}
                    </FilterPill>
                  ))}
                </FilterRow>

                <FilterRow label={t('beatmapsets.filters.mode')}>
                  {MODE_OPTIONS.map((option) => (
                    <FilterPill
                      key={option.value ?? 'any'}
                      active={searchState.mode === option.value}
                      onClick={() =>
                        updateSearchState((previous) => ({ ...previous, mode: option.value }))
                      }
                    >
                      {t(option.labelKey)}
                    </FilterPill>
                  ))}
                </FilterRow>

                <FilterRow label={t('beatmapsets.filters.status')}>
                  {CATEGORY_OPTIONS.map((option) => (
                    <FilterPill
                      key={option.value}
                      active={searchState.category === option.value}
                      onClick={() =>
                        updateSearchState((previous) => ({ ...previous, category: option.value }))
                      }
                    >
                      {t(option.labelKey)}
                    </FilterPill>
                  ))}
                </FilterRow>

                <FilterRow label={t('beatmapsets.filters.nsfw')}>
                  <FilterPill
                    active={!searchState.nsfw}
                    onClick={() => updateSearchState((previous) => ({ ...previous, nsfw: false }))}
                  >
                    {t('beatmapsets.nsfw.hide')}
                  </FilterPill>
                  <FilterPill
                    active={searchState.nsfw}
                    onClick={() => updateSearchState((previous) => ({ ...previous, nsfw: true }))}
                  >
                    {t('beatmapsets.nsfw.show')}
                  </FilterPill>
                </FilterRow>

                <AnimatePresence initial={false}>
                  {showMoreFilters && (
                    <motion.div
                      id="more-search-filters"
                      className="overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <div className="space-y-2 pb-2 pt-0.5">
                        <FilterRow label={t('beatmapsets.filters.extra')}>
                          {EXTRA_OPTIONS.map((option) => (
                            <FilterPill
                              key={option.value}
                              active={searchState.extra.includes(option.value)}
                              onClick={() =>
                                updateSearchState((previous) => ({
                                  ...previous,
                                  extra: toggleArrayValue(previous.extra, option.value),
                                }))
                              }
                            >
                              {t(option.labelKey)}
                            </FilterPill>
                          ))}
                        </FilterRow>
                        <FilterRow label={t('beatmapsets.filters.language')}>
                          {LANGUAGE_OPTIONS.map((option) => (
                            <FilterPill
                              key={option.value}
                              active={searchState.language === option.value}
                              onClick={() =>
                                updateSearchState((previous) => ({
                                  ...previous,
                                  language: option.value,
                                }))
                              }
                            >
                              {t(option.labelKey)}
                            </FilterPill>
                          ))}
                        </FilterRow>

                        <FilterRow label={t('beatmapsets.filters.rank')}>
                          {RANK_OPTIONS.map((option) => (
                            <FilterPill
                              key={option.value}
                              active={searchState.ranks.includes(option.value)}
                              onClick={() =>
                                updateSearchState((previous) => ({
                                  ...previous,
                                  ranks: toggleArrayValue(previous.ranks, option.value),
                                }))
                              }
                            >
                              {t(option.labelKey)}
                            </FilterPill>
                          ))}
                        </FilterRow>

                        <FilterRow label={t('beatmapsets.filters.played')}>
                          {PLAYED_OPTIONS.map((option) => (
                            <FilterPill
                              key={option.value}
                              active={selectedPlayedValue === option.value}
                              onClick={() =>
                                updateSearchState((previous) => ({
                                  ...previous,
                                  played:
                                    option.value === 'any'
                                      ? null
                                      : option.value === 'played'
                                        ? true
                                        : false,
                                }))
                              }
                            >
                              {t(option.labelKey)}
                            </FilterPill>
                          ))}
                        </FilterRow>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  type="button"
                  onClick={() => setShowMoreFilters((previous) => !previous)}
                  className="flex w-full flex-col items-center justify-center gap-0.5 py-1 text-xs font-semibold text-osu-pink transition hover:text-osu-pink/80 sm:text-sm"
                  aria-expanded={showMoreFilters}
                  aria-controls="more-search-filters"
                >
                  <span>{t('beatmapsets.filters.more')}</span>
                  <motion.span
                    animate={{ rotate: showMoreFilters ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border-color bg-navbar px-4 py-2.5 text-sm text-text-primary sm:px-5">
            <div className="flex flex-wrap items-center gap-1.5">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortManuallyChanged(true);
                    updateSearchState((previous) => ({
                      ...previous,
                      sortField: option.value,
                      sortDirection:
                        previous.sortField === option.value && previous.sortDirection === 'desc'
                          ? 'asc'
                          : 'desc',
                    }));
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 font-medium transition ${
                    searchState.sortField === option.value
                      ? 'bg-osu-pink text-white shadow-lg shadow-osu-pink/20'
                      : 'bg-btn-bg text-text-secondary hover:bg-btn-bg-hover hover:text-osu-pink'
                  }`}
                >
                  <span>{t(option.labelKey)}</span>
                  {searchState.sortField === option.value && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-osu-pink shadow-sm">
                      {searchState.sortDirection === 'desc' ? (
                        <ArrowDown className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <ArrowUp className="h-4 w-4 stroke-[3]" />
                      )}
                    </span>
                  )}
                </button>
              ))}
              <div className="ml-1 hidden items-center gap-2 text-white/60 sm:flex">
                <Grid3X3 className="h-4 w-4" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 min-w-0">
          {loading ? (
            <div role="status" aria-busy="true" aria-live="polite">
              <span className="sr-only">{t('beatmapsets.search.loading')}</span>
              <div className="grid min-w-0 gap-3 md:grid-cols-2">
                {Array.from({ length: 8 }, (_, index) => (
                  <BeatmapsetCardSkeleton key={index} />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center text-red-200">
              {error}
            </div>
          ) : beatmapsets.length === 0 ? (
            <div className="rounded-2xl border border-border-color bg-card/80 p-10 text-center shadow-xl backdrop-blur">
              <p className="text-xl font-bold">{t('beatmapsets.search.notFound')}</p>
              <p className="mt-2 text-text-secondary">{t('beatmapsets.search.notFoundQuote')}</p>
            </div>
          ) : (
            <div ref={listParentRef} className="min-w-0">
              {isVirtualizationEnabled ? (
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className="grid min-w-0 gap-3 pb-3 md:grid-cols-2"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                      }}
                    >
                      {beatmapsetRows[virtualRow.index]?.map((beatmapset, cardIndex) => (
                        <BeatmapsetCard
                          key={beatmapset.id}
                          beatmapset={beatmapset}
                          beatmapDownload={beatmapDownload}
                          dataIndex={virtualRow.index * cardsPerRow + cardIndex}
                          onFavouriteChange={handleFavouriteChange}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid min-w-0 gap-3 md:grid-cols-2">
                  {beatmapsets.map((beatmapset) => (
                    <BeatmapsetCard
                      key={beatmapset.id}
                      beatmapset={beatmapset}
                      beatmapDownload={beatmapDownload}
                      onFavouriteChange={handleFavouriteChange}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {cursor && !loading && !error && (
            <div ref={loadMoreRef} className="mt-6 flex min-h-12 items-center justify-center">
              {loadingMore && (
                <span className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                  <Loader2 className="h-4 w-4 animate-spin text-osu-pink" />
                  {t('beatmapsets.search.loading')}
                </span>
              )}
            </div>
          )}
        </section>
      </div>

      {showBackToTop && (
        <div
          className={`pointer-events-none fixed right-4 z-40 sm:right-6 ${
            isAudioPlayerVisible ? 'bottom-24' : 'bottom-6'
          }`}
        >
          <button
            type="button"
            onClick={scrollToTop}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border-color bg-navbar text-osu-pink shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-osu-pink/40 hover:bg-osu-pink hover:text-white hover:shadow-osu-pink/25"
            aria-label={t('common.back')}
            title={t('common.back')}
          >
            <ChevronUp className="h-6 w-6" />
          </button>
        </div>
      )}

      <AudioPlayerControls onVisibilityChange={setIsAudioPlayerVisible} />
    </div>
  );
};

const FilterRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid gap-1 sm:grid-cols-[76px_1fr] sm:items-start">
    <div className="pt-0.5 font-semibold text-text-primary">{label}</div>
    <div className="flex flex-wrap gap-x-2 gap-y-0.5">{children}</div>
  </div>
);

const FilterPill = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-md px-2 py-0.5 text-xs font-semibold transition sm:text-sm ${
      active
        ? 'bg-osu-pink text-white shadow-sm shadow-osu-pink/20'
        : 'text-text-secondary hover:bg-btn-bg-hover hover:text-osu-pink'
    }`}
  >
    {children}
  </button>
);

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={`rounded-md bg-card-hover ${className}`} />
);

const BeatmapsetCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-border-color bg-card pr-10 motion-safe:animate-pulse sm:min-h-28 sm:pr-12"
  >
    <div className="flex h-full min-h-24 min-w-0 sm:min-h-28">
      <div className="w-24 flex-none self-stretch bg-card-hover sm:w-28" />

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div className="min-w-0 space-y-1.5">
          <SkeletonBlock className="h-5 w-3/4 sm:h-6" />
          <SkeletonBlock className="h-4 w-1/2" />
          <SkeletonBlock className="h-3 w-2/5" />
        </div>

        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          <SkeletonBlock className="h-5 w-16" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-12" />
          <SkeletonBlock className="h-4 w-10" />
        </div>
      </div>
    </div>

    <div className="absolute bottom-0 right-0 top-0 flex w-10 flex-col items-center justify-center gap-3 border-l border-border-color bg-navbar/90 sm:w-12">
      <SkeletonBlock className="h-7 w-7 rounded-full" />
      <SkeletonBlock className="h-7 w-7 rounded-full" />
    </div>
  </div>
);

const DifficultyDetailsPopover = ({
  modeGroups,
  difficultyRange,
}: {
  modeGroups: BeatmapModeGroup[];
  difficultyRange: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, { move: false, handleClose: safePolygon() });
  const focus = useFocus(context);
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        {...getReferenceProps({
          className:
            'group/difficulties flex min-w-0 max-w-full flex-wrap items-center gap-1 overflow-hidden text-left text-text-primary sm:overflow-visible',
          'aria-label': difficultyRange,
          onClick: (event) => event.stopPropagation(),
        })}
      >
        {modeGroups.map((group) => (
          <span key={group.mode} className="flex items-center gap-1">
            <span
              className={`${getModeClass(group.mode)} text-sm text-text-primary`}
              aria-label={getModeDisplayName(group.mode)}
            />
            {group.beatmaps.length > 8 ? (
              <span className="text-xs font-black text-text-primary">{group.beatmaps.length}</span>
            ) : (
              <span className="flex items-center gap-0.5">
                {group.beatmaps.map((beatmap) => (
                  <span
                    key={beatmap.id}
                    className="h-3 w-1.5 rounded-full"
                    style={{
                      backgroundColor: getStarDifficultyColor(beatmap.difficulty_rating),
                    }}
                    aria-label={`${getModeDisplayName(beatmap.mode)} · ${beatmap.difficulty_rating.toFixed(2)}★ · ${beatmap.version}`}
                  />
                ))}
              </span>
            )}
          </span>
        ))}
      </button>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps({
              className:
                'z-[100] w-[min(18rem,calc(100vw-2rem))] max-h-80 overflow-y-auto rounded-2xl border border-osu-pink/50 bg-card-hover p-2 text-sm font-semibold text-text-primary shadow-2xl shadow-osu-pink/20 backdrop-blur-md',
            })}
          >
            {modeGroups.map((group, groupIndex) => (
              <div
                key={group.mode}
                className={groupIndex > 0 ? 'mt-2 border-t border-border-color/70 pt-2' : ''}
              >
                <div className="mb-1 flex items-center gap-2 px-1 text-xs font-black text-text-primary">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/25 text-white ring-1 ring-white/70">
                    <span
                      className={`${getModeClass(group.mode)} text-sm`}
                      aria-label={getModeDisplayName(group.mode)}
                    />
                  </span>
                  <span>{getModeDisplayName(group.mode)}</span>
                </div>
                {group.beatmaps.map((beatmap) => (
                  <Link
                    key={beatmap.id}
                    to={getBeatmapLink(beatmap)}
                    className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-0.5 text-text-primary transition hover:bg-btn-bg-hover hover:text-osu-pink"
                  >
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-black/25 text-white ring-1 ring-white/70">
                      <span
                        className={`${getModeClass(beatmap.mode)} text-sm`}
                        aria-label={getModeDisplayName(beatmap.mode)}
                      />
                    </span>
                    <StarRatingBadge
                      stars={beatmap.difficulty_rating}
                      className="min-w-[4.75rem] flex-none"
                    />
                    <span className="truncate">{beatmap.version}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

const BeatmapsetCard = ({
  beatmapset,
  beatmapDownload,
  dataIndex,
  onFavouriteChange,
}: {
  beatmapset: BeatmapsetSearchResult;
  beatmapDownload: BeatmapDownload;
  dataIndex?: number;
  onFavouriteChange?: (beatmapsetId: number, isFavourited: boolean) => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const cover = beatmapset.covers.list || beatmapset.covers.card || '/default.jpg';
  const sortedBeatmaps = [...beatmapset.beatmaps].sort(
    (first, second) => first.difficulty_rating - second.difficulty_rating
  );
  const modeGroups = getBeatmapModeGroups(sortedBeatmaps);
  const difficultyRange = getDifficultyRange(beatmapset);
  const title = beatmapset.title_unicode || beatmapset.title;
  const artist = beatmapset.artist_unicode || beatmapset.artist;
  const [isFavourited, setIsFavourited] = useState(beatmapset.has_favourited ?? false);
  const [favouriteCount, setFavouriteCount] = useState(beatmapset.favourite_count);
  const [favouriteLoading, setFavouriteLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleFavourite = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (favouriteLoading) return;

    try {
      setFavouriteLoading(true);
      const nextFavourited = !isFavourited;
      await beatmapAPI.setBeatmapsetFavourite(
        beatmapset.id,
        nextFavourited ? 'favourite' : 'unfavourite'
      );
      setIsFavourited(nextFavourited);
      setFavouriteCount((previous) => Math.max(0, previous + (nextFavourited ? 1 : -1)));
      onFavouriteChange?.(beatmapset.id, nextFavourited);
      toast.success(
        nextFavourited
          ? t('beatmapsets.card.favouriteSuccess')
          : t('beatmapsets.card.unfavouriteSuccess')
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || t('beatmapsets.card.favouriteError'));
    } finally {
      setFavouriteLoading(false);
    }
  };

  const handleDownload = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (downloadLoading) return;

    try {
      setDownloadLoading(true);
      if (beatmapDownload === 'direct') {
        window.location.href = `osu://dl/${beatmapset.id}`;
        return;
      }

      const url = await beatmapAPI.getBeatmapsetDownloadUrl(
        beatmapset.id,
        beatmapDownload === 'no_video'
      );
      window.location.href = url;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || t('beatmapsets.card.downloadError'));
    } finally {
      setDownloadLoading(false);
    }
  };

  const openBeatmapset = () => {
    navigate(`/beatmapsets/${beatmapset.id}`);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openBeatmapset();
  };

  return (
    <div
      role="link"
      tabIndex={0}
      data-index={dataIndex}
      onClick={openBeatmapset}
      onKeyDown={handleCardKeyDown}
      className="group relative z-0 block w-full min-w-0 cursor-pointer rounded-2xl border border-border-color bg-card pr-10 transition hover:z-30 hover:border-osu-pink/50 hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-osu-pink/70 sm:min-h-28 sm:pr-12"
    >
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <LazyImage
          src={cover}
          alt=""
          className="pointer-events-none !absolute inset-0"
          imageClassName="h-full w-full opacity-35 group-hover:opacity-45 dark:opacity-45 dark:group-hover:opacity-55"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, color-mix(in srgb, var(--card-bg) 86%, transparent) 0%, color-mix(in srgb, var(--card-bg) 74%, transparent) 58%, color-mix(in srgb, var(--card-bg) 58%, transparent) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex h-full min-h-24 min-w-0 rounded-2xl sm:min-h-28">
        <div className="group/media relative w-24 flex-none self-stretch overflow-hidden rounded-l-2xl sm:w-28">
          <LazyImage
            src={cover}
            alt=""
            className="!absolute inset-0"
            imageClassName="absolute inset-0 group-hover/media:scale-105"
          />
          {beatmapset.preview_url && (
            <AudioPlayButton
              audioUrl={beatmapset.preview_url}
              size="fill"
              className="absolute inset-0 z-10 !h-full !w-full !rounded-l-2xl !rounded-r-none !bg-black/25 !shadow-none opacity-100 hover:!bg-black/40 focus-visible:opacity-100 sm:opacity-0 sm:group-hover/media:opacity-100"
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-3 text-text-primary">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate text-base font-extrabold leading-tight text-text-primary sm:text-lg">
                  {title}
                </h2>
                <p className="truncate text-sm font-semibold text-text-primary/90">
                  {t('beatmapsets.card.byArtist', { artist })}
                </p>
              </div>
              {beatmapset.spotlight && (
                <span className="rounded-full bg-sky-400/90 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                  {t('beatmapsets.general.spotlights')}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs font-medium text-text-secondary">
              {t('beatmapsets.card.mappedBy', { creator: beatmapset.creator })}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span
              className={`rounded-md px-2 py-0.5 uppercase ${getStatusColor(beatmapset.status)}`}
            >
              {t(`beatmapsets.category.${beatmapset.status}`, { defaultValue: beatmapset.status })}
            </span>
            <DifficultyDetailsPopover modeGroups={modeGroups} difficultyRange={difficultyRange} />
            <span className="flex items-center gap-1 text-text-secondary">
              <Clock className="h-3.5 w-3.5" />
              {getBeatmapLength(beatmapset)}
            </span>
            <span className="flex items-center gap-1 text-text-secondary">
              <Play className="h-3.5 w-3.5" />
              {formatNumber(beatmapset.play_count)}
            </span>
            <span className="flex items-center gap-1 text-text-secondary">
              <Heart className="h-3.5 w-3.5 text-pink-300" />
              {formatNumber(favouriteCount)}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 top-0 z-20 flex w-10 flex-col items-center justify-center gap-2 rounded-r-2xl border-l border-border-color bg-navbar/90 opacity-100 backdrop-blur-sm transition sm:w-12 sm:translate-x-2 sm:gap-3 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={handleFavourite}
          disabled={favouriteLoading}
          className={`rounded-full p-2 transition hover:scale-110 disabled:cursor-wait disabled:opacity-60 ${
            isFavourited ? 'text-osu-pink' : 'text-text-secondary hover:text-osu-pink'
          }`}
          title={isFavourited ? t('beatmapsets.card.unfavourite') : t('beatmapsets.card.favourite')}
          aria-label={
            isFavourited ? t('beatmapsets.card.unfavourite') : t('beatmapsets.card.favourite')
          }
        >
          <Heart className={`h-4 w-4 ${isFavourited ? 'fill-current' : ''}`} />
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloadLoading}
          className="rounded-full p-2 text-text-secondary transition hover:scale-110 hover:bg-osu-pink hover:text-white disabled:cursor-wait disabled:opacity-60"
          title={t('beatmapsets.card.download')}
          aria-label={t('beatmapsets.card.download')}
        >
          {downloadLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default BeatmapsetsPage;
