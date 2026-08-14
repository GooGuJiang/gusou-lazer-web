export const rankingsPage = {
  rankings: {
    title: 'Rankings',
    tabs: {
      users: 'User Rankings',
      countries: 'Country Rankings',
    },
    rankingTypes: {
      performance: 'Performance',
      score: 'Ranked Score',
    },
    gameModes: {
      osu: 'standard',
      taiko: 'taiko',
      fruits: 'catch',
      mania: 'mania',
    },
    subModes: {
      vanilla: 'Vanilla',
      relax: 'Relax',
      autopilot: 'Autopilot',
    },
    filters: {
      country: 'Country',
      allCountries: 'All Countries',
    },
    userCard: {
      rank: 'Rank',
      performance: 'Performance',
      accuracy: 'Accuracy',
      playCount: 'Play Count',
      country: 'Country',
    },
    countryCard: {
      rank: 'Rank',
      country: 'Country',
      averagePerformance: 'Average Performance',
      totalPerformance: 'Total Performance',
      activeUsers: 'active users',
      playCount: 'plays',
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      page: 'Page {{current}} of {{total}}',
    },
    errors: {
      loadFailed: 'Failed to load rankings',
      noData: 'No data available',
    },
  },
} as const;
