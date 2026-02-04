export const homePage = {
  hero: {
    tagline: 'Probably the best osu! private server',
    descriptionPrefix: 'g0v0! is a brand-new osu! private server ',
    descriptionHighlight: 'built for the lazer client',
    descriptionSuffix:
      '. We support the standard / taiko / catch / mania rulesets, RX/AP pp calculation, and unlimited renames so you can play your way.',
    statusOperational: 'All services are operational',
    statusCommunity: 'Join our QQ / Discord community for support and updates',
    joinCta: 'Join Now',
    viewProfile: 'View profile',
    viewRankings: 'View rankings',
    register: 'Sign up',
    login: 'Sign in',
    featuresTitle: 'Feature highlights',
    featuresSubtitle: 'Discover the rich features and services we provide for you',
    community: {
      qq: 'QQ Group',
      discord: 'Discord',
      github: 'GitHub',
      discordTag: 'g0v0!',
    },
  },

  features: {
    items: [
      {
        title: 'Works on every platform',
        content:
          'g0v0! is designed for lazer, which means you can play on any system that supports osu! lazer without platform limitations.',
        imageAlt: 'Works on every platform',
      },
      {
        title: 'Faster beatmap downloads',
        content:
          'We use Sayobot mirror services to deliver speedy downloads for players in China, so grabbing maps is no longer a waiting game.',
        imageAlt: 'Faster beatmap downloads',
      },
      {
        title: 'Active community support',
        content:
          'Our official QQ group and Discord server provide the perfect place to ask for help, share highlights, or just hang out.',
        imageAlt: 'Active community support',
      },
      {
        title: 'Ultimate customization',
        content:
          'Freely change your username, upload custom banners, and create a dazzling profile and signature—let your creativity run wild.',
        imageAlt: 'Ultimate customization',
      },
      {
        title: 'Developer friendly',
        content:
          'Our server follows the official osu! v1/v2 API specs so you can integrate bots and services into g0v0! faster and easier.',
        imageAlt: 'Developer friendly',
      },
      {
        title: 'Open and transparent',
        content:
          'Both the server and client are open source. The server also provides hook support so you can extend it with plugins (in development).',
        imageAlt: 'Open and transparent',
      },
      {
        title: 'User-submitted beatmaps',
        content:
          'Submit your own beatmaps or ranked-ineligible maps from the official server and get them approved here (in development).',
        imageAlt: 'User-submitted beatmaps',
      },
      {
        title: 'Ruleset leaderboards',
        content:
          'We support custom ruleset score calculations and submissions, plus robust leaderboard support (in development).',
        imageAlt: 'Ruleset leaderboards',
      },
    ],
  },
} as const;
