# AGENTS.md

## 项目定位

`gusou-lazer-web` 是面向 g0v0 / osu! lazer 生态的 React Web 客户端，同时支持浏览器端单页应用（SPA）和部分页面的服务端渲染（SSR）。

- 仓库：<https://github.com/GooGuJiang/gusou-lazer-web>
- API 服务默认地址：`https://lazer-api.g0v0.top`
- OpenAPI 参考：<https://lazer-api.g0v0.top/openapi.json>
- 许可证：AGPL-3.0-only。任何修改、衍生或部署都必须显著署名 `GooGuTeam - https://github.com/GooGuTeam/g0v0-server`。

本文件汇总当前仓库的开发约束。实现细节以现有代码以及 `package.json`、TypeScript、ESLint、Prettier 和 Vite 配置为准。

## 技术栈

| 范畴       | 当前实现                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| 框架       | React 19、React DOM 19、TypeScript 5.8                                   |
| 构建与开发 | Vite 7、pnpm、ESM                                                        |
| 路由       | React Router v6，客户端 `BrowserRouter` 与 SSR `StaticRouter`            |
| 样式       | Tailwind CSS 3、CSS 自定义属性、OKLCH 主题色                             |
| HTTP       | Axios，共享拦截器处理认证、设备标识和 token 刷新                         |
| 状态       | React Context、Hooks、局部 `useState`                                    |
| 国际化     | i18next、react-i18next，目前支持 `en` 和 `zh`                            |
| UI 与动画  | lucide-react、react-icons、Headless UI、Floating UI、Framer Motion、GSAP |
| 部署       | Vercel，`api/render.js` 提供 SSR 函数                                    |

## 项目结构

```text
.
├── api/
│   └── render.js                 # Vercel SSR 入口，失败时回退到 SPA
├── public/                       # 直接静态资源
├── src/
│   ├── App.tsx                   # 路由树，支持 browser/static 两种路由模式
│   ├── main.tsx                  # 浏览器入口，按服务端 HTML 选择 hydrate 或 createRoot
│   ├── entry-server.tsx          # SSR 渲染与页面预取入口
│   ├── index.css                 # 全局样式入口，导入 styles/index.css
│   ├── assets/                   # 由 Vite 打包的资源
│   ├── components/               # 可复用 UI，按业务域拆分
│   │   ├── Auth/ Beatmap/ Chat/ Device/ Home/ Preferences/
│   │   ├── Rankings/ Score/ Settings/ Teams/ TOTP/ User/
│   │   ├── Layout/               # Layout、Navbar 等页面骨架
│   │   ├── UI/                   # 跨业务的通用组件
│   │   └── VerificationModal/ BBCode/
│   ├── contexts/                 # Auth、通知、验证、主题色 Context 及配套 hooks/core
│   ├── data/                     # 静态业务数据
│   ├── docs/                     # 功能设计与架构说明
│   ├── hooks/                    # 跨组件复用的状态逻辑
│   ├── i18n/
│   │   ├── index.ts              # i18next 初始化和语言选择
│   │   ├── resources.ts          # 语言资源汇总及语言类型
│   │   └── locales/en|zh/        # 分领域语言包
│   ├── pages/                    # 路由页面组件
│   ├── styles/                   # Tailwind 入口、主题变量和专项 CSS
│   ├── types/                    # 共享领域类型，通过 types/index.ts 汇总导出
│   └── utils/
│       ├── api/                  # API 客户端、领域 API 模块、错误处理
│       ├── apiCache.ts           # API 缓存工具
│       ├── userPageSsr.ts        # 用户页 SSR 数据契约和注入
│       └── beatmapsetsSsr*.ts    # 谱面集 SSR 数据契约和服务端请求
├── server.js                     # 本地 SSR 开发服务器
├── vercel.json                   # Vercel headers、SSR rewrites 和函数配置
├── vite.config.ts                # React、移除 console、SSR 构建配置
├── tailwind.config.js             # Tailwind 扫描范围、断点和主题 token
└── .env.example                  # 非敏感环境变量模板
```

## 强制约束

### TypeScript 与质量

- 采用严格 TypeScript，已开启 `strict`、未使用本地变量和参数检查。
- 禁止 `any`。对于不确定的数据，请用明确的 `interface`、`type`、泛型、`unknown` 和类型守卫来表达。
- 为满足 `verbatimModuleSyntax`，类型导入必须使用 `import type`。
- `erasableSyntaxOnly` 已启用，不要新增 `enum`、`namespace` 或其他需要运行时 TypeScript 转换的语法。
- 不可重新赋值的引用一律使用 `const`。
- 禁止未使用的变量、参数和导入；提交前需通过 `pnpm lint`。
- React Fast Refresh 约束已开启。导出 React 组件的模块不要混入非组件值，请将 hook、常量、类型或 Context core 拆分到独立文件，沿用 `notificationContextCore.ts`、`useNotificationContext.ts` 等现有模式。
- 默认使用函数组件和 Hooks；页面组件使用默认导出，普通组件遵循相邻模块的既有导出方式。
- 仅在逻辑难以直接理解时添加简洁的中文注释，不要添加复述代码含义的注释。

### 命名与模块边界

- 页面和组件文件采用 PascalCase，例如 `BeatmapsetsPage.tsx`、`UserProfileLayout.tsx`。
- 自定义 Hook 采用 camelCase 并以 `use` 开头，例如 `useTheme.ts`。
- 工具、API、类型和数据文件采用 camelCase，例如 `apiCache.ts`、`beatmap.ts`。
- 新路由页面放在 `src/pages/`，并在 `src/App.tsx` 的嵌套路由中注册。
- 复用组件放在对应的业务目录，只有跨业务通用组件才放入 `src/components/UI/`。
- 跨业务领域类型放在 `src/types/` 并由 `src/types/index.ts` 导出；仅单个模块使用的类型可就近定义。
- 不做与当前需求无关的目录迁移、批量重命名或重构。

### 格式与日志

- Prettier 是唯一的格式化标准：2 空格、100 列、单引号、分号、ES5 trailing comma、LF。
- 开发时避免遗留调试日志。生产构建会通过 `vite-plugin-remove-console` 删除除 `console.error` 和 `console.warn` 之外的 `console` 调用。
- 不要用 `// eslint-disable` 或 TypeScript 忽略注释来规避类型和 lint 问题，除非有具体的兼容性原因且改动范围最小。

## API 规范

### 接口契约

- 新增或修改接口前，先查阅 [OpenAPI 文档](https://lazer-api.g0v0.top/openapi.json)。路径、HTTP 方法、字段、响应和状态码均以该文档为准，不要凭经验猜测。
- API 基地址从 `VITE_API_BASE_URL` 读取，未设置时回退到 `https://lazer-api.g0v0.top`。不要在业务模块中复制硬编码基地址。
- API 模块按领域放在 `src/utils/api/`，例如 `user.ts`、`beatmap.ts`、`teams.ts`；需要对外复用时从 `src/utils/api/index.ts` 汇总导出。
- 新增的共享返回类型应放在 `src/types/`，并与 OpenAPI schema 保持一致。

### 请求客户端与认证

- 普通浏览器 API 请求默认使用 `src/utils/api/client.ts` 导出的 `api` Axios 实例，它统一处理 `Authorization`、`X-UUID`、默认 `x-api-version: 20250913` 以及 401 token 刷新队列。
- 不要在业务组件中直接发起 HTTP 请求，应封装在领域 API 模块中。
- OAuth 表单请求、浏览器文件上传以及 SSR 预取是现有例外。只有共享 `api` 无法正确表达请求时才直接使用 Axios 或 `fetch`，并显式补齐该接口需要的认证、`X-UUID` 和 `x-api-version` 请求头。
- 修改 token 刷新、验证处理器或缓存清理逻辑时，必须考虑并发 401 请求、刷新请求自身失败和重试循环，避免绕过 `client.ts` 的队列。
- 浏览器 token 存放在 `localStorage`，认证用户缓存位于 `sessionStorage`。修改登录、登出或用户更新流程时，需同步维护 token、缓存和 Context 状态。
- 不要新增、提交或在客户端暴露真实 access token、服务端密钥或其他机密，`VITE_` 前缀的环境变量会进入浏览器包。

## 状态、路由与 SSR

### 状态管理

- 组件内的局部交互状态使用 `useState` 或现有自定义 Hook。
- 跨页面状态优先复用现有 Context：`AuthProvider`、`ProfileColorProvider`、`VerificationProvider`、`NotificationProvider`。其中通知 Provider 由 `Layout` 按认证状态挂载，音频 Provider 挂载在应用根部。
- 不要为短生命周期的局部状态新增全局 Context 或全局 store。

### 路由与渲染

- 所有页面路由都维护在 `src/App.tsx` 的 `<Layout />` 子路由下，新增页面时需同步处理导航入口、鉴权和 404 行为。
- `main.tsx` 在服务端已有根节点内容时调用 `hydrateRoot`，否则调用 `createRoot`，不要破坏这个分支。
- `entry-server.tsx` 通过 `StaticRouter` 渲染，目前会预取用户页和谱面集搜索页数据，并将 JSON payload 注入 HTML。
- SSR 可触达的模块不得在模块初始化或渲染阶段直接使用 `window`、`document`、`localStorage`、`sessionStorage` 或 `navigator`。确有必要时，使用 `typeof window !== 'undefined'` 等运行时保护，或放入 Effect。
- 修改 provider 树、路由或需要预取的页面时，应保持 `main.tsx` 与 `entry-server.tsx` 的应用树一致，并核对 Vercel rewrite 是否需要同步调整。
- 服务端预取使用原生 `fetch` 是合理例外。它不能依赖浏览器存储或 Axios 浏览器拦截器，必须自行构建请求头和认证信息。

## 样式与界面

- 优先使用 Tailwind 工具类，并复用 `tailwind.config.js` 中的断点、颜色 token 和字体配置。
- 全局主题变量和组件类位于 `src/styles/index.css`，由 `src/index.css` 导入。新全局样式或可复用样式应放入正确的 layer 或现有样式文件，不要在页面内重复定义。
- 颜色优先使用 CSS 变量和 Tailwind 映射，例如 `bg-card`、`bg-page`、`text-text-primary`、`text-text-secondary`、`border-default`，以支持亮色、深色和用户色相主题。
- 主题切换依赖根元素的 `dark` class，用户主题色通过 `--hue`、`--profile-color` 等变量驱动。不要写死背景、文字和边框颜色，以免破坏主题。
- 保持现有的响应式断点、可访问性语义、键盘交互以及加载/错误/空状态。图标优先使用 `lucide-react` 或项目现有图标库，不要手写重复的 SVG 图标。

## 国际化

- 用户可见的新文案应通过 `useTranslation()` 和 `t()` 提供，不要只在某个页面硬编码单一语言。
- 翻译按领域维护在 `src/i18n/locales/en/` 与 `src/i18n/locales/zh/`，新增文案时两种语言必须同步增加相同的 key。
- 新语言资源需要在 `src/i18n/resources.ts` 注册，并同步更新 `AppLanguages`、语言选择器和 `supportedLanguages`。
- 不要修改已有 key 的语义或层级来复用不匹配的文案。

## 环境变量与部署

| 变量                           | 用途                                   | 作用域                |
| ------------------------------ | -------------------------------------- | --------------------- |
| `VITE_API_BASE_URL`            | API 服务基地址                         | 浏览器与 SSR 构建可见 |
| `VITE_TURNSTILE_SITE_KEY`      | Cloudflare Turnstile 站点 key          | 浏览器可见            |
| `PORT`                         | `server.js` 本地 SSR 端口，默认 `5173` | 本地 Node 进程        |
| `BEATMAPSETS_SSR_ACCESS_TOKEN` | 谱面集 SSR 请求认证 token              | 仅服务端环境          |

- `.env.example` 只放可公开的模板值；`.env`、`.env.local` 和任何真实凭据不得提交。
- 部署使用 `vercel.json`：`/users/*` 和 `/beatmapsets` 转发到 `api/render.js`，其他路由回退到客户端 `index.html`。变更 SSR 覆盖范围时需一并更新该文件。
- 生产构建会生成客户端 `dist/` 和服务端 `dist/server/` 产物，不要提交构建产物。

## 开发与验证

```bash
# 安装依赖，只使用 pnpm
pnpm install

# 浏览器端 Vite 开发服务器
pnpm dev

# 本地 SSR 开发服务器
pnpm dev:ssr

# 类型检查、客户端构建和 SSR 构建
pnpm build

# 部署构建脚本
pnpm vercel-build

# 静态检查和格式校验
pnpm lint
pnpm format:check

# 自动格式化，命令会改写文件
pnpm format

# 预览客户端构建产物
pnpm preview
```

- 当前没有配置自动化测试脚本。涉及代码改动时，最低执行 `pnpm lint` 和 `pnpm build`；仅文档改动至少执行 `pnpm format:check`。
- 涉及路由、SSR、认证、上传、主题或响应式界面的改动，需要在对应的浏览器流程中手动验证，并覆盖必要的窄屏视图。
- 不修改无关文件，不提交 `node_modules/`、`dist/`、`.env` 或本地编辑器文件。
