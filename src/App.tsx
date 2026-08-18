import { BrowserRouter, MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout/Layout';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
import PasswordResetPage from './views/PasswordResetPage';
import UserPage from './views/UserPage';
import SettingsPage from './views/SettingsPage';
import RankingsPage from './views/RankingsPage';
import TeamsPage from './views/TeamsPage';
import TeamDetailPage from './views/TeamDetailPage';
import CreateTeamPage from './views/CreateTeamPage';
import MessagesPage from './views/MessagesPage';
import HowToJoinPage from './views/HowToJoinPage';
import BeatmapPage from './views/BeatmapPage';
import BeatmapsetsPage from './views/BeatmapsetsPage';
import ScorePage from './views/ScorePage';
import OAuthAuthorizePage from './views/OAuthAuthorizePage';

interface AppProps {
  router?: 'browser' | 'static';
  basename?: string;
  location?: string;
}

function App({ router = 'browser', basename, location = '/' }: AppProps) {
  const { t } = useTranslation();
  const routes = (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="password-reset" element={<PasswordResetPage />} />
          <Route path="users/:userId" element={<UserPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="rankings" element={<RankingsPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="teams/create" element={<CreateTeamPage />} />
          <Route path="teams/:teamId" element={<TeamDetailPage />} />
          <Route path="teams/:teamId/edit" element={<CreateTeamPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="how-to-join" element={<HowToJoinPage />} />
          <Route path="beatmaps/:beatmapId" element={<BeatmapPage />} />
          <Route path="beatmapsets/:beatmapsetId" element={<BeatmapPage />} />
          <Route path="beatmapsets" element={<BeatmapsetsPage />} />
          <Route path="beatmaps" element={<Navigate to="/beatmapsets" replace />} />
          <Route path="scores/:scoreId" element={<ScorePage />} />
          <Route path="oauth/authorize" element={<OAuthAuthorizePage />} />
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">{t('app.notFound')}</h1>
              </div>
            }
          />
        </Route>
      </Routes>
    </>
  );

  return router === 'browser' ? (
    <BrowserRouter basename={basename}>{routes}</BrowserRouter>
  ) : (
    <MemoryRouter basename={basename} initialEntries={[location]}>
      {routes}
    </MemoryRouter>
  );
}

export default App;
