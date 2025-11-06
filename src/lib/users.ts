import 'server-only';

import type { User } from '@types/user';

import { fetchApi } from './api';

export async function getCurrentUser(ruleset?: string) {
  return fetchApi<User>(ruleset ? `/api/v2/me/${ruleset}` : '/api/v2/me/');
}

export async function getUserProfile(userIdOrName: string | number, ruleset?: string) {
  return fetchApi<User>(
    ruleset ? `/api/v2/users/${userIdOrName}/${ruleset}` : `/api/v2/users/${userIdOrName}`,
    { allowNotFound: true },
  );
}
