export const howToJoinPage = {
  howToJoin: {
    title: 'How to Join the Server',
    subtitle: 'There are two ways to connect to our server',
    copyFailed: 'Copy failed:',
    clickToCopy: 'Click to copy',
    method1: {
      title: 'Using Our Custom Client',
      recommended: 'Recommended',
      description:
        'This method is recommended for all users who can run osu!lazer on their platform.',
      steps: {
        title: 'Steps:',
        step1: {
          title: 'Download g0v0! Custom Client',
          pcVersion: 'PC Version:',
          androidVersion: 'Android Version:',
          downloadPc: 'Download from GitHub Releases',
          downloadAndroidDomestic: 'Download (China Only)',
          downloadAndroidOverseas: 'Download (For global network)',
          downloadClient: 'Download Custom Client',
        },
        step2: {
          title:
            'Launch the game, go to Settings → Online, and enter in the "Custom API Server URL" field:',
          description:
            'In the osu!lazer settings, go to the “Online” section, find the “Custom API Server URL” setting, and enter the following text in the input box:',
          imageHint: 'As shown in the image',
        },
        step3: {
          title: 'Restart the game and enjoy!',
          description:
            'After entering the URL, exit osu!lazer and restart it for the changes to take effect.',
        },
      },
    },
    method2: {
      title: 'Using EnhancedAuth Ruleset',
      suitableFor: 'This method is available on the following platforms:',
      platforms: {
        windows: 'Windows (amd64, arm64)',
        linux: 'Linux (amd64, arm64)',
        mac: 'macOS (Intel, Apple Silicon)',
      },
      steps: {
        title: 'Steps:',
        step1: {
          title: 'Download EnhancedAuth Ruleset',
          download: 'Download from GitHub Releases',
          button: 'Download EnhancedAuth',
        },
        step2: {
          title: 'Install the ruleset DLL into osu!lazer',
          description:
            "Open the osu! data directory (click 'Open osu! folder' in settings), then copy the downloaded osu.Game.Rulesets.EnhancedAuth.dll into the rulesets directory",
        },
        step3: {
          title:
            'Launch the game, go to Settings → Game Mode, and enter the following information:',
          description: 'Configure the server connection info in the game settings',
          apiUrl: 'API URL:',
          websiteUrl: 'Website URL:',
        },
        step4: {
          title:
            "After seeing the 'API Settings Changed' notification, restart the client and enjoy!",
          description: 'After completing the setup, restart the client to connect to the server',
        },
      },
      warning: {
        title: 'Important Notice',
        description:
          'Using this ruleset to connect to the official osu! servers will result in your account being banned! Only use it on private servers, and make sure you have disconnected from the official servers before using it.',
      },
    },
  },
} as const;
