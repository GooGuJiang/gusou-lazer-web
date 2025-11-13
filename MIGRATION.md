# Next.js Migration Guide / Next.js 迁移指南

This document explains the migration from Vite + React to Next.js with SSR support.

本文档说明了从 Vite + React 到支持 SSR 的 Next.js 的迁移。

## Quick Start / 快速开始

```bash
# Install dependencies / 安装依赖
npm install

# Development mode / 开发模式
npm run dev

# Build for production / 构建生产版本
npm run build

# Start production server / 启动生产服务器
npm run start

# Lint code / 代码检查
npm run lint
```

## Major Changes / 主要变更

### 1. Project Structure / 项目结构

```
Before (Vite):
src/
  ├── App.tsx           # Main app component
  ├── main.tsx          # Entry point
  ├── pages/            # Page components
  └── components/       # Reusable components

After (Next.js):
src/
  ├── app/              # Next.js App Router
  │   ├── layout.tsx    # Root layout
  │   ├── page.tsx      # Homepage
  │   └── */page.tsx    # Other pages
  ├── page-components/  # Page components (renamed from pages/)
  └── components/       # Reusable components
```

### 2. Routing / 路由

**Before (React Router):**
```tsx
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';

<Link to="/profile">Profile</Link>
const navigate = useNavigate();
const location = useLocation();
const { id } = useParams();
```

**After (Next.js):**
```tsx
import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';

<Link href="/profile">Profile</Link>
const router = useRouter();
const pathname = usePathname();
const params = useParams();
const id = params?.id;
```

### 3. Environment Variables / 环境变量

**Before:**
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const isDev = import.meta.env.DEV;
```

**After:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const isDev = process.env.NODE_ENV === 'development';
```

### 4. Server-Side Rendering / 服务端渲染

All pages that need client-side features are marked with:

所有需要客户端功能的页面都标记为:

```tsx
'use client';

export const dynamic = 'force-dynamic'; // For dynamic pages

export default function MyPage() {
  // Component code
}
```

### 5. Navigation / 导航

**Router Methods / 路由方法:**
- `router.push('/path')` - Navigate to a page
- `router.back()` - Go back (was `navigate(-1)`)
- `router.replace('/path')` - Replace current route
- `router.refresh()` - Refresh the page

### 6. Dynamic Routes / 动态路由

**File structure / 文件结构:**
```
app/
  users/
    [userId]/
      page.tsx    # Route: /users/:userId

  teams/
    [teamId]/
      page.tsx    # Route: /teams/:teamId
      edit/
        page.tsx  # Route: /teams/:teamId/edit
```

**Usage / 使用:**
```tsx
'use client';

export default function UserPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId; // Handle null safety
  
  // ...
}
```

## Configuration Files / 配置文件

### next.config.js

Main Next.js configuration including:
- Image optimization domains
- API rewrites (proxy to backend)
- CORS headers
- Transpile packages

主要的 Next.js 配置包括:
- 图片优化域名
- API 重写 (代理到后端)
- CORS 头
- Transpile 包

### tsconfig.json

Updated for Next.js with:
- `jsx: "preserve"` for Next.js
- Path aliases: `@/*` → `./src/*`
- Next.js plugin support

## Features / 功能特性

### ✅ Maintained / 保留的功能
- All existing routes and pages
- Authentication system
- i18n (internationalization)
- Theme switching
- Audio player
- All UI components
- All context providers

### ✅ Improved / 改进的功能
- **Performance**: SSR, automatic code splitting, optimized images
- **SEO**: Server-rendered HTML, better metadata
- **Development**: Turbopack for faster builds, better HMR

### 🔄 Changed / 变更的内容
- Routing system (React Router → Next.js App Router)
- Build tool (Vite → Next.js/Turbopack)
- Environment variable prefix (VITE_ → NEXT_PUBLIC_)

## Troubleshooting / 故障排除

### Build Issues / 构建问题

**Error: "useAuth must be used within an AuthProvider"**
- Make sure the page has `'use client'` directive
- Check that providers are properly set up in `app/providers.tsx`

**Error: "document is not defined"**
- Add `'use client'` to components using browser APIs
- Use dynamic imports with `ssr: false` if needed

### Development Issues / 开发问题

**Hot reload not working**
- Clear `.next` folder: `rm -rf .next`
- Restart dev server: `npm run dev`

**TypeScript errors**
- Check tsconfig.json is properly configured
- Run `npm run build` to see all errors

## Migration Checklist / 迁移检查清单

If you need to migrate more pages or add new features:

如果您需要迁移更多页面或添加新功能:

- [ ] Create page file in `app/` directory
- [ ] Add `'use client'` if using client-side features
- [ ] Add `export const dynamic = 'force-dynamic'` for dynamic content
- [ ] Update imports from React Router to Next.js
- [ ] Test the page in development
- [ ] Build and test in production

## Resources / 资源

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

---

**Migration completed successfully!** 迁移成功完成！🎉
