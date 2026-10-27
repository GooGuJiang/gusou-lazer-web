# gusou-lazer-web

面向 g0v0! / osu! lazer 生态的 Next.js Web 客户端。公开页面由 App Router 按请求服务端渲染，并通过 `/en` 与 `/zh` 提供独立的可索引语言版本。

## 本地开发

```bash
pnpm install
pnpm dev
```

生产构建与运行：

```bash
pnpm build
pnpm start
```

环境变量参见 `.env.example`。`NEXT_PUBLIC_SITE_URL` 用于 canonical、hreflang、Open Graph、robots 和 sitemap 的绝对 URL；`BEATMAPSETS_SSR_ACCESS_TOKEN` 仅供服务端预取谱面搜索结果使用，不得以 `NEXT_PUBLIC_` 开头。

## SEO 与多语言

- `/` 会根据语言 Cookie 和 `Accept-Language` 重定向到 `/en` 或 `/zh`。
- 每个公开路由均输出本地化 title、description、canonical、hreflang、Open Graph、Twitter Card 和 JSON-LD。
- `/robots.txt`、`/sitemap.xml` 与 `/manifest.webmanifest` 由 Next.js Metadata API 生成。
- 登录、设置、私信和 OAuth 等非公开页面会输出 `noindex, nofollow`。

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0-only)**.  
Any derivative work, modification, or deployment **MUST clearly and prominently attribute** the original authors:  
**GooGuTeam - https://github.com/GooGuTeam/g0v0-server**
