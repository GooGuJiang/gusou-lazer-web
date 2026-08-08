export const oauthPage = {
  oauth: {
    authorize: {
      title: '授权请求',
      by: '由 <avatar /> <userLink>{{username}}</userLink> 开发',
      byFallback: '由 {{username}} 开发',
      scopesTitle: '该应用将获得以下权限：',
      redirectNotice: '授权后，你将被重定向到',
      approve: '授权',
      deny: '拒绝',
      errors: {
        invalidRequest: '无效的授权请求',
        appNotFound: '应用不存在',
        appNotFoundDescription: '该 OAuth 应用不存在或已被删除。',
        missingClientId: '缺少 client_id 参数。',
        invalidClientId: 'client_id 参数无效。',
        invalidResponseType: 'response_type 必须为 code。',
        missingRedirectUri: '缺少 redirect_uri 参数。',
        missingScope: '缺少 scope 参数。',
        redirectUriNotAllowed: 'redirect_uri 不在该应用允许的回调地址列表中。',
        invalidScopes: '请求的权限范围包含不支持的项目：{{scopes}}。',
        loadFailed: '加载应用信息失败，请稍后再试。',
        codeFailed: '生成授权码失败，请稍后再试。',
        backHome: '返回首页',
      },
      scopes: {
        identify: '鉴别你的身份并读取你的公开个人资料。',
        public: '以你的身份读取公开数据。',
        chat: {
          read: '以你的名义阅读消息。',
          write: '以你的名义发送消息。',
          write_manage: '以你的名义加入、离开频道。',
        },
        forum: {
          write: '以你的名义创建和编辑论坛的主题与帖子。',
          write_manage: '管理你发布的论坛主题与帖子。',
        },
        friends: {
          read: '看看你关注了谁。',
        },
        multiplayer: {
          write_manage: '以你的名义创建和管理多人游戏房间。',
        },
      },
    },
  },
} as const;
