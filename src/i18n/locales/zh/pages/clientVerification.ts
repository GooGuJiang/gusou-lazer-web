export const clientVerificationPage = {
  clientVerification: {
    title: '是否要允许 osu!(stable) 客户端登录？',
    description: '允许后，客户端将被计入可信设备。短期内客户端登录将不需要认证。',
    allow: '允许',
    deny: '拒绝',
    allowedTitle: '已允许客户端登录',
    allowedDescription:
      'osu!(stable) 客户端已被计入可信设备，现在可以关闭此页面并返回客户端继续登录。',
    deniedTitle: '已拒绝客户端登录',
    deniedDescription: 'osu!(stable) 客户端未被计入可信设备，你可以关闭此页面。',
    backHome: '返回首页',
    errors: {
      invalidRequest: '无效的请求',
      missingDeviceHash: '链接中缺少 ch 参数，无法识别要验证的客户端。',
      verifyFailed: '允许客户端登录失败，请稍后再试。',
    },
  },
} as const;
