export const homePage = {
  hero: {
    tagline: '自由开放的节奏体验',
    descriptionPrefix: 'g0v0! 是一个自由开放的节奏游戏服务器，',
    descriptionHighlight: '支持 stable 和 lazer 双客户端',
    descriptionSuffix: '及 RX/AP pp 计算，旨在提供更自由的节奏体验。',
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
        title: '跨平台支持',
        content: 'g0v0! 支持多种桌面与移动平台，让您能在不同设备上享受节奏游戏。',
        imageAlt: '跨平台支持',
      },
      {
        title: '谱面加速下载',
        content:
          '我们使用了多种谱面镜像源加速服务，并支持自动检测可用性与智能切换，让谱面下载不再漫长等待',
        imageAlt: '谱面加速下载',
      },
      {
        title: '活跃的社区支持',
        content:
          '我们拥有活跃的官方 QQ 社群和 Discord 服务器，为大家提供了一个绝佳的求助/炫耀/吹水平台',
        imageAlt: '活跃的社区支持',
      },
      {
        title: '极致客制化',
        content:
          '我们支持随意改名，上传自定义头图，以及创建花哨的个人简介和签名，在这里充分发挥您的想象力',
        imageAlt: '最强客制化',
      },
      {
        title: '开发者友好',
        content: '我们的服务端提供与上游兼容的 v1/v2 API 接口，方便您将 bot 和服务接入 g0v0!。',
        imageAlt: '开发者友好',
      },
      {
        title: '开源开放',
        content: '服务端/客户端全部开源免费，服务端还提供了插件支持，可通过插件来扩充服务端能力',
        imageAlt: '开源开放',
      },
      {
        title: '规则集排行榜',
        content:
          '我们支持<customRulesetLink>自定义 ruleset</customRulesetLink> 模式的分数计算和成绩上传，并提供完善的排行榜支持',
        imageAlt: '规则集排行榜',
      },
      {
        title: '用户谱面提交',
        content:
          '我们允许您提交自制的谱面或在官方服务器中无法计算 pp 的未上榜谱面并通过审核（开发中）',
        imageAlt: '用户谱面提交',
      },
    ],
  },
} as const;
