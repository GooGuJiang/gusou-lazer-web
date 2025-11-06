import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center">
      <h1 className="text-3xl font-bold text-white">页面不存在</h1>
      <p className="mt-3 text-white/70">无法找到请求的内容，或者该用户已隐藏资料。</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
      >
        返回首页
      </Link>
    </div>
  );
}
