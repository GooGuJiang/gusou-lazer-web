export const settingsPage = {
  settings: {
    title: '账户设置',
    description: '管理您的账户信息和偏好设置',
    errors: {
      loadFailed: '无法加载设置',
      tryRefresh: '请尝试刷新页面'
    },
    username: {
      title: '用户名设置',
      current: '当前用户名',
      change: '修改用户名',
      placeholder: '输入新的用户名',
      hint: '用户名修改后，您的原用户名将保存在历史记录中',
      save: '保存',
      saving: '保存中...',
      cancel: '取消',
      success: '用户名修改成功！',
      errors: {
        empty: '用户名不能为空',
        sameAsOld: '新用户名与当前用户名相同',
        taken: '用户名已被占用，请选择其他用户名',
        userNotFound: '找不到指定用户',
        failed: '修改用户名失败，请稍后重试'
      }
    },
    avatar: {
      title: '头像设置',
      current: '当前头像',
      change: '修改头像',
      hint: '支持 PNG、JPEG、GIF 格式，建议尺寸 256x256 像素，最大 5MB',
      success: '头像修改成功！'
    },
    cover: {
      title: '头图设置',
      label: '个人资料头图',
      hint: '建议尺寸：2000x500 像素（官方推荐 4:1 比例），支持 PNG、JPEG、GIF 格式，最大 10MB'
    },
    account: {
      title: '账户信息',
      userId: '用户 ID',
      joinDate: '注册时间',
      country: '国家/地区',
      lastVisit: '最后访问'
    },
    totp: {
      title: '双因素验证',
      status: '状态',
      enabled: '已启用',
      disabled: '已禁用',
      enable: '启用',
      disable: '禁用',
      checking: '检查状态中...',
      enabledSince: '启用时间：{{date}}',
      description: '双因素验证为您的账户提供额外的安全保护。启用后，登录时需要输入身份验证器应用中的验证码。',
      loadError: '无法加载TOTP状态',
      
      // 设置流程
      setupTitle: '设置双因素验证',
      setupDescription: '双因素验证将为您的账户增加一层额外的安全保护。',
      setupStep1: '在手机上安装身份验证器应用（如 Google Authenticator、Authy 等）',
      setupStep2: '扫描下方二维码或手动输入密钥',
      setupStep3: '输入应用中显示的6位验证码',
      startSetup: '开始设置',
      starting: '准备中...',
      
      // 二维码和验证
      manualEntry: '手动输入密钥',
      enterCode: '输入验证码',
      codeHint: '输入身份验证器应用显示的6位数字',
      codeExpireHint: 'TOTP代码每30秒过期一次，请确保使用最新的代码。',
      
      // 备份码
      setupComplete: 'TOTP 设置完成！',
      backupCodesDescription: '请保存这些备份码，它们可以在您无法访问身份验证器应用时用于登录。',
      downloadBackupCodes: '下载备份码',
      backupCodesDownloaded: '备份码已下载',
      backupCodesWarning: '请将备份码保存在安全的地方，每个备份码只能使用一次。',
      finishSetup: '完成设置',
      
      // 禁用流程
      disableTitle: '禁用双因素验证',
      disableWarning: '禁用双因素验证会降低您账户的安全性。如果您确定要继续，请输入当前验证码。',
      enterCodeToDisable: '输入验证码以禁用',
      disableCodeHint: '输入身份验证器应用中的当前6位验证码',
      disableConfirm: '确认禁用',
      disabling: '禁用中...',
      
      // 成功和错误消息
      setupSuccess: 'TOTP 双因素验证设置成功！',
      disableSuccess: 'TOTP 双因素验证已禁用',
      errors: {
        createFailed: '创建TOTP密钥失败',
        invalidCode: '验证码错误',
        invalidCodeLength: '验证码必须是6位数字',
        verificationFailed: '验证失败，请重试',
        disableFailed: '禁用TOTP失败，请重试'
      }
    },
    device: {
      title: '设备管理',
      description: '管理您的活跃登录会话',
      sessions: {
        title: '活跃会话',
        noSessions: '没有找到活跃会话',
        loading: '加载会话中...',
        current: '当前设备',
        lastUsed: '最后使用：{{date}}',
        created: '创建时间：{{date}}',
        expires: '过期时间：{{date}}',
        location: '位置：{{location}}',
        deviceType: '设备类型：{{type}}',
        revoke: '撤销会话',
        revokeTitle: '撤销会话',
        revokeConfirm: '确定要撤销这个会话吗？',
        revokeWarning: '撤销此会话后，该设备将需要重新登录。',
        revokeSuccess: '会话已成功撤销',
        revokeError: '撤销会话失败，请重试',
        revoking: '撤销中...',
        localhost: '本地连接'
      },
      summary: {
        title: '设备统计',
        loading: '加载统计中...',
        loadError: '加载统计失败'
      },
      deviceTypes: {
        desktop: '桌面设备',
        mobile: '移动设备',
        tablet: '平板设备',
        unknown: '未知设备',
        app: '桌面应用'
      },
      browsers: {
        chrome: 'Chrome',
        firefox: 'Firefox',
        safari: 'Safari',
        edge: 'Edge',
        opera: 'Opera',
        unknown: '未知浏览器'
      }
    },
    preferences: {
      title: '用户偏好',
      description: '自定义您的游戏体验',
      defaultMode: {
        title: '默认游戏模式',
        description: '选择您偏好的默认游戏模式',
        current: '当前默认模式',
        change: '更改模式',
        save: '保存',
        saving: '保存中...',
        success: '默认游戏模式已更新！',
        error: '更新默认游戏模式失败，请重试',
        availableModes: '可用模式: {{count}} 个',
        modes: {
          osu: 'osu!',
          osurx: 'osu! (Relax)',
          osuap: 'osu! (Auto Pilot)', 
          taiko: 'osu!taiko',
          taikorx: 'osu!taiko (Relax)',
          fruits: 'osu!catch',
          fruitsrx: 'osu!catch (Relax)',
          mania: 'osu!mania'
        }
      }
    }
  },
} as const;
