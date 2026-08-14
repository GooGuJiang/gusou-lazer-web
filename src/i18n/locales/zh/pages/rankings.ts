export const rankingsPage = {
  rankings: {
    title: '排行榜',
    tabs: {
      users: '玩家排行',
      countries: '国家排行',
    },
    rankingTypes: {
      performance: '表现分',
      score: '计分成绩总分',
    },
    gameModes: {
      osu: 'standard',
      taiko: 'taiko',
      fruits: 'catch',
      mania: 'mania',
    },
    subModes: {
      vanilla: '常规',
      relax: 'Relax',
      autopilot: 'Autopilot',
    },
    filters: {
      country: '国家/地区',
      allCountries: '全部国家',
    },
    userCard: {
      rank: '排名',
      performance: '表现分',
      accuracy: '准确率',
      playCount: '游戏次数',
      country: '国家',
    },
    countryCard: {
      rank: '排名',
      country: '国家',
      averagePerformance: '平均表现分',
      totalPerformance: '总表现分',
      activeUsers: '活跃用户',
      playCount: '次游戏',
    },
    pagination: {
      previous: '上一页',
      next: '下一页',
      page: '第 {{current}} 页 / 共 {{total}} 页',
    },
    errors: {
      loadFailed: '加载排行榜失败',
      noData: '暂无数据',
    },
  },
} as const;
