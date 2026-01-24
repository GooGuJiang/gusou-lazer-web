import { common } from './common';
import { navigation } from './navigation';
import { pages } from './pages';
import { auth } from './auth';
import { verification } from './verification';
import { privacy } from './privacy';
import { countries } from './countries';
import { errors } from './errors';

export const zh = {
  translation: {
    common,
    errors,
    nav: navigation,
    ...pages,
    auth,
    verification,
    privacy,
    countries,
  },
} as const;
