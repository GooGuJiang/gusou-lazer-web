import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Clock3, Download, Pin, PinOff, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

import LazyAvatar from '../components/UI/LazyAvatar';
import LazyBackgroundImage from '../components/UI/LazyBackgroundImage';
import LazyFlag from '../components/UI/LazyFlag';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ModsDisplay from '../components/UI/ModsDisplay';
import BeatmapLink from '../components/UI/BeatmapLink';
import UserLink from '../components/UI/UserLink';
import StarRatingBadge from '../components/UI/StarRatingBadge';
import { useAuth } from '../hooks/useAuth';
import type { ScoreDetail, ScoreStatistics, User } from '../types';
import { beatmapAPI, handleApiError, scoreAPI, userAPI } from '../utils/api';
import { getApiErrorStatus } from '../utils/typeGuards';

type SupportedRulesetId = 0 | 1 | 2 | 3;
type StatisticColor = 'perfect' | 'great' | 'good' | 'ok' | 'meh' | 'miss' | 'extra';

interface StatisticDefinition {
  key: string;
  labelKey: string;
  color: StatisticColor;
  maximumKeys?: string[];
  mergeKeys?: string[];
}

interface StatisticItem extends StatisticDefinition {
  value: number;
  maximumValue?: number;
}

interface RulesetConfig {
  mode: 'osu' | 'taiko' | 'fruits' | 'mania';
  modeIconClass: string;
  modeLabelKey: string;
  basic: StatisticDefinition[];
  extra: StatisticDefinition[];
}

const RULESET_CONFIG: Record<SupportedRulesetId, RulesetConfig> = {
  0: {
    mode: 'osu',
    modeIconClass: 'fa-extra-mode-osu',
    modeLabelKey: 'score.mode.osu',
    basic: [
      { key: 'great', labelKey: 'score.judgement.great', color: 'great' },
      { key: 'ok', labelKey: 'score.judgement.ok', color: 'ok' },
      { key: 'meh', labelKey: 'score.judgement.meh', color: 'meh' },
      { key: 'miss', labelKey: 'score.judgement.miss', color: 'miss' },
    ],
    extra: [
      {
        key: 'large_tick_hit',
        labelKey: 'score.judgement.sliderTick',
        color: 'extra',
        maximumKeys: ['large_tick_hit'],
      },
      {
        key: 'slider_tail_hit',
        labelKey: 'score.judgement.sliderEnd',
        color: 'extra',
        maximumKeys: ['slider_tail_hit'],
      },
      {
        key: 'small_bonus',
        labelKey: 'score.judgement.spinnerSpin',
        color: 'extra',
        maximumKeys: ['small_bonus'],
      },
      {
        key: 'large_bonus',
        labelKey: 'score.judgement.spinnerBonus',
        color: 'extra',
        maximumKeys: ['large_bonus'],
      },
    ],
  },
  1: {
    mode: 'taiko',
    modeIconClass: 'fa-extra-mode-taiko',
    modeLabelKey: 'score.mode.taiko',
    basic: [
      { key: 'great', labelKey: 'score.judgement.great', color: 'great' },
      { key: 'ok', labelKey: 'score.judgement.ok', color: 'ok' },
      { key: 'miss', labelKey: 'score.judgement.miss', color: 'miss' },
    ],
    extra: [
      {
        key: 'small_bonus',
        labelKey: 'score.judgement.drumTick',
        color: 'extra',
        maximumKeys: ['small_bonus'],
      },
      {
        key: 'large_bonus',
        labelKey: 'score.judgement.bonus',
        color: 'extra',
        maximumKeys: ['large_bonus'],
      },
    ],
  },
  2: {
    mode: 'fruits',
    modeIconClass: 'fa-extra-mode-fruits',
    modeLabelKey: 'score.mode.fruits',
    basic: [
      { key: 'great', labelKey: 'score.judgement.great', color: 'great' },
      {
        key: 'miss',
        labelKey: 'score.judgement.miss',
        color: 'miss',
        mergeKeys: ['large_tick_miss'],
      },
    ],
    extra: [
      {
        key: 'large_tick_hit',
        labelKey: 'score.judgement.largeDroplet',
        color: 'extra',
        maximumKeys: ['large_tick_hit'],
      },
      {
        key: 'small_tick_hit',
        labelKey: 'score.judgement.smallDroplet',
        color: 'extra',
        maximumKeys: ['small_tick_hit'],
      },
      {
        key: 'large_bonus',
        labelKey: 'score.judgement.banana',
        color: 'extra',
        maximumKeys: ['large_bonus'],
      },
    ],
  },
  3: {
    mode: 'mania',
    modeIconClass: 'fa-extra-mode-mania',
    modeLabelKey: 'score.mode.mania',
    basic: [
      { key: 'perfect', labelKey: 'score.judgement.perfect', color: 'perfect' },
      { key: 'great', labelKey: 'score.judgement.great', color: 'great' },
      { key: 'good', labelKey: 'score.judgement.good', color: 'good' },
      { key: 'ok', labelKey: 'score.judgement.ok', color: 'ok' },
      { key: 'meh', labelKey: 'score.judgement.meh', color: 'meh' },
      { key: 'miss', labelKey: 'score.judgement.miss', color: 'miss' },
    ],
    extra: [],
  },
};

const STATISTIC_COLOR_CLASSES: Record<StatisticColor, string> = {
  perfect: 'text-cyan-700 dark:text-cyan-300',
  great: 'text-sky-700 dark:text-sky-300',
  good: 'text-green-700 dark:text-green-300',
  ok: 'text-lime-700 dark:text-lime-300',
  meh: 'text-amber-700 dark:text-amber-300',
  miss: 'text-rose-700 dark:text-rose-300',
  extra: 'text-gray-700 dark:text-gray-300',
};

const RANK_IMAGE_MAP: Record<string, string> = {
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

const getRankIcon = (rank: string): string => RANK_IMAGE_MAP[rank] ?? RANK_IMAGE_MAP.F;

const getRulesetConfig = (rulesetId: number): RulesetConfig | null => {
  if (rulesetId === 0 || rulesetId === 1 || rulesetId === 2 || rulesetId === 3) {
    return RULESET_CONFIG[rulesetId];
  }

  return null;
};

const sumStatistics = (statistics: ScoreStatistics, keys: string[]): number =>
  keys.reduce((total, key) => total + (statistics[key] ?? 0), 0);

const getMaximumValue = (
  maximumStatistics: ScoreStatistics,
  definition: StatisticDefinition
): number | undefined => {
  const maximumValue = sumStatistics(maximumStatistics, definition.maximumKeys ?? [definition.key]);
  return maximumValue > 0 ? maximumValue : undefined;
};

const buildStatisticItems = (
  score: ScoreDetail,
  definitions: StatisticDefinition[],
  extra: boolean
): StatisticItem[] =>
  definitions
    .map((definition) => ({
      ...definition,
      value: sumStatistics(score.statistics, [definition.key, ...(definition.mergeKeys ?? [])]),
      maximumValue: getMaximumValue(score.maximum_statistics, definition),
    }))
    .filter((item) => !extra || item.maximumValue !== undefined);

const formatRank = (rank?: number | null): string => (rank ? `#${rank.toLocaleString()}` : '--');

const getCoverUrl = (score: ScoreDetail): string | undefined =>
  score.beatmapset.covers['cover@2x'] ?? score.beatmapset.covers.cover;

const getArtistName = (score: ScoreDetail): string =>
  score.beatmapset.artist_unicode || score.beatmapset.artist;

const getTitle = (score: ScoreDetail): string =>
  score.beatmapset.title_unicode || score.beatmapset.title;

const ScorePage = () => {
  const { scoreId } = useParams<{ scoreId: string }>();
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const [score, setScore] = useState<ScoreDetail | null>(null);
  const [scoreUser, setScoreUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    const numericScoreId = Number(scoreId);
    if (!scoreId || !Number.isSafeInteger(numericScoreId) || numericScoreId <= 0) {
      setError(t('score.error.invalidId'));
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const loadScore = async () => {
      setLoading(true);
      setError(null);

      try {
        const scoreData = await scoreAPI.getScore(numericScoreId, abortController.signal);
        setScore(scoreData);
        setIsPinned(scoreData.current_user_attributes?.pin?.is_pinned ?? false);
        setScoreUser(null);

        try {
          const userData = (await userAPI.getUser(scoreData.user_id, scoreData.beatmap.mode, {
            signal: abortController.signal,
          })) as User;
          setScoreUser(userData);
        } catch (userError) {
          if (!abortController.signal.aborted) {
            console.warn('Failed to load score user details:', userError);
          }
        }
      } catch (loadError) {
        if (abortController.signal.aborted) return;
        setError(
          getApiErrorStatus(loadError) === 404 ? t('score.notFound') : t('score.error.loadFailed')
        );
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    void loadScore();
    return () => abortController.abort();
  }, [scoreId, t]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-text-muted">{t('score.loading')}</p>
      </div>
    );
  }

  if (!score || error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="card-standard max-w-md text-center">
          <h1 className="text-xl font-bold text-text-primary">{t('score.notFound')}</h1>
          <p className="mt-2 text-sm text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  const ruleset = getRulesetConfig(score.ruleset_id);
  if (!ruleset) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="card-standard max-w-md text-center">
          <h1 className="text-xl font-bold text-text-primary">{t('score.title')}</h1>
          <p className="mt-2 text-sm text-text-secondary">{t('score.error.unsupportedRuleset')}</p>
        </div>
      </div>
    );
  }

  const basicStatistics = buildStatisticItems(score, ruleset.basic, false);
  const extraStatistics = buildStatisticItems(score, ruleset.extra, true);
  const title = getTitle(score);
  const artist = getArtistName(score);
  const beatmapUrl = beatmapAPI.buildInternalBeatmapUrl(
    score.beatmap.beatmapset_id,
    ruleset.mode,
    score.beatmap.id
  );
  const coverUrl = getCoverUrl(score);
  const userCoverUrl = score.user.cover?.url ?? scoreUser?.cover?.url ?? scoreUser?.cover_url;
  const playerCountryName =
    score.user.country?.name ?? scoreUser?.country.name ?? score.user.country_code;
  const playerTeam = score.user.team ?? scoreUser?.team ?? null;
  const playerGlobalRank = scoreUser?.statistics?.global_rank;
  const playerCountryRank = scoreUser?.statistics?.country_rank;
  const isOwnScore = currentUser?.id === score.user_id;
  const client = score.legacy_total_score > 0 ? 'stable' : 'lazer';
  const beatmapMaxCombo = score.beatmap.max_combo ?? null;
  const isFullCombo =
    score.is_perfect_combo ||
    score.legacy_perfect ||
    (beatmapMaxCombo !== null && score.max_combo >= beatmapMaxCombo);
  const comboText = `${score.max_combo.toLocaleString()}x${
    beatmapMaxCombo !== null ? ` / ${beatmapMaxCombo.toLocaleString()}x` : ''
  }`;
  const playedAt = new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(score.ended_at));

  const handleDownloadReplay = async () => {
    setDownloadLoading(true);
    try {
      const blob = await scoreAPI.downloadReplay(score.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `replay_${score.id}.osr`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t('score.actions.downloadSuccess'));
    } catch (downloadError) {
      handleApiError(downloadError);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleTogglePin = async () => {
    setPinLoading(true);
    try {
      if (isPinned) {
        await scoreAPI.unpinScore(score.id);
        setIsPinned(false);
        toast.success(t('score.actions.unpinSuccess'));
      } else {
        await scoreAPI.pinScore(score.id);
        setIsPinned(true);
        toast.success(t('score.actions.pinSuccess'));
      }
    } catch (pinError) {
      handleApiError(pinError);
    } finally {
      setPinLoading(false);
    }
  };

  const handleShare = async () => {
    setShareLoading(true);
    const shareData = {
      title: t('score.share.title', {
        username: score.user.username,
        title,
        version: score.beatmap.version,
      }),
      text: t('score.share.text', {
        artist,
        title,
        version: score.beatmap.version,
        score: score.total_score.toLocaleString(),
      }),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t('score.actions.shareCopied'));
      } else {
        toast.error(t('score.actions.shareUnavailable'));
      }
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
      toast.error(t('score.actions.shareFailed'));
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
      <article className="overflow-hidden rounded-lg border border-default bg-card shadow-xl shadow-black/10">
        <LazyBackgroundImage src={coverUrl} className="min-h-[11.75rem] bg-card">
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/55 dark:from-black/95 dark:via-black/75 dark:to-black/40" />
          <div className="relative flex min-h-[11.75rem] items-center gap-4 px-5 py-6 sm:gap-6 sm:px-7">
            <div className="w-16 shrink-0 sm:w-24">
              <img
                src={getRankIcon(score.rank)}
                alt={score.rank}
                className="w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-flex rounded-full bg-lime-400 px-2.5 py-1 text-xs font-bold text-slate-950">
                {t(`beatmap.status.${score.beatmap.status}`, {
                  defaultValue: score.beatmap.status,
                })}
              </span>
              <BeatmapLink
                beatmapUrl={beatmapUrl ?? undefined}
                className="mt-2 block w-fit max-w-full text-lg font-extrabold leading-tight text-gray-900 drop-shadow dark:text-white sm:text-2xl"
                title={`${artist} - ${title}`}
              >
                <span className="break-words">
                  {artist} - {title}
                </span>
              </BeatmapLink>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StarRatingBadge
                  stars={score.beatmap.difficulty_rating}
                  modeIconClass={ruleset.modeIconClass}
                  title={t(ruleset.modeLabelKey)}
                />
                <span className="text-sm font-bold text-amber-600 dark:text-amber-300">
                  {score.beatmap.version}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-white/60">
                {t('score.beatmap.by', { creator: score.beatmapset.creator })}
              </div>
            </div>
          </div>
        </LazyBackgroundImage>

        <div className="relative bg-card">
          {userCoverUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{ backgroundImage: `url(${userCoverUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/65 to-white/35 dark:from-black/80 dark:via-black/55 dark:to-black/25" />
          <div className="relative flex flex-wrap items-start gap-4 px-5 py-4 sm:flex-nowrap sm:items-center sm:px-7">
            <Link to={`/users/${score.user.id}`} className="shrink-0">
              <LazyAvatar
                src={score.user.avatar_url}
                alt={score.user.username}
                size="lg"
                className="!h-16 !w-16 !rounded-xl shadow-lg"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <UserLink
                userId={score.user.id}
                username={score.user.username}
                className="block truncate text-lg font-extrabold text-gray-900 dark:text-white"
              />
              <div className="mt-1.5 flex items-center gap-2">
                {score.user.country_code && (
                  <LazyFlag
                    src={`/image/flag/${score.user.country_code.toLowerCase()}.svg`}
                    alt={score.user.country_code}
                    title={playerCountryName}
                    className="h-4 w-6 shrink-0 rounded-sm"
                  />
                )}
                {playerTeam && (
                  <LazyFlag
                    src={playerTeam.flag_url}
                    alt={playerTeam.short_name}
                    title={playerTeam.name}
                    className="h-[18px] w-8 shrink-0 rounded-sm"
                  />
                )}
              </div>
            </div>
            <div className="ml-20 flex basis-full gap-5 sm:ml-0 sm:basis-auto sm:gap-7">
              <div>
                <div className="text-xs text-gray-600 dark:text-white/60">
                  {t('score.labels.globalRank')}
                </div>
                <div className="text-xl font-extrabold text-gray-900 tabular-nums dark:text-white sm:text-2xl">
                  {formatRank(playerGlobalRank)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-white/60">
                  {t('score.labels.countryRank')}
                </div>
                <div className="text-xl font-extrabold text-gray-900 tabular-nums dark:text-white sm:text-2xl">
                  {formatRank(playerCountryRank)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t('score.labels.score')}
                </span>
                <span
                  className={`rounded border px-2 py-0.5 text-[11px] font-bold ${
                    client === 'stable'
                      ? 'border-amber-600/40 bg-amber-100 text-amber-800 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300'
                      : 'border-cyan-700/40 bg-cyan-100 text-cyan-800 dark:border-cyan-300/40 dark:bg-cyan-300/10 dark:text-cyan-300'
                  }`}
                >
                  {t(`score.client.${client}`)}
                </span>
              </div>
              <div className="mt-1 text-3xl font-extrabold text-text-primary tabular-nums sm:text-4xl">
                {score.total_score.toLocaleString()}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('score.labels.playedAt', { date: playedAt })}</span>
              </div>
            </div>
            {score.mods.length > 0 && <ModsDisplay mods={score.mods} size="lg" showNoMod={false} />}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ScoreStat
              label={t('score.labels.accuracy')}
              value={`${(score.accuracy * 100).toFixed(2)}%`}
              accent="cyan"
            />
            <ScoreStat
              label={t('score.labels.maxCombo')}
              value={comboText}
              accent={isFullCombo ? 'green' : undefined}
              subLabel={isFullCombo ? t('score.labels.fullCombo') : undefined}
            />
            <ScoreStat
              label={t('score.labels.globalRank')}
              value={formatRank(score.rank_global ?? score.position)}
            />
            <ScoreStat
              label={t('score.labels.pp')}
              value={score.pp === null ? '--' : Math.round(score.pp).toLocaleString()}
              accent="pink"
            />
          </div>

          <div className="space-y-4 border-t border-default pt-5">
            <StatisticGrid items={basicStatistics} />
            {extraStatistics.length > 0 && <StatisticGrid items={extraStatistics} extra />}
          </div>

          <div className="flex flex-wrap gap-2.5 border-t border-default pt-5">
            {score.has_replay && (
              <ActionButton
                icon={<Download className="h-4 w-4" />}
                label={t('score.actions.downloadReplay')}
                onClick={handleDownloadReplay}
                disabled={downloadLoading}
                primary
              />
            )}
            {isOwnScore && (
              <ActionButton
                icon={isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                label={t(isPinned ? 'score.actions.unpin' : 'score.actions.pin')}
                onClick={handleTogglePin}
                disabled={pinLoading}
                active={isPinned}
              />
            )}
            <ActionButton
              icon={<Share2 className="h-4 w-4" />}
              label={t('score.actions.share')}
              onClick={handleShare}
              disabled={shareLoading}
            />
          </div>
        </div>
      </article>
    </div>
  );
};

const ScoreStat = ({
  label,
  value,
  accent,
  subLabel,
}: {
  label: string;
  value: string;
  accent?: 'cyan' | 'green' | 'pink';
  subLabel?: string;
}) => {
  const accentClass =
    accent === 'cyan'
      ? 'text-cyan-700 dark:text-cyan-300'
      : accent === 'green'
        ? 'text-green-700 dark:text-green-400'
        : accent === 'pink'
          ? 'text-pink-700 dark:text-osu-pink'
          : 'text-gray-900 dark:text-white';

  return (
    <div className="min-h-[5.25rem] rounded-lg border border-default bg-gray-50/80 px-4 py-3 dark:bg-white/[0.03]">
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
      <div className={`mt-1 text-xl font-extrabold tabular-nums ${accentClass}`}>{value}</div>
      {subLabel && (
        <div className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">{subLabel}</div>
      )}
    </div>
  );
};

const StatisticGrid = ({ items, extra = false }: { items: StatisticItem[]; extra?: boolean }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`grid gap-x-4 gap-y-3 ${
        extra ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-6'
      }`}
    >
      {items.map((item) => (
        <div key={item.key} className="min-w-0">
          <div
            className={`truncate text-[11px] font-bold uppercase tracking-wide ${STATISTIC_COLOR_CLASSES[item.color]}`}
            title={t(item.labelKey)}
          >
            {t(item.labelKey)}
          </div>
          <div className="mt-1 text-lg font-extrabold text-gray-900 tabular-nums dark:text-white">
            {item.value.toLocaleString()}
            {extra && item.maximumValue !== undefined && (
              <span className="ml-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                / {item.maximumValue.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const ActionButton = ({
  icon,
  label,
  onClick,
  disabled,
  primary = false,
  active = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
  primary?: boolean;
  active?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-bold transition-colors disabled:cursor-wait disabled:opacity-50 ${
      primary
        ? 'border-transparent bg-osu-pink text-slate-950 hover:brightness-105'
        : active
          ? 'border-osu-pink/40 bg-osu-pink/10 text-osu-pink hover:bg-osu-pink/15'
          : 'border-default bg-btn-bg text-text-primary hover:bg-btn-bg-hover'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default ScorePage;
