export const clientVerificationPage = {
  clientVerification: {
    title: 'Allow the osu!(stable) client to log in?',
    description:
      'Once allowed, the client will be counted as a trusted device. Client logins will not require verification for a short period.',
    allow: 'Allow',
    deny: 'Deny',
    allowedTitle: 'Client login allowed',
    allowedDescription:
      'The osu!(stable) client is now counted as a trusted device. You can close this page and return to the client to continue logging in.',
    deniedTitle: 'Client login denied',
    deniedDescription:
      'The osu!(stable) client was not counted as a trusted device. You can close this page.',
    backHome: 'Back to Home',
    errors: {
      invalidRequest: 'Invalid request',
      missingDeviceHash:
        'The ch parameter is missing from this link, so the client cannot be identified.',
      verifyFailed: 'Failed to allow the client to log in. Please try again later.',
    },
  },
} as const;
