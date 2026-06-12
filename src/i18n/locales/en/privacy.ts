export const privacy = {
  dataCollection: {
    title: 'Data Collection',
    description:
      'We collect information to provide better services to all our users. This includes information you provide to us, data we collect automatically when you use our services, and information from third parties.',
  },
  microsoftClarity: {
    title: 'Microsoft Clarity Analytics',
    description:
      'We use Microsoft Clarity to improve our website experience. Clarity helps us understand how users interact with our site through website usage analytics.',
    whatWeCollect: {
      title: 'What data does Microsoft Clarity collect?',
      interactions: 'User interactions with page elements (clicks, taps, scrolls)',
      pageViews: 'Page views and session recordings',
      clickData: 'Click patterns and heatmaps',
      scrollBehavior: 'Scroll behavior and mouse movements',
      deviceInfo: 'Device and browser information (non-personally identifiable)',
    },
    purpose:
      'This data helps us identify usability issues, understand user behavior patterns, and improve our website design and functionality. Microsoft Clarity does not collect personally identifiable information.',
    optOut: {
      title: 'How to opt out:',
      description:
        'You can opt out of Microsoft Clarity data collection by enabling "Do Not Track" in your browser settings or by using browser extensions that block analytics scripts.',
    },
    learnMore: 'To learn more about how Microsoft processes your data, please review',
    privacyStatement: "Microsoft's Privacy Statement",
  },
  userData: {
    title: 'User Account Data',
    description:
      'When you create an account, we collect and store information such as your username, email address, and gameplay statistics. This information is used to provide our gaming services and maintain your account.',
  },
  dataSecurity: {
    title: 'Data Security',
    description:
      'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
  },
  yourRights: {
    title: 'Your Rights',
    access: 'Access: You can request access to your personal data',
    correction: 'Correction: You can request correction of inaccurate data',
    deletion: 'Deletion: You can request deletion of your personal data',
    portability: 'Portability: You can request a copy of your data in a portable format',
  },
  contact: {
    title: 'Contact Us',
    description:
      'If you have any questions about this Privacy Policy or our data practices, please contact us through our support channels.',
  },
  updates: {
    title: 'Policy Updates',
    description:
      'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.',
  },
  lastUpdated: 'Last Updated',
} as const;
