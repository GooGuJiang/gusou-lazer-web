export const oauthPage = {
  oauth: {
    authorize: {
      title: 'Authorization Request',
      by: 'by <avatar /> <userLink>{{username}}</userLink>',
      byFallback: 'by {{username}}',
      scopesTitle: 'This application will be able to:',
      redirectNotice: 'After authorization, you will be redirected to',
      approve: 'Authorize',
      deny: 'Deny',
      errors: {
        invalidRequest: 'Invalid authorization request',
        appNotFound: 'Application not found',
        appNotFoundDescription: 'This OAuth application does not exist or has been deleted.',
        missingClientId: 'Missing client_id parameter.',
        invalidClientId: 'Invalid client_id parameter.',
        invalidResponseType: 'response_type must be code.',
        missingRedirectUri: 'Missing redirect_uri parameter.',
        missingScope: 'Missing scope parameter.',
        redirectUriNotAllowed:
          'redirect_uri is not in the list of allowed callback URLs for this application.',
        invalidScopes: 'The requested scopes contain unsupported items: {{scopes}}.',
        loadFailed: 'Failed to load application information. Please try again later.',
        codeFailed: 'Failed to generate the authorization code. Please try again later.',
        backHome: 'Back to Home',
      },
      scopes: {
        identify: 'Identify you and read your public profile.',
        public: 'Read public data on your behalf.',
        chat: {
          read: 'Read messages on your behalf.',
          write: 'Send messages on your behalf.',
          write_manage: 'Join and leave channels on your behalf.',
        },
        forum: {
          write: 'Create and edit forum topics and posts on your behalf.',
          write_manage: 'Manage forum topics and posts on your behalf.',
        },
        friends: {
          read: 'See who you are following.',
        },
        multiplayer: {
          write_manage: 'Create and manage multiplayer rooms on your behalf.',
        },
      },
    },
  },
} as const;
