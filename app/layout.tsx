import type { Metadata } from 'next';
import { Suspense } from 'react';

import { TopProgressBar } from '@components/layout/TopProgressBar';
import NavBar from '@components/layout/NavBar';
import { getCurrentUser } from '@lib/users';

import './globals.css';

export const metadata: Metadata = {
  title: 'Gusou Lazer',
  description: 'Next.js 重构版本的 Gusou Lazer 前端',
};

async function LayoutNavBar() {
  try {
    const user = await getCurrentUser();
    return <NavBar user={user} />;
  } catch (error) {
    console.error('Failed to fetch current user', error);
    return <NavBar user={null} />;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-950 text-white">
        <TopProgressBar />
        <Suspense fallback={null}>
          {/* 顶栏需要使用服务器渲染 */}
          {/* @ts-expect-error Async Server Component */}
          <LayoutNavBar />
        </Suspense>
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">{children}</main>
      </body>
    </html>
  );
}
