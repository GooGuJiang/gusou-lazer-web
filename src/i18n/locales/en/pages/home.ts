export const homePage = {
  hero: {
    tagline: 'A free and open rhythm experience',
    descriptionPrefix: 'g0v0! is a free and open rhythm game server with ',
    descriptionHighlight: 'support for both stable and lazer clients',
    descriptionSuffix: ' and RX/AP pp calculation, designed to offer a freer rhythm experience.',
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
        title: 'Cross-platform support',
        content:
          'g0v0! supports multiple desktop and mobile platforms, so you can enjoy rhythm gaming across your devices.',
        imageAlt: 'Cross-platform support',
      },
      {
        title: 'Faster beatmap downloads',
        content:
          'We use multiple beatmap mirror services with automatic availability detection and smart switching, so grabbing maps is no longer a waiting game.',
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
          'Our server provides upstream-compatible v1/v2 APIs to make it easier to integrate bots and services with g0v0!.',
        imageAlt: 'Developer friendly',
      },
      {
        title: 'Open and transparent',
        content:
          'Both the server and client are open source. The server also provides plugin support so you can extend it with plugins.',
        imageAlt: 'Open and transparent',
      },
      {
        title: 'Ruleset leaderboards',
        content:
          'We support <customRulesetLink>custom ruleset</customRulesetLink> score calculations and submissions, plus robust leaderboard support.',
        imageAlt: 'Ruleset leaderboards',
      },
      {
        title: 'User-submitted beatmaps',
        content:
          'Submit your own beatmaps or ranked-ineligible maps from the official server and get them approved here (in development).',
        imageAlt: 'User-submitted beatmaps',
      },
    ],
  },
} as const;
