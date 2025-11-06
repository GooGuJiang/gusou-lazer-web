import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { getCountryRankings, getTeamRankings, getUserRankings } from '@lib/rankings';
import { formatAccuracy, formatNumber, formatRank, formatScore } from '@/utils/format';

interface RankingsPageProps {
  params: {
    ruleset: string;
  };
  searchParams?: {
    type?: 'users' | 'teams' | 'countries';
    sort?: string;
  };
}

const TYPE_LABELS: Record<'users' | 'teams' | 'countries', string> = {
  users: '个人排行榜',
  teams: '战队排行榜',
  countries: '地区排行榜',
};

const SORT_LABELS: Record<string, string> = {
  performance: 'Performance',
  score: 'Ranked 分数',
};

export default async function RankingsPage({ params, searchParams }: RankingsPageProps) {
  const ruleset = params.ruleset;
  const type = searchParams?.type ?? 'users';
  const sort = searchParams?.sort ?? 'performance';

  if (!['users', 'teams', 'countries'].includes(type)) {
    notFound();
  }

  let rankingSection: ReactNode = null;

  if (type === 'users') {
    const data = await getUserRankings(ruleset, sort);
    rankingSection = data?.ranking ? (
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-lg shadow-sky-500/10">
        <table className="min-w-full divide-y divide-white/5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-white/60">
              <th className="px-6 py-3">排名</th>
              <th className="px-6 py-3">玩家</th>
              <th className="px-6 py-3">PP</th>
              <th className="px-6 py-3">准确率</th>
              <th className="px-6 py-3">Ranked 分数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.ranking.map((entry, index) => (
              <tr key={entry.user.id} className="text-sm text-white/80 hover:bg-white/5">
                <td className="px-6 py-4 font-semibold text-white">{formatRank(entry.user.statistics?.global_rank ?? index + 1)}</td>
                <td className="px-6 py-4">
                  <Link href={`/users/${entry.user.id}`} className="text-sky-300 hover:underline">
                    {entry.user.username}
                  </Link>
                </td>
                <td className="px-6 py-4">{formatNumber(entry.pp ?? entry.user.statistics?.pp ?? 0)} pp</td>
                <td className="px-6 py-4">{formatAccuracy(entry.hit_accuracy ?? entry.user.statistics?.hit_accuracy ?? 0)}</td>
                <td className="px-6 py-4">{formatScore(entry.ranked_score ?? entry.user.statistics?.ranked_score ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    ) : null;
  } else if (type === 'teams') {
    const data = await getTeamRankings(ruleset, sort);
    rankingSection = data?.ranking ? (
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-lg shadow-sky-500/10">
        <table className="min-w-full divide-y divide-white/5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-white/60">
              <th className="px-6 py-3">排名</th>
              <th className="px-6 py-3">战队</th>
              <th className="px-6 py-3">Performance</th>
              <th className="px-6 py-3">Ranked 分数</th>
              <th className="px-6 py-3">成员数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.ranking.map((entry, index) => (
              <tr key={entry.team_id} className="text-sm text-white/80 hover:bg-white/5">
                <td className="px-6 py-4 font-semibold text-white">#{index + 1}</td>
                <td className="px-6 py-4">{entry.team.name}</td>
                <td className="px-6 py-4">{formatNumber(entry.performance ?? 0)} pp</td>
                <td className="px-6 py-4">{formatScore(entry.ranked_score ?? 0)}</td>
                <td className="px-6 py-4">{entry.member_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    ) : null;
  } else {
    const data = await getCountryRankings(ruleset, sort);
    rankingSection = data?.ranking ? (
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-lg shadow-sky-500/10">
        <table className="min-w-full divide-y divide-white/5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-white/60">
              <th className="px-6 py-3">排名</th>
              <th className="px-6 py-3">地区</th>
              <th className="px-6 py-3">活跃玩家</th>
              <th className="px-6 py-3">Performance</th>
              <th className="px-6 py-3">Ranked 分数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.ranking.map((entry, index) => (
              <tr key={entry.code} className="text-sm text-white/80 hover:bg-white/5">
                <td className="px-6 py-4 font-semibold text-white">#{index + 1}</td>
                <td className="px-6 py-4">{entry.name}</td>
                <td className="px-6 py-4">{formatNumber(entry.active_users ?? 0)}</td>
                <td className="px-6 py-4">{formatNumber(entry.performance ?? 0)} pp</td>
                <td className="px-6 py-4">{formatScore(entry.ranked_score ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    ) : null;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl shadow-sky-500/10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{TYPE_LABELS[type as keyof typeof TYPE_LABELS]}</h1>
            <p className="mt-2 text-white/70">
              规则集：<span className="font-semibold text-sky-300">{ruleset}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['users', 'teams', 'countries'] as const).map(key => (
              <Link
                key={key}
                href={`/rankings/${ruleset}?type=${key}&sort=${sort}`}
                className={`rounded-full border px-4 py-1 text-sm transition ${
                  key === type
                    ? 'border-sky-400/50 bg-sky-500/20 text-sky-200'
                    : 'border-white/10 text-white/70 hover:border-sky-400/60 hover:text-sky-200'
                }`}
              >
                {TYPE_LABELS[key]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        {Object.entries(SORT_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/rankings/${ruleset}?type=${type}&sort=${key}`}
            className={`rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              key === sort
                ? 'border-sky-400/50 bg-sky-500/20 text-sky-200'
                : 'border-white/10 text-white/60 hover:border-sky-400/60 hover:text-sky-200'
            }`}
          >
            {label}
          </Link>
        ))}
      </section>

      {rankingSection ?? (
        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center">
          <p className="text-white/70">暂时没有可显示的排行榜数据。</p>
        </section>
      )}
    </div>
  );
}
