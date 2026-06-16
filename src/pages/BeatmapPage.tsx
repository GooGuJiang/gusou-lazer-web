import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import toast from 'react-hot-toast';
import { Download, ExternalLink, Eye, Heart, Loader2, Star, Play } from 'lucide-react';
import { FaEllipsisV, FaDownload } from 'react-icons/fa';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
} from '@floating-ui/react';
import { beatmapAPI, scoreAPI, handleApiError } from '../utils/api';
import type {
  Beatmapset,
  Beatmap,
  GameMode,
  BeatmapScore,
  BeatmapScoresResponse,
  BeatmapLeaderboardType,
} from '../types';
import { formatDuration, formatNumber } from '../utils/format';
import { AudioPlayButton, AudioPlayerControls } from '../components/UI/AudioPlayer';
import GameModeSelector from '../components/UI/GameModeSelector';
import CustomSelect from '../components/UI/CustomSelect';
import LazyAvatar from '../components/UI/LazyAvatar';
import LazyFlag from '../components/UI/LazyFlag';
import RankBadge from '../components/UI/RankBadge';
import ModsDisplay from '../components/UI/ModsDisplay';
import { getErrorMessage } from '../utils/typeGuards';

// ── 难度颜色光谱（与 BeatmapsetsPage 一致） ──────────────────────────────────

type DifficultySpectrumStop = readonly [number, string];

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

// ── 状态颜色 ─────────────────────────────────────────────────────────────────

const getStatusColor = (status: string): string => {
  if (status === 'ranked' || status === 'approved') return 'bg-lime-400 text-slate-950';
  if (status === 'qualified') return 'bg-sky-400 text-slate-950';
  if (status === 'loved') return 'bg-pink-400 text-white';
  if (status === 'pending' || status === 'wip') return 'bg-amber-300 text-slate-950';
  return 'bg-slate-500 text-white';
};

// ── 模式图标 ─────────────────────────────────────────────────────────────────

const getModeClass = (mode: string): string => {
  const normalizedMode = mode.toLowerCase();
  if (normalizedMode === 'taiko' || normalizedMode === 'taikorx') return 'fa-extra-mode-taiko';
  if (normalizedMode === 'fruits' || normalizedMode === 'fruitsrx') return 'fa-extra-mode-fruits';
  if (normalizedMode === 'mania') return 'fa-extra-mode-mania';
  return 'fa-extra-mode-osu';
};

// ── 评级图标 ─────────────────────────────────────────────────────────────────

const getRankIcon = (rank: string) => {
  const rankImageMap: Record<string, string> = {
    XH: '/image/grades/SS-Silver.svg',
    X: '/image/grades/SS.svg',
    SH: '/image/grades/S-Silver.svg',
    S: '/image/grades/S.svg',
    A: '/image/grades/A.svg',
    B: '/image/grades/B.svg',
    C: '/image/grades/C.svg',
    D: '/image/grades/D.svg',
    F: '/image/grades/F.svg',
  };
  return rankImageMap[rank] || rankImageMap['F'];
};

// ── 时间格式化 ───────────────────────────────────────────────────────────────

const formatTimeAgo = (dateString: string, t: TFunction): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return t('profile.activities.timeAgo.justNow');
  if (diffInSeconds < 3600)
    return t('profile.activities.timeAgo.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
  if (diffInSeconds < 86400)
    return t('profile.activities.timeAgo.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
  if (diffInSeconds < 2592000)
    return t('profile.activities.timeAgo.daysAgo', { count: Math.floor(diffInSeconds / 86400) });
  if (diffInSeconds < 31536000)
    return t('profile.activities.timeAgo.monthsAgo', {
      count: Math.floor(diffInSeconds / 2592000),
    });
  return t('profile.activities.timeAgo.yearsAgo', { count: Math.floor(diffInSeconds / 31536000) });
};

// ── BPM 格式化 ───────────────────────────────────────────────────────────────

const formatBPM = (bpm: number): string => {
  return Number.isInteger(bpm) ? bpm.toString() : bpm.toFixed(1);
};

// ── 排行榜类型选项 ───────────────────────────────────────────────────────────

type LeaderboardScope = {
  key: BeatmapLeaderboardType;
  labelKey: string;
  requireAuth?: boolean;
};

const LEADERBOARD_SCOPES: LeaderboardScope[] = [
  { key: 'global', labelKey: 'beatmap.scoreboard.global' },
  { key: 'country', labelKey: 'beatmap.scoreboard.country', requireAuth: true },
  { key: 'friend', labelKey: 'beatmap.scoreboard.friend', requireAuth: true },
  { key: 'team', labelKey: 'beatmap.scoreboard.team', requireAuth: true },
];

type ObjectCountItem = {
  key: string;
  value: number;
  labelKey: string;
};

const getReadableModeName = (mode: string, t: TFunction): string => {
  const normalizedMode = mode.toLowerCase();

  if (normalizedMode === 'osu') return t('beatmapsets.mode.osu');
  if (normalizedMode === 'osurx') return `${t('beatmapsets.mode.osu')} Relax`;
  if (normalizedMode === 'osuap') return `${t('beatmapsets.mode.osu')} Autopilot`;
  if (normalizedMode === 'taiko') return t('beatmapsets.mode.taiko');
  if (normalizedMode === 'taikorx') return `${t('beatmapsets.mode.taiko')} Relax`;
  if (normalizedMode === 'fruits') return t('beatmapsets.mode.fruits');
  if (normalizedMode === 'fruitsrx') return `${t('beatmapsets.mode.fruits')} Relax`;
  if (normalizedMode === 'mania') return t('beatmapsets.mode.mania');

  return mode;
};

const GENRE_TRANSLATION_KEYS: Record<number, string> = {
  1: 'beatmap.genre.unspecified',
  2: 'beatmap.genre.videoGame',
  3: 'beatmap.genre.anime',
  4: 'beatmap.genre.rock',
  5: 'beatmap.genre.pop',
  6: 'beatmap.genre.other',
  7: 'beatmap.genre.novelty',
  9: 'beatmap.genre.hipHop',
  10: 'beatmap.genre.electronic',
  11: 'beatmap.genre.metal',
  12: 'beatmap.genre.classical',
  13: 'beatmap.genre.folk',
  14: 'beatmap.genre.jazz',
};

const LANGUAGE_TRANSLATION_KEYS: Record<number, string> = {
  1: 'beatmapsets.language.unspecified',
  2: 'beatmapsets.language.english',
  3: 'beatmapsets.language.japanese',
  4: 'beatmapsets.language.chinese',
  5: 'beatmapsets.language.instrumental',
  6: 'beatmapsets.language.korean',
  7: 'beatmapsets.language.french',
  8: 'beatmapsets.language.german',
  9: 'beatmapsets.language.swedish',
  10: 'beatmapsets.language.spanish',
  11: 'beatmapsets.language.italian',
  12: 'beatmapsets.language.russian',
  13: 'beatmapsets.language.polish',
  14: 'beatmapsets.language.other',
};

const getTranslatedMetadataName = (
  id: number,
  fallback: string,
  translationKeys: Record<number, string>,
  t: TFunction
): string => {
  const translationKey = translationKeys[id];
  return translationKey ? t(translationKey, { defaultValue: fallback }) : fallback;
};

const getObjectCountItems = (beatmap: Beatmap): ObjectCountItem[] => {
  const normalizedMode = beatmap.mode.toLowerCase();

  if (normalizedMode === 'taiko' || normalizedMode === 'taikorx') {
    return [
      {
        key: 'hit-circles',
        value: beatmap.count_circles,
        labelKey: 'beatmap.objects.taiko.hitCircles',
      },
      {
        key: 'drumrolls',
        value: beatmap.count_sliders,
        labelKey: 'beatmap.objects.taiko.drumrolls',
      },
      { key: 'swells', value: beatmap.count_spinners, labelKey: 'beatmap.objects.taiko.swells' },
    ];
  }

  if (normalizedMode === 'fruits' || normalizedMode === 'fruitsrx') {
    return [
      { key: 'fruits', value: beatmap.count_circles, labelKey: 'beatmap.objects.fruits.fruits' },
      {
        key: 'droplets',
        value: beatmap.count_sliders,
        labelKey: 'beatmap.objects.fruits.droplets',
      },
      {
        key: 'banana-showers',
        value: beatmap.count_spinners,
        labelKey: 'beatmap.objects.fruits.bananaShowers',
      },
    ];
  }

  if (normalizedMode === 'mania') {
    return [
      { key: 'notes', value: beatmap.count_circles, labelKey: 'beatmap.objects.mania.notes' },
      {
        key: 'hold-notes',
        value: beatmap.count_sliders,
        labelKey: 'beatmap.objects.mania.holdNotes',
      },
      {
        key: 'spinners',
        value: beatmap.count_spinners,
        labelKey: 'beatmap.objects.mania.spinners',
      },
    ];
  }

  return [
    { key: 'circles', value: beatmap.count_circles, labelKey: 'beatmap.objects.osu.circles' },
    { key: 'sliders', value: beatmap.count_sliders, labelKey: 'beatmap.objects.osu.sliders' },
    { key: 'spinners', value: beatmap.count_spinners, labelKey: 'beatmap.objects.osu.spinners' },
  ];
};

type ScoreStatisticItem = {
  key: 'great' | 'ok' | 'meh' | 'miss';
  label: string;
  value: number;
  className: string;
};

const SCORE_STATISTIC_CONFIG: ReadonlyArray<Omit<ScoreStatisticItem, 'value'>> = [
  { key: 'great', label: 'GREAT', className: 'text-sky-300' },
  { key: 'ok', label: 'OK', className: 'text-lime-300' },
  { key: 'meh', label: 'MEH', className: 'text-amber-300' },
  { key: 'miss', label: 'MISS', className: 'text-rose-300' },
];

const getScoreStatisticItems = (score: BeatmapScore): ScoreStatisticItem[] =>
  SCORE_STATISTIC_CONFIG.map((item) => ({
    ...item,
    value: score.statistics[item.key] ?? 0,
  }));

const getScoreAccuracyText = (score: BeatmapScore): string =>
  `${(score.accuracy * 100).toFixed(2)}%`;

const getScorePpText = (score: BeatmapScore): string =>
  score.pp > 0 ? `${Math.round(score.pp)}pp` : '-';

// ── 主页面组件 ───────────────────────────────────────────────────────────────

const BeatmapPage: React.FC = () => {
  const { beatmapId, beatmapsetId } = useParams<{ beatmapId?: string; beatmapsetId?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 谱面数据
  const [beatmapset, setBeatmapset] = useState<Beatmapset | null>(null);
  const [selectedBeatmap, setSelectedBeatmap] = useState<Beatmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 收藏状态
  const [isFavourited, setIsFavourited] = useState(false);
  const [favouriteCount, setFavouriteCount] = useState(0);
  const [favouriteLoading, setFavouriteLoading] = useState(false);

  // 排行榜状态
  const [leaderboardType, setLeaderboardType] = useState<BeatmapLeaderboardType>('global');
  const [selectedMode, setSelectedMode] = useState<GameMode>('osu');
  const [scoresData, setScoresData] = useState<BeatmapScoresResponse | null>(null);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [scoresError, setScoresError] = useState<string | null>(null);

  // 标签折叠状态
  const [tagsExpanded, setTagsExpanded] = useState(false);

  // ── 数据加载 ────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchBeatmapData = async () => {
      const hashMatch = window.location.hash.match(/#[^/]+\/(\d+)/);
      const hashBeatmapId = hashMatch ? parseInt(hashMatch[1], 10) : null;

      const targetBeatmapId = beatmapId ? parseInt(beatmapId, 10) : hashBeatmapId;
      const targetBeatmapsetId = beatmapsetId ? parseInt(beatmapsetId, 10) : null;

      if (!targetBeatmapId && !targetBeatmapsetId) {
        setError(t('beatmap.notFound'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let beatmapsetData: Beatmapset;

        if (targetBeatmapsetId) {
          beatmapsetData = await beatmapAPI.getBeatmapset(targetBeatmapsetId);
        } else if (targetBeatmapId) {
          if (isNaN(targetBeatmapId)) throw new Error(t('beatmap.notFound'));
          try {
            beatmapsetData = await beatmapAPI.getBeatmapByBeatmapId(targetBeatmapId);
          } catch (error: unknown) {
            if (getErrorMessage(error) === 'Beatmap not found')
              throw new Error(t('beatmap.notFound'));
            throw error;
          }
        } else {
          throw new Error(t('beatmap.notFound'));
        }

        setBeatmapset(beatmapsetData);
        setIsFavourited(beatmapsetData.has_favourited ?? false);
        setFavouriteCount(beatmapsetData.favourite_count);

        // 选择对应 beatmap
        let targetBeatmap: Beatmap | undefined;
        if (targetBeatmapId) {
          targetBeatmap = beatmapsetData.beatmaps.find((b) => b.id === targetBeatmapId);
        }
        if (!targetBeatmap) targetBeatmap = beatmapsetData.beatmaps[0];

        if (targetBeatmap) {
          setSelectedBeatmap(targetBeatmap);
          setSelectedMode(targetBeatmap.mode as GameMode);
          const mode = targetBeatmap.mode || 'osu';
          const newUrl = `/beatmapsets/${beatmapsetData.id}#${mode}/${targetBeatmap.id}`;
          if (window.location.pathname + window.location.hash !== newUrl) {
            navigate(newUrl, { replace: true });
          }
        }
      } catch (error: unknown) {
        console.error('Failed to fetch beatmap data:', error);
        setError(getErrorMessage(error) || t('beatmap.error'));
        toast.error(getErrorMessage(error) || t('beatmap.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchBeatmapData();
  }, [beatmapId, beatmapsetId, navigate, t]);

  // ── 加载排行榜 ──────────────────────────────────────────────────────────

  const loadScores = useCallback(async () => {
    if (!selectedBeatmap) return;
    setScoresLoading(true);
    setScoresError(null);
    try {
      const data = await beatmapAPI.getBeatmapScores(
        selectedBeatmap.id,
        selectedMode,
        leaderboardType,
        50
      );
      setScoresData(data);
    } catch (error: unknown) {
      console.error('Failed to load scores:', error);
      setScoresError(getErrorMessage(error) || t('beatmap.error'));
    } finally {
      setScoresLoading(false);
    }
  }, [selectedBeatmap, selectedMode, leaderboardType, t]);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  // ── 事件处理 ────────────────────────────────────────────────────────────

  const handleDifficultySelect = (beatmap: Beatmap) => {
    setSelectedBeatmap(beatmap);
    setSelectedMode(beatmap.mode as GameMode);
    if (beatmapset) {
      const mode = beatmap.mode || 'osu';
      navigate(`/beatmapsets/${beatmapset.id}#${mode}/${beatmap.id}`, { replace: true });
    }
  };

  const handleFavourite = async () => {
    if (!beatmapset || favouriteLoading) return;
    try {
      setFavouriteLoading(true);
      const nextFavourited = !isFavourited;
      await beatmapAPI.setBeatmapsetFavourite(
        beatmapset.id,
        nextFavourited ? 'favourite' : 'unfavourite'
      );
      setIsFavourited(nextFavourited);
      setFavouriteCount((prev) => Math.max(0, prev + (nextFavourited ? 1 : -1)));
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

  const handleDownloadVideo = async () => {
    if (!beatmapset) return;
    try {
      const url = await beatmapAPI.getBeatmapsetDownloadUrl(beatmapset.id, false);
      window.location.href = url;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || t('beatmapsets.card.downloadError'));
    }
  };

  const handleDownloadNoVideo = async () => {
    if (!beatmapset) return;
    try {
      const url = await beatmapAPI.getBeatmapsetDownloadUrl(beatmapset.id, true);
      window.location.href = url;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || t('beatmapsets.card.downloadError'));
    }
  };

  const handleOsuDirect = () => {
    if (!beatmapset) return;
    window.location.href = `osu://dl/${beatmapset.id}`;
  };

  // ── Loading / Error ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !beatmapset || !selectedBeatmap) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error || t('beatmap.notFound')}</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('beatmap.goBack')}
          </button>
        </div>
      </div>
    );
  }

  // ── 排序后的难度列表 ────────────────────────────────────────────────────
  const sortedBeatmaps = [...beatmapset.beatmaps].sort(
    (a, b) => a.difficulty_rating - b.difficulty_rating
  );

  // ── 标签和玩家标签 ───────────────────────────────────────────────────
  const tagList = beatmapset.tags ? beatmapset.tags.split(' ').filter((tag) => tag.trim()) : [];
  const userTagIds = selectedBeatmap.top_tag_ids ?? [];
  const tagCount = tagList.length + userTagIds.length;
  const shouldShowTagToggle = tagCount > 12;
  const objectCountItems = getObjectCountItems(selectedBeatmap);
  const currentOsuUrl = `https://osu.ppy.sh/beatmapsets/${beatmapset.id}#${selectedBeatmap.mode}/${selectedBeatmap.id}`;
  const translatedGenreName =
    beatmapset.genre_id > 1 && beatmapset.genre.name
      ? getTranslatedMetadataName(
          beatmapset.genre_id,
          beatmapset.genre.name,
          GENRE_TRANSLATION_KEYS,
          t
        )
      : null;
  const translatedLanguageName =
    beatmapset.language_id > 1 && beatmapset.language.name
      ? getTranslatedMetadataName(
          beatmapset.language_id,
          beatmapset.language.name,
          LANGUAGE_TRANSLATION_KEYS,
          t
        )
      : null;
  const submittedDate = new Date(beatmapset.submitted_date).toLocaleDateString();
  const featuredDate = beatmapset.ranked_date
    ? { label: t('beatmap.ranked'), value: new Date(beatmapset.ranked_date).toLocaleDateString() }
    : {
        label: t('beatmap.lastUpdated'),
        value: new Date(beatmapset.last_updated).toLocaleDateString(),
      };
  const ownFeaturedEntry = scoresData?.user_score ?? null;
  const firstFeaturedScore =
    scoresData?.scores[0] ?? (ownFeaturedEntry?.position === 1 ? ownFeaturedEntry.score : null);
  const shouldShowOwnFeaturedScore = Boolean(
    ownFeaturedEntry &&
    ownFeaturedEntry.position !== 1 &&
    ownFeaturedEntry.score.id !== firstFeaturedScore?.id
  );
  const scoreboardRows =
    scoresData?.scores.map((score, index) => ({ score, rank: index + 1 })) ?? [];
  const ownScoreInScoreboard = Boolean(
    ownFeaturedEntry && scoreboardRows.some(({ score }) => score.id === ownFeaturedEntry.score.id)
  );

  // ── 渲染 ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="px-4 lg:px-6 pt-0 pb-6">
        <div className="max-w-7xl mx-auto">
          <div
            className="relative min-h-[29rem] overflow-hidden rounded-2xl shadow-lg"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.82)), url(${beatmapset.covers.cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/80" />
            <div className="relative px-5 py-6 sm:px-6 lg:px-8 min-h-[29rem] flex flex-col justify-between gap-6 text-white">
              <div className="flex items-start justify-between gap-4">
                {/* 状态徽章 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(beatmapset.status)}`}
                  >
                    {t(`beatmap.status.${beatmapset.status}`, {
                      defaultValue: beatmapset.status.toUpperCase(),
                    })}
                  </span>
                  {beatmapset.video && (
                    <span className="px-3 py-1 bg-sky-500/90 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                      {t('beatmap.video')}
                    </span>
                  )}
                  {beatmapset.storyboard && (
                    <span className="px-3 py-1 bg-violet-500/90 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                      {t('beatmap.storyboard')}
                    </span>
                  )}
                </div>

                {/* 音频预览按钮 */}
                {beatmapset.preview_url && (
                  <div className="flex-shrink-0">
                    <AudioPlayButton
                      audioUrl={beatmapset.preview_url}
                      size="lg"
                      showProgress={true}
                      className="shadow-2xl hover:scale-105 transition-transform"
                    />
                  </div>
                )}
              </div>

              <div
                className={`grid grid-cols-1 gap-6 items-end ${
                  beatmapset.video
                    ? 'xl:grid-cols-[minmax(0,1fr)_30rem]'
                    : 'xl:grid-cols-[minmax(0,1fr)_24rem]'
                }`}
              >
                {/* 标题 / 艺术家 / 谱师 */}
                <div className="min-w-0">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-2 break-words drop-shadow-lg">
                    {beatmapset.title_unicode || beatmapset.title}
                  </h1>
                  <p className="text-lg sm:text-xl opacity-95 mb-2 break-words drop-shadow">
                    by{' '}
                    <span className="font-semibold">
                      {beatmapset.artist_unicode || beatmapset.artist}
                    </span>
                  </p>
                  <p className="text-base sm:text-lg opacity-85 drop-shadow">
                    {t('beatmapsets.card.mappedBy', { creator: '' })}
                    <span className="font-medium hover:text-osu-pink transition-colors cursor-pointer">
                      {beatmapset.creator}
                    </span>
                  </p>
                </div>

                {/* 操作与时间信息 */}
                <div className="rounded-2xl border border-white/15 bg-black/35 p-4 shadow-2xl backdrop-blur-md">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-white/10 p-3">
                      <div className="text-xs font-bold uppercase tracking-wide text-white/65">
                        {t('beatmap.submitted')}
                      </div>
                      <div className="mt-1 font-semibold text-white">{submittedDate}</div>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <div className="text-xs font-bold uppercase tracking-wide text-white/65">
                        {featuredDate.label}
                      </div>
                      <div className="mt-1 font-semibold text-white">{featuredDate.value}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`grid gap-2 ${beatmapset.video ? 'grid-cols-3' : 'grid-cols-2'}`}
                    >
                      <button
                        onClick={handleDownloadVideo}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-osu-pink hover:bg-osu-pink/90 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
                      >
                        <Download className="w-4 h-4" />
                        {t('beatmap.download')}
                      </button>
                      {beatmapset.video && (
                        <button
                          onClick={handleDownloadNoVideo}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-osu-pink hover:bg-osu-pink/90 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
                        >
                          <Download className="w-4 h-4" />
                          {t('beatmap.downloadNoVideo')}
                        </button>
                      )}
                      <button
                        onClick={handleOsuDirect}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-osu-pink hover:bg-osu-pink/90 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
                      >
                        <Download className="w-4 h-4" />
                        {t('beatmap.osuDirect')}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleFavourite}
                        disabled={favouriteLoading}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 font-semibold rounded-lg transition-all shadow-md text-sm disabled:opacity-50 ${
                          isFavourited
                            ? 'bg-pink-500/30 text-pink-100 border border-pink-200/30 hover:bg-pink-500/40'
                            : 'bg-white/10 text-white hover:bg-white/15 border border-white/15'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFavourited ? 'fill-current' : ''}`} />
                        {isFavourited ? t('beatmap.unfavourite') : t('beatmap.favourite')}
                      </button>
                      <a
                        href={currentOsuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t('beatmap.viewOnOsu')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 难度选择器 - 按模式分组 */}
            <div className="bg-card rounded-xl shadow-sm border border-border-color overflow-hidden">
              <div className="px-6 py-4 border-b border-border-color bg-card-hover">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <span className="text-osu-pink">●</span>
                  {t('beatmap.difficulties')}
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {Object.entries(
                  sortedBeatmaps.reduce<Record<string, Beatmap[]>>((groups, bm) => {
                    (groups[bm.mode] ??= []).push(bm);
                    return groups;
                  }, {})
                ).map(([mode, beatmaps]) => (
                  <div key={mode}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/25 text-white ring-1 ring-white/70">
                        <i className={`${getModeClass(mode)} text-sm`} />
                      </span>
                      <span className="text-sm font-bold text-text-primary">
                        {getReadableModeName(mode, t)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {beatmaps.map((beatmap) => {
                        const isSelected = selectedBeatmap.id === beatmap.id;
                        const bgColor = getStarDifficultyColor(beatmap.difficulty_rating);
                        const textColor = getStarDifficultyTextColor(beatmap.difficulty_rating);

                        return (
                          <button
                            key={beatmap.id}
                            onClick={() => handleDifficultySelect(beatmap)}
                            data-tooltip-id="difficulty-tooltip"
                            data-tooltip-content={`${beatmap.version} - ${beatmap.difficulty_rating.toFixed(2)}★`}
                            className={`group relative px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm border-2 ${
                              isSelected
                                ? 'border-white/90 shadow-lg ring-2 ring-osu-pink/70 ring-offset-2 ring-offset-card scale-105'
                                : 'border-transparent hover:border-osu-pink/30 hover:scale-[1.02]'
                            }`}
                            style={{ backgroundColor: bgColor, color: textColor }}
                            aria-current={isSelected ? 'true' : undefined}
                          >
                            <div className="flex items-center gap-1.5">
                              <i className={`${getModeClass(beatmap.mode)} text-xs`} />
                              <span className="font-bold">
                                {beatmap.difficulty_rating.toFixed(2)}
                              </span>
                              <Star className="h-3 w-3 fill-current" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <Tooltip
                  id="difficulty-tooltip"
                  place="top"
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                />
              </div>
            </div>

            {/* 当前难度详细信息 */}
            <div className="bg-card rounded-xl shadow-sm border border-border-color overflow-hidden">
              <div className="px-6 py-4 border-b border-border-color bg-gradient-to-r from-osu-pink/10 to-transparent">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-text-primary">{selectedBeatmap.version}</h2>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-black shadow-sm"
                    style={{
                      backgroundColor: getStarDifficultyColor(selectedBeatmap.difficulty_rating),
                      color: getStarDifficultyTextColor(selectedBeatmap.difficulty_rating),
                    }}
                  >
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {selectedBeatmap.difficulty_rating.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* 主要统计 */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-4">
                  <div className="text-center p-4 bg-card-hover rounded-lg">
                    <div className="text-2xl font-bold text-osu-pink mb-1">
                      {formatDuration(selectedBeatmap.total_length)}
                    </div>
                    <div className="text-xs text-text-secondary uppercase tracking-wide">
                      {t('beatmap.length')}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-card-hover rounded-lg">
                    <div className="text-2xl font-bold text-osu-pink mb-1">
                      {formatBPM(selectedBeatmap.bpm)}
                    </div>
                    <div className="text-xs text-text-secondary uppercase tracking-wide">
                      {t('beatmap.bpm')}
                    </div>
                  </div>
                  {objectCountItems.map((item) => (
                    <div key={item.key} className="text-center p-4 bg-card-hover rounded-lg">
                      <div className="text-2xl font-bold text-osu-pink mb-1 tabular-nums">
                        {item.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-text-secondary uppercase tracking-wide">
                        {t(item.labelKey)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 难度属性 - 根据模式显示不同属性 */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-4">
                  {[
                    // taiko 不显示 CS
                    ...(selectedBeatmap.mode !== 'taiko' && selectedBeatmap.mode !== 'taikorx'
                      ? [
                          {
                            value: selectedBeatmap.cs,
                            label:
                              selectedBeatmap.mode === 'mania'
                                ? t('beatmap.keyCount')
                                : t('beatmap.circleSize'),
                          },
                        ]
                      : []),
                    // mania 不显示 AR
                    ...(selectedBeatmap.mode !== 'mania'
                      ? [{ value: selectedBeatmap.ar, label: t('beatmap.approachRate') }]
                      : []),
                    { value: selectedBeatmap.accuracy, label: t('beatmap.overallDifficulty') },
                    { value: selectedBeatmap.drain, label: t('beatmap.hpDrain') },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center p-3 border border-border-color rounded-lg"
                    >
                      <div className="text-lg font-semibold text-text-primary mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs text-text-secondary">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-card rounded-xl shadow-sm border border-border-color overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-osu-pink to-osu-pink/80">
                <h3 className="text-lg font-bold text-white">{t('beatmap.information')}</h3>
              </div>
              <div className="p-6 space-y-3 text-sm">
                {[
                  { label: t('beatmap.creator'), value: beatmapset.creator },
                  { label: t('beatmap.source'), value: beatmapset.source || 'N/A' },
                  ...(translatedGenreName
                    ? [{ label: t('beatmap.genre'), value: translatedGenreName }]
                    : []),
                  ...(translatedLanguageName
                    ? [{ label: t('beatmap.language'), value: translatedLanguageName }]
                    : []),
                ].map((item, i) => (
                  <div key={i}>
                    {i > 0 && <div className="h-px bg-border-color mb-3" />}
                    <div className="flex justify-between items-start">
                      <span className="text-text-secondary font-medium">{item.label}</span>
                      <span className="font-semibold text-text-primary text-right">
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="h-px bg-border-color" />
                <div className="flex justify-between items-start">
                  <span className="text-text-secondary font-medium">{t('beatmap.playCount')}</span>
                  <span className="font-semibold text-osu-pink flex items-center gap-1">
                    <Play className="h-3.5 w-3.5" />
                    {formatNumber(beatmapset.play_count)}
                  </span>
                </div>
                <div className="h-px bg-border-color" />
                <div className="flex justify-between items-start">
                  <span className="text-text-secondary font-medium">
                    {t('beatmap.favouriteCount')}
                  </span>
                  <span className="font-semibold text-osu-pink flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {formatNumber(favouriteCount)}
                  </span>
                </div>
              </div>
            </div>

            {/* 标签 */}
            {(tagList.length > 0 || userTagIds.length > 0) && (
              <div className="bg-card rounded-xl shadow-sm border border-border-color overflow-hidden">
                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-text-primary">{t('beatmap.tags')}</h3>
                  <span className="text-xs font-bold text-text-secondary">{tagCount}</span>
                </div>
                <div className="relative">
                  <div
                    className={`p-4 space-y-4 transition-[max-height] duration-300 ${
                      shouldShowTagToggle && !tagsExpanded
                        ? 'max-h-40 overflow-hidden'
                        : 'max-h-[28rem] overflow-y-auto'
                    }`}
                  >
                    {tagList.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-text-secondary mb-2">
                          {t('beatmap.tags')}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tagList.map((tag, index) => (
                            <span
                              key={`${tag}-${index}`}
                              className="px-3 py-1.5 bg-card-hover text-text-secondary rounded-full text-sm font-medium hover:bg-osu-pink/10 hover:text-osu-pink transition-colors cursor-pointer"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {userTagIds.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-text-secondary mb-2">
                          {t('beatmap.userTags')}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {userTagIds.map((tagId, index) => (
                            <span
                              key={`${tagId}-${index}`}
                              className="px-3 py-1.5 bg-card-hover text-text-secondary rounded-full text-xs font-medium"
                            >
                              #{tagId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {shouldShowTagToggle && !tagsExpanded && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-12 h-12 bg-gradient-to-t from-card to-transparent" />
                  )}

                  {shouldShowTagToggle && (
                    <div className="relative px-4 pb-4">
                      <button
                        type="button"
                        onClick={() => setTagsExpanded((expanded) => !expanded)}
                        className="w-full rounded-lg border border-border-color bg-card-hover px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-osu-pink/30 hover:text-osu-pink"
                      >
                        {tagsExpanded ? t('beatmap.tagsCollapse') : t('beatmap.tagsExpand')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ 排行榜 ═══════════ */}
        <div className="mt-6 bg-card rounded-xl shadow-sm border border-border-color overflow-hidden">
          {/* 标题栏 */}
          <div className="px-6 py-4 border-b border-border-color flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span className="text-osu-pink">●</span>
              {t('beatmap.scoreboard.title')}
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex">
                <GameModeSelector
                  selectedMode={selectedMode}
                  onModeChange={setSelectedMode}
                  variant="compact"
                />
              </div>

              <CustomSelect
                value={leaderboardType}
                onChange={(value) => setLeaderboardType(value as BeatmapLeaderboardType)}
                options={LEADERBOARD_SCOPES.map((scope) => ({
                  value: scope.key,
                  label: t(scope.labelKey),
                }))}
                className="w-full sm:w-max sm:min-w-40"
                buttonClassName="h-10 whitespace-nowrap py-0"
              />
            </div>
          </div>

          {/* 排行榜内容 */}
          {scoresLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-text-secondary">
              <Loader2 className="h-5 w-5 animate-spin text-osu-pink" />
              <span>{t('beatmap.scoreboard.noScores.loading')}</span>
            </div>
          ) : scoresError ? (
            <div className="flex items-center justify-center py-12 text-red-400">{scoresError}</div>
          ) : !scoresData || (scoresData.scores.length === 0 && !scoresData.user_score) ? (
            <div className="flex items-center justify-center py-12 text-text-secondary">
              {t(`beatmap.scoreboard.noScores.${leaderboardType}`)}
            </div>
          ) : (
            <div className="space-y-3 p-4 sm:p-5">
              {(firstFeaturedScore || shouldShowOwnFeaturedScore) && (
                <div
                  className={`grid gap-3 ${
                    shouldShowOwnFeaturedScore ? 'xl:grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {firstFeaturedScore && (
                    <FeaturedScoreCard
                      score={firstFeaturedScore}
                      rank={1}
                      label="#1"
                      beatmapMaxCombo={selectedBeatmap.max_combo}
                      tone="first"
                      t={t}
                    />
                  )}
                  {shouldShowOwnFeaturedScore && ownFeaturedEntry && (
                    <FeaturedScoreCard
                      score={ownFeaturedEntry.score}
                      rank={ownFeaturedEntry.position}
                      label={t('beatmap.scoreboard.scoreOwn')}
                      beatmapMaxCombo={selectedBeatmap.max_combo}
                      tone="own"
                      t={t}
                    />
                  )}
                </div>
              )}

              {(scoreboardRows.length > 0 || (ownFeaturedEntry && !ownScoreInScoreboard)) && (
                <div className="overflow-x-auto rounded-xl border border-border-color">
                  <table className="min-w-[56rem] w-full table-auto text-sm">
                    <thead className="bg-card-hover/80 text-xs uppercase tracking-wide text-text-secondary">
                      <tr>
                        <th className="px-3 py-2 text-left w-16">
                          {t('beatmap.scoreboard.headers.rank')}
                        </th>
                        <th className="px-2 py-2 text-left w-14" />
                        <th className="px-2 py-2 text-left min-w-[12rem]">
                          {t('beatmap.scoreboard.headers.player')}
                        </th>
                        <th className="px-2 py-2 text-right">
                          {t('beatmap.scoreboard.headers.score')}
                        </th>
                        <th className="px-2 py-2 text-right">
                          {t('beatmap.scoreboard.headers.accuracy')}
                        </th>
                        <th className="px-2 py-2 text-right">
                          {t('beatmap.scoreboard.headers.combo')}
                        </th>
                        <th className="px-2 py-2 text-right">
                          {t('beatmap.scoreboard.headers.pp')}
                        </th>
                        <th className="px-2 py-2 text-left">
                          {t('beatmap.scoreboard.headers.mods')}
                        </th>
                        <th className="px-2 py-2 text-left">
                          {t('beatmap.scoreboard.headers.time')}
                        </th>
                        <th className="px-2 py-2 text-right w-10" aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                      {ownFeaturedEntry && !ownScoreInScoreboard && (
                        <>
                          <tr className="bg-osu-pink/5">
                            <td
                              colSpan={10}
                              className="px-3 py-2 text-xs font-bold text-osu-pink border-l-4 border-osu-pink"
                            >
                              {t('beatmap.scoreboard.scoreOwn')}
                            </td>
                          </tr>
                          <ScoreRow
                            score={ownFeaturedEntry.score}
                            rank={ownFeaturedEntry.position}
                            beatmapMaxCombo={selectedBeatmap.max_combo}
                            highlighted
                            t={t}
                          />
                        </>
                      )}
                      {scoreboardRows.map(({ score, rank }) => (
                        <ScoreRow
                          key={score.id}
                          score={score}
                          rank={rank}
                          beatmapMaxCombo={selectedBeatmap.max_combo}
                          highlighted={ownFeaturedEntry?.score.id === score.id}
                          t={t}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 底部音频播放器 */}
      <AudioPlayerControls />
    </div>
  );
};

// ── 排行榜突出成绩卡片组件 ───────────────────────────────────────────────────

interface FeaturedScoreCardProps {
  score: BeatmapScore;
  rank: number;
  label: string;
  beatmapMaxCombo: number;
  tone: 'first' | 'own';
  t: TFunction;
}

const FeaturedScoreCard: React.FC<FeaturedScoreCardProps> = ({
  score,
  rank,
  label,
  beatmapMaxCombo,
  tone,
  t,
}) => {
  const isFullCombo = score.is_perfect_combo || score.max_combo >= beatmapMaxCombo;
  const statistics = getScoreStatisticItems(score);
  const absoluteTime = new Date(score.ended_at).toLocaleString();
  const tooltipId = `featured-score-time-${tone}-${score.id}`;
  const accentClass = tone === 'first' ? 'text-yellow-300' : 'text-osu-pink';
  const borderClass = tone === 'first' ? 'border-yellow-400/35' : 'border-osu-pink/35';
  const glowClass = tone === 'first' ? 'from-yellow-400/20' : 'from-osu-pink/20';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${borderClass} bg-slate-900 p-3 text-white shadow-lg sm:p-4`}
    >
      {score.user.cover.url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${score.user.cover.url})` }}
        />
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${glowClass} via-slate-900/65 to-slate-950/75`}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${accentClass}`}
          >
            {label}
          </span>
          <RankBadge rank={rank} size="md" />
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link to={`/users/${score.user.id}`} className="flex-shrink-0">
              <LazyAvatar
                src={score.user.avatar_url}
                alt={score.user.username}
                size="md"
                className="border-white/20 shadow-lg shadow-black/30"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <img
                  src={getRankIcon(score.rank)}
                  alt={score.rank}
                  className="h-8 w-8 flex-shrink-0 drop-shadow-lg"
                  loading="lazy"
                />
                <Link
                  to={`/users/${score.user.id}`}
                  className="truncate text-base font-black text-white transition-colors hover:text-osu-pink"
                >
                  {score.user.username}
                </Link>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/65">
                {score.user.country_code && (
                  <LazyFlag
                    src={`/image/flag/${score.user.country_code.toLowerCase()}.svg`}
                    alt={score.user.country_code}
                    title={score.user.country.name}
                    className="h-3.5 w-5 rounded-sm"
                  />
                )}
                {score.user.team && (
                  <LazyFlag
                    src={score.user.team.flag_url}
                    alt={score.user.team.short_name}
                    title={score.user.team.name}
                    className="h-3.5 w-5 rounded-sm"
                  />
                )}
                <span
                  className="cursor-help"
                  data-tooltip-id={tooltipId}
                  data-tooltip-content={absoluteTime}
                >
                  {formatTimeAgo(score.ended_at, t)}
                </span>
                <Tooltip
                  id={tooltipId}
                  place="top"
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 xl:max-w-2xl">
            <div className="min-w-0 rounded-lg bg-white/10 p-2.5">
              <div className="truncate text-[10px] font-black uppercase tracking-wide text-white/45">
                {t('beatmap.scoreboard.headers.score')}
              </div>
              <div className="mt-1 min-w-0 break-words text-sm font-black leading-tight tabular-nums text-white sm:text-base xl:text-sm 2xl:text-base">
                {score.total_score.toLocaleString()}
              </div>
            </div>
            <div className="min-w-0 rounded-lg bg-white/10 p-2.5">
              <div className="truncate text-[10px] font-black uppercase tracking-wide text-white/45">
                {t('beatmap.scoreboard.headers.accuracy')}
              </div>
              <div className="mt-1 min-w-0 break-words text-sm font-black leading-tight tabular-nums text-white sm:text-base xl:text-sm 2xl:text-base">
                {getScoreAccuracyText(score)}
              </div>
            </div>
            <div className="min-w-0 rounded-lg bg-white/10 p-2.5">
              <div className="truncate text-[10px] font-black uppercase tracking-wide text-white/45">
                {t('beatmap.scoreboard.headers.combo')}
              </div>
              <div
                className={`mt-1 min-w-0 break-words text-sm font-black leading-tight tabular-nums sm:text-base xl:text-sm 2xl:text-base ${
                  isFullCombo ? 'text-osu-pink' : 'text-white'
                }`}
              >
                {score.max_combo}x
                <span className="text-[11px] text-white/45">/{beatmapMaxCombo}x</span>
              </div>
            </div>
            <div className="min-w-0 rounded-lg bg-white/10 p-2.5">
              <div className="truncate text-[10px] font-black uppercase tracking-wide text-white/45">
                {t('beatmap.scoreboard.headers.pp')}
              </div>
              <div
                className={`mt-1 min-w-0 break-words text-sm font-black leading-tight tabular-nums sm:text-base xl:text-sm 2xl:text-base ${accentClass}`}
              >
                {getScorePpText(score)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {statistics.map((statistic) => (
            <div key={statistic.key} className="rounded-lg bg-black/20 px-2.5 py-1.5 text-center">
              <div className={`text-sm font-black tabular-nums ${statistic.className}`}>
                {statistic.value.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-wide text-white/40">
                {statistic.label}
              </div>
            </div>
          ))}
        </div>

        <ModsDisplay mods={score.mods} className="gap-1.5" size="md" />
      </div>
    </div>
  );
};

// ── 排行榜分数行组件 ─────────────────────────────────────────────────────────

interface ScoreRowProps {
  score: BeatmapScore;
  rank: number;
  beatmapMaxCombo: number;
  highlighted?: boolean;
  t: TFunction;
}

const ScoreRow: React.FC<ScoreRowProps> = ({
  score,
  rank,
  beatmapMaxCombo,
  highlighted = false,
  t,
}) => {
  const isTopThree = rank <= 3;
  const isFullCombo = score.is_perfect_combo || score.max_combo >= beatmapMaxCombo;
  const timeAgo = formatTimeAgo(score.ended_at, t);
  const absoluteTime = new Date(score.ended_at).toLocaleString();
  const accuracy = getScoreAccuracyText(score);

  // 分数显示菜单
  const [menuOpen, setMenuOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: menuOpen,
    onOpenChange: setMenuOpen,
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-end',
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const handleDownloadReplay = async () => {
    if (!score.has_replay) return;
    try {
      const blob = await scoreAPI.downloadReplay(score.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `replay_${score.id}.osr`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t('profile.bestScores.actions.downloadSuccess'));
    } catch (error) {
      handleApiError(error);
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <tr
      className={`transition-colors hover:bg-card-hover ${
        highlighted
          ? 'bg-osu-pink/5'
          : isTopThree
            ? 'bg-gradient-to-r from-yellow-500/5 to-transparent dark:from-yellow-500/10'
            : ''
      }`}
    >
      <td className="px-3 py-2 align-middle">
        <RankBadge rank={rank} size="sm" />
      </td>
      <td className="px-2 py-2 align-middle">
        <img src={getRankIcon(score.rank)} alt={score.rank} className="w-8 h-8" loading="lazy" />
      </td>
      <td className="px-2 py-2 align-middle min-w-[12rem]">
        <div className="flex items-center gap-2 min-w-0">
          <Link to={`/users/${score.user.id}`} className="flex-shrink-0">
            <LazyAvatar src={score.user.avatar_url} alt={score.user.username} size="md" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                to={`/users/${score.user.id}`}
                className="font-semibold text-sm text-text-primary hover:text-osu-pink transition-colors truncate"
              >
                {score.user.username}
              </Link>
              {score.user.country_code && (
                <LazyFlag
                  src={`/image/flag/${score.user.country_code.toLowerCase()}.svg`}
                  alt={score.user.country_code}
                  className="w-4 h-3 rounded-sm flex-shrink-0"
                />
              )}
              {score.user.team && (
                <LazyFlag
                  src={score.user.team.flag_url}
                  alt={score.user.team.short_name}
                  className="w-4 h-3 rounded-sm flex-shrink-0"
                />
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-2 py-2 align-middle text-right font-bold text-text-primary tabular-nums whitespace-nowrap">
        {score.total_score.toLocaleString()}
      </td>
      <td className="px-2 py-2 align-middle text-right text-text-secondary tabular-nums whitespace-nowrap">
        {accuracy}
      </td>
      <td
        className={`px-2 py-2 align-middle text-right tabular-nums whitespace-nowrap ${
          isFullCombo ? 'text-osu-pink font-bold' : 'text-text-secondary'
        }`}
      >
        {score.max_combo}x<span className="text-text-muted">/{beatmapMaxCombo}x</span>
      </td>
      <td className="px-2 py-2 align-middle text-right font-semibold text-osu-pink tabular-nums whitespace-nowrap">
        {getScorePpText(score)}
      </td>
      <td className="px-2 py-2 align-middle">
        <ModsDisplay mods={score.mods} size="sm" />
      </td>
      <td className="px-2 py-2 align-middle text-xs text-text-muted whitespace-nowrap">
        <span
          className="cursor-help"
          data-tooltip-id={`score-time-${score.id}`}
          data-tooltip-content={absoluteTime}
        >
          {timeAgo}
        </span>
        <Tooltip
          id={`score-time-${score.id}`}
          place="top"
          style={{
            backgroundColor: '#1e293b',
            color: '#fff',
            borderRadius: '0.5rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
          }}
        />
      </td>
      <td className="px-2 py-2 align-middle text-right">
        <button
          ref={refs.setReference}
          {...getReferenceProps()}
          className="h-8 w-8 rounded-lg hover:bg-card-hover inline-flex items-center justify-center transition-colors text-text-muted"
          aria-label="More actions"
        >
          <FaEllipsisV className="w-3 h-3" />
        </button>

        {menuOpen && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false}>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
                className="w-48 bg-card rounded-lg shadow-xl border border-border-color overflow-hidden z-[9999]"
              >
                {/* 查看详情（占位） */}
                <button
                  onClick={() => {
                    toast('Coming soon!', { icon: '🔜' });
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-card-hover flex items-center gap-3 text-sm text-text-primary border-b border-border-color transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t('beatmap.scoreboard.viewDetails')}</span>
                </button>

                {/* 下载回放 */}
                {score.has_replay && (
                  <button
                    onClick={handleDownloadReplay}
                    className="w-full px-4 py-3 text-left hover:bg-card-hover flex items-center gap-3 text-sm text-text-primary transition-colors"
                  >
                    <FaDownload className="w-4 h-4" />
                    <span>{t('beatmap.scoreboard.downloadReplay')}</span>
                  </button>
                )}
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </td>
    </tr>
  );
};

export default BeatmapPage;
