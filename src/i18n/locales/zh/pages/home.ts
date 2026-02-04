export const homePage = {
  hero: {
    tagline: '可能是最好的 osu! 私服',
    descriptionPrefix: 'g0v0! 是一个全新的',
    descriptionHighlight: '支持 lazer 客户端',
    descriptionSuffix:
      '的 osu! 第三方服务器。提供了 standard / taiko / catch / mania 四大模式支持，支持 RX/AP pp计算与无限制改名，让你的节奏旅程更自由。',
    statusOperational: '服务正常运行中',
    statusCommunity: '加入 QQ / Discord 社区获取支持与更新',
    joinCta: '快来加入',
    viewProfile: '查看资料',
    viewRankings: '查看排行榜',
    register: '注册',
    login: '登录',
    featuresTitle: '功能特色',
    featuresSubtitle: '探索我们为您提供的丰富功能和特色服务',
    community: {
      qq: 'QQ群',
      discord: 'Discord',
      github: 'GitHub',
      discordTag: '咕哦!',
    },
  },

  features: {
    items: [
      {
        title: '全平台支持',
        content:
          'g0v0! 专为 lazer 而打造，这意味着您可在任何支持 osu! lazer 的系统上游玩 g0v0! 而不受平台限制',
        imageAlt: '全平台支持',
      },
      {
        title: '谱面加速下载',
        content:
          '我们使用了 Sayobot 的谱面镜像加速服务来处理国内玩家的高速下载需求，让谱面下载不再漫长等待',
        imageAlt: '谱面加速下载',
      },
      {
        title: '活跃的社区支持',
        content:
          '我们拥有活跃的官方 QQ 社群和 Discord 服务器，为大家提供了一个绝佳的求助/炫耀/吹水平台',
        imageAlt: '活跃的社区支持',
      },
      {
        title: '最强客制化',
        content:
          '我们支持随意改名，上传自定义头图，以及创建花哨的个人简介和签名，在这里充分发挥您的想象力',
        imageAlt: '最强客制化',
      },
      {
        title: '开发者友好',
        content:
          '我们的服务端完全按照官方的 osu! v1/v2 API 规范设计，让您更加方便快速的接入bot/服务到 g0v0!',
        imageAlt: '开发者友好',
      },
      {
        title: '开源开放',
        content:
          '服务端/客户端全部开源免费，服务端还提供了 Hooks 支持，可通过插件来扩充服务端能力（开发中）',
        imageAlt: '开源开放',
      },
      {
        title: '允许用户谱面提交',
        content:
          '我们允许您提交自制的谱面或在官方服务器中无法计算 pp 的未上榜谱面并通过审核（开发中）',
        imageAlt: '允许用户谱面提交',
      },
      {
        title: 'rulesets排行',
        content:
          '我们支持自定义 ruleset 模式的分数计算和成绩上传，并提供完善的排行榜支持（开发中）',
        imageAlt: 'rulesets排行',
      },
    ],
  },
} as const;
