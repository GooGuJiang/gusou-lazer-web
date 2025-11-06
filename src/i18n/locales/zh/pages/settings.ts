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
    password: {
      title: '密码设置',
      description: '修改您的账户密码',
      currentPassword: '当前密码',
      currentPasswordPlaceholder: '输入当前密码',
      newPassword: '新密码',
      newPasswordPlaceholder: '输入新密码',
      confirmPassword: '确认密码',
      confirmPasswordPlaceholder: '确认新密码',
      change: '修改密码',
      changing: '修改中...',
      cancel: '取消',
      success: '密码修改成功！',
      logoutNotice: '所有会话将被登出，您将被重定向到登录页面。',
      warningMessage: '修改密码将登出所有设备，受信任设备也将被清除。',
      checkingTotpStatus: '正在检查验证方式...',
      totpRequired: '已启用双因素验证，请输入您的验证码。',
      passwordRequired: '未启用双因素验证，请输入您的当前密码。',
      totpCode: 'TOTP 验证码',
      totpCodePlaceholder: '6位数字验证码或10位备份码',
      totpCodeHint: '输入您验证器应用中的6位数字验证码，或使用备份码。',
      useResetCode: '使用重置验证码',
      resetCodeOption: '通过邮箱重置密码',
      resetCodeDescription: '如果您忘记了当前密码，可以使用发送到邮箱的验证码重置密码。',
      email: '邮箱地址',
      emailPlaceholder: '输入您的邮箱地址',
      resetCode: '重置验证码',
      resetCodePlaceholder: '输入8位重置验证码',
      sendCode: '发送重置验证码',
      sending: '发送中...',
      resetPassword: '重置密码',
      resetting: '重置中...',
      codeSent: '重置验证码已发送到您的邮箱',
      codeExpiry: '验证码将在15分钟后过期',
      resendCode: '重新发送',
      resendAvailableIn: '{{seconds}}秒后可重新发送',
      errors: {
        currentPasswordRequired: '当前密码为必填项',
        newPasswordRequired: '新密码为必填项',
        passwordMin: '密码至少需要8个字符',
        passwordStrength: '密码必须包含大小写字母和数字',
        confirmPasswordRequired: '请确认密码',
        confirmPasswordMatch: '两次输入的密码不一致',
        sameAsOld: '新密码不能与当前密码相同',
        failed: '修改密码失败，请检查当前密码。',
        emailRequired: '邮箱为必填项',
        emailInvalid: '请输入有效的邮箱地址',
        codeRequired: '重置验证码为必填项',
        codeInvalid: '重置验证码必须为8位数字',
        sendFailed: '发送重置验证码失败，请重试。',
        resetFailed: '重置密码失败，请检查验证码后重试。',
        invalidCode: '无效或过期的重置验证码',
        totpCodeRequired: 'TOTP 验证码为必填项',
        totpCodeInvalid: '验证码格式无效。请输入6位数字验证码或10位备份码。',
        invalidTotpCode: 'TOTP 验证码无效或错误，请重试。',
        incorrectPassword: '当前密码错误，请重试。',
      }
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
        invalidCodeLength: '验证码必须是{{length}}位数字',
        verificationFailed: '验证失败，请重试',
        disableFailed: '禁用TOTP失败，请重试'
      }
    },
    device: {
      title: '设备管理',
      description: '管理您的登录会话和受信任设备',
      sessions: {
        title: '登录会话',
        noSessions: '没有找到活跃会话',
        loading: '加载会话中...',
        loadError: '加载会话失败',
        current: '当前会话',
        verified: '已验证',
        unverified: '未验证',
        lastUsed: '最后使用：{{date}}',
        created: '创建时间：{{date}}',
        verified_at: '验证时间：{{date}}',
        expires: '过期时间：{{date}}',
        location: '位置：{{location}}',
        deviceType: '设备类型：{{type}}',
        revoke: '注销会话',
        revokeTitle: '注销会话',
        revokeConfirm: '确定要注销这个会话吗？',
        revokeWarning: '注销此会话后，该设备将需要重新登录。',
        revokeSuccess: '会话已成功注销',
        revokeError: '注销会话失败，请重试',
        revoking: '注销中...',
        localhost: '本地连接',
        totalSessions: '共 {{count}} 个会话'
      },
      trustedDevices: {
        title: '受信任设备',
        noDevices: '没有找到受信任设备',
        loading: '加载设备中...',
        loadError: '加载设备失败',
        current: '当前设备',
        lastUsed: '最后使用：{{date}}',
        created: '添加时间：{{date}}',
        expires: '过期时间：{{date}}',
        location: '位置：{{location}}',
        remove: '移除设备',
        removeTitle: '移除受信任设备',
        removeConfirm: '确定要移除这个受信任设备吗？',
        removeWarning: '移除此设备后，下次登录时需要重新进行设备验证。',
        removeSuccess: '设备已成功移除',
        removeError: '移除设备失败，请重试',
        removing: '移除中...',
        totalDevices: '共 {{count}} 个设备',
        clientTypes: {
          web: '网页浏览器',
          mobile: '移动应用',
          desktop: '桌面应用'
        }
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
    oauth: {
      title: 'OAuth 应用',
      description: '管理您的 OAuth 应用程序，用于第三方服务集成',
      create: '创建应用',
      createFirst: '创建第一个应用',
      createApp: '创建 OAuth 应用',
      editApp: '编辑 OAuth 应用',
      noApps: '您还没有创建任何 OAuth 应用',
      
      // 应用信息
      appName: '应用名称',
      appNamePlaceholder: '输入应用名称',
      appDescription: '应用描述',
      appDescriptionPlaceholder: '输入应用描述（可选）',
      clientId: '客户端 ID',
      clientSecret: '客户端密钥',
      redirectUris: '重定向 URI',
      addRedirectUri: '添加重定向 URI',
      
      // 操作
      edit: '编辑',
      delete: '删除',
      refreshSecret: '刷新密钥',
      expand: '展开详情',
      collapse: '收起详情',
      cancel: '取消',
      save: '保存',
      update: '更新',
      saving: '保存中...',
      confirm: '我已保存',
      
      // 状态
      created: '创建于',
      
      // 确认对话框
      deleteTitle: '删除应用',
      confirmDelete: '确定要删除应用"{{name}}"吗？此操作无法撤销，所有关联的令牌都将失效。',
      confirmDeleteButton: '确认删除',
      refreshTitle: '刷新密钥',
      confirmRefresh: '确定要刷新应用"{{name}}"的密钥吗？这将使所有现有令牌失效。',
      confirmRefreshButton: '确认刷新',
      
      // 密钥显示
      secretTitle: '重要：保存您的客户端密钥',
      secretWarning: '这是您唯一一次可以看到客户端密钥。请立即将其复制并保存在安全的地方。',
      
      // 成功消息
      createSuccess: 'OAuth 应用创建成功',
      updateSuccess: 'OAuth 应用更新成功',
      deleteSuccess: 'OAuth 应用删除成功',
      refreshSuccess: '客户端密钥已刷新',
      copied: '已复制到剪贴板',
      
      // 错误消息
      errors: {
        loadFailed: '加载 OAuth 应用失败',
        createFailed: '创建应用失败',
        updateFailed: '更新应用失败',
        deleteFailed: '删除应用失败',
        refreshFailed: '刷新密钥失败',
        copyFailed: '复制失败',
        noRedirectUri: '至少需要一个重定向 URI'
      }
    },
    preferences: {
      title: '用户偏好',
      description: '自定义您的游戏体验和个人资料设置',
      loading: '加载偏好设置中...',
      loadError: '加载偏好设置失败',
      saving: '保存中...',
      saveSuccess: '偏好设置已保存',
      saveError: '保存偏好设置失败',
      
      // 主题和语言
      theme: {
        title: '主题',
        description: '选择界面主题',
        light: '浅色',
        dark: '深色',
        auto: '跟随系统'
      },
      language: {
        title: '语言',
        description: '选择界面语言',
        zh: '中文',
        en: 'English',
        ja: '日本語'
      },
      
      // 音频设置
      audio: {
        title: '音频设置',
        autoplay: '自动播放',
        autoplayDescription: '自动播放音频内容',
        muted: '静音',
        mutedDescription: '默认静音音频',
        volume: '音量',
        volumeDescription: '默认音量大小'
      },
      
      // 谱面设置
      beatmapset: {
        title: '谱面设置',
        cardSize: '卡片大小',
        cardSizeDescription: '谱面卡片显示大小',
        normal: '正常',
        large: '大',
        download: '下载选项',
        downloadDescription: '谱面下载偏好',
        downloadAll: '完整',
        downloadNoVideo: '无视频',
        downloadDirect: '直接下载',
        showNsfw: '显示NSFW内容',
        showNsfwDescription: '显示包含敏感内容的谱面'
      },
      
      // 个人资料设置
      profile: {
        title: '个人资料设置',
        order: '显示顺序',
        orderDescription: '个人资料模块显示顺序',
        legacyScoreOnly: '仅显示旧版分数',
        legacyScoreOnlyDescription: '仅显示旧版计分系统的分数',
        coverExpanded: '展开头图',
        coverExpandedDescription: '默认展开个人资料头图',
        colour: '个人资料颜色',
        colourDescription: '自定义个人资料主题色'
      },
      
      // 计分和排序
      scoring: {
        title: '计分和显示',
        mode: '计分模式',
        modeDescription: '成绩计分模式',
        standardised: '标准化',
        classic: '经典',
        userListFilter: '用户列表筛选',
        userListFilterDescription: '默认用户列表筛选器',
        filterAll: '全部',
        filterOnline: '在线',
        filterOffline: '离线',
        userListSort: '用户列表排序',
        userListSortDescription: '默认用户列表排序方式',
        sortLastVisit: '最后访问',
        sortUsername: '用户名',
        sortRank: '排名',
        userListView: '用户列表视图',
        userListViewDescription: '默认用户列表视图模式',
        viewCard: '卡片',
        viewList: '列表',
        viewBrick: '砖块'
      },
      
      // 游戏模式和个人信息
      gameMode: {
        title: '游戏模式',
        playmode: '默认游戏模式',
        playmodeDescription: '选择您偏好的默认游戏模式'
      },
      personalInfo: {
        title: '个人信息',
        interests: '兴趣爱好',
        interestsPlaceholder: '输入您的兴趣爱好',
        location: '所在地',
        locationPlaceholder: '输入您的所在地',
        occupation: '职业',
        occupationPlaceholder: '输入您的职业',
        twitter: 'Twitter',
        twitterPlaceholder: '输入您的 Twitter 用户名',
        website: '个人网站',
        websitePlaceholder: '输入您的个人网站链接',
        discord: 'Discord',
        discordPlaceholder: '输入您的 Discord 用户名'
      },
      
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
