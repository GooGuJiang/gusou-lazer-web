import Link from 'next/link';

import { getCurrentUser } from '@lib/users';
import { formatAccuracy, formatNumber, formatRank, formatScore } from '@/utils/format';

interface ProfilePageProps {
  searchParams?: {
    ruleset?: string;
  };
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const ruleset = searchParams?.ruleset ?? 'osu';
  const user = await getCurrentUser(ruleset);

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center">
        <h2 className="text-2xl font-semibold text-white">需要登录</h2>
        <p className="mt-3 text-white/70">
          该页面使用服务器渲染，需要先登录才能查看你的个人资料。
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
        >
          前往登录
        </Link>
      </div>
    );
  }

  const stats = user.statistics ?? user.statistics_rulesets?.[ruleset];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl shadow-sky-500/10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{user.username}</h1>
            <p className="mt-2 text-white/70">用户 ID：{user.id}</p>
            <p className="mt-1 text-white/70">国家：{user.country?.name ?? user.country_code}</p>
            <p className="mt-1 text-white/70">加入时间：{new Date(user.join_date).toLocaleDateString()}</p>
            {user.team && (
              <p className="mt-1 text-white/70">
                战队：<span className="font-semibold text-sky-300">{user.team.name}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-400/40 bg-sky-500/20 px-4 py-1 text-sm font-semibold text-sky-200">
              模式：{ruleset}
            </span>
            <Link
              href={`/profile?ruleset=${ruleset === 'osu' ? 'mania' : 'osu'}`}
              className="rounded-full border border-white/10 px-4 py-1 text-sm text-white/70 transition hover:border-sky-400/60 hover:text-sky-200"
            >
              切换至 {ruleset === 'osu' ? 'mania' : 'osu'}
            </Link>
          </div>
        </div>
      </section>

      {stats ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">PP</h3>
            <p className="mt-2 text-3xl font-bold text-white">{formatNumber(stats.pp ?? 0)} pp</p>
            <p className="mt-1 text-sm text-white/60">全球排名 {formatRank(stats.global_rank ?? null)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">准确率</h3>
            <p className="mt-2 text-3xl font-bold text-white">{formatAccuracy(stats.hit_accuracy ?? 0)}</p>
            <p className="mt-1 text-sm text-white/60">最大连击 {formatNumber(stats.maximum_combo ?? 0)}x</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">游玩时长</h3>
            <p className="mt-2 text-3xl font-bold text-white">{formatNumber((stats.play_time ?? 0) / 3600)} 小时</p>
            <p className="mt-1 text-sm text-white/60">游玩次数 {formatNumber(stats.play_count ?? 0)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">总分</h3>
            <p className="mt-2 text-3xl font-bold text-white">{formatScore(stats.total_score ?? 0)}</p>
            <p className="mt-1 text-sm text-white/60">Ranked 分数 {formatScore(stats.ranked_score ?? 0)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">段位</h3>
            <p className="mt-2 text-3xl font-bold text-white">Lv.{stats.level?.current ?? 0}</p>
            <p className="mt-1 text-sm text-white/60">进度 {stats.level ? stats.level.progress.toFixed(1) : 0}%</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">成绩数量</h3>
            <p className="mt-2 text-3xl font-bold text-white">最佳成绩 {formatNumber(user.scores_best_count ?? 0)}</p>
            <p className="mt-1 text-sm text-white/60">最近成绩 {formatNumber(user.scores_recent_count ?? 0)}</p>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center">
          <p className="text-white/70">当前模式暂时没有统计数据。</p>
        </section>
      )}
    </div>
  );
}
