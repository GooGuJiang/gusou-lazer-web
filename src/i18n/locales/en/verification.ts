export const verification = {
  // Titles and basic info
  required: 'Verification Required',
  totpTitle: 'Two-Factor Authentication',
  mailTitle: 'Email Verification',

  // Descriptions
  totpDescription:
    'To protect your account security, please enter the 6-digit verification code from your authenticator app.',
  mailDescription:
    'To protect your account security, please enter the 8-digit verification code sent to your email.',

  // TOTP unavailable options
  totpUnavailable: "Can't access your authenticator app?",
  switchToMail: 'Use email verification',
  switchedToMail: 'Switched to email verification mode',

  // Input related
  enterTotpCode: 'Enter TOTP code',
  enterMailCode: 'Enter email code',
  codeHint: 'Please enter the {{length}}-digit verification code',

  // Buttons and actions
  verify: 'Verify',
  verifying: 'Verifying...',
  resendCode: 'Resend verification code',
  resending: 'Sending...',
  codeResent: 'Verification code has been resent',

  // Success messages
  success: 'Verification successful!',

  // Error messages
  errors: {
    emptyCode: 'Verification code cannot be empty',
    invalidLength: 'Verification code must be {{length}} digits',
    invalidCode: 'Invalid verification code, please try again',
    verificationFailed: 'Verification failed, please try again later',
    resendFailed: 'Failed to resend verification code',
    switchFailed: 'Failed to switch verification method',
    // TOTP specific errors
    totpInvalidOrExpired: 'Invalid verification code, please enter the correct code again',
    totpGenericError: 'Verification failed, please check if the verification code is correct',
  },

  // Warning messages
  warning: {
    title: 'Important Notice:',
    message:
      'This verification step is required and you cannot continue using the service until verification is complete. This is to protect your account security.',
  },

  // Security notice
  securityNotice: '🔒 For your account security, please complete verification',
} as const;
