export const howToJoinPage = {
  howToJoin: {
    title: '如何加入服务器',
    subtitle: '有两种方式连接到我们的服务器',
    copyFailed: '复制失败:',
    clickToCopy: '点击复制',
    method1: {
      title: '使用我们的客户端',
      recommended: '推荐',
      description: '此方法推荐给所有能在其平台上运行原版 osu!lazer 的用户。',
      steps: {
        title: '操作步骤：',
        step1: {
          title: '下载 g0v0! 客户端',
          pcVersion: 'PC 版本：',
          androidVersion: '安卓版本：',
          downloadPc: '从 GitHub Releases 下载',
          downloadAndroidDomestic: '国内网盘下载',
          downloadAndroidOverseas: '国外网盘下载',
          downloadClient: '下载 g0v0! 客户端',
        },
        step2: {
          title: '启动游戏，打开 设置 → 在线，在"自定义 API 服务器链接"字段中填入：',
          description:
            '在 g0v0! 的设置中找到“在线”一栏，找到“自定义 API 服务器链接”设置项，并在其输入框中输入下面的文本：',
          imageAlt: '如图所示',
        },
        step3: {
          title: '重启游戏，开始享受游戏！',
          description: '输入 URL 后退出 g0v0! 并重新启动即可生效',
        },
      },
    },
    method2: {
      title: '在 osu!lazer 使用 EnhancedAuth 规则集',
      suitableFor: '此方法适用于以下平台：',
      platforms: {
        windows: 'Windows（amd64、arm64）',
        linux: 'Linux（amd64、arm64）',
        mac: 'macOS（Intel、Apple Silicon）',
      },
      steps: {
        title: '操作步骤：',
        step1: {
          title: '下载 EnhancedAuth 规则集',
          download: '从 GitHub Releases 下载',
          button: '下载 EnhancedAuth',
        },
        step2: {
          title: '将规则集 DLL 安装到 osu!lazer 中',
          description:
            '打开 osu! 的数据目录（设置中点击「Open osu! folder」），将下载的 osu.Game.Rulesets.EnhancedAuth.dll 复制到 rulesets 目录中',
        },
        step3: {
          title: '启动游戏，进入 设置 → 游戏模式，然后填入以下信息：',
          description: '在游戏设置中配置服务器连接信息',
          apiUrl: 'API URL：',
          websiteUrl: 'Website URL：',
        },
        step4: {
          title: '出现"API 设置已更改"通知后，重启客户端，开始享受游戏！',
          description: '完成设置后重启客户端即可连接到服务器',
        },
      },
      warning: {
        title: '重要提示',
        description:
          '使用此规则集连接官方服务器将导致您的 osu! 账号被封禁！请仅在私服上使用，并确保在使用前已退出官方服务器。',
      },
    },
  },
} as const;
