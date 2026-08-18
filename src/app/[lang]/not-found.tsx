import Link from 'next/link';

const NotFound = () => (
  <main className="flex min-h-screen items-center justify-center bg-page px-6 text-center text-text-primary">
    <div>
      <p className="text-sm font-semibold text-osu-pink">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found / 页面未找到</h1>
      <Link className="mt-6 inline-flex text-osu-pink hover:underline" href="/">
        Return home / 返回首页
      </Link>
    </div>
  </main>
);

export default NotFound;
