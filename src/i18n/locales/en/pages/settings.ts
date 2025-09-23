export const settingsPage = {
  settings: {
    title: 'Account Settings',
    description: 'Manage your account information and preferences',
    errors: {
      loadFailed: 'Unable to load settings',
      tryRefresh: 'Please try refreshing the page'
    },
    username: {
      title: 'Username Settings',
      current: 'Current Username',
      change: 'Change Username',
      placeholder: 'Enter new username',
      hint: 'After changing your username, your old username will be saved in history',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      success: 'Username changed successfully!',
      errors: {
        empty: 'Username cannot be empty',
        sameAsOld: 'New username is the same as current username',
        taken: 'Username is taken, please choose another one',
        userNotFound: 'User not found',
        failed: 'Failed to change username, please try again later'
      }
    },
    avatar: {
      title: 'Avatar Settings',
      current: 'Current Avatar',
      change: 'Change Avatar',
      hint: 'Supports PNG, JPEG, GIF formats, recommended size 256x256 pixels, max 5MB',
      success: 'Avatar changed successfully!'
    },
    cover: {
      title: 'Cover Settings',
      label: 'Profile Cover Image',
      hint: 'Recommended size: 2000x500 pixels (4:1 ratio recommended), supports PNG, JPEG, GIF formats, max 10MB'
    },
    account: {
      title: 'Account Information',
      userId: 'User ID',
      joinDate: 'Join Date',
      country: 'Country/Region',
      lastVisit: 'Last Visit'
    },
    totp: {
      title: 'Two-Factor Authentication',
      status: 'Status',
      enabled: 'Enabled',
      disabled: 'Disabled',
      enable: 'Enable',
      disable: 'Disable',
      checking: 'Checking status...',
      enabledSince: 'Enabled since: {{date}}',
      description: 'Two-factor authentication provides an extra layer of security for your account. When enabled, you\'ll need to enter a verification code from your authenticator app when logging in.',
      loadError: 'Unable to load TOTP status',
      
      // Setup process
      setupTitle: 'Set up Two-Factor Authentication',
      setupDescription: 'Two-factor authentication will add an extra layer of security to your account.',
      setupStep1: 'Install an authenticator app on your phone (such as Google Authenticator, Authy, etc.)',
      setupStep2: 'Scan the QR code below or manually enter the secret key',
      setupStep3: 'Enter the 6-digit code displayed in the app',
      startSetup: 'Start Setup',
      starting: 'Preparing...',
      
      // QR code and verification
      manualEntry: 'Manual Entry Secret Key',
      enterCode: 'Enter Verification Code',
      codeHint: 'Enter the 6-digit code from your authenticator app',
      codeExpireHint: 'TOTP codes expire every 30 seconds. Make sure to use a fresh code.',
      
      // Backup codes
      setupComplete: 'TOTP Setup Complete!',
      backupCodesDescription: 'Please save these backup codes. They can be used to log in when you can\'t access your authenticator app.',
      downloadBackupCodes: 'Download Backup Codes',
      backupCodesDownloaded: 'Backup codes downloaded',
      backupCodesWarning: 'Please store these backup codes in a safe place. Each code can only be used once.',
      finishSetup: 'Finish Setup',
      
      // Disable process
      disableTitle: 'Disable Two-Factor Authentication',
      disableWarning: 'Disabling two-factor authentication will reduce the security of your account. If you\'re sure you want to continue, please enter your current verification code.',
      enterCodeToDisable: 'Enter verification code to disable',
      disableCodeHint: 'Enter the current 6-digit code from your authenticator app',
      disableConfirm: 'Confirm Disable',
      disabling: 'Disabling...',
      
      // Success and error messages
      setupSuccess: 'TOTP two-factor authentication set up successfully!',
      disableSuccess: 'TOTP two-factor authentication disabled',
      errors: {
        createFailed: 'Failed to create TOTP secret',
        invalidCode: 'Invalid verification code',
        invalidCodeLength: 'Verification code must be 6 digits',
        verificationFailed: 'Verification failed, please try again',
        disableFailed: 'Failed to disable TOTP, please try again'
      }
    }
  },
} as const;
