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
    password: {
      title: 'Password Settings',
      description: 'Change your account password',
      currentPassword: 'Current Password',
      currentPasswordPlaceholder: 'Enter current password',
      newPassword: 'New Password',
      newPasswordPlaceholder: 'Enter new password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm new password',
      change: 'Change Password',
      changing: 'Changing...',
      cancel: 'Cancel',
      success: 'Password changed successfully!',
      useResetCode: 'Use reset code instead',
      resetCodeOption: 'Reset Password via Email',
      resetCodeDescription: 'If you forgot your current password, you can reset it using a code sent to your email.',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email address',
      resetCode: 'Reset Code',
      resetCodePlaceholder: 'Enter 8-digit reset code',
      sendCode: 'Send Reset Code',
      sending: 'Sending...',
      resetPassword: 'Reset Password',
      resetting: 'Resetting...',
      codeSent: 'Reset code sent to your email',
      codeExpiry: 'The code will expire in 15 minutes',
      resendCode: 'Resend code',
      resendAvailableIn: 'Resend available in {{seconds}}s',
      errors: {
        currentPasswordRequired: 'Current password is required',
        newPasswordRequired: 'New password is required',
        passwordMin: 'Password must be at least 8 characters',
        passwordStrength: 'Password must include uppercase letters, lowercase letters, and numbers',
        confirmPasswordRequired: 'Please confirm your password',
        confirmPasswordMatch: 'The passwords do not match',
        sameAsOld: 'New password must be different from current password',
        failed: 'Failed to change password. Please check your current password.',
        emailRequired: 'Email is required',
        emailInvalid: 'Please enter a valid email address',
        codeRequired: 'Reset code is required',
        codeInvalid: 'Reset code must be 8 digits',
        sendFailed: 'Failed to send reset code. Please try again.',
        resetFailed: 'Failed to reset password. Please check your code and try again.',
        invalidCode: 'Invalid or expired reset code',
      }
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
    },
    device: {
      title: 'Device Management',
      description: 'Manage your login sessions and trusted devices',
      sessions: {
        title: 'Login Sessions',
        noSessions: 'No active sessions found',
        loading: 'Loading sessions...',
        loadError: 'Failed to load sessions',
        current: 'Current Session',
        verified: 'Verified',
        unverified: 'Unverified',
        lastUsed: 'Last used: {{date}}',
        created: 'Created: {{date}}',
        verified_at: 'Verified: {{date}}',
        expires: 'Expires: {{date}}',
        location: 'Location: {{location}}',
        deviceType: 'Device type: {{type}}',
        revoke: 'Revoke Session',
        revokeTitle: 'Revoke Session',
        revokeConfirm: 'Are you sure you want to revoke this session?',
        revokeWarning: 'After revoking this session, the device will need to log in again.',
        revokeSuccess: 'Session revoked successfully',
        revokeError: 'Failed to revoke session, please try again',
        revoking: 'Revoking...',
        localhost: 'Local Connection',
        totalSessions: '{{count}} session(s) total'
      },
      trustedDevices: {
        title: 'Trusted Devices',
        noDevices: 'No trusted devices found',
        loading: 'Loading devices...',
        loadError: 'Failed to load devices',
        current: 'Current Device',
        lastUsed: 'Last used: {{date}}',
        created: 'Added: {{date}}',
        expires: 'Expires: {{date}}',
        location: 'Location: {{location}}',
        remove: 'Remove Device',
        removeTitle: 'Remove Trusted Device',
        removeConfirm: 'Are you sure you want to remove this trusted device?',
        removeWarning: 'After removing this device, you will need to verify the device again on next login.',
        removeSuccess: 'Device removed successfully',
        removeError: 'Failed to remove device, please try again',
        removing: 'Removing...',
        totalDevices: '{{count}} device(s) total',
        clientTypes: {
          web: 'Web Browser',
          mobile: 'Mobile App',
          desktop: 'Desktop App'
        }
      },
      summary: {
        title: 'Device Statistics',
        loading: 'Loading statistics...',
        loadError: 'Failed to load statistics'
      },
      deviceTypes: {
        desktop: 'Desktop',
        mobile: 'Mobile',
        tablet: 'Tablet',
        unknown: 'Unknown Device',
        app: 'Desktop App'
      },
      browsers: {
        chrome: 'Chrome',
        firefox: 'Firefox',
        safari: 'Safari',
        edge: 'Edge',
        opera: 'Opera',
        unknown: 'Unknown Browser'
      }
    },
    preferences: {
      title: 'User Preferences',
      description: 'Customize your gaming experience',
      defaultMode: {
        title: 'Default Game Mode',
        description: 'Choose your preferred default game mode',
        current: 'Current default mode',
        change: 'Change Mode',
        save: 'Save',
        saving: 'Saving...',
        success: 'Default game mode updated!',
        error: 'Failed to update default game mode, please try again',
        availableModes: 'Available modes: {{count}}',
        modes: {
          osu: 'osu!',
          osurx: 'osu! (Relax)',
          osuap: 'osu! (Auto Pilot)',
          taiko: 'osu!taiko',
          taikorx: 'osu!taiko (Relax)',
          fruits: 'osu!catch',
          fruitsrx: 'osu!catch (Relax)',
          mania: 'osu!mania'
        }
      }
    }
  },
} as const;
