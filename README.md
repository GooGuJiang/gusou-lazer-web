# gusou-lazer-web

> [!IMPORTANT]
> **本项目是 osu! 相关项目，为上游服务器的模拟实现 g0v0 server 提供 Web 客户端。**
>
> - 我们（GooGuTeam）与 ppy Pty Ltd、peppy 或 team osu! 无关。此项目未获得其支持，也未获得其认可。
> - **osu!** 和 **ppy** 是 **ppy Pty Ltd** 的注册商标。
> - 请支持原项目：在[官方服务器](https://osu.ppy.sh)游玩，并考虑成为[支持者](https://osu.ppy.sh/home/support)，帮助支持上游开发。
> - 对于上游的问题和改进，请向[上游仓库](https://github.com/ppy/osu-web)提交 issue / PR，或前往[上游反馈论坛](https://osu.ppy.sh/community/forums/5)。请勿因 g0v0! 的特有问题联系上游团队，此类问题应反馈到对应的 GooGuTeam 下的仓库。
> - 如果尚未玩过原版游戏，请先[下载并体验官方客户端](https://osu.ppy.sh/home/download)。本项目并非原项目的替代品。

面向 g0v0 server 的 Next.js Web 客户端。公开页面由 App Router 按请求服务端渲染，并通过 `/en` 与 `/zh` 提供独立的可索引语言版本。

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
