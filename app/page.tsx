import Link from 'next/link';

import { getCurrentUser } from '@lib/users';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8 shadow-xl shadow-sky-500/5">
        <h1 className="text-3xl font-bold tracking-tight text-white">欢迎来到 Gusou Lazer</h1>
        <p className="mt-4 text-white/70">
          这个版本的站点已经重构为 Next.js 架构，核心页面通过服务器渲染直接返回数据，保证在加载时即可展示用户信息。
        </p>
        {user ? (
          <p className="mt-6 text-white/80">
            当前以 <span className="font-semibold text-sky-300">{user.username}</span> 身份登录，快去查看
            <Link href="/profile" className="mx-1 text-sky-300 underline underline-offset-4">
              个人资料
            </Link>
            或者浏览
            <Link href="/rankings/osu" className="mx-1 text-sky-300 underline underline-offset-4">
              全球排行榜
            </Link>
            吧。
          </p>
        ) : (
          <p className="mt-6 text-white/80">
            你还没有登录，
            <Link href="/login" className="text-sky-300 underline underline-offset-4">
              立即登录
            </Link>
            即可同步你的游戏进度。
          </p>
        )}
      </div>
    </section>
  );
}
