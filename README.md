# gusou-lazer-web

面向 g0v0 server 的 Next.js Web 客户端。公开页面由 App Router 按请求服务端渲染，并通过 `/en` 与 `/zh` 提供独立的可索引语言版本。

> [!IMPORTANT]
> **gusou-lazer-web 是一个非官方的社区项目，是面向 g0v0-server 的 Web 客户端。**
>
> - 本项目与 **ppy Pty Ltd** 及上游开发团队**没有任何隶属、背书或支持关系**。
> - 上游名称、「lazer」代号及相关品牌均为 **ppy Pty Ltd** 的商标。本站点展示的账号、成绩与排名来自社区服务器，与官方服务器**完全独立**，不计入官方排行榜。
> - **请支持原项目。**上游游戏免费且持续维护，没有它就没有这个项目。如果你喜欢音游，最好的支持方式是：
>   - 在[官方服务器](https://osu.ppy.sh)游玩——那里的成绩计入真正的排行榜。
>   - 成为 [supporter](https://osu.ppy.sh/home/support)——直接资助上游开发。
>   - 游戏本身的问题请到[上游仓库](https://github.com/ppy/osu)反馈，不要为本项目的问题打扰上游团队。

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
