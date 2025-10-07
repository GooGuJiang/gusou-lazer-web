
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './components/UI/AudioPlayer';
import { VerificationProvider } from './contexts/VerificationContext';
import { ProfileColorProvider } from './contexts/ProfileColorContext';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PasswordResetPage from './pages/PasswordResetPage';
import ProfilePage from './pages/ProfilePage';
import UserPage from './pages/UserPage';
import SettingsPage from './pages/SettingsPage';
import RankingsPage from './pages/RankingsPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import CreateTeamPage from './pages/CreateTeamPage';
import MessagesPage from './pages/MessagesPage';
import HowToJoinPage from './pages/HowToJoinPage';
import BeatmapPage from './pages/BeatmapPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import BBCodeTester from './components/BBCode/BBCodeTester';

function App() {
  const { t } = useTranslation();

  return (
    <AuthProvider>
      <ProfileColorProvider>
        <VerificationProvider>
          <AudioProvider>
            <Router>
            <ScrollToTop />
            <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="password-reset" element={<PasswordResetPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="users/:userId" element={<UserPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="rankings" element={<RankingsPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="teams/create" element={<CreateTeamPage />} />
            <Route path="teams/:teamId" element={<TeamDetailPage />} />
            <Route path="teams/:teamId/edit" element={<CreateTeamPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="how-to-join" element={<HowToJoinPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="beatmaps/:beatmapId" element={<BeatmapPage />} />
            <Route path="beatmapsets/:beatmapsetId" element={<BeatmapPage />} />
            <Route
              path="beatmaps"
              element={
                <div className="flex items-center justify-center h-screen">
                  <h1 className="text-2xl font-bold">{t('app.beatmapsComingSoon')}</h1>
                </div>
              }
            />
            <Route path="bbcode-test" element={<BBCodeTester />} />
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
            </Router>
          </AudioProvider>
        </VerificationProvider>
      </ProfileColorProvider>
    </AuthProvider>
  );
}

export default App;
