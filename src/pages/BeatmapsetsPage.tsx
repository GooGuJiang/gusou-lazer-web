import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowDown,
  ArrowUp,
  ChevronUp,
  Clock,
  Download,
  Filter,
  Grid3X3,
  Heart,
  Loader2,
  Play,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { beatmapAPI } from '../utils/api';
import { formatDuration, formatNumber } from '../utils/format';
import { getErrorMessage } from '../utils/typeGuards';
import { useUserPreferences } from '../hooks/useUserPreferences';
import {
  getBeatmapsetsSsrMaxAge,
  getBeatmapsetsSsrPayloadFromDocument,
} from '../utils/beatmapsetsSsr';
import type {
  BeatmapsetSearchCategory,
  BeatmapDownload,
  BeatmapsetSearchExtra,
  BeatmapsetSearchGeneral,
  BeatmapsetSearchLanguage,
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

type DifficultySpectrumStop = readonly [number, string];

const MODE_DISPLAY_NAMES: Record<string, string> = {
  osu: 'osu!',
  taiko: 'osu!taiko',
  fruits: 'osu!catch',
  mania: 'osu!mania',
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

const STAR_DIFFICULTY_DEFINED_COLOUR_CUTOFF = 6.5;
const STAR_DIFFICULTY_TEXT_GRADIENT_CUTOFF = 9.0;

const STAR_DIFFICULTY_SPECTRUM: DifficultySpectrumStop[] = [
  [0.1, '#4290fb'],
  [1.25, '#4fc0ff'],
  [2.0, '#4fffd5'],
  [2.5, '#7cff4f'],
  [3.3, '#f6f05c'],
  [4.2, '#ff8068'],
  [4.9, '#ff4e6f'],
  [5.8, '#c645b8'],
  [6.7, '#6563de'],
  [7.7, '#18158e'],
  [9.0, '#000000'],
  [10.0, '#000000'],
];

const STAR_DIFFICULTY_TEXT_SPECTRUM: DifficultySpectrumStop[] = [
  [9.0, '#f6f05c'],
  [9.9, '#ff8068'],
  [10.6, '#ff4e6f'],
  [11.5, '#c645b8'],
  [12.4, '#6563de'],
];

const getArrayParam = <T extends string>(params: URLSearchParams, key: string, allowed: T[]): T[] => {
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
  const [sortField = DEFAULT_STATE.sortField, sortDirection = DEFAULT_STATE.sortDirection] = sort.split(
    '_'
  ) as [SortField, SortDirection];
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

const buildQuery = (state: SearchState, cursorString?: string | null): BeatmapsetSearchQuery => ({
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
  cursor_string: cursorString,
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

const hexToRgb = (hex: string): { r: number; g: number; b: number } => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }): string =>
  `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;

const sampleSpectrum = (spectrum: DifficultySpectrumStop[], value: number): string => {
  const roundedValue = Math.round(value * 100) / 100;
  const firstStop = spectrum[0];
  const lastStop = spectrum[spectrum.length - 1];

  if (!firstStop || !lastStop) return '#ffffff';
  if (roundedValue <= firstStop[0]) return firstStop[1];
  if (roundedValue >= lastStop[0]) return lastStop[1];

  for (let index = 1; index < spectrum.length; index += 1) {
    const previous = spectrum[index - 1];
    const current = spectrum[index];
    if (!previous || !current || roundedValue > current[0]) continue;

    const progress = (roundedValue - previous[0]) / (current[0] - previous[0]);
    const from = hexToRgb(previous[1]);
    const to = hexToRgb(current[1]);

    return rgbToHex({
      r: from.r + (to.r - from.r) * progress,
      g: from.g + (to.g - from.g) * progress,
      b: from.b + (to.b - from.b) * progress,
    });
  }

  return lastStop[1];
};

const getStarDifficultyColor = (stars: number): string =>
  sampleSpectrum(STAR_DIFFICULTY_SPECTRUM, stars);

const getStarDifficultyTextColor = (stars: number): string => {
  if (stars < STAR_DIFFICULTY_DEFINED_COLOUR_CUTOFF) return 'rgba(0, 0, 0, 0.75)';
  if (stars < STAR_DIFFICULTY_TEXT_GRADIENT_CUTOFF) return '#ff8068';
  return sampleSpectrum(STAR_DIFFICULTY_TEXT_SPECTRUM, stars);
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { preferences } = useUserPreferences();
  const currentSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const ssrPayload = useMemo(() => {
    const payload = getBeatmapsetsSsrPayloadFromDocument();
    if (!payload) return null;
    if (payload.route.search !== currentSearch) return null;
    if (Date.now() - new Date(payload.fetchedAt).getTime() > getBeatmapsetsSsrMaxAge()) return null;
    return payload;
  }, [currentSearch]);
  const skippedInitialSsrFetchRef = useRef(false);
  const [searchState, setSearchState] = useState<SearchState>(() => getInitialState(searchParams));
  const [inputValue, setInputValue] = useState(searchState.query);
  const [sortManuallyChanged, setSortManuallyChanged] = useState(searchParams.has('sort'));
  const [beatmapsets, setBeatmapsets] = useState<BeatmapsetSearchResult[]>(
    () => ssrPayload?.response.beatmapsets ?? []
  );
  const [total, setTotal] = useState(() => ssrPayload?.response.total ?? 0);
  const [cursorString, setCursorString] = useState<string | null>(
    () => ssrPayload?.response.cursor_string ?? null
  );
  const [loading, setLoading] = useState(!ssrPayload);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const queryForSearch = useMemo(() => buildQuery(searchState), [searchState]);

  const syncParams = useCallback(
    (nextState: SearchState) => {
      setSearchParams(buildSearchParams(nextState), { replace: true });
    },
    [setSearchParams]
  );

  const updateSearchState = useCallback(
    (updater: (previous: SearchState) => SearchState) => {
      setSearchState((previous) => {
        const nextState = updater(previous);
        if (nextState === previous) return previous;

        syncParams(nextState);
        return nextState;
      });
    },
    [syncParams]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      updateSearchState((previous) => {
        if (previous.query === inputValue) return previous;

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
    }, 420);

    return () => window.clearTimeout(timeout);
  }, [inputValue, sortManuallyChanged, updateSearchState]);

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
        setTotal(response.total);
        setCursorString(response.cursor_string);
      } catch (fetchError: unknown) {
        if (ignore) return;
        const message = getErrorMessage(fetchError) || t('beatmapsets.search.error');
        setError(message);
        setBeatmapsets([]);
        setTotal(0);
        setCursorString(null);
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
    if (!cursorString || loadingMore || loading || error) return;

    try {
      setLoadingMore(true);
      const response = await beatmapAPI.searchBeatmapsets(buildQuery(searchState, cursorString));
      setBeatmapsets((previous) => [...previous, ...response.beatmapsets]);
      setCursorString(response.cursor_string);
    } catch (loadMoreError: unknown) {
      toast.error(getErrorMessage(loadMoreError) || t('beatmapsets.search.error'));
    } finally {
      setLoadingMore(false);
    }
  }, [cursorString, error, loading, loadingMore, searchState, t]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !cursorString || loading || error) return;

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
  }, [cursorString, error, loadMore, loading]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 480);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className="relative mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <section className="overflow-hidden rounded-3xl border border-border-color bg-card shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-border-color bg-navbar px-5 py-4 text-text-primary sm:px-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-osu-pink/70 bg-osu-pink/10 text-osu-pink">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary sm:text-2xl">{t('beatmapsets.title')}</h1>
              <p className="text-xs text-text-secondary sm:text-sm">{t('beatmapsets.subtitle')}</p>
            </div>
          </div>

          <div className="relative bg-card-hover p-5 text-text-primary sm:p-7">
            <div className="relative space-y-5">
              <form onSubmit={handleSubmit} className="flex overflow-hidden rounded-xl border border-border-color bg-btn-bg shadow-inner backdrop-blur">
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder={t('beatmapsets.search.prompt')}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base text-text-primary outline-none placeholder:text-text-muted sm:text-lg"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-btn-bg-hover px-4 text-osu-pink transition hover:bg-osu-pink hover:text-white sm:px-5"
                  aria-label={t('beatmapsets.search.submit')}
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>

              <div className="space-y-3 text-sm">
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
                  <FilterPill
                    active={searchState.nsfw}
                    onClick={() =>
                      updateSearchState((previous) => ({ ...previous, nsfw: !previous.nsfw }))
                    }
                  >
                    {t('beatmapsets.extra.nsfw')}
                  </FilterPill>
                </FilterRow>

                <FilterRow label={t('beatmapsets.filters.language')}>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <FilterPill
                      key={option.value}
                      active={searchState.language === option.value}
                      onClick={() =>
                        updateSearchState((previous) => ({ ...previous, language: option.value }))
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
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border-color bg-navbar px-4 py-3 text-sm text-text-primary sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-2 text-text-secondary">
              <Filter className="h-4 w-4" />
              <span>{t('beatmapsets.sort.label')}</span>
              <span className="text-text-muted">·</span>
              <span>{t('beatmapsets.search.total', { count: total })}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium transition ${
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

        <section className="mt-5">
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-2xl border border-border-color bg-card/70"
                />
              ))}
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
            <div className="grid gap-3 md:grid-cols-2">
              {beatmapsets.map((beatmapset) => (
                <BeatmapsetCard
                  key={beatmapset.id}
                  beatmapset={beatmapset}
                  beatmapDownload={beatmapDownload}
                />
              ))}
            </div>
          )}

          {cursorString && !loading && !error && (
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
        <div className="fixed inset-x-0 bottom-6 z-40 pointer-events-none">
          <div className="mx-auto flex max-w-7xl justify-end px-4 lg:px-6">
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
        </div>
      )}
    </div>
  );
};

const FilterRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid gap-2 sm:grid-cols-[76px_1fr] sm:items-start">
    <div className="pt-1 font-semibold text-text-primary">{label}</div>
    <div className="flex flex-wrap gap-x-2 gap-y-1.5">{children}</div>
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
    className={`rounded-md px-2 py-1 text-xs font-semibold transition sm:text-sm ${
      active
        ? 'bg-osu-pink text-white shadow-sm shadow-osu-pink/20'
        : 'text-text-secondary hover:bg-btn-bg-hover hover:text-osu-pink'
    }`}
  >
    {children}
  </button>
);

const BeatmapsetCard = ({
  beatmapset,
  beatmapDownload,
}: {
  beatmapset: BeatmapsetSearchResult;
  beatmapDownload: BeatmapDownload;
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
      onClick={openBeatmapset}
      onKeyDown={handleCardKeyDown}
      className="group relative z-0 block min-h-28 cursor-pointer rounded-2xl border border-border-color bg-card pr-12 shadow-lg transition hover:z-30 hover:-translate-y-0.5 hover:border-osu-pink/50 hover:bg-card-hover hover:shadow-xl hover:shadow-osu-pink/10 focus:outline-none focus:ring-2 focus:ring-osu-pink/70"
    >
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 transition duration-300 group-hover:opacity-45 dark:opacity-45 dark:group-hover:opacity-55"
          style={{ backgroundImage: `url(${cover})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, color-mix(in srgb, var(--card-bg) 86%, transparent) 0%, color-mix(in srgb, var(--card-bg) 74%, transparent) 58%, color-mix(in srgb, var(--card-bg) 58%, transparent) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex h-full min-h-28 rounded-2xl">
        <img src={cover} alt="" className="h-28 w-28 flex-none rounded-l-2xl object-cover" loading="lazy" />
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
            <span className={`rounded-md px-2 py-0.5 uppercase ${getStatusColor(beatmapset.status)}`}>
              {t(`beatmapsets.category.${beatmapset.status}`, { defaultValue: beatmapset.status })}
            </span>
            <div className="group/difficulties relative flex min-w-0 items-center gap-1 text-text-primary" aria-label={difficultyRange}>
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
                          style={{ backgroundColor: getStarDifficultyColor(beatmap.difficulty_rating) }}
                          aria-label={`${getModeDisplayName(beatmap.mode)} · ${beatmap.difficulty_rating.toFixed(2)}★ · ${beatmap.version}`}
                        />
                      ))}
                    </span>
                  )}
                </span>
              ))}

              <div className="invisible pointer-events-none absolute left-0 top-full z-30 w-[min(30rem,calc(100vw-2rem))] origin-top-left translate-y-1 scale-[0.98] pt-1 opacity-0 transition-[opacity,transform,visibility] duration-100 ease-out group-hover/difficulties:visible group-hover/difficulties:pointer-events-auto group-hover/difficulties:translate-y-0 group-hover/difficulties:scale-100 group-hover/difficulties:opacity-100">
                <div
                  className="max-h-80 overflow-y-auto rounded-2xl border border-osu-pink/50 bg-card-hover p-2 text-sm font-semibold text-text-primary shadow-2xl shadow-osu-pink/20 backdrop-blur-md"
                  onClick={(event) => event.stopPropagation()}
                >
                  {modeGroups.map((group, groupIndex) => (
                    <div key={group.mode} className={groupIndex > 0 ? 'mt-2 border-t border-border-color/70 pt-2' : ''}>
                      <div className="mb-1 flex items-center gap-2 px-1 text-xs font-black text-text-primary">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/25 text-white ring-1 ring-white/70">
                          <span className={`${getModeClass(group.mode)} text-sm`} aria-label={getModeDisplayName(group.mode)} />
                        </span>
                        <span>{getModeDisplayName(group.mode)}</span>
                      </div>
                      {group.beatmaps.map((beatmap) => (
                        <Link
                          key={beatmap.id}
                          to={getBeatmapLink(beatmap)}
                          className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-0.5 text-text-primary transition hover:bg-btn-bg-hover hover:text-osu-pink"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-black/25 text-white ring-1 ring-white/70">
                            <span
                              className={`${getModeClass(beatmap.mode)} text-sm`}
                              aria-label={getModeDisplayName(beatmap.mode)}
                            />
                          </span>
                          <span
                            className="inline-flex min-w-[4.75rem] flex-none items-center justify-center gap-1 rounded-full px-2 py-0.5 text-xs font-black shadow-sm"
                            style={{
                              backgroundColor: getStarDifficultyColor(beatmap.difficulty_rating),
                              color: getStarDifficultyTextColor(beatmap.difficulty_rating),
                            }}
                          >
                            <Star className="h-3 w-3 fill-current" />
                            {beatmap.difficulty_rating.toFixed(2)}
                          </span>
                          <span className="truncate">{beatmap.version}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

      <div className="absolute bottom-0 right-0 top-0 z-20 flex w-12 translate-x-2 flex-col items-center justify-center gap-3 rounded-r-2xl border-l border-border-color bg-navbar/90 opacity-0 backdrop-blur-sm transition group-hover:translate-x-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={handleFavourite}
          disabled={favouriteLoading}
          className={`rounded-full p-2 transition hover:scale-110 disabled:cursor-wait disabled:opacity-60 ${
            isFavourited ? 'text-osu-pink' : 'text-text-secondary hover:text-osu-pink'
          }`}
          title={isFavourited ? t('beatmapsets.card.unfavourite') : t('beatmapsets.card.favourite')}
          aria-label={isFavourited ? t('beatmapsets.card.unfavourite') : t('beatmapsets.card.favourite')}
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
          {downloadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </button>
      </div>

    </div>
  );
};

export default BeatmapsetsPage;
