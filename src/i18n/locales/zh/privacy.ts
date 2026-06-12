export const privacy = {
  dataCollection: {
    title: '数据收集',
    description:
      '我们收集信息以为所有用户提供更好的服务。这包括您提供给我们的信息、我们在您使用我们的服务时自动收集的数据，以及来自第三方的信息。',
  },
  microsoftClarity: {
    title: 'Microsoft Clarity 分析',
    description:
      '我们使用 Microsoft Clarity 来改善我们的网站体验。Clarity 通过网站使用分析帮助我们了解用户如何与我们的网站互动。',
    whatWeCollect: {
      title: 'Microsoft Clarity 收集哪些数据？',
      interactions: '用户与页面元素的交互（点击、触摸、滚动）',
      pageViews: '页面浏览和会话录制',
      clickData: '点击模式和热力图',
      scrollBehavior: '滚动行为和鼠标移动',
      deviceInfo: '设备和浏览器信息（非个人身份识别信息）',
    },
    purpose:
      '这些数据帮助我们识别可用性问题，了解用户行为模式，并改进我们的网站设计和功能。Microsoft Clarity 不收集个人身份识别信息。',
    optOut: {
      title: '如何选择退出：',
      description:
        '您可以通过在浏览器设置中启用"请勿跟踪"或使用阻止分析脚本的浏览器扩展来选择退出 Microsoft Clarity 数据收集。',
    },
    learnMore: '要了解更多关于 Microsoft 如何处理您的数据的信息，请查看',
    privacyStatement: 'Microsoft 隐私声明',
  },
  userData: {
    title: '用户账户数据',
    description:
      '当您创建账户时，我们会收集和存储您的用户名、电子邮件地址和游戏统计数据等信息。这些信息用于提供我们的游戏服务和维护您的账户。',
  },
  dataSecurity: {
    title: '数据安全',
    description:
      '我们实施适当的安全措施来保护您的个人信息，防止未经授权的访问、更改、披露或销毁。但是，通过互联网传输的方法都不是100%安全的。',
  },
  yourRights: {
    title: '您的权利',
    access: '访问权：您可以请求访问您的个人数据',
    correction: '更正权：您可以请求更正不准确的数据',
    deletion: '删除权：您可以请求删除您的个人数据',
    portability: '可携带权：您可以请求以可移植格式获取您的数据副本',
  },
  contact: {
    title: '联系我们',
    description: '如果您对本隐私政策或我们的数据处理方式有任何疑问，请通过我们的支持渠道联系我们。',
  },
  updates: {
    title: '政策更新',
    description:
      '我们可能会不时更新本隐私政策。我们将通过在此页面发布新的隐私政策并更新"最后更新"日期来通知您任何更改。',
  },
  lastUpdated: '最后更新',
} as const;
