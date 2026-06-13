import { appPages } from './app';
import { homePage } from './home';
import { rankingsPage } from './rankings';
import { settingsPage } from './settings';
import { teamsPage } from './teams';
import { messagesPage } from './messages';
import { profilePage } from './profile';
import { howToJoinPage } from './how-to-join';
import { beatmapPage } from './beatmap';
import { beatmapsetsPage } from './beatmapsets';
import { layout } from './layout';

export const pages = {
  ...appPages,
  ...homePage,
  ...rankingsPage,
  ...settingsPage,
  ...teamsPage,
  ...messagesPage,
  ...profilePage,
  ...howToJoinPage,
  ...beatmapPage,
  ...beatmapsetsPage,
  ...layout,
} as const;
