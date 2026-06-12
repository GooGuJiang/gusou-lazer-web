export const verification = {
  // 标题和基本信息
  required: '需要验证身份',
  totpTitle: '双因素验证',
  mailTitle: '邮件验证',

  // 描述信息
  totpDescription: '为了保护您的账户安全，请输入身份验证器应用中的6位验证码。',
  mailDescription: '为了保护您的账户安全，请输入发送到您邮箱的8位验证码。',

  // TOTP不可用时的选项
  totpUnavailable: '无法访问您的身份验证器应用？',
  switchToMail: '使用邮件验证',
  switchedToMail: '已切换到邮件验证模式',

  // 输入相关
  enterTotpCode: '输入TOTP验证码',
  enterMailCode: '输入邮件验证码',
  codeHint: '请输入{{length}}位验证码',

  // 按钮和操作
  verify: '验证',
  verifying: '验证中...',
  resendCode: '重新发送验证码',
  resending: '发送中...',
  codeResent: '验证码已重新发送',

  // 成功信息
  success: '验证成功！',

  // 错误信息
  errors: {
    emptyCode: '验证码不能为空',
    invalidLength: '验证码必须是{{length}}位数字',
    invalidCode: '验证码错误，请重试',
    verificationFailed: '验证失败，请稍后重试',
    resendFailed: '重新发送验证码失败',
    switchFailed: '切换验证方式失败',
    // TOTP 特定错误
    totpInvalidOrExpired: '验证码错误，请重新输入正确的验证码',
    totpGenericError: '验证失败，请检查验证码是否正确',
  },

  // 警告信息
  warning: {
    title: '重要提醒：',
    message: '此验证步骤是必需的，您无法在完成验证前继续使用服务。这是为了保护您的账户安全。',
  },

  // 安全提示
  securityNotice: '🔒 为了您的账户安全，请完成身份验证',
} as const;
