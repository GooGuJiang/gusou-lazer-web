import Link from 'next/link';

import type { User } from '@types/user';

interface NavBarProps {
  user: User | null;
}

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/profile', label: '我的资料' },
  { href: '/rankings/osu', label: '排行榜' },
];

export default function NavBar({ user }: NavBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-sky-300">
          Gusou Lazer
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-white/80">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/80 px-3 py-1 text-sm text-white transition hover:border-sky-400/60 hover:text-sky-200"
            >
              <span className="font-semibold">{user.username}</span>
              <span className="text-xs text-white/60">已登录</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-sky-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
            >
              登录账号
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
