export const howToJoinPage = {
  "howToJoin": {
    "title": "How to Join the Server",
    "subtitle": "There are two ways to connect to our server",
    "copyFailed": "Copy failed:",
    "clickToCopy": "Click to copy",
    "method1": {
      "title": "Using Our Custom Client",
      "recommended": "Recommended",
      "description": "This method is recommended for all users who can run osu!lazer on their platform.",
      "steps": {
        "title": "Steps:",
        "step1": {
          "title": "Download g0v0! Custom Client",
          "pcVersion": "PC Version:",
          "androidVersion": "Android Version:",
          "downloadPc": "Download from GitHub Releases",
          "downloadAndroidDomestic": "Download (China Only)",
          "downloadAndroidOverseas": "Download (For global network)",
          "downloadClient": "Download Custom Client"
        },
        "step2": {
          "title": "Launch the game, go to Settings → Online, and enter in the \"Custom API Server URL\" field:",
          "description": "In the osu!lazer settings, go to the “Online” section, find the “Custom API Server URL” setting, and enter the following text in the input box:",
          "imageHint": "As shown in the image"
        },
        "step3": {
          "title": "Restart the game and enjoy!",
          "description": "After entering the URL, exit osu!lazer and restart it for the changes to take effect."
        }
      }
    },
    "method2": {
      "title": "Using LazerAuthlibInjection (x86_64 Platforms Only)",
      "suitableFor": "This method is suitable for the following users:",
      "platforms": {
        "windows": "Windows users. (WOA Temporarily Not Supported)",
        "linux": "Any Linux Distributions. (arm64 and any other arm devices not supported)",
        "mac": "macOS. (Apple Silicon are not supported)"
      },
      "steps": {
        "title": "Steps:",
        "step1": {
          "title": "Download LazerAuthlibInjection",
          "download": "Download from GitHub Releases",
          "button": "Download LazerAuthlibInjection"
        },
        "step2": {
          "title": "Install it as a ruleset into osu!lazer",
          "description": "Install the downloaded LazerAuthlibInjection as a ruleset into osu!lazer"
        },
        "step3": {
          "title": "Launch the game, go to Settings → Game Mode, and enter the following information:",
          "description": "Configure the server connection info in the game settings",
          "apiUrl": "API URL:",
          "websiteUrl": "Website URL:"
        },
        "step4": {
          "title": "After seeing the 'API Settings Changed' notification, restart the client and enjoy!",
          "description": "After completing the setup, restart the client to connect to the server"
        }
      },
      "warning": {
        "title": "Important Notice",
        "description": "Although peppy(ppy) explicitly states that rulesets are not subject to anti-cheat detection, we strongly recommend that you avoid connecting the osu!lazer client with AuthLibInject installed to the official servers, as doing so may result in your account being banned!"
      }
    }
  },
} as const;
