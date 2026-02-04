export const howToJoinPage = {
  "howToJoin": {
    "title": "如何加入服务器",
    "subtitle": "有两种方式连接到我们的服务器",
    "copyFailed": "复制失败:",
    "clickToCopy": "点击复制",
    "method1": {
      "title": "使用我们的自定义客户端",
      "recommended": "推荐",
      "description": "此方法推荐给所有能在其平台上运行 osu!lazer 的用户。",
      "steps": {
        "title": "操作步骤：",
        "step1": {
          "title": "下载 g0v0! 自定义客户端",
          "pcVersion": "PC 版本：",
          "androidVersion": "安卓版本：",
          "downloadPc": "从 GitHub Releases 下载",
          "downloadAndroidDomestic": "国内网盘下载",
          "downloadAndroidOverseas": "国外网盘下载",
          "downloadClient": "下载自定义客户端"
        },
        "step2": {
          "title": "启动游戏，打开 设置 → 在线，在\"Custom API Server URL\"字段中填入：",
          "description": "在osu lazer的设置中找到“在线”Section，找到“Custom API Server URL”设置项，并在其输入框中输入下面的文本：",
          "imageHint": "如图所示"
        },
        "step3": {
          "title": "重启游戏，开始享受游戏！",
          "description": "输入URL后退出osu lazer并重新启动即可生效"
        }
      }
    },
    "method2": {
      "title": "使用 Authlib Injector（适用于 x86_64 平台）",
      "suitableFor": "此方法适用于以下用户：",
      "platforms": {
        "windows": "Windows 用户（WOA 暂不支持）",
        "linux": "任意 Linux 发行版（arm64 及其他 arm 设备不支持）",
        "mac": "macOS（Apple Silicon 不支持）"
      },
      "steps": {
        "title": "操作步骤：",
        "step1": {
          "title": "下载 LazerAuthlibInjection",
          "download": "从 GitHub Releases 下载",
          "button": "下载 LazerAuthlibInjection"
        },
        "step2": {
          "title": "将其作为规则集安装到 osu!lazer 中",
          "description": "将下载的 LazerAuthlibInjection 作为规则集安装到 osu!lazer 中"
        },
        "step3": {
          "title": "启动游戏，进入 设置 → 游戏模式，然后填入以下信息：",
          "description": "在游戏设置中配置服务器连接信息",
          "apiUrl": "API URL：",
          "websiteUrl": "Website URL："
        },
        "step4": {
          "title": "出现\"API 设置已更改\"通知后，重启客户端，开始享受游戏！",
          "description": "完成设置后重启客户端即可连接到服务器"
        }
      },
      "warning": {
        "title": "重要提示",
        "description": "虽然 ppy 明确声明不对 ruleset 进行反作弊检测，但我们建议您尽量不要将安装 AuthLibInject 后的 osu!lazer 客户端连接到官方服务器，可能会导致账号被封禁！"
      }
    }
  },
} as const;
