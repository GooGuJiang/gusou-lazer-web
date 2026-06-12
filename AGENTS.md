# AGENTS.md - 项目开发约束指南

## 项目概述

**gusou-lazer-web** 是一个基于 React 19 + TypeScript 的 osu! lazer 相关 Web 应用，使用 Vite 构建，Tailwind CSS 样式，pnpm 作为包管理器。

**仓库**: <https://github.com/GooGuJiang/gusou-lazer-web>

---

## 技术栈

| 类别        | 技术                                                                |
| ----------- | ------------------------------------------------------------------- |
| 框架        | React 19 (`^19.1.1`)                                                |
| 语言        | TypeScript (`~5.8.3`)，严格模式                                     |
| 构建工具    | Vite 7 (`^7.1.5`)                                                   |
| 包管理器    | pnpm                                                                |
| 路由        | React Router v6 (`^6.25.0`)，使用 `BrowserRouter`                   |
| 样式        | Tailwind CSS v3 (`^3.4.0`) + CSS 自定义属性（OKLCH 色彩空间）       |
| 状态管理    | React Context + useState / jotai (`^2.9.0`)                         |
| HTTP 客户端 | Axios (`^1.12.0`)，含拦截器的 API 客户端封装                        |
| 国际化      | react-i18next (`^15.7.3`)                                           |
| 动画        | framer-motion (`^11.3.6`) / motion (`^12.23.12`) / gsap (`^3.13.0`) |
| 图标        | lucide-react (`^0.542.0`) + react-icons (`^5.2.1`)                  |
| 部署        | Vercel                                                              |

---

## 严格约束（必须遵守）

### TypeScript 规则

1. **禁止使用 `any` 类型** — ESLint 规则 `@typescript-eslint/no-explicit-any: 'error'`，必须使用明确的类型定义
2. **禁止未使用的变量** — `noUnusedLocals: true`，`noUnusedParameters: true`
3. **禁止未使用的 import** — `@typescript-eslint/no-unused-vars: 'error'`
4. **必须使用 `const`** — `prefer-const: 'error'`，不可变引用使用 `const`
5. **严格模式** — `strict: true`，所有代码必须通过严格类型检查
6. **使用 `import type` 导入类型** — `verbatimModuleSyntax: true` 要求类型导入必须使用 `import type` 语法
7. **仅允许可擦除语法** — `erasableSyntaxOnly: true`，不要使用需要运行时转换的 TypeScript 语法（如 `enum`、`namespace`），使用 `const` 对象或类型别名替代

### 代码风格

1. **组件导出必须单一** — ESLint 规则 `react-refresh/only-export-components: 'error'`，每个文件只导出一个组件（默认导出或具名导出）
2. **console 语句限制** — 构建时通过 `vite-plugin-remove-console` 移除 `console.log` 等调试语句，仅保留 `console.error` 和 `console.warn`
3. **中文注释** — 项目中已有中文注释的习惯，新代码建议使用中文注释以保持一致性

---

## 项目结构

```
src/
├── App.tsx              # 路由定义（React Router v6 扁平结构）
├── main.tsx             # 应用入口（StrictMode + i18n 初始化）
├── index.css            # 全局样式入口（Tailwind 指令）
├── assets/              # 静态资源
├── components/          # 组件目录（按功能模块分子目录）
│   ├── Auth/            # 认证相关组件
│   ├── BBCode/          # BBCode 渲染
│   ├── Beatmap/         # 谱面相关组件
│   ├── Chat/            # 聊天功能
│   ├── Device/          # 设备管理
│   ├── Home/            # 首页组件
│   ├── Layout/          # 布局组件（Navbar、侧边栏等）
│   ├── Preferences/     # 偏好设置
│   ├── Rankings/        # 排行榜
│   ├── Score/           # 分数相关
│   ├── Settings/        # 设置页面组件
│   ├── Teams/           # 组队功能
│   ├── TOTP/            # TOTP 双因素认证
│   ├── UI/              # 通用 UI 组件（按钮、模态框等）
│   ├── User/            # 用户相关组件
│   └── VerificationModal/ # 验证模态框
├── contexts/            # React Context（Auth、Notification、ProfileColor、Verification）
├── data/                # 静态数据
├── docs/                # 项目文档
├── hooks/               # 自定义 Hooks
├── i18n/                # 国际化配置和语言包
│   ├── index.ts         # i18next 初始化
│   ├── resources.ts     # 语言资源注册
│   └── locales/         # 语言文件（zh / en / ja / ko 等）
├── pages/               # 页面组件（一个页面一个文件）
├── styles/              # 额外样式文件（bbcode.css 等）
├── types/               # TypeScript 类型定义（按领域划分）
└── utils/               # 工具函数
    ├── api/             # API 请求模块（按领域划分）
    │   ├── client.ts    # Axios 实例 + 拦截器（token 刷新逻辑）
    │   ├── config.ts    # API 配置
    │   └── ...          # 各领域 API（auth、user、beatmap 等）
    └── ...              # 其他工具函数
```

---

## 编码规范

### 文件命名

- **组件文件**: PascalCase `.tsx`（如 `Navbar.tsx`、`HomePage.tsx`）
- **Hooks 文件**: camelCase `.ts`，以 `use` 开头（如 `useAuth.ts`）
- **工具文件**: camelCase `.ts`（如 `bbcodeParser.ts`、`imageUtils.ts`）
- **类型文件**: camelCase `.ts`（如 `user.ts`、`beatmap.ts`）
- **样式文件**: camelCase `.css`（如 `bbcode.css`、`index.css`）

### 组件编写规范

1. **使用函数组件 + Hooks**，不使用 class 组件
2. **页面组件放在 `src/pages/`**，一个页面对应一个文件
3. **可复用组件放在 `src/components/`**，按功能模块分子目录
4. **通用 UI 组件放在 `src/components/UI/`**
5. **组件默认导出**（`export default`）用于页面，具名导出用于子组件

示例模式：

```tsx
// src/pages/SomePage.tsx
import { useTranslation } from 'react-i18next';

export default function SomePage() {
  const { t } = useTranslation();

  return <div className="...">{/* ... */}</div>;
}
```

### 自定义 Hooks 规范

1. **放在 `src/hooks/`** 目录
2. **命名以 `use` 开头**
3. **封装可复用的状态逻辑**（如 `useAuth`、`useDebounce`、`useTheme`）

### API 请求规范

1. **所有 HTTP 请求通过 `src/utils/api/client.ts` 导出的 `api` Axios 实例进行**
2. **不要直接使用 `axios` 或 `fetch`**（token 刷新逻辑在 client.ts 拦截器中统一处理）
3. **API 模块按领域划分**：`src/utils/api/user.ts`、`src/utils/api/beatmap.ts` 等
4. **设备标识**: 所有请求自动附带 `X-UUID` header（由拦截器处理）
5. **API 版本**: 请求头自动包含 `x-api-version: '20250913'`
6. **环境变量**: API 地址通过 `VITE_API_BASE_URL` 环境变量配置

### 类型定义规范

1. **类型定义放在 `src/types/`**，按领域划分文件（`user.ts`、`beatmap.ts` 等）
2. **通过 `src/types/index.ts`** 统一导出
3. **使用 `interface` 定义对象结构，`type` 定义联合类型和工具类型**
4. **导入类型必须使用 `import type` 语法**

### 状态管理规范

1. **全局状态使用 React Context**（`src/contexts/`）
   - `AuthContext` — 认证状态
   - `NotificationContext` — 通知状态
   - `ProfileColorContext` — 主题颜色
   - `VerificationContext` — 用户验证
2. **轻量级全局状态可使用 jotai**
3. **局部状态使用 `useState`**
4. **缓存策略**: 使用 `sessionStorage` 缓存认证信息，`src/utils/apiCache.ts` 管理 API 缓存

---

## 样式规范

### Tailwind CSS 使用

1. **使用 Tailwind 工具类** 作为主要样式方式
2. **使用项目自定义颜色**：`bg-card`、`text-text-primary`、`border-border-color` 等（定义在 `tailwind.config.js` 中的 OKLCH 色彩变量）
3. **深色模式**: 使用 `dark:` 前缀，基于 `class` 策略切换
4. **自定义 CSS 组件类**: 在 `src/styles/index.css` 的 `@layer components` 中定义可复用样式（如 `.card-base`、`.card-standard`、`.float-panel`、`.modal-card`）
5. **毛玻璃效果**: 使用 `.glass-morphism` 或 `.glass-effect` 类
6. **用户可自定义主题色**: 通过 `--hue` CSS 变量实现 OKLCH 色彩空间动态调色

### CSS 文件组织

- `src/index.css` — Tailwind 指令 + 全局样式
- `src/styles/index.css` — 自定义组件类 + 主题变量
- `src/styles/bbcode.css` — BBCode 渲染样式

---

## 国际化 (i18n)

1. **使用 `react-i18next`** 进行国际化
2. **支持语言**: 中文 (zh)、英文 (en)、日文 (ja)、韩文 (ko) 等
3. **翻译 key 统一定义在 `src/i18n/locales/` 目录**
4. **组件中使用 `useTranslation()` hook** 获取 `t` 函数
5. **添加新翻译时，需要在所有语言文件中同步添加对应 key**
6. **入口初始化**: `src/main.tsx` 中 `import './i18n'` 触发初始化

---

## 环境变量

| 变量名                    | 说明                                           |
| ------------------------- | ---------------------------------------------- |
| `VITE_API_BASE_URL`       | API 服务器地址（默认 `http://127.0.0.1:8000`） |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile 验证站点密钥              |

环境变量文件：

- `.env.example` — 模板文件（已提交到仓库）
- `.env` — 实际配置（不要提交到仓库）

---

## 开发命令

```bash
# 安装依赖（必须使用 pnpm）
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本（TypeScript 类型检查 + Vite 构建）
pnpm build

# ESLint 代码检查
pnpm lint

# 预览构建结果
pnpm preview
```

---

## 开发注意事项

1. **包管理器必须使用 pnpm**，不要使用 npm 或 yarn
2. **修改 API 相关代码时**，注意 `client.ts` 中的 token 刷新队列逻辑，避免重复刷新
3. **新增页面路由**：在 `src/App.tsx` 中添加 `<Route>` 定义
4. **新增组件目录**：遵循 `src/components/模块名/` 的结构
5. **构建会自动移除 `console.log`**，仅保留 `console.error` 和 `console.warn`
6. **TypeScript 编译检查是构建的一部分**（`tsc -b && vite build`），构建前确保类型无误
7. **Tailwind 配置中已启用 line-clamp 插件**（`@tailwindcss/line-clamp`）
8. **部署目标为 Vercel**，`vercel.json` 包含部署配置
9. **使用 `import type` 导入类型**，不要混用普通 import 导入类型

---

## Git 规范

- 主分支: 根据远程仓库设置（GitHub remote: `origin`）
- 提交前确保 `pnpm lint` 和 `pnpm build` 通过
- 不要提交 `node_modules/`、`dist/`、`.env` 等文件（参见 `.gitignore`）
